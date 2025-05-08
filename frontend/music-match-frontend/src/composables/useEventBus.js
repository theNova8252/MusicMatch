import { getCurrentInstance } from 'vue'

/**
 * A simple event bus implementation for Vue 3
 */
class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event handler function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event handler function to remove
   */
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback)
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {any} payload - Data to pass to event handlers
   */
  emit(event, payload) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(payload))
    }
  }
}

// Create a singleton instance
const eventBus = new EventBus()

/**
 * Composable to access the event bus
 * @returns {EventBus} The event bus instance
 */
export function useEventBus() {
  const instance = getCurrentInstance()

  if (instance) {
    // Automatically clean up event listeners when component is unmounted
    const { onUnmounted } = instance.appContext.config.globalProperties

    // Enhanced version that tracks listeners for auto-cleanup
    const listeners = []

    const on = (event, callback) => {
      eventBus.on(event, callback)
      listeners.push({ event, callback })
      return () => off(event, callback)
    }

    const off = (event, callback) => {
      eventBus.off(event, callback)
      const index = listeners.findIndex((l) => l.event === event && l.callback === callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }

    if (onUnmounted) {
      onUnmounted(() => {
        // Clean up all registered event listeners when component unmounts
        listeners.forEach(({ event, callback }) => {
          eventBus.off(event, callback)
        })
      })
    }

    return {
      on,
      off,
      emit: eventBus.emit.bind(eventBus),
      // Additional utility method to emit once and auto-cleanup
      once: (event, callback) => {
        const wrappedCallback = (payload) => {
          off(event, wrappedCallback)
          callback(payload)
        }
        return on(event, wrappedCallback)
      },
    }
  }

  // Fallback for when used outside of component setup
  return {
    on: eventBus.on.bind(eventBus),
    off: eventBus.off.bind(eventBus),
    emit: eventBus.emit.bind(eventBus),
    once: (event, callback) => {
      const wrappedCallback = (payload) => {
        eventBus.off(event, wrappedCallback)
        callback(payload)
      }
      eventBus.on(event, wrappedCallback)
      return () => eventBus.off(event, wrappedCallback)
    },
  }
}

// Export the raw event bus for global usage if needed
export { eventBus }
