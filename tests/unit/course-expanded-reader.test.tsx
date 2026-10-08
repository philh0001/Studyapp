import {act,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {CourseReader} from '../../src/features/course/CourseReader';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {lessonReading} from '../../src/features/course/reading';
import {speechChunks} from '../../src/features/course/speech';
vi.mock('../../content/course/az104-course.json',()=>({default:{id:'course',title:'Course',url:'https://learn.microsoft.com/en-us/training/courses/az-104t00',checkedAt:'2026-10-08T00:00:00Z',paths:[{id:'path',title:'Path',url:'https://learn.microsoft.com/en-us/training/paths/az-104-administrator-prerequisites/',modules:[{id:'intro-to-azure-cloud-shell',title:'Module',url:'https://learn.microsoft.com/en-us/training/modules/intro-to-azure-cloud-shell/',lessons:[{id:'expanded-unit',title:'Expanded lesson',url:'https://learn.microsoft.com/en-us/training/modules/intro-to-azure-cloud-shell/2-what-is-azure-cloud-shell',kind:'teaching',points:['A concise starting point.'],sections:[{title:'How to choose the shell',paragraphs:['The expanded explanation connects the shell choice to your administration task.'],steps:['Inspect the selected subscription before making changes.'],code:{language:'bash',text:'az account show --query name'},sourceUrls:['https://learn.microsoft.com/en-us/azure/cloud-shell/features']}]}]}]}]}}));
const databases:StudyDatabase[]=[];
it('preserves saved key-point speech positions and exact offsets through Unicode and code',()=>{
 const lesson={id:'offsets',title:'Azure — choices',url:'https://learn.microsoft.com/en-us/azure/',kind:'teaching' as const,points:['Choose a subscription.','Check permissions first.'],sections:[{title:'Practical example',paragraphs:['Use “read-only” checks before changing resources.'],steps:['Inspect the account.'],code:{language:'bash',text:'  az account show\n    --query name'},sourceUrls:['https://learn.microsoft.com/en-us/azure/']}]};
 const original=[lesson.title,...lesson.points].join('\n\n');const expanded=lessonReading(lesson);const oldChunks=speechChunks(original);
 expect(expanded.text.startsWith(original+'\n\n')).toBe(true);expect(speechChunks(expanded.text).slice(0,oldChunks.length)).toEqual(oldChunks);
 for(const block of expanded.blocks)expect(expanded.text.slice(block.start,block.end)).toBe(block.text);
});
class Utterance{rate=1;voice=null;onend:(()=>void)|null=null;onboundary:((event:{name:string;charIndex:number;charLength:number})=>void)|null=null;constructor(public text:string){}}
let spoken:Utterance[]=[];
beforeEach(()=>{spoken=[];vi.stubGlobal('SpeechSynthesisUtterance',Utterance);vi.stubGlobal('speechSynthesis',{speak:(u:Utterance)=>spoken.push(u),cancel:vi.fn(),getVoices:()=>[],addEventListener:vi.fn(),removeEventListener:vi.fn()})});
afterEach(async()=>{vi.unstubAllGlobals();for(const db of databases.splice(0))await db.delete()});
async function reader(){const db=new StudyDatabase(crypto.randomUUID());databases.push(db);const repository=new StudyRepository(db);return render(<CourseReader repository={repository} snapshot={await repository.getSnapshot()} onSaveQueued={write=>write}/>)}
it('shows the expanded explanation, practical steps and code without an extra disclosure',async()=>{
 await reader();expect(screen.getByRole('heading',{name:'How to choose the shell'})).toBeVisible();expect(screen.getByText('The expanded explanation connects the shell choice to your administration task.')).toBeVisible();expect(screen.getByText('Inspect the selected subscription before making changes.')).toBeVisible();expect(screen.getByText('az account show --query name')).toBeVisible();
});
it('reads and highlights expanded paragraphs as part of the same lesson',async()=>{
 const view=await reader();fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
 let n=0;while(!spoken.at(-1)?.text.startsWith('The expanded explanation')&&n++<20)act(()=>spoken.at(-1)?.onend?.());
 expect(view.container.querySelector('.course-explanations .course-reading-passage')).toHaveTextContent('The expanded explanation');
 act(()=>spoken.at(-1)?.onboundary?.({name:'word',charIndex:4,charLength:8}));expect(view.container.querySelector('.course-explanations .course-spoken-word')).toHaveTextContent('expanded');
});
it('includes practical steps and command text in the same highlighted reading queue',async()=>{
 const view=await reader();fireEvent.click(screen.getByRole('button',{name:'Play course notes'}));
 let n=0;while(spoken.at(-1)?.text!=='az account show --query name'&&n++<20)act(()=>spoken.at(-1)?.onend?.());
 expect(view.container.querySelector('.course-explanations pre .course-reading-passage')).toHaveTextContent('az account show --query name');
});
