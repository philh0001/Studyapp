import {fetch,EnvHttpProxyAgent} from 'undici';
import {mkdir,writeFile} from 'node:fs/promises';
const dispatcher=new EnvHttpProxyAgent();
const paths={guide:'credentials/certifications/resources/study-guides/az-104',rbac:'azure/role-based-access-control/overview',policy:'azure/governance/policy/overview',locks:'azure/azure-resource-manager/management/lock-resources',redundancy:'azure/storage/common/storage-redundancy',sas:'azure/storage/common/storage-sas-overview',tiers:'azure/storage/blobs/access-tiers-overview',availability:'azure/virtual-machines/availability-set-overview',slots:'azure/app-service/deploy-staging-slots',containers:'azure/container-apps/scale-app',peering:'azure/virtual-network/virtual-network-peering-overview',nsg:'azure/virtual-network/network-security-groups-overview',private:'azure/private-link/private-endpoint-overview',alerts:'azure/azure-monitor/alerts/alerts-overview',logs:'azure/azure-monitor/logs/log-query-overview',backup:'azure/backup/backup-azure-vms-introduction'};
await mkdir('/tmp/studyapp-source-pages',{recursive:true});
const results=[];
for(const [id,path] of Object.entries(paths)){const url='https://learn.microsoft.com/en-us/'+path;try{const response=await fetch(url,{dispatcher});if(response.status!==200||new URL(response.url).hostname!=='learn.microsoft.com')throw Error('HTTP '+response.status);const html=await response.text();await writeFile('/tmp/studyapp-source-pages/'+id+'.html',html);results.push({id,url,status:response.status,checkedAt:new Date().toISOString()});}catch(e){results.push({id,url,error:e.message})}}
await writeFile('/tmp/studyapp-source-pages/index.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
await dispatcher.close();
