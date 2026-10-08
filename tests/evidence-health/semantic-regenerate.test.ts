import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {expect,it} from 'vitest';

const script=resolve('scripts/audit-bank.mjs');
const bank=JSON.parse(readFileSync('content/packs/az104-compute-expanded-draft.json','utf8'));
const original=bank.questions.find((q:any)=>q.id==='az104-compute-plus-04');
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function regenerate(change:(question:any)=>void=()=>{}){
 const directory=mkdtempSync(join(tmpdir(),'studyapp-semantic-regenerate-'));
 const write=(path:string,value:unknown)=>{const file=join(directory,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(value))};
 try{
  const q=structuredClone(original);change(q);
  const semanticReview={reviewedRevision:original.revision,accuracyAuditHash:hash(original),conclusion:'Fresh full-content accuracy review retained for this exact scenario and answer.',humanApprovalGranted:false,uncertainties:[],optionConcerns:[],optionReviews:original.options.map((o:any)=>({optionId:o.id,reviewedClaim:o.explanation,evidence:[]}))};
  write('content/packs/fixture.json',{questions:[q]});
  write('content/audits/full-bank-review.json',{questions:[{questionId:original.id,revision:original.revision,semanticReview,optionAudits:[]}],quoteSections:{}});
  write('content/blueprints/history/official-sections-baseline.json',{entries:[]});
  write('content/sources/fixture.json',[]);
  for(const name of ['semantic-review','semantic-compute','semantic-networking'])write(`src/features/evidence/${name}.json`,name==='semantic-compute'?{[original.id]:{...semanticReview,accuracyAuditHash:undefined,conclusion:'Stale legacy review must not replace the current source audit.'}}:{});
  execFileSync(process.execPath,[script,'--output',join(directory,'result.json')],{cwd:directory});
  return {report:JSON.parse(readFileSync(join(directory,'result.json'),'utf8')),semanticReview};
 }finally{rmSync(directory,{recursive:true,force:true})}
}

it('the actual audit CLI retains a fresh exact-content review instead of stale legacy semantic records',()=>{
 const {report,semanticReview}=regenerate();
 expect(report.questions[0].semanticReview).toEqual(semanticReview);
 expect(report.summary.aiSemanticReviewed).toBe(1);expect(report.summary.semanticConcerns).toBe(0);
});
it.each(['scenario','correctOptionIds','revision'])('the audit CLI rejects a fresh review after %s changes',field=>{
 const {report}=regenerate(q=>{if(field==='scenario')q.scenario+=' Changed assumptions.';else if(field==='correctOptionIds')q.correctOptionIds=['a'];else q.revision++});
 expect(report.questions[0].semanticReview).toBeNull();expect(report.summary.aiSemanticReviewed).toBe(0);
});
