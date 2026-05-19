/**
 * Token Bucket Rate Limiter for Socket Events
 * Allows configurable request limits per socket/player
 */

class RateLimiter {
  constructor(maxTokens, refillIntervalMs) {
    this.maxTokens = maxTokens;
    this.refillIntervalMs = refillIntervalMs;
    this.tokens = maxTokens;
    this.lastRefillTime = Date.now();
  }

  /**
   * Check if an action is allowed and consume a token if so
   * @returns {boolean} true if action is allowed, false if rate limited
   */
  isAllowed() {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const tokensToAdd = (timePassed / this.refillIntervalMs) * this.maxTokens;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Get current token count
   */
  getTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const tokensToAdd = (timePassed / this.refillIntervalMs) * this.maxTokens;
    return Math.min(this.maxTokens, this.tokens + tokensToAdd);
  }
}

/**
 * Socket Rate Limiter Manager
 * Tracks rate limiters per socket ID and event type
 */
export class SocketRateLimiterManager {
  constructor() {
    this.limiters = new Map(); // Map<socketId, Map<eventName, RateLimiter>>

    // Default rate limits: {maxTokens, refillIntervalMs}
    this.defaultLimits = {
      "room:play-card": { maxTokens: 1, refillIntervalMs: 100 }, // 1 action per 100ms
      "room:draw-pass": { maxTokens: 1, refillIntervalMs: 100 },
      "room:send-emoji": { maxTokens: 5, refillIntervalMs: 1000 }, // 5 emojis per second
      "var:vote": { maxTokens: 1, refillIntervalMs: 100 },
      "var:start": { maxTokens: 1, refillIntervalMs: 500 }, // 1 VAR per 500ms
      "var:submit-explanation": { maxTokens: 1, refillIntervalMs: 100 },
      "room:change-settings": { maxTokens: 5, refillIntervalMs: 1000 }, // 5 setting changes per second
      "room:remove-player": { maxTokens: 5, refillIntervalMs: 1000 },
      "room:promote-to-host": { maxTokens: 5, refillIntervalMs: 1000 },
    };
  }

  /**
   * Check if an event is allowed for a socket
   * @param {string} socketId - The socket ID
   * @param {string} eventName - The event name
   * @returns {boolean} true if allowed, false if rate limited
   */
  isAllowed(socketId, eventName) {
    if (!this.defaultLimits[eventName]) {
      // No rate limit defined for this event
      return true;
    }

    let socketLimiters = this.limiters.get(socketId);
    if (!socketLimiters) {
      socketLimiters = new Map();
      this.limiters.set(socketId, socketLimiters);
    }

    let limiter = socketLimiters.get(eventName);
    if (!limiter) {
      const limits = this.defaultLimits[eventName];
      limiter = new RateLimiter(limits.maxTokens, limits.refillIntervalMs);
      socketLimiters.set(eventName, limiter);
    }

    return limiter.isAllowed();
  }

  /**
   * Clean up rate limiters for disconnected socket
   */
  removeSocket(socketId) {
    this.limiters.delete(socketId);
  }

  /**
   * Get current token count for debugging/monitoring
   */
  getTokenCount(socketId, eventName) {
    const socketLimiters = this.limiters.get(socketId);
    if (!socketLimiters) return null;

    const limiter = socketLimiters.get(eventName);
    if (!limiter) return null;

    return limiter.getTokens();
  }

  /**
   * Set custom rate limits for an event
   */
  setLimit(eventName, maxTokens, refillIntervalMs) {
    this.defaultLimits[eventName] = { maxTokens, refillIntervalMs };
  }
}

export default SocketRateLimiterManager;
