import {useEffect,useRef,useState} from 'react';
import type {DatabaseSnapshot} from '../../sessions/types';
import type {StudyRepository} from '../../storage/repository';
import {workspaceValue,writeWorkspace} from '../../storage/workspace';
import {isOfficialSource} from '../../content/validate';
import {assessmentContentIdentity,assessmentKey,assessmentScore,initialAssessmentState,normaliseAssessmentState} from './assessment-state';
import type {ModuleAssessmentPack,ModuleAssessmentState,ModuleQuestion} from './assessment-types';
export interface ModuleAssessmentProps{pack:ModuleAssessmentPack;moduleTitle:string;repository:StudyRepository;snapshot:DatabaseSnapshot;onSaveQueued:(write:Promise<void>)=>Promise<void>}
export function ModuleAssessment(props:ModuleAssessmentProps){return <Assessment key={assessmentContentIdentity(props.pack)} {...props}/>}
function Sources({urls}:{urls:string[]}){const official=[...new Set(urls)].filter(isOfficialSource);return <ul className="module-assessment-sources">{official.map((url,index)=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">Microsoft Learn source {index+1}</a></li>)}</ul>}
function AnswerFeedback({question,selectedOptionId}:{question:ModuleQuestion;selectedOptionId:string}){
 const selected=question.options.find(o=>o.id===selectedOptionId)!,correct=question.options.find(o=>o.id===question.correctOptionId)!,right=selected.id===correct.id;
 return <div className={'module-assessment-feedback '+(right?'correct':'incorrect')}><h4>{right?'Correct':'Incorrect'}</h4><p><strong>Your answer:</strong> {selected.text}</p><p>{selected.explanation}</p>{!right&&<><p><strong>Correct answer:</strong> {correct.text}</p><p>{correct.explanation}</p></>}<Sources urls={[...selected.sourceUrls,...(!right?correct.sourceUrls:[])]}/></div>
}
function Assessment({pack,moduleTitle,repository,snapshot,onSaveQueued}:ModuleAssessmentProps){
 const [state,setState]=useState(()=>normaliseAssessmentState(workspaceValue<unknown>(snapshot,assessmentKey(pack.moduleId),{}),pack)),[pendingCount,setPendingCount]=useState(0),[error,setError]=useState(''),[hydrated,setHydrated]=useState(false);
 const current=useRef(state),queue=useRef(Promise.resolve()),sequence=useRef(0),mounted=useRef(false),focusRequested=useRef(false),questionHeading=useRef<HTMLHeadingElement>(null),resultHeading=useRef<HTMLHeadingElement>(null),failed=useRef(false),hydrationSequence=useRef(0);
 const complete=state.currentIndex===pack.questions.length,question=pack.questions[state.currentIndex],answer=question?state.answers[question.id]:undefined;
 function load(){
  const token=++hydrationSequence.current;setHydrated(false);setError('');
  const read=repository.db.workspace.get(assessmentKey(pack.moduleId)).then(row=>{
   if(!mounted.current||token!==hydrationSequence.current)return;
   const next=normaliseAssessmentState(row?.value??{},pack);current.current=next;setState(next);failed.current=false;setHydrated(true);
  });
  void onSaveQueued(read).catch(()=>{if(mounted.current&&token===hydrationSequence.current)setError('Could not load your saved assessment. Retry loading before answering.');});
 }
 useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;hydrationSequence.current++}},[]);
 useEffect(()=>{if(!focusRequested.current)return;focusRequested.current=false;const heading=complete?resultHeading.current:questionHeading.current;heading?.focus({preventScroll:true});heading?.scrollIntoView?.({block:'start'})},[state.currentIndex,complete]);
 function save(next:ModuleAssessmentState){
  current.current=next;setState(next);setPendingCount(count=>count+1);const token=++sequence.current;
  const write=queue.current.catch(()=>{}).then(()=>writeWorkspace(repository,assessmentKey(pack.moduleId),{...next}));queue.current=write;
  void onSaveQueued(write).then(()=>{if(mounted.current&&token===sequence.current){failed.current=false;setError('')}},()=>{if(mounted.current&&token===sequence.current){failed.current=true;setError('Could not save this assessment. Retry saving before leaving or continuing.')}}).finally(()=>{if(mounted.current)setPendingCount(count=>count-1)});
 }
 function select(id:string){const value=current.current,q=pack.questions[value.currentIndex];if(!hydrated||!q||value.answers[q.id]?.submitted||failed.current||!q.options.some(o=>o.id===id))return;save({...value,answers:{...value.answers,[q.id]:{selectedOptionId:id,submitted:false}}})}
 function check(){const value=current.current,q=pack.questions[value.currentIndex],saved=q?value.answers[q.id]:undefined;if(!hydrated||!q||!saved||saved.submitted||failed.current)return;save({...value,answers:{...value.answers,[q.id]:{...saved,submitted:true}}})}
 function next(){const value=current.current,q=pack.questions[value.currentIndex];if(pendingCount||failed.current||!q||!value.answers[q.id]?.submitted)return;focusRequested.current=true;save({...value,currentIndex:value.currentIndex+1})}
 function restart(){if(pendingCount||failed.current||current.current.currentIndex!==pack.questions.length)return;const previous={answers:Object.fromEntries(pack.questions.map(q=>[q.id,current.current.answers[q.id].selectedOptionId]))};focusRequested.current=true;save({...initialAssessmentState(pack),previousAttempt:previous})}
 const previousScore=state.previousAttempt?pack.questions.filter(q=>state.previousAttempt!.answers[q.id]===q.correctOptionId).length:null;
 return <section className="module-assessment" aria-labelledby="module-assessment-title"><h2 id="module-assessment-title" tabIndex={-1}>Module assessment</h2><p>{moduleTitle} · original source-backed practice, not actual Microsoft exam questions.</p>
 {hydrated&&previousScore!==null&&<p className="fine-print">Previous attempt: {previousScore} / {pack.questions.length} correct</p>}
 {error&&<p className="notice error" role="alert">{error} <button onClick={()=>hydrated?save({...current.current}):load()} disabled={pendingCount>0}>{hydrated?'Retry saving':'Retry loading'}</button></p>}
 {pendingCount>0&&<p className="fine-print" role="status">Saving assessment progress…</p>}
 {!hydrated?(!error&&<p role="status">Loading saved assessment…</p>):complete?<><h3 ref={resultHeading} tabIndex={-1}>Assessment complete</h3><p className="module-assessment-score">{assessmentScore(state,pack)} / {pack.questions.length} correct</p><button onClick={restart} disabled={pendingCount>0||!!error}>Try again</button><details><summary>Review answers</summary><ol className="module-assessment-review">{pack.questions.map(q=><li key={q.id}><h4>{q.prompt}</h4><AnswerFeedback question={q} selectedOptionId={state.answers[q.id].selectedOptionId}/></li>)}</ol></details></>:
 question&&<><p className="fine-print">Question {state.currentIndex+1} of {pack.questions.length}</p><h3 ref={questionHeading} tabIndex={-1}>{question.prompt}</h3><fieldset className="module-assessment-options" disabled={!!answer?.submitted||!!error}><legend>Choose one answer</legend>{question.options.map(option=><label key={option.id}><input type="radio" name={`module-assessment-${pack.moduleId}-${question.id}`} value={option.id} checked={answer?.selectedOptionId===option.id} onChange={()=>select(option.id)}/><span>{option.text}</span></label>)}</fieldset>
 {!answer?.submitted&&<button onClick={check} disabled={!answer?.selectedOptionId||!!error}>Check answer</button>}
 {answer?.submitted&&<><AnswerFeedback question={question} selectedOptionId={answer.selectedOptionId}/><button onClick={next} disabled={pendingCount>0||!!error}>{state.currentIndex===pack.questions.length-1?'Finish assessment':'Next question'}</button></>}</>}
 </section>
}
