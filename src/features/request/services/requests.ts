import { supabase } from '@lib/supabase';
import { Request } from '@models/request';

// 요청 리스트 불러오기
export async function fetchRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('id, items, reward, city, start_date, end_date, chat_link, created_at, status');

  if (error) {
    console.error('요청 불러오기 실패:', error.message);
    return [];
  }

  return data as Request[];
}

// 요청 등록하기
export async function createRequest(
  request: Omit<Request, 'id' | 'created_at'>
): Promise<Request[]> {
  const { data, error } = await supabase.from('requests').insert([request]).select();

  if (error) {
    console.error('요청 생성 실패:', error.message);
    throw error;
  }

  return data as Request[];
}
