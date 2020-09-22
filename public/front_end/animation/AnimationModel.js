import*as SDK from"../sdk/sdk.js";export class AnimationModel extends SDK.SDKModel.SDKModel{constructor(e){super(e),this._runtimeModel=e.model(SDK.RuntimeModel.RuntimeModel),this._agent=e.animationAgent(),e.registerAnimationDispatcher(new AnimationDispatcher(this)),this._animationsById=new Map,this._animationGroups=new Map,this._pendingAnimations=new Set,this._playbackRate=1;e.model(SDK.ResourceTreeModel.ResourceTreeModel).addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated,this._reset,this);const t=e.model(SDK.ScreenCaptureModel.ScreenCaptureModel);t&&(this._screenshotCapture=new ScreenshotCapture(this,t))}_reset(){this._animationsById.clear(),this._animationGroups.clear(),this._pendingAnimations.clear(),this.dispatchEventToListeners(Events.ModelReset)}animationCreated(e){this._pendingAnimations.add(e)}_animationCanceled(e){this._pendingAnimations.delete(e),this._flushPendingAnimationsIfNeeded()}animationStarted(e){if(!e.source||!e.source.backendNodeId)return;const t=AnimationImpl.parsePayload(this,e);"WebAnimation"===t.type()&&0===t.source().keyframesRule().keyframes().length?this._pendingAnimations.delete(t.id()):(this._animationsById.set(t.id(),t),this._pendingAnimations.add(t.id())),this._flushPendingAnimationsIfNeeded()}_flushPendingAnimationsIfNeeded(){for(const e of this._pendingAnimations)if(!this._animationsById.get(e))return;for(;this._pendingAnimations.size;)this._matchExistingGroups(this._createGroupFromPendingAnimations())}_matchExistingGroups(e){let t=null;for(const i of this._animationGroups.values())if(i._matches(e)){t=i,i._update(e);break}return t||(this._animationGroups.set(e.id(),e),this._screenshotCapture&&this._screenshotCapture.captureScreenshots(e.finiteDuration(),e._screenshots)),this.dispatchEventToListeners(Events.AnimationGroupStarted,t||e),!!t}_createGroupFromPendingAnimations(){console.assert(this._pendingAnimations.size);const e=this._pendingAnimations.values().next().value;this._pendingAnimations.delete(e);const t=this._animationsById.get(e),i=[t],s=t.startTime(),n=new Set;for(const e of this._pendingAnimations){const t=this._animationsById.get(e);t.startTime()===s?i.push(t):n.add(e)}return this._pendingAnimations=n,new AnimationGroup(this,e,i)}setPlaybackRate(e){this._playbackRate=e,this._agent.setPlaybackRate(e)}_releaseAnimations(e){this._agent.releaseAnimations(e)}suspendModel(){return this._reset(),this._agent.disable()}resumeModel(){return this._enabled?this._agent.enable():Promise.resolve()}ensureEnabled(){this._enabled||(this._agent.enable(),this._enabled=!0)}}export const Events={AnimationGroupStarted:Symbol("AnimationGroupStarted"),ModelReset:Symbol("ModelReset")};export class AnimationImpl{constructor(e,t){this._animationModel=e,this._payload=t,this._source=new AnimationEffect(e,this._payload.source)}static parsePayload(e,t){return new AnimationImpl(e,t)}payload(){return this._payload}id(){return this._payload.id}name(){return this._payload.name}paused(){return this._payload.pausedState}playState(){return this._playState||this._payload.playState}setPlayState(e){this._playState=e}playbackRate(){return this._payload.playbackRate}startTime(){return this._payload.startTime}endTime(){return this.source().iterations?this.startTime()+this.source().delay()+this.source().duration()*this.source().iterations()+this.source().endDelay():1/0}_finiteDuration(){const e=Math.min(this.source().iterations(),3);return this.source().delay()+this.source().duration()*e}currentTime(){return this._payload.currentTime}source(){return this._source}type(){return this._payload.type}overlaps(e){if(!this.source().iterations()||!e.source().iterations())return!0;const t=this.startTime()<e.startTime()?this:e,i=t===this?e:this;return t.endTime()>=i.startTime()}setTiming(e,t){this._source.node().then(this._updateNodeStyle.bind(this,e,t)),this._source._duration=e,this._source._delay=t,this._animationModel._agent.setTiming(this.id(),e,t)}_updateNodeStyle(e,t,i){let s;if(this.type()===Type.CSSTransition)s="transition-";else{if(this.type()!==Type.CSSAnimation)return;s="animation-"}const n=i.domModel().cssModel();n.setEffectivePropertyValueForNode(i.id,s+"duration",e+"ms"),n.setEffectivePropertyValueForNode(i.id,s+"delay",t+"ms")}remoteObjectPromise(){return this._animationModel._agent.resolveAnimation(this.id()).then(e=>e&&this._animationModel._runtimeModel.createRemoteObject(e))}_cssId(){return this._payload.cssId||""}}export const Type={CSSTransition:"CSSTransition",CSSAnimation:"CSSAnimation",WebAnimation:"WebAnimation"};export class AnimationEffect{constructor(e,t){this._animationModel=e,this._payload=t,t.keyframesRule&&(this._keyframesRule=new KeyframesRule(t.keyframesRule)),this._delay=this._payload.delay,this._duration=this._payload.duration}delay(){return this._delay}endDelay(){return this._payload.endDelay}iterationStart(){return this._payload.iterationStart}iterations(){return this.delay()||this.endDelay()||this.duration()?this._payload.iterations||1/0:0}duration(){return this._duration}direction(){return this._payload.direction}fill(){return this._payload.fill}node(){return this._deferredNode||(this._deferredNode=new SDK.DOMModel.DeferredDOMNode(this._animationModel.target(),this.backendNodeId())),this._deferredNode.resolvePromise()}deferredNode(){return new SDK.DOMModel.DeferredDOMNode(this._animationModel.target(),this.backendNodeId())}backendNodeId(){return this._payload.backendNodeId}keyframesRule(){return this._keyframesRule}easing(){return this._payload.easing}}export class KeyframesRule{constructor(e){this._payload=e,this._keyframes=this._payload.keyframes.map((function(e){return new KeyframeStyle(e)}))}_setKeyframesPayload(e){this._keyframes=e.map((function(e){return new KeyframeStyle(e)}))}name(){return this._payload.name}keyframes(){return this._keyframes}}export class KeyframeStyle{constructor(e){this._payload=e,this._offset=this._payload.offset}offset(){return this._offset}setOffset(e){this._offset=100*e+"%"}offsetAsNumber(){return parseFloat(this._offset)/100}easing(){return this._payload.easing}}export class AnimationGroup{constructor(e,t,i){this._animationModel=e,this._id=t,this._animations=i,this._paused=!1,this._screenshots=[],this._screenshotImages=[]}id(){return this._id}animations(){return this._animations}release(){this._animationModel._animationGroups.delete(this.id()),this._animationModel._releaseAnimations(this._animationIds())}_animationIds(){return this._animations.map((function(e){return e.id()}))}startTime(){return this._animations[0].startTime()}finiteDuration(){let e=0;for(let t=0;t<this._animations.length;++t)e=Math.max(e,this._animations[t]._finiteDuration());return e}seekTo(e){this._animationModel._agent.seekAnimations(this._animationIds(),e)}paused(){return this._paused}togglePause(e){e!==this._paused&&(this._paused=e,this._animationModel._agent.setPaused(this._animationIds(),e))}currentTimePromise(){let e=null;for(const t of this._animations)(!e||t.endTime()>e.endTime())&&(e=t);return this._animationModel._agent.getCurrentTime(e.id()).then(e=>e||0)}_matches(e){function t(e){return e.type()===Type.WebAnimation?e.type()+e.id():e._cssId()}if(this._animations.length!==e._animations.length)return!1;const i=this._animations.map(t).sort(),s=e._animations.map(t).sort();for(let e=0;e<i.length;e++)if(i[e]!==s[e])return!1;return!0}_update(e){this._animationModel._releaseAnimations(this._animationIds()),this._animations=e._animations}screenshots(){for(let e=0;e<this._screenshots.length;++e){const t=new Image;t.src="data:image/jpeg;base64,"+this._screenshots[e],this._screenshotImages.push(t)}return this._screenshots=[],this._screenshotImages}}export class AnimationDispatcher{constructor(e){this._animationModel=e}animationCreated(e){this._animationModel.animationCreated(e)}animationCanceled(e){this._animationModel._animationCanceled(e)}animationStarted(e){this._animationModel.animationStarted(e)}}export class ScreenshotCapture{constructor(e,t){this._requests=[],this._screenCaptureModel=t,this._animationModel=e,this._animationModel.addEventListener(Events.ModelReset,this._stopScreencast,this)}captureScreenshots(e,t){const i=Math.min(e/this._animationModel._playbackRate,3e3),s=i+window.performance.now();this._requests.push({endTime:s,screenshots:t}),(!this._endTime||s>this._endTime)&&(clearTimeout(this._stopTimer),this._stopTimer=setTimeout(this._stopScreencast.bind(this),i),this._endTime=s),this._capturing||(this._capturing=!0,this._screenCaptureModel.startScreencast("jpeg",80,void 0,300,2,this._screencastFrame.bind(this),e=>{}))}_screencastFrame(e,t){if(!this._capturing)return;const i=window.performance.now();this._requests=this._requests.filter((function(e){return e.endTime>=i}));for(const t of this._requests)t.screenshots.push(e)}_stopScreencast(){this._capturing&&(delete this._stopTimer,delete this._endTime,this._requests=[],this._capturing=!1,this._screenCaptureModel.stopScreencast())}}SDK.SDKModel.SDKModel.register(AnimationModel,SDK.SDKModel.Capability.DOM,!1);export let Request;