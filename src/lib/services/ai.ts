import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { prisma } from '../db';

export interface GeneratedScript {
  hook: string;
  whatHappened: string;
  whyImportant: string;
  keyFacts: string[];
  timeline: { time: string; event: string }[];
  expertAnalysis: string;
  futureImpact: string;
  shortScript: string;
  youtubeScript: string;
  seoTitles: string[];
  thumbnailText: string[];
  hashtags: string[];
  keywords: string[];
}

export class AiScriptService {
  /**
   * Generates a script for a news article using Gemini, OpenAI, or a rich dynamic fallback.
   */
  public static async generateScript(
    title: string,
    content: string,
    sourceName: string,
    category: string
  ): Promise<GeneratedScript> {
    const startTime = Date.now();
    let status = 'SUCCESS';
    let serviceUsed = 'MOCK_AI';

    // 1. Try Gemini API
    if (process.env.GEMINI_API_KEY) {
      serviceUsed = 'GEMINI_AI';
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const prompt = this.buildPrompt(title, content, sourceName, category);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        await this.logApiUsage(serviceUsed, 'SUCCESS', Date.now() - startTime);
        return JSON.parse(text) as GeneratedScript;
      } catch (error) {
        console.error('Gemini API Script generation failed, falling back:', error);
        await this.logApiUsage(serviceUsed, 'FAILURE', Date.now() - startTime);
      }
    }

    // 2. Try OpenAI API
    if (process.env.OPENAI_API_KEY) {
      serviceUsed = 'OPENAI_AI';
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = this.buildPrompt(title, content, sourceName, category);
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are a professional news analyst and content writer. You always output valid raw JSON matching the requested schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const text = response.choices[0]?.message?.content || '';
        await this.logApiUsage(serviceUsed, 'SUCCESS', Date.now() - startTime);
        return JSON.parse(text) as GeneratedScript;
      } catch (error) {
        console.error('OpenAI API Script generation failed, falling back:', error);
        await this.logApiUsage(serviceUsed, 'FAILURE', Date.now() - startTime);
      }
    }

    // 3. Fallback: High Quality Dynamic Mock script builder
    await this.logApiUsage('MOCK_AI', 'SUCCESS', 20);
    return this.generateMockScript(title, content, sourceName, category);
  }

  private static async logApiUsage(service: string, status: string, latencyMs: number) {
    try {
      await prisma.apiUsage.create({
        data: {
          service,
          status,
          latencyMs,
        },
      });
    } catch (e) {
      console.error('Failed writing API usage to database:', e);
    }
  }

  private static buildPrompt(title: string, content: string, sourceName: string, category: string): string {
    return `You are a professional news analyst and content writer.

Analyze the provided news article.
Article Title: "${title}"
Source: "${sourceName}"
Category: "${category}"
Content Summary: "${content}"

Create a highly engaging script for video content creators (YouTube, Instagram Reels, Shorts) and news channels.

Output MUST be a valid JSON object matching the following structure:
{
  "hook": "Attention grabbing opening hook.",
  "whatHappened": "Beginner friendly explanation of the news.",
  "whyImportant": "Explain the significance and impact of the news.",
  "keyFacts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4"],
  "timeline": [
    { "time": "Relative time (e.g. 9:00 AM, Yesterday)", "event": "Details of what happened" }
  ],
  "expertAnalysis": "Explain the consequences or deeper technical analysis.",
  "futureImpact": "What could happen next.",
  "shortScript": "A detailed 60-second video script with visual cues (e.g., [VISUAL: Showing phone screen], [AUDIO: Host speaking...]). Keep it fast-paced.",
  "youtubeScript": "A structured 3-minute YouTube video script with Hook, Intro, Deep-Dive sections, and Outro including camera/visual instructions.",
  "seoTitles": ["Title Suggestion 1", "Title Suggestion 2", "Title Suggestion 3", "Title Suggestion 4", "Title Suggestion 5"],
  "thumbnailText": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}

Keep all info strictly factual and neutral based on the article content. Do not hallucinate.`;
  }

  private static generateMockScript(title: string, content: string, sourceName: string, category: string): GeneratedScript {
    const cleanTitle = title.replace(/"/g, "'");
    return {
      hook: `Did you hear about what just happened? ${cleanTitle}. This major story from ${sourceName} is blowing up right now, and it could change everything. Here is what you need to know.`,
      whatHappened: `Simply put: ${cleanTitle}. The core of this story is that ${sourceName} reported a major development in the ${category} space. According to reports: "${content.slice(0, 200)}..."`,
      whyImportant: `This is a big deal because it signals a turning point in the ${category} sector. It affects not just key industry players, but everyday consumers who rely on these systems and technologies. The market is already responding, and analysts are predicting a ripple effect across related markets.`,
      keyFacts: [
        `Development reported directly by ${sourceName}.`,
        `Directly impacts the ${category} landscape.`,
        `Market indicators showed immediate volatility following the announcement.`,
        `Experts are divided on the long-term regulatory and consumer implications.`
      ],
      timeline: [
        { time: 'Initial Report', event: `The story first broke via journalists covering ${category} developments.` },
        { time: '2 Hours Later', event: 'Public announcements were made confirming key aspects of the change.' },
        { time: 'Current Status', event: 'Global analysts and community members are debating the immediate and secondary impacts.' }
      ],
      expertAnalysis: `Industry analysts state that this shift is the result of months of build-up. The consequences will likely include accelerated competition, shifts in consumer preferences, and potential regulatory scrutiny as governments look to understand the impact.`,
      futureImpact: `Looking ahead, we can expect competitor responses within the next few days. We will also monitor regulatory updates and public sentiment changes, which will dictate how quickly this change integrates into the mainstream.`,
      shortScript: `[VISUAL: Fast-paced cut of trending topic visuals]
[AUDIO: Host - high energy] 
"Stop scrolling! A massive story in ${category} just broke. ${cleanTitle}. 

[VISUAL: Headline screenshot from ${sourceName}]
Here is the breakdown: ${sourceName} reports that this event is officially happening. 

[VISUAL: Infographic showing key facts]
Why does this matter to you? It means major changes are coming to how we interact with technology and the market.

[VISUAL: Host looking at camera]
What do you think? Drop a comment below, hit follow for daily updates, and share this with a friend who needs to know!"`,
      youtubeScript: `[SCENE START - Host sitting in studio, modern setup, neon lighting]
[TEXT ON SCREEN: ${cleanTitle}]

[0:00 - 0:30] THE HOOK & INTRO
Host: "Welcome back! Today, a massive event went down in the ${category} world, and it is sending shockwaves through the industry. We are talking about: ${cleanTitle}. If you have been following this, you know it's been building up for a while, but the latest news from ${sourceName} changes everything. Let's dive in."

[0:30 - 1:45] THE DEEP DIVE
Host: "So, what actually happened? Let's break it down simply. According to the reports: ${content.slice(0, 250)}... This is critical because it highlights a major shift. The key details you need to know are these three facts: First, the scale of this launch is unprecedented. Second, the response from competitors has been immediate. And third, user sentiment is shifting fast."

[1:45 - 2:30] EXPERT ANALYSIS & FUTURE IMPACT
Host: "If we look at the expert analysis, this isn't just a temporary trend. It's a fundamental structural change. What does this mean for the future? We are looking at potential pricing changes, new features rolling out, and possibly new regulatory standards. We could see other companies trying to match this within weeks."

[2:30 - 3:00] OUTRO & CALL TO ACTION
Host: "That is the current state of play. I want to hear from you—how does this impact your daily routine or your views on this industry? Let me know in the comments below. Don't forget to hit the like button, subscribe to the channel, and turn on notifications so you never miss another breakdown. See you in the next video!"`,
      seoTitles: [
        `Why ${cleanTitle} Changes Everything!`,
        `The Truth About ${cleanTitle} (Explained)`,
        `What ${sourceName}'s Latest News Means For You`,
        `Is This The End? ${cleanTitle} Breakdown`,
        `Everything You Need To Know: ${cleanTitle}`
      ],
      thumbnailText: [
        'BIGGEST CHANGE YET',
        `EXPLAINED!`,
        `${sourceName} LEAK`,
        'IMPACT AT SCALE',
        'WHAT NEXT?'
      ],
      hashtags: [
        `#${category}`,
        `#${sourceName.replace(/\s+/g, '')}`,
        '#breakingnews',
        '#newsexplained',
        '#contentcreator'
      ],
      keywords: [
        category,
        sourceName,
        'breaking news',
        'video script',
        'viral news'
      ],
    };
  }
}
