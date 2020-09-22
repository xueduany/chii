import*as Common from"../common/common.js";import{DebuggerModel,Events as DebuggerModelEvents}from"./DebuggerModel.js";import{DeferredDOMNode,DOMModel,DOMNode}from"./DOMModel.js";import{RemoteObject}from"./RemoteObject.js";import{Capability,SDKModel,Target,TargetManager}from"./SDKModel.js";export let HighlightColor;export let HighlightRect;export class OverlayModel extends SDKModel{constructor(e){super(e),this._domModel=e.model(DOMModel),e.registerOverlayDispatcher(this),this._overlayAgent=e.overlayAgent(),this._debuggerModel=e.model(DebuggerModel),this._debuggerModel&&(Common.Settings.Settings.instance().moduleSetting("disablePausedStateOverlay").addChangeListener(this._updatePausedInDebuggerMessage,this),this._debuggerModel.addEventListener(DebuggerModelEvents.DebuggerPaused,e=>{this._updatePausedInDebuggerMessage()},this),this._debuggerModel.addEventListener(DebuggerModelEvents.DebuggerResumed,e=>{this._updatePausedInDebuggerMessage()},this),this._debuggerModel.addEventListener(DebuggerModelEvents.GlobalObjectCleared,e=>{this._updatePausedInDebuggerMessage()},this)),this._inspectModeEnabled=!1,this._hideHighlightTimeout=null,this._defaultHighlighter=new DefaultHighlighter(this),this._highlighter=this._defaultHighlighter,this._showPaintRectsSetting=Common.Settings.Settings.instance().moduleSetting("showPaintRects"),this._showLayoutShiftRegionsSetting=Common.Settings.Settings.instance().moduleSetting("showLayoutShiftRegions"),this._showAdHighlightsSetting=Common.Settings.Settings.instance().moduleSetting("showAdHighlights"),this._showDebugBordersSetting=Common.Settings.Settings.instance().moduleSetting("showDebugBorders"),this._showFPSCounterSetting=Common.Settings.Settings.instance().moduleSetting("showFPSCounter"),this._showScrollBottleneckRectsSetting=Common.Settings.Settings.instance().moduleSetting("showScrollBottleneckRects"),this._showHitTestBordersSetting=Common.Settings.Settings.instance().moduleSetting("showHitTestBorders"),this._registeredListeners=[],this._showViewportSizeOnResize=!0,e.suspended()||(this._overlayAgent.enable(),this._wireAgentToSettings())}static highlightObjectAsDOMNode(e){const t=e.runtimeModel().target().model(DOMModel);t&&t.overlayModel().highlightInOverlay({object:e})}static hideDOMNodeHighlight(){for(const e of TargetManager.instance().models(OverlayModel))e._delayedHideHighlight(0)}static async muteHighlight(){return Promise.all(TargetManager.instance().models(OverlayModel).map(e=>e.suspendModel()))}static async unmuteHighlight(){return Promise.all(TargetManager.instance().models(OverlayModel).map(e=>e.resumeModel()))}static highlightRect(e){for(const t of TargetManager.instance().models(OverlayModel))t.highlightRect(e)}static clearHighlight(){for(const e of TargetManager.instance().models(OverlayModel))e.clearHighlight()}highlightRect({x:e,y:t,width:i,height:o,color:s,outlineColor:h}){const g=s||{r:255,g:0,b:255,a:.3},n=h||{r:255,g:0,b:255,a:.5};return this._overlayAgent.invoke_highlightRect({x:e,y:t,width:i,height:o,color:g,outlineColor:n})}clearHighlight(){return this._overlayAgent.invoke_hideHighlight({})}_wireAgentToSettings(){return this._registeredListeners=[this._showPaintRectsSetting.addChangeListener(()=>this._overlayAgent.setShowPaintRects(this._showPaintRectsSetting.get())),this._showLayoutShiftRegionsSetting.addChangeListener(()=>this._overlayAgent.setShowLayoutShiftRegions(this._showLayoutShiftRegionsSetting.get())),this._showAdHighlightsSetting.addChangeListener(()=>this._overlayAgent.setShowAdHighlights(this._showAdHighlightsSetting.get())),this._showDebugBordersSetting.addChangeListener(()=>this._overlayAgent.setShowDebugBorders(this._showDebugBordersSetting.get())),this._showFPSCounterSetting.addChangeListener(()=>this._overlayAgent.setShowFPSCounter(this._showFPSCounterSetting.get())),this._showScrollBottleneckRectsSetting.addChangeListener(()=>this._overlayAgent.setShowScrollBottleneckRects(this._showScrollBottleneckRectsSetting.get())),this._showHitTestBordersSetting.addChangeListener(()=>this._overlayAgent.setShowHitTestBorders(this._showHitTestBordersSetting.get()))],this._showPaintRectsSetting.get()&&this._overlayAgent.setShowPaintRects(!0),this._showLayoutShiftRegionsSetting.get()&&this._overlayAgent.setShowLayoutShiftRegions(!0),this._showAdHighlightsSetting.get()&&this._overlayAgent.setShowAdHighlights(!0),this._showDebugBordersSetting.get()&&this._overlayAgent.setShowDebugBorders(!0),this._showFPSCounterSetting.get()&&this._overlayAgent.setShowFPSCounter(!0),this._showScrollBottleneckRectsSetting.get()&&this._overlayAgent.setShowScrollBottleneckRects(!0),this._showHitTestBordersSetting.get()&&this._overlayAgent.setShowHitTestBorders(!0),this._debuggerModel.isPaused()&&this._updatePausedInDebuggerMessage(),this._overlayAgent.setShowViewportSizeOnResize(this._showViewportSizeOnResize)}suspendModel(){return Common.EventTarget.EventTarget.removeEventListeners(this._registeredListeners),this._overlayAgent.disable()}resumeModel(){return this._overlayAgent.enable(),this._wireAgentToSettings()}setShowViewportSizeOnResize(e){this._showViewportSizeOnResize=e,this.target().suspended()||this._overlayAgent.setShowViewportSizeOnResize(e)}_updatePausedInDebuggerMessage(){if(this.target().suspended())return;const e=this._debuggerModel.isPaused()&&!Common.Settings.Settings.instance().moduleSetting("disablePausedStateOverlay").get()?Common.UIString.UIString("Paused in debugger"):void 0;this._overlayAgent.setPausedInDebuggerMessage(e)}setHighlighter(e){this._highlighter=e||this._defaultHighlighter}async setInspectMode(e,t=!0){await this._domModel.requestDocument(),this._inspectModeEnabled=e!==Protocol.Overlay.InspectMode.None,this.dispatchEventToListeners(Events.InspectModeWillBeToggled,this),this._highlighter.setInspectMode(e,this._buildHighlightConfig("all",t))}inspectModeEnabled(){return this._inspectModeEnabled}highlightInOverlay(e,t,i){this._hideHighlightTimeout&&(clearTimeout(this._hideHighlightTimeout),this._hideHighlightTimeout=null);const o=this._buildHighlightConfig(t);void 0!==i&&(o.showInfo=i),this._highlighter.highlightInOverlay(e,o)}highlightInOverlayForTwoSeconds(e){this.highlightInOverlay(e),this._delayedHideHighlight(2e3)}_delayedHideHighlight(e){null===this._hideHighlightTimeout&&(this._hideHighlightTimeout=setTimeout(()=>this.highlightInOverlay({}),e))}highlightFrame(e){this._hideHighlightTimeout&&(clearTimeout(this._hideHighlightTimeout),this._hideHighlightTimeout=null),this._highlighter.highlightFrame(e)}_buildHighlightConfig(e="all",t=!1){const i=Common.Settings.Settings.instance().moduleSetting("showMetricsRulers").get(),o={showInfo:"all"===e,showRulers:i,showStyles:t,showExtensionLines:i};return"all"!==e&&"content"!==e||(o.contentColor=Common.Color.PageHighlight.Content.toProtocolRGBA()),"all"!==e&&"padding"!==e||(o.paddingColor=Common.Color.PageHighlight.Padding.toProtocolRGBA()),"all"!==e&&"border"!==e||(o.borderColor=Common.Color.PageHighlight.Border.toProtocolRGBA()),"all"!==e&&"margin"!==e||(o.marginColor=Common.Color.PageHighlight.Margin.toProtocolRGBA()),"all"===e&&(o.eventTargetColor=Common.Color.PageHighlight.EventTarget.toProtocolRGBA(),o.shapeColor=Common.Color.PageHighlight.Shape.toProtocolRGBA(),o.shapeMarginColor=Common.Color.PageHighlight.ShapeMargin.toProtocolRGBA()),"all"===e&&(o.cssGridColor=Common.Color.PageHighlight.CssGrid.toProtocolRGBA()),o}nodeHighlightRequested(e){const t=this._domModel.nodeForId(e);t&&this.dispatchEventToListeners(Events.HighlightNodeRequested,t)}static setInspectNodeHandler(e){OverlayModel._inspectNodeHandler=e}inspectNodeRequested(e){const t=new DeferredDOMNode(this.target(),e);OverlayModel._inspectNodeHandler?t.resolvePromise().then(e=>{e&&OverlayModel._inspectNodeHandler(e)}):Common.Revealer.reveal(t),this.dispatchEventToListeners(Events.ExitedInspectMode)}screenshotRequested(e){this.dispatchEventToListeners(Events.ScreenshotRequested,e),this.dispatchEventToListeners(Events.ExitedInspectMode)}inspectModeCanceled(){this.dispatchEventToListeners(Events.ExitedInspectMode)}}export const Events={InspectModeWillBeToggled:Symbol("InspectModeWillBeToggled"),ExitedInspectMode:Symbol("InspectModeExited"),HighlightNodeRequested:Symbol("HighlightNodeRequested"),ScreenshotRequested:Symbol("ScreenshotRequested")};export class Highlighter{highlightInOverlay(e,t){}setInspectMode(e,t){}highlightFrame(e){}}class DefaultHighlighter{constructor(e){this._model=e}highlightInOverlay(e,t){const{node:i,deferredNode:o,object:s,selectorList:h}=e,g=i?i.id:void 0,n=o?o.backendNodeId():void 0,l=s?s.objectId:void 0;g||n||l?this._model._overlayAgent.highlightNode(t,g,n,l,h):this._model._overlayAgent.hideHighlight()}setInspectMode(e,t){return this._model._overlayAgent.setInspectMode(e,t)}highlightFrame(e){this._model._overlayAgent.highlightFrame(e,Common.Color.PageHighlight.Content.toProtocolRGBA(),Common.Color.PageHighlight.ContentOutline.toProtocolRGBA())}}SDKModel.register(OverlayModel,Capability.DOM,!0);export let HighlightData;