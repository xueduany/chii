import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class ThreadsSidebarPane extends UI.Widget.VBox{constructor(){super(!0),this.registerRequiredCSS("chii_sources/threadsSidebarPane.css"),this._items=new UI.ListModel.ListModel,this._list=new UI.ListControl.ListControl(this._items,this,UI.ListControl.ListMode.NonViewport);const e=self.UI.context.flavor(SDK.SDKModel.Target);this._selectedModel=e?e.model(SDK.DebuggerModel.DebuggerModel):null,this.contentElement.appendChild(this._list.element),self.UI.context.addFlavorChangeListener(SDK.SDKModel.Target,this._targetFlavorChanged,this),SDK.SDKModel.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel,this)}static shouldBeShown(){return SDK.SDKModel.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel).length>=2}createElementForItem(e){const t=createElementWithClass("div","thread-item"),s=t.createChild("div","thread-item-title"),o=t.createChild("div","thread-item-paused-state");t.appendChild(UI.Icon.Icon.create("smallicon-thick-right-arrow","selected-thread-icon")),t.tabIndex=-1,self.onInvokeElement(t,t=>{self.UI.context.setFlavor(SDK.SDKModel.Target,e.target()),t.consume(!0)});const n=self.UI.context.flavor(SDK.SDKModel.Target)===e.target();function d(){const t=e.runtimeModel().defaultExecutionContext();s.textContent=t&&t.label()?t.label():e.target().name()}function l(){o.textContent=e.isPaused()?ls`paused`:""}return t.classList.toggle("selected",n),UI.ARIAUtils.setSelected(t,n),e.addEventListener(SDK.DebuggerModel.Events.DebuggerPaused,l),e.addEventListener(SDK.DebuggerModel.Events.DebuggerResumed,l),e.runtimeModel().addEventListener(SDK.RuntimeModel.Events.ExecutionContextChanged,d),SDK.SDKModel.TargetManager.instance().addEventListener(SDK.SDKModel.Events.NameChanged,(function(t){t.data===e.target()&&d()})),l(),d(),t}heightForItem(e){return console.assert(!1),0}isItemSelectable(e){return!0}selectedItemChanged(e,t,s,o){s&&(s.tabIndex=-1),o&&(this.setDefaultFocusedElement(o),o.tabIndex=0,this.hasFocus()&&o.focus())}updateSelectedItemARIA(e,t){return!1}modelAdded(e){this._items.insert(this._items.length,e);self.UI.context.flavor(SDK.SDKModel.Target)===e.target()&&this._list.selectItem(e)}modelRemoved(e){this._items.remove(this._items.indexOf(e))}_targetFlavorChanged(e){const t=this.hasFocus(),s=e.data.model(SDK.DebuggerModel.DebuggerModel);s&&this._list.refreshItem(s),this._selectedModel&&this._list.refreshItem(this._selectedModel),this._selectedModel=s,t&&this.focus()}}