import {build} from 'esbuild';
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const emit=async options=>{const result=await build({...options,write:false});for(const file of result.outputFiles){await mkdir(dirname(file.path),{recursive:true});await writeFile(file.path,file.contents);}};
await emit({entryPoints:["client.ts"],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:"./dist/webui.js",minify:true,logLevel:'warning'});
await emit({entryPoints:["addon-client.ts"],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:"./dist/addon.js",minify:true,logLevel:'warning'});
