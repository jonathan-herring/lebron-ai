'use client'
import Image from "next/image";
import { Box } from "@mui/material";
import {useState) from 'react'

export default function Home() {
  const [messages, setMessages] = useState({
    role: 'assistant',
    content: 'Hi I am Lebron James, how can I assist you today?'
  })

    const [message, setMessage] = useState('')
  return 
    <Box 
      width = "100vw"
        height = "100vh"
          display = "flex"
            flexDirection = "column"
              justifyContent = "center"
                alignItems = "center"
                  >
                  <Stack 
                  direction = "column"
                    width = "600px"
                      height = "700px"
                        border = "1px solid black"
                          p={2}
                            spacing={2}


                              
                              </Satck;
    </Box>;
}
