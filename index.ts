import type {WorldDefinition} from 'cortico/world.ts';
import type {ToolDef} from 'cortico/core/types.ts';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';

type Host={status:()=>Record<string,unknown>;launchUrl:(plugin?:'companion'|'content'|'memewiki',view?:'config')=>string|undefined;tools:()=>ToolDef[];activate:(enabled:boolean)=>Promise<void>;activateAddon?:(plugin:'content'|'memewiki',enabled:boolean)=>Promise<void>};
type Entry={host?:Host;enabled:boolean};
// Local installs and dependency installs may resolve separate copies of this module.
const registryKey=Symbol.for('cortico.astrbot-companion.hosts.v1');
const registry=globalThis as typeof globalThis & {[registryKey]?:Map<string,Entry>};
const entries=registry[registryKey]??=new Map<string,Entry>();
const entry=(directory:string)=>{const key=resolve(directory);let value=entries.get(key);if(!value){value={enabled:false};entries.set(key,value);}return value;};
export const companionIsEnabled=(directory:string)=>entry(directory).enabled;
export const companionHost=(directory:string)=>entry(directory).host;
export function bindCompanion(directory:string,host:Host){entry(directory).host=host;return ()=>{const current=entry(directory);if(current.host===host)delete current.host;};}

const schemas=JSON.parse(readFileSync(new URL('./native-tools.json',import.meta.url),'utf8')) as Array<{name:string;description:string;parameters:Record<string,any>}>;
const tools=schemas.filter(tool=>tool.name.startsWith('pc_')).map(tool=>({...tool,tags:[tool.name.startsWith('pc_send')||tool.name==='pc_relay_message'||tool.name.startsWith('pc_qzone_publish')||tool.name.startsWith('pc_qzone_reply')?'speak':/note_create|note_delete|pc_manage|pc_set|generate_photo/.test(tool.name)?'write':'read'] as ToolDef['tags'],parameters:{...tool.parameters,
  properties:{...tool.parameters.properties,target:{type:'string',description:'仅多会话同批时填写本批会话地址。'}}}}));
const definition:WorldDefinition={id:'private-companion',label:'我会永远陪着你',defaults:()=>({enabled:false}),
  describe:{tools,events:[]},create(ctx){
    const state=entry(ctx.botDir);state.enabled=ctx.cfg.enabled;
    return {id:'private-companion',envPromptVars:()=>null,
      tools:()=>tools.map(schema=>({...schema,handler:async(args,call)=>{
        const host=state.host;if(!state.enabled||!host)throw Error('陪伴扩展尚未启动，请使用已整合的记忆扩展');
        const tool=host.tools().find(tool=>tool.name===schema.name);if(!tool)throw Error('原版陪伴工具当前不可用');
        return tool.handler(args,call);
      }})),
      async start(){state.enabled=true;if(state.host)await state.host.activate(true);},
      async stop(){state.enabled=false;if(state.host)await state.host.activate(false);},
      webUi:()=>({label:'我会永远陪着你',lamps:[{label:'原版陪伴引擎',state:state.enabled&&state.host?.status().ready?'online':'offline'}],
        panels:[{id:'original',title:'原版陪伴面板',getMethods:['launch']}],
        async invoke(panel,method){if(panel!=='original'||method!=='launch')throw Error('Unknown companion panel operation');
          if(!state.enabled)throw Error('陪伴扩展已停用');return {url:state.host?.launchUrl()};},
      }),
    };
  }};
export default definition;
