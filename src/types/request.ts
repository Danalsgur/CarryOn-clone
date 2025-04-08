export interface Request {
  id: string;
  buyer_id: string;
  buyer_nickname: string;
  items: {
    name: string;
    url: string;
    price: string;
    size: string;
  }[];
  reward: string;
  city: string;
  start_date: string;
  end_date: string;
  chat_link: string;
  notes?: string;
  status: "대기중" | "매칭완료" | "삭제됨";
  created_at: string;
}
