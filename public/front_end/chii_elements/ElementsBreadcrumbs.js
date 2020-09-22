import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";import{decorateNodeLabel}from"./DOMLinkifier.js";export class ElementsBreadcrumbs extends UI.Widget.HBox{constructor(){super(!0),this.registerRequiredCSS("chii_elements/breadcrumbs.css"),this.crumbsElement=this.contentElement.createChild("div","crumbs"),this.crumbsElement.addEventListener("mousemove",this._mouseMovedInCrumbs.bind(this),!1),this.crumbsElement.addEventListener("mouseleave",this._mouseMovedOutOfCrumbs.bind(this),!1),this._nodeSymbol=Symbol("node"),UI.ARIAUtils.markAsHidden(this.element)}wasShown(){this.update()}updateNodes(e){if(!e.length)return;for(let t=this.crumbsElement.firstChild;t;t=t.nextSibling)if(-1!==e.indexOf(t[this._nodeSymbol]))return void this.update(!0)}setSelectedNode(e){this._currentDOMNode=e,this.crumbsElement.window().requestAnimationFrame(()=>this.update())}_mouseMovedInCrumbs(e){const t=e.target.enclosingNodeOrSelfWithClass("crumb"),s=t?t[this._nodeSymbol]:null;s&&s.highlight()}_mouseMovedOutOfCrumbs(e){this._currentDOMNode&&SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight()}_onClickCrumb(e){e.preventDefault();let t=e.currentTarget;if(t.classList.contains("collapsed")){if(t===this.crumbsElement.firstChild){let e=t;for(;e;){const s=e.classList.contains("hidden"),i=e.classList.contains("collapsed");if(!s&&!i)break;t=e,e=e.nextSiblingElement}}this.updateSizes(t)}else this.dispatchEventToListeners(Events.NodeSelected,t[this._nodeSymbol])}_determineElementTitle(e){switch(e.nodeType()){case Node.ELEMENT_NODE:return e.pseudoType()?"::"+e.pseudoType():null;case Node.TEXT_NODE:return Common.UIString.UIString("(text)");case Node.COMMENT_NODE:return"\x3c!--\x3e";case Node.DOCUMENT_TYPE_NODE:return"<!doctype>";case Node.DOCUMENT_FRAGMENT_NODE:return e.shadowRootType()?"#shadow-root":e.nodeNameInCorrectCase();default:return e.nodeNameInCorrectCase()}}update(e){if(!this.isShowing())return;const t=this._currentDOMNode,s=this.crumbsElement;let i=!1,n=s.firstChild;for(;n;)n[this._nodeSymbol]===t?(n.classList.add("selected"),i=!0):n.classList.remove("selected"),n=n.nextSibling;if(!i||e){s.removeChildren();for(let e=t;e;e=e.parentNode){if(e.nodeType()===Node.DOCUMENT_NODE)continue;n=createElementWithClass("span","crumb"),n[this._nodeSymbol]=e,n.addEventListener("mousedown",this._onClickCrumb.bind(this),!1);const i=this._determineElementTitle(e);if(i){const e=createElement("span");e.textContent=i,n.appendChild(e),n.title=i}else decorateNodeLabel(e,n);e===t&&n.classList.add("selected"),s.insertBefore(n,s.firstChild)}this.updateSizes()}else this.updateSizes()}_resetCrumbStylesAndFindSelections(e){const t=this.crumbsElement;let s=0,i=0,n=null;for(let o=0;o<t.childNodes.length;++o){const l=t.children[o];!n&&l.classList.contains("selected")&&(n=l,s=o),l===e&&(i=o),l.classList.remove("compact","collapsed","hidden")}return{selectedIndex:s,focusedIndex:i,selectedCrumb:n}}_measureElementSizes(){const e=this.crumbsElement,t=createElementWithClass("span","crumb collapsed");e.insertBefore(t,e.firstChild);const s=e.offsetWidth,i=t.offsetWidth,n=[];for(let t=1;t<e.childNodes.length;++t){const s=e.childNodes[t];n[t-1]=s.offsetWidth}e.removeChild(t);const o=[];for(let t=0;t<e.childNodes.length;++t){e.childNodes[t].classList.add("compact")}for(let t=0;t<e.childNodes.length;++t){const s=e.childNodes[t];o[t]=s.offsetWidth}for(let t=0;t<e.childNodes.length;++t){e.childNodes[t].classList.remove("compact","collapsed")}return{normal:n,compact:o,collapsed:i,available:s}}updateSizes(e){if(!this.isShowing())return;const t=this.crumbsElement;if(!t.firstChild)return;const s=this._resetCrumbStylesAndFindSelections(e),i=this._measureElementSizes(),n=s.selectedIndex,o=s.focusedIndex,l=s.selectedCrumb;function d(){let e=0;for(let s=0;s<t.childNodes.length;++s){const n=t.childNodes[s];n.classList.contains("hidden")||(n.classList.contains("collapsed")?e+=i.collapsed:e+=n.classList.contains("compact")?i.compact[s]:i.normal[s])}return e+10<i.available}if(d())return;function c(s,i){const c=e||l,r=c===l?n:o;function a(e){const i=t.children[e];return i&&i!==c&&s(i),!!d()}if(i){let e=i>0?0:t.childNodes.length-1;for(;e!==r;){if(a(e))return!0;e+=i>0?1:-1}}else{let e=0,s=t.childNodes.length-1;for(;e!==r||s!==r;){let t;if(t=r-e>=s-r?e++:s--,a(t))return!0}}return!1}function r(e){e.classList.contains("hidden")||e.classList.add("compact")}function a(e,s){e.classList.contains("hidden")||(e.classList.add("collapsed"),e.classList.remove("compact"),s||function(){let e=t.firstChild,s=!1,i=!1,n=!1;for(;e;){if(e.classList.contains("hidden"))s=!0;else{const t=e.classList.contains("collapsed");if(s&&t){e.classList.add("hidden"),e.classList.remove("compact"),e.classList.remove("collapsed"),e.classList.contains("start")&&(e.classList.remove("start"),i=!0),e.classList.contains("end")&&(e.classList.remove("end"),n=!0);continue}s=t,n&&(n=!1,e.classList.add("end"))}e=e.nextSibling}if(i)for(e=t.lastChild;e;){if(!e.classList.contains("hidden")){e.classList.add("start");break}e=e.previousSibling}}())}if(!e){if(c(r,1))return;if(c(a,1))return}c(r,e?0:-1)||c(a,e?0:-1)||l&&(r(l),d()||a(l,!0))}}export const Events={NodeSelected:Symbol("NodeSelected")};