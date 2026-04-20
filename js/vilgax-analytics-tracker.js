/**
 * VILGAX Analytics & History Tracker
 * Tracks user interactions, command history, and usage patterns
 * Provides insights and personalization data
 * 
 * Features:
 * - Command history with timestamps
 * - User engagement metrics
 * - Command success/failure rates
 * - Conversation flow analysis
 * - User preference tracking
 * - Session duration tracking
 * - Privacy-first: local storage only
 */

class VilgaxAnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.commands = [];
    this.sessions = [];
    this.userPreferences = {
      language: localStorage.getItem('language') || 'en',
      preferredTime: null,
      frequentCommands: [],
      responsePreference: 'voice', // or 'text', or 'both'
      accessibility: {
        slowSpeech: false,
        highContrast: false,
        largeText: false
      }
    };
    
    this.commandStats = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageResponseTime: 0,
      commandFrequency: {}
    };
    
    this.engagementMetrics = {
      sessionCount: 0,
      totalEngagementTime: 0,
      averageSessionDuration: 0,
      lastActiveTime: new Date().toISOString(),
      daysActive: 1
    };
    
    this.init();
    console.log('📊 VILGAX Analytics Tracker initialized');
  }

  /**
   * Initialize analytics system
   */
  init() {
    // Load previous data from localStorage
    this.loadAnalyticsData();
    
    // Track session
    this.trackSessionStart();
    
    // Save periodically
    setInterval(() => this.saveAnalyticsData(), 5 * 60 * 1000); // Every 5 minutes
    
    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
      this.saveAnalyticsData();
    });
  }

  /**
   * Track command execution
   */
  trackCommand(commandName, success, responseTime, transcript, metadata = {}) {
    const command = {
      id: this.generateId(),
      name: commandName,
      success,
      responseTime, // milliseconds
      timestamp: new Date().toISOString(),
      transcript,
      sessionId: this.sessionId,
      ...metadata
    };
    
    this.commands.push(command);
    
    // Update statistics
    this.commandStats.totalCommands++;
    if (success) {
      this.commandStats.successfulCommands++;
    } else {
      this.commandStats.failedCommands++;
    }
    
    // Track command frequency
    this.commandStats.commandFrequency[commandName] = (this.commandStats.commandFrequency[commandName] || 0) + 1;
    
    // Update average response time
    this.updateAverageResponseTime(responseTime);
    
    // Keep last 1000 commands
    if (this.commands.length > 1000) {
      this.commands.shift();
    }
    
    console.log(`📊 Command tracked: ${commandName} (${success ? '✅' : '❌'}) - ${responseTime}ms`);
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime(newTime) {
    const total = this.commandStats.totalCommands;
    const currentAvg = this.commandStats.averageResponseTime;
    this.commandStats.averageResponseTime = ((currentAvg * (total - 1)) + newTime) / total;
  }

  /**
   * Track session start
   */
  trackSessionStart() {
    this.sessionStartTime = new Date();
    this.engagementMetrics.sessionCount++;
    console.log(`🎬 Session started: ${this.sessionId}`);
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    const duration = new Date() - this.sessionStartTime;
    
    const session = {
      id: this.sessionId,
      startTime: this.sessionStartTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      commandCount: this.commands.filter(c => c.sessionId === this.sessionId).length,
      userAgent: navigator.userAgent
    };
    
    this.sessions.push(session);
    this.engagementMetrics.totalEngagementTime += duration;
    this.engagementMetrics.averageSessionDuration = this.engagementMetrics.totalEngagementTime / this.engagementMetrics.sessionCount;
    
    // Keep last 100 sessions
    if (this.sessions.length > 100) {
      this.sessions.shift();
    }
    
    console.log(`🏁 Session ended: ${duration}ms, Total engagement: ${this.engagementMetrics.totalEngagementTime}ms`);
  }

  /**
   * Track user preference change
   */
  trackPreferenceChange(preference, value) {
    if (preference === 'language') {
      this.userPreferences.language = value;
      localStorage.setItem('language', value);
    } else if (preference === 'responsePreference') {
      this.userPreferences.responsePreference = value;
    } else if (preference.startsWith('accessibility.')) {
      const key = preference.split('.')[1];
      this.userPreferences.accessibility[key] = value;
    }
    
    console.log(`⚙️ Preference updated: ${preference} = ${value}`);
  }

  /**
   * Get command history (with optional filters)
   */
  getCommandHistory(filters = {}) {
    let history = this.commands;
    
    // Filter by command name
    if (filters.command) {
      history = history.filter(c => c.name === filters.command);
    }
    
    // Filter by success status
    if (filters.success !== undefined) {
      history = history.filter(c => c.success === filters.success);
    }
    
    // Filter by time range
    if (filters.startTime) {
      history = history.filter(c => new Date(c.timestamp) >= new Date(filters.startTime));
    }
    if (filters.endTime) {
      history = history.filter(c => new Date(c.timestamp) <= new Date(filters.endTime));
    }
    
    // Limit results
    const limit = filters.limit || 50;
    return history.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get command success rate
   */
  getCommandSuccessRate(commandName = null) {
    let commands = this.commands;
    if (commandName) {
      commands = commands.filter(c => c.name === commandName);
    }
    
    if (commands.length === 0) return 0;
    
    const successful = commands.filter(c => c.success).length;
    return Math.round((successful / commands.length) * 100);
  }

  /**
   * Get most used commands
   */
  getMostUsedCommands(limit = 10) {
    const usage = {};
    
    for (const command of this.commands) {
      usage[command.name] = (usage[command.name] || 0) + 1;
    }
    
    return Object.entries(usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({
        name,
        count,
        successRate: this.getCommandSuccessRate(name)
      }));
  }

  /**
   * Get user engagement summary
   */
  getEngagementSummary() {
    return {
      totalSessions: this.engagementMetrics.sessionCount,
      totalEngagementTime: this.formatDuration(this.engagementMetrics.totalEngagementTime),
      averageSessionDuration: this.formatDuration(this.engagementMetrics.averageSessionDuration),
      lastActive: this.engagementMetrics.lastActiveTime,
      commandsPerSession: Math.round(this.commandStats.totalCommands / this.engagementMetrics.sessionCount),
      successRate: Math.round((this.commandStats.successfulCommands / this.commandStats.totalCommands) * 100) || 0
    };
  }

  /**
   * Get personalization insights
   */
  getPersonalizationInsights() {
    const mostUsed = this.getMostUsedCommands(5);
    const preferredTime = this.getPreferredActiveTime();
    const commonErrors = this.getCommonFailurePatterns();
    
    return {
      preferredLanguage: this.userPreferences.language,
      topCommands: mostUsed,
      preferredActiveTime,
      commonErrors,
      recommendations: this.generateRecommendations(mostUsed, commonErrors),
      accessibility: this.userPreferences.accessibility
    };
  }

  /**
   * Get preferred active time of day
   */
  getPreferredActiveTime() {
    const hours = {};
    
    for (const command of this.commands) {
      const hour = new Date(command.timestamp).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    }
    
    if (Object.keys(hours).length === 0) return 'unknown';
    
    const mostActive = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
    return `${mostActive[0]}:00 - ${(parseInt(mostActive[0]) + 1) % 24}:00`;
  }

  /**
   * Get common failure patterns
   */
  getCommonFailurePatterns() {
    const failed = this.commands.filter(c => !c.success);
    const patterns = {};
    
    for (const cmd of failed) {
      patterns[cmd.name] = (patterns[cmd.name] || 0) + 1;
    }
    
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([command, count]) => ({ command, count }));
  }

  /**
   * Generate recommendations based on usage
   */
  generateRecommendations(topCommands, failures) {
    const recommendations = [];
    
    // Recommend features based on top commands
    if (topCommands.length > 0) {
      recommendations.push(`You use "${topCommands[0].name}" most often. Try voice form filling to speed it up!`);
    }
    
    // Recommend solutions for failures
    if (failures.length > 0) {
      recommendations.push(`Your "${failures[0].command}" command fails ${failures[0].count} times. Try rephrasing it.`);
    }
    
    // Recommend features based on usage patterns
    if (this.commandStats.totalCommands > 50) {
      recommendations.push('Enable appointment reminders for better appointment management!');
    }
    
    return recommendations;
  }

  /**
   * Get analytics dashboard data
   */
  getDashboardData() {
    return {
      session: {
        id: this.sessionId,
        duration: this.formatDuration(new Date() - this.sessionStartTime),
        commandsInSession: this.commands.filter(c => c.sessionId === this.sessionId).length
      },
      stats: {
        totalCommands: this.commandStats.totalCommands,
        successfulCommands: this.commandStats.successfulCommands,
        failedCommands: this.commandStats.failedCommands,
        successRate: Math.round((this.commandStats.successfulCommands / this.commandStats.totalCommands) * 100) || 0,
        averageResponseTime: Math.round(this.commandStats.averageResponseTime)
      },
      engagement: this.getEngagementSummary(),
      topCommands: this.getMostUsedCommands(5),
      insights: this.getPersonalizationInsights()
    };
  }

  /**
   * Load analytics data from localStorage
   */
  loadAnalyticsData() {
    try {
      const stored = localStorage.getItem('vilgax_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.commands = data.commands || [];
        this.sessions = data.sessions || [];
        this.commandStats = { ...this.commandStats, ...data.commandStats };
        this.engagementMetrics = { ...this.engagementMetrics, ...data.engagementMetrics };
        this.userPreferences = { ...this.userPreferences, ...data.userPreferences };
        console.log(`📂 Analytics data loaded (${this.commands.length} commands, ${this.sessions.length} sessions)`);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }

  /**
   * Save analytics data to localStorage
   */
  saveAnalyticsData() {
    try {
      const data = {
        commands: this.commands,
        sessions: this.sessions,
        commandStats: this.commandStats,
        engagementMetrics: this.engagementMetrics,
        userPreferences: this.userPreferences
      };
      localStorage.setItem('vilgax_analytics', JSON.stringify(data));
      console.log('💾 Analytics data saved');
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }

  /**
   * Format duration in ms to readable string
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all analytics data (careful!)
   */
  clearAnalytics() {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      this.commands = [];
      this.sessions = [];
      this.commandStats = {
        totalCommands: 0,
        successfulCommands: 0,
        failedCommands: 0,
        averageResponseTime: 0,
        commandFrequency: {}
      };
      localStorage.removeItem('vilgax_analytics');
      console.log('🗑️ Analytics data cleared');
      return true;
    }
    return false;
  }
}

// Initialize analytics tracker globally
let vilgaxAnalyticsTracker;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    vilgaxAnalyticsTracker = new VilgaxAnalyticsTracker();
  });
} else {
  vilgaxAnalyticsTracker = new VilgaxAnalyticsTracker();
}
