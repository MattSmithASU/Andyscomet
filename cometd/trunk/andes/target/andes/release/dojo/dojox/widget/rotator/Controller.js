/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.rotator.Controller"]) {
	dojo._hasResource["dojox.widget.rotator.Controller"] = true;
	dojo.provide("dojox.widget.rotator.Controller");
	(function (d) {
		var _dojoxRotator = "dojoxRotator", _play = _dojoxRotator + "Play", _pause = _dojoxRotator + "Pause", _number = _dojoxRotator + "Number", _tab = _dojoxRotator + "Tab", _selected = _dojoxRotator + "Selected";
		d.declare("dojox.widget.rotator.Controller", null, {rotator:null, commands:"prev,play/pause,info,next", constructor:function (params, node) {
			d.mixin(this, params);
			var r = this.rotator;
			if (r) {
				while (node.firstChild) {
					node.removeChild(node.firstChild);
				}
				var ul = this._domNode = d.create("ul", null, node), icon = " " + _dojoxRotator + "Icon", cb = function (label, css, action) {
					d.create("li", {className:css, innerHTML:"<a href=\"#\"><span>" + label + "</span></a>", onclick:function (e) {
						d.stopEvent(e);
						if (r) {
							r.control.apply(r, action);
						}
					}}, ul);
				};
				d.forEach(this.commands.split(","), function (b, i) {
					switch (b) {
					  case "prev":
						cb("Prev", _dojoxRotator + "Prev" + icon, ["prev"]);
						break;
					  case "play/pause":
						cb("Play", _play + icon, ["play"]);
						cb("Pause", _pause + icon, ["pause"]);
						break;
					  case "info":
						this._info = d.create("li", {className:_dojoxRotator + "Info", innerHTML:this._buildInfo(r)}, ul);
						break;
					  case "next":
						cb("Next", _dojoxRotator + "Next" + icon, ["next"]);
						break;
					  case "#":
					  case "titles":
						for (var j = 0; j < r.panes.length; j++) {
							cb(b == "#" ? j + 1 : r.panes[j].title || "Tab " + (j + 1), (b == "#" ? _number : _tab) + " " + (j == r.idx ? _selected : "") + " " + _dojoxRotator + "Pane" + j, ["go", j]);
						}
						break;
					}
				}, this);
				d.query("li:first-child", ul).addClass(_dojoxRotator + "First");
				d.query("li:last-child", ul).addClass(_dojoxRotator + "Last");
				this._togglePlay();
				this._con = d.connect(r, "onUpdate", this, "_onUpdate");
			}
		}, destroy:function () {
			d.disconnect(this._con);
			d.destroy(this._domNode);
		}, _togglePlay:function (playing) {
			var p = this.rotator.playing;
			d.query("." + _play, this._domNode).style("display", p ? "none" : "");
			d.query("." + _pause, this._domNode).style("display", p ? "" : "none");
		}, _buildInfo:function (r) {
			return "<span>" + (r.idx + 1) + " / " + r.panes.length + "</span>";
		}, _onUpdate:function (type) {
			var r = this.rotator;
			switch (type) {
			  case "play":
			  case "pause":
				this._togglePlay();
				break;
			  case "onAfterTransition":
				if (this._info) {
					this._info.innerHTML = this._buildInfo(r);
				}
				var s = function (n) {
					if (r.idx < n.length) {
						d.addClass(n[r.idx], _selected);
					}
				};
				s(d.query("." + _number, this._domNode).removeClass(_selected));
				s(d.query("." + _tab, this._domNode).removeClass(_selected));
				break;
			}
		}});
	})(dojo);
}

