import {expect,it} from 'vitest';
import Dexie from 'dexie';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository,defaultSettings} from '../../src/storage/repository';
import {writeWorkspace,readWorkspace} from '../../src/storage/workspace';
import {exportBackup,restoreBackup} from '../../src/backup/restore';
import {validateBackup} from '../../src/backup/validate';
it('upgrades a v1 browser without losing settings, and portable workspace remains personal data',async()=>{
 const name='workspace-upgrade-'+crypto.randomUUID(),old=new Dexie(name);old.version(1).stores({settings:'id',packs:'id',sourceChecks:'referenceId',contentTrust:'[questionId+revision],questionId',sessions:'id,status',attempts:'id,sessionId,questionId',reviews:'questionId,dueAt',bookmarks:'questionId',notes:'questionId',releasedHoldouts:'questionId'});await old.table('settings').put({...defaultSettings,theme:'dark'});old.close();
 const repo=new StudyRepository(new StudyDatabase(name)),target=new StudyRepository(new StudyDatabase(name+'-restored'));
 try{expect((await repo.getSettings()).theme).toBe('dark');await writeWorkspace(repo,'library:presets',{items:[{id:'gentle',count:5}]});expect(await readWorkspace(repo,'library:presets',{items:[]})).toEqual({items:[{id:'gentle',count:5}]});const exported=exportBackup(await repo.getSnapshot()),backup=JSON.parse(await exported.text());expect(validateBackup(backup,exported.size).issues).toEqual([]);await restoreBackup(target,backup,{replaceConfirmed:true,recoveryBackup:exportBackup(await target.getSnapshot())});expect(await readWorkspace(target,'library:presets',{})).toEqual({items:[{id:'gentle',count:5}]});expect((await target.getSnapshot()).contentTrust).toEqual([]);
  delete backup.workspace;await restoreBackup(target,backup,{replaceConfirmed:true,recoveryBackup:exportBackup(await target.getSnapshot())});expect(await readWorkspace(target,'library:presets',{})).toEqual({});
 }finally{await repo.db.delete();await target.db.delete()}
});
it('rejects malformed or dangerous workspace before writing/importing',async()=>{const repo=new StudyRepository(new StudyDatabase('workspace-validation-'+crypto.randomUUID()));try{await expect(writeWorkspace(repo,'library:bad',JSON.parse('{"nested":{"__proto__":{"x":1}}}'))).rejects.toThrow();await expect(writeWorkspace(repo,'library:bad',{value:Infinity})).rejects.toThrow();expect(await readWorkspace(repo,'library:bad',{})).toEqual({});const backup=JSON.parse(await exportBackup(await repo.getSnapshot()).text());backup.workspace=[{id:'library:bad',version:1,updatedAt:new Date().toISOString(),value:JSON.parse('{"constructor":{}}')}];expect(validateBackup(backup,1000).valid).toBe(false)}finally{await repo.db.delete()}});
it('upgrades v1 with real saved session, attempt, revision snapshot, bookmark and note intact',async()=>{
 const name='workspace-history-'+crypto.randomUUID(),seed=new StudyRepository(new StudyDatabase(name+'-seed'));
 const {SessionService}=await import('../../src/sessions/service');const {question,pack}=await import('../fixtures');
 const q=question();await seed.installPack(pack([q]),[]);await seed.saveSettings({...defaultSettings,theme:'dark'});
 const service=new SessionService(seed,()=>new Date('2026-10-08T01:00:00Z'),()=>.5);
 const session=await service.createSession({mode:'draft-preview',selectedQuestions:[q],durationMinutes:null,releasesReservedIds:[]});
 await service.submitLearnAnswer(session.id,q.id,['a'],'unsure',1500);await service.advanceSession(session.id);
 await seed.saveNote(q.id,q.revision,'Preserve this actual saved study history.');await seed.setBookmark(q.id,q.revision,true);
 const before=await seed.getSnapshot(),old=new Dexie(name);old.version(1).stores({settings:'id',packs:'id',sourceChecks:'referenceId',contentTrust:'[questionId+revision],questionId',sessions:'id,status',attempts:'id,sessionId,questionId',reviews:'questionId,dueAt',bookmarks:'questionId',notes:'questionId',releasedHoldouts:'questionId'});
 for(const table of old.tables){const rows=before[table.name as keyof typeof before];if(rows?.length)await table.bulkPut(rows)}old.close();
 const upgraded=new StudyRepository(new StudyDatabase(name));
 try{const after=await upgraded.getSnapshot();for(const key of ['settings','packs','sessions','attempts','bookmarks','notes'] as const)expect(after[key]).toEqual(before[key]);expect(after.attempts[0].questionSnapshot).toEqual(q);expect(after.sessions[0].status).toBe('submitted');expect(after.workspace).toEqual([]);const backup=exportBackup(after);expect(validateBackup(JSON.parse(await backup.text()),backup.size).valid).toBe(true)}finally{await upgraded.db.delete();await seed.db.delete()}
});
