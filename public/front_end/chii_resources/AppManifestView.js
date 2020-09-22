import*as Common from"../common/common.js";import*as Components from"../components/components.js";import*as InlineEditor from"../inline_editor/inline_editor.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class AppManifestView extends UI.Widget.VBox{constructor(){super(!0),this.registerRequiredCSS("chii_resources/appManifestView.css"),Common.Settings.Settings.instance().moduleSetting("colorFormat").addChangeListener(this._updateManifest.bind(this,!0)),this._emptyView=new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString("No manifest detected")),this._emptyView.appendLink("https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/?utm_source=devtools"),this._emptyView.show(this.contentElement),this._emptyView.hideWidget(),this._reportView=new UI.ReportView.ReportView(Common.UIString.UIString("App Manifest")),this._reportView.show(this.contentElement),this._reportView.hideWidget(),this._errorsSection=this._reportView.appendSection(Common.UIString.UIString("Errors and warnings")),this._installabilitySection=this._reportView.appendSection(Common.UIString.UIString("Installability")),this._identitySection=this._reportView.appendSection(Common.UIString.UIString("Identity")),this._presentationSection=this._reportView.appendSection(Common.UIString.UIString("Presentation")),this._iconsSection=this._reportView.appendSection(Common.UIString.UIString("Icons"),"report-section-icons"),this._nameField=this._identitySection.appendField(Common.UIString.UIString("Name")),this._shortNameField=this._identitySection.appendField(Common.UIString.UIString("Short name")),this._startURLField=this._presentationSection.appendField(Common.UIString.UIString("Start URL"));const e=this._presentationSection.appendField(Common.UIString.UIString("Theme color"));this._themeColorSwatch=InlineEditor.ColorSwatch.ColorSwatch.create(),e.appendChild(this._themeColorSwatch);const t=this._presentationSection.appendField(Common.UIString.UIString("Background color"));this._backgroundColorSwatch=InlineEditor.ColorSwatch.ColorSwatch.create(),t.appendChild(this._backgroundColorSwatch),this._orientationField=this._presentationSection.appendField(Common.UIString.UIString("Orientation")),this._displayField=this._presentationSection.appendField(Common.UIString.UIString("Display")),this._throttler=new Common.Throttler.Throttler(1e3),SDK.SDKModel.TargetManager.instance().observeTargets(this)}targetAdded(e){this._target||(this._target=e,this._resourceTreeModel=e.model(SDK.ResourceTreeModel.ResourceTreeModel),this._serviceWorkerManager=e.model(SDK.ServiceWorkerManager.ServiceWorkerManager),this._resourceTreeModel&&this._serviceWorkerManager&&(this._updateManifest(!0),this._registeredListeners=[this._resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded,e=>{this._updateManifest(!0)}),this._serviceWorkerManager.addEventListener(SDK.ServiceWorkerManager.Events.RegistrationUpdated,e=>{this._updateManifest(!1)})]))}targetRemoved(e){this._target===e&&this._resourceTreeModel&&this._serviceWorkerManager&&(delete this._resourceTreeModel,delete this._serviceWorkerManager,Common.EventTarget.EventTarget.removeEventListeners(this._registeredListeners))}async _updateManifest(e){const{url:t,data:i,errors:o}=await this._resourceTreeModel.fetchAppManifest(),r=await this._resourceTreeModel.getInstallabilityErrors(),n=await this._resourceTreeModel.getManifestIcons();this._throttler.schedule(()=>this._renderManifest(t,i,o,r,n),e)}async _renderManifest(e,t,i,o,r){if(!t&&!i.length)return this._emptyView.showWidget(),void this._reportView.hideWidget();this._emptyView.hideWidget(),this._reportView.showWidget();const n=Components.Linkifier.Linkifier.linkifyURL(e);n.tabIndex=0,this._reportView.setURL(n),this._errorsSection.clearContent(),this._errorsSection.element.classList.toggle("hidden",!i.length);for(const e of i)this._errorsSection.appendRow().appendChild(UI.UIUtils.createIconLabel(e.message,e.critical?"smallicon-error":"smallicon-warning"));if(!t)return;65279===t.charCodeAt(0)&&(t=t.slice(1));const s=JSON.parse(t);this._nameField.textContent=f("name"),this._shortNameField.textContent=f("short_name"),this._startURLField.removeChildren();const a=f("start_url");if(a){const t=Common.ParsedURL.ParsedURL.completeURL(e,a),i=Components.Linkifier.Linkifier.linkifyURL(t,{text:a});i.tabIndex=0,this._startURLField.appendChild(i)}this._themeColorSwatch.classList.toggle("hidden",!f("theme_color"));const l=Common.Color.Color.parse(f("theme_color")||"white")||Common.Color.Color.parse("white");this._themeColorSwatch.setColor(l),this._themeColorSwatch.setFormat(Common.Settings.detectColorFormat(this._themeColorSwatch.color())),this._backgroundColorSwatch.classList.toggle("hidden",!f("background_color"));const c=Common.Color.Color.parse(f("background_color")||"white")||Common.Color.Color.parse("white");this._backgroundColorSwatch.setColor(c),this._backgroundColorSwatch.setFormat(Common.Settings.detectColorFormat(this._backgroundColorSwatch.color())),this._orientationField.textContent=f("orientation");const d=f("display");this._displayField.textContent=d;const h=s.icons||[];this._iconsSection.clearContent();const m=[],p=UI.UIUtils.CheckboxLabel.create(Common.UIString.UIString("Show only the minimum safe area for maskable icons"));p.classList.add("mask-checkbox"),p.addEventListener("click",()=>{this._iconsSection.setIconMasked(p.checkboxElement.checked)}),this._iconsSection.appendRow().appendChild(p);const g=UI.XLink.XLink.create("https://web.dev/maskable-icon/",ls`documentation on maskable icons`);if(this._iconsSection.appendRow().appendChild(UI.UIUtils.formatLocalized("Need help? Read our %s.",[g])),r&&r.primaryIcon){const t=createElement("div");t.classList.add("image-wrapper");const i=createElement("img");i.style.maxWidth="200px",i.style.maxHeight="200px",i.src="data:image/png;base64,"+r.primaryIcon,i.alt=ls`Primary manifest icon from ${e}`;const o=ls`Primary icon\nas used by Chrome`,n=this._iconsSection.appendFlexedField(o);t.appendChild(i),n.appendChild(t)}for(const t of h){const i=Common.ParsedURL.ParsedURL.completeURL(e,t.src),o=await this._loadImage(i);if(!o){m.push(ls`Icon ${i} failed to load`);continue}const{wrapper:r,image:n}=o,s=(t.sizes?t.sizes.replace("x","×")+"px":"")+"\n"+(t.type||""),a=this._iconsSection.appendFlexedField(s);if(t.sizes)if(/^\d+x\d+$/.test(t.sizes)){const[e,o]=t.sizes.split("x").map(e=>parseInt(e,10));n.naturalWidth!==e&&n.naturalHeight!==o?m.push(ls`Actual size (${n.naturalWidth}×${n.naturalHeight})px of icon ${i} does not match specified size (${e}×${o}px)`):n.naturalWidth!==e?m.push(ls`Actual width (${n.naturalWidth}px) of icon ${i} does not match specified width (${e}px)`):n.naturalHeight!==o&&m.push(ls`Actual height (${n.naturalHeight}px) of icon ${i} does not match specified height (${o}px)`)}else m.push(ls`Icon ${i} should specify its size as \`{width}x{height}\``);else m.push(ls`Icon ${i} does not specify its size in the manifest`);a.appendChild(r)}this._installabilitySection.clearContent(),this._installabilitySection.element.classList.toggle("hidden",!o.length);const u=this.getInstallabilityErrorMessages(o);for(const e of u)this._installabilitySection.appendRow().appendChild(UI.UIUtils.createIconLabel(e,"smallicon-warning"));this._errorsSection.element.classList.toggle("hidden",!i.length&&!m.length);for(const e of m)this._errorsSection.appendRow().appendChild(UI.UIUtils.createIconLabel(e,"smallicon-warning"));function f(e){const t=s[e];return"string"!=typeof t?"":t}}getInstallabilityErrorMessages(e){const t=[];for(const i of e){let e;switch(i.errorId){case"not-in-main-frame":e=ls`Page is not loaded in the main frame`;break;case"not-from-secure-origin":e=ls`Page is not served from a secure origin`;break;case"no-manifest":e=ls`Page has no manifest <link> URL`;break;case"manifest-empty":e=ls`Manifest could not be fetched, is empty, or could not be parsed`;break;case"start-url-not-valid":e=ls`Manifest start URL is not valid`;break;case"manifest-missing-name-or-short-name":e=ls`Manifest does not contain a 'name' or 'short_name' field`;break;case"manifest-display-not-supported":e=ls`Manifest 'display' property must be one of 'standalone', 'fullscreen', or 'minimal-ui'`;break;case"manifest-missing-suitable-icon":if(1!==i.errorArguments.length||"minimum-icon-size-in-pixels"!==i.errorArguments[0].name){console.error("Installability error does not have the correct errorArguments");break}e=ls`Manifest does not contain a suitable icon - PNG, SVG or WebP format of at least ${i.errorArguments[0].value}px is required, the sizes attribute must be set, and the purpose attribute, if set, must include "any" or "maskable".`;break;case"no-matching-service-worker":e=ls`No matching service worker detected. You may need to reload the page, or check that the scope of the service worker for the current page encloses the scope and start URL from the manifest.`;break;case"no-acceptable-icon":if(1!==i.errorArguments.length||"minimum-icon-size-in-pixels"!==i.errorArguments[0].name){console.error("Installability error does not have the correct errorArguments");break}e=ls`No supplied icon is at least ${i.errorArguments[0].value}px square in PNG, SVG or WebP format`;break;case"cannot-download-icon":e=ls`Could not download a required icon from the manifest`;break;case"no-icon-available":e=ls`Downloaded icon was empty or corrupted`;break;case"platform-not-supported-on-android":e=ls`The specified application platform is not supported on Android`;break;case"no-id-specified":e=ls`No Play store ID provided`;break;case"ids-do-not-match":e=ls`The Play Store app URL and Play Store ID do not match`;break;case"already-installed":e=ls`The app is already installed`;break;case"url-not-supported-for-webapk":e=ls`A URL in the manifest contains a username, password, or port`;break;case"in-incognito":e=ls`Page is loaded in an incognito window`;break;case"not-offline-capable":e=ls`Page does not work offline`;break;case"no-url-for-service-worker":e=ls`Could not check service worker without a 'start_url' field in the manifest`;break;case"prefer-related-applications":e=ls`Manifest specifies prefer_related_applications: true`;break;default:console.error(`Installability error id '${i.errorId}' is not recognized`)}t&&t.push(e)}return t}async _loadImage(e){const t=createElement("div");t.classList.add("image-wrapper");const i=createElement("img"),o=new Promise((e,t)=>{i.onload=e,i.onerror=t});i.src=e,i.alt=ls`Image from ${e}`,t.appendChild(i);try{return await o,{wrapper:t,image:i}}catch(e){}return null}}