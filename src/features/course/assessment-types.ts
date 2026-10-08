export interface ModuleQuestion{id:string;prompt:string;lessonIds:string[];correctOptionId:string;options:{id:string;text:string;explanation:string;sourceUrls:string[]}[]}
export interface ModuleAssessmentPack{moduleId:string;revision:number;checkedAt:string;questions:ModuleQuestion[]}
export interface ModuleAssessmentAnswer{selectedOptionId:string;submitted:boolean}
export interface ModuleAssessmentState{schemaVersion:1;moduleId:string;packRevision:number;questionIds:string[];contentIdentity:string;currentIndex:number;answers:Record<string,ModuleAssessmentAnswer>;previousAttempt:{answers:Record<string,string>}|null}
