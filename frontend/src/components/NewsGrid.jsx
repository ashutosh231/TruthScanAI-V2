"use client";

import React, { useState, useEffect } from "react";
import { getNews } from "@/lib/api";
import NewsCard from "./NewsCard";
import { NewsSkeletonGrid } from "./LoadingState";
import FactCheckModal from "./FactCheckModal";
import Button from "./Button";
import ErrorState from "./ErrorState";
import { RefreshCw, Radio } from "lucide-react";

export default function NewsGrid({ initialCategory = "all", showTitle = true, limit = 6 }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeModalArticle, setActiveModalArticle] = useState(null);

  const categories = [
    { id: "all", label: "ALL BULLETINS" },
    { id: "Technology", label: "TECHNOLOGY" },
    { id: "Science", label: "SCIENCE" },
    { id: "Politics", label: "POLITICS" },
    { id: "Health", label: "HEALTH" },
    { id: "Climate", label: "CLIMATE" },
  ];

  const fetchArticles = async (cat = selectedCategory, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getNews(cat);
      if (res && res.data) {
        setNews(limit ? res.data.slice(0, limit) : res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load latest wire articles.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  const handleRefresh = () => {
    fetchArticles(selectedCategory, true);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-[#111111]">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#111111]/70 mb-1">
              <Radio className="w-3.5 h-3.5 text-[#B7FF3C] fill-[#111111]" />
              <span>LIVE INTEL FEED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tighter text-[#111111]">
              LATEST NEWS
            </h2>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 mt-1">
              Stay informed. Verify before you believe.
            </p>
          </div>

          {/* Action: Refresh News */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              icon={RefreshCw}
            >
              REFRESH NEWS
            </Button>
          </div>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 font-mono-tech text-xs uppercase font-bold border-2 border-[#111111] transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#111111] text-[#B7FF3C] shadow-hard-xs translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-[#111111] hover:bg-[#E8E2D5]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Content State: Skeleton vs Error vs Cards */}
      {loading || refreshing ? (
        <NewsSkeletonGrid count={limit || 6} />
      ) : error ? (
        <ErrorState
          title="FAILED TO RETRIEVE NEWS"
          message={error}
          onRetry={() => fetchArticles(selectedCategory)}
        />
      ) : news.length === 0 ? (
        <div className="border-2 border-[#111111] bg-white p-12 text-center shadow-hard space-y-3">
          <p className="font-display text-xl uppercase text-[#111111]">
            NO BULLETINS AVAILABLE IN THIS CATEGORY
          </p>
          <p className="font-mono-tech text-xs text-[#111111]/70">
            Switch categories or refresh the wire feed to monitor incoming claims.
          </p>
          <Button variant="accent" size="sm" onClick={() => setSelectedCategory("all")}>
            RESET TO ALL
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              article={item}
              onFactCheck={(art) => setActiveModalArticle(art)}
            />
          ))}
        </div>
      )}

      {/* Fact Check Modal Overlay */}
      <FactCheckModal
        isOpen={!!activeModalArticle}
        article={activeModalArticle}
        onClose={() => setActiveModalArticle(null)}
      />
    </div>
  );
}
