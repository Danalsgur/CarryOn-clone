import { Routes, Route, Link } from 'react-router-dom'
import NewRequest from './pages/NewRequest'
import RequestList from './pages/RequestList'
import RequestDetail from './pages/RequestDetail'
import NewCarrier from './pages/NewCarrier'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import MyPage from './pages/MyPage'
import { useUser } from './lib/useUser'
import { HomeIcon } from '@heroicons/react/24/outline'


function App() {
  const { user, loading } = useUser()

  return (
    <>
      <div className="p-1">
        {/* 상단 네비게이션 */}
        <nav className="flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm mb-6">
          <Link to="/" className="text-3xl font-extrabold text-sky-600 hover:opacity-80 transition">
            CarryOn
          </Link>
          <div className="space-x-3 flex items-center">
            <Link
              to="/"
              className="p-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 inline-flex items-center justify-center"
            >
              <HomeIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/request/new"
              className="px-4 py-2 rounded bg-sky-600 text-white text-base font-medium hover:bg-sky-700"
            >
              바이어 등록
            </Link>
            <Link
              to="/carrier/new"
              className="px-4 py-2 rounded bg-sky-600 text-white text-base font-medium hover:bg-sky-700"
            >
              캐리어 등록
            </Link>

            {!loading && (
              user ? (
                <Link
                  to="/mypage"
                  className="px-4 py-2 rounded bg-gray-800 text-white text-base font-medium hover:bg-gray-900"
                >
                  마이페이지
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded bg-gray-300 text-black text-base font-medium hover:bg-gray-400">
                    로그인
                  </Link>
                </>
              )
            )}
          </div>
        </nav>

        {/* 페이지 라우팅 */}
        <Routes>
          <Route path="/" element={<RequestList />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/request/new" element={<NewRequest />} />
          <Route path="/carrier/new" element={<NewCarrier />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </>
  )
}
export default App