import type {WorldDefinition} from 'cortico/world.ts';
import type {ToolDef} from 'cortico/core/types.ts';
import {companionHost} from './index.ts';

export function addonWorld(options:{id:string;label:string;plugin:'content'|'memewiki';tools:Omit<ToolDef,'handler'>[]}):WorldDefinition{
  const tools=options.tools.map(tool=>({...tool,parameters:{...tool.parameters,properties:{...(tool.parameters.properties as Record<string,unknown>),target:{type:'string',description:'仅多会话同批时填写本批会话地址。'}}}}));
  return {id:options.id,label:options.label,defaults:()=>({enabled:false}),describe:{tools,events:[]},create(ctx){
    let enabled=ctx.cfg.enabled;
    return {id:options.id,envPromptVars:()=>null,
      tools:()=>tools.map(schema=>({...schema,handler:async(args,call)=>{
        const host=companionHost(ctx.botDir);
        if(!enabled||!host?.status().ready)throw Error('原版扩展尚未启动，请检查兼容宿主。');
        const tool=host.tools().find(tool=>tool.name===schema.name);if(!tool)throw Error('Original addon tool is unavailable');
        return tool.handler(args,call);
      }})),
      async start(){enabled=true;await companionHost(ctx.botDir)?.activateAddon?.(options.plugin,true);},
      async stop(){enabled=false;await companionHost(ctx.botDir)?.activateAddon?.(options.plugin,false);},
      webUi:()=>({label:options.label,lamps:[{label:'原版兼容宿主',state:enabled&&companionHost(ctx.botDir)?.status().ready?'online':'offline'}],
        panels:[{id:'original',title:options.plugin==='content'?'原版创作与 QQ 空间':'原版自定义黑话',getMethods:['launch']},
          {id:'configuration',title:'全部原版配置',getMethods:['launch']}],
        async invoke(panel,method){
          if(!['original','configuration'].includes(panel)||method!=='launch')throw Error('Unknown addon panel operation');
          return {url:companionHost(ctx.botDir)?.launchUrl(options.plugin,panel==='configuration'?'config':undefined),title:options.label};
        },
      }),
    };
  }};
}
