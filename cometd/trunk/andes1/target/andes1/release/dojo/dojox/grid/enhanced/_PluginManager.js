/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced._PluginManager"]) {
	dojo._hasResource["dojox.grid.enhanced._PluginManager"] = true;
	dojo.provide("dojox.grid.enhanced._PluginManager");
	dojo.require("dojox.grid.enhanced._Events");
	dojo.require("dojox.grid.enhanced._FocusManager");
	dojo.declare("dojox.grid.enhanced._PluginManager", null, {_options:null, _plugins:null, _connects:null, constructor:function (inGrid) {
		this.grid = inGrid;
		this._store = inGrid.store;
		this._options = {};
		this._plugins = [];
		this._connects = [];
		this._parseProps(this.grid.plugins);
		inGrid.connect(inGrid, "_setStore", dojo.hitch(this, function (store) {
			if (this._store !== store) {
				this.forEach("onSetStore", [store, this._store]);
				this._store = store;
			}
		}));
	}, startup:function () {
		this.forEach("onStartUp");
	}, preInit:function () {
		this.grid.focus.destroy();
		this.grid.focus = new dojox.grid.enhanced._FocusManager(this.grid);
		new dojox.grid.enhanced._Events(this.grid);
		this._init(true);
		this.forEach("onPreInit");
	}, postInit:function () {
		this._init(false);
		dojo.forEach(this.grid.views.views, this._initView, this);
		this._connects.push(dojo.connect(this.grid.views, "addView", dojo.hitch(this, this._initView)));
		if (this._plugins.length > 0) {
			var edit = this.grid.edit;
			if (edit) {
				edit.styleRow = function (inRow) {
				};
			}
		}
		this.forEach("onPostInit");
	}, forEach:function (func, args) {
		dojo.forEach(this._plugins, function (p) {
			if (!p || !p[func]) {
				return;
			}
			p[func].apply(p, args ? args : []);
		});
	}, _parseProps:function (plugins) {
		if (!plugins) {
			return;
		}
		var p, loading = {}, options = this._options, grid = this.grid;
		var registry = dojox.grid.enhanced._PluginManager.registry;
		for (p in plugins) {
			if (plugins[p]) {
				this._normalize(p, plugins, registry, loading);
			}
		}
		if (options.dnd || options.indirectSelection) {
			options.columnReordering = false;
		}
		dojo.mixin(grid, options);
	}, _normalize:function (p, plugins, registry, loading) {
		if (!registry[p]) {
			throw new Error("Plugin " + p + " is required.");
		}
		if (loading[p]) {
			throw new Error("Recursive cycle dependency is not supported.");
		}
		var options = this._options;
		if (options[p]) {
			return options[p];
		}
		loading[p] = true;
		options[p] = dojo.mixin({}, registry[p], dojo.isObject(plugins[p]) ? plugins[p] : {});
		var dependencies = options[p]["dependency"];
		if (dependencies) {
			if (!dojo.isArray(dependencies)) {
				dependencies = options[p]["dependency"] = [dependencies];
			}
			dojo.forEach(dependencies, function (dependency) {
				if (!this._normalize(dependency, plugins, registry, loading)) {
					throw new Error("Plugin " + dependency + " is required.");
				}
			}, this);
		}
		delete loading[p];
		return options[p];
	}, _init:function (pre) {
		var p, preInit, options = this._options;
		for (p in options) {
			preInit = options[p]["preInit"];
			if ((pre ? preInit : !preInit) && options[p]["class"] && !this.pluginExisted(p)) {
				this.loadPlugin(p);
			}
		}
	}, loadPlugin:function (name) {
		var option = this._options[name];
		if (!option) {
			return null;
		}
		var plugin = this.getPlugin(name);
		if (plugin) {
			return plugin;
		}
		var dependencies = option["dependency"];
		dojo.forEach(dependencies, function (dependency) {
			if (!this.loadPlugin(dependency)) {
				throw new Error("Plugin " + dependency + " is required.");
			}
		}, this);
		var cls = option["class"];
		delete option["class"];
		plugin = new this.getPluginClazz(cls)(this.grid, option);
		this._plugins.push(plugin);
		return plugin;
	}, _initView:function (view) {
		if (!view) {
			return;
		}
		dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", ["mouseup", "mousemove"]);
		dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", ["mouseup"]);
	}, pluginExisted:function (name) {
		return !!this.getPlugin(name);
	}, getPlugin:function (name) {
		var plugins = this._plugins;
		name = name.toLowerCase();
		for (var i = 0, len = plugins.length; i < len; i++) {
			if (name == plugins[i]["name"].toLowerCase()) {
				return plugins[i];
			}
		}
		return null;
	}, getPluginClazz:function (clazz) {
		if (dojo.isFunction(clazz)) {
			return clazz;
		}
		var errorMsg = "Please make sure Plugin \"" + clazz + "\" is existed.";
		try {
			var cls = dojo.getObject(clazz);
			if (!cls) {
				throw new Error(errorMsg);
			}
			return cls;
		}
		catch (e) {
			throw new Error(errorMsg);
		}
	}, isFixedCell:function (cell) {
		return cell && (cell.isRowSelector || cell.fixedPos);
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		this.forEach("destroy");
		if (this.grid.unwrap) {
			this.grid.unwrap();
		}
		delete this._connects;
		delete this._plugins;
		delete this._options;
	}});
	dojox.grid.enhanced._PluginManager.registerPlugin = function (clazz, props) {
		if (!clazz) {
			console.warn("Failed to register plugin, class missed!");
			return;
		}
		var cls = dojox.grid.enhanced._PluginManager;
		cls.registry = cls.registry || {};
		cls.registry[clazz.prototype.name] = dojo.mixin({"class":clazz}, (props ? props : {}));
	};
}

