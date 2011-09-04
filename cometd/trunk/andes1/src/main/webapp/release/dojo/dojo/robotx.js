/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.robotx"]) {
	dojo._hasResource["dojo.robotx"] = true;
	dojo.provide("dojo.robotx");
	dojo.require("dojo.robot");
	dojo.experimental("dojo.robotx");
	(function () {
		var iframe = null;
		var groupStarted = dojo.connect(doh, "_groupStarted", function () {
			dojo.disconnect(groupStarted);
			iframe.style.visibility = "visible";
		});
		var attachIframe = function () {
			dojo.addOnLoad(function () {
				var emptyStyle = {overflow:dojo.isWebKit ? "hidden" : "visible", margin:"0px", borderWidth:"0px", height:"100%", width:"100%"};
				dojo.style(document.documentElement, emptyStyle);
				dojo.style(document.body, emptyStyle);
				document.body.appendChild(iframe);
				var base = document.createElement("base");
				base.href = iframe.src;
				document.getElementsByTagName("head")[0].appendChild(base);
			});
		};
		var robotReady = false;
		var robotFrame = null;
		var _run = doh.robot._run;
		doh.robot._run = function (frame) {
			robotReady = true;
			robotFrame = frame;
			doh.robot._run = _run;
			if (iframe.src) {
				attachIframe();
			}
		};
		var onIframeLoad = function () {
			doh.robot._updateDocument();
			onIframeLoad = null;
			var scrollRoot = (document.compatMode == "BackCompat") ? document.body : document.documentElement;
			var consoleHeight = document.getElementById("robotconsole").offsetHeight;
			if (consoleHeight) {
				iframe.style.height = (scrollRoot.clientHeight - consoleHeight) + "px";
			}
			if (iframe.contentWindow.dojo) {
				iframe.contentWindow.dojo.addOnLoad(function () {
					doh.robot._run(robotFrame);
				});
			} else {
				doh.robot._run(robotFrame);
			}
		};
		var iframeLoad = function () {
			if (onIframeLoad) {
				onIframeLoad();
			}
			var unloadConnect = dojo.connect(dojo.body(), "onunload", function () {
				dojo.global = window;
				dojo.doc = document;
				dojo.disconnect(unloadConnect);
			});
		};
		dojo.config.debugContainerId = "robotconsole";
		dojo.config.debugHeight = dojo.config.debugHeight || 200;
		document.write("<div id=\"robotconsole\" style=\"position:absolute;left:0px;bottom:0px;width:100%;\"></div>");
		iframe = document.createElement("iframe");
		iframe.setAttribute("ALLOWTRANSPARENCY", "true");
		iframe.scrolling = dojo.isIE ? "yes" : "auto";
		dojo.style(iframe, {visibility:"hidden", border:"0px none", padding:"0px", margin:"0px", position:"absolute", left:"0px", top:"0px", width:"100%", height:"100%"});
		if (iframe["attachEvent"] !== undefined) {
			iframe.attachEvent("onload", iframeLoad);
		} else {
			dojo.connect(iframe, "onload", iframeLoad);
		}
		dojo.mixin(doh.robot, {_updateDocument:function () {
			dojo.setContext(iframe.contentWindow, iframe.contentWindow.document);
			var win = dojo.global;
			if (win["dojo"]) {
				dojo._topics = win.dojo._topics;
			}
		}, initRobot:function (url) {
			iframe.src = url;
			if (robotReady) {
				attachIframe();
			}
		}, waitForPageToLoad:function (submitActions) {
			var d = new doh.Deferred();
			onIframeLoad = function () {
				onIframeLoad = null;
				doh.robot._updateDocument();
				d.callback(true);
			};
			submitActions();
			return d;
		}});
	})();
}

