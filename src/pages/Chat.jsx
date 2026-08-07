import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, ArrowRight, Loader2, MessageCircle, Plus, X } from "lucide-react";
import PageLogo from "@/components/PageLogo";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/chatProxy";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [authToken, setAuthToken] = useState("");

  const [conversations, setConversations] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [error, setError] = useState("");
  const [urlName, setUrlName] = useState("");

  const studentEmailParam = searchParams.get("student") || "";
  const messagesEndRef = useRef(null);

  // Init user info from storage
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
      const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
      const userData = JSON.parse(userDataStr);
      const role = localStorage.getItem("userRole") || "";
      const email = userData.teacherEmail || userData.studentEmail || userData.email || "";
      setAuthToken(token);
      setUserRole(role);
      setUserEmail(email);
    } catch (e) {
      console.error("Chat init error:", e);
    }
  }, []);

  const loadConversations = useCallback(async (isPolling = false) => {
    if (!userEmail) { if (!isPolling) setLoadingConversations(false); return; }
    if (!isPolling) setLoadingConversations(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getConversations", userEmail, userRole, studentEmail: userEmail, token: authToken }),
      }).then(r => r.json());
      if (res?.success && Array.isArray(res.conversations)) {
        setConversations(prev => {
          if (JSON.stringify(prev) === JSON.stringify(res.conversations)) return prev;
          return res.conversations;
        });
      }
    } catch (err) {
      console.error("loadConversations error:", err);
      if (!isPolling) setError("שגיאה בטעינת שיחות: " + (err.message || ""));
    } finally {
      if (!isPolling) setLoadingConversations(false);
    }
  }, [userEmail, userRole, authToken, studentEmailParam]);

  const loadMessages = useCallback(async (otherEmail, isPolling = false) => {
    if (!userEmail || !otherEmail) return;
    if (!isPolling) setLoadingMessages(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getConversation", user1: userEmail, user2: otherEmail, token: authToken }),
      }).then(r => r.json());
      if (res?.success && Array.isArray(res.messages)) {
        setMessages(prev => {
          // Only update if something actually changed (new message count or different last message id)
          if (prev.length === res.messages.length) {
            const prevLast = prev[prev.length - 1];
            const newLast = res.messages[res.messages.length - 1];
            if (!prevLast || !newLast || prevLast.id === newLast.id) return prev;
          }
          return res.messages;
        });
      }
      // Mark as read
      fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", user1: userEmail, user2: otherEmail, token: authToken }),
      });
    } catch (err) {
      console.error("loadMessages error:", err);
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  }, [userEmail, authToken]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-select student from URL query param (e.g. from StudentsList "chat" button)
  useEffect(() => {
    const studentEmail = searchParams.get("student");
    if (studentEmail && userEmail && authToken) {
      const otherRole = userRole === "teacher" ? "student" : "teacher";
      setSelectedEmail(studentEmail);
      setSelectedRole(otherRole);
      setUrlName(searchParams.get("name") || "");
      loadMessages(studentEmail);
    }
  }, [searchParams, userEmail, authToken, userRole, loadMessages]);

  // Poll for new messages and conversations in the background
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      if (selectedEmail) loadMessages(selectedEmail, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedEmail, loadMessages, loadConversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setSelectedEmail(conv.otherEmail);
    setSelectedRole(conv.otherRole);
    setUrlName("");
    setShowNewChat(false);
    loadMessages(conv.otherEmail);
  };

  const handleStartNewChat = () => {
    if (!newChatEmail.trim()) return;
    const otherRole = userRole === "teacher" ? "student" : "teacher";
    setSelectedEmail(newChatEmail.trim());
    setSelectedRole(otherRole);
    setUrlName("");
    setShowNewChat(false);
    setNewChatEmail("");
    setMessages([]);
    loadMessages(newChatEmail.trim());
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedEmail) return;
    setSending(true);
    setError("");
    try {
      const recipientRole = userRole === "teacher" ? "student" : "teacher";
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          senderEmail: userEmail,
          senderRole: userRole,
          recipientEmail: selectedEmail,
          recipientRole,
          messageText: messageInput.trim(),
          token: authToken,
        }),
      }).then(r => r.json());
      if (res?.success) {
        const sentText = messageInput.trim();
        setMessageInput("");
        setMessages(prev => [...prev, {
          senderEmail: userEmail,
          messageText: sentText,
          sentAt: new Date().toISOString(),
          id: res?.messageId || Date.now(),
        }]);
        loadConversations(true);
      } else {
        setError(res?.message || "שגיאה בשליחת ההודעה");
      }
    } catch (err) {
      setError(err.message || "שגיאה בשליחת ההודעה");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const otherRoleLabel = selectedRole === "teacher" ? "מורה" : "תלמיד/ה";

  return (
    <div dir="rtl" className="space-y-4">
      <PageLogo />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">הודעות</h1>
          <p className="text-muted-foreground font-body text-sm">צ'אט עם {userRole === "teacher" ? "תלמידים" : "מורים"}</p>
        </div>
      </div>

      {/* New chat input */}
      {showNewChat && (
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-2">
          <input
            type="email"
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            placeholder={`אימייל של ${userRole === "teacher" ? "תלמיד/ה" : "מורה"}`}
            className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body"
          />
          <button
            onClick={handleStartNewChat}
            className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-heading font-semibold hover:bg-primary/90"
          >
            התחל
          </button>
          <button
            onClick={() => { setShowNewChat(false); setNewChatEmail(""); }}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Chat layout */}
      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Conversations list */}
        <div className={`${selectedEmail ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-80 bg-card rounded-2xl border border-border overflow-hidden`}>
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-heading font-semibold text-foreground">שיחות</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm font-body">
                אין שיחות עדיין
              </div>
            ) : (
              conversations.map((conv, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-right px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors flex flex-col gap-1 ${
                    selectedEmail === conv.otherEmail ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-medium text-foreground truncate">{conv.otherName || conv.otherEmail}</span>
                    {!conv.isRead && !conv.lastMessageFromMe && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-body truncate">
                    {conv.lastMessageFromMe ? "אתה: " : ""}{conv.lastMessage}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 font-body">{formatTime(conv.lastMessageAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className={`${selectedEmail ? "flex" : "hidden sm:flex"} flex-col flex-1 bg-card rounded-2xl border border-border overflow-hidden`}>
          {selectedEmail ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <button
                  onClick={() => { setSelectedEmail(null); setMessages([]); }}
                  className="sm:hidden p-1 rounded-lg hover:bg-muted"
                >
                  <ArrowRight className="w-5 h-5 text-foreground" />
                </button>
                <MessageCircle className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-medium text-foreground truncate">
                    {conversations.find(c => c.otherEmail === selectedEmail)?.otherName || urlName || selectedEmail}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">{otherRoleLabel}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm font-body">
                    אין הודעות עדיין. שלחו את ההודעה הראשונה!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderEmail === userEmail;
                    return (
                      <div key={i} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-bl-sm"
                            : "bg-muted text-foreground rounded-br-sm"
                        }`}>
                          <p className="text-sm font-body break-words whitespace-pre-wrap">{msg.messageText}</p>
                          <p className={`text-[10px] mt-1 font-body ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {error && (
                <div className="px-4 py-2 text-xs text-destructive text-center font-body">{error}</div>
              )}
              <div className="px-4 py-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="כתבו הודעה..."
                  className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="bg-primary text-primary-foreground rounded-xl p-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-body text-sm">בחרו שיחה או התחילו צ'אט חדש</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}