import {expect,it} from 'vitest';
import {speechFollowScroll} from '../../src/features/course/follow';
it('leaves visible spoken text still and centers an obscured word above floating controls',()=>{
 expect(speechFollowScroll(40,64,300)).toBe(0);
 const delta=speechFollowScroll(430,454,300);
 expect(430-delta).toBeGreaterThanOrEqual(16);expect(454-delta).toBeLessThanOrEqual(284);
});
it('starts oversized fallback passages at the top of the readable area',()=>{
 expect(speechFollowScroll(200,700,300)).toBe(184);
});
