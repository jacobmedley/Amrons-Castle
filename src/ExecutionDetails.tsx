import { agents } from './model';
import { executionForAgent, sampleEffortLabel, sampleModelLabel } from './execution';
import type { CharacterNames } from './characterNames';

export function ExecutionDetails({ agentId }: { agentId: string }) {
  const execution = executionForAgent(agentId);
  if (!execution) return null;
  return <section className="execution-details" aria-label="Model and effort">
    <div className="execution-heading"><h3>Model & effort</h3><span>Sample assignment</span></div>
    <dl>
      <div><dt>Model</dt><dd>{sampleModelLabel(execution)}</dd></div>
      <div><dt>Reasoning effort</dt><dd>{sampleEffortLabel(execution)}</dd></div>
    </dl>
    <p><i className="execution-dot"/>No model running · Demo only</p>
    <small>Runtime model and effort: not reported. These assignments do not change your settings.</small>
  </section>;
}

export function ExecutionRosterLabel({ agentId }: { agentId: string }) {
  const execution = executionForAgent(agentId);
  if (!execution) return null;
  return <small className="execution-roster-label">{execution.sample.shortModel} · {sampleEffortLabel(execution)} <span>(sample)</span></small>;
}

export function ExecutionOverview({ names }: { names?: CharacterNames }) {
  return <>
    <p className="eyebrow">DEMO EXECUTION</p>
    <h2 id="execution-title">Model & effort</h2>
    <p id="execution-description">No models are running. These sample assignments show how the fellowship could be organized; all work in this castle is simulated.</p>
    <div className="execution-table-wrap"><table className="execution-table">
      <caption>Illustrative assignments · October 7, 2026</caption>
      <thead><tr><th scope="col">Agent</th><th scope="col">Sample model</th><th scope="col">Sample effort</th></tr></thead>
      <tbody>{agents.map(agent => {
        const execution = executionForAgent(agent.id)!;
        return <tr key={agent.id}><th scope="row">{names?.[agent.id] || agent.name}<small>{agent.title}</small></th><td>{sampleModelLabel(execution)}</td><td>{sampleEffortLabel(execution)}</td></tr>;
      })}</tbody>
    </table></div>
    <p className="execution-note">Runtime-accepted model and effort: <strong>not reported</strong> for every agent. {names?.amron || 'Amron'}’s active lead settings are preserved and unreported. A sample assignment is not a request sent to a model.</p>
  </>;
}
