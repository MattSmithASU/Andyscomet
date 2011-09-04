/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.principles"]) {
	dojo._hasResource["andes.principles"] = true;
	dojo.provide("andes.principles");
	dojo.require("dijit.Tree");
	dojo.require("dojo.data.ItemFileReadStore");
	if (dijit._TreeNode._meta.hidden.attributeMap) {
		dijit._TreeNode._meta.hidden.attributeMap.label.type = "innerHTML";
	} else {
		if (dijit._TreeNode._meta.hidden._setLabelAttr) {
			dijit._TreeNode._meta.hidden._setLabelAttr.type = "innerHTML";
		} else {
			console.error("Can't render HTML in tree.");
		}
	}
	andes.principles = {reviewp:[], review:function (file, title, section, dimensionString) {
		if (!this.reviewp[file] || this.reviewp[file].closed) {
			var dims = dimensionString ? dimensionString + ",scrollbars=no" : "width=350,height=450,scrollbars=yes";
			if (title.match(" ")) {
				console.error("window.open title with space:  ", title);
				title = title.replace(/ /g, "_");
			}
			this.reviewp[file] = window.open("../review/" + file, title, dims + ",directories=no,menubar=no,toolbar=no,location=no,status=no");
			if (this.reviewp[file]) {
				if (dojo.isIE) {
					var body, win = this.reviewp[file];
					function childLoaded() {
						body = win.document.getElementsByTagName("body");
						if (body[0] == null) {
							setTimeout(childLoaded, 20);
						} else {
							var n = win.document.createElement("script");
							n.src = "../web-UI/andes/recordIE.js";
							body[0].appendChild(n);
						}
					}
					childLoaded();
				} else {
					if (section) {
						this.reviewp[file].onload = function () {
							var obj = this.document.getElementById(section);
							obj.scrollIntoView();
						};
					}
					dojo.connect(this.reviewp[file], "onblur", andes.drawing.onWindowBlur);
					dojo.connect(this.reviewp[file], "onfocus", andes.drawing.onWindowFocus);
				}
			} else {
				if (title == "Principles") {
					dojo.byId("allModalTreeText").innerHTML = "";
					dijit.byId("allPrinciples").show();
				}
			}
		} else {
			this.reviewp[file].focus();
			if (section) {
				var obj = this.reviewp[file].document.getElementById(section);
				obj.scrollIntoView();
			}
		}
	}};
	dojo.addOnLoad(function () {
		var principlesStore = new dojo.data.ItemFileReadStore({url:"../review/principles.json"});
		var majorPrinciplesModel = new dijit.tree.ForestStoreModel({store:principlesStore, query:{"complexity":"major"}, rootLabel:"Major Principles", childrenAttrs:["items"]});
		var allPrinciplesModel = new dijit.tree.ForestStoreModel({store:principlesStore, rootLabel:"All Principles", childrenAttrs:["items"]});
		new dijit.Tree({model:majorPrinciplesModel, showRoot:false, onClick:function (item, node) {
			var psm = principlesStore.getValue(item, "psm");
			if (psm) {
				andes.help.echo(principlesStore.getValue(item, "label"));
				andes.help.principles(psm);
				dijit.byId("majorPrinciples").hide();
			}
		}}, "majorModalTree");
		new dijit.Tree({model:allPrinciplesModel, showRoot:false, onClick:function (item, node) {
			var psm = principlesStore.getValue(item, "psm");
			if (psm) {
				andes.help.echo(principlesStore.getValue(item, "label"));
				andes.help.principles(psm);
				dijit.byId("allPrinciples").hide();
			}
		}}, "allModalTree");
	});
}

