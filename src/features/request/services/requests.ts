// features/request/services/requests.ts
import { supabase } from "@lib/supabase";
import { Request } from "@models/request";

export async function fetchRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("id, items, reward, city, start_date, end_date, chat_link, created_at");

  if (error) {
    console.error("요청 불러오기 실패:", error.message);
    return [];
  }

  return data as Request[];
}
