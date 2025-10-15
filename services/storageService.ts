import { supabase } from '@/supabase/supabaseClient'

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'public-assets'

export async function uploadPublicImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/*'
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}


