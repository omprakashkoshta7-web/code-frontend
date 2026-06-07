import vm from 'vm';
import ts from 'typescript';
import { runCode } from '../runners/index';

export interface ExecutionResult {
  output: string;
  error: string | null;
  runtime: number;
  status: 'success' | 'error' | 'timeout';
}

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface SubmitResult {
  passed: number;
  total: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  test_results: { input: string; expected: string; actual: string; passed: boolean }[];
}

export interface VisualizeStep {
  line: number;
  code: string;
  vars: Record<string, string>;
  description: string;
}

export interface ComplexityResult {
  detected: string;
  reasoning: string;
  badge: 'optimal' | 'acceptable' | 'needs_optimization';
}

function wrapCode(code: string, language: string, args: any[]): string {
  if (language === 'javascript') {
    // Extract function names from the code
    const fnNames: string[] = [];
    const fnRegex = /(?:async\s+)?function\s+(\w+)\s*\(/g;
    let m;
    while ((m = fnRegex.exec(code)) !== null) {
      if (!['main', 'if', 'for', 'while', 'switch'].includes(m[1])) fnNames.push(m[1]);
    }
    const arrowRegex = /(?:const|let|var)\s+(\w+)\s*[:=]\s*(?:async\s+)?(?:\(.*=>|function)/g;
    while ((m = arrowRegex.exec(code)) !== null) fnNames.push(m[1]);
    // Fallback names if none found
    if (fnNames.length === 0) {
      fnNames.push('solution', 'solve', 'twoSum', 'maxProfit', 'containsDuplicate', 'isValid', 'search', 'isAnagram', 'isPalindrome');
    }

    return `
      const __output = [];
      const __originalLog = console.log;
      console.log = (...args) => __output.push(args.map(a => {
        if (a === null) return 'null';
        if (a === undefined) return 'undefined';
        if (Array.isArray(a)) return JSON.stringify(a);
        if (typeof a === 'object') return JSON.stringify(a);
        return String(a);
      }).join(' '));
      
      try {
        ${code}
        
        const __args = ${JSON.stringify(args)};
        const __fnNames = ${JSON.stringify(fnNames)};
        for (const __name of __fnNames) {
          try {
            if (typeof eval(__name) === 'function') {
              const __result = eval(__name)(...__args);
              if (__result !== undefined && __result !== null) {
                __output.push(Array.isArray(__result) ? JSON.stringify(__result) : String(__result));
              }
              break;
            }
          } catch(e) {
            if (e.message && !e.message.includes('is not a function') && !e.message.includes('is not defined')) {
              __output.push('Error: ' + e.message);
              break;
            }
          }
        }
      } catch(e) {
        console.log = __originalLog;
        throw e;
      }
      
      console.log = __originalLog;
      __output.join('\\n');
    `;
  }
  return code;
}

function wrapVisualizeCode(code: string, language: string, args: any[]): string {
  if (language !== 'javascript') return code;

  const fnNames: string[] = [];
  const fnRegex = /(?:async\s+)?function\s+(\w+)\s*\(/g;
  let m;
  while ((m = fnRegex.exec(code)) !== null) {
    if (!['main', 'if', 'for', 'while'].includes(m[1])) fnNames.push(m[1]);
  }
  if (fnNames.length === 0) fnNames.push('solution', 'solve', 'twoSum');

  const lines = code.split('\n');
  const instrumentedLines = lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('}') || trimmed.startsWith('{')) {
      return line;
    }
    if (trimmed.startsWith('function') || trimmed.startsWith('if') || trimmed.startsWith('else') || trimmed.startsWith('for') || trimmed.startsWith('while') || trimmed.startsWith('return') || trimmed.startsWith('const') || trimmed.startsWith('let') || trimmed.startsWith('var')) {
      const varCapture = 'try { const __vars__ = {';
      const varNames = ['i', 'j', 'k', 'n', 'm', 'left', 'right', 'mid', 'target', 'sum', 'count', 'max', 'min', 'key', 'val', 'result', 'current', 'index', 'start', 'end', 'low', 'high', 'slow', 'fast', 'prev', 'temp', 'curr', 'node', 'head', 'tail', 'arr', 'num', 'nums', 'complement', 'map', 'set', 'stack', 'queue', 'seen', 'profit', 'price', 'buy', 'sell'];
      return line + ` __trace.push({line:${i+1},code:${JSON.stringify(trimmed)},vars:__getVars(),description:${JSON.stringify(trimmed)}});`;
    }
    return line + ` __trace.push({line:${i+1},code:${JSON.stringify(trimmed)},vars:__getVars(),description:${JSON.stringify(trimmed)}});`;
  });

  return `
    const __trace = [];
    const __getVars = () => {
      const v = {};
      ['i','j','k','n','m','left','right','mid','target','sum','count','max','min','key','val','result','current','index','start','end','low','high','slow','fast','prev','temp','curr','node','head','tail','arr','num','nums','complement','map','set','stack','queue','seen','profit','price','buy','sell'].forEach(k => {
        try { v[k] = JSON.stringify(eval(k)); } catch {}
      });
      return v;
    };
    try {
      ${instrumentedLines.join('\n')}
      
      const __args = ${JSON.stringify(args)};
      const __fnNames = ${JSON.stringify(fnNames)};
      for (const __name of __fnNames) {
        try {
          if (typeof eval(__name) === 'function') {
            eval(__name)(...__args);
            break;
          }
        } catch(e) {}
      }
    } catch(e) {}
    JSON.stringify(__trace);
  `;
}

function parseInputArgs(inputStr: string): any[] {
  const args: any[] = [];
  const numsMatch = inputStr.match(/nums\s*=\s*(\[[\d,\s\-]*\])/);
  const targetMatch = inputStr.match(/target\s*=\s*(\d+)/);
  const sMatch = inputStr.match(/s\s*=\s*"([^"]*)"/);
  const tMatch = inputStr.match(/t\s*=\s*"([^"]*)"/);
  const pricesMatch = inputStr.match(/prices\s*=\s*(\[[\d,\s\-]*\])/);
  const headMatch = inputStr.match(/head\s*=\s*(\[[\d,\s]*\])/);
  const list1Match = inputStr.match(/list1\s*=\s*(\[[\d,\s]*\])/);
  const list2Match = inputStr.match(/list2\s*=\s*(\[[\d,\s]*\])/);

  if (numsMatch) args.push(JSON.parse(numsMatch[1]));
  if (targetMatch) args.push(Number(targetMatch[1]));
  if (sMatch) args.push(sMatch[1]);
  if (tMatch) args.push(tMatch[1]);
  if (pricesMatch) args.push(JSON.parse(pricesMatch[1]));
  if (headMatch) args.push(JSON.parse(headMatch[1]));
  if (list1Match) args.push(JSON.parse(list1Match[1]));
  if (list2Match) args.push(JSON.parse(list2Match[1]));

  // Generic single number parameter (e.g., n, k, numCourses)
  if (args.length === 0) {
    const nMatch = inputStr.match(/\b([a-zA-Z]\w*)\s*=\s*(\d+)/);
    const arrMatch = inputStr.match(/(\[[\d,\s\-]*\])/);
    const numMatch = inputStr.match(/(\d+)/);
    if (nMatch) {
      args.push(Number(nMatch[2]));
    } else if (arrMatch) args.push(JSON.parse(arrMatch[1]));
    else if (numMatch) args.push(Number(numMatch[1]));
  }

  return args;
}

export function isCodeEmpty(code: string): boolean {
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

export function analyzeComplexity(code: string): ComplexityResult {
  if (isCodeEmpty(code)) {
    return { detected: 'N/A', reasoning: 'Write your solution code first, then analyze.', badge: 'acceptable' };
  }
  const hasSort = /\.sort\s*\(/.test(code);
  const hasMap = /\bMap\b/.test(code);
  const hasSet = /\bSet\b/.test(code);

  const hasRecursion = (() => {
    const fnName = code.match(/function\s+(\w+)/)?.[1];
    return fnName ? code.includes(fnName + '(') && code.indexOf(fnName + '(') !== code.indexOf('function ' + fnName) : false;
  })();

  const findLoopBody = (code: string, fromIndex: number): { start: number; end: number } => {
    let i = fromIndex;
    while (i < code.length && code[i] !== '(') i++;
    if (i >= code.length) return { start: fromIndex, end: i };
    let parenDepth = 1;
    i++;
    while (i < code.length && parenDepth > 0) {
      if (code[i] === '(') parenDepth++;
      if (code[i] === ')') parenDepth--;
      i++;
    }
    while (i < code.length && code[i] !== '{') i++;
    if (i >= code.length) return { start: fromIndex, end: i };
    let braceDepth = 1;
    i++;
    while (i < code.length && braceDepth > 0) {
      if (code[i] === '{') braceDepth++;
      if (code[i] === '}') braceDepth--;
      i++;
    }
    return { start: fromIndex, end: i };
  };

  const loops: { start: number; end: number }[] = [];
  const loopRe = /\b(for|while)\s*\(/g;
  let m;
  while ((m = loopRe.exec(code)) !== null) {
    loops.push(findLoopBody(code, m.index));
  }

  let maxDepth = 0;
  for (let i = 0; i < loops.length; i++) {
    let depth = 1;
    for (let j = 0; j < loops.length; j++) {
      if (i !== j && loops[j].start < loops[i].start && loops[j].end > loops[i].end) {
        depth++;
      }
    }
    maxDepth = Math.max(maxDepth, depth);
  }

  let detected = 'O(1)';
  let reasoning = '';
  let badge: ComplexityResult['badge'] = 'optimal';

  if (hasRecursion) {
    detected = 'O(2^n)';
    reasoning = 'Recursive calls without memoization';
    badge = 'needs_optimization';
  } else if (maxDepth >= 2) {
    detected = 'O(n²)';
    reasoning = 'Nested loops detected';
    badge = 'needs_optimization';
  } else if (hasSort) {
    detected = 'O(n log n)';
    reasoning = 'Sorting operation dominates';
    badge = 'acceptable';
  } else if (maxDepth >= 1) {
    detected = hasMap || hasSet ? 'O(n)' : 'O(n)';
    reasoning = hasMap || hasSet ? 'Single pass with HashMap/Set' : 'Single loop iteration';
    badge = 'optimal';
  } else {
    detected = 'O(1)';
    reasoning = 'No loops detected';
    badge = 'optimal';
  }

  return { detected, reasoning, badge };
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function aiAnalyzeComplexity(code: string, language: string): Promise<ComplexityResult> {
  if (!code.trim() || code.length < 20 || isCodeEmpty(code)) {
    return { detected: 'N/A', reasoning: 'Write your solution code first, then analyze.', badge: 'acceptable' };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'CodeSprout',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [
          {
            role: 'system',
            content: `You are a DSA complexity analyzer. Analyze the given ${language} code and return ONLY valid JSON with NO markdown, NO code fences, NO extra text.

Return exactly:
{"detected":"<time complexity>","reasoning":"<1-2 sentence explanation mentioning data structures and loops>","badge":"<optimal|acceptable|needs_optimization>"}

Rules:
- If code has no loops/recursion → O(1), optimal
- Single loop → O(n), optimal
- Two nested loops → O(n²), needs_optimization
- Sorting + loop → O(n log n), acceptable
- Recursion without memo → O(2^n) or O(n!) based on branching, needs_optimization
- Hash/Set inside a loop → mention "on average O(n)"
- Binary search / divide and conquer → O(log n), optimal
- If multiple complexities, pick the dominant one
- badge mapping: O(1)/O(log n)/O(n) → optimal, O(n log n) → acceptable, O(n²)/O(2^n)/O(n!) → needs_optimization`,
          },
          { role: 'user', content: `Code:\n\`\`\`${language}\n${code}\n\`\`\`` },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('[AI] Complexity analysis error:', await response.text());
      return analyzeComplexity(code);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*"detected"[\s\S]*"badge"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI] Could not parse response:', content);
      return analyzeComplexity(code);
    }

    const result: ComplexityResult = JSON.parse(jsonMatch[0]);
    if (!result.detected || !result.reasoning || !result.badge) {
      return analyzeComplexity(code);
    }

    return result;
  } catch (err: any) {
    console.error('[AI] Complexity analysis failed:', err.message);
    return analyzeComplexity(code);
  }
}

export function executeVisualize(code: string, language: string, input: string): { steps: VisualizeStep[]; error: string | null } {
  if (language !== 'javascript') {
    return { steps: [], error: 'Visualization only supports JavaScript' };
  }

  try {
    let jsCode = code;
    const hasTypeScript = /:\s*(number|string|boolean|any|void|never|unknown|Array<|Map<|\[\])/.test(code) ||
      /interface\s+\w+/.test(code) ||
      /<\w+>/.test(code);

    if (hasTypeScript) {
      try {
        jsCode = ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, strict: false, esModuleInterop: true, skipLibCheck: true },
        }).outputText;
      } catch {
        jsCode = code;
      }
    }

    const args = input ? parseInputArgs(input) : [];
    const wrappedCode = wrapVisualizeCode(jsCode, language, args);

    const sandbox: any = {
      console: { log: (...args: any[]) => {} },
      JSON, Math, Array, Object, String, Number, Boolean, Map, Set, RegExp, Date,
      parseInt, parseFloat, isNaN, isFinite, undefined, NaN, Infinity,
      setTimeout: undefined, setInterval: undefined, fetch: undefined, require: undefined, process: undefined, global: undefined,
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);
    const result = script.runInContext(context, { timeout: 5000 });

    const steps = result ? JSON.parse(String(result)) : [];
    return { steps, error: null };
  } catch (e: any) {
    return { steps: [], error: e.message || 'Visualization failed' };
  }
}

export function executeCode(code: string, language: string, input: string): ExecutionResult {
  const start = Date.now();

  if (language !== 'javascript') {
    const runnerResult = runCode(code, language);
    return {
      output: runnerResult.output,
      error: runnerResult.error || null,
      runtime: runnerResult.runtime,
      status: runnerResult.status as 'success' | 'error' | 'timeout',
    };
  }

  try {
    let jsCode = code;
    const hasTypeScript = /:\s*(number|string|boolean|any|void|never|unknown|Array<|Map<|\[\])/.test(code) ||
      /interface\s+\w+/.test(code) ||
      /<\w+>/.test(code);

    if (hasTypeScript) {
      try {
        jsCode = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            strict: false,
            esModuleInterop: true,
            skipLibCheck: true,
          },
        }).outputText;
      } catch {
        jsCode = code;
      }
    }

    const args = input ? parseInputArgs(input) : [];
    const wrappedCode = wrapCode(jsCode, language, args);
    const sandbox: any = {
      console: { log: (...args: any[]) => {} },
      JSON,
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      RegExp,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      undefined,
      NaN,
      Infinity,
      setTimeout: undefined,
      setInterval: undefined,
      fetch: undefined,
      require: undefined,
      process: undefined,
      global: undefined,
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);
    const result = script.runInContext(context, { timeout: 5000 });

    const runtime = Date.now() - start;
    return {
      output: String(result || ''),
      error: null,
      runtime,
      status: 'success',
    };
  } catch (e: any) {
    const runtime = Date.now() - start;
    if (e.message?.includes('Script execution timed out')) {
      return { output: '', error: 'Time Limit Exceeded (5s limit)', runtime, status: 'timeout' };
    }
    return { output: '', error: e.message || 'Runtime Error', runtime, status: 'error' };
  }
}

export function runTestCases(code: string, language: string, testCases: TestCase[], slug?: string): SubmitResult {
  const results: SubmitResult['test_results'] = [];
  let passed = 0;

  for (const tc of testCases) {
    try {
      let codeToRun = code;
      if (language !== 'javascript' && slug) {
        const { generateDriver, extractFunctionName } = require('../drivers/driverGenerator');
        const fnName = extractFunctionName(code, language);
        codeToRun = generateDriver(code, language, [{ input: tc.input, expected: tc.expected_output }], fnName);
      }
      const result = executeCode(codeToRun, language, tc.input);
      const actual = result.output.trim();
      const expected = tc.expected_output.trim();
      const normalize = (s: string) => { try { return JSON.stringify(JSON.parse(s.toLowerCase())); } catch { return s.toLowerCase(); } };
      const isPassed = normalize(actual) === normalize(expected);
      if (isPassed) passed++;
      results.push({
        input: tc.input,
        expected: expected,
        actual: actual,
        passed: isPassed,
      });
    } catch {
      results.push({
        input: tc.input,
        expected: tc.expected_output,
        actual: 'Runtime Error',
        passed: false,
      });
    }
  }

  let status: SubmitResult['status'] = 'Wrong Answer';
  if (passed === testCases.length) status = 'Accepted';
  else if (results.some((r) => r.actual === 'Time Limit Exceeded')) status = 'Time Limit Exceeded';
  else if (results.some((r) => r.actual === 'Runtime Error')) status = 'Runtime Error';

  return { passed, total: testCases.length, status, test_results: results };
}
