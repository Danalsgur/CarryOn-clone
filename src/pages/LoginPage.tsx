import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      toast.error('로그인 실패: ' + error.message)
    } else {
      toast.success('로그인되었습니다!')
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <form onSubmit={handleLogin} 
    className="max-w-sm mx-auto p-4 bg-white rounded-xl shadow space-y-3 text-sm">
      
      <h2 className="text-2xl font-bold text-center">로그인</h2>

      <div>
        <label className="block mb-1 font-medium">이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">비밀번호</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-3 rounded pr-24"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '숨기기' : '보기'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white py-3 rounded hover:bg-sky-700 disabled:opacity-50"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <div className="text-center text-sm text-gray-500">or</div>

      <div className="flex justify-center mt-6">
      <button
       onClick={handleGoogleLogin}
       className="p-2 rounded-full hover:bg-gray-100 transition"
       title="Google로 로그인"
      >
      <FcGoogle className="w-8 h-8" />
      </button>
      </div>
      <div className="text-center text-sm text-gray-600">
  계정이 없으신가요?{' '}
  <Link to="/signup" className="text-blue-600 hover:underline">
    회원가입
  </Link>
</div>
    </form>
  )
}
