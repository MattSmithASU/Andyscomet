/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.main"]) {
	dojo._hasResource["andes.main"] = true;
	dojo.provide("andes.main");
	dojo.require("andes.WordTip");
	(function () {
		var devMode = true, query;
		if (!window.location.search) {
			query = {p:"s2e", u:"joe1"};
		} else {
			query = dojo.queryToObject(window.location.search.substring(1));
		}
		if (!query.u || !query.p) {
			dojo.addOnLoad(function () {
				console.error("FIXME: Finalize the error message for needing to return to WebAssign.");
				andes.error({title:"Fatal Error", message:"No user and/or problem data was provided; cannot continue. Please return to the WebAssign page.", dialogType:andes.error.FATAL});
			});
		}
		var setCookie = function () {
			andes.sessionId = andes.userId + andes.projectId + new Date().getTime();
			var andesCookie = {u:andes.userId, p:andes.projectId, sid:andes.sessionId, closed:false};
			dojo.cookie("andes", dojo.toJson(andesCookie), {expires:999});
		};
		andes.closeFirst = false;
		andes.userId = query.u;
		andes.projectId = query.p;
		andes.sectionId = query.s || 1234;
		andes.extra = query.e;
		var ck = dojo.cookie("andes");
		if (ck && ck.u) {
			if (ck.u == andes.userId && ck.p == andes.projectId) {
				andes.sessionId = ck.sid;
			} else {
				andes.closeFirst = true;
				console.warn("Closing previous session", ck.u, andes.userId, ck.p, andes.projectId);
				setCookie();
			}
		} else {
			setCookie();
		}
		dojo.addOnUnload(function () {
			andes.api.close({});
		});
		dojo.addOnLoad(function () {
			andes.WordTip = new andes.WordTip();
			dojo.connect(dojo.byId("submitButton"), "click", function () {
				var closer = andes.api.close({});
				closer.then(function (result) {
					var url, found = false;
					dojo.forEach(result, function (entry) {
						if (entry.url) {
							found = true;
							url = entry.url;
						}
					});
					found ? window.location = url : history.go(-1);
				}, function (error) {
					console.warn("Server Error", error);
					console.log("Returning to previous page");
					history.go(-1);
				});
				dojo.cookie("andes", null, {expires:-1});
			});
			var splashNode = dojo.byId("splashOverlay"), anim = dojo.fadeOut({node:dojo.byId("splashOverlay")}), _h = dojo.connect(anim, "onEnd", function () {
				dojo.disconnect(_h);
				dojo.style(splashNode, "display", "none");
				console.log("andes.main loaded");
			});
			anim.play();
		});
	})();
	dojo.require("andes.defaults");
	dojo.require("andes.PreferenceRegistry");
	dojo.require("andes.convert");
	dojo.require("andes.drawing");
	dojo.require("andes.menu");
	dojo.require("andes.help");
	dojo.require("andes.api");
	dojo.require("andes.error");
	dojo.require("andes.variablename");
	andes.drawing.load();
}

