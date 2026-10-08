import {act,fireEvent,render,screen} from '@testing-library/react';
import {expect,it} from 'vitest';
import {QuestionView} from '../../src/features/practice/Question';
import {question} from '../fixtures';
it('announces pending answer persistence and confirms durable completion rather than optimistic selection',async()=>{
 let release!:()=>void;render(<QuestionView question={question()} onSubmit={async()=>{}} onDraft={()=>new Promise<void>(resolve=>{release=resolve})}/>);fireEvent.click(screen.getByRole('radio',{name:'A'}));expect(await screen.findByText('Saving answer…')).toBeVisible();expect(screen.queryByText('Answer saved on this device.')).toBeNull();await act(async()=>{release()});expect(await screen.findByText('Answer saved on this device.')).toBeVisible();
});
