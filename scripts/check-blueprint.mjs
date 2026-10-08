import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {fetch,EnvHttpProxyAgent} from 'undici';
import {extractBlueprint,diffBlueprint} from '../src/content/blueprint-diff.ts';
export function argument(args,name,fallback){const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error(`Missing ${name}`);return args[i+1]}
export async function retrieveLearnHtml(url,transport){
 let target=url;for(let n=0;n<6;n++){
  const parsed=new URL(target);if(parsed.protocol!=='https:'||parsed.hostname!=='learn.microsoft.com'||parsed.username||parsed.password)throw Error('Retrieval must stay on official Microsoft Learn.');
  const response=await transport(target,{redirect:'manual',signal:globalThis.AbortSignal.timeout(20000)});
  if(response.status>=300&&response.status<400){const location=response.headers.get('location');if(!location)throw Error('Missing redirect location');target=new URL(location,target).href;continue;}
  if(!response.ok)throw Error(`Official retrieval HTTP ${response.status}`);const html=await response.text();if(html.length>5_000_000)throw Error('Source exceeded retrieval limit');
  return {canonicalUrl:target,html,contentHash:createHash('sha256').update(html).digest('hex')};
 }throw Error('Official retrieval redirect limit exceeded');
}
export async function observeBlueprint(baseline,transport){
 const base={version:1,kind:'blueprint',generatedAt:new Date().toISOString(),baselineId:baseline.id,baselineCheckedAt:baseline.checkedAt,source:baseline.source,requiresReview:false};
 try{const retrieved=await retrieveLearnHtml(baseline.source,transport),candidate=extractBlueprint(retrieved.html,baseline,base.generatedAt),diff=diffBlueprint(baseline,candidate);
 return {...base,...diff,candidate,canonicalUrl:retrieved.canonicalUrl,contentHash:retrieved.contentHash,html:retrieved.html,error:null};
 }catch(error){return {...base,status:'unavailable',candidate:null,changes:[],error:error.message};}
}
export async function main(args=process.argv.slice(2)){
 const baseline=JSON.parse(await readFile(argument(args,'--baseline','content/blueprints/history/az104-2026-04-17.baseline.json'),'utf8'));
 const output=resolve(argument(args,'--output','/tmp/studyapp-blueprint-report.json')),dispatcher=new EnvHttpProxyAgent();let observation;
 try{observation=await observeBlueprint(baseline,(url,options)=>fetch(url,{...options,dispatcher}))}finally{await dispatcher.close()}
 const {html,...report}=observation;await mkdir(dirname(output),{recursive:true});
 if(html){const path=resolve(dirname(output),`az104-guide-${report.contentHash}.html`);try{await writeFile(path,html,{flag:'wx'})}catch(error){if(error.code!=='EEXIST')throw error}report.retrievedArtifact=path}
 await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({output,status:report.status,changes:report.changes.length,effectiveDate:report.candidate?.effectiveDate??null}));
 if(report.status==='unavailable')process.exitCode=1;return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
