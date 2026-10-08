import {expect,it} from 'vitest';
import {bundledContent} from '../../src/app/bootstrap';
import blueprint from '../../content/blueprints/az104-2026-04-17.json';
const audits=Object.values(import.meta.glob('../../content/audits/*-starter-audit.json',{eager:true,import:'default'})) as {questions:{questionId:string;revision:number;subObjectiveIds:string[]}[]}[];
const legacy=Object.fromEntries(audits.flatMap(a=>a.questions.map(q=>[`${q.questionId}@${q.revision}`,q.subObjectiveIds])));
it('has a distinct 300-question bank with honest drafts and coverage of all official subskills',()=>{
 const {packs}=bundledContent(),questions=packs.flatMap(p=>p.questions);
 expect(questions).toHaveLength(300);
 expect(new Set(questions.map(q=>q.id)).size).toBe(300);
 expect(new Set(questions.map(q=>q.scenario+' '+q.prompt)).size).toBe(300);
 expect(questions.every(q=>q.status==='draft'&&q.review===null)).toBe(true);
 const skills=new Set(questions.flatMap(q=>q.subObjectiveIds??legacy[`${q.id}@${q.revision}`]??[]));
 const official=blueprint.domains.flatMap(d=>d.objectives.flatMap(o=>o.subObjectives.map((_,index)=>`${o.id}.${index+1}`)));
 expect(official).toHaveLength(82);
 expect(official.filter(id=>!skills.has(id))).toEqual([]);
 expect(questions.filter(q=>q.assessmentReserved).length).toBeGreaterThanOrEqual(60);
 for(const id of new Set(questions.flatMap(q=>q.caseStudy?[q.caseStudy.id]:[]))){const group=questions.filter(q=>q.caseStudy?.id===id);expect(group).toHaveLength(3);expect(new Set(group.map(q=>JSON.stringify(q.caseStudy))).size).toBe(1)}
});
