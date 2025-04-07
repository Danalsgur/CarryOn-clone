import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

interface Item {
  name: string
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
}

export default function RequestList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filtered, setFiltered] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const [cityFilter, setCityFilter] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [sortOption, setSortOption] = useState('latest')

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('id, items, reward, city, start_date, end_date, chat_link, created_at')

      if (error) {
        console.error('요청 불러오기 실패:', error.message)
      } else {
        setRequests(data as Request[])
      }
      setLoading(false)
    }

    fetchRequests()
  }, [])

  const getSizeScore = (items: Item[]) => {
    const scoreMap: Record<string, number> = {
      소형: 1,
      중형: 3,
      대형: 6,
    }
    return items.reduce((sum, item) => sum + (scoreMap[item.size] || 0), 0)
  }

  useEffect(() => {
    let result = [...requests]

    if (cityFilter) {
      result = result.filter(req => req.city === cityFilter)
    }

    if (departureDate) {
      result = result.filter(req =>
        req.start_date <= departureDate && req.end_date >= departureDate
      )
    }

    if (sortOption === 'rewardDesc') {
      result.sort((a, b) => Number(b.reward) - Number(a.reward))
    } else if (sortOption === 'sizeAsc') {
      result.sort((a, b) => getSizeScore(a.items) - getSizeScore(b.items))
    } else if (sortOption === 'rewardThenSize') {
      result.sort((a, b) => {
        const rewardDiff = Number(b.reward) - Number(a.reward)
        if (rewardDiff !== 0) return rewardDiff
        return getSizeScore(a.items) - getSizeScore(b.items)
      })
    } else {
      result.sort((a, b) => b.id - a.id)
    }

    setFiltered(result)
  }, [requests, cityFilter, departureDate, sortOption])

  const formatSizeSummary = (items: Item[]) => {
    const count: Record<string, number> = {}
    for (const item of items) {
      if (!item.size) continue
      count[item.size] = (count[item.size] || 0) + 1
    }

    return Object.entries(count)
      .map(([size, qty]) => `${size} ${qty}개`)
      .join(', ')
  }

  return (
    <div className="max-w-2xl mx-auto p-2 space-y-6">
      {/* 상단: 문구 좌측 / 필터 우측 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-6">
        {/* 좌측 문구 */}
        <div className="text-4xl sm:text-4xl font-extrabold text-gray-700 leading-tight space-y-2">
          <p>
            Become a <span className="text-sky-600">Carrier</span>
          </p>
          <p>
            Help a <span className="text-sky-600">Buyer</span>
          </p>
          <p>Earn rewards</p>
        </div>

        {/* 우측 필터 + 정렬 */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div>
            <div className="text-sm font-semibold text-sky-700 mb-1">도착 도시 & 날짜</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="border px-2 py-1 text-sm pr-6 rounded-md appearance-none w-full sm:w-36"
              >
                <option value="">city</option>
                <option value="런던">런던</option>
                <option value="파리">파리</option>
                <option value="뉴욕">뉴욕</option>
              </select>

              <input
                type="date"
                value={departureDate}
                onChange={e => setDepartureDate(e.target.value)}
                className="border px-2 py-1 text-sm rounded-md w-full sm:w-36"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-sky-700 mb-1">정렬 기준</div>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="border px-2 py-1 text-sm pr-6 rounded-md appearance-none w-full sm:w-36"
            >
              <option value="latest">최신순</option>
              <option value="rewardDesc">수고비 높은순</option>
              <option value="sizeAsc">부피/무게 적은순</option>
              <option value="rewardThenSize">가성비 좋은 순 (보상↑ 부피↓)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 요청 카드 리스트 */}
      {loading ? (
        <p className="text-center text-gray-500 mt-8">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">요청이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          {filtered.map(req => (
            <Link
              to={`/requests/${req.id}`}
              key={req.id}
              className="border rounded-xl p-4 bg-white shadow space-y-2 hover:bg-gray-50"
            >
              <div className="text-sm text-gray-600">
                {req.city} · {req.start_date} ~ {req.end_date}
              </div>

              <div className="text-lg font-semibold">
                {req.items.length === 1
                  ? req.items[0]?.name
                  : `${req.items[0]?.name} 외 ${req.items.length - 1}개`}
              </div>

              <div className="text-gray-700">
                수고비: ₩{Number(req.reward).toLocaleString()}
              </div>

              <div className="text-gray-500 text-sm">
                부피 추정: {formatSizeSummary(req.items)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
