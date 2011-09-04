/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.rotator.ThumbnailController"]) {
	dojo._hasResource["dojox.widget.rotator.ThumbnailController"] = true;
	dojo.provide("dojox.widget.rotator.ThumbnailController");
	(function (d) {
		var _css = "dojoxRotatorThumb", _selected = _css + "Selected";
		d.declare("dojox.widget.rotator.ThumbnailController", null, {rotator:null, constructor:function (params, node) {
			d.mixin(this, params);
			this._domNode = node;
			var r = this.rotator;
			if (r) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
				for (var i = 0; i < r.panes.length; i++) {
					var n = r.panes[i].node, s = d.attr(n, "thumbsrc") || d.attr(n, "src"), t = d.attr(n, "alt") || "";
					if (/img/i.test(n.tagName)) {
						(function (j) {
							d.create("a", {classname:_css + " " + _css + j + " " + (j == r.idx ? _selected : ""), href:s, onclick:function (e) {
								d.stopEvent(e);
								if (r) {
									r.control.apply(r, ["go", j]);
								}
							}, title:t, innerHTML:"<img src=\"" + s + "\" alt=\"" + t + "\"/>"}, node);
						})(i);
					}
				}
				this._con = d.connect(r, "onUpdate", this, "_onUpdate");
			}
		}, destroy:function () {
			d.disconnect(this._con);
			d.destroy(this._domNode);
		}, _onUpdate:function (type) {
			var r = this.rotator;
			if (type == "onAfterTransition") {
				var n = d.query("." + _css, this._domNode).removeClass(_selected);
				if (r.idx < n.length) {
					d.addClass(n[r.idx], _selected);
				}
			}
		}});
	})(dojo);
}

