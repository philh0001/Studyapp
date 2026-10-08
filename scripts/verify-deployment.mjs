import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {fetch,EnvHttpProxyAgent} from 'undici';
const WORKER='https://az104-revision-web.showtime-workers.workers.dev';
export async function verifyDeployment(baseUrl,expected,transport){
 const base=new URL(baseUrl);if(base.origin!==WORKER||base.username||base.password)throw Error('Verify only the existing Studyapp Worker.');
 const errors=[],files=[];if(!expected.size)errors.push('No build artifact supplied; verification cannot pass.');if(!expected.has('/')||!expected.has('/sw.js')||![...expected.keys()].some(p=>p.startsWith('/assets/')&&p.endsWith('.js')))errors.push('Build artifact must include index, service worker and application JavaScript.');
 for(const [path,body] of expected){if(!path.startsWith('/')||path.startsWith('//'))throw Error('Artifact path must be local');
 try{const response=await transport(new URL(path,base).href,{redirect:'manual',cache:'no-store',signal:globalThis.AbortSignal.timeout(20000)});
 if(!response.ok){errors.push(`${path}: HTTP ${response.status}`);continue;}
 const bytes=new Uint8Array(await response.arrayBuffer()),actualHash=createHash('sha256').update(bytes).digest('hex'),expectedHash=createHash('sha256').update(typeof body==='string'?body:body).digest('hex');
 if(actualHash!==expectedHash)errors.push(`${path}: deployed bytes differ from the supplied build artifact`);
 if(path==='/'){
  const csp=response.headers.get('content-security-policy')??'';const directives=new Map(csp.split(';').map(s=>{const [name,...values]=s.trim().split(/\s+/);return [name,values]}));
  if(JSON.stringify(directives.get('default-src'))!==JSON.stringify(["'self'"])||JSON.stringify(directives.get('script-src'))!==JSON.stringify(["'self'"])||JSON.stringify(directives.get('object-src'))!==JSON.stringify(["'none'"]))errors.push('CSP must restrict default/script to self and forbid objects/unsafe script');
  if(response.headers.get('x-content-type-options')!=='nosniff')errors.push('Missing nosniff security header');
 }
 files.push({path,expectedHash,actualHash,matching:actualHash===expectedHash});
 }catch(error){errors.push(`${path}: ${error.message}`)}
 }
 return {version:1,kind:'deployment-verification',url:base.origin,checkedAt:new Date().toISOString(),ok:errors.length===0,files,errors};
}
export async function buildArtifacts(directory){const files=new Map();async function walk(path,prefix=''){for(const entry of await readdir(path,{withFileTypes:true})){const relative=prefix+'/'+entry.name;if(entry.isDirectory())await walk(resolve(path,entry.name),relative);else if(!entry.name.endsWith('.map')&&!['_headers','_redirects'].includes(entry.name))files.set(relative==='/index.html'?'/':relative,await readFile(resolve(path,entry.name)))}}await walk(directory);return files}
export async function main(args=process.argv.slice(2)){
 const flag=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback};
 const dispatcher=new EnvHttpProxyAgent();let report;try{report=await verifyDeployment(flag('--url',WORKER),await buildArtifacts(flag('--dist','dist')),(url,options)=>fetch(url,{...options,dispatcher}))}finally{await dispatcher.close()}
 const output=resolve(flag('--output','/tmp/studyapp-deployment-verification.json'));await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({output,ok:report.ok,files:report.files.length,errors:report.errors}));if(!report.ok)process.exitCode=1;return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
