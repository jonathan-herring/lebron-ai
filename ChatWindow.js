"use client";

import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Divider } from '@mui/material';

function ChatWindow({ messages, onSend }) {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(message, title);
    setMessage('');
    setTitle('');
  };

  return (
    <Box sx={{ marginLeft: 240, padding: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, backgroundColor: '#ecf0f1' }}>
        {messages.map((msg, index) => (
          <Paper key={index} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, backgroundColor: msg.userMessage ? '#3498db' : '#95a5a6', color: '#fff' }}>
            <Typography variant="body2">{msg.userMessage || msg.botResponse}</Typography>
          </Paper>
        ))}
        <Divider />
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Message Title"
          fullWidth
        />
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default ChatWindow;
