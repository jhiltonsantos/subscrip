import { Category, Currency } from '@prisma/client'

export type ServiceTemplateSeed = {
  name: string
  slug: string
  category: Category
  defaultCurrency: Currency
  pricingUrl: string
  cancelUrl: string
}

export const SERVICE_TEMPLATES: ServiceTemplateSeed[] = [
  { name: 'Netflix', slug: 'netflix', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://netflix.com/signup/planform', cancelUrl: 'https://netflix.com/cancelplan' },
  { name: 'Spotify', slug: 'spotify', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://spotify.com/premium', cancelUrl: 'https://spotify.com/account' },
  { name: 'Amazon Prime', slug: 'amazon-prime', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://amazon.com.br/prime', cancelUrl: 'https://amazon.com.br/prime/cancel' },
  { name: 'Disney+', slug: 'disney-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://disneyplus.com/sign-up', cancelUrl: 'https://disneyplus.com/account' },
  { name: 'HBO Max', slug: 'hbo-max', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://max.com/plans', cancelUrl: 'https://max.com/account' },
  { name: 'YouTube Premium', slug: 'youtube-premium', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://youtube.com/premium', cancelUrl: 'https://youtube.com/paid_memberships' },
  { name: 'Apple TV+', slug: 'apple-tv-plus', category: Category.ENTERTAINMENT, defaultCurrency: Currency.USD, pricingUrl: 'https://apple.com/br/apple-tv-plus', cancelUrl: 'https://support.apple.com/subscriptions' },
  { name: 'Crunchyroll', slug: 'crunchyroll', category: Category.ENTERTAINMENT, defaultCurrency: Currency.BRL, pricingUrl: 'https://crunchyroll.com/premium', cancelUrl: 'https://crunchyroll.com/account' },
  { name: 'Vercel', slug: 'vercel', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://vercel.com/pricing', cancelUrl: 'https://vercel.com/account' },
  { name: 'AWS', slug: 'aws', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://aws.amazon.com/pricing', cancelUrl: 'https://console.aws.amazon.com/billing' },
  { name: 'Google Cloud', slug: 'google-cloud', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloud.google.com/pricing', cancelUrl: 'https://console.cloud.google.com/billing' },
  { name: 'DigitalOcean', slug: 'digitalocean', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://digitalocean.com/pricing', cancelUrl: 'https://cloud.digitalocean.com/account' },
  { name: 'GitHub Pro', slug: 'github-pro', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://github.com/pricing', cancelUrl: 'https://github.com/settings/billing' },
  { name: 'Cloudflare', slug: 'cloudflare', category: Category.INFRASTRUCTURE, defaultCurrency: Currency.USD, pricingUrl: 'https://cloudflare.com/plans', cancelUrl: 'https://dash.cloudflare.com/profile' },
  { name: 'Notion', slug: 'notion', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://notion.so/pricing', cancelUrl: 'https://notion.so/settings' },
  { name: 'Figma', slug: 'figma', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://figma.com/pricing', cancelUrl: 'https://figma.com/settings' },
  { name: 'Slack', slug: 'slack', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://slack.com/pricing', cancelUrl: 'https://slack.com/account/settings' },
  { name: '1Password', slug: '1password', category: Category.TOOLS, defaultCurrency: Currency.USD, pricingUrl: 'https://1password.com/sign-up', cancelUrl: 'https://my.1password.com/settings' },
  { name: 'Canva Pro', slug: 'canva-pro', category: Category.TOOLS, defaultCurrency: Currency.BRL, pricingUrl: 'https://canva.com/pricing', cancelUrl: 'https://canva.com/settings/billing' },
  { name: 'Coursera Plus', slug: 'coursera-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://coursera.org/courseraplus', cancelUrl: 'https://coursera.org/account-settings' },
  { name: 'Alura', slug: 'alura', category: Category.EDUCATION, defaultCurrency: Currency.BRL, pricingUrl: 'https://alura.com.br/planos', cancelUrl: 'https://alura.com.br/minha-conta' },
  { name: 'Duolingo Plus', slug: 'duolingo-plus', category: Category.EDUCATION, defaultCurrency: Currency.USD, pricingUrl: 'https://duolingo.com/plus', cancelUrl: 'https://duolingo.com/settings/subscription' },
  { name: 'Gympass/Wellhub', slug: 'gympass', category: Category.FITNESS, defaultCurrency: Currency.BRL, pricingUrl: 'https://gympass.com/plans', cancelUrl: 'https://gympass.com/account' },
  { name: 'Strava', slug: 'strava', category: Category.FITNESS, defaultCurrency: Currency.USD, pricingUrl: 'https://strava.com/subscribe', cancelUrl: 'https://strava.com/settings/subscription' },
]
