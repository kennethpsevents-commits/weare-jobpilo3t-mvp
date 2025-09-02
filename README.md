# JobPilot - AI-Powered Job Aggregator

Een moderne job aggregator website gebouwd met Next.js, Supabase en AI-technologie.

## 🚀 Features

- **AI-Powered Job Matching**: Slimme matching van vacatures met kandidaten
- **Real-time Job Crawling**: Automatische crawling van job sites
- **Admin Dashboard**: Uitgebreid admin panel voor beheer
- **Responsive Design**: Werkt perfect op alle apparaten
- **Nederlandse & Engelse Jobs**: Meertalige ondersteuning

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Crawling**: Puppeteer
- **Deployment**: Vercel

## 📦 Installation

1. **Clone de repository**
   \`\`\`bash
   git clone https://github.com/your-username/jobpilot-website.git
   cd jobpilot-website
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Vul de volgende variabelen in:
   - `NEXT_PUBLIC_SUPABASE_URL`: Je Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Je Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Je Supabase service role key

4. **Setup Supabase Database**
   
   Run de SQL scripts in je Supabase dashboard:
   \`\`\`sql
   -- Zie scripts/001-create-jobs-table.sql
   -- Zie scripts/002-create-crawl-logs-table.sql
   \`\`\`

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🚀 Deployment op Vercel

1. **Push naar GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect met Vercel**
   - Ga naar [vercel.com](https://vercel.com)
   - Import je GitHub repository
   - Vercel detecteert automatisch Next.js

3. **Environment Variables toevoegen**
   
   In Vercel dashboard → Settings → Environment Variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   \`\`\`

4. **Deploy**
   - Vercel deployt automatisch bij elke push naar main branch

## 📊 Features

### Homepage
- Hero sectie met job search
- Featured jobs
- AI matching uitleg
- Call-to-action secties

### Vacatures Pagina
- Geavanceerde filtering (type, locatie, branche)
- Paginering
- Responsive job cards
- Real-time zoeken

### Admin Dashboard
- Job statistieken
- Crawler beheer
- Crawl geschiedenis
- Real-time monitoring

### API Endpoints
- `GET /api/jobs` - Haal jobs op met filtering
- `POST /api/jobs` - Voeg nieuwe job toe
- `GET /api/crawl` - Start job crawling
- `GET /api/admin/stats` - Admin statistieken
- `POST /api/admin/crawl` - Trigger manual crawl

## 🔧 Development

### Zonder Supabase (Demo Mode)
De website werkt ook zonder Supabase configuratie en gebruikt dan fallback seed data.

### Met Supabase (Production)
Voor volledige functionaliteit configureer Supabase voor:
- Persistente job opslag
- Real-time updates
- Admin statistieken
- Crawl logging

### Job Crawler
De crawler ondersteunt:
- Indeed Nederland
- LinkedIn Jobs
- Custom job sites
- Rate limiting
- Error handling

## 📝 API Documentation

### Jobs API
\`\`\`typescript
GET /api/jobs?search=developer&location=amsterdam&type=remote&limit=20
\`\`\`

### Crawler API
\`\`\`typescript
POST /api/crawl
{
  "sources": ["indeed-nl", "linkedin-jobs"],
  "maxJobs": 50,
  "dryRun": false
}
\`\`\`

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License.

## 🆘 Support

Voor vragen of problemen:
- Open een issue op GitHub
- Contact: support@wearejobpilot.com

---

**JobPilot** - Vind je droomjob met AI 🚀
