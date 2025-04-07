import { useEffect, useState } from 'react'
import { useUser } from '../lib/useUser'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import BuyerSection from '../components/BuyerSection'
import CarrierSection from '../components/CarrierSection'

export default function MyPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{ nickname: string | null }>({ nickname: null })
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'buyer' | 'carrier'>('buyer')

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('프로필 로딩 에러:', error.message)
        } else {
          setProfile({ nickname: data.nickname })
        }
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (profileLoading) return <p className="text-center mt-8">로딩 중...</p>
  if (!user) return <p className="text-center mt-8">로그인이 필요합니다.</p>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h2 className="text-2xl font-bold">마이페이지</h2>

      <div className="text-sm text-gray-600">
        <p><strong>이메일:</strong> {user.email}</p>
        <p><strong>닉네임:</strong> {profile.nickname || '닉네임 없음'}</p>
      </div>

      {/* 탭 선택 */}
      <div className="flex space-x-2 mt-6">
        <button
          onClick={() => setActiveTab('buyer')}
          className={`px-4 py-2 rounded ${
            activeTab === 'buyer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          바이어</button>

        <button
          onClick={() => setActiveTab('carrier')}
          className={`px-4 py-2 rounded ${
            activeTab === 'carrier' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          캐리어</button>
      </div>

      {/* 역할별 내용 분기 */}
      {activeTab === 'buyer' ? (
        <BuyerSection userId={user.id} />
      ) : (
        <CarrierSection userId={user.id} />
      )}

      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    </div>
  )
}
