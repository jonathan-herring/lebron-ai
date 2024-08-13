"use client";

import {
  Box,
  Stack,
  TextField,
  Button,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { useState } from "react";
import Sidebar from "./Sidebar";

const LakersTheme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
      light: "#63a4ff",
      dark: "#004ba0",
      contrastText: "#fff",
    },
    secondary: {
      main: "yellow",
      light: "#d05ce3",
      dark: "#6a0080",
      contrastText: "#fff",
    },
    gradients: {
      primary: "linear-gradient(45deg, #9575cd 30%, #dce775 90%)",
      secondary: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Yo, it’s LeBron! How can I help you today? Let’s talk hoops, life, or whatever you got!",
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    const updatedMessages = [...messages, { role: "user", content: message }];

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const result = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the placeholder for the assistant
        { role: "assistant", content: result.content },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ThemeProvider theme={LakersTheme}>
      <Sidebar messages={messages} />
      <Box
        width="calc(100vw - 16px)"
        height="calc(100vh - 16px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ background: LakersTheme.palette.gradients.primary }}
      >
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box
            sx={{
              height: 633,
              width: 400,
              marginRight: 2,
              backgroundSize: "cover",
              backgroundImage: "url(/lebron-poster-dunk.png)",
              display: {
                sm: "none",
                md: "flex",
              },
            }}
            display="flex"
            justifyContent="center"
            alignItems="center"
          />
          <Stack
            direction="column"
            width="600px"
            height="600px"
            p={2}
            spacing={2}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    msg.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      msg.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color={msg.role === "assistant" ? "white" : "black"}
                    borderRadius={16}
                    p={3}
                  >
                    {msg.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "black",
                  },
                }}
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
