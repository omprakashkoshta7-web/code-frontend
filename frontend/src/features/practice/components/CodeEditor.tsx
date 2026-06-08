import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { userStorage } from '@/shared/utils/userStorage';
import {
  Play, Send, Loader2, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronDown, ChevronRight, Eye, BarChart3, Terminal, Bug, CheckCircle2, ChevronUp,
} from 'lucide-react';
import ComplexityPopup from './ComplexityPopup';

interface CodeEditorProps {
  slug: string;
  template: Record<string, string>;
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { id: 'python', label: 'Python', monacoId: 'python' },
  { id: 'java', label: 'Java', monacoId: 'java' },
  { id: 'cpp', label: 'C++', monacoId: 'cpp' },
  { id: 'c', label: 'C', monacoId: 'c' },
];

interface TestCaseInfo {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

interface TestResult {
  id: string;
  input: string;
  expected: string;
  output: string;
  error: string;
  runtime: number;
  status: string;
}

interface RunResponse {
  results: TestResult[];
  first_passed: boolean;
}

interface SubmitResponse {
  passed: number;
  total: number;
  status: string;
  test_results: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
}

interface ComplexityInfo {
  detected: string;
  reasoning: string;
  badge: 'optimal' | 'acceptable' | 'needs_optimization';
  space_complexity?: string;
  breakdown?: { label: string; complexity: string; lines: number[] }[];
  optimizations?: string[];
}

interface VisualizeStep {
  line: number;
  code: string;
  vars: Record<string, string>;
  description: string;
}

type TabType = 'testcases' | 'result' | 'custom' | 'complexity' | 'visualize';

function isCodeEmpty(code: string): boolean {
  if (!code || !code.trim()) return true;
  let stripped = code;
  stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, ' ');
  stripped = stripped.replace(/\/\/.*$/gm, ' ');
  stripped = stripped.replace(/#.*$/gm, ' ');
  stripped = stripped.replace(/^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/m, ' ');
  stripped = stripped.replace(/(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|async\s*\([^)]*\))\s*=>\s*\{/g, ' ');
  stripped = stripped.replace(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{/g, ' ');
  stripped = stripped.replace(/^\s*[\{\}]\s*$/gm, ' ');
  stripped = stripped.replace(/^\s*return\s*(?:null|undefined|void\s+0|0|["']["']|;|\s*;\s*)\s*;?\s*$/gim, ' ');
  stripped = stripped.replace(/\s+/g, '').trim();
  return stripped.length === 0;
}

export default function CodeEditor({ slug, template }: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(template?.javascript || '');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testCases, setTestCases] = useState<TestCaseInfo[]>([]);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customResult, setCustomResult] = useState<{ output: string; error: string; runtime: number } | null>(null);
  const [customRunning, setCustomRunning] = useState(false);
  const [complexity, setComplexity] = useState<ComplexityInfo | null>(null);
  const [showComplexityPopup, setShowComplexityPopup] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [visualizing, setVisualizing] = useState(false);
  const [visualizeSteps, setVisualizeSteps] = useState<VisualizeStep[]>([]);
  const [vizStepIndex, setVizStepIndex] = useState(0);
  const [vizPlaying, setVizPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('testcases');
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/execute/testcases/${slug}`, { credentials: 'include', headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(r => r.json())
      .then(data => {
        const cases = Array.isArray(data) ? data : (data?.test_cases || []);
        if (Array.isArray(cases)) {
          setTestCases(cases);
          const allExpanded: Record<string, boolean> = {};
          cases.forEach(tc => { allExpanded[tc.id] = true; });
          setExpandedOutputs(allExpanded);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(template?.[lang] || '');
    setError('');
    setRunResult(null);
    setSubmitResult(null);
    setCustomResult(null);
    setComplexity(null);
    setVisualizeSteps([]);
  };

  const handleRun = async () => {
    setRunning(true);
    setError('');
    setRunResult(null);
    setSubmitResult(null);
    setActiveTab('result');
    try {
      const res = await fetch('/api/execute/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, slug }),
      });
      const data: RunResponse = await res.json();
      setRunResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSubmitResult(null);
    setActiveTab('result');
    try {
      const res = await fetch('/api/execute/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, slug }),
      });
      const data: SubmitResponse = await res.json();
      setSubmitResult(data);
      if (data?.status === 'Accepted' && slug) {
        try {
          const u = userStorage.getSync();
          if (u?.id) {
            const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            await fetch(`/api/notifications/trigger?userId=${u.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event: 'question_solved', payload: { title } }),
            });
          }
        } catch { /* ignore */ }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomRun = async () => {
    if (!customInput.trim()) return;
    setCustomRunning(true);
    setCustomResult(null);
    setActiveTab('custom');
    try {
      const res = await fetch('/api/execute/run-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: customInput }),
      });
      const data = await res.json();
      setCustomResult({ output: data.output || '', error: typeof data.error === 'string' ? data.error : data.error?.message || '', runtime: data.runtime || 0 });
    } catch (e: any) {
      setCustomResult({ output: '', error: e.message || 'Failed', runtime: 0 });
    } finally {
      setCustomRunning(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setComplexity(null);
    setShowComplexityPopup(true);
    if (isCodeEmpty(code)) {
      setComplexity({ detected: 'N/A', reasoning: 'Write your solution code first, then analyze.', badge: 'acceptable' });
      setAnalyzing(false);
      return;
    }
    try {
      const res = await fetch('/api/execute/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: ComplexityInfo = await res.json();
      setComplexity(data);
    } catch {
      setComplexity({ detected: 'N/A', reasoning: 'Write your solution code first, then analyze.', badge: 'acceptable' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVisualize = async () => {
    setVisualizing(true);
    setVisualizeSteps([]);
    setVizStepIndex(0);
    setActiveTab('visualize');
    const input = testCases[0]?.input || '';
    try {
      const res = await fetch('/api/execute/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input }),
      });
      const data = await res.json();
      if (data.steps) setVisualizeSteps(data.steps);
      if (data.error) setError(typeof data.error === 'string' ? data.error : data.error.message || 'Unknown error');
    } catch {
      // ignore
    } finally {
      setVisualizing(false);
    }
  };

  const toggleOutput = (id: string) => {
    setExpandedOutputs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const complexityBadge = (badge: string) => {
    if (badge === 'optimal') return { label: 'Optimal', color: 'bg-success-500/10 text-success-500 border-success-500/30' };
    if (badge === 'acceptable') return { label: 'Acceptable', color: 'bg-warning-500/10 text-warning-500 border-warning-500/30' };
    return { label: 'Needs Optimization', color: 'bg-danger-500/10 text-danger-500 border-danger-500/30' };
  };

  useEffect(() => {
    if (!vizPlaying || visualizeSteps.length === 0) return;
    const timer = setInterval(() => {
      setVizStepIndex(i => {
        if (i >= visualizeSteps.length - 1) { setVizPlaying(false); return i; }
        return i + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [vizPlaying, visualizeSteps.length]);

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'testcases', label: 'Test Cases', icon: Bug },
    { key: 'result', label: 'Result', icon: Terminal },
    { key: 'custom', label: 'Custom', icon: Play },
    { key: 'complexity', label: 'Complexity', icon: BarChart3 },
    { key: 'visualize', label: 'Visualize', icon: Eye },
  ];

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4 p-3 sm:p-4" style={{ backgroundColor: '#111827' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg overflow-x-auto -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                language === lang.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-1.5 shrink-0">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 border border-white/10 text-slate-300 text-xs sm:text-sm font-medium rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>
          <button
            onClick={handleVisualize}
            disabled={visualizing}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 border border-primary-500/30 text-primary-400 text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-500/10 transition-colors disabled:opacity-50"
          >
            {visualizing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">Visualize</span>
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-success-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-success-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            Submit
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-white/10 rounded-xl overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          loading={
            <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#1E1E1E' }}>
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                <span className="text-xs text-white/40">Loading editor...</span>
              </div>
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 13 : 16,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: typeof window !== 'undefined' && window.innerWidth < 640 ? 'off' : 'on',
          }}
        />
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden shrink-0" style={{ maxHeight: '35%' }}>
        <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-400 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 41px)', backgroundColor: '#0B1020' }}>
          {activeTab === 'testcases' && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">
                Test Cases ({testCases.length})
              </h4>
              {testCases.length === 0 ? (
                <p className="text-sm text-slate-500">No test cases available</p>
              ) : (
                testCases.map((tc, i) => {
                  const existingResult = runResult?.results?.find(r => r.id === tc.id);
                  const expanded = expandedOutputs[tc.id] ?? false;
                  return (
                    <div key={tc.id} className="border border-white/10 rounded-lg overflow-hidden" style={{ backgroundColor: '#111827' }}>
                      <button
                        onClick={() => toggleOutput(tc.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {existingResult ? (
                            existingResult.output?.trim() === tc.expected_output.trim()
                              ? <CheckCircle className="w-4 h-4 text-success-500" />
                              : <XCircle className="w-4 h-4 text-danger-500" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                          )}
                          <span className="text-sm font-medium text-slate-200">Case {i + 1}</span>
                          {tc.is_hidden && (
                            <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">Hidden</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-slate-400 truncate max-w-[200px]">{tc.input}</code>
                          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-3 py-2 border-t border-white/5 space-y-1" style={{ backgroundColor: '#0B1020' }}>
                          <div className="text-xs">
                            <span className="text-slate-500">Input: </span>
                            <code className="font-mono text-slate-300">{tc.input}</code>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-500">Expected: </span>
                            <code className="font-mono text-success-500">{tc.expected_output}</code>
                          </div>
                          {existingResult && (
                            <div className="text-xs">
                              <span className="text-slate-500">Actual: </span>
                              <code className={`font-mono ${existingResult.output?.trim() === tc.expected_output.trim() ? 'text-success-500' : 'text-red-400'}`}>
                                {existingResult.output || '(no output)'}
                              </code>
                            </div>
                          )}
                          {existingResult && existingResult.runtime > 0 && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {existingResult.runtime}ms
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'result' && (
            <div className="space-y-3">
              {error && (
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {submitResult && (
                <div className={`border rounded-xl p-4 ${submitResult.status === 'Accepted' ? 'border-success-500/30 bg-success-500/10' : 'border-danger-500/30 bg-danger-500/10'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {submitResult.status === 'Accepted' ? (
                      <CheckCircle className="w-7 h-7 text-success-500" />
                    ) : (
                      <XCircle className="w-7 h-7 text-danger-500" />
                    )}
                    <div>
                      <h3 className={`text-base font-bold ${submitResult.status === 'Accepted' ? 'text-success-500' : 'text-danger-500'}`}>
                        {submitResult.status}
                      </h3>
                      <p className="text-xs text-slate-400">{submitResult.passed} / {submitResult.total} test cases passed</p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${submitResult.status === 'Accepted' ? 'bg-success-500' : 'bg-danger-500'}`}
                      style={{ width: `${(submitResult.passed / submitResult.total) * 100}%` }}
                    />
                  </div>

                  {submitResult.test_results?.length > 0 && (
                    <div className="space-y-2">
                      {submitResult.test_results.map((tr, i) => (
                        <div key={i} className={`p-3 rounded-lg text-xs ${tr.passed ? 'bg-success-500/10 text-success-400' : 'bg-danger-500/10 text-danger-400'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {tr.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="font-medium">Test {i + 1}</span>
                          </div>
                        <div className="ml-6 space-y-0.5 text-xs text-slate-300">
                          <div>Input: <code className="bg-white/5 px-1 rounded text-slate-200">{tr.input}</code></div>
                          <div>Expected: <code className="bg-white/5 px-1 rounded text-slate-200">{tr.expected}</code></div>
                          {!tr.passed && <div>Actual: <code className="bg-white/5 px-1 rounded text-slate-200">{tr.actual}</code></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!submitResult && runResult && (
                <div className="space-y-3">
                  {runResult.results?.map((r, i) => {
                    const passed = r.output?.trim() === r.expected.trim();
                    return (
                      <div key={r.id} className={`p-3 rounded-lg border text-sm ${passed ? 'border-success-500/30 bg-success-500/10' : 'border-danger-500/30 bg-danger-500/10'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {passed ? <CheckCircle className="w-4 h-4 text-success-500" /> : <XCircle className="w-4 h-4 text-danger-500" />}
                          <span className="font-medium text-slate-200">Case {i + 1}</span>
                          {r.runtime > 0 && (
                            <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3" /> {r.runtime}ms
                            </span>
                          )}
                        </div>
                        <div className="ml-6 space-y-0.5 text-xs">
                          <div className="text-slate-400">Input: <code className="bg-white/5 px-1 rounded text-slate-300">{r.input}</code></div>
                          <div className="text-slate-400">Expected: <code className="bg-white/5 px-1 rounded text-slate-300">{r.expected}</code></div>
                          <div className="text-slate-400">Actual: <code className={`px-1 rounded ${passed ? 'bg-white/5 text-success-400' : 'bg-white/5 text-red-400'}`}>{r.output}</code></div>
                          {r.error && <div className="text-red-400">Error: {r.error}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!submitResult && !runResult && !error && (
                <div className="text-center py-8 text-sm text-slate-500">
                  <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Run or submit your code to see results
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Custom Input</label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g., nums = [1,2,3], target = 4"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  rows={3}
                  style={{ backgroundColor: '#0B1020' }}
                />
              </div>
              <button
                onClick={handleCustomRun}
                disabled={customRunning || !customInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-500 transition-colors disabled:opacity-50"
              >
                {customRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Custom
              </button>

              {customResult && (
                <div className={`border rounded-lg p-3 ${customResult.error ? 'border-danger-500/30 bg-danger-500/10' : 'border-white/10'}`} style={{ backgroundColor: '#0B1020' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Output</span>
                    {customResult.runtime > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {customResult.runtime}ms
                      </span>
                    )}
                  </div>
                  <code className="text-sm font-mono whitespace-pre-wrap block">
                    {customResult.error ? (
                      <span className="text-red-400">{customResult.error}</span>
                    ) : (
                      <span className="text-success-500">{customResult.output}</span>
                    )}
                  </code>
                </div>
              )}
            </div>
          )}

          {activeTab === 'complexity' && (
            <div className="space-y-3">
              {analyzing ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing complexity...
                </div>
              ) : complexity ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/10" style={{ backgroundColor: '#111827' }}>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Detected</div>
                      <div className="text-2xl font-bold font-mono text-white">{complexity.detected}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${complexityBadge(complexity.badge).color}`}>
                      {complexityBadge(complexity.badge).label}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10" style={{ backgroundColor: '#111827' }}>
                    <div className="text-xs text-slate-400 mb-1">Reasoning</div>
                    <p className="text-sm text-slate-300">{complexity.reasoning}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-500">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Click "Analyze" to detect time complexity
                </div>
              )}
            </div>
          )}

          {activeTab === 'visualize' && (
            <div className="space-y-3">
              {visualizing ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating visualization...
                </div>
              ) : visualizeSteps.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => { setVizPlaying(false); setVizStepIndex(Math.max(0, vizStepIndex - 1)); }}
                      disabled={vizStepIndex === 0}
                      className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setVizPlaying(!vizPlaying)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium text-white ${vizPlaying ? 'bg-warning-600 hover:bg-warning-700' : 'bg-success-600 hover:bg-success-700'}`}
                    >
                      {vizPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={() => { setVizPlaying(false); setVizStepIndex(Math.min(visualizeSteps.length - 1, vizStepIndex + 1)); }}
                      disabled={vizStepIndex >= visualizeSteps.length - 1}
                      className="px-3 py-1.5 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                    <span>Step {vizStepIndex + 1} / {visualizeSteps.length}</span>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${((vizStepIndex + 1) / visualizeSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/10" style={{ backgroundColor: '#1E1E1E' }}>
                    <div className="px-4 py-2 border-b border-white/10 text-xs text-slate-400 font-mono" style={{ backgroundColor: '#111827' }}>
                      <span className="text-slate-500">Line {visualizeSteps[vizStepIndex]?.line || '-'}</span>
                    </div>
                    <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {visualizeSteps.map((step, i) => {
                        const isCurrent = i === vizStepIndex;
                        const lineNum = String(step.line).padStart(3, ' ');
                        return (
                          <div
                            key={i}
                            className={`flex ${isCurrent ? 'bg-yellow-500/20 border-l-2 border-yellow-400 -ml-4 pl-3 pr-4' : ''}`}
                          >
                            <span className="text-slate-600 select-none w-8 shrink-0">{lineNum}</span>
                            <span className={`${isCurrent ? 'text-yellow-200' : 'text-slate-300'}`}>{step.code}</span>
                          </div>
                        );
                      })}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: '#111827' }}>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Variables</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(visualizeSteps[vizStepIndex]?.vars || {}).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">{k}:</span>
                          <code className="font-mono text-slate-200 px-1.5 py-0.5 rounded border border-white/10 truncate" style={{ backgroundColor: '#0B1020' }}>{v}</code>
                        </div>
                      ))}
                      {Object.entries(visualizeSteps[vizStepIndex]?.vars || {}).filter(([, v]) => v).length === 0 && (
                        <p className="text-xs text-slate-500 col-span-3">No tracked variables at this step</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary-500/10 rounded-xl border border-primary-500/20 p-3">
                    <div className="text-xs text-primary-400 font-semibold mb-1">Current Operation</div>
                    <p className="text-sm text-slate-200">{visualizeSteps[vizStepIndex]?.description || ''}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Click "Visualize" to see step-by-step execution
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ComplexityPopup
        show={showComplexityPopup}
        onClose={() => setShowComplexityPopup(false)}
        complexity={complexity}
        analyzing={analyzing}
      />
    </div>
  );
}