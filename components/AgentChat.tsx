"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Plus, Sparkles, FileText, Instagram, Users, Youtube } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "List active clients", icon: <Users size={12} /> },
  { label: "Show all IG leads", icon: <Instagram size={12} /> },
  { label: "Show recent scripts", icon: <FileText size={12} /> },
  { label: "What leads are in follow-up?", icon: <Users size={12} /> },
  { label: "Generate a brief for my top client", icon: <Sparkles size={12} /> },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "default";
  let id = localStorage.getItem("yt-agent-session");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("yt-agent-session", id);
  }
  return id;
}

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("default");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function newChat() {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("yt-agent-session", id);
    setSessionId(id);
    setMessages([]);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: unknown) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${e instanceof Error ? e.message : "Something went wrong"}`,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">CRM Agent</h2>
            <p className="text-xs text-slate-400">Powered by Groq · llama-3.3-70b · free</p>
          </div>
        </div>
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          <Plus size={12} />New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card p-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Youtube size={28} className="text-accent" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">YouTube CRM Agent</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              Ask me anything about your clients, leads, or scripts. I can generate content, track Instagram outreach, and manage your pipeline.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => send(p.label)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:border-accent hover:text-accent transition-colors"
                >
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Bot size={13} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-sm"
                  : "bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Bot size={13} className="text-accent" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts (shown after first message) */}
      {messages.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {QUICK_PROMPTS.slice(0, 3).map(p => (
            <button
              key={p.label}
              onClick={() => send(p.label)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-accent hover:border-accent transition-colors disabled:opacity-40"
            >
              {p.icon}{p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask anything — generate a script, add an IG lead, check your pipeline..."
          rows={1}
          className="flex-1 input resize-none leading-relaxed"
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-accent px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2 self-end"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
