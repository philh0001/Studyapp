import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {normaliseExplorer,teaching,searchObjectives} from '../../src/features/explorer/state';
import {Explorer} from '../../src/features/explorer/Explorer';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
it('drops unknown IDs, malformed flags and timestamps and bounds observations',()=>{
 const id=teaching.walkthroughs[0].id;
 const value=normaliseExplorer(JSON.parse(JSON.stringify({readings:{entra:'2026-10-08T10:00:00Z',unknown:'2026-10-08',rbac:'bad'},bookmarks:['unknown',0],labs:{[id]:{steps:[true,'true',false,true],prerequisites:[true,{}],cleanup:'yes',observations:'x'.repeat(9000)},unknown:{}},resume:'unknown'})));
 expect(Object.keys(value.readings)).toEqual(['entra']);expect(value.bookmarks).toEqual([]);expect(value.resume).toBe('');expect(value.labs[id].steps).toEqual([true,false,false]);expect(value.labs[id].prerequisites).toEqual([true]);expect(value.labs[id].cleanup).toBe(false);expect(value.labs[id].observations).toHaveLength(4000);
});
it('searches sourced claim content and objective filters',()=>{expect(searchObjectives('redeem','entra')).toHaveLength(1);expect(searchObjectives('redeem','rbac')).toHaveLength(0)});
it('saves prerequisites, steps, cleanup and observations and resumes after reload without score changes',async()=>{
 const db=new StudyDatabase('explorer-'+crypto.randomUUID()),repository=new StudyRepository(db);
 const view=render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.click(screen.getByRole('button',{name:'Start Rehearse a guest invitation'}));
 expect(screen.getByLabelText(/Step 1:/)).toBeDisabled();
 fireEvent.click(screen.getByLabelText(/Prerequisite 1:/));
 await waitFor(()=>expect(screen.getByLabelText(/Step 1:/)).not.toBeDisabled());
 fireEvent.click(screen.getByLabelText(/Step 1:/));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Save observations'})).not.toBeDisabled());
 fireEvent.change(screen.getByLabelText('Personal lab observations'),{target:{value:'My test observation'}});
 fireEvent.click(screen.getByRole('button',{name:'Save observations'}));
 await waitFor(()=>expect((db.workspace.get('explorer:progress'))).resolves.toMatchObject({value:{labs:{'walkthrough-guest':{observations:'My test observation'}}}}));
 view.unmount();render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.click(screen.getByRole('button',{name:/Resume Rehearse/}));
 expect(screen.getByLabelText(/Step 1:/)).toBeChecked();expect(screen.getByLabelText('Personal lab observations')).toHaveValue('My test observation');
 expect(await db.attempts.count()).toBe(0);expect(await db.contentTrust.count()).toBe(0);db.close();await db.delete();
});
it('filters reading, bookmarks official pages and records reversible reading self-reports',async()=>{
 const db=new StudyDatabase('explorer-reading-'+crypto.randomUUID()),repository=new StudyRepository(db);
 render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.change(screen.getByLabelText('Objective filter'),{target:{value:'entra'}});
 fireEvent.click(screen.getByLabelText('I have read Manage Microsoft Entra users and groups'));
 await waitFor(()=>expect(screen.getByText(/1 reading objectives self-reported complete/)).toBeInTheDocument());
 fireEvent.click(screen.getByLabelText(/Bookmark How to create/));
 await waitFor(async()=>expect((await db.workspace.get('explorer:progress'))?.value.bookmarks).toHaveLength(1));
 expect(screen.getByText(/AI-assisted draft teaching material/)).toBeInTheDocument();db.close();await db.delete();
});
it('handles malformed restored JSON without trusting unknown material or foreign URLs',()=>{
 for(const value of [null,[],42,'bad',{readings:[],labs:[],bookmarks:['javascript:alert(1)','https://example.org']}])expect(normaliseExplorer(value)).toEqual({readings:{},labs:{},bookmarks:[],resume:''});
});
it('tracks cleanup explicitly and counts only complete self-reported walkthroughs',async()=>{
 const db=new StudyDatabase('explorer-cleanup-'+crypto.randomUUID()),repository=new StudyRepository(db),lab=teaching.walkthroughs[0];
 await db.workspace.put({id:'explorer:progress',version:1,updatedAt:new Date().toISOString(),value:{labs:{[lab.id]:{prerequisites:[true],steps:[true,true,true],cleanup:false,observations:''}},resume:lab.id}});
 render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 expect(screen.getByText(/0 walkthroughs self-reported complete/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:/Resume Rehearse/}));
 await waitFor(()=>expect(screen.getByLabelText(/Cleanup:/)).not.toBeDisabled());
 fireEvent.click(screen.getByLabelText(/Cleanup:/));
 await waitFor(()=>expect(screen.getByText(/1 walkthroughs self-reported complete/)).toBeInTheDocument());
 expect(screen.queryByRole('button',{name:/Resume Rehearse/})).not.toBeInTheDocument();db.close();await db.delete();
});

it('retains unsaved observations and reports storage failure honestly',async()=>{
 const db=new StudyDatabase('explorer-failure-'+crypto.randomUUID()),repository=new StudyRepository(db);
 render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.click(screen.getByRole('button',{name:'Start Rehearse a guest invitation'}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Save observations'})).not.toBeDisabled());
 fireEvent.change(screen.getByLabelText('Personal lab observations'),{target:{value:'Keep this unsaved note'}});
 const save=vi.spyOn(db.workspace,'put').mockRejectedValueOnce(new Error('storage failure'));
 fireEvent.click(screen.getByRole('button',{name:'Save observations'}));
 await waitFor(()=>expect(screen.getByText(/Could not save/)).toBeInTheDocument());
 expect(screen.getByLabelText('Personal lab observations')).toHaveValue('Keep this unsaved note');
 expect((await db.workspace.get('explorer:progress'))?.value.labs).toMatchObject({'walkthrough-guest':{observations:''}});save.mockRestore();db.close();await db.delete();
});
it('prints a filtered cited sheet that retains its draft notice',async()=>{
 const db=new StudyDatabase('explorer-print-'+crypto.randomUUID()),repository=new StudyRepository(db),print=vi.spyOn(window,'print').mockImplementation(()=>{});
 const {container}=render(<Explorer repository={repository} snapshot={await repository.getSnapshot()}/>);
 fireEvent.change(screen.getByLabelText('Objective filter'),{target:{value:'entra'}});
 fireEvent.click(screen.getByRole('button',{name:'Print cited revision sheet'}));
 expect(print).toHaveBeenCalledOnce();
 const sheet=container.querySelector('.explorer-sheet')!;
 expect(sheet.querySelector('.explorer-print-notice')?.textContent).toContain('independent human factual review required');
 expect(sheet.querySelectorAll('article')).toHaveLength(1);
 expect(sheet.querySelector('a')?.href).toMatch(/^https:\/\/learn.microsoft.com\//);
 print.mockRestore();db.close();await db.delete();
});
