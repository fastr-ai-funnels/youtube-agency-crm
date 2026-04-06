import { NextRequest, NextResponse } from "next/server";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function extractChannelId(url: string): { type: string; value: string } | null {
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const path = u.pathname;
    if (path.startsWith("/@")) return { type: "handle", value: path.slice(2).split("/")[0] };
    if (path.startsWith("/channel/")) return { type: "channel", value: path.split("/")[2] };
    if (path.startsWith("/user/")) return { type: "user", value: path.split("/")[2] };
    if (path.startsWith("/c/")) return { type: "handle", value: path.split("/")[2] };
    const seg = path.split("/").filter(Boolean).pop();
    if (seg) return { type: "handle", value: seg };
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { channelUrl } = await req.json();
    if (!channelUrl) return NextResponse.json({ error: "channelUrl required" }, { status: 400 });

    const parsed = extractChannelId(channelUrl);
    if (!parsed) return NextResponse.json({ error: "Could not parse channel URL" }, { status: 400 });

    let channelId = parsed.type === "channel" ? parsed.value : null;
    let channelName = parsed.value;
    let channelHandle = parsed.value;

    // Fetch channel page to extract channel ID + name
    const pageUrl = channelUrl.startsWith("http") ? channelUrl : "https://www.youtube.com/" + channelUrl;
    try {
      const pageRes = await fetch(pageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const html = await pageRes.text();
      const channelIdMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/);
      if (channelIdMatch) channelId = channelIdMatch[1];
      const nameMatch = html.match(/"author":"([^"]+)"/) || html.match(/<meta name="title" content="([^"]+)"/);
      if (nameMatch) channelName = nameMatch[1];
      const handleMatch = html.match(/"canonicalChannelUrl":"https:\/\/www\.youtube\.com\/@([^"]+)"/);
      if (handleMatch) channelHandle = handleMatch[1];
    } catch {
      // continue with defaults
    }

    let videos: { title: string; views: string; likes: string; publishedAt: string; url: string }[] = [];
    let uploadFrequency = "Unknown";

    if (channelId) {
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const rssRes = await fetch(rssUrl);
        const rssText = await rssRes.text();
        const entries = rssText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

        videos = entries.slice(0, 10).map(entry => {
          const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] || "Unknown";
          const videoId = entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/)?.[1] || "";
          const published = entry.match(/<published>([^<]*)<\/published>/)?.[1] || "";
          const viewCount = entry.match(/<media:statistics views="(\d+)"/)?.[1] || "0";
          const likeCount = entry.match(/yt:likeCount>(\d+)</)?.[1] || "0";
          const channelFromRSS = entry.match(/<name>([^<]*)<\/name>/)?.[1];
          if (channelFromRSS && channelName === parsed.value) channelName = channelFromRSS;
          const pubStr = published ? new Date(published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
          return {
            title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
            views: fmtNum(parseInt(viewCount)),
            likes: fmtNum(parseInt(likeCount)),
            publishedAt: pubStr,
            url: `https://www.youtube.com/watch?v=${videoId}`,
          };
        });

        // Upload frequency from date intervals
        if (entries.length >= 2) {
          const dates = entries.slice(0, 5).map(e => {
            const pub = e.match(/<published>([^<]*)<\/published>/)?.[1];
            return pub ? new Date(pub).getTime() : 0;
          }).filter(d => d > 0);
          if (dates.length >= 2) {
            const intervals: number[] = [];
            for (let i = 0; i < dates.length - 1; i++) intervals.push(Math.abs(dates[i] - dates[i + 1]) / 86400000);
            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            if (avg < 2) uploadFrequency = "Daily";
            else if (avg < 5) uploadFrequency = `${Math.round(avg)}x/week`;
            else if (avg < 10) uploadFrequency = "Weekly";
            else if (avg < 20) uploadFrequency = "Bi-weekly";
            else uploadFrequency = "Monthly+";
          }
        }
      } catch {
        // RSS failed
      }
    }

    const viewNums = videos.map(v => {
      const s = v.views;
      if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
      if (s.endsWith("K")) return parseFloat(s) * 1_000;
      return parseInt(s) || 0;
    });
    const avgViews = viewNums.length > 0 ? fmtNum(Math.round(viewNums.reduce((a, b) => a + b, 0) / viewNums.length)) : "—";

    const insights: string[] = [];
    if (uploadFrequency !== "Unknown") insights.push(`Uploads ${uploadFrequency.toLowerCase()} — consistent cadence drives algorithmic growth.`);
    if (videos.length > 0) insights.push(`Top video: "${videos[0].title}" — ${videos[0].views} views.`);
    if (avgViews !== "—") insights.push(`Average view count across recent uploads: ${avgViews}.`);
    insights.push("Strong hooks in first 30 seconds and thumbnail A/B testing are the highest-leverage improvements.");
    insights.push("Shorts content drives subscriber growth; long-form (8-15 min) drives watch time and ad revenue.");

    return NextResponse.json({
      channelName: channelName || parsed.value,
      channelHandle: "@" + channelHandle,
      avgViews,
      uploadFrequency,
      topVideos: videos,
      insights,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}
