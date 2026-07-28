import{r as c}from"./index.qNTDzdXh.js";var l={exports:{}},a={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x;function w(){if(x)return a;x=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function o(s,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var u in t)u!=="key"&&(n[u]=t[u])}else n=t;return t=n.ref,{$$typeof:r,type:s,key:i,ref:t!==void 0?t:null,props:n}}return a.Fragment=e,a.jsx=o,a.jsxs=o,a}var m;function E(){return m||(m=1,l.exports=w()),l.exports}var h=E();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),f=(...r)=>r.filter((e,o,s)=>!!e&&e.trim()!==""&&s.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var $={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=c.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:o=2,absoluteStrokeWidth:s,className:t="",children:n,iconNode:i,...u},v)=>c.createElement("svg",{ref:v,...$,width:e,height:e,stroke:r,strokeWidth:s?Number(o)*24/Number(e):o,className:f("lucide",t),...u},[...i.map(([R,p])=>c.createElement(R,p)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=(r,e)=>{const o=c.forwardRef(({className:s,...t},n)=>c.createElement(j,{ref:n,iconNode:e,className:f(`lucide-${k(r)}`,s),...t}));return o.displayName=`${r}`,o},d=(()=>{const r="/brevion";return r.endsWith("/")?r:`${r}/`})();function _(r=""){if(!r||r==="/")return d;if(r.startsWith("#"))return`${d}${r}`;const e=r.replace(/^\/+/,"");return`${d}${e}`}export{A as c,h as j,_ as w};
