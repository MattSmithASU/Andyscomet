/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.io.script"]) {
	dojo._hasResource["dojo.io.script"] = true;
	dojo.provide("dojo.io.script");
	dojo.getObject("io", true, dojo);
	(function () {
		var loadEvent = dojo.isIE ? "onreadystatechange" : "load", readyRegExp = /complete|loaded/;
		dojo.io.script = {get:function (args) {
			var dfd = this._makeScriptDeferred(args);
			var ioArgs = dfd.ioArgs;
			dojo._ioAddQueryToUrl(ioArgs);
			dojo._ioNotifyStart(dfd);
			if (this._canAttach(ioArgs)) {
				var node = this.attach(ioArgs.id, ioArgs.url, args.frameDoc);
				if (!ioArgs.jsonp && !ioArgs.args.checkString) {
					var handle = dojo.connect(node, loadEvent, function (evt) {
						if (evt.type == "load" || readyRegExp.test(node.readyState)) {
							dojo.disconnect(handle);
							ioArgs.scriptLoaded = evt;
						}
					});
				}
			}
			dojo._ioWatch(dfd, this._validCheck, this._ioCheck, this._resHandle);
			return dfd;
		}, attach:function (id, url, frameDocument) {
			var doc = (frameDocument || dojo.doc);
			var element = doc.createElement("script");
			element.type = "text/javascript";
			element.src = url;
			element.id = id;
			element.charset = "utf-8";
			return doc.getElementsByTagName("head")[0].appendChild(element);
		}, remove:function (id, frameDocument) {
			dojo.destroy(dojo.byId(id, frameDocument));
			if (this["jsonp_" + id]) {
				delete this["jsonp_" + id];
			}
		}, _makeScriptDeferred:function (args) {
			var dfd = dojo._ioSetArgs(args, this._deferredCancel, this._deferredOk, this._deferredError);
			var ioArgs = dfd.ioArgs;
			ioArgs.id = dojo._scopeName + "IoScript" + (this._counter++);
			ioArgs.canDelete = false;
			ioArgs.jsonp = args.callbackParamName || args.jsonp;
			if (ioArgs.jsonp) {
				ioArgs.query = ioArgs.query || "";
				if (ioArgs.query.length > 0) {
					ioArgs.query += "&";
				}
				ioArgs.query += ioArgs.jsonp + "=" + (args.frameDoc ? "parent." : "") + dojo._scopeName + ".io.script.jsonp_" + ioArgs.id + "._jsonpCallback";
				ioArgs.frameDoc = args.frameDoc;
				ioArgs.canDelete = true;
				dfd._jsonpCallback = this._jsonpCallback;
				this["jsonp_" + ioArgs.id] = dfd;
			}
			return dfd;
		}, _deferredCancel:function (dfd) {
			dfd.canceled = true;
			if (dfd.ioArgs.canDelete) {
				dojo.io.script._addDeadScript(dfd.ioArgs);
			}
		}, _deferredOk:function (dfd) {
			var ioArgs = dfd.ioArgs;
			if (ioArgs.canDelete) {
				dojo.io.script._addDeadScript(ioArgs);
			}
			return ioArgs.json || ioArgs.scriptLoaded || ioArgs;
		}, _deferredError:function (error, dfd) {
			if (dfd.ioArgs.canDelete) {
				if (error.dojoType == "timeout") {
					dojo.io.script.remove(dfd.ioArgs.id, dfd.ioArgs.frameDoc);
				} else {
					dojo.io.script._addDeadScript(dfd.ioArgs);
				}
			}
			console.log("dojo.io.script error", error);
			return error;
		}, _deadScripts:[], _counter:1, _addDeadScript:function (ioArgs) {
			dojo.io.script._deadScripts.push({id:ioArgs.id, frameDoc:ioArgs.frameDoc});
			ioArgs.frameDoc = null;
		}, _validCheck:function (dfd) {
			var _self = dojo.io.script;
			var deadScripts = _self._deadScripts;
			if (deadScripts && deadScripts.length > 0) {
				for (var i = 0; i < deadScripts.length; i++) {
					_self.remove(deadScripts[i].id, deadScripts[i].frameDoc);
					deadScripts[i].frameDoc = null;
				}
				dojo.io.script._deadScripts = [];
			}
			return true;
		}, _ioCheck:function (dfd) {
			var ioArgs = dfd.ioArgs;
			if (ioArgs.json || (ioArgs.scriptLoaded && !ioArgs.args.checkString)) {
				return true;
			}
			var checkString = ioArgs.args.checkString;
			if (checkString && eval("typeof(" + checkString + ") != 'undefined'")) {
				return true;
			}
			return false;
		}, _resHandle:function (dfd) {
			if (dojo.io.script._ioCheck(dfd)) {
				dfd.callback(dfd);
			} else {
				dfd.errback(new Error("inconceivable dojo.io.script._resHandle error"));
			}
		}, _canAttach:function (ioArgs) {
			return true;
		}, _jsonpCallback:function (json) {
			this.ioArgs.json = json;
		}};
	})();
}

