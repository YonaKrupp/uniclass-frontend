using CoreWebAPI.Models;
using CoreWebAPI.Models.TeacherProfile;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace CoreWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HypPaymentController : ControllerBase
    {
        static HypPaymentController()
        {
            Console.WriteLine("[HypPaymentController] Controller initialized");
        }
        private static readonly HttpClient _httpClient = new HttpClient();
        private readonly HypSettings _hypSettings;
        private readonly IConfiguration _configuration;

        // HYP credentials - loaded from appsettings.json
        private readonly string _apiKey;
        private readonly string _apiPassword;
        private readonly string _terminalNumber;
        private readonly string _successUrl;
        private readonly string _errorUrl;
        // הדומיין שרשום אצל HYP - חייב להיות תואם למה שהוגדר בפאנל של HYP
        private readonly string _hypReferer;

        public HypPaymentController(IOptions<HypSettings> hypSettings, IConfiguration configuration)
        {
            _hypSettings = hypSettings.Value;
            _configuration = configuration;
            _apiKey = _hypSettings.ApiKey;
            _apiPassword = _hypSettings.PassP;
            _terminalNumber = _hypSettings.Masof;
            _successUrl = _hypSettings.SuccessUrl;
            _errorUrl = _hypSettings.ErrorUrl;
            _hypReferer = _hypSettings.Referer ?? "https://YOUR-PUBLISHED-APP-URL.com";
        }

        [HttpPost("CreatePayment")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequest request)
        {
            // Get student details at the beginning
            StudentDetailDto? studentDetails = null;
            if (!string.IsNullOrEmpty(request.StudentEmail))
            {
                try
                {
                    using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                    await connection.OpenAsync();
                    studentDetails = await GetStudentDetails(connection, request.StudentEmail);
                }
                catch (Exception ex)
                {
                    // Log the error but continue with payment creation
                    Console.WriteLine($"Error fetching student details: {ex.Message}");
                }
            }

            int newOrderId;
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string sql = "INSERT INTO t_gn25_Hyp_Orders (gn25_CustomerName,gn25_CustomerEmail, gn25_Amount, gn25_Status) OUTPUT INSERTED.gn25_OrderId VALUES (@name,@studentEmail, @amount, 'Pending')";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@name", studentDetails?.StudentFullName ?? "");
                cmd.Parameters.AddWithValue("@studentEmail", request.StudentEmail);
                cmd.Parameters.AddWithValue("@amount", request.Amount);
                conn.Open();

                newOrderId = (int)cmd.ExecuteScalar();
            }

            string orderId = newOrderId.ToString();

            var queryParams = new List<(string Key, string Value)>
            {
                ("action", "APISign"),
                ("What", "SIGN"),
                ("Sign", "True"),
                ("KEY", _apiKey),
                ("PassP", _apiPassword),
                ("Masof", _terminalNumber),
                ("Amount", request.Amount.ToString("0.00")),
                ("Order", orderId),
                ("PageLang", "HEB"),
                ("Coin", "1"), // 1 = ILS
                ("Tash", "1"),
                ("pageTimeOut", "True"),
                ("Pritim", "True"),
                ("SendHesh", "True"),
                ("blockItemValidation", "True"),
                ("EZ.lang", "he"),
                ("ClientName", studentDetails?.Gn01_FirstName ?? ""),
                ("ClientLName", studentDetails?.Gn01_LastName ?? ""),
                ("cell", studentDetails?.Gn01_PhoneNumber ?? ""),
                ("tmp", "3"),
                ("PostAction", "False"),
                ("Moref", "True"),
                ("sendemail", "True"),
                ("Info", request.Description ?? ""),
                ("successUrl", _successUrl),
                ("ErrorURL", _errorUrl),
                ("heshDesc", request.HeshDesc ?? "")
            };
            //                ("J5", "True"),
            queryParams.Add(("UTF8", "True"));
            queryParams.Add(("UTF8out", "True"));

            if (!string.IsNullOrEmpty(request.StudentEmail))
                queryParams.Add(("email", request.StudentEmail));
            if (request.StudentEmail != "kruppyona@gmail.com")
                queryParams.Add(("EZ.cc_emails", "kruppyona@gmail.com"));

            var formData = new FormUrlEncodedContent(
                queryParams.Select(p => new KeyValuePair<string, string>(p.Key, p.Value)));

            var apiUrl = "https://pay.hyp.co.il/p/";

            Console.WriteLine($"[CreatePayment] Calling HYP via POST: {apiUrl}");

            var clientIp = GetClientIp();
            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            requestMessage.Content = formData;
            requestMessage.Headers.TryAddWithoutValidation("Referer", _hypReferer);
            requestMessage.Headers.TryAddWithoutValidation("REMOTE-HOST", clientIp);
            var response = await _httpClient.SendAsync(requestMessage);
            var responseText = await response.Content.ReadAsStringAsync();

            // Check if HYP returned an error instead of a signature
            if (!responseText.Contains("signature="))
            {
                var errorData = ParseQueryString(responseText);
                return Ok(new
                {
                    error = errorData.ContainsKey("ErrorMessage") ? errorData["ErrorMessage"] : "שגיאת אימות מ-HYP",
                    raw = responseText
                });
            }

            // HYP response is a query string with a signature.
            // Append it to the base URL to get the payment page URL.
            var paymentUrl = $"https://pay.hyp.co.il/p/?{responseText}";

            return Ok(new { paymentUrl = paymentUrl, order = orderId });
        }

        [HttpGet("Redirect")]
        public IActionResult Redirect([FromQuery] string paymentUrl)
        {
            if (string.IsNullOrEmpty(paymentUrl) || !paymentUrl.StartsWith("https://pay.hyp.co.il/"))
                return BadRequest("Invalid payment URL");

            var html = "<!DOCTYPE html><html><head>" +
                "<meta name=\"referrer\" content=\"origin\">" +
                $"<meta http-equiv=\"refresh\" content=\"0;url={paymentUrl}\">" +
                "<title>Redirecting...</title></head>" +
                "<body><p>Redirecting to payment...</p></body></html>";
            return Content(html, "text/html", System.Text.Encoding.UTF8);
        }

        [HttpPost("VerifyPayment")]
        public async Task<IActionResult> VerifyPayment([FromBody] Dictionary<string, string> redirectParams)
        {
            Console.WriteLine("[VerifyPayment] Received redirectParams:");
            foreach (var kvp in redirectParams)
            {
                Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
            }

            var queryParams = new List<(string Key, string Value)>
            {
                ("action", "APISign"),
                ("What", "VERIFY"),
                ("KEY", _apiKey),
                ("PassP", _apiPassword),
                ("Masof", _terminalNumber)
            };

            // Add all params from the HYP success redirect, in the same order
            foreach (var kvp in redirectParams)
            {
                queryParams.Add((kvp.Key, kvp.Value));
            }

            var formData = new FormUrlEncodedContent(
                queryParams.Select(p => new KeyValuePair<string, string>(p.Key, p.Value)));

            var apiUrl = "https://pay.hyp.co.il/p/";

            Console.WriteLine($"[VerifyPayment] Calling HYP via POST: {apiUrl}");

            var clientIp = GetClientIp();
            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            requestMessage.Content = formData;
            requestMessage.Headers.TryAddWithoutValidation("Referer", _hypReferer);
            requestMessage.Headers.TryAddWithoutValidation("REMOTE-HOST", clientIp);
            var response = await _httpClient.SendAsync(requestMessage);
            var responseText = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"[VerifyPayment] HYP response (raw): [{responseText}]");

            // FIX: Trim whitespace/newlines that can break ParseQueryString
            var result = ParseQueryString(responseText.Trim());

            // FIX: VERIFY response CCode=0 means the SIGNATURE is valid (params not tampered with).
            // Payment success/failure is determined by the CCode in the REDIRECT params.
            bool signatureValid = result.ContainsKey("CCode") && result["CCode"] == "0";
            string paymentCCode = redirectParams.ContainsKey("CCode") ? redirectParams["CCode"] : null;
            var isValid = signatureValid && (paymentCCode == "0" || paymentCCode == "600" || paymentCCode == "700" || paymentCCode == "800");

            Console.WriteLine($"[VerifyPayment] VERIFY CCode: {(result.ContainsKey("CCode") ? result["CCode"] : "MISSING")}, signatureValid: {signatureValid}, paymentCCode: {paymentCCode}, isValid: {isValid}");

            string responseCode = result.ContainsKey("CCode") ? result["CCode"] : null;
            // FIX: HYP VERIFY response may not include Id/Order/Amount/L4digit — fall back to redirectParams
            string transactionId = result.ContainsKey("Id") ? result["Id"] : (redirectParams.ContainsKey("Id") ? redirectParams["Id"] : null);
            string myOrderId = result.ContainsKey("Order") ? result["Order"] : (redirectParams.ContainsKey("Order") ? redirectParams["Order"] : null);
            string L4digit = result.ContainsKey("L4digit") ? result["L4digit"] : (redirectParams.ContainsKey("L4digit") ? redirectParams["L4digit"] : null);
            string amount = result.ContainsKey("Amount") ? result["Amount"] : (redirectParams.ContainsKey("Amount") ? redirectParams["Amount"] : null);

            Console.WriteLine($"[VerifyPayment] orderId={myOrderId}, transId={transactionId}, amount={amount}");

            // FIX 4: Wrap DB operations in try/catch — return JSON response even if DB update fails
            try
            {
                if (isValid)
                {
                    UpdateOrderAsPaid(myOrderId, transactionId, responseCode, L4digit, amount, _configuration.GetConnectionString("DefaultConnection"));
                }
                else
                {
                    LogFailedTransaction(myOrderId, responseCode, L4digit, amount, _configuration.GetConnectionString("DefaultConnection"));
                }
            }
            catch (Exception dbEx)
            {
                Console.WriteLine($"[VerifyPayment] DB update error (non-fatal): {dbEx.Message}");
            }

            return Ok(new
            {
                isValid = isValid,
                transactionId = transactionId,
                amount = amount,
                order = myOrderId,
                Id = transactionId,
                L4digit = L4digit,
                // Debug: include HYP raw response and parsed result for troubleshooting
                hypResponse = responseText,
                parsedCCode = result.ContainsKey("CCode") ? result["CCode"] : null,
                redirectCCode = paymentCCode,
                parsedKeys = string.Join(",", result.Keys),
                redirectParamsCount = redirectParams.Count,
                redirectParamKeys = string.Join(",", redirectParams.Keys)
            });
        }

        /// <summary>
        /// Get student payment details including lessons list and summary
        /// </summary>
        [HttpPost("studentPayment")]
        public async Task<IActionResult> StudentPayment([FromBody] StudentPaymentRequest request)
        {
            try
            {
                using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                string rand6 = GenerateRandomRoomName();

                // Step 1: Set student pre-payment (1 to 3)
                await SetStudentPrePayment(connection, request.StudentEmail, rand6);

                // Step 2: Get student lessons list
                var lessonsList = await GetStudentLessonsList(connection, request.StudentEmail, request.Date);

                // Step 3: Get student lessons grouped summary
                var lessonsGrouped = await GetStudentLessonsGrouped(connection, request.StudentEmail, request.Date);

                return Ok(new
                {
                    lessonsList = lessonsList,
                    lessonsGrouped = lessonsGrouped
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error processing student payment: {ex.Message}" });
            }
        }

        private void log(string message, string connString)
        {
            // Implement your logging logic here
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                string sql = "insert into t_log (logis) values (@message)";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@message", message);

                cmd.ExecuteNonQuery();
            }
        }

        private void UpdateOrderAsPaid(string orderId, string transId, string responseCode, string L4digit, string amount, string connString)
        {
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                string sql = "UPDATE t_gn25_Hyp_Orders SET gn25_Status = 'Completed', gn25_TransactionId = @lpId, gn25_ResponseCode = @responseCode, gn25_ResponseAt = Getdate(), gn25_L4digit = @L4digit WHERE gn25_OrderId = @orderId";
                SqlCommand cmd = new SqlCommand(sql, conn);
                // FIX 2: (object)x ?? DBNull.Value for nullable strings
                cmd.Parameters.AddWithValue("@lpId", (object)transId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@orderId", (object)orderId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@responseCode", (object)responseCode ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@L4digit", (object)L4digit ?? DBNull.Value);

                cmd.ExecuteNonQuery();
            }

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                string sql = @"update dbo.t_gn06_calendar 
                                    set gn06_catchSlot_flag_0free_1onHold_2selected = 2 ,
                                        gn06_transactionId = @p_transactionId,
                                        gn06_dateOfTransaction = GETDATE(),
                                        gn06_orderId = @p_orderId
                                         where  gn06_studentRegisteredEmail = (select gn25_CustomerEmail from [t_gn25_Hyp_Orders] where [gn25_OrderId] = @p_orderId) and 
                                               gn06_date >= @p_date_yyyyMMdd and 
                                               gn06_catchSlot_flag_0free_1onHold_2selected = 3;";

                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@p_orderId", (object)orderId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@p_transactionId", (object)transId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@p_date_yyyyMMdd", System.DateTime.Today.ToString("yyyy-MM-dd"));

                int rowsAffected = cmd.ExecuteNonQuery();

                conn.Close();

                // FIX 3: Guard null orderId before calling trace; parse amount safely
                if (!string.IsNullOrEmpty(orderId))
                {
                    try
                    {
                        globalClassFunctions myFunctions = new globalClassFunctions();
                        string studentEmail = myFunctions.getScalar(
                            "select gn25_CustomerEmail from [t_gn25_Hyp_Orders] where [gn25_OrderId] = @orderId",
                            new SqlParameter("@orderId", orderId))?.ToString() ?? "";

                        int parsedAmount = 0;
                        if (!string.IsNullOrEmpty(amount))
                            int.TryParse(amount.Replace(".00", ""), out parsedAmount);

                        myFunctions.f_insert_trace(studentEmail, 300, 303, 3, "", "", studentEmail, "", "", 0, rowsAffected,
                            0, parsedAmount, L4digit ?? "", transId ?? "", 0, "");
                    }
                    catch (Exception traceEx)
                    {
                        Console.WriteLine($"[UpdateOrderAsPaid] Trace error (non-fatal): {traceEx.Message}");
                    }
                }
            }
        }

        private void LogFailedTransaction(string orderId, string responseCode, string L4digit, string amount, string connString)
        {
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                string sql = "UPDATE t_gn25_Hyp_Orders SET gn25_Status = 'Failed', gn25_ResponseCode = @responseCode, gn25_ResponseAt = Getdate(), gn25_L4digit = @L4digit WHERE gn25_OrderId = @orderId";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@orderId", (object)orderId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@responseCode", (object)responseCode ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@L4digit", (object)L4digit ?? DBNull.Value);
                int rowsAffected = cmd.ExecuteNonQuery();

                conn.Close();

                if (!string.IsNullOrEmpty(orderId))
                {
                    try
                    {
                        globalClassFunctions myFunctions = new globalClassFunctions();
                        string studentEmail = myFunctions.getScalar(
                            "select gn25_CustomerEmail from [t_gn25_Hyp_Orders] where [gn25_OrderId] = @orderId",
                            new SqlParameter("@orderId", orderId))?.ToString() ?? "";

                        int parsedAmount = 0;
                        if (!string.IsNullOrEmpty(amount))
                            int.TryParse(amount.Replace(".00", ""), out parsedAmount);

                        myFunctions.f_insert_trace(studentEmail, 300, 304, 3, "", "", studentEmail, "", "", 0, rowsAffected,
                            0, parsedAmount, L4digit ?? "", "", 0, responseCode ?? "");
                    }
                    catch (Exception traceEx)
                    {
                        Console.WriteLine($"[LogFailedTransaction] Trace error (non-fatal): {traceEx.Message}");
                    }
                }
            }
        }

        private string GetClientIp()
        {
            // Priority: REMOTE-HOST header (from Base44 proxy) > X-Forwarded-For > connection IP
            var remoteHost = Request.Headers["REMOTE-HOST"].FirstOrDefault();
            if (!string.IsNullOrEmpty(remoteHost) && remoteHost != "127.0.0.1")
                return remoteHost;

            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
                return forwardedFor.Split(',')[0].Trim();

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        }

        private static Dictionary<string, string> ParseQueryString(string query)
        {
            var result = new Dictionary<string, string>();
            foreach (var pair in query.Split('&'))
            {
                var parts = pair.Split('=', 2);
                if (parts.Length == 2)
                    result[parts[0]] = Uri.UnescapeDataString(parts[1]);
            }
            return result;
        }

        private string GenerateRandomRoomName(int length = 6)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            Random random = new Random();

            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private async Task<StudentDetailDto?> GetStudentDetails(SqlConnection connection, string email)
        {
            using var command = new SqlCommand("p_get_student_detail", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_student_email", email);

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new StudentDetailDto
                {
                    StudentFullName = reader["studentFullName"]?.ToString() ?? string.Empty,
                    Gn01_FirstName = reader["gn01_FirstName"]?.ToString() ?? string.Empty,
                    Gn01_LastName = reader["gn01_LastName"]?.ToString() ?? string.Empty,
                    Gn01_Email = reader["gn01_Email"]?.ToString() ?? string.Empty,
                    Gn01_PhoneNumberShow = reader["gn01_PhoneNumberShow"]?.ToString() ?? string.Empty,
                    Gn01_PhoneNumber = reader["gn01_PhoneNumber"]?.ToString() ?? string.Empty
                };
            }

            return null;
        }

        private async Task SetStudentPrePayment(SqlConnection connection, string studentEmail, string random6)
        {
            using var command = new SqlCommand("p_set_student_pre_payment_1To3", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_student_email", studentEmail);
            command.Parameters.AddWithValue("@p_Random6", random6);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<List<StudentLessonDto>> GetStudentLessonsList(SqlConnection connection, string studentEmail, string date)
        {
            var lessons = new List<StudentLessonDto>();

            using var command = new SqlCommand("p_select_studentLessonsList_pre_payment", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_student_email", studentEmail);
            command.Parameters.AddWithValue("@p_date_yyyyMMdd", date);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lessons.Add(new StudentLessonDto
                {
                    DayInTheWeek = reader["dayInTheWeek"]?.ToString() ?? string.Empty,
                    DateInTheMonth = reader["dateInTheMonth"]?.ToString() ?? string.Empty,
                    StartEndHoure = reader["startEndHoure"]?.ToString() ?? string.Empty,
                    SubjectName = reader["subjectName"]?.ToString() ?? string.Empty,
                    TecherName = reader["techerName"]?.ToString() ?? string.Empty,
                    HourlyPayment = reader["hourlyPayment"] != DBNull.Value ? Convert.ToInt32(reader["hourlyPayment"]) : 0,
                    Gn06_id = reader["gn06_id"] != DBNull.Value ? Convert.ToInt32(reader["gn06_id"]) : 0
                });
            }

            return lessons;
        }

        private async Task<List<StudentLessonGroupDto>> GetStudentLessonsGrouped(SqlConnection connection, string studentEmail, string date)
        {
            var lessonsGrouped = new List<StudentLessonGroupDto>();

            using var command = new SqlCommand("p_select_studentLessonsList_pre_payment_group_by", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@p_student_email", studentEmail);
            command.Parameters.AddWithValue("@p_date_yyyyMMdd", date);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lessonsGrouped.Add(new StudentLessonGroupDto
                {
                    SubjectName = reader["subjectName"]?.ToString() ?? string.Empty,
                    TecherName = reader["techerName"]?.ToString() ?? string.Empty,
                    LessonCount = reader["lessonCount"] != DBNull.Value ? Convert.ToInt32(reader["lessonCount"]) : 0,
                    UnitPrice = reader["unitPrice"] != DBNull.Value ? Convert.ToDecimal(reader["unitPrice"]) : 0,
                    TotalPayment = reader["totalPayment"] != DBNull.Value ? Convert.ToDecimal(reader["totalPayment"]) : 0,
                    HeshDesc = reader["heshDesc"]?.ToString() ?? string.Empty,
                    TecherEmail = reader["techerEmail"]?.ToString() ?? string.Empty,
                    SubjectNr = reader["subjectNr"] != DBNull.Value ? Convert.ToInt32(reader["subjectNr"]) : 0
                });
            }

            return lessonsGrouped;
        }
    }
}