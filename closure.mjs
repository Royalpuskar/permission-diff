// Permission implications are supplied facts, never inferred provider semantics.
export function compareClosure(input) {
 const text=v=>typeof v==='string'&&v.trim()===v&&v.length>0&&v.length<=100;
 const list=v=>Array.isArray(v)&&v.length<=200&&v.every(text);
 if(!input||Array.isArray(input)||typeof input!=='object'||JSON.stringify(input).length>100000)throw Error('Expected a model of at most 100000 serialized characters.');
 const {before,after,implications}=input;
 if(!list(before)||!list(after)||!Array.isArray(implications)||implications.length>500||implications.some(r=>!r||!text(r.from)||!text(r.to)))throw Error('Use at most 200 grants per side and 500 valid implication pairs; labels must be trimmed, 1–100 characters.');
 const states=new Set([...before,...after,...implications.flatMap(r=>[r.from,r.to])]);
 if(states.size>300)throw Error('At most 300 distinct permission labels are supported.');
 const edges=new Map();for(const {from,to} of implications){if(!edges.has(from))edges.set(from,new Set());edges.get(from).add(to);}
 const sorted=v=>[...v].sort();
 function expand(grants){const paths=new Map(),queue=sorted(new Set(grants));queue.forEach(g=>paths.set(g,[g]));for(let i=0;i<queue.length;i++){const from=queue[i];for(const to of sorted(edges.get(from)||[])){if(!paths.has(to)){paths.set(to,[...paths.get(from),to]);queue.push(to);}}}return paths;}
 const left=expand(before),right=expand(after),b=new Set(before),a=new Set(after);
 const rows=sorted(new Set([...left.keys(),...right.keys()])).map(permission=>({permission,change:left.has(permission)?right.has(permission)?'retained':'removed':'added',beforePath:left.get(permission)||null,afterPath:right.get(permission)||null,beforeDirect:b.has(permission),afterDirect:a.has(permission)}));
 return {metrics:{added:rows.filter(r=>r.change==='added').length,removed:rows.filter(r=>r.change==='removed').length,retained:rows.filter(r=>r.change==='retained').length},direct:{added:sorted([...a].filter(p=>!b.has(p))),removed:sorted([...b].filter(p=>!a.has(p)))},rows,retainedAfterDirectRemoval:rows.filter(r=>b.has(r.permission)&&!a.has(r.permission)&&right.has(r.permission)).map(r=>r.permission)};
}
