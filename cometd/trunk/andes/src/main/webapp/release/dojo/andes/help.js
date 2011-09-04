/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.help"]) {
	dojo._hasResource["andes.help"] = true;
	dojo.provide("andes.help");
	dojo.require("andes.api");
	(function () {
		function handleHelp(result) {
			if (!dijit.byId("helpPane")) {
				setTimeout(function () {
					handleHelp(result);
				}, 500);
				return;
			}
			var hlp = dijit.byId("helpContentPane");
			dijit.byId("helpPane").open();
			dojo.forEach(result, function (r) {
				var c = hlp.get("content");
				switch (r.action) {
				  case "show-hint-link":
					var fn = r.href ? "link" : "explain", val = r.href || r.value;
					hlp.containerNode.innerHTML = c + "\n<p><a href=\"#\" onclick=\"andes.help." + fn + "('" + val + "'); return false\">" + r.text + "</a></p>";
					break;
				  case "show-hint":
					var style = r.style ? " class=\"" + r.style + "\"" : "";
					hlp.containerNode.innerHTML = c + "\n<p" + style + ">" + dojox.drawing.util.typeset.convertLaTeX(r.text) + "</p>";
					break;
				  case "echo-get-help-text":
					andes.help.echo(r.text.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
					break;
				  case "focus-hint-text-box":
					dijit.focus(dojo.byId("helpInput"));
					break;
				  case "focus-major-principles":
					dojo.byId("majorModalTreeText").innerHTML = r.text ? "<p class=\"tall\">" + r.text + "</p>\n" : "";
					dijit.byId("majorPrinciples").show();
					break;
				  case "focus-all-principles":
					dojo.byId("allModalTreeText").innerHTML = "<p class=\"tall\">" + r.text + "</p>\n";
					dijit.byId("allPrinciples").show();
					break;
				  case "log":
				  default:
				}
			});
			hlp.domNode.scrollTop = hlp.domNode.scrollHeight;
		}
		dojo.addOnLoad(function () {
			dojo.connect(dijit.byId("helpSubmit"), "onClick", function () {
				var q = dijit.byId("helpInput").get("value"), h = q ? {action:"get-help", text:q} : {action:"help-button"};
				andes.help.echo(q.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
				dijit.byId("helpInput").set("value", "");
				andes.api.help(h).addCallback(handleHelp);
			});
		});
		andes.help.echo = function (value) {
			if (value == "!") {
				value = "Ha! A rotten easter egg!";
			}
			if (value.length > 0) {
				var hlp = dijit.byId("helpContentPane");
				var c = hlp.get("content");
				hlp.containerNode.innerHTML = c + "\n<p><span class=\"comment\">" + value + "</span></p>";
				hlp.domNode.scrollTop = hlp.domNode.scrollHeight;
			}
		};
		andes.help.processStep = function (result) {
			handleHelp(result);
		};
		andes.help.explain = function (s) {
			andes.api.help({action:"get-help", value:s}).addCallback(handleHelp);
		};
		andes.help.principles = function (s) {
			andes.api.help({action:"principles-menu", value:s}).addCallback(handleHelp);
		};
		andes.help.link = function (href) {
			dojo.xhrGet({url:href, handleAs:"text", load:function (result) {
				dijit.byId("helpContentPane").attr("content", result);
			}});
		};
		andes.help.score = function (value) {
			return dijit.byId("helpPane").score(value);
		};
		andes.help.link = function (name, value) {
			var s = {type:"tutor-link", name:name};
			if (value) {
				s.value = value;
			}
			andes.api.recordAction(s);
		};
	})();
}

