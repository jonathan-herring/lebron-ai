import React from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, IconButton, Box } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import Image from 'next/image';

const Sidebar = ({ open, onClose, messages }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}
    >
      <List>
        <ListItem button onClick={onClose}>
          <ListItemText primary="Menu" />
        </ListItem>
        <Divider />
        <ListItem>
          <IconButton
            component="a"
            href="https://github.com/jonathan-herring/lebron-ai"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <GitHub />
          </IconButton>
          <ListItemText primary="GitHub" />
        </ListItem>
        <Divider />
        <ListItem>
          <Box display="flex" alignItems="center">
            <Image src="/chatgpt-app/chatgpt-logo.png" alt="ChatGPT Logo" width={24} height={24} />
            <ListItemText primary="Chat History" sx={{ marginLeft: 1 }} />
          </Box>
        </ListItem>
        <Divider />
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <Box
                bgcolor={msg.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={3}
                width="100%"
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              >
                {msg.content}
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
