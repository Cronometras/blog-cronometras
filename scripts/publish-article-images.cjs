const fs = require('node:fs');
const admin = require('firebase-admin');
async function main() {
 const patches=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 admin.initializeApp({credential:admin.credential.cert(JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'sa.json','utf8')))});
 const db=admin.firestore(), col=db.collection('articulos_cronometras');
 const before=await col.get();const original=new Map(before.docs.map(d=>[d.id,d.data()]));
 if(new Set(patches.map(x=>x.id)).size!==patches.length)throw Error('Duplicate patches');
 for(const p of patches){
  const old=original.get(p.id);if(!old)throw Error('Missing article '+p.id);
  if((old.imageUrl??null)!==p.previousImageUrl)throw Error('Image changed since review '+p.id);
  if(!p.imageUrl.startsWith('/images/blog/generated/')&&!p.recoveredCover)throw Error('Unexpected destination');
 }
 console.log(JSON.stringify({reviewed:patches.length,execute:process.argv.includes('--execute')}));
 if(!process.argv.includes('--execute'))return;
 const batch=db.batch();for(const p of patches)batch.update(col.doc(p.id),{imageUrl:p.imageUrl});await batch.commit();
 const after=await col.get();const values=new Map(after.docs.map(d=>[d.id,d.data()]));const updates=new Map(patches.map(p=>[p.id,p]));
 for(const[id,old]of original){const current=values.get(id),p=updates.get(id);if(!current)throw Error('Article disappeared');
  const expected={...old,...(p?{imageUrl:p.imageUrl}:{})};
  for(const k of new Set([...Object.keys(expected),...Object.keys(current)]))if(JSON.stringify(expected[k])!==JSON.stringify(current[k]))throw Error('Unexpected field change '+id+'/'+k);
 }
 console.log(JSON.stringify({updated:patches.length,articlesVerified:values.size,otherFieldsPreserved:true}));
}
main().then(()=>process.exitCode=0).catch(e=>{console.error(e.message);process.exitCode=1});
