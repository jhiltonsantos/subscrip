import type { PrismaClient } from '@prisma/client'
import { SERVICE_TEMPLATES } from './service-templates'

export async function upsertServiceTemplates(prisma: PrismaClient): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>()

  for (const template of SERVICE_TEMPLATES) {
    const row = await prisma.serviceTemplate.upsert({
      where: { slug: template.slug },
      create: template,
      update: {
        name: template.name,
        category: template.category,
        defaultCurrency: template.defaultCurrency,
        pricingUrl: template.pricingUrl,
        cancelUrl: template.cancelUrl,
      },
    })
    slugToId.set(template.slug, row.id)
  }

  return slugToId
}
