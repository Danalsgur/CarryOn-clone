import { useState } from "react";
import { supabase } from "@lib/supabase";
import MatchModal from "@features/match/components/MatchModal";

interface Item {
  name: string;
  size: string;
}

interface Request {
  id: number;
  city: string;
  start_date: string;
  end_date: string;
  status: string;
  carrier_nickname?: string;
  items: Item[];
  reward?: string;
}

interface RequestCardProps {
  request: Request;
  showActions?: boolean; // 액션 버튼 숨기고 싶을 때용
}

export default function RequestCard({ request, showActions = true }: RequestCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    if (!confirm("요청을 취소하시겠습니까?")) return;
    const { error } = await supabase
      .from("requests")
      .update({ status: "삭제됨" })
      .eq("id", request.id);
    if (error) alert("삭제 실패: " + error.message);
  };

  const handleCancelMatch = async () => {
    if (!confirm(`${request.carrier_nickname}님과의 매칭을 취소하시겠습니까?`)) return;
    const { error } = await supabase
      .from("requests")
      .update({
        matched_carrier_id: null,
        carrier_nickname: null,
        status: "대기중",
      })
      .eq("id", request.id);
    if (error) alert("매칭 취소 실패: " + error.message);
  };

  const formatSizeSummary = (items: Item[]) => {
    const count: Record<string, number> = {};
    for (const item of items) {
      if (!item.size) continue;
      count[item.size] = (count[item.size] || 0) + 1;
    }

    return Object.entries(count)
      .map(([size, qty]) => `${size} ${qty}개`)
      .join(", ");
  };

  return (
    <div className="border rounded-xl p-4 bg-slate-50 space-y-2 hover:bg-slate-100 transition">
      <div className="text-sm text-gray-600">
        {request.city} · {request.start_date} ~ {request.end_date}
      </div>

      <div className="text-base font-semibold">상태: {request.status}</div>

      {request.status === "매칭완료" && (
        <div className="text-sm text-gray-500">
          매칭된 캐리어: {request.carrier_nickname}
        </div>
      )}

      {request.items?.length > 0 && (
        <div className="text-gray-500 text-sm">
          부피 추정: {formatSizeSummary(request.items)}
        </div>
      )}

      {request.reward && (
        <div className="text-gray-700">수고비: ₩{Number(request.reward).toLocaleString()}</div>
      )}

      {showActions && (
        <div className="flex flex-wrap gap-2 mt-2">
          {request.status === "대기중" && (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                지원자 보기
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                요청 삭제
              </button>
            </>
          )}

          {request.status === "매칭완료" && (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                지원자 보기
              </button>
              <button
                onClick={handleCancelMatch}
                className="px-3 py-1 rounded bg-yellow-500 text-white text-sm hover:bg-yellow-600"
              >
                매칭 취소
              </button>
            </>
          )}
        </div>
      )}

      {showModal && <MatchModal requestId={request.id} onClose={() => setShowModal(false)} />}
    </div>
  );
}
