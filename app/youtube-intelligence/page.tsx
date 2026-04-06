"use client";

import { useState } from "react";
import { Youtube, Search, TrendingUp, Clock, Eye, Download, BarChart2 } from "lucide-react";

type VideoData = {
  title: string;
  views: string;
  likes: string;
  publishedAt: string;
  url: string;
};

type ReportData = {
  channelName: string;
  channelHandle: string;
  avgViews: string;
  uploadFrequency: string;
  topVideos: VideoData[];
  insights: string[];
};

export default function YouTubeIntelligencePage() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  async function analyzeChannel() {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/youtube/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze channel");
      setReport(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-6 fade-up space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Youtube size={20} className="text-accent" />
          <h1 className="text-2xl font-bold text-slate-900">YouTube Intelligence</h1>
        </div>
        <p className="text-sm text-slate-400">Analyze any YouTube channel — top videos, upload cadence, engagement signals.</p>
      </div>

      {/* Input */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <input
            value={channelUrl}
            onChange={e => setChannelUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyzeChannel()}
            placeholder="Paste channel URL — e.g. https://youtube.com/@MrBeast"
            className="input flex-1"
          />
          <button
            onClick={analyzeChannel}
            disabled={loading || !channelUrl.trim()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            <Search size={14} />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 border-t-[3px] border-t-accent h-24 shimmer" />
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-64 shimmer" />
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Channel", value: report.channelName, icon: <Youtube size={14} /> },
              { label: "Handle", value: report.channelHandle, icon: <TrendingUp size={14} /> },
              { label: "Avg Views", value: report.avgViews, icon: <Eye size={14} /> },
              { label: "Upload Freq", value: report.uploadFrequency, icon: <Clock size={14} /> },
            ].map(card => (
              <div key={card.label} className="rounded-2xl bg-white p-5 border border-slate-200 border-t-[3px] border-t-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-1.5 text-accent mb-2">{card.icon}<p className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium">{card.label}</p></div>
                <p className="text-lg font-bold text-slate-900 mono-data truncate">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Top videos */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-accent" />
                <h2 className="text-base font-semibold text-slate-900">Top Videos</h2>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                <Download size={11} />Export PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-[0.08em] text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Views</th>
                    <th className="pb-3 pr-4">Likes</th>
                    <th className="pb-3">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topVideos.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors duration-100">
                      <td className="py-3 pr-4">
                        <a href={v.url} target="_blank" rel="noreferrer" className="text-slate-900 hover:text-accent transition-colors font-medium line-clamp-1">{v.title}</a>
                      </td>
                      <td className="py-3 pr-4 text-slate-900 mono-data font-semibold">{v.views}</td>
                      <td className="py-3 pr-4 text-slate-500 mono-data">{v.likes}</td>
                      <td className="py-3 text-slate-400 text-xs mono-data">{v.publishedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          {report.insights.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-accent" />Key Insights</h2>
              <ul className="space-y-2">
                {report.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-accent mt-0.5 shrink-0">→</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!report && !loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Youtube size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Enter a YouTube channel URL above to generate a full performance report.</p>
        </div>
      )}
    </main>
  );
}
