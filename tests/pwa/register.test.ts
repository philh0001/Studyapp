import {beforeEach, afterEach, expect, it, vi} from 'vitest';
const sw = vi.hoisted(() => ({activate:vi.fn(async()=>{}), options: {} as Record<string,()=>void>}));
vi.mock('virtual:pwa-register',()=>({registerSW:(options:Record<string,()=>void>)=>{sw.options=options;return sw.activate}}));
import {registerPwa} from '../../src/pwa/register';
beforeEach(()=>{localStorage.clear();sw.activate.mockClear()});
afterEach(()=>{localStorage.clear()});
it('only explicitly applies a pending update outside an active session',async()=>{
 const update=vi.fn();const pwa=registerPwa({onUpdateAvailable:update});
 expect(await pwa.applyPendingUpdate(false)).toBe(false);
 sw.options.onNeedRefresh();expect(update).toHaveBeenCalledOnce();expect(sw.activate).not.toHaveBeenCalled();
 expect(await pwa.applyPendingUpdate(true)).toBe(false);expect(sw.activate).not.toHaveBeenCalled();
 expect(await pwa.applyPendingUpdate(false)).toBe(true);expect(sw.activate).toHaveBeenCalledWith(true);pwa.dispose();
});
it('blocks activation when a different tab has an active session',async()=>{
 const tabA=registerPwa({onUpdateAvailable:()=>{}}),tabB=registerPwa({onUpdateAvailable:()=>{}});
 tabA.setSessionActive(true);sw.options.onNeedRefresh();
 expect(await tabB.applyPendingUpdate(false)).toBe(false);expect(sw.activate).not.toHaveBeenCalled();
 tabA.setSessionActive(false);expect(await tabB.applyPendingUpdate(false)).toBe(true);
 tabA.dispose();tabB.dispose();
});
it('a shared database activity check blocks updates even with no open active tab',async()=>{
 const pwa=registerPwa({onUpdateAvailable:()=>{},isAnySessionActive:async()=>true});sw.options.onNeedRefresh();
 expect(await pwa.applyPendingUpdate(false)).toBe(false);expect(sw.activate).not.toHaveBeenCalled();pwa.dispose();
});
it('failed activation keeps the pending update available for retry',async()=>{
 const pwa=registerPwa({onUpdateAvailable:()=>{}});sw.options.onNeedRefresh();sw.activate.mockRejectedValueOnce(Error('activation failed'));
 await expect(pwa.applyPendingUpdate(false)).rejects.toThrow('activation failed');
 expect(await pwa.applyPendingUpdate(false)).toBe(true);pwa.dispose();
});
it('ignores a stale crashed-tab marker when durable shared sessions are inactive',async()=>{
 localStorage.setItem('studyapp:pwa:active-tab:crashed','active');
 const pwa=registerPwa({onUpdateAvailable:()=>{},isAnySessionActive:async()=>false});sw.options.onNeedRefresh();
 expect(await pwa.applyPendingUpdate(false)).toBe(true);expect(sw.activate).toHaveBeenCalledOnce();pwa.dispose();
});
it('rechecks durable session activity before activating after an asynchronous read',async()=>{
 let checks=0;const pwa=registerPwa({onUpdateAvailable:()=>{},isAnySessionActive:async()=>++checks>1});sw.options.onNeedRefresh();
 expect(await pwa.applyPendingUpdate(false)).toBe(false);expect(sw.activate).not.toHaveBeenCalled();pwa.dispose();
});
it('fallback activity leases expire after a crashed tab stops renewing them',async()=>{
 vi.useFakeTimers();
 try{
  const tabA=registerPwa({onUpdateAvailable:()=>{}}),tabB=registerPwa({onUpdateAvailable:()=>{}});
  tabA.setSessionActive(true);sw.options.onNeedRefresh();expect(await tabB.applyPendingUpdate(false)).toBe(false);
  // A killed process loses its timer but leaves the lease in localStorage.
  vi.clearAllTimers();vi.setSystemTime(Date.now()+120_000);
  expect(await tabB.applyPendingUpdate(false)).toBe(true);tabA.dispose();tabB.dispose();
 }finally{vi.useRealTimers()}
});
