
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  TrendingUp,
  FileText,
  Wallet,
  Lightbulb,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";

import robotImg from "../assets/robot.png";

const API_URL = "http://localhost:8000/api";

const suggestions = [
  {
    title: "Analyze my payments",
    description: "Get a quick overview of your revenue.",
    prompt: "Analyze my payment performance and total revenue.",
    icon: Wallet,
    color:
      "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    title: "Pending invoices",
    description: "Find invoices that need attention.",
    prompt: "Analyze my pending invoices and tell me which need attention.",
    icon: FileText,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  },
  {
    title: "Cash flow insights",
    description: "Understand your business cash flow.",
    prompt: "Analyze my business cash flow and suggest improvements.",
    icon: TrendingUp,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    title: "Smart suggestions",
    description: "Discover ways to grow your business.",
    prompt: "Give me three practical suggestions to improve my business.",
    icon: Lightbulb,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
];

// Simple formatting for AI responses
function MessageContent({ content = "" }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-6 break-words">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-1" />;
        }

        const isBullet = /^[-*•]\s/.test(trimmed);
        const isNumbered = /^\d+[.)]\s/.test(trimmed);

        const text = trimmed
          .replace(/^[-*•]\s/, "")
          .replace(/^\d+[.)]\s/, "")
          .replace(/^#{1,4}\s*/, "");

        const parts = text.split(/(\*\*.*?\*\*)/g);

        return (
          <div
            key={index}
            className={
              isBullet || isNumbered ? "flex gap-2 items-start" : ""
            }
          >
            {(isBullet || isNumbered) && (
              <span className="text-violet-500 shrink-0 font-semibold">
                {isNumbered ? `${trimmed.match(/^\d+/)[0]}.` : "•"}
              </span>
            )}

            <span>
              {parts.map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const isChatStarted = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const message = text.trim();

    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message,
      });

      const reply =
        response.data.reply ||
        response.data.message ||
        "I couldn't generate a response. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "I'm unable to connect right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="min-h-[calc(100vh-110px)] flex flex-col">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              AI Assistant
            </h1>

            <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              ✦ AI POWERED
            </span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your intelligent business companion.
          </p>
        </div>

        {isChatStarted && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        )}
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#11182B] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">

        {!isChatStarted ? (
          /* WELCOME SCREEN */
          <div className="flex-1 flex flex-col items-center px-5 sm:px-8 pb-8">

            {/* CIRCULAR ROBOT */}
            <div className="relative mt-9 mb-5">
              <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-2xl scale-110" />

              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 dark:from-violet-900/60 dark:via-purple-900/50 dark:to-indigo-900/60 border-4 border-white dark:border-slate-800 shadow-xl shadow-purple-200/50 dark:shadow-purple-950/40 flex items-center justify-center overflow-hidden">
                <img
                  src={robotImg}
                  alt="PayPilot AI Robot"
                  className="w-full h-full object-contain p-2"
                />
              </div>

              {/* ONLINE INDICATOR */}
              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white dark:border-slate-900" />
            </div>

            {/* GREETING */}
<div className="mb-3 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
  <span className="text-xs font-semibold text-purple-600 dark:text-purple-300">
    ✨ Your AI Finance Assistant
  </span>
</div>

<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
  Hey there! I'm PayPilot AI
</h2>

<h3 className="mt-3 text-xl md:text-2xl font-semibold text-violet-600 dark:text-violet-300 text-center">
  How can I assist you today?
</h3>

<p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">
  Your payments, invoices and business insights — all in one conversation.
</p>

            {/* SUGGESTION CARDS */}
            <div className="w-full max-w-3xl mt-9">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-wider text-slate-400">
                  EXPLORE WHAT I CAN DO
                </p>
                <Sparkles size={15} className="text-violet-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() => sendMessage(item.prompt)}
                      disabled={loading}
                      className="group flex items-center gap-3 text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500/60 hover:bg-violet-50/60 dark:hover:bg-violet-500/5 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${item.color}`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        className="text-slate-400 group-hover:text-violet-600 transition"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* CHAT SCREEN */
          <>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center overflow-hidden">
                <img
                  src={robotImg}
                  alt="PayPilot"
                  className="w-full h-full object-contain p-1"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  PayPilot AI
                </h3>
                <p className="text-xs text-emerald-500">
                  ● Online · Business data connected
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-[380px] max-h-[calc(100vh-350px)] overflow-y-auto p-5 sm:p-7 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center overflow-hidden">
                      <img
                        src={robotImg}
                        alt="AI"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-slate-100 dark:bg-[#1B2540] text-slate-700 dark:text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    <MessageContent content={message.content} />
                  </div>

                  {message.role === "user" && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                      <User size={18} className="text-indigo-600 dark:text-indigo-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center overflow-hidden">
                    <img
                      src={robotImg}
                      alt="AI"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-[#1B2540] text-sm text-slate-500 dark:text-slate-400">
                    <LoaderCircle size={16} className="animate-spin" />
                    PayPilot is thinking...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </>
        )}

        {/* MESSAGE INPUT */}
        <div className="p-4 sm:px-7 sm:py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11182B]">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1B2540] focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask PayPilot anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400 px-3 py-3 max-h-28"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-violet-500/20"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-3">
              PayPilot AI may make mistakes. Verify important financial decisions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
