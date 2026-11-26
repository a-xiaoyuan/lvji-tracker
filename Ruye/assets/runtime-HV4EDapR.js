const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./renderer-DOTnudzi.js","./index-DgDIp0CP.js","./index-rxyd7Qjg.css"])))=>i.map(i=>d[i]);
var U=Object.defineProperty;var $=(n,e,t)=>e in n?U(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var s=(n,e,t)=>$(n,typeof e!="symbol"?e+"":e,t);import{_ as p,L as G,c as q}from"./index-DgDIp0CP.js";function V(n,e,t){n.setCompilerInitOptions({getModule:()=>t.compilerWasm}),n.setRendererInitOptions({getModule:()=>t.rendererWasm}),n.use(e.disableDefaultFontAssets(),...t.fonts.map(r=>e.preloadFontData(r)))}class N{constructor(e){s(this,"snippet");s(this,"queue",Promise.resolve());this.snippet=e}run(e,t){const r=this.queue.then(async()=>{await this.snippet.resetShadow();for(const[i,l]of Object.entries(e.files))typeof l=="string"?await this.snippet.addSource(i,l):await this.snippet.mapShadow(i,l);return t()});return this.queue=r.catch(()=>{}),r}svg(e){return this.run(e,()=>this.snippet.svg({mainFilePath:e.main,inputs:{}}))}pdf(e){return this.run(e,async()=>{const t=await this.snippet.pdf({mainFilePath:e.main,inputs:{}});if(!t)throw new Error("Typst 没有返回 PDF（可能是编译错误）");return t})}}const W=["DejaVuSansMono-Bold.ttf","DejaVuSansMono-BoldOblique.ttf","DejaVuSansMono-Oblique.ttf","DejaVuSansMono.ttf","LibertinusSerif-Bold.otf","LibertinusSerif-BoldItalic.otf","LibertinusSerif-Italic.otf","LibertinusSerif-Regular.otf","LibertinusSerif-Semibold.otf","LibertinusSerif-SemiboldItalic.otf","NewCM10-Bold.otf","NewCM10-BoldItalic.otf","NewCM10-Italic.otf","NewCM10-Regular.otf","NewCMMath-Bold.otf","NewCMMath-Book.otf","NewCMMath-Regular.otf"],J=["InriaSerif-Bold.ttf","InriaSerif-BoldItalic.ttf","InriaSerif-Italic.ttf","InriaSerif-Regular.ttf","Roboto-Regular.ttf","NotoSerifCJKsc-Regular.otf"],H=["TwitterColorEmoji.ttf","NotoColorEmoji-Regular-COLR.subset.ttf"];function X(){return v([],{assets:!1})}function Z(n){return v([],n)}function K(n){var t,r;const e=[];if(n&&(n==null?void 0:n.assets)!==!1&&((t=n==null?void 0:n.assets)!=null&&t.length)&&((r=n==null?void 0:n.assets)==null?void 0:r.length)>0){let i={text:"https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/",_:"https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/"},l=n.assetUrlPrefix??i;typeof l=="string"?l={_:l}:l={...i,...l};for(const a of Object.keys(l)){const m=l[a];m[m.length-1]!=="/"&&(l[a]=m+"/")}const o=(a,m)=>m.map(u=>(l[a]||l._)+u);for(const a of n.assets)switch(a){case"text":e.push(...o(a,W));break;case"cjk":e.push(...o(a,J));break;case"emoji":e.push(...o(a,H));break}}return e}function v(n,e){const t=K(e),r=async(i,{ref:l,builder:o})=>{e!=null&&e.fetcher&&l.setFetcher(e.fetcher),await l.loadFonts(o,[...n,...t])};return r._preloadRemoteFontOptions=e,r._kind="fontLoader",r}function z(n){return async(e,{builder:t})=>new Promise(r=>{t.set_package_registry(n,function(i){return n.resolve(i,this)}),r()})}function P(n){return async(e,t)=>{var r;if(t.alreadySetAccessModel)throw new Error(`already set some assess model before: ${(r=t.alreadySetAccessModel.constructor)==null?void 0:r.name}(${t.alreadySetAccessModel})`);return t.alreadySetAccessModel=n,new Promise(i=>{t.builder.set_access_model(n,l=>{const o=n.getMTime(l);return o?o.getTime():0},l=>n.isFile(l)||!1,l=>n.getRealPath(l)||l,l=>n.readAll(l)),i()})}}class Q{constructor(){s(this,"loadedFonts",new Set);s(this,"fetcher",fetch)}setFetcher(e){this.fetcher=e}async loadFonts(e,t){const r=new Function("m","return import(m)"),i=this.fetcher||(this.fetcher=await(async function(){const{fetchBuilder:a,FileSystemCache:m}=await r("node-fetch-cache"),u=new m({cacheDirectory:".cache/typst/fonts"}),d=a.withCache(u);return function(f,y){const D=setTimeout(()=>{console.warn("font fetching is stucking:",f)},15e3);return d(f,y).finally(()=>{clearTimeout(D)})}})()),l=t.filter(a=>a instanceof Uint8Array||typeof a=="object"&&"info"in a?!0:this.loadedFonts.has(a)?!1:(this.loadedFonts.add(a),!0)),o=await Promise.all(l.map(async a=>{if(a instanceof Uint8Array){await e.add_raw_font(a);return}if(typeof a=="object"&&"info"in a){await e.add_lazy_font(a,"blob"in a?a.blob:B(a));return}return new Uint8Array(await(await i(a)).arrayBuffer())}));for(const a of o)a&&await e.add_raw_font(a)}async build(e,t,r){const i={ref:this,builder:t,hooks:r};for(const l of(e==null?void 0:e.beforeBuild)??[])await l(void 0,i);return r.latelyBuild&&r.latelyBuild(i),await t.build()}}async function Y(n,e,t,r){var i;return await e.init((i=n==null?void 0:n.getModule)==null?void 0:i.call(n)),await new Q().build(n,new t,r)}function B(n){return()=>{const e=new XMLHttpRequest;return e.overrideMimeType("text/plain; charset=x-user-defined"),e.open("GET",n.url,!1),e.send(null),e.status===200&&(e.response instanceof String||typeof e.response=="string")?Uint8Array.from(e.response,t=>t.charCodeAt(0)):new Uint8Array}}class j{constructor(){s(this,"mTimes",new Map);s(this,"mData",new Map)}reset(){this.mTimes.clear(),this.mData.clear()}insertFile(e,t,r){this.mTimes.set(e,r),this.mData.set(e,t)}removeFile(e){this.mTimes.delete(e),this.mData.delete(e)}getMTime(e){if(e.startsWith("/@memory/")&&this.mTimes.has(e))return this.mTimes.get(e)}isFile(){return!0}getRealPath(e){return e}readAll(e){if(e.startsWith("/@memory/")&&this.mData.has(e))return this.mData.get(e)}}class S{constructor(e){s(this,"am");s(this,"cache",new Map);this.am=e}resolvePath(e){return`https://packages.typst.org/preview/${e.name}-${e.version}.tar.gz`}pullPackageData(e){const t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",this.resolvePath(e),!1),t.send(null),t.status===200&&(t.response instanceof String||typeof t.response=="string"))return Uint8Array.from(t.response,r=>r.charCodeAt(0))}resolve(e,t){if(e.namespace!=="preview")return;const r=this.resolvePath(e);if(this.cache.has(r))return this.cache.get(r)();const i=this.pullPackageData(e);if(!i)return;const l=`/@memory/fetch/packages/${e.namespace}/${e.name}/${e.version}`,o=[];t.untar(i,(m,u,d)=>{o.push([l+"/"+m,u,new Date(d)])});const a=()=>{for(const[m,u,d]of o)this.am.insertFile(m,u,d);return l};return this.cache.set(r,a),a()}}function ee(n){return Math.random().toString(36).replace("0.","")}const c=Symbol.for("reflexo-obj");var F;(function(n){n[n.PIXEL_PER_PT=3]="PIXEL_PER_PT"})(F||(F={}));const te=n=>{let e=!1,t;return()=>e?t:(e=!0,t=n())};class ne{constructor(e){s(this,"wasmBin");s(this,"initOnce");if(typeof e!="function")throw new Error("initFn is not a function");this.initOnce=te(async()=>{await e(this.wasmBin)})}async init(e){this.wasmBin=e,await this.initOnce()}}var w;(function(n){n[n.vector=0]="vector",n[n.pdf=1]="pdf",n[n._dummy=2]="_dummy"})(w||(w={}));var T;T=c;class O{constructor(e){s(this,T);this[c]=e}reset(){this[c].reset()}current(){return this[c].current()}setAttachDebugInfo(e){this[c].set_attach_debug_info(e)}}function re(){return new E}var C;C=c;class A{constructor(e){s(this,C);this[c]=e}compile(e){return this[c].compile(0,g(e==null?void 0:e.diagnostics))}compileHtml(e){return this[c].compile(1,g(e==null?void 0:e.diagnostics))}async query(e){return JSON.parse(this[c].query(0,e.selector,e.field))}title(){return this[c].title(0)}vector(e){return this[c].get_artifact(0,g(e==null?void 0:e.diagnostics))||{}}pdf(e){return this[c].get_artifact(1,g(e==null?void 0:e.diagnostics))||{}}}const L=n=>new ne(async e=>await n.default(e));function I(){return new k}class E{constructor(){s(this,"fontBuilderJs");s(this,"fontBuilder")}async init(e){var t,r;this.fontBuilderJs=await(((t=e==null?void 0:e.getWrapper)==null?void 0:t.call(e))||p(()=>import("./wasm-pack-shim-SZEsgprp.js"),[],import.meta.url)),await L(this.fontBuilderJs).init((r=e==null?void 0:e.getModule)==null?void 0:r.call(e)),this.fontBuilder=new this.fontBuilderJs.TypstFontResolverBuilder}async getFontInfo(e){return this.fontBuilder.get_font_info(e)}async addFontData(e){this.fontBuilder.add_raw_font(e)}async addLazyFont(e,t){return this.fontBuilder.add_lazy_font(e,t)}async build(e){const t=await this.fontBuilder.build(),r=await e(t);return t.free(),r}}const x=class x{constructor(){s(this,"compiler");s(this,"compilerJs")}async init(e){var u;this.compilerJs=await(((u=e==null?void 0:e.getWrapper)==null?void 0:u.call(e))||p(()=>import("./wasm-pack-shim-SZEsgprp.js"),[],import.meta.url));const t=this.compilerJs.TypstCompilerBuilder,r={...e||{}},i=r.beforeBuild??(r.beforeBuild=[]),l=i.some(d=>d._preloadRemoteFontOptions!==void 0),o=i.some(d=>{var f;return((f=d._preloadRemoteFontOptions)==null?void 0:f.assets)!==void 0}),a=i.some(d=>{var f;return((f=d._preloadRemoteFontOptions)==null?void 0:f.assets)===!1});if((!l||!o&&!a)&&i.push(v([],{assets:x.defaultAssets})),!i.some(d=>d._kind==="fontLoader"))throw new Error("TypstCompiler: no font loader found, please use font loaders, e.g. loadFonts or preloadSystemFonts");this.compiler=await Y(e,L(this.compilerJs),t,{})}setFonts(e){this.compiler.set_fonts(e)}compile(e){return new Promise(t=>{const r=this.compiler.snapshot(e.root,e.mainFilePath,M(e.inputs));if("incrementalServer"in e){t(r.incr_compile(e.incrementalServer[c],g(e.diagnostics)));return}t(r.get_artifact(e.format||w.vector,g(e.diagnostics)))})}async runWithWorld(e,t){const r=this.compiler.snapshot(e.root,e.mainFilePath,M(e.inputs));let i=await t(new A(r));return r.free(),i}query(e){return this.runWithWorld(e,async t=>JSON.parse(await t.query(e)))}getSemanticTokenLegend(){return new Promise(e=>{e(this.compiler.get_semantic_token_legend())})}getSemanticTokens(e){return new Promise(t=>{this.compiler.reset(),t(this.compiler.get_semantic_tokens(e.offsetEncoding||"utf-16",e.mainFilePath,e.resultId))})}async withIncrementalServer(e){const t=new O(this.compiler.create_incr_server());try{return await e(t)}finally{t[c].free()}}async getAst(e){return this.compiler.get_ast(e)}async reset(){await new Promise(e=>{this.compiler.reset(),e(void 0)})}addSource(e,t){if(arguments.length>2)throw new Error("use of addSource(path, source, isMain) is deprecated, please use addSource(path, source) instead");this.compiler.add_source(e,t)}mapShadow(e,t){this.compiler.map_shadow(e,t)}unmapShadow(e){this.compiler.unmap_shadow(e)}resetShadow(){this.compiler.reset_shadow()}renderPageToCanvas(){throw new Error("Please use the api TypstRenderer.renderToCanvas in v0.4.0")}};s(x,"defaultAssets",["text"]);let k=x;I._impl=k;function M(n){return n?Object.entries(n):void 0}function g(n){switch(n){case"none":return 1;case"unix":return 2;case"full":default:return 3}}const _=Object.freeze(Object.defineProperty({__proto__:null,get CompileFormatEnum(){return w},IncrementalServer:O,TypstFontBuilderDriver:E,TypstWorld:A,createTypstCompiler:I,createTypstFontBuilder:re},Symbol.toStringTag,{value:"Module"})),ie=typeof process<"u"&&process.versions!=null&&process.versions.node!=null;class h{constructor(e){s(this,"mainFilePath");s(this,"cc");s(this,"fr");s(this,"ex");s(this,"providers");s(this,"ccOptions");s(this,"exOptions");s(this,"prepareUseOnce");this.cc=(e==null?void 0:e.compiler)||h.buildLocalCompiler,this.fr=(e==null?void 0:e.fontResolver)||h.buildLocalFontResolver,this.ex=(e==null?void 0:e.renderer)||h.buildLocalRenderer,this.mainFilePath="/main.typ",this.providers=[]}setCompiler(e){this.cc=e}async getFontResolver(){return typeof this.fr=="function"?this.fr=await this.fr():this.fr}async getCompiler(){return typeof this.cc=="function"?this.cc=await this.cc():this.cc}async getCompilerReset(){const e=await this.getCompiler();return await e.reset(),e}setRenderer(e){this.ex=e}async getRenderer(){return typeof this.ex=="function"?this.ex=await this.ex():this.ex}use(...e){if(!this.providers)throw new Error("already prepare uses for instances");this.providers.push(...e)}static preloadFontFromUrl(e){return h.preloadFonts([e])}static preloadFontData(e){return h.preloadFonts([e])}static preloadFonts(e){return{key:"access-model",forRoles:["compiler"],provides:[v(e)]}}static disableDefaultFontAssets(){return{key:"access-model",forRoles:["compiler"],provides:[X()]}}static preloadFontAssets(e){return{key:"access-model",forRoles:["compiler"],provides:[Z(e)]}}static withAccessModel(e){return{key:"access-model",forRoles:["compiler"],provides:[P(e)]}}static withPackageRegistry(e){return{key:"package-registry",forRoles:["compiler"],provides:[z(e)]}}static fetchPackageRegistry(e){const t=e||new j,r=[...e?[]:[P(t)],z(new S(t))];return{key:"package-registry$fetch",forRoles:["compiler"],provides:r}}static fetchPackageBy(e,t){class r extends S{pullPackageData(l){return t(l,this.resolvePath(l))}}return{key:"package-registry$lambda",forRoles:["compiler"],provides:[z(new r(e))]}}setCompilerInitOptions(e){this.requireIsUninitialized("compiler",this.cc),this.ccOptions=e}setRendererInitOptions(e){this.requireIsUninitialized("renderer",this.ex),this.exOptions=e}setMainFilePath(e){this.mainFilePath=e}getMainFilePath(){return this.mainFilePath}removeTmp(e){return e.mainFilePath.startsWith("/tmp/")?this.unmapShadow(e.mainFilePath):Promise.resolve()}async setFonts(e){const t=await this.getFontResolver();for(const i of e)await t.addLazyFont(i,"blob"in i?i.blob:B(i),i);const r=await this.getCompiler();await t.build(async i=>r.setFonts(i))}async addSource(e,t){(await this.getCompiler()).addSource(e,t)}async resetShadow(){(await this.getCompiler()).resetShadow()}async mapShadow(e,t){(await this.getCompiler()).mapShadow(e,t)}async unmapShadow(e){(await this.getCompiler()).unmapShadow(e)}async vector(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).compile(t).then(i=>i.result).finally(()=>this.removeTmp(t))}async pdf(e){const t=await this.getCompileOptions(e);return t.format=w.pdf,(await this.getCompilerReset()).compile(t).then(i=>i.result).finally(()=>this.removeTmp(t))}async svg(e){return this.transientRender(e,(t,r)=>t.renderSvg({...e,renderSession:r}))}async canvas(e,t){return this.transientRender(t,(r,i)=>r.renderToCanvas({container:e,...t,renderSession:i}))}async query(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).query({...e,...t}).finally(()=>this.removeTmp(t))}async getSemanticTokenLegend(){return(await this.getCompilerReset()).getSemanticTokenLegend()}async getSemanticTokens(e){const t=await this.getCompileOptions(e);return(await this.getCompilerReset()).getSemanticTokens({mainFilePath:t.mainFilePath,resultId:e.resultId}).finally(()=>this.removeTmp(t))}async getCompileOptions(e){if(e===void 0)return{mainFilePath:this.mainFilePath,diagnostics:"none"};if(typeof e=="string")throw new Error("please specify opts as {mainContent: '...'} or {mainFilePath: '...'}");if("mainFilePath"in e)return{...e,diagnostics:"none"};{const t=`/tmp/${ee()}.typ`;return await this.addSource(t,e.mainContent),{mainFilePath:t,inputs:e.inputs,diagnostics:"none"}}}async getVector(e){if(e&&"vectorData"in e)return e.vectorData;const t=await this.getCompileOptions(e);return(await this.getCompiler()).compile(t).then(r=>r.result).finally(()=>this.removeTmp(t))}async transientRender(e,t){const r=await this.getRenderer();if(!r)throw new Error("does not provide renderer instance");const i=await this.getVector(e);return await r.runWithSession(async l=>(r.manipulateData({renderSession:l,action:"reset",data:i}),t(r,l)))}async prepareUse(){return this.prepareUseOnce?this.prepareUseOnce:this.prepareUseOnce=this.doPrepareUse()}async doPrepareUse(){if(!this.providers)return;const e=await Promise.all(this.providers.map(a=>typeof a=="function"?a():a));if(this.providers=[],b==this&&!e.some(a=>a.key.includes("package-registry")||a.key.includes("access-model")))if(ie){const a=new Function("m","return import(m)");try{const m=new j,{default:u}=await a("sync-request");b.use(h.withAccessModel(m),h.fetchPackageBy(m,(d,f)=>{const y=u("GET",f);if(y.statusCode===200)return y.getBody(void 0)}))}catch{}}else b.use(h.fetchPackageRegistry());const t=await Promise.all(this.providers.map(a=>typeof a=="function"?a():a)),r=this.ccOptions||(this.ccOptions={}),i=r.beforeBuild||(r.beforeBuild=[]),l=this.exOptions||(this.exOptions={}),o=l.beforeBuild||(l.beforeBuild=[]);for(const a of[...e,...t])a.forRoles.includes("compiler")&&(this.requireIsUninitialized("compiler",this.cc),i.push(...a.provides)),a.forRoles.includes("renderer")&&(this.requireIsUninitialized("renderer",this.ex),o.push(...a.provides));this.providers=void 0}requireIsUninitialized(e,t,r){if(t&&typeof t!="function")throw new Error(`${e} has been initialized: ${t}`)}static async buildLocalCompiler(){const{createTypstCompiler:e}=await p(()=>Promise.resolve().then(()=>_),void 0,import.meta.url);await this.prepareUse();const t=e();return await t.init(this.ccOptions),t}static async buildLocalFontResolver(){const{createTypstFontBuilder:e}=await p(()=>Promise.resolve().then(()=>_),void 0,import.meta.url);await this.prepareUse();const t=e();return await t.init(this.ccOptions),t}static async buildGlobalCompiler(){const{createGlobalCompiler:e}=await p(()=>import("./global-compiler-mqy7PbuS.js"),[],import.meta.url),{createTypstCompiler:t}=await p(()=>Promise.resolve().then(()=>_),void 0,import.meta.url);return await this.prepareUse(),e(t,this.ccOptions)}static async buildLocalRenderer(){const{createTypstRenderer:e}=await p(()=>import("./renderer-DOTnudzi.js"),__vite__mapDeps([0,1,2]),import.meta.url);await this.prepareUse();const t=e();return await t.init(this.exOptions),t}static async buildGlobalRenderer(){const{createGlobalRenderer:e}=await p(()=>import("./global-renderer-Dz1WKqod.js"),[],import.meta.url),{createTypstRenderer:t}=await p(()=>import("./renderer-DOTnudzi.js"),__vite__mapDeps([0,1,2]),import.meta.url);return await this.prepareUse(),e(t,this.exOptions)}}const b=new h({compiler:h.buildGlobalCompiler,renderer:h.buildGlobalRenderer}),ae=`// 如页 · 三套模板共用的数据读取、主题色、图标和条目渲染。\r
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
`,le=`// 如页 · classic「经典 · 简洁」
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
`,se=`// 如页 · minimal「极简 · 黑白」
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
`,oe=`// 如页 · elegant「雅致 · 衬线」
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
`,me=`// 如页 · timeline「时间轴」\r
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
`,ce=`// 如页 · campus-serif「校招 · 横幅」
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
`,de=`// 如页 · social-sans「社招 · 侧条」
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
`,he=`// 如页 · split-compact「双栏 · 深色侧栏」
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
`,ue=["NotoSansSC-Regular.otf","NotoSansSC-Bold.otf","NotoSerifSC-Bold.otf"];async function fe(n){const e=await fetch(n);if(!e.ok)throw new Error(`加载失败：${n}（HTTP ${e.status}）。字体需要先运行 pnpm fonts 生成。`);return new Uint8Array(await e.arrayBuffer())}let R=null;function pe(n){const e=n.endsWith("/")?n:`${n}/`;return R??(R=(async()=>{const[t,r]=await Promise.all([Promise.all(ue.map(i=>fe(`${e}fonts/${i}`))),fetch(`${e}fonts/charset.txt`).then(i=>i.ok?i.text():"")]);return V(b,h,{compilerWasm:`${e}wasm/compiler.wasm`,rendererWasm:`${e}wasm/renderer.wasm`,fonts:t}),{engine:new G(new N(b)),templates:q({common:ae,classic:le,minimal:se,elegant:oe,timeline:me,"campus-serif":ce,"social-sans":de,"split-compact":he}),charset:r}})()),R}const we=Object.freeze(Object.defineProperty({__proto__:null,loadRuntime:pe},Symbol.toStringTag,{value:"Module"}));export{ne as L,F as T,Y as b,c as k,we as r};
