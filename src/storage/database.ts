import Dexie,{type Table} from 'dexie';import type {Settings,Session,Attempt,Note,Bookmark} from '../sessions/types';import type {ContentPack,SourceCheck,ContentTrust} from '../content/types';import type {ReviewItem} from '../study/review';
export class StudyDatabase extends Dexie{
 settings!:Table<Settings,string>;packs!:Table<ContentPack,string>;sourceChecks!:Table<SourceCheck,string>;contentTrust!:Table<ContentTrust,[string,number]>;sessions!:Table<Session,string>;attempts!:Table<Attempt,string>;reviews!:Table<ReviewItem,string>;bookmarks!:Table<Bookmark,string>;notes!:Table<Note,string>;releasedHoldouts!:Table<{questionId:string},string>;
 constructor(name='az104-studyapp'){super(name);this.version(1).stores({settings:'id',packs:'id',sourceChecks:'referenceId',contentTrust:'[questionId+revision],questionId',sessions:'id,status',attempts:'id,sessionId,questionId',reviews:'questionId,dueAt',bookmarks:'questionId',notes:'questionId',releasedHoldouts:'questionId'});}
}
