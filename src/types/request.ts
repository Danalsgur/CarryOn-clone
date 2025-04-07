export interface Item {
    name: string;
    size: string;
  }
  
  export interface Request {
    id: number;
    city: string;
    start_date: string;
    end_date: string;
    status: string;
    carrier_nickname?: string;
    items: Item[];
    reward?: string;
    chat_link?: string;
  }

