import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
/** Verified means backed by a retained passing deployment-verification artifact, never merely listed in Cloudflare. */
export function buildRollbackPlan(history,currentVersionId){
 const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
 if(!uuid.test(currentVersionId))throw Error('Invalid current version ID');
 if(!Array.isArray(history)||history.some(v=>!v||!uuid.test(v.id)||typeof v.verified!=='boolean'))throw Error('Invalid rollback history version ID or verification state');
 const currentIndex=history.findIndex(v=>v.id===currentVersionId),target=currentIndex<0?undefined:history.slice(currentIndex+1).find(v=>v.verified===true);
 return {version:1,kind:'rollback-plan',execute:false,worker:'az104-revision-web',currentVersionId,targetVersionId:target?.id??null,ready:!!target,
 reason:target?'Review the retained verification report and build before running the command manually.':'No prior verified Worker version is recorded; inspect Cloudflare history and recover a matching passing build artifact first.',
 command:target?`npx wrangler rollback ${target.id} --name az104-revision-web`:null,
 preChecks:['Confirm the failed deployment version and Worker name.','Check that the target version has a passing retained verification report and matching build artifact.','Preserve browser-local data; rollback changes assets only.','Cloudflare rollback may require compatible bindings; inspect version details before execution.'],
 postChecks:['Re-run deployment verification against the target build artifact.','Run live install/offline and learn/assessment/backup smoke checks.','Record rollback version and evidence; do not erase failed release records.']};
}
export async function main(args=process.argv.slice(2)){
 const flag=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null};const historyPath=flag('--history'),current=flag('--current');
 const plan=historyPath&&current?buildRollbackPlan(JSON.parse(await readFile(historyPath,'utf8')),current):{version:1,kind:'rollback-plan',execute:false,ready:false,reason:'Cloudflare authenticated version history and a previous verified artifact are required. No rollback was attempted.'};
 const output=resolve(flag('--output')??'/tmp/studyapp-rollback-plan.json');await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({output,ready:plan.ready,execute:false}));return plan;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
