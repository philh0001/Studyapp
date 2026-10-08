import {it,expect} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {Reports} from '../../src/features/reports/Reports';
import {StudyRepository} from '../../src/storage/repository';
import {StudyDatabase} from '../../src/storage/database';
import type {DatabaseSnapshot} from '../../src/sessions/types';
import {question,pack} from '../fixtures';
it('provides accessible filters, immutable details and empty filtered history',()=>{
 const q=question();const snapshot:DatabaseSnapshot={sessions:[{id:'saved',mode:'learn',questionSnapshots:[q],optionOrders:{},answers:{},flags:[],currentIndex:0,startedAt:'2026-10-07T12:00:00Z',deadlineAt:null,status:'submitted',submittedAt:'2026-10-07T12:01:00Z',correctionWarnings:[]}],packs:[pack()],attempts:[],contentTrust:[],sourceChecks:[],settings:[],reviews:[],bookmarks:[],notes:[],releasedHoldouts:[]};
 render(<Reports repository={new StudyRepository(new StudyDatabase('reports-ui'))} snapshot={snapshot}/>);
 expect(screen.getByText('Test prompt')).toBeInTheDocument();expect(screen.getByText(/0 \/ 1 answered/)).toBeInTheDocument();expect(screen.getByRole('button',{name:'Export filtered JSON'})).toBeEnabled();fireEvent.change(screen.getByLabelText('Study mode'),{target:{value:'timed'}});expect(screen.getByText('No saved sessions match these filters.')).toBeInTheDocument();
});
it('renders no historical answer or question content for an active timed assessment',()=>{
 const q=question();const base={id:'old',mode:'learn' as const,questionSnapshots:[q],optionOrders:{},answers:{q1:{selectedOptionIds:['a'],confidence:'confident' as const,responseMs:1500}},flags:[],currentIndex:0,startedAt:'2026-10-07T12:00:00Z',deadlineAt:null,status:'submitted' as const,submittedAt:'2026-10-07T12:01:00Z',correctionWarnings:[]};
 const snapshot:DatabaseSnapshot={sessions:[base,{...base,id:'active',status:'active',deadlineAt:'2026-10-07T13:00:00Z',questionSnapshots:[question({revision:2})]}],packs:[pack()],attempts:[],contentTrust:[],sourceChecks:[],settings:[],reviews:[],bookmarks:[],notes:[],releasedHoldouts:[]};
 const {container}=render(<Reports repository={new StudyRepository(new StudyDatabase('reports-secret'))} snapshot={snapshot}/>);expect(container.textContent).not.toContain('Test prompt');expect(container.textContent).not.toContain('Saved answer:');expect(container.textContent).not.toContain('Reason A');expect(container.textContent).toContain('question details withheld');
});
