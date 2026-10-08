import {expect,it} from 'vitest';
import {normaliseJourney,todayQueue,moveTask,weekSummary} from '../../src/features/journey/model';
it('bounds malicious restored shapes and rejects impossible dates and unknown objectives',()=>{
 const state=normaliseJourney({goal:'x'.repeat(2000),dailyMinutes:Infinity,days:[1,1,9,'2'],paused:'yes',tasks:[null,{id:'a',title:'t',day:'2026-02-31',objectiveId:'fake'}],activity:[{minutes:Infinity}]});
 expect(state.goal.length).toBe(500);expect(state.dailyMinutes).toBe(15);expect(state.days).toEqual([1]);expect(state.paused).toBe(false);expect(state.tasks).toEqual([]);expect(state.activity).toEqual([]);
});
it('keeps carryover history, budgets a manually prioritised queue and respects pause',()=>{
 const state=normaliseJourney({dailyMinutes:15,days:[4],tasks:[{id:'a',title:'First',day:'2026-10-07',minutes:10,priority:1},{id:'b',title:'Second',day:'2026-10-08',minutes:10,priority:2}]});
 const moved=moveTask(state,'a','2026-10-08','2026-10-08T12:00:00Z');
 expect(moved.tasks[0].moves[0].from).toBe('2026-10-07');expect(todayQueue(moved,'2026-10-08').map(t=>t.id)).toEqual(['a']);expect(todayQueue({...moved,paused:true},'2026-10-08')).toEqual([]);
});
it('reviews only the chosen week with personal actual minutes and dated completions',()=>{
 const state=normaliseJourney({activity:[{id:'a',day:'2026-10-08',text:'Read',minutes:12},{id:'b',day:'2026-09-01',text:'Old',minutes:99}],tasks:[{id:'t',title:'Done',day:'2026-10-08',completedAt:'2026-10-08T12:00:00Z'}]});
 expect(weekSummary(state,'2026-10-08')).toMatchObject({minutes:12,completed:1,entries:1});
});
it('keeps a restored plan bounded, deduplicates task ids and preserves pause timestamps',()=>{const state=normaliseJourney({tasks:Array.from({length:900},(_,i)=>({id:i===1?'0':String(i),title:'Task',day:'2026-10-08',minutes:-20,priority:Infinity,moves:[null,{from:'2026-10-07',to:'2026-10-08',at:'garbage'}]})),pauseHistory:[null,{paused:true,at:'2026-10-08T12:00:00Z'}],activity:'malicious'});expect(state.tasks).toHaveLength(499);expect(state.tasks[0]).toMatchObject({minutes:1,priority:3,moves:[]});expect(state.activity).toEqual([]);expect(state.pauseHistory).toEqual([{paused:true,at:'2026-10-08T12:00:00.000Z'}])});
