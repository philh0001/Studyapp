/** Assemble original quick points + fuller authored lessons; never redistribute retained source HTML. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const evidence=read('content/course/source-evidence.json');
const paths=['01-prerequisites','02-identity','03-network','04-storage','05-compute','06-monitoring'].map(id=>read(`content/course/paths/${id}.json`));
const coreAudits=['01-02','03-04','05-06'].map(id=>read(`content/course/audits/${id}-accuracy.json`));
const expandedFiles=['01-06-prerequisites-monitoring','02-identity','03-network-first','03-network-second','04-storage','05-compute'];
const reviewFiles=['01-06','02','03-first','03-second','04','05'];
const expanded=expandedFiles.flatMap(id=>read(`content/course/expanded/${id}.json`));
const reviews=reviewFiles.map(id=>read(`content/course/expanded/${id}-source-review.json`));
const independent=read('content/course/expanded/accuracy-review.json');
if(independent.humanApproval!==false||independent.findings.length||independent.lessons.length!==expanded.length||new Set(independent.lessons.map(row=>row.lessonId)).size!==expanded.length)throw Error('Incomplete independent source review');
if(reviews.some(review=>review.humanApproval!==false||review.findings.length||!Number.isFinite(Date.parse(review.checkedAt))))throw Error('Incomplete authored source review');
const rows=coreAudits.flatMap(audit=>audit.lessons),details=new Map(expanded.map(row=>[row.lessonId,row]));
if(details.size!==expanded.length)throw Error('Duplicate expanded unit');
const lessons=paths.flatMap(path=>path.modules.flatMap(module=>module.lessons));
if(expanded.length!==lessons.filter(lesson=>['teaching','exercise'].includes(lesson.kind)).length)throw Error('Expanded syllabus coverage is incomplete');
for(const lesson of lessons){
 const core=rows.find(row=>row.id===lesson.id);
 if(!core||JSON.stringify(core.pointHashes)!==JSON.stringify(lesson.points.map(point=>createHash('sha256').update(point).digest('hex'))))throw Error(`Quick-point provenance changed: ${lesson.id}`);
 const sourceDates=new Map(core.sourceUrls.map(url=>[url,coreAudits.find(a=>a.lessons.includes(core)).checkedAt]));
 const detail=details.get(lesson.id);
 if(['teaching','exercise'].includes(lesson.kind)){
  const review=reviews.find(a=>a.lessons.some(row=>row.lessonId===lesson.id));
  if(!detail||!review||detail.sections.length<2)throw Error(`Missing teaching: ${lesson.id}`);
  lesson.sections=detail.sections;
  const checked=independent.lessons.find(row=>row.lessonId===lesson.id);
  if(!checked||JSON.stringify(checked.sectionHashes)!==JSON.stringify(detail.sections.map(section=>createHash('sha256').update(JSON.stringify(section)).digest('hex'))))throw Error(`Independent teaching provenance changed: ${lesson.id}`);
  const reviewed=review.lessons.find(row=>row.lessonId===lesson.id);
  for(const section of detail.sections){if(!section.paragraphs?.length||!section.sourceUrls?.length)throw Error(`Empty section: ${lesson.id}`);for(const url of section.sourceUrls){if(!reviewed.sourceUrls.includes(url))throw Error(`Unreviewed section citation: ${lesson.id}`);sourceDates.set(url,review.checkedAt)}}
 }else if(detail)throw Error(`Overview/assessment must not be expanded: ${lesson.id}`);
 const additional=[];
 for(const [url,checkedAt] of sourceDates){const source=new URL(url);if(source.protocol!=='https:'||source.hostname!=='learn.microsoft.com')throw Error('Nonofficial teaching source');if(url!==lesson.url)additional.push({title:'Microsoft Learn: '+decodeURIComponent(source.pathname.split('/').filter(Boolean).at(-1)).replaceAll('-',' '),url,checkedAt})}
 if(additional.length)lesson.additionalSources=additional;
}
for(const id of details.keys())if(!lessons.some(lesson=>lesson.id===id))throw Error(`Unknown expanded unit: ${id}`);
const accuracyCheckedAt=[...coreAudits,...reviews,independent].map(a=>a.checkedAt).sort((a,b)=>Date.parse(b)-Date.parse(a))[0];
const course={id:'az104t00-2026-10-08',title:'Microsoft Azure Administrator — expanded study guide',url:evidence.courseUrl,checkedAt:evidence.retrievedAt,accuracyCheckedAt,paths};
writeFileSync('content/course/az104-course.json',JSON.stringify(course,null,2)+'\n');
const words=text=>text.trim().split(/\s+/).filter(Boolean).length;
console.log(JSON.stringify({paths:paths.length,modules:paths.reduce((n,p)=>n+p.modules.length,0),units:lessons.length,quickPoints:lessons.reduce((n,l)=>n+l.points.length,0),expandedUnits:expanded.length,sections:expanded.reduce((n,l)=>n+l.sections.length,0),newWords:expanded.reduce((n,l)=>n+l.sections.reduce((s,section)=>s+words([section.title,...section.paragraphs,...(section.steps??[]),section.code?.text??''].join(' ')),0),0)}));
