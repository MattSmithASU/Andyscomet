/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.io.scriptFrame"]) {
	dojo._hasResource["dojox.io.scriptFrame"] = true;
	dojo.provide("dojox.io.scriptFrame");
	dojo.require("dojo.io.script");
	dojo.require("dojo.io.iframe");
	(function () {
		var ioScript = dojo.io.script;
		dojox.io.scriptFrame = {_waiters:{}, _loadedIds:{}, _getWaiters:function (frameId) {
			return this._waiters[frameId] || (this._waiters[frameId] = []);
		}, _fixAttachUrl:function (url) {
		}, _loaded:function (frameId) {
			var waiters = this._getWaiters(frameId);
			this._loadedIds[frameId] = true;
			this._waiters[frameId] = null;
			for (var i = 0; i < waiters.length; i++) {
				var ioArgs = waiters[i];
				ioArgs.frameDoc = dojo.io.iframe.doc(dojo.byId(frameId));
				ioScript.attach(ioArgs.id, ioArgs.url, ioArgs.frameDoc);
			}
		}};
		var oldCanAttach = ioScript._canAttach;
		var scriptFrame = dojox.io.scriptFrame;
		ioScript._canAttach = function (ioArgs) {
			var fId = ioArgs.args.frameDoc;
			if (fId && dojo.isString(fId)) {
				var frame = dojo.byId(fId);
				var waiters = scriptFrame._getWaiters(fId);
				if (!frame) {
					waiters.push(ioArgs);
					dojo.io.iframe.create(fId, dojox._scopeName + ".io.scriptFrame._loaded('" + fId + "');");
				} else {
					if (scriptFrame._loadedIds[fId]) {
						ioArgs.frameDoc = dojo.io.iframe.doc(frame);
						this.attach(ioArgs.id, ioArgs.url, ioArgs.frameDoc);
					} else {
						waiters.push(ioArgs);
					}
				}
				return false;
			} else {
				return oldCanAttach.apply(this, arguments);
			}
		};
	})();
}

