import*as Common from"../common/common.js";import*as Platform from"../platform/platform.js";import*as ARIAUtils from"./ARIAUtils.js";import{SuggestBox,SuggestBoxDelegate,Suggestion,Suggestions}from"./SuggestBox.js";import{ElementFocusRestorer}from"./UIUtils.js";import{appendStyle}from"./utils/append-style.js";export class TextPrompt extends Common.ObjectWrapper.ObjectWrapper{constructor(){super(),this._proxyElement,this._proxyElementDisplay="inline-block",this._autocompletionTimeout=DefaultAutocompletionTimeout,this._title="",this._queryRange=null,this._previousText="",this._currentSuggestion=null,this._completionRequestId=0,this._ghostTextElement=createElementWithClass("span","auto-complete-text"),this._ghostTextElement.setAttribute("contenteditable","false"),this._leftParenthesesIndices=[],ARIAUtils.markAsHidden(this._ghostTextElement)}initialize(t,e){this._loadCompletions=t,this._completionStopCharacters=e||" =:[({;,!+-*/&|^<>."}setAutocompletionTimeout(t){this._autocompletionTimeout=t}renderAsBlock(){this._proxyElementDisplay="block"}attach(t){return this._attachInternal(t)}attachAndStartEditing(t,e){const s=this._attachInternal(t);return this._startEditing(e),s}_attachInternal(t){if(this._proxyElement)throw"Cannot attach an attached TextPrompt";return this._element=t,this._boundOnKeyDown=this.onKeyDown.bind(this),this._boundOnInput=this.onInput.bind(this),this._boundOnMouseWheel=this.onMouseWheel.bind(this),this._boundClearAutocomplete=this.clearAutocomplete.bind(this),this._proxyElement=t.ownerDocument.createElement("span"),appendStyle(this._proxyElement,"ui/textPrompt.css"),this._contentElement=this._proxyElement.createChild("div","text-prompt-root"),this._proxyElement.style.display=this._proxyElementDisplay,t.parentElement.insertBefore(this._proxyElement,t),this._contentElement.appendChild(t),this._element.classList.add("text-prompt"),ARIAUtils.markAsTextBox(this._element),this._element.setAttribute("contenteditable","plaintext-only"),this._element.addEventListener("keydown",this._boundOnKeyDown,!1),this._element.addEventListener("input",this._boundOnInput,!1),this._element.addEventListener("mousewheel",this._boundOnMouseWheel,!1),this._element.addEventListener("selectstart",this._boundClearAutocomplete,!1),this._element.addEventListener("blur",this._boundClearAutocomplete,!1),this._suggestBox=new SuggestBox(this,20),this._title&&(this._proxyElement.title=this._title),this._proxyElement}detach(){this._removeFromElement(),this._focusRestorer.restore(),this._proxyElement.parentElement.insertBefore(this._element,this._proxyElement),this._proxyElement.remove(),delete this._proxyElement,this._element.classList.remove("text-prompt"),this._element.removeAttribute("contenteditable"),this._element.removeAttribute("role")}textWithCurrentSuggestion(){const t=this.text();if(!this._queryRange||!this._currentSuggestion)return t;const e=this._currentSuggestion.text;return t.substring(0,this._queryRange.startColumn)+e+t.substring(this._queryRange.endColumn)}text(){let t=this._element.textContent;if(this._ghostTextElement.parentNode){const e=this._ghostTextElement.textContent;t=t.substring(0,t.length-e.length)}return t}setText(t){this.clearAutocomplete(),this._element.textContent=t,this._previousText=this.text(),this._element.hasFocus()&&(this.moveCaretToEndOfPrompt(),this._element.scrollIntoView())}focus(){this._element.focus()}title(){return this._title}setTitle(t){this._title=t,this._proxyElement&&(this._proxyElement.title=t)}setPlaceholder(t,e){t?(this._element.setAttribute("data-placeholder",t),ARIAUtils.setPlaceholder(this._element,e||t)):(this._element.removeAttribute("data-placeholder"),ARIAUtils.setPlaceholder(this._element,null))}setEnabled(t){t?this._element.setAttribute("contenteditable","plaintext-only"):this._element.removeAttribute("contenteditable"),this._element.classList.toggle("disabled",!t)}_removeFromElement(){this.clearAutocomplete(),this._element.removeEventListener("keydown",this._boundOnKeyDown,!1),this._element.removeEventListener("input",this._boundOnInput,!1),this._element.removeEventListener("selectstart",this._boundClearAutocomplete,!1),this._element.removeEventListener("blur",this._boundClearAutocomplete,!1),this._isEditing&&this._stopEditing(),this._suggestBox&&this._suggestBox.hide()}_startEditing(t){this._isEditing=!0,this._contentElement.classList.add("text-prompt-editing"),t&&(this._blurListener=t,this._element.addEventListener("blur",this._blurListener,!1)),this._oldTabIndex=this._element.tabIndex,this._element.tabIndex<0&&(this._element.tabIndex=0),this._focusRestorer=new ElementFocusRestorer(this._element),this.text()||this.autoCompleteSoon()}_stopEditing(){this._element.tabIndex=this._oldTabIndex,this._blurListener&&this._element.removeEventListener("blur",this._blurListener,!1),this._contentElement.classList.remove("text-prompt-editing"),delete this._isEditing}onMouseWheel(t){}onKeyDown(t){let e=!1;if(this.isSuggestBoxVisible()&&this._suggestBox.keyPressed(t))t.consume(!0);else{switch(t.key){case"Tab":e=this.tabKeyPressed(t);break;case"ArrowLeft":case"ArrowUp":case"PageUp":case"Home":this.clearAutocomplete();break;case"PageDown":case"ArrowRight":case"ArrowDown":case"End":this._isCaretAtEndOfPrompt()?e=this.acceptAutoComplete():this.clearAutocomplete();break;case"Escape":this.isSuggestBoxVisible()&&(this.clearAutocomplete(),e=!0);break;case" ":!t.ctrlKey||t.metaKey||t.altKey||t.shiftKey||(this.autoCompleteSoon(!0),e=!0)}isEnterKey(t)&&t.preventDefault(),e&&t.consume(!0)}}_acceptSuggestionOnStopCharacters(t){if(!this._currentSuggestion||!this._queryRange||1!==t.length||!this._completionStopCharacters.includes(t))return!1;const e=this.text().substring(this._queryRange.startColumn,this._queryRange.endColumn);return!(!e||!this._currentSuggestion.text.startsWith(e+t))&&(this._queryRange.endColumn+=1,this.acceptAutoComplete())}onInput(t){let e=this.text();const s=t.data;"insertFromPaste"===t.inputType&&e.includes("\n")&&(e=Platform.StringUtilities.stripLineBreaks(e),this.setText(e));const n=this._getCaretPosition();if(")"===s&&n>=0&&this._leftParenthesesIndices.length>0){if(")"===e[n]&&this._tryMatchingLeftParenthesis(n))return e=e.substring(0,n)+e.substring(n+1),void this.setText(e)}if(s&&!this._acceptSuggestionOnStopCharacters(s)){const t=e.startsWith(this._previousText)||this._previousText.startsWith(e);this._queryRange&&t&&(this._queryRange.endColumn+=e.length-this._previousText.length)}this._refreshGhostText(),this._previousText=e,this.dispatchEventToListeners(Events.TextChanged),this.autoCompleteSoon()}acceptAutoComplete(){let t=!1;return this.isSuggestBoxVisible()&&(t=this._suggestBox.acceptSuggestion()),t||(t=this._acceptSuggestionInternal()),t}clearAutocomplete(){const t=this.textWithCurrentSuggestion();this.isSuggestBoxVisible()&&this._suggestBox.hide(),this._clearAutocompleteTimeout(),this._queryRange=null,this._refreshGhostText(),t!==this.textWithCurrentSuggestion()&&this.dispatchEventToListeners(Events.TextChanged)}_refreshGhostText(){this._currentSuggestion&&this._currentSuggestion.hideGhostText?this._ghostTextElement.remove():this._queryRange&&this._currentSuggestion&&this._isCaretAtEndOfPrompt()&&this._currentSuggestion.text.startsWith(this.text().substring(this._queryRange.startColumn))?(this._ghostTextElement.textContent=this._currentSuggestion.text.substring(this._queryRange.endColumn-this._queryRange.startColumn),this._element.appendChild(this._ghostTextElement)):this._ghostTextElement.remove()}_clearAutocompleteTimeout(){this._completeTimeout&&(clearTimeout(this._completeTimeout),delete this._completeTimeout),this._completionRequestId++}autoCompleteSoon(t){const e=this.isSuggestBoxVisible()||t;this._completeTimeout||(this._completeTimeout=setTimeout(this.complete.bind(this,t),e?0:this._autocompletionTimeout))}async complete(t){this._clearAutocompleteTimeout();const e=this._element.getComponentSelection(),s=e&&e.rangeCount?e.getRangeAt(0):null;if(!s)return;let n;if((t||this._isCaretAtEndOfPrompt()||this.isSuggestBoxVisible())&&e.isCollapsed||(n=!0),n)return void this.clearAutocomplete();const i=s.startContainer.rangeOfWord(s.startOffset,this._completionStopCharacters,this._element,"backward"),o=i.cloneRange();o.collapse(!0),o.setStartBefore(this._element);const r=++this._completionRequestId,l=await this._loadCompletions(o.toString(),i.toString(),!!t);this._completionsReady(r,e,i,!!t,l)}disableDefaultSuggestionForEmptyInput(){this._disableDefaultSuggestionForEmptyInput=!0}_boxForAnchorAtStart(t,e){const s=t.getRangeAt(0).cloneRange(),n=createElement("span");n.textContent="​",e.insertNode(n);const i=n.boxInWindow(window);return n.remove(),t.removeAllRanges(),t.addRange(s),i}_createRange(){return document.createRange()}additionalCompletions(t){return[]}_completionsReady(t,e,s,n,i){if(this._completionRequestId!==t)return;const o=s.toString(),r=new Set;if(i=i.filter(t=>!r.has(t.text)&&!!r.add(t.text)),(o||n)&&(i=o?i.concat(this.additionalCompletions(o)):this.additionalCompletions(o).concat(i)),!i.length)return void this.clearAutocomplete();const l=e.getRangeAt(0),h=this._createRange();if(h.setStart(s.startContainer,s.startOffset),h.setEnd(l.endContainer,l.endOffset),o+l.toString()!==h.toString())return;const a=this._createRange();a.setStart(this._element,0),a.setEnd(h.startContainer,h.startOffset),this._queryRange=new TextUtils.TextRange(0,a.toString().length,0,a.toString().length+h.toString().length);const u=!this._disableDefaultSuggestionForEmptyInput||!!this.text();this._suggestBox&&this._suggestBox.updateSuggestions(this._boxForAnchorAtStart(e,h),i,u,!this._isCaretAtEndOfPrompt(),this.text())}applySuggestion(t,e){this._currentSuggestion=t,this._refreshGhostText(),e&&this.dispatchEventToListeners(Events.TextChanged)}acceptSuggestion(){this._acceptSuggestionInternal()}_acceptSuggestionInternal(){if(!this._queryRange)return!1;const t=this._currentSuggestion?this._currentSuggestion.text.length:0,e=this._currentSuggestion?this._currentSuggestion.selectionRange:null,s=e?e.endColumn:t,n=e?e.startColumn:t;return this._element.textContent=this.textWithCurrentSuggestion(),this.setDOMSelection(this._queryRange.startColumn+n,this._queryRange.startColumn+s),this._updateLeftParenthesesIndices(),this.clearAutocomplete(),this.dispatchEventToListeners(Events.TextChanged),!0}setDOMSelection(t,e){this._element.normalize();const s=this._element.childNodes[0];if(!s||s===this._ghostTextElement)return;const n=this._createRange();n.setStart(s,t),n.setEnd(s,e);const i=this._element.getComponentSelection();i.removeAllRanges(),i.addRange(n)}isSuggestBoxVisible(){return this._suggestBox&&this._suggestBox.visible()}isCaretInsidePrompt(){const t=this._element.getComponentSelection(),e=t&&t.rangeCount?t.getRangeAt(0):null;return!(!e||!t.isCollapsed)&&e.startContainer.isSelfOrDescendant(this._element)}_isCaretAtEndOfPrompt(){const t=this._element.getComponentSelection(),e=t&&t.rangeCount?t.getRangeAt(0):null;if(!e||!t.isCollapsed)return!1;let s=e.startContainer;if(!s.isSelfOrDescendant(this._element))return!1;if(this._ghostTextElement.isAncestor(s))return!0;if(s.nodeType===Node.TEXT_NODE&&e.startOffset<s.nodeValue.length)return!1;let n=!1;for(;s;){if(s.nodeType===Node.TEXT_NODE&&s.nodeValue.length){if(n&&!this._ghostTextElement.isAncestor(s))return!1;n=!0}s=s.traverseNextNode(this._element)}return!0}moveCaretToEndOfPrompt(){const t=this._element.getComponentSelection(),e=this._createRange();let s=this._element;for(;s.childNodes.length;)s=s.lastChild;const n=s.nodeType===Node.TEXT_NODE?s.textContent.length:0;e.setStart(s,n),e.setEnd(s,n),t.removeAllRanges(),t.addRange(e)}_getCaretPosition(){if(!this._element.hasFocus())return-1;const t=this._element.getComponentSelection(),e=t&&t.rangeCount?t.getRangeAt(0):null;return e&&t.isCollapsed?e.startOffset!==e.endOffset?-1:e.startOffset:-1}tabKeyPressed(t){return this.acceptAutoComplete()}proxyElementForTests(){return this._proxyElement||null}_tryMatchingLeftParenthesis(t){const e=this._leftParenthesesIndices;if(0===e.length||t<0)return!1;for(let s=e.length-1;s>=0;--s)if(e[s]<t)return e.splice(s,1),!0;return!1}_updateLeftParenthesesIndices(){const t=this.text(),e=this._leftParenthesesIndices=[];for(let s=0;s<t.length;++s)"("===t[s]&&e.push(s)}}const DefaultAutocompletionTimeout=250;export const Events={TextChanged:Symbol("TextChanged")};