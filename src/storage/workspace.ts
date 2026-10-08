import type {StudyRepository} from './repository';
import type {DatabaseSnapshot} from '../sessions/types';
export interface WorkspaceEntry{id:string;version:1;value:Record<string,unknown>;updatedAt:string}
export const MAX_WORKSPACE_ENTRY_BYTES=2_097_152;
export function validateWorkspaceValue(value:unknown):void{
 const inspect=(item:unknown,depth:number)=>{if(depth>16)throw Error('Personal data is nested too deeply.');if(item===null||['string','boolean'].includes(typeof item))return;if(typeof item==='number'&&Number.isFinite(item))return;if(typeof item!=='object')throw Error('Personal data must be plain JSON.');if(!Array.isArray(item)&&Object.getPrototypeOf(item)!==Object.prototype&&Object.getPrototypeOf(item)!==null)throw Error('Personal data must be plain JSON.');for(const [key,next] of Object.entries(item)){if(['__proto__','constructor','prototype'].includes(key))throw Error('Unsafe personal-data key.');inspect(next,depth+1)}};
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Personal data must be a JSON object.');inspect(value,0);if(new TextEncoder().encode(JSON.stringify(value)).length>MAX_WORKSPACE_ENTRY_BYTES)throw Error('This personal-data section exceeds 2 MiB.');
}
export function validateWorkspaceEntry(entry:WorkspaceEntry):void{if(!/^[a-z][a-z0-9-]*:[a-zA-Z0-9:%_-]{1,512}$/.test(entry.id)||entry.version!==1||!Number.isFinite(Date.parse(entry.updatedAt)))throw Error('Invalid personal-data record.');validateWorkspaceValue(entry.value)}
export function workspaceValue<T>(snapshot:DatabaseSnapshot,id:string,fallback:T):T{return ((Array.isArray(snapshot.workspace)?snapshot.workspace.find(row=>row&&row.id===id)?.value:undefined) as T|undefined)??fallback}
export async function readWorkspace<T>(repository:StudyRepository,id:string,fallback:T):Promise<T>{return (await repository.db.workspace.get(id))?.value as T??fallback}
export async function writeWorkspace(repository:StudyRepository,id:string,value:Record<string,unknown>):Promise<void>{const entry:WorkspaceEntry={id,version:1,value,updatedAt:new Date().toISOString()};validateWorkspaceEntry(entry);await repository.db.workspace.put(entry)}
