import {expect,it} from 'vitest';
import {bundledContent} from '../../src/app/bootstrap';
it('bundles all six banks and gives every reference a matching retrieved source record',()=>{
 const {packs,checks}=bundledContent();
 expect(packs).toHaveLength(7);
 expect(packs.flatMap(p=>p.questions)).toHaveLength(315);
 for(const q of packs.flatMap(p=>p.questions))for(const ref of q.references){
  expect(checks.some(s=>s.referenceId===ref.id&&s.canonicalUrl===ref.url&&s.result==='checked')).toBe(true);
 }
});
