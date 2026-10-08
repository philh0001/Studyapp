import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {CourseReader} from '../../src/features/course/CourseReader';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {WriteTracker} from '../../src/app/write-tracker';
import {exportBackup,restoreBackup} from '../../src/backup/restore';
import {COURSE_STATE_KEY} from '../../src/features/course/state';
import course from '../../content/course/az104-course.json';
const databases:StudyDatabase[]=[];
class Utterance{text:string;rate=1;voice=null;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(text:string){this.text=text}}
let spoken:Utterance[]=[];
beforeEach(()=>{spoken=[];vi.stubGlobal('SpeechSynthesisUtterance',Utterance);vi.stubGlobal('speechSynthesis',{speak:(u:Utterance)=>spoken.push(u),cancel:vi.fn(),getVoices:()=>[],addEventListener:vi.fn(),removeEventListener:vi.fn()})});
afterEach(async()=>{vi.restoreAllMocks();vi.unstubAllGlobals();for(const db of databases.splice(0))await db.delete()});
function repository(){const db=new StudyDatabase(crypto.randomUUID());databases.push(db);return new StudyRepository(db)}
const first=course.paths[0].modules[0].lessons[0],second=course.paths[0].modules[0].lessons[1];

it('serializes speech cursor and selection writes without losing completion or preferences',async()=>{
 const repo=repository(),tracked:Promise<void>[]=[];
 render(<CourseReader repository={repo} snapshot={await repo.getSnapshot()} onSaveQueued={write=>{tracked.push(write);return write}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Mark as read'}));fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
 let n=0;while((screen.getByLabelText('Lesson') as HTMLSelectElement).value===first.id&&n++<20)act(()=>spoken.at(-1)?.onend?.());
 expect((screen.getByLabelText('Lesson') as HTMLSelectElement).value).toBe(second.id);
 fireEvent.click(screen.getByRole('button',{name:'Pause reading'}));fireEvent.change(screen.getByLabelText('Listening speed'),{target:{value:'1.25'}});
 await Promise.all(tracked);
 const saved=(await repo.db.workspace.get(COURSE_STATE_KEY))!.value;
 expect(saved.completedIds).toEqual([first.id]);expect(saved.selectedLessonId).toBe(second.id);expect(saved.listening).toEqual({sectionId:second.id,chunk:0});expect(saved.rate).toBe(1.25);
});

it('keeps failed saves visible and retry clears the navigation write guard',async()=>{
 const repo=repository(),tracker=new WriteTracker();vi.spyOn(repo.db.workspace,'put').mockRejectedValueOnce(new Error('Quota exceeded'));
 render(<CourseReader repository={repo} snapshot={await repo.getSnapshot()} onSaveQueued={write=>tracker.track(write,'course')}/>);
 fireEvent.click(screen.getByRole('button',{name:'Mark as read'}));await screen.findByRole('alert');await tracker.settled();expect(tracker.failed).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Retry saving'}));await waitFor(()=>expect(screen.queryByRole('alert')).not.toBeInTheDocument());await tracker.settled();expect(tracker.failed).toBe(false);
 expect((await repo.db.workspace.get(COURSE_STATE_KEY))!.value.completedIds).toEqual([first.id]);
});

it('backup restore preserves course completion, selected lesson and listening preferences',async()=>{
 const source=repository(),target=repository();
 await source.db.workspace.put({id:COURSE_STATE_KEY,version:1,updatedAt:new Date().toISOString(),value:{selectedLessonId:second.id,completedIds:[first.id],listening:{sectionId:second.id,chunk:1},rate:.75,voiceURI:'',scope:'course'}});
 const backup=JSON.parse(await exportBackup(await source.getSnapshot()).text());
 await restoreBackup(target,backup,{replaceConfirmed:true,recoveryBackup:exportBackup(await target.getSnapshot())});
 render(<CourseReader repository={target} snapshot={await target.getSnapshot()} onSaveQueued={write=>write}/>);
 expect((screen.getByLabelText('Lesson') as HTMLSelectElement).value).toBe(second.id);expect(screen.getByLabelText('Listening speed')).toHaveValue('0.75');expect(screen.getByLabelText('Listen to')).toHaveValue('course');expect(screen.getByText(/1 \/ 231 units marked read/)).toBeVisible();expect(spoken).toHaveLength(0);
});

it('opens six module questions directly from both the assessment lesson and modules without a Learn check',async()=>{
 const repo=repository();render(<CourseReader repository={repo} snapshot={await repo.getSnapshot()} onSaveQueued={write=>write}/>);
 fireEvent.click(screen.getByRole('button',{name:'Module assessment · 6 questions'}));
 expect(await screen.findByRole('heading',{name:'Module assessment'})).toBeVisible();
 expect(await screen.findByText('Question 1 of 6')).toBeVisible();expect(screen.getAllByRole('radio')).toHaveLength(4);
 const noCheck=course.paths.flatMap(path=>path.modules).find(module=>module.id==='allow-users-reset-their-password')!;
 fireEvent.change(screen.getByLabelText('Learning path'),{target:{value:course.paths[1].id}});fireEvent.change(screen.getByLabelText('Module'),{target:{value:noCheck.id}});
 expect(screen.queryByRole('heading',{name:'Module assessment'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Module assessment · 6 questions'}));expect(await screen.findByRole('heading',{name:'Module assessment'})).toBeVisible();
});

it('keeps an assessment visible until a failed answer save is retried before changing modules',async()=>{
 const repo=repository(),writes:Promise<void>[]=[];render(<CourseReader repository={repo} snapshot={await repo.getSnapshot()} onSaveQueued={write=>{writes.push(write);return write}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Module assessment · 6 questions'}));await screen.findByText('Question 1 of 6');await Promise.all(writes);
 vi.spyOn(repo.db.workspace,'put').mockRejectedValueOnce(new Error('Quota exceeded'));
 fireEvent.click(screen.getAllByRole('radio')[0]);await screen.findByRole('button',{name:'Retry saving'});
 fireEvent.change(screen.getByLabelText('Module'),{target:{value:course.paths[0].modules[1].id}});
 expect(screen.getByLabelText('Module')).toHaveValue(course.paths[0].modules[0].id);
 expect(screen.getByRole('button',{name:'Retry saving'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Retry saving'}));await waitFor(()=>expect(screen.queryByRole('button',{name:'Retry saving'})).not.toBeInTheDocument());
 fireEvent.change(screen.getByLabelText('Module'),{target:{value:course.paths[0].modules[1].id}});expect(screen.getByLabelText('Module')).toHaveValue(course.paths[0].modules[1].id);
});
