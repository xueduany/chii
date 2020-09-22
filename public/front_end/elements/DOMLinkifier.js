import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export const decorateNodeLabel=function(e,t,n){const o=e,i=e.nodeType()===Node.ELEMENT_NODE&&e.pseudoType();i&&e.parentNode&&(e=e.parentNode);let r=e.nodeNameInCorrectCase();const d=t.createChild("span","node-label-name");d.textContent=r;const s=e.getAttribute("id");if(s){const e="#"+s;r+=e,t.createChild("span","node-label-id").createTextChild(e),d.classList.add("extra")}const a=e.getAttribute("class");if(a){const e=a.split(/\s+/),n={};if(e.length){const o=t.createChild("span","extra node-label-class");for(let t=0;t<e.length;++t){const i=e[t];if(i&&!(i in n)){const e="."+i;r+=e,o.createTextChild(e),n[i]=!0}}}}if(i){const e=t.createChild("span","extra node-label-pseudo"),n="::"+o.pseudoType();e.createTextChild(n),r+=n}t.title=n||r};export const linkifyNodeReference=function(e,t={}){if(!e)return createTextNode(Common.UIString.UIString("<node>"));const n=createElementWithClass("span","monospace"),o=UI.Utils.createShadowRootWithCoreStyles(n,"elements/domLinkifier.css").createChild("div","node-link");return decorateNodeLabel(e,o,t.tooltip),o.addEventListener("click",()=>Common.Revealer.reveal(e,!1)&&!1,!1),o.addEventListener("mouseover",e.highlight.bind(e,void 0),!1),o.addEventListener("mouseleave",()=>SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight(),!1),t.preventKeyboardFocus||(o.addEventListener("keydown",t=>isEnterKey(t)&&Common.Revealer.reveal(e,!1)&&!1),o.tabIndex=0,UI.ARIAUtils.markAsLink(o)),n};export const linkifyDeferredNodeReference=function(e,t={}){const n=createElement("div"),o=UI.Utils.createShadowRootWithCoreStyles(n,"elements/domLinkifier.css").createChild("div","node-link");function i(e){Common.Revealer.reveal(e)}return o.createChild("slot"),o.addEventListener("click",e.resolve.bind(e,i),!1),o.addEventListener("mousedown",e=>e.consume(),!1),t.preventKeyboardFocus||(o.addEventListener("keydown",t=>isEnterKey(t)&&e.resolve(i)),o.tabIndex=0,UI.ARIAUtils.markAsLink(o)),n};export class Linkifier{linkify(e,t){if(e instanceof SDK.DOMModel.DOMNode)return linkifyNodeReference(e,t);if(e instanceof SDK.DOMModel.DeferredDOMNode)return linkifyDeferredNodeReference(e,t);throw new Error("Can't linkify non-node")}}