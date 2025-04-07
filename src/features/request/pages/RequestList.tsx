import { useState } from "react";
import { useRequests } from "../hooks/useRequests";
import RequestCard from "../components/RequestCard";

// 정렬 옵션 타입 명시
type SortOption = "latest" | "rewardDesc" | "sizeAsc" | "rewardThenSize";

export default function RequestList() {
  const [cityFilter, setCityFilter] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  const { filtered, loading } = useRequests(cityFilter, departureDate, sortOption);

  return (
    <div className="max-w-2xl mx-auto p-2 space-y-6">
      {/* 필터 UI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-6">
        <div className="text-4xl font-extrabold text-gray-700 leading-tight space-y-2">
          <p>
            Become a <span className="text-sky-600">Carrier</span>
          </p>
          <p>
            Help a <span className="text-sky-600">Buyer</span>
          </p>
          <p>Earn rewards</p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div>
            <div className="text-sm font-semibold text-sky-700 mb-1">도착 도시 & 날짜</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="border px-2 py-1 text-sm pr-6 rounded-md appearance-none w-full sm:w-36"
              >
                <option value="">전체</option>
                <option value="런던">런던</option>
                <option value="파리">파리</option>
                <option value="뉴욕">뉴욕</option>
              </select>

              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="border px-2 py-1 text-sm rounded-md w-full sm:w-36"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-sky-700 mb-1">정렬 기준</div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
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

      {/* 요청 리스트 */}
      {loading ? (
        <p className="text-center text-gray-500 mt-8">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">요청이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          {filtered.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
