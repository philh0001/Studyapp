import packSchema from '../../content/schemas/question-pack.schema.json' with {type:'json'};
const str={type:'string',minLength:1,maxLength:10000},text={type:'string',maxLength:10000},date={type:'string',format:'date-time'},nullableDate={type:['string','null'],format:'date-time'},bool={type:'boolean'},integer={type:'integer',minimum:0},revision={type:'integer',minimum:1};
const ids={type:'array',items:str,uniqueItems:true};
const enumOf=(values:unknown[])=>({enum:values});
const object=(properties:Record<string,unknown>,optional:string[]=[])=>({type:'object',properties,required:Object.keys(properties).filter(k=>!optional.includes(k)),additionalProperties:false});
const rows=(items:unknown)=>({type:'array',items,maxItems:100000});
const q=packSchema.properties.questions.items;
const identity={questionId:str,revision};
const confidence=enumOf(['confident','unsure','guessed','unknown']),mode=enumOf(['learn','timed','draft-preview']);
const result=object({sessionId:str,submittedAt:date,correct:integer,total:integer,attemptIds:ids,domainResults:rows(object({domainId:str,correct:integer,total:integer}))});
export const backupSchema=object({schemaVersion:{const:1},exportedAt:date,
 settings:rows(object({id:{const:'settings'},examDate:{type:['string','null'],format:'date'},theme:enumOf(['light','dark','system']),textScale:enumOf([1,1.2,1.4]),autoAdvance:bool,thumbControls:bool},['thumbControls'])),
 packs:rows(packSchema),sourceChecks:rows(object({referenceId:str,canonicalUrl:{type:'string',format:'uri'},checkedAt:date,result:enumOf(['checked','unavailable','changed']),evidenceSummary:text,contentHash:text},['contentHash'])),
 contentTrust:rows(object({...identity,sourceCheckedAt:date,humanReviewedAt:nullableDate,reviewer:{type:['string','null'],maxLength:10000},invalidatedAt:nullableDate})),
 sessions:rows(object({id:str,mode,questionSnapshots:rows(q),optionOrders:{type:'object',additionalProperties:ids},answers:{type:'object',additionalProperties:object({selectedOptionIds:ids,confidence,responseMs:integer})},flags:ids,currentIndex:integer,startedAt:date,deadlineAt:nullableDate,status:enumOf(['active','submitted']),submittedAt:nullableDate,correctionWarnings:rows(object(identity)),result},['result'])),
 attempts:rows(object({id:str,sessionId:str,questionId:str,questionRevision:revision,questionSnapshot:q,selectedOptionIds:ids,confidence,correct:bool,responseMs:integer,submittedAt:date,mode})),
 reviews:rows(object({...identity,stage:enumOf([0,1,2,3,4]),dueAt:date,misconception:bool})),bookmarks:rows(object({...identity,createdAt:date})),notes:rows(object({...identity,text,createdAt:date})),releasedHoldouts:rows(object({questionId:str}))});
