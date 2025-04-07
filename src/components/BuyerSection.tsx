import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BuyerRequestCard from './BuyerRequestCard'

interface Request {
  id: number
  city: string
  start_date: string
  end_date: string
  status: string
  matched_carrier_id?: string
  carrier_nickname?: string
}

interface BuyerSectionProps {
  userId: string
}

export default function BuyerSection({ userId }: BuyerSectionProps) {
  const [requests, setRequests] = useState<Request[]>([])
  const [statusFilter, setStatusFilter] = useState<'대기중' | '매칭완료'>('대기중')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('buyer_id', userId)
        .neq('status', '삭제됨')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('요청 목록 불러오기 실패:', error.message)
      } else {
        setRequests(data || [])
      }
      setLoading(false)
    }

    fetchRequests()
  }, [userId])

  const filtered = requests.filter(r => r.status === statusFilter)

  return (
    <div className="mt-4">
      {/* 상태 필터 */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setStatusFilter('대기중')}
          className={`px-4 py-2 rounded ${
            statusFilter === '대기중' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >대기중</button>

        <button
          onClick={() => setStatusFilter('매칭완료')}
          className={`px-4 py-2 rounded ${
            statusFilter === '매칭완료' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >매칭 완료</button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">표시할 요청이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <BuyerRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
