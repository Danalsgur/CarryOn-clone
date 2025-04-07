// features/request/hooks/useRequests.ts
import { useEffect, useState } from "react";
import { fetchRequests } from "../services/requests";
import { Request } from "@models/request";

type SortOption = "latest" | "rewardDesc" | "sizeAsc" | "rewardThenSize";

interface Item {
  name: string;
  size: string;
}

export function useRequests(cityFilter: string, departureDate: string, sortOption: SortOption) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filtered, setFiltered] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchRequests();
      setRequests(data);
      setLoading(false);
    };
    load();
  }, []);

  const getSizeScore = (items: Item[]) => {
    const scoreMap: Record<string, number> = { 소형: 1, 중형: 3, 대형: 6 };
    return items.reduce((sum, item) => sum + (scoreMap[item.size] || 0), 0);
  };

  useEffect(() => {
    let result = [...requests];

    if (cityFilter) {
      result = result.filter(req => req.city === cityFilter);
    }

    if (departureDate) {
      result = result.filter(req =>
        req.start_date <= departureDate && req.end_date >= departureDate
      );
    }

    if (sortOption === "rewardDesc") {
      result.sort((a, b) => Number(b.reward) - Number(a.reward));
    } else if (sortOption === "sizeAsc") {
      result.sort((a, b) => getSizeScore(a.items) - getSizeScore(b.items));
    } else if (sortOption === "rewardThenSize") {
      result.sort((a, b) => {
        const rewardDiff = Number(b.reward) - Number(a.reward);
        return rewardDiff !== 0
          ? rewardDiff
          : getSizeScore(a.items) - getSizeScore(b.items);
      });
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    setFiltered(result);
  }, [requests, cityFilter, departureDate, sortOption]);

  return { requests, filtered, loading };
}
