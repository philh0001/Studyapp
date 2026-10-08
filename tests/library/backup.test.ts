import {it,expect} from 'vitest';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {writeWorkspace,readWorkspace} from '../../src/storage/workspace';
import {restoreBackup,exportBackup} from '../../src/backup/restore';
import {normaliseOrganisation,setQuestionOrganisation,emptyOrganisation,defaultPracticePreset,normalisePresets} from '../../src/study/catalogue';
it('personal organisation and saved configurations survive backup restore without creating approval authority',async()=>{
 const source=new StudyDatabase('library-source-'+crypto.randomUUID()),target=new StudyDatabase('library-target-'+crypto.randomUUID()),repository=new StudyRepository(source),destination=new StudyRepository(target);
 const org=setQuestionOrganisation(emptyOrganisation(),'q1',['Weekend'],['Hard']);
 await writeWorkspace(repository,'library:organisation',{...org});
 await writeWorkspace(repository,'library:presets',{presets:[{...defaultPracticePreset(),id:'p1',name:'Fresh',unseenOnly:true}]});
 const snapshot=await repository.getSnapshot(),backup={...snapshot,schemaVersion:1 as const,exportedAt:new Date().toISOString()};
 await restoreBackup(destination,backup,{replaceConfirmed:true,recoveryBackup:exportBackup(await destination.getSnapshot())});
 expect(normaliseOrganisation(await readWorkspace(destination,'library:organisation',{}))).toEqual(org);
 expect(normalisePresets(await readWorkspace(destination,'library:presets',{})).presets[0]).toMatchObject({id:'p1',name:'Fresh',unseenOnly:true});expect(await target.contentTrust.count()).toBe(0);
 source.close();target.close();await source.delete();await target.delete();
});
