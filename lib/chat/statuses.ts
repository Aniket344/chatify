import { supabase } from "@/lib/supabaseClient"

export type StatusRow = {
  id: string
  user_id: string
  content_url: string | null
  content_type: string
  caption: string | null
  background: string | null
  created_at: string
  expires_at: string
}

export async function fetchMyStatuses(userId: string) {
  const { data, error } = await supabase
    .from("statuses")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as StatusRow[]
}

export async function fetchRecentStatuses(excludeUserId: string) {
  const { data, error } = await supabase
    .from("statuses")
    .select("*")
    .neq("user_id", excludeUserId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(80)

  if (error) {
    throw error
  }

  return (data ?? []) as StatusRow[]
}

export async function createStatus(input: {
  userId: string
  contentUrl?: string | null
  contentType: string
  caption?: string | null
  background?: string | null
}) {
  const { data, error } = await supabase
    .from("statuses")
    .insert({
      user_id: input.userId,
      content_url: input.contentUrl ?? null,
      content_type: input.contentType,
      caption: input.caption ?? null,
      background: input.background ?? null,
    })
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as StatusRow
}
