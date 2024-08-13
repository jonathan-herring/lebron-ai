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

const LakersTheme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500], // Custom primary color
      light: "#63a4ff",
      dark: "#004ba0",
      contrastText: "#fff",
    },
    secondary: {
      main: "yellow", // Custom secondary color
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
    setMessages((messages) => [
      ...messages,
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
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const result = await response.json();

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + result.content,
          },
        ];
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ThemeProvider theme={LakersTheme}>
      <Box
        width="100vw"
        height="100vh"
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
              backgroundSize: "400px",
              backgroundRepeat: "no-repeat",
              backgroundImage: "url(lebron-poster-dunk.png)",
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
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color={message.role === "assistant" ? "white" : "black"}
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
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

          {/* Image on the right */}
          <Box
            component="img"
            sx={{
              height: 633,
              width: 400,
              borderRadius: "50%",
              marginLeft: 2,
            }}
            alt="Right Avatar"
            src="https://your-image-url.com/right-avatar.jpg"
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
