import {expect,it,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {Practice} from '../../src/features/practice/Practice';
import {blueprint} from '../fixtures';
it('starts a whole self-paced case with delayed feedback and no implicit timer',async()=>{
 const start=vi.fn().mockResolvedValue(undefined);
 render(<Practice blueprint={blueprint} available={0} draftAvailable={315} onStart={start} cases={[{id:'case',title:'Linked case',domainId:'identity',previewAvailable:true,approvedAvailable:false}]}/>);
 fireEvent.change(screen.getByLabelText('Practice format'),{target:{value:'case-study'}});
 expect(screen.queryByLabelText('Practice duration (minutes)')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Start session →'}));
 await waitFor(()=>expect(start).toHaveBeenCalledWith('learn',10,'',30,false,expect.objectContaining({timed:false,feedbackAtEnd:true,caseStudyId:'case'})));
});
it('opens a linked question as whole-case setup instead of unavailable individual practice',()=>{
 render(<Practice blueprint={blueprint} available={0} draftAvailable={315} initialCaseId="case" onStart={vi.fn()} cases={[{id:'case',title:'Linked case',domainId:'identity',previewAvailable:true,approvedAvailable:false}]}/>);
 expect(screen.getByLabelText('Practice format')).toHaveValue('case-study');

 expect(screen.getByRole('combobox',{name:/^Case study$/})).toHaveValue('case');
 expect(screen.getByRole('button',{name:'Start session →'})).toBeEnabled();
});
