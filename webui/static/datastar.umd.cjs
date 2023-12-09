(function(L,$){typeof exports=="object"&&typeof module<"u"?$(exports):typeof define=="function"&&define.amd?define(["exports"],$):(L=typeof globalThis<"u"?globalThis:L||self,$(L.Datastar={}))})(this,function(L){"use strict";function $(t){return t instanceof HTMLElement||t instanceof SVGElement?t:null}function J(){throw new Error("Cycle detected")}function Xe(){throw new Error("Computed cannot have side-effects")}const Ye=Symbol.for("preact-signals"),T=1,I=2,F=4,x=8,U=16,k=32;function z(){j++}function Z(){if(j>1){j--;return}let t,e=!1;for(;V!==void 0;){let n=V;for(V=void 0,oe++;n!==void 0;){const r=n._nextBatchedEffect;if(n._nextBatchedEffect=void 0,n._flags&=~I,!(n._flags&x)&&we(n))try{n._callback()}catch(s){e||(t=s,e=!0)}n=r}}if(oe=0,j--,e)throw t}function Qe(t){if(j>0)return t();z();try{return t()}finally{Z()}}let p,V,j=0,oe=0,X=0;function ge(t){if(p===void 0)return;let e=t._node;if(e===void 0||e._target!==p)return e={_version:0,_source:t,_prevSource:p._sources,_nextSource:void 0,_target:p,_prevTarget:void 0,_nextTarget:void 0,_rollbackNode:e},p._sources!==void 0&&(p._sources._nextSource=e),p._sources=e,t._node=e,p._flags&k&&t._subscribe(e),e;if(e._version===-1)return e._version=0,e._nextSource!==void 0&&(e._nextSource._prevSource=e._prevSource,e._prevSource!==void 0&&(e._prevSource._nextSource=e._nextSource),e._prevSource=p._sources,e._nextSource=void 0,p._sources._nextSource=e,p._sources=e),e}function g(t){this._value=t,this._version=0,this._node=void 0,this._targets=void 0}g.prototype.brand=Ye,g.prototype._refresh=function(){return!0},g.prototype._subscribe=function(t){this._targets!==t&&t._prevTarget===void 0&&(t._nextTarget=this._targets,this._targets!==void 0&&(this._targets._prevTarget=t),this._targets=t)},g.prototype._unsubscribe=function(t){if(this._targets!==void 0){const e=t._prevTarget,n=t._nextTarget;e!==void 0&&(e._nextTarget=n,t._prevTarget=void 0),n!==void 0&&(n._prevTarget=e,t._nextTarget=void 0),t===this._targets&&(this._targets=n)}},g.prototype.subscribe=function(t){const e=this;return ae(function(){const n=e.value,r=this._flags&k;this._flags&=~k;try{t(n)}finally{this._flags|=r}})},g.prototype.valueOf=function(){return this.value},g.prototype.toString=function(){return this.value+""},g.prototype.toJSON=function(){return this.value},g.prototype.peek=function(){return this._value},Object.defineProperty(g.prototype,"value",{get(){const t=ge(this);return t!==void 0&&(t._version=this._version),this._value},set(t){if(p instanceof M&&Xe(),t!==this._value){oe>100&&J(),this._value=t,this._version++,X++,z();try{for(let e=this._targets;e!==void 0;e=e._nextTarget)e._target._notify()}finally{Z()}}}});function ve(t){return new g(t)}function we(t){for(let e=t._sources;e!==void 0;e=e._nextSource)if(e._source._version!==e._version||!e._source._refresh()||e._source._version!==e._version)return!0;return!1}function ye(t){for(let e=t._sources;e!==void 0;e=e._nextSource){const n=e._source._node;if(n!==void 0&&(e._rollbackNode=n),e._source._node=e,e._version=-1,e._nextSource===void 0){t._sources=e;break}}}function _e(t){let e=t._sources,n;for(;e!==void 0;){const r=e._prevSource;e._version===-1?(e._source._unsubscribe(e),r!==void 0&&(r._nextSource=e._nextSource),e._nextSource!==void 0&&(e._nextSource._prevSource=r)):n=e,e._source._node=e._rollbackNode,e._rollbackNode!==void 0&&(e._rollbackNode=void 0),e=r}t._sources=n}function M(t){g.call(this,void 0),this._compute=t,this._sources=void 0,this._globalVersion=X-1,this._flags=F}M.prototype=new g,M.prototype._refresh=function(){if(this._flags&=~I,this._flags&T)return!1;if((this._flags&(F|k))===k||(this._flags&=~F,this._globalVersion===X))return!0;if(this._globalVersion=X,this._flags|=T,this._version>0&&!we(this))return this._flags&=~T,!0;const t=p;try{ye(this),p=this;const e=this._compute();(this._flags&U||this._value!==e||this._version===0)&&(this._value=e,this._flags&=~U,this._version++)}catch(e){this._value=e,this._flags|=U,this._version++}return p=t,_e(this),this._flags&=~T,!0},M.prototype._subscribe=function(t){if(this._targets===void 0){this._flags|=F|k;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._subscribe(e)}g.prototype._subscribe.call(this,t)},M.prototype._unsubscribe=function(t){if(this._targets!==void 0&&(g.prototype._unsubscribe.call(this,t),this._targets===void 0)){this._flags&=~k;for(let e=this._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e)}},M.prototype._notify=function(){if(!(this._flags&I)){this._flags|=F|I;for(let t=this._targets;t!==void 0;t=t._nextTarget)t._target._notify()}},M.prototype.peek=function(){if(this._refresh()||J(),this._flags&U)throw this._value;return this._value},Object.defineProperty(M.prototype,"value",{get(){this._flags&T&&J();const t=ge(this);if(this._refresh(),t!==void 0&&(t._version=this._version),this._flags&U)throw this._value;return this._value}});function et(t){return new M(t)}function Ee(t){const e=t._cleanup;if(t._cleanup=void 0,typeof e=="function"){z();const n=p;p=void 0;try{e()}catch(r){throw t._flags&=~T,t._flags|=x,ie(t),r}finally{p=n,Z()}}}function ie(t){for(let e=t._sources;e!==void 0;e=e._nextSource)e._source._unsubscribe(e);t._compute=void 0,t._sources=void 0,Ee(t)}function tt(t){if(p!==this)throw new Error("Out-of-order effect");_e(this),p=t,this._flags&=~T,this._flags&x&&ie(this),Z()}function B(t){this._compute=t,this._cleanup=void 0,this._sources=void 0,this._nextBatchedEffect=void 0,this._flags=k}B.prototype._callback=function(){const t=this._start();try{if(this._flags&x||this._compute===void 0)return;const e=this._compute();typeof e=="function"&&(this._cleanup=e)}finally{t()}},B.prototype._start=function(){this._flags&T&&J(),this._flags|=T,this._flags&=~x,Ee(this),ye(this),z();const t=p;return p=this,tt.bind(this,t)},B.prototype._notify=function(){this._flags&I||(this._flags|=I,this._nextBatchedEffect=V,V=this)},B.prototype._dispose=function(){this._flags|=x,this._flags&T||ie(this)};function ae(t){const e=new B(t);try{e._callback()}catch(n){throw e._dispose(),n}return e._dispose.bind(e)}class be{get value(){return ce(this)}set value(e){Qe(()=>nt(this,e))}peek(){return ce(this,{peek:!0})}}const le=t=>Object.assign(new be,Object.entries(t).reduce((e,[n,r])=>{if(["value","peek"].some(s=>s===n))throw new Error(`${n} is a reserved property name`);return typeof r!="object"||r===null||Array.isArray(r)?e[n]=ve(r):e[n]=le(r),e},{})),nt=(t,e)=>Object.keys(e).forEach(n=>t[n].value=e[n]),ce=(t,{peek:e=!1}={})=>Object.entries(t).reduce((n,[r,s])=>(s instanceof g?n[r]=e?s.peek():s.value:s instanceof be&&(n[r]=ce(s,{peek:e})),n),{});function Se(t,e){if(typeof e!="object"||Array.isArray(e)||!e)return JSON.parse(JSON.stringify(e));if(typeof e=="object"&&e.toJSON!==void 0&&typeof e.toJSON=="function")return e.toJSON();let n=t;return typeof t!="object"&&(n={...e}),Object.keys(e).forEach(r=>{n.hasOwnProperty(r)||(n[r]=e[r]),e[r]===null?delete n[r]:n[r]=Se(n[r],e[r])}),n}const rt="[a-zA-Z_$][0-9a-zA-Z_$.]*";function ue(t,e,n){return new RegExp(`(?<whole>\\${t}(?<${e}>${rt})${n})`,"g")}const st={name:"SignalProcessor",description:"Replacing $signal with ctx.store.signal.value",regexp:ue("$","signal",""),replacer:t=>{const{signal:e}=t;return`ctx.store.${e}.value`}},ot={name:"ActionProcessor",description:"Replacing $$action(args) with ctx.actions.action(ctx, args)",regexp:ue("$\\$","action","(?<call>\\((?<args>.*)\\))?"),replacer:({action:t,args:e})=>{const n=["ctx"];e&&n.push(...e.split(",").map(s=>s.trim()));const r=n.join(",");return`ctx.actions.${t}(${r})`}},it={name:"RefProcessor",description:"Replacing #foo with ctx.refs.foo",regexp:ue("~","ref",""),replacer({ref:t}){return`data.refs.${t}`}},at=[ot,st,it],lt=[{prefix:"mergeStore",description:"Setup the global store",onLoad:t=>{const e=t.expressionFn(t);t.mergeStore(e)}},{prefix:"ref",description:"Sets the value of the element",mustHaveEmptyKey:!0,mustNotEmptyExpression:!0,bypassExpressionFunctionCreation:()=>!0,onLoad:t=>{const{el:e,expression:n}=t;return t.refs[n]=e,()=>delete t.refs[n]}}];class Te{plugins=[];store=le({});actions={};refs={};reactivity={signal:ve,computed:et,effect:ae};parentID="";missingIDNext=0;removals=new Map;constructor(e={},...n){if(this.actions=Object.assign(this.actions,e),n=[...lt,...n],!n.length)throw new Error("No plugins provided");const r=new Set;for(const s of n){if(s.requiredPluginPrefixes){for(const o of s.requiredPluginPrefixes)if(!r.has(o))throw new Error(`Plugin ${s.prefix} requires plugin ${o}`)}this.plugins.push(s),r.add(s.prefix)}}run(){this.plugins.forEach(e=>{e.onGlobalInit&&e.onGlobalInit({actions:this.actions,refs:this.refs,reactivity:this.reactivity,mergeStore:this.mergeStore.bind(this),store:this.store})}),this.applyPlugins(document.body)}cleanupElementRemovals(e){const n=this.removals.get(e);if(n){for(const r of n)r();this.removals.delete(e)}}mergeStore(e){const n=Se(this.store.value,e);this.store=le(n)}signalByName(e){return this.store[e]}applyPlugins(e){const n=new Set;this.plugins.forEach((r,s)=>{this.walkDownDOM(e,o=>{s===0&&this.cleanupElementRemovals(o);for(const i in o.dataset){let a=o.dataset[i]||"";if(!i.startsWith(r.prefix))continue;if(o.id.length===0&&(o.id=`ds-${this.parentID}-${this.missingIDNext++}`),n.clear(),r.allowedTagRegexps){const d=o.tagName.toLowerCase();if(![...r.allowedTagRegexps].some(v=>d.match(v)))throw new Error(`Tag '${o.tagName}' is not allowed for plugin '${i}', allowed tags are: ${[[...r.allowedTagRegexps].map(v=>`'${v}'`)].join(", ")}`)}let u=i.slice(r.prefix.length),[f,...c]=u.split(".");if(r.mustHaveEmptyKey&&f.length>0)throw new Error(`Attribute '${i}' must have empty key`);if(r.mustNotEmptyKey&&f.length===0)throw new Error(`Attribute '${i}' must have non-empty key`);f.length&&(f=f[0].toLowerCase()+f.slice(1));const l=c.map(d=>{const[y,...v]=d.split("_");return{label:y,args:v}});if(r.allowedModifiers){for(const d of l)if(!r.allowedModifiers.has(d.label))throw new Error(`Modifier '${d.label}' is not allowed`)}const w=new Map;for(const d of l)w.set(d.label,d.args);if(r.mustHaveEmptyExpression&&a.length)throw new Error(`Attribute '${i}' must have empty expression`);if(r.mustNotEmptyExpression&&!a.length)throw new Error(`Attribute '${i}' must have non-empty expression`);const E=[...r.preprocessors?.pre||[],...at,...r.preprocessors?.post||[]];for(const d of E){if(n.has(d))continue;n.add(d);const y=[...a.matchAll(d.regexp)];if(y.length)for(const v of y){if(!v.groups)continue;const{groups:H}=v,{whole:O}=H;a=a.replace(O,d.replacer(H))}}const{store:b,reactivity:P,actions:_,refs:m}=this,h={store:b,mergeStore:this.mergeStore.bind(this),applyPlugins:this.applyPlugins.bind(this),cleanupElementRemovals:this.cleanupElementRemovals.bind(this),walkSignals:this.walkSignals.bind(this),actions:_,refs:m,reactivity:P,el:o,key:f,expression:a,expressionFn:()=>{throw new Error("Expression function not created")},modifiers:w};if(!r.bypassExpressionFunctionCreation?.(h)&&!r.mustHaveEmptyExpression&&a.length){const d=a.split(";");d[d.length-1]=`return ${d[d.length-1]}`;const y=`
try {
  ${d.join(";")}
} catch (e) {
  throw new Error(\`Error evaluating expression '${a}' on ${o.id}\`)
}
            `;try{const v=new Function("ctx",y);h.expressionFn=v}catch(v){console.error(v),console.error(`Error evaluating expression '${y}' on ${o.id?`#${o.id}`:o.tagName}`);return}}const S=r.onLoad(h);S&&(this.removals.has(o)||this.removals.set(o,new Set),this.removals.get(o).add(S))}})})}walkSignalsStore(e,n){const r=Object.keys(e);for(let s=0;s<r.length;s++){const o=r[s],i=e[o],a=i instanceof g,u=typeof i=="object"&&Object.keys(i).length>0;if(a){n(o,i);continue}u&&this.walkSignalsStore(i,n)}}walkSignals(e){this.walkSignalsStore(this.store,e)}walkDownDOM(e,n,r=0){if(!e)return;const s=$(e);if(s)for(n(s),r=0,e=e.firstElementChild;e;)this.walkDownDOM(e,n,r++),e=e.nextElementSibling}}const ct=t=>t.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,n)=>(n?"-":"")+e.toLowerCase()),ut={prefix:"bind",description:"Sets the value of the element",mustNotEmptyKey:!0,mustNotEmptyExpression:!0,onLoad:t=>t.reactivity.effect(()=>{const e=ct(t.key),r=`${t.expressionFn(t)}`;!r||r==="false"||r==="null"||r==="undefined"?t.el.removeAttribute(e):t.el.setAttribute(e,r)})},ft=/^data:(?<mime>[^;]+);base64,(?<contents>.*)$/,Y=["change","input","keydown"],dt=[ut,{prefix:"model",description:"Sets the value of the element",mustHaveEmptyKey:!0,preprocessors:{post:[{name:"ModelProcessor",description:"Replacing model with ctx.store.model",regexp:/(?<whole>.+)/g,replacer:t=>{const{whole:e}=t;return`ctx.store.${e}`}}]},allowedTagRegexps:new Set(["input","textarea","select","checkbox","radio"]),onLoad:t=>{const{store:e,el:n,expression:r}=t,s=t.expressionFn(t),o=n.tagName.toLowerCase().includes("input"),i=n.tagName.toLowerCase().includes("select"),a=n.tagName.toLowerCase().includes("textarea"),u=n.tagName.toLowerCase().includes("radio"),f=n.getAttribute("type"),c=o&&f==="checkbox",l=o&&f==="file";if(!o&&!i&&!a&&!c&&!u)throw new Error("Element must be input, select, textarea, checkbox or radio");const w=()=>{if(!s)throw new Error(`Signal ${r} not found`);const m=s.value;if(o){const h=n;c?h.checked=m:l||(h.value=`${s.value}`)}else"value"in n?n.value=`${s.value}`:n.setAttribute("value",`${s.value}`)},E=t.reactivity.effect(w),b=()=>{const m=n.value;if(!(typeof m>"u"))if(l){const[h]=n?.files||[];if(!h){s.value="";return}const S=new FileReader;S.onload=()=>{if(typeof S.result!="string")throw new Error("Unsupported type");const y=S.result.match(ft);if(!y?.groups)throw new Error("Invalid data URI");const{mime:v,contents:H}=y.groups;s.value=H;const O=`${r}Mime`;if(O in e){const K=e[`${O}`];K.value=v}},S.readAsDataURL(h);const d=`${r}Name`;if(d in e){const y=e[`${d}`];y.value=h.name}return}else{const h=s.value;if(typeof h=="number")s.value=Number(m);else if(typeof h=="string")s.value=m;else if(typeof h=="boolean")if(c){const{checked:S}=n;s.value=S}else s.value=!!m;else if(!(typeof h>"u"))throw console.log(typeof h),new Error("Unsupported type")}},P=n.tagName.split("-");if(P.length>1){const m=P[0].toLowerCase();Y.forEach(h=>{Y.push(`${m}-${h}`)})}return Y.forEach(m=>n.addEventListener(m,b)),()=>{E(),Y.forEach(m=>n.removeEventListener(m,b))}}},{prefix:"text",description:"Sets the textContent of the element",mustHaveEmptyKey:!0,onLoad:t=>{const{el:e,expressionFn:n}=t;if(!(e instanceof HTMLElement))throw new Error("Element is not HTMLElement");return t.reactivity.effect(()=>{const r=n(t);e.textContent=`${r}`})}},{prefix:"focus",description:"Sets the focus of the element",mustHaveEmptyKey:!0,mustHaveEmptyExpression:!0,onLoad:t=>(t.el.tabIndex||t.el.setAttribute("tabindex","0"),t.el.focus(),t.el.scrollIntoView({block:"center",inline:"center"}),()=>t.el.blur())},{prefix:"on",description:"Sets the event listener of the element",mustNotEmptyKey:!0,mustNotEmptyExpression:!0,allowedModifiers:new Set(["once","passive","capture","debounce","throttle"]),onLoad:t=>{const{el:e,key:n,expressionFn:r}=t;let s=()=>{r(t)};const o=t.modifiers.get("debounce");if(o){const f=Ae(o),c=Q(o,"leading",!1),l=Q(o,"noTrail",!0);s=pt(s,f,c,l)}const i=t.modifiers.get("throttle");if(i){const f=Ae(i),c=Q(i,"noLead",!0),l=Q(i,"noTrail",!0);s=ht(s,f,c,l)}const a={capture:!0,passive:!1,once:!1};if(t.modifiers.has("capture")||(a.capture=!1),t.modifiers.has("passive")&&(a.passive=!0),t.modifiers.has("once")&&(a.once=!0),n==="load")return s(),()=>{};const u=n.toLowerCase();return e.addEventListener(u,s,a),()=>{e.removeEventListener(u,s)}}}];function Ae(t){if(!t||t?.length===0)return 0;for(const e of t){if(e.endsWith("ms"))return Number(e.replace("ms",""));if(e.endsWith("s"))return Number(e.replace("s",""))*1e3;try{return parseFloat(e)}catch{}}return 0}function Q(t,e,n=!1){return t?t.includes(e)||n:!1}function pt(t,e,n=!1,r=!0){let s;const o=()=>s&&clearTimeout(s);return function(...a){o(),n&&!s&&t(...a),s=setTimeout(()=>{r&&t(...a),o()},e)}}function ht(t,e,n=!0,r=!1){let s=!1,o=null;return function(...a){s?o=a:(s=!0,n?t(...a):o=a,setTimeout(()=>{r&&o&&(t(...o),o=null),s=!1},e))}}const ee=new WeakSet;function mt(t,e,n={}){t instanceof Document&&(t=t.documentElement);let r;typeof e=="string"?r=_t(e):r=e;const s=Et(r),o=vt(t,s,n);return Le(t,s,o)}function Le(t,e,n){if(n.head.block){const r=t.querySelector("head"),s=e.querySelector("head");if(r&&s){const o=Pe(s,r,n);Promise.all(o).then(()=>{Le(t,e,Object.assign(n,{head:{block:!1,ignore:!0}}))});return}}if(n.morphStyle==="innerHTML")return Me(e,t,n),t.children;if(n.morphStyle==="outerHTML"||n.morphStyle==null){const r=St(e,t,n);if(!r)throw new Error("Could not find best match");const s=r?.previousSibling,o=r?.nextSibling,i=te(t,r,n);return r?bt(s,i,o):[]}else throw"Do not understand how to morph style "+n.morphStyle}function te(t,e,n){if(!(n.ignoreActive&&t===document.activeElement))if(e==null){if(n.callbacks.beforeNodeRemoved(t)===!1)return;t.remove(),n.callbacks.afterNodeRemoved(t);return}else{if(re(t,e))return n.callbacks.beforeNodeMorphed(t,e)===!1?void 0:(t instanceof HTMLHeadElement&&n.head.ignore||(e instanceof HTMLHeadElement&&t instanceof HTMLHeadElement&&n.head.style!=="morph"?Pe(e,t,n):(gt(e,t),Me(e,t,n))),n.callbacks.afterNodeMorphed(t,e),t);if(n.callbacks.beforeNodeRemoved(t)===!1||n.callbacks.beforeNodeAdded(e)===!1)return;if(!t.parentElement)throw new Error("oldNode has no parentElement");return t.parentElement.replaceChild(e,t),n.callbacks.afterNodeAdded(e),n.callbacks.afterNodeRemoved(t),e}}function Me(t,e,n){let r=t.firstChild,s=e.firstChild,o;for(;r;){if(o=r,r=o.nextSibling,s==null){if(n.callbacks.beforeNodeAdded(o)===!1)return;e.appendChild(o),n.callbacks.afterNodeAdded(o),C(n,o);continue}if(ke(o,s,n)){te(s,o,n),s=s.nextSibling,C(n,o);continue}let i=wt(t,e,o,s,n);if(i){s=Ne(s,i,n),te(i,o,n),C(n,o);continue}let a=yt(t,o,s,n);if(a){s=Ne(s,a,n),te(a,o,n),C(n,o);continue}if(n.callbacks.beforeNodeAdded(o)===!1)return;e.insertBefore(o,s),n.callbacks.afterNodeAdded(o),C(n,o)}for(;s!==null;){let i=s;s=s.nextSibling,$e(i,n)}}function gt(t,e){let n=t.nodeType;if(n===1){for(const r of t.attributes)e.getAttribute(r.name)!==r.value&&e.setAttribute(r.name,r.value);for(const r of e.attributes)t.hasAttribute(r.name)||e.removeAttribute(r.name)}if((n===Node.COMMENT_NODE||n===Node.TEXT_NODE)&&e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue),t instanceof HTMLInputElement&&e instanceof HTMLInputElement&&t.type!=="file")e.value=t.value||"",ne(t,e,"value"),ne(t,e,"checked"),ne(t,e,"disabled");else if(t instanceof HTMLOptionElement)ne(t,e,"selected");else if(t instanceof HTMLTextAreaElement&&e instanceof HTMLTextAreaElement){const r=t.value,s=e.value;r!==s&&(e.value=r),e.firstChild&&e.firstChild.nodeValue!==r&&(e.firstChild.nodeValue=r)}}function ne(t,e,n){const r=t.getAttribute(n),s=e.getAttribute(n);r!==s&&(r?e.setAttribute(n,r):e.removeAttribute(n))}function Pe(t,e,n){const r=[],s=[],o=[],i=[],a=n.head.style,u=new Map;for(const c of t.children)u.set(c.outerHTML,c);for(const c of e.children){let l=u.has(c.outerHTML),w=n.head.shouldReAppend(c),E=n.head.shouldPreserve(c);l||E?w?s.push(c):(u.delete(c.outerHTML),o.push(c)):a==="append"?w&&(s.push(c),i.push(c)):n.head.shouldRemove(c)!==!1&&s.push(c)}i.push(...u.values()),console.log("to append: ",i);const f=[];for(const c of i){console.log("adding: ",c);const l=document.createRange().createContextualFragment(c.outerHTML).firstChild;if(!l)throw new Error("could not create new element from: "+c.outerHTML);if(console.log(l),n.callbacks.beforeNodeAdded(l)){if(l.hasAttribute("href")||l.hasAttribute("src")){let w;const E=new Promise(b=>{w=b});l.addEventListener("load",function(){w(void 0)}),f.push(E)}e.appendChild(l),n.callbacks.afterNodeAdded(l),r.push(l)}}for(const c of s)n.callbacks.beforeNodeRemoved(c)!==!1&&(e.removeChild(c),n.callbacks.afterNodeRemoved(c));return n.head.afterHeadMorphed(e,{added:r,kept:o,removed:s}),f}function N(){}function vt(t,e,n){return{target:t,newContent:e,config:n,morphStyle:n.morphStyle,ignoreActive:n.ignoreActive,idMap:Mt(t,e),deadIds:new Set,callbacks:Object.assign({beforeNodeAdded:N,afterNodeAdded:N,beforeNodeMorphed:N,afterNodeMorphed:N,beforeNodeRemoved:N,afterNodeRemoved:N},n.callbacks),head:Object.assign({style:"merge",shouldPreserve:r=>r.getAttribute("im-preserve")==="true",shouldReAppend:r=>r.getAttribute("im-re-append")==="true",shouldRemove:N,afterHeadMorphed:N},n.head)}}function ke(t,e,n){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName?t?.id?.length&&t.id===e.id?!0:G(n,t,e)>0:!1}function re(t,e){return!t||!e?!1:t.nodeType===e.nodeType&&t.tagName===e.tagName}function Ne(t,e,n){for(;t!==e;){const r=t;if(t=t?.nextSibling,!r)throw new Error("tempNode is null");$e(r,n)}return C(n,e),e.nextSibling}function wt(t,e,n,r,s){const o=G(s,n,e);let i=null;if(o>0){i=r;let a=0;for(;i!=null;){if(ke(n,i,s))return i;if(a+=G(s,i,t),a>o)return null;i=i.nextSibling}}return i}function yt(t,e,n,r){let s=n,o=e.nextSibling,i=0;for(;s&&o;){if(G(r,s,t)>0)return null;if(re(e,s))return s;if(re(o,s)&&(i++,o=o.nextSibling,i>=2))return null;s=s.nextSibling}return s}const Re=new DOMParser;function _t(t){const e=t.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"");if(e.match(/<\/html>/)||e.match(/<\/head>/)||e.match(/<\/body>/)){const n=Re.parseFromString(t,"text/html");if(e.match(/<\/html>/))return ee.add(n),n;{let r=n.firstChild;return r?(ee.add(r),r):null}}else{const r=Re.parseFromString(`<body><template>${t}</template></body>`,"text/html").body.querySelector("template")?.content;if(!r)throw new Error("content is null");return ee.add(r),r}}function Et(t){if(t==null)return document.createElement("div");if(ee.has(t))return t;if(t instanceof Node){const e=document.createElement("div");return e.append(t),e}else{const e=document.createElement("div");for(const n of[...t])e.append(n);return e}}function bt(t,e,n){const r=[],s=[];for(;t;)r.push(t),t=t.previousSibling;for(;r.length>0;){const o=r.pop();s.push(o),e?.parentElement?.insertBefore(o,e)}for(s.push(e);n;)r.push(n),s.push(n),n=n.nextSibling;for(;r.length;)e?.parentElement?.insertBefore(r.pop(),e.nextSibling);return s}function St(t,e,n){let r=t.firstChild,s=r,o=0;for(;r;){let i=Tt(r,e,n);i>o&&(s=r,o=i),r=r.nextSibling}return s}function Tt(t,e,n){return re(t,e)?.5+G(n,t,e):0}function $e(t,e){C(e,t),e.callbacks.beforeNodeRemoved(t)!==!1&&(t.remove(),e.callbacks.afterNodeRemoved(t))}function At(t,e){return!t.deadIds.has(e)}function Lt(t,e,n){return t.idMap.get(n)?.has(e)||!1}function C(t,e){const n=t.idMap.get(e);if(n)for(const r of n)t.deadIds.add(r)}function G(t,e,n){const r=t.idMap.get(e);if(!r)return 0;let s=0;for(const o of r)At(t,o)&&Lt(t,o,n)&&++s;return s}function Ce(t,e){const n=t.parentElement,r=t.querySelectorAll("[id]");for(const s of r){let o=s;for(;o!==n&&o;){let i=e.get(o);i==null&&(i=new Set,e.set(o,i)),i.add(s.id),o=o.parentElement}}}function Mt(t,e){const n=new Map;return Ce(t,n),Ce(e,n),n}const Pt=["get","post","put","patch","delete"].reduce((t,e)=>(t[e]=async n=>{const r=Document;if(!r.startViewTransition){await Oe(e,n);return}return new Promise(s=>{r.startViewTransition(async()=>{await Oe(e,n),s()})})},t),{}),kt="Accept",Nt="Content-Type",Rt="datastar-request",$t="application/json",Ct="text/event-stream",Ht="true",W="datastar-",q=`${W}indicator`,fe=`${q}-loading`,He=`${W}settling`,se=`${W}swapping`,Ot="self",A={MorphElement:"morph_element",InnerElement:"inner_element",OuterElement:"outer_element",PrependElement:"prepend_element",AppendElement:"append_element",BeforeElement:"before_element",AfterElement:"after_element",DeleteElement:"delete_element",UpsertAttributes:"upsert_attributes"},It=[{prefix:"header",description:"Sets the header of the fetch request",mustNotEmptyKey:!0,mustNotEmptyExpression:!0,onLoad:t=>{const e=t.store.fetch.headers,n=t.key[0].toUpperCase()+t.key.slice(1);return e[n]=t.reactivity.computed(()=>t.expressionFn(t)),()=>{delete e[n]}}},{prefix:"fetchUrl",description:"Sets the fetch url",mustHaveEmptyKey:!0,mustNotEmptyExpression:!0,onGlobalInit:({mergeStore:t})=>{t({fetch:{headers:{},elementURLs:{},indicatorSelectors:{}}})},onLoad:t=>t.reactivity.effect(()=>{const e=t.reactivity.computed(()=>`${t.expressionFn(t)}`);return t.store.fetch.elementURLs[t.el.id]=e,()=>{delete t.store.fetch.elementURLs[t.el.id]}})},{prefix:"fetchIndicator",description:"Sets the fetch indicator selector",mustHaveEmptyKey:!0,mustNotEmptyExpression:!0,onGlobalInit:()=>{const t=document.createElement("style");t.innerHTML=`
.${q}{
 opacity:0;
 transition: opacity 300ms ease-out;
}
.${fe} {
 opacity:1;
 transition: opacity 300ms ease-in;
}
`,document.head.appendChild(t)},onLoad:t=>t.reactivity.effect(()=>{const e=t.reactivity.computed(()=>`${t.expressionFn(t)}`);t.store.fetch.indicatorSelectors[t.el.id]=e;const n=document.querySelector(e.value);if(!n)throw new Error(`No indicator found for ${e.value}`);return n.classList.add(q),()=>{delete t.store.fetch.indicatorSelectors[t.el.id]}})}],xt=/(?<key>\w*): (?<value>.*)/gm;async function Oe(t,e){const{el:n,store:r}=e,s=r.fetch.elementURLs[n.id];if(!s)return;const o={...r};delete o.fetch;const i=JSON.stringify(o);let a=n,u=!1;const f=r.fetch.indicatorSelectors[n.id];if(f){const _=document.querySelector(f);_&&(a=_,a.classList.remove(q),a.classList.add(fe),u=!0)}const c=new URL(s.value,window.location.origin),l=new Headers;l.append(kt,Ct),l.append(Nt,$t),l.append(Rt,Ht);const w=r.fetch.headers.value;if(w)for(const _ in w){const m=w[_];l.append(_,m)}t=t.toUpperCase();const E={method:t,headers:l};if(t==="GET"){const _=new URLSearchParams(c.search);_.append("datastar",i),c.search=_.toString()}else E.body=i;const b=await fetch(c,E);if(!b.ok)throw new Error(`Response was not ok, url: ${c}, status: ${b.status}`);if(!b.body)throw new Error("No response body");const P=b.body.pipeThrough(new TextDecoderStream).getReader();for(;;){const{done:_,value:m}=await P.read();if(_)break;m.split(`

`).forEach(h=>{const S=[...h.matchAll(xt)];if(S.length){let d="",y="morph_element",v="",H=0,O=!1,K="",he,qe=!1,Ke=!1;for(const Je of S){if(!Je.groups)continue;const{key:Kt,value:R}=Je.groups;switch(Kt){case"event":if(!R.startsWith(W))throw new Error(`Unknown event: ${R}`);switch(R.slice(W.length)){case"redirect":O=!0;break;case"fragment":Ke=!0;break;case"error":qe=!0;break;default:throw new Error(`Unknown event: ${R}`)}break;case"data":const me=R.indexOf(" ");if(me===-1)throw new Error("Missing space in data");const ze=R.slice(0,me),D=R.slice(me+1);switch(ze){case"selector":v=D;break;case"merge":const Ze=D;if(!Object.values(A).includes(Ze))throw new Error(`Unknown merge option: ${R}`);y=Ze;break;case"settle":H=parseInt(D);break;case"fragment":case"html":d=D;break;case"redirect":K=D;break;case"error":he=new Error(D);break;default:throw new Error(`Unknown data type: ${ze}`)}}}if(qe&&he)throw he;if(O&&K)window.location.href=K;else if(Ke&&d)Dt(e,v,y,d,H);else throw new Error(`Unknown event block: ${h}`)}})}u&&(a.classList.remove(fe),a.classList.add(q))}const Ie=document.createElement("template");function Dt(t,e,n,r,s){const{el:o}=t;Ie.innerHTML=r;const i=Ie.content.firstChild;if(!(i instanceof Element))throw new Error(`Fragment is not an element, source '${r}'`);const a=e===Ot;let u;if(a)u=[o];else{const f=e||`#${i.getAttribute("id")}`;if(u=document.querySelectorAll(f)||[],!u)throw new Error(`No target elements, selector: ${e}`)}for(const f of u){f.classList.add(se);const c=f.outerHTML;let l=f;switch(n){case A.MorphElement:const E=mt(l,i);if(!E?.length)throw new Error("Failed to morph element");l=E[0];break;case A.InnerElement:l.innerHTML=i.innerHTML;break;case A.OuterElement:l.replaceWith(i);break;case A.PrependElement:l.prepend(i);break;case A.AppendElement:l.append(i);break;case A.BeforeElement:l.before(i);break;case A.AfterElement:l.after(i);break;case A.DeleteElement:setTimeout(()=>l.remove(),s);break;case A.UpsertAttributes:i.getAttributeNames().forEach(P=>{const _=i.getAttribute(P);l.setAttribute(P,_)});break;default:throw new Error(`Unknown merge type: ${n}`)}l.classList.add(se),t.cleanupElementRemovals(f),t.applyPlugins(l),f.classList.remove(se),l.classList.remove(se);const w=l.outerHTML;c!==w&&(l.classList.add(He),setTimeout(()=>{l.classList.remove(He)},s))}}const Ft={setAll:async(t,e,n)=>{const r=new RegExp(e);t.walkSignals((s,o)=>r.test(s)&&(o.value=n))},toggleAll:async(t,e)=>{const n=new RegExp(e);t.walkSignals((r,s)=>n.test(r)&&(s.value=!s.value))}},de="display",xe="none",pe="important",Ut={prefix:"show",description:"Sets the display of the element",allowedModifiers:new Set([pe]),onLoad:t=>{const{el:e,modifiers:n,expressionFn:r}=t;return ae(()=>{const o=!!r(t),a=n.has(pe)?pe:void 0;o?e.style.length===1&&e.style.display===xe?e.style.removeProperty(de):e.style.setProperty(de,"",a):e.style.setProperty(de,xe,a)})}},Vt="intersects",De="once",Fe="half",Ue="full",jt={prefix:Vt,description:"Run expression when element intersects with viewport",allowedModifiers:new Set([De,Fe,Ue]),mustHaveEmptyKey:!0,onLoad:t=>{const{modifiers:e}=t,n={threshold:0};e.has(Ue)?n.threshold=1:e.has(Fe)&&(n.threshold=.5);const r=new IntersectionObserver(s=>{s.forEach(o=>{o.isIntersecting&&(t.expressionFn(t),e.has(De)&&r.disconnect())})},n);return r.observe(t.el),()=>r.disconnect()}},Ve="prepend",je="append",Be=new Error("Target element must have a parent if using prepend or append"),Bt={prefix:"teleport",description:"Teleports the element to another element",allowedModifiers:new Set([Ve,je]),allowedTagRegexps:new Set(["template"]),bypassExpressionFunctionCreation:()=>!0,onLoad:t=>{const{el:e,modifiers:n,expression:r}=t;if(!(e instanceof HTMLTemplateElement))throw new Error;const s=document.querySelector(r);if(!s)throw new Error(`Target element not found: ${r}`);if(!e.content)throw new Error("Template element must have content");const o=e.content.cloneNode(!0);if($(o)?.firstElementChild)throw new Error("Empty template");if(n.has(Ve)){if(!s.parentNode)throw Be;s.parentNode.insertBefore(o,s)}else if(n.has(je)){if(!s.parentNode)throw Be;s.parentNode.insertBefore(o,s.nextSibling)}else s.appendChild(o)}},Gt={prefix:"scrollIntoView",description:"Scrolls the element into view",onLoad:t=>{const{el:e}=t;e.scrollIntoView({behavior:"smooth",block:"center",inline:"center"})}},Ge="ds-view-transition-stylesheet",Wt=[Ut,jt,Bt,Gt,{prefix:"viewTransition",description:"Setup view transition api",onGlobalInit(t){const e=document.createElement("style");e.id=Ge,document.head.appendChild(e);let n=!1;if(document.head.childNodes.forEach(r=>{r instanceof HTMLMetaElement&&r.name==="view-transition"&&(n=!0)}),!n){const r=document.createElement("meta");r.name="view-transition",r.content="same-origin",document.head.appendChild(r)}t.mergeStore({viewTransitions:{}})},onLoad:t=>{const{el:e,expressionFn:n,store:r}=t;let s=n(t);if(!s){if(!e.id)throw new Error("Element must have an id if no name is provided");s=e.id}const o=document.getElementById(Ge);if(!o)throw new Error("View transition stylesheet not found");const i=`ds-vt-${s}`,a=`
.${i} {
  view-transition: ${s};
}

`;o.innerHTML+=a;let u=r.viewTransitions[s];return u||(u=t.reactivity.signal(0),r.viewTransitions[s]=u),u.value++,e.classList.add(i),()=>{u.value--,u.value===0&&(delete r.viewTransitions[s],o.innerHTML=o.innerHTML.replace(a,""))}}}];function We(t={},...e){const n=performance.now(),r=new Te(t,...e);r.run();const s=performance.now();return console.log(`Datastar loaded and attached to all DOM elements in ${s-n}ms`),r}function qt(t={},...e){const n=Object.assign({},Ft,Pt,t),r=[...It,...Wt,...dt,...e];return We(n,...r)}L.Datastar=Te,L.runDatastarWith=We,L.runDatastarWithAllPlugins=qt,L.toHTMLorSVGElement=$,Object.defineProperty(L,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=datastar.umd.cjs.map
