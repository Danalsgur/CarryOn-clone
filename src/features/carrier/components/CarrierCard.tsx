interface CarrierRequestCardProps {
    request: {
      id: number
      city: string
      start_date: string
      end_date: string
      status: string
      reward: string
      buyer_nickname?: string
      chat_link: string
    }
  }
  
  export default function CarrierRequestCard({ request }: CarrierRequestCardProps) {
    return (
      <div className="border rounded-xl p-4 bg-slate-50 space-y-2">
        <div className="text-sm text-gray-600">
          {request.city} · {request.start_date} ~ {request.end_date}
        </div>
  
        <div className="text-base font-semibold">
          상태: {request.status}
        </div>
  
        {request.buyer_nickname && (
          <div className="text-sm text-gray-500">
            바이어: {request.buyer_nickname}
          </div>
        )}
  
        <div>
          <span className="font-semibold">수고비:</span>{' '}
          ₩{Number(request.reward).toLocaleString()}
        </div>
  
        <a
          href={request.chat_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          카카오톡 오픈채팅 참여
        </a>
      </div>
    )
  }
  
