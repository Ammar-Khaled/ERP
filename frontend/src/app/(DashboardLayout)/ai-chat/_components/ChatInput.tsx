import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Fab,
  CircularProgress,
} from "@mui/material";
import { Send } from "@mui/icons-material";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [message, setMessage] = useState("");
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 2, alignItems: "center" }}
    >
      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Write your message here..."
        disabled={isLoading}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "background.paper",
            "& fieldset": {
              borderColor: "divider",
            },
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "0.95rem",
            lineHeight: 1.5,
          },
        }}
        InputProps={{
          endAdornment: message.length > 100 && (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {message.length}/1000
              </Typography>
            </InputAdornment>
          ),
        }}
      />

      <Fab
        type="submit"
        disabled={!message.trim() || isLoading}
        size="medium"
        color="primary"
        sx={{
          background: "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #1976D2 30%, #7B1FA2 90%)",
          },
          "&.Mui-disabled": {
            opacity: 0.5,
          },
          boxShadow: 3,
          //   "&:hover": {
          //     boxShadow: 6,
          //   },
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : <Send />}
      </Fab>
    </Box>
  );
};
