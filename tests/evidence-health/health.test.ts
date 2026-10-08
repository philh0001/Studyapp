import {expect,it} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evidenceHealth,validQuoteBinding,normaliseHealthFilters,exportEvidenceGaps} from '../../src/features/evidence-health/health';
const audit=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8'));
const bank=readdirSync('content/packs').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(readFileSync(`content/packs/${f}`,'utf8')).questions);
it('binds exact verified quotations only to the audited question revision and option',()=>{
 const q=bank[0],o=q.options[0],e={questionId:q.id,questionRevision:q.revision,optionId:o.id,optionText:o.text,optionClaim:o.explanation,url:'https://learn.microsoft.com/en-us/azure/test#section',excerpt:'A sufficiently long official excerpt.',contentHash:'a'.repeat(64),sectionText:'A sufficiently long official excerpt.',sectionHash:'b'.repeat(64),htmlHashVerified:true};
 expect(validQuoteBinding(q,o.id,e,{[e.sectionHash]:e.sectionText})).toBe(true);
 for(const bad of [null,[],{...e,questionRevision:q.revision+1},{...e,optionId:'missing'},{...e,url:'https://learn.microsoft.com.evil.test/'},{...e,excerpt:'Unsupported quote'},{...e,htmlHashVerified:false},{...e,sectionHash:'bad'}])expect(validQuoteBinding(q,o.id,bad,{[e.sectionHash]:e.sectionText})).toBe(false);
});
it('distinguishes missing and stale audits, coverage and factual uncertainty',()=>{
 const q=bank[0];expect(evidenceHealth([q],[])[0].status).toBe('missing-audit');
 expect(evidenceHealth([q],[{questionId:q.id,revision:q.revision+1,optionAudits:[]}])[0].status).toBe('stale-audit');
 const result=evidenceHealth(bank,audit.questions,audit.quoteSections);expect(result).toHaveLength(bank.length);expect(result.every(r=>r.humanReviewPending)).toBe(true);expect(result.flatMap(r=>r.gaps)).toHaveLength(0);
});
it('rejects malicious imported filter shapes and exports no approval authority',()=>{
 expect(normaliseHealthFilters({domain:{},objective:['x'],onlyGaps:'yes'})).toEqual({domain:'all',objective:'all',onlyGaps:false});
 expect(normaliseHealthFilters(JSON.parse('{"__proto__":{"polluted":true}}'))).toEqual({domain:'all',objective:'all',onlyGaps:false});
 const report=JSON.parse(exportEvidenceGaps(evidenceHealth(bank,audit.questions,audit.quoteSections)));expect(report.humanApprovalGranted).toBe(false);expect(report.authoritative).toBe(false);expect(report.questions.every((q:any)=>q.humanReviewPending)).toBe(true);
});
it('preserves exact section and excerpt hashes and review-pending labels for the nine closed gaps',()=>{
 const closures=audit.questions.flatMap((q:any)=>q.optionAudits.flatMap((o:any)=>o.evidence.filter((e:any)=>e.gapClosure).map((e:any)=>({q,o,e}))));expect(closures).toHaveLength(9);
 for(const {q,o,e} of closures){const installed=bank.find(b=>b.id===q.questionId);expect(validQuoteBinding(installed,o.optionId,e,audit.quoteSections)).toBe(true);expect(createHash('sha256').update(e.sectionText).digest('hex')).toBe(e.sectionHash);expect(createHash('sha256').update(e.excerpt).digest('hex')).toBe(e.excerptHash);expect(e.humanApprovalGranted).toBe(false);}
});
it('verifies baseline coverage for every official ledger entry and persisted section hash',()=>{
 const baseline=JSON.parse(readFileSync('content/blueprints/history/official-sections-baseline.json','utf8'));
 const sources=readdirSync('content/sources').filter(f=>f.endsWith('.json')).flatMap(f=>{const x=JSON.parse(readFileSync(`content/sources/${f}`,'utf8'));return Array.isArray(x)?x:[]});
 expect(baseline.entries.length).toBe(sources.length);
 for(const source of sources){const entry=baseline.entries.find((e:any)=>e.referenceId===source.referenceId&&e.canonicalUrl===source.canonicalUrl);expect(entry).toBeDefined();expect(entry.retainedHtmlHashVerified).toBe(true);for(const section of entry.sections)expect(createHash('sha256').update(section.text).digest('hex')).toBe(section.contentHash);}
 for(const [hash,text] of Object.entries(audit.quoteSections))expect(createHash('sha256').update(text as string).digest('hex')).toBe(hash);
});
it('rejects option text changes at the same revision and unregistered section text',()=>{const q=bank[0],entry=audit.questions.find((r:any)=>r.questionId===q.id).optionAudits[0].evidence[0];expect(validQuoteBinding(q,q.options[0].id,entry,audit.quoteSections)).toBe(true);const changed={...q,options:q.options.map((o:any,i:number)=>i===0?{...o,text:'Tampered answer'}:o)};expect(validQuoteBinding(changed,q.options[0].id,entry,audit.quoteSections)).toBe(false);expect(validQuoteBinding(q,q.options[0].id,{...entry,sectionText:'Invented text '+entry.excerpt},audit.quoteSections)).toBe(false)});
