import*as Host from"../host/host.js";import{Capability,SDKModel,Target}from"./SDKModel.js";export class LogModel extends SDKModel{constructor(e){super(e),e.registerLogDispatcher(this),this._logAgent=e.logAgent(),this._logAgent.enable(),Host.InspectorFrontendHost.isUnderTest()||this._logAgent.startViolationsReport([{name:"longTask",threshold:200},{name:"longLayout",threshold:30},{name:"blockedEvent",threshold:100},{name:"blockedParser",threshold:-1},{name:"handler",threshold:150},{name:"recurringHandler",threshold:50},{name:"discouragedAPIUse",threshold:-1}])}entryAdded(e){this.dispatchEventToListeners(Events.EntryAdded,{logModel:this,entry:e})}requestClear(){this._logAgent.clear()}}export const Events={EntryAdded:Symbol("EntryAdded")};SDKModel.register(LogModel,Capability.Log,!0);