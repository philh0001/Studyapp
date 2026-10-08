import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expect,it} from 'vitest';
// @ts-expect-error executable JS tooling is independently tested
import {measureRouteAssets} from '../../scripts/measure-route-assets.mjs';
it('measures static entry dependencies separately from deferred offline feature code',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'route-assets-'));try{await mkdir(join(dir,'assets'));await writeFile(join(dir,'index.html'),'<script type="module" src="/assets/index.js"></script><link rel="modulepreload" href="/assets/vendor.js">');await writeFile(join(dir,'assets/index.js'),'import{a}from"./bank.js";import("./audit.js");');await writeFile(join(dir,'assets/bank.js'),'import"./vendor.js";export const a=1;');await writeFile(join(dir,'assets/vendor.js'),'export const vendor=1;');await writeFile(join(dir,'assets/audit.js'),'export const deferred=1;');const report=await measureRouteAssets(dir);expect(report.files.map((file:{file:string})=>file.file)).toEqual(['assets/bank.js','assets/index.js','assets/vendor.js']);expect(report.deferredFiles).toEqual(['assets/audit.js']);expect(report.initialBytes).toBeGreaterThan(0);expect(report.method).toContain('not measured HTTP transfer')}finally{await rm(dir,{recursive:true,force:true})}
});
