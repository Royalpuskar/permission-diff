import {compareClosure} from './closure.mjs';
const $=id=>document.getElementById(id);let report=null;
const add=(tag,text,parent)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
const lines=s=>s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
function invalidate(){report=null;$('download').disabled=true;$('summary').textContent='';$('retained').hidden=true;$('evidence').replaceChildren();$('status').textContent='Inputs changed. Review again to update the evidence.';}
function render(){
 $('evidence').replaceChildren();if(!report)return;
 const rows=report.result.rows.filter(r=>$('filter').value==='all'||r.change===$('filter').value);
 for(const row of rows){const entry=add('article','',$('evidence'));entry.className='entry';const name=add('div','',entry);add('h3',row.permission,name);add('span',row.change,name).className='badge';for(const side of ['before','after']){const p=add('div','',entry);p.className='path';add('small',side.toUpperCase()+(row[side+'Direct']?' · DIRECT':' · IMPLIED / ABSENT'),p);add('span',row[side+'Path']?.join(' → ')||'No reachable grant',p);}}
 if(!rows.length)add('p','No permissions match this view.',$('evidence'));
}
$('compare').onclick=()=>{invalidate();try{
 if(['before','after','rules'].reduce((n,id)=>n+$(id).value.length,0)>100000)throw Error('Input exceeds 100000 characters.');
 const input={before:lines($('before').value),after:lines($('after').value),implications:lines($('rules').value).map((line,i)=>{const parts=line.split(/→|=>/).map(s=>s.trim());if(parts.length!==2||parts.some(s=>!s))throw Error(`Rule ${i+1} needs one parent → child pair.`);return {from:parts[0],to:parts[1]};})};
 const result=compareClosure(input);report={input,result};$('download').disabled=false;$('status').textContent='Review complete. Results apply only to these declared implications.';
 $('summary').textContent=`${result.metrics.added} effective additions · ${result.metrics.removed} effective removals · ${result.metrics.retained} retained. Direct changes: +${result.direct.added.length} / −${result.direct.removed.length}.`;
 $('retained').replaceChildren();if(result.retainedAfterDirectRemoval.length){$('retained').hidden=false;add('strong','Removed directly, still reachable',$('retained'));add('p',result.retainedAfterDirectRemoval.join(', '),$('retained'));}render();
 }catch(e){$('status').textContent=e.message;}};
for(const id of ['before','after','rules'])$(id).addEventListener('input',invalidate);$('filter').onchange=render;
$('reset').onclick=()=>{$('before').value='workspace:admin\nfiles:read';$('after').value='workspace:admin\nnetwork:connect';$('rules').value='workspace:admin → files:write\nfiles:write → files:read';$('filter').value='all';$('compare').click();};
$('download').onclick=()=>{if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='permission-scope-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};$('reset').click();
