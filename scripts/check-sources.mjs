import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {fetch,EnvHttpProxyAgent} from 'undici';
import {isOfficialSource} from '../src/content/validate.ts';
import {classifySourceObservation} from '../src/content/freshness.ts';
/** Fetch only approved official hosts, checking every redirect before following it. */
export async function retrieveSource(source,transport){
 const base={referenceId:source.referenceId,canonicalUrl:source.canonicalUrl,checkedAt:new Date().toISOString(),evidenceSummary:'Retrieval failed; temporary unavailability does not invalidate factual review.'};
 try{let target=source.canonicalUrl;for(let n=0;n<6;n++){
  if(!isOfficialSource(target))return {...base,result:'changed',evidenceSummary:'Official source redirected outside the approved Microsoft Learn host; review required.'};
  const response=await transport(target,{redirect:'manual',signal:globalThis.AbortSignal.timeout(20000)});
  if(response.status>=300&&response.status<400){const next=response.headers.get('location');if(!next)return {...base,result:'unavailable'};target=new URL(next,target).href;continue;}
  if(!response.ok)return {...base,result:'unavailable',evidenceSummary:`Official source retrieval returned HTTP ${response.status}; existing factual review is preserved.`};
  const html=await response.text();return {...base,canonicalUrl:target,result:'checked',contentHash:createHash('sha256').update(html).digest('hex'),evidenceSummary:'Official Microsoft Learn HTML retrieved and hashed. Hash differences require section-level review; no human factual approval is inferred.'};
 }return {...base,result:'unavailable'};}catch{return {...base,result:'unavailable'}}
}
export async function main(args=process.argv.slice(2)){
 const flag=(name,fallback)=>{const at=args.indexOf(name);if(at<0)return fallback;if(!args[at+1]||args[at+1].startsWith('--'))throw Error(`Missing value for ${name}`);return args[at+1]};
 const sourceDir=flag('--source-dir','content/sources'),output=flag('--output','/tmp/studyapp-source-report.json');
 const sources=[];for(const file of (await readdir(sourceDir)).filter(f=>f.endsWith('.json')).sort()){const ledger=JSON.parse(await readFile(resolve(sourceDir,file),'utf8'));if(!Array.isArray(ledger))continue;for(const source of ledger){if(!source.referenceId||!source.canonicalUrl)continue;if(sources.some(s=>s.referenceId===source.referenceId))throw Error(`Duplicate reference ID: ${source.referenceId}`);sources.push(source)}}
 const dispatcher=new EnvHttpProxyAgent();const fetched=new Map();const entries=[];
 try{for(const source of sources){let observation=fetched.get(source.canonicalUrl);if(!observation){observation=await retrieveSource(source,(url,options)=>fetch(url,{...options,dispatcher}));fetched.set(source.canonicalUrl,observation)}entries.push(classifySourceObservation(source,{...observation,referenceId:source.referenceId}));}}
 finally{await dispatcher.close()}
 const report={version:1,generatedAt:new Date().toISOString(),entries};await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
 const counts=entries.reduce((all,e)=>(all[e.status]=(all[e.status]??0)+1,all),{});console.log(JSON.stringify({output,counts,distinctUrls:fetched.size}));
 if(entries.some(e=>e.status==='changed'||e.status==='unavailable'))process.exitCode=1;return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
