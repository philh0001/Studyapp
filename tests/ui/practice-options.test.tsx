import {expect,it,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {Practice} from '../../src/features/practice/Practice';
import {blueprint} from '../fixtures';
it('case practice passes the full group and timed options without pretending approval',async()=>{
 const start=vi.fn().mockResolvedValue(undefined);
 render(<Practice blueprint={blueprint} available={0} draftAvailable={300} onStart={start} cases={[{id:'case',title:'Example linked case',domainId:'identity'}]}/>);


 fireEvent.change(screen.getByLabelText('Practice format'),{target:{value:'case-study'}});
 fireEvent.click(screen.getByRole('checkbox',{name:/Time this case/}));
 fireEvent.click(screen.getByRole('button',{name:'Start session →'}));
 await waitFor(()=>expect(start).toHaveBeenCalledWith('learn',10,'',30,false,expect.objectContaining({timed:true,caseStudyId:'case'})));
});
it('defaults to a usable whole case and unlocks fresh reserve only by opt-in',()=>{
 render(<Practice blueprint={blueprint} available={0} draftAvailable={300} onStart={vi.fn()} cases={[{id:'reserved',title:'Reserved case',domainId:'identity',requiresReserve:true,previewAvailable:true,approvedAvailable:false},{id:'open',title:'Open case',domainId:'identity',previewAvailable:true,approvedAvailable:false}]}/>);
 fireEvent.change(screen.getByLabelText('Practice format'),{target:{value:'case-study'}});
 expect(screen.getByRole('combobox',{name:'Case study'})).toHaveValue('open');
 expect(screen.getByRole('option',{name:'Reserved case'})).toBeDisabled();
 fireEvent.click(screen.getByRole('checkbox',{name:/Include fresh reserved/}));expect(screen.getByRole('option',{name:'Reserved case'})).toBeEnabled();
});
