import { supabase } from "@/lib/supabaseClient"

export async function getOrCreateDirectConversation(otherUserId: string) {
  const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
    other_user_id: otherUserId,
  })

  if (error) {
    throw error
  }

  return data
}
