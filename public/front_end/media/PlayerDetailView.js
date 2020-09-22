import*as Common from"../common/common.js";import*as UI from"../ui/ui.js";import{PlayerEventsView}from"./EventDisplayTable.js";import{Event,MediaChangeTypeKeys}from"./MediaModel.js";import{PlayerPropertiesView}from"./PlayerPropertiesView.js";export const PlayerDetailViewTabs={Events:"events",Properties:"properties"};export class PlayerDetailView extends UI.TabbedPane.TabbedPane{constructor(){super();const e=new PlayerEventsView,r=new PlayerPropertiesView;this._panels=new Map([[MediaChangeTypeKeys.Property,[r]],[MediaChangeTypeKeys.Event,[e]]]),this.appendTab(PlayerDetailViewTabs.Properties,Common.UIString.UIString("Properties"),r,Common.UIString.UIString("Player properties")),this.appendTab(PlayerDetailViewTabs.Events,Common.UIString.UIString("Events"),e,Common.UIString.UIString("Player events"))}renderChanges(e,r,t){for(const n of this._panels.get(t))n.renderChanges(e,r,t)}}