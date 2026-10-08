import {render,screen,waitFor} from '@testing-library/react';
import {expect,it,vi} from 'vitest';
import App from '../../src/app/App';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {SessionService} from '../../src/sessions/service';
import {question,pack} from '../fixtures';
import {writeWorkspace} from '../../src/storage/workspace';
import {workpadKey} from '../../src/features/workpad/model';
vi.mock('../../src/pwa/register',()=>({registerPwa:()=>({setSessionActive:vi.fn(),dispose:vi.fn(),applyPendingUpdate:vi.fn()})}));
it('withholds an old session and its reasoning while a newer revision is in an active assessment',async()=>{
 const repository=new StudyRepository(new StudyDatabase()),service=new SessionService(repository);let view:ReturnType<typeof render>|undefined;
 try{const q=question({scenario:'Historical secret scenario'});await repository.installPack(pack([q]),[]);const old=await service.createSession({mode:'draft-preview',selectedQuestions:[q],durationMinutes:null,releasesReservedIds:[]});await service.submitLearnAnswer(old.id,q.id,['a'],'unsure',1000);await service.advanceSession(old.id);await writeWorkspace(repository,workpadKey(old.id,q.id,q.revision),{approach:'Private earlier reasoning'});const active=await service.createSession({mode:'draft-preview',selectedQuestions:[question({revision:2})],durationMinutes:null,feedbackAtEnd:true,releasesReservedIds:[]});window.location.hash='/session/'+old.id;view=render(<App/>);expect(await screen.findByRole('heading',{name:'Saved session temporarily hidden'})).toBeVisible();expect(screen.queryByText('Historical secret scenario')).toBeNull();expect(screen.queryByRole('heading',{name:'Personal reasoning workpad'})).toBeNull();await repository.db.sessions.delete(active.id);await waitFor(()=>expect(screen.getByRole('heading',{name:'Session complete'})).toBeVisible());expect(await screen.findByLabelText('My approach')).toHaveValue('Private earlier reasoning')}
 finally{view?.unmount();window.location.hash='';await repository.db.delete()}
});
