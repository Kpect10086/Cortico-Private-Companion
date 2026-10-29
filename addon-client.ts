import type {WebUiClientBundle} from 'cortico/web/shared/client-panel.ts';
import type {WebUiPanel} from 'cortico/web/shared/client-panel.ts';
const panel=(configuration:boolean):WebUiPanel=>({mount(ctx){
  const status=ctx.ui.msgline();status.setAttribute('role','status');ctx.root.append(status);
  void ctx.invoke<{url?:string;title:string}>('launch').then(({url,title})=>{
    if(ctx.signal.aborted)return;
    if(!url){status.textContent='兼容宿主尚未就绪，请查看运行诊断。';return;}
    const label=configuration?'全部原版配置':'原版页面';
    const link=ctx.ui.h('a',null,'在独立窗口打开'+title+' · '+label);link.href=url;link.target='_blank';link.rel='noopener noreferrer';
    const frame=ctx.ui.h('iframe');frame.src=url;frame.title=title+' · '+label;frame.style.width='100%';frame.style.height='calc(100vh - 210px)';frame.style.minHeight='650px';frame.style.border='0';
    ctx.root.append(link,frame);
  }).catch(error=>{status.textContent=String(error);});
}});
const bundle:WebUiClientBundle={panels:{original:panel(false),configuration:panel(true)}};
export default bundle;
