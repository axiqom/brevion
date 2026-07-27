import{r as s}from"./index.qNTDzdXh.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=(...e)=>e.filter((r,t,o)=>!!r&&r.trim()!==""&&o.indexOf(r)===t).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var $={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=s.forwardRef(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:a="",children:n,iconNode:u,...l},m)=>s.createElement("svg",{ref:m,...$,width:r,height:r,stroke:e,strokeWidth:o?Number(t)*24/Number(r):t,className:c("lucide",a),...l},[...u.map(([d,w])=>s.createElement(d,w)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=(e,r)=>{const t=s.forwardRef(({className:o,...a},n)=>s.createElement(b,{ref:n,iconNode:r,className:c(`lucide-${f(e)}`,o),...a}));return t.displayName=`${e}`,t},i=(()=>{const e="/brevion";return e.endsWith("/")?e:`${e}/`})();function C(e=""){if(!e||e==="/")return i;if(e.startsWith("#"))return`${i}${e}`;const r=e.replace(/^\/+/,"");return`${i}${r}`}export{p as c,C as w};
