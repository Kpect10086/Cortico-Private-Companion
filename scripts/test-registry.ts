import assert from 'node:assert/strict';
import definition, {bindCompanion,companionHost,companionIsEnabled} from '../index.ts';
import type {WorldContext} from 'cortico/world.ts';
const duplicate=await import(new URL('../index.ts?separate-install',import.meta.url).href);
const directory='fixture-deployment';
const activations:boolean[]=[];
const host={status:()=>({ready:true}),launchUrl:()=>undefined,tools:()=>[],activate:async(enabled:boolean)=>{activations.push(enabled);}};
const unbind=bindCompanion(directory,host);
try{
  assert.equal(duplicate.companionHost(directory),host);
  const world=definition.create({botDir:directory,cfg:{enabled:false}} as WorldContext);
  await world.start?.({} as never);
  assert.equal(duplicate.companionIsEnabled(directory),true);
  await world.stop?.();
  assert.equal(companionIsEnabled(directory),false);
  assert.deepEqual(activations,[true,false]);
}finally{unbind();}
assert.equal(companionHost(directory),undefined);
assert.equal(duplicate.companionHost(directory),undefined);
console.log('PASS: separately resolved port packages share one deployment-scoped host registry');
