import {
  createGame,
  apply,
  view,
  observation,
  demoDecision,
  presets,
  advance,
  withdraw,
  explode,
  openBallot,
  submitBallot,
  closeBallot,
  submitSignup,
  submitWolfChoice,
  skipHiddenSpeech,
} from './game/engine.mjs';

export interface CharacterProfile {
  id: number;
  name: string;
  mbti: string;
  traits: string;
  prompt: string;
  avatar: string;
  avatarIndex: number;
}

export interface PlayerKnowledge {
  day: number;
  kind: string;
  target: number;
  result: string;
}

export interface GamePlayer {
  id: number;
  name: string;
  avatar: string;
  avatarIndex: number;
  mbti: string;
  traits: string;
  alive: boolean;
  human: boolean;
  sheriff: boolean;
  role?: string;
  knowledge?: PlayerKnowledge[];
  copied?: string | null;
}

export interface GameEvent {
  id: number;
  day: number;
  phase: string;
  text: string;
  visibility: string | number;
  actor?: number;
  kind?: string;
  target?: number;
  weight?: number;
  timeout?: boolean;
  reveal?: number;
  revealRole?: string;
}

export interface GameView {
  id: string;
  version: number;
  mode: string;
  god: boolean;
  demo: boolean;
  day: number;
  phase: string;
  revision: number;
  paused: boolean;
  winner: string | null;
  spent: number;
  tokens: { input: number; output: number };
  budget: number;
  sheriff: number;
  stage: string;
  legacy?: boolean;
  signupSelection: {
    id: string;
    humanEligible: boolean;
    humanSubmitted: boolean;
    submittedCount: number;
    total: number;
    error: string | null;
  } | null;
  wolfSelection: {
    id: string;
    humanEligible: boolean;
    humanSubmitted: boolean;
    choices: number[];
    error: string | null;
  } | null;
  awaitingAdvance: boolean;
  displaySpeech: GameEvent | null;
  candidates: number[];
  canWithdraw: boolean;
  canExplode: boolean;
  players: GamePlayer[];
  events: GameEvent[];
  task: {
    type: string;
    actor?: number;
    human: boolean;
  } | null;
  choices: (string | number)[];
  ballot: {
    id: string;
    kind: string;
    deadline: number | null;
    status: string;
    eligible: number[];
    submitted: number[];
    humanEligible: boolean;
    humanSubmitted: boolean;
    choices: number[];
  } | null;
  attacked?: number;
}

export interface HistorySummary {
  id: string;
  created: string;
  winner: string;
  day: number;
  demo: boolean;
  spent: number;
  legacy: boolean;
}

interface RawGameState {
  id: string;
  version: number;
  created: string;
  day: number;
  phase: string;
  revision: number;
  paused: boolean;
  winner: string | null;
  demo: boolean;
  spent: number;
  players: Array<{
    id: number;
    role: string;
    human: boolean;
    alive: boolean;
    knowledge: PlayerKnowledge[];
  }>;
  tasks: Array<{ type: string; actor?: number }>;
  ballot: {
    id: string;
    status: string;
    eligible: number[];
    deadline: number | null;
    votes: Record<number, number>;
  } | null;
  signupSelection?: {
    id: string;
    eligible: number[];
    choices: Record<number, string>;
  } | null;
  wolfSelection?: {
    id: string;
    eligible: number[];
  } | null;
  night: {
    kills: Record<number, number>;
  };
  awaitingAdvance: boolean;
}

interface DemoDatabase {
  characters: CharacterProfile[];
  game: RawGameState | null;
  history: RawGameState[];
}

const STORAGE_KEY = 'moonlit-mobile-demo-v1';

export const ROLE_LIST = [
  '狼人',
  '觉醒隐狼',
  '魔镜少女',
  '女巫',
  '猎人',
  '守卫',
  '村民',
] as const;

export const DEFAULT_ASSIGNED_ROLES = [
  '狼人',
  '狼人',
  '狼人',
  '觉醒隐狼',
  '魔镜少女',
  '女巫',
  '猎人',
  '守卫',
  '村民',
  '村民',
  '村民',
  '村民',
];

export const TASK_LABELS: Record<string, string> = {
  copy: '觉醒隐狼模仿',
  guard: '守卫行动',
  extraKill: '额外狼刀',
  copyPoison: '模仿毒药',
  signup: '报名上警',
  signupSelect: '全员上警选择',
  withdraw: '退水抉择',
  direction: '选择发言方向',
  badge: '移交警徽',
  sheriffSpeech: '警上竞选发言',
  ballot: '全员同时投票',
  night: '夜间行动',
  wolfChat: '狼队密谈',
  wolfStart: '狼队准备选刀',
  wolfSelect: '狼队选择袭击目标',
  kill: '选择袭击目标',
  inspect: '魔镜少女查验',
  potion: '女巫用药',
  dawn: '等待天亮',
  dayStart: '白天开始',
  speech: '轮流发言',
  voteStart: '准备放逐投票',
  vote: '放逐投票',
  voteEnd: '公布票型',
  shoot: '猎人开枪',
  lastWords: '发表遗言',
  nextNight: '进入下一夜',
};

export function formatChoiceLabel(v: string | number): string {
  const map: Record<string, string> = {
    join: '报名上警',
    stay: '保留 / 不上警',
    withdraw: '退水',
    clockwise: '顺时针（警长末置位）',
    counterclockwise: '逆时针（警长末置位）',
    none: '不用药',
    save: '使用解药',
  };
  const key = String(v);
  if (key in map) return map[key];
  if (v === 0) return '弃权 / 不行动';
  if (key.startsWith('poison:')) return `毒杀 ${key.split(':')[1]}号`;
  return `${v}号`;
}

function defaultCharacters(): CharacterProfile[] {
  return (presets as CharacterProfile[]).map((p) => ({ ...p }));
}

function loadDb(): DemoDatabase {
  if (typeof window === 'undefined') {
    return { characters: defaultCharacters(), game: null, history: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { characters: defaultCharacters(), game: null, history: [] };
    }
    const parsed = JSON.parse(raw) as Partial<DemoDatabase>;
    const characters =
      Array.isArray(parsed.characters) && parsed.characters.length === 12
        ? parsed.characters
        : defaultCharacters();
    const game = parsed.game || null;
    if (game && game.ballot?.status !== 'open') {
      game.paused = true;
    }
    return {
      characters,
      game,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { characters: defaultCharacters(), game: null, history: [] };
  }
}

function saveDb(db: DemoDatabase) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

function upsertHistory(db: DemoDatabase, g: RawGameState) {
  const idx = db.history.findIndex((x) => x.id === g.id);
  if (idx >= 0) {
    db.history[idx] = structuredClone(g);
  } else if (g.winner) {
    db.history.unshift(structuredClone(g));
    if (db.history.length > 20) db.history = db.history.slice(0, 20);
  }
}

// 丰富前端 Demo 模式下 AI 的演示决策与发言文案，结合性格与局势
function buildDemoAction(
  g: RawGameState,
  task?: { type: string; actor?: number },
): { choice?: string | number; text?: string; rationale: string } {
  const t = task || g.tasks[0];
  if (!t?.actor) return { rationale: '规则演示：自动推进主持流程。' };
  const base = demoDecision(g, t);

  const ob = observation(g, t.actor, t) as {
    day: number;
    phase: string;
    candidates: number[];
    self: {
      id: number;
      name: string;
      role: string;
      personality: { mbti: string; traits: string };
      knowledge: PlayerKnowledge[];
    };
    players: Array<{ id: number; name: string; alive: boolean; teammate?: boolean }>;
    choices: Array<string | number>;
  };

  const p = ob.self;
  const prefix =
    p.personality.mbti === 'INFJ'
      ? '在下观察下来，'
      : p.personality.mbti === 'ENTJ'
        ? '直接说结论：'
        : p.personality.mbti === 'INTP'
          ? '从逻辑链路看，'
          : p.personality.mbti === 'ENFP'
            ? '大家先别慌，我感觉'
            : '结合场上信息，';

  if (t.type === 'sheriffSpeech') {
    const line =
      p.role === '魔镜少女' && p.knowledge.length > 0
        ? `${prefix}我起跳魔镜少女，第${p.knowledge[0].day}夜查验了${p.knowledge[0].target}号，身份是「${p.knowledge[0].result}」。警徽给我来归票。`
        : `${prefix}我是一张诚意拿警徽的牌（${p.personality.traits}），会重点听警上与末置位的发言逻辑，不盲打。`;
    return { ...base, text: line };
  }

  if (t.type === 'speech') {
    const aliveIds = ob.players
      .filter((q) => q.alive && q.id !== p.id)
      .map((q) => q.id);
    const focus = aliveIds[Math.floor((p.id + g.day * 3) % aliveIds.length)];
    const inspectInfo = p.knowledge.find((k) => k.kind === 'inspect' && k.day === g.day);
    if (inspectInfo) {
      return {
        ...base,
        text: `${prefix}昨晚查验了${inspectInfo.target}号，结果是「${inspectInfo.result}」。建议大家优先聚焦发言矛盾较大的座位，我先过麦。`,
      };
    }
    return {
      ...base,
      text: `${prefix}第${g.day}天信息还不算特别满，${focus ? `我比较关注${focus}号的后续表态和站边理由，` : ''}大家多核对夜间死讯与投票动机，先听后置位发言。`,
    };
  }

  if (t.type === 'lastWords') {
    return {
      ...base,
      text: `${prefix}我已出局。请好人阵营记住这轮的票型和警上站边关系，不要被情绪带偏，祝好人获胜。`,
    };
  }

  if (t.type === 'wolfChat') {
    const teammates = ob.players
      .filter((q) => q.teammate && q.id !== p.id && q.alive)
      .map((q) => `${q.id}号`);
    return {
      ...base,
      text: `狼队密谈：${teammates.length ? `队友 ${teammates.join('、')} 注意白天保持倒钩与配合，` : ''}今晚优先找神职或高威胁位置，统一票型落刀。`,
    };
  }

  // 随机化部分演示决策避免每局完全一模一样
  if (t.type === 'signup') {
    const joinPool = (p.id + g.day) % 3 === 1 || p.role === '魔镜少女';
    return {
      ...base,
      choice: joinPool ? 'join' : 'stay',
      rationale: joinPool ? '演示策略：竞选警长争取发言顺序。' : '演示策略：留在警下投票观察。',
    };
  }

  if (t.type === 'vote' || t.type === 'kill' || t.type === 'inspect' || t.type === 'guard') {
    const nonZero = ob.choices.filter((c) => c !== 0 && c !== 'none');
    if (nonZero.length > 0) {
      const picked =
        t.type === 'kill'
          ? nonZero.find((id) => typeof id === 'number' && g.players[id - 1]?.role !== '狼人') ?? nonZero[0]
          : nonZero[Math.floor(Math.random() * nonZero.length)];
      return { ...base, choice: picked };
    }
  }

  return base;
}

class MobileDemoClient {
  private db: DemoDatabase;
  private ballotTimer: ReturnType<typeof setTimeout> | null = null;
  private asyncTimers: ReturnType<typeof setTimeout>[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.db = loadDb();
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    saveDb(this.db);
    this.listeners.forEach((fn) => fn());
  }

  private clearAsyncTimers() {
    if (this.ballotTimer) {
      clearTimeout(this.ballotTimer);
      this.ballotTimer = null;
    }
    this.asyncTimers.forEach((id) => clearTimeout(id));
    this.asyncTimers = [];
  }

  private checkBallotExpiry() {
    const g = this.db.game;
    if (g && closeBallot(g, Date.now())) {
      this.clearAsyncTimers();
      upsertHistory(this.db, g);
      this.emit();
    }
  }

  getSnapshot(): {
    game: GameView | null;
    characters: CharacterProfile[];
    history: HistorySummary[];
    serverNow: number;
  } {
    this.checkBallotExpiry();
    return {
      game: view(this.db.game) as GameView | null,
      characters: structuredClone(this.db.characters),
      history: this.db.history.map((g) => ({
        id: g.id,
        created: g.created,
        winner: g.winner || '已结束',
        day: g.day,
        demo: g.demo,
        spent: g.spent || 0,
        legacy: g.version !== 2,
      })),
      serverNow: Date.now(),
    };
  }

  saveCharacters(next: CharacterProfile[]) {
    this.db.characters = next.map((p, i) => ({
      id: i + 1,
      avatarIndex: Math.max(0, Math.min(8, Number(p.avatarIndex) || 0)),
      name: String(p.name || presets[i].name).slice(0, 30),
      mbti: String(p.mbti || 'INFJ').slice(0, 20),
      traits: String(p.traits || '').slice(0, 120),
      prompt: String(p.prompt || '').slice(0, 2000),
      avatar: String(p.avatar || presets[i].avatar).slice(0, 4),
    }));
    this.emit();
  }

  resetCharacters() {
    this.db.characters = defaultCharacters();
    this.emit();
  }

  previewCharacter(seat: number, promptText: string): string {
    const c = this.db.characters[seat - 1];
    if (!c) return '角色不存在';
    const q = promptText.trim();
    return `${c.name}（${c.mbti} · ${c.traits}）：「${c.prompt}」${q ? `\n针对你的提问「${q}」：我会先听清全场发言细节，再给出我的站边判断。` : ''}`;
  }

  startGame(options: {
    mode: 'normal' | 'practice' | 'director';
    role: string;
    god: boolean;
    assigned?: string[];
  }) {
    this.clearAsyncTimers();
    if (this.db.game && !this.db.game.winner) {
      this.archiveGame();
    }
    const g = createGame({
      mode: options.mode,
      role: options.role,
      god: options.god,
      demo: true,
      budget: 5,
      characters: this.db.characters,
      ...(options.mode === 'director' && options.assigned
        ? { assigned: options.assigned }
        : {}),
    }) as unknown as RawGameState;
    g.paused = false;
    this.db.game = g;
    this.emit();
    this.triggerConcurrentSelections();
  }

  setPaused(paused: boolean) {
    const g = this.db.game;
    if (!g) return;
    if (g.ballot?.status === 'open') {
      throw new Error('投票倒计时进行中，5秒截止后才能暂停');
    }
    g.paused = paused;
    if (!paused) {
      skipHiddenSpeech(g);
      this.triggerConcurrentSelections();
    }
    this.emit();
  }

  private triggerConcurrentSelections() {
    const g = this.db.game;
    if (!g || g.paused || g.winner) return;

    if (g.signupSelection) {
      const selId = g.signupSelection.id;
      const aiIds = g.signupSelection.eligible.filter(
        (id) =>
          !g.players[id - 1].human &&
          !Object.hasOwn(g.signupSelection!.choices, id),
      );
      aiIds.forEach((id, idx) => {
        const t = setTimeout(() => {
          const cur = this.db.game;
          if (!cur || cur.paused || cur.winner || cur.signupSelection?.id !== selId)
            return;
          const action = buildDemoAction(cur, { type: 'signup', actor: id });
          submitSignup(cur, id, action);
          upsertHistory(this.db, cur);
          this.emit();
        }, 160 + idx * 70);
        this.asyncTimers.push(t);
      });
    }

    if (g.wolfSelection) {
      const selId = g.wolfSelection.id;
      const aiIds = g.wolfSelection.eligible.filter(
        (id) =>
          !g.players[id - 1].human && !Object.hasOwn(g.night.kills || {}, id),
      );
      aiIds.forEach((id, idx) => {
        const t = setTimeout(() => {
          const cur = this.db.game;
          if (!cur || cur.paused || cur.winner || cur.wolfSelection?.id !== selId)
            return;
          const action = buildDemoAction(cur, { type: 'kill', actor: id });
          submitWolfChoice(cur, id, action);
          upsertHistory(this.db, cur);
          this.emit();
        }, 200 + idx * 120);
        this.asyncTimers.push(t);
      });
    }

    if (g.ballot?.status === 'waiting') {
      openBallot(g, Date.now());
      this.emit();
      const ballotId = g.ballot.id;
      const aiIds = g.ballot.eligible.filter((id) => !g.players[id - 1].human);
      aiIds.forEach((id, idx) => {
        const delay = 600 + ((idx * 290 + Math.floor(Math.random() * 400)) % 2800);
        const t = setTimeout(() => {
          const cur = this.db.game;
          if (
            !cur ||
            cur.ballot?.id !== ballotId ||
            cur.ballot.status !== 'open' ||
            Date.now() >= (cur.ballot.deadline || 0)
          ) {
            return;
          }
          const action = buildDemoAction(cur, { type: 'vote', actor: id });
          try {
            submitBallot(
              cur,
              id,
              Number(action.choice ?? 0),
              Date.now(),
              action.rationale,
            );
            this.emit();
          } catch {
            // Ignore late vote
          }
        }, delay);
        this.asyncTimers.push(t);
      });
      this.ballotTimer = setTimeout(() => {
        this.checkBallotExpiry();
      }, 5050);
    }
  }

  step(action?: { text?: string; choice?: string | number }) {
    const g = this.db.game;
    if (!g || g.winner || g.paused || g.awaitingAdvance) return;
    const t = g.tasks[0];
    if (!t) return;

    if (t.type === 'signupSelect' || t.type === 'wolfSelect' || t.type === 'ballot') {
      this.triggerConcurrentSelections();
      return;
    }

    const actor = t.actor ? g.players[t.actor - 1] : null;
    const finalAction =
      actor && actor.human ? action || {} : buildDemoAction(g, t);

    apply(g, finalAction);
    skipHiddenSpeech(g);
    upsertHistory(this.db, g);
    this.emit();
    this.triggerConcurrentSelections();
  }

  advanceSpeech() {
    const g = this.db.game;
    if (!g || !g.awaitingAdvance) return;
    advance(g);
    this.emit();
  }

  submitHumanSignup(selectionId: string, choice: 'join' | 'stay') {
    const g = this.db.game;
    if (!g || g.paused || g.winner || g.signupSelection?.id !== selectionId) return;
    const human = g.players.find((p) => p.human);
    if (!human) return;
    submitSignup(g, human.id, { choice });
    upsertHistory(this.db, g);
    this.emit();
  }

  submitHumanWolfChoice(selectionId: string, choice: number) {
    const g = this.db.game;
    if (!g || g.paused || g.winner || g.wolfSelection?.id !== selectionId) return;
    const human = g.players.find((p) => p.human);
    if (!human) return;
    submitWolfChoice(g, human.id, { choice });
    upsertHistory(this.db, g);
    this.emit();
  }

  submitHumanBallot(ballotId: string, choice: number) {
    const g = this.db.game;
    if (!g || g.ballot?.id !== ballotId) return;
    const human = g.players.find((p) => p.human);
    if (!human) return;
    submitBallot(g, human.id, choice, Date.now(), '玩家投票');
    this.emit();
  }

  withdrawHuman() {
    const g = this.db.game;
    if (!g) return;
    const human = g.players.find((p) => p.human);
    if (!human) return;
    withdraw(g, human.id);
    upsertHistory(this.db, g);
    this.emit();
  }

  explodeHuman() {
    const g = this.db.game;
    if (!g) return;
    const human = g.players.find((p) => p.human);
    if (!human) return;
    this.clearAsyncTimers();
    explode(g, human.id);
    upsertHistory(this.db, g);
    this.emit();
  }

  archiveGame() {
    const g = this.db.game;
    if (!g) return;
    this.clearAsyncTimers();
    if (!g.winner) {
      g.signupSelection = null;
      g.wolfSelection = null;
      g.winner = '中途结束';
      g.phase = 'over';
      g.paused = true;
      g.tasks = [];
      g.ballot = null;
      g.awaitingAdvance = false;
    }
    upsertHistory(this.db, g);
    this.emit();
  }

  getReplay(id: string): GameView | null {
    const found = this.db.history.find((h) => h.id === id);
    return found ? (view(found) as GameView) : null;
  }

  clearHistory() {
    this.db.history = [];
    this.emit();
  }
}

let singleton: MobileDemoClient | null = null;
export function getDemoClient(): MobileDemoClient {
  if (!singleton) singleton = new MobileDemoClient();
  return singleton;
}
