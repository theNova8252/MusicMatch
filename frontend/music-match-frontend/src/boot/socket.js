// src/boot/socket.js
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  withCredentials: true,
  // You can add extra options if needed
})

export default socket
