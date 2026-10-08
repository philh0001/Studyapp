import {useEffect,useId,useRef,useState} from 'react';
import type {StudyRepository} from '../../storage/repository';
import {writeWorkspace} from '../../storage/workspace';
import {isAssessmentSession,type Session} from '../../sessions/types';
import type {Question} from '../../content/types';
import {normaliseWorkpad,workpadKey,WORKPAD_TEXT_LIMIT,type Workpad} from './model';
import './workpad.css';
export interface QuestionWorkpadProps {repository:StudyRepository;session:Session;question:Question;answered?:boolean;onSaveQueued?:(write:Promise<void>)=>unknown}
/** Only the personal workspace is read/written. Correct answers and supplied explanations are never read. */
export function QuestionWorkpad(props:QuestionWorkpadProps){return <WorkpadEditor key={workpadKey(props.session.id,props.question.id,props.question.revision)} {...props}/>}
function WorkpadEditor({repository,session,question,answered=false,onSaveQueued}:QuestionWorkpadProps){
 const id=workpadKey(session.id,question.id,question.revision),heading=useId();
 const optionIds=question.options.map(option=>option.id);
 const order=session.optionOrders[question.id]??optionIds;
 const orderedOptions=[...new Set([...order,...optionIds])].flatMap(optionId=>{const option=question.options.find(item=>item.id===optionId);return option?[option]:[]});
 const [pad,setPad]=useState<Workpad>(()=>normaliseWorkpad(null,optionIds));
 const [loaded,setLoaded]=useState(false),[loadFailed,setLoadFailed]=useState(false),[busy,setBusy]=useState(false),[confirming,setConfirming]=useState(false),[message,setMessage]=useState('Loading workpad…'),[error,setError]=useState(false),[newItem,setNewItem]=useState(''),[retry,setRetry]=useState(0);
 const editVersion=useRef(0),mounted=useRef(false),queue=useRef(Promise.resolve()),pending=useRef(0),initialOptionIds=useRef(optionIds);
 const reflectionAllowed=(!isAssessmentSession(session)&&answered)||session.status==='submitted';
 useEffect(()=>{
  let current=true;mounted.current=true;
  void repository.db.workspace.get(id).then(row=>{
   if(!current)return;const restored=normaliseWorkpad(row?.value,initialOptionIds.current);setPad(restored);setNewItem(restored.checklistDraft);setLoaded(true);setLoadFailed(false);setMessage('Personal edits save automatically on this device.');setError(false);
  }).catch(()=>{if(current){setLoadFailed(true);setMessage('Workpad could not be loaded. Retry before editing to protect existing notes.');setError(true)}});
  return()=>{current=false;mounted.current=false};
 },[repository,id,retry]);
 function persist(next:Workpad,version:number,clear=false){
  pending.current++;setBusy(true);setError(false);setMessage(clear?'Clearing workpad…':'Saving workpad…');
  const write=queue.current.then(()=>writeWorkspace(repository,id,{...next}));
  queue.current=write.catch(()=>{});
  // Register immediately so application navigation waits for every queued edit.
  if(onSaveQueued){try{void Promise.resolve(onSaveQueued(write)).catch(()=>{})}catch{/* The local result still reports persistence honestly. */}}
  void write.then(()=>{
   if(!mounted.current)return;
   if(clear){setPad(next);setNewItem('');setConfirming(false);editVersion.current++;setMessage('Workpad cleared on this device.')}
   else if(editVersion.current===version){setError(false);setMessage('Workpad saved on this device.')}
  }).catch(()=>{if(mounted.current&&editVersion.current===version){setError(true);setMessage(clear?'Clear failed. Your workpad is retained; retry.':'Save failed. Your draft is still here; retry before leaving.')}}).finally(()=>{pending.current--;if(mounted.current)setBusy(pending.current>0)});
 }
 function update(next:Workpad){const bounded=normaliseWorkpad(next,optionIds);editVersion.current++;setPad(bounded);persist(bounded,editVersion.current)}
 function save(clear=false){if(!loaded)return;persist(clear?normaliseWorkpad(null,optionIds):pad,editVersion.current,clear)}
 const fields:(readonly [keyof Pick<Workpad,'approach'|'requirements'|'assumptions'|'confidenceReasoning'|'reflection'|'nextReading'>,string])[]=[['approach','My approach'],['requirements','Requirements I identified'],['assumptions','My assumptions'],['confidenceReasoning','My confidence reasoning'],...(reflectionAllowed?[['reflection','My post-answer reflection'] as const]:[]),['nextReading','My next-reading intention']];
 return <section className="card question-workpad" aria-labelledby={heading}>
  <h2 id={heading}>Personal reasoning workpad</h2><p>Personal reasoning only: these notes are not verified facts, content approval, scores or exam-readiness evidence. Eliminating an option here never changes your answer.</p>
  <p>Saved separately for this session, question and revision {question.revision}. Notes stay on this device and are included in your backup.</p>
  <p role={error?'alert':'status'} aria-live="polite">{message}</p>
  {loadFailed&&<button type="button" onClick={()=>{setLoadFailed(false);setMessage('Loading workpad…');setRetry(value=>value+1)}}>Retry loading workpad</button>}
  {loaded&&<>
   <fieldset disabled={busy&&confirming}><legend className="sr-only">Personal workpad fields</legend>
   {fields.map(([key,label])=><label className="field" key={key}>{label}<textarea rows={3} maxLength={WORKPAD_TEXT_LIMIT} value={pad[key]} onChange={event=>update({...pad,[key]:event.target.value})}/></label>)}
   {!reflectionAllowed&&<p>Post-answer reflection becomes available after feedback. Assessment feedback waits for final submission.</p>}
   <fieldset><legend>My option elimination</legend>{orderedOptions.map((option,index)=>{
    const name=String.fromCharCode(65+index),eliminated=pad.eliminations.find(row=>row.optionId===option.id);
    return <div className="workpad-option" key={option.id}><p><strong>Option {name}:</strong> {option.text}</p><button type="button" aria-pressed={!!eliminated} onClick={()=>update({...pad,eliminations:eliminated?pad.eliminations.filter(row=>row.optionId!==option.id):[...pad.eliminations,{optionId:option.id,reason:''}]})}>{eliminated?'Restore':'Eliminate'} option {name}</button>{eliminated&&<label className="field">My reason for eliminating option {name}<textarea rows={2} maxLength={1000} value={eliminated.reason} onChange={event=>update({...pad,eliminations:pad.eliminations.map(row=>row.optionId===option.id?{...row,reason:event.target.value}:row)})}/></label>}</div>
   })}</fieldset>
   <fieldset><legend>My verification checklist</legend>{pad.checklist.map((row,index)=><div className="workpad-check" key={index}><label><input type="checkbox" checked={row.done} onChange={event=>update({...pad,checklist:pad.checklist.map((item,i)=>i===index?{...item,done:event.target.checked}:item)})}/><span>{row.text}</span></label><button type="button" aria-label={`Remove checklist item ${index+1}`} onClick={()=>update({...pad,checklist:pad.checklist.filter((_,i)=>i!==index)})}>Remove</button></div>)}<label className="field">New personal checklist item<input maxLength={500} value={newItem} onChange={event=>{setNewItem(event.target.value.slice(0,500));update({...pad,checklistDraft:event.target.value})}}/></label><button type="button" disabled={!newItem.trim()||pad.checklist.length>=20} onClick={()=>{update({...pad,checklist:[...pad.checklist,{text:newItem.trim(),done:false}],checklistDraft:''});setNewItem('')}}>Add checklist item</button><p>Up to 20 personal checks.</p></fieldset>
   </fieldset>
   <div className="button-row"><button type="button" disabled={busy&&confirming} onClick={()=>void save()}>Save workpad</button><button type="button" disabled={busy} onClick={()=>setConfirming(true)}>Clear workpad</button></div>
   {confirming&&<div role="group" aria-label="Confirm clearing personal workpad"><p>Clear every personal note, eliminated option and checklist item for this question revision in this session? This cannot be undone.</p><div className="button-row"><button type="button" disabled={busy} onClick={()=>void save(true)}>Confirm clear workpad</button><button type="button" disabled={busy} onClick={()=>setConfirming(false)}>Cancel clear</button></div></div>}
  </>}
 </section>
}
