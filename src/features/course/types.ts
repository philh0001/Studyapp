export type CourseLessonKind='teaching'|'exercise'|'knowledge-check'|'summary';
export interface CourseLesson{id:string;title:string;url:string;kind:CourseLessonKind;points:string[];additionalSources?:{title:string;url:string;checkedAt:string}[]}
export interface CourseModule{id:string;title:string;url:string;lessons:CourseLesson[]}
export interface CoursePath{id:string;title:string;url:string;modules:CourseModule[]}
export interface CoursePack{id:string;title:string;url:string;checkedAt:string;accuracyCheckedAt?:string;paths:CoursePath[]}
export interface CourseState{selectedLessonId:string;completedIds:string[];listening:{sectionId:string;chunk:number};rate:number;voiceURI:string;scope:'module'|'course'}
