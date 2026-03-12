'use strict';
const aiService = require('./ai.service');
const { Sale, SaleItem, Product, Expense } = require('../../models');
const { success, error } = require('../../utils/response');
const { Op, fn, col } = require('sequelize');

/** Helper: build a compact business context string for AI prompts */
const buildContext = async (businessId) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlySales, lowStock, recentSales] = await Promise.all([
        Sale.sum('total', { where: { businessId, saleDate: { [Op.gte]: monthStart }, status: 'COMPLETED' } }),
        Product.count({ where: { businessId, isActive: true, quantity: { [Op.lte]: fn('reorderLevel') } } }),
        Sale.findAll({ where: { businessId, status: 'COMPLETED' }, order: [['saleDate', 'DESC']], limit: 3, attributes: ['saleDate', 'total'] }),
    ]);

    return `Current Month Sales: $${monthlySales || 0}\nLow Stock Items: ${lowStock}\nRecent Sales: ${JSON.stringify(recentSales.map(s => ({ date: s.saleDate, total: s.total })))}`;
};

const insights = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return error(res, { message: 'Prompt is required', statusCode: 400 });
        const context = await buildContext(req.businessId);
        const result = await aiService.generateInsights(prompt, context, req.user.id, req.businessId);
        return success(res, { data: { response: result.text, tokensUsed: result.usage.total_tokens } });
    } catch (err) { next(err); }
};

const emailCompose = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return error(res, { message: 'Prompt is required', statusCode: 400 });
        const result = await aiService.composeEmail(prompt, req.user.id, req.businessId);
        return success(res, { data: { response: result.text, tokensUsed: result.usage.total_tokens } });
    } catch (err) { next(err); }
};

const invoiceSummary = async (req, res, next) => {
    try {
        const { invoiceData } = req.body;
        if (!invoiceData) return error(res, { message: 'invoiceData is required', statusCode: 400 });
        const result = await aiService.explainInvoice(invoiceData, req.user.id, req.businessId);
        return success(res, { data: { response: result.text, tokensUsed: result.usage.total_tokens } });
    } catch (err) { next(err); }
};

const socialPost = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return error(res, { message: 'Prompt is required', statusCode: 400 });
        const result = await aiService.generateSocialPost(prompt, req.user.id, req.businessId);
        return success(res, { data: { response: result.text, tokensUsed: result.usage.total_tokens } });
    } catch (err) { next(err); }
};

const chatQuery = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return error(res, { message: 'Message is required', statusCode: 400 });
        const context = await buildContext(req.businessId);
        const result = await aiService.chat(message, context, req.user.id, req.businessId);
        return success(res, { data: { response: result.text, tokensUsed: result.usage.total_tokens } });
    } catch (err) { next(err); }
};

module.exports = { insights, emailCompose, invoiceSummary, socialPost, chatQuery };
