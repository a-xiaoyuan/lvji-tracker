var se=Object.defineProperty;var oe=(r,e,t)=>e in r?se(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var h=(r,e,t)=>oe(r,typeof e!="symbol"?e+"":e,t);const le=["DejaVuSansMono-Bold.ttf","DejaVuSansMono-BoldOblique.ttf","DejaVuSansMono-Oblique.ttf","DejaVuSansMono.ttf","LibertinusSerif-Bold.otf","LibertinusSerif-BoldItalic.otf","LibertinusSerif-Italic.otf","LibertinusSerif-Regular.otf","LibertinusSerif-Semibold.otf","LibertinusSerif-SemiboldItalic.otf","NewCM10-Bold.otf","NewCM10-BoldItalic.otf","NewCM10-Italic.otf","NewCM10-Regular.otf","NewCMMath-Bold.otf","NewCMMath-Book.otf","NewCMMath-Regular.otf"],ce=["InriaSerif-Bold.ttf","InriaSerif-BoldItalic.ttf","InriaSerif-Italic.ttf","InriaSerif-Regular.ttf","Roboto-Regular.ttf","NotoSerifCJKsc-Regular.otf"],me=["TwitterColorEmoji.ttf","NotoColorEmoji-Regular-COLR.subset.ttf"];function de(){return G([],{assets:!1})}function he(r){return G([],r)}function ue(r){var t,n;const e=[];if(r&&(r==null?void 0:r.assets)!==!1&&((t=r==null?void 0:r.assets)!=null&&t.length)&&((n=r==null?void 0:r.assets)==null?void 0:n.length)>0){let i={text:"https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/",_:"https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/"},a=r.assetUrlPrefix??i;typeof a=="string"?a={_:a}:a={...i,...a};for(const s of Object.keys(a)){const l=a[s];l[l.length-1]!=="/"&&(a[s]=l+"/")}const o=(s,l)=>l.map(c=>(a[s]||a._)+c);for(const s of r.assets)switch(s){case"text":e.push(...o(s,le));break;case"cjk":e.push(...o(s,ce));break;case"emoji":e.push(...o(s,me));break}}return e}function G(r,e){const t=ue(e),n=async(i,{ref:a,builder:o})=>{e!=null&&e.fetcher&&a.setFetcher(e.fetcher),await a.loadFonts(o,[...r,...t])};return n._preloadRemoteFontOptions=e,n._kind="fontLoader",n}function C(r){return async(e,{builder:t})=>new Promise(n=>{t.set_package_registry(r,function(i){return r.resolve(i,this)}),n()})}function B(r){return async(e,t)=>{var n;if(t.alreadySetAccessModel)throw new Error(`already set some assess model before: ${(n=t.alreadySetAccessModel.constructor)==null?void 0:n.name}(${t.alreadySetAccessModel})`);return t.alreadySetAccessModel=r,new Promise(i=>{t.builder.set_access_model(r,a=>{const o=r.getMTime(a);return o?o.getTime():0},a=>r.isFile(a)||!1,a=>r.getRealPath(a)||a,a=>r.readAll(a)),i()})}}class pe{constructor(){h(this,"loadedFonts",new Set);h(this,"fetcher",fetch)}setFetcher(e){this.fetcher=e}async loadFonts(e,t){const n=new Function("m","return import(m)"),i=this.fetcher||(this.fetcher=await(async function(){const{fetchBuilder:s,FileSystemCache:l}=await n("node-fetch-cache"),c=new l({cacheDirectory:".cache/typst/fonts"}),m=s.withCache(c);return function(d,p){const g=setTimeout(()=>{console.warn("font fetching is stucking:",d)},15e3);return m(d,p).finally(()=>{clearTimeout(g)})}})()),a=t.filter(s=>s instanceof Uint8Array||typeof s=="object"&&"info"in s?!0:this.loadedFonts.has(s)?!1:(this.loadedFonts.add(s),!0)),o=await Promise.all(a.map(async s=>{if(s instanceof Uint8Array){await e.add_raw_font(s);return}if(typeof s=="object"&&"info"in s){await e.add_lazy_font(s,"blob"in s?s.blob:Q(s));return}return new Uint8Array(await(await i(s)).arrayBuffer())}));for(const s of o)s&&await e.add_raw_font(s)}async build(e,t,n){const i={ref:this,builder:t,hooks:n};for(const a of(e==null?void 0:e.beforeBuild)??[])await a(void 0,i);return n.latelyBuild&&n.latelyBuild(i),await t.build()}}async function fe(r,e,t,n){var i;return await e.init((i=r==null?void 0:r.getModule)==null?void 0:i.call(r)),await new pe().build(r,new t,n)}function Q(r){return()=>{const e=new XMLHttpRequest;return e.overrideMimeType("text/plain; charset=x-user-defined"),e.open("GET",r.url,!1),e.send(null),e.status===200&&(e.response instanceof String||typeof e.response=="string")?Uint8Array.from(e.response,t=>t.charCodeAt(0)):new Uint8Array}}class H{constructor(){h(this,"mTimes",new Map);h(this,"mData",new Map)}reset(){this.mTimes.clear(),this.mData.clear()}insertFile(e,t,n){this.mTimes.set(e,n),this.mData.set(e,t)}removeFile(e){this.mTimes.delete(e),this.mData.delete(e)}getMTime(e){if(e.startsWith("/@memory/")&&this.mTimes.has(e))return this.mTimes.get(e)}isFile(){return!0}getRealPath(e){return e}readAll(e){if(e.startsWith("/@memory/")&&this.mData.has(e))return this.mData.get(e)}}class L{constructor(e){h(this,"am");h(this,"cache",new Map);this.am=e}resolvePath(e){return`https://packages.typst.org/preview/${e.name}-${e.version}.tar.gz`}pullPackageData(e){const t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",this.resolvePath(e),!1),t.send(null),t.status===200&&(t.response instanceof String||typeof t.response=="string"))return Uint8Array.from(t.response,n=>n.charCodeAt(0))}resolve(e,t){if(e.namespace!=="preview")return;const n=this.resolvePath(e);if(this.cache.has(n))return this.cache.get(n)();const i=this.pullPackageData(e);if(!i)return;const a=`/@memory/fetch/packages/${e.namespace}/${e.name}/${e.version}`,o=[];t.untar(i,(l,c,m)=>{o.push([a+"/"+l,c,new Date(m)])});const s=()=>{for(const[l,c,m]of o)this.am.insertFile(l,c,m);return a};return this.cache.set(n,s),s()}}function ge(r){return Math.random().toString(36).replace("0.","")}const f=Symbol.for("reflexo-obj");var N;(function(r){r[r.PIXEL_PER_PT=3]="PIXEL_PER_PT"})(N||(N={}));const be=r=>{let e=!1,t;return()=>e?t:(e=!0,t=r())};class ye{constructor(e){h(this,"wasmBin");h(this,"initOnce");if(typeof e!="function")throw new Error("initFn is not a function");this.initOnce=be(async()=>{await e(this.wasmBin)})}async init(e){this.wasmBin=e,await this.initOnce()}}var j;(function(r){r[r.vector=0]="vector",r[r.pdf=1]="pdf",r[r._dummy=2]="_dummy"})(j||(j={}));var X;X=f;class Y{constructor(e){h(this,X);this[f]=e}reset(){this[f].reset()}current(){return this[f].current()}setAttachDebugInfo(e){this[f].set_attach_debug_info(e)}}function we(){return new re}var Z;Z=f;class ee{constructor(e){h(this,Z);this[f]=e}compile(e){return this[f].compile(0,M(e==null?void 0:e.diagnostics))}compileHtml(e){return this[f].compile(1,M(e==null?void 0:e.diagnostics))}async query(e){return JSON.parse(this[f].query(0,e.selector,e.field))}title(){return this[f].title(0)}vector(e){return this[f].get_artifact(0,M(e==null?void 0:e.diagnostics))||{}}pdf(e){return this[f].get_artifact(1,M(e==null?void 0:e.diagnostics))||{}}}const te=r=>new ye(async e=>await r.default(e));function ne(){return new F}class re{constructor(){h(this,"fontBuilderJs");h(this,"fontBuilder")}async init(e){var t,n;this.fontBuilderJs=await(((t=e==null?void 0:e.getWrapper)==null?void 0:t.call(e))||import("./wasm-pack-shim-SZEsgprp.js")),await te(this.fontBuilderJs).init((n=e==null?void 0:e.getModule)==null?void 0:n.call(e)),this.fontBuilder=new this.fontBuilderJs.TypstFontResolverBuilder}async getFontInfo(e){return this.fontBuilder.get_font_info(e)}async addFontData(e){this.fontBuilder.add_raw_font(e)}async addLazyFont(e,t){return this.fontBuilder.add_lazy_font(e,t)}async build(e){const t=await this.fontBuilder.build(),n=await e(t);return t.free(),n}}const T=class T{constructor(){h(this,"compiler");h(this,"compilerJs")}async init(e){var c;this.compilerJs=await(((c=e==null?void 0:e.getWrapper)==null?void 0:c.call(e))||import("./wasm-pack-shim-SZEsgprp.js"));const t=this.compilerJs.TypstCompilerBuilder,n={...e||{}},i=n.beforeBuild??(n.beforeBuild=[]),a=i.some(m=>m._preloadRemoteFontOptions!==void 0),o=i.some(m=>{var d;return((d=m._preloadRemoteFontOptions)==null?void 0:d.assets)!==void 0}),s=i.some(m=>{var d;return((d=m._preloadRemoteFontOptions)==null?void 0:d.assets)===!1});if((!a||!o&&!s)&&i.push(G([],{assets:T.defaultAssets})),!i.some(m=>m._kind==="fontLoader"))throw new Error("TypstCompiler: no font loader found, please use font loaders, e.g. loadFonts or preloadSystemFonts");this.compiler=await fe(e,te(this.compilerJs),t,{})}setFonts(e){this.compiler.set_fonts(e)}compile(e){return new Promise(t=>{const n=this.compiler.snapshot(e.root,e.mainFilePath,I(e.inputs));if("incrementalServer"in e){t(n.incr_compile(e.incrementalServer[f],M(e.diagnostics)));return}t(n.get_artifact(e.format||j.vector,M(e.diagnostics)))})}async runWithWorld(e,t){const n=this.compiler.snapshot(e.root,e.mainFilePath,I(e.inputs));let i=await t(new ee(n));return n.free(),i}query(e){return this.runWithWorld(e,async t=>JSON.parse(await t.query(e)))}getSemanticTokenLegend(){return new Promise(e=>{e(this.compiler.get_semantic_token_legend())})}getSemanticTokens(e){return new Promise(t=>{this.compiler.reset(),t(this.compiler.get_semantic_tokens(e.offsetEncoding||"utf-16",e.mainFilePath,e.resultId))})}async withIncrementalServer(e){const t=new Y(this.compiler.create_incr_server());try{return await e(t)}finally{t[f].free()}}async getAst(e){return this.compiler.get_ast(e)}async reset(){await new Promise(e=>{this.compiler.reset(),e(void 0)})}addSource(e,t){if(arguments.length>2)throw new Error("use of addSource(path, source, isMain) is deprecated, please use addSource(path, source) instead");this.compiler.add_source(e,t)}mapShadow(e,t){this.compiler.map_shadow(e,t)}unmapShadow(e){this.compiler.unmap_shadow(e)}resetShadow(){this.compiler.reset_shadow()}renderPageToCanvas(){throw new Error("Please use the api TypstRenderer.renderToCanvas in v0.4.0")}};h(T,"defaultAssets",["text"]);let F=T;ne._impl=F;function I(r){return r?Object.entries(r):void 0}function M(r){switch(r){case"none":return 1;case"unix":return 2;case"full":default:return 3}}var A=Object.freeze({__proto__:null,get CompileFormatEnum(){return j},IncrementalServer:Y,TypstFontBuilderDriver:re,TypstWorld:ee,createTypstCompiler:ne,createTypstFontBuilder:we});const ke=typeof process<"u"&&process.versions!=null&&process.versions.node!=null;class b{constructor(e){h(this,"mainFilePath");h(this,"cc");h(this,"fr");h(this,"ex");h(this,"providers");h(this,"ccOptions");h(this,"exOptions");h(this,"prepareUseOnce");this.cc=(e==null?void 0:e.compiler)||b.buildLocalCompiler,this.fr=(e==null?void 0:e.fontResolver)||b.buildLocalFontResolver,this.ex=(e==null?void 0:e.renderer)||b.buildLocalRenderer,this.mainFilePath="/main.typ",this.providers=[]}setCompiler(e){this.cc=e}async getFontResolver(){return typeof this.fr=="function"?this.fr=await this.fr():this.fr}async getCompiler(){return typeof this.cc=="function"?this.cc=await this.cc():this.cc}async getCompilerReset(){const e=await this.getCompiler();return await e.reset(),e}setRenderer(e){this.ex=e}async getRenderer(){return typeof this.ex=="function"?this.ex=await this.ex():this.ex}use(...e){if(!this.providers)throw new Error("already prepare uses for instances");this.providers.push(...e)}static preloadFontFromUrl(e){return b.preloadFonts([e])}static preloadFontData(e){return b.preloadFonts([e])}static preloadFonts(e){return{key:"access-model",forRoles:["compiler"],provides:[G(e)]}}static disableDefaultFontAssets(){return{key:"access-model",forRoles:["compiler"],provides:[de()]}}static preloadFontAssets(e){return{key:"access-model",forRoles:["compiler"],provides:[he(e)]}}static withAccessModel(e){return{key:"access-model",forRoles:["compiler"],provides:[B(e)]}}static withPackageRegistry(e){return{key:"package-registry",forRoles:["compiler"],provides:[C(e)]}}static fetchPackageRegistry(e){const t=e||new H,n=[...e?[]:[B(t)],C(new L(t))];return{key:"package-registry$fetch",forRoles:["compiler"],provides:n}}static fetchPackageBy(e,t){class n extends L{pullPackageData(a){return t(a,this.resolvePath(a))}}return{key:"package-registry$lambda",forRoles:["compiler"],provides:[C(new n(e))]}}setCompilerInitOptions(e){this.requireIsUninitialized("compiler",this.cc),this.ccOptions=e}setRendererInitOptions(e){this.requireIsUninitialized("renderer",this.ex),this.exOptions=e}setMainFilePath(e){this.mainFilePath=e}getMainFilePath(){return this.mainFilePath}removeTmp(e){return e.mainFilePath.startsWith("/tmp/")?this.unmapShadow(e.mainFilePath):Promise.resolve()}async setFonts(e){const t=await this.getFontResolver();for(const i of e)await t.addLazyFont(i,"blob"in i?i.blob:Q(i),i);const n=await this.getCompiler();await t.build(async i=>n.setFonts(i))}async addSource(e,t){(await this.getCompiler()).addSource(e,t)}async resetShadow(){(await this.getCompiler()).resetShadow()}async mapShadow(e,t){(await this.getCompiler()).mapShadow(e,t)}async unmapShadow(e){(await this.getCompiler()).unmapShadow(e)}async vector(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).compile(t).then(i=>i.result).finally(()=>this.removeTmp(t))}async pdf(e){const t=await this.getCompileOptions(e);return t.format=j.pdf,(await this.getCompilerReset()).compile(t).then(i=>i.result).finally(()=>this.removeTmp(t))}async svg(e){return this.transientRender(e,(t,n)=>t.renderSvg({...e,renderSession:n}))}async canvas(e,t){return this.transientRender(t,(n,i)=>n.renderToCanvas({container:e,...t,renderSession:i}))}async query(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).query({...e,...t}).finally(()=>this.removeTmp(t))}async getSemanticTokenLegend(){return(await this.getCompilerReset()).getSemanticTokenLegend()}async getSemanticTokens(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).getSemanticTokens({mainFilePath:t.mainFilePath,resultId:e.resultId}).finally(()=>this.removeTmp(t))}async getCompileOptions(e){if(e===void 0)return{mainFilePath:this.mainFilePath,diagnostics:"none"};if(typeof e=="string")throw new Error("please specify opts as {mainContent: '...'} or {mainFilePath: '...'}");if("mainFilePath"in e)return{...e,diagnostics:"none"};{const t=`/tmp/${ge()}.typ`;return await this.addSource(t,e.mainContent),{mainFilePath:t,inputs:e.inputs,diagnostics:"none"}}}async getVector(e){if(e&&"vectorData"in e)return e.vectorData;const t=await this.getCompileOptions(e);return(await this.getCompiler()).compile(t).then(n=>n.result).finally(()=>this.removeTmp(t))}async transientRender(e,t){const n=await this.getRenderer();if(!n)throw new Error("does not provide renderer instance");const i=await this.getVector(e);return await n.runWithSession(async a=>(n.manipulateData({renderSession:a,action:"reset",data:i}),t(n,a)))}async prepareUse(){return this.prepareUseOnce?this.prepareUseOnce:this.prepareUseOnce=this.doPrepareUse()}async doPrepareUse(){if(!this.providers)return;const e=await Promise.all(this.providers.map(s=>typeof s=="function"?s():s));if(this.providers=[],S==this&&!e.some(s=>s.key.includes("package-registry")||s.key.includes("access-model")))if(ke){const s=new Function("m","return import(m)");try{const l=new H,{default:c}=await s("sync-request");S.use(b.withAccessModel(l),b.fetchPackageBy(l,(m,d)=>{const p=c("GET",d);if(p.statusCode===200)return p.getBody(void 0)}))}catch{}}else S.use(b.fetchPackageRegistry());const t=await Promise.all(this.providers.map(s=>typeof s=="function"?s():s)),n=this.ccOptions||(this.ccOptions={}),i=n.beforeBuild||(n.beforeBuild=[]),a=this.exOptions||(this.exOptions={}),o=a.beforeBuild||(a.beforeBuild=[]);for(const s of[...e,...t])s.forRoles.includes("compiler")&&(this.requireIsUninitialized("compiler",this.cc),i.push(...s.provides)),s.forRoles.includes("renderer")&&(this.requireIsUninitialized("renderer",this.ex),o.push(...s.provides));this.providers=void 0}requireIsUninitialized(e,t,n){if(t&&typeof t!="function")throw new Error(`${e} has been initialized: ${t}`)}static async buildLocalCompiler(){const{createTypstCompiler:e}=await Promise.resolve().then(function(){return A});await this.prepareUse();const t=e();return await t.init(this.ccOptions),t}static async buildLocalFontResolver(){const{createTypstFontBuilder:e}=await Promise.resolve().then(function(){return A});await this.prepareUse();const t=e();return await t.init(this.ccOptions),t}static async buildGlobalCompiler(){const{createGlobalCompiler:e}=await import("./global-compiler-DJrFC2AB.js"),{createTypstCompiler:t}=await Promise.resolve().then(function(){return A});return await this.prepareUse(),e(t,this.ccOptions)}static async buildLocalRenderer(){const{createTypstRenderer:e}=await import("./renderer-CDsWYN7l.js");await this.prepareUse();const t=e();return await t.init(this.exOptions),t}static async buildGlobalRenderer(){const{createGlobalRenderer:e}=await import("./global-renderer-DUcYUtW_.js"),{createTypstRenderer:t}=await import("./renderer-CDsWYN7l.js");return await this.prepareUse(),e(t,this.exOptions)}}const S=new b({compiler:b.buildGlobalCompiler,renderer:b.buildGlobalRenderer}),u=297,xe=72/25.4,Me=u*4,D=.05,ve=["section-gap","item-gap","paragraph-gap","compact-variants","line-height","font-size"],Pe=[.25,.5,.75,1],y=(r,e,t)=>Math.round((r+(e-r)*t)*1e3)/1e3;function ze(r,e,t,n,i){const a={...r,pageMarginMm:{...r.pageMarginMm},fontFamily:{...r.fontFamily}};switch(n){case"section-gap":a.sectionGapMm=y(e.sectionGapMm,t.sectionGapMm,i);break;case"item-gap":a.itemGapMm=y(e.itemGapMm,t.itemGapMm,i);break;case"paragraph-gap":a.paragraphGapMm=y(e.paragraphGapMm,t.paragraphGapMm,i);break;case"compact-variants":a.compact=i>0?!0:e.compact;break;case"line-height":a.lineHeight=y(e.lineHeight,t.lineHeight,i);break;case"font-size":a.bodyPt=y(e.bodyPt,t.bodyPt,i),a.metaPt=y(e.metaPt,t.metaPt,i),a.headingPt=y(e.headingPt,t.headingPt,i),a.namePt=y(e.namePt,t.namePt,i);break}return a}function Se(r){return r==="compact-variants"}const R={gapScale:1.6,lineHeightDelta:.12,lineHeightMax:1.75};function $(r,e){const t=1+(R.gapScale-1)*e,n=i=>Math.round(i*1e3)/1e3;return{...r,pageMarginMm:{...r.pageMarginMm},fontFamily:{...r.fontFamily},sectionGapMm:n(r.sectionGapMm*t),itemGapMm:n(r.itemGapMm*t),paragraphGapMm:n(r.paragraphGapMm*t),lineHeight:n(Math.min(R.lineHeightMax,r.lineHeight+R.lineHeightDelta*e))}}const je={basic_info:"基本信息",job_intention:"求职意向",education:"教育背景",work:"工作经历",internship:"实习经历",project:"项目经历",skills:"专业技能",research:"科研经历",paper:"论文发表",award:"获奖情况",summary:"自我评价"},v=r=>r!==void 0&&r.trim()!=="";function _e(r){switch(r.type){case"basic_info":return!v(r.data.name);case"job_intention":return![r.data.role,r.data.city,r.data.availability,r.data.salary].some(v);case"skills":return!r.data.categories.some(e=>e.items.some(v))&&!(r.data.notes??[]).some(v);case"summary":return!v(r.data.text);default:return r.data.items.length===0}}function Fe(r,e=new Date){return r.modules.filter(t=>t.visible&&!_e(t)).map(t=>{if(t.type!=="basic_info"||t.data.birthdayAs!=="age")return t;const n=Te(t.data.birthday,e);return n===null?t:{...t,data:{...t.data,birthday:`${n} 岁`}}})}function Te(r,e=new Date){const t=/^(\d{4})-(\d{2})/.exec(r??"");if(!t)return null;const n=(e.getFullYear()-Number(t[1]))*12+(e.getMonth()+1-Number(t[2]));return n<0?null:Math.floor(n/12)}const Ge=/\s(xlink:href|href)\s*=\s*("([^"]*)"|'([^']*)')/gi,Ce=/^(https?:|mailto:|#)/i,Ae=/<image\b[^>]*>/gi,Re=/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i;function E(r,e){return r.replace(Ge,(t,n,i,a,o)=>{const s=(a??o??"").trim();return Ce.test(s)||e&&Re.test(s)?t:` ${n}="#"`})}function Ee(r){let e="",t=0;for(const n of r.matchAll(Ae))e+=E(r.slice(t,n.index),!1)+E(n[0],!0),t=n.index+n[0].length;return e+E(r.slice(t),!1)}function U(r){const t=r.slice(0,4096).match(/<svg\b[^>]*>/);if(!t)throw new Error("SVG 输出里找不到根元素");const n=o=>{const s=t[0].match(new RegExp(`\\s${o}="([0-9.]+)"`));return s?Number(s[1]):NaN};let i=n("data-width"),a=n("data-height");if(!Number.isFinite(i)||!Number.isFinite(a)){const o=t[0].match(/viewBox="[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)"/);if(!o)throw new Error("SVG 根元素既没有 data-width/data-height，也没有 viewBox");i=Number(o[1]),a=Number(o[2])}return{widthPt:i,heightPt:a}}function Oe(r){const e=[...r.matchAll(/<g\b[^>]*class="typst-page"[^>]*>/g)].map(t=>{const n=t[0].match(/data-page-height="([0-9.]+)"/);return{heightPt:n?Number(n[1]):NaN}});return e.length===0||e.some(t=>!Number.isFinite(t.heightPt))?null:e}function Be(r){const e=new TextDecoder("latin1").decode(r),t=[...e.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)|\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages\b/g)].map(i=>Number(i[1]??i[2]));if(t.length>0)return Math.max(...t);const n=e.match(/\/Type\s*\/Page(?!s)\b/g);return n?n.length:null}const q=r=>r/xe,He=6,Le=3,P=r=>Math.round(r*10)/10;function z(r){return{...r,modules:Fe(r)}}class Ne{constructor(e){h(this,"backend");h(this,"cache",new Map);this.backend=e}async svg(e,t,n,i){return Ee(await this.backend.svg(t.build(z(e),n,i)))}async pdf(e,t,n,i){return this.backend.pdf(t.build(z(e),n,i))}async exportPdf(e,t,n){if(n.status==="overflow"||n.status==="too-long")throw new Error("当前排版结果是失败状态，不能导出");const i=await this.pdf(e,t,n.tokens,n.pageHeight),a=Be(i);if(a===null)throw new Error("无法读取导出 PDF 的页数，已停止导出");if(a!==n.metrics.pageCount)throw new Error(`导出的 PDF 有 ${a} 页，但排版结果是 ${n.metrics.pageCount} 页，已停止导出`);return{pdf:i,pageCount:a}}async contentHeightMm(e,t,n){const i=z(e),a=JSON.stringify([t.id,n,i.modules]);let o=this.cache.get(a);return o||(o=this.backend.svg(t.build(i,n,"auto")).then(s=>q(U(s).heightPt)),this.cache.set(a,o),this.cache.size>200&&this.cache.delete(this.cache.keys().next().value)),o}async pageCount(e,t,n,i){const a=await this.backend.svg(t.build(z(e),n,i)),o=Oe(a);if(o)return o.length;const s=q(U(a).heightPt),l=s/i,c=Math.round(l);if(Math.abs(l-c)>.01||c<1)throw new Error(`无法从 SVG 高度推出页数：总高 ${s.toFixed(2)}mm，页高 ${i}mm`);return c}baseMetrics(e,t,n,i){const a=i?Math.max(0,e-u):0;return{pageWidthMm:210,pageHeightMm:t,pageCount:n,contentHeightMm:P(e),overflowMm:P(a),overflowRatio:Math.round(a/u*1e3)/1e3,moduleHeights:[]}}async layout(e,t,n=e.layout.pageMode){switch(n){case"fit-a4":return this.fitA4(e,t);case"continuous":return this.continuous(e,t);case"standard":return this.standard(e,t)}}async standard(e,t){const n=t.defaultTokens,[i,a]=await Promise.all([this.contentHeightMm(e,t,n),this.pageCount(e,t,n,u)]);return{status:"paginated",appliedSteps:[],tokens:n,pageHeight:u,metrics:this.baseMetrics(i,u,a,!1)}}async continuous(e,t){const n=t.defaultTokens,i=await this.contentHeightMm(e,t,n);if(i>Me+D){const s=this.baseMetrics(i,i,1,!1);return{status:"too-long",appliedSteps:[],tokens:n,pageHeight:"auto",metrics:s,suggestions:[`内容约 ${(i/u).toFixed(2)} 页 A4，超过长一页上限（4 页）。请改用标准分页，或拆成多份简历。`]}}const a=i<=u?u:"auto",o=Math.max(i,u);return{status:"continuous",appliedSteps:[],tokens:n,pageHeight:a,metrics:this.baseMetrics(i,P(o),1,!1)}}async fitsA4(e,t,n){const i=await this.contentHeightMm(e,t,n);return i>u+D?{fits:!1,heightMm:i}:{fits:await this.pageCount(e,t,n,u)===1,heightMm:i}}async relaxToFill(e,t,n){const i=t.defaultTokens,a=(d,p,g)=>({status:d,appliedSteps:[],tokens:p,pageHeight:u,metrics:this.baseMetrics(g,u,1,!0)});if(u-n<=He)return a("fitted-default",i,n);const o=$(i,1),s=await this.fitsA4(e,t,o);if(s.fits)return a("fitted-relaxed",o,s.heightMm);let l=0,c=1,m={tokens:i,heightMm:n};for(let d=0;d<6;d++){const p=(l+c)/2,g=$(i,p),x=await this.fitsA4(e,t,g);if(x.fits){if(l=p,m={tokens:g,heightMm:x.heightMm},u-x.heightMm<=Le)break}else c=p}return l===0?a("fitted-default",i,n):a("fitted-relaxed",m.tokens,m.heightMm)}async fitA4(e,t){const n=t.defaultTokens,i=t.floorTokens;let a=n,o=await this.fitsA4(e,t,a);if(o.fits)return this.relaxToFill(e,t,o.heightMm);const s=[];for(const c of ve){const m=Se(c)?[1]:Pe;let d=a,p=!1;for(const g of m){const x=ze(a,n,i,c,g);if(JSON.stringify(x)!==JSON.stringify(d)&&(d=x,p=!0,o=await this.fitsA4(e,t,d),o.fits))return s.push(c),{status:"fitted-tightened",appliedSteps:s,tokens:d,pageHeight:u,metrics:this.baseMetrics(o.heightMm,u,1,!0)}}p&&s.push(c),a=d}const l=this.baseMetrics(o.heightMm,u,await this.pageCount(e,t,a,u),!0);return await this.attachBreakdown(e,t,a,l),{status:"overflow",appliedSteps:s,tokens:a,pageHeight:u,metrics:l,suggestions:De(e,l)}}async attachBreakdown(e,t,n,i,a=!0){const o=z(e),s=await this.contentHeightMm(o,t,n),l=m=>this.contentHeightMm({...o,modules:m},t,n);i.moduleHeights=[];for(const m of o.modules){if(m.type==="basic_info")continue;const d=await l(o.modules.filter(p=>p.id!==m.id));i.moduleHeights.push({moduleId:m.id,type:m.type,heightMm:P(s-d)})}i.moduleHeights.sort((m,d)=>d.heightMm-m.heightMm);const c=o.modules.find(m=>{var d;return m.id===((d=i.moduleHeights[0])==null?void 0:d.moduleId)});if(a&&c&&"items"in c.data&&c.data.items.length>1){i.itemHeights=[];for(const m of c.data.items){const d={...c,data:{...c.data,items:c.data.items.filter(g=>g.id!==m.id)}},p=await l(o.modules.map(g=>g.id===c.id?d:g));i.itemHeights.push({moduleId:c.id,itemId:m.id,heightMm:P(s-p)})}i.itemHeights.sort((m,d)=>d.heightMm-m.heightMm)}}}function Ie(r,e,t){const n=r.modules.find(a=>a.id===e);if(!n||!("items"in n.data))return t;const i=n.data.items.find(a=>a.id===t);return(i==null?void 0:i.name)??(i==null?void 0:i.org)??(i==null?void 0:i.school)??(i==null?void 0:i.title)??t}function De(r,e){var o;const t=[],n=e.contentHeightMm,i=e.moduleHeights[0];if(i){const s=Math.round(i.heightMm/n*100);t.push(`「${je[i.type]}」占总高约 ${s}%（约 ${Math.round(i.heightMm)}mm），优先精简这里：删掉较弱的条目，或把每条经历的要点压到 2～3 条。`)}const a=(o=e.itemHeights)==null?void 0:o[0];return a&&t.push(`单个条目里最长的是「${Ie(r,a.moduleId,a.itemId)}」，约 ${Math.round(a.heightMm)}mm。`),e.overflowMm<=15&&t.push(`只超出约 ${Math.round(e.overflowMm)}mm，删掉 1～2 条要点或合并两行短句，通常就能装下。`),t.push("也可以改用无损长一页（适合屏幕投递），或标准分页（适合打印）。"),t.slice(0,4)}function $e(r,e,t){r.setCompilerInitOptions({getModule:()=>t.compilerWasm}),r.setRendererInitOptions({getModule:()=>t.rendererWasm}),r.use(e.disableDefaultFontAssets(),...t.fonts.map(n=>e.preloadFontData(n)))}class Ue{constructor(e){h(this,"snippet");h(this,"queue",Promise.resolve());this.snippet=e}run(e,t){const n=this.queue.then(async()=>{await this.snippet.resetShadow();for(const[i,a]of Object.entries(e.files))typeof a=="string"?await this.snippet.addSource(i,a):await this.snippet.mapShadow(i,a);return t()});return this.queue=n.catch(()=>{}),n}svg(e){return this.run(e,()=>this.snippet.svg({mainFilePath:e.main,inputs:{}}))}pdf(e){return this.run(e,async()=>{const t=await this.snippet.pdf({mainFilePath:e.main,inputs:{}});if(!t)throw new Error("Typst 没有返回 PDF（可能是编译错误）");return t})}}const W={sans:"Noto Sans SC",serif:"Noto Serif SC",mono:"Noto Sans Mono"};function k(r,e,t){return{default:{pageMarginMm:r,fontFamily:W,...e,compact:!1},floor:{pageMarginMm:r,fontFamily:W,...t,compact:!0}}}const qe=k({top:14,right:16,bottom:14,left:16},{namePt:22,headingPt:12.5,bodyPt:11,metaPt:10.5,lineHeight:1.48,sectionGapMm:3.6,itemGapMm:2.4,paragraphGapMm:.4},{namePt:18,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2.2,itemGapMm:1,paragraphGapMm:.15}),We=k({top:15,right:17,bottom:15,left:17},{namePt:22,headingPt:12,bodyPt:11,metaPt:10.5,lineHeight:1.5,sectionGapMm:4,itemGapMm:2.6,paragraphGapMm:.5},{namePt:18,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2.2,itemGapMm:1,paragraphGapMm:.15}),Je=k({top:13,right:14,bottom:13,left:13},{namePt:22,headingPt:12,bodyPt:10.75,metaPt:10.5,lineHeight:1.48,sectionGapMm:3.8,itemGapMm:2.6,paragraphGapMm:.45},{namePt:18,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2,itemGapMm:1,paragraphGapMm:.12}),Ve=k({top:14,right:16,bottom:14,left:16},{namePt:23,headingPt:12.5,bodyPt:11,metaPt:10.5,lineHeight:1.5,sectionGapMm:4,itemGapMm:2.6,paragraphGapMm:.5},{namePt:18,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2.2,itemGapMm:1,paragraphGapMm:.15}),Ke=k({top:14,right:15,bottom:14,left:15},{namePt:22,headingPt:13.5,bodyPt:11.25,metaPt:10.75,lineHeight:1.55,sectionGapMm:5,itemGapMm:3,paragraphGapMm:.8},{namePt:18,headingPt:12,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2.5,itemGapMm:1.2,paragraphGapMm:.2}),Xe=k({top:13,right:14,bottom:13,left:14},{namePt:24,headingPt:12.5,bodyPt:11,metaPt:10.5,lineHeight:1.5,sectionGapMm:4.5,itemGapMm:2.6,paragraphGapMm:.6},{namePt:18,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2.2,itemGapMm:1,paragraphGapMm:.15}),Ze=k({top:12,right:12,bottom:12,left:12},{namePt:21,headingPt:12,bodyPt:10.75,metaPt:10.5,lineHeight:1.45,sectionGapMm:4,itemGapMm:2.4,paragraphGapMm:.5},{namePt:17,headingPt:11.5,bodyPt:10.5,metaPt:10.5,lineHeight:1.35,sectionGapMm:2,itemGapMm:1,paragraphGapMm:.1}),O=new TextEncoder,Qe={png:r=>r[0]===137&&r[1]===80&&r[2]===78&&r[3]===71,jpg:r=>r[0]===255&&r[1]===216&&r[2]===255,gif:r=>r[0]===71&&r[1]===73&&r[2]===70,webp:r=>r[8]===87&&r[9]===69&&r[10]===66&&r[11]===80};function Ye(r){const e=r.match(/^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]*)$/);if(!e)return null;const t=e[1]==="jpeg"?"jpg":e[1];let n;try{n=atob(e[2].replace(/\s+/g,""))}catch{return null}const i=new Uint8Array(n.length);for(let a=0;a<n.length;a++)i[a]=n.charCodeAt(a);return i.length>=12&&Qe[t](i)?{ext:t,bytes:i}:null}function et(r,e,t,n,i){const a={},o={height:i},s=t.modules.map(l=>{if(l.type!=="basic_info"||!l.data.photoDataUrl)return l;const c=Ye(l.data.photoDataUrl),{photoDataUrl:m,...d}=l.data;return c&&(o.photo=`photo.${c.ext}`,a[`/photo.${c.ext}`]=c.bytes),{...l,data:d}});return a["/main.typ"]=r,a["/common.typ"]=e,a["/data.json"]=O.encode(JSON.stringify({modules:s,theme:t.layout.theme??"ink"})),a["/tokens.json"]=O.encode(JSON.stringify(n)),a["/page.json"]=O.encode(JSON.stringify(o)),{main:"/main.typ",files:a}}const tt=[{id:"classic",name:"经典 · 简洁",description:"姓名左对齐、单一主色、细线标题，没有大面积色块。打印清爽、系统解析稳妥，适合绝大多数投递。",tokens:qe,recommendedOrder:["basic_info","job_intention","education","skills","internship","work","project","research","paper","award","summary"],group:"classic"},{id:"minimal",name:"极简 · 黑白",description:"只用黑与深灰，没有图标和色块，标题下一条黑色细线。黑白打印与系统解析效果最稳，主题色不生效。",tokens:We,recommendedOrder:["basic_info","job_intention","education","skills","work","internship","project","research","paper","award","summary"],fixedTheme:"mono",group:"classic"},{id:"elegant",name:"雅致 · 衬线",description:"页眉上下双细线、宋体姓名居中，模块标题居中、两侧渐隐短线。稳重，适合国企、银行、研究岗。",tokens:Ve,recommendedOrder:["basic_info","job_intention","education","research","paper","skills","internship","work","project","award","summary"],group:"classic"},{id:"timeline",name:"时间轴",description:"经历按时间轴排：左侧时间列、竖线与圆点，右侧内容；标题是浅色标签条。经历多、时间线清晰时最好看。",tokens:Je,recommendedOrder:["basic_info","job_intention","work","internship","project","education","skills","research","paper","award","summary"],group:"colorful"},{id:"campus-serif",name:"校招 · 横幅",description:"页顶渐变横幅、圆形图标标题、胶囊日期，教育前置。适合应届生与实习。",tokens:Ke,recommendedOrder:["basic_info","job_intention","education","skills","internship","work","project","research","paper","award","summary"],group:"colorful"},{id:"social-sans",name:"社招 · 侧条",description:"左缘渐变色条、大号姓名、联系方式竖排，信息更密，技能与履历优先。适合 1～8 年经验。",tokens:Xe,recommendedOrder:["basic_info","job_intention","skills","work","internship","project","education","research","paper","award","summary"],group:"colorful"},{id:"split-compact",name:"双栏 · 深色侧栏",description:"左侧深色渐变侧栏放联系方式、技能、教育、获奖，右侧放经历，两栏自动平衡。内容多时提高一页容量。",tokens:Ze,recommendedOrder:["basic_info","job_intention","skills","education","award","work","internship","project","research","paper","summary"],group:"colorful"}];function nt(r){const e=new Map;for(const t of tt){const n=r[t.id];n&&e.set(t.id,{id:t.id,name:t.name,defaultTokens:t.tokens.default,floorTokens:t.tokens.floor,build:(i,a,o)=>et(n,r.common,t.fixedTheme?{...i,layout:{...i.layout,theme:t.fixedTheme}}:i,a,o)})}return e}var rt=`// 如页 · 三套模板共用的数据读取、主题色、图标和条目渲染。\r
// 模板文件负责：页面与文字的 set 规则、页眉、模块标题样式、整体布局。\r
//\r
// 约定：\r
// - 数据只从 data.json / tokens.json / page.json 读取。用户文字都以字符串形式插入（[#s]），\r
//   不会被当成 Typst 标记解析，# * _ $ @ < 等字符都安全。\r
// - 所有垂直间距由 gap() 显式控制，便于引擎按 token 精确收紧。\r
\r
#let data = json("data.json")\r
#let doc-modules = data.modules\r
#let t = json("tokens.json")\r
#let spec = json("page.json")\r
\r
// ---------------------------------------------------------------- 主题色板\r
// 每个主题一整套颜色：primary 深主色（标题、强调文字）、secondary 鲜明辅色（图形、色块）、\r
// bright 亮色（渐变的另一端）、tint 极浅底色（胶囊、卡片）。\r
// 文字只用 primary（对白底对比度足够打印）；secondary / bright 只用于图形和大面积色块。\r
// 主题 id 与 packages/schema/src/types.ts 的 THEMES 保持一致\r
#let palettes = (\r
  ink: (primary: rgb("#1d3b8b"), secondary: rgb("#2f6fe4"), bright: rgb("#38bdf8"), tint: rgb("#eef4ff")),\r
  teal: (primary: rgb("#0e5f5c"), secondary: rgb("#12a594"), bright: rgb("#5eead4"), tint: rgb("#eafbf6")),\r
  wine: (primary: rgb("#8c1d40"), secondary: rgb("#d1365f"), bright: rgb("#fb7185"), tint: rgb("#fff0f3")),\r
  graphite: (primary: rgb("#1f2937"), secondary: rgb("#475569"), bright: rgb("#94a3b8"), tint: rgb("#f1f5f9")),\r
  violet: (primary: rgb("#4c1d95"), secondary: rgb("#7c3aed"), bright: rgb("#c084fc"), tint: rgb("#f5f0ff")),\r
  amber: (primary: rgb("#8a3b0b"), secondary: rgb("#d97706"), bright: rgb("#fbbf24"), tint: rgb("#fff7e6")),\r
  // 只给「极简 · 黑白」用，不出现在主题色选择里\r
  mono: (primary: rgb("#111111"), secondary: rgb("#3a3a3a"), bright: rgb("#8a8a8a"), tint: rgb("#f1f1f1")),\r
)\r
#let pal = palettes.at(data.at("theme", default: "ink"), default: palettes.ink)\r
#let accent = pal.primary\r
#let accent2 = pal.secondary\r
#let bright = pal.bright\r
#let tint = pal.tint\r
#let ink = rgb("#161b26")                       // 正文：近黑\r
#let muted = rgb("#4b5563")                     // 次级信息：深灰（打印仍清晰）\r
#let hairline = rgb("#d5dbe4")                  // 细线\r
// 渐变：主色 → 辅色 → 亮色\r
#let grad-h = gradient.linear(pal.primary, pal.secondary, pal.bright, angle: 0deg)\r
#let grad-v = gradient.linear(pal.primary, pal.secondary, angle: 90deg)\r
\r
// ---------------------------------------------------------------- 尺寸\r
#let body-size = t.bodyPt * 1pt\r
#let meta-size = t.metaPt * 1pt\r
#let lead = (t.lineHeight - 1) * body-size\r
#let compact = t.compact\r
#let sans = (t.fontFamily.sans, "Noto Sans SC")\r
#let serif = (t.fontFamily.serif, "Noto Serif SC", t.fontFamily.sans, "Noto Sans SC")\r
#let margin = t.pageMarginMm\r
#let text-width = 210mm - (margin.left + margin.right) * 1mm\r
#let page-height = if spec.height == "auto" { auto } else { spec.height * 1mm }\r
#let page-margin = (top: margin.top * 1mm, bottom: margin.bottom * 1mm, left: margin.left * 1mm, right: margin.right * 1mm)\r
\r
// 页脚页码：只在实际超过一页时出现（标准分页），印在下页边里，不占版心、不影响测量。\r
// 页数来自 Typst 的分页结果本身，所以 PDF、预览、界面显示的页数是同一个数。\r
#let page-footer = context {\r
  let total = counter(page).final().first()\r
  if total > 1 {\r
    set text(size: meta-size, fill: muted, top-edge: "cap-height", bottom-edge: "baseline")\r
    align(right, [#counter(page).display() / #total])\r
  }\r
}\r
\r
// ---------------------------------------------------------------- 工具函数\r
\r
#let has(d, k) = type(d) == dictionary and k in d and d.at(k) != none and d.at(k) != ""\r
#let get(d, k) = if has(d, k) { d.at(k) } else { none }\r
#let nonempty(arr) = if arr == none { () } else { arr.filter(s => s != none and s.trim() != "") }\r
\r
// 两个内容单元之间的垂直间距：一个行距 + token 指定的额外间距；分页处自动折叠\r
#let gap(extra-mm) = v(lead + extra-mm * 1mm, weak: true)\r
\r
#let fmt-date(s) = if s == none or s == "" { "" } else if s == "至今" { s } else { s.replace("-", ".") }\r
#let date-range(a, b) = {\r
  let x = fmt-date(a)\r
  let y = fmt-date(b)\r
  if x == "" and y == "" { none } else if y == "" { x } else { x + " – " + y }\r
}\r
\r
#let meta(s) = text(size: meta-size, fill: muted)[#s]\r
#let pretty-url(u) = u.replace(regex("^https?://"), "").replace(regex("^mailto:"), "").replace(regex("/$"), "")\r
// 链接安全：只为 http、https、mailto 生成可点击链接；没写协议的网址（github.com/xx）补 https://；\r
// 其他协议（javascript:、data: 等）只显示文字，不生成链接——预览 SVG 会插进编辑器页面，不能让它执行脚本\r
#let safe-url(u) = {\r
  if u.match(regex("(?i)^(https?://|mailto:)")) != none { u }\r
  else if u.match(regex("^[A-Za-z][A-Za-z0-9+.-]*:")) != none { none }\r
  else { "https://" + u }\r
}\r
#let url-link(u) = {\r
  let target = safe-url(u)\r
  if target == none { [#pretty-url(u)] } else { link(target)[#pretty-url(u)] }\r
}\r
#let dot(size, color) = box(baseline: -0.32em, circle(radius: size / 2, fill: color))\r
\r
#let title-text(s) = text(weight: "bold")[#s]\r
#let role-text(s) = text(fill: accent)[#s]\r
#let sep = h(0.7em)\r
\r
// ---------------------------------------------------------------- 图标（原创，简单线性图形）\r
\r
#let icon-svg = (\r
  phone: "<rect x='6.5' y='2.5' width='11' height='19' rx='2.5' fill='none' stroke='{c}' stroke-width='2'/><circle cx='12' cy='17.6' r='1.3' fill='{c}'/>",\r
  email: "<rect x='3' y='5' width='18' height='14' rx='2.2' fill='none' stroke='{c}' stroke-width='2'/><path d='M4 7l8 6 8-6' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/>",\r
  location: "<path d='M12 21.5s6.5-5.8 6.5-11.2a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11.2 6.5 11.2z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/><circle cx='12' cy='10.3' r='2.4' fill='{c}'/>",\r
  code: "<path d='M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5' fill='none' stroke='{c}' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>",\r
  link: "<path d='M10.2 13.8a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.1 1.1M13.8 10.2a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.1-1.1' fill='none' stroke='{c}' stroke-width='2' stroke-linecap='round'/>",\r
  person: "<circle cx='12' cy='8' r='3.8' fill='none' stroke='{c}' stroke-width='2'/><path d='M4.5 20.5c1.4-3.8 4.2-5.6 7.5-5.6s6.1 1.8 7.5 5.6' fill='none' stroke='{c}' stroke-width='2' stroke-linecap='round'/>",\r
  target: "<circle cx='12' cy='12' r='8.5' fill='none' stroke='{c}' stroke-width='2'/><circle cx='12' cy='12' r='4' fill='none' stroke='{c}' stroke-width='2'/><circle cx='12' cy='12' r='1.2' fill='{c}'/>",\r
)\r
\r
// 模块图标（原创线性图形，24×24）\r
#let section-icon-svg = (\r
  education: "<path d='M12 4 2 9l10 5 10-5-10-5z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/><path d='M6 11.4v4.6c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.6M22 9v5' fill='none' stroke='{c}' stroke-width='2' stroke-linecap='round'/>",\r
  skills: "<path d='M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/>",\r
  work: "<rect x='3' y='7' width='18' height='13' rx='2.2' fill='none' stroke='{c}' stroke-width='2'/><path d='M9 7V5.2h6V7M3 12.5h18' fill='none' stroke='{c}' stroke-width='2'/>",\r
  internship: "<rect x='3' y='7' width='18' height='13' rx='2.2' fill='none' stroke='{c}' stroke-width='2'/><path d='M9 7V5.2h6V7M3 12.5h18' fill='none' stroke='{c}' stroke-width='2'/>",\r
  project: "<path d='M12 3 2.5 8 12 13l9.5-5L12 3z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/><path d='m2.5 12.5 9.5 5 9.5-5M2.5 17 12 22l9.5-5' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/>",\r
  research: "<path d='M9 3h6M10 3v6.2l-5.2 9.1A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9.2V3M7.5 15h9' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'/>",\r
  paper: "<path d='M7 3h7l5 5v13H7z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/><path d='M14 3v5h5M10 13h6M10 17h6' fill='none' stroke='{c}' stroke-width='2' stroke-linecap='round'/>",\r
  award: "<circle cx='12' cy='9' r='5.5' fill='none' stroke='{c}' stroke-width='2'/><path d='m8.6 13.3-1.4 7.7L12 18.6l4.8 2.4-1.4-7.7' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/>",\r
  summary: "<path d='M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z' fill='none' stroke='{c}' stroke-width='2' stroke-linejoin='round'/>",\r
)\r
#let svg-image(body, color, size) = image(\r
  bytes("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" + body.replace("{c}", color.to-hex()) + "</svg>"),\r
  format: "svg",\r
  height: size,\r
)\r
// 圆形色块里的白色模块图标\r
#let section-badge(type, size: 1.55em, fill: accent) = box(\r
  baseline: 0.3em,\r
  circle(radius: size / 2, fill: fill, inset: 0pt, align(center + horizon, svg-image(section-icon-svg.at(type, default: section-icon-svg.project), white, size * 0.58))),\r
)\r
\r
#let icon(name, color: accent, size: 0.95em) = box(\r
  baseline: 0.14em,\r
  image(\r
    bytes("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" + icon-svg.at(name).replace("{c}", color.to-hex()) + "</svg>"),\r
    format: "svg",\r
    height: size,\r
  ),\r
)\r
\r
// 联系方式：返回 ((图标名, 内容), ...)；顺序固定\r
#let contact-items(d) = {\r
  let items = ()\r
  if has(d, "phone") { items.push(("phone", [#d.phone])) }\r
  if has(d, "email") { items.push(("email", link("mailto:" + d.email)[#d.email])) }\r
  if has(d, "location") { items.push(("location", [#d.location])) }\r
  if has(d, "github") { items.push(("code", url-link(d.github))) }\r
  for k in ("website", "blog") {\r
    if has(d, k) { items.push(("link", url-link(d.at(k)))) }\r
  }\r
  let custom = if has(d, "customLinks") { d.customLinks } else { () }\r
  for l in custom {\r
    if l.url != "" { items.push(("link", [#l.label #url-link(l.url)])) }\r
  }\r
  let personal = (get(d, "gender"), fmt-date(get(d, "birthday"))).filter(x => x != none and x != "")\r
  if personal.len() > 0 { items.push(("person", [#personal.join(" · ")])) }\r
  items\r
}\r
\r
// 一行联系方式：图标 + 文字，项与项之间留白；每项内部不断行，便于复制\r
#let contact-row(d, color: muted, icon-color: accent, sep: h(1.1em)) = {\r
  let items = contact-items(d)\r
  if items.len() == 0 { return none }\r
  text(size: meta-size, fill: color, items.map(((ic, c)) => box[#icon(ic, color: icon-color) #h(0.15em) #c]).join(sep))\r
}\r
\r
// 纯文字联系方式（不带图标），用分隔符连接\r
#let contact-text(d, sep: [ · ]) = {\r
  let items = contact-items(d)\r
  if items.len() == 0 { return none }\r
  items.map(((ic, c)) => box(c)).join(sep)\r
}\r
\r
#let intention-module = doc-modules.find(m => m.type == "job_intention")\r
#let has-basic = doc-modules.any(m => m.type == "basic_info")\r
\r
// 求职意向：岗位加粗 + 其余信息用竖线分隔\r
#let intention-row(d, role-color: accent, color: ink, sep-color: hairline.darken(30%)) = {\r
  let role = get(d, "role")\r
  let rest = (get(d, "city"), get(d, "availability"), get(d, "salary")).filter(x => x != none)\r
  if role == none and rest.len() == 0 { return none }\r
  text(fill: color, {\r
    if role != none { text(weight: "bold", fill: role-color)[#role] }\r
    for (i, r) in rest.enumerate() {\r
      if i > 0 or role != none { h(0.55em); text(fill: sep-color)[|]; h(0.55em) }\r
      [#r]\r
    }\r
  })\r
}\r
\r
#let photo-path = spec.at("photo", default: none)\r
// 照片：3:4 证件照比例，超出部分裁切\r
#let photo-box(width) = box(width: width, height: width * 4 / 3, clip: true, radius: 1.2mm, stroke: 0.5pt + hairline, image(photo-path, width: 100%, height: 100%, fit: "cover"))\r
\r
// 居中页眉：若干行居中排列，照片（如有）固定在右上角。\r
// 文字区左右各让出照片宽度，保证整页居中且不压照片；照片比文字高时用照片高度撑开。\r
// 「经典」「雅致」两套模板共用。first-gap / rest-gap：第一行与第二行、其余各行之间的额外间距\r
#let centered-header(lines, photo-w: 21mm, first-gap: 2.4mm, rest-gap: 1.2mm) = {\r
  let side = if photo-path != none { photo-w + 4mm } else { 0mm }\r
  let body = pad(left: side, right: side, align(center, {\r
    set par(justify: false)\r
    for (i, l) in lines.enumerate() {\r
      if i > 0 { v(lead + if i == 1 { first-gap } else { rest-gap }) }\r
      block(l)\r
    }\r
  }))\r
  block(breakable: false, width: 100%, {\r
    if photo-path != none { place(top + right, photo-box(photo-w)) }\r
    context {\r
      let h = measure(body, width: text-width).height\r
      body\r
      if photo-path != none and h < photo-w * 4 / 3 { v(photo-w * 4 / 3 - h) }\r
    }\r
  })\r
}\r
\r
// ---------------------------------------------------------------- 正文元素\r
\r
// 量化成果加粗：带单位的数字（320ms、85%、3 天、20 万）或两位以上整数（600、1500）。\r
// 紧跟在字母或符号后的数字是型号、版本号（P99、A4、HTTP/2），小数（OAuth 2.0）也不加粗。\r
#let metric-units = "%|％|ms|秒|分钟|小时|天|周|个月|倍|万|千|亿|QPS|qps|TPS|条|次|人|项|篇|位"\r
#let metric-re = regex("[A-Za-z/_.-]?\\d[\\d,.]*(\\s?(" + metric-units + "))?")\r
#let unit-re = regex("(" + metric-units + ")$")\r
#let emphasize(s) = {\r
  show metric-re: it => {\r
    let raw = it.text\r
    let prefixed = raw.match(regex("^[A-Za-z/_.-]")) != none\r
    let has-unit = raw.match(unit-re) != none\r
    let big-int = raw.match(regex("^\\d{2,}[\\d,]*$")) != none\r
    if not prefixed and (has-unit or big-int) { text(weight: "bold", fill: ink, it) } else { it }\r
  }\r
  [#s]\r
}\r
\r
// 标题行：左侧标题，右侧日期（右对齐、等宽数字）\r
// 日期的样式由模板选择：pill（浅底胶囊）、accent（主色文字）、plain（灰色文字）\r
#let date-style = state("ruye-date-style", "plain")\r
#let date-display(s) = context {\r
  let style = date-style.get()\r
  let body = text(size: meta-size, number-width: "tabular")[#s]\r
  if style == "pill" {\r
    box(fill: tint, radius: 99pt, inset: (x: 0.6em), outset: (y: 0.24em), text(fill: accent, weight: "medium", body))\r
  } else if style == "accent" {\r
    text(fill: accent, weight: "medium", body)\r
  } else {\r
    text(fill: muted, body)\r
  }\r
}\r
\r
// 日期样式为 "none" 时标题行不放日期（时间轴模板把日期放在左侧时间列）\r
#let headline(lhs, rhs) = context {\r
  // 标题行折行时不做两端对齐，避免把字拉散\r
  set par(justify: false)\r
  if rhs == none or rhs == "" or date-style.get() == "none" {\r
    block(lhs)\r
  } else {\r
    grid(\r
      columns: (1fr, auto),\r
      column-gutter: 1em,\r
      align: (left + bottom, right + bottom),\r
      lhs,\r
      date-display(rhs),\r
    )\r
  }\r
}\r
\r
// 要点：强调色小圆点 + 内容（悬挂缩进）\r
#let bullet-of(body) = grid(\r
  columns: (1em, 1fr),\r
  align: (left + top, left + top),\r
  box(height: 1em, align(horizon, move(dy: 0.08em, dot(0.32em, accent)))),\r
  body,\r
)\r
// 要点的三种写法（都只是普通字符串，不改数据结构）：\r
//  · 「个人职责：」这种以冒号结尾的短行 → 分块小标题（不带圆点，主色加粗）\r
//  · 「缓存优化：用 Redis……」句首短语 + 冒号 → 冒号前加粗，成为这一条的短标题\r
//  · 其他 → 普通要点，数字指标自动加粗\r
#let lead-key-re = regex("^([^：:，,。；;、]{1,14})[：:]\\s*")\r
#let subhead-re = regex("^[^：:，,。；;]{1,12}[：:]\\s*$")\r
#let is-subhead(s) = s.trim().match(subhead-re) != none\r
#let subhead(s) = block(above: 0pt, below: 0pt,\r
  text(weight: "bold", fill: accent)[#s.trim().trim(regex("[：:]"), at: end)])\r
#let bullet(s) = {\r
  let key = s.match(lead-key-re)\r
  if key != none and key.end < s.len() {\r
    bullet-of({ text(weight: "bold")[#key.captures.at(0)]; [：]; emphasize(s.slice(key.end)) })\r
  } else {\r
    bullet-of(emphasize(s))\r
  }\r
}\r
// 小标题与紧随其后的第一条要点绑在一起，避免分页时小标题落在页底\r
#let bullets(arr) = {\r
  let out = ()\r
  let pending = none\r
  for b in nonempty(arr) {\r
    if is-subhead(b) {\r
      if pending != none { out.push(pending) }\r
      pending = subhead(b)\r
    } else if pending != none {\r
      out.push(block(breakable: false, { pending; v(lead * 0.6, weak: true); bullet(b) }))\r
      pending = none\r
    } else {\r
      out.push(bullet(b))\r
    }\r
  }\r
  if pending != none { out.push(pending) }\r
  out\r
}\r
\r
// 技术栈：每项一个浅色小标签（主题浅底 + 细描边 + 深主色字），扫一眼就能抓到关键词。\r
// 标签只往外扩（outset）不占行高，所以行距、分页和纯文字时一致；打印时浅底依然清晰。\r
// 标签之间放零宽空格：只在两项之间折行，不会把一个技术名拆开\r
#let tech-chip(s) = box(\r
  fill: tint,\r
  stroke: 0.4pt + accent.lighten(68%),\r
  radius: 0.8mm,\r
  inset: (x: 0.42em),\r
  outset: (y: 0.2em),\r
  text(fill: accent.darken(6%), weight: "medium")[#s],\r
)\r
#let tech-text(arr) = {\r
  // 用户常顺手在最后一项后面打句号，去掉\r
  let clean = arr.map(s => s.trim().trim(regex("[。，、；;,.]+"), at: end)).filter(s => s != "")\r
  text(size: meta-size, { h(0.12em); clean.map(tech-chip).join([#h(0.34em)#sym.zws]) })\r
}\r
\r
// 条目标题下的一行：简介（灰）+ 技术栈（强调色）+ 链接（灰）。三者都可缺省，挤不下时自然折行\r
#let meta-label(s) = text(size: meta-size, weight: "bold", fill: ink)[#s：]\r
// 「标签：内容」一行；内容折行时与第一行内容对齐（悬挂缩进），不顶到左边\r
#let labeled(label, body, justify: true) = grid(\r
  columns: (auto, 1fr),\r
  align: (left + top, left + top),\r
  meta-label(label),\r
  par(justify: justify, body),\r
)\r
#let meta-lines(item, url: none, summary-label: "简介") = {\r
  let out = ()\r
  let s = get(item, "summary")\r
  let stack = nonempty(get(item, "techStack"))\r
  if s != none {\r
    out.push(labeled(summary-label, text(size: meta-size, fill: ink)[#s]))\r
  }\r
  if stack.len() > 0 {\r
    let body = tech-text(stack)\r
    if url != none { body = { body; h(1.2em); text(size: meta-size, fill: muted, url-link(url)) } }\r
    out.push(labeled("技术栈", body, justify: false))\r
  } else if url != none {\r
    out.push(labeled("链接", text(size: meta-size, fill: muted, url-link(url)), justify: false))\r
  }\r
  out\r
}\r
\r
// ---------------------------------------------------------------- 条目\r
//\r
// 每个条目返回一组「单元」（content 数组）。第一个单元是不可拆分的「标题 + 第一行」，\r
// 保证标准分页时条目标题不会孤零零落在页底。\r
\r
// metas：标题下的简介、技术栈行；lines：要点。标题、全部 metas 与第一条要点绑成一个不可拆分的单元，\r
// 这样标准分页时不会出现「标题和简介在页底、要点全在下一页」的情况\r
#let item-units(head, lines, metas: ()) = {\r
  let metas = metas.filter(x => x != none).map(x => block(x))\r
  let lines = lines.filter(x => x != none).map(x => block(x))\r
  let keep = metas + lines.slice(0, calc.min(1, lines.len()))\r
  let first = block(breakable: false, {\r
    head\r
    for u in keep {\r
      gap(t.paragraphGapMm)\r
      u\r
    }\r
  })\r
  (first,) + lines.slice(calc.min(1, lines.len()))\r
}\r
\r
#let education-units(item) = {\r
  let lhs = {\r
    title-text(item.school)\r
    if has(item, "major") { sep; role-text(item.major) }\r
    if has(item, "degree") { sep; meta(item.degree) }\r
  }\r
  item-units(headline(lhs, date-range(get(item, "start"), get(item, "end"))), bullets(get(item, "highlights")))\r
}\r
\r
#let experience-units(item) = {\r
  let lhs = {\r
    title-text(item.org)\r
    if has(item, "title") { sep; role-text(item.title) }\r
  }\r
  item-units(headline(lhs, date-range(get(item, "start"), get(item, "end"))), bullets(get(item, "bullets")), metas: meta-lines(item))\r
}\r
\r
#let project-units(item) = {\r
  let lhs = {\r
    title-text(item.name)\r
    if has(item, "role") { sep; role-text(item.role) }\r
  }\r
  // 链接放在下面那行末尾，不挤标题行（否则日期会被挤到第二行）\r
  item-units(headline(lhs, date-range(get(item, "start"), get(item, "end"))), bullets(get(item, "bullets")), metas: meta-lines(item, url: get(item, "url"), summary-label: "项目简介"))\r
}\r
\r
#let research-units(item) = {\r
  let lhs = {\r
    title-text(item.name)\r
    if has(item, "org") { sep; role-text(item.org) }\r
  }\r
  item-units(headline(lhs, date-range(get(item, "start"), get(item, "end"))), bullets(get(item, "bullets")))\r
}\r
\r
// 论文、获奖每条只有一行：整个模块算作一个条目，行与行之间用「要点间距」\r
#let paper-row(item) = {\r
  let parts = (get(item, "authors"), get(item, "venue")).filter(x => x != none)\r
  let body = {\r
    title-text(item.title)\r
    if parts.len() > 0 { sep; meta(parts.join(". ")) }\r
    if has(item, "url") { sep; text(size: meta-size, fill: muted, url-link(item.url)) }\r
  }\r
  block(breakable: false, headline(body, fmt-date(get(item, "date"))))\r
}\r
\r
#let award-row(item) = {\r
  let lhs = {\r
    text(weight: "medium")[#item.name]\r
    if has(item, "issuer") { sep; role-text(item.issuer) }\r
    if has(item, "description") { sep; meta(item.description) }\r
  }\r
  block(breakable: false, headline(lhs, fmt-date(get(item, "date"))))\r
}\r
\r
// 技能：「分类 | 内容」两栏对齐。紧凑变体在每行都放得进半栏时改成双列\r
#let skill-cats(cats) = cats.filter(c => nonempty(c.items).len() > 0)\r
#let skill-row(c, label-w: 4.6em) = grid(\r
  columns: (label-w, 1fr),\r
  align: (left + top, left + top),\r
  text(weight: "bold", fill: accent)[#c.name],\r
  par(justify: false)[#nonempty(c.items).join("、")],\r
)\r
// 技能描述句：句首是「Java 基础：……」时加粗冒号前的关键词；\r
// 否则把句首的熟练度词（精通、熟悉、了解……）用强调色加粗，扫一眼就能看出深浅\r
#let note-key-re = lead-key-re\r
#let proficiency-re = regex("^(精通|熟练掌握|熟练使用|熟练|熟悉|掌握|理解|了解|擅长|具备|能够)")\r
// 句首是熟练度词时优先按熟练度处理：「熟悉检索增强生成的完整链路：切分、召回……」不该整段加粗\r
#let skill-note(s) = {\r
  let level = s.match(proficiency-re)\r
  if level != none {\r
    return bullet-of({ text(weight: "bold")[#level.text]; emphasize(s.slice(level.end)) })\r
  }\r
  let key = s.match(note-key-re)\r
  if key != none and key.end < s.len() {\r
    return bullet-of({ text(weight: "bold")[#key.captures.at(0)]; [：]; emphasize(s.slice(key.end)) })\r
  }\r
  bullet(s)\r
}\r
#let skill-notes(data) = nonempty(data.at("notes", default: none))\r
#let has-skill-notes(m) = m.type == "skills" and skill-notes(m.data).len() > 0\r
\r
// 一个技能模块的全部单元：先列分类，再列描述句（两者都可以为空）\r
#let skills-units(data, width: text-width, allow-two-columns: true) = {\r
  let cats = skill-cats(data.categories)\r
  let notes = skill-notes(data).map(skill-note)\r
  let label-w = 4.6em\r
  let row-gap = lead + t.paragraphGapMm * 1mm\r
  let rows = if compact and allow-two-columns and cats.len() > 1 {\r
    (context {\r
      let col = ((width - 1.5em) / 2).to-absolute() - label-w.to-absolute()\r
      let fits = cats.all(c => measure([#c.name]).width <= label-w.to-absolute() and measure([#nonempty(c.items).join("、")]).width <= col)\r
      if fits {\r
        grid(columns: (1fr, 1fr), column-gutter: 1.5em, row-gutter: row-gap, ..cats.map(skill-row))\r
      } else {\r
        stack(spacing: row-gap, ..cats.map(skill-row))\r
      }\r
    },)\r
  } else {\r
    cats.map(skill-row)\r
  }\r
  rows + notes\r
}\r
\r
#let module-labels = (\r
  education: "教育背景",\r
  work: "工作经历",\r
  internship: "实习经历",\r
  project: "项目经历",\r
  skills: "专业技能",\r
  research: "科研经历",\r
  paper: "论文发表",\r
  award: "获奖情况",\r
  summary: "自我评价",\r
)\r
\r
// 模块 → 条目列表（每个条目是一组单元）\r
#let module-items(m, skills-width: text-width, allow-two-columns: true) = {\r
  let ty = m.type\r
  if ty == "skills" { return (skills-units(m.data, width: skills-width, allow-two-columns: allow-two-columns),) }\r
  if ty == "paper" { return (m.data.items.map(paper-row),) }\r
  if ty == "award" { return (m.data.items.map(award-row),) }\r
  if ty == "summary" {\r
    let paras = m.data.text.split("\\n").map(x => x.trim()).filter(x => x != "")\r
    return (paras.map(x => par(justify: true, emphasize(x))),)\r
  }\r
  let f = (\r
    education: education-units,\r
    work: experience-units,\r
    internship: experience-units,\r
    project: project-units,\r
    research: research-units,\r
  ).at(ty)\r
  m.data.items.map(f)\r
}\r
\r
// 一个模块：标题与第一个单元绑在一起，之后的单元之间按「要点间距 / 条目间距」分隔\r
#let render-section(head, items, after-head: 2mm) = {\r
  if items.len() == 0 { return }\r
  block(breakable: false, {\r
    head\r
    v(if compact { after-head * 0.65 } else { after-head })\r
    items.at(0).at(0)\r
  })\r
  for (i, units) in items.enumerate() {\r
    if i > 0 { gap(t.itemGapMm) }\r
    for (j, u) in units.enumerate() {\r
      if i == 0 and j == 0 { continue }\r
      gap(t.paragraphGapMm)\r
      u\r
    }\r
  }\r
}\r
\r
// 依次渲染一组模块，模块之间用「模块间距」\r
#let render-modules(modules, section-head, skills-width: text-width, allow-two-columns: true, after-head: 2mm) = {\r
  for (i, m) in modules.enumerate() {\r
    if i > 0 { gap(t.sectionGapMm) }\r
    render-section(section-head(module-labels.at(m.type), m.type), module-items(m, skills-width: skills-width, allow-two-columns: allow-two-columns), after-head: after-head)\r
  }\r
}\r
\r
// 正文模块：基本信息和求职意向都放在页眉里\r
#let basic-module = doc-modules.find(m => m.type == "basic_info")\r
#let body-modules = doc-modules.filter(m => m.type != "basic_info" and m.type != "job_intention")\r
`,it=`// 如页 · classic「经典 · 简洁」
// 面向投递的默认模板：白底、单一主色、无大面积色块，打印和 ATS 解析都稳妥。
// 页眉：左栏姓名 + 求职意向（主色竖条收边），右栏联系方式小表格；照片在最右。
// 模块标题：主色方块 + 粗体标题 + 一条贯穿到右边的细线。原创版式。
#import "common.typ": *

#set page(width: 210mm, height: page-height, margin: page-margin, footer: page-footer)
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
#set par(leading: lead, spacing: lead, justify: true)
#set block(spacing: 0pt)
#date-style.update("plain")

#let section-head(title, type) = block(breakable: false, {
  grid(
    columns: (auto, auto, 1fr),
    column-gutter: 0.5em,
    align: (left + horizon, left + horizon, left + horizon),
    rect(width: 0.32em, height: 0.95em, fill: accent, radius: 0.5pt),
    text(size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.08em)[#title],
    line(length: 100%, stroke: 0.7pt + accent.lighten(55%)),
  )
})

// 页眉：左右两栏。左栏是姓名和求职意向，左边一条主色竖条把它们收成一块；
// 右栏是联系方式，图标 + 文字排成整齐的小表格（四项以上两列），不再挤成一长行。
// 底部一条细线，左端一段主色粗线压在上面。照片（如有）在最右侧。
#let header() = {
  let d = if basic-module != none { basic-module.data } else { (:) }
  let name = if basic-module != none {
    text(size: t.namePt * 1.12pt, weight: "bold", fill: ink, tracking: 0.12em)[#d.name]
  }
  // 求职意向拆成两行：岗位单独一行（主色加粗），城市、到岗、薪资等放下一行的灰色小字；
  // 每项是一个不可拆的盒子，放不下时整项换行，不会把「可实习 6 个月」拆成两半
  let it = if intention-module != none { intention-module.data } else { (:) }
  let role = get(it, "role")
  let rest = (get(it, "city"), get(it, "availability"), get(it, "salary")).filter(x => x != none)
  let lhs = {
    set par(justify: false, leading: lead * 0.8)
    if name != none { block(name) }
    if role != none {
      v(lead + 1.6mm)
      block(text(size: body-size * 1.08, weight: "bold", fill: accent)[#icon("target", size: 0.88em) #h(0.15em) #role])
    }
    if rest.len() > 0 {
      v(lead + 0.6mm)
      block(text(size: meta-size, fill: muted, rest.map(x => box[#x]).join([#h(0.5em)#text(fill: hairline.darken(25%))[|]#h(0.5em)])))
    }
  }
  let items = contact-items(d)
  let contacts = if items.len() > 0 {
    let cols = if items.len() >= 4 { 2 } else { 1 }
    text(size: meta-size, fill: ink.lighten(12%), grid(
      columns: cols,
      column-gutter: 5mm,
      row-gutter: lead + 1.4mm,
      ..items.map(((ic, c)) => box[#icon(ic, color: accent) #h(0.25em) #c]),
    ))
  }
  let bar = block(stroke: (left: 1.3mm + accent), inset: (left: 4.2mm, y: 0.6mm), lhs)
  let cells = (bar,)
  let cols = (1fr,)
  if contacts != none { cells.push(contacts); cols.push(auto) }
  if photo-path != none { cells.push(photo-box(20mm)); cols.push(20mm) }
  block(breakable: false, width: 100%, {
    grid(columns: cols, column-gutter: 6mm, align: horizon, ..cells)
    v(3.6mm)
    block(width: 100%, {
      line(length: 100%, stroke: 0.5pt + accent.lighten(55%))
      place(top + left, dy: -0.7pt, line(length: 26mm, stroke: 1.9pt + accent))
    })
  })
}

#header()
#if body-modules.len() > 0 { gap(t.sectionGapMm + 0.5) }
#render-modules(body-modules, section-head, after-head: 2mm)
`,at=`// 如页 · minimal「极简 · 黑白」
// 只用黑、深灰两种颜色，没有图标和色块：彩色打印、黑白打印、系统解析结果都一样。
// 姓名左对齐，下面一行纯文字联系方式；模块标题加宽字距，下方一条贯穿全宽的黑色细线。原创版式。
// 主题色在这套模板里不生效：排版时固定使用黑白色板 mono（见 templates/src/index.ts 的 fixedTheme）。
#import "common.typ": *

#let black = rgb("#111111")
#set page(width: 210mm, height: page-height, margin: page-margin, footer: page-footer)
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
#set par(leading: lead, spacing: lead, justify: true)
#set block(spacing: 0pt)
#date-style.update("plain")

#let section-head(title, type) = block(breakable: false, {
  text(size: t.headingPt * 1pt, weight: "bold", fill: black, tracking: 0.22em)[#title]
  v(if compact { 0.8mm } else { 1.2mm })
  line(length: 100%, stroke: 0.9pt + black)
})

#let header() = {
  let rows = ()
  if basic-module != none {
    rows.push(text(size: t.namePt * 1.1pt, weight: "bold", fill: black, tracking: 0.06em)[#basic-module.data.name])
  }
  if intention-module != none {
    let r = intention-row(intention-module.data, role-color: black, color: ink, sep-color: muted)
    if r != none { rows.push(r) }
  }
  if basic-module != none {
    let c = contact-text(basic-module.data, sep: text(fill: muted)[#h(0.5em)|#h(0.5em)])
    if c != none { rows.push(text(size: meta-size, fill: muted, c)) }
  }
  let body = {
    set par(justify: false)
    for (i, l) in rows.enumerate() {
      if i == 1 { v(lead + 2mm) } else if i > 1 { v(lead + 0.8mm) }
      block(l)
    }
  }
  block(breakable: false, if photo-path != none {
    grid(columns: (1fr, 20mm), column-gutter: 6mm, align: (left + bottom, right + top), body, photo-box(20mm))
  } else { body })
}

#header()
#if body-modules.len() > 0 { gap(t.sectionGapMm + 0.8) }
#render-modules(body-modules, section-head, after-head: 1.8mm)
`,st=`// 如页 · elegant「雅致 · 衬线」
// 页眉居中：上下各一组主色双细线，夹着宋体姓名、求职意向和联系方式。
// 模块标题居中，左右两段渐隐短线托住衬线标题；正文用黑体保证小字号清晰。原创版式。
#import "common.typ": *

#set page(width: 210mm, height: page-height, margin: page-margin, footer: page-footer)
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
#set par(leading: lead, spacing: lead, justify: true)
#set block(spacing: 0pt)
#date-style.update("accent")

#let double-rule = {
  line(length: 100%, stroke: 1.1pt + accent)
  v(0.7mm)
  line(length: 100%, stroke: 0.4pt + accent)
}

#let section-head(title, type) = block(breakable: false, width: 100%, grid(
  columns: (1fr, auto, 1fr),
  column-gutter: 0.8em,
  align: (right + horizon, center + horizon, left + horizon),
  line(length: 70%, stroke: 0.8pt + gradient.linear(white, accent2.lighten(20%), angle: 0deg)),
  text(font: serif, size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.3em)[#title],
  line(length: 70%, stroke: 0.8pt + gradient.linear(accent2.lighten(20%), white, angle: 0deg)),
))

#let header() = {
  let lines = ()
  if basic-module != none {
    lines.push(text(font: serif, size: t.namePt * 1.12pt, weight: "bold", fill: ink, tracking: 0.35em)[#basic-module.data.name])
  }
  if intention-module != none {
    let r = intention-row(intention-module.data)
    if r != none { lines.push(r) }
  }
  if basic-module != none {
    let c = contact-row(basic-module.data, icon-color: accent2)
    if c != none { lines.push(c) }
  }
  block(breakable: false, width: 100%, {
    double-rule
    v(3.2mm)
    centered-header(lines, photo-w: 19mm, first-gap: 2.2mm, rest-gap: 1mm)
    v(3.2mm)
    // 下方双线与上方镜像：细线在上
    line(length: 100%, stroke: 0.4pt + accent)
    v(0.7mm)
    line(length: 100%, stroke: 1.1pt + accent)
  })
}

#header()
#if body-modules.len() > 0 { gap(t.sectionGapMm + 0.6) }
#render-modules(body-modules, section-head, after-head: 2.2mm)
`,ot=`// 如页 · timeline「时间轴」\r
// 经历类模块按时间轴排：左侧时间列（主色、右对齐），中间一条竖线和圆点，右侧是条目内容。\r
// 模块标题是浅色底的圆角标签条；页眉姓名在左、联系方式竖排在右。原创版式。\r
#import "common.typ": *\r
\r
#set page(width: 210mm, height: page-height, margin: page-margin, footer: page-footer)\r
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)\r
#set par(leading: lead, spacing: lead, justify: true)\r
#set block(spacing: 0pt)\r
\r
#let date-w = 21mm\r
#let date-pad = 3.4mm\r
#let rail-gap = 4.2mm\r
\r
#let section-head(title, type) = block(breakable: false, width: 100%, fill: tint, radius: 1.2mm, inset: (x: 2.6mm, y: 1.3mm), grid(\r
  columns: (auto, auto),\r
  column-gutter: 0.5em,\r
  align: (left + horizon, left + horizon),\r
  svg-image(section-icon-svg.at(type, default: section-icon-svg.project), accent, 1em),\r
  text(size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.1em)[#title],\r
))\r
\r
// 时间列文字：起止日期分两行，窄列里不折行\r
#let when(a, b) = {\r
  let x = fmt-date(a)\r
  let y = fmt-date(b)\r
  set par(justify: false)\r
  set text(size: meta-size, number-width: "tabular")\r
  align(right, {\r
    if x != "" { text(fill: accent, weight: "medium")[#x] }\r
    if y != "" { linebreak(); text(fill: muted)[– #y] }\r
  })\r
}\r
\r
// 一个带时间轴的条目：左列日期，右列内容，右列左边是竖线，标题处有一个圆点\r
#let rail-item(date, units) = grid(\r
  columns: (date-w, 1fr),\r
  column-gutter: date-pad,\r
  date,\r
  block(stroke: (left: 0.9pt + accent.lighten(60%)), inset: (left: rail-gap), {\r
    place(top + left, dx: -rail-gap - 1.15mm, dy: 0.32em, circle(radius: 1.15mm, fill: white, stroke: 1.4pt + accent))\r
    for (j, u) in units.enumerate() {\r
      if j > 0 { gap(t.paragraphGapMm) }\r
      u\r
    }\r
  }),\r
)\r
\r
// 不按时间排的模块（技能、获奖、论文、自我评价）占满整行，不浪费时间列的宽度\r
#let plain-item(units) = block({\r
  for (j, u) in units.enumerate() {\r
    if j > 0 { gap(t.paragraphGapMm) }\r
    u\r
  }\r
})\r
\r
#let timed = ("education", "work", "internship", "project", "research")\r
\r
#let header() = {\r
  let lhs = {\r
    set par(justify: false)\r
    if basic-module != none {\r
      block(text(size: t.namePt * 1.15pt, weight: "bold", fill: accent, tracking: 0.08em)[#basic-module.data.name])\r
    }\r
    if intention-module != none {\r
      let r = intention-row(intention-module.data)\r
      if r != none { v(lead + 2.2mm); block(r) }\r
    }\r
  }\r
  let items = if basic-module != none { contact-items(basic-module.data) } else { () }\r
  let rhs = if items.len() > 0 {\r
    set align(left)\r
    set par(justify: false)\r
    text(size: meta-size, fill: muted, stack(spacing: lead * 0.7, ..items.map(((ic, c)) => box[#icon(ic, color: accent) #h(0.3em) #c])))\r
  }\r
  let cols = if photo-path != none { (1fr, auto, 20mm) } else { (1fr, auto) }\r
  let cells = (lhs, rhs) + if photo-path != none { (photo-box(20mm),) } else { () }\r
  block(breakable: false, {\r
    grid(columns: cols, column-gutter: 6mm, align: (left + horizon, left + horizon, right + top), ..cells)\r
    v(3mm)\r
    line(length: 100%, stroke: 1.2pt + accent)\r
  })\r
}\r
\r
#header()\r
#if body-modules.len() > 0 { gap(t.sectionGapMm) }\r
#for (i, m) in body-modules.enumerate() {\r
  if i > 0 { gap(t.sectionGapMm) }\r
  let items = module-items(m)\r
  if items.len() == 0 { continue }\r
  // 时间轴模块的日期在左列；获奖、论文这类单行条目的日期仍放在行尾\r
  date-style.update(if m.type in timed { "none" } else { "accent" })\r
  let rows = if m.type in timed {\r
    m.data.items.zip(items).map(((it, units)) => rail-item(when(get(it, "start"), get(it, "end")), units))\r
  } else {\r
    items.map(plain-item)\r
  }\r
  // 标题与第一个条目绑在一起，避免标题落在页底\r
  block(breakable: false, {\r
    section-head(module-labels.at(m.type), m.type)\r
    v(if compact { 1.4mm } else { 2.2mm })\r
    rows.at(0)\r
  })\r
  for r in rows.slice(1) {\r
    gap(t.itemGapMm)\r
    r\r
  }\r
}\r
`,lt=`// 如页 · campus-serif「校招 · 横幅」
// 页顶通栏渐变横幅（白色姓名、意向、联系方式），模块标题配渐变圆形图标，日期是浅色胶囊。原创版式。
#import "common.typ": *

#set page(width: 210mm, height: page-height, margin: page-margin, footer: page-footer)
// 文字盒高度固定为 1em，于是行距 = lineHeight × 字号，和 CSS 的 line-height 语义一致
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
#set par(leading: lead, spacing: lead, justify: true)
#set block(spacing: 0pt)
#date-style.update("pill")

// 模块标题：渐变圆形图标 + 衬线标题 + 渐淡的长线
#let section-head(title, type) = block(breakable: false, grid(
  columns: (auto, auto, 1fr),
  column-gutter: 0.55em,
  align: (left + horizon, left + horizon, left + horizon),
  section-badge(type, fill: grad-v),
  text(font: serif, size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.08em)[#title],
  line(length: 100%, stroke: 1.4pt + gradient.linear(accent2.lighten(55%), white, angle: 0deg)),
))

// 页顶横幅：铺满纸张宽度并顶到纸边（负内边距抵消页边距），内容仍与正文左右对齐
#let banner() = {
  let lines = ()
  if basic-module != none {
    lines.push(text(font: serif, size: t.namePt * 1.18pt, weight: "bold", fill: white, tracking: 0.16em)[#basic-module.data.name])
  }
  if intention-module != none {
    let r = intention-row(intention-module.data, role-color: white, color: white.transparentize(12%), sep-color: white.transparentize(55%))
    if r != none { lines.push(r) }
  }
  if basic-module != none {
    let c = contact-row(basic-module.data, color: white.transparentize(8%), icon-color: white)
    if c != none { lines.push(c) }
  }
  if lines.len() == 0 { return }
  let body = for (i, l) in lines.enumerate() {
    if i == 1 { v(lead + 2.4mm) } else if i > 1 { v(lead + 1.2mm) }
    block(l)
  }
  let content = if photo-path != none {
    grid(columns: (1fr, 23mm), column-gutter: 6mm, align: (left + horizon, right + horizon), body, box(stroke: 1.6pt + white, radius: 1.6mm, clip: true, photo-box(23mm)))
  } else { body }
  pad(
    left: -margin.left * 1mm,
    right: -margin.right * 1mm,
    top: -margin.top * 1mm,
    block(
      width: 100%,
      fill: grad-h,
      inset: (left: margin.left * 1mm, right: margin.right * 1mm, top: 10mm, bottom: 8mm),
      content,
    ),
  )
}

#banner()
#if body-modules.len() > 0 and (basic-module != none or intention-module != none) { gap(t.sectionGapMm + 1) }
#render-modules(body-modules, section-head, after-head: 2.2mm)
`,ct=`// 如页 · social-sans「社招 · 侧条」
// 纸张左缘一条渐变竖色条；大号姓名、彩色图标的联系方式竖排在右；
// 模块标题是「彩色线性图标 + 粗体标题 + 渐变短条 + 细线」。全无衬线，信息密度高。原创版式。
#import "common.typ": *

#set page(
  width: 210mm,
  height: page-height,
  margin: page-margin,
  footer: page-footer,
  background: place(top + left, rect(width: 4.2mm, height: 100%, fill: grad-v)),
)
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
#set par(leading: lead, spacing: lead, justify: true)
#set block(spacing: 0pt)
#date-style.update("accent")

#let section-head(title, type) = block(breakable: false, {
  grid(
    columns: (auto, auto, 1fr),
    column-gutter: 0.45em,
    align: (left + horizon, left + horizon, left + horizon),
    box(baseline: 0.15em, svg-image(section-icon-svg.at(type, default: section-icon-svg.project), accent2, 1.05em)),
    text(size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.1em)[#title],
    [],
  )
  v(if compact { 0.9mm } else { 1.3mm })
  // 一条渐变短粗条接一条细线
  grid(
    columns: (3.2em, 1fr),
    align: horizon,
    rect(width: 100%, height: 1.6pt, fill: gradient.linear(accent, accent2, angle: 0deg)),
    line(length: 100%, stroke: 0.6pt + hairline),
  )
})

#let header() = {
  let left-lines = ()
  if basic-module != none {
    left-lines.push(text(size: t.namePt * 1.2pt, weight: "bold", fill: ink, tracking: 0.08em)[#basic-module.data.name])
  }
  if intention-module != none {
    let r = intention-row(intention-module.data)
    if r != none { left-lines.push(box(fill: tint, radius: 99pt, inset: (x: 0.7em), outset: (y: 0.32em), r)) }
  }
  let lhs = for (i, l) in left-lines.enumerate() {
    if i > 0 { v(lead + 2.6mm) }
    block(l)
  }
  // 联系方式竖排、右对齐，彩色图标在右
  let items = if basic-module != none { contact-items(basic-module.data) } else { () }
  let rhs = if items.len() > 0 {
    set align(right)
    set par(justify: false)
    text(size: meta-size, fill: muted, stack(spacing: lead * 0.75, ..items.map(((ic, c)) => box[#c #h(0.3em) #icon(ic, color: accent2)])))
  }
  let cols = if photo-path != none { (1fr, auto, 22mm) } else { (1fr, auto) }
  let cells = (lhs, rhs) + if photo-path != none { (photo-box(22mm),) } else { () }
  block(breakable: false, {
    grid(columns: cols, column-gutter: 6mm, align: (left + bottom, right + bottom, right + top), ..cells)
    v(3mm)
    rect(width: 100%, height: 2pt, fill: grad-h)
  })
}

#header()
#if body-modules.len() > 0 { gap(t.sectionGapMm) }
#render-modules(body-modules, section-head, after-head: 1.9mm)
`,mt=`// 如页 · split-compact「双栏 · 深色侧栏」
// 左侧整高深色渐变侧栏（白字）：照片、姓名、意向、联系方式，以及技能（半透明胶囊）/ 教育 / 获奖；
// 右侧白底：经历、项目、科研、论文，标题配渐变圆形图标，日期是浅色胶囊。
// 两栏自动平衡：用 measure() 实测几种分配方式的两栏高度，选总高最矮的一种，避免一边满一边空。
// 侧栏不靠拉伸字号填满，内容自上而下排。原创版式。
#import "common.typ": *

#let sidebar-w = 58mm
#let gutter = 7mm
#let main-w = 210mm - (margin.left + margin.right) * 1mm - sidebar-w - gutter
// 侧栏底色宽度：左页边 + 侧栏 + 栏距的一半多一点（让白字离色块边缘有呼吸感）
#let band-w = margin.left * 1mm + sidebar-w + gutter * 0.55
#let on-dark = white
#let on-dark-soft = white.transparentize(22%)

#set page(
  width: 210mm,
  height: page-height,
  margin: page-margin,
  footer: page-footer,
  background: place(top + left, rect(width: band-w, height: 100%, fill: grad-v)),
)
#set text(font: sans, size: body-size, fill: ink, lang: "zh", region: "cn", top-edge: 0.88em, bottom-edge: -0.12em)
// 栏宽较窄，两端对齐会在中英文之间拉出大空隙，所以左对齐
#set par(leading: lead, spacing: lead, justify: false)
#set block(spacing: 0pt)
#date-style.update("pill")

#let main-head(title, type) = block(breakable: false, grid(
  columns: (auto, auto, 1fr),
  column-gutter: 0.5em,
  align: (left + horizon, left + horizon, left + horizon),
  section-badge(type, fill: grad-v, size: 1.45em),
  text(size: t.headingPt * 1pt, weight: "bold", fill: accent, tracking: 0.1em)[#title],
  line(length: 100%, stroke: 1.2pt + gradient.linear(accent2.lighten(55%), white, angle: 0deg)),
))

#let side-head(title) = block(breakable: false, {
  text(size: t.headingPt * 1pt, weight: "bold", fill: on-dark, tracking: 0.14em)[#title]
  v(1.1mm)
  rect(width: 2.4em, height: 1.6pt, fill: bright)
})

#let side-bullet(s) = grid(
  columns: (0.9em, 1fr),
  align: (left + top, left + top),
  box(height: 1em, align(horizon, move(dy: 0.08em, dot(0.3em, bright)))),
  text(fill: on-dark-soft)[#s],
)

// 侧栏里的技能：分类名在上，技能是半透明白色胶囊
#let side-skills(m) = {
  let cats = skill-cats(m.data.categories)
  (cats.map(c => block({
    text(weight: "bold", fill: on-dark)[#c.name]
    v(lead * 0.6 + 0.6mm)
    let items = nonempty(c.items)
    // 技能名做成胶囊；有一项像句子（汉字超过 4 个，或总长超过 22）时整类改成普通文字，胶囊折行很难看
    let is-name(it) = it.matches(regex("[\\p{Han}]")).len() <= 4 and it.clusters().len() <= 22
    if items.all(is-name) {
      par(leading: lead + 0.9mm, items.map(it => box(
        fill: white.transparentize(84%),
        radius: 99pt,
        inset: (x: 0.55em),
        outset: (y: 0.22em),
        text(size: meta-size, fill: on-dark)[#it],
      )).join(h(0.35em)))
    } else {
      text(fill: on-dark-soft)[#items.join("；")]
    }
  })),)
}

// 侧栏里的教育：学校、专业学位、日期各占一行
#let side-education(m) = m.data.items.map(item => {
  let head = block({
    text(weight: "bold", fill: on-dark)[#item.school]
    let sub = (get(item, "major"), get(item, "degree")).filter(x => x != none)
    if sub.len() > 0 { linebreak(); text(fill: bright.lighten(30%))[#sub.join(" · ")] }
    let d = date-range(get(item, "start"), get(item, "end"))
    if d != none { linebreak(); text(size: meta-size, fill: on-dark-soft)[#d] }
  })
  item-units(head, nonempty(get(item, "highlights")).map(side-bullet))
})

#let side-awards(m) = (m.data.items.map(item => block(breakable: false, {
  text(weight: "medium", fill: on-dark)[#item.name]
  let sub = (get(item, "issuer"), fmt-date(get(item, "date"))).filter(x => x != none and x != "")
  if sub.len() > 0 { linebreak(); text(size: meta-size, fill: on-dark-soft)[#sub.join(" · ")] }
  if has(item, "description") { linebreak(); text(size: meta-size, fill: on-dark-soft)[#item.description] }
})),)

// 能放进侧栏的模块：技能（没有描述句时；整句描述在 58mm 里放不下）、教育、获奖
#let side-capable(m) = m.type in ("skills", "education", "award") and not has-skill-notes(m)

#let sidebar(side-modules) = {
  if photo-path != none {
    box(stroke: 1.6pt + white, radius: 1.6mm, clip: true, photo-box(26mm))
    v(4.5mm)
  }
  if basic-module != none {
    block(text(size: t.namePt * 1.1pt, weight: "bold", fill: on-dark, tracking: 0.12em)[#basic-module.data.name])
  }
  if intention-module != none {
    let d = intention-module.data
    let role = get(d, "role")
    let rest = (get(d, "city"), get(d, "availability"), get(d, "salary")).filter(x => x != none)
    if role != none { v(lead + 1.4mm); block(text(weight: "bold", fill: bright.lighten(35%))[#role]) }
    for r in rest { v(lead * 0.6); block(text(size: meta-size, fill: on-dark-soft)[#r]) }
  }
  let items = if basic-module != none { contact-items(basic-module.data) } else { () }
  if items.len() > 0 {
    v(lead + 3.4mm)
    text(size: meta-size, fill: on-dark, stack(spacing: lead + 0.5mm, ..items.map(((ic, c)) => grid(
      columns: (1.35em, 1fr),
      align: (left + top, left + top),
      icon(ic, color: bright.lighten(30%)),
      c,
    ))))
  }
  for m in side-modules {
    gap(t.sectionGapMm)
    let items = if m.type == "skills" { side-skills(m) } else if m.type == "education" { side-education(m) } else { side-awards(m) }
    render-section(side-head(module-labels.at(m.type)), items, after-head: 2mm)
  }
}

#let main-column(main-modules) = render-modules(main-modules, main-head, skills-width: main-w, after-head: 1.8mm)

// 几种分配方式：哪些侧栏模块真的放进侧栏。按偏好排列（越靠前越保留经典布局）
#let side-options = (
  ("skills", "education", "award"),
  ("skills", "award"),
  ("skills", "education"),
  ("skills",),
)

#context {
  let best = none
  for opt in side-options {
    let side = body-modules.filter(m => side-capable(m) and m.type in opt)
    let main = body-modules.filter(m => not (side-capable(m) and m.type in opt))
    let hs = measure(block(width: sidebar-w, sidebar(side))).height
    let hm = measure(block(width: main-w, main-column(main))).height
    let score = calc.max(hs, hm)
    // 至少矮 3mm 才换方案，避免为了一点点高度把教育挪来挪去
    if best == none or score < best.score - 3mm { best = (score: score, side: side, main: main) }
  }
  grid(columns: (sidebar-w, 1fr), column-gutter: gutter, sidebar(best.side), main-column(best.main))
}
`;const dt=["NotoSansSC-Regular.otf","NotoSansSC-Bold.otf","NotoSerifSC-Bold.otf"];async function ht(r){const e=await fetch(r);if(!e.ok)throw new Error(`加载失败：${r}（HTTP ${e.status}）。字体需要先运行 pnpm fonts 生成。`);return new Uint8Array(await e.arrayBuffer())}let J=null;function ut(r){const e=r.endsWith("/")?r:`${r}/`;return J??(J=(async()=>{const[t,n]=await Promise.all([Promise.all(dt.map(i=>ht(`${e}fonts/${i}`))),fetch(`${e}fonts/charset.txt`).then(i=>i.ok?i.text():"")]);return $e(S,b,{compilerWasm:`${e}wasm/compiler.wasm`,rendererWasm:`${e}wasm/renderer.wasm`,fonts:t}),{engine:new Ne(new Ue(S)),templates:nt({common:rt,classic:it,minimal:at,elegant:st,timeline:ot,"campus-serif":lt,"social-sans":ct,"split-compact":mt}),charset:n}})()),J}class pt{constructor(e,t){h(this,"engine");h(this,"templates");this.engine=e,this.templates=t}template(e){return this.templates.get(e.layout.templateId)??this.templates.get("classic")}async preview(e,t=e.layout.pageMode){const n=this.template(e),i=await this.engine.layout(e,n,t);i.status.startsWith("fitted")&&i.metrics.moduleHeights.length===0&&await this.engine.attachBreakdown(e,n,i.tokens,i.metrics,!1);const a=i.status==="overflow",o=a?"auto":i.pageHeight,s=await this.engine.svg(e,n,i.tokens,o),l=i.status==="paginated"?i.metrics.pageCount*u:a?i.metrics.contentHeightMm:i.metrics.pageHeightMm;return{svg:s,result:i,boardMm:l}}async exportPdf(e,t){var s;const n=this.template(e),i=await this.engine.layout(e,n,t);if(i.status==="overflow")return{kind:"overflow"};if(i.status==="too-long")return{kind:"too-long",message:((s=i.suggestions)==null?void 0:s[0])??"内容过长"};const{pdf:a,pageCount:o}=await this.engine.exportPdf(e,n,i);return{kind:"pdf",pdf:a,pageCount:o}}}const ie=Symbol("superseded");class ft{constructor(){h(this,"running",!1);h(this,"exports",[]);h(this,"preview",null)}schedulePreview(e){return new Promise((t,n)=>{var i;(i=this.preview)==null||i.resolve(ie),this.preview={run:e,resolve:t,reject:n},this.pump()})}scheduleExport(e){return new Promise((t,n)=>{this.exports.push({run:e,resolve:t,reject:n}),this.pump()})}async pump(){if(!this.running){this.running=!0;try{for(;;){const e=this.exports.shift()??this.takePreview();if(!e)break;try{e.resolve(await e.run())}catch(t){e.reject(t)}}}finally{this.running=!1}}}takePreview(){const e=this.preview;return this.preview=null,e}}const ae=self,V=new ft;let _=null;const w=(r,e=[])=>ae.postMessage(r,e),K=r=>r instanceof Error?r.message:String(r);ae.onmessage=async r=>{const e=r.data;if(e.type==="init"){_??(_=ut(e.base).then(t=>(w({type:"ready",charset:t.charset}),new pt(t.engine,t.templates)))),_.catch(t=>w({type:"init-error",message:K(t)}));return}if(!_)return w({type:"error",id:e.id,message:"排版引擎还没有初始化"});try{const t=await _;if(e.type==="preview"){const n=await V.schedulePreview(()=>t.preview(e.doc,e.mode));w(n===ie?{type:"superseded",id:e.id}:{type:"preview",id:e.id,data:n})}else{const n=await V.scheduleExport(()=>t.exportPdf(e.doc,e.mode));w({type:"export",id:e.id,outcome:n},n.kind==="pdf"?[n.pdf.buffer]:[])}}catch(t){w({type:"error",id:e.id,message:K(t)})}};export{ye as L,N as T,fe as b,f as k};
