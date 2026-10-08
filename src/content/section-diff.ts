import type {Question} from './types';
export interface EvidenceSection {id:string;title:string;text:string}
export interface SectionChange {sectionId:string;title:string;kind:'added'|'removed'|'modified';before:string|null;after:string|null}
export interface SectionDiff {status:'unchanged'|'changed'|'unavailable'|'baseline-missing';changes:SectionChange[]}
export function plainText(html:string):string{return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|lt|gt|quot|#39|#x27);/gi,v=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&#x27;':"'"}[v.toLowerCase()]??v)).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim()}
export function sectionSlug(title:string):string{return plainText(title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
/** Microsoft article content is compared separately from navigation and page chrome. */
export function extractSections(html:string):EvidenceSection[]{
 const content=html.match(/<div\b[^>]*class="content"[^>]*>([\s\S]*?)<\/article>/i)?.[1]??html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??html;
 const clean=content.replace(/<(nav|aside|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
 const headings=[...clean.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)];
 return headings.map((h,i)=>{const title=plainText(h[3]);const id=h[2].match(/\bid=["']([^"']+)["']/i)?.[1]??sectionSlug(title);return {id,title,text:plainText(clean.slice((h.index??0)+h[0].length,headings[i+1]?.index??clean.length))}}).filter(s=>s.title&&!s.id.startsWith('ms--'));
}
export function diffSections(before:EvidenceSection[],after:EvidenceSection[],result:'checked'|'changed'|'unavailable'):SectionDiff{
 if(result==='unavailable'||after.length===0)return {status:'unavailable',changes:[]};
 if(before.length===0)return {status:'baseline-missing',changes:[]};
 const changes:SectionChange[]=[];
 for(const old of before){const next=after.find(s=>s.id===old.id);if(!next)changes.push({sectionId:old.id,title:old.title,kind:'removed',before:old.text,after:null});else if(old.text!==next.text||old.title!==next.title)changes.push({sectionId:old.id,title:next.title,kind:'modified',before:old.text,after:next.text})}
 for(const next of after)if(!before.some(s=>s.id===next.id))changes.push({sectionId:next.id,title:next.title,kind:'added',before:null,after:next.text});
 return {status:changes.length||result==='changed'?'changed':'unchanged',changes};
}
/** Citation-only impact is deliberately conservative: a URL/ID match needs review even when an anchor is vague. */
export function sectionImpact(referenceId:string,changes:SectionChange[],questions:Question[],url?:string):{questionId:string;revision:number;optionIds:string[];summary:boolean;sectionMatch:boolean}[]{
 if(!changes.length)return [];
 return questions.flatMap(q=>{const refs=q.references.filter(r=>r.id===referenceId||url&&r.url.split('#')[0]===url.split('#')[0]);if(!refs.length)return [];
 const ids=refs.map(r=>r.id);return [{questionId:q.id,revision:q.revision,optionIds:q.options.filter(o=>o.referenceIds.some(id=>ids.includes(id))).map(o=>o.id),summary:q.summaryReferenceIds.some(id=>ids.includes(id)),sectionMatch:refs.some(r=>r.section&&changes.some(c=>sectionSlug(r.section!)===sectionSlug(c.title)||sectionSlug(r.section!)===c.sectionId))}];});
}
