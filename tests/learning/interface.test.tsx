import {it,expect} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {LearningCenter} from '../../src/features/learning/LearningCenter';
import {question,pack} from '../fixtures';

it('shows draft sources and saves personal comprehension into backup-portable workspace without approval',async()=>{
 const db=new StudyDatabase(`learning-${crypto.randomUUID()}`),repository=new StudyRepository(db);await repository.installPack(pack(),[]);
 render(<LearningCenter repository={repository} snapshot={await repository.getSnapshot()}/>);
 expect(screen.getByText('AI-assisted draft teaching material')).toBeInTheDocument();expect(screen.getByRole('link',{name:'identity-rbac'})).toHaveAttribute('href','https://learn.microsoft.com/en-us/azure/role-based-access-control/overview');
 fireEvent.click(screen.getByRole('button',{name:'My reasoning and mistakes'}));
 fireEvent.change(screen.getByLabelText('My original reasoning'),{target:{value:'I missed the scope boundary.'}});fireEvent.change(screen.getByLabelText('How I know I understand it'),{target:{value:'I can explain the child scope.'}});fireEvent.click(screen.getByRole('button',{name:'Save reasoning record'}));
 await screen.findByText('Saved locally and included in your backup.');const snapshot=await repository.getSnapshot();const state=snapshot.workspace?.find(w=>w.id==='learning:state')?.value;
 expect((state?.records as {comprehension:string}[])[0].comprehension).toBe('I can explain the child scope.');expect(snapshot.contentTrust).toEqual([]);expect(snapshot.reviews).toEqual([]);
 cleanup();await db.delete();
});
it('reveals reviewed wrong-option explanations only on request and stores only the separate card schedule',async()=>{
 const db=new StudyDatabase(`flashcard-${crypto.randomUUID()}`),repository=new StudyRepository(db);const q=question({status:'reviewed',review:{reviewer:'Owner',reviewedAt:'2026-10-08T00:00:00Z',method:'Checked'}});await repository.installPack(pack([q]),[]);await repository.setContentTrust({questionId:q.id,revision:1},{questionId:q.id,revision:1,reviewer:'Owner',humanReviewedAt:'2026-10-08T00:00:00Z',sourceCheckedAt:'2026-10-08T00:00:00Z',invalidatedAt:null});
 render(<LearningCenter repository={repository} snapshot={await repository.getSnapshot()}/>);fireEvent.click(screen.getByRole('button',{name:'Reviewed flashcards'}));fireEvent.click(screen.getByRole('button',{name:'Skip card'}));expect(screen.queryByText('Reason B')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Reveal explanation'}));expect(screen.getByText('Reason B')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'I remembered'}));
 await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Saved locally'));const snapshot=await repository.getSnapshot();expect(snapshot.reviews).toEqual([]);expect((snapshot.workspace?.find(w=>w.id==='learning:state')?.value.schedules as {cardId:string}[])[0].cardId).toBe('q1:1:wrong:b');expect(snapshot.contentTrust).toHaveLength(1);
 cleanup();await db.delete();
});
it.each([{deadlineAt:'2026-10-08T23:59:00Z',feedbackAtEnd:false},{deadlineAt:null,feedbackAtEnd:true}])('hides released reserve cards throughout an active assessment, including a paused self-paced assessment: %j',async configuration=>{
 const db=new StudyDatabase(`active-assessment-${crypto.randomUUID()}`),repository=new StudyRepository(db);const q=question({assessmentReserved:true,status:'reviewed',review:{reviewer:'Owner',reviewedAt:'2026-10-08T00:00:00Z',method:'Checked'}});await repository.installPack(pack([q]),[]);await repository.setContentTrust({questionId:q.id,revision:1},{questionId:q.id,revision:1,reviewer:'Owner',humanReviewedAt:'2026-10-08T00:00:00Z',sourceCheckedAt:'2026-10-08T00:00:00Z',invalidatedAt:null});await db.releasedHoldouts.put({questionId:q.id});
 await db.sessions.put({id:'active',mode:'learn',questionSnapshots:[q],optionOrders:{q1:['a','b','c']},answers:{},flags:[],currentIndex:0,startedAt:'2026-10-08T00:00:00Z',status:'active',submittedAt:null,correctionWarnings:[],...configuration});
 const {rerender}=render(<LearningCenter repository={repository} snapshot={await repository.getSnapshot()}/>);fireEvent.click(screen.getByRole('button',{name:'Reviewed flashcards'}));expect(screen.queryByRole('button',{name:'Reveal explanation'})).not.toBeInTheDocument();expect(screen.queryByText(q.prompt)).not.toBeInTheDocument();
 await db.sessions.update('active',{status:'submitted',submittedAt:'2026-10-08T12:00:00Z'});rerender(<LearningCenter repository={repository} snapshot={await repository.getSnapshot()}/>);expect(screen.getByRole('button',{name:'Reveal explanation'})).toBeInTheDocument();
 cleanup();await db.delete();
});
