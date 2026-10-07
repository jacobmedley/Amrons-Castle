export type Point = { x: number; y: number };
export type RoomId = 'war' | 'wizard' | 'elf' | 'forge' | 'hall' | 'grounds';
export type Status = 'working' | 'review' | 'blocked' | 'complete' | 'unconfirmed';
export type Agent = { id: string; name: string; title: string; folk: string; room: RoomId; color: string; spriteRow: number; position: Point; description: string };
export type Room = { id: RoomId; name: string; purpose: string; label: Point; center: Point; bounds: [number, number, number, number] };
export type Task = { id: string; title: string; description: string; owner: string; status: Status; stage: number; progress: number; output: string; feedback: string; primary?: boolean };
export type ActivityEvent = { id: number; agent: string; text: string; time: number };
export type Travel = { agent: string; elapsed: number; duration: number; path: Point[] };
export type DemoState = { tasks: Task[]; events: ActivityEvent[]; time: number; travel: Travel[]; revision: number };
export type DemoAction = { type: 'tick'; seconds: number } | { type: 'approve'; id: string } | { type: 'revise'; id: string; feedback: string } | { type: 'unblock'; id: string } | { type: 'reset' };

export const WORLD = { width: 1536, height: 1024 };
export const rooms: Room[] = [
  { id: 'war', name: 'Royal War Room', purpose: 'Strategy & command', label: { x: 800, y: 25 }, center: { x: 800, y: 185 }, bounds: [545, 0, 490, 300] },
  { id: 'wizard', name: 'Wizard Workshop', purpose: 'Research & planning', label: { x: 340, y: 165 }, center: { x: 350, y: 325 }, bounds: [145, 155, 400, 315] },
  { id: 'elf', name: 'Elven Atelier', purpose: 'Creative & copy', label: { x: 1270, y: 170 }, center: { x: 1270, y: 330 }, bounds: [1060, 165, 390, 290] },
  { id: 'forge', name: 'Dwarven Forge', purpose: 'Engineering & testing', label: { x: 1260, y: 495 }, center: { x: 1250, y: 620 }, bounds: [1070, 500, 380, 220] },
  { id: 'hall', name: 'Great Hall', purpose: 'Quests & handoffs', label: { x: 800, y: 650 }, center: { x: 800, y: 550 }, bounds: [565, 375, 460, 340] },
  { id: 'grounds', name: 'Moonwell Gardens', purpose: 'A little room to breathe', label: { x: 300, y: 850 }, center: { x: 310, y: 700 }, bounds: [135, 520, 390, 330] },
];
export const agents: Agent[] = [
  { id: 'amron', name: 'Amron', title: 'Queen & commander', folk: 'Warrior queen', room: 'war', color: '#c9a66c', spriteRow: -1, position: { x: 925, y: 265 }, description: 'Keeps the whole quest in view. Sets direction, weighs decisions, and brings the realm’s work together.' },
  { id: 'orin', name: 'Orin', title: 'Research wizard', folk: 'Wizard', room: 'wizard', color: '#80bbb0', spriteRow: 0, position: { x: 302, y: 403 }, description: 'Finds the useful evidence among the scrolls. Turns open questions into a clear, grounded brief.' },
  { id: 'mira', name: 'Mira', title: 'Planning wizard', folk: 'Wizard', room: 'wizard', color: '#b6a0d3', spriteRow: 1, position: { x: 446, y: 425 }, description: 'Charts a path from first idea to finished work. Breaks a large quest into achievable steps.' },
  { id: 'liora', name: 'Liora', title: 'Creative elf', folk: 'Elf', room: 'elf', color: '#a8bd86', spriteRow: 2, position: { x: 1190, y: 386 }, description: 'Gives ideas their shape, color, and character. Crafts clear experiences with a little enchantment.' },
  { id: 'quill', name: 'Quill', title: 'Copywriting elf', folk: 'Elf', room: 'elf', color: '#94b8d0', spriteRow: 3, position: { x: 1350, y: 386 }, description: 'Finds the right words. Writes thoughtful, useful copy that makes every step feel clear.' },
  { id: 'borin', name: 'Borin', title: 'Engineering dwarf', folk: 'Dwarf', room: 'forge', color: '#d29970', spriteRow: 4, position: { x: 1175, y: 700 }, description: 'Turns plans into working things. Builds reliable foundations and solves the stubborn problems.' },
  { id: 'flint', name: 'Flint', title: 'Testing dwarf', folk: 'Dwarf', room: 'forge', color: '#b1b696', spriteRow: 5, position: { x: 1280, y: 700 }, description: 'Checks every hinge and every handoff. Looks for the small cracks before a quest is complete.' },
];
export const statusLabels: Record<Status, string> = { working: 'Working', review: 'Needs you', blocked: 'Blocked', complete: 'Complete', unconfirmed: 'Unconfirmed' };
export const stages = ['Research', 'Design', 'Engineering', 'Copy', 'Testing', 'Final review'];
const owners = ['orin', 'liora', 'borin', 'quill', 'flint', 'amron'];
const outputs = [
  'Goal: introduce the Moonwell collection through a welcoming, accessible launch page.\n\nAudience: curious first-time visitors.\n\nThe page should explain the collection, show three featured pieces, and make joining the waitlist straightforward.\n\nSuccess: visitors can describe the collection and find the invitation without searching. Keep the experience clear on a phone.',
  'Design direction: moonlit teal, warm parchment, generous spacing, and original collection imagery.\n\nStructure: introduction → three featured pieces → invitation.\n\nAll buttons have clear labels, visible focus, and comfortable touch targets.',
  'The sample launch page is assembled. Responsive sections, keyboard navigation, and form states are ready for review.\n\nThis is a simulated engineering output; no repository was changed.',
  'Headline: A little wonder, thoughtfully made.\n\nIntroduction: Meet Moonwell, a small collection inspired by the quiet magic of the natural world.\n\nInvitation: Be first to see what’s next.\n\nButton: Join the waitlist.',
  'Sample checks complete: keyboard journey, readable contrast, narrow-screen layout, and empty form guidance.\n\nAll demonstration checks passed. This is a sample report, not a test of a live product.',
  'The Moonwell launch-page quest is ready. Research, design, engineering, copy, and testing are complete.\n\nAmron’s recommendation: review the assembled direction and mark the sample quest complete.',
];
export function createDemo(): DemoState {
  return { time: 0, revision: 0, travel: [], tasks: [
    { id: 'moonwell', title: 'Introduce the Moonwell collection', description: 'A welcoming launch page, from first insight to final polish.', owner: 'orin', status: 'review', stage: 0, progress: 100, output: outputs[0], feedback: '', primary: true },
    { id: 'expedition', title: 'Chart the next expedition', description: 'A simple plan for the realm’s next project.', owner: 'mira', status: 'working', stage: 0, progress: 36, output: 'Three milestones: gather evidence, choose a direction, build a small working example.', feedback: '' },
    { id: 'palette', title: 'Find the colors of Moonwell', description: 'Explore a palette drawn from the forest and its waters.', owner: 'liora', status: 'working', stage: 1, progress: 54, output: 'Deep evergreen, luminous teal, warm ivory, and antique gold.', feedback: '' },
    { id: 'archive', title: 'Repair the archive search', description: 'The search needs a sample catalog before engineering can continue.', owner: 'borin', status: 'blocked', stage: 2, progress: 28, output: 'Waiting for a sample archive catalog. Use “Supply sample catalog” to resolve this demonstration blocker.', feedback: '' },
    { id: 'welcome', title: 'Write a warmer welcome', description: 'A short welcome for visitors to the castle.', owner: 'quill', status: 'complete', stage: 3, progress: 100, output: 'Welcome to the castle. Bring a question, an idea, or a beginning. There’s a place for it here.', feedback: '' },
    { id: 'gates', title: 'Check the castle gates', description: 'Inspect the sample navigation and access states.', owner: 'flint', status: 'working', stage: 4, progress: 72, output: 'Checking keyboard access, navigation, and clear error states.', feedback: '' },
  ], events: [
    { id: 3, agent: 'orin', text: 'A research brief is ready for your review.', time: 0 },
    { id: 2, agent: 'quill', text: 'Finished the castle’s welcome copy.', time: 0 },
    { id: 1, agent: 'amron', text: 'The realm is ready. A new quest awaits.', time: 0 },
  ] };
}
function event(state: DemoState, agent: string, text: string): DemoState {
  return { ...state, events: [{ id: (state.events[0]?.id || 0) + 1, agent, text, time: state.time }, ...state.events].slice(0, 30) };
}
// Routes follow the castle's doorways; actors return to their own station.
export const routes: Partial<Record<RoomId, Point[]>> = {
  wizard: [{ x: 380, y: 420 }, { x: 495, y: 420 }, { x: 495, y: 390 }, { x: 560, y: 390 }, { x: 800, y: 390 }, { x: 800, y: 315 }],
  elf: [{ x: 1270, y: 420 }, { x: 1100, y: 420 }, { x: 1100, y: 390 }, { x: 1030, y: 390 }, { x: 800, y: 390 }, { x: 800, y: 315 }],
  forge: [{ x: 1210, y: 695 }, { x: 1210, y: 590 }, { x: 1100, y: 590 }],
};
export function travelPath(agent: Agent): Point[] {
  const route = routes[agent.room];
  if (!route) return [agent.position];
  return [agent.position, ...route, ...[...route].reverse(), agent.position];
}
export function positionOnPath(path: Point[], fraction: number): Point {
  if (!path.length) return { x: 0, y: 0 };
  if (fraction <= 0) return path[0];
  if (fraction >= 1) return path[path.length - 1];
  const distances = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
  let left = Math.max(0, Math.min(1, fraction)) * distances.reduce((a, b) => a + b, 0);
  for (let i = 0; i < distances.length; i++) {
    if (left <= distances[i] && distances[i] > 0) {
      const t = left / distances[i];
      return { x: path[i].x + (path[i + 1].x - path[i].x) * t, y: path[i].y + (path[i + 1].y - path[i].y) * t };
    }
    left -= distances[i];
  }
  return path[path.length - 1];
}
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'reset') return createDemo();
  if (action.type === 'tick') {
    const seconds = Math.max(0, Math.min(action.seconds, 2));
    let next = { ...state, time: state.time + seconds, travel: state.travel.map(t => ({ ...t, elapsed: t.elapsed + seconds })).filter(t => t.elapsed < t.duration) };
    const tasks = state.tasks.map(task => {
      if (task.status !== 'working') return task;
      const progress = Math.min(100, task.progress + seconds * (task.primary ? 4 : 0.7));
      if (progress < 100) return { ...task, progress };
      next = event(next, task.owner, `${task.primary ? 'Prepared for review' : 'Completed'}: ${task.title}.`);
      return { ...task, progress, status: task.primary ? 'review' as const : 'complete' as const, output: task.primary ? outputs[task.stage] : task.output };
    });
    return { ...next, tasks };
  }
  const task = state.tasks.find(t => t.id === action.id);
  if (!task) return state;
  if (action.type === 'approve' && task.status === 'review') {
    const done = task.stage === 5;
    const stage = done ? task.stage : task.stage + 1;
    const owner = done ? task.owner : owners[stage];
    let next = { ...state, tasks: state.tasks.map(t => t.id === task.id ? { ...t, stage, owner, status: done ? 'complete' as const : 'working' as const, progress: done ? 100 : 0, output: done ? t.output : 'Work is underway. The next sample output will appear when this stage is ready for review.', feedback: '' } : t), revision: state.revision + 1 };
    const actor = agents.find(a => a.id === task.owner)!;
    if (!done && actor.id !== 'amron') next = { ...next, travel: [...state.travel.filter(t => t.agent !== actor.id), { agent: actor.id, elapsed: 0, duration: 18, path: travelPath(actor) }] };
    return event(next, 'amron', done ? 'Marked the Moonwell quest complete.' : `Approved ${stages[task.stage].toLowerCase()}. ${agents.find(a => a.id === owner)?.name} takes the next step.`);
  }
  if (action.type === 'revise' && task.status === 'review' && action.feedback.trim()) {
    const next = { ...state, tasks: state.tasks.map(t => t.id === task.id ? { ...t, status: 'working' as const, progress: 0, feedback: action.feedback.trim(), output: `Revision requested: ${action.feedback.trim()}\n\nThe sample agent is revisiting this stage.` } : t) };
    return event(next, 'amron', `Requested changes from ${agents.find(a => a.id === task.owner)?.name}.`);
  }
  if (action.type === 'unblock' && task.status === 'blocked') {
    const next = { ...state, tasks: state.tasks.map(t => t.id === task.id ? { ...t, status: 'working' as const, output: 'Sample catalog supplied. Archive search work can continue.' } : t) };
    return event(next, task.owner, 'Received the sample catalog. Work is moving again.');
  }
  return state;
}
export function agentTask(state: DemoState, id: string) {
  const active = state.tasks.filter(t => t.owner === id);
  return active.find(t => t.primary && t.status !== 'complete') || active.find(t => t.status !== 'complete') || active[0];
}
export type Camera = { x: number; y: number; scale: number };
export function toWorld(point: Point, camera: Camera): Point { return { x: (point.x - camera.x) / camera.scale, y: (point.y - camera.y) / camera.scale }; }
export function hitAgent(point: Point, positions: { id: string; point: Point }[], radius = 34): string | undefined {
  return [...positions].reverse().find(p => Math.abs(point.x - p.point.x) < radius && point.y < p.point.y + 12 && point.y > p.point.y - 65)?.id;
}
