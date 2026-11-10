const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = readFileSync('public/scripts/hero-copy-experiment.js','utf8');
function page({ consent=true, random=0, storage=new Map(), preview='', home=true, blocked=false, now=Date.now() }={}) {
 const events=[], listeners={}, docListeners={};
 const paragraph=home ? {innerHTML:'Original <b>Multi Crono</b>'} : null;
 if(consent!==null) storage.set('consent-choice-v2',JSON.stringify({analytics:consent,expires:now+86400000}));
 const context={Uint32Array, Date:class extends Date {static now(){return now;}}, URLSearchParams,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);},removeItem:k=>storage.delete(k)},
 crypto:{getRandomValues:a=>{a[0]=random;return a;}},location:{search:preview,pathname:home?'/es/':'/es/caracteristicas'},
 document:{getElementById:()=>paragraph,addEventListener:(k,fn)=>docListeners[k]=fn},
 window:{gtag:(...args)=>events.push(args),addEventListener:(k,fn)=>listeners[k]=fn}};
 vm.runInNewContext(code,context);
 return {paragraph,events,listeners,docListeners,storage,context};
}
let a=page(); assert.equal(a.events[0][2].experiment_variant,'A');
let b=page({random:4294967295}); assert.equal(b.events[0][2].experiment_variant,'B'); assert.match(b.paragraph.innerHTML,/Registra los tiempos/);
let repeat=page({storage:b.storage,random:0}); assert.equal(repeat.events[0][2].experiment_variant,'B');
let denied=page({consent:false}); assert.equal(denied.events.length,0); assert.equal(denied.storage.has('ab:cronometras_hero_copy_v1'),false);
denied.storage.set('consent-choice-v2',JSON.stringify({analytics:true,expires:Date.now()+100000})); denied.listeners['analytics-consent-change']({detail:{analytics:true}}); assert.equal(denied.events.length,1);
denied.listeners['analytics-consent-change']({detail:{analytics:true}});assert.equal(denied.events.length,1);
denied.storage.set('consent-choice-v2',JSON.stringify({analytics:false,expires:Date.now()+100000}));denied.listeners['analytics-consent-change']({detail:{analytics:false}});assert.equal(denied.storage.has('ab:cronometras_hero_copy_v1'),false);assert.match(denied.paragraph.innerHTML,/Original/);
let preview=page({preview:'?ab_preview=B'});assert.match(preview.paragraph.innerHTML,/Registra/);preview.listeners['demo-request-saved']();assert.equal(preview.events.length,0);assert.equal(preview.storage.has('ab:cronometras_hero_copy_v1'),false);
let other=page({home:false,storage:b.storage});assert.equal(other.events.length,0);other.listeners['demo-request-saved']();assert.equal(other.events[0][1],'ab_demo_success');assert.equal(other.events[0][2].experiment_variant,'B');
let freshOther=page({home:false});freshOther.listeners['demo-request-saved']();assert.equal(freshOther.events.length,0);
let expired=page({now:Date.parse('2027-01-06T00:00:00Z')});assert.equal(expired.events.length,0);assert.match(expired.paragraph.innerHTML,/Original/);
let blocked=page({blocked:true});assert.equal(blocked.events.length,0);
assert.match(readFileSync('src/components/react/RequestDemoForm.tsx','utf8'),/if \(response.ok && data.success === true\) \{\s+window.dispatchEvent\(new CustomEvent\('demo-request-saved'\)\)/);
console.log('PASS: assignment A/B, stable return, consent grant/revoke, preview exclusion, cross-page conversion, nonparticipants, expiry, blocked storage, confirmed-success hook');
