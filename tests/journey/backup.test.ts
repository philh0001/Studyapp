import {expect,it} from 'vitest';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {writeWorkspace} from '../../src/storage/workspace';
import {exportBackup,restoreBackup} from '../../src/backup/restore';
import {JOURNEY_KEY,normaliseJourney} from '../../src/features/journey/model';
it('round trips goals, actual activity and completed task history through a portable backup',async()=>{const source=new StudyRepository(new StudyDatabase('journey-source-'+crypto.randomUUID())),target=new StudyRepository(new StudyDatabase('journey-target-'+crypto.randomUUID()));try{const state=normaliseJourney({goal:'Learn at my own pace',days:[2,4],activity:[{id:'a',day:'2026-10-08',text:'Reading',minutes:12}],tasks:[{id:'t',title:'Read',day:'2026-10-08',completedAt:'2026-10-08T12:00:00Z'}]});await writeWorkspace(source,JOURNEY_KEY,{...state});const backup=JSON.parse(await exportBackup(await source.getSnapshot()).text());await restoreBackup(target,backup,{replaceConfirmed:true,recoveryBackup:exportBackup(await target.getSnapshot())});expect(normaliseJourney((await target.db.workspace.get(JOURNEY_KEY))?.value)).toEqual(state)}finally{await source.db.delete();await target.db.delete()}});
