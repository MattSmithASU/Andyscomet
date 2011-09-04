/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Avatar"]) {
	dojo._hasResource["dojo.dnd.Avatar"] = true;
	dojo.provide("dojo.dnd.Avatar");
	dojo.require("dojo.dnd.common");
	dojo.declare("dojo.dnd.Avatar", null, {constructor:function (manager) {
		this.manager = manager;
		this.construct();
	}, construct:function () {
		this.isA11y = dojo.hasClass(dojo.body(), "dijit_a11y");
		var a = dojo.create("table", {"class":"dojoDndAvatar", style:{position:"absolute", zIndex:"1999", margin:"0px"}}), source = this.manager.source, node, b = dojo.create("tbody", null, a), tr = dojo.create("tr", null, b), td = dojo.create("td", null, tr), icon = this.isA11y ? dojo.create("span", {id:"a11yIcon", innerHTML:this.manager.copy ? "+" : "<"}, td) : null, span = dojo.create("span", {innerHTML:source.generateText ? this._generateText() : ""}, td), k = Math.min(5, this.manager.nodes.length), i = 0;
		dojo.attr(tr, {"class":"dojoDndAvatarHeader", style:{opacity:0.9}});
		for (; i < k; ++i) {
			if (source.creator) {
				node = source._normalizedCreator(source.getItem(this.manager.nodes[i].id).data, "avatar").node;
			} else {
				node = this.manager.nodes[i].cloneNode(true);
				if (node.tagName.toLowerCase() == "tr") {
					var table = dojo.create("table"), tbody = dojo.create("tbody", null, table);
					tbody.appendChild(node);
					node = table;
				}
			}
			node.id = "";
			tr = dojo.create("tr", null, b);
			td = dojo.create("td", null, tr);
			td.appendChild(node);
			dojo.attr(tr, {"class":"dojoDndAvatarItem", style:{opacity:(9 - i) / 10}});
		}
		this.node = a;
	}, destroy:function () {
		dojo.destroy(this.node);
		this.node = false;
	}, update:function () {
		dojo[(this.manager.canDropFlag ? "add" : "remove") + "Class"](this.node, "dojoDndAvatarCanDrop");
		if (this.isA11y) {
			var icon = dojo.byId("a11yIcon");
			var text = "+";
			if (this.manager.canDropFlag && !this.manager.copy) {
				text = "< ";
			} else {
				if (!this.manager.canDropFlag && !this.manager.copy) {
					text = "o";
				} else {
					if (!this.manager.canDropFlag) {
						text = "x";
					}
				}
			}
			icon.innerHTML = text;
		}
		dojo.query(("tr.dojoDndAvatarHeader td span" + (this.isA11y ? " span" : "")), this.node).forEach(function (node) {
			node.innerHTML = this._generateText();
		}, this);
	}, _generateText:function () {
		return this.manager.nodes.length.toString();
	}});
}

