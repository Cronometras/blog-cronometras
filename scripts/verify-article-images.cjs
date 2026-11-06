const fs=require('node:fs');const path=require('node:path');const sharp=require('sharp');const cheerio=require('cheerio');
async function main(){
 const manifest=JSON.parse(fs.readFileSync('docs/generated-article-images.json','utf8'));
 const files=[];
 for(const c of manifest.covers){
  const stem=c.file.slice(0,-5);
  for(const width of [480,800,1200]){
   const file=stem+(width===1200?'':'-'+width)+'.webp';const local=path.join('dist',file);const meta=await sharp(local).metadata();
   if(meta.width!==width||meta.height!==Math.round(width*9/16)||meta.format!=='webp'||fs.statSync(local).size>120000)throw Error('Invalid optimized image '+file);
   files.push(file);
  }
 }
 const snapshot=JSON.parse(fs.readFileSync(process.env.FIRESTORE_ARTICLES_SNAPSHOT_PATH,'utf8').replace(/^\uFEFF/,''));let pages=0;
 const matches=snapshot.filter(x=>x.imageUrl?.startsWith('/images/blog/generated/'));
 for(const d of matches){
  let slug=d.slug;if(!slug){slug=d.language+'/'+d.topic.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9_\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');}
  const [lang,...parts]=slug.split('/');const html=fs.readFileSync(path.join('dist',lang,'blog',...parts,'index.html'),'utf8');const $=cheerio.load(html);
  const hero=$('img').filter((_,el)=>$(el).attr('src')?.endsWith(d.imageUrl)).first();
  if(!hero.length||!hero.attr('alt')||hero.attr('loading')!=='eager'||hero.attr('fetchpriority')!=='high')throw Error('Hero attributes missing '+slug);
  if(!hero.closest('picture').find('source').attr('srcset')?.includes('480w'))throw Error('Responsive hero missing '+slug);
  if(!$('meta[property="og:image"]').attr('content')?.endsWith(d.imageUrl))throw Error('Social cover missing '+slug);
  pages++;
 }
 if(pages!==manifest.covers.length*2)throw Error('Missing translated cover');
 const listingFiles=['dist/en/blog/index.html',...fs.readdirSync('dist/en/blog/page').map(n=>path.join('dist/en/blog/page',n,'index.html'))];
 let responsiveCards=0;
 for(const f of listingFiles){const index=cheerio.load(fs.readFileSync(f,'utf8'));index('img').filter((_,el)=>index(el).attr('src')?.startsWith('/images/blog/generated/')).each((_,el)=>{const card=index(el);if(!card.attr('srcset')?.includes('480w')||card.attr('loading')!=='lazy'||!card.attr('width'))throw Error('Responsive card missing '+f);responsiveCards++;});}
 if(responsiveCards<manifest.covers.length)throw Error('Covers missing in listings');
 let listingArticles=0;
 for(const lang of ['es','en']){
  const listingFiles=[`dist/${lang}/blog/index.html`,...fs.readdirSync(`dist/${lang}/blog/page`).map(n=>path.join('dist',lang,'blog/page',n,'index.html'))];
  const links=new Set();for(const f of listingFiles){const $=cheerio.load(fs.readFileSync(f,'utf8'));$('a[href]').each((_,a)=>links.add($(a).attr('href').replace(/\/$/,'')));}
  for(const href of links){if(href.startsWith('/'+lang+'/blog/category/')){const local=path.join('dist',decodeURIComponent(href),'index.html');if(!fs.existsSync(local))throw Error('Missing category destination '+href);}}
  for(const d of snapshot.filter(x=>x.language===lang&&x.status==='completed'&&!x.draft)){
   const slug=d.slug||lang+'/'+d.topic.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9_\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
   const target='/'+lang+'/blog/'+slug.split('/').slice(1).join('/');
   if(!links.has(target))throw Error('Article absent from listings '+target);listingArticles++;
  }
 }
 console.log(JSON.stringify({covers:manifest.covers.length,variants:files.length,pagesVerified:pages,listingArticles,responsiveCards:true}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
