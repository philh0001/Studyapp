import {fireEvent,render,screen,waitFor} from '@testing-library/react';import {afterEach,expect,test,vi} from 'vitest';import App from '../../src/app/App';import {StudyDatabase} from '../../src/storage/database';import {SessionService} from '../../src/sessions/service';
vi.mock('../../src/pwa/register',()=>({registerPwa:()=>({setSessionActive:vi.fn(),dispose:vi.fn(),applyPendingUpdate:vi.fn()})}));
afterEach(async()=>{vi.restoreAllMocks();window.location.hash='';await new StudyDatabase().delete()});
test('failed draft save prevents leaving by hash navigation until explicit retry saves answer',async()=>{
 vi.spyOn(Math,'random').mockReturnValue(.999999);window.location.hash='/home';const failed=vi.spyOn(SessionService.prototype,'saveDraftAnswer').mockRejectedValue(Error('Storage write failed'));
 render(<App/>);fireEvent.click(await screen.findByRole('button',{name:'Explore draft questions →'}));
 const answers=await screen.findByRole('group',{name:'Answer choices'});fireEvent.click(answers.querySelector('input')!);await screen.findByText('Storage write failed');const active=window.location.hash;
 window.location.hash='/home';await waitFor(()=>expect(window.location.hash).toBe(active));expect(await screen.findByText(/last answer was not saved/)).toBeVisible();
 failed.mockRestore();const retry=await screen.findByRole('button',{name:'Retry save'});if(retry.hasAttribute('disabled')){const inputs=answers.querySelectorAll('input');fireEvent.click(inputs[1])}fireEvent.click(retry);
 await screen.findByRole('button',{name:'Next question'});window.location.hash='/home';await screen.findByRole('button',{name:'Resume session →'});
});
