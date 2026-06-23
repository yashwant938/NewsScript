import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Fetch latest news to provide context to the chatbot
    const trendingNews = await prisma.article.findMany({
      orderBy: { trendingScore: 'desc' },
      take: 10,
      select: { title: true, category: true, sourceName: true },
    });

    const newsContext = trendingNews
      .map((n, idx) => `${idx + 1}. [${n.category.toUpperCase()}] ${n.title} (Source: ${n.sourceName})`)
      .join('\n');

    const systemPrompt = `You are the NewsScript AI Assistant, an advanced chatbot designed for content creators.
Your task is to help users brainstorm video ideas, outline script directions, explain trending headlines, and answer questions about our news platform.

Here is the list of current trending news articles from our database:
${newsContext}

Provide highly engaging, creative, and structured replies. If the user asks for a video concept or outline, format it with clear bullet points. Be friendly, helpful, and professional.`;

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Format messages history for Gemini
      const geminiContents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      ];

      const result = await model.generateContent({
        contents: geminiContents,
      });

      return NextResponse.json({ content: result.response.text() });
    }

    // 2. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      return NextResponse.json({ content: response.choices[0]?.message?.content || '' });
    }

    // 3. Fallback Mock response
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    let content = "I'm here to help you outline video scripts and explain the latest trends! How can I assist you today?";
    
    if (lastUserMessage.includes('trend') || lastUserMessage.includes('news') || lastUserMessage.includes('happen')) {
      content = `Based on the latest feeds, here are the top trending stories right now:\n\n` + 
        trendingNews.slice(0, 3).map((n) => `• **${n.title}** (${n.sourceName})`).join('\n') + 
        `\n\nWhich of these would you like me to outline a content script for?`;
    } else if (lastUserMessage.includes('script') || lastUserMessage.includes('video') || lastUserMessage.includes('outline')) {
      content = `Here is a quick outline format I recommend for high-retention short-form videos:\n\n` +
        `1. **The Pattern Interrupt Hook (0-5s):** Start with an unexpected question or visual.\n` +
        `2. **The Catalyst (5-20s):** Introduce the main event reported in the news.\n` +
        `3. **The Stakeholder Impact (20-45s):** Explain who this affects and why they should care.\n` +
        `4. **The CTA (45-60s):** End with an engaging poll/comment prompt to drive interactions.\n\n` +
        `Would you like me to customize this for a specific trending article?`;
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process message' }, { status: 500 });
  }
}
