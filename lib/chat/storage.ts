import { supabase } from "@/lib/supabaseClient"

export async function uploadChatFile(conversationId: string, file: File, bucket: "chat-attachments" | "voice-notes") {
  const ext = file.name.split(".").pop() || "bin"
  const path = `${conversationId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24)

  if (signError || !data?.signedUrl) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
    return { path, publicUrl: pub.publicUrl }
  }

  return { path, publicUrl: data.signedUrl }
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  return data.publicUrl
}
