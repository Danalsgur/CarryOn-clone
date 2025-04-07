import { useEffect, useState } from 'react'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { addDays, format } from 'date-fns'
import { DateRange, Range, RangeKeyDict } from 'react-date-range'
import { supabase } from '../lib/supabase'
import { TrashIcon } from '@heroicons/react/24/outline'

interface Item {
  name: string
  url: string
  price: string
  size: string
}

export default function NewRequest() {
  const [items, setItems] = useState<Item[]>([
    { name: '', url: '', price: '', size: '' }
  ])

  const [other, setOther] = useState({
    city: '',
    chatLink: '',
    reward: '',
    notes: '',
  })

  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 6),
      key: 'selection',
    },
  ])

  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      const user = authData.user

      if (authError || !user) {
        console.error('유저 정보 로딩 실패:', authError?.message)
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('닉네임 로딩 실패:', profileError?.message)
        return
      }

      setNickname(profile.nickname)
    }

    getUser()
  }, [])

  const addItem = () => {
    setItems([...items, { name: '', url: '', price: '', size: '' }])
  }

  const removeItem = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items]
    if (field === 'price') {
      const raw = value.replace(/,/g, '')
      const number = parseInt(raw || '0', 10)
      updated[index][field] = isNaN(number) ? '' : number.toLocaleString()
    } else {
      updated[index][field] = value
    }
    setItems(updated)
  }

  const handleOtherChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === 'reward') {
      const raw = value.replace(/,/g, '')
      const number = parseInt(raw || '0', 10)
      setOther(prev => ({ ...prev, reward: isNaN(number) ? '' : number.toLocaleString() }))
    } else {
      setOther(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleDateChange = (item: RangeKeyDict) => {
    setDateRange([item.selection])
  }

  const getTotalPrice = () =>
    items.reduce((sum, item) => {
      const raw = item.price.replace(/,/g, '')
      return sum + (parseInt(raw || '0', 10) || 0)
    }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !nickname) {
      alert('로그인 상태를 확인할 수 없습니다. 다시 시도해주세요.')
      return
    }

    const requestData = {
      buyer_id: userId,
      buyer_nickname: nickname,
      items,
      reward: other.reward.replace(/,/g, ''),
      city: other.city,
      start_date: format(dateRange[0].startDate ?? new Date(), 'yyyy-MM-dd'),
      end_date: format(dateRange[0].endDate ?? new Date(), 'yyyy-MM-dd'),
      chat_link: other.chatLink,
      notes: other.notes,
      status: '대기중',
      matched_carrier_id: null,
      carrier_nickname: null
    }

    const { data, error } = await supabase.from('requests').insert([requestData])

    if (error) {
      console.error('에러 디버깅:', error)
      alert('요청 등록에 실패했습니다: ' + error.message)
    } else {
      console.log('저장 성공:', data)
      alert('요청이 정상적으로 등록되었습니다!')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 bg-white rounded-xl shadow space-y-3 text-sm">
      <h2 className="text-2xl font-bold text-gray-800">바이어 요청 등록</h2>

      {items.map((item, index) => (
        <div key={index} className="border rounded-xl p-4 space-y-4 bg-slate-50 relative">
          <div className="font-semibold text-base">
            물품 {index + 1}
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex items-center ml-2 text-red-500 hover:text-red-600"
              >
                <TrashIcon className="h-5 w-5 relative top-[3px]" />
              </button>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">상품명</label>
            <input type="text" value={item.name}
              onChange={e => handleItemChange(index, 'name', e.target.value)}
              className="w-full border p-3 rounded" required />
          </div>

          <div>
            <label className="block font-medium mb-2">상품 링크 (선택)</label>
            <input type="url" value={item.url}
              onChange={e => handleItemChange(index, 'url', e.target.value)}
              className="w-full border p-3 rounded" />
          </div>

          <div>
            <label className="block font-medium mb-2">예상 가격 (₩)</label>
            <input type="text" value={item.price}
              onChange={e => handleItemChange(index, 'price', e.target.value)}
              className="w-full border p-3 rounded" required />
          </div>

          <div>
            <label className="block font-medium mb-2">부피/무게 추정</label>
            <select value={item.size}
              onChange={e => handleItemChange(index, 'size', e.target.value)}
              className="w-full border p-3 rounded" required>
              <option value="">선택</option>
              <option value="소형">소형 – 화장품/약</option>
              <option value="중형">중형 – 옷/신발/생활용품</option>
              <option value="대형">대형 – 가전/기타</option>
            </select>
          </div>
        </div>
      ))}

      <button type="button" onClick={addItem}
        className="w-full mt-4 text-blue-600 border border-blue-600 rounded py-3 hover:bg-blue-50">
        + 물품 추가
      </button>

      <div className="text-right font-semibold text-lg mt-4">
        배송 물품 총 가격: ₩{getTotalPrice().toLocaleString()}
      </div>

      <div>
        <label className="block font-medium mb-2 mt-6">수고비 제안 (₩)</label>
        <input type="text" name="reward" value={other.reward}
          onChange={handleOtherChange}
          className="w-full border p-3 rounded" placeholder="예: 10,000" required />
      </div>

      <div>
        <label className="block font-medium mb-2 mt-6">받고 싶은 도시</label>
        <select name="city" onChange={handleOtherChange} value={other.city} className="w-full border p-3 rounded" required>
          <option value="">선택</option>
          <option value="런던">런던 (London)</option>
          <option value="파리">파리 (Paris)</option>
          <option value="뉴욕">뉴욕 (New York)</option>
        </select>
      </div>

      <div className="mt-6">
        <label className="block font-medium mb-2">희망 도착 날짜</label>
        <p className="text-sm text-gray-500 mb-2">도착 도시 기준이며, 오늘 기준 3일 뒤부터 선택할 수 있어요</p>
        <DateRange
          editableDateInputs={true}
          onChange={handleDateChange}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          minDate={addDays(new Date(), 3)}
        />
      </div>

      <div>
        <label className="block font-medium mb-2 mt-6">1:1 카카오 오픈채팅 링크</label>
        <input type="url" name="chatLink" onChange={handleOtherChange} value={other.chatLink}
          className="w-full border p-3 rounded" required />
      </div>

      <div>
        <label className="block font-medium mb-2 mt-6">기타 참고 사항 (선택)</label>
        <textarea name="notes" onChange={handleOtherChange} value={other.notes}
          className="w-full border p-3 rounded" rows={3} />
      </div>

      <button type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
        요청 등록
      </button>
    </form>
  )
}
