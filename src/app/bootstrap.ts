import type {ContentPack,SourceCheck} from '../content/types';
import {StudyDatabase} from '../storage/database';import {StudyRepository} from '../storage/repository';import {SessionService} from '../sessions/service';
export interface AppServices{repository:StudyRepository;sessions:SessionService}
const bankModules=import.meta.glob('../../content/packs/*.json',{eager:true,import:'default'});
const sourceModules=import.meta.glob('../../content/sources/*.json',{eager:true,import:'default'});
export function bundledContent():{packs:ContentPack[];checks:SourceCheck[]}{return {packs:Object.values(bankModules) as ContentPack[],checks:Object.values(sourceModules).flat() as SourceCheck[]}}
export async function createAppServices():Promise<AppServices>{const repository=new StudyRepository(new StudyDatabase());await repository.db.open();const {packs,checks}=bundledContent();for(const pack of packs){const installed=await repository.db.packs.get(pack.id);if(!installed||installed.version<pack.version){const references=new Set(pack.questions.flatMap(q=>q.references.map(r=>r.id)));await repository.installPack(pack,checks.filter(c=>references.has(c.referenceId)))}}return {repository,sessions:new SessionService(repository)}}
