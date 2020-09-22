import*as Common from"../common/common.js";import*as Platform from"../platform/platform.js";import*as Root from"../root/root.js";import{ContextMenuDescriptor,EventDescriptors,Events,InspectorFrontendHostAPI,LoadNetworkResourceResult}from"./InspectorFrontendHostAPI.js";import{streamWrite as resourceLoaderStreamWrite}from"./ResourceLoader.js";export class InspectorFrontendHostStub{constructor(){function e(e){!("mac"===this.platform()?e.metaKey:e.ctrlKey)||187!==e.keyCode&&189!==e.keyCode||e.stopPropagation()}document.addEventListener("keydown",t=>{e.call(this,t)},!0),this._urlsBeingSaved=new Map,this.events}platform(){let e=navigator.userAgent.match(/Windows NT/);return e?"windows":(e=navigator.userAgent.match(/Mac OS X/),e?"mac":"linux")}loadCompleted(){}bringToFront(){this._windowVisible=!0}closeWindow(){this._windowVisible=!1}setIsDocked(e,t){setTimeout(t,0)}setInspectedPageBounds(e){}inspectElementCompleted(){}setInjectedScriptForOrigin(e,t){}inspectedURLChanged(e){document.title=Common.UIString.UIString("DevTools - %s",e.replace(/^https?:\/\//,""))}copyText(e){if(null!=e)if(navigator.clipboard)navigator.clipboard.writeText(e);else if(document.queryCommandSupported("copy")){const t=document.createElement("input");t.value=e,document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}else Common.Console.Console.instance().error("Clipboard is not enabled in hosted mode. Please inspect using chrome://inspect")}openInNewTab(e){window.open(e,"_blank")}showItemInFolder(e){Common.Console.Console.instance().error("Show item in folder is not enabled in hosted mode. Please inspect using chrome://inspect")}save(e,t,o){let n=this._urlsBeingSaved.get(e);n||(n=[],this._urlsBeingSaved.set(e,n)),n.push(t),this.events.dispatchEventToListeners(Events.SavedURL,{url:e,fileSystemPath:e})}append(e,t){const o=this._urlsBeingSaved.get(e);o&&(o.push(t),this.events.dispatchEventToListeners(Events.AppendedToURL,e))}close(e){const t=this._urlsBeingSaved.get(e)||[];this._urlsBeingSaved.delete(e);const o=e?Platform.StringUtilities.trimURL(e).removeURLFragment():"",n=document.createElement("a");n.download=o;const s=new Blob([t.join("")],{type:"text/plain"});n.href=URL.createObjectURL(s),n.click()}sendMessageToBackend(e){}recordEnumeratedHistogram(e,t,o){}recordPerformanceHistogram(e,t){}recordUserMetricsAction(e){}requestFileSystems(){this.events.dispatchEventToListeners(Events.FileSystemsLoaded,[])}addFileSystem(e){}removeFileSystem(e){}isolatedFileSystem(e,t){return null}loadNetworkResource(e,t,o,n){Root.Runtime.loadResourcePromise(e).then((function(e){resourceLoaderStreamWrite(o,e),n({statusCode:200,headers:void 0,messageOverride:void 0,netError:void 0,netErrorName:void 0,urlValid:void 0})})).catch((function(){n({statusCode:404,headers:void 0,messageOverride:void 0,netError:void 0,netErrorName:void 0,urlValid:void 0})}))}getPreferences(e){const t={};for(const e in window.localStorage)t[e]=window.localStorage[e];e(t)}setPreference(e,t){window.localStorage[e]=t}removePreference(e){delete window.localStorage[e]}clearPreferences(){window.localStorage.clear()}upgradeDraggedFileSystemPermissions(e){}indexPath(e,t,o){}stopIndexing(e){}searchInPath(e,t,o){}zoomFactor(){return 1}zoomIn(){}zoomOut(){}resetZoom(){}setWhitelistedShortcuts(e){}setEyeDropperActive(e){}showCertificateViewer(e){}reattach(e){}readyForTest(){}connectionReady(){}setOpenNewWindowForPopups(e){}setDevicesDiscoveryConfig(e){}setDevicesUpdatesEnabled(e){}performActionOnRemotePage(e,t){}openRemotePage(e,t){}openNodeFrontend(){}showContextMenuAtPoint(e,t,o,n){throw"Soft context menu should be used"}isHostedMode(){return!0}setAddExtensionCallback(e){}}export let InspectorFrontendHostInstance=window.InspectorFrontendHost;class InspectorFrontendAPIImpl{constructor(){this._debugFrontend=!!Root.Runtime.Runtime.queryParam("debugFrontend")||window.InspectorTest&&window.InspectorTest.debugTest;const e=EventDescriptors;for(let t=0;t<e.length;++t)this[e[t][1]]=this._dispatch.bind(this,e[t][0],e[t][2],e[t][3])}_dispatch(e,t,o){const n=Array.prototype.slice.call(arguments,3);function s(){if(t.length<2){try{InspectorFrontendHostInstance.events.dispatchEventToListeners(e,n[0])}catch(e){console.error(e+" "+e.stack)}return}const o={};for(let e=0;e<t.length;++e)o[t[e]]=n[e];try{InspectorFrontendHostInstance.events.dispatchEventToListeners(e,o)}catch(e){console.error(e+" "+e.stack)}}this._debugFrontend?setTimeout(()=>s(),0):s()}streamWrite(e,t){resourceLoaderStreamWrite(e,t)}}!function(){let e;if(InspectorFrontendHostInstance){e=InspectorFrontendHostStub.prototype;for(const t of Object.getOwnPropertyNames(e)){const o=e[t];"function"!=typeof o||InspectorFrontendHostInstance[t]||(console.error("Incompatible embedder: method Host.InspectorFrontendHost."+t+" is missing. Using stub instead."),InspectorFrontendHostInstance[t]=o)}}else window.InspectorFrontendHost=InspectorFrontendHostInstance=new InspectorFrontendHostStub;InspectorFrontendHostInstance.events=new Common.ObjectWrapper.ObjectWrapper}(),window.InspectorFrontendAPI=new InspectorFrontendAPIImpl;export function isUnderTest(e){return!!Root.Runtime.Runtime.queryParam("test")||(e?"true"===e.isUnderTest:Common.Settings.Settings.hasInstance()&&Common.Settings.Settings.instance().createSetting("isUnderTest",!1).get())}