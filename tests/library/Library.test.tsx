import {it,expect} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {Library} from '../../src/features/library/Library';
import {pack,question} from '../fixtures';
import {readWorkspace} from '../../src/storage/workspace';
import {normalisePresets,normaliseOrganisation} from '../../src/study/catalogue';

it('searches personal notes and safely saves folders, tags and notes in local portable storage',async()=>{
 const db=new StudyDatabase('library-ui-'+crypto.randomUUID()),repository=new StudyRepository(db);
 await repository.installPack(pack([question({id:'q1',scenario:'Identity test scenario'})]),[]);
 await repository.saveNote('q1',1,'My remembered phrase');
 render(<Library repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.change(screen.getByRole('searchbox',{name:'Search questions, explanations and notes'}),{target:{value:'remembered phrase'}});
 expect(screen.getByText('Identity test scenario')).toBeInTheDocument();
 fireEvent.click(screen.getByText('Personal folders, tags and note'));
 fireEvent.change(screen.getByLabelText('Folders for q1'),{target:{value:'Weekend'}});
 fireEvent.change(screen.getByLabelText('Tags for q1'),{target:{value:'Revise'}});
 fireEvent.change(screen.getByLabelText('Personal note for q1'),{target:{value:'Updated remembered phrase'}});
 fireEvent.click(screen.getByRole('button',{name:'Save personal organisation'}));
 await waitFor(()=>expect(screen.getByText('Personal organisation saved.')).toBeInTheDocument());
 const org=normaliseOrganisation(await readWorkspace(repository,'library:organisation',{}));
 expect(org.questions.q1).toEqual({folders:['Weekend'],tags:['Revise']});expect((await db.notes.get('q1'))?.text).toBe('Updated remembered phrase');expect(await db.contentTrust.count()).toBe(0);
 fireEvent.change(screen.getByLabelText('New folder or tag name'),{target:{value:'Monday'}});
 fireEvent.click(screen.getByRole('button',{name:'Rename folder or tag'}));
 await waitFor(async()=>expect(normaliseOrganisation(await readWorkspace(repository,'library:organisation',{})).questions.q1.folders).toEqual(['Monday']));
 fireEvent.click(screen.getByRole('button',{name:'Remove folder or tag'}));
 await waitFor(async()=>expect(normaliseOrganisation(await readWorkspace(repository,'library:organisation',{})).folders).toEqual([]));

 db.close();await db.delete();
});
it('saves a reusable unseen-only learning configuration with reserve consent and preflight counts',async()=>{
 const db=new StudyDatabase('library-ui-'+crypto.randomUUID()),repository=new StudyRepository(db);await repository.installPack(pack([question()]),[]);
 render(<Library repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.change(screen.getByLabelText('Configuration name'),{target:{value:'Fresh drafts'}});
 fireEvent.change(screen.getByLabelText('Practice mode'),{target:{value:'learn'}});
 fireEvent.click(screen.getByLabelText('Unseen questions only'));
 expect(screen.getByText(/Requested 10 questions; 1 available/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Save practice configuration'}));
 await waitFor(()=>expect(screen.getByRole('link',{name:'Use Fresh drafts'})).toHaveAttribute('href',expect.stringMatching(/^#\/practice\?preset=/)));
 const presets=normalisePresets(await readWorkspace(repository,'library:presets',{}));expect(presets.presets[0]).toMatchObject({name:'Fresh drafts',unseenOnly:true,mode:'learn',useReserved:false});
 fireEvent.click(screen.getByRole('button',{name:'Delete Fresh drafts'}));await waitFor(()=>expect(screen.queryByRole('link',{name:'Use Fresh drafts'})).not.toBeInTheDocument());
 expect(normalisePresets(await readWorkspace(repository,'library:presets',{})).presets).toEqual([]);db.close();await db.delete();
});
it('keeps fresh reserved content hidden until explicit reveal consent and durably records its release',async()=>{
 const db=new StudyDatabase('library-reserve-'+crypto.randomUUID()),repository=new StudyRepository(db),q=question({id:'reserve',assessmentReserved:true,scenario:'Secret reserved scenario',prompt:'Secret reserved prompt',summaryExplanation:'Secret reserved answer'});await repository.installPack(pack([q]),[]);
 render(<Library repository={repository} snapshot={await repository.getSnapshot()} initialQuery="reserve"/>);
 expect(screen.getByRole('searchbox')).toHaveValue('reserve');expect(screen.queryByText(q.scenario)).not.toBeInTheDocument();expect(screen.queryByText(q.prompt)).not.toBeInTheDocument();expect(screen.queryByText(q.summaryExplanation)).not.toBeInTheDocument();expect(screen.queryByText('Read explanations')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Reveal reserved question'})).toBeDisabled();
 fireEvent.click(screen.getByLabelText('I understand revealing reserve releases it into future practice'));
 fireEvent.click(screen.getByRole('button',{name:'Reveal reserved question'}));await waitFor(()=>expect(screen.getByText(q.scenario)).toBeInTheDocument());
 expect(await db.releasedHoldouts.get('reserve')).toMatchObject({questionId:'reserve',releasedAt:expect.any(String)});expect(await db.contentTrust.count()).toBe(0);
 db.close();await db.delete();
});
it.each([{deadlineAt:'2026-10-09T12:00:00Z'},{deadlineAt:null,feedbackAtEnd:true}])('withholds active assessment explanations and personal answer notes until submission (%j)',async assessment=>{
 const db=new StudyDatabase('library-assessment-'+crypto.randomUUID()),repository=new StudyRepository(db),q=question({id:'active',summaryExplanation:'Hidden solution'});await repository.installPack(pack([q]),[]);await repository.saveNote(q.id,q.revision,'Personal answer hint');const snapshot=await repository.getSnapshot();const session={id:'s1',mode:'learn' as const,questionSnapshots:[q],optionOrders:{},answers:{},flags:[],currentIndex:0,startedAt:new Date().toISOString(),status:'active' as const,submittedAt:null,correctionWarnings:[],...assessment};snapshot.sessions=[session];
 const view=render(<Library repository={repository} snapshot={snapshot}/>);expect(screen.queryByText('Read explanations')).not.toBeInTheDocument();expect(screen.queryByText(q.summaryExplanation)).not.toBeInTheDocument();expect(screen.queryByText('Personal answer hint')).not.toBeInTheDocument();expect(screen.queryByText('Personal folders, tags and note')).not.toBeInTheDocument();
 view.rerender(<Library repository={repository} snapshot={{...snapshot,sessions:[{...session,status:'submitted',submittedAt:new Date().toISOString()}]}}/>);expect(screen.getByText('Read explanations')).toBeInTheDocument();expect(screen.getByText(q.summaryExplanation)).toBeInTheDocument();expect(screen.getByText('Personal answer hint',{selector:'p'})).toBeInTheDocument();db.close();await db.delete();
});
