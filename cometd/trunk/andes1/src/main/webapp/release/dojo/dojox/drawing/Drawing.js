/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.Drawing"]) {
	dojo._hasResource["dojox.drawing.Drawing"] = true;
	dojo.provide("dojox.drawing.Drawing");
	(function () {
		var _plugsInitialized = false;
		dojo.declare("dojox.drawing.Drawing", [], {ready:false, mode:"", width:0, height:0, constructor:function (props, node) {
			var def = dojo.attr(node, "defaults");
			if (def) {
				dojox.drawing.defaults = dojo.getObject(def);
			}
			this.defaults = dojox.drawing.defaults;
			this.id = node.id;
			dojox.drawing.register(this, "drawing");
			this.mode = (props.mode || dojo.attr(node, "mode") || "").toLowerCase();
			var box = dojo.contentBox(node);
			this.width = box.w;
			this.height = box.h;
			this.util = dojox.drawing.util.common;
			this.util.register(this);
			this.keys = dojox.drawing.manager.keys;
			this.mouse = new dojox.drawing.manager.Mouse({util:this.util, keys:this.keys, id:this.mode == "ui" ? "MUI" : "mse"});
			this.mouse.setEventMode(this.mode);
			this.tools = {};
			this.stencilTypes = {};
			this.stencilTypeMap = {};
			this.srcRefNode = node;
			this.domNode = node;
			var str = dojo.attr(node, "plugins");
			if (str) {
				this.plugins = eval(str);
			} else {
				this.plugins = [];
			}
			this.widgetId = this.id;
			dojo.attr(this.domNode, "widgetId", this.widgetId);
			if (dijit && dijit.registry) {
				dijit.registry.add(this);
				console.log("using dijit");
			} else {
				dijit.registry = {objs:{}, add:function (obj) {
					this.objs[obj.id] = obj;
				}};
				dijit.byId = function (id) {
					return dijit.registry.objs[id];
				};
				dijit.registry.add(this);
			}
			var stencils = dojox.drawing.getRegistered("stencil");
			for (var nm in stencils) {
				this.registerTool(stencils[nm].name);
			}
			var tools = dojox.drawing.getRegistered("tool");
			for (nm in tools) {
				this.registerTool(tools[nm].name);
			}
			var plugs = dojox.drawing.getRegistered("plugin");
			for (nm in plugs) {
				this.registerTool(plugs[nm].name);
			}
			this._createCanvas();
		}, _createCanvas:function () {
			console.info("drawing create canvas...");
			this.canvas = new dojox.drawing.manager.Canvas({srcRefNode:this.domNode, util:this.util, mouse:this.mouse, callback:dojo.hitch(this, "onSurfaceReady")});
			this.initPlugins();
		}, resize:function (box) {
			box && dojo.style(this.domNode, {width:box.w + "px", height:box.h + "px"});
			if (!this.canvas) {
				this._createCanvas();
			} else {
				if (box) {
					this.canvas.resize(box.w, box.h);
				}
			}
		}, startup:function () {
		}, getShapeProps:function (data, mode) {
			var surface = data.stencilType;
			var ui = this.mode == "ui" || mode == "ui";
			return dojo.mixin({container:ui && !surface ? this.canvas.overlay.createGroup() : this.canvas.surface.createGroup(), util:this.util, keys:this.keys, mouse:this.mouse, drawing:this, drawingType:ui && !surface ? "ui" : "stencil", style:this.defaults.copy()}, data || {});
		}, addPlugin:function (plugin) {
			this.plugins.push(plugin);
			if (this.canvas.surfaceReady) {
				this.initPlugins();
			}
		}, initPlugins:function () {
			if (!this.canvas || !this.canvas.surfaceReady) {
				var c = dojo.connect(this, "onSurfaceReady", this, function () {
					dojo.disconnect(c);
					this.initPlugins();
				});
				return;
			}
			dojo.forEach(this.plugins, function (p, i) {
				var props = dojo.mixin({util:this.util, keys:this.keys, mouse:this.mouse, drawing:this, stencils:this.stencils, anchors:this.anchors, canvas:this.canvas}, p.options || {});
				this.registerTool(p.name, dojo.getObject(p.name));
				try {
					this.plugins[i] = new this.tools[p.name](props);
				}
				catch (e) {
					console.error("Failed to initilaize plugin:\t" + p.name + ". Did you require it?");
				}
			}, this);
			this.plugins = [];
			_plugsInitialized = true;
			this.mouse.setCanvas();
		}, onSurfaceReady:function () {
			this.ready = true;
			this.mouse.init(this.canvas.domNode);
			this.undo = new dojox.drawing.manager.Undo({keys:this.keys});
			this.anchors = new dojox.drawing.manager.Anchors({drawing:this, mouse:this.mouse, undo:this.undo, util:this.util});
			if (this.mode == "ui") {
				this.uiStencils = new dojox.drawing.manager.StencilUI({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, keys:this.keys});
			} else {
				this.stencils = new dojox.drawing.manager.Stencil({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, undo:this.undo, keys:this.keys, anchors:this.anchors});
				this.uiStencils = new dojox.drawing.manager.StencilUI({canvas:this.canvas, surface:this.canvas.surface, mouse:this.mouse, keys:this.keys});
			}
			if (dojox.gfx.renderer == "silverlight") {
				try {
					new dojox.drawing.plugins.drawing.Silverlight({util:this.util, mouse:this.mouse, stencils:this.stencils, anchors:this.anchors, canvas:this.canvas});
				}
				catch (e) {
					throw new Error("Attempted to install the Silverlight plugin, but it was not found.");
				}
			}
			dojo.forEach(this.plugins, function (p) {
				p.onSurfaceReady && p.onSurfaceReady();
			});
		}, addUI:function (type, options) {
			if (!this.ready) {
				var c = dojo.connect(this, "onSurfaceReady", this, function () {
					dojo.disconnect(c);
					this.addUI(type, options);
				});
				return false;
			}
			if (options && !options.data && !options.points) {
				options = {data:options};
			}
			if (!this.stencilTypes[type]) {
				if (type != "tooltip") {
					console.warn("Not registered:", type);
				}
				return null;
			}
			var s = this.uiStencils.register(new this.stencilTypes[type](this.getShapeProps(options, "ui")));
			return s;
		}, addStencil:function (type, options) {
			if (!this.ready) {
				var c = dojo.connect(this, "onSurfaceReady", this, function () {
					dojo.disconnect(c);
					this.addStencil(type, options);
				});
				return false;
			}
			if (options && !options.data && !options.points) {
				options = {data:options};
			}
			var s = this.stencils.register(new this.stencilTypes[type](this.getShapeProps(options)));
			this.currentStencil && this.currentStencil.moveToFront();
			return s;
		}, removeStencil:function (stencil) {
			this.stencils.unregister(stencil);
			stencil.destroy();
		}, removeAll:function () {
			this.stencils.removeAll();
		}, selectAll:function () {
			this.stencils.selectAll();
		}, toSelected:function (func) {
			this.stencils.toSelected.apply(this.stencils, arguments);
		}, exporter:function () {
			console.log("this.stencils", this.stencils);
			return this.stencils.exporter();
		}, importer:function (objects) {
			dojo.forEach(objects, function (m) {
				this.addStencil(m.type, m);
			}, this);
		}, changeDefaults:function (newStyle, value) {
			if (value != undefined && value) {
				for (var nm in newStyle) {
					this.defaults[nm] = newStyle[nm];
				}
			} else {
				for (var nm in newStyle) {
					for (var n in newStyle[nm]) {
						this.defaults[nm][n] = newStyle[nm][n];
					}
				}
			}
			if (this.currentStencil != undefined && (!this.currentStencil.created || this.defaults.clickMode)) {
				this.unSetTool();
				this.setTool(this.currentType);
			}
		}, onRenderStencil:function (stencil) {
			this.stencils.register(stencil);
			this.unSetTool();
			if (!this.defaults.clickMode) {
				this.setTool(this.currentType);
			} else {
				this.defaults.clickable = true;
			}
		}, onDeleteStencil:function (stencil) {
			this.stencils.unregister(stencil);
		}, registerTool:function (type) {
			if (this.tools[type]) {
				return;
			}
			var constr = dojo.getObject(type);
			this.tools[type] = constr;
			var abbr = this.util.abbr(type);
			this.stencilTypes[abbr] = constr;
			this.stencilTypeMap[abbr] = type;
		}, getConstructor:function (abbr) {
			return this.stencilTypes[abbr];
		}, setTool:function (type) {
			if (this.mode == "ui") {
				return;
			}
			if (!this.canvas || !this.canvas.surface) {
				var c = dojo.connect(this, "onSurfaceReady", this, function () {
					dojo.disconnect(c);
					this.setTool(type);
				});
				return;
			}
			if (this.currentStencil) {
				this.unSetTool();
			}
			this.currentType = this.tools[type] ? type : this.stencilTypeMap[type];
			try {
				this.currentStencil = new this.tools[this.currentType]({container:this.canvas.surface.createGroup(), util:this.util, mouse:this.mouse, keys:this.keys});
				console.log("new tool is:", this.currentStencil.id, this.currentStencil);
				if (this.defaults.clickMode) {
					this.defaults.clickable = false;
				}
				this.currentStencil.connect(this.currentStencil, "onRender", this, "onRenderStencil");
				this.currentStencil.connect(this.currentStencil, "destroy", this, "onDeleteStencil");
			}
			catch (e) {
				console.error("dojox.drawing.setTool Error:", e);
				console.error(this.currentType + " is not a constructor: ", this.tools[this.currentType]);
			}
		}, set:function (name, value) {
			console.info("Attempting to set ", name, " to: ", value, ". Set currently not fully supported in Drawing");
		}, unSetTool:function () {
			if (!this.currentStencil.created) {
				this.currentStencil.destroy();
			}
		}});
	})();
}

