import*as Bindings from"../bindings/bindings.js";import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as MobileThrottling from"../mobile_throttling/mobile_throttling.js";import*as PerfUI from"../perf_ui/perf_ui.js";import*as SDK from"../sdk/sdk.js";import*as Search from"../search/search.js";import*as UI from"../ui/ui.js";import*as Workspace from"../workspace/workspace.js";import{BlockedURLsPane}from"./BlockedURLsPane.js";import{Events}from"./NetworkDataGridNode.js";import{NetworkItemView,Tabs as NetworkItemViewTabs}from"./NetworkItemView.js";import{FilterType,NetworkLogView}from"./NetworkLogView.js";import{NetworkOverview}from"./NetworkOverview.js";import{NetworkSearchScope,UIRequestLocation}from"./NetworkSearchScope.js";import{NetworkTimeCalculator,NetworkTransferTimeCalculator}from"./NetworkTimeCalculator.js";export class NetworkPanel extends UI.Panel.Panel{constructor(){super("network"),this.registerRequiredCSS("network/networkPanel.css"),this._networkLogShowOverviewSetting=Common.Settings.Settings.instance().createSetting("networkLogShowOverview",!0),this._networkLogLargeRowsSetting=Common.Settings.Settings.instance().createSetting("networkLogLargeRows",!1),this._networkRecordFilmStripSetting=Common.Settings.Settings.instance().createSetting("networkRecordFilmStripSetting",!1),this._toggleRecordAction=self.UI.actionRegistry.action("network.toggle-recording"),this._pendingStopTimer,this._networkItemView=null,this._filmStripView=null,this._filmStripRecorder=null,this._currentRequest=null;const e=new UI.Widget.VBox,t=e.contentElement.createChild("div","network-toolbar-container");this._panelToolbar=new UI.Toolbar.Toolbar("",t),this._rightToolbar=new UI.Toolbar.Toolbar("",t),this._filterBar=new UI.FilterBar.FilterBar("networkPanel",!0),this._filterBar.show(e.contentElement),this._filterBar.addEventListener(UI.FilterBar.FilterBar.Events.Changed,this._handleFilterChanged.bind(this)),this._settingsPane=new UI.Widget.HBox,this._settingsPane.element.classList.add("network-settings-pane"),this._settingsPane.show(e.contentElement),this._showSettingsPaneSetting=Common.Settings.Settings.instance().createSetting("networkShowSettingsToolbar",!1),this._showSettingsPaneSetting.addChangeListener(this._updateSettingsPaneVisibility.bind(this)),this._updateSettingsPaneVisibility(),this._filmStripPlaceholderElement=e.contentElement.createChild("div","network-film-strip-placeholder"),this._overviewPane=new PerfUI.TimelineOverviewPane.TimelineOverviewPane("network"),this._overviewPane.addEventListener(PerfUI.TimelineOverviewPane.Events.WindowChanged,this._onWindowChanged.bind(this)),this._overviewPane.element.id="network-overview-panel",this._networkOverview=new NetworkOverview,this._overviewPane.setOverviewControls([this._networkOverview]),this._overviewPlaceholderElement=e.contentElement.createChild("div"),this._calculator=new NetworkTransferTimeCalculator,this._splitWidget=new UI.SplitWidget.SplitWidget(!0,!1,"networkPanelSplitViewState"),this._splitWidget.hideMain(),this._splitWidget.show(e.contentElement),e.setDefaultFocusedChild(this._filterBar);const i=new UI.SplitWidget.SplitWidget(!0,!1,"networkPanelSidebarState",225);i.hideSidebar(),i.enableShowModeSaving(),i.show(this.element),this._sidebarLocation=UI.ViewManager.ViewManager.instance().createTabbedLocation(async()=>{UI.ViewManager.ViewManager.instance().showView("network"),i.showBoth()},"network-sidebar",!0);const o=this._sidebarLocation.tabbedPane();o.setMinimumSize(100,25),o.element.classList.add("network-tabbed-pane"),o.element.addEventListener("keydown",e=>{"Escape"===e.key&&(i.hideSidebar(),e.consume())});const r=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Close"),"largeicon-delete");r.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,()=>i.hideSidebar()),o.rightToolbar().appendToolbarItem(r),i.setSidebarWidget(o),i.setMainWidget(e),i.setDefaultFocusedChild(e),this.setDefaultFocusedChild(i),this._progressBarContainer=createElement("div"),this._networkLogView=new NetworkLogView(this._filterBar,this._progressBarContainer,this._networkLogLargeRowsSetting),this._splitWidget.setSidebarWidget(this._networkLogView),this._fileSelectorElement=UI.UIUtils.createFileSelectorElement(this._networkLogView.onLoadFromFile.bind(this._networkLogView)),e.element.appendChild(this._fileSelectorElement),this._detailsWidget=new UI.Widget.VBox,this._detailsWidget.element.classList.add("network-details-view"),this._splitWidget.setMainWidget(this._detailsWidget),this._closeButtonElement=createElement("div","dt-close-button"),this._closeButtonElement.addEventListener("click",async()=>await self.UI.actionRegistry.action("network.hide-request-details").execute(),!1),this._closeButtonElement.style.margin="0 5px",this._networkLogShowOverviewSetting.addChangeListener(this._toggleShowOverview,this),this._networkLogLargeRowsSetting.addChangeListener(this._toggleLargerRequests,this),this._networkRecordFilmStripSetting.addChangeListener(this._toggleRecordFilmStrip,this),this._preserveLogSetting=Common.Settings.Settings.instance().moduleSetting("network_log.preserve-log"),this._throttlingSelect=this._createThrottlingConditionsSelect(),this._setupToolbarButtons(i),this._toggleRecord(!0),this._toggleShowOverview(),this._toggleLargerRequests(),this._toggleRecordFilmStrip(),this._updateUI(),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel,SDK.ResourceTreeModel.Events.WillReloadPage,this._willReloadPage,this),SDK.SDKModel.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel,SDK.ResourceTreeModel.Events.Load,this._load,this),this._networkLogView.addEventListener(Events.RequestSelected,this._onRequestSelected,this),this._networkLogView.addEventListener(Events.RequestActivated,this._onRequestActivated,this),self.SDK.networkLog.addEventListener(SDK.NetworkLog.Events.RequestAdded,this._onUpdateRequest,this),self.SDK.networkLog.addEventListener(SDK.NetworkLog.Events.RequestUpdated,this._onUpdateRequest,this),self.SDK.networkLog.addEventListener(SDK.NetworkLog.Events.Reset,this._onNetworkLogReset,this)}static revealAndFilter(e){const t=NetworkPanel._instance();let i="";for(const t of e)i+=`${t.filterType}:${t.filterValue} `;t._networkLogView.setTextFilterValue(i),UI.ViewManager.ViewManager.instance().showView("network")}static async selectAndShowRequest(e,t){const i=NetworkPanel._instance();await i.selectAndActivateRequest(e,t)}static _instance(){return self.runtime.sharedInstance(NetworkPanel)}throttlingSelectForTest(){return this._throttlingSelect}_onWindowChanged(e){const t=Math.max(this._calculator.minimumBoundary(),e.data.startTime/1e3),i=Math.min(this._calculator.maximumBoundary(),e.data.endTime/1e3);this._networkLogView.setWindow(t,i)}async _searchToggleClick(e){await self.UI.actionRegistry.action("network.search").execute()}_setupToolbarButtons(e){const t=new UI.Toolbar.ToolbarToggle(ls`Search`,"largeicon-search");function i(){const i=e.showMode()!==UI.SplitWidget.ShowMode.OnlyMain;t.setToggled(i),i||t.element.focus()}this._panelToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleRecordAction));const o=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Clear"),"largeicon-clear");o.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,()=>self.SDK.networkLog.reset(),this),this._panelToolbar.appendToolbarItem(o),this._panelToolbar.appendSeparator(),this._panelToolbar.appendToolbarItem(this._filterBar.filterButton()),i(),e.addEventListener(UI.SplitWidget.Events.ShowModeChanged,i),t.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,e=>{this._searchToggleClick(e)}),this._panelToolbar.appendToolbarItem(t),this._panelToolbar.appendSeparator(),this._panelToolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._preserveLogSetting,Common.UIString.UIString("Do not clear log on page reload / navigation"),Common.UIString.UIString("Preserve log")));const r=new UI.Toolbar.ToolbarSettingCheckbox(Common.Settings.Settings.instance().moduleSetting("cacheDisabled"),Common.UIString.UIString("Disable cache (while DevTools is open)"),Common.UIString.UIString("Disable cache"));this._panelToolbar.appendToolbarItem(r),this._panelToolbar.appendSeparator(),this._panelToolbar.appendToolbarItem(this._throttlingSelect),this._rightToolbar.appendToolbarItem(new UI.Toolbar.ToolbarItem(this._progressBarContainer)),this._rightToolbar.appendSeparator(),this._rightToolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingToggle(this._showSettingsPaneSetting,"largeicon-settings-gear",ls`Network settings`));const n=new UI.Toolbar.Toolbar("",this._settingsPane.element);n.makeVertical(),n.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkLogLargeRowsSetting,ls`Show more information in request rows`,ls`Use large request rows`)),n.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkLogShowOverviewSetting,ls`Show overview of network requests`,ls`Show overview`));const s=new UI.Toolbar.Toolbar("",this._settingsPane.element);s.makeVertical(),s.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(Common.Settings.Settings.instance().moduleSetting("network.group-by-frame"),ls`Group requests by top level request frame`,ls`Group by frame`)),s.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkRecordFilmStripSetting,ls`Capture screenshots when loading a page`,ls`Capture screenshots`)),this._panelToolbar.appendSeparator();const a=new UI.Toolbar.ToolbarButton(ls`Import HAR file...`,"largeicon-load");a.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,()=>this._fileSelectorElement.click(),this),this._panelToolbar.appendToolbarItem(a);const l=new UI.Toolbar.ToolbarButton(ls`Export HAR...`,"largeicon-download");l.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,e=>{this._networkLogView.exportAll()},this),this._panelToolbar.appendToolbarItem(l)}_updateSettingsPaneVisibility(){this._settingsPane.element.classList.toggle("hidden",!this._showSettingsPaneSetting.get())}_createThrottlingConditionsSelect(){const e=new UI.Toolbar.ToolbarComboBox(null,ls`Throttling`);return e.setMaxWidth(160),MobileThrottling.ThrottlingManager.throttlingManager().decorateSelectWithNetworkThrottling(e.selectElement()),e}_toggleRecording(){this._preserveLogSetting.get()||this._toggleRecordAction.toggled()||self.SDK.networkLog.reset(),this._toggleRecord(!this._toggleRecordAction.toggled())}_toggleRecord(e){this._toggleRecordAction.setToggled(e),this._networkLogView.setRecording(e),!e&&this._filmStripRecorder&&this._filmStripRecorder.stopRecording(this._filmStripAvailable.bind(this)),self.SDK.networkLog.setIsRecording(e)}_filmStripAvailable(e){if(!e)return;const t=this._networkLogView.timeCalculator();this._filmStripView.setModel(e,1e3*t.minimumBoundary(),1e3*t.boundarySpan()),this._networkOverview.setFilmStripModel(e);const i=e.frames().map((function(e){return e.timestamp/1e3}));this._networkLogView.addFilmStripFrames(i)}_onNetworkLogReset(){BlockedURLsPane.reset(),this._preserveLogSetting.get()||(this._calculator.reset(),this._overviewPane.reset()),this._filmStripView&&this._resetFilmStripView()}_willReloadPage(e){this._toggleRecord(!0),this._pendingStopTimer&&(clearTimeout(this._pendingStopTimer),delete this._pendingStopTimer),this.isShowing()&&this._filmStripRecorder&&this._filmStripRecorder.startRecording()}_load(e){this._filmStripRecorder&&this._filmStripRecorder.isRecording()&&(this._pendingStopTimer=setTimeout(this._stopFilmStripRecording.bind(this),displayScreenshotDelay))}_stopFilmStripRecording(){this._filmStripRecorder.stopRecording(this._filmStripAvailable.bind(this)),delete this._pendingStopTimer}_toggleLargerRequests(){this._updateUI()}_toggleShowOverview(){this._networkLogShowOverviewSetting.get()?this._overviewPane.show(this._overviewPlaceholderElement):this._overviewPane.detach(),this.doResize()}_toggleRecordFilmStrip(){const e=this._networkRecordFilmStripSetting.get();e&&!this._filmStripRecorder&&(this._filmStripView=new PerfUI.FilmStripView.FilmStripView,this._filmStripView.setMode(PerfUI.FilmStripView.Modes.FrameBased),this._filmStripView.element.classList.add("network-film-strip"),this._filmStripRecorder=new FilmStripRecorder(this._networkLogView.timeCalculator(),this._filmStripView),this._filmStripView.show(this._filmStripPlaceholderElement),this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameSelected,this._onFilmFrameSelected,this),this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameEnter,this._onFilmFrameEnter,this),this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameExit,this._onFilmFrameExit,this),this._resetFilmStripView()),!e&&this._filmStripRecorder&&(this._filmStripView.detach(),this._filmStripView=null,this._filmStripRecorder=null)}_resetFilmStripView(){const e=self.UI.shortcutRegistry.shortcutsForAction("inspector_main.reload")[0];this._filmStripView.reset(),e&&this._filmStripView.setStatusText(Common.UIString.UIString("Hit %s to reload and capture filmstrip.",e.title()))}elementsToRestoreScrollPositionsFor(){return this._networkLogView.elementsToRestoreScrollPositionsFor()}wasShown(){self.UI.context.setFlavor(NetworkPanel,this),Host.userMetrics.panelLoaded("network","DevTools.Launch.Network")}willHide(){self.UI.context.setFlavor(NetworkPanel,null)}revealAndHighlightRequest(e){this._hideRequestPanel(),e&&this._networkLogView.revealAndHighlightRequest(e)}async selectAndActivateRequest(e,t){return await UI.ViewManager.ViewManager.instance().showView("network"),this._networkLogView.selectRequest(e),this._showRequestPanel(t),this._networkItemView}_handleFilterChanged(e){this._hideRequestPanel()}_onRowSizeChanged(e){this._updateUI()}_onRequestSelected(e){const t=e.data;this._currentRequest=t,this._networkOverview.setHighlightedRequest(t),this._updateNetworkItemView()}_onRequestActivated(e){const t=e.data;t.showPanel?this._showRequestPanel(t.tab):this._hideRequestPanel()}_showRequestPanel(e){this._clearNetworkItemView(),this._currentRequest&&this._createNetworkItemView(e),this._updateUI()}_hideRequestPanel(){this._clearNetworkItemView(),this._splitWidget.hideMain(),this._updateUI()}_updateNetworkItemView(){this._splitWidget.showMode()===UI.SplitWidget.ShowMode.Both&&(this._clearNetworkItemView(),this._createNetworkItemView(),this._updateUI())}_clearNetworkItemView(){this._networkItemView&&(this._networkItemView.detach(),this._networkItemView=null)}_createNetworkItemView(e){this._currentRequest&&(this._networkItemView=new NetworkItemView(this._currentRequest,this._networkLogView.timeCalculator(),e),this._networkItemView.leftToolbar().appendToolbarItem(new UI.Toolbar.ToolbarItem(this._closeButtonElement)),this._networkItemView.show(this._detailsWidget.element),this._splitWidget.showBoth())}_updateUI(){this._detailsWidget.element.classList.toggle("network-details-view-tall-header",this._networkLogLargeRowsSetting.get()),this._networkLogView.switchViewMode(!this._splitWidget.isResizable())}appendApplicableItems(e,t,i){function o(e){UI.ViewManager.ViewManager.instance().showView("network").then(this._networkLogView.resetFilter.bind(this._networkLogView)).then(this.revealAndHighlightRequest.bind(this,e))}function r(e){t.revealSection().appendItem(Common.UIString.UIString("Reveal in Network panel"),o.bind(this,e))}if(e.target.isSelfOrDescendant(this.element))return;if(i instanceof SDK.Resource.Resource){const e=i;return void(e.request&&r.call(this,e.request))}if(i instanceof Workspace.UISourceCode.UISourceCode){const e=i,t=Bindings.ResourceUtils.resourceForURL(e.url());return void(t&&t.request&&r.call(this,t.request))}if(!(i instanceof SDK.NetworkRequest.NetworkRequest))return;const n=i;this._networkItemView&&this._networkItemView.isShowing()&&this._networkItemView.request()===n||r.call(this,n)}_onFilmFrameSelected(e){const t=e.data;this._overviewPane.setWindowTimes(0,t)}_onFilmFrameEnter(e){const t=e.data;this._networkOverview.selectFilmStripFrame(t),this._networkLogView.selectFilmStripFrame(t/1e3)}_onFilmFrameExit(e){this._networkOverview.clearFilmStripFrame(),this._networkLogView.clearFilmStripFrame()}_onUpdateRequest(e){const t=e.data;this._calculator.updateBoundaries(t),this._overviewPane.setBounds(1e3*this._calculator.minimumBoundary(),1e3*this._calculator.maximumBoundary()),this._networkOverview.updateRequest(t),this._overviewPane.scheduleUpdate()}resolveLocation(e){return"network-sidebar"===e?this._sidebarLocation:null}}export const displayScreenshotDelay=1e3;export class ContextMenuProvider{appendApplicableItems(e,t,i){NetworkPanel._instance().appendApplicableItems(e,t,i)}}export class RequestRevealer{reveal(e){if(!(e instanceof SDK.NetworkRequest.NetworkRequest))return Promise.reject(new Error("Internal error: not a network request"));const t=NetworkPanel._instance();return UI.ViewManager.ViewManager.instance().showView("network").then(t.revealAndHighlightRequest.bind(t,e))}}export class FilmStripRecorder{constructor(e,t){this._tracingManager=null,this._resourceTreeModel=null,this._timeCalculator=e,this._filmStripView=t,this._tracingModel=null,this._callback=null}traceEventsCollected(e){this._tracingModel&&this._tracingModel.addEvents(e)}tracingComplete(){this._tracingModel&&this._tracingManager&&(this._tracingModel.tracingComplete(),this._tracingManager=null,this._callback(new SDK.FilmStripModel.FilmStripModel(this._tracingModel,1e3*this._timeCalculator.minimumBoundary())),this._callback=null,this._resourceTreeModel&&this._resourceTreeModel.resumeReload(),this._resourceTreeModel=null)}tracingBufferUsage(){}eventsRetrievalProgress(e){}startRecording(){this._filmStripView.reset(),this._filmStripView.setStatusText(Common.UIString.UIString("Recording frames..."));const e=SDK.SDKModel.TargetManager.instance().models(SDK.TracingManager.TracingManager);!this._tracingManager&&e.length&&(this._tracingManager=e[0],this._resourceTreeModel=this._tracingManager.target().model(SDK.ResourceTreeModel.ResourceTreeModel),this._tracingModel&&this._tracingModel.dispose(),this._tracingModel=new SDK.TracingModel.TracingModel(new Bindings.TempFile.TempFileBackingStorage),this._tracingManager.start(this,"-*,disabled-by-default-devtools.screenshot",""),Host.userMetrics.actionTaken(Host.UserMetrics.Action.FilmStripStartedRecording))}isRecording(){return!!this._tracingManager}stopRecording(e){this._tracingManager&&(this._tracingManager.stop(),this._resourceTreeModel&&this._resourceTreeModel.suspendReload(),this._callback=e,this._filmStripView.setStatusText(Common.UIString.UIString("Fetching frames...")))}}export class ActionDelegate{handleAction(e,t){const i=self.UI.context.flavor(NetworkPanel);switch(console.assert(i&&i instanceof NetworkPanel),t){case"network.toggle-recording":return i._toggleRecording(),!0;case"network.hide-request-details":return!!i._networkItemView&&(i._hideRequestPanel(),i._networkLogView.resetFocus(),!0);case"network.search":{const e=self.UI.inspectorView.element.window().getSelection();let t="";return e.rangeCount&&(t=e.toString().replace(/\r?\n.*/,"")),SearchNetworkView.openSearch(t),!0}}return!1}}export class RequestLocationRevealer{async reveal(e){const t=e,i=await NetworkPanel._instance().selectAndActivateRequest(t.request);i&&(t.searchMatch&&await i.revealResponseBody(t.searchMatch.lineNumber),t.requestHeader&&i.revealRequestHeader(t.requestHeader.name),t.responseHeader&&i.revealResponseHeader(t.responseHeader.name))}}export class SearchNetworkView extends Search.SearchView.SearchView{constructor(){super("network")}static async openSearch(e,t){await UI.ViewManager.ViewManager.instance().showView("network.search-network-tab");const i=self.runtime.sharedInstance(SearchNetworkView);return i.toggle(e,!!t),i}createScope(){return new NetworkSearchScope}}