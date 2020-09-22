import*as Bindings from"../bindings/bindings.js";import*as Common from"../common/common.js";import*as Extensions from"../extensions/extensions.js";import*as Host from"../host/host.js";import*as ObjectUI from"../object_ui/object_ui.js";import*as SDK from"../sdk/sdk.js";import*as Snippets from"../snippets/snippets.js";import*as UI from"../ui/ui.js";import*as Workspace from"../workspace/workspace.js";import{CallStackSidebarPane}from"./CallStackSidebarPane.js";import{DebuggerPausedMessage}from"./DebuggerPausedMessage.js";import{NavigatorView}from"./NavigatorView.js";import{Events,SourcesView}from"./SourcesView.js";import{ThreadsSidebarPane}from"./ThreadsSidebarPane.js";import{UISourceCodeFrame}from"./UISourceCodeFrame.js";export class SourcesPanel extends UI.Panel.Panel{constructor(){super("sources"),SourcesPanel._instance=this,this.registerRequiredCSS("chii_sources/sourcesPanel.css"),new UI.DropTarget.DropTarget(this.element,[UI.DropTarget.Type.Folder],Common.UIString.UIString("Drop workspace folder here"),this._handleDrop.bind(this)),this._workspace=Workspace.Workspace.WorkspaceImpl.instance(),this._togglePauseAction=self.UI.actionRegistry.action("debugger.toggle-pause"),this._stepOverAction=self.UI.actionRegistry.action("debugger.step-over"),this._stepIntoAction=self.UI.actionRegistry.action("debugger.step-into"),this._stepOutAction=self.UI.actionRegistry.action("debugger.step-out"),this._stepAction=self.UI.actionRegistry.action("debugger.step"),this._toggleBreakpointsActiveAction=self.UI.actionRegistry.action("debugger.toggle-breakpoints-active"),this._debugToolbar=this._createDebugToolbar(),this._debugToolbarDrawer=this._createDebugToolbarDrawer(),this._debuggerPausedMessage=new DebuggerPausedMessage;this._splitWidget=new UI.SplitWidget.SplitWidget(!0,!0,"sourcesPanelSplitViewState",225),this._splitWidget.enableShowModeSaving(),this._splitWidget.show(this.element),this._splitWidget.hideSidebar(!0);this.editorView=new UI.SplitWidget.SplitWidget(!0,!1,"sourcesPanelNavigatorSplitViewState",225),this.editorView.enableShowModeSaving(),this._splitWidget.setMainWidget(this.editorView),this._navigatorTabbedLocation=UI.ViewManager.ViewManager.instance().createTabbedLocation(this._revealNavigatorSidebar.bind(this),"navigator-view",!0);const e=this._navigatorTabbedLocation.tabbedPane();e.setMinimumSize(100,25),e.element.classList.add("navigator-tabbed-pane");const t=new UI.Toolbar.ToolbarMenuButton(this._populateNavigatorMenu.bind(this),!0);if(t.setTitle(Common.UIString.UIString("More options")),e.rightToolbar().appendToolbarItem(t),UI.ViewManager.ViewManager.instance().hasViewsForLocation("run-view-sidebar")){const t=new UI.SplitWidget.SplitWidget(!1,!0,"sourcePanelNavigatorSidebarSplitViewState");t.setMainWidget(e);const i=UI.ViewManager.ViewManager.instance().createTabbedLocation(this._revealNavigatorSidebar.bind(this),"run-view-sidebar").tabbedPane();t.setSidebarWidget(i),t.installResizer(i.headerElement()),this.editorView.setSidebarWidget(t)}else this.editorView.setSidebarWidget(e);this._sourcesView=new SourcesView,this._sourcesView.addEventListener(Events.EditorSelected,this._editorSelected.bind(this)),this._toggleNavigatorSidebarButton=this.editorView.createShowHideSidebarButton(ls`navigator`),this._toggleDebuggerSidebarButton=this._splitWidget.createShowHideSidebarButton(ls`debugger`),this.editorView.setMainWidget(this._sourcesView),this._threadsSidebarPane=null,this._watchSidebarPane=UI.ViewManager.ViewManager.instance().view("sources.watch"),this._callstackPane=self.runtime.sharedInstance(CallStackSidebarPane),Common.Settings.Settings.instance().moduleSetting("sidebarPosition").addChangeListener(this._updateSidebarPosition.bind(this)),this._updateSidebarPosition(),this._updateDebuggerButtonsAndStatus(),this._pauseOnExceptionEnabledChanged(),Common.Settings.Settings.instance().moduleSetting("pauseOnExceptionEnabled").addChangeListener(this._pauseOnExceptionEnabledChanged,this),this._liveLocationPool=new Bindings.LiveLocation.LiveLocationPool,this._setTarget(self.UI.context.flavor(SDK.SDKModel.Target)),Common.Settings.Settings.instance().moduleSetting("breakpointsActive").addChangeListener(this._breakpointsActiveStateChanged,this),self.UI.context.addFlavorChangeListener(SDK.SDKModel.Target,this._onCurrentTargetChanged,this),self.UI.context.addFlavorChangeListener(SDK.DebuggerModel.CallFrame,this._callFrameChanged,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerWasEnabled,this._debuggerWasEnabled,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerPaused,this._debuggerPaused,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.DebuggerResumed,e=>this._debuggerResumed(e.data)),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel,SDK.DebuggerModel.Events.GlobalObjectCleared,e=>this._debuggerResumed(e.data)),self.Extensions.extensionServer.addEventListener(Extensions.ExtensionServer.Events.SidebarPaneAdded,this._extensionSidebarPaneAdded,this),SDK.SDKModel.TargetManager.instance().observeTargets(this)}static instance(){return SourcesPanel._instance?SourcesPanel._instance:self.runtime.sharedInstance(SourcesPanel)}static updateResizerAndSidebarButtons(e){e._sourcesView.leftToolbar().removeToolbarItems(),e._sourcesView.rightToolbar().removeToolbarItems(),e._sourcesView.bottomToolbar().removeToolbarItems();const t=WrapperView.isShowing()&&!self.UI.inspectorView.isDrawerMinimized();e._splitWidget.isVertical()||t?e._splitWidget.uninstallResizer(e._sourcesView.toolbarContainerElement()):e._splitWidget.installResizer(e._sourcesView.toolbarContainerElement()),t||(e._sourcesView.leftToolbar().appendToolbarItem(e._toggleNavigatorSidebarButton),window.ChiiMain||(e._splitWidget.isVertical()?e._sourcesView.rightToolbar().appendToolbarItem(e._toggleDebuggerSidebarButton):e._sourcesView.bottomToolbar().appendToolbarItem(e._toggleDebuggerSidebarButton)))}targetAdded(e){this._showThreadsIfNeeded()}targetRemoved(e){}_showThreadsIfNeeded(){ThreadsSidebarPane.shouldBeShown()&&!this._threadsSidebarPane&&(this._threadsSidebarPane=UI.ViewManager.ViewManager.instance().view("sources.threads"),this._sidebarPaneStack&&this._threadsSidebarPane&&this._sidebarPaneStack.showView(this._threadsSidebarPane,this._splitWidget.isVertical()?this._watchSidebarPane:this._callstackPane))}_setTarget(e){if(!e)return;const t=e.model(SDK.DebuggerModel.DebuggerModel);t&&(t.isPaused()?this._showDebuggerPausedDetails(t.debuggerPausedDetails()):(this._paused=!1,this._clearInterface(),this._toggleDebuggerSidebarButton.setEnabled(!0)))}_onCurrentTargetChanged(e){const t=e.data;this._setTarget(t)}paused(){return this._paused}wasShown(){self.UI.context.setFlavor(SourcesPanel,this),super.wasShown();const e=WrapperView._instance;e&&e.isShowing()&&(self.UI.inspectorView.setDrawerMinimized(!0),SourcesPanel.updateResizerAndSidebarButtons(this)),this.editorView.setMainWidget(this._sourcesView)}willHide(){super.willHide(),self.UI.context.setFlavor(SourcesPanel,null),WrapperView.isShowing()&&(WrapperView._instance._showViewInWrapper(),self.UI.inspectorView.setDrawerMinimized(!1),SourcesPanel.updateResizerAndSidebarButtons(this))}resolveLocation(e){return"sources.sidebar-top"===e||"sources.sidebar-bottom"===e||"sources.sidebar-tabs"===e?this._sidebarPaneStack:this._navigatorTabbedLocation}_ensureSourcesViewVisible(){return!!WrapperView.isShowing()||!!self.UI.inspectorView.canSelectPanel("sources")&&(UI.ViewManager.ViewManager.instance().showView("sources"),!0)}onResize(){"auto"===Common.Settings.Settings.instance().moduleSetting("sidebarPosition").get()&&this.element.window().requestAnimationFrame(this._updateSidebarPosition.bind(this))}searchableView(){return this._sourcesView.searchableView()}_debuggerPaused(e){const t=e.data,i=t.debuggerPausedDetails();this._paused||this._setAsCurrentPanel(),self.UI.context.flavor(SDK.SDKModel.Target)===t.target()?this._showDebuggerPausedDetails(i):this._paused||self.UI.context.setFlavor(SDK.SDKModel.Target,t.target())}_showDebuggerPausedDetails(e){this._paused=!0,this._updateDebuggerButtonsAndStatus(),self.UI.context.setFlavor(SDK.DebuggerModel.DebuggerPausedDetails,e),this._toggleDebuggerSidebarButton.setEnabled(!1),this._revealDebuggerSidebar(),window.focus(),Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront()}_debuggerResumed(e){const t=e.target();self.UI.context.flavor(SDK.SDKModel.Target)===t&&(this._paused=!1,this._clearInterface(),this._toggleDebuggerSidebarButton.setEnabled(!0),this._switchToPausedTargetTimeout=setTimeout(this._switchToPausedTarget.bind(this,e),500))}_debuggerWasEnabled(e){const t=e.data;self.UI.context.flavor(SDK.SDKModel.Target)===t.target()&&this._updateDebuggerButtonsAndStatus()}get visibleView(){return this._sourcesView.visibleView()}showUISourceCode(e,t,i,s){if(s){const e=WrapperView._instance&&WrapperView._instance.isShowing();if(!this.isShowing()&&!e)return}else this._showEditor();this._sourcesView.showSourceLocation(e,t,i,s)}_showEditor(){WrapperView._instance&&WrapperView._instance.isShowing()||this._setAsCurrentPanel()}showUILocation(e,t){this.showUISourceCode(e.uiSourceCode,e.lineNumber,e.columnNumber,t)}_revealInNavigator(e,t){const i=self.runtime.extensions(NavigatorView);Promise.all(i.map(e=>e.instance())).then(function(s){for(let n=0;n<s.length;++n){const o=s[n],a=i[n].descriptor().viewId;o.acceptProject(e.project())&&(o.revealUISourceCode(e,!0),t?this._navigatorTabbedLocation.tabbedPane().selectTab(a):UI.ViewManager.ViewManager.instance().showView(a))}}.bind(this))}_populateNavigatorMenu(e){const t=Common.Settings.Settings.instance().moduleSetting("navigatorGroupByFolder");e.appendItemsAtLocation("navigatorMenu"),e.viewSection().appendCheckboxItem(Common.UIString.UIString("Group by folder"),()=>t.set(!t.get()),t.get())}setIgnoreExecutionLineEvents(e){this._ignoreExecutionLineEvents=e}updateLastModificationTime(){this._lastModificationTime=window.performance.now()}async _executionLineChanged(e){const t=await e.uiLocation();t&&(window.performance.now()-this._lastModificationTime<lastModificationTimeout||this._sourcesView.showSourceLocation(t.uiSourceCode,t.lineNumber,t.columnNumber,void 0,!0))}_lastModificationTimeoutPassedForTest(){lastModificationTimeout=Number.MIN_VALUE}_updateLastModificationTimeForTest(){lastModificationTimeout=Number.MAX_VALUE}async _callFrameChanged(){const e=self.UI.context.flavor(SDK.DebuggerModel.CallFrame);e&&(this._executionLineLocation&&this._executionLineLocation.dispose(),this._executionLineLocation=await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(e.location(),this._executionLineChanged.bind(this),this._liveLocationPool))}_pauseOnExceptionEnabledChanged(){const e=Common.Settings.Settings.instance().moduleSetting("pauseOnExceptionEnabled").get();this._pauseOnExceptionButton.setToggled(e),this._pauseOnExceptionButton.setTitle(e?ls`Don't pause on exceptions`:ls`Pause on exceptions`),this._debugToolbarDrawer.classList.toggle("expanded",e)}async _updateDebuggerButtonsAndStatus(){const e=self.UI.context.flavor(SDK.SDKModel.Target),t=e?e.model(SDK.DebuggerModel.DebuggerModel):null;t?this._paused?(this._togglePauseAction.setToggled(!0),this._togglePauseAction.setEnabled(!0),this._stepOverAction.setEnabled(!0),this._stepIntoAction.setEnabled(!0),this._stepOutAction.setEnabled(!0),this._stepAction.setEnabled(!0)):(this._togglePauseAction.setToggled(!1),this._togglePauseAction.setEnabled(!t.isPausing()),this._stepOverAction.setEnabled(!1),this._stepIntoAction.setEnabled(!1),this._stepOutAction.setEnabled(!1),this._stepAction.setEnabled(!1)):(this._togglePauseAction.setEnabled(!1),this._stepOverAction.setEnabled(!1),this._stepIntoAction.setEnabled(!1),this._stepOutAction.setEnabled(!1),this._stepAction.setEnabled(!1));const i=t?t.debuggerPausedDetails():null;await this._debuggerPausedMessage.render(i,Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance(),Bindings.BreakpointManager.BreakpointManager.instance()),i&&this._updateDebuggerButtonsAndStatusForTest()}_updateDebuggerButtonsAndStatusForTest(){}_clearInterface(){this._updateDebuggerButtonsAndStatus(),self.UI.context.setFlavor(SDK.DebuggerModel.DebuggerPausedDetails,null),this._switchToPausedTargetTimeout&&clearTimeout(this._switchToPausedTargetTimeout),this._liveLocationPool.disposeAll()}_switchToPausedTarget(e){if(delete this._switchToPausedTargetTimeout,!this._paused&&!e.isPaused())for(const e of SDK.SDKModel.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel))if(e.isPaused()){self.UI.context.setFlavor(SDK.SDKModel.Target,e.target());break}}_togglePauseOnExceptions(){Common.Settings.Settings.instance().moduleSetting("pauseOnExceptionEnabled").set(!this._pauseOnExceptionButton.toggled())}_runSnippet(){const e=this._sourcesView.currentUISourceCode();e&&Snippets.ScriptSnippetFileSystem.evaluateScriptSnippet(e)}_editorSelected(e){const t=e.data;this.editorView.mainWidget()&&Common.Settings.Settings.instance().moduleSetting("autoRevealInNavigator").get()&&this._revealInNavigator(t,!0)}_togglePause(){const e=self.UI.context.flavor(SDK.SDKModel.Target);if(!e)return!0;const t=e.model(SDK.DebuggerModel.DebuggerModel);return!t||(this._paused?(this._paused=!1,t.resume()):t.pause(),this._clearInterface(),!0)}_prepareToResume(){if(!this._paused)return null;this._paused=!1,this._clearInterface();const e=self.UI.context.flavor(SDK.SDKModel.Target);return e?e.model(SDK.DebuggerModel.DebuggerModel):null}_longResume(e){const t=this._prepareToResume();t&&(t.skipAllPausesUntilReloadOrTimeout(500),t.resume())}_terminateExecution(e){const t=this._prepareToResume();t&&(t.runtimeModel().terminateExecution(),t.resume())}_stepOver(){const e=this._prepareToResume();return e&&e.stepOver(),!0}_stepInto(){const e=this._prepareToResume();return e&&e.stepInto(),!0}_stepIntoAsync(){const e=this._prepareToResume();return e&&e.scheduleStepIntoAsync(),!0}_stepOut(){const e=this._prepareToResume();return e&&e.stepOut(),!0}async _continueToLocation(e){const t=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(!t)return;const i=(await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(e.uiSourceCode,e.lineNumber,0)).find(e=>e.debuggerModel===t.debuggerModel);i&&this._prepareToResume()&&i.continueToLocation()}_toggleBreakpointsActive(){Common.Settings.Settings.instance().moduleSetting("breakpointsActive").set(!Common.Settings.Settings.instance().moduleSetting("breakpointsActive").get())}_breakpointsActiveStateChanged(){const e=Common.Settings.Settings.instance().moduleSetting("breakpointsActive").get();this._toggleBreakpointsActiveAction.setToggled(!e),this._sourcesView.toggleBreakpointsActiveState(e)}_createDebugToolbar(){const e=new UI.Toolbar.Toolbar("scripts-debug-toolbar"),t=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Resume with all pauses blocked for 500 ms"),"largeicon-play");t.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._longResume,this);const i=new UI.Toolbar.ToolbarButton(ls`Terminate current JavaScript call`,"largeicon-terminate-execution");return i.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._terminateExecution,this),e.appendToolbarItem(UI.Toolbar.Toolbar.createLongPressActionButton(this._togglePauseAction,[i,t],[])),e.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOverAction)),e.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepIntoAction)),e.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOutAction)),e.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepAction)),e.appendSeparator(),e.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleBreakpointsActiveAction)),this._pauseOnExceptionButton=new UI.Toolbar.ToolbarToggle("","largeicon-pause-on-exceptions"),this._pauseOnExceptionButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._togglePauseOnExceptions,this),e.appendToolbarItem(this._pauseOnExceptionButton),e}_createDebugToolbarDrawer(){const e=createElementWithClass("div","scripts-debug-toolbar-drawer"),t=Common.UIString.UIString("Pause on caught exceptions"),i=Common.Settings.Settings.instance().moduleSetting("pauseOnCaughtException");return e.appendChild(UI.SettingsUI.createSettingCheckbox(t,i,!0)),e}appendApplicableItems(e,t,i){this._appendUISourceCodeItems(e,t,i),this._appendUISourceCodeFrameItems(e,t,i),this.appendUILocationItems(t,i),this._appendRemoteObjectItems(t,i),this._appendNetworkRequestItems(t,i)}_appendUISourceCodeItems(e,t,i){if(!(i instanceof Workspace.UISourceCode.UISourceCode))return;const s=i;s.project().isServiceProject()||e.target.isSelfOrDescendant(this._navigatorTabbedLocation.widget().element)||t.revealSection().appendItem(Common.UIString.UIString("Reveal in sidebar"),this._handleContextMenuReveal.bind(this,s))}_appendUISourceCodeFrameItems(e,t,i){i instanceof UISourceCodeFrame&&(i.uiSourceCode().contentType().isFromSourceMap()||i.textEditor.selection().isEmpty()||t.debugSection().appendAction("debugger.evaluate-selection"))}appendUILocationItems(e,t){if(!(t instanceof Workspace.UISourceCode.UILocation))return;const i=t,s=i.uiSourceCode;if(s.contentType().hasScripts()){const t=self.UI.context.flavor(SDK.SDKModel.Target),n=t?t.model(SDK.DebuggerModel.DebuggerModel):null;n&&n.isPaused()&&e.debugSection().appendItem(Common.UIString.UIString("Continue to here"),this._continueToLocation.bind(this,i)),this._callstackPane.appendBlackboxURLContextMenuItems(e,s)}}_handleContextMenuReveal(e){this.editorView.showBoth(),this._revealInNavigator(e)}_appendRemoteObjectItems(e,t){if(!(t instanceof SDK.RemoteObject.RemoteObject))return;const i=t,s=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);e.debugSection().appendItem(ls`Store as global variable`,()=>SDK.ConsoleModel.ConsoleModel.instance().saveToTempVariable(s,i)),window.ChiiMain||"function"===i.type&&e.debugSection().appendItem(ls`Show function definition`,this._showFunctionDefinition.bind(this,i))}_appendNetworkRequestItems(e,t){if(!(t instanceof SDK.NetworkRequest.NetworkRequest))return;const i=t,s=this._workspace.uiSourceCodeForURL(i.url());if(!s)return;const n=Common.UIString.UIString("Open in Sources panel");e.revealSection().appendItem(n,this.showUILocation.bind(this,s.uiLocation(0,0)))}_showFunctionDefinition(e){e.debuggerModel().functionDetailsPromise(e).then(this._didGetFunctionDetails.bind(this))}async _didGetFunctionDetails(e){if(!e||!e.location)return;const t=await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(e.location);t&&this.showUILocation(t)}_revealNavigatorSidebar(){this._setAsCurrentPanel(),this.editorView.showBoth(!0)}_revealDebuggerSidebar(){this._setAsCurrentPanel(),this._splitWidget.showBoth(!0)}_updateSidebarPosition(){let e;const t=Common.Settings.Settings.instance().moduleSetting("sidebarPosition").get();if(e="right"!==t&&("bottom"===t||self.UI.inspectorView.element.offsetWidth<680),this.sidebarPaneView&&e===!this._splitWidget.isVertical())return;if(this.sidebarPaneView&&this.sidebarPaneView.shouldHideOnDetach())return;this.sidebarPaneView&&this.sidebarPaneView.detach(),this._splitWidget.setVertical(!e),this._splitWidget.element.classList.toggle("sources-split-view-vertical",e),SourcesPanel.updateResizerAndSidebarButtons(this);const i=new UI.Widget.VBox;i.element.appendChild(this._debugToolbar.element),i.element.appendChild(this._debugToolbarDrawer),i.setMinimumAndPreferredSizes(minToolbarWidth,25,minToolbarWidth,100),this._sidebarPaneStack=UI.ViewManager.ViewManager.instance().createStackLocation(this._revealDebuggerSidebar.bind(this)),this._sidebarPaneStack.widget().element.classList.add("overflow-auto"),this._sidebarPaneStack.widget().show(i.element),this._sidebarPaneStack.widget().element.appendChild(this._debuggerPausedMessage.element()),this._sidebarPaneStack.appendApplicableItems("sources.sidebar-top"),this._threadsSidebarPane&&this._sidebarPaneStack.showView(this._threadsSidebarPane),e||this._sidebarPaneStack.appendView(this._watchSidebarPane),this._sidebarPaneStack.showView(this._callstackPane);const s=UI.ViewManager.ViewManager.instance().view("sources.jsBreakpoints"),n=Root.Runtime.experiments.isEnabled("wasmDWARFDebugging")?UI.ViewManager.ViewManager.instance().view("sources.sourceScopeChain"):null,o=UI.ViewManager.ViewManager.instance().view("sources.scopeChain");if(this._tabbedLocationHeader&&(this._splitWidget.uninstallResizer(this._tabbedLocationHeader),this._tabbedLocationHeader=null),e){const e=new UI.SplitWidget.SplitWidget(!0,!0,"sourcesPanelDebuggerSidebarSplitViewState",.5);e.setMainWidget(i),this._sidebarPaneStack.showView(s);const t=UI.ViewManager.ViewManager.instance().createTabbedLocation(this._revealDebuggerSidebar.bind(this));e.setSidebarWidget(t.tabbedPane()),this._tabbedLocationHeader=t.tabbedPane().headerElement(),this._splitWidget.installResizer(this._tabbedLocationHeader),this._splitWidget.installResizer(this._debugToolbar.gripElementForResize()),Root.Runtime.experiments.isEnabled("wasmDWARFDebugging")&&t.appendView(n),t.appendView(o),t.appendView(this._watchSidebarPane),t.appendApplicableItems("sources.sidebar-tabs"),this._extensionSidebarPanesContainer=t,this.sidebarPaneView=e}else Root.Runtime.experiments.isEnabled("wasmDWARFDebugging")&&this._sidebarPaneStack.showView(n),this._sidebarPaneStack.showView(o),this._sidebarPaneStack.showView(s),this._extensionSidebarPanesContainer=this._sidebarPaneStack,this.sidebarPaneView=i,this._splitWidget.uninstallResizer(this._debugToolbar.gripElementForResize());this._sidebarPaneStack.appendApplicableItems("sources.sidebar-bottom");const a=self.Extensions.extensionServer.sidebarPanes();for(let e=0;e<a.length;++e)this._addExtensionSidebarPane(a[e]);this._splitWidget.setSidebarWidget(this.sidebarPaneView)}_setAsCurrentPanel(){return UI.ViewManager.ViewManager.instance().showView("sources")}_extensionSidebarPaneAdded(e){const t=e.data;this._addExtensionSidebarPane(t)}_addExtensionSidebarPane(e){e.panelName()===this.name&&this._extensionSidebarPanesContainer.appendView(e)}sourcesView(){return this._sourcesView}_handleDrop(e){const t=e.items;if(!t.length)return;const i=t[0].webkitGetAsEntry();i.isDirectory&&Host.InspectorFrontendHost.InspectorFrontendHostInstance.upgradeDraggedFileSystemPermissions(i.filesystem)}}export let lastModificationTimeout=200;export const minToolbarWidth=215;export class UILocationRevealer{reveal(e,t){return e instanceof Workspace.UISourceCode.UILocation?(SourcesPanel.instance().showUILocation(e,t),Promise.resolve()):Promise.reject(new Error("Internal error: not a ui location"))}}export class DebuggerLocationRevealer{async reveal(e,t){if(!(e instanceof SDK.DebuggerModel.Location))throw new Error("Internal error: not a debugger location");const i=await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(e);i&&SourcesPanel.instance().showUILocation(i,t)}}export class UISourceCodeRevealer{reveal(e,t){return e instanceof Workspace.UISourceCode.UISourceCode?(SourcesPanel.instance().showUISourceCode(e,void 0,void 0,t),Promise.resolve()):Promise.reject(new Error("Internal error: not a ui source code"))}}export class DebuggerPausedDetailsRevealer{reveal(e){return SourcesPanel.instance()._setAsCurrentPanel()}}export class RevealingActionDelegate{handleAction(e,t){const i=SourcesPanel.instance();if(!i._ensureSourcesViewVisible())return!1;switch(t){case"debugger.toggle-pause":return i._togglePause(),!0}return!1}}export class DebuggingActionDelegate{handleAction(e,t){const i=SourcesPanel.instance();switch(t){case"debugger.step-over":return i._stepOver(),!0;case"debugger.step-into":return i._stepIntoAsync(),!0;case"debugger.step":return i._stepInto(),!0;case"debugger.step-out":return i._stepOut(),!0;case"debugger.run-snippet":return i._runSnippet(),!0;case"debugger.toggle-breakpoints-active":return i._toggleBreakpointsActive(),!0;case"debugger.evaluate-selection":{const e=self.UI.context.flavor(UISourceCodeFrame);if(e){let t=e.textEditor.text(e.textEditor.selection());const i=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(i){const e=SDK.ConsoleModel.ConsoleModel.instance().addCommandMessage(i,t);t=ObjectUI.JavaScriptREPL.JavaScriptREPL.wrapObjectLiteral(t),SDK.ConsoleModel.ConsoleModel.instance().evaluateCommandInConsole(i,e,t,!0)}}return!0}}return!1}}export class WrapperView extends UI.Widget.VBox{constructor(){super(),this.element.classList.add("sources-view-wrapper"),WrapperView._instance=this,this._view=SourcesPanel.instance()._sourcesView}static isShowing(){return!!WrapperView._instance&&WrapperView._instance.isShowing()}wasShown(){SourcesPanel.instance().isShowing()?self.UI.inspectorView.setDrawerMinimized(!0):this._showViewInWrapper(),SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance())}willHide(){self.UI.inspectorView.setDrawerMinimized(!1),setImmediate(()=>SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance()))}_showViewInWrapper(){this._view.show(this.element)}}