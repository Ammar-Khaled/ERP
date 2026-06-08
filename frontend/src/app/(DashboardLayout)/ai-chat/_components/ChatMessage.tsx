import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  SmartToy,
  Person,
  AccessTime,
  Storage,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  sources?: Array<{
    score: number;
    source: string;
  }>;
  processingTime?: number;
  contextFound?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("usa", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexDirection: message.isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: message.isUser ? "success.main" : "primary.main",
            background: message.isUser
              ? "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)"
              : "linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)",
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          {message.isUser ? <Person /> : <SmartToy />}
        </Avatar>

        {/* Message Content */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: "85%", sm: "70%", md: "60%" },
            textAlign: message.isUser ? "right" : "left",
          }}
        >
          <Paper
            elevation={message.isUser ? 3 : 1}
            sx={{
              p: 2,
              bgcolor: message.isUser
                ? "success.main"
                : message.isLoading
                ? "grey.100"
                : "background.paper",
              color: message.isUser ? "white" : "text.primary",
              borderRadius: 3,
              position: "relative",
              background: message.isUser
                ? "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)"
                : undefined,
              border:
                !message.isUser && !message.isLoading ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            {message.isLoading ? (
              <Box>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {message.text}
                </Typography>

                {/* AI Message Metadata */}
                {!message.isUser && !message.isLoading && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={1}>
                      {/* Processing Time */}
                      {message.processingTime && (
                        <Chip
                          icon={<AccessTime />}
                          label={`Processing time: ${message.processingTime.toFixed(
                            2
                          )} second`}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            alignSelf: "flex-start",
                          }}
                        />
                      )}

                      {/* Context Found */}
                      {message.contextFound !== undefined && (
                        <Chip
                          icon={
                            message.contextFound ? <CheckCircle /> : <Cancel />
                          }
                          label={
                            message.contextFound
                              ? "Context found"
                              : "Context not found"
                          }
                          variant="outlined"
                          size="small"
                          color={message.contextFound ? "success" : "warning"}
                          sx={{
                            fontSize: "0.75rem",
                            alignSelf: "flex-start",
                          }}
                        />
                      )}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Storage fontSize="small" color="action" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Sources:
                            </Typography>
                          </Box>
                          <Stack spacing={0.5}>
                            {message.sources.map((source: any, index: any) => (
                              <Paper
                                key={index}
                                variant="outlined"
                                sx={{
                                  p: 1,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  bgcolor: "grey.50",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {source.source}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  accuracy: {(source.score * 100).toFixed(1)}%
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Paper>

          {/* Timestamp */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: "block",
              textAlign: message.isUser ? "right" : "left",
            }}
          >
            {formatTime(message.timestamp)}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};
