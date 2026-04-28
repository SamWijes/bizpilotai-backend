'use strict';
const OpenAI = require('openai');
const { AiUsageLog } = require('../../models');
const { AI_PROMPT_TYPE } = require('../../config/constants');
const logger = require('../../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Core function to call OpenAI and log usage.
 */
const callOpenAI = async ({ systemPrompt, userPrompt, promptType, userId, businessId }) => {
    const startTime = Date.now();
    let logData = {
        businessId: businessId || null,
        userId: userId || null,
        promptType,
        model: MODEL,
        prompt: userPrompt,
        isSuccess: false,
    };

    try {
        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 1500,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        });

        const text = response.choices[0].message.content;
        const usage = response.usage;
        logData = {
            ...logData,
            response: text,
            tokensUsed: usage.total_tokens,
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            durationMs: Date.now() - startTime,
            isSuccess: true,
        };

        AiUsageLog.create(logData).catch((e) => logger.error('AI log error:', e.message));
        return { text, usage };
    } catch (err) {
        logData.errorMessage = err.message;
        logData.durationMs = Date.now() - startTime;
        AiUsageLog.create(logData).catch((e) => logger.error('AI log error (failure):', e.message));
        throw err;
    }
};

/**
 * Generate business insights in natural language.
 */
const generateInsights = (userPrompt, context, userId, businessId) =>
    callOpenAI({
        systemPrompt: `You are an expert business analyst for a small/medium business. 
The business data context:
${context}
Provide concise, actionable insights based on the user's question.`,
        userPrompt,
        promptType: AI_PROMPT_TYPE.INSIGHT,
        userId,
        businessId,
    });

/**
 * Compose a professional email.
 */
const composeEmail = (userPrompt, userId, businessId) =>
    callOpenAI({
        systemPrompt: 'You are a professional business email writer. Write clear, concise, and polite emails. Output only the email content.',
        userPrompt,
        promptType: AI_PROMPT_TYPE.EMAIL,
        userId,
        businessId,
    });

/**
 * Explain an invoice in plain language.
 */
const explainInvoice = (invoiceData, userId, businessId) =>
    callOpenAI({
        systemPrompt: 'You are a helpful assistant. Explain the following invoice in simple, plain language that a non-accountant can understand.',
        userPrompt: `Invoice data:\n${JSON.stringify(invoiceData, null, 2)}`,
        promptType: AI_PROMPT_TYPE.INVOICE_SUMMARY,
        userId,
        businessId,
    });

/**
 * Generate a social media marketing post.
 */
const generateSocialPost = (userPrompt, userId, businessId) =>
    callOpenAI({
        systemPrompt: 'You are a creative social media marketing expert. Write engaging, platform-appropriate posts. Include relevant hashtags.',
        userPrompt,
        promptType: AI_PROMPT_TYPE.SOCIAL_POST,
        userId,
        businessId,
    });

/**
 * AI chatbot — answer business questions with data context.
 */
const chat = (message, context, userId, businessId) =>
    callOpenAI({
        systemPrompt: `You are BizPilotAI, an intelligent business assistant. 
You have access to the following business context:
${context}
Answer questions helpfully and concisely. If you can't answer from the context, say so.`,
        userPrompt: message,
        promptType: AI_PROMPT_TYPE.CHAT,
        userId,
        businessId,
    });

module.exports = { generateInsights, composeEmail, explainInvoice, generateSocialPost, chat };
