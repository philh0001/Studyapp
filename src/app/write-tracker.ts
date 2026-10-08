/** Each channel writes complete replacement state; its newest result controls retry status. */
export class WriteTracker{
 readonly pending=new Set<Promise<void>>();
 private sequence=0;
 private latest=new Map<string,number>();
 private failures=new Set<string>();
 get failed(){return this.failures.size>0}
 saved(channel:string){this.failures.delete(channel)}
 track(write:Promise<void>,channel='answer'){
  const sequence=++this.sequence;this.latest.set(channel,sequence);this.pending.add(write);
  void write.then(()=>{if(this.latest.get(channel)===sequence)this.failures.delete(channel)},()=>{if(this.latest.get(channel)===sequence)this.failures.add(channel)}).finally(()=>this.pending.delete(write));
  return write;
 }
 async settled(){while(this.pending.size)await Promise.allSettled([...this.pending])}
}
