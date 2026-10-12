const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
fs.mkdirSync(dist,{recursive:true});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const assets=new Set(['index.html',...Array.from(html.matchAll(/(?:src|href)="([\w.-]+\.(?:js|css))"/g),match=>match[1])]);
// Copier seulement les sources nécessaires : aucun carnet, cache ou fichier de test.
for(const file of assets)fs.copyFileSync(path.join(root,file),path.join(dist,file));
console.log('Interface embarquée : '+assets.size+' fichiers.');
