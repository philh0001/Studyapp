import type {Question,QuestionIdentity,ContentPack,ContentTrust,SourceCheck} from '../content/types';import type {Confidence,ReviewItem} from '../study/review';
export type SessionMode='learn'|'timed'|'draft-preview';
export interface SessionAnswer{selectedOptionIds:string[];confidence:Confidence;responseMs:number}
export interface Session{ id:string;mode:SessionMode;questionSnapshots:Question[];optionOrders:Record<string,string[]>;answers:Record<string,SessionAnswer>;flags:string[];currentIndex:number;startedAt:string;deadlineAt:string|null;status:'active'|'submitted';submittedAt:string|null;correctionWarnings:QuestionIdentity[];result?:SessionResult }
export interface Attempt{id:string;sessionId:string;questionId:string;questionRevision:number;questionSnapshot:Question;selectedOptionIds:string[];confidence:Confidence;correct:boolean;responseMs:number;submittedAt:string;mode:SessionMode}
export interface SessionResult{sessionId:string;submittedAt:string;correct:number;total:number;attemptIds:string[];domainResults:{domainId:string;correct:number;total:number}[]}
export interface StartSessionInput{mode:SessionMode;selectedQuestions:Question[];durationMinutes:number|null;releasesReservedIds:string[]}
export function isTimedSession(session:Pick<Session,'deadlineAt'>):boolean{return session.deadlineAt!==null}
export interface Settings{thumbControls?:boolean;id:string;examDate:string|null;theme:'light'|'dark'|'system';textScale:1|1.2|1.4;autoAdvance:boolean}
export interface Note{questionId:string;revision:number;text:string;createdAt:string}
export interface Bookmark{questionId:string;revision:number;createdAt:string}
export interface DatabaseSnapshot{settings:Settings[];packs:ContentPack[];sourceChecks:SourceCheck[];contentTrust:ContentTrust[];sessions:Session[];attempts:Attempt[];reviews:ReviewItem[];bookmarks:Bookmark[];notes:Note[];releasedHoldouts:{questionId:string}[]}
export class AppError extends Error{code:string;recoverable:boolean;constructor(code:string,message:string,recoverable=true){super(message);this.code=code;this.recoverable=recoverable}}
