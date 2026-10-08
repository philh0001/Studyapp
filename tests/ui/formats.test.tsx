import {fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {describe,expect,it,vi} from 'vitest';
import {QuestionView} from '../../src/features/practice/Question';
import {FeedbackView} from '../../src/features/practice/Feedback';
import {Summary} from '../../src/features/practice/Summary';
import type {Attempt,Session} from '../../src/sessions/types';
import {question} from '../fixtures';
const ordering=()=>question({type:'ordering',requiredSelections:3,correctOptionIds:['b','a','c'],prompt:'Arrange the release steps',options:[{id:'a',text:'Validate',explanation:'Validate the staged revision before release.',referenceIds:['s1']},{id:'b',text:'Deploy',explanation:'Deploy to staging before validation.',referenceIds:['s1']},{id:'c',text:'Release',explanation:'Release only after validation completes.',referenceIds:['s1']}]});
const matching=()=>question({type:'matching',requiredSelections:3,correctOptionIds:['b','a','c'],matchPrompts:[{id:'read',text:'Read configuration'},{id:'deploy',text:'Deploy resources'},{id:'delegate',text:'Delegate access'}]});
const attempt=(q=ordering()):Attempt=>({id:'a1',sessionId:'s1',questionId:q.id,questionRevision:q.revision,questionSnapshot:q,selectedOptionIds:['c','a','b'],confidence:'unsure',correct:false,responseMs:100,mode:'timed',submittedAt:'2026-10-08T00:00:00Z'});
describe('advanced answer controls',()=>{
 it('lets users commit and reorder every step without exposing correct order before submit',async()=>{
  const saved:string[][]=[],submitted=vi.fn().mockResolvedValue(undefined);
  render(<QuestionView question={ordering()} optionOrder={['c','a','b']} onDraft={async a=>{saved.push(a.selectedOptionIds)}} onSubmit={submitted}/>);
  expect(screen.queryByText('Deploy to staging before validation.')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Submit answer'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Use this order'}));
  await waitFor(()=>expect(saved).toEqual([['c','a','b']]));
  fireEvent.click(screen.getByRole('button',{name:'Move Release down'}));
  await waitFor(()=>expect(saved.at(-1)).toEqual(['a','c','b']));
  expect(screen.getByRole('button',{name:'Move Validate up'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Submit answer'}));
  await waitFor(()=>expect(submitted).toHaveBeenCalledWith(['a','c','b'],'unknown',expect.any(Number)));
 });
 it('restores an ordered draft exactly and serializes writes before submission',async()=>{
  let resolve!:()=>void;const pending=new Promise<void>(r=>{resolve=r});const submit=vi.fn().mockResolvedValue(undefined);
  render(<QuestionView question={ordering()} initial={{selectedOptionIds:['b','c','a'],confidence:'guessed',responseMs:42}} onDraft={()=>pending} onSubmit={submit}/>);
  const steps=screen.getByRole('list',{name:'Step order'});expect(within(steps).getAllByRole('listitem').map(e=>e.textContent)).toEqual([expect.stringContaining('Deploy'),expect.stringContaining('Release'),expect.stringContaining('Validate')]);
  fireEvent.click(screen.getByRole('button',{name:'Move Deploy down'}));fireEvent.click(screen.getByRole('button',{name:'Submit answer'}));
  await Promise.resolve();expect(submit).not.toHaveBeenCalled();resolve();
  await waitFor(()=>expect(submit).toHaveBeenCalledWith(['c','b','a'],'guessed',expect.any(Number)));
 });
 it('retains a restored incomplete ordering prefix without silently submitting it',()=>{
  render(<QuestionView question={ordering()} optionOrder={['a','b','c']} initial={{selectedOptionIds:['c'],confidence:'unknown',responseMs:0}} onSubmit={async()=>{}}/>);
  const steps=within(screen.getByRole('list',{name:'Step order'})).getAllByRole('listitem');expect(steps[0]).toHaveTextContent('Release');expect(screen.getByRole('button',{name:'Submit answer'})).toBeDisabled();
 });
 it('persists matching IDs in prompt order, avoids duplicates, and safely clears dependent answers',async()=>{
  const saved:string[][]=[],submit=vi.fn().mockResolvedValue(undefined);render(<QuestionView question={matching()} onDraft={async a=>{saved.push(a.selectedOptionIds)}} onSubmit={submit}/>);
  expect(screen.getByLabelText('Deploy resources')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Read configuration'),{target:{value:'b'}});
  await waitFor(()=>expect(saved.at(-1)).toEqual(['b']));
  expect(within(screen.getByLabelText('Deploy resources')).getByRole('option',{name:'B'})).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Deploy resources'),{target:{value:'a'}});
  fireEvent.change(screen.getByLabelText('Delegate access'),{target:{value:'c'}});
  await waitFor(()=>expect(saved.at(-1)).toEqual(['b','a','c']));expect(screen.getByRole('button',{name:'Submit answer'})).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Deploy resources'),{target:{value:''}});
  await waitFor(()=>expect(saved.at(-1)).toEqual(['b']));expect(screen.getByLabelText('Delegate access')).toHaveValue('');
  expect(screen.getByRole('button',{name:'Submit answer'})).toBeDisabled();
 });
 it('renders safe accessible exhibits and shared case context',()=>{
  const q=question({caseStudy:{id:'case',title:'Harbor rollout',overview:'A shared original scenario.'},exhibits:[{type:'table',title:'Assignment inventory',columns:['Role','Scope'],rows:[['Reader','Resource group']]},{type:'code',title:'Literal code',language:'text',text:'<script>window.changed=true</script>'},{type:'diagram',title:'Topology',text:'Hub → Spoke'}]});
  render(<QuestionView question={q} onSubmit={async()=>{}}/>);
  expect(screen.getByRole('heading',{name:'Harbor rollout'})).toBeInTheDocument();
  expect(screen.getByRole('table',{name:'Assignment inventory'})).toBeInTheDocument();expect(screen.getByRole('columnheader',{name:'Scope'})).toBeInTheDocument();
  expect(screen.getByText('<script>window.changed=true</script>')).toBeInTheDocument();expect(document.querySelector('script')).toBeNull();expect(screen.getByText('Hub → Spoke')).toBeInTheDocument();
 });
 it('explains correct and chosen order in sequence rather than option-definition order',()=>{
  render(<FeedbackView attempt={attempt()} onNext={async()=>{}}/>);
  expect(screen.getByText('Correct answer:').parentElement).toHaveTextContent('Deploy → Validate → Release');
  expect(screen.getByText('Your answer:').parentElement).toHaveTextContent('Release → Validate → Deploy');
 });
 it('shows final matching review for submitted draft sessions with a deadline',()=>{
  const q=matching(),a={...attempt(q),mode:'draft-preview' as const,selectedOptionIds:['a','b','c']};
  const session:Session={id:'s1',mode:'draft-preview',questionSnapshots:[q],optionOrders:{q1:['a','b','c']},answers:{},flags:[],currentIndex:0,startedAt:'2026-10-08T00:00:00Z',deadlineAt:'2026-10-08T00:10:00Z',status:'submitted',submittedAt:'2026-10-08T00:05:00Z',correctionWarnings:[]};
  render(<Summary session={session} attempts={[a]}/>);expect(screen.getByRole('heading',{name:'Review your answers'})).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Incorrect or unanswered/));expect(screen.getByText('Correct answer:').parentElement).toHaveTextContent('Read configuration: B');
  expect(screen.getByText(/does not affect your scored progress/)).toBeInTheDocument();
 });
});
