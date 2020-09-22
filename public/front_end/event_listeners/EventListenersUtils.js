import*as SDK from"../sdk/sdk.js";import*as Common from"../common/common.js";export function frameworkEventListeners(e){const n=e.runtimeModel().target().model(SDK.DOMDebuggerModel.DOMDebuggerModel);if(!n)return Promise.resolve({eventListeners:[],internalHandlers:null});const t={eventListeners:[]};return e.callFunction((function(){const e=[];let n=[],t=[],r=[function(e){if(!(e&&e instanceof Node))return{eventListeners:[]};const n=window.jQuery;if(!n||!n.fn)return{eventListeners:[]};const t=n,r=n._data||n.data,o=[],s=[];if("function"==typeof r){const n=r(e,"events");for(const t in n)for(const r in n[t]){const s=n[t][r];if("object"==typeof s||"function"==typeof s){const n={handler:s.handler||s,useCapture:!0,passive:!1,once:!1,type:t};n.remove=a.bind(e,s.selector),o.push(n)}}const t=r(e);t&&"function"==typeof t.handle&&s.push(t.handle)}const i=t(e)[0];if(i){const e=i.$events;for(const n in e){const t=e[n];for(const e in t)if("function"==typeof t[e]){const r={handler:t[e],useCapture:!0,passive:!1,once:!1,type:n};o.push(r)}}i&&i.$handle&&s.push(i.$handle)}return{eventListeners:o,internalHandlers:s}}];try{self.devtoolsFrameworkEventListeners&&s(self.devtoolsFrameworkEventListeners)&&(r=r.concat(self.devtoolsFrameworkEventListeners))}catch(n){e.push("devtoolsFrameworkEventListeners call produced error: "+c(n))}for(let o=0;o<r.length;++o)try{const e=r[o](this);e.eventListeners&&s(e.eventListeners)&&(n=n.concat(e.eventListeners.map(i).filter(l))),e.internalHandlers&&s(e.internalHandlers)&&(t=t.concat(e.internalHandlers.map(u).filter(l)))}catch(n){e.push("fetcher call produced error: "+c(n))}const o={eventListeners:n};t.length&&(o.internalHandlers=t);if(e.length){let n="Framework Event Listeners API Errors:\n\t"+e.join("\n\t");n=n.substr(0,n.length-1),o.errorString=n}return o;function s(e){if(!e||"object"!=typeof e)return!1;try{if("function"==typeof e.splice){const n=e.length;return"number"==typeof n&&n>>>0===n&&(n>0||1/n>0)}}catch(e){}return!1}function i(n){try{let t="";n||(t+="empty event listener, ");const r=n.type;r&&"string"==typeof r||(t+="event listener's type isn't string or empty, ");const o=n.useCapture;"boolean"!=typeof o&&(t+="event listener's useCapture isn't boolean or undefined, ");const s=n.passive;"boolean"!=typeof s&&(t+="event listener's passive isn't boolean or undefined, ");const i=n.once;"boolean"!=typeof i&&(t+="event listener's once isn't boolean or undefined, ");const u=n.handler;u&&"function"==typeof u||(t+="event listener's handler isn't a function or empty, ");const c=n.remove;return c&&"function"!=typeof c&&(t+="event listener's remove isn't a function, "),t?(e.push(t.substr(0,t.length-2)),null):{type:r,useCapture:o,passive:s,once:i,handler:u,remove:c}}catch(n){return e.push(c(n)),null}}function u(n){return n&&"function"==typeof n?n:(e.push("internal handler isn't a function or empty"),null)}function c(e){try{return""+e}catch(e){return"<error>"}}function l(e){return!!e}function a(e,n,t){if(!(this&&this instanceof Node))return;const r=window.jQuery;if(!r||!r.fn)return;r(this).off(n,e,t)}}),void 0).then(u).then((function(e){return e.getOwnProperties(!1)})).then((function(e){if(!e.properties)throw new Error("Object properties is empty");const n=[];for(const c of e.properties)"eventListeners"===c.name&&c.value&&n.push(r(c.value).then(s)),"internalHandlers"===c.name&&c.value&&n.push((u=c.value,SDK.RemoteObject.RemoteArray.objectAsArray(u).map(o).then(SDK.RemoteObject.RemoteArray.createFromRemoteObjects.bind(null))).then(i)),"errorString"===c.name&&c.value&&(t=c.value,Common.Console.Console.instance().error(String(t.value)));var t;var u;return Promise.all(n)})).then((function(){return t})).catch(e=>(console.error(e),t));function r(t){return SDK.RemoteObject.RemoteArray.objectAsArray(t).map((function(t){let r,s,i,c,l=null,a=null,f=null,p=null;const h=[];function v(e){f=e?e.location:null}return h.push(t.callFunctionJSON((function(){return{type:this.type,useCapture:this.useCapture,passive:this.passive,once:this.once}}),void 0).then((function(e){r=e.type,s=e.useCapture,i=e.passive,c=e.once}))),h.push(t.callFunction((function(){return this.handler})).then(u).then((function(e){return a=e,a})).then(o).then((function(e){return l=e,e.debuggerModel().functionDetailsPromise(e).then(v)}))),h.push(t.callFunction((function(){return this.remove})).then(u).then((function(e){if("function"!==e.type)return;p=e}))),Promise.all(h).then((function(){if(!f)throw new Error("Empty event listener's location");return new SDK.DOMDebuggerModel.EventListener(n,e,r,s,i,c,l,a,f,p,SDK.DOMDebuggerModel.EventListener.Origin.FrameworkUser)})).catch(e=>(console.error(e),null))})).then(c)}function o(e){return SDK.RemoteObject.RemoteFunction.objectAsFunction(e).targetFunction()}function s(e){t.eventListeners=e}function i(e){t.internalHandlers=e}function u(e){if(e.wasThrown||!e.object)throw new Error("Exception in callFunction or empty result");return e.object}function c(e){return e.filter((function(e){return!!e}))}}export let FrameworkEventListenersObject;export let EventListenerObjectInInspectedPage;