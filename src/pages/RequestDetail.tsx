import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Item {
  name: string
  url?: string
  price?: string
  size: string
}

interface Request {
  id: number
  items: Item[]
  reward: string
  city: string
  start_date: string
  end_date: string
  chat_link: string
  notes?: string
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<Request | null>(null)
  const [canAccept, setCanAccept] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('요청 불러오기 실패:', error.message)
      } else {
        setRequest(data as Request)
      }

      setLoading(false)
    }

    fetchRequest()
  }, [id])

  useEffect(() => {
    const checkUserAndEligibility = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user || !request) return

      setUserId(user.id)

      // 여정 확인
      const { data: trips } = await supabase
        .from('carrier_trips')
        .select('*')
        .eq('carrier_id', user.id)

      const match = trips?.some(trip =>
        trip.to === request.city &&
        trip.departure_date >= request.start_date &&
        trip.departure_date <= request.end_date
      ) || false

      setCanAccept(match)

      // 이미 지원했는지 확인
      const { data: existing } = await supabase
        .from('carrier_requests')
        .select('id')
        .eq('carrier_id', user.id)
        .eq('request_id', request.id)
        .single()

      if (existing) {
        setShowChat(true)
      }
    }

    checkUserAndEligibility()
  }, [request])

  const handleAccept = async () => {
    if (!userId || !request) return
  
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()
  
    if (profileError) {
      console.error('닉네임 가져오기 실패:', profileError.message)
      alert('닉네임 확인 중 오류가 발생했습니다.')
      return
    }
  
    const nickname = profile?.nickname || ''
  
    const { error } = await supabase.from('carrier_requests').insert([
      {
        carrier_id: userId,
        request_id: request.id,
        carrier_nickname: nickname,
      }
    ])
  
    if (!error) {
      setShowChat(true)
    } else {
      console.error('지원 실패:', error.message)
      alert('지원에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">불러오는 중...</p>
  }

  if (!request) {
    return <p className="text-center text-red-500 mt-8">요청을 찾을 수 없습니다.</p>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          ← 뒤로가기
        </button>
      </div>

      <h2 className="text-2xl font-bold">요청 상세</h2>

      <div className="text-sm text-gray-600">
        {request.city} · {request.start_date} ~ {request.end_date}
      </div>

      <div className="font-semibold">요청한 물품</div>
      <ul className="list-disc list-inside space-y-1">
        {request.items.map((item, idx) => (
          <li key={idx}>
            {item.name}
            {item.size && ` (${item.size})`}
            {item.price && ` – ₩${item.price}`}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 ml-2 underline"
              >
                물품 Link
              </a>
            )}
          </li>
        ))}
      </ul>

      <div>
        <span className="font-semibold">수고비:</span>{' '}
        ₩{Number(request.reward).toLocaleString()}
      </div>

      {request.notes && (
        <div>
          <span className="font-semibold">참고사항:</span> {request.notes}
        </div>
      )}

      {/* 지원 버튼 */}
      {canAccept ? (
        <>
          <button
            onClick={handleAccept}
            disabled={showChat}
            className={`mt-4 px-4 py-2 rounded transition text-white ${
              showChat
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            이 요청에 지원하기
          </button>

          {/* 안내 문구: 높이 고정 */}
          <p className="text-sm text-gray-500 mt-1 min-h-[20px]">
            {showChat ? '지원 완료! 바이어에게 오픈채팅으로 연락해보세요.' : ''}
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500">
           바이어의 요청과 일치하는 여정이 없거나, 아직 등록하지 않으셨습니다.
  <br />
  먼저 캐리어 여정을 등록해보세요.
        </p>
      )}

      {/* 오픈채팅 버튼: 위치 고정 */}
      <a
        href={request.chat_link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block mt-4 px-4 py-2 rounded text-white transition ${
          showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
        onClick={e => {
          if (!showChat) e.preventDefault()
        }}
      >
        카카오톡 오픈채팅 참여
      </a>
    </div>
  )
}
