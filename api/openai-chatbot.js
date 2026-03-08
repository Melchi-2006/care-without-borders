/**
 * OpenAI Chatbot API Service
 * Secure backend for AI-powered healthcare chatbot
 * Never exposes API keys to client
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// ==================== ENVIRONMENT SETUP ====================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not set in .env file');
  process.exit(1);
}

// ==================== RATE LIMITING ====================
// Max 10 messages per minute per user to prevent abuse & cost overruns
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many chat requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== SYSTEM PROMPTS ====================
const HEALTHCARE_SYSTEM_PROMPT = `You are an intelligent healthcare assistant for "Care Without Borders" - a telemedicine platform providing accessible healthcare globally.

KEY RESPONSIBILITIES:
1. Provide accurate, evidence-based health information
2. Never replace professional medical advice
3. Always recommend consulting with licensed doctors for serious concerns
4. Maintain patient privacy and confidentiality
5. Be empathetic, professional, and respectful

IMPORTANT GUIDELINES:
- NEVER diagnose diseases definitively - suggest likely possibilities and recommend doctor consultation
- If patient describes emergency symptoms (severe chest pain, difficulty breathing, etc), IMMEDIATELY suggest calling emergency services
- Provide medication information but NEVER substitute for doctor prescriptions
- Acknowledge limitations - you're an AI, not a licensed physician
- Ask clarifying questions to better understand health concerns
- Suggest relevant Care Without Borders services (consultations, medical records access, etc)
- Always maintain HIPAA-compliant communication
- Decline requests for dangerous or illegal health advice

CONVERSATION STYLE:
- Be warm, supportive, and non-judgmental
- Use clear, simple language (avoid medical jargon when possible)
- Provide structured, organized responses
- Cite credible sources when possible
- Ask follow-up questions to gather context

EMERGENCY DETECTION:
Monitor for emergency keywords and respond with urgency if detected.`;

// ==================== CONVERSATION MEMORY ====================
const conversationHistories = new Map(); // Store per-user conversation histories

/**
 * Initialize or retrieve user conversation history
 */
function getConversationHistory(userId) {
  if (!conversationHistories.has(userId)) {
    conversationHistories.set(userId, []);
  }
  return conversationHistories.get(userId);
}

/**
 * Add message to conversation history
 */
function addMessageToHistory(userId, role, content) {
  const history = getConversationHistory(userId);
  history.push({ role, content });
  
  // Keep only last 20 messages to avoid token limit issues
  if (history.length > 20) {
    history.shift();
  }
}

/**
 * Clear conversation history (user logout)
 */
function clearConversationHistory(userId) {
  conversationHistories.delete(userId);
}

// ==================== EMERGENCY DETECTION ====================
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'difficulty breathing', 'shortness of breath',
  'severe bleeding', 'loss of consciousness', 'severe allergic reaction',
  'poisoning', 'overdose', 'suicidal', 'self-harm', 'stroke', 'seizure',
  'severe burns', 'choking', 'anaphylaxis', 'sepsis', 'severe infection'
];

function detectEmergency(text) {
  const lowerText = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// ==================== MAIN CHAT ENDPOINT ====================
router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    // Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message cannot be empty' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Check message length (prevent token overflow)
    if (message.length > 5000) {
      return res.status(400).json({ 
        error: 'Message is too long (max 5000 characters)' 
      });
    }

    // Detect emergency
    const isEmergency = detectEmergency(message);
    if (isEmergency) {
      console.warn(`⚠️ EMERGENCY DETECTED from user ${userId}`);
    }

    // Get conversation history
    const history = getConversationHistory(userId);
    
    // Add user message to history
    addMessageToHistory(userId, 'user', message);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: HEALTHCARE_SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    console.log(`📤 Sending request to OpenAI (${messages.length} messages in context)`);
    
    const response = await axios.post(
      OPENAI_ENDPOINT,
      {
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.7, // Balanced creativity vs consistency
        max_tokens: 1000, // Limit response length
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    // Add assistant response to history
    addMessageToHistory(userId, 'assistant', assistantMessage);

    // Emergency escalation
    let escalationRequired = false;
    if (isEmergency || detectEmergency(assistantMessage)) {
      escalationRequired = true;
    }

    console.log(`✅ Response generated successfully (${assistantMessage.length} chars)`);

    res.json({
      success: true,
      message: assistantMessage,
      conversationId: conversationId || userId,
      emergency: isEmergency,
      escalationRequired: escalationRequired,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      }
    });

  } catch (error) {
    console.error('❌ Chatbot Error:', error.message);

    // Handle specific OpenAI errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Authentication failed. API key issue.',
        details: 'Please check your OPENAI_API_KEY in .env'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['retry-after']
      });
    }

    if (error.response?.status === 500) {
      return res.status(503).json({ 
        error: 'OpenAI service unavailable. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to process your message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// ==================== GET CONVERSATION HISTORY ====================
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = getConversationHistory(userId);
    
    res.json({
      success: true,
      history: history,
      messageCount: history.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// ==================== CLEAR CONVERSATION ====================
router.post('/clear/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    clearConversationHistory(userId);
    
    res.json({
      success: true,
      message: 'Conversation cleared'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    model: OPENAI_MODEL,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
