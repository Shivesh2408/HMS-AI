import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const inputValue = input;
    setInput("");
    setLoading(true);

    try {
      if (!token) {
        const errorMessage = {
          id: messages.length + 1,
          text: "Authentication required. Please login.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();

      const aiMessage = {
        id: messages.length + 2,
        text: data.reply,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, an error occurred. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8, x: 0 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: custom * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const typingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const dotVariants = {
    hidden: { y: 0, opacity: 0.6 },
    visible: (i) => ({
      y: [-8, 0, -8],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800/50 relative overflow-hidden">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-gray-900/60 border-b border-cyan-500/10 px-6 py-4 transition-all duration-300 shadow-lg backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              AI Health Assistant
            </h2>
            <p className="text-xs text-cyan-400 mt-1">Always here to help</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-cyan-500"
            style={{
              boxShadow: "0 0 10px rgba(37, 99, 235, 0.3)",
            }}
          />
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 bg-gray-800/50 scroll-smooth">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl mx-auto w-full"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                custom={idx}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl transition-all duration-300 ease-in-out cursor-pointer ${
                    message.sender === "user"
                      ? "bg-cyan-600 text-white rounded-br-none shadow-lg"
                      : "bg-gray-800/50 text-gray-100 border border-cyan-500/10 rounded-bl-none hover:border-cyan-500/40"
                  }`}
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-sm lg:text-base leading-relaxed font-medium"
                  >
                    {message.text}
                  </motion.p>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                    className="text-xs opacity-70 mt-2 block"
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                variants={typingVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex justify-start"
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-gray-900/60 border border-cyan-500/10 hover:border-[#2563EB]/40 text-white px-6 py-4 rounded-3xl rounded-bl-none transition-all duration-300"
                >
                  <div className="flex space-x-3 items-center">
                    <motion.div
                      custom={0}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-blue-400"
                    ></motion.div>
                    <motion.div
                      custom={1}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-blue-500"
                    ></motion.div>
                    <motion.div
                      custom={2}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-blue-600"
                    ></motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="relative z-10 bg-gray-900/60 border-t border-cyan-500/10 px-6 py-6 transition-all duration-300 shadow-lg backdrop-blur-xl"
      >
        <motion.div
          className="max-w-4xl mx-auto flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.input
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileFocus={{
              scale: 1.02,
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)",
              transition: { duration: 0.2 },
            }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms..."
            className="flex-1 bg-gray-800/50 border border-cyan-500/20 focus:border-cyan-500 text-white placeholder-gray-500 px-6 py-3 rounded-full focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-500/30 font-medium"
            disabled={loading}
          />

          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            whileHover={{
              scale: 1.08,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center min-w-[100px] ${
              loading || !input.trim()
                ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                : "bg-cyan-600 text-white hover:bg-cyan-700"
            }`}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Send
              </motion.span>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Chat;
