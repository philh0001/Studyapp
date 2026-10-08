/// <reference types="vite-plugin-pwa/client" />
import {registerSW} from 'virtual:pwa-register';

export interface PwaOptions {
 onUpdateAvailable:()=>void;
 onOfflineReady?:()=>void;
 onError?:(error:unknown)=>void;
 /** Query durable shared sessions as well as this tab's UI state. */
 isAnySessionActive?:()=>Promise<boolean>;
}
export interface PwaController {
 applyPendingUpdate:(isSessionActive:boolean)=>Promise<boolean>;
 setSessionActive:(active:boolean)=>void;
 dispose:()=>void;
}
const activityPrefix='studyapp:pwa:active-tab:';
const activityLeaseMs=90_000;
const heartbeatMs=15_000;

/** Updates are explicit; a waiting worker never activates automatically. */
export function registerPwa(options:PwaOptions):PwaController {
 let pending=false,active=false,disposed=false,applying=false,storageAvailable=true;
 const key=activityPrefix+crypto.randomUUID();
 let heartbeat:ReturnType<typeof setInterval>|undefined;
 const update=registerSW({immediate:true,onNeedRefresh:()=>{pending=true;options.onUpdateAvailable()},onOfflineReady:options.onOfflineReady,onRegisterError:options.onError});
 function publish(){
  try{if(active&&!disposed)localStorage.setItem(key,String(Date.now()+activityLeaseMs));else localStorage.removeItem(key)}catch(error){storageAvailable=false;options.onError?.(error)}
  if(active&&!disposed&&heartbeat===undefined)heartbeat=setInterval(publish,heartbeatMs);
  else if((!active||disposed)&&heartbeat!==undefined){clearInterval(heartbeat);heartbeat=undefined}
 }
 function release(){if(heartbeat!==undefined){clearInterval(heartbeat);heartbeat=undefined}try{localStorage.removeItem(key)}catch{storageAvailable=false}}
 function anyTabActive(){
  try{for(let i=0;i<localStorage.length;i++){
   const tabKey=localStorage.key(i);if(!tabKey?.startsWith(activityPrefix))continue;
   const expires=Number(localStorage.getItem(tabKey));
   // Older clients used a non-expiring marker; stay conservative without the durable check.
   if(!Number.isFinite(expires)||expires>Date.now())return true;
  }return false}catch{return true}
 }
 window.addEventListener('pagehide',release);
 window.addEventListener('pageshow',publish);
 return {
  setSessionActive(value){active=value;publish()},
  async applyPendingUpdate(isSessionActive){
   if(disposed||!pending||applying||isSessionActive||active)return false;
   applying=true;
   try{
    if(options.isAnySessionActive){
     // IndexedDB is shared across tabs and remains authoritative after a process is killed.
     if(await options.isAnySessionActive())return false;
     if(active||disposed||await options.isAnySessionActive())return false;
    }else if(!storageAvailable||anyTabActive())return false;
    if(active||disposed)return false;
    await update(true);
    pending=false;
    return true;
   }finally{applying=false}
  },
  dispose(){disposed=true;release();window.removeEventListener('pagehide',release);window.removeEventListener('pageshow',publish)},
 };
}
