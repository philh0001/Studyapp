import type {StudyDatabase} from './database';import type {ContentPack,SourceCheck,ContentTrust,QuestionIdentity,Question} from '../content/types';import type {DatabaseSnapshot,Settings} from '../sessions/types';
export const defaultSettings:Settings={id:'settings',examDate:null,theme:'system',textScale:1,autoAdvance:false};
export class StudyRepository{
 db:StudyDatabase;constructor(db:StudyDatabase){this.db=db}
 async getSnapshot():Promise<DatabaseSnapshot>{return this.db.transaction('r',this.db.tables,async()=>{const snap:Record<string,unknown>={};for(const table of this.db.tables)snap[table.name]=await table.toArray();return snap as unknown as DatabaseSnapshot})}
 async getSettings():Promise<Settings>{return await this.db.settings.get('settings')??{...defaultSettings}}
 async saveSettings(s:Settings):Promise<void>{await this.db.settings.put({...s,id:'settings'})}
 async setContentTrust(i:QuestionIdentity,t:ContentTrust):Promise<void>{if(i.questionId!==t.questionId||i.revision!==t.revision)throw Error('Review identity mismatch');await this.db.contentTrust.put(t)}
 async getQuestions():Promise<Question[]>{return (await this.db.packs.toArray()).flatMap(p=>p.questions)}
 async installPack(pack:ContentPack,checks:SourceCheck[]):Promise<void>{await this.db.transaction('rw',this.db.packs,this.db.sourceChecks,this.db.contentTrust,this.db.reviews,this.db.sessions,async()=>{
  const previous=await this.db.packs.get(pack.id);
  for(const old of previous?.questions??[]){const next=pack.questions.find(q=>q.id===old.id);if(!next||next.revision!==old.revision){const oldTrust=await this.db.contentTrust.get([old.id,old.revision]);if(oldTrust)await this.db.contentTrust.put({...oldTrust,invalidatedAt:new Date().toISOString()});await this.db.reviews.delete(old.id);await this.db.sessions.filter(s=>s.questionSnapshots.some(q=>q.id===old.id&&q.revision===old.revision)).modify(s=>{if(!s.correctionWarnings.some(i=>i.questionId===old.id&&i.revision===old.revision))s.correctionWarnings.push({questionId:old.id,revision:old.revision})});}else if(JSON.stringify(next)!==JSON.stringify(old)&&JSON.stringify({...next,status:old.status,review:old.review})!==JSON.stringify(old))throw Error('Changed content requires a new question revision');}
  await this.db.packs.put(pack);if(checks.length)await this.db.sourceChecks.bulkPut(checks);
 })}
 async saveNote(questionId:string,revision:number,text:string):Promise<void>{if(text.length>10000)throw Error('Note limit is 10000 characters');const existing=await this.db.notes.get(questionId);await this.db.notes.put({questionId,revision,text,createdAt:existing?.createdAt??new Date().toISOString()})}
 async setBookmark(questionId:string,revision:number,enabled:boolean):Promise<void>{if(enabled)await this.db.bookmarks.put({questionId,revision,createdAt:new Date().toISOString()});else await this.db.bookmarks.delete(questionId)}
 async getContentReviewQueue():Promise<Question[]>{return (await this.getQuestions()).filter(q=>q.status==='draft')}

}
