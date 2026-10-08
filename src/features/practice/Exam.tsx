import {useEffect,useRef,useState} from 'react';
import type {Session,SessionAnswer} from '../../sessions/types';
import type {StudyRepository} from '../../storage/repository';
import type {SessionService} from '../../sessions/service';
import {QuestionView} from './Question';
export interface ExamProps{session:Session;repository:StudyRepository;service:SessionService;onChanged:(session:Session)=>void|Promise<void>;onFinished:()=>Promise<void>;onDraftTracked?:(write:Promise<void>)=>Promise<void>}
export function Exam({session,repository,service,onChanged,onFinished,onDraftTracked}:ExamProps){
 const [current,setCurrent]=useState(session),[now,setNow]=useState(Date.now()),[busy,setBusy]=useState(false),[confirming,setConfirming]=useState(false),[error,setError]=useState(''),[finalError,setFinalError]=useState(false);
 const latest=useRef(current),queue=useRef(Promise.resolve()),draftFailure=useRef<Error|null>(null),finalising=useRef(false),retryRequired=useRef(false),finished=useRef(false),finishRef=useRef<()=>Promise<void>>(async()=>{});
 const deadline=Date.parse(current.deadlineAt??''),expired=Number.isFinite(deadline)&&now>=deadline;
 function publish(next:Session){latest.current=next;setCurrent(next);return onChanged(next)}
 async function reload(){const next=await repository.db.sessions.get(session.id);if(!next)throw Error('Session not found.');await publish(next);return next}
 function draft(questionId:string,answer:SessionAnswer):Promise<void>{
  const operation=queue.current.then(async()=>{await service.saveDraftAnswer(session.id,questionId,answer);draftFailure.current=null;await reload()});
  queue.current=operation.catch(e=>{draftFailure.current=e instanceof Error?e:Error('Answer not saved.');});return operation;
 }
 async function move(index:number,flag=false){setBusy(true);setError('');try{
  await Promise.resolve();await queue.current;if(draftFailure.current)throw draftFailure.current;
  if(Date.now()>=deadline){await finishRef.current();return}
  const next=await repository.db.transaction('rw',repository.db.sessions,async()=>{const saved=await repository.db.sessions.get(session.id);if(!saved||saved.status!=='active'||Date.now()>=Date.parse(saved.deadlineAt??''))throw Error('This session has finished.');if(flag){const id=saved.questionSnapshots[saved.currentIndex].id;saved.flags=saved.flags.includes(id)?saved.flags.filter(value=>value!==id):[...saved.flags,id]}else saved.currentIndex=Math.max(0,Math.min(index,saved.questionSnapshots.length-1));await repository.db.sessions.put(saved);return saved});await publish(next);
 }catch(e){setError(e instanceof Error?e.message:'Could not save session.')}finally{setBusy(false)}}
 async function finish(){if(finalising.current||finished.current)return;finalising.current=true;retryRequired.current=false;setBusy(true);setError('');setFinalError(false);try{
  await Promise.resolve();await queue.current;
  if(draftFailure.current&&Date.now()<deadline)throw draftFailure.current;
  await service.finaliseTimedSession(session.id,new Date());await reload();setConfirming(false);await onFinished();finished.current=true;
 }catch(e){setError(e instanceof Error?e.message:'Final submission was not saved. Retry.');setFinalError(true);retryRequired.current=true}finally{finalising.current=false;setBusy(false)}}
 useEffect(()=>{finishRef.current=finish});
 useEffect(()=>{latest.current=session;setCurrent(session)},[session]);
 useEffect(()=>{
  function check(){const timestamp=Date.now();setNow(timestamp);const saved=latest.current;if(!retryRequired.current&&(saved.status==='submitted'||timestamp>=Date.parse(saved.deadlineAt??'')))void finishRef.current()}
  check();const timer=setInterval(check,1000);document.addEventListener('visibilitychange',check);window.addEventListener('focus',check);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',check);window.removeEventListener('focus',check)};
 },[session.id]);
 const question=current.questionSnapshots[current.currentIndex],remaining=Math.max(0,Math.ceil((deadline-now)/1000)),unanswered=current.questionSnapshots.filter(q=>(current.answers[q.id]?.selectedOptionIds.length??0)!==q.requiredSelections).length;
 return <><div className="page-title"><span className="eyebrow">Timed practice</span><h1>Focus on your reasoning.</h1><p>{current.questionSnapshots.length} original practice questions. Feedback appears after final submission.</p></div><section className="card"><div className="session-bar"><strong>Question {current.currentIndex+1} of {current.questionSnapshots.length}</strong><span role="timer" aria-label="Time remaining">{Number.isFinite(remaining)?`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'No deadline'}</span></div>
 {error&&<p className="notice error" role="alert">{error}</p>}
 {finalError&&<button className="primary" disabled={busy} onClick={()=>void finish()}>Retry final submission</button>}
 {current.status==='active'&&!expired&&question&&<fieldset disabled={busy} className="exam-controls"><legend className="sr-only">Timed answer and navigation</legend><QuestionView key={question.id} question={question} optionOrder={current.optionOrders[question.id]} initial={current.answers[question.id]} submitLabel="Save & next" onSaveQueued={onDraftTracked} onDraft={answer=>draft(question.id,answer)} onSubmit={async(ids,confidence,responseMs)=>{await draft(question.id,{selectedOptionIds:ids,confidence,responseMs});if(current.currentIndex+1<current.questionSnapshots.length)await move(current.currentIndex+1);else setConfirming(true)}}/>
 <div className="button-row"><button onClick={()=>void move(current.currentIndex,true)}>{current.flags.includes(question.id)?'Unflag question':'Flag question'}</button><button disabled={current.currentIndex===0} onClick={()=>void move(current.currentIndex-1)}>Previous question</button><button disabled={current.currentIndex===current.questionSnapshots.length-1} onClick={()=>void move(current.currentIndex+1)}>Skip to next question</button></div>
 <nav aria-label="Practice question navigation" className="button-row">{current.questionSnapshots.map((q,index)=><button key={q.id} aria-label={`Go to question ${index+1}`} aria-current={index===current.currentIndex?'step':undefined} onClick={()=>void move(index)}>{index+1}{current.flags.includes(q.id)?' ⚑':''}{current.answers[q.id]?.selectedOptionIds.length===q.requiredSelections?' ✓':''}</button>)}</nav>
 <button className="primary full" onClick={()=>{setError('');setConfirming(true)}}>Finish practice</button></fieldset>}
 {expired&&current.status==='active'&&<p>Time has ended. Saving your final answers…</p>}
 {current.status==='submitted'&&<p>Final answers saved.</p>}
 {confirming&&current.status==='active'&&!expired&&<div role="group" aria-label="Confirm practice submission"><p>{unanswered} unanswered {unanswered===1?'question':'questions'}. Unanswered or incomplete selections score incorrect. Submit your final answers now?</p><button className="primary" disabled={busy} onClick={()=>void finish()}>Confirm submission</button><button disabled={busy} onClick={()=>setConfirming(false)}>Cancel submission</button></div>}
 </section></>
}
