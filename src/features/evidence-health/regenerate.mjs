import {createHash} from 'node:crypto';
const canonical=value=>{const url=new URL(value);url.hash='';url.searchParams.delete('preserve-view');return url.href};
const hash=text=>createHash('sha256').update(text).digest('hex');
/** Retain exact provenance only when installed identity, option text and claim remain unchanged. */
export function retainEvidenceBindings(report,previous,bank,baseline){
 const sections={};
 for(const audit of report.questions){const q=bank.find(q=>q.id===audit.questionId&&q.revision===audit.revision),old=previous?.questions?.find(a=>a.questionId===audit.questionId&&a.revision===audit.revision);if(!q||!old)continue;
 for(const option of audit.optionAudits){const installed=q.options.find(o=>o.id===option.optionId),prior=old.optionAudits.find(o=>o.optionId===option.optionId&&o.text===installed?.text&&o.claim===installed?.explanation);if(!prior)continue;
 const verified=prior.evidence.filter(e=>{const text=e.sectionText??previous.quoteSections?.[e.sectionHash],source=baseline.entries.find(s=>s.referenceId===e.referenceId&&s.contentHash===e.contentHash);let url;try{url=new URL(e.url)}catch{return false}return source?.retainedHtmlHashVerified===true&&url.hostname==='learn.microsoft.com'&&url.protocol==='https:'&&canonical(url.href)===canonical(source.canonicalUrl)&&e.questionId===q.id&&e.questionRevision===q.revision&&e.optionId===installed.id&&e.optionText===installed.text&&e.optionClaim===installed.explanation&&e.htmlHashVerified===true&&typeof text==='string'&&text.includes(e.excerpt)&&hash(text)===e.sectionHash&&hash(e.excerpt)===e.excerptHash;});
 if(verified.length){option.evidence=verified;option.disposition=prior.disposition;option.uncertainty=prior.uncertainty;for(const e of verified)sections[e.sectionHash]=e.sectionText??previous.quoteSections[e.sectionHash]}
 }
 }
 for(const audit of report.questions){if(!audit.optionAudits.every(o=>o.evidence.some(e=>e.questionRevision===audit.revision)))continue;
 const obsolete=text=>text==='One or more options lack a relevant retained excerpt.'||text.includes('exact retained per-option excerpt is missing');
 audit.previousExcerptGapWarnings=[...new Set([...(audit.previousExcerptGapWarnings??[]),...(audit.flags??[]).filter(obsolete),...(audit.uncertainties??[]).filter(obsolete),...(audit.semanticReview?.uncertainties??[]).filter(obsolete)])];
 const resolved='Previously missing exact excerpts have been retrieved and bound. Semantic entailment and human factual review remain outstanding.';
 audit.flags=(audit.flags??[]).map(text=>obsolete(text)?`${text.match(/^Option [a-z]+:/)?.[0]??''} ${resolved}`.trim():text);audit.uncertainties=(audit.uncertainties??[]).map(text=>obsolete(text)?`${text.match(/^Option [a-z]+:/)?.[0]??''} ${resolved}`.trim():text);
 if(audit.semanticReview){audit.semanticReview.uncertainties=(audit.semanticReview.uncertainties??[]).map(text=>obsolete(text)?`${text.match(/^Option [a-z]+:/)?.[0]??''} ${resolved}`.trim():text);for(const option of audit.semanticReview.optionReviews??[])if(option.verdict==='exact-source-support-unresolved'){option.verdict='exact-excerpt-retrieved-human-review-pending';option.conclusion=resolved;}}
 }
 report.quoteSections=sections;const options=report.questions.flatMap(q=>q.optionAudits);report.summary.candidateEvidenceOptions=options.filter(o=>o.evidence.length).length;report.summary.evidenceGaps=options.filter(o=>!o.evidence.length).length;
 report.evidenceHealth={...previous?.evidenceHealth,generatedAt:new Date().toISOString(),retainedVerifiedOptions:options.filter(o=>o.evidence.some(e=>e.questionRevision)).length,humanReviewPending:true};return report;
}
