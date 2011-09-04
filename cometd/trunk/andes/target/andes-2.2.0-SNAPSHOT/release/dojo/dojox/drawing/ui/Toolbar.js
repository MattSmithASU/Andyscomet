/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.ui.Toolbar"]) {
	dojo._hasResource["dojox.drawing.ui.Toolbar"] = true;
	dojo.provide("dojox.drawing.ui.Toolbar");
	dojo.require("dojox.drawing.library.icons");
	dojo.declare("dojox.drawing.ui.Toolbar", [], {constructor:function (props, node) {
		this.util = dojox.drawing.util.common;
		if (props.drawing) {
			this.toolDrawing = props.drawing;
			this.drawing = this.toolDrawing;
			this.width = this.toolDrawing.width;
			this.height = this.toolDrawing.height;
			this.strSelected = props.selected;
			this.strTools = props.tools;
			this.strPlugs = props.plugs;
			this._mixprops(["padding", "margin", "size", "radius"], props);
			this.addBack();
			this.orient = props.orient ? props.orient : false;
		} else {
			var box = dojo.marginBox(node);
			this.width = box.w;
			this.height = box.h;
			this.strSelected = dojo.attr(node, "selected");
			this.strTools = dojo.attr(node, "tools");
			this.strPlugs = dojo.attr(node, "plugs");
			this._mixprops(["padding", "margin", "size", "radius"], node);
			this.toolDrawing = new dojox.drawing.Drawing({mode:"ui"}, node);
			this.orient = dojo.attr(node, "orient");
		}
		this.horizontal = this.orient ? this.orient == "H" : this.width > this.height;
		console.log("this.hor: ", this.horizontal, " orient: ", this.orient);
		if (this.toolDrawing.ready) {
			this.makeButtons();
			if (!this.strSelected && this.drawing.defaults.clickMode) {
				this.drawing.mouse.setCursor("default");
			}
		} else {
			var c = dojo.connect(this.toolDrawing, "onSurfaceReady", this, function () {
				dojo.disconnect(c);
				this.drawing = dojox.drawing.getRegistered("drawing", dojo.attr(node, "drawingId"));
				this.makeButtons();
				if (!this.strSelected && this.drawing.defaults.clickMode) {
					var c = dojo.connect(this.drawing, "onSurfaceReady", this, function () {
						dojo.disconnect(c);
						this.drawing.mouse.setCursor("default");
					});
				}
			});
		}
	}, padding:10, margin:5, size:30, radius:3, toolPlugGap:20, strSelected:"", strTools:"", strPlugs:"", makeButtons:function () {
		this.buttons = [];
		this.plugins = [];
		var x = this.padding, y = this.padding, w = this.size, h = this.size, r = this.radius, g = this.margin, sym = dojox.drawing.library.icons, s = {place:"BR", size:2, mult:4};
		if (this.strTools) {
			var toolAr = [];
			var tools = dojox.drawing.getRegistered("tool");
			var toolMap = {};
			for (var nm in tools) {
				var tool = this.util.abbr(nm);
				toolMap[tool] = tools[nm];
				if (this.strTools == "all") {
					toolAr.push(tool);
					var details = dojox.drawing.getRegistered("tool", nm);
					if (details.secondary) {
						toolAr.push(details.secondary.name);
					}
				}
			}
			if (this.strTools != "all") {
				var toolTmp = this.strTools.split(",");
				dojo.forEach(toolTmp, function (tool) {
					tool = dojo.trim(tool);
					toolAr.push(tool);
					var details = dojox.drawing.getRegistered("tool", toolMap[tool].name);
					if (details.secondary) {
						toolAr.push(details.secondary.name);
					}
				}, this);
			}
			dojo.forEach(toolAr, function (t) {
				t = dojo.trim(t);
				var secondary = false;
				if (t.indexOf("Secondary") > -1) {
					var prim = t.substring(0, t.indexOf("Secondary"));
					var sec = dojox.drawing.getRegistered("tool", toolMap[prim].name).secondary;
					var label = sec.label;
					this[t] = sec.funct;
					if (sec.setup) {
						dojo.hitch(this, sec.setup)();
					}
					var btn = this.toolDrawing.addUI("button", {data:{x:x, y:y, width:w, height:h / 2, r:r}, toolType:t, secondary:true, text:label, shadow:s, scope:this, callback:this[t]});
					if (sec.postSetup) {
						dojo.hitch(this, sec.postSetup, btn)();
					}
					secondary = true;
				} else {
					var btn = this.toolDrawing.addUI("button", {data:{x:x, y:y, width:w, height:h, r:r}, toolType:t, icon:sym[t], shadow:s, scope:this, callback:"onToolClick"});
				}
				dojox.drawing.register(btn, "button");
				this.buttons.push(btn);
				if (this.strSelected == t) {
					btn.select();
					this.selected = btn;
					this.drawing.setTool(btn.toolType);
				}
				if (this.horizontal) {
					x += h + g;
				} else {
					var space = secondary ? h / 2 + g : h + g;
					y += space;
				}
			}, this);
		}
		if (this.horizontal) {
			x += this.toolPlugGap;
		} else {
			y += this.toolPlugGap;
		}
		if (this.strPlugs) {
			var plugAr = [];
			var plugs = dojox.drawing.getRegistered("plugin");
			var plugMap = {};
			for (var nm in plugs) {
				var abbr = this.util.abbr(nm);
				plugMap[abbr] = plugs[nm];
				if (this.strPlugs == "all") {
					plugAr.push(abbr);
				}
			}
			if (this.strPlugs != "all") {
				plugAr = this.strPlugs.split(",");
				dojo.map(plugAr, function (p) {
					return dojo.trim(p);
				});
			}
			dojo.forEach(plugAr, function (p) {
				var t = dojo.trim(p);
				if (plugMap[p].button != false) {
					var btn = this.toolDrawing.addUI("button", {data:{x:x, y:y, width:w, height:h, r:r}, toolType:t, icon:sym[t], shadow:s, scope:this, callback:"onPlugClick"});
					dojox.drawing.register(btn, "button");
					this.plugins.push(btn);
					if (this.horizontal) {
						x += h + g;
					} else {
						y += h + g;
					}
				}
				var addPlug = {};
				plugMap[p].button == false ? addPlug = {name:this.drawing.stencilTypeMap[p]} : addPlug = {name:this.drawing.stencilTypeMap[p], options:{button:btn}};
				this.drawing.addPlugin(addPlug);
			}, this);
		}
		dojo.connect(this.drawing, "onRenderStencil", this, "onRenderStencil");
	}, onRenderStencil:function (stencil) {
		if (this.drawing.defaults.clickMode) {
			this.drawing.mouse.setCursor("default");
			this.selected && this.selected.deselect();
			this.selected = null;
		}
	}, addTool:function () {
	}, addPlugin:function () {
	}, addBack:function () {
		this.toolDrawing.addUI("rect", {data:{x:0, y:0, width:this.width, height:this.size + (this.padding * 2), fill:"#ffffff", borderWidth:0}});
	}, onToolClick:function (button) {
		if (this.drawing.defaults.clickMode) {
			this.drawing.mouse.setCursor("crosshair");
		}
		dojo.forEach(this.buttons, function (b) {
			if (b.id == button.id) {
				b.select();
				this.selected = b;
				this.drawing.setTool(button.toolType);
			} else {
				if (!b.secondary) {
					b.deselect();
				}
			}
		}, this);
	}, onPlugClick:function (button) {
	}, _mixprops:function (props, objNode) {
		dojo.forEach(props, function (p) {
			this[p] = objNode.tagName ? dojo.attr(objNode, p) === null ? this[p] : dojo.attr(objNode, p) : objNode[p] === undefined ? this[p] : objNode[p];
		}, this);
	}});
}

