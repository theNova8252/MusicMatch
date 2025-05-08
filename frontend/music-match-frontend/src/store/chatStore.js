import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    socket: null,
  }),
  actions: {
    setSocket(socket) {
      this.socket = socket
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'new-message') {
          this.messages.push(data.message)
        }
      }
    },
    addMessage(msg) {
      this.messages.push(msg)
    },
    clearChat() {
      this.messages = []
    },
  },
})
