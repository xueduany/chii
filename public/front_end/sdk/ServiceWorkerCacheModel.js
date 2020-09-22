import*as Common from"../common/common.js";import*as ProtocolClient from"../protocol_client/protocol_client.js";import{NameValue}from"./NetworkRequest.js";import{Capability,SDKModel,Target}from"./SDKModel.js";import{Events as SecurityOriginManagerEvents,SecurityOriginManager}from"./SecurityOriginManager.js";export class ServiceWorkerCacheModel extends SDKModel{constructor(e){super(e),e.registerStorageDispatcher(this),this._caches=new Map,this._cacheAgent=e.cacheStorageAgent(),this._storageAgent=e.storageAgent(),this._securityOriginManager=e.model(SecurityOriginManager),this._originsUpdated=new Set,this._throttler=new Common.Throttler.Throttler(2e3),this._enabled=!1}enable(){if(!this._enabled){this._securityOriginManager.addEventListener(SecurityOriginManagerEvents.SecurityOriginAdded,this._securityOriginAdded,this),this._securityOriginManager.addEventListener(SecurityOriginManagerEvents.SecurityOriginRemoved,this._securityOriginRemoved,this);for(const e of this._securityOriginManager.securityOrigins())this._addOrigin(e);this._enabled=!0}}clearForOrigin(e){this._removeOrigin(e),this._addOrigin(e)}refreshCacheNames(){for(const e of this._caches.values())this._cacheRemoved(e);this._caches.clear();const e=this._securityOriginManager.securityOrigins();for(const t of e)this._loadCacheNames(t)}async deleteCache(e){const t=await this._cacheAgent.invoke_deleteCache({cacheId:e.cacheId});t[ProtocolClient.InspectorBackend.ProtocolError]?console.error(`ServiceWorkerCacheAgent error deleting cache ${e.toString()}: ${t[ProtocolClient.InspectorBackend.ProtocolError]}`):(this._caches.delete(e.cacheId),this._cacheRemoved(e))}async deleteCacheEntry(e,t){const r=await this._cacheAgent.invoke_deleteEntry({cacheId:e.cacheId,request:t});r[ProtocolClient.InspectorBackend.ProtocolError]&&Common.Console.Console.instance().error(Common.UIString.UIString("ServiceWorkerCacheAgent error deleting cache entry %s in cache: %s",e.toString(),r[ProtocolClient.InspectorBackend.ProtocolError]))}loadCacheData(e,t,r,i,c){this._requestEntries(e,t,r,i,c)}loadAllCacheData(e,t,r){this._requestAllEntries(e,t,r)}caches(){const e=new Array;for(const t of this._caches.values())e.push(t);return e}dispose(){for(const e of this._caches.values())this._cacheRemoved(e);this._caches.clear(),this._enabled&&(this._securityOriginManager.removeEventListener(SecurityOriginManagerEvents.SecurityOriginAdded,this._securityOriginAdded,this),this._securityOriginManager.removeEventListener(SecurityOriginManagerEvents.SecurityOriginRemoved,this._securityOriginRemoved,this))}_addOrigin(e){this._loadCacheNames(e),this._isValidSecurityOrigin(e)&&this._storageAgent.trackCacheStorageForOrigin(e)}_removeOrigin(e){for(const t of this._caches.keys()){const r=this._caches.get(t);r.securityOrigin===e&&(this._caches.delete(t),this._cacheRemoved(r))}this._isValidSecurityOrigin(e)&&this._storageAgent.untrackCacheStorageForOrigin(e)}_isValidSecurityOrigin(e){const t=Common.ParsedURL.ParsedURL.fromString(e);return!!t&&t.scheme.startsWith("http")}async _loadCacheNames(e){const t=await this._cacheAgent.requestCacheNames(e);t&&this._updateCacheNames(e,t)}_updateCacheNames(e,t){const r=new Set,i=new Map,c=new Map;for(const e of t){const t=new Cache(this,e.securityOrigin,e.cacheName,e.cacheId);r.add(t.cacheId),this._caches.has(t.cacheId)||(i.set(t.cacheId,t),this._caches.set(t.cacheId,t))}this._caches.forEach((function(t){t.securityOrigin!==e||r.has(t.cacheId)||(c.set(t.cacheId,t),this._caches.delete(t.cacheId))}),this),i.forEach(this._cacheAdded,this),c.forEach(this._cacheRemoved,this)}_securityOriginAdded(e){const t=e.data;this._addOrigin(t)}_securityOriginRemoved(e){const t=e.data;this._removeOrigin(t)}_cacheAdded(e){this.dispatchEventToListeners(Events.CacheAdded,{model:this,cache:e})}_cacheRemoved(e){this.dispatchEventToListeners(Events.CacheRemoved,{model:this,cache:e})}async _requestEntries(e,t,r,i,c){const s=await this._cacheAgent.invoke_requestEntries({cacheId:e.cacheId,skipCount:t,pageSize:r,pathFilter:i});s[ProtocolClient.InspectorBackend.ProtocolError]?console.error("ServiceWorkerCacheAgent error while requesting entries: ",s[ProtocolClient.InspectorBackend.ProtocolError]):c(s.cacheDataEntries,s.returnCount)}async _requestAllEntries(e,t,r){const i=await this._cacheAgent.invoke_requestEntries({cacheId:e.cacheId,pathFilter:t});i[ProtocolClient.InspectorBackend.ProtocolError]?console.error("ServiceWorkerCacheAgent error while requesting entries: ",i[ProtocolClient.InspectorBackend.ProtocolError]):r(i.cacheDataEntries,i.returnCount)}cacheStorageListUpdated(e){this._originsUpdated.add(e),this._throttler.schedule(()=>{const e=Array.from(this._originsUpdated,e=>this._loadCacheNames(e));return this._originsUpdated.clear(),Promise.all(e)})}cacheStorageContentUpdated(e,t){this.dispatchEventToListeners(Events.CacheStorageContentUpdated,{origin:e,cacheName:t})}indexedDBListUpdated(e){}indexedDBContentUpdated(e,t,r){}}export const Events={CacheAdded:Symbol("CacheAdded"),CacheRemoved:Symbol("CacheRemoved"),CacheStorageContentUpdated:Symbol("CacheStorageContentUpdated")};export class Cache{constructor(e,t,r,i){this._model=e,this.securityOrigin=t,this.cacheName=r,this.cacheId=i}equals(e){return this.cacheId===e.cacheId}toString(){return this.securityOrigin+this.cacheName}requestCachedResponse(e,t){return this._model._cacheAgent.requestCachedResponse(this.cacheId,e,t)}}SDKModel.register(ServiceWorkerCacheModel,Capability.Storage,!1);