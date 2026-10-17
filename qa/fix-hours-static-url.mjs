import {readFileSync,writeFileSync} from 'node:fs';const f='work/business-hours-static-qa.mjs';writeFileSync(f,readFileSync(f,'utf8').replace('127.0.0.1:4174/?','127.0.0.1:4174/cloud-pet-demo/?'));
