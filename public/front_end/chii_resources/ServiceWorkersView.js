import*as Common from"../common/common.js";import*as Components from"../components/components.js";import*as MobileThrottling from"../mobile_throttling/mobile_throttling.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class ServiceWorkersView extends UI.Widget.VBox{constructor(){super(!0),this.registerRequiredCSS("chii_resources/serviceWorkersView.css"),this._currentWorkersView=new UI.ReportView.ReportView(Common.UIString.UIString("Service Workers")),this._currentWorkersView.setBodyScrollable(!1),this.contentElement.classList.add("service-worker-list"),this._currentWorkersView.show(this.contentElement),this._currentWorkersView.element.classList.add("service-workers-this-origin"),this._toolbar=this._currentWorkersView.createToolbar(),this._toolbar.makeWrappable(!0),this._sections=new Map,this._registrationSymbol=Symbol("Resources.ServiceWorkersView"),this._manager=null,this._securityOriginManager=null,this._filterThrottler=new Common.Throttler.Throttler(300),this._otherWorkers=this.contentElement.createChild("div","service-workers-other-origin"),this._otherSWFilter=this._otherWorkers.createChild("div","service-worker-filter"),this._otherSWFilter.setAttribute("tabindex",0),this._otherSWFilter.setAttribute("role","switch"),this._otherSWFilter.setAttribute("aria-checked",!1);const e=this._otherSWFilter.createChild("label","service-worker-filter-label");e.textContent=Common.UIString.UIString("Service workers from other origins"),self.onInvokeElement(this._otherSWFilter,t=>{t.target!==this._otherSWFilter&&t.target!==e||this._toggleFilter()});const t=new UI.Toolbar.Toolbar("service-worker-filter-toolbar",this._otherSWFilter);this._filter=new UI.Toolbar.ToolbarInput(ls`Filter service worker`,"",1),this._filter.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged,()=>this._filterChanged()),t.appendToolbarItem(this._filter),this._otherWorkersView=new UI.ReportView.ReportView,this._otherWorkersView.setBodyScrollable(!1),this._otherWorkersView.show(this._otherWorkers),this._otherWorkersView.element.classList.add("service-workers-for-other-origins"),this._updateCollapsedStyle(),this._toolbar.appendToolbarItem(MobileThrottling.ThrottlingManager.throttlingManager().createOfflineToolbarCheckbox());const i=Common.Settings.Settings.instance().createSetting("serviceWorkerUpdateOnReload",!1);i.setTitle(Common.UIString.UIString("Update on reload"));const r=new UI.Toolbar.ToolbarSettingCheckbox(i,ls`On page reload, force the service worker to update, and activate it`);this._toolbar.appendToolbarItem(r);const s=Common.Settings.Settings.instance().createSetting("bypassServiceWorker",!1);s.setTitle(Common.UIString.UIString("Bypass for network"));const n=new UI.Toolbar.ToolbarSettingCheckbox(s,ls`Bypass the service worker and load resources from the network`);this._toolbar.appendToolbarItem(n),this._eventListeners=new Map,SDK.SDKModel.TargetManager.instance().observeModels(SDK.ServiceWorkerManager.ServiceWorkerManager,this),this._updateListVisibility()}modelAdded(e){if(!this._manager){this._manager=e,this._securityOriginManager=e.target().model(SDK.SecurityOriginManager.SecurityOriginManager);for(const e of this._manager.registrations().values())this._updateRegistration(e);this._eventListeners.set(e,[this._manager.addEventListener(SDK.ServiceWorkerManager.Events.RegistrationUpdated,this._registrationUpdated,this),this._manager.addEventListener(SDK.ServiceWorkerManager.Events.RegistrationDeleted,this._registrationDeleted,this),this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded,this._updateSectionVisibility,this),this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved,this._updateSectionVisibility,this)])}}modelRemoved(e){this._manager&&this._manager===e&&(Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners.get(e)),this._eventListeners.delete(e),this._manager=null,this._securityOriginManager=null)}_getTimeStamp(e){const t=e.versionsByMode();let i=0;const r=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Active),s=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Installing),n=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Waiting),o=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Redundant);return r?i=r.scriptResponseTime:n?i=n.scriptResponseTime:s?i=s.scriptResponseTime:o&&(i=o.scriptResponseTime),i}_updateSectionVisibility(){let e=!1,t=!1;const i=[];for(const r of this._sections.values()){const s=this._getReportViewForOrigin(r._registration.securityOrigin);e|=s===this._otherWorkersView,t|=s===this._currentWorkersView,r._section.parentWidget()!==s&&i.push(r)}for(const e of i){const t=e._registration;this._removeRegistrationFromList(t),this._updateRegistration(t,!0)}this._currentWorkersView.sortSections((e,t)=>{const i=this._getTimeStamp(e[this._registrationSymbol]);return this._getTimeStamp(t[this._registrationSymbol])-i});const r=new Sources.FilePathScoreFunction(this._filter.value());this._otherWorkersView.sortSections((e,t)=>{const i=r.score(t.title(),null)-r.score(e.title(),null);return 0===i?e.title().localeCompare(t.title()):i});for(const e of this._sections.values())e._section.parentWidget()===this._currentWorkersView||this._isRegistrationVisible(e._registration)?e._section.showWidget():e._section.hideWidget();this.contentElement.classList.toggle("service-worker-has-current",!!t),this._otherWorkers.classList.toggle("hidden",!e),this._updateListVisibility()}_registrationUpdated(e){const t=e.data;this._updateRegistration(t),this._gcRegistrations()}_gcRegistrations(){let e=!1;const t=new Set(this._securityOriginManager.securityOrigins());for(const i of this._manager.registrations().values())if((t.has(i.securityOrigin)||this._isRegistrationVisible(i))&&!i.canBeRemoved()){e=!0;break}if(e)for(const e of this._manager.registrations().values()){!(t.has(e.securityOrigin)||this._isRegistrationVisible(e))&&e.canBeRemoved()&&this._removeRegistrationFromList(e)}}_getReportViewForOrigin(e){return this._securityOriginManager.securityOrigins().includes(e)||this._securityOriginManager.unreachableMainSecurityOrigin()===e?this._currentWorkersView:this._otherWorkersView}_updateRegistration(e,t){let i=this._sections.get(e);if(!i){const t=e.scopeURL,r=this._getReportViewForOrigin(e.securityOrigin).appendSection(t);r.setUiGroupTitle(ls`Service worker for ${t}`),r[this._registrationSymbol]=e,i=new Section(this._manager,r,e),this._sections.set(e,i)}t||(this._updateSectionVisibility(),i._scheduleUpdate())}_registrationDeleted(e){const t=e.data;this._removeRegistrationFromList(t)}_removeRegistrationFromList(e){const t=this._sections.get(e);t&&t._section.detach(),this._sections.delete(e),this._updateSectionVisibility()}_isRegistrationVisible(e){const t=this._filter.value();if(!t||!e.scopeURL)return!0;const i=String.filterRegex(t);return e.scopeURL.match(i)}_filterChanged(){this._updateCollapsedStyle(),this._filterThrottler.schedule(()=>Promise.resolve(this._updateSectionVisibility()))}_updateCollapsedStyle(){const e="true"===this._otherSWFilter.getAttribute("aria-checked");this._otherWorkers.classList.toggle("service-worker-filter-collapsed",!e),e?this._otherWorkersView.showWidget():this._otherWorkersView.hideWidget(),this._otherWorkersView.setHeaderVisible(!1)}_updateListVisibility(){this.contentElement.classList.toggle("service-worker-list-empty",0===this._sections.size)}_toggleFilter(){const e="true"===this._otherSWFilter.getAttribute("aria-checked");this._otherSWFilter.setAttribute("aria-checked",!e),this._filterChanged()}}export class Section{constructor(e,t,i){this._manager=e,this._section=t,this._registration=i,this._fingerprint=null,this._pushNotificationDataSetting=Common.Settings.Settings.instance().createLocalSetting("pushData",Common.UIString.UIString("Test push message from DevTools.")),this._syncTagNameSetting=Common.Settings.Settings.instance().createLocalSetting("syncTagName","test-tag-from-devtools"),this._periodicSyncTagNameSetting=Common.Settings.Settings.instance().createLocalSetting("periodicSyncTagName","test-tag-from-devtools"),this._toolbar=t.createToolbar(),this._toolbar.renderAsLinks(),this._updateButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Update"),void 0,Common.UIString.UIString("Update")),this._updateButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._updateButtonClicked,this),this._toolbar.appendToolbarItem(this._updateButton),this._deleteButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Unregister service worker"),void 0,Common.UIString.UIString("Unregister")),this._deleteButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._unregisterButtonClicked,this),this._toolbar.appendToolbarItem(this._deleteButton),this._sourceField=this._wrapWidget(this._section.appendField(Common.UIString.UIString("Source"))),this._statusField=this._wrapWidget(this._section.appendField(Common.UIString.UIString("Status"))),this._clientsField=this._wrapWidget(this._section.appendField(Common.UIString.UIString("Clients"))),this._createSyncNotificationField(Common.UIString.UIString("Push"),this._pushNotificationDataSetting.get(),Common.UIString.UIString("Push data"),this._push.bind(this)),this._createSyncNotificationField(Common.UIString.UIString("Sync"),this._syncTagNameSetting.get(),Common.UIString.UIString("Sync tag"),this._sync.bind(this)),this._createSyncNotificationField(ls`Periodic Sync`,this._periodicSyncTagNameSetting.get(),ls`Periodic Sync tag`,e=>this._periodicSync(e)),this._linkifier=new Components.Linkifier.Linkifier,this._clientInfoCache=new Map,this._throttler=new Common.Throttler.Throttler(500)}_createSyncNotificationField(e,t,i,r){const s=this._wrapWidget(this._section.appendField(e)).createChild("form","service-worker-editor-with-button"),n=s.createChild("input","source-code service-worker-notification-editor"),o=UI.UIUtils.createTextButton(e);o.type="submit",s.appendChild(o),n.value=t,n.placeholder=i,UI.ARIAUtils.setAccessibleName(n,e),s.addEventListener("submit",e=>{r(n.value||""),e.consume(!0)})}_scheduleUpdate(){ServiceWorkersView._noThrottle?this._update():this._throttler.schedule(this._update.bind(this))}_targetForVersionId(e){const t=this._manager.findVersion(e);return t&&t.targetId?SDK.SDKModel.TargetManager.instance().targetById(t.targetId):null}_addVersion(e,t,i){const r=e.createChild("div","service-worker-version");return r.createChild("div",t),r.createChild("span").textContent=i,r}_updateClientsField(e){this._clientsField.removeChildren(),this._section.setFieldVisible(Common.UIString.UIString("Clients"),e.controlledClients.length);for(const t of e.controlledClients){const e=this._clientsField.createChild("div","service-worker-client");this._clientInfoCache.has(t)&&this._updateClientInfo(e,this._clientInfoCache.get(t)),this._manager.target().targetAgent().getTargetInfo(t).then(this._onClientInfo.bind(this,e))}}_updateSourceField(e){this._sourceField.removeChildren();const t=Common.ParsedURL.ParsedURL.extractName(e.scriptURL),i=this._sourceField.createChild("div","report-field-value-filename"),r=Components.Linkifier.Linkifier.linkifyURL(e.scriptURL,{text:t});if(r.tabIndex=0,i.appendChild(r),this._registration.errors.length){const e=UI.UIUtils.createIconLabel(String(this._registration.errors.length),"smallicon-error");e.classList.add("link"),e.tabIndex=0,UI.ARIAUtils.setAccessibleName(e,ls`${this._registration.errors.length} registration errors`),self.onInvokeElement(e,()=>Common.Console.Console.instance().show()),i.appendChild(e)}this._sourceField.createChild("div","report-field-value-subtitle").textContent=Common.UIString.UIString("Received %s",new Date(1e3*e.scriptResponseTime).toLocaleString())}_update(){const e=this._registration.fingerprint();if(e===this._fingerprint)return Promise.resolve();this._fingerprint=e,this._toolbar.setEnabled(!this._registration.isDeleted);const t=this._registration.versionsByMode(),i=this._registration.scopeURL,r=this._registration.isDeleted?Common.UIString.UIString("%s - deleted",i):i;this._section.setTitle(r);const s=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Active),n=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Waiting),o=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Installing),a=t.get(SDK.ServiceWorkerManager.ServiceWorkerVersion.Modes.Redundant);this._statusField.removeChildren();const c=this._statusField.createChild("div","service-worker-version-stack");if(c.createChild("div","service-worker-version-stack-bar"),s){this._updateSourceField(s);const e=SDK.ServiceWorkerManager.ServiceWorkerVersion.RunningStatus[s.runningStatus],t=this._addVersion(c,"service-worker-active-circle",ls`#${s.id} activated and is ${e}`);s.isRunning()||s.isStarting()?(this._createLink(t,Common.UIString.UIString("stop"),this._stopButtonClicked.bind(this,s.id)),this._targetForVersionId(s.id)||this._createLink(t,Common.UIString.UIString("inspect"),this._inspectButtonClicked.bind(this,s.id))):s.isStartable()&&this._createLink(t,Common.UIString.UIString("start"),this._startButtonClicked.bind(this)),this._updateClientsField(s)}else a&&(this._updateSourceField(a),this._addVersion(c,"service-worker-redundant-circle",Common.UIString.UIString("#%s is redundant",a.id)),this._updateClientsField(a));if(n){const e=this._addVersion(c,"service-worker-waiting-circle",Common.UIString.UIString("#%s waiting to activate",n.id));this._createLink(e,Common.UIString.UIString("skipWaiting"),this._skipButtonClicked.bind(this)),e.createChild("div","service-worker-subtitle").textContent=Common.UIString.UIString("Received %s",new Date(1e3*n.scriptResponseTime).toLocaleString()),this._targetForVersionId(n.id)||!n.isRunning()&&!n.isStarting()||this._createLink(e,Common.UIString.UIString("inspect"),this._inspectButtonClicked.bind(this,n.id))}if(o){const e=this._addVersion(c,"service-worker-installing-circle",Common.UIString.UIString("#%s trying to install",o.id));e.createChild("div","service-worker-subtitle").textContent=Common.UIString.UIString("Received %s",new Date(1e3*o.scriptResponseTime).toLocaleString()),this._targetForVersionId(o.id)||!o.isRunning()&&!o.isStarting()||this._createLink(e,Common.UIString.UIString("inspect"),this._inspectButtonClicked.bind(this,o.id))}return Promise.resolve()}_createLink(e,t,i,r,s){const n=e.createChild("button",r);return n.classList.add("link"),n.textContent=t,n.tabIndex=0,n.addEventListener("click",i,s),n}_unregisterButtonClicked(e){this._manager.deleteRegistration(this._registration.id)}_updateButtonClicked(e){this._manager.updateRegistration(this._registration.id)}_push(e){this._pushNotificationDataSetting.set(e),this._manager.deliverPushMessage(this._registration.id,e)}_sync(e){this._syncTagNameSetting.set(e),this._manager.dispatchSyncEvent(this._registration.id,e,!0)}_periodicSync(e){this._periodicSyncTagNameSetting.set(e),this._manager.dispatchPeriodicSyncEvent(this._registration.id,e)}_onClientInfo(e,t){t&&(this._clientInfoCache.set(t.targetId,t),this._updateClientInfo(e,t))}_updateClientInfo(e,t){if("page"!==t.type&&"iframe"===t.type){return void e.createChild("span","service-worker-client-string").createTextChild(ls`Worker: ${t.url}`)}e.removeChildren();e.createChild("span","service-worker-client-string").createTextChild(t.url),this._createLink(e,ls`focus`,this._activateTarget.bind(this,t.targetId),"service-worker-client-focus-link")}_activateTarget(e){this._manager.target().targetAgent().activateTarget(e)}_startButtonClicked(){this._manager.startWorker(this._registration.scopeURL)}_skipButtonClicked(){this._manager.skipWaiting(this._registration.scopeURL)}_stopButtonClicked(e){this._manager.stopWorker(e)}_inspectButtonClicked(e){this._manager.inspectWorker(e)}_wrapWidget(e){const t=UI.Utils.createShadowRootWithCoreStyles(e);UI.Utils.appendStyle(t,"resources/serviceWorkersView.css");const i=createElement("div");return t.appendChild(i),i}}