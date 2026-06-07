import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { MongoClient, Db, Collection } from 'mongodb';
import type {
  Question, Topic, CheatSheet, User, PatternDetail, Subscription,
  Community, Answer, ChatMessage,
  Discussion, DiscussionReply, StudyProgress, PointsEntry,
  WeeklyChallenge, ChallengeProgress,
  CommunityNote, InterviewExperience, CommunityResource,
  Contest, ContestSubmission,
  Roadmap, RoadmapProgress,
} from '../types';

export interface TestCaseData {
  id: string;
  slug: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'welcome' | 'level_complete' | 'badge' | 'streak' | 'reminder' | 'achievement' | 'question_solved' | 'premium' | 'nudge' | 'system';
  title: string;
  message: string;
  icon: string;
  link?: string;
  read: boolean;
  created_at: string;
}

interface DbData {
  questions: Question[];
  topics: Topic[];
  cheatSheets: CheatSheet[];
  users: User[];
  testCases: TestCaseData[];
  patternDetails: PatternDetail[];
  subscriptions: Subscription[];
  communities: Community[];
  answers: Answer[];
  chatMessages: ChatMessage[];
  discussions: Discussion[];
  studyProgress: StudyProgress[];
  points: PointsEntry[];
  weeklyChallenges: WeeklyChallenge[];
  challengeProgress: ChallengeProgress[];
  notes: CommunityNote[];
  interviews: InterviewExperience[];
  resources: CommunityResource[];
  contests: Contest[];
  contestSubmissions: ContestSubmission[];
  roadmaps: Roadmap[];
  roadmapProgress: RoadmapProgress[];
  notifications: AppNotification[];
  paymentRequests: any[];
}

const DB_PATH = join(__dirname, '..', '..', 'data', 'db.json');
const MONGO_URL = process.env.MONGODB_URL || process.env.MONGO_URL || '';

let db: DbData;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let useMongo = false;
let savePending = false;
let saveTimer: NodeJS.Timeout | null = null;

function loadDb(): DbData {
  if (!existsSync(DB_PATH)) {
    mkdirSync(join(__dirname, '..', '..', 'data'), { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify({ questions: [], topics: [], cheatSheets: [], users: [], testCases: [], patternDetails: [] }, null, 2));
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

async function persistToMongo() {
  if (!useMongo || !mongoDb || !db) return;
  const collections: (keyof DbData)[] = [
    'questions', 'topics', 'cheatSheets', 'users', 'testCases', 'patternDetails', 'subscriptions',
    'communities', 'answers', 'chatMessages', 'discussions', 'studyProgress', 'points',
    'weeklyChallenges', 'challengeProgress', 'notes', 'interviews', 'resources',
    'contests', 'contestSubmissions', 'roadmaps', 'roadmapProgress', 'notifications',
    'paymentRequests',
  ];
  const keyFor: Partial<Record<keyof DbData, string>> = {
    users: 'id',
    subscriptions: 'user_id',
    questions: 'id',
    topics: 'id',
    cheatSheets: 'question_id',
    testCases: 'id',
    patternDetails: 'slug',
    communities: 'id',
    answers: 'id',
    chatMessages: 'id',
    discussions: 'id',
    studyProgress: 'id',
    points: 'id',
    weeklyChallenges: 'id',
    challengeProgress: 'id',
    notes: 'id',
    interviews: 'id',
    resources: 'id',
    contests: 'id',
    contestSubmissions: 'id',
    roadmaps: 'id',
    roadmapProgress: 'id',
    notifications: 'id',
    paymentRequests: 'id',
  };
  for (const col of collections) {
    const arr = db[col] as any[];
    if (!arr || arr.length === 0) continue;
    const naturalKey = keyFor[col];
    try {
      const c = mongoDb.collection(col as string);
      if (naturalKey) {
        for (const doc of arr) {
          const filter = { [naturalKey]: doc[naturalKey] };
          await c.replaceOne(filter, doc, { upsert: true });
        }
      } else {
        await c.deleteMany({});
        await c.insertMany(arr as any[], { ordered: false });
      }
    } catch (e: any) {
      if (e?.code !== 11000) {
        console.error(`[DB] Mongo persist error on "${col}":`, e?.message || e);
      }
    }
  }
}

export function saveDb() {
  if (useMongo) {
    if (savePending) return;
    savePending = true;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      await persistToMongo();
      savePending = false;
    }, 1000);
    return;
  }
  try {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[DB] Save error:', e);
  }
}

export async function initDb(questions: Question[], topics: Topic[], cheatSheets: CheatSheet[], users: User[], testCases: TestCaseData[], patternDetails: PatternDetail[] = []) {
  if (MONGO_URL) {
    try {
      mongoClient = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      useMongo = true;
      console.log('[DB] Connected to MongoDB');

      const existing = await mongoDb.collection('questions').countDocuments();
      if (existing === 0) {
        const fresh: DbData = {
          questions, topics, cheatSheets, users, testCases, patternDetails,
          subscriptions: [],
          communities: [], answers: [], chatMessages: [],
          discussions: [], studyProgress: [], points: [],
          weeklyChallenges: [], challengeProgress: [],
          notes: [], interviews: [], resources: [],
          contests: [], contestSubmissions: [],
          roadmaps: [], roadmapProgress: [],
          notifications: [],
          paymentRequests: [],
        };
        db = fresh;
        await persistToMongo();
        console.log(`[DB] Seeded MongoDB with ${questions.length} questions, ${topics.length} topics`);
      } else {
        console.log('[DB] Loading existing data from MongoDB');
        const col = (n: string): Collection => mongoDb!.collection(n);
        db = {
          questions: await col('questions').find({}).toArray() as any,
          topics: await col('topics').find({}).toArray() as any,
          cheatSheets: await col('cheatSheets').find({}).toArray() as any,
          users: await col('users').find({}).toArray() as any,
          testCases: await col('testCases').find({}).toArray() as any,
          patternDetails: await col('patternDetails').find({}).toArray() as any,
          subscriptions: await col('subscriptions').find({}).toArray() as any,
          communities: await col('communities').find({}).toArray() as any,
          answers: await col('answers').find({}).toArray() as any,
          chatMessages: await col('chatMessages').find({}).toArray() as any,
          discussions: await col('discussions').find({}).toArray() as any,
          studyProgress: await col('studyProgress').find({}).toArray() as any,
          points: await col('points').find({}).toArray() as any,
          weeklyChallenges: await col('weeklyChallenges').find({}).toArray() as any,
          challengeProgress: await col('challengeProgress').find({}).toArray() as any,
          notes: await col('notes').find({}).toArray() as any,
          interviews: await col('interviews').find({}).toArray() as any,
          resources: await col('resources').find({}).toArray() as any,
          contests: await col('contests').find({}).toArray() as any,
          contestSubmissions: await col('contestSubmissions').find({}).toArray() as any,
          roadmaps: await col('roadmaps').find({}).toArray() as any,
          roadmapProgress: await col('roadmapProgress').find({}).toArray() as any,
          notifications: await col('notifications').find({}).toArray() as any,
          paymentRequests: await col('paymentRequests').find({}).toArray() as any,
        };
        const adminUser = db.users.find((u: any) => u.email === 'admin@dsacheatsheets.com');
        if (adminUser) {
          const bcrypt = require('bcryptjs');
          const isValidHash = adminUser.password && adminUser.password.startsWith('$2') && adminUser.password.length >= 50;
          let works = false;
          if (isValidHash) {
            try { works = bcrypt.compareSync('admin123', adminUser.password); } catch { works = false; }
          }
          if (!works) {
            adminUser.password = bcrypt.hashSync('admin123', 10);
            await mongoDb.collection('users').replaceOne({ id: adminUser.id }, adminUser);
            console.log('[DB] Reset admin password to admin123');
          }
        }
        console.log(`[DB] Loaded ${db.questions.length} questions, ${db.users.length} users from MongoDB`);
      }
      migrateCodeToDb(questions, testCases);
      return;
    } catch (e) {
      console.error('[DB] MongoDB connection failed, falling back to JSON file:', e);
      useMongo = false;
    }
  }

  const dir = join(__dirname, '..', '..', 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Preserve existing db.json if it already has data (admin-added content)
  if (existsSync(DB_PATH)) {
    try {
      const existing = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      if (existing.questions && existing.questions.length > 0) {
        db = existing;
        migrateCodeToDb(questions, testCases);
        console.log(`[DB] Loaded existing data: ${db.questions.length} questions, ${db.topics.length} topics`);
        return;
      }
    } catch { /* fall through to fresh seed */ }
  }

  const fresh: DbData = {
    questions, topics, cheatSheets, users, testCases, patternDetails,
    subscriptions: [],
    communities: [], answers: [], chatMessages: [],
    discussions: [], studyProgress: [], points: [],
    weeklyChallenges: [], challengeProgress: [],
    notes: [], interviews: [], resources: [],
    contests: [], contestSubmissions: [],
    roadmaps: [], roadmapProgress: [],
    notifications: [],
    paymentRequests: [],
  };
  writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
  db = fresh;
  console.log(`[DB] Initialized with ${questions.length} questions, ${testCases.length} test cases, ${patternDetails.length} pattern details`);
}

export function isUsingMongo(): boolean { return useMongo; }
export async function closeDb(): Promise<void> { if (mongoClient) await mongoClient.close(); }

function migrateCodeToDb(codeQuestions: Question[], codeTestCases: TestCaseData[]): void {
  if (!db) return;
  let qChanged = 0, tAdded = 0, tReplaced = 0;

  const codeBySlug = new Map<string, Question>();
  for (const q of codeQuestions) codeBySlug.set(q.slug, q);
  for (const q of db.questions) {
    const code = codeBySlug.get(q.slug);
    if (!code) continue;
    const updates: Partial<Question> = {};
    if (!q.problem_statement && code.problem_statement) updates.problem_statement = code.problem_statement;
    if ((!q.examples || q.examples.length === 0) && code.examples && code.examples.length > 0) updates.examples = code.examples;
    if (!q.constraints && code.constraints) updates.constraints = code.constraints;
    if (!q.input_format && code.input_format) updates.input_format = code.input_format;
    if (!q.output_format && code.output_format) updates.output_format = code.output_format;
    if (!q.explanation && code.explanation) updates.explanation = code.explanation;
    if (Object.keys(updates).length > 0) {
      Object.assign(q, updates);
      qChanged++;
    }
  }

  const codeBySlugTC = new Map<string, TestCaseData[]>();
  for (const tc of codeTestCases) {
    const arr = codeBySlugTC.get(tc.slug) || [];
    arr.push(tc);
    codeBySlugTC.set(tc.slug, arr);
  }

  for (const [slug, codeTCs] of codeBySlugTC) {
    const codeIds = new Set(codeTCs.map(t => t.id));
    const dbForSlug = db.testCases.filter(t => t.slug === slug);
    const dbIds = new Set(dbForSlug.map(t => t.id));
    let allSame = true;
    for (const ct of codeTCs) {
      const dt = dbForSlug.find(t => t.id === ct.id);
      if (!dt) { allSame = false; break; }
      if (dt.input !== ct.input || dt.expected_output !== ct.expected_output) { allSame = false; break; }
    }
    if (allSame && codeTCs.length === dbForSlug.length) continue;

    db.testCases = db.testCases.filter(t => t.slug !== slug);
    for (const ct of codeTCs) {
      db.testCases.push({ ...ct });
      if (dbIds.has(ct.id)) tReplaced++;
      else tAdded++;
    }
  }

  if (qChanged > 0 || tAdded > 0 || tReplaced > 0) {
    console.log(`[DB] Migration: enriched ${qChanged} questions, added ${tAdded} new test cases, replaced ${tReplaced} existing test cases`);
    saveDb();
  } else {
    console.log('[DB] Migration: no changes needed');
  }
}

export function getDb(): DbData {
  if (!db) db = loadDb();
  return db;
}

// ====== QUESTIONS ======
export function getQuestions(): Question[] { return getDb().questions; }
export function getQuestion(slug: string): Question | undefined { return getDb().questions.find(q => q.slug === slug); }
export function addQuestion(q: Question): void { getDb().questions.push(q); saveDb(); }
export function updateQuestion(slug: string, updates: Partial<Question>): Question | null {
  const db = getDb(); const idx = db.questions.findIndex(q => q.slug === slug);
  if (idx === -1) return null; db.questions[idx] = { ...db.questions[idx], ...updates }; saveDb(); return db.questions[idx];
}
export function deleteQuestion(slug: string): boolean {
  const db = getDb(); const len = db.questions.length;
  db.questions = db.questions.filter(q => q.slug !== slug); db.testCases = db.testCases.filter(tc => tc.slug !== slug);
  if (db.questions.length === len) return false; saveDb(); return true;
}

// ====== TEST CASES ======
export function getTestCases(slug: string): TestCaseData[] { return getDb().testCases.filter(tc => tc.slug === slug); }
export function addTestCase(tc: TestCaseData): void { getDb().testCases.push(tc); saveDb(); }
export function updateTestCase(id: string, updates: Partial<TestCaseData>): TestCaseData | null {
  const db = getDb(); const idx = db.testCases.findIndex(tc => tc.id === id);
  if (idx === -1) return null; db.testCases[idx] = { ...db.testCases[idx], ...updates }; saveDb(); return db.testCases[idx];
}
export function deleteTestCase(id: string): boolean {
  const db = getDb(); const len = db.testCases.length;
  db.testCases = db.testCases.filter(tc => tc.id !== id);
  if (db.testCases.length === len) return false; saveDb(); return true;
}

// ====== TOPICS / CHEATSHEETS / PATTERNS ======
export function getTopics(): Topic[] { return getDb().topics; }
export function getTopic(slug: string): Topic | undefined { return getDb().topics.find(t => t.slug === slug); }
export function addTopic(t: Topic): void { getDb().topics.push(t); saveDb(); }
export function updateTopic(slug: string, updates: Partial<Topic>): Topic | null {
  const db = getDb(); const idx = db.topics.findIndex(t => t.slug === slug);
  if (idx === -1) return null; db.topics[idx] = { ...db.topics[idx], ...updates }; saveDb(); return db.topics[idx];
}
export function deleteTopic(slug: string): boolean {
  const db = getDb(); const len = db.topics.length;
  db.topics = db.topics.filter(t => t.slug !== slug);
  if (db.topics.length === len) return false; saveDb(); return true;
}
export function getCheatSheets(): CheatSheet[] { return getDb().cheatSheets; }
export function getCheatSheet(questionId: string): CheatSheet | undefined { return getDb().cheatSheets.find(cs => cs.question_id === questionId); }
export function getPatternDetails(): PatternDetail[] { return getDb().patternDetails; }
export function getPatternDetail(slug: string): PatternDetail | undefined { return getDb().patternDetails.find(p => p.slug === slug); }
export function addPatternDetail(p: PatternDetail): void {
  const db = getDb(); const existing = db.patternDetails.findIndex(x => x.slug === p.slug);
  if (existing >= 0) db.patternDetails[existing] = p; else db.patternDetails.push(p); saveDb();
}
export function updatePatternDetail(slug: string, updates: Partial<PatternDetail>): PatternDetail | null {
  const db = getDb(); const idx = db.patternDetails.findIndex(p => p.slug === slug);
  if (idx === -1) return null; db.patternDetails[idx] = { ...db.patternDetails[idx], ...updates, updated_at: new Date().toISOString() }; saveDb(); return db.patternDetails[idx];
}
export function deletePatternDetail(slug: string): boolean {
  const db = getDb(); const len = db.patternDetails.length;
  db.patternDetails = db.patternDetails.filter(p => p.slug !== slug);
  if (db.patternDetails.length === len) return false; saveDb(); return true;
}

// ====== COMMUNITIES ======
export function getCommunities(): Community[] { return getDb().communities || []; }
export function getCommunity(id: string): Community | undefined { return getDb().communities.find(c => c.id === id); }
export function getCommunityByInvite(code: string): Community | undefined { return getDb().communities.find(c => c.invite_code === code); }
export function addCommunity(c: Community): void { getDb().communities.push(c); saveDb(); }
export function updateCommunity(id: string, updates: Partial<Community>): Community | null {
  const db = getDb(); const idx = db.communities.findIndex(c => c.id === id);
  if (idx === -1) return null; db.communities[idx] = { ...db.communities[idx], ...updates }; saveDb(); return db.communities[idx];
}

// ====== ANSWERS ======
export function getAnswers(questionSlug: string): Answer[] { return (getDb().answers || []).filter(a => a.question_slug === questionSlug); }
export function addAnswer(a: Answer): void { getDb().answers.push(a); saveDb(); }
export function upvoteAnswer(id: string): Answer | null {
  const db = getDb(); const idx = db.answers.findIndex(a => a.id === id);
  if (idx === -1) return null; db.answers[idx].upvotes = (db.answers[idx].upvotes || 0) + 1; saveDb(); return db.answers[idx];
}
export function acceptAnswer(id: string): Answer | null {
  const db = getDb(); const idx = db.answers.findIndex(a => a.id === id);
  if (idx === -1) return null; db.answers[idx].is_accepted = true; saveDb(); return db.answers[idx];
}

// ====== CHAT ======
export function getChatMessages(communityId: string): ChatMessage[] { return (getDb().chatMessages || []).filter(m => m.community_id === communityId); }
export function addChatMessage(m: ChatMessage): void { getDb().chatMessages.push(m); saveDb(); }

// ====== DISCUSSIONS ======
export function getDiscussions(questionSlug: string): Discussion[] { return (getDb().discussions || []).filter(d => d.question_slug === questionSlug); }
export function getAllDiscussions(): Discussion[] { return getDb().discussions || []; }
export function addDiscussion(d: Discussion): void { getDb().discussions.push(d); saveDb(); }
export function addDiscussionReply(discussionId: string, reply: DiscussionReply): Discussion | null {
  const db = getDb(); const idx = db.discussions.findIndex(d => d.id === discussionId);
  if (idx === -1) return null; db.discussions[idx].replies.push(reply); saveDb(); return db.discussions[idx];
}

// ====== STUDY PROGRESS ======
export function getStudyProgress(communityId: string): StudyProgress[] { return (getDb().studyProgress || []).filter(p => p.community_id === communityId); }
export function addStudyProgress(p: StudyProgress): void { getDb().studyProgress.push(p); saveDb(); }

// ====== POINTS / LEADERBOARD ======
export function getPoints(communityId: string): PointsEntry[] { return (getDb().points || []).filter(p => p.community_id === communityId); }
export function addPoints(p: PointsEntry): void { getDb().points.push(p); saveDb(); }
export function getLeaderboard(communityId: string): { user_id: string; user_name: string; total_points: number }[] {
  const entries = getPoints(communityId);
  const grouped: Record<string, { user_id: string; user_name: string; total_points: number }> = {};
  for (const e of entries) {
    if (!grouped[e.user_id]) grouped[e.user_id] = { user_id: e.user_id, user_name: e.user_name, total_points: 0 };
    grouped[e.user_id].total_points += e.points;
  }
  return Object.values(grouped).sort((a, b) => b.total_points - a.total_points);
}

// ====== WEEKLY CHALLENGES ======
export function getChallenges(communityId: string): WeeklyChallenge[] { return (getDb().weeklyChallenges || []).filter(c => c.community_id === communityId); }
export function addChallenge(c: WeeklyChallenge): void { getDb().weeklyChallenges.push(c); saveDb(); }
export function updateChallenge(id: string, updates: Partial<WeeklyChallenge>): WeeklyChallenge | null {
  const db = getDb(); const idx = db.weeklyChallenges.findIndex(c => c.id === id);
  if (idx === -1) return null; db.weeklyChallenges[idx] = { ...db.weeklyChallenges[idx], ...updates }; saveDb(); return db.weeklyChallenges[idx];
}
export function getChallengeProgress(challengeId: string): ChallengeProgress[] { return (getDb().challengeProgress || []).filter(p => p.challenge_id === challengeId); }
export function upsertChallengeProgress(p: ChallengeProgress): void {
  const db = getDb(); const idx = db.challengeProgress.findIndex(x => x.challenge_id === p.challenge_id && x.user_id === p.user_id);
  if (idx >= 0) db.challengeProgress[idx] = p; else db.challengeProgress.push(p); saveDb();
}

// ====== NOTES ======
export function getNotes(communityId: string): CommunityNote[] { return (getDb().notes || []).filter(n => n.community_id === communityId); }
export function addNote(n: CommunityNote): void { getDb().notes.push(n); saveDb(); }
export function updateNote(id: string, updates: Partial<CommunityNote>): CommunityNote | null {
  const db = getDb(); const idx = db.notes.findIndex(n => n.id === id);
  if (idx === -1) return null; db.notes[idx] = { ...db.notes[idx], ...updates, updated_at: new Date().toISOString() }; saveDb(); return db.notes[idx];
}

// ====== INTERVIEW EXPERIENCES ======
export function getInterviews(communityId: string): InterviewExperience[] { return (getDb().interviews || []).filter(i => i.community_id === communityId); }
export function addInterview(i: InterviewExperience): void { getDb().interviews.push(i); saveDb(); }

// ====== RESOURCES ======
export function getResources(communityId: string): CommunityResource[] { return (getDb().resources || []).filter(r => r.community_id === communityId); }
export function addResource(r: CommunityResource): void { getDb().resources.push(r); saveDb(); }

// ====== CONTESTS ======
export function getContests(communityId: string): Contest[] { return (getDb().contests || []).filter(c => c.community_id === communityId); }
export function addContest(c: Contest): void { getDb().contests.push(c); saveDb(); }
export function addContestSubmission(s: ContestSubmission): void { getDb().contestSubmissions.push(s); saveDb(); }
export function getContestSubmissions(contestId: string): ContestSubmission[] { return (getDb().contestSubmissions || []).filter(s => s.contest_id === contestId); }
export function getContestLeaderboard(contestId: string): { user_id: string; user_name: string; solved: number; total: number }[] {
  const submissions = getContestSubmissions(contestId);
  const questions = getDb().contests.find(c => c.id === contestId)?.questions || [];
  const grouped: Record<string, { user_id: string; user_name: string; solved: Set<string> }> = {};
  for (const s of submissions) {
    if (!grouped[s.user_id]) grouped[s.user_id] = { user_id: s.user_id, user_name: s.user_name, solved: new Set() };
    if (s.passed) grouped[s.user_id].solved.add(s.question_slug);
  }
  return Object.values(grouped).map(g => ({ user_id: g.user_id, user_name: g.user_name, solved: g.solved.size, total: questions.length })).sort((a, b) => b.solved - a.solved);
}

// ====== ROADMAPS ======
export function getRoadmaps(communityId: string): Roadmap[] { return (getDb().roadmaps || []).filter(r => r.community_id === communityId); }
export function addRoadmap(r: Roadmap): void { getDb().roadmaps.push(r); saveDb(); }
export function getRoadmapProgress(roadmapId: string): RoadmapProgress[] { return (getDb().roadmapProgress || []).filter(p => p.roadmap_id === roadmapId); }
export function upsertRoadmapProgress(p: RoadmapProgress): void {
  const db = getDb(); const idx = db.roadmapProgress.findIndex(x => x.roadmap_id === p.roadmap_id && x.user_id === p.user_id);
  if (idx >= 0) db.roadmapProgress[idx] = p; else db.roadmapProgress.push(p); saveDb();
}

// ====== USERS ======
export function getAllUsers(): User[] { return getDb().users || []; }
export function getUserByEmail(email: string): User | undefined { return getDb().users.find(u => u.email === email); }
export function getUserById(id: string): User | undefined { return getDb().users.find(u => u.id === id); }
export function addUser(user: User): void { getDb().users.push(user); saveDb(); }

// ====== SUBSCRIPTIONS ======
export async function getSubscriptionsFresh(): Promise<Subscription[]> {
  if (useMongo && mongoDb) {
    try {
      return await mongoDb.collection('subscriptions').find({}).toArray() as any;
    } catch { /* fall through */ }
  }
  return (getDb().subscriptions || []) as Subscription[];
}
export function getSubscriptions(): Subscription[] { return (getDb().subscriptions || []) as Subscription[]; }
export function addSubscription(sub: Subscription): void {
  const db = getDb();
  if (!db.subscriptions) (db as any).subscriptions = [];
  const subs = db.subscriptions as Subscription[];
  const idx = subs.findIndex(s => s.user_id === sub.user_id);
  if (idx >= 0) subs[idx] = sub; else subs.push(sub);
  saveDb();
}

// ====== PAYMENT REQUESTS ======
export function getPaymentRequests(): any[] { return (getDb().paymentRequests || []) as any[]; }
export function getPaymentRequestsByUser(userId: string): any[] {
  return getPaymentRequests().filter((p: any) => p.user_id === userId);
}
export function addPaymentRequest(req: any): void {
  const db = getDb();
  if (!db.paymentRequests) (db as any).paymentRequests = [];
  db.paymentRequests.push(req);
  saveDb();
}
export function updatePaymentRequest(id: string, userId: string, updates: Partial<any>): any | null {
  const db = getDb();
  if (!db.paymentRequests) return null;
  const idx = db.paymentRequests.findIndex((p: any) => p.id === id && p.user_id === userId);
  if (idx === -1) return null;
  db.paymentRequests[idx] = { ...db.paymentRequests[idx], ...updates };
  saveDb();
  return db.paymentRequests[idx];
}
export function findPaymentRequest(predicate: (p: any) => boolean): any | undefined {
  return getPaymentRequests().find(predicate);
}

// ====== NOTIFICATIONS ======
export function getNotifications(userId: string, limit = 50): AppNotification[] {
  const all = (getDb().notifications || []) as AppNotification[];
  return all
    .filter(n => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export function getUnreadNotificationCount(userId: string): number {
  const all = (getDb().notifications || []) as AppNotification[];
  return all.filter(n => n.user_id === userId && !n.read).length;
}

export function addNotification(n: Omit<AppNotification, 'id' | 'read' | 'created_at'> & { id?: string; read?: boolean; created_at?: string }): AppNotification {
  const db = getDb();
  if (!db.notifications) (db as any).notifications = [];
  const list = db.notifications as AppNotification[];
  const notif: AppNotification = {
    id: n.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    icon: n.icon,
    link: n.link,
    read: n.read ?? false,
    created_at: n.created_at || new Date().toISOString(),
  };
  list.push(notif);
  saveDb();
  return notif;
}

export function markNotificationRead(id: string, userId: string): AppNotification | null {
  const list = (getDb().notifications || []) as AppNotification[];
  const n = list.find(x => x.id === id && x.user_id === userId);
  if (!n) return null;
  n.read = true;
  saveDb();
  return n;
}

export function markAllNotificationsRead(userId: string): number {
  const list = (getDb().notifications || []) as AppNotification[];
  let count = 0;
  for (const n of list) {
    if (n.user_id === userId && !n.read) {
      n.read = true;
      count++;
    }
  }
  if (count > 0) saveDb();
  return count;
}

export function deleteNotification(id: string, userId: string): boolean {
  const db = getDb();
  const list = (db.notifications || []) as AppNotification[];
  const idx = list.findIndex(x => x.id === id && x.user_id === userId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  saveDb();
  return true;
}
