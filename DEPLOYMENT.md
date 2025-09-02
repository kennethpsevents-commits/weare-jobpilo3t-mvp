# JobPilot Production Deployment Guide

## Prerequisites

1. **Vercel Account** - Connected to your GitHub repository
2. **Supabase Project** - Database and authentication
3. **Stripe Account** - Payment processing
4. **Domain** - www.wearejobpilot.com configured

## Environment Variables

Add these to your Vercel project settings:

### Database
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Payments
\`\`\`
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
\`\`\`

### Application
\`\`\`
NEXT_PUBLIC_BASE_URL=https://www.wearejobpilot.com
CRON_SECRET=your_secure_random_string
SLACK_WEBHOOK_URL=your_slack_webhook_url (optional)
\`\`\`

## Database Setup

1. **Run Migration Scripts** in Supabase SQL Editor:
   \`\`\`sql
   -- Run in order:
   scripts/001-create-jobs-table.sql
   scripts/002-create-crawl-logs-table.sql
   scripts/003-create-user-profiles-table.sql
   scripts/004-create-recruiters-tables.sql
   scripts/005-create-payment-tables.sql
   \`\`\`

2. **Enable Row Level Security (RLS)** on all tables
3. **Set up Authentication** in Supabase Auth settings

## Stripe Configuration

1. **Create Products** in Stripe Dashboard:
   - Single Job Post: €50.00
   - Professional Pack: €225.00 (5 credits)
   - Enterprise Pack: €800.00 (20 credits)

2. **Configure Webhooks**:
   - Endpoint: `https://www.wearejobpilot.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

3. **Enable Payment Methods**:
   - Credit Cards
   - iDEAL (Netherlands)
   - Bancontact (Belgium)

## Domain Configuration

1. **DNS Settings** (already configured):
   - A Record: 216.198.79.1
   - CNAME Record: www → Vercel DNS

2. **SSL Certificate** - Automatically handled by Vercel

## Deployment Steps

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   \`\`\`

2. **Vercel Auto-Deploy** - Triggered automatically

3. **Verify Deployment**:
   - Check build logs in Vercel dashboard
   - Test all major features
   - Verify payment flow
   - Test job crawling

## Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Job listings display
- [ ] AI matching works
- [ ] Recruiter dashboard functional
- [ ] Payment system operational
- [ ] Multi-language switching works
- [ ] Monster mining system active
- [ ] Cron jobs scheduled
- [ ] Error monitoring active

## Monitoring & Maintenance

1. **Vercel Analytics** - Enabled automatically
2. **Error Tracking** - Monitor function logs
3. **Database Monitoring** - Supabase dashboard
4. **Payment Monitoring** - Stripe dashboard

## Troubleshooting

### Build Failures
- Check TypeScript errors
- Verify all environment variables
- Review function timeout limits

### Runtime Errors
- Check Vercel function logs
- Verify Supabase connection
- Test Stripe webhook delivery

### Performance Issues
- Monitor Vercel analytics
- Check database query performance
- Review crawler efficiency

## Support

For technical issues:
1. Check Vercel function logs
2. Review Supabase logs
3. Monitor Stripe webhook delivery
4. Contact support at vercel.com/help if needed

---

**JobPilot is now production-ready!** 🚀
\`\`\`

```env file="" isHidden
