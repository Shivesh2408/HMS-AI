import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ChatbotPage() {
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
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-600 via-blue-600 to-transparent rounded-full blur-3xl opacity-25"
        ></motion.div>

        <motion.div
          animate={{
            x: [0, -200, 100, 0],
            y: [0, 150, -100, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600 via-pink-600 to-transparent rounded-full blur-3xl opacity-25"
        ></motion.div>

        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[length:50px_50px]"
        ></motion.div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="relative z-10 bg-gradient-to-r from-black via-gray-950/50 to-black backdrop-blur-2xl border-b border-cyan-500/5 px-8 py-6 flex justify-between items-center transition-all duration-300 ease-in-out"
        style={{
          boxShadow:
            "0 4px 50px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(34, 211, 238, 0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight"
            style={{
              textShadow: "0 0 40px rgba(34, 211, 238, 0.3)",
            }}
          >
            HMS AI Chatbot
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 40px rgba(34, 211, 238, 0.6)",
            transition: { duration: 0.3 },
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 cursor-pointer"
            style={{
              boxShadow:
                "0 0 30px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.3)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Messages Container */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-black to-gray-950 scroll-smooth transition-all duration-300 ease-in-out">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
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
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-cyan-500/20 rounded-bl-none hover:border-cyan-500/40"
                  }`}
                  style={
                    message.sender === "user"
                      ? {
                          boxShadow:
                            "0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.2)",
                        }
                      : {}
                  }
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
                  className="bg-gradient-to-r from-gray-800 to-gray-900 border border-cyan-500/20 hover:border-cyan-500/40 text-gray-100 px-6 py-4 rounded-3xl rounded-bl-none transition-all duration-300 ease-in-out"
                >
                  <div className="flex space-x-3 items-center">
                    <motion.div
                      custom={0}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-cyan-400"
                    ></motion.div>
                    <motion.div
                      custom={1}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-blue-400"
                    ></motion.div>
                    <motion.div
                      custom={2}
                      variants={dotVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-3 h-3 rounded-full bg-purple-400"
                    ></motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="relative z-10 bg-gradient-to-t from-black via-gray-950/80 to-transparent backdrop-blur-2xl border-t border-cyan-500/5 px-6 py-6 transition-all duration-300 ease-in-out"
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
              boxShadow: "0 0 30px rgba(34, 211, 238, 0.4)",
              transition: { duration: 0.2 },
            }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your symptoms or health concern..."
            className="flex-1 bg-gray-900/60 border border-cyan-500/20 focus:border-cyan-500/50 text-white placeholder-gray-500 px-6 py-3 rounded-full focus:outline-none transition-all duration-300 ease-in-out focus:shadow-lg focus:shadow-cyan-500/30 font-medium"
            disabled={loading}
          />

          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 30px rgba(34, 211, 238, 0.5)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ease-in-out flex items-center justify-center min-w-[100px] ${
              loading || !input.trim()
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg"
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

export default ChatbotPage;
