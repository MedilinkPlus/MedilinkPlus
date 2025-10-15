import { supabase } from '@/supabase/supabaseClient'

export type Promotion = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  type: 'banner' | 'percentage' | 'fixed'
  value?: number
  currency?: string
  startAt: string
  endAt: string
  status: 'draft' | 'published' | 'archived'
  priority?: number
  targetHospitalIds?: string[]
  createdAt: string
  updatedAt: string
}

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'public-assets'
const PROMOTION_KEY = 'configs/promotions.json'

async function readAll(): Promise<Promotion[]> {
  const { data, error } = await supabase.storage.from(BUCKET).download(PROMOTION_KEY)
  if (error) {
    // If file not found, treat as empty list
    if ((error as any).statusCode === '404' || (error as any).message?.includes('not found')) {
      return []
    }
    throw error
  }
  const text = await data.text()
  try {
    const json = JSON.parse(text)
    return Array.isArray(json) ? (json as Promotion[]) : []
  } catch {
    return []
  }
}

async function writeAll(items: Promotion[]): Promise<void> {
  const content = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
  const { error } = await supabase.storage.from(BUCKET).upload(PROMOTION_KEY, content, { upsert: true, contentType: 'application/json' })
  if (error) throw error
}

export class PromotionService {
  static async list(): Promise<Promotion[]> {
    return await readAll()
  }

  static async upsert(promotion: Omit<Promotion, 'createdAt' | 'updatedAt'> & Partial<Pick<Promotion, 'createdAt' | 'updatedAt'>>): Promise<Promotion> {
    const items = await readAll()
    const now = new Date().toISOString()
    const existingIndex = items.findIndex(i => i.id === promotion.id)
    if (existingIndex >= 0) {
      const updated: Promotion = { ...items[existingIndex], ...promotion, updatedAt: now }
      items[existingIndex] = updated
      await writeAll(items)
      return updated
    }
    const created: Promotion = { ...promotion, createdAt: promotion.createdAt || now, updatedAt: now } as Promotion
    items.push(created)
    await writeAll(items)
    return created
  }

  static async delete(id: string): Promise<void> {
    const items = await readAll()
    const filtered = items.filter(i => i.id !== id)
    await writeAll(filtered)
  }
}


