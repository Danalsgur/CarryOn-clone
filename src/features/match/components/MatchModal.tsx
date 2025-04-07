import { useEffect, useState } from 'react'
import { supabase } from '@lib/supabase'

interface MatchModalProps {
  requestId: number
  onClose: () => void
}

interface CarrierRequest {
  carrier_id: string
  created_at: string
  profiles: {
    nickname: string
  }[]
}

export default function MatchModal({ requestId, onClose }: MatchModalProps) {
  const [candidates, setCandidates] = useState<CarrierRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('carrier_requests')
        .select('carrier_id, created_at, profiles(nickname)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('지원자 불러오기 실패:', error.message)
      } else {
        setCandidates(data || [])
      }
      setLoading(false)
    }

    fetchCandidates()
  }, [requestId])

  const handleConfirm = async (carrier_id: string, nickname: string | undefined) => {
    if (!nickname) return
    if (!confirm(`${nickname}님으로 확정하시겠습니까?`)) return
    const { error } = await supabase
      .from('requests')
      .update({
        matched_carrier_id: carrier_id,
        carrier_nickname: nickname,
        status: '매칭완료'
      })
      .eq('id', requestId)
    if (error) {
      alert('매칭 실패: ' + error.message)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">지원자 리스트</h2>

        {loading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-gray-500">아직 지원자가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {candidates.map((c, idx) => (
              <li key={idx} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{c.profiles[0]?.nickname}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleConfirm(c.carrier_id, c.profiles[0]?.nickname)}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  확정
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-gray-300 text-sm hover:bg-gray-400"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
