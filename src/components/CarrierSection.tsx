import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CarrierRequestCard from '../features/carrier/components/CarrierCard'

interface Request {
  id: number
  city: string
  start_date: string
  end_date: string
  status: string
  reward: string
  buyer_nickname?: string
  chat_link: string
}

interface RequestWithId {
  request_id: number
  requests: Request[]
}

interface CarrierSectionProps {
  userId: string
}

export default function CarrierSection({ userId }: CarrierSectionProps) {
  const [confirmedRequests, setConfirmedRequests] = useState<Request[]>([])
  const [appliedRequests, setAppliedRequests] = useState<Request[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // 매칭 확정된 요청 (내가 맡은 요청)
      const { data: confirmed, error: err1 } = await supabase
        .from('requests')
        .select('*')
        .eq('matched_carrier_id', userId)
        .eq('status', '매칭완료')

      // 내가 지원한 요청들
      const { data: appliedRaw, error: err2 } = await supabase
        .from('carrier_requests')
        .select('request_id, requests(*)')
        .eq('carrier_id', userId)

      const applied = (appliedRaw || [])
        .flatMap((r: RequestWithId) => r.requests)
        .filter((r) => r.status !== '삭제됨')

      if (!err1 && !err2) {
        setConfirmedRequests(confirmed || [])
        setAppliedRequests(applied || [])
      } else {
        console.error('데이터 불러오기 실패')
      }
    }

    fetchData()
  }, [userId])

  return (
    <div className="mt-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">내가 맡은 요청</h3>
        {confirmedRequests.length === 0 ? (
          <p className="text-sm text-gray-500">아직 확정된 요청이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {confirmedRequests.map(req => (
              <CarrierRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">내가 지원한 요청</h3>
        {appliedRequests.length === 0 ? (
          <p className="text-sm text-gray-500">지원한 요청이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {appliedRequests.map(req => (
              <CarrierRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
