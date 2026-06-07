import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, MicOff, Volume2, VolumeX, Loader2, Send, ArrowRight, Trophy, RotateCcw,
  CheckCircle2, AlertCircle, XCircle, Bot, User, Play, Square, Video, VideoOff, Keyboard, Cpu,
  Terminal, MessageCircle, UserCheck, Clock, PhoneOff, ChevronDown, ChevronUp, Sparkles, Keyboard as KeyboardIcon,
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';
import type { MockSession, MockAnswer, MockRoundType } from '../types';
import { MOCK_ROUND_TYPES } from '../data/roles';
import SEO from '@/shared/components/SEO';
import { useUser } from '@/shared/hooks/useUser';

const ICON_MAP: Record<string, any> = { Cpu, Terminal, MessageCircle, UserCheck };

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type CallPhase = 'ai_asking' | 'user_turn' | 'submitting' | 'feedback' | 'finished';

export default function MockCallPage() {
  return (
    <>
      <SEO
        title="AI Mock Interview Call - CodeSprout"
        description="Practice with our AI interviewer — it asks, you answer, just like a real call."
        path="/interview-prep/call"
        noindex
      />
      <MockCallContent />
    </>
  );
}

function MockCallContent() {
  const navigate = useNavigate();
  const user = useUser();
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject') || '';

  // ====== SETUP STATE ======
  const [subject, setSubject] = useState(subjectParam);
  const [roundType, setRoundType] = useState<MockRoundType>('technical');
  const [numQuestions, setNumQuestions] = useState(5);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [prefs, setPrefs] = useState<any>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState('');

  // ====== CALL STATE ======
  const [session, setSession] = useState<MockSession | null>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<CallPhase | 'setup'>('setup');
  const [answer, setAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ score: number; feedback: string; overall_score: number } | null>(null);
  const [answers, setAnswers] = useState<MockAnswer[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [sttError, setSttError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const startedAtRef = useRef<number>(Date.now());
  const answerRef = useRef<string>('');

  useEffect(() => { answerRef.current = answer; }, [answer]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSttSupported(!!SR);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    interviewApi.getPreferences()
      .then(p => {
        if (!p.data) { navigate('/interview-prep/setup'); return; }
        setPrefs(p.data);
        if (!subjectParam && p.data.subjects?.length > 0) setSubject(p.data.subjects[0]);
      })
      .catch(() => navigate('/interview-prep/setup'))
      .finally(() => setLoadingPrefs(false));
  }, [user]);

  useEffect(() => {
    if (phase === 'setup' || phase === 'finished') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (cameraEnabled && phase !== 'setup' && phase !== 'finished') {
      navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 }, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => setCameraEnabled(false));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraEnabled, phase]);

  useEffect(() => {
    return () => {
      try { window.speechSynthesis?.cancel(); } catch {}
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  // ====== TTS ======
  const speak = (text: string, onEnd: () => void) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) { onEnd(); return; }
    try { window.speechSynthesis.cancel(); } catch {}
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    utter.onend = () => onEnd();
    utter.onerror = () => onEnd();
    try { window.speechSynthesis.speak(utter); } catch { onEnd(); }
  };

  // ====== STT ======
  const startListening = () => {
    setSttError('');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSttError('Speech recognition not supported in this browser. Please type instead.'); return; }
    try { recognitionRef.current?.abort(); } catch {}
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      let interim = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (finalText) {
        setAnswer(prev => (prev ? prev + ' ' : '') + finalText.trim());
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };
    rec.onerror = (e: any) => {
      setSttError(`Mic error: ${e.error || 'unknown'}`);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    try {
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch (e: any) {
      setSttError(`Couldn't start mic: ${e?.message || 'unknown'}`);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    setInterimTranscript('');
  };

  // ====== FLOW ======
  const startCall = async () => {
    if (!subject.trim()) { setSetupError('Please select a subject'); return; }
    setSetupError('');
    setStarting(true);
    try {
      const res = await interviewApi.startMock(subject, roundType, numQuestions);
      const s = res.data;
      setSession(s);
      setIdx(0);
      setAnswers([]);
      setLastFeedback(null);
      setAnswer('');
      setElapsed(0);
      startedAtRef.current = Date.now();
      setPhase('ai_asking');
      // Ask the first question
      askQuestion(s.questions[0]);
    } catch (e: any) {
      setSetupError(e?.response?.data?.error || 'Failed to start mock');
    } finally {
      setStarting(false);
    }
  };

  const askQuestion = (q: { id: string; question: string }) => {
    setPhase('ai_asking');
    setAnswer('');
    setLastFeedback(null);
    setInterimTranscript('');
    const text = `Question. ${q.question}. Take your time.`;
    speak(text, () => {
      setPhase('user_turn');
    });
  };

  const repeatQuestion = () => {
    if (!session) return;
    const q = session.questions[idx];
    if (!q) return;
    try { window.speechSynthesis.cancel(); } catch {}
    speak(`Let me repeat. ${q.question}`, () => {
      setPhase('user_turn');
    });
  };

  const submitAnswer = async () => {
    if (!session || !answer.trim()) return;
    if (isListening) stopListening();
    setSubmitError('');
    setPhase('submitting');
    try {
      const res = await interviewApi.submitAnswer(session.id, session.questions[idx].id, answer);
      const fb = res.data;
      setLastFeedback({ score: fb.technical_accuracy, feedback: fb.feedback, overall_score: fb.overall_score });
      setAnswers(a => [...a, {
        question_id: session.questions[idx].id,
        question: session.questions[idx].question,
        expected_answer: session.questions[idx].expected_answer,
        user_answer: answer,
        feedback: fb.feedback,
        technical_accuracy: fb.technical_accuracy,
        score: fb.technical_accuracy,
        answered_at: new Date().toISOString(),
      }]);
      setPhase('feedback');
      // Speak feedback (optional)
      if (ttsEnabled) {
        const scoreWord = fb.technical_accuracy >= 80 ? 'Excellent' : fb.technical_accuracy >= 60 ? 'Good' : fb.technical_accuracy >= 40 ? 'Partial' : 'Needs improvement';
        speak(`I'd give that a ${fb.technical_accuracy} percent. ${scoreWord}. ${fb.feedback}`, () => {});
      }
    } catch (e: any) {
      setSubmitError(e?.response?.data?.error || 'Failed to evaluate');
      setPhase('user_turn');
    }
  };

  const nextQuestion = () => {
    if (!session) return;
    try { window.speechSynthesis.cancel(); } catch {}
    if (idx + 1 >= session.questions.length) {
      finishCall();
    } else {
      const newIdx = idx + 1;
      setIdx(newIdx);
      const q = session.questions[newIdx];
      if (q) askQuestion(q);
      else finishCall();
    }
  };

  const finishCall = async () => {
    if (!session) return;
    try { await interviewApi.endMock(session.id); } catch {}
    setPhase('finished');
  };

  const exitCall = () => {
    if (!confirm('End this mock interview? You can review the results on your dashboard.')) return;
    try { window.speechSynthesis.cancel(); } catch {}
    try { recognitionRef.current?.abort(); } catch {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    finishCall();
  };

  // ====== RENDER ======
  if (loadingPrefs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // SETUP
  if (phase === 'setup' && !session) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link to="/interview-prep/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-4">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI Mock Interview Call
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">AI will ask you questions out loud. Answer with your voice or by typing. Just like a real interview.</p>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Select a subject...</option>
                {prefs?.subjects?.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Round Type</label>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_ROUND_TYPES.map((rt) => {
                  const Icon = ICON_MAP[rt.icon] || Cpu;
                  const isActive = roundType === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setRoundType(rt.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                      <div className="text-sm font-semibold text-white">{rt.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{rt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={`py-2.5 rounded-lg font-semibold text-sm transition ${
                      numQuestions === n ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setCameraEnabled(c => !c)}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  cameraEnabled ? 'border-primary-500 bg-primary-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {cameraEnabled ? <Video className="w-5 h-5 text-primary-400" /> : <VideoOff className="w-5 h-5 text-slate-400" />}
                <div>
                  <div className="text-sm font-semibold text-white">Camera {cameraEnabled ? 'on' : 'off'}</div>
                  <div className="text-xs text-slate-400">Show your video during the call</div>
                </div>
              </button>
              <button
                onClick={() => setTtsEnabled(t => !t)}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  ttsEnabled ? 'border-primary-500 bg-primary-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-5 h-5 text-primary-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <div>
                  <div className="text-sm font-semibold text-white">AI voice {ttsEnabled ? 'on' : 'off'}</div>
                  <div className="text-xs text-slate-400">AI reads questions aloud</div>
                </div>
              </button>
            </div>

            {!sttSupported && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                Your browser doesn't support voice input. You can still type your answers.
              </div>
            )}

            {setupError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{setupError}</div>
            )}

            <button
              onClick={startCall}
              disabled={starting || !subject}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {starting ? 'Connecting to interviewer...' : 'Start Call'}
            </button>

            <Link
              to="/interview-prep/mock"
              className="block text-center text-xs text-slate-500 hover:text-slate-300"
            >
              Prefer text-only? Switch to classic mode →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED
  if (phase === 'finished' && session) {
    return <CallResultScreen session={{ ...session, answers }} onClose={() => navigate('/interview-prep/dashboard')} />;
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">No questions available</h2>
          <button onClick={() => navigate('/interview-prep/dashboard')} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (idx >= session.questions.length) {
    finishCall();
    return null;
  }

  const q = session.questions[idx];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const isAiSpeaking = phase === 'ai_asking';
  const isUserTurn = phase === 'user_turn';
  const isFeedback = phase === 'feedback';
  const isSubmitting = phase === 'submitting';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={exitCall} className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1 text-sm">
            <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">End</span>
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-sm text-slate-300">{session.subject}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{session.round_type}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(elapsed)}</span>
          <span className="text-slate-400">Q {idx + 1}/{session.questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          initial={false}
          animate={{ width: `${((idx) / session.questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary-500 to-pink-500"
        />
      </div>

      {/* Main call area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 max-w-7xl w-full mx-auto">
        {/* AI TILE */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[300px]">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">AI Interviewer</span>
          </div>
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            {isAiSpeaking && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> speaking
              </span>
            )}
            <button onClick={() => setTtsEnabled(t => !t)} className="text-slate-400 hover:text-white p-1 rounded" title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}>
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
              animate={isAiSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={isAiSpeaking ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
              className="relative"
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-primary-500/40">
                <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </div>
              {isAiSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping opacity-40" />
                  <div className="absolute -inset-3 rounded-full border border-pink-400/30 animate-pulse" />
                </>
              )}
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${idx}-${phase}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 sm:p-5 bg-slate-900/80 border-t border-slate-800"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary-400 mt-1 shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-400 mb-1">Question {idx + 1}</div>
                  <div className="text-sm sm:text-base font-medium text-white leading-relaxed">{q.question}</div>
                </div>
              </div>
              {isAiSpeaking && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1">AI is asking...</span>
                </div>
              )}
              {isUserTurn && (
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={repeatQuestion} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Repeat question
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* USER TILE */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[300px]">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-300">You</span>
            {isListening && <span className="text-rose-300">· listening</span>}
          </div>
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
              onClick={() => setCameraEnabled(c => !c)}
              className="text-slate-400 hover:text-white p-1 rounded"
              title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            >
              {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
            {cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-xl"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="relative">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-800 flex items-center justify-center border-2 ${isListening ? 'border-rose-500' : 'border-slate-700'}`}>
                  <User className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500" />
                </div>
                {isListening && (
                  <div className="absolute -inset-2 rounded-full border-2 border-rose-500/50 animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Transcript / answer area */}
          <div className="p-4 sm:p-5 bg-slate-900/80 border-t border-slate-800">
            <AnimatePresence mode="wait">
              {isFeedback && lastFeedback ? (
                <motion.div
                  key="fb"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-primary-400">AI Feedback</span>
                    <span className={`text-2xl font-extrabold ${lastFeedback.score >= 70 ? 'text-emerald-400' : lastFeedback.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {lastFeedback.score}%
                    </span>
                  </div>
                  <div className="text-sm text-slate-200 mb-2">{lastFeedback.feedback}</div>
                  <details className="text-xs">
                    <summary className="text-slate-400 cursor-pointer hover:text-white">Show expected answer</summary>
                    <div className="mt-1.5 p-2 rounded bg-slate-800/60 text-slate-300">{q.expected_answer}</div>
                  </details>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-slate-400">Your Answer</span>
                    {isListening && (
                      <Waveform />
                    )}
                  </div>
                  <textarea
                    value={answer + (interimTranscript ? (answer ? ' ' : '') + interimTranscript : '')}
                    onChange={(e) => { setAnswer(e.target.value); setInterimTranscript(''); }}
                    placeholder={isUserTurn ? "Click the mic to speak, or type here..." : isSubmitting ? "Evaluating your answer..." : "Waiting for AI..."}
                    rows={3}
                    disabled={isAiSpeaking || isSubmitting}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 disabled:opacity-50 resize-none"
                  />
                  {sttError && (
                    <div className="mt-1.5 text-xs text-amber-400">{sttError}</div>
                  )}
                  {submitError && (
                    <div className="mt-1.5 text-xs text-rose-400">{submitError}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="border-t border-slate-800/60 bg-slate-900/40 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3 sm:gap-4">
          {isUserTurn && sttSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition shadow-lg ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? <Square className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" /> : <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            </button>
          )}
          {isUserTurn && !sttSupported && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <KeyboardIcon className="w-4 h-4" /> Type your answer in the box above
            </div>
          )}

          {isUserTurn && (
            <button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-pink-500 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          )}

          {isSubmitting && (
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
            </div>
          )}

          {isFeedback && (
            <button
              onClick={nextQuestion}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-500 to-pink-500 hover:opacity-90 text-white font-semibold rounded-xl flex items-center gap-2"
            >
              {idx + 1 >= session.questions.length ? 'Finish Interview' : 'Next Question'} <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isAiSpeaking && (
            <button
              onClick={() => { try { window.speechSynthesis.cancel(); } catch {} setPhase('user_turn'); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Skip
            </button>
          )}
        </div>
        <div className="max-w-3xl mx-auto text-center text-xs text-slate-500 mt-2">
          Overall so far: <span className="text-white font-bold">{lastFeedback?.overall_score ?? (answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0)}%</span>
          {answers.length > 0 && ` · ${answers.length}/${session.questions.length} answered`}
        </div>
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-1 bg-rose-400 rounded-full animate-pulse"
          style={{
            height: `${30 + Math.sin(i * 1.5) * 30}%`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}

function CallResultScreen({ session, onClose }: { session: MockSession; onClose: () => void }) {
  const navigate = useNavigate();
  const answers = session.answers || [];
  const knew = answers.filter(a => a.score >= 70).length;
  const partial = answers.filter(a => a.score >= 40 && a.score < 70).length;
  const missed = answers.filter(a => a.score < 40).length;
  const totalScore = session.overall_score || (answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Call Ended
          </h1>
          <p className="text-sm text-slate-400 mt-1">{session.subject} · {session.round_type}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-500/20 to-pink-500/20 border border-primary-500/30 rounded-2xl p-6 sm:p-8 text-center mb-6">
          <div className="text-5xl sm:text-6xl font-extrabold text-white mb-1">{totalScore}%</div>
          <div className="text-sm text-slate-300">Overall Score</div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-emerald-500/15">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-emerald-300 font-bold text-lg">{knew}</div>
              <div className="text-xs text-slate-400">Knew it</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/15">
              <AlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-amber-300 font-bold text-lg">{partial}</div>
              <div className="text-xs text-slate-400">Partial</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/15">
              <XCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="text-rose-300 font-bold text-lg">{missed}</div>
              <div className="text-xs text-slate-400">Missed</div>
            </div>
          </div>
        </div>

        {answers.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-bold text-white">Transcript</h3>
            {answers.map((a, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Q{i + 1}</span>
                  <div className="text-sm font-semibold text-white flex-1">{a.question}</div>
                  <span className={`text-xs font-bold ${a.score >= 70 ? 'text-emerald-400' : a.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{a.score}%</span>
                </div>
                <div className="text-xs text-slate-400 mb-1"><span className="text-primary-400 font-semibold">You:</span> {a.user_answer}</div>
                <details className="text-xs">
                  <summary className="text-slate-400 cursor-pointer hover:text-white">Show AI feedback & expected answer</summary>
                  <div className="mt-1.5 p-2 rounded bg-slate-800/60 text-slate-300 mb-1">
                    <span className="text-primary-400 font-semibold">Feedback:</span> {a.feedback}
                  </div>
                  <div className="p-2 rounded bg-slate-800/60 text-slate-300">
                    <span className="text-primary-400 font-semibold">Expected:</span> {a.expected_answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={onClose} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-pink-500 hover:opacity-90 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5">
            Back to Dashboard
          </button>
          <button onClick={() => navigate(`/interview-prep/call?subject=${encodeURIComponent(session.subject)}`)} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" /> Call Again
          </button>
        </div>
      </div>
    </div>
  );
}
