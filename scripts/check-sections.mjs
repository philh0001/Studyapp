import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {fetch,EnvHttpProxyAgent} from 'undici';
import {extractSections,diffSections} from '../src/content/section-diff.ts';
import {argument,retrieveLearnHtml} from './check-blueprint.mjs';
/** Section snapshots are separate artifacts. This script never updates a ledger or question. */
export async function observeSections(source,baseline,transport){
 const checkedAt=new Date().toISOString(),base={referenceId:source.referenceId,canonicalUrl:source.canonicalUrl,checkedAt,baselineHash:baseline?.contentHash??null};
 try{const retrieved=await retrieveLearnHtml(source.canonicalUrl,transport),sections=extractSections(retrieved.html);if(!sections.some(s=>s.text.length>0))throw Error('Official article content could not be extracted; preserve the baseline.');const diff=diffSections(baseline?.sections??[],sections,'checked');
 return {...base,canonicalUrl:retrieved.canonicalUrl,contentHash:retrieved.contentHash,...diff,sections,error:null};
 }catch(error){return {...base,status:'unavailable',changes:[],sections:null,contentHash:null,error:error.message};}
}
export async function main(args=process.argv.slice(2)){
 const sourceDir=argument(args,'--source-dir','content/sources'),baselinePath=argument(args,'--baseline','content/blueprints/history/official-sections-baseline.json'),output=resolve(argument(args,'--output','/tmp/studyapp-section-report.json'));
 const baseline=JSON.parse(await readFile(baselinePath,'utf8')),sources=[];for(const name of (await readdir(sourceDir)).filter(s=>s.endsWith('.json')).sort()){const ledger=JSON.parse(await readFile(resolve(sourceDir,name),'utf8'));if(!Array.isArray(ledger))continue;for(const source of ledger)if(source.referenceId&&source.canonicalUrl){if(sources.some(s=>s.referenceId===source.referenceId))throw Error('Duplicate source reference');sources.push(source)}}
 const dispatcher=new EnvHttpProxyAgent(),entries=[],observations=new Map(),snapshots=[];
 try{for(const source of sources){const old=baseline.entries.find(e=>e.referenceId===source.referenceId&&e.canonicalUrl===source.canonicalUrl);const key=source.canonicalUrl+'|'+(old?.contentHash??'');let observation=observations.get(key);if(!observation){observation=await observeSections(source,old,(url,options)=>fetch(url,{...options,dispatcher}));observations.set(key,observation)}const {sections,...entry}=observation;entries.push({...entry,referenceId:source.referenceId});if(sections)snapshots.push({referenceId:source.referenceId,canonicalUrl:entry.canonicalUrl,checkedAt:entry.checkedAt,contentHash:entry.contentHash,sections})}}
 finally{await dispatcher.close()}
 await mkdir(dirname(output),{recursive:true});const report={version:1,kind:'sections',generatedAt:new Date().toISOString(),baselineGeneratedAt:baseline.generatedAt,entries};
 await writeFile(output,JSON.stringify(report,null,2)+'\n');await writeFile(output.replace(/\.json$/, '')+'.observed-sections.json',JSON.stringify({version:1,generatedAt:report.generatedAt,entries:snapshots},null,2)+'\n');
 console.log(JSON.stringify({output,counts:entries.reduce((counts,e)=>(counts[e.status]=(counts[e.status]??0)+1,counts),{}),distinctUrls:observations.size}));if(entries.some(e=>e.status==='unavailable'))process.exitCode=1;return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
