import {readFile,writeFile} from 'node:fs/promises';import {fetch,EnvHttpProxyAgent} from 'undici';import {checkOfficialSource} from '../src/content/sources.ts';
const dispatcher=new EnvHttpProxyAgent();const sources=JSON.parse(await readFile('content/sources/microsoft-source-checks.json','utf8'));let unavailable=0;
for(const source of sources){const check=await checkOfficialSource(source.canonicalUrl,(url,options)=>fetch(url,{...options,dispatcher}));source.lastUrlCheck={checkedAt:check.checkedAt,result:check.result};console.log(source.referenceId+': '+check.result);if(check.result!=='checked')unavailable++}
await writeFile('content/sources/microsoft-source-checks.json',JSON.stringify(sources,null,2)+'\n');await dispatcher.close();if(unavailable)process.exitCode=1;
