"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Container,
  Divider,
} from "@mui/material";
import { SmartToy, Person } from "@mui/icons-material";
import { ChatMessage } from "./_components/ChatMessage";
import { ChatInput } from "./_components/ChatInput";
import { Message } from "./_components/ChatMessage";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    try {
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsedMessages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [
        {
          id: "1",
          text: "Welcome! I'm a smart assistant ready to answer your questions. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ];
    } catch (error) {
      console.error("Error loading messages from localStorage:", error);
      return [
        {
          id: "1",
          text: "Welcome! I'm a smart assistant ready to answer your questions. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    try {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thinking about...",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      // Remove loading message and add AI response
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => !msg.isLoading);
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: data.answer,
          isUser: false,
          timestamp: new Date(),
          sources: data.sources,
          processingTime: data.processing_time,
          contextFound: data.context_found,
        };
        return [...filteredMessages, aiMessage];
      });
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove loading message and add error message
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => !msg.isLoading);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: "Sorry, there was a connection error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        height: "666px",
        display: "flex",
        flexDirection: "column",
        py: 2,
        mt: 2,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              background: "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
              width: 48,
              height: 48,
            }}
          >
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Smart assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by artificial intelligence
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          py: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#ccc",
            borderRadius: "3px",
          },
          height: "100%",
        }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 2,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </Paper>
    </Container>
  );
};

export default ChatInterface;
