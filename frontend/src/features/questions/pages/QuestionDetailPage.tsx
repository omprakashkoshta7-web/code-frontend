import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Lock, ExternalLink, Crown, X, Play, StickyNote, FileText, Code2, LogIn, ChevronUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { useQuestion } from '../hooks/useQuestions';
import DifficultyBadge from '../components/DifficultyBadge';
import CodeEditor from '@/features/practice/components/CodeEditor';
import { bookmarksApi } from '@/features/bookmarks/api/bookmarksApi';
import { subscriptionStorage } from '@/shared/utils/subscriptionStorage';
import { useUser } from '@/shared/hooks/useUser';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef, useCallback } from 'react';
import { communityApi } from '@/features/community/api/communityApi';
import type { Answer, Discussion } from '@/features/community/types/community';

type MobileTab = 'description' | 'editor';

export default function QuestionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = useUser();

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view questions');
      navigate('/login', { replace: true });
    }
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B1020' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">You need to sign in to access coding questions, submit solutions, and track your progress.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30">
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const { question, loading, requiresPremium, lockedInfo } = useQuestion(slug || '');
  const [bookmarked, setBookmarked] = useState(false);
  const isPremium = subscriptionStorage.isPremiumSync();
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  const [answerExplanation, setAnswerExplanation] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [showDiscussForm, setShowDiscussForm] = useState(false);
  const [discussTitle, setDiscussTitle] = useState('');
  const [discussContent, setDiscussContent] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [testCases, setTestCases] = useState<any[]>([]);
  const [leftWidth, setLeftWidth] = useState(40);
  const [mobileTab, setMobileTab] = useState<MobileTab>('description');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setLeftWidth(Math.max(20, Math.min(70, pct)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`notes-${slug}`);
    if (saved) {
      setNotes(saved);
      setSavedNotes(saved);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    loadAnswers();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    loadDiscussions();
  }, [slug]);

  const loadDiscussions = async () => {
    if (!slug) return;
    try { const res = await communityApi.getDiscussions(slug); setDiscussions(res.data); }
    catch { /* ignore */ }
  };

  const handleCreateDiscussion = async () => {
    if (!slug || !discussContent.trim()) return;
    try {
      await communityApi.createDiscussion({ question_slug: slug, title: discussTitle, content: discussContent });
      setShowDiscussForm(false); setDiscussTitle(''); setDiscussContent('');
      toast.success('Discussion started!'); loadDiscussions();
    } catch { toast.error('Failed to create discussion'); }
  };

  const handleReply = async (discussionId: string) => {
    const content = replyInputs[discussionId];
    if (!content?.trim()) return;
    try {
      const res = await communityApi.replyDiscussion(discussionId, content);
      setDiscussions(prev => prev.map(d => d.id === discussionId ? res.data : d));
      setReplyInputs(prev => ({ ...prev, [discussionId]: '' }));
      toast.success('Reply posted!');
    } catch { toast.error('Failed to reply'); }
  };

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/execute/testcases/${slug}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTestCases(data.filter((tc: any) => !tc.is_hidden).slice(0, 3)); })
      .catch(() => {});
  }, [slug]);

  const loadAnswers = async () => {
    if (!slug) return;
    setLoadingAnswers(true);
    try {
      const res = await communityApi.getAnswers(slug);
      setAnswers(res.data);
    } catch { /* ignore */ }
    setLoadingAnswers(false);
  };

  const handleSubmitAnswer = async () => {
    if (!slug || !answerCode.trim()) return;
    setSubmittingAnswer(true);
    try {
      await communityApi.submitAnswer({
        question_slug: slug,
        code: answerCode,
        explanation: answerExplanation,
      });
      setShowAnswerForm(false);
      setAnswerCode('');
      setAnswerExplanation('');
      toast.success('Answer submitted!');
      loadAnswers();
    } catch { toast.error('Failed to submit answer'); }
    setSubmittingAnswer(false);
  };

  const handleUpvote = async (answerId: string) => {
    try {
      const res = await communityApi.upvoteAnswer(answerId);
      setAnswers(prev => prev.map(a => a.id === answerId ? res.data : a));
    } catch { toast.error('Failed to upvote'); }
  };

  const saveNotes = () => {
    localStorage.setItem(`notes-${slug}`, notes);
    setSavedNotes(notes);
    toast.success('Notes saved');
  };

  const handleBookmark = async () => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login to bookmark');
      return;
    }
    try {
      await bookmarksApi.toggle(question!.id);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed bookmark' : 'Bookmarked!');
    } catch {
      toast.error('Failed to toggle bookmark');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#0B1020' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (requiresPremium && lockedInfo) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16" style={{ backgroundColor: '#0B1020' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Link to="/questions" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400 mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Questions
            </Link>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glow">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{lockedInfo.title}</h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-500/10 text-warning-500">{lockedInfo.difficulty}</span>
              {lockedInfo.topic_name && <span className="text-sm text-slate-400">{lockedInfo.topic_name}</span>}
            </div>
            <div className="bg-[#111827] rounded-2xl p-8 border border-primary-500/30 mb-6">
              <Crown className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Premium Content</h2>
              <p className="text-slate-400 mb-6">Upgrade to access all <strong>{lockedInfo.difficulty}</strong> questions.</p>
              <Link to="/pricing" className="btn-primary">Upgrade to Premium</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#0B1020' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Question not found</h2>
          <Link to="/questions" className="text-primary-400 hover:underline">Browse all questions</Link>
        </div>
      </div>
    );
  }

  const cs = question.cheat_sheet;

  const DescriptionPanel = () => (
    <div className="overflow-y-auto h-full">
      <div className="p-4 sm:p-6">
        {/* Title + Tags */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white mb-3">{question.title}</h1>
          <div className="flex flex-wrap gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-xs">
              <span>🏷️</span> {question.topic_name}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-xs">
              <span>💡</span> {cs.pattern}
            </span>
            {question.companies && question.companies.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-slate-400 text-xs">
                <span>🏢</span> {question.companies.slice(0, 3).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
          {question.problem_statement || question.description || 'No description available.'}
        </div>

        {/* Examples */}
        {question.examples && question.examples.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-white">Examples</h3>
            {(question.examples as any[]).map((ex: { input: string; output: string; explanation?: string }, i: number) => (
              <div key={i} className="p-4 rounded-lg border border-white/5" style={{ backgroundColor: '#0B1020' }}>
                <div className="text-xs font-semibold text-white mb-2">Example {i + 1}:</div>
                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <div><span className="text-primary-400">Input:</span> {ex.input}</div>
                  <div><span className="text-primary-400">Output:</span> {ex.output}</div>
                  {ex.explanation && <div><span className="text-primary-400">Explanation:</span> {ex.explanation}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {question.constraints && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">Constraints</h3>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              {(() => {
                const c = question.constraints!;
                const items: string[] = Array.isArray(c) ? c : c.split('\n').filter(Boolean);
                return items.map((item: string, i: number) => <li key={i}>{item}</li>);
              })()}
            </ul>
          </div>
        )}

        {/* Test Cases */}
        {testCases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Test Cases</h3>
            <div className="space-y-2">
              {testCases.map((tc, i) => (
                <div key={tc.id} className="p-3 rounded-lg border border-white/5" style={{ backgroundColor: '#0B1020' }}>
                  <div className="text-xs font-semibold text-white/70 mb-1">Test {i + 1}:</div>
                  <div className="text-xs font-mono text-slate-400 space-y-0.5">
                    <div><span className="text-primary-400">Input:</span> {tc.input}</div>
                    <div><span className="text-primary-400">Expected Output:</span> {tc.expected_output}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Questions */}
        {question.similar_questions && question.similar_questions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Similar Questions</h3>
            <div className="space-y-2">
              {question.similar_questions.map((rp) => (
                <Link key={rp.slug} to={`/questions/${rp.slug}`} className="flex items-center justify-between py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                  <span className="text-xs font-medium text-slate-200">{rp.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rp.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : rp.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{rp.difficulty}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {showNotes && (
          <div className="border-t border-white/5 pt-4">
            <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write your notes..." className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" style={{ backgroundColor: '#0B1020' }} rows={4} />
            {notes !== savedNotes && (
              <button onClick={saveNotes} className="mt-2 text-xs text-primary-400 hover:text-primary-300">Save</button>
            )}
          </div>
        )}

        {/* Answers */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-400" /> Answers ({answers.length})
            </h3>
            <button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all font-medium"
            >
              {showAnswerForm ? 'Cancel' : 'Submit Answer'}
            </button>
          </div>

          {showAnswerForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 space-y-2"
            >
              <textarea
                value={answerCode}
                onChange={e => setAnswerCode(e.target.value)}
                placeholder="Paste your solution code here..."
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                style={{ backgroundColor: '#0B1020', color: '#e2e8f0' }}
                rows={6}
              />
              <input
                type="text"
                value={answerExplanation}
                onChange={e => setAnswerExplanation(e.target.value)}
                placeholder="Brief explanation (optional)"
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                style={{ backgroundColor: '#0B1020', color: '#e2e8f0' }}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={submittingAnswer || !answerCode.trim()}
                className="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-50"
              >
                {submittingAnswer ? 'Submitting...' : 'Submit'}
              </button>
            </motion.div>
          )}

          {loadingAnswers ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : answers.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4">No answers yet. Be the first to submit!</p>
          ) : (
            <div className="space-y-2">
              {answers.map(a => {
                const isQuestionOwner = question && question.slug && a.user_id !== user?.id;
                return (
                <div key={a.id} className={`p-3 rounded-lg border ${a.is_accepted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/5'}`} style={{ backgroundColor: '#0B1020' }}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-[8px] font-bold flex items-center justify-center">
                        {a.user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-white/70">{a.user_name}</span>
                      {a.is_accepted && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">✓ Accepted</span>}
                      <span className="text-[10px] text-white/30">{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!a.is_accepted && (
                        <button
                          onClick={async () => {
                            try { const res = await communityApi.acceptAnswer(a.id); setAnswers(prev => prev.map(x => x.id === a.id ? res.data : x)); toast.success('Accepted as solution!'); }
                            catch { toast.error('Failed to accept'); }
                          }}
                          className="p-1 rounded text-xs text-white/30 hover:text-emerald-400 transition-colors" title="Mark as accepted answer"
                        >
                          ✓
                        </button>
                      )}
                      <button onClick={() => handleUpvote(a.id)} className="flex items-center gap-1 text-xs text-white/40 hover:text-primary-400 transition-colors">
                        <ThumbsUp className="w-3 h-3" /> {a.upvotes}
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap mb-1 bg-white/5 p-2 rounded">{a.code.slice(0, 300)}{a.code.length > 300 ? '...' : ''}</pre>
                  {a.explanation && (
                    <p className="text-xs text-white/50 mt-1">{a.explanation}</p>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Discussions */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-400" /> Discussion ({discussions.length})
            </h3>
            <button
              onClick={() => setShowDiscussForm(!showDiscussForm)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-all font-medium"
            >
              {showDiscussForm ? 'Cancel' : 'New Thread'}
            </button>
          </div>

          {showDiscussForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 space-y-2">
              <input type="text" value={discussTitle} onChange={e => setDiscussTitle(e.target.value)} placeholder="Title (optional)" className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" style={{ backgroundColor: '#0B1020', color: '#e2e8f0' }} />
              <textarea value={discussContent} onChange={e => setDiscussContent(e.target.value)} placeholder="Start a discussion..." className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" style={{ backgroundColor: '#0B1020', color: '#e2e8f0' }} rows={3} />
              <button onClick={handleCreateDiscussion} disabled={!discussContent.trim()} className="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-50">Post</button>
            </motion.div>
          )}

          {discussions.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4">No discussions yet. Start a conversation!</p>
          ) : (
            <div className="space-y-3">
              {discussions.map(d => (
                <div key={d.id} className="p-3 rounded-lg border border-white/5" style={{ backgroundColor: '#0B1020' }}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-[8px] font-bold flex items-center justify-center">
                          {d.user_name.charAt(0).toUpperCase()}
                        </div>
                        {d.title && <span className="text-xs font-semibold text-white">{d.title}</span>}
                      </div>
                      <p className="text-xs text-white/60 mt-1">{d.content}</p>
                      <p className="text-[10px] text-white/30 mt-1">{d.user_name} · {new Date(d.created_at).toLocaleDateString()} · {d.replies.length} replies</p>
                    </div>
                  </div>
                  {d.replies.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-white/10 pl-3">
                      {d.replies.map(r => (
                        <div key={r.id} className="text-xs">
                          <span className="font-medium text-white/70">{r.user_name}</span>
                          <span className="text-white/50 ml-1">{r.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={replyInputs[d.id] || ''}
                      onChange={e => setReplyInputs(prev => ({ ...prev, [d.id]: e.target.value }))}
                      placeholder="Write a reply..."
                      className="flex-1 px-2 py-1 rounded border border-white/10 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                      style={{ backgroundColor: '#0B1020', color: '#e2e8f0' }}
                    />
                    <button
                      onClick={() => handleReply(d.id)}
                      disabled={!replyInputs[d.id]?.trim()}
                      className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs hover:bg-primary-500/30 transition-all disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const EditorPanel = () => (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" style={{ backgroundColor: '#111827' }}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 shrink-0">
        <Play className="w-3.5 h-3.5 text-success-500" />
        <span className="text-xs font-medium text-white">Code Editor</span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor slug={question.slug} template={cs.template} />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0B1020' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 shrink-0" style={{ backgroundColor: '#111827' }}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link to="/questions" className="text-sm text-slate-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{question.title}</h1>
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="hidden sm:inline text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded shrink-0">{question.topic_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => setShowNotes(!showNotes)} className={`p-2 rounded-lg text-sm transition-colors ${showNotes ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <StickyNote className="w-4 h-4" />
          </button>
          <button onClick={handleBookmark} className={`p-2 rounded-lg text-sm transition-colors ${bookmarked ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (sm and below) */}
      <div className="flex md:hidden border-b border-white/5 shrink-0" style={{ backgroundColor: '#111827' }}>
        <button
          onClick={() => setMobileTab('description')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            mobileTab === 'description' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Description
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            mobileTab === 'editor' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Code Editor
        </button>
      </div>

      {/* Main Content - Mobile: tabbed / Desktop: split */}
      {/* Mobile tabbed view */}
      <div className="flex md:hidden flex-1 min-h-0 overflow-hidden">
        <div className={mobileTab === 'description' ? 'block w-full' : 'hidden'}>
          <DescriptionPanel />
        </div>
        <div className={mobileTab === 'editor' ? 'block w-full' : 'hidden'}>
          <EditorPanel />
        </div>
      </div>

      {/* Desktop split view */}
      <div ref={containerRef} className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Side - Interactive Sidebar */}
        <div style={{ width: `${leftWidth}%` }} className="overflow-y-auto border-r border-white/5 shrink-0">
          <DescriptionPanel />
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 hover:w-3 bg-transparent hover:bg-primary-500/40 transition-all cursor-col-resize shrink-0 relative group"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10 group-hover:bg-primary-500/60" />
        </div>

        {/* Right Side - Compiler */}
        <EditorPanel />
      </div>
    </div>
  );
}
