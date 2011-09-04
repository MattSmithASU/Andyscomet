/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.io.iframe"]) {
	dojo._hasResource["dojo.io.iframe"] = true;
	dojo.provide("dojo.io.iframe");
	dojo.getObject("io", true, dojo);
	dojo.io.iframe = {create:function (fname, onloadstr, uri) {
		if (window[fname]) {
			return window[fname];
		}
		if (window.frames[fname]) {
			return window.frames[fname];
		}
		var cframe = null;
		var turi = uri;
		if (!turi) {
			if (dojo.config["useXDomain"] && !dojo.config["dojoBlankHtmlUrl"]) {
				console.warn("dojo.io.iframe.create: When using cross-domain Dojo builds," + " please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl" + " to the path on your domain to blank.html");
			}
			turi = (dojo.config["dojoBlankHtmlUrl"] || dojo.moduleUrl("dojo", "resources/blank.html"));
		}
		var cframe = dojo.place("<iframe id=\"" + fname + "\" name=\"" + fname + "\" src=\"" + turi + "\" onload=\"" + onloadstr + "\" style=\"position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden\">", dojo.body());
		window[fname] = cframe;
		return cframe;
	}, setSrc:function (iframe, src, replace) {
		try {
			if (!replace) {
				if (dojo.isWebKit) {
					iframe.location = src;
				} else {
					frames[iframe.name].location = src;
				}
			} else {
				var idoc;
				if (dojo.isIE || dojo.isWebKit) {
					idoc = iframe.contentWindow.document;
				} else {
					idoc = iframe.contentWindow;
				}
				if (!idoc) {
					iframe.location = src;
					return;
				} else {
					idoc.location.replace(src);
				}
			}
		}
		catch (e) {
			console.log("dojo.io.iframe.setSrc: ", e);
		}
	}, doc:function (iframeNode) {
		var doc = iframeNode.contentDocument || (((iframeNode.name) && (iframeNode.document) && (dojo.doc.getElementsByTagName("iframe")[iframeNode.name].contentWindow) && (dojo.doc.getElementsByTagName("iframe")[iframeNode.name].contentWindow.document))) || ((iframeNode.name) && (dojo.doc.frames[iframeNode.name]) && (dojo.doc.frames[iframeNode.name].document)) || null;
		return doc;
	}, send:function (args) {
		if (!this["_frame"]) {
			this._frame = this.create(this._iframeName, dojo._scopeName + ".io.iframe._iframeOnload();");
		}
		var dfd = dojo._ioSetArgs(args, function (dfd) {
			dfd.canceled = true;
			dfd.ioArgs._callNext();
		}, function (dfd) {
			var value = null;
			try {
				var ioArgs = dfd.ioArgs;
				var dii = dojo.io.iframe;
				var ifd = dii.doc(dii._frame);
				var handleAs = ioArgs.handleAs;
				value = ifd;
				if (handleAs != "html") {
					if (handleAs == "xml") {
						if (dojo.isIE < 9 || (dojo.isIE && dojo.isQuirks)) {
							dojo.query("a", dii._frame.contentWindow.document.documentElement).orphan();
							var xmlText = (dii._frame.contentWindow.document).documentElement.innerText;
							xmlText = xmlText.replace(/>\s+</g, "><");
							xmlText = dojo.trim(xmlText);
							var fauxXhr = {responseText:xmlText};
							value = dojo._contentHandlers["xml"](fauxXhr);
						}
					} else {
						value = ifd.getElementsByTagName("textarea")[0].value;
						if (handleAs == "json") {
							value = dojo.fromJson(value);
						} else {
							if (handleAs == "javascript") {
								value = dojo.eval(value);
							}
						}
					}
				}
			}
			catch (e) {
				value = e;
			}
			finally {
				ioArgs._callNext();
			}
			return value;
		}, function (error, dfd) {
			dfd.ioArgs._hasError = true;
			dfd.ioArgs._callNext();
			return error;
		});
		dfd.ioArgs._callNext = function () {
			if (!this["_calledNext"]) {
				this._calledNext = true;
				dojo.io.iframe._currentDfd = null;
				dojo.io.iframe._fireNextRequest();
			}
		};
		this._dfdQueue.push(dfd);
		this._fireNextRequest();
		dojo._ioWatch(dfd, function (dfd) {
			return !dfd.ioArgs["_hasError"];
		}, function (dfd) {
			return (!!dfd.ioArgs["_finished"]);
		}, function (dfd) {
			if (dfd.ioArgs._finished) {
				dfd.callback(dfd);
			} else {
				dfd.errback(new Error("Invalid dojo.io.iframe request state"));
			}
		});
		return dfd;
	}, _currentDfd:null, _dfdQueue:[], _iframeName:dojo._scopeName + "IoIframe", _fireNextRequest:function () {
		try {
			if ((this._currentDfd) || (this._dfdQueue.length == 0)) {
				return;
			}
			do {
				var dfd = this._currentDfd = this._dfdQueue.shift();
			} while (dfd && dfd.canceled && this._dfdQueue.length);
			if (!dfd || dfd.canceled) {
				this._currentDfd = null;
				return;
			}
			var ioArgs = dfd.ioArgs;
			var args = ioArgs.args;
			ioArgs._contentToClean = [];
			var fn = dojo.byId(args["form"]);
			var content = args["content"] || {};
			if (fn) {
				if (content) {
					var pHandler = function (name, value) {
						dojo.create("input", {type:"hidden", name:name, value:value}, fn);
						ioArgs._contentToClean.push(name);
					};
					for (var x in content) {
						var val = content[x];
						if (dojo.isArray(val) && val.length > 1) {
							var i;
							for (i = 0; i < val.length; i++) {
								pHandler(x, val[i]);
							}
						} else {
							if (!fn[x]) {
								pHandler(x, val);
							} else {
								fn[x].value = val;
							}
						}
					}
				}
				var actnNode = fn.getAttributeNode("action");
				var mthdNode = fn.getAttributeNode("method");
				var trgtNode = fn.getAttributeNode("target");
				if (args["url"]) {
					ioArgs._originalAction = actnNode ? actnNode.value : null;
					if (actnNode) {
						actnNode.value = args.url;
					} else {
						fn.setAttribute("action", args.url);
					}
				}
				if (!mthdNode || !mthdNode.value) {
					if (mthdNode) {
						mthdNode.value = (args["method"]) ? args["method"] : "post";
					} else {
						fn.setAttribute("method", (args["method"]) ? args["method"] : "post");
					}
				}
				ioArgs._originalTarget = trgtNode ? trgtNode.value : null;
				if (trgtNode) {
					trgtNode.value = this._iframeName;
				} else {
					fn.setAttribute("target", this._iframeName);
				}
				fn.target = this._iframeName;
				dojo._ioNotifyStart(dfd);
				fn.submit();
			} else {
				var tmpUrl = args.url + (args.url.indexOf("?") > -1 ? "&" : "?") + ioArgs.query;
				dojo._ioNotifyStart(dfd);
				this.setSrc(this._frame, tmpUrl, true);
			}
		}
		catch (e) {
			dfd.errback(e);
		}
	}, _iframeOnload:function () {
		var dfd = this._currentDfd;
		if (!dfd) {
			this._fireNextRequest();
			return;
		}
		var ioArgs = dfd.ioArgs;
		var args = ioArgs.args;
		var fNode = dojo.byId(args.form);
		if (fNode) {
			var toClean = ioArgs._contentToClean;
			for (var i = 0; i < toClean.length; i++) {
				var key = toClean[i];
				for (var j = 0; j < fNode.childNodes.length; j++) {
					var chNode = fNode.childNodes[j];
					if (chNode.name == key) {
						dojo.destroy(chNode);
						break;
					}
				}
			}
			if (ioArgs["_originalAction"]) {
				fNode.setAttribute("action", ioArgs._originalAction);
			}
			if (ioArgs["_originalTarget"]) {
				fNode.setAttribute("target", ioArgs._originalTarget);
				fNode.target = ioArgs._originalTarget;
			}
		}
		ioArgs._finished = true;
	}};
}

