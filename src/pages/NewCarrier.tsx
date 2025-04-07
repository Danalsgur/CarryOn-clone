import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function NewCarrier() {
  const [trip, setTrip] = useState({
    from: '서울 (Seoul)', // 고정값
    to: '',
    departureDate: '',
    reservationCode: '',
  })

  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('')

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert('로그인 상태를 확인할 수 없습니다.')
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        alert('프로필 정보를 불러오는 데 실패했습니다.')
        return
      }

      setNickname(profile.nickname)
    }

    fetchUserInfo()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setTrip(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !nickname) {
      alert('유저 정보가 불완전합니다. 다시 로그인해주세요.')
      return
    }

    const payload = {
      from: trip.from,
      to: trip.to,
      departure_date: trip.departureDate,
      reservation_code: trip.reservationCode,
      carrier_id: userId,
      carrier_nickname: nickname,
    }

    const { data, error } = await supabase.from('carrier_trips').insert([payload])

    if (error) {
      console.error('여정 등록 실패:', error.message)
      alert('여정 등록에 실패했습니다. 다시 시도해주세요.')
    } else {
      console.log('저장 성공:', data)
      alert('여정이 성공적으로 등록되었습니다!')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-4 bg-white rounded-xl shadow space-y-3 text-sm"
    >
      <h2 className="text-2xl font-bold">캐리어 여정 등록</h2>

      <div>
        <label className="block font-medium mb-2">출발 도시</label>
        <input
          type="text"
          name="from"
          value={trip.from}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          disabled
        />
      </div>

      <div>
        <label className="block font-medium mb-2">도착 도시</label>
        <select
          name="to"
          value={trip.to}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        >
          <option value="">선택</option>
          <option value="런던">런던 (London)</option>
          <option value="파리">파리 (Paris)</option>
          <option value="뉴욕">뉴욕 (New York)</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-2">도착 날짜</label>
        <input
          type="date"
          name="departureDate"
          value={trip.departureDate}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-2">예약번호</label>
        <input
          type="text"
          name="reservationCode"
          value={trip.reservationCode}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="예: ABC123"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          예약한 캐리어만 알 수 있는 고유 코드입니다.<br />
          신뢰도 판단을 위한 참고 정보로 안전하게 보관되며, 외부에 공개되지 않습니다.
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
      >
        여정 등록
      </button>
    </form>
  )
}
