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
  alt_slugs: string[];
}

function sanitizeSlug(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface GenerationResult {
  slug: string;
  tags: string[];
  stock_image_query: string;
  reading_time_min: number;
  external_links: { url: string; label: string; context: string }[];
  sourceLang: Lang;
  versions: Partial<Record<Lang, BlogVersion>>;
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

const DRAFT_KEY = "klaar_blog_draft_v1";

interface PersistedDraft {
  step: "input" | "review" | "publish";
  sourceText: string;
  topic: string;
  sourceLang: Lang;
  result: GenerationResult | null;
  activeLang: Lang;
  factChecks: Record<Lang, FactCheck | null>;
  coverOptions: CoverOption[];
  aiCover: CoverOption | null;
  selectedCover: CoverOption | null;
  imageQueryOverride: string;
}

function loadDraft(): Partial<PersistedDraft> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedDraft;
  } catch {
    return {};
  }
}

export default function BlogTab() {
  const initial = loadDraft();

  // Wizard state
  const [step, setStep] = useState<"input" | "review" | "publish">(initial.step || "input");
  const [sourceText, setSourceText] = useState(initial.sourceText || "");
  const [topic, setTopic] = useState(initial.topic || "");
  const [sourceLang, setSourceLang] = useState<Lang>(initial.sourceLang || "de");
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [factChecking, setFactChecking] = useState(false);
  const [findingCover, setFindingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated content
  const [result, setResult] = useState<GenerationResult | null>(initial.result || null);
  const [activeLang, setActiveLang] = useState<Lang>(initial.activeLang || "de");
  const [factChecks, setFactChecks] = useState<Record<Lang, FactCheck | null>>(
    initial.factChecks || { de: null, fr: null, en: null }
  );
  const [coverOptions, setCoverOptions] = useState<CoverOption[]>(initial.coverOptions || []);
  const [aiCover, setAiCover] = useState<CoverOption | null>(initial.aiCover || null);
  const [selectedCover, setSelectedCover] = useState<CoverOption | null>(initial.selectedCover || null);
  const [imageQueryOverride, setImageQueryOverride] = useState(initial.imageQueryOverride || "");
  const [reviseFeedback, setReviseFeedback] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [translateBaseLang, setTranslateBaseLang] = useState<Lang | "">("");

  // Existing posts list
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  // Persist wizard state across navigation/tab switches
  useEffect(() => {
    const draft: PersistedDraft = {
      step, sourceText, topic, sourceLang, result, activeLang,
      factChecks, coverOptions, aiCover, selectedCover, imageQueryOverride,
    };
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* quota */ }
  }, [step, sourceText, topic, sourceLang, result, activeLang, factChecks, coverOptions, aiCover, selectedCover, imageQueryOverride]);

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
        body: { mode: "generate", sourceText, topic, sourceLang },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as GenerationResult);
      setActiveLang(sourceLang);
      setImageQueryOverride(data.stock_image_query);
      setFactChecks({ de: null, fr: null, en: null });
      setReviseFeedback("");
      setStep("review");
      // Auto-trigger fact-check + cover search in parallel (source lang only)
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

  function buildAutoFeedback(lang: Lang): string {
    const fc = factChecks[lang];
    if (!fc || fc.issues.length === 0) return "";
    return fc.issues.map((i) => `[${i.severity.toUpperCase()} – ${i.category}] ${i.message}${i.suggestion ? ` → ${i.suggestion}` : ""}`).join("\n");
  }

  async function handleRevise() {
    if (!result) return;
    const lang = activeLang;
    const current = result.versions[lang];
    if (!current) return;
    const userNotes = reviseFeedback.trim();
    const autoNotes = buildAutoFeedback(lang);
    const combined = [userNotes, autoNotes].filter(Boolean).join("\n\n");
    if (!combined) {
      setError("Add improvement points or run a fact-check first.");
      return;
    }
    setError(null);
    setRevising(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("generate-blog-post", {
        body: { mode: "revise", current_md: current.content_md, feedback: combined, lang },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setResult({
        ...result,
        versions: { ...result.versions, [lang]: { title: data.title, seo_title: data.seo_title, seo_description: data.seo_description, excerpt: data.excerpt, content_md: data.content_md, alt_slugs: data.alt_slugs || result.versions[lang]?.alt_slugs || [] } },
      });
      // Invalidate translations + fact-check for this lang since content changed
      const invalidated: Record<Lang, FactCheck | null> = { ...factChecks, [lang]: null };
      setFactChecks(invalidated);
      setReviseFeedback("");
      // Re-run fact check
      await runFactCheck({ ...result, versions: { ...result.versions, [lang]: { ...current, content_md: data.content_md, title: data.title, seo_title: data.seo_title, seo_description: data.seo_description, excerpt: data.excerpt, alt_slugs: data.alt_slugs || current.alt_slugs || [] } } }, lang);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revision failed");
    } finally {
      setRevising(false);
    }
  }

  async function handleTranslate(baseLang?: Lang) {
    if (!result) {
      setError("No article loaded");
      return;
    }

    const availableBases = (["de", "fr", "en"] as Lang[]).filter(
      (lang) => !!result.versions[lang]?.content_md,
    );
    const dropdownBase = translateBaseLang || undefined;
    const activeBase = result.versions[activeLang]?.content_md ? activeLang : undefined;
    const sourceBase = result.versions[result.sourceLang]?.content_md ? result.sourceLang : undefined;
    const src = baseLang ?? dropdownBase ?? activeBase ?? sourceBase ?? availableBases[0];

    if (!src) {
      setError("No base language available for translation");
      return;
    }

    const sourceVersion = result.versions[src];
    if (!sourceVersion?.content_md) {
      setError(`No content available for base language ${src.toUpperCase()}`);
      return;
    }

    const targets = (["de", "fr", "en"] as Lang[]).filter((l) => l !== src);
    if (targets.length === 0) {
      setError("No target languages available");
      return;
    }

    setError(null);
    setTranslating(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("translate-blog-post", {
        body: { source_md: sourceVersion.content_md, sourceLang: src, targetLangs: targets },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setResult({ ...result, versions: { ...result.versions, ...data.versions } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  async function runFactCheck(r: GenerationResult, lang: Lang) {
    const v = r.versions[lang];
    if (!v) return;
    setFactChecking(true);
    try {
      
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
    setError(null);
    setFindingCover(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("find-blog-cover", {
        body: { query: imageQueryOverride || result?.stock_image_query, forceAi: true, fallbackToAi: true },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      if (data?.ai) {
        setAiCover(data.ai);
        setSelectedCover(data.ai);
      } else {
        setError("AI image generation returned no image. Try again or refine the prompt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI image generation failed");
    } finally {
      setFindingCover(false);
    }
  }

  function updateVersion(lang: Lang, field: keyof BlogVersion, value: string | string[]) {
    if (!result) return;
    const existing: BlogVersion = result.versions[lang] ?? { title: "", seo_title: "", seo_description: "", excerpt: "", content_md: "", alt_slugs: [] };
    setResult({
      ...result,
      versions: { ...result.versions, [lang]: { ...existing, [field]: value } },
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
        alt_slugs: Array.from(new Set((result.versions[lang]?.alt_slugs ?? []).map(sanitizeSlug).filter((s) => s && s !== result.slug))),
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
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
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
              {generating ? <><Loader2 size={16} className="animate-spin" /> Writing in {LANG_LABELS[sourceLang]}…</> : <><Wand2 size={16} /> Generate ({LANG_LABELS[sourceLang]})</>}
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-3">
              <div className="flex gap-1 items-center">
                {(["de", "fr", "en"] as Lang[]).map((l) => {
                  const exists = !!result.versions[l];
                  return (
                    <button
                      key={l}
                      onClick={() => {
                        if (!exists) return;
                        setActiveLang(l);
                        if (!factChecks[l]) runFactCheck(result, l);
                      }}
                      disabled={!exists}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        activeLang === l ? "bg-gray-900 text-white" :
                        exists ? "text-gray-500 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                      }`}
                      title={exists ? "" : "Not generated yet — click Translate"}
                    >
                      <Languages size={12} /> {LANG_LABELS[l]}
                      {exists && factChecks[l] && (
                        factChecks[l]!.approved
                          ? <CheckCircle2 size={12} className={activeLang === l ? "text-green-300" : "text-green-600"} />
                          : <AlertTriangle size={12} className={activeLang === l ? "text-yellow-300" : "text-yellow-600"} />
                      )}
                      {!exists && <span className="text-[9px] uppercase tracking-wider opacity-60">pending</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Slug: <code className="text-gray-700">{result.slug}</code></span>
                <span>·</span>
                <span>{result.reading_time_min} min read</span>
              </div>
            </div>

            {(() => {
              const currentVersion: BlogVersion = result.versions?.[activeLang] ?? { title: "", seo_title: "", seo_description: "", excerpt: "", content_md: "", alt_slugs: [] };
              return (
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
                <input
                  value={currentVersion.title ?? ""}
                  onChange={(e) => updateVersion(activeLang, "title", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 bg-gray-50"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">SEO Title ({(currentVersion.seo_title ?? "").length}/60)</label>
                  <input
                    value={currentVersion.seo_title ?? ""}
                    onChange={(e) => updateVersion(activeLang, "seo_title", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">SEO Description ({(currentVersion.seo_description ?? "").length}/160)</label>
                  <input
                    value={currentVersion.seo_description ?? ""}
                    onChange={(e) => updateVersion(activeLang, "seo_description", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Excerpt</label>
                <textarea
                  value={currentVersion.excerpt ?? ""}
                  onChange={(e) => updateVersion(activeLang, "excerpt", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <Search size={12} />
                  Alt Slugs — searchable URL variants ({(currentVersion.alt_slugs ?? []).length})
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Each variant becomes a URL like <code>/{activeLang}/blog/&lt;slug&gt;</code> that redirects to the canonical post. Captures long-tail Google searches. Press Enter or comma to add.
                </p>
                <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50 min-h-[44px]">
                  {(currentVersion.alt_slugs ?? []).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700">
                      {s}
                      <button
                        type="button"
                        onClick={() => {
                          const next = (currentVersion.alt_slugs ?? []).filter((x) => x !== s);
                          updateVersion(activeLang, "alt_slugs", next as unknown as string);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${s}`}
                      >×</button>
                    </span>
                  ))}
                  <input
                    placeholder="add-a-question-slug"
                    onKeyDown={(e) => {
                      const target = e.currentTarget;
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const cleaned = sanitizeSlug(target.value);
                        if (!cleaned) return;
                        const existing = currentVersion.alt_slugs ?? [];
                        if (existing.includes(cleaned) || cleaned === result.slug) { target.value = ""; return; }
                        updateVersion(activeLang, "alt_slugs", [...existing, cleaned] as unknown as string);
                        target.value = "";
                      }
                    }}
                    className="flex-1 min-w-[140px] px-2 py-1 text-xs bg-transparent focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Content (Markdown)</label>
                <textarea
                  value={currentVersion.content_md ?? ""}
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
              );
            })()}
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
              <RefreshCw size={16} className="text-[#FF0000]" />
              <h3 className="text-sm font-bold text-gray-900">Revise — {LANG_LABELS[activeLang]}</h3>
              {revising && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Add your own improvement notes. Fact-checker issues for this language will be appended automatically.
            </p>
            <textarea
              value={reviseFeedback}
              onChange={(e) => setReviseFeedback(e.target.value)}
              rows={4}
              placeholder="e.g. Add a section about TWINT integration. Tone is too formal — make paragraph 3 friendlier."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 font-mono"
              disabled={revising}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                {factChecks[activeLang]?.issues.length
                  ? `${factChecks[activeLang]!.issues.length} fact-check issue(s) will be included`
                  : "No fact-check issues to include"}
              </span>
              <button
                onClick={handleRevise}
                disabled={revising || (!reviseFeedback.trim() && !factChecks[activeLang]?.issues.length) || !result.versions[activeLang]}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {revising ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                Rerun AI with Feedback
              </button>
            </div>
            {(["de", "fr", "en"] as Lang[]).filter((l) => l !== activeLang && result.versions[l]).length > 0 && (
              <p className="text-[11px] text-yellow-600 mt-2">
                ⚠ Other language versions will become out of sync. Re-run translation after revising.
              </p>
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

          <div className="flex gap-3 justify-end items-center flex-wrap">
            <button
              onClick={() => setStep("input")}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-300"
              disabled={publishing}
            >
              Cancel
            </button>
            {(() => {
              const availableBases = (["de", "fr", "en"] as Lang[]).filter((l) => !!result.versions[l]?.content_md);
              if (availableBases.length === 0) return null;
              const selectedBase = (translateBaseLang && availableBases.includes(translateBaseLang as Lang)
                ? translateBaseLang
                : availableBases.includes(activeLang)
                  ? activeLang
                  : availableBases.includes(result.sourceLang)
                    ? result.sourceLang
                    : availableBases[0]) as Lang;
              return (
                <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg pl-3 pr-1 py-1">
                  <Languages size={14} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Translate from</span>
                  <select
                    value={selectedBase}
                    onChange={(e) => setTranslateBaseLang(e.target.value as Lang)}
                    disabled={translating}
                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none"
                  >
                    {availableBases.map((l) => (
                      <option key={l} value={l}>{LANG_LABELS[l]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleTranslate(selectedBase)}
                    disabled={translating}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {translating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                    Start translation
                  </button>
                </div>
              );
            })()}
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
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publish ({Object.keys(result.versions).length} lang)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
