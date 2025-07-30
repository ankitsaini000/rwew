"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_1 = require("ollama");
class AIChatService {
    constructor() {
        this.ollama = new ollama_1.Ollama({
            host: process.env.OLLAMA_HOST || 'http://localhost:11434'
        });
        this.defaultModel = process.env.OLLAMA_MODEL || 'llama2';
        this.systemPrompt = `You are an AI assistant for an influencer marketplace platform. You help users with:

1. **Creator Support**: Help creators optimize their profiles, pricing strategies, and content creation
2. **Brand Support**: Assist brands in finding the right creators for their campaigns
3. **General Guidance**: Provide advice on influencer marketing, social media growth, and platform usage
4. **Technical Support**: Help with platform features, account management, and troubleshooting

Key guidelines:
- Be helpful, professional, and friendly
- Provide specific, actionable advice
- Keep responses concise but informative
- If you don't know something, say so rather than guessing
- Focus on the influencer marketing and social media space
- Be encouraging and supportive of users' goals

Current context: You're chatting with a user on the platform. Respond naturally and helpfully.`;
    }
    /**
     * Send a message to the AI and get a response
     */
    async sendMessage(userMessage, conversationHistory = [], model) {
        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage }
            ];
            const response = await this.ollama.chat({
                model: (model || this.defaultModel),
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            });
            return {
                message: response.message.content,
                model: model || this.defaultModel
            };
        }
        catch (error) {
            console.error('AI Chat Service Error:', error);
            throw new Error('Failed to get AI response. Please try again.');
        }
    }
    /**
     * Get available models from Ollama
     */
    async getAvailableModels() {
        try {
            const models = await this.ollama.list();
            return models.models.map(model => model.name);
        }
        catch (error) {
            console.error('Error fetching models:', error);
            return [this.defaultModel];
        }
    }
    /**
     * Check if Ollama is running and accessible
     */
    async isAvailable() {
        try {
            await this.ollama.list();
            return true;
        }
        catch (error) {
            console.error('Ollama not available:', error);
            return false;
        }
    }
    /**
     * Generate a contextual response based on user type and platform context
     */
    async generateContextualResponse(userMessage, userType, context) {
        var _a;
        let contextualPrompt = this.systemPrompt;
        // Add user-specific context
        if (userType === 'creator') {
            contextualPrompt += `\n\nUser Context: This is a creator on the platform. They may need help with:
- Profile optimization
- Pricing strategies
- Content creation tips
- Brand collaboration opportunities
- Social media growth
- Platform features for creators`;
        }
        else if (userType === 'brand') {
            contextualPrompt += `\n\nUser Context: This is a brand on the platform. They may need help with:
- Finding the right creators
- Campaign planning
- Budget optimization
- Creator evaluation
- Platform features for brands
- Marketing strategies`;
        }
        // Add specific context if available
        if (context === null || context === void 0 ? void 0 : context.profile) {
            contextualPrompt += `\n\nProfile Context: ${JSON.stringify(context.profile, null, 2)}`;
        }
        if ((_a = context === null || context === void 0 ? void 0 : context.recentActivity) === null || _a === void 0 ? void 0 : _a.length) {
            contextualPrompt += `\n\nRecent Activity: ${context.recentActivity.join(', ')}`;
        }
        const messages = [
            { role: 'system', content: contextualPrompt },
            { role: 'user', content: userMessage }
        ];
        return this.sendMessage(userMessage, messages.slice(1));
    }
    /**
     * Generate quick responses for common queries
     */
    async generateQuickResponse(query) {
        const quickPrompts = {
            'pricing': 'What are typical pricing strategies for creators?',
            'profile': 'How can I optimize my creator profile?',
            'brands': 'How do I find brands to collaborate with?',
            'creators': 'How do I find the right creators for my brand?',
            'growth': 'How can I grow my social media following?',
            'campaign': 'How do I create an effective influencer campaign?'
        };
        const matchedPrompt = Object.keys(quickPrompts).find(key => query.toLowerCase().includes(key));
        if (matchedPrompt) {
            const response = await this.sendMessage(quickPrompts[matchedPrompt]);
            return response.message;
        }
        return '';
    }
}
exports.default = new AIChatService();
