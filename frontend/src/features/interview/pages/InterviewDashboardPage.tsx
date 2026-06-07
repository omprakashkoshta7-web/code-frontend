import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Mic, FileDown, Target, CheckCircle2, BookOpen, Trophy, Zap, Calendar,
  Loader2, Sparkles, RefreshCw, Settings, Clock, BarChart3, ArrowLeft, Trash2, Download,
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';
import { getRoleById } from '../data/roles';
import type { InterviewPreference, MockSession, InterviewKit } from '../types';
import SEO from '@/shared/components/SEO';
import { useUser } from '@/shared/hooks/useUser';

export default function InterviewDashboardPage() {
  return (
    <>
      <SEO
        title="Interview Prep Dashboard - CodeSprout"
        description="Your personalized interview preparation dashboard with subjects, mock interviews, and progress tracking."
        path="/interview-prep/dashboard"
        noindex
      />
      <InterviewDashboardContent />
    </>
  );
}

function InterviewDashboardContent() {
  const navigate = useNavigate();
  const user = useUser();
  const [pref, setPref] = useState<InterviewPreference | null>(null);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [kits, setKits] = useState<InterviewKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingKit, setGeneratingKit] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/interview-prep/dashboard');
      return;
    }
    Promise.all([
      interviewApi.getPreferences(),
      interviewApi.getMockSessions(),
      interviewApi.getKits(),
    ]).then(([p, s, k]) => {
      if (!p.data) {
        navigate('/interview-prep/setup');
        return;
      }
      setPref(p.data);
      setSessions(s.data || []);
      setKits(k.data || []);
    }).catch((e) => {
      if (e?.response?.status === 401) navigate('/login?redirect=/interview-prep/dashboard');
      else setError('Failed to load dashboard');
    }).finally(() => setLoading(false));
  }, [user]);

  const roleName = pref ? (pref.custom_role && pref.role === 'custom' ? pref.custom_role : getRoleById(pref.role)?.name || pref.role) : '';

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysAnswers = sessions.flatMap(s => s.answers || []).filter(a => a.answered_at?.startsWith(todayKey));
  const goal = pref?.daily_goal || 5;
  const progressPct = Math.min(100, Math.round((todaysAnswers.length / goal) * 100));

  const startMock = (subject: string) => navigate(`/interview-prep/call?subject=${encodeURIComponent(subject)}`);
  const generateKit = async () => {
    setError('');
    setGeneratingKit(true);
    try {
      const res = await interviewApi.generateKit();
      const k = res.data;
      const a = document.createElement('a');
      a.href = k.file_url;
      a.download = `${roleName.replace(/[^a-z0-9]+/gi, '-')}-Interview-Kit.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setKits([k, ...kits]);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to generate PDF kit');
    } finally {
      setGeneratingKit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!pref) return null;

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((s, x) => s + x.overall_score, 0) / completedSessions.length)
    : 0;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/interview-prep" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-4">
          <ArrowLeft className="w-4 h-4" /> Interview Prep
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {roleName} Prep
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              <span className="capitalize">{pref.experience}</span> · {pref.subjects.length} subjects
            </p>
          </div>
          <Link
            to="/interview-prep/setup"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center gap-2"
          >
            <Settings className="w-4 h-4" /> Edit preferences
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon={Target} label="Today's Goal" value={`${todaysAnswers.length}/${goal}`} sub={`${progressPct}% complete`} color="from-primary-500 to-pink-500" />
          <StatCard icon={Mic} label="Mock Sessions" value={sessions.length} sub={`${completedSessions.length} completed`} color="from-cyan-500 to-blue-500" />
          <StatCard icon={BarChart3} label="Avg Score" value={sessions.length > 0 ? `${avgScore}%` : '—'} sub="Across all mocks" color="from-emerald-500 to-teal-500" />
          <StatCard icon={Trophy} label="Subjects" value={pref.subjects.length} sub="In your plan" color="from-amber-500 to-orange-500" />
        </div>

        {/* Today's Goal Progress */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Today's Goal</h3>
            <span className="text-sm text-slate-400">{todaysAnswers.length} of {goal} questions</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full"
            />
          </div>
          {progressPct >= 100 && (
            <div className="mt-3 text-sm text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Daily goal achieved — keep it up!
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => startMock(pref.subjects[0] || 'DSA')}
            className="p-5 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 hover:opacity-90 text-white text-left shadow-lg shadow-primary-500/25 transition"
          >
            <Mic className="w-7 h-7 mb-2" />
            <div className="text-lg font-bold">Start Mock Interview</div>
            <div className="text-sm text-white/80">AI-graded answers + audio</div>
          </button>
          <button
            onClick={generateKit}
            disabled={generatingKit}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition disabled:opacity-50"
          >
            <FileDown className="w-7 h-7 mb-2 text-emerald-400" />
            <div className="text-lg font-bold text-white">Download Interview Kit</div>
            <div className="text-sm text-slate-400">{generatingKit ? 'Building PDF...' : 'PDF with all subjects'}</div>
          </button>
          <Link
            to="/interview-prep/quick-revision"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition"
          >
            <Zap className="w-7 h-7 mb-2 text-amber-400" />
            <div className="text-lg font-bold text-white">Quick Revision</div>
            <div className="text-sm text-slate-400">Flashcards & quick quiz</div>
          </Link>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" /> Your Subjects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pref.subjects.map((subject) => (
              <Link
                key={subject}
                to={`/interview-prep/subject/${encodeURIComponent(subject)}`}
                className="group p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-primary-500/50 hover:bg-slate-800/60 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{subject}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-xs text-slate-400">Open to view questions, notes & quiz</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" /> Recent Mock Sessions
            </h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  to={`/interview-prep/mock-result/${s.id}`}
                  className="block p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{s.subject} · {s.round_type}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(s.started_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        {s.answers.length > 0 && ` · ${s.answers.length} answered`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        s.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>{s.status}</span>
                      <span className="text-base font-bold text-white">{s.overall_score || 0}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Previous Kits */}
        {kits.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary-400" /> Past PDF Kits
            </h2>
            <div className="space-y-2">
              {kits.slice(0, 5).map((k) => (
                <div key={k.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {k.role_name || k.role} Interview Kit
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {k.subjects.length} subjects · {k.total_questions} questions ·{' '}
                      {new Date(k.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <a
                    href={k.file_url}
                    download={`${(k.role_name || k.role).replace(/[^a-z0-9]+/gi, '-')}-Interview-Kit.pdf`}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm rounded-lg flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>
    </div>
  );
}
