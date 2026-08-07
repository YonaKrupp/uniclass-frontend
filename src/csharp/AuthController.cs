using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using MyApi.Helpers;
using MyApi.Models;
using MyApi.Services;
using CoreWebAPI.Services;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly JwtTokenService _jwtTokenService;
        private readonly SmsService _smsService;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public AuthController(
            IConfiguration configuration,
            ILogger<AuthController> logger,
            JwtTokenService jwtTokenService)
        {
            _configuration = configuration;
            _logger = logger;
            _jwtTokenService = jwtTokenService;
            _smsService = new SmsService();
            _jwtKey = _configuration["Jwt:Key"] ?? "DefaultJwtKey_ChangeMe_InProduction_2024!";
            _jwtIssuer = _configuration["Jwt:Issuer"] ?? "MyApi";
            _jwtAudience = _configuration["Jwt:Audience"] ?? "MyApi_Users";
        }

        /// <summary>
        /// מחזיר את connection string מה-configuration
        /// </summary>
        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("DefaultConnection")
                   ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        // =============================================================
        // POST: api/Auth/StudentRegister (direct registration, no OTP)
        // Body: { email, firstName, lastName, phoneNumber, password }
        // =============================================================
        [HttpPost("StudentRegister")]
        public async Task<IActionResult> StudentRegister([FromBody] StudentRegisterRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName) ||
                    string.IsNullOrWhiteSpace(request.PhoneNumber) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new { success = false, message = "חסרים שדות חובה" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new { success = false, message = "הסיסמה חייבת להכיל לפחות 6 תווים" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Check if email already exists and is active
                var existingEmail = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(1) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );

                if (existingEmail > 0)
                {
                    return Conflict(new { success = false, message = "כתובת האימייל כבר רשומה במערכת" });
                }

                // Hash the password (SHA256 → byte[32], stored directly in varbinary(64))
                byte[] passwordHash = SecurityHelper.ComputeSha256Hash(request.Password);

                // Insert the new student (active)
                await ExecuteNonQueryAsync(
                    connection,
                    @"INSERT INTO [dbo].[t_gn01_registration_Students]
                        (gn01_Email, gn01_FirstName, gn01_LastName, gn01_PhoneNumber, gn01_Password, gn01_create_tick_sysdate, gn01_isActive)
                      VALUES
                        (@Email, @FirstName, @LastName, @Phone, @PasswordHash, GETDATE(), 1)",
                    new SqlParameter("@Email", request.Email.Trim()),
                    new SqlParameter("@FirstName", request.FirstName.Trim()),
                    new SqlParameter("@LastName", request.LastName.Trim()),
                    new SqlParameter("@Phone", request.PhoneNumber.Trim()),
                    new SqlParameter("@PasswordHash", passwordHash)
                );

                return Ok(new { success = true, message = "ההרשמה בוצעה בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] StudentRegister error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה בהרשמה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/StudentLogin
        // Body: { email, password }
        // Uses PBKDF2 password verification (matches registration HashPassword)
        // =============================================================
        [HttpPost("StudentLogin")]
        public async Task<ActionResult<StudentLoginResponse>> StudentLogin([FromBody] StudentLoginRequest request)
        {
            _logger.LogInformation($"Login attempt for email: {request.Email}");

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new StudentLoginResponse { Success = false, Message = "חובה להזין אימייל" });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new StudentLoginResponse { Success = false, Message = "חובה להזין סיסמה" });
            }

            try
            {
                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Check if student exists at all (regardless of active status)
                int existsCount = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(*) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                int isActiveCount = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(*) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                _logger.LogInformation($"[StudentLogin] email={request.Email} exists={existsCount} active={isActiveCount}");

                // First try SHA256 (current registration method)
                byte[] sha256Hash = SecurityHelper.ComputeSha256Hash(request.Password);
                _logger.LogInformation($"[StudentLogin] SHA256 hash length={sha256Hash.Length}");
                int count = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(*) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_Password] = @HashedPassword AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim()),
                    new SqlParameter("@HashedPassword", SqlDbType.VarBinary, 64) { Value = sha256Hash }
                );
                _logger.LogInformation($"[StudentLogin] SHA256 match count={count}");

                // If SHA256 didn't match, try PBKDF2 (legacy registration method)
                if (count == 0)
                {
                    var student = await ReadStudentAsync(connection, request.Email.Trim());
                    _logger.LogInformation($"[StudentLogin] PBKDF2 fallback: student found={student != null}, hash empty={student?.PasswordHash == null || student?.PasswordHash == ""}");
                    if (student != null && !string.IsNullOrEmpty(student.PasswordHash))
                    {
                        bool pbkdf2Match = VerifyPassword(request.Password, student.PasswordHash);
                        _logger.LogInformation($"[StudentLogin] PBKDF2 verify result={pbkdf2Match}, stored hash length={student.PasswordHash.Length}");
                        if (pbkdf2Match)
                        {
                            count = 1;
                        }
                    }
                }

                if (count > 0)
                {
                    _logger.LogInformation($"Login successful for: {request.Email}");

                    var tokenResponse = _jwtTokenService.CreateTokenResponse(request.Email, "Student", null);

                    return Ok(new StudentLoginResponse
                    {
                        Success = true,
                        Message = "התחברת בהצלחה",
                        Email = request.Email,
                        AccessToken = tokenResponse.AccessToken,
                        RefreshToken = tokenResponse.RefreshToken,
                        ExpiresAt = tokenResponse.ExpiresAt,
                        TokenType = tokenResponse.TokenType
                    });
                }
                else
                {
                    _logger.LogWarning($"Login failed for: {request.Email}");
                    return Unauthorized(new StudentLoginResponse { Success = false, Message = "אימייל או סיסמה שגויים" });
                }
            }
            catch (SqlException sqlEx)
            {
                _logger.LogError($"SQL Error during login: {sqlEx.Message}, Number: {sqlEx.Number}");
                return StatusCode(500, new StudentLoginResponse { Success = false, Message = "שגיאת מסד נתונים" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during login: {ex.Message}");
                return StatusCode(500, new StudentLoginResponse { Success = false, Message = "שגיאה כללית" });
            }
        }

        // =============================================================
        // POST: api/Auth/TeacherLogin
        // Body: { email, password }
        // Uses SHA256 hash comparison (matches existing teacher registration)
        // =============================================================
        [HttpPost("TeacherLogin")]
        public async Task<ActionResult<TeacherLoginResponse>> TeacherLogin([FromBody] TeacherLoginRequest request)
        {
            _logger.LogInformation($"Teacher login attempt for email: {request.Email}");

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new TeacherLoginResponse { Success = false, Message = "חובה להזין אימייל" });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new TeacherLoginResponse { Success = false, Message = "חובה להזין סיסמה" });
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(GetConnectionString()))
                {
                    byte[] hashedPassword = SecurityHelper.ComputeSha256Hash(request.Password);

                    string query = @"
                        SELECT COUNT(*)
                        FROM t_gn02_registration_teacher
                        WHERE gn02_Email = @Email
                          AND gn02_Password = @HashedPassword";

                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.Add("@Email", SqlDbType.NVarChar, 100).Value = request.Email;
                    cmd.Parameters.Add("@HashedPassword", SqlDbType.VarBinary, 32).Value = hashedPassword;

                    await conn.OpenAsync();
                    object? result = await cmd.ExecuteScalarAsync();
                    int count = Convert.ToInt32(result);

                    if (count > 0)
                    {
                        _logger.LogInformation($"Teacher login successful for: {request.Email}");

                        var tokenResponse = _jwtTokenService.CreateTokenResponse(request.Email, "Teacher", null);

                        return Ok(new TeacherLoginResponse
                        {
                            Success = true,
                            Message = "התחברת בהצלחה",
                            Email = request.Email,
                            AccessToken = tokenResponse.AccessToken,
                            RefreshToken = tokenResponse.RefreshToken,
                            ExpiresAt = tokenResponse.ExpiresAt,
                            TokenType = tokenResponse.TokenType
                        });
                    }
                    else
                    {
                        _logger.LogWarning($"Teacher login failed for: {request.Email}");
                        return Unauthorized(new TeacherLoginResponse { Success = false, Message = "אימייל או סיסמה שגויים" });
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                _logger.LogError($"SQL Error during teacher login: {sqlEx.Message}, Number: {sqlEx.Number}");
                return StatusCode(500, new TeacherLoginResponse { Success = false, Message = "שגיאת מסד נתונים" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during teacher login: {ex.Message}");
                return StatusCode(500, new TeacherLoginResponse { Success = false, Message = "שגיאה כללית" });
            }
        }

        // =============================================================
        // GET: api/Auth/TestConnection
        // =============================================================
        [HttpGet("TestConnection")]
        public async Task<ActionResult> TestConnection()
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(GetConnectionString()))
                {
                    await conn.OpenAsync();
                    return Ok(new
                    {
                        success = true,
                        message = "חיבור למסד נתונים תקין",
                        database = conn.Database,
                        server = conn.DataSource
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Connection test failed: {ex.Message}");
                return StatusCode(500, new { success = false, message = "בעיה בחיבור למסד נתונים", error = ex.Message });
            }
        }

        // =============================================================
        // POST: api/Auth/SendRegistrationOtp
        // Body: { email, firstName, lastName, phoneNumber, password }
        // Inserts student as inactive with OTP code, sends SMS.
        // No separate OTP table needed — uses gn01_EmailVerifacationCode / gn01_EmailVerifacationDate.
        // =============================================================
        [HttpPost("SendRegistrationOtp")]
        public async Task<IActionResult> SendRegistrationOtp([FromBody] StudentRegisterRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName) ||
                    string.IsNullOrWhiteSpace(request.PhoneNumber) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new { success = false, message = "חסרים שדות חובה" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new { success = false, message = "הסיסמה חייבת להכיל לפחות 6 תווים" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Check if email already registered and active
                var existingActive = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(1) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                if (existingActive > 0)
                {
                    return Conflict(new { success = false, message = "כתובת האימייל כבר רשומה במערכת" });
                }

                // Delete old unregistered records for this email
                await ExecuteNonQueryAsync(
                    connection,
                    "DELETE FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 0",
                    new SqlParameter("@Email", request.Email.Trim())
                );

                // Generate OTP and hash password (SHA256 → byte[32] for varbinary(64))
                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
                byte[] passwordHashBytes = SecurityHelper.ComputeSha256Hash(request.Password);

                // Insert student record (inactive) with OTP code, return new ID as sessionId
                var sessionId = await ExecuteScalarAsync<decimal>(
                    connection,
                    @"INSERT INTO [dbo].[t_gn01_registration_Students]
                        (gn01_Email, gn01_FirstName, gn01_LastName, gn01_Password, gn01_PhoneNumber, gn01_create_tick_sysdate, gn01_isActive, gn01_EmailVerifacationCode, gn01_EmailVerifacationDate)
                      VALUES
                        (@Email, @FirstName, @LastName, @PasswordHash, @Phone, GETUTCDATE(), 0, @OtpCode, GETUTCDATE());
                      SELECT CAST(SCOPE_IDENTITY() AS DECIMAL);",
                    new SqlParameter("@Email", request.Email.Trim()),
                    new SqlParameter("@FirstName", request.FirstName.Trim()),
                    new SqlParameter("@LastName", request.LastName.Trim()),
                    new SqlParameter("@PasswordHash", passwordHashBytes),
                    new SqlParameter("@Phone", request.PhoneNumber.Trim()),
                    new SqlParameter("@OtpCode", otpCode)
                );

                // Send OTP via SMS
                string smsMessage = $"קוד האימות שלך להרשמה הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(request.PhoneNumber.Trim(), smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] SMS send failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד האימות ב-SMS נכשלה" });
                }

                return Ok(new { success = true, sessionId = ((int)sessionId).ToString(), message = "קוד אימות נשלח ב-SMS" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] SendRegistrationOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/VerifyAndRegisterStudent
        // Body: { sessionId, otpCode }
        // Verifies OTP and activates the student account.
        // =============================================================
        [HttpPost("VerifyAndRegisterStudent")]
        public async Task<IActionResult> VerifyAndRegisterStudent([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId) ||
                    string.IsNullOrWhiteSpace(request.OtpCode))
                {
                    return BadRequest(new { success = false, message = "חסרים פרטי אימות" });
                }

                if (!int.TryParse(request.SessionId, out int sessionId))
                {
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Read OTP record directly from student table
                string storedOtp = null;
                DateTime? verificationDate = null;
                int isActive = 0;

                using (var otpCmd = new SqlCommand(
                    @"SELECT TOP 1 [gn01_EmailVerifacationCode], [gn01_EmailVerifacationDate], [gn01_isActive]
                      FROM [dbo].[t_gn01_registration_Students]
                      WHERE [gn01_seq] = @Id", connection))
                {
                    otpCmd.Parameters.AddWithValue("@Id", sessionId);
                    using var otpReader = await otpCmd.ExecuteReaderAsync();
                    if (!await otpReader.ReadAsync())
                    {
                        return NotFound(new { success = false, message = "פג תוקף הקוד, אנא התחילו את ההרשמה מחדש" });
                    }
                    storedOtp = otpReader["gn01_EmailVerifacationCode"]?.ToString();
                    verificationDate = otpReader["gn01_EmailVerifacationDate"] as DateTime?;
                    isActive = otpReader["gn01_isActive"] as int? ?? 0;
                }

                if (isActive == 1)
                {
                    return BadRequest(new { success = false, message = "חשבון זה כבר אומת" });
                }

                if (verificationDate == null || verificationDate < DateTime.UtcNow.AddMinutes(-10))
                {
                    return BadRequest(new { success = false, message = "פג תוקף הקוד, אנא התחילו את ההרשמה מחדש" });
                }

                if (storedOtp != request.OtpCode.Trim())
                {
                    return BadRequest(new { success = false, message = "קוד אימות שגוי" });
                }

                // Activate the student
                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn01_registration_Students] SET [gn01_isActive] = 1 WHERE [gn01_seq] = @Id",
                    new SqlParameter("@Id", sessionId)
                );

                return Ok(new { success = true, message = "ההרשמה בוצעה בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] VerifyAndRegisterStudent error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/ResendRegistrationOtp
        // Body: { sessionId }
        // Generates a new OTP and sends it via SMS.
        // =============================================================
        [HttpPost("ResendRegistrationOtp")]
        public async Task<IActionResult> ResendRegistrationOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId))
                {
                    return BadRequest(new { success = false, message = "חסר מזהה סשן" });
                }

                if (!int.TryParse(request.SessionId, out int sessionId))
                {
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Get phone number for the session (only if still inactive)
                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn01_PhoneNumber] FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_seq] = @Id AND [gn01_isActive] = 0",
                    new SqlParameter("@Id", sessionId)
                );
                if (string.IsNullOrEmpty(phoneNumber))
                {
                    return NotFound(new { success = false, message = "פג תוקף הקוד, אנא התחילו את ההרשמה מחדש" });
                }

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn01_registration_Students] SET [gn01_EmailVerifacationCode] = @OtpCode, [gn01_EmailVerifacationDate] = GETUTCDATE() WHERE [gn01_seq] = @Id",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Id", sessionId)
                );

                string smsMessage = $"קוד האימות החדש שלך הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(phoneNumber, smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] SMS resend failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד חדש נכשל" });
                }

                return Ok(new { success = true, message = "קוד אימות חדש נשלח" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] ResendRegistrationOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/SendTeacherRegistrationOtp
        // Body: { email, firstName, lastName, phoneNumber, password }
        // Inserts teacher as inactive with OTP code, sends SMS.
        // =============================================================
        [HttpPost("SendTeacherRegistrationOtp")]
        public async Task<IActionResult> SendTeacherRegistrationOtp([FromBody] StudentRegisterRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName) ||
                    string.IsNullOrWhiteSpace(request.PhoneNumber) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new { success = false, message = "חסרים שדות חובה" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new { success = false, message = "הסיסמה חייבת להכיל לפחות 6 תווים" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Check if email already registered and active
                var existingActive = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT COUNT(1) FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_Email] = @Email AND [gn02_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                if (existingActive > 0)
                {
                    return Conflict(new { success = false, message = "כתובת האימייל כבר רשומה במערכת" });
                }

                // Delete old unregistered records for this email
                await ExecuteNonQueryAsync(
                    connection,
                    "DELETE FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_Email] = @Email AND (gn02_isActive = 0 OR gn02_isActive IS NULL)",
                    new SqlParameter("@Email", request.Email.Trim())
                );

                // Generate OTP and hash password (SHA256 → byte[32] for varbinary(64))
                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
                byte[] passwordHashBytes = SecurityHelper.ComputeSha256Hash(request.Password);

                // Insert teacher record (inactive) with OTP code, return new ID as sessionId
                var sessionId = await ExecuteScalarAsync<decimal>(
                    connection,
                    @"INSERT INTO [dbo].[t_gn02_registration_teacher]
                        (gn02_Email, gn02_FirstName, gn02_LastName, gn02_Password, gn02_PhoneNumber,
                         gn02_TeacheingMethod_Online, gn02_TeacheingMethod_Frontal_teacherHome, gn02_TeacheingMethod_Frontal_StudentHome,
                         gn02_RegisterSteps_1first_2End, gn02_create_tick_sysdate, gn02_isActive,
                         gn02_EmailVerifacationCode, gn02_EmailVerifacationDate)
                      VALUES
                        (@Email, @FirstName, @LastName, @PasswordHash, @Phone,
                         0, 0, 0, 1, GETUTCDATE(), 0,
                         @OtpCode, GETUTCDATE());
                      SELECT CAST(SCOPE_IDENTITY() AS DECIMAL);",
                    new SqlParameter("@Email", request.Email.Trim()),
                    new SqlParameter("@FirstName", request.FirstName.Trim()),
                    new SqlParameter("@LastName", request.LastName.Trim()),
                    new SqlParameter("@PasswordHash", passwordHashBytes),
                    new SqlParameter("@Phone", request.PhoneNumber.Trim()),
                    new SqlParameter("@OtpCode", otpCode)
                );

                // Send OTP via SMS
                string smsMessage = $"קוד האימות שלך להרשמה הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(request.PhoneNumber.Trim(), smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Teacher SMS send failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד האימות ב-SMS נכשלה" });
                }

                return Ok(new { success = true, sessionId = ((int)sessionId).ToString(), message = "קוד אימות נשלח ב-SMS" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] SendTeacherRegistrationOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/VerifyAndRegisterTeacher
        // Body: { sessionId, otpCode }
        // Verifies OTP and activates the teacher account.
        // =============================================================
        [HttpPost("VerifyAndRegisterTeacher")]
        public async Task<IActionResult> VerifyAndRegisterTeacher([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId) ||
                    string.IsNullOrWhiteSpace(request.OtpCode))
                {
                    return BadRequest(new { success = false, message = "חסרים פרטי אימות" });
                }

                if (!int.TryParse(request.SessionId, out int sessionId))
                {
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Read OTP record directly from teacher table
                string storedOtp = null;
                DateTime? verificationDate = null;
                int? isActive = null;

                using (var otpCmd = new SqlCommand(
                    @"SELECT TOP 1 [gn02_EmailVerifacationCode], [gn02_EmailVerifacationDate], [gn02_isActive]
                      FROM [dbo].[t_gn02_registration_teacher]
                      WHERE [gn02_seq] = @Id", connection))
                {
                    otpCmd.Parameters.AddWithValue("@Id", sessionId);
                    using var otpReader = await otpCmd.ExecuteReaderAsync();
                    if (!await otpReader.ReadAsync())
                    {
                        return NotFound(new { success = false, message = "פג תוקף הקוד, אנא התחילו את ההרשמה מחדש" });
                    }
                    storedOtp = otpReader["gn02_EmailVerifacationCode"]?.ToString();
                    verificationDate = otpReader["gn02_EmailVerifacationDate"] as DateTime?;
                    isActive = otpReader["gn02_isActive"] as int?;
                }

                if (isActive == 1)
                {
                    return BadRequest(new { success = false, message = "חשבון זה כבר אומת" });
                }

                if (verificationDate == null || verificationDate < DateTime.UtcNow.AddMinutes(-10))
                {
                    return BadRequest(new { success = false, message = "פג תוקף הקוד, אנא התחיאו את ההרשמה מחדש" });
                }

                if (storedOtp != request.OtpCode.Trim())
                {
                    return BadRequest(new { success = false, message = "קוד אימות שגוי" });
                }

                // Activate the teacher
                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn02_registration_teacher] SET [gn02_isActive] = 1 WHERE [gn02_seq] = @Id",
                    new SqlParameter("@Id", sessionId)
                );

                return Ok(new { success = true, message = "ההרשמה בוצעה בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] VerifyAndRegisterTeacher error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/ResendTeacherRegistrationOtp
        // Body: { sessionId }
        // Generates a new OTP and sends it via SMS.
        // =============================================================
        [HttpPost("ResendTeacherRegistrationOtp")]
        public async Task<IActionResult> ResendTeacherRegistrationOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId))
                {
                    return BadRequest(new { success = false, message = "חסר מזהה סשן" });
                }

                if (!int.TryParse(request.SessionId, out int sessionId))
                {
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Get phone number for the session (only if still inactive)
                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn02_PhoneNumber] FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_seq] = @Id AND (gn02_isActive = 0 OR gn02_isActive IS NULL)",
                    new SqlParameter("@Id", sessionId)
                );
                if (string.IsNullOrEmpty(phoneNumber))
                {
                    return NotFound(new { success = false, message = "פג תוקף הקוד, אנא התחילו את ההרשמה מחדש" });
                }

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn02_registration_teacher] SET [gn02_EmailVerifacationCode] = @OtpCode, [gn02_EmailVerifacationDate] = GETUTCDATE() WHERE [gn02_seq] = @Id",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Id", sessionId)
                );

                string smsMessage = $"קוד האימות החדש שלך הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(phoneNumber, smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Teacher SMS resend failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד חדש נכשל" });
                }

                return Ok(new { success = true, message = "קוד אימות חדש נשלח" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] ResendTeacherRegistrationOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/SendPasswordResetOtp
        // Body: { email }
        // Generates OTP, saves to student record, sends SMS.
        // =============================================================
        [HttpPost("SendPasswordResetOtp")]
        public async Task<IActionResult> SendPasswordResetOtp([FromBody] PasswordResetRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { success = false, message = "חסר אימייל" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                // Find active student and get phone number
                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn01_PhoneNumber] FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                if (string.IsNullOrEmpty(phoneNumber))
                    return NotFound(new { success = false, message = "לא נמצא חשבון עם אימייל זה" });

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                // Store OTP in student record (reuse verification fields)
                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn01_registration_Students] SET [gn01_EmailVerifacationCode] = @OtpCode, [gn01_EmailVerifacationDate] = GETUTCDATE() WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Email", request.Email.Trim())
                );

                // Get the session ID (seq) to return
                int sessionId = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT TOP 1 [gn01_seq] FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );

                string smsMessage = $"קוד האימות לאיפוס הסיסמה שלך הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(phoneNumber, smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Password reset SMS failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד האימות ב-SMS נכשלה" });
                }

                return Ok(new { success = true, sessionId = sessionId.ToString(), message = "קוד אימות נשלח ב-SMS" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] SendPasswordResetOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/VerifyAndResetPassword
        // Body: { sessionId, otpCode, newPassword }
        // Verifies OTP and updates student password.
        // =============================================================
        [HttpPost("VerifyAndResetPassword")]
        public async Task<IActionResult> VerifyAndResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId) ||
                    string.IsNullOrWhiteSpace(request.OtpCode) ||
                    string.IsNullOrWhiteSpace(request.NewPassword))
                    return BadRequest(new { success = false, message = "חסרים פרטי אימות" });

                if (!int.TryParse(request.SessionId, out int sessionId))
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });

                if (request.NewPassword.Length < 6)
                    return BadRequest(new { success = false, message = "הסיסמה חייבת להכיל לפחות 6 תווים" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                string storedOtp = null;
                DateTime? verificationDate = null;

                using (var cmd = new SqlCommand(
                    "SELECT TOP 1 [gn01_EmailVerifacationCode], [gn01_EmailVerifacationDate] FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_seq] = @Id AND [gn01_isActive] = 1",
                    connection))
                {
                    cmd.Parameters.AddWithValue("@Id", sessionId);
                    using var reader = await cmd.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                        return NotFound(new { success = false, message = "לא נמצא חשבון" });
                    storedOtp = reader["gn01_EmailVerifacationCode"]?.ToString();
                    verificationDate = reader["gn01_EmailVerifacationDate"] as DateTime?;
                }

                if (verificationDate == null || verificationDate < DateTime.UtcNow.AddMinutes(-10))
                    return BadRequest(new { success = false, message = "פג תוקף הקוד, אנא שלחו קוד חדש" });

                if (storedOtp != request.OtpCode.Trim())
                    return BadRequest(new { success = false, message = "קוד אימות שגוי" });

                // Update password and clear OTP
                byte[] newPasswordHash = SecurityHelper.ComputeSha256Hash(request.NewPassword);
                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn01_registration_Students] SET [gn01_Password] = @PasswordHash, [gn01_EmailVerifacationCode] = NULL WHERE [gn01_seq] = @Id",
                    new SqlParameter("@PasswordHash", newPasswordHash),
                    new SqlParameter("@Id", sessionId)
                );

                return Ok(new { success = true, message = "הסיסמה עודכנה בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] VerifyAndResetPassword error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/ResendPasswordResetOtp
        // Body: { sessionId }
        // Generates a new OTP and resends via SMS.
        // =============================================================
        [HttpPost("ResendPasswordResetOtp")]
        public async Task<IActionResult> ResendPasswordResetOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId))
                    return BadRequest(new { success = false, message = "חסר מזהה סשן" });

                if (!int.TryParse(request.SessionId, out int sessionId))
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn01_PhoneNumber] FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_seq] = @Id AND [gn01_isActive] = 1",
                    new SqlParameter("@Id", sessionId)
                );
                if (string.IsNullOrEmpty(phoneNumber))
                    return NotFound(new { success = false, message = "לא נמצא חשבון" });

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn01_registration_Students] SET [gn01_EmailVerifacationCode] = @OtpCode, [gn01_EmailVerifacationDate] = GETUTCDATE() WHERE [gn01_seq] = @Id",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Id", sessionId)
                );

                string smsMessage = $"קוד האימות החדש לאיפוס הסיסמה שלך הוא: {otpCode}";
                try
                {
                    await SendSmsInternal(phoneNumber, smsMessage);
                }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Password reset SMS resend failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד חדש נכשל" });
                }

                return Ok(new { success = true, message = "קוד אימות חדש נשלח" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] ResendPasswordResetOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/SendTeacherPasswordResetOtp
        // Body: { email }
        // =============================================================
        [HttpPost("SendTeacherPasswordResetOtp")]
        public async Task<IActionResult> SendTeacherPasswordResetOtp([FromBody] PasswordResetRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { success = false, message = "חסר אימייל" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn02_PhoneNumber] FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_Email] = @Email AND [gn02_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );
                if (string.IsNullOrEmpty(phoneNumber))
                    return NotFound(new { success = false, message = "לא נמצא חשבון עם אימייל זה" });

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn02_registration_teacher] SET [gn02_EmailVerifacationCode] = @OtpCode, [gn02_EmailVerifacationDate] = GETUTCDATE() WHERE [gn02_Email] = @Email AND [gn02_isActive] = 1",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Email", request.Email.Trim())
                );

                int sessionId = await ExecuteScalarAsync<int>(
                    connection,
                    "SELECT TOP 1 [gn02_seq] FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_Email] = @Email AND [gn02_isActive] = 1",
                    new SqlParameter("@Email", request.Email.Trim())
                );

                string smsMessage = $"קוד האימות לאיפוס הסיסמה שלך הוא: {otpCode}";
                try { await SendSmsInternal(phoneNumber, smsMessage); }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Teacher password reset SMS failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד האימות ב-SMS נכשלה" });
                }

                return Ok(new { success = true, sessionId = sessionId.ToString(), message = "קוד אימות נשלח ב-SMS" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] SendTeacherPasswordResetOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/VerifyAndResetTeacherPassword
        // Body: { sessionId, otpCode, newPassword }
        // =============================================================
        [HttpPost("VerifyAndResetTeacherPassword")]
        public async Task<IActionResult> VerifyAndResetTeacherPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId) ||
                    string.IsNullOrWhiteSpace(request.OtpCode) ||
                    string.IsNullOrWhiteSpace(request.NewPassword))
                    return BadRequest(new { success = false, message = "חסרים פרטי אימות" });

                if (!int.TryParse(request.SessionId, out int sessionId))
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });

                if (request.NewPassword.Length < 6)
                    return BadRequest(new { success = false, message = "הסיסמה חייבת להכיל לפחות 6 תווים" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                string storedOtp = null;
                DateTime? verificationDate = null;

                using (var cmd = new SqlCommand(
                    "SELECT TOP 1 [gn02_EmailVerifacationCode], [gn02_EmailVerifacationDate] FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_seq] = @Id AND [gn02_isActive] = 1",
                    connection))
                {
                    cmd.Parameters.AddWithValue("@Id", sessionId);
                    using var reader = await cmd.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                        return NotFound(new { success = false, message = "לא נמצא חשבון" });
                    storedOtp = reader["gn02_EmailVerifacationCode"]?.ToString();
                    verificationDate = reader["gn02_EmailVerifacationDate"] as DateTime?;
                }

                if (verificationDate == null || verificationDate < DateTime.UtcNow.AddMinutes(-10))
                    return BadRequest(new { success = false, message = "פג תוקף הקוד, אנא שלחו קוד חדש" });

                if (storedOtp != request.OtpCode.Trim())
                    return BadRequest(new { success = false, message = "קוד אימות שגוי" });

                byte[] newPasswordHash = SecurityHelper.ComputeSha256Hash(request.NewPassword);
                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn02_registration_teacher] SET [gn02_Password] = @PasswordHash, [gn02_EmailVerifacationCode] = NULL WHERE [gn02_seq] = @Id",
                    new SqlParameter("@PasswordHash", newPasswordHash),
                    new SqlParameter("@Id", sessionId)
                );

                return Ok(new { success = true, message = "הסיסמה עודכנה בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] VerifyAndResetTeacherPassword error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/ResendTeacherPasswordResetOtp
        // Body: { sessionId }
        // =============================================================
        [HttpPost("ResendTeacherPasswordResetOtp")]
        public async Task<IActionResult> ResendTeacherPasswordResetOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.SessionId))
                    return BadRequest(new { success = false, message = "חסר מזהה סשן" });

                if (!int.TryParse(request.SessionId, out int sessionId))
                    return BadRequest(new { success = false, message = "מזהה סשן לא תקין" });

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                string phoneNumber = await ExecuteScalarAsync<string>(
                    connection,
                    "SELECT TOP 1 [gn02_PhoneNumber] FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_seq] = @Id AND [gn02_isActive] = 1",
                    new SqlParameter("@Id", sessionId)
                );
                if (string.IsNullOrEmpty(phoneNumber))
                    return NotFound(new { success = false, message = "לא נמצא חשבון" });

                string otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

                await ExecuteNonQueryAsync(
                    connection,
                    "UPDATE [dbo].[t_gn02_registration_teacher] SET [gn02_EmailVerifacationCode] = @OtpCode, [gn02_EmailVerifacationDate] = GETUTCDATE() WHERE [gn02_seq] = @Id",
                    new SqlParameter("@OtpCode", otpCode),
                    new SqlParameter("@Id", sessionId)
                );

                string smsMessage = $"קוד האימות החדש לאיפוס הסיסמה שלך הוא: {otpCode}";
                try { await SendSmsInternal(phoneNumber, smsMessage); }
                catch (Exception smsEx)
                {
                    _logger.LogError($"[AuthController] Teacher password reset SMS resend failed: {smsEx.Message}");
                    return StatusCode(500, new { success = false, message = "שליחת קוד חדש נכשל" });
                }

                return Ok(new { success = true, message = "קוד אימות חדש נשלח" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] ResendTeacherPasswordResetOtp error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/RefreshToken
        // Body: { refreshToken }
        // Validates the refresh token and returns a new access + refresh token pair.
        // =============================================================
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
                    return BadRequest(new { success = false, message = "חסר refresh token" });

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtAudience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };

                ClaimsPrincipal principal;
                try
                {
                    principal = tokenHandler.ValidateToken(request.RefreshToken, validationParameters, out _);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"[RefreshToken] Invalid refresh token: {ex.Message}");
                    return Unauthorized(new { success = false, message = "Refresh token לא תקין או פג תוקף" });
                }

                // Extract email and role from the refresh token claims
                var email = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
                            ?? principal.FindFirst(ClaimTypes.Email)?.Value;
                var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? "Student";

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("[RefreshToken] No email claim in refresh token");
                    return Unauthorized(new { success = false, message = "Refresh token לא תקין" });
                }

                // Issue a fresh token pair
                var tokenResponse = _jwtTokenService.CreateTokenResponse(email, role, null);

                return Ok(new
                {
                    success = true,
                    accessToken = tokenResponse.AccessToken,
                    refreshToken = tokenResponse.RefreshToken,
                    expiresAt = tokenResponse.ExpiresAt,
                    tokenType = tokenResponse.TokenType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] RefreshToken error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // POST: api/Auth/GoogleLogin
        // Body: { email, userType }
        // Authenticates a user by email only (Google OAuth already verified identity).
        // Returns JWT token if the user exists and is active.
        // =============================================================
        [HttpPost("GoogleLogin")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { success = false, message = "חובה להזין אימייל" });

                var userType = (request.UserType ?? "student").Trim().ToLowerInvariant();
                var email = request.Email.Trim();

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                if (userType == "teacher")
                {
                    int count = await ExecuteScalarAsync<int>(
                        connection,
                        "SELECT COUNT(*) FROM [dbo].[t_gn02_registration_teacher] WHERE [gn02_Email] = @Email AND [gn02_isActive] = 1",
                        new SqlParameter("@Email", email)
                    );

                    if (count > 0)
                    {
                        var tokenResponse = _jwtTokenService.CreateTokenResponse(email, "Teacher", null);
                        return Ok(new
                        {
                            success = true,
                            message = "התחברת בהצלחה",
                            email = email,
                            accessToken = tokenResponse.AccessToken,
                            refreshToken = tokenResponse.RefreshToken,
                            expiresAt = tokenResponse.ExpiresAt,
                            tokenType = tokenResponse.TokenType
                        });
                    }
                    return NotFound(new { success = false, message = "משתמש לא נמצא. נא להירשם תחילה." });
                }
                else
                {
                    int count = await ExecuteScalarAsync<int>(
                        connection,
                        "SELECT COUNT(*) FROM [dbo].[t_gn01_registration_Students] WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1",
                        new SqlParameter("@Email", email)
                    );

                    if (count > 0)
                    {
                        var tokenResponse = _jwtTokenService.CreateTokenResponse(email, "Student", null);
                        return Ok(new
                        {
                            success = true,
                            message = "התחברת בהצלחה",
                            email = email,
                            accessToken = tokenResponse.AccessToken,
                            refreshToken = tokenResponse.RefreshToken,
                            expiresAt = tokenResponse.ExpiresAt,
                            tokenType = tokenResponse.TokenType
                        });
                    }
                    return NotFound(new { success = false, message = "משתמש לא נמצא. נא להירשם תחילה." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] GoogleLogin error: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }

        // =============================================================
        // Helper: Password hashing (PBKDF2 with random salt)
        // Returns base64 string of salt(16) + hash(32) = 48 bytes
        // =============================================================
        private string HashPassword(string password)
        {
            byte[] salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            byte[] hash = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256).GetBytes(32);

            byte[] combined = new byte[salt.Length + hash.Length];
            Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
            Buffer.BlockCopy(hash, 0, combined, salt.Length, hash.Length);

            return Convert.ToBase64String(combined);
        }

        // =============================================================
        // Helper: Password verification (PBKDF2)
        // storedHash is base64 string converted from varbinary column
        // =============================================================
        private bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrEmpty(storedHash))
                return false;

            try
            {
                byte[] combined = Convert.FromBase64String(storedHash);
                if (combined.Length < 17)
                    return false;

                byte[] salt = new byte[16];
                byte[] hash = new byte[combined.Length - 16];
                Buffer.BlockCopy(combined, 0, salt, 0, 16);
                Buffer.BlockCopy(combined, 16, hash, 0, hash.Length);

                byte[] testHash = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256).GetBytes(hash.Length);

                return ConstantTimeEquals(hash, testHash);
            }
            catch
            {
                return false;
            }
        }

        private static bool ConstantTimeEquals(byte[] a, byte[] b)
        {
            if (a.Length != b.Length) return false;
            int diff = 0;
            for (int i = 0; i < a.Length; i++)
                diff |= a[i] ^ b[i];
            return diff == 0;
        }

        // =============================================================
        // Helper: JWT Token generation (legacy, kept for compatibility)
        // =============================================================
        private string GenerateJwtToken(string userId, string email, string role, string userType)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("userType", userType),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // =============================================================
        // Helper: Database read for Student
        // Reads gn01_Password from varbinary(64) → base64 string for VerifyPassword
        // Reads gn01_isActive from int → bool
        // =============================================================
        private async Task<StudentRecord> ReadStudentAsync(SqlConnection connection, string email)
        {
            string sql = @"SELECT TOP 1
                            [gn01_seq], [gn01_Email], [gn01_FirstName], [gn01_LastName],
                            [gn01_Password], [gn01_isActive]
                          FROM [dbo].[t_gn01_registration_Students]
                          WHERE [gn01_Email] = @Email AND [gn01_isActive] = 1";

            using var cmd = new SqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("@Email", email);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return new StudentRecord
            {
                Id = reader["gn01_seq"] as int? ?? 0,
                Email = reader["gn01_Email"]?.ToString(),
                FirstName = reader["gn01_FirstName"]?.ToString(),
                LastName = reader["gn01_LastName"]?.ToString(),
                PasswordHash = reader["gn01_Password"] is byte[] pwBytes ? Convert.ToBase64String(pwBytes) : reader["gn01_Password"]?.ToString(),
                IsActive = (reader["gn01_isActive"] as int? ?? 0) == 1
            };
        }

        // =============================================================
        // Helper: Database read for Teacher (kept for compatibility)
        // =============================================================
        private async Task<TeacherRecord> ReadTeacherAsync(SqlConnection connection, string email)
        {
            string sql = @"SELECT TOP 1
                            [gn02_seq], [gn02_Email], [gn02_FirstName], [gn02_LastName],
                            [gn02_Password], [gn02_isActive]
                          FROM [dbo].[t_gn02_registration_teacher]
                          WHERE [gn02_Email] = @Email";

            using var cmd = new SqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("@Email", email);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return new TeacherRecord
            {
                Id = reader["gn02_seq"] as int? ?? 0,
                Email = reader["gn02_Email"]?.ToString(),
                FirstName = reader["gn02_FirstName"]?.ToString(),
                LastName = reader["gn02_LastName"]?.ToString(),
                PasswordHash = reader["gn02_Password"] is byte[] pwBytes ? Convert.ToBase64String(pwBytes) : reader["gn02_Password"]?.ToString(),
                IsActive = (reader["gn02_isActive"] as int? ?? 0) == 1
            };
        }

        // =============================================================
        // Helper: Send SMS internally (calls SmsService directly)
        // =============================================================
        private async Task SendSmsInternal(string phone, string message)
        {
            try
            {
                string result = _smsService.SendMessage(message, phone, "SprintIt");
                _logger.LogInformation($"[AuthController] SMS send result: {result}");

                if (string.IsNullOrEmpty(result) || result.StartsWith("Error:"))
                {
                    throw new Exception($"SMS sending failed: {result}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[AuthController] SMS send error: {ex.Message}");
                throw;
            }
        }

        // =============================================================
        // Helper: ExecuteNonQuery wrapper
        // =============================================================
        private async Task ExecuteNonQueryAsync(SqlConnection connection, string sql, params SqlParameter[] parameters)
        {
            using var cmd = new SqlCommand(sql, connection);
            if (parameters != null)
            {
                cmd.Parameters.AddRange(parameters);
            }
            await cmd.ExecuteNonQueryAsync();
        }

        // =============================================================
        // Helper: ExecuteScalar wrapper
        // =============================================================
        private async Task<T> ExecuteScalarAsync<T>(SqlConnection connection, string sql, params SqlParameter[] parameters)
        {
            using var cmd = new SqlCommand(sql, connection);
            if (parameters != null)
            {
                cmd.Parameters.AddRange(parameters);
            }
            var result = await cmd.ExecuteScalarAsync();
            if (result == null || result == DBNull.Value)
                return default(T);
            return (T)Convert.ChangeType(result, typeof(T));
        }
    }

    // =============================================================
    // DTOs
    // =============================================================
    public class StudentRegisterRequest
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class StudentRecord
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PasswordHash { get; set; }
        public bool? IsActive { get; set; }
    }

    public class TeacherRecord
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PasswordHash { get; set; }
        public bool? IsActive { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string SessionId { get; set; }
        public string OtpCode { get; set; }
    }

    public class PasswordResetRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string SessionId { get; set; }
        public string OtpCode { get; set; }
        public string NewPassword { get; set; }
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; }
    }

    public class GoogleLoginRequest
    {
        public string Email { get; set; }
        public string UserType { get; set; }
    }
}

// ============================================================= (AuthController partial - Teacher Password Reset)
// Add these methods inside the AuthController class:
//
// POST: api/Auth/SendTeacherPasswordResetOtp  — Body: { email }
// POST: api/Auth/VerifyAndResetTeacherPassword — Body: { sessionId, otpCode, newPassword }
// POST: api/Auth/ResendTeacherPasswordResetOtp — Body: { sessionId }
// =============================================================