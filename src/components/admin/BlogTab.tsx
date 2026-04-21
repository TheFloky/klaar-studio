import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Loader2, FileText, Image as ImageIcon, CheckCircle2, AlertTriangle,
  XCircle, Trash2, Eye, Send, Languages, Search, Wand2, RefreshCw,
} from "lucide-react";

type Lang = "de" | "fr" | "en";

interface BlogVersion {
  title: string;
  seo_title: string;
  seo_description: string;
  excerpt: string;
  content_md: string;
}

interface GenerationResult {
  slug: string;
  tags: string[];
  stock_image_query: string;
  reading_time_min: number;
  external_links: { url: string; label: string; context: string }[];
  versions: Record<Lang, BlogVersion>;
}

interface FactCheck {
  confidence_score: number;
  approved: boolean;
  summary: string;
  issues: { severity: "info" | "warn" | "critical"; category: string; message: string; suggestion?: string }[];
}

interface CoverOption {
  url: string;
  thumb?: string;
  attribution?: string;
  attribution_url?: string;
  source: "pexels" | "ai";
  alt?: string;
}

interface BlogPostRow {
  id: string;
  translation_group_id: string;
  lang: Lang;
  slug: string;
  title: string;
  status: string;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const LANG_LABELS: Record<Lang, string> = { de: "Deutsch", fr: "Français", en: "English" };

export default function BlogTab() {
  // Wizard state
  const [step, setStep] = useState<"input" | "review" | "publish">("input");
  const [sourceText, setSourceText] = useState("");
  const [topic, setTopic] = useState("");
  const [sourceLang, setSourceLang] = useState<Lang>("de");
  const [generating, setGenerating] = useState(false);
  const [factChecking, setFactChecking] = useState(false);
  const [findingCover, setFindingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated content
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("de");
  const [factChecks, setFactChecks] = useState<Record<Lang, FactCheck | null>>({ de: null, fr: null, en: null });
  const [coverOptions, setCoverOptions] = useState<CoverOption[]>([]);
  const [aiCover, setAiCover] = useState<CoverOption | null>(null);
  const [selectedCover, setSelectedCover] = useState<CoverOption | null>(null);
  const [imageQueryOverride, setImageQueryOverride] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Existing posts list
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoadingPosts(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id, translation_group_id, lang, slug, title, status, cover_image_url, published_at, created_at")
      .order("created_at", { ascending: false });
    setPosts((data as BlogPostRow[]) || []);
    setLoadingPosts(false);
  }

  async function handleGenerate() {
    if (sourceText.trim().length < 30) {
      setError("Please provide at least 30 characters of source material.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("generate-blog-post", {
        body: { sourceText, topic, sourceLang },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as GenerationResult);
      setActiveLang(sourceLang);
      setImageQueryOverride(data.stock_image_query);
      setStep("review");
      // Auto-trigger fact-check + cover search in parallel
      await Promise.all([
        runFactCheck(data, sourceLang),
        findCovers(data.stock_image_query),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function runFactCheck(r: GenerationResult, lang: Lang) {
    setFactChecking(true);
    try {
      const v = r.versions[lang];
      const { data, error: fnErr } = await supabase.functions.invoke("fact-check-blog-post", {
        body: { title: v.title, content_md: v.content_md, lang, external_links: r.external_links },
      });
      if (fnErr) throw new Error(fnErr.message);
      setFactChecks((prev) => ({ ...prev, [lang]: data as FactCheck }));
    } catch (e) {
      console.error("fact check failed:", e);
    } finally {
      setFactChecking(false);
    }
  }

  async function findCovers(query: string) {
    setFindingCover(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("find-blog-cover", {
        body: { query, fallbackToAi: false },
      });
      if (fnErr) throw new Error(fnErr.message);
      setCoverOptions(data?.stock || []);
      setAiCover(data?.ai || null);
      if (data?.stock?.[0]) setSelectedCover(data.stock[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setFindingCover(false);
    }
  }

  async function generateAiCover() {
    setFindingCover(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("find-blog-cover", {
        body: { query: imageQueryOverride || result?.stock_image_query, fallbackToAi: true },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.ai) {
        setAiCover(data.ai);
        setSelectedCover(data.ai);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFindingCover(false);
    }
  }

  function updateVersion(lang: Lang, field: keyof BlogVersion, value: string) {
    if (!result) return;
    setResult({
      ...result,
      versions: { ...result.versions, [lang]: { ...result.versions[lang], [field]: value } },
    });
  }

  async function uploadCoverToStorage(): Promise<string | null> {
    if (!selectedCover || !result) return null;
    try {
      const resp = await fetch(selectedCover.url);
      const blob = await resp.blob();
      const ext = selectedCover.source === "ai" ? "png" : "jpg";
      const path = `${result.slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("blog-images").upload(path, blob, {
        contentType: blob.type || `image/${ext}`,
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      console.error("cover upload failed:", e);
      return null;
    }
  }

  async function handlePublish(publishNow: boolean) {
    if (!result) return;
    setPublishing(true);
    setError(null);
    try {
      const coverUrl = await uploadCoverToStorage();
      const groupId = crypto.randomUUID();
      const now = new Date().toISOString();
      const rows = (Object.keys(result.versions) as Lang[]).map((lang) => ({
        translation_group_id: groupId,
        lang,
        slug: result.slug,
        title: result.versions[lang].title,
        excerpt: result.versions[lang].excerpt,
        content_md: result.versions[lang].content_md,
        seo_title: result.versions[lang].seo_title,
        seo_description: result.versions[lang].seo_description,
        cover_image_url: coverUrl,
        cover_source: selectedCover?.source || null,
        cover_attribution: selectedCover?.attribution || null,
        tags: result.tags,
        external_links: result.external_links,
        reading_time_min: result.reading_time_min,
        status: publishNow ? "published" : "draft_reviewed",
        fact_check_notes: factChecks[lang] || {},
        source_input: sourceText,
        published_at: publishNow ? now : null,
      }));
      const { error: insErr } = await supabase.from("blog_posts").insert(rows);
      if (insErr) throw insErr;
      // Reset wizard
      setStep("input");
      setSourceText("");
      setTopic("");
      setResult(null);
      setFactChecks({ de: null, fr: null, en: null });
      setCoverOptions([]);
      setAiCover(null);
      setSelectedCover(null);
      await fetchPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function deletePostGroup(groupId: string) {
    if (!confirm("Delete all 3 language versions of this post?")) return;
    await supabase.from("blog_posts").delete().eq("translation_group_id", groupId);
    await fetchPosts();
  }

  async function togglePublish(post: BlogPostRow) {
    const newStatus = post.status === "published" ? "draft_reviewed" : "published";
    await supabase.from("blog_posts").update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    }).eq("translation_group_id", post.translation_group_id);
    await fetchPosts();
  }

  // Group posts by translation_group_id for the list
  const groupedPosts = posts.reduce((acc, p) => {
    if (!acc[p.translation_group_id]) acc[p.translation_group_id] = [];
    acc[p.translation_group_id].push(p);
    return acc;
  }, {} as Record<string, BlogPostRow[]>);

  return (
    <div className="space-y-8">
      {step === "input" && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-[#FF0000]" />
              <h2 className="text-base font-bold text-gray-900">Create New Blog Post</h2>
            </div>
            <p className="text-sm text-gray-500">
              Paste your raw notes, ideas, or a draft. AI writes a publication-ready post in DE, FR & EN, fact-checks itself, and finds a cover image.
            </p>

            <div className="grid sm:grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Topic / Working Title (optional)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How to build a Swiss-compliant website"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Source Language</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value as Lang)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                >
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Source Material</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={10}
                placeholder="Paste your notes, bullet points, key facts, or a rough draft. The more detail, the better the result. The AI will turn this into a polished, SEO-optimized blog post."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] bg-gray-50 font-mono"
              />
              <p className="mt-1 text-xs text-gray-400">{sourceText.length} characters · min 30</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={generating || sourceText.trim().length < 30}
              className="w-full sm:w-auto px-6 py-3 bg-[#FF0000] text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {generating ? <><Loader2 size={16} className="animate-spin" /> Writing in DE / FR / EN…</> : <><Wand2 size={16} /> Generate Blog Post</>}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Existing Posts</h2>
              <button onClick={fetchPosts} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {loadingPosts ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : Object.keys(groupedPosts).length === 0 ? (
              <p className="text-sm text-gray-400">No posts yet. Create your first one above.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(groupedPosts).map(([gid, versions]) => {
                  const dePost = versions.find((v) => v.lang === "de") || versions[0];
                  return (
                    <div key={gid} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      {dePost.cover_image_url ? (
                        <img src={dePost.cover_image_url} alt="" className="w-14 h-14 rounded object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center">
                          <FileText size={18} className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{dePost.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[10px] text-gray-400">/{dePost.slug}</code>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-500">{versions.map((v) => v.lang.toUpperCase()).join(" / ")}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            dePost.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {dePost.status === "published" ? "Live" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {dePost.status === "published" && (
                          <a
                            href={`/de/blog/${dePost.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            title="View"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => togglePublish(dePost)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title={dePost.status === "published" ? "Unpublish" : "Publish"}
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => deletePostGroup(gid)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {step === "review" && result && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex gap-1">
                {(["de", "fr", "en"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setActiveLang(l);
                      if (!factChecks[l]) runFactCheck(result, l);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      activeLang === l ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Languages size={12} /> {LANG_LABELS[l]}
                    {factChecks[l] && (
                      factChecks[l]!.approved
                        ? <CheckCircle2 size={12} className={activeLang === l ? "text-green-300" : "text-green-600"} />
                        : <AlertTriangle size={12} className={activeLang === l ? "text-yellow-300" : "text-yellow-600"} />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Slug: <code className="text-gray-700">{result.slug}</code></span>
                <span>·</span>
                <span>{result.reading_time_min} min read</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
                <input
                  value={result.versions[activeLang].title}
                  onChange={(e) => updateVersion(activeLang, "title", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 bg-gray-50"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">SEO Title ({result.versions[activeLang].seo_title.length}/60)</label>
                  <input
                    value={result.versions[activeLang].seo_title}
                    onChange={(e) => updateVersion(activeLang, "seo_title", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">SEO Description ({result.versions[activeLang].seo_description.length}/160)</label>
                  <input
                    value={result.versions[activeLang].seo_description}
                    onChange={(e) => updateVersion(activeLang, "seo_description", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Excerpt</label>
                <textarea
                  value={result.versions[activeLang].excerpt}
                  onChange={(e) => updateVersion(activeLang, "excerpt", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Content (Markdown)</label>
                <textarea
                  value={result.versions[activeLang].content_md}
                  onChange={(e) => updateVersion(activeLang, "content_md", e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-gray-50 font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (
                  <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{t}</span>
                ))}
              </div>
              {result.external_links.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">External References</p>
                  <ul className="space-y-1">
                    {result.external_links.map((l, i) => (
                      <li key={i} className="text-xs">
                        <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{l.label}</a>
                        <span className="text-gray-400"> — {l.context}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Search size={16} className="text-[#FF0000]" />
              <h3 className="text-sm font-bold text-gray-900">AI Fact Check — {LANG_LABELS[activeLang]}</h3>
              {factChecking && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>
            {factChecks[activeLang] ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${
                    factChecks[activeLang]!.confidence_score >= 75 ? "text-green-600" :
                    factChecks[activeLang]!.confidence_score >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {factChecks[activeLang]!.confidence_score}%
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                  {factChecks[activeLang]!.approved
                    ? <span className="ml-auto px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">APPROVED</span>
                    : <span className="ml-auto px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded">REVIEW NEEDED</span>}
                </div>
                <p className="text-sm text-gray-700">{factChecks[activeLang]!.summary}</p>
                {factChecks[activeLang]!.issues.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    {factChecks[activeLang]!.issues.map((iss, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        {iss.severity === "critical" ? <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" /> :
                         iss.severity === "warn" ? <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" /> :
                         <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />}
                        <div>
                          <span className="font-semibold text-gray-700">[{iss.category}]</span> {iss.message}
                          {iss.suggestion && <p className="text-gray-500 mt-0.5">→ {iss.suggestion}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click a language tab to run fact check.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-[#FF0000]" />
              <h3 className="text-sm font-bold text-gray-900">Cover Image</h3>
              {findingCover && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={imageQueryOverride}
                onChange={(e) => setImageQueryOverride(e.target.value)}
                placeholder="Image search query"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
              />
              <button
                onClick={() => findCovers(imageQueryOverride)}
                disabled={findingCover}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-gray-300 disabled:opacity-50"
              >
                Search Stock
              </button>
              <button
                onClick={generateAiCover}
                disabled={findingCover}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-gray-300 disabled:opacity-50 flex items-center gap-1"
              >
                <Wand2 size={12} /> Generate AI
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {coverOptions.map((c) => (
                <button
                  key={c.url}
                  onClick={() => setSelectedCover(c)}
                  className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                    selectedCover?.url === c.url ? "border-[#FF0000]" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={c.thumb || c.url} alt={c.alt || ""} className="w-full h-full object-cover" />
                  {c.attribution && <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-1 truncate">{c.attribution}</div>}
                </button>
              ))}
              {aiCover && (
                <button
                  onClick={() => setSelectedCover(aiCover)}
                  className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                    selectedCover?.url === aiCover.url ? "border-[#FF0000]" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={aiCover.url} alt="AI generated" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded">AI</div>
                </button>
              )}
            </div>
            {coverOptions.length === 0 && !aiCover && !findingCover && (
              <p className="text-sm text-gray-400">No images yet. Try a different search query or generate one with AI.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setStep("input")}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-300"
              disabled={publishing}
            >
              Cancel
            </button>
            <button
              onClick={() => handlePublish(false)}
              disabled={publishing || !selectedCover}
              className="px-5 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#FF0000] hover:text-[#FF0000] disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Save as Draft
            </button>
            <button
              onClick={() => handlePublish(true)}
              disabled={publishing || !selectedCover}
              className="px-5 py-2.5 bg-[#FF0000] text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publish All Languages
            </button>
          </div>
        </>
      )}
    </div>
  );
}
