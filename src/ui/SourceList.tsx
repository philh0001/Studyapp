import {isSourceCheckDue} from '../content/trust';
import type {Reference} from '../content/types';
export function SourceList({references}:{references:Reference[]}){return <div className="sources"><h3>Microsoft Learn sources</h3>{references.map(r=><div key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a><small>{r.section?`Section: ${r.section} · `:''}Checked {new Date(r.checkedAt).toLocaleDateString()} · opens online{isSourceCheckDue(r.checkedAt,new Date())?' · source recheck due':''}</small></div>)}</div>}
