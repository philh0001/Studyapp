import {useEffect,useMemo,useRef,useState} from 'react';
import data from '../../../content/course/az104-course.json';
import type {StudyRepository} from '../../storage/repository';
import type {DatabaseSnapshot} from '../../sessions/types';
import {workspaceValue,writeWorkspace} from '../../storage/workspace';
import {CourseSpeech} from './CourseSpeech';
import {ModuleAssessment} from './ModuleAssessment';
import {moduleAssessments} from './assessments';
import {HighlightedText} from './HighlightedText';
import type {SpeechHighlight} from './speech';
import {speechFollowScroll} from './follow';
import {COURSE_STATE_KEY,normaliseCourseState} from './state';
import type {CoursePack,CourseState} from './types';
import './course.css';

const course=data as CoursePack;
const lessons=course.paths.flatMap(path=>path.modules.flatMap(module=>module.lessons.map(lesson=>({path,module,lesson}))));
const ids=lessons.map(row=>row.lesson.id);

export function CourseReader({repository,snapshot,onSaveQueued}:{repository:StudyRepository;snapshot:DatabaseSnapshot;onSaveQueued:(write:Promise<void>,channel?:string)=>Promise<void>}){
 const [state,setState]=useState(()=>normaliseCourseState(workspaceValue(snapshot,COURSE_STATE_KEY,{}),ids));
 const current=useRef(state);current.current=state;
 const pending=useRef(Promise.resolve());
 const sequence=useRef(0);
 const scrollRequested=useRef(false);
 const [error,setError]=useState(''),[speechKey,setSpeechKey]=useState(0);
 const [highlight,setHighlight]=useState<SpeechHighlight|null>(null),[follow,setFollow]=useState(true);
 const assessmentScrollRequested=useRef(false);
 const assessmentSaveCount=useRef(0),assessmentSaveFailed=useRef(false),assessmentSaveSequence=useRef(0);
 const [assessmentNavigationError,setAssessmentNavigationError]=useState('');
 const selected=lessons.find(row=>row.lesson.id===state.selectedLessonId)??lessons[0];
 const {path,module,lesson}=selected;
 const assessment=moduleAssessments.find(pack=>pack.moduleId===module.id)!;
 const assessmentVisible=lesson.kind==='knowledge-check'||state.assessmentOpen;
 const index=ids.indexOf(lesson.id);
 const sections=useMemo(()=>{
  const selectedLessons=state.scope==='course'?lessons.map(row=>row.lesson):module.lessons;
  return selectedLessons.filter(item=>item.kind!=='knowledge-check').map(item=>({id:item.id,title:item.title,text:[item.title,...item.points].join('\n\n')}));
 },[state.scope,module]);
 useEffect(()=>{
  if(!scrollRequested.current)return;
  scrollRequested.current=false;
  const heading=document.getElementById('course-lesson-title');
  heading?.focus({preventScroll:true});heading?.scrollIntoView?.({block:'start'});
 },[state.selectedLessonId]);
 useEffect(()=>{
  if(!assessmentScrollRequested.current||!assessmentVisible)return;
  assessmentScrollRequested.current=false;
  const heading=document.getElementById('module-assessment-title');
  heading?.focus({preventScroll:true});heading?.scrollIntoView?.({block:'start'});
 },[assessmentVisible,module.id]);
 useEffect(()=>{
  if(!follow||!highlight||highlight.sectionId!==lesson.id)return;
  const passage=document.querySelector('.course-lesson .course-spoken-word')??document.querySelector('.course-lesson .course-reading-passage');
  if(!passage)return;
  const bounds=passage.getBoundingClientRect();
  const controls=document.querySelector('.course-playback-active')?.getBoundingClientRect();
  const delta=speechFollowScroll(bounds.top,bounds.bottom,Math.min(window.innerHeight-100,controls?.top??window.innerHeight));
  if(delta)window.scrollBy({top:delta,behavior:'auto'});
 },[highlight?.sectionId,highlight?.start,highlight?.wordStart,lesson.id,follow]);
 const pointOffsets=lesson.points.map((_,i)=>lesson.title.length+2+lesson.points.slice(0,i).reduce((sum,point)=>sum+point.length+2,0));

 function save(patch:Partial<CourseState>){
  const next={...current.current,...patch};current.current=next;setState(next);
  const token=++sequence.current;
  const write=pending.current.catch(()=>{}).then(()=>writeWorkspace(repository,COURSE_STATE_KEY,{...next}));
  pending.current=write;
  void onSaveQueued(write).then(()=>{if(token===sequence.current)setError('')},()=>{if(token===sequence.current)setError('Could not save your reading position. Retry saving before leaving this page.')});
 }
 function choose(id:string){
  if(!ids.includes(id))return;
  if(assessmentNavigationBlocked())return;
  scrollRequested.current=true;
  setSpeechKey(key=>key+1);save({selectedLessonId:id,listening:{sectionId:id,chunk:0},assessmentOpen:false});
 }
 function assessmentNavigationBlocked(){
  if(!assessmentSaveCount.current&&!assessmentSaveFailed.current)return false;
  setAssessmentNavigationError(assessmentSaveFailed.current?'Your assessment has unsaved progress. Retry in the assessment before changing lessons or modules.':'Your assessment is saving. Please wait a moment before changing lessons or modules.');
  return true;
 }
 function trackAssessment(write:Promise<void>){
  const token=++assessmentSaveSequence.current;assessmentSaveCount.current++;
  return onSaveQueued(write,`module-check:${module.id}`).then(()=>{
   if(token===assessmentSaveSequence.current){assessmentSaveFailed.current=false;setAssessmentNavigationError('');}
  },reason=>{
   if(token===assessmentSaveSequence.current){assessmentSaveFailed.current=true;setAssessmentNavigationError('Your assessment has unsaved progress. Retry in the assessment before changing lessons or modules.');setSpeechKey(key=>key+1);}
   throw reason;
  }).finally(()=>{assessmentSaveCount.current--});
 }
 function openAssessment(){
  if(assessmentVisible){
   const heading=document.getElementById('module-assessment-title');
   heading?.focus({preventScroll:true});heading?.scrollIntoView?.({block:'start'});return;
  }
  const check=module.lessons.find(item=>item.kind==='knowledge-check');
  assessmentScrollRequested.current=true;
  if(check)choose(check.id);
  else {setSpeechKey(key=>key+1);save({assessmentOpen:true});}
 }
 function markRead(){
  const completedIds=current.current.completedIds.includes(lesson.id)?current.current.completedIds.filter(id=>id!==lesson.id):[...current.current.completedIds,lesson.id];
  save({completedIds});
 }

 return <section className="course-reader" aria-labelledby="course-title">
  <h1 id="course-title">Read &amp; listen</h1>
  <p>AZ-104 course essentials, without repeated introductions and extra clutter.</p>
  <div className="card course-controls">
   <label>Learning path<select value={path.id} onChange={event=>choose(course.paths.find(item=>item.id===event.target.value)!.modules[0].lessons[0].id)}>{course.paths.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
   <label>Module<select value={module.id} onChange={event=>choose(path.modules.find(item=>item.id===event.target.value)!.lessons[0].id)}>{path.modules.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
   <label>Lesson<select value={lesson.id} onChange={event=>choose(event.target.value)}>{module.lessons.map(item=><option key={item.id} value={item.id}>{current.current.completedIds.includes(item.id)?'✓ ':''}{item.title}</option>)}</select></label>
   <p className="fine-print">{state.completedIds.length} / {lessons.length} units marked read · progress saved on this device</p>
   <progress aria-label="Course reading progress" value={state.completedIds.length} max={lessons.length}/>
   <button className="secondary" onClick={openAssessment}>Module assessment · 6 questions</button>
  </div>
  {error&&<p className="notice error" role="alert">{error}<button onClick={()=>save({})}>Retry saving</button></p>}
  {assessmentNavigationError&&<p className="notice error" role="alert">{assessmentNavigationError}</p>}
  <article className="card course-lesson" aria-labelledby="course-lesson-title">
   <p className="fine-print">{module.title} · lesson {module.lessons.indexOf(lesson)+1} of {module.lessons.length}</p>
   <h2 id="course-lesson-title" tabIndex={-1}>{lesson.kind==='knowledge-check'?'Microsoft Learn check':<HighlightedText text={lesson.title} offset={0} sectionId={lesson.id} highlight={highlight}/>}</h2>
   {lesson.kind==='knowledge-check'?<p>Check what you have just learned with six questions about this module.</p>:<ul className="course-points">{lesson.points.map((point,i)=><li key={i}><HighlightedText text={point} offset={pointOffsets[i]} sectionId={lesson.id} highlight={highlight}/></li>)}</ul>}
   {lesson.kind==='exercise'&&<p className="fine-print">Read the steps here; follow the full exercise on Microsoft Learn when you want hands-on practice.</p>}
   <a href={lesson.url} target="_blank" rel="noopener noreferrer">{lesson.kind==='knowledge-check'?'Open Microsoft Learn check':'Read original Microsoft Learn lesson'}</a>
   {!!lesson.additionalSources?.length&&<details><summary>Supporting Microsoft documentation</summary><ul>{lesson.additionalSources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></details>}
   <div className="course-actions"><button className="secondary" onClick={markRead} aria-pressed={state.completedIds.includes(lesson.id)}>{state.completedIds.includes(lesson.id)?'Marked read ✓':'Mark as read'}</button><button className="secondary" disabled={index===0} onClick={()=>choose(ids[index-1])}>Previous lesson</button><button disabled={index===lessons.length-1} onClick={()=>choose(ids[index+1])}>Next lesson</button></div>
  </article>
  {assessmentVisible&&<div className="card course-module-check"><ModuleAssessment key={module.id} pack={assessment} moduleTitle={module.title} repository={repository} snapshot={snapshot} onSaveQueued={trackAssessment}/></div>}
  <section className="card course-audio" aria-labelledby="course-listen-title">
   <h2 id="course-listen-title">Read to me</h2>
   <label>Listen to<select value={state.scope} onChange={event=>{setSpeechKey(key=>key+1);save({scope:event.target.value==='course'?'course':'module',listening:{sectionId:lesson.id,chunk:0}})}}><option value="module">This module</option><option value="course">Whole course</option></select></label>
   <label className="course-follow"><input type="checkbox" checked={follow} onChange={event=>setFollow(event.target.checked)}/>Follow spoken text</label>
   <CourseSpeech key={speechKey} sections={sections} initialPosition={state.listening} rate={state.rate} voiceURI={state.voiceURI}
    onHighlight={setHighlight}
    onPreferences={(rate,voiceURI)=>save({rate,voiceURI})}
    onPosition={(sectionId,chunk)=>save({listening:{sectionId,chunk}})}
    onSection={sectionId=>{if(current.current.selectedLessonId!==sectionId){if(assessmentNavigationBlocked()){setSpeechKey(key=>key+1);return;}save({selectedLessonId:sectionId,assessmentOpen:false})}}}/>
  </section>
  <details className="card course-sources"><summary>Course sources and coverage</summary>
   <p>Concise AI-assisted study notes based on the Microsoft Learn AZ-104T00 syllabus: {course.paths.length} learning paths, {lessons.reduce((set,row)=>set.add(row.module.id),new Set<string>()).size} modules and {lessons.length} units. Each module includes six original revision questions here; official interactive checks remain linked on Microsoft Learn. These notes are condensed; the original lessons contain the full detail.</p>
   <p>Sources retrieved {new Date(course.checkedAt).toLocaleDateString('en-GB',{timeZone:'Europe/London'})}. All supplied course points source-checked {new Date(course.accuracyCheckedAt??course.checkedAt).toLocaleDateString('en-GB',{timeZone:'Europe/London'})} through an AI-assisted comparison with the original units and current product documentation. Human factual approval remains separate.</p>
   <a href={course.url} target="_blank" rel="noopener noreferrer">Official Microsoft Learn course</a>
   <ol>{course.paths.map(item=><li key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a><ul>{item.modules.map(row=><li key={row.id}><button className="text-button" onClick={()=>choose(row.lessons[0].id)}>{row.title}</button></li>)}</ul></li>)}</ol>
  </details>
 </section>;
}
