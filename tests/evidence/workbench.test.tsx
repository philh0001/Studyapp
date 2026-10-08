import {it,expect} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {ContentReview} from '../../src/features/review/ContentReview';
import {question} from '../fixtures';
it('requires each individual checklist and fresh confirmation for an approved revision',async()=>{
 let approvals=0;
 render(<ContentReview questions={[question()]} trust={[]} onApprove={async()=>{approvals++}} onCorrection={async()=>{}}/>);
 const approve=screen.getByRole('button',{name:'Approve this revision'});
 const checks=screen.getAllByRole('checkbox');
 expect(checks.length).toBeGreaterThan(6);
 fireEvent.click(checks[0]);expect(approve).toBeDisabled();
 for(const checkbox of checks.slice(1))fireEvent.click(checkbox);
 expect(approve).toBeEnabled();fireEvent.click(approve);
 expect(approvals).toBe(1);
});

import {waitFor,cleanup} from '@testing-library/react';
import {EvidenceWorkbench} from '../../src/features/evidence/EvidenceWorkbench';
import {StudyRepository} from '../../src/storage/repository';
import {StudyDatabase} from '../../src/storage/database';
import {pack} from '../fixtures';
it('persists distinct findings and wording proposals without changing the immutable bank',async()=>{
 cleanup();const db=new StudyDatabase('evidence-ui-'+crypto.randomUUID()),repository=new StudyRepository(db);
 await db.packs.put(pack());render(<EvidenceWorkbench repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.change(screen.getByLabelText('Finding category'),{target:{value:'ambiguity'}});
 fireEvent.change(screen.getByLabelText('Finding detail'),{target:{value:'Missing resource scope'}});
 fireEvent.click(screen.getByRole('button',{name:'Create review issue'}));
 await waitFor(()=>expect(screen.getByText(/ambiguity · open · revision 1: Missing resource scope/)).toBeInTheDocument());
 fireEvent.change(screen.getByLabelText('Proposed wording'),{target:{value:'Specify the scope'}});
 fireEvent.change(screen.getByLabelText('Proposal reasoning'),{target:{value:'Official scope hierarchy matters'}});
 fireEvent.click(screen.getByRole('button',{name:'Save proposed revision'}));
 await waitFor(()=>expect(screen.getByText(/Proposed revision 2 from 1/)).toBeInTheDocument());
 const stored=(await db.workspace.get('review:workbench'))!.value;
 expect(stored.issues).toEqual(expect.arrayContaining([expect.objectContaining({kind:'ambiguity',status:'open'})]));
 expect((await repository.getQuestions())[0].prompt).toBe('Test prompt');expect(await db.contentTrust.count()).toBe(0);
 cleanup();await db.delete();
});
it('exportable saved checklists remain personal state and never bypass fresh approval checks',async()=>{
 cleanup();const db=new StudyDatabase('evidence-checklists-'+crypto.randomUUID()),repository=new StudyRepository(db);await db.packs.put(pack());
 await db.workspace.put({id:'review:workbench',version:1,updatedAt:new Date().toISOString(),value:{issues:[],proposals:[],checklists:{'q1:1':['sources','answer','option:a','option:b','option:c','summary','assumptions','ambiguity']}}});
 render(<EvidenceWorkbench repository={repository} snapshot={await repository.getSnapshot()}/>);
 expect(screen.getByRole('button',{name:'Approve this revision'})).toBeDisabled();
 expect((screen.getAllByRole('checkbox').at(-1) as HTMLInputElement).checked).toBe(false);
 fireEvent.click(screen.getAllByRole('checkbox')[0]);fireEvent.click(screen.getByRole('button',{name:'Save personal review checklist'}));
 await waitFor(()=>expect(screen.getByText('Personal checklist saved. This does not approve the revision.')).toBeInTheDocument());
 expect((await db.workspace.get('review:workbench'))?.value.checklists).toEqual({'q1:1':['answer','option:a','option:b','option:c','summary','assumptions','ambiguity']});expect(await db.contentTrust.count()).toBe(0);
 cleanup();await db.delete();
});
it('ignores malformed imported workspace findings without promoting them to approval authority',async()=>{
 cleanup();const db=new StudyDatabase('evidence-import-'+crypto.randomUUID()),repository=new StudyRepository(db);await db.packs.put(pack());
 await db.workspace.put({id:'review:workbench',version:1,updatedAt:new Date().toISOString(),value:{issues:{unexpected:true},proposals:[{baseRevision:'bad'}],checklists:'approved'}});
 const snapshot=await repository.getSnapshot();expect(()=>render(<EvidenceWorkbench repository={repository} snapshot={snapshot}/>)).not.toThrow();
 expect(screen.getByRole('button',{name:'Approve this revision'})).toBeDisabled();cleanup();await db.delete();
});
it('withholds an active assessment question from evidence and review across content revisions',async()=>{
 cleanup();const db=new StudyDatabase('evidence-assessment-'+crypto.randomUUID()),repository=new StudyRepository(db);await db.packs.put(pack([question({revision:2,prompt:'Protected answer-bearing prompt'})]));
 const snapshot=await repository.getSnapshot();snapshot.sessions=[{id:'s',mode:'draft-preview',questionSnapshots:[question({revision:1})],optionOrders:{},answers:{},flags:[],currentIndex:0,startedAt:new Date().toISOString(),deadlineAt:null,status:'active',submittedAt:null,correctionWarnings:[],feedbackAtEnd:true}];
 render(<EvidenceWorkbench repository={repository} snapshot={snapshot}/>);
 expect(screen.getByText(/withheld from review, evidence details and exports/)).toBeInTheDocument();expect(screen.queryByText('Protected answer-bearing prompt')).toBeNull();expect(screen.queryByRole('button',{name:'Approve this revision'})).toBeNull();
 cleanup();await db.delete();
});
