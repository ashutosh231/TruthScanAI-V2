"use client";

import React, { useState, useEffect } from "react";
import { getNews } from "@/lib/api";
import NewsCard from "@/components/NewsCard";
import { NewsSkeletonGrid } from "@/components/LoadingState";
import FactCheckModal from "@/components/FactCheckModal";
import Button from "@/components/Button";
import ErrorState from "@/components/ErrorState";
import { Newspaper, Search, RefreshCw, Radio } from "lucide-react";

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalArticle, setActiveModalArticle] = useState(null);

  const categories = [
    { id: "all", label: "ALL" },
    { id: "Technology", label: "TECH" },
    { id: "Science", label: "SCIENCE" },
    { id: "Politics", label: "POLITICS" },
    { id: "Health", label: "HEALTH" },
    { id: "Climate", label: "CLIMATE" },
  ];

  const fetchNews = async (cat = selectedCategory, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getNews(cat);
      if (res && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load news wire feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const filteredArticles = articles.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = (item.headline || item.title || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const src = (typeof item.source === "string" ? item.source : item.source?.name || "").toLowerCase();
    return title.includes(query) || desc.includes(query) || src.includes(query);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF3C] border border-[#111111] animate-ping" />
          <span>INDEPENDENT WIRE DISPATCHES</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
              LATEST NEWS WIRE
            </h1>
            <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl mt-1">
              Global intelligence feed continuously parsed for factual divergence. Verify any dispatch in real-time.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(selectedCategory, true)}
            loading={refreshing}
            icon={RefreshCw}
          >
            REFRESH WIRE
          </Button>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const active = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 font-mono-tech text-xs uppercase font-bold border-2 border-[#111111] cursor-pointer whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#111111] text-[#B7FF3C] shadow-hard-xs"
                    : "bg-white text-[#111111] hover:bg-[#E8E2D5]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search headline or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 font-mono-tech text-xs bg-white border-2 border-[#111111] focus:outline-none focus:bg-[#F5F1E8]"
          />
          <Search className="w-4 h-4 text-[#111111] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Content Area */}
      {loading || refreshing ? (
        <NewsSkeletonGrid count={6} />
      ) : error ? (
        <ErrorState
          title="FAILED TO RETRIEVE WIRE"
          message={error}
          onRetry={() => fetchNews(selectedCategory)}
        />
      ) : filteredArticles.length === 0 ? (
        <div className="border-2 border-[#111111] bg-white p-12 text-center shadow-hard space-y-3">
          <p className="font-display text-xl uppercase text-[#111111]">
            NO WIRE BULLETINS FOUND
          </p>
          <p className="font-mono-tech text-xs text-[#111111]/70">
            No matching news found for &ldquo;{searchQuery}&rdquo;. Try a different keyword or reset filters.
          </p>
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            CLEAR SEARCH & FILTERS
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onFactCheck={(art) => setActiveModalArticle(art)}
            />
          ))}
        </div>
      )}

      {/* Fact Check Modal */}
      <FactCheckModal
        isOpen={!!activeModalArticle}
        article={activeModalArticle}
        onClose={() => setActiveModalArticle(null)}
      />
    </div>
  );
}
