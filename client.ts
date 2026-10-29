import type {WebUiClientBundle} from 'cortico/web/shared/client-panel.ts';
const bundle:WebUiClientBundle={panels:{original:{mount(ctx){
  const status=ctx.ui.msgline();status.setAttribute('role','status');ctx.root.append(status);
  void ctx.invoke<{url?:string}>('launch').then(({url})=>{
    if(ctx.signal.aborted)return;
    if(!url){status.textContent='原版陪伴引擎尚未就绪，请查看运行诊断。';return;}
    const link=ctx.ui.h('a',null,'在独立窗口打开原版陪伴面板与全部设置');link.href=url;link.target='_blank';link.rel='noopener noreferrer';
    const frame=ctx.ui.h('iframe');frame.src=url;frame.title='我会永远陪着你 · 原版陪伴面板';
    frame.style.width='100%';frame.style.height='calc(100vh - 210px)';frame.style.minHeight='650px';frame.style.border='0';ctx.root.append(link,frame);
  }).catch(error=>{status.textContent=String(error);});
}}}};export default bundle;
