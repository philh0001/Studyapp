// @vitest-environment node
import {expect,it} from 'vitest';
import {exportBackup} from '../../src/backup/restore';
import {prepareBackup,readBackupFile} from '../../src/backup/compression';
import {MAX_BACKUP_BYTES} from '../../src/backup/types';
import type {DatabaseSnapshot} from '../../src/sessions/types';
import compute from '../../content/packs/az104-compute-expanded-draft.json';
import type {ContentPack} from '../../src/content/types';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {SessionService} from '../../src/sessions/service';
import {validateBackup} from '../../src/backup/validate';
import {restoreBackup} from '../../src/backup/restore';
const empty:DatabaseSnapshot={settings:[],packs:[],sourceChecks:[],contentTrust:[],sessions:[],attempts:[],reviews:[],bookmarks:[],notes:[],releasedHoldouts:[]};
it('never offers an ordinary export larger than its import limit',()=>{expect(()=>exportBackup({...empty,notes:[{questionId:'q',revision:1,text:'x'.repeat(MAX_BACKUP_BYTES),createdAt:new Date().toISOString()}]})).toThrow(/compressed/i)});
it('compresses a larger history locally and reads it without losing any text',async()=>{const snapshot={...empty,notes:[{questionId:'q',revision:1,text:'x'.repeat(MAX_BACKUP_BYTES),createdAt:new Date().toISOString()}]};const prepared=await prepareBackup(snapshot);expect(prepared.compressed).toBe(true);expect(prepared.blob.size).toBeLessThan(MAX_BACKUP_BYTES);const read=await readBackupFile(prepared.blob,true);expect(read.byteLength).toBeGreaterThan(MAX_BACKUP_BYTES);expect(JSON.parse(read.text).notes[0].text).toBe(snapshot.notes[0].text)});
it('keeps small exports as compatible JSON and rejects corrupt gzip',async()=>{const prepared=await prepareBackup(empty);expect(prepared.compressed).toBe(false);expect(JSON.parse((await readBackupFile(prepared.blob,false)).text).schemaVersion).toBe(1);await expect(readBackupFile(new Blob(['invalid gzip']),true)).rejects.toThrow()});
it('restores a legitimate hundred-session history that exceeds the ordinary JSON cap',async()=>{
 const source=new StudyRepository(new StudyDatabase('large-source-'+crypto.randomUUID())),target=new StudyRepository(new StudyDatabase('large-target-'+crypto.randomUUID()));
 try{await source.installPack(compute as ContentPack,[]);const now=new Date('2026-10-08T12:00:00Z'),service=new SessionService(source,()=>now);
  for(let index=0;index<100;index++){const session=await service.createSession({mode:'draft-preview',selectedQuestions:(compute as ContentPack).questions.slice(0,20),durationMinutes:30,releasesReservedIds:[]});await service.finaliseTimedSession(session.id,now)}
  const snapshot=await source.getSnapshot();expect(()=>exportBackup(snapshot)).toThrow(/compressed/i);const exported=await prepareBackup(snapshot),decoded=await readBackupFile(exported.blob,exported.compressed),validation=validateBackup(JSON.parse(decoded.text),decoded.byteLength,true);expect(validation.issues).toEqual([]);
  await restoreBackup(target,validation.backup!,{replaceConfirmed:true,recoveryBackup:exportBackup(await target.getSnapshot()),compressedImport:true});const restored=await target.getSnapshot();expect(restored.sessions).toHaveLength(100);expect(restored.attempts).toHaveLength(2000);expect(restored.reviews).toEqual([]);
 }finally{await source.db.delete();await target.db.delete()}
},30000);
