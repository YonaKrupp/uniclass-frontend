using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace MyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PilotController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PilotController> _logger;

        public PilotController(IConfiguration configuration, ILogger<PilotController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("DefaultConnection")
                   ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        // =============================================================
        // POST: api/Pilot/insert_pilot
        // Body: { fullName, email, phone, educationalInstitution, academicDegree, gn32_Notes }
        // gn32_Notes is optional.
        // =============================================================
        [HttpPost("insert_pilot")]
        public async Task<IActionResult> InsertPilot([FromBody] PilotInsertRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.FullName) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Phone) ||
                    string.IsNullOrWhiteSpace(request.EducationalInstitution) ||
                    string.IsNullOrWhiteSpace(request.AcademicDegree))
                {
                    return BadRequest(new { success = false, message = "חסרים שדות חובה" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                await ExecuteNonQueryAsync(
                    connection,
                    @"INSERT INTO [dbo].[t_gn32_registration_pilot]
                        (gn32_FullName, gn32_Email, gn32_Phone, gn32_EducationalInstitution,
                         gn32_AcademicDegree, gn32_Notes, gn32_create_tick_sysdate)
                      VALUES
                        (@FullName, @Email, @Phone, @EducationalInstitution,
                         @AcademicDegree, @Notes, GETDATE())",
                    new SqlParameter("@FullName", request.FullName.Trim()),
                    new SqlParameter("@Email", request.Email.Trim()),
                    new SqlParameter("@Phone", request.Phone.Trim()),
                    new SqlParameter("@EducationalInstitution", request.EducationalInstitution.Trim()),
                    new SqlParameter("@AcademicDegree", request.AcademicDegree.Trim()),
                    new SqlParameter("@Notes", (request.Gn32_Notes ?? "").Trim())
                );

                _logger.LogInformation("Pilot registration saved for {Email}", request.Email);

                return Ok(new { success = true, message = "פרטי הפיילוט נשמרו בהצלחה" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving pilot registration");
                return StatusCode(500, new { success = false, message = "שגיאה בשמירת פרטי הפיילוט" });
            }
        }

        private async Task<int> ExecuteNonQueryAsync(SqlConnection connection, string sql, params SqlParameter[] parameters)
        {
            using var cmd = new SqlCommand(sql, connection);
            if (parameters != null) cmd.Parameters.AddRange(parameters);
            return await cmd.ExecuteNonQueryAsync();
        }
    }

    // =============================================================
    // DTOs
    // =============================================================
    public class PilotInsertRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string EducationalInstitution { get; set; }
        public string AcademicDegree { get; set; }
        // JSON property name matches the proxy key sent from Base44 (case-insensitive in ASP.NET Core by default)
        public string Gn32_Notes { get; set; }
    }
}