import {afterEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {Annotations} from '../../src/features/review/Annotations';
import {QuestionWorkpad} from '../../src/features/workpad/QuestionWorkpad';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {workpadKey} from '../../src/features/workpad/model';
import type {Session} from '../../src/sessions/types';
import {question} from '../fixtures';
const dbs:StudyDatabase[]=[];
afterEach(async()=>{for(const db of dbs.splice(0))await db.delete()});
function fixture(){const db=new StudyDatabase(crypto.randomUUID());dbs.push(db);const repository=new StudyRepository(db),q=question();const session:Session={id:'notes-session',mode:'learn',questionSnapshots:[q],optionOrders:{},answers:{},flags:[],currentIndex:0,startedAt:new Date().toISOString(),deadlineAt:null,status:'active',submittedAt:null,correctionWarnings:[]};return {db,repository,q,session}}
it('keeps personal notes collapsed while bookmark stays available and saved text remains intact',async()=>{
 const save=vi.fn(async()=>{}),bookmark=vi.fn(async()=>{});
 const ui=render(<Annotations questionId="question" revision={1} initialNote="Existing note" bookmarked={false} onSaveNote={save} onBookmark={bookmark}/>);
 const summary=screen.getByText('My notes',{selector:'summary'}),details=summary.closest('details')!;
 expect(details).not.toHaveAttribute('open');expect(screen.getByLabelText('Personal note')).not.toBeVisible();expect(screen.getByRole('button',{name:'☆ Bookmark question'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'☆ Bookmark question'}));expect(bookmark).toHaveBeenCalledWith(true);
 fireEvent.click(summary);expect(details).toHaveAttribute('open');expect(screen.getByLabelText('Personal note')).toHaveValue('Existing note');
 fireEvent.change(screen.getByLabelText('Personal note'),{target:{value:'Edited note'}});fireEvent.click(screen.getByRole('button',{name:'Save note'}));await screen.findByText('Note saved');expect(save).toHaveBeenCalledWith('Edited note');
 fireEvent.click(summary);expect(screen.getByLabelText('Personal note')).not.toBeVisible();fireEvent.click(summary);expect(screen.getByLabelText('Personal note')).toHaveValue('Edited note');ui.unmount();
});
it('collapses reasoning by default and retains queued autosaves when folded and reopened',async()=>{
 const {db,repository,q,session}=fixture();await db.workspace.put({id:workpadKey(session.id,q.id,q.revision),version:1,value:{approach:'Stored approach'},updatedAt:new Date().toISOString()});
 const tracked:Promise<void>[]=[];const ui=render(<QuestionWorkpad repository={repository} session={session} question={q} onSaveQueued={write=>{tracked.push(write)}}/>);
 const summary=screen.getByText('Personal reasoning workpad').closest('summary');expect(summary).not.toBeNull();const details=summary!.closest('details')!;expect(details).not.toHaveAttribute('open');
 await waitFor(()=>expect(screen.getByLabelText('My approach')).toHaveValue('Stored approach'));expect(screen.getByLabelText('My approach')).not.toBeVisible();
 fireEvent.click(summary!);expect(details).toHaveAttribute('open');fireEvent.change(screen.getByLabelText('My approach'),{target:{value:'New approach'}});expect(tracked).toHaveLength(1);fireEvent.click(summary!);await Promise.all(tracked);
 expect((await db.workspace.get(workpadKey(session.id,q.id,q.revision)))?.value.approach).toBe('New approach');fireEvent.click(summary!);expect(screen.getByLabelText('My approach')).toHaveValue('New approach');
 ui.unmount();render(<QuestionWorkpad repository={repository} session={session} question={q}/>);expect(screen.getByText('Personal reasoning workpad').closest('details')).not.toHaveAttribute('open');await waitFor(()=>expect(screen.getByLabelText('My approach')).toHaveValue('New approach'));
});
