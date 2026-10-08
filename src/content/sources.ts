import {isOfficialSource} from './validate.ts';
import type {SourceCheck} from './types';
type Transport=(url:string,options?:RequestInit)=>Promise<Response>;
export async function checkOfficialSource(url:string,transport:Transport=fetch):Promise<SourceCheck>{
 const base={referenceId:'',canonicalUrl:url,checkedAt:new Date().toISOString(),evidenceSummary:'URL checked only; source-review of technical claims still required.'};
 if(!isOfficialSource(url))return {...base,result:'changed'};
 try{let target=url;for(let n=0;n<6;n++){
  if(!isOfficialSource(target))return {...base,result:'changed'};
  const r=await transport(target,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(r.status>=300&&r.status<400){const location=r.headers.get('location');if(!location)return {...base,result:'unavailable'};target=new URL(location,target).href;continue;}
  return {...base,canonicalUrl:target,result:r.ok?'checked':'unavailable'};
 }return {...base,result:'unavailable'};}catch{return {...base,result:'unavailable'}}
}
