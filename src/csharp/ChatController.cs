using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace MyApi.Controllers
{
    [Route("api/Chat")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChatController> _logger;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public ChatController(IConfiguration configuration, ILogger<ChatController> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _jwtKey = _configuration["Jwt:Key"] ?? "DefaultJwtKey_ChangeMe_InProduction_2024!";
            _jwtIssuer = _configuration["Jwt:Issuer"] ?? "MyApi";
            _jwtAudience = _configuration["Jwt:Audience"] ?? "MyApi_Users";
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("DefaultConnection")
                   ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        // =============================================================
        // POST: api/Chat/SendMessage
        // Body: { senderEmail, senderRole, recipientEmail, recipientRole, messageText }
        // senderRole / recipientRole: "teacher" | "student"
        // =============================================================
        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.SenderEmail) ||
                    string.IsNullOrWhiteSpace(request.RecipientEmail) ||
                    string.IsNullOrWhiteSpace(request.MessageText))
                {
                    return BadRequest(new { success = false, message = "חסרים שדות חובה" });
                }

                if (request.SenderRole != "teacher" && request.SenderRole != "student")
                {
                    return BadRequest(new { success = false, message = "senderRole חייב להיות teacher או student" });
                }

                if (request.RecipientRole != "teacher" && request.RecipientRole != "student")
                {
                    return BadRequest(new { success = false, message = "recipientRole חייב להיות teacher או student" });
                }

                if (request.SenderEmail.Equals(request.RecipientEmail, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { success = false, message = "לא ניתן לשלוח הודעה לעצמך" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                var messageId = Guid.NewGuid();

                await ExecuteNonQueryAsync(
                    connection,
                    @"INSERT INTO [dbo].[t_ch01_chat_messages]
                        (ch01_id, ch01_sender_email, ch01_sender_role, ch01_recipient_email, ch01_recipient_role,
                         ch01_message_text, ch01_sent_at, ch01_is_read)
                      VALUES
                        (@Id, @SenderEmail, @SenderRole, @RecipientEmail, @RecipientRole,
                         @MessageText, GETDATE(), 0)",
                    new SqlParameter("@Id", messageId),
                    new SqlParameter("@SenderEmail", request.SenderEmail.Trim()),
                    new SqlParameter("@SenderRole", request.SenderRole),
                    new SqlParameter("@RecipientEmail", request.RecipientEmail.Trim()),
                    new SqlParameter("@RecipientRole", request.RecipientRole),
                    new SqlParameter("@MessageText", request.MessageText.Trim())
                );

                _logger.LogInformation("Chat message sent from {Sender} to {Recipient}", request.SenderEmail, request.RecipientEmail);

                return Ok(new
                {
                    success = true,
                    messageId = messageId,
                    sentAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending chat message");
                return StatusCode(500, new { success = false, message = "שגיאה בשליחת ההודעה" });
            }
        }

        // =============================================================
        // GET: api/Chat/GetConversation?user1={email}&user2={email}
        // מחזיר את כל ההודעות בין שני משתמשים (בשני הכיוונים)
        // =============================================================
        [HttpGet("GetConversation")]
        public async Task<IActionResult> GetConversation([FromQuery] string user1, [FromQuery] string user2)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(user1) || string.IsNullOrWhiteSpace(user2))
                {
                    return BadRequest(new { success = false, message = "חסרים פרמטרים" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                var messages = new List<ChatMessageDto>();

                using var cmd = new SqlCommand(
                    @"SELECT ch01_id, ch01_sender_email, ch01_sender_role,
                             ch01_recipient_email, ch01_recipient_role,
                             ch01_message_text, ch01_sent_at, ch01_is_read
                      FROM [dbo].[t_ch01_chat_messages]
                      WHERE (ch01_sender_email = @User1 AND ch01_recipient_email = @User2)
                         OR (ch01_sender_email = @User2 AND ch01_recipient_email = @User1)
                      ORDER BY ch01_sent_at ASC",
                    connection);

                cmd.Parameters.AddWithValue("@User1", user1.Trim());
                cmd.Parameters.AddWithValue("@User2", user2.Trim());

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    messages.Add(new ChatMessageDto
                    {
                        Id = reader.GetGuid(0),
                        SenderEmail = reader.GetString(1),
                        SenderRole = reader.GetString(2),
                        RecipientEmail = reader.GetString(3),
                        RecipientRole = reader.GetString(4),
                        MessageText = reader.GetString(5),
                        SentAt = reader.GetDateTime(6),
                        IsRead = reader.GetBoolean(7)
                    });
                }

                return Ok(new { success = true, messages });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation");
                return StatusCode(500, new { success = false, message = "שגיאה בשליפת ההודעות" });
            }
        }

        // =============================================================
        // GET: api/Chat/GetConversations?userEmail={email}&userRole={role}
        // מחזיר רשימת שיחות (האנשים שיש איתם הודעות) עם ההודעה האחרונה
        // =============================================================
        [HttpGet("GetConversations")]
        public async Task<IActionResult> GetConversations([FromQuery] string userEmail, [FromQuery] string userRole, [FromQuery] string studentEmail)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userEmail))
                {
                    return BadRequest(new { success = false, message = "חסר userEmail" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                var conversations = new List<ConversationDto>();

                using var cmd = new SqlCommand(
                    @"WITH LatestMessages AS (
                        SELECT
                            ch01_id, ch01_sender_email, ch01_sender_role,
                            ch01_recipient_email, ch01_recipient_role,
                            ch01_message_text, ch01_sent_at, ch01_is_read,
                            ROW_NUMBER() OVER (
                                PARTITION BY
                                    CASE WHEN ch01_sender_email = @UserEmail THEN ch01_recipient_email ELSE ch01_sender_email END
                                ORDER BY ch01_sent_at DESC
                            ) AS rn
                        FROM [dbo].[t_ch01_chat_messages]
                        WHERE (ch01_sender_email = @UserEmail OR ch01_recipient_email = @UserEmail)
                          AND (@StudentEmail IS NULL OR ch01_sender_email = @StudentEmail OR ch01_recipient_email = @StudentEmail)
                      )
                      SELECT
                            lm.ch01_id, lm.ch01_sender_email, lm.ch01_sender_role,
                            lm.ch01_recipient_email, lm.ch01_recipient_role,
                            lm.ch01_message_text, lm.ch01_sent_at, lm.ch01_is_read,
                            CASE
                                WHEN CASE WHEN lm.ch01_sender_email = @UserEmail
                                          THEN lm.ch01_recipient_role ELSE lm.ch01_sender_role END = 'teacher'
                                THEN COALESCE(t.gn02_FirstName + ' ' + t.gn02_LastName, '')
                                ELSE COALESCE(s.gn01_FirstName + ' ' + s.gn01_LastName, '')
                            END AS other_name
                      FROM LatestMessages lm
                      LEFT JOIN [dbo].[t_gn01_registration_Students] s
                          ON s.gn01_Email = CASE WHEN lm.ch01_sender_email = @UserEmail
                                                 THEN lm.ch01_recipient_email ELSE lm.ch01_sender_email END
                      LEFT JOIN [dbo].[t_gn02_registration_teacher] t
                          ON t.gn02_Email = CASE WHEN lm.ch01_sender_email = @UserEmail
                                                  THEN lm.ch01_recipient_email ELSE lm.ch01_sender_email END
                      WHERE lm.rn = 1
                      ORDER BY lm.ch01_sent_at DESC",
                    connection);

                cmd.Parameters.AddWithValue("@UserEmail", userEmail.Trim());
                cmd.Parameters.AddWithValue("@StudentEmail", string.IsNullOrWhiteSpace(studentEmail) ? DBNull.Value : (object)studentEmail.Trim());

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var senderEmail = reader.GetString(1);
                    var recipientEmail = reader.GetString(3);
                    // הצד השני בשיחה
                    var otherEmail = senderEmail.Equals(userEmail.Trim(), StringComparison.OrdinalIgnoreCase)
                        ? recipientEmail : senderEmail;
                    var otherRole = senderEmail.Equals(userEmail.Trim(), StringComparison.OrdinalIgnoreCase)
                        ? reader.GetString(4) : reader.GetString(2);

                    conversations.Add(new ConversationDto
                    {
                        MessageId = reader.GetGuid(0),
                        OtherEmail = otherEmail,
                        OtherRole = otherRole,
                        OtherName = reader.IsDBNull(8) ? "" : reader.GetString(8),
                        LastMessage = reader.GetString(5),
                        LastMessageAt = reader.GetDateTime(6),
                        IsRead = reader.GetBoolean(7),
                        LastMessageFromMe = senderEmail.Equals(userEmail.Trim(), StringComparison.OrdinalIgnoreCase)
                    });
                }

                return Ok(new { success = true, conversations });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversations list");
                return StatusCode(500, new { success = false, message = "שגיאה בשליפת השיחות" });
            }
        }

        // =============================================================
        // POST: api/Chat/MarkAsRead
        // Body: { user1, user2 } — מסמן את כל ההודעות מ-user2 ל-user1 כנקראו
        // =============================================================
        [HttpPost("MarkAsRead")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkAsReadRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.User1) ||
                    string.IsNullOrWhiteSpace(request.User2))
                {
                    return BadRequest(new { success = false, message = "חסרים פרמטרים" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                var rowsAffected = await ExecuteNonQueryAsync(
                    connection,
                    @"UPDATE [dbo].[t_ch01_chat_messages]
                      SET ch01_is_read = 1, ch01_read_at = GETDATE()
                      WHERE ch01_sender_email = @User2
                        AND ch01_recipient_email = @User1
                        AND ch01_is_read = 0",
                    new SqlParameter("@User1", request.User1.Trim()),
                    new SqlParameter("@User2", request.User2.Trim())
                );

                return Ok(new { success = true, messagesMarked = rowsAffected });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read");
                return StatusCode(500, new { success = false, message = "שגיאה בעדכון ההודעות" });
            }
        }

        // =============================================================
        // GET: api/Chat/GetUnreadCount?userEmail={email}
        // מחזיר מספר הודעות שלא נקראו
        // =============================================================
        [HttpGet("GetUnreadCount")]
        public async Task<IActionResult> GetUnreadCount([FromQuery] string userEmail)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userEmail))
                {
                    return BadRequest(new { success = false, message = "חסר userEmail" });
                }

                using var connection = new SqlConnection(GetConnectionString());
                await connection.OpenAsync();

                var count = await ExecuteScalarAsync<int>(
                    connection,
                    @"SELECT COUNT(1) FROM [dbo].[t_ch01_chat_messages]
                      WHERE ch01_recipient_email = @UserEmail AND ch01_is_read = 0",
                    new SqlParameter("@UserEmail", userEmail.Trim())
                );

                return Ok(new { success = true, unreadCount = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new { success = false, message = "שגיאה בספירת הודעות" });
            }
        }

        // =============================================================
        // Helper Methods
        // =============================================================
        private async Task<int> ExecuteNonQueryAsync(SqlConnection connection, string sql, params SqlParameter[] parameters)
        {
            using var cmd = new SqlCommand(sql, connection);
            if (parameters != null) cmd.Parameters.AddRange(parameters);
            return await cmd.ExecuteNonQueryAsync();
        }

        private async Task<T> ExecuteScalarAsync<T>(SqlConnection connection, string sql, params SqlParameter[] parameters)
        {
            using var cmd = new SqlCommand(sql, connection);
            if (parameters != null) cmd.Parameters.AddRange(parameters);
            var result = await cmd.ExecuteScalarAsync();
            return result == null || result == DBNull.Value ? default : (T)result;
        }
    }

    // =============================================================
    // DTOs / Models
    // =============================================================
    public class ChatMessageRequest
    {
        public string SenderEmail { get; set; }
        public string SenderRole { get; set; }      // "teacher" | "student"
        public string RecipientEmail { get; set; }
        public string RecipientRole { get; set; }   // "teacher" | "student"
        public string MessageText { get; set; }
    }

    public class MarkAsReadRequest
    {
        public string User1 { get; set; }   // מי שקורא
        public string User2 { get; set; }   // מי ששלח
    }

    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public string SenderEmail { get; set; }
        public string SenderRole { get; set; }
        public string RecipientEmail { get; set; }
        public string RecipientRole { get; set; }
        public string MessageText { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }

    public class ConversationDto
    {
        public Guid MessageId { get; set; }
        public string OtherEmail { get; set; }
        public string OtherRole { get; set; }
        public string OtherName { get; set; }
        public string LastMessage { get; set; }
        public DateTime LastMessageAt { get; set; }
        public bool IsRead { get; set; }
        public bool LastMessageFromMe { get; set; }
    }
}