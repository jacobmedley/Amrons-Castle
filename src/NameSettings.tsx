import { useRef, useState } from 'react';
import { agents } from './model';
import { characterDefaults, characterIds, cleanDisplayName, companionId, type CharacterNames } from './characterNames';

type Props = { names: CharacterNames; onSave: (names: CharacterNames) => void; onRestore: () => void };

export function NameSettings({ names, onSave, onRestore }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<CharacterNames>(names);
  const [error, setError] = useState('');
  const open = () => { setDraft({ ...names }); setError(''); dialog.current?.showModal(); };
  const save = () => {
    const invalid = characterIds.find(id => !cleanDisplayName(draft[id] ?? ''));
    if (invalid) { setError(`${characterDefaults[invalid]} needs a name of 1–28 characters.`); return; }
    onSave(Object.fromEntries(characterIds.map(id => [id, cleanDisplayName(draft[id])!])));
    dialog.current?.close();
  };
  return <>
    <button className="quiet-button name-settings-trigger" onClick={open}>Edit names</button>
    <dialog ref={dialog} className="help-dialog name-settings" aria-labelledby="name-settings-title" onClose={() => setError('')}>
      <button className="icon-button dialog-close" aria-label="Close name settings" onClick={() => dialog.current?.close()}>×</button>
      <p className="eyebrow">CASTLE SETTINGS</p><h2 id="name-settings-title">Character names</h2>
      <p>Choose names shown around the castle. Roles, task ownership and the characters’ underlying identities stay the same.</p>
      <form onSubmit={event => { event.preventDefault(); save(); }}>
        <div className="name-settings-fields">{agents.map(agent => <label key={agent.id} htmlFor={`name-${agent.id}`}><span>{agent.title}<small>Default: {agent.name}</small></span><input id={`name-${agent.id}`} value={draft[agent.id] ?? ''} maxLength={56} autoComplete="off" onChange={event => setDraft(current => ({ ...current, [agent.id]: event.target.value }))}/></label>)}
          <label htmlFor="name-loki"><span>Castle companion<small>Default: LOKI</small></span><input id="name-loki" value={draft[companionId] ?? ''} maxLength={56} autoComplete="off" onChange={event => setDraft(current => ({ ...current, [companionId]: event.target.value }))}/></label>
        </div>
        <button type="button" className="text-button" onClick={() => setDraft(current => ({ ...current, amron: 'Dot' }))}>Use Dot for the coordinator</button>
        <p className="name-settings-note">Dot here is a display name. The castle does not connect to a ChatGPT dot or change agent permissions. Your ChatGPT pet selection is not available to this standalone page; the companion art remains LOKI for now.</p>
        {error && <p className="name-settings-error" role="alert">{error}</p>}
        <div className="name-settings-actions"><button type="button" className="secondary-button" onClick={() => { onRestore(); setDraft({ ...characterDefaults }); setError(''); }}>Restore defaults</button><button type="submit" className="primary-button">Save names</button></div>
      </form>
    </dialog>
  </>;
}
