import type {DatabaseSnapshot} from '../sessions/types';
import {StudyRepository} from '../storage/repository';
import type {StudyDatabase} from '../storage/database';
import {backupTables,MAX_BACKUP_BYTES,type BackupV1,type RestoreConfirmation} from './types';
import {validateBackup} from './validate';
export function exportBackup(snapshot:DatabaseSnapshot):Blob{const blob=new Blob([JSON.stringify({...snapshot,schemaVersion:1,exportedAt:new Date().toISOString()})],{type:'application/json'});if(blob.size>MAX_BACKUP_BYTES)throw Error('This history needs a compressed backup. Use the app’s Export backup button.');return blob}
function database(target:StudyRepository|StudyDatabase):StudyDatabase{return target instanceof StudyRepository?target.db:target}
export async function restoreBackup(target:StudyRepository|StudyDatabase,input:BackupV1,confirmation:RestoreConfirmation):Promise<void>{
 if(!confirmation.replaceConfirmed)return;
 if(!confirmation.recoveryBackup||confirmation.recoveryBackup.size===0)throw Error('Prepare a recovery backup before replacement.');
 const encoded=JSON.stringify(input),validated=validateBackup(input,new Blob([encoded]).size,confirmation.compressedImport??false);
 if(!validated.valid||!validated.backup)throw Error(validated.issues.map(i=>`${i.path}: ${i.message}`).join('\n'));
 // Installed approval is local provenance, not authority supplied by an imported file.
 // Historical snapshots remain untouched to preserve what the learner actually answered.
 const backup=structuredClone(validated.backup);backup.contentTrust=[];
 for(const pack of backup.packs)for(const q of pack.questions){if(q.status!=='retired')q.status='draft';q.review=null;for(const reference of q.references)reference.microsoftOwnershipVerified=false}
 const db=database(target);
 await db.transaction('rw',db.tables,async()=>{for(const name of backupTables){const table=db.table(name);await table.clear();if(backup[name].length)await table.bulkAdd(backup[name])}});
}
export async function deletePersonalData(target:StudyRepository|StudyDatabase,confirmed:boolean):Promise<void>{if(!confirmed)return;const db=database(target);await db.transaction('rw',db.tables,async()=>{for(const table of db.tables)await table.clear()})}
