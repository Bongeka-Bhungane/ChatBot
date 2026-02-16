import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiSend } from "react-icons/fi";
import ModelDropdown from "../components/ModelDropdown";
import { type Chat, type ChatModel } from "../types/Chat";
import "../ChatScreen.css";
import chatIcon from "../assets/Mlab-imgs/favicon.ico";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { sendChat } from "../redux/chatSlice";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { selectModels, type Model } from "../redux/modelSlice";

type Message = {
  sender: "user" | "bot";
  text: string;
  duration?: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello  How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  // ✅ dropdown uses modelId now
  const models = useSelector(selectModels) as Model[];
  const [modelId, setModelId] = useState<string | null>(null);

  // ✅ derive ChatModel from selected model in store
  const selectedModel = useMemo(() => {
    if (!modelId) return null;
    return models.find((m) => m.id === modelId) || null;
  }, [models, modelId]);

  // fallback modelType if nothing selected yet
  const modelType: ChatModel = useMemo(() => {
    // IMPORTANT: your backend model "name" should match ChatModel values (e.g. "stepfun")
    return (selectedModel?.name as ChatModel) ?? "stepfun";
  }, [selectedModel]);

  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const { currentChat, chats } = useSelector((state: RootState) => state.chats);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    setMessages((prev) => {
      if (currentChat) {
        const botMsg: Message = {
          sender: "bot",
          text: currentChat.answer,
          duration: currentChat.duration,
        };
        return [...prev, botMsg];
      }
      return prev;
    });
    setIsThinking(false);
  }, [currentChat, chats]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const payload: Chat = {
      query: input.trim(),
      modelType: modelType, // ✅ now correct type
    };

    setMessages((prev) => [...prev, { sender: "user", text: input.trim() }]);
    setInput("");
    setIsThinking(true);
    dispatch(sendChat(payload));
  };

  const isEmptyState = messages.every((m) => m.sender !== "user");

  return (
    <>
      {!isOpen && (
        <button className="chat-btn-floating" onClick={() => setIsOpen(true)}>
          <img src={chatIcon} alt="Chat" width={40} height={40} />
        </button>
      )}

      <div className={`chat-popup ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <span className="model">Choose a model</span>

            <div className="model-btn">
              {/* ✅ dropdown now controls modelId */}
              <ModelDropdown model={modelId} setModel={setModelId} />
            </div>
          </div>

          <div className="chat-header-right">
            <button
              className="nav-btn"
              onClick={() => navigate("/admin")}
              title="Admin Settings"
            >
              <FiSettings size={18} />
            </button>

            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <span className="close-icon">✕</span>
            </button>
          </div>
        </div>

        <div className="chat-screen">
          <div className="chat-body">
            {isEmptyState ? (
              <div className="chat-empty-state">
                <img src={chatIcon} alt="AI" className="empty-ai-icon" />
                <h2>Hi </h2>
                <p>How can I help you today?</p>
              </div>
            ) : (
              <>
                {messages.map((ms, index) => (
                  <div key={index} className={`chat-bubble ${ms.sender}`}>
                    <div>
                      <MarkdownPreview
                        source={ms.text}
                        style={{
                          background: "transparent",
                          color: "inherit",
                          padding: 0,
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    {ms.sender === "bot" && (
                      <span className="response-time">
                        Responded in {ms.duration ? ms.duration : 0}
                      </span>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className="chat-bubble bot thinking">
                    <img src={chatIcon} alt="AI" width={18} />
                    <span>
                      Thinking
                      <span className="dots"></span>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="chat-footer">
            <div className={`chat-input-pill ${isThinking ? "disabled" : ""}`}>
              <input
                type="text"
                placeholder="Ask Tribal Librarian…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isThinking}
              />
              <div className="pill-right">
                <button
                  className="send-icon-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  aria-label="Send message"
                  title="Send"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
