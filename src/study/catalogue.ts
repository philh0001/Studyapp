import type {Question} from '../content/types';
import {isAssessmentSession,type DatabaseSnapshot,type SessionMode} from '../sessions/types';
import {classifyQuestion,isStudyAvailable} from '../content/trust';
import {allocations,selectQuestions,type SelectionInput,type SelectionResult} from './selection';
import {calculateProgress} from './progress';
import {selectBalancedAssessment} from './assessment';
import legacySubskills from '../../content/coverage/legacy-subskills.json';
import blueprint from '../../content/blueprints/az104-2026-04-17.json';

export const ORGANISATION_KEY='library:organisation';
export const PRESETS_KEY='library:presets';
export interface QuestionOrganisation {folders:string[];tags:string[]}
export interface LibraryOrganisation {folders:string[];tags:string[];questions:Record<string,QuestionOrganisation>}
export interface PracticePreset {
 id:string;name:string;mode:SessionMode;count:number;domain:string;objective:string;subskill:string;
 difficulty:''|Question['difficulty'];useReserved:boolean;unseenOnly:boolean;weakPercent:number;duePercent:number;unseenRatio?:number;
}
export interface SavedPresets {presets:PracticePreset[]}
export interface CatalogueFilters {query?:string;domain?:string;objective?:string;subskill?:string;type?:Question['type'];difficulty?:Question['difficulty'];bookmarked?:boolean;unanswered?:boolean;incorrect?:boolean;folder?:string;tag?:string;notesOnly?:boolean}
export function emptyOrganisation():LibraryOrganisation{return {folders:[],tags:[],questions:{}}}
const forbidden=new Set(['__proto__','prototype','constructor']);
function record(value:unknown):Record<string,unknown>{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
function labels(value:unknown):string[]{return Array.isArray(value)?[...new Set(value.filter((v):v is string=>typeof v==='string').map(v=>v.trim().slice(0,80)).filter(v=>v&&!forbidden.has(v)))].slice(0,100):[];}
export function normaliseOrganisation(value:unknown):LibraryOrganisation{
 const source=record(value),questions:Record<string,QuestionOrganisation>={};
 for(const [id,item] of Object.entries(record(source.questions)).slice(0,5000)){
  if(!id||id.length>160||forbidden.has(id))continue;
  const row=record(item);questions[id]={folders:labels(row.folders).slice(0,20),tags:labels(row.tags).slice(0,30)};
 }
 return {folders:labels(source.folders),tags:labels(source.tags),questions};
}
export function setQuestionOrganisation(value:LibraryOrganisation,questionId:string,folders:string[],tags:string[]):LibraryOrganisation{
 if(!questionId||questionId.length>160||forbidden.has(questionId))throw Error('Invalid question identity');
 const next=normaliseOrganisation(value),row={folders:labels(folders).slice(0,20),tags:labels(tags).slice(0,30)};
 if(!Object.hasOwn(next.questions,questionId)&&Object.keys(next.questions).length>=5000)throw Error('Personal organisation is limited to 5000 questions.');
 next.folders=labels([...next.folders,...row.folders]);next.tags=labels([...next.tags,...row.tags]);
 if(row.folders.some(v=>!next.folders.includes(v))||row.tags.some(v=>!next.tags.includes(v)))throw Error('Use at most 100 folders and 100 tags.');
 if(row.folders.length||row.tags.length)next.questions[questionId]=row;else delete next.questions[questionId];return next;
}
export function renameOrganisationLabel(value:LibraryOrganisation,kind:'folders'|'tags',oldLabel:string,newLabel:string):LibraryOrganisation{
 const next=normaliseOrganisation(value),label=labels([newLabel])[0];if(!label)throw Error('Enter a folder or tag name.');
 if(!next[kind].includes(oldLabel))throw Error('The folder or tag no longer exists.');
 next[kind]=labels(next[kind].map(v=>v===oldLabel?label:v));
 for(const row of Object.values(next.questions))row[kind]=labels(row[kind].map(v=>v===oldLabel?label:v));return next;
}
export function removeOrganisationLabel(value:LibraryOrganisation,kind:'folders'|'tags',label:string):LibraryOrganisation{
 const next=normaliseOrganisation(value);next[kind]=next[kind].filter(v=>v!==label);
 for(const [id,row] of Object.entries(next.questions)){row[kind]=row[kind].filter(v=>v!==label);if(!row.folders.length&&!row.tags.length)delete next.questions[id];}return next;
}
export function defaultPracticePreset():PracticePreset{return {id:'',name:'',mode:'learn',count:10,domain:'',objective:'',subskill:'',difficulty:'',useReserved:false,unseenOnly:false,weakPercent:40,duePercent:25,unseenRatio:4/7};}
export function normalisePresets(value:unknown):SavedPresets{
 const source=record(value),presets:PracticePreset[]=[],seen=new Set<string>();
 if(!Array.isArray(source.presets))return {presets};
 for(const raw of source.presets.slice(0,50)){
  const p=record(raw),strings=['id','name','domain','objective','subskill','difficulty'];
  if(strings.some(k=>typeof p[k]!=='string')||!(p.id as string).trim()||!(p.name as string).trim()||forbidden.has(p.id as string)||seen.has(p.id as string))continue;
  if(!['learn','timed','draft-preview'].includes(String(p.mode))||!['','foundation','intermediate','advanced'].includes(String(p.difficulty)))continue;
  if(typeof p.useReserved!=='boolean'||typeof p.unseenOnly!=='boolean'||!Number.isInteger(p.count)||Number(p.count)<1||Number(p.count)>100)continue;
  if([p.weakPercent,p.duePercent].some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100)||Number(p.weakPercent)+Number(p.duePercent)>100)continue;
  if(p.unseenRatio!==undefined&&(typeof p.unseenRatio!=='number'||!Number.isFinite(p.unseenRatio)||p.unseenRatio<0||p.unseenRatio>1))continue;
  const preset:PracticePreset={id:(p.id as string).slice(0,160),name:(p.name as string).trim().slice(0,80),mode:p.mode==='draft-preview'?'learn':p.mode as SessionMode,count:p.count as number,domain:(p.domain as string).slice(0,160),objective:(p.objective as string).slice(0,160),subskill:(p.subskill as string).slice(0,160),difficulty:p.difficulty as PracticePreset['difficulty'],useReserved:p.useReserved,unseenOnly:p.unseenOnly,weakPercent:p.weakPercent as number,duePercent:p.duePercent as number,unseenRatio:typeof p.unseenRatio==='number'?p.unseenRatio:4/7};
  if(seen.has(preset.id))continue;seen.add(preset.id);presets.push(preset);
 }
 return {presets};
}
function currentQuestions(questions:Question[]):Question[]{const current=new Map<string,Question>();for(const q of questions){const previous=current.get(q.id);if(!previous||q.revision>=previous.revision)current.set(q.id,q);}return [...current.values()];}
export function questionSubskills(q:Question):string[]{return q.subObjectiveIds??(legacySubskills as Record<string,string[]>)[`${q.id}@${q.revision}`]??[];}
export function catalogueQuestions(snapshot:DatabaseSnapshot):Question[]{return currentQuestions(snapshot.packs.flatMap(p=>p.questions));}
export function libraryQuestionProtection(snapshot:DatabaseSnapshot,q:Question):{reserved:boolean;assessmentSessionId:string|null}{
 return {reserved:q.assessmentReserved&&!snapshot.releasedHoldouts.some(row=>row.questionId===q.id),assessmentSessionId:snapshot.sessions.find(session=>session.status==='active'&&isAssessmentSession(session)&&session.questionSnapshots.some(item=>item.id===q.id))?.id??null};
}
export function searchCatalogue(snapshot:DatabaseSnapshot,filters:CatalogueFilters={},organisation=emptyOrganisation()):Question[]{
 const terms=(filters.query??'').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),org=normaliseOrganisation(organisation);
 return catalogueQuestions(snapshot).filter(q=>{
  if(filters.domain&&q.domainId!==filters.domain||filters.objective&&q.objectiveId!==filters.objective||filters.subskill&&!questionSubskills(q).includes(filters.subskill)||filters.type&&q.type!==filters.type||filters.difficulty&&q.difficulty!==filters.difficulty)return false;
  if(filters.bookmarked&&!snapshot.bookmarks.some(b=>b.questionId===q.id))return false;
  if(filters.notesOnly&&!snapshot.notes.some(n=>n.questionId===q.id&&n.text.trim()))return false;
  if(filters.folder&&!org.questions[q.id]?.folders.includes(filters.folder)||filters.tag&&!org.questions[q.id]?.tags.includes(filters.tag))return false;
  const current=snapshot.attempts.filter(a=>a.questionId===q.id&&a.questionRevision===q.revision);
  if(filters.unanswered&&current.length)return false;
  if(filters.incorrect){const scored=current.filter(a=>a.mode!=='draft-preview').sort((a,b)=>Date.parse(b.submittedAt)-Date.parse(a.submittedAt)),trust=snapshot.contentTrust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null;if(!scored.length||scored[0].correct||!isStudyAvailable(q,trust))return false;}
  const protection=libraryQuestionProtection(snapshot,q);
  if(protection.reserved||protection.assessmentSessionId)return terms.every(term=>[q.id,q.domainId,q.objectiveId,q.type,q.difficulty,...questionSubskills(q)].join(' ').toLocaleLowerCase().includes(term));
  const text=[q.id,q.scenario,q.prompt,q.summaryExplanation,...q.options.flatMap(o=>[o.text,o.explanation]),...q.tags,...(org.questions[q.id]?.tags??[]),...snapshot.notes.filter(n=>n.questionId===q.id).map(n=>n.text),...(q.exhibits??[]).flatMap(e=>[e.title,e.text??'',...(e.columns??[]),...(e.rows??[]).flat()]),q.caseStudy?.overview??''].join(' ').toLocaleLowerCase();
  return terms.every(term=>text.includes(term));
 });
}
export interface PracticeSelectionInput extends SelectionInput {subskillId?:string;difficulty?:Question['difficulty'];unseenOnly?:boolean;weakPercent?:number;duePercent?:number;unseenRatio?:number;timed?:boolean;excludeLinkedCases?:boolean}
function filteredInput(input:PracticeSelectionInput):PracticeSelectionInput{return {...input,questions:currentQuestions(input.questions).filter(q=>(!input.excludeLinkedCases||!q.caseStudy)&&(!input.subskillId||questionSubskills(q).includes(input.subskillId))&&(!input.difficulty||q.difficulty===input.difficulty)&&(!input.unseenOnly||!input.attemptedIds.includes(q.id)))};}
export function selectPracticeQuestions(input:PracticeSelectionInput):SelectionResult{
 const i=filteredInput(input),base=i.mode==='timed'||i.timed?selectBalancedAssessment(i):selectQuestions(i);
 if((i.weakPercent===undefined&&i.duePercent===undefined)||i.mode==='timed'||i.timed)return base;
 const weak=Number.isFinite(i.weakPercent)?Math.max(0,Math.min(100,i.weakPercent!)):40,due=Number.isFinite(i.duePercent)?Math.max(0,Math.min(100-weak,i.duePercent!)):Math.min(25,100-weak),remaining=100-weak-due,unseenRatio=Number.isFinite(i.unseenRatio)?Math.min(1,Math.max(0,i.unseenRatio!)):4/7,mix=allocations(i.requestedCount,[weak,due,remaining*unseenRatio,remaining*(1-unseenRatio)].map(n=>n/100));
 let pool=selectQuestions({...i,requestedCount:i.questions.length}).questions;const alternatives=pool.filter(q=>!i.previousSessionIds.includes(q.id));if(alternatives.length>=Math.min(i.requestedCount,pool.length))pool=alternatives;const selected:Question[]=[],seen=new Set<string>();
 const take=(items:Question[],count:number)=>{for(const q of items){if(count<=0)break;if(!seen.has(q.id)){selected.push(q);seen.add(q.id);count--;}}};
 const dueItems=pool.filter(q=>i.reviewItems.some(r=>r.questionId===q.id&&r.revision===q.revision&&Date.parse(r.dueAt)<=i.now.getTime()));
 const weakItems=pool.filter(q=>i.objectiveStats.some(s=>s.objectiveId===q.objectiveId&&s.distinctAttempts>=5&&(s.accuracy<.7||s.confidentWrongCount>0))||i.reviewItems.some(r=>r.questionId===q.id&&r.revision===q.revision&&r.misconception));
 const buckets=[weakItems,dueItems,pool.filter(q=>!i.attemptedIds.includes(q.id)),pool.filter(q=>i.attemptedIds.includes(q.id))];
 buckets.forEach((items,n)=>take(items,mix[n]));take(pool,Math.min(i.requestedCount,pool.length)-selected.length);
 const questions=selected.slice(0,i.requestedCount);return {...base,questions,allocations:mix,releasesReservedIds:questions.filter(q=>q.assessmentReserved&&!i.releasedIds?.includes(q.id)).map(q=>q.id)};
}
export interface PracticePreflight extends SelectionResult {selectedCount:number;formatCounts:Record<Question['type'],number>;selectedFormatCounts:Record<Question['type'],number>;excluded:{retired:number;invalidated:number;unapproved:number;topic:number;difficulty:number;reserved:number;seen:number;linkedCases:number};explanation:string[]}
export function explainSelection(input:PracticeSelectionInput):PracticePreflight{
 const excluded={retired:0,invalidated:0,unapproved:0,topic:0,difficulty:0,reserved:0,seen:0,linkedCases:0},all=currentQuestions(input.questions),available:Question[]=[];
 for(const q of all){if(input.excludeLinkedCases&&q.caseStudy){excluded.linkedCases++;continue;}const state=classifyQuestion(q,input.trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null);
  if(state==='retired'){excluded.retired++;continue;}if(state==='invalidated'){excluded.invalidated++;continue;}
  if(input.domainId&&q.domainId!==input.domainId||input.objectiveId&&q.objectiveId!==input.objectiveId||input.subskillId&&!questionSubskills(q).includes(input.subskillId)){excluded.topic++;continue;}
  if(input.difficulty&&q.difficulty!==input.difficulty){excluded.difficulty++;continue;}if(q.assessmentReserved&&!input.useReserved&&!input.releasedIds?.includes(q.id)){excluded.reserved++;continue;}if(input.unseenOnly&&input.attemptedIds.includes(q.id)){excluded.seen++;continue;}available.push(q);
 }
 const result=selectPracticeQuestions(input),counts=(questions:Question[])=>({single:questions.filter(q=>q.type==='single').length,multiple:questions.filter(q=>q.type==='multiple').length,ordering:questions.filter(q=>q.type==='ordering').length,matching:questions.filter(q=>q.type==='matching').length}),shortages=result.shortages.filter(s=>!s.startsWith('Only ')&&!s.startsWith('Limited '));
 if(input.mode==='timed'||input.timed){const domains=blueprint.domains.filter(d=>!input.domainId||d.id===input.domainId),totalWeight=domains.reduce((n,d)=>n+(d.weight[0]+d.weight[1])/2,0),quotas=allocations(input.requestedCount,domains.map(d=>(d.weight[0]+d.weight[1])/2/totalWeight));domains.forEach((domain,n)=>{const availableCount=available.filter(q=>q.domainId===domain.id).length;if(availableCount<quotas[n])shortages.push(`${domain.id}: planned ${quotas[n]}, available ${availableCount}; short by ${quotas[n]-availableCount}.`);});}
 if(available.length<input.requestedCount)shortages.push(`Requested ${input.requestedCount} questions; ${available.length} available with these settings (short by ${input.requestedCount-available.length}).`);
 const explanation=[`Only current, non-retired, non-quarantined questions can be selected. Content review is optional.`,`${available.length} unique questions match all settings.`,input.unseenOnly?'Unseen means no saved attempt at this revision, including draft preview. Seen questions never fill shortages.':'Repeat questions may fill the requested session.'];
 if(input.mode==='timed'||input.timed)explanation.push('Assessment practice uses requested blueprint domain quotas and rotates objectives within each domain; weak/due percentages apply to learning sessions.');else explanation.push(`Requested mix: ${result.allocations[0]} weak, ${result.allocations[1]} due, ${result.allocations[2]} unseen, ${result.allocations[3]} reinforcement. Overlapping or short pools are filled from other matching questions.`);
 if(input.excludeLinkedCases)explanation.push('Linked case members are excluded from standard practice; choose a whole case separately.');
 explanation.push('A reserved question is available only after explicit opt-in or an earlier release.');
 return {...result,shortages,availableCount:available.length,selectedCount:result.questions.length,formatCounts:counts(available),selectedFormatCounts:counts(result.questions),excluded,explanation};
}
export function preflightPractice(snapshot:DatabaseSnapshot,preset:PracticePreset,now=new Date(),options:{timed?:boolean}={}):PracticePreflight{
 const questions=catalogueQuestions(snapshot),eligible=questions.filter(q=>isStudyAvailable(q,snapshot.contentTrust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)),progress=calculateProgress(snapshot.attempts,eligible,now),last=[...snapshot.sessions].sort((a,b)=>Date.parse(b.startedAt)-Date.parse(a.startedAt))[0];
 return explainSelection({questions,trust:snapshot.contentTrust,reviewItems:snapshot.reviews,objectiveStats:Object.entries(progress.objectives).map(([objectiveId,s])=>({objectiveId,distinctAttempts:s.distinctAttempts,accuracy:s.accuracy??0,confidentWrongCount:s.confidentWrongCount})),previousSessionIds:last?.questionSnapshots.map(q=>q.id)??[],attemptedIds:[...new Set(snapshot.attempts.filter(a=>questions.some(q=>q.id===a.questionId&&q.revision===a.questionRevision)).map(a=>a.questionId))],requestedCount:preset.count,mode:preset.mode,useReserved:preset.useReserved,domainId:preset.domain||undefined,objectiveId:preset.objective||undefined,subskillId:preset.subskill||undefined,difficulty:preset.difficulty||undefined,unseenOnly:preset.unseenOnly,weakPercent:preset.weakPercent,duePercent:preset.duePercent,unseenRatio:preset.unseenRatio,timed:options.timed,excludeLinkedCases:true,releasedIds:snapshot.releasedHoldouts.map(q=>q.questionId),now,random:()=>.5});
}
