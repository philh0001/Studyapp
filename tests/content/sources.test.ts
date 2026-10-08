import {it,expect} from 'vitest';
import {checkOfficialSource} from '../../src/content/sources';
it('redirect_to_unapproved_host_is_rejected',async()=>{const result=await checkOfficialSource('https://learn.microsoft.com/x',async()=>new Response('',{status:302,headers:{location:'https://example.org/'}}));expect(result.result).toBe('changed')});
it('temporary_outage_is_unavailable',async()=>{const result=await checkOfficialSource('https://learn.microsoft.com/x',async()=>{throw Error('offline')});expect(result.result).toBe('unavailable')});
it('a valid documented response records evidence without claiming human approval',async()=>{const result=await checkOfficialSource('https://learn.microsoft.com/x',async()=>new Response('Official documentation'));expect(result.result).toBe('checked');expect(result.evidenceSummary).toContain('source-review')});
