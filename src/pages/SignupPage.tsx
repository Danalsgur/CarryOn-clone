import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [countryCode, setCountryCode] = useState('KR')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    setEmailError(isValid ? '' : '유효한 이메일 주소를 입력해주세요.')
  }

  useEffect(() => {
    const checkNickname = async () => {
      if (nickname.trim() === '') return
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', nickname)
        .maybeSingle()
      setNicknameError(existing ? '이미 사용 중인 닉네임입니다.' : '')
    }
    checkNickname()
  }, [nickname])

  useEffect(() => {
    const checkPhone = async () => {
      if (!phoneNumber) return
      const fullPhone = getFullPhoneNumber(countryCode, phoneNumber)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', fullPhone)
        .maybeSingle()
      setPhoneError(existing ? '이미 등록된 전화번호입니다.' : '')
    }
    checkPhone()
  }, [phoneNumber, countryCode])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      alert('비밀번호가 서로 다릅니다. 다시 확인해주세요.')
      return
    }

    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (emailError || nicknameError || phoneError) {
      alert('입력 정보를 다시 확인해주세요.')
      return
    }

    setLoading(true)
    const fullPhone = getFullPhoneNumber(countryCode, phoneNumber)

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      alert('회원가입 중 오류가 발생했습니다: ' + error.message)
      return
    }

    const user = signUpData?.user
    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: name,
        nickname,
        phone_number: fullPhone,
        country_code: countryCode,
      })

      setLoading(false)

      if (profileError) {
        alert('프로필 정보 저장 중 오류가 발생했습니다: ' + profileError.message)
      } else {
        alert('가입이 완료되었습니다! 이메일을 확인해 인증을 마무리해주세요.')
        navigate('/mypage')
      }
    }
  }

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      alert('구글 로그인 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const getFullPhoneNumber = (code: string, number: string) => {
    const prefixMap: Record<string, string> = {
      KR: '+82', GB: '+44', US: '+1', FR: '+33'
    }
    const cleaned = number.startsWith('0') ? number.slice(1) : number
    return prefixMap[code] + cleaned
  }

  const profileReady = name && nickname && phoneNumber && countryCode

  return (
    <form onSubmit={handleSignup} className="max-w-sm mx-auto p-4 bg-white rounded-xl shadow space-y-3 text-sm">
      <h2 className="text-xl font-bold text-center mb-3">회원가입</h2>

      <div className="flex space-x-2">
        <div className="w-5/12">
          <label className="block mb-1 font-medium">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 김민혁"
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="w-7/12">
          <label className="block mb-1 font-medium">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="최대 12자"
            maxLength={12}
            className="w-full border p-2 rounded"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            ※ 가입 후 닉네임은 변경할 수 없습니다.
          </p>
          {nicknameError && <p className="text-xs text-red-500 mt-1">{nicknameError}</p>}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">전화번호</label>
        <div className="flex space-x-2">
          <select
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            className="w-20 border p-2 rounded"
            required
          >
            <option value="KR">+82</option>
            <option value="GB">+44</option>
            <option value="US">+1</option>
            <option value="FR">+33</option>
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="예: 01012345678"
            className="flex-1 border p-2 rounded"
            required
          />
        </div>
        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
      </div>

      {profileReady && (
        <>
          <div>
            <label className="block mb-1 font-medium">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                validateEmail(e.target.value)
              }}
              placeholder="예: you@example.com"
              className="w-full border p-2 rounded"
              required
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border p-2 rounded pr-16"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="w-full border p-2 rounded pr-16"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
              >
                {showPasswordConfirm ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 disabled:opacity-50 mt-2"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <div className="text-center text-xs text-gray-500 mt-2">또는</div>

          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="구글로 로그인"
            >
              <FcGoogle className="w-7 h-7" />
            </button>
          </div>
        </>
      )}
    </form>
  )
}
