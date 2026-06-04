export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  type: 'quiz';
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface CodeChallenge {
  type: 'code';
  id: string;
  q: string;
  hint: string;
  starter: string;
  tests: { input: string; expected: string; visible?: boolean }[];
  answer: string;
  explanation: string;
}

export type GameQuestion = QuizQuestion | CodeChallenge;

export interface LevelData {
  easy: GameQuestion[];
  medium: GameQuestion[];
  hard: GameQuestion[];
}

const easyQ = (id: string, q: string, options: string[], answer: number, explanation: string): QuizQuestion => ({
  type: 'quiz', id, q, options, answer, explanation,
});

const codeQ = (
  id: string, q: string, hint: string, starter: string,
  tests: { input: string; expected: string; visible?: boolean }[],
  answer: string, explanation: string,
): CodeChallenge => ({ type: 'code', id, q, hint, starter, tests, answer, explanation });

export const GAMES_BY_TOPIC: Record<string, LevelData> = {
  Arrays: {
    easy: [
      easyQ('arr-e-1', 'What is the index of the first element in an array?', ['0', '1', '-1', '2'], 0, 'Arrays in most languages (including JS) are 0-indexed.'),
      easyQ('arr-e-2', 'Which operation is O(1) on an array?', ['Access by index', 'Linear search', 'Insert at start', 'Remove from middle'], 0, 'Direct index access is constant time.'),
      codeQ('arr-e-3', 'Find the maximum number in an array.', 'Track the largest seen so far.', `function max(arr) {
  // your code
  return 0;
}`,
        [{ input: '[3, 1, 4, 1, 5, 9, 2, 6]', expected: '9', visible: true }, { input: '[-5, -2, -8]', expected: '-2' }],
        `function max(arr) {
  let m = arr[0];
  for (let i = 1; i < arr.length; i++) if (arr[i] > m) m = arr[i];
  return m;
}`,
        'Track max while iterating.',
      ),
    ],
    medium: [
      codeQ('arr-m-1', 'Reverse an array in place.', 'Swap elements from both ends moving inward.', `function reverse(arr) {
  // your code
  return arr;
}`,
        [{ input: '[1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]', visible: true }, { input: '[1, 2]', expected: '[2, 1]' }],
        `function reverse(arr) {
  let l = 0, r = arr.length - 1;
  while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
  return arr;
}`,
        'Two-pointer swap technique.',
      ),
      easyQ('arr-m-2', 'Two-sum problem: best approach for sorted array?', ['Brute force O(n²)', 'Two pointers O(n)', 'HashMap O(n)', 'Binary search O(n log n)'], 1, 'Two pointers on a sorted array runs in O(n).'),
    ],
    hard: [
      codeQ('arr-h-1', 'Find the longest subarray with sum equal to k.', 'Use prefix sum + HashMap for O(n).', `function longestSubarray(arr, k) {
  // your code
  return 0;
}`,
        [{ input: '[1, -1, 5, -2, 3], k=3', expected: '4', visible: true }, { input: '[-2, -1, 2, 1], k=1', expected: '2' }],
        `function longestSubarray(arr, k) {
  const map = new Map([[0, -1]]);
  let sum = 0, best = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (map.has(sum - k)) best = Math.max(best, i - map.get(sum - k));
    if (!map.has(sum)) map.set(sum, i);
  }
  return best;
}`,
        'Prefix sum + map remembers earliest index for each sum.',
      ),
    ],
  },
  Strings: {
    easy: [
      easyQ('str-e-1', 'Which method returns the length of a string in JS?', ['size()', 'length', 'count()', 'len'], 1, 'Strings have a .length property in JavaScript.'),
      codeQ('str-e-2', 'Check if a string is a palindrome.', 'Compare characters from both ends.', `function isPalindrome(s) {
  // your code
  return false;
}`,
        [{ input: '"racecar"', expected: 'true', visible: true }, { input: '"hello"', expected: 'false' }],
        `function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  while (l < r) { if (s[l] !== s[r]) return false; l++; r--; }
  return true;
}`,
        'Two-pointer mirror check.',
      ),
    ],
    medium: [
      codeQ('str-m-1', 'Reverse the words in a sentence.', 'Split, reverse, join.', `function reverseWords(s) {
  // your code
  return '';
}`,
        [{ input: '"the sky is blue"', expected: '"blue is sky the"', visible: true }, { input: '"hello world"', expected: '"world hello"' }],
        `function reverseWords(s) {
  return s.trim().split(/\\s+/).reverse().join(' ');
}`,
        'Trim, split on whitespace, reverse, join.',
      ),
    ],
    hard: [
      codeQ('str-h-1', 'Longest substring without repeating characters.', 'Sliding window with Set.', `function lengthOfLongest(s) {
  // your code
  return 0;
}`,
        [{ input: '"abcabcbb"', expected: '3', visible: true }, { input: '"pwwkew"', expected: '3' }],
        `function lengthOfLongest(s) {
  const set = new Set();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    while (set.has(s[r])) { set.delete(s[l]); l++; }
    set.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
        'Sliding window + Set tracks unique chars in current window.',
      ),
    ],
  },
  Hashing: {
    easy: [
      easyQ('hsh-e-1', 'Average time complexity of HashMap lookup?', ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], 2, 'HashMap provides O(1) average lookup.'),
      codeQ('hsh-e-2', 'Count frequency of each character in a string.', 'Use a Map to tally.', `function freq(s) {
  // your code
  return {};
}`,
        [{ input: '"aabbc"', expected: '{"a":2,"b":2,"c":1}', visible: true }, { input: '"x"', expected: '{"x":1}' }],
        `function freq(s) {
  const m = {};
  for (const c of s) m[c] = (m[c] || 0) + 1;
  return m;
}`,
        'Single pass tally with object.',
      ),
    ],
    medium: [
      codeQ('hsh-m-1', 'Two-sum: return indices of two numbers that add to target.', 'Map stores value → index.', `function twoSum(arr, t) {
  // your code
  return [];
}`,
        [{ input: '[2, 7, 11, 15], 9', expected: '[0,1]', visible: true }, { input: '[3, 2, 4], 6', expected: '[1,2]' }],
        `function twoSum(arr, t) {
  const m = new Map();
  for (let i = 0; i < arr.length; i++) {
    const need = t - arr[i];
    if (m.has(need)) return [m.get(need), i];
    m.set(arr[i], i);
  }
  return [];
}`,
        'HashMap gives O(n) two-sum.',
      ),
    ],
    hard: [
      codeQ('hsh-h-1', 'Longest consecutive sequence.', 'Convert to Set, then grow from each sequence start.', `function longestConsec(arr) {
  // your code
  return 0;
}`,
        [{ input: '[100, 4, 200, 1, 3, 2]', expected: '4', visible: true }, { input: '[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', expected: '9' }],
        `function longestConsec(arr) {
  const s = new Set(arr);
  let best = 0;
  for (const n of s) {
    if (!s.has(n - 1)) {
      let len = 1, x = n + 1;
      while (s.has(x)) { x++; len++; }
      best = Math.max(best, len);
    }
  }
  return best;
}`,
        'Only start counting from sequence minimums.',
      ),
    ],
  },
  'Two Pointers': {
    easy: [
      easyQ('tp-e-1', 'Two-pointer technique is most useful on:', ['Unsorted arrays', 'Sorted data or arrays', 'HashMaps', 'Trees'], 1, 'Two pointers shines on sorted arrays and palindromes.'),
      codeQ('tp-e-2', 'Check if array is sorted ascending.', 'Walk with two pointers.', `function isSorted(arr) {
  // your code
  return true;
}`,
        [{ input: '[1, 2, 3, 4]', expected: 'true', visible: true }, { input: '[1, 3, 2]', expected: 'false' }],
        `function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false;
  return true;
}`,
        'Each next must be ≥ previous.',
      ),
    ],
    medium: [
      codeQ('tp-m-1', 'Container with most water.', 'Two pointers, move shorter side.', `function maxWater(h) {
  // your code
  return 0;
}`,
        [{ input: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', expected: '49', visible: true }, { input: '[1, 1]', expected: '1' }],
        `function maxWater(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    const area = (r - l) * Math.min(h[l], h[r]);
    best = Math.max(best, area);
    if (h[l] < h[r]) l++; else r--;
  }
  return best;
}`,
        'Move the shorter side; area can only grow that way.',
      ),
    ],
    hard: [
      codeQ('tp-h-1', '3Sum: find all unique triplets that sum to 0.', 'Sort + fix i + two pointers for j, k.', `function threeSum(nums) {
  // your code
  return [];
}`,
        [{ input: '[-1, 0, 1, 2, -1, -4]', expected: '[[-1,-1,2],[-1,0,1]]', visible: true }, { input: '[0, 1, 1]', expected: '[]' }],
        `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) { res.push([nums[i], nums[l], nums[r]]); while (nums[l] === nums[l + 1]) l++; while (nums[r] === nums[r - 1]) r--; l++; r--; }
      else if (s < 0) l++; else r--;
    }
  }
  return res;
}`,
        'Classic 3Sum with duplicate-skipping.',
      ),
    ],
  },
  'Sliding Window': {
    easy: [
      easyQ('sw-e-1', 'Sliding window is best for problems involving:', ['Single elements', 'Contiguous subarrays/substrings', 'Disjoint sets', 'Trees'], 1, 'It works on contiguous sequences.'),
    ],
    medium: [
      codeQ('sw-m-1', 'Max sum subarray of size k.', 'Maintain a running sum of the window.', `function maxSumK(arr, k) {
  // your code
  return 0;
}`,
        [{ input: '[2, 1, 5, 1, 3, 2], 3', expected: '9', visible: true }, { input: '[2, 3, 4, 1, 5], 2', expected: '7' }],
        `function maxSumK(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum;
  for (let i = k; i < arr.length; i++) { sum += arr[i] - arr[i - k]; best = Math.max(best, sum); }
  return best;
}`,
        'Slide the window, add new, drop old.',
      ),
    ],
    hard: [
      codeQ('sw-h-1', 'Minimum size subarray sum.', 'Variable window grows until sum ≥ target, then shrinks.', `function minSubLen(t, arr) {
  // your code
  return 0;
}`,
        [{ input: '7, [2, 3, 1, 2, 4, 3]', expected: '2', visible: true }, { input: '4, [1, 4, 4]', expected: '1' }],
        `function minSubLen(t, arr) {
  let l = 0, sum = 0, best = Infinity;
  for (let r = 0; r < arr.length; r++) {
    sum += arr[r];
    while (sum >= t) { best = Math.min(best, r - l + 1); sum -= arr[l]; l++; }
  }
  return best === Infinity ? 0 : best;
}`,
        'Classic variable sliding window.',
      ),
    ],
  },
  Stack: {
    easy: [
      easyQ('stk-e-1', 'Stack follows which order?', ['FIFO', 'LIFO', 'Random', 'Priority'], 1, 'LIFO = Last In First Out.'),
    ],
    medium: [
      codeQ('stk-m-1', 'Valid parentheses.', 'Push open, pop on close, check match.', `function valid(s) {
  // your code
  return false;
}`,
        [{ input: '"()[]{}"', expected: 'true', visible: true }, { input: '"(]"', expected: 'false' }],
        `function valid(s) {
  const map = { ')': '(', ']': '[', '}': '{' };
  const st = [];
  for (const c of s) {
    if (c in map) { if (st.pop() !== map[c]) return false; }
    else st.push(c);
  }
  return st.length === 0;
}`,
        'Stack with matching pairs.',
      ),
    ],
    hard: [
      codeQ('stk-h-1', 'Largest rectangle in histogram.', 'Monotonic stack of indices.', `function largestRect(h) {
  // your code
  return 0;
}`,
        [{ input: '[2, 1, 5, 6, 2, 3]', expected: '10', visible: true }, { input: '[2, 4]', expected: '4' }],
        `function largestRect(h) {
  const st = []; let best = 0;
  for (let i = 0; i <= h.length; i++) {
    const cur = i === h.length ? 0 : h[i];
    while (st.length && h[st[st.length - 1]] > cur) {
      const idx = st.pop(); const w = st.length ? i - st[st.length - 1] - 1 : i;
      best = Math.max(best, h[idx] * w);
    }
    st.push(i);
  }
  return best;
}`,
        'Monotonic increasing stack trick.',
      ),
    ],
  },
  Queue: {
    easy: [
      easyQ('qu-e-1', 'Queue follows which order?', ['LIFO', 'FIFO', 'Random', 'Sorted'], 1, 'FIFO = First In First Out.'),
    ],
    medium: [
      codeQ('qu-m-1', 'Implement stack using two queues.', 'On push, rotate.', `function StackTwoQ() {
  const q1 = [], q2 = [];
  this.push = (x) => { q1.push(x); };
  this.pop = () => { while (q1.length > 1) q2.push(q1.shift()); const v = q1.shift(); [q1.length, q2.length] = [q2.length, q1.length]; return v; };
}`,
        [{ input: 'push 1, push 2, pop', expected: '2', visible: true }, { input: 'push 5, pop, pop', expected: '5' }],
        `class Stack {
  constructor() { this.q1 = []; this.q2 = []; }
  push(x) { this.q1.push(x); }
  pop() { while (this.q1.length > 1) this.q2.push(this.q1.shift()); const v = this.q1.shift(); [this.q1, this.q2] = [this.q2, this.q1]; return v; }
}`,
        'Rotate on pop.',
      ),
    ],
    hard: [
      codeQ('qu-h-1', 'Sliding window maximum.', 'Deque stores indices of useful elements.', `function maxSliding(arr, k) {
  // your code
  return [];
}`,
        [{ input: '[1, 3, -1, -3, 5, 3, 6, 7], 3', expected: '[3, 3, 5, 5, 6, 7]', visible: true }, { input: '[1], 1', expected: '[1]' }],
        `function maxSliding(arr, k) {
  const dq = [], res = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && arr[dq[dq.length - 1]] < arr[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(arr[dq[0]]);
  }
  return res;
}`,
        'Monotonic deque maintains max in current window.',
      ),
    ],
  },
  'Binary Search': {
    easy: [
      easyQ('bs-e-1', 'Binary search requires:', ['Unsorted array', 'Sorted array', 'HashMap', 'Tree'], 1, 'Binary search works on sorted data.'),
    ],
    medium: [
      codeQ('bs-m-1', 'Find first occurrence of target.', 'Continue searching left after match.', `function firstIdx(arr, t) {
  // your code
  return -1;
}`,
        [{ input: '[1, 2, 2, 2, 3], 2', expected: '1', visible: true }, { input: '[1, 2, 3], 4', expected: '-1' }],
        `function firstIdx(arr, t) {
  let l = 0, r = arr.length - 1, ans = -1;
  while (l <= r) { const m = (l + r) >> 1; if (arr[m] === t) { ans = m; r = m - 1; } else if (arr[m] < t) l = m + 1; else r = m - 1; }
  return ans;
}`,
        'Standard first-occurrence binary search.',
      ),
    ],
    hard: [
      codeQ('bs-h-1', 'Search in rotated sorted array.', 'Determine which half is sorted.', `function searchRotated(arr, t) {
  // your code
  return -1;
}`,
        [{ input: '[4, 5, 6, 7, 0, 1, 2], 0', expected: '4', visible: true }, { input: '[4, 5, 6, 7, 0, 1, 2], 3', expected: '-1' }],
        `function searchRotated(arr, t) {
  let l = 0, r = arr.length - 1;
  while (l <= r) { const m = (l + r) >> 1; if (arr[m] === t) return m; if (arr[l] <= arr[m]) { if (t >= arr[l] && t < arr[m]) r = m - 1; else l = m + 1; } else { if (t > arr[m] && t <= arr[r]) l = m + 1; else r = m - 1; } }
  return -1;
}`,
        'Check which side is sorted, then go that way.',
      ),
    ],
  },
  'Linked List': {
    easy: [
      easyQ('ll-e-1', 'Linked list node typically has:', ['data + pointer to next', 'only data', 'two arrays', 'a tree'], 0, 'Node = value + next reference.'),
    ],
    medium: [
      codeQ('ll-m-1', 'Reverse a singly linked list.', 'Iteratively flip next pointers.', `function reverse(head) {
  // your code
  return null;
}`,
        [{ input: '1->2->3->4', expected: '4->3->2->1', visible: true }, { input: '1->2', expected: '2->1' }],
        `function reverse(head) {
  let prev = null, cur = head;
  while (cur) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; }
  return prev;
}`,
        'Classic iterative reversal.',
      ),
    ],
    hard: [
      codeQ('ll-h-1', 'Merge k sorted linked lists.', 'Use min-heap or pairwise merge.', `function mergeKLists(lists) {
  // your code
  return null;
}`,
        [{ input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]', visible: true }, { input: '[]', expected: '[]' }],
        `function mergeKLists(lists) {
  if (!lists.length) return null;
  while (lists.length > 1) {
    const a = lists.shift(), b = lists.shift();
    const merged = merge(a, b);
    lists.push(merged);
  }
  return lists[0];
  function merge(a, b) {
    const d = { next: null }; let t = d;
    while (a && b) { if (a.val < b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; } t = t.next; }
    t.next = a || b; return d.next;
  }
}`,
        'Pairwise merge with helper.',
      ),
    ],
  },
  Trees: {
    easy: [
      easyQ('tr-e-1', 'Binary tree max children per node?', ['1', '2', '3', '4'], 1, 'Binary tree = max 2 children.'),
    ],
    medium: [
      codeQ('tr-m-1', 'Inorder traversal (iterative).', 'Use stack to simulate recursion.', `function inorder(root) {
  // your code
  return [];
}`,
        [{ input: 'tree(1,null,2,3)', expected: '[1, 3, 2]', visible: true }, { input: 'empty', expected: '[]' }],
        `function inorder(root) {
  const res = [], st = []; let cur = root;
  while (cur || st.length) { while (cur) { st.push(cur); cur = cur.left; } cur = st.pop(); res.push(cur.val); cur = cur.right; }
  return res;
}`,
        'Push lefts, pop, go right.',
      ),
    ],
    hard: [
      codeQ('tr-h-1', 'Lowest common ancestor of BST.', 'Use BST ordering.', `function lcaBST(root, p, q) {
  // your code
  return null;
}`,
        [{ input: 'BST(6,2,8,0,4,7,9), p=2, q=8', expected: '6', visible: true }, { input: 'BST(6,2,8,0,4,7,9), p=2, q=4', expected: '2' }],
        `function lcaBST(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) root = root.left;
    else if (p.val > root.val && q.val > root.val) root = root.right;
    else return root;
  }
  return null;
}`,
        'LCA is the split point of p and q.',
      ),
    ],
  },
  Graphs: {
    easy: [
      easyQ('gr-e-1', 'BFS uses which data structure?', ['Stack', 'Queue', 'Heap', 'Tree'], 1, 'BFS uses a queue.'),
    ],
    medium: [
      codeQ('gr-m-1', 'Number of islands (BFS).', 'Flood-fill connected 1s.', `function numIslands(grid) {
  // your code
  return 0;
}`,
        [{ input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', expected: '2', visible: true }, { input: '[["1","1","1"]]', expected: '1' }],
        `function numIslands(grid) {
  let count = 0;
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c] === '1') { count++; const q = [[r, c]]; while (q.length) { const [x, y] = q.shift(); if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length || grid[x][y] !== '1') continue; grid[x][y] = '0'; q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); } }
  return count;
}`,
        'Mark visited by flipping 1→0.',
      ),
    ],
    hard: [
      codeQ('gr-h-1', 'Word ladder length (BFS).', 'BFS from beginWord, one letter at a time.', `function ladderLength(begin, end, list) {
  // your code
  return 0;
}`,
        [{ input: '"hit","cog",["hot","dot","dog","lot","log","cog"]', expected: '5', visible: true }, { input: '"hit","cog",["hot","dot","dog","lot","log"]', expected: '0' }],
        `function ladderLength(begin, end, list) {
  const s = new Set(list); if (!s.has(end)) return 0;
  let q = [begin], level = 1;
  while (q.length) { const next = []; for (const w of q) { const arr = w.split(''); for (let i = 0; i < arr.length; i++) for (let c = 97; c < 123; c++) { const old = arr[i]; arr[i] = String.fromCharCode(c); const nw = arr.join(''); if (nw === end) return level + 1; if (s.has(nw)) { s.delete(nw); next.push(nw); } arr[i] = old; } } q = next; level++; }
  return 0;
}`,
        'BFS levels = transformation count.',
      ),
    ],
  },
  'Dynamic Programming': {
    easy: [
      easyQ('dp-e-1', 'DP is mainly about:', ['Random guessing', 'Storing subproblem results', 'Sorting', 'Hashing'], 1, 'Memoize to avoid recomputation.'),
    ],
    medium: [
      codeQ('dp-m-1', 'Climbing stairs (1 or 2 steps).', 'fib(i) = fib(i-1) + fib(i-2).', `function climbStairs(n) {
  // your code
  return 0;
}`,
        [{ input: '2', expected: '2', visible: true }, { input: '5', expected: '8' }],
        `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) { const c = a + b; a = b; b = c; }
  return b;
}`,
        'It is Fibonacci in disguise.',
      ),
    ],
    hard: [
      codeQ('dp-h-1', 'Longest increasing subsequence (O(n²)).', 'DP[i] = LIS ending at i.', `function lis(nums) {
  // your code
  return 0;
}`,
        [{ input: '[10, 9, 2, 5, 3, 7, 101, 18]', expected: '4', visible: true }, { input: '[0, 1, 0, 3, 2, 3]', expected: '4' }],
        `function lis(nums) {
  const dp = new Array(nums.length).fill(1);
  let best = 0;
  for (let i = 0; i < nums.length; i++) { for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1); best = Math.max(best, dp[i]); }
  return best;
}`,
        'Inner loop scans for any earlier smaller element.',
      ),
    ],
  },
  Greedy: {
    easy: [
      easyQ('gy-e-1', 'Greedy picks the:', ['Best immediate choice', 'Random choice', 'Last choice', 'Worst choice'], 0, 'Greedy makes locally optimal decisions.'),
    ],
    medium: [
      codeQ('gy-m-1', 'Jump game (can reach last index).', 'Track farthest reachable.', `function canJump(nums) {
  // your code
  return false;
}`,
        [{ input: '[2, 3, 1, 1, 4]', expected: 'true', visible: true }, { input: '[3, 2, 1, 0, 4]', expected: 'false' }],
        `function canJump(nums) {
  let far = 0;
  for (let i = 0; i < nums.length; i++) { if (i > far) return false; far = Math.max(far, i + nums[i]); }
  return true;
}`,
        'Update farthest reachable greedily.',
      ),
    ],
    hard: [
      codeQ('gy-h-1', 'Gas station circuit.', 'If total gas ≥ total cost, a start exists.', `function canCircuit(g, c) {
  // your code
  return -1;
}`,
        [{ input: 'g=[1,2,3,4,5], c=[3,4,5,1,2]', expected: '3', visible: true }, { input: 'g=[2,3,4], c=[3,4,3]', expected: '-1' }],
        `function canCircuit(g, c) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < g.length; i++) { total += g[i] - c[i]; tank += g[i] - c[i]; if (tank < 0) { start = i + 1; tank = 0; } }
  return total >= 0 ? start : -1;
}`,
        'Reset start when tank goes negative.',
      ),
    ],
  },
  Backtracking: {
    easy: [
      easyQ('bt-e-1', 'Backtracking explores:', ['Greedy options', 'All valid choices via recursion + undo', 'Only one path', 'No recursion'], 1, 'Try, recurse, undo.'),
    ],
    medium: [
      codeQ('bt-m-1', 'Generate all subsets.', 'For each element, include or skip.', `function subsets(nums) {
  // your code
  return [];
}`,
        [{ input: '[1, 2, 3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', visible: true }, { input: '[0]', expected: '[[],[0]]' }],
        `function subsets(nums) {
  const res = [[]];
  for (const n of nums) { const len = res.length; for (let i = 0; i < len; i++) res.push([...res[i], n]); }
  return res;
}`,
        'Iterative subsets = extend existing with new element.',
      ),
    ],
    hard: [
      codeQ('bt-h-1', 'N-Queens (count solutions).', 'Backtrack row by row.', `function totalNQueens(n) {
  // your code
  return 0;
}`,
        [{ input: '4', expected: '2', visible: true }, { input: '1', expected: '1' }],
        `function totalNQueens(n) {
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  let count = 0;
  function rec(r) { if (r === n) { count++; return; } for (let c = 0; c < n; c++) { if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue; cols.add(c); d1.add(r - c); d2.add(r + c); rec(r + 1); cols.delete(c); d1.delete(r - c); d2.delete(r + c); } }
  rec(0); return count;
}`,
        'Sets track used cols and diagonals.',
      ),
    ],
  },
};

// Fallback generator for topics not in the map
export function buildGenericLevels(topic: string) {
  const mkQuiz = (id: string, q: string, options: string[], answer: number, explanation: string): QuizQuestion =>
    ({ type: 'quiz', id, q, options, answer, explanation });
  const mkCode = (
    id: string, q: string, hint: string, starter: string,
    tests: { input: string; expected: string; visible?: boolean }[],
    answer: string, explanation: string,
  ): CodeChallenge => ({ type: 'code', id, q, hint, starter, tests, answer, explanation });

  return {
    easy: [
      mkQuiz(`${topic}-e-1`, `Which data structure is most commonly paired with ${topic} problems?`, ['HashMap', 'Stack', 'Queue', 'Array'], 3, 'Arrays and HashMaps are versatile building blocks.'),
      mkCode(`${topic}-e-2`, `Write a function that returns the count of items in the input for ${topic}.`, 'Iterate and count.', `function count(items) {
  // your code
  return 0;
}`,
        [{ input: '[1, 2, 3, 4]', expected: '4', visible: true }, { input: '[]', expected: '0' }],
        `function count(items) { return items.length; }`,
        'Use the length property.',
      ),
    ],
    medium: [
      mkCode(`${topic}-m-1`, `Solve a classic ${topic} problem: filter even numbers.`, 'Use a loop with modulo.', `function evens(arr) {
  // your code
  return [];
}`,
        [{ input: '[1, 2, 3, 4, 5, 6]', expected: '[2, 4, 6]', visible: true }, { input: '[1, 3, 5]', expected: '[]' }],
        `function evens(arr) { return arr.filter(x => x % 2 === 0); }`,
        'Filter with modulo 2.',
      ),
      mkQuiz(`${topic}-m-2`, `Best time complexity for a typical ${topic} operation?`, ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'Most traversal-style problems are O(n).'),
    ],
    hard: [
      mkCode(`${topic}-h-1`, `Advanced ${topic} challenge: sum of distinct elements.`, 'Track seen values.', `function sumDistinct(arr) {
  // your code
  return 0;
}`,
        [{ input: '[1, 2, 2, 3, 4, 4]', expected: '10', visible: true }, { input: '[5, 5, 5]', expected: '5' }],
        `function sumDistinct(arr) { const s = new Set(arr); let sum = 0; for (const n of s) sum += n; return sum; }`,
        'Convert to Set, then sum.',
      ),
    ],
  };
}

export const STICKER_LIBRARY = [
  { id: 'rocket', emoji: '🚀', name: 'Rocket', color: 'from-blue-500 to-cyan-500' },
  { id: 'fire', emoji: '🔥', name: 'Fire', color: 'from-orange-500 to-red-500' },
  { id: 'crown', emoji: '👑', name: 'Crown', color: 'from-amber-400 to-yellow-500' },
  { id: 'star', emoji: '⭐', name: 'Star', color: 'from-yellow-400 to-amber-500' },
  { id: 'gem', emoji: '💎', name: 'Gem', color: 'from-cyan-400 to-blue-500' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', color: 'from-amber-500 to-orange-500' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', color: 'from-yellow-300 to-amber-400' },
  { id: 'heart', emoji: '❤️', name: 'Heart', color: 'from-rose-500 to-pink-500' },
  { id: 'brain', emoji: '🧠', name: 'Brain', color: 'from-pink-500 to-purple-500' },
  { id: 'magic', emoji: '✨', name: 'Magic', color: 'from-purple-400 to-fuchsia-500' },
  { id: 'leaf', emoji: '🍃', name: 'Leaf', color: 'from-emerald-400 to-green-500' },
  { id: 'target', emoji: '🎯', name: 'Target', color: 'from-rose-400 to-red-500' },
];

export const BADGE_LIBRARY = [
  { id: 'rookie', emoji: '🌱', name: 'Sprout Rookie', desc: 'Complete your first level' },
  { id: 'sprout', emoji: '🌿', name: 'Code Sprout', desc: 'Complete 5 topics' },
  { id: 'master', emoji: '🌳', name: 'Algorithm Master', desc: 'Complete 10 topics' },
  { id: 'pro', emoji: '🏅', name: 'Pattern Pro', desc: 'Complete 25 topics' },
  { id: 'legend', emoji: '🏆', name: 'DSA Legend', desc: 'Complete all topics' },
  { id: 'streak3', emoji: '⚡', name: 'On Fire', desc: '3-day streak' },
  { id: 'streak7', emoji: '🔥', name: 'Unstoppable', desc: '7-day streak' },
  { id: 'perfect', emoji: '💯', name: 'Perfectionist', desc: 'Score 100% on any level' },
];
