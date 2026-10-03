import {defineConfig} from 'vite';
import {copyFileSync} from 'node:fs';
export default defineConfig({base:'./',publicDir:false,plugins:[{name:'copy-approved-static-files',closeBundle(){for(const f of ['privacy.html','config.js'])copyFileSync(f,'dist/'+f);}}]});
