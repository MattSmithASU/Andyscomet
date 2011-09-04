/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.menu"]) {
	dojo._hasResource["andes.menu"] = true;
	dojo.provide("andes.menu");
	dojo.require("andes.options");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuSeparator");
	dojo.addOnLoad(function () {
		dojo.byId("problemName").innerHTML = andes.projectId;
		function wireItem(item, fn) {
			var o = dijit.byId(item);
			if (o) {
				var extendfn = function () {
					andes.api.recordAction({type:"menu-choice", name:item});
					fn();
				};
				o.onClick = extendfn;
			} else {
				console.warn("Missing DOM object for ", item);
			}
		}
		var spec = {"menuPrinciples":function () {
			andes.principles.review("principles-tree.html", "Principles");
		}, "menuQuantities":function () {
			andes.principles.review("quantities.html", "Quantities");
		}, "menuUnits":function () {
			andes.principles.review("units.html", "Units");
		}, "menuConstants":function () {
			andes.principles.review("constants.html", "Constants");
		}, "menuIntroText":function () {
			andes.principles.review("introduction.html", "IntroText");
		}, "menuIntroVideo":function () {
			andes.principles.review("vec1a-video.html", "IntroVideo", null, "width=650,height=395");
		}, "menuIntroSlides":function () {
			andes.principles.review("try11/andes.intro.try11_controller.swf", "IntroSlides", null, "width=640,height=385");
		}, "menuManual":function () {
			andes.principles.review("manual.html", "Manual");
		}, "menuOptions":function () {
			var options = dijit.byId("options");
			options.show();
		}};
		andes.contextMenu = new dijit.Menu();
		var contextOptions = {};
		for (var i in spec) {
			wireItem(i, spec[i]);
			contextItem(i, spec[i]);
		}
		function contextItem(desc, fn) {
			var label = dijit.byId(desc).get("label");
			if (label == "Options" || label == "Introduction") {
				andes.contextMenu.addChild(new dijit.MenuSeparator());
			}
			contextOptions[label] = new dijit.MenuItem({label:label, onClick:fn});
			andes.contextMenu.addChild(contextOptions[label]);
		}
		andes.options = new andes.options();
		var _drawing = dijit.byId("drawing");
		var cn = dojo.connect(_drawing, "onSurfaceReady", function () {
			dojo.disconnect(cn);
			var node = null;
			dojo.connect(_drawing.mouse, "onDown", function (evt) {
				andes.contextMenu.unBindDomNode(node);
				node = evt.id == "canvasNode" ? dojo.byId("drawing") : dojo.byId(evt.id);
				andes.contextMenu.bindDomNode(node);
			});
		});
		function updateContext() {
			console.log("yeps");
		}
	});
}

