// Illustrative assignments only. Character identity does not depend on a model version.
export type Execution = {
  sample: { model: string | null; shortModel: string; effort: 'medium' | 'high' | null; profile: string | null };
  runtime: { state: 'not-running'; model: null; effort: null };
};

const assignments: Readonly<Record<string, Execution['sample']>> = {
  amron: { model: null, shortModel: 'Active lead', effort: null, profile: 'director' },
  orin: { model: 'GPT-5.6 Sol', shortModel: 'Sol', effort: 'high', profile: 'research-synthesis' },
  mira: { model: 'GPT-5.6 Sol', shortModel: 'Sol', effort: 'high', profile: 'research-synthesis' },
  liora: { model: 'GPT-5.6 Sol', shortModel: 'Sol', effort: 'high', profile: 'design-production' },
  quill: { model: 'GPT-5.6 Sol', shortModel: 'Sol', effort: 'medium', profile: 'ux-writing' },
  borin: { model: 'GPT-5.6 Sol', shortModel: 'Sol', effort: 'high', profile: 'code-build' },
  flint: { model: 'Claude Sonnet 5', shortModel: 'Sonnet', effort: 'medium', profile: 'code-review' },
};

export function executionForAgent(agentId: string): Execution | undefined {
  if (!Object.hasOwn(assignments, agentId)) return undefined;
  return { sample: { ...assignments[agentId] }, runtime: { state: 'not-running', model: null, effort: null } };
}

export function sampleModelLabel(execution: Execution): string {
  return execution.sample.model ?? 'Preserve active lead';
}

export function sampleEffortLabel(execution: Execution): string {
  const effort = execution.sample.effort;
  return effort ? effort[0].toUpperCase() + effort.slice(1) : 'Unreported';
}
