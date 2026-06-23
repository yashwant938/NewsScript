const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records
  await prisma.userHistory.deleteMany();
  await prisma.bookmarkedScript.deleteMany();
  await prisma.savedNews.deleteMany();
  await prisma.script.deleteMany();
  await prisma.article.deleteMany();
  await prisma.apiUsage.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPasswordHash = bcrypt.hashSync('adminpassword', 10);
  const userPasswordHash = bcrypt.hashSync('userpassword', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@newsscript.ai',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@newsscript.ai',
      password: userPasswordHash,
      role: 'USER',
    },
  });

  console.log('Users created:');
  console.log(`- Admin: ${admin.email} (password: adminpassword)`);
  console.log(`- User: ${user.email} (password: userpassword)`);

  // 4. Create mock seed articles
  const sampleArticles = [
    {
      title: 'AI Paradigm Shift: Next-Gen Reasoning Models Transform Coding Workflows',
      description: 'New reasoning-focused models are demonstrating advanced logic capabilities that automate complex multi-file engineering tasks.',
      content: 'A new generation of artificial intelligence systems designed specifically for advanced reasoning has begun rolling out globally. Unlike standard chat assistants, these models analyze codebases holistically, plan refactoring across multiple files, and verify changes prior to execution. Developers report a 50% increase in productivity for debugging and architectural planning. Tech analysts anticipate these agents will become core team members in software companies by the end of the year.',
      url: 'https://example.com/ai-paradigm-shift',
      urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
      sourceName: 'TechCrunch',
      sourceUrl: 'https://techcrunch.com',
      category: 'technology',
    },
    {
      title: 'Global Chip Consortium Pledges $50B for Domestic Semi-Conductor Fab Expansion',
      description: 'Major tech manufacturers have formed a joint venture to build advanced chip factories, aiming to diversify global supply chains.',
      content: 'A newly formed consortium of the worlds leading technology firms announced a joint $50 billion investment plan to construct three new semiconductor fabrication plants. The facilities, slated for completion by 2028, will focus on sub-2nm node processes, securing localized production of critical silicon hardware. Economists suggest this move will reduce global supply vulnerabilities and stimulate tech hubs worldwide.',
      url: 'https://example.com/global-chip-consortium',
      urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
      sourceName: 'Bloomberg',
      sourceUrl: 'https://bloomberg.com',
      category: 'business',
    },
    {
      title: 'Championship Final: Underdog Team Clinches Victory in Last-Second Thriller',
      description: 'A spectacular last-minute goal secured a historic championship trophy for the league underdogs, sparking city-wide celebrations.',
      content: 'In one of the most dramatic finishes in tournament history, the underdog squad secured the championship title with a buzzer-beating play in the final seconds of extra time. The stadium erupted as the winning goal was confirmed by VAR. The team, which started the season at 100-to-1 odds, has captured the hearts of fans worldwide, while sponsors report record merchandise sales.',
      url: 'https://example.com/championship-final-thriller',
      urlToImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
      sourceName: 'ESPN',
      sourceUrl: 'https://espn.com',
      category: 'sports',
    },
    {
      title: 'Breakthrough Fusion Reactor Sustains Stable Plasma for Over 10 Minutes',
      description: 'Physicists celebrate a major fusion milestone as the experimental reactor maintains net-energy conditions for a record duration.',
      content: 'A team of plasma physicists at the National Fusion Lab has set a new record by sustaining a stable fusion reaction at 150 million degrees Celsius for 600 seconds. The experiment achieved a Q-factor of 1.25, indicating a net energy gain. Scientists believe this breakthrough paves the way for commercializing clean, limitless fusion power by the mid-2040s.',
      url: 'https://example.com/fusion-plasma-breakthrough',
      urlToImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
      sourceName: 'Nature',
      sourceUrl: 'https://nature.com',
      category: 'science',
    },
    {
      title: 'Indie Film Triumphs at Cannes, Taking Home the Prestigious Palme d\'Or',
      description: 'A low-budget psychological drama by a first-time director surprised critics and took the highest honor at the film festival.',
      content: 'The Cannes Film Festival concluded last night with a historic win for indie cinema. The Palme d\'Or was awarded to a psychological drama centered around remote communication, directed by a newcomer on a budget under $1 million. Critics praised the screenplay\'s raw tension and outstanding lead performances, with major streaming platforms already competing for global distribution rights.',
      url: 'https://example.com/cannes-palme-dor-winner',
      urlToImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
      sourceName: 'Variety',
      sourceUrl: 'https://variety.com',
      category: 'entertainment',
    },
    {
      title: 'Climate Summit: Historic Treaty Mandates Carbon Neutral Shipping by 2040',
      description: 'Delegates from 140 countries have signed a binding agreement to transition the global maritime fleet to green ammonia and electric engines.',
      content: 'The International Maritime Summit in Copenhagen ended with a landmark treaty signed by 140 nations. The agreement mandates that all commercial shipping operations must reduce net carbon emissions to zero by 2040. Shipping conglomerates will receive green subsidies to retrofit vessels with hydrogen fuel cells and wind-assisted propulsion systems, marking the end of heavy fuel oil in maritime trade.',
      url: 'https://example.com/maritime-climate-summit',
      urlToImage: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=600&auto=format&fit=crop',
      sourceName: 'Reuters',
      sourceUrl: 'https://reuters.com',
      category: 'world',
    }
  ];

  for (const art of sampleArticles) {
    const recency = 0.9;
    const credibility = art.sourceName === 'Bloomberg' || art.sourceName === 'Reuters' ? 1.0 : 0.8;
    const mentions = 0.8;
    const engagement = 0.7;
    const score = recency * 0.3 + credibility * 0.25 + mentions * 0.25 + engagement * 0.20;

    await prisma.article.create({
      data: {
        title: art.title,
        description: art.description,
        content: art.content,
        url: art.url,
        urlToImage: art.urlToImage,
        publishedAt: new Date(),
        sourceName: art.sourceName,
        sourceUrl: art.sourceUrl,
        category: art.category,
        trendingScore: Math.round(score * 100) / 100,
        recencyScore: recency,
        credibilityScore: credibility,
        mentionsScore: mentions,
        engagementScore: engagement,
      }
    });

    // Also copy to overall category
    await prisma.article.create({
      data: {
        title: art.title,
        description: art.description,
        content: art.content,
        url: art.url + '-overall',
        urlToImage: art.urlToImage,
        publishedAt: new Date(),
        sourceName: art.sourceName,
        sourceUrl: art.sourceUrl,
        category: 'overall',
        trendingScore: Math.round((score - 0.05) * 100) / 100,
        recencyScore: recency,
        credibilityScore: credibility,
        mentionsScore: mentions,
        engagementScore: engagement,
      }
    });
  }

  console.log('Seeded database successfully with articles!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
