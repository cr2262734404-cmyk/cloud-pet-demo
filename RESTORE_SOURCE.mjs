import {cpSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const dest=join(root,'source','dist','assets');
mkdirSync(dest,{recursive:true});cpSync(join(root,'assets'),dest,{recursive:true,force:false});console.log('Assets restored without overwriting existing files. Run: cd source; node server.mjs');
