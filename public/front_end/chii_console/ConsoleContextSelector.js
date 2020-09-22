import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class ConsoleContextSelector{constructor(){this._items=new UI.ListModel.ListModel,this._dropDown=new UI.SoftDropDown.SoftDropDown(this._items,this),this._dropDown.setRowHeight(36),this._toolbarItem=new UI.Toolbar.ToolbarItem(this._dropDown.element),this._toolbarItem.setEnabled(!1),this._toolbarItem.setTitle(ls`JavaScript context: Not selected`),this._items.addEventListener(UI.ListModel.Events.ItemsReplaced,()=>this._toolbarItem.setEnabled(!!this._items.length)),this._toolbarItem.element.classList.add("toolbar-has-dropdown"),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.RuntimeModel.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextCreated,this._onExecutionContextCreated,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.RuntimeModel.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextChanged,this._onExecutionContextChanged,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.RuntimeModel.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextDestroyed,this._onExecutionContextDestroyed,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel,SDK.ResourceTreeModel.Events.FrameNavigated,this._frameNavigated,this),self.UI.context.addFlavorChangeListener(SDK.RuntimeModel.ExecutionContext,this._executionContextChangedExternally,this),self.UI.context.addFlavorChangeListener(SDK.DebuggerModel.CallFrame,this._callFrameSelectedInUI,this),SDK.SDKModel.TargetManager.instance().observeModels(SDK.RuntimeModel.RuntimeModel,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.CallFrameSelected,this._callFrameSelectedInModel,this)}toolbarItem(){return this._toolbarItem}highlightedItemChanged(e,t,o,r){if(SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight(),t&&t.frameId){const e=t.target().model(SDK.OverlayModel.OverlayModel);e&&e.highlightFrame(t.frameId)}o&&o.classList.remove("highlighted"),r&&r.classList.add("highlighted")}titleFor(e){const t=e.target();let o=e.label()?t.decorateLabel(e.label()):"";if(e.frameId){const r=t.model(SDK.ResourceTreeModel.ResourceTreeModel),n=r&&r.frameForId(e.frameId);n&&(o=o||n.displayName())}return o=o||e.origin,o}_depthFor(e){let t=e.target(),o=0;if(e.isDefault||o++,e.frameId){const r=t.model(SDK.ResourceTreeModel.ResourceTreeModel);let n=r&&r.frameForId(e.frameId);for(;n;)n=n.parentFrame||n.crossTargetParentFrame(),n&&(o++,t=n.resourceTreeModel().target())}let r=0;for(;t.parentTarget()&&t.type()!==SDK.SDKModel.Type.ServiceWorker;)r++,t=t.parentTarget();return o+=r,o}_executionContextCreated(e){this._items.insertWithComparator(e,e.runtimeModel.executionContextComparator()),e===self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext)&&this._dropDown.selectItem(e)}_onExecutionContextCreated(e){const t=e.data;this._executionContextCreated(t)}_onExecutionContextChanged(e){const t=e.data;-1!==this._items.indexOf(t)&&(this._executionContextDestroyed(t),this._executionContextCreated(t))}_executionContextDestroyed(e){const t=this._items.indexOf(e);-1!==t&&this._items.remove(t)}_onExecutionContextDestroyed(e){const t=e.data;this._executionContextDestroyed(t)}_executionContextChangedExternally(e){const t=e.data;this._dropDown.selectItem(t)}_isTopContext(e){if(!e||!e.isDefault)return!1;const t=e.target().model(SDK.ResourceTreeModel.ResourceTreeModel),o=e.frameId&&t&&t.frameForId(e.frameId);return!!o&&o.isTopFrame()}_hasTopContext(){return this._items.some(e=>this._isTopContext(e))}modelAdded(e){e.executionContexts().forEach(this._executionContextCreated,this)}modelRemoved(e){for(let t=this._items.length-1;t>=0;t--)this._items.at(t).runtimeModel===e&&this._executionContextDestroyed(this._items.at(t))}createElementForItem(e){const t=createElementWithClass("div"),o=UI.Utils.createShadowRootWithCoreStyles(t,"chii_console/consoleContextSelector.css");o.createChild("div","title").createTextChild(this.titleFor(e).trimEndWithMaxLength(100));return o.createChild("div","subtitle").createTextChild(this._subtitleFor(e)),t.style.paddingLeft=8+15*this._depthFor(e)+"px",t}_subtitleFor(e){const t=e.target();let o;if(e.frameId){const r=t.model(SDK.ResourceTreeModel.ResourceTreeModel);o=r&&r.frameForId(e.frameId)}if(e.origin.startsWith("chrome-extension://"))return Common.UIString.UIString("Extension");if(!o||!o.parentFrame||o.parentFrame.securityOrigin!==e.origin){const t=Common.ParsedURL.ParsedURL.fromString(e.origin);if(t)return t.domain()}if(o){const e=o.findCreationCallFrame(e=>!!e.url);return e?new Common.ParsedURL.ParsedURL(e.url).domain():Common.UIString.UIString("IFrame")}return""}isItemSelectable(e){const t=e.debuggerModel.selectedCallFrame(),o=t&&t.script.executionContext();return!o||e===o}itemSelected(e){this._toolbarItem.element.classList.toggle("warning",!this._isTopContext(e)&&this._hasTopContext());const t=e?ls`JavaScript context: ${this.titleFor(e)}`:ls`JavaScript context: Not selected`;this._toolbarItem.setTitle(t),self.UI.context.setFlavor(SDK.RuntimeModel.ExecutionContext,e)}_callFrameSelectedInUI(){const e=self.UI.context.flavor(SDK.DebuggerModel.CallFrame),t=e&&e.script.executionContext();t&&self.UI.context.setFlavor(SDK.RuntimeModel.ExecutionContext,t)}_callFrameSelectedInModel(e){const t=e.data;for(const e of this._items)e.debuggerModel===t&&this._dropDown.refreshItem(e)}_frameNavigated(e){const t=e.data,o=t.resourceTreeModel().target().model(SDK.RuntimeModel.RuntimeModel);if(o)for(const e of o.executionContexts())t.id===e.frameId&&this._dropDown.refreshItem(e)}}