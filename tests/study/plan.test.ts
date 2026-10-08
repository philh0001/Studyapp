import {expect,it} from 'vitest';
import {buildStudyPlan} from '../../src/study/plan';
it('puts due review and weak objectives before uncovered reading without requiring an exam date',()=>{
 const steps=buildStudyPlan([{id:'covered',title:'Covered',studied:7,accuracy:.9},{id:'missing',title:'Not yet covered',studied:0,accuracy:null},{id:'weak',title:'Needs review',studied:6,accuracy:.4}],3);
 expect(steps[0].kind).toBe('review');expect(steps[1].objectiveId).toBe('weak');expect(steps[2].objectiveId).toBe('missing');expect(steps).toHaveLength(4);
});
