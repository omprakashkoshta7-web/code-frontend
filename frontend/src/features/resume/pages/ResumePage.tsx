import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Download, RefreshCw, Trash2, BarChart3, Lightbulb, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, Sparkles, Layout, Eye, EyeOff, Loader2, Search,
  Award, TrendingUp, Target, BookOpen, Code2, Link, Mail, Phone, Github, Linkedin,
  Zap, Shield, Star, ThumbsUp, MessageSquare, PenTool, Copy, Check,
} from 'lucide-react';
import { resumeApi } from '../api/resumeApi';
import toast from 'react-hot-toast';
import SEO from '@/shared/components/SEO';

type Tab = 'upload' | 'analysis' | 'builder';

interface ResumeSection { type: string; value: string; items?: string[]; }
interface ResumeScore { total: number; breakdown: { basic_info: number; projects: number; skills: number; experience: number; education: number; ats: number; }; }
interface ResumeAnalysis {
  strength: string; weak_areas: string[]; missing_sections: string[]; ats_improvements: string[];
  project_suggestions: string[]; skill_suggestions: string[]; template_recommendation: string;
  ats_friendly: number; project_score: number; rewrite_suggestions: { original: string; rewritten: string }[];
}
interface Resume { id: string; title: string; score?: number; created_at: string; sections: ResumeSection[]; raw_text?: string; analysis?: ResumeAnalysis; }

const strengthColor: Record<string, string> = { Low: 'text-rose-400 bg-rose-500/10', Medium: 'text-amber-400 bg-amber-500/10', High: 'text-emerald-400 bg-emerald-500/10' };

export default function ResumePage() {
  const [tab, setTab] = useState<Tab>('upload');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rewriteText, setRewriteText] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadResumes = useCallback(async () => {
    try {
      const r = await resumeApi.list();
      setResumes(r.data.resumes || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  const handleUpload = async () => {
    if (!file) { toast.error('Select a file'); return; }
    setLoading(true);
    try {
      const r = await resumeApi.upload(file);
      const resume = r.data.resume;
      setSelected(resume);
      toast.success('Resume uploaded & parsed!');
      await loadResumes();
      setTab('analysis');
      handleAnalyze(resume.id);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleAnalyze = async (id?: string, text?: string) => {
    setAnalyzing(true);
    try {
      const r = await resumeApi.analyze(id, text);
      if (id) {
        setSelected(prev => prev && prev.id === id ? { ...prev, score: r.data.score, analysis: r.data.analysis } : prev);
      }
      setTab('analysis');
      toast.success('Analysis complete!');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await resumeApi.delete(id);
      if (selected?.id === id) setSelected(null);
      await loadResumes();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) return;
    setRewriting(true);
    try {
      const r = await resumeApi.rewrite(rewriteText);
      setRewritten(r.data.rewritten);
    } catch { toast.error('Rewrite failed'); }
    finally { setRewriting(false); }
  };

  const copyRewritten = () => {
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const sectionIcon = (t: string) => {
    switch (t) {
      case 'name': return <PenTool className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'skills': return <Code2 className="w-4 h-4" />;
      case 'projects': return <BookOpen className="w-4 h-4" />;
      case 'education': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const ScoreGauge = ({ score, label, max = 100, color = 'from-violet-500 to-fuchsia-500' }: { score: number; label: string; max?: number; color?: string }) => (
    <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
          <circle cx="36" cy="36" r="30" fill="none" stroke="url(#grad)" strokeWidth="5" strokeDasharray={`${(score / max) * 188.5} 188.5`} strokeLinecap="round" />
          <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#d946ef" /></linearGradient></defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{Math.round(score)}</span>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );

  const TabBar = () => (
    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
      {(['upload', 'analysis', 'builder'] as Tab[]).map(t => (
        <button key={t} onClick={() => setTab(t)}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg capitalize transition-all ${tab === t ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25' : 'text-white/60 hover:text-white'}`}>
          {t === 'upload' && <Upload className="w-4 h-4 inline mr-1.5" />}
          {t === 'analysis' && <BarChart3 className="w-4 h-4 inline mr-1.5" />}
          {t === 'builder' && <Layout className="w-4 h-4 inline mr-1.5" />}
          {t === 'upload' ? 'Upload & Parse' : t === 'analysis' ? 'Analysis' : 'Builder'}
        </button>
      ))}
    </div>
  );

  const getATSFriendly = (analysis?: ResumeAnalysis): number => {
    if (!analysis?.ats_friendly && analysis?.ats_friendly !== 0) return 70;
    return analysis.ats_friendly;
  };

  return (
    <>
      <SEO title="Resume Checker & Builder | CodeSprout" description="Upload your resume for AI-powered analysis, ATS score, and rewrite suggestions" path="/resume" />
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0B1020' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1020] via-[#1a1140] to-[#0B1020]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(168,85,247,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Resume</span> Checker & Builder
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Upload your resume for AI-powered analysis, ATS scoring, project evaluation, and instant rewrite suggestions</p>
          </div>

          <TabBar />

          <AnimatePresence mode="wait">
            {/* === TAB: UPLOAD === */}
            {tab === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Upload card */}
                <div className="rounded-2xl border border-white/10 p-8 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${file ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/30'}`}
                  >
                    {file ? (
                      <div>
                        <FileText className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">{file.name}</p>
                        <p className="text-xs text-slate-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => setFile(null)} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white transition-colors">Change</button>
                          <button onClick={handleUpload} disabled={loading} className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 inline-flex items-center gap-2">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : <><Upload className="w-4 h-4" /> Upload & Analyze</>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">Drop your resume here</p>
                        <p className="text-sm text-slate-500 mb-4">PDF or DOCX (max 10MB)</p>
                        <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all cursor-pointer shadow-lg shadow-violet-500/30">
                          <Upload className="w-4 h-4" /> Browse Files
                          <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parsed Sections Preview */}
                {selected?.sections && selected.sections.length > 0 && (
                  <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-400" /> Extracted Sections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selected.sections.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">{sectionIcon(s.type)}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-400 uppercase">{s.type}</p>
                            <p className="text-sm text-white truncate">{s.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous resumes */}
                {resumes.length > 0 && (
                  <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Your Resumes</h3>
                    <div className="space-y-2">
                      {resumes.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { setSelected(r); setTab('analysis'); }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{r.title}</p>
                              <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()} · {r.sections?.length || 0} sections</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {r.score !== null && r.score !== undefined && (
                              <span className={`text-sm font-bold ${r.score >= 70 ? 'text-emerald-400' : r.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{r.score}/100</span>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* === TAB: ANALYSIS === */}
            {tab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {!selected ? (
                  <div className="text-center py-16 rounded-2xl border border-white/10" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)' }}>
                    <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Upload a resume first to see analysis</p>
                  </div>
                ) : analyzing ? (
                  <div className="text-center py-16 rounded-2xl border border-white/10" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)' }}>
                    <Loader2 className="w-10 h-10 text-violet-400 mx-auto mb-4 animate-spin" />
                    <p className="text-white font-medium">Analyzing your resume...</p>
                    <p className="text-sm text-slate-500 mt-1">Rule engine + AI suggestions in progress</p>
                  </div>
                ) : (
                  <>
                    {/* Score cards */}
                    <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-violet-400" /> Resume Score</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <ScoreGauge score={selected?.score?.total || 0} label="Overall" />
                        <ScoreGauge score={selected?.score?.breakdown?.basic_info || 0} label="Basic Info" max={26} color="from-blue-500 to-cyan-500" />
                        <ScoreGauge score={selected?.score?.breakdown?.projects || 0} label="Projects" max={25} color="from-emerald-500 to-teal-500" />
                        <ScoreGauge score={selected?.score?.breakdown?.skills || 0} label="Skills" max={15} color="from-amber-500 to-orange-500" />
                        <ScoreGauge score={selected?.score?.breakdown?.experience || 0} label="Experience" max={10} color="from-rose-500 to-pink-500" />
                        <ScoreGauge score={selected?.score?.breakdown?.ats || 0} label="ATS" max={25} color="from-indigo-500 to-purple-500" />
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {selected?.analysis && (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Weak Areas & Missing */}
                          <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Weak Areas</h4>
                            {selected.analysis.weak_areas.length > 0 ? (
                              <ul className="space-y-2">{selected.analysis.weak_areas.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />{w}</li>)}</ul>
                            ) : <p className="text-sm text-slate-500">No weak areas detected</p>}
                            <h4 className="text-sm font-semibold text-white mt-6 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400" /> Missing Sections</h4>
                            {selected.analysis.missing_sections.length > 0 ? (
                              <ul className="space-y-2">{selected.analysis.missing_sections.map((m, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />{m}</li>)}</ul>
                            ) : <p className="text-sm text-slate-500">All key sections present!</p>}
                          </div>
                          {/* ATS & Suggestions */}
                          <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> ATS Friendliness</h4>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${getATSFriendly(selected.analysis)}%` }} />
                              </div>
                              <span className="text-lg font-bold text-white">{getATSFriendly(selected.analysis)}%</span>
                            </div>
                            <ul className="space-y-2">{selected.analysis.ats_improvements.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />{a}</li>)}</ul>
                            <h4 className="text-sm font-semibold text-white mt-6 mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-violet-400" /> Skill Suggestions</h4>
                            <ul className="space-y-2">{selected.analysis.skill_suggestions.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />{s}</li>)}</ul>
                          </div>
                        </div>

                        {/* Project & Template */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> Project Strength</h4>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all" style={{ width: `${(selected.analysis.project_score || 5) * 10}%` }} />
                              </div>
                              <span className="text-lg font-bold text-white">{selected.analysis.project_score || 5}/10</span>
                            </div>
                            {selected.analysis.project_suggestions.map((p, i) => <p key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-2"><TrendingUp className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />{p}</p>)}
                            <h4 className="text-sm font-semibold text-white mt-6 mb-3 flex items-center gap-2"><Layout className="w-4 h-4 text-violet-400" /> Recommended Template</h4>
                            <p className="text-sm text-slate-300 flex items-center gap-2"><Target className="w-4 h-4 text-violet-400" />{selected.analysis.template_recommendation || 'ATS Beginner'}</p>
                          </div>
                          {/* Resume Rewrite */}
                          <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> AI Rewrite Suggestions</h4>
                            {selected.analysis.rewrite_suggestions?.length > 0 ? (
                              <div className="space-y-3">
                                {selected.analysis.rewrite_suggestions.map((rw, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-1 line-through">{rw.original}</p>
                                    <p className="text-sm text-emerald-300">{rw.rewritten}</p>
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-sm text-slate-500 mb-4">No rewrite suggestions from AI. Try the rewrite tool below.</p>}
                            {/* Rewrite tool */}
                            <div className="mt-4">
                              <p className="text-xs text-slate-500 mb-2">Or rewrite any bullet point:</p>
                              <textarea value={rewriteText} onChange={(e) => setRewriteText(e.target.value)} placeholder="Paste a bullet point to rewrite..."
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 mb-2" rows={2} />
                              <div className="flex gap-2">
                                <button onClick={handleRewrite} disabled={rewriting || !rewriteText.trim()} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                                  {rewriting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Rewrite
                                </button>
                              </div>
                              {rewritten && (
                                <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                  <p className="text-sm text-emerald-300 mb-2">{rewritten}</p>
                                  <button onClick={copyRewritten} className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleAnalyze(selected.id)} disabled={analyzing} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30 inline-flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} /> Re-analyze
                          </button>
                          <button onClick={() => setTab('builder')} className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-all inline-flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Build Resume <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* === TAB: BUILDER === */}
            {tab === 'builder' && (
              <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <BuilderPanel selectedAnalysis={selected?.analysis} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function BuilderPanel({ selectedAnalysis }: { selectedAnalysis?: ResumeAnalysis }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('ats-beginner');

  useEffect(() => {
    resumeApi.getTemplates().then(r => setTemplates(r.data.templates || [])).catch(() => {});
    if (selectedAnalysis?.template_recommendation) {
      const match = templates.find(t => t.name.toLowerCase() === selectedAnalysis.template_recommendation.toLowerCase());
      if (match) setSelectedTemplate(match.id);
    }
  }, [selectedAnalysis]);

  const recommended = selectedAnalysis?.template_recommendation || 'ATS Beginner';

  return (
    <>
      <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-violet-400" /> Choose Template</h3>
        <p className="text-sm text-slate-400 mb-6">AI recommends: <span className="text-violet-400 font-medium">{recommended}</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => {
            const isRec = t.name.toLowerCase() === recommended.toLowerCase();
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${selectedTemplate === t.id ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
              >
                {isRec && <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Recommended</span>}
                <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: t.colors?.[1] || '#f8fafc' }}>
                  <FileText className="w-8 h-8" style={{ color: t.colors?.[0] || '#1e293b' }} />
                </div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${t.is_ats_friendly ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {t.is_ats_friendly ? 'ATS Friendly' : 'Creative'}
                  </span>
                  <span className="text-[10px] text-slate-500">{t.columns === 1 ? 'Single Column' : 'Two Column'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-6 shadow-2xl shadow-purple-900/40" style={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><PenTool className="w-5 h-5 text-violet-400" /> Resume Builder</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input type="text" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input type="email" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                <input type="tel" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">LinkedIn</label>
                <input type="url" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">GitHub</label>
                <input type="url" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="github.com/..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Skills (comma separated)</label>
              <input type="text" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="React, Node.js, Python, SQL" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Experience</label>
              <textarea className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" rows={4} placeholder="Describe your work experience..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Projects</label>
              <textarea className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" rows={4} placeholder="Describe your projects..." />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30 inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Generate Resume (PDF)
          </button>
        </div>
      </div>
    </>
  );
}
