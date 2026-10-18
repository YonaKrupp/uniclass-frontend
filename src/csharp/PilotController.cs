using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json.Serialization;

namespace MyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PilotController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PilotController> _logger;
        private readonly IEmailService _emailService;

        public PilotController(IConfiguration configuration, ILogger<PilotController> logger, IEmailService emailService)
        {
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
        }

        // =============================================================
        // POST: api/Pilot/insert_pilot
        // Body: { fullName, email, phone, educationalInstitution, academicDegree,
        //         gn32_Notes, gn32_read_and_agree, gn32_accept_mail_sms }
        //
        // Calls the stored procedure p_insert_pailot with 8 parameters.
        // The procedure signature MUST declare all 8, otherwise SQL Server
        // returns "too many arguments specified" (error 8144).
        // =============================================================
        [HttpPost("insert_pilot")]
        public async Task<IActionResult> InsertPilot([FromBody] InsertPilotRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.FullName))
                {
                    return BadRequest(new { message = "Full name is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Phone))
                {
                    return BadRequest(new { message = "Phone is required" });
                }

                _logger.LogInformation($"InsertPilot called with Email={request.Email}, Name={request.FullName}");
                // אבחון — האם שני הערכים של הצ'קבוקסים נקלטו מה-JSON.
                // אם זה NULL בלוג — ה-binding נכשל; אם זה 1/0 והעמודה NULL — הבעיה בפרוצדורה.
                _logger.LogInformation($"InsertPilot consent flags received: read_and_agree={InsertPilotRequest.ToFlag(request.gn32_read_and_agree)}, accept_mail_sms={InsertPilotRequest.ToFlag(request.gn32_accept_mail_sms)}");

                string connectionString = _configuration.GetConnectionString("DefaultConnection");

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();

                    using (SqlCommand cmd = new SqlCommand("p_insert_pailot", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@gn32_full_name", (object)request.FullName ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@gn32_email", (object)request.Email ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@gn32_phone", (object)request.Phone ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@gn32_Educational_institution", (object)request.EducationalInstitution ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@gn32_Academic_degree", (object)request.AcademicDegree ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@gn32_Notes", (object)request.Gn32_Notes ?? DBNull.Value);

                        // 1 = agreed, 0 = not agreed.
                        // Always send an int — never DBNull — because the procedure
                        // parameter is a plain int and the table column is not nullable.
                        cmd.Parameters.AddWithValue("@gn32_read_and_agree", InsertPilotRequest.ToFlag(request.gn32_read_and_agree));
                        cmd.Parameters.AddWithValue("@gn32_accept_mail_sms", InsertPilotRequest.ToFlag(request.gn32_accept_mail_sms));

                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                // שליחת מייל ברוכים הבאים — הרישום כבר נשמר, ולכן כשלון בשליחת המייל
                // לא אמור להפוך רישום מוצלח להודעת שגיאה מול המשתמש.
                try
                {
                    await _emailService.SendWelcomeEmailAsync(request.Email, request.FullName);
                }
                catch (Exception mailEx)
                {
                    _logger.LogError($"InsertPilot: welcome email failed for Email={request.Email}: {mailEx.Message}");
                }

                _logger.LogInformation($"Pilot registration successful for Email={request.Email}");

                return Ok(new
                {
                    success = true,
                    // אבחון — מזהה הגרסה שענתה לבקשה.
                    // אם השדה הזה לא מופיע בתשובה שהאפליקציה מקבלת,
                    // השרת מריץ build ישן ולא את הקוד הזה.
                    build = "2026-10-18-consent-flexible",
                    message = "פרטי הפיילוט נשמרו בהצלחה"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in InsertPilot: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "שגיאה בשמירת הפרטים",
                    error = ex.Message
                });
            }
        }
    }

    // =============================================================
    // DTOs
    // =============================================================
    public class InsertPilotRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string EducationalInstitution { get; set; }
        public string AcademicDegree { get; set; }

        // The proxy sends "gn32_Notes" — binds case-insensitively.
        public string Gn32_Notes { get; set; }

        // The proxy sends "gn32_read_and_agree" / "gn32_accept_mail_sms".
        // The property names match the incoming JSON keys EXACTLY, so binding works
        // under System.Text.Json AND Newtonsoft. A [JsonPropertyName] attribute alone
        // is silently ignored when the project is configured with AddNewtonsoftJson().
        //
        // Kept as object so BOTH shapes bind: 1/0 (current frontend) and true/false
        // (an older build of the frontend still cached in a browser). A boolean that
        // could not bind left the property at 0 — which is how a checked consent was
        // saved as 0.
        [JsonPropertyName("gn32_read_and_agree")]
        public object gn32_read_and_agree { get; set; }

        [JsonPropertyName("gn32_accept_mail_sms")]
        public object gn32_accept_mail_sms { get; set; }

        // 1 = agreed, 0 = not agreed — whatever shape the value arrived in.
        public static int ToFlag(object value)
        {
            if (value == null) return 0;
            if (value is bool b) return b ? 1 : 0;
            if (value is string s) return (s == "1" || s.Equals("true", StringComparison.OrdinalIgnoreCase)) ? 1 : 0;
            if (value is System.Text.Json.JsonElement je)
            {
                switch (je.ValueKind)
                {
                    case System.Text.Json.JsonValueKind.True: return 1;
                    case System.Text.Json.JsonValueKind.False: return 0;
                    case System.Text.Json.JsonValueKind.Number: return je.GetDouble() != 0 ? 1 : 0;
                    case System.Text.Json.JsonValueKind.String:
                        var str = je.GetString();
                        return (str == "1" || (str != null && str.Equals("true", StringComparison.OrdinalIgnoreCase))) ? 1 : 0;
                    default: return 0;
                }
            }
            try { return Convert.ToInt32(value) != 0 ? 1 : 0; } catch { return 0; }
        }
    }
}