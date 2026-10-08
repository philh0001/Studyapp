import type {DatabaseSnapshot} from '../sessions/types';
import {MAX_BACKUP_BYTES,MAX_EXPANDED_BACKUP_BYTES} from './types';
export interface PreparedBackup{blob:Blob;compressed:boolean}
async function bounded(stream:ReadableStream<Uint8Array>,limit:number):Promise<Blob>{
 const reader=stream.getReader(),parts:ArrayBuffer[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('Backup exceeds the supported size limit. Your local data has not changed.');}parts.push(value.slice().buffer as ArrayBuffer)}}finally{reader.releaseLock()}
 return new Blob(parts);
}
export async function prepareBackup(snapshot:DatabaseSnapshot):Promise<PreparedBackup>{
 const json=new Blob([JSON.stringify({...snapshot,schemaVersion:1,exportedAt:new Date().toISOString()})],{type:'application/json'});
 if(json.size<=MAX_BACKUP_BYTES)return {blob:json,compressed:false};
 if(json.size>MAX_EXPANDED_BACKUP_BYTES)throw Error('History exceeds the 64 MiB expanded backup limit. Keep your browser data; no usable backup was created.');
 if(typeof CompressionStream==='undefined')throw Error('This history needs compression. Open this browser profile in a newer browser that supports compressed backups. Your data is unchanged.');
 const compressed=await bounded(json.stream().pipeThrough(new CompressionStream('gzip')),MAX_BACKUP_BYTES);
 return {blob:new Blob([compressed],{type:'application/gzip'}),compressed:true};
}
export async function readBackupFile(blob:Blob,compressed:boolean):Promise<{text:string;byteLength:number}>{
 if(blob.size>MAX_BACKUP_BYTES)throw Error('Backup file must be at most 10 MiB.');
 if(!compressed){const text=typeof blob.text==='function'?await blob.text():await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Could not read backup file.'));reader.readAsText(blob)});return {text,byteLength:blob.size}}
 if(typeof DecompressionStream==='undefined')throw Error('This browser cannot open compressed backups. Update your browser first.');
 const expanded=await bounded(blob.stream().pipeThrough(new DecompressionStream('gzip')),MAX_EXPANDED_BACKUP_BYTES);
 return {text:await expanded.text(),byteLength:expanded.size};
}
