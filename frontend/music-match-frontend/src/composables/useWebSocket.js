import { ref, onUnmounted } from 'vue'

const socket = ref(null)
const isConnected = ref(false)
const isAuthenticated = ref(false)
const messageHandlers = new Map()

export function useWebSocket() {
  const connect = (userId) => {
    if (socket.value) return

    console.log(`🔌 Connecting WebSocket for user ${userId}...`)

    socket.value = new WebSocket('ws://localhost:5000')

    socket.value.onopen = () => {
      isConnected.value = true
      console.log('✅ WebSocket connected, authenticating...')

      // Send authentication
      socket.value.send(
        JSON.stringify({
          type: 'authenticate',
          userId: userId,
        }),
      )
    }

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 WebSocket message received:', data)

        if (data.type === 'auth-success') {
          isAuthenticated.value = true
          console.log('✅ WebSocket authenticated successfully')
          return
        }

        if (data.type === 'auth-required') {
          console.log('🔐 Authentication required')
          return
        }

        if (data.type === 'new-message') {
          const handler = messageHandlers.get('message')
          if (handler) handler(data.message)
        }

        if (data.type === 'user-typing') {
          const handler = messageHandlers.get('typing')
          if (handler) handler(data)
        }
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err)
      }
    }

    socket.value.onclose = () => {
      isConnected.value = false
      isAuthenticated.value = false
      socket.value = null
      console.log('❌ WebSocket disconnected')
    }

    socket.value.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
      isAuthenticated.value = false
    }
  }

  const sendMessage = (receiverId, content) => {
    if (socket.value && isConnected.value && isAuthenticated.value) {
      socket.value.send(
        JSON.stringify({
          type: 'send-message',
          receiverId: receiverId.toString(),
          content,
        }),
      )
    } else {
      console.error('❌ Cannot send message: WebSocket not ready')
    }
  }

  const sendTyping = (receiverId, isTyping) => {
    if (socket.value && isConnected.value && isAuthenticated.value) {
      socket.value.send(
        JSON.stringify({
          type: isTyping ? 'typing-start' : 'typing-stop',
          receiverId: receiverId.toString(),
        }),
      )
    }
  }

  const onMessage = (callback) => {
    messageHandlers.set('message', callback)
  }

  const onTyping = (callback) => {
    messageHandlers.set('typing', callback)
  }

  const removeHandlers = () => {
    messageHandlers.clear()
  }

  onUnmounted(() => {
    removeHandlers()
    disconnect()
  })

  return {
    isConnected,
    isAuthenticated,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    onMessage,
    onTyping,
    removeHandlers,
  }
}
