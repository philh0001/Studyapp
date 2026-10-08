import type {CourseState} from './types';
export const COURSE_STATE_KEY='course:reader';
export function normaliseCourseState(value:unknown,lessonIds:readonly string[]):CourseState{
 const row=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
 const selectedLessonId=typeof row.selectedLessonId==='string'&&lessonIds.includes(row.selectedLessonId)?row.selectedLessonId:lessonIds[0]??'';
 const saved=row.listening&&typeof row.listening==='object'?row.listening as Record<string,unknown>:{};
 const sectionId=typeof saved.sectionId==='string'&&lessonIds.includes(saved.sectionId)?saved.sectionId:selectedLessonId;
 return {selectedLessonId,completedIds:Array.isArray(row.completedIds)?[...new Set(row.completedIds.filter((id):id is string=>typeof id==='string'&&lessonIds.includes(id)))]:[],
  listening:{sectionId,chunk:typeof saved.chunk==='number'&&Number.isFinite(saved.chunk)?Math.max(0,Math.min(10000,Math.floor(saved.chunk))):0},
  rate:typeof row.rate==='number'&&[.75,1,1.25,1.5].includes(row.rate)?row.rate:1,
  voiceURI:typeof row.voiceURI==='string'?row.voiceURI.slice(0,512):'',scope:row.scope==='course'?'course':'module',assessmentOpen:row.assessmentOpen===true};
}
