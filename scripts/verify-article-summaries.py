import json
from pathlib import Path
from html.parser import HTMLParser
r=Path.cwd();summaries=json.loads((r/'src/data/article-summaries.json').read_text(encoding='utf8'));pairs=json.loads((r/'src/data/blog-translations.json').read_text(encoding='utf8'))
class Page(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.links=[];self.json=False;self.data='';self.schemas=[];self.summary=0
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='h1':self.h1+=1
  if t=='a':self.links.append(d.get('href',''))
  if d.get('id')=='technical-summary':self.summary+=1
  if t=='script' and d.get('type')=='application/ld+json':self.json=True;self.data=''
 def handle_data(self,d):
  if self.json:self.data+=d
 def handle_endtag(self,t):
  if t=='script' and self.json:self.schemas.append(json.loads(self.data));self.json=False
for pair in pairs:
 for lang in ['es','en']:
  route=pair[lang];html=(r/'dist'/route.strip('/')/'index.html').read_text(encoding='utf8');p=Page();p.feed(html)
  assert p.h1==1 and '/'+lang+'/about/' in p.links,route
  schema=next(x for x in p.schemas if x.get('@type')=='BlogPosting');assert schema['author']['@type']=='Organization' and schema['author']['url'].endswith('/'+lang+'/about/'),route
  summary=summaries.get(route)
  if summary:
   assert p.summary==1 and summary['question'] in html and summary['answer'] in html,route
   assert all(s['url'] in p.links for s in summary['sources']),route
print(json.dumps({'articleAuthorsVerified':len(pairs)*2,'localizedSummaries':len(summaries),'oneH1':True,'sourcesLinked':True}))
