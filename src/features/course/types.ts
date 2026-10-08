export type CourseLessonKind='teaching'|'exercise'|'knowledge-check'|'summary';
export interface CourseExplanation{title:string;paragraphs:string[];steps?:string[];code?:{language:string;text:string};sourceUrls:string[]}
export interface CourseLesson{id:string;title:string;url:string;kind:CourseLessonKind;points:string[];sections?:CourseExplanation[];additionalSources?:{title:string;url:string;checkedAt:string}[]}
export interface CourseModule{id:string;title:string;url:string;lessons:CourseLesson[]}
export interface CoursePath{id:string;title:string;url:string;modules:CourseModule[]}
export interface CoursePack{id:string;title:string;url:string;checkedAt:string;accuracyCheckedAt?:string;paths:CoursePath[]}
export interface CourseState{selectedLessonId:string;completedIds:string[];listening:{sectionId:string;chunk:number};rate:number;voiceURI:string;scope:'module'|'course';assessmentOpen:boolean}
