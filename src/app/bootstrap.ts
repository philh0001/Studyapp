import {StudyDatabase} from '../storage/database';import {StudyRepository} from '../storage/repository';import {SessionService} from '../sessions/service';
export interface AppServices{repository:StudyRepository;sessions:SessionService}
export async function createAppServices():Promise<AppServices>{const repository=new StudyRepository(new StudyDatabase());await repository.db.open();return {repository,sessions:new SessionService(repository)}}
