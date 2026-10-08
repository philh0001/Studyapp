/** Center text in the space above playback controls; start oversized passages at the top. */
export function speechFollowScroll(top:number,bottom:number,controlsTop:number):number{
 const safeTop=16,safeBottom=Math.max(40,controlsTop-16);
 if(top>=safeTop&&bottom<=safeBottom)return 0;
 const height=Math.max(0,bottom-top),available=safeBottom-safeTop;
 const destination=safeTop+Math.max(0,(available-height)/2);
 return top-destination;
}
