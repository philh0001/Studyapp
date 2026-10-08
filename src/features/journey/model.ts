import blueprint from '../../../content/blueprints/az104-2026-04-17.json';
export const JOURNEY_KEY='journey:plan';
export const objectives=blueprint.domains.flatMap(d=>d.objectives);
export const categories=['reading','practice','flashcards','lab'] as const;
export type Category=typeof categories[number];
export interface Task{id:string;title:string;category:Category;objectiveId:string;day:string;minutes:number;priority:number;completedAt:string|null;moves:{from:string;to:string;at:string}[]}
export interface Activity{id:string;day:string;text:string;minutes:number}
export interface JourneyState{goal:string;dailyMinutes:number;days:number[];paused:boolean;tasks:Task[];activity:Activity[];pauseHistory:{paused:boolean;at:string}[]}
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const list=(v:unknown):unknown[]=>Array.isArray(v)?v.slice(0,500):[];
const str=(v:unknown,max=500)=>typeof v==='string'?v.slice(0,max):'';
const num=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,Math.round(v))):fallback;
export const validDay=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const stamp=(v:unknown)=>typeof v==='string'&&v.length<=32&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():null;
export function normaliseJourney(value:unknown):JourneyState{
 const v=object(value),ids=new Set<string>();
 const tasks:Task[]=list(v.tasks).flatMap(raw=>{const t=object(raw),id=str(t.id,80),title=str(t.title,200);if(!id||ids.has(id)||!title||!validDay(t.day))return [];ids.add(id);return [{id,title,day:t.day,category:categories.includes(t.category as Category)?t.category as Category:'reading',objectiveId:objectives.some(o=>o.id===t.objectiveId)?str(t.objectiveId,100):'',minutes:num(t.minutes,1,240,10),priority:num(t.priority,1,99,3),completedAt:stamp(t.completedAt),moves:list(t.moves).slice(0,50).flatMap(raw=>{const m=object(raw),at=stamp(m.at);return validDay(m.from)&&validDay(m.to)&&at?[{from:m.from,to:m.to,at}]:[]})}]});
 const activity:Activity[]=list(v.activity).flatMap(raw=>{const a=object(raw);return str(a.id,80)&&validDay(a.day)&&typeof a.minutes==='number'&&Number.isFinite(a.minutes)?[{id:str(a.id,80),day:a.day,text:str(a.text),minutes:num(a.minutes,1,240,5)}]:[]});
 return {goal:str(v.goal),dailyMinutes:num(v.dailyMinutes,5,240,15),days:v.days===undefined?[1,2,3,4,5]:[...new Set(list(v.days).filter((x):x is number=>typeof x==='number'&&Number.isInteger(x)&&x>=0&&x<=6))],paused:v.paused===true,tasks,activity,pauseHistory:list(v.pauseHistory).flatMap(raw=>{const h=object(raw),at=stamp(h.at);return typeof h.paused==='boolean'&&at?[{paused:h.paused,at}]:[]})};
}
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function todayQueue(state:JourneyState,day:string){if(state.paused||!validDay(day)||!state.days.includes(new Date(day+'T12:00:00').getDay()))return [];let remaining=state.dailyMinutes;return state.tasks.filter(t=>t.day===day&&!t.completedAt).sort((a,b)=>a.priority-b.priority).filter(t=>{if(t.minutes>remaining)return false;remaining-=t.minutes;return true})}
export function moveTask(state:JourneyState,id:string,day:string,at=new Date().toISOString()):JourneyState{if(!validDay(day))return state;return {...state,tasks:state.tasks.map(t=>t.id===id&&!t.completedAt?{...t,day,moves:[...t.moves,{from:t.day,to:day,at}].slice(-50)}:t)}}
export function weekSummary(state:JourneyState,day:string){const start=new Date(day+'T12:00:00');start.setDate(start.getDate()-(start.getDay()+6)%7);const from=localDay(start);start.setDate(start.getDate()+6);const to=localDay(start),activity=state.activity.filter(a=>a.day>=from&&a.day<=to);return {from,to,activity,minutes:activity.reduce((n,a)=>n+a.minutes,0),entries:activity.length,completed:state.tasks.filter(t=>t.completedAt&&localDay(new Date(t.completedAt))>=from&&localDay(new Date(t.completedAt))<=to).length}}
