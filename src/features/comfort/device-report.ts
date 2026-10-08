export const deviceChecks=[
 {id:'install',title:'Installation',text:'Install on your actual phone, open from its home screen, and record whether standalone mode works.'},
 {id:'offline',title:'Offline use',text:'Disable Wi-Fi and mobile data, reopen the installed app, complete practice and reopen the result.'},
 {id:'lock',title:'Lock and resume',text:'Lock the phone during a session; unlock and check answer, reading position and any original deadline.'},
 {id:'storage',title:'Storage persistence',text:'Close and reopen the app and check saved answers, notes and preferences.'},
 {id:'backup',title:'Backup and recovery',text:'Export to device files, inspect the file, download recovery, restore, and check personal history.'},
 {id:'cross-browser',title:'Cross-browser restore',text:'Transfer a backup to another browser and restore. Imported content must not invent human approval.'},
 {id:'accessibility',title:'Screen reader',text:'Use the actual phone screen reader (VoiceOver on iOS) for an entire session, explanations and backup controls.'},
 {id:'text',title:'Large text',text:'Increase app and system text size and verify content remains readable without clipping.'},
 {id:'layout',title:'Touch and layout',text:'Check portrait/landscape, enlarged controls, focus and ordering/matching without dragging.'},
 {id:'performance',title:'Load and performance',text:'Record cold load and offline reopen behaviour on your real device, including any delays or failures.'},
];
export type DeviceResult='passed'|'failed'|'not-tested';
export interface DeviceReport{model:string;os:string;browser:string;testedOn:string;checks:Record<string,{status:DeviceResult;recordedAt:string;notes:string;assertedBy:'user'}>}
export function emptyDeviceReport():DeviceReport{return {model:'',os:'',browser:'',testedOn:'',checks:{}}}
export function normaliseDeviceReport(input:unknown):DeviceReport{let report=emptyDeviceReport();if(!input||typeof input!=='object'||Array.isArray(input))return report;const value=input as Record<string,unknown>;for(const key of ['model','os','browser','testedOn'] as const)if(typeof value[key]==='string')report[key]=value[key].slice(0,200);if(report.testedOn&&!/^\d{4}-\d{2}-\d{2}$/.test(report.testedOn))report.testedOn='';if(value.checks&&typeof value.checks==='object'&&!Array.isArray(value.checks)){for(const check of deviceChecks){const record=(value.checks as Record<string,unknown>)[check.id];if(!record||typeof record!=='object')continue;const row=record as Record<string,unknown>;if(row.assertedBy==='user'&&(row.status==='passed'||row.status==='failed')&&typeof row.recordedAt==='string'&&Number.isFinite(Date.parse(row.recordedAt)))report=recordDeviceCheck(report,check.id,row.status,row.recordedAt,typeof row.notes==='string'?row.notes:'')}}return report}
export function recordDeviceCheck(report:DeviceReport,id:string,status:DeviceResult,recordedAt:string,notes:string){if(!deviceChecks.some(c=>c.id===id)||!Number.isFinite(Date.parse(recordedAt))||!['passed','failed','not-tested'].includes(status))throw Error('Invalid device check');const checks={...report.checks};if(status==='not-tested')delete checks[id];else checks[id]={status,recordedAt,notes:notes.slice(0,2000),assertedBy:'user'};return {...report,checks}}
