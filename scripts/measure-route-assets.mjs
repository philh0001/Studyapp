import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,posix} from 'node:path';
import {gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';

/** Static graph only: service-worker installation separately downloads all offline assets. */
export function staticImports(code){return [...code.matchAll(/(?:\bimport\s*(?:[^;"']*?\bfrom\s*)?|\bexport\s*[^;"']*?\bfrom\s*)["']([^"']+\.js)["']/g)].map(match=>match[1])}
export async function measureRouteAssets(directory){
 const html=await readFile(resolve(directory,'index.html'),'utf8');
 const roots=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+\.js)"/g)].map(match=>match[1].replace(/^\//,''));
 const visited=new Set(),files=[];async function visit(file){if(visited.has(file))return;visited.add(file);const code=await readFile(resolve(directory,file),'utf8');files.push({file,bytes:Buffer.byteLength(code),gzipBytes:gzipSync(code).length});for(const dependency of staticImports(code)){if(dependency.startsWith('.'))await visit(posix.normalize(posix.join(posix.dirname(file),dependency)))}}
 for(const root of roots)await visit(root);
 const allFiles=(await readdir(resolve(directory,'assets'))).filter(file=>file.endsWith('.js'));
 return {version:1,kind:'static-home-route-javascript',measuredAt:new Date().toISOString(),method:'Built HTML entry/modulepreload plus recursively parsed static ES module imports. Excludes dynamic feature routes; service-worker offline installation still downloads all assets. Gzip is a local size estimate, not measured HTTP transfer or timing.',files:files.sort((a,b)=>a.file.localeCompare(b.file)),initialBytes:files.reduce((sum,file)=>sum+file.bytes,0),initialGzipBytes:files.reduce((sum,file)=>sum+file.gzipBytes,0),allJavaScriptFiles:allFiles.length,deferredFiles:allFiles.map(file=>'assets/'+file).filter(file=>!visited.has(file)).sort()};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const report=await measureRouteAssets(process.argv[2]??'dist'),output=process.argv[3];if(output)await writeFile(resolve(output),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({initialBytes:report.initialBytes,initialGzipBytes:report.initialGzipBytes,initialFiles:report.files.length,deferredFiles:report.deferredFiles.length,output}));}
