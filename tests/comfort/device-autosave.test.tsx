import {expect,it} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {DeviceChecklist} from '../../src/features/settings/DeviceChecklist';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';

it('retains the latest typed device report across stale snapshots, then accepts a restored report after acknowledgement',async()=>{
 const db=new StudyDatabase('device-autosave-'+crypto.randomUUID()),repository=new StudyRepository(db);
 const before=await repository.getSnapshot();const view=render(<DeviceChecklist repository={repository} snapshot={before}/>);
 try{
  fireEvent.change(screen.getByLabelText('Offline use result'),{target:{value:'failed'}});
  fireEvent.change(screen.getByLabelText('Installation result'),{target:{value:'passed'}});
  fireEvent.change(screen.getByLabelText('Device model'),{target:{value:'Latest device'}});
  await waitFor(async()=>expect((await repository.getSnapshot()).workspace?.find(row=>row.id==='device:report')?.value.model).toBe('Latest device'));
  view.rerender(<DeviceChecklist repository={repository} snapshot={{...before}}/>);
  expect(screen.getByLabelText('Device model')).toHaveValue('Latest device');
  view.rerender(<DeviceChecklist repository={repository} snapshot={await repository.getSnapshot()}/>);
  await repository.db.workspace.put({id:'device:report',version:1,value:{model:'Restored device',os:'',browser:'',testedOn:'',checks:{}},updatedAt:new Date().toISOString()});
  view.rerender(<DeviceChecklist repository={repository} snapshot={await repository.getSnapshot()}/>);
  await waitFor(()=>expect(screen.getByLabelText('Device model')).toHaveValue('Restored device'));
 }finally{view.unmount();await db.delete()}
});
