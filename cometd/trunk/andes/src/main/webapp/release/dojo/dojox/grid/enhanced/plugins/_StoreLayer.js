/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins._StoreLayer"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins._StoreLayer"] = true;
	dojo.provide("dojox.grid.enhanced.plugins._StoreLayer");
	(function () {
		var ns = dojox.grid.enhanced.plugins, getPrevTags = function (tags) {
			var tagList = ["reorder", "sizeChange", "normal", "presentation"];
			var idx = tagList.length;
			for (var i = tags.length - 1; i >= 0; --i) {
				var p = dojo.indexOf(tagList, tags[i]);
				if (p >= 0 && p <= idx) {
					idx = p;
				}
			}
			if (idx < tagList.length - 1) {
				return tagList.slice(0, idx + 1);
			} else {
				return tagList;
			}
		}, unwrap = function (layerName) {
			var i, layers = this._layers, len = layers.length;
			if (layerName) {
				for (i = len - 1; i >= 0; --i) {
					if (layers[i].name() == layerName) {
						layers[i]._unwrap(layers[i + 1]);
						break;
					}
				}
				layers.splice(i, 1);
			} else {
				for (i = len - 1; i >= 0; --i) {
					layers[i]._unwrap();
				}
			}
			if (!layers.length) {
				delete this._layers;
				delete this.layer;
				delete this.unwrap;
				delete this.forEachLayer;
			}
			return this;
		}, getLayer = function (layerName) {
			var i, layers = this._layers;
			if (typeof layerName == "undefined") {
				return layers.length;
			}
			if (typeof layerName == "number") {
				return layers[layerName];
			}
			for (i = layers.length - 1; i >= 0; --i) {
				if (layers[i].name() == layerName) {
					return layers[i];
				}
			}
			return null;
		}, forEachLayer = function (callback, isInnerToOuter) {
			var len = this._layers.length, start, end, dir;
			if (isInnerToOuter) {
				start = 0;
				end = len;
				dir = 1;
			} else {
				start = len - 1;
				end = -1;
				dir = -1;
			}
			for (var i = start; i != end; i += dir) {
				if (callback(this._layers[i], i) === false) {
					return i;
				}
			}
			return end;
		};
		ns.wrap = function (store, funcName, layer, layerFuncName) {
			if (!store._layers) {
				store._layers = [];
				store.layer = dojo.hitch(store, getLayer);
				store.unwrap = dojo.hitch(store, unwrap);
				store.forEachLayer = dojo.hitch(store, forEachLayer);
			}
			var prevTags = getPrevTags(layer.tags);
			if (!dojo.some(store._layers, function (lyr, i) {
				if (dojo.some(lyr.tags, function (tag) {
					return dojo.indexOf(prevTags, tag) >= 0;
				})) {
					return false;
				} else {
					store._layers.splice(i, 0, layer);
					layer._wrap(store, funcName, layerFuncName, lyr);
					return true;
				}
			})) {
				store._layers.push(layer);
				layer._wrap(store, funcName, layerFuncName);
			}
			return store;
		};
		dojo.declare("dojox.grid.enhanced.plugins._StoreLayer", null, {tags:["normal"], layerFuncName:"_fetch", constructor:function () {
			this._store = null;
			this._originFetch = null;
			this.__enabled = true;
		}, initialize:function (store) {
		}, uninitialize:function (store) {
		}, invalidate:function () {
		}, _wrap:function (store, funcName, layerFuncName, nextLayer) {
			this._store = store;
			this._funcName = funcName;
			var fetchFunc = dojo.hitch(this, function () {
				return (this.enabled() ? this[layerFuncName || this.layerFuncName] : this.originFetch).apply(this, arguments);
			});
			if (nextLayer) {
				this._originFetch = nextLayer._originFetch;
				nextLayer._originFetch = fetchFunc;
			} else {
				this._originFetch = store[funcName] || function () {
				};
				store[funcName] = fetchFunc;
			}
			this.initialize(store);
		}, _unwrap:function (nextLayer) {
			this.uninitialize(this._store);
			if (nextLayer) {
				nextLayer._originFetch = this._originFetch;
			} else {
				this._store[this._funcName] = this._originFetch;
			}
			this._originFetch = null;
			this._store = null;
		}, enabled:function (toEnable) {
			if (typeof toEnable != "undefined") {
				this.__enabled = !!toEnable;
			}
			return this.__enabled;
		}, name:function () {
			if (!this.__name) {
				var m = this.declaredClass.match(/(?:\.(?:_*)([^\.]+)Layer$)|(?:\.([^\.]+)$)/i);
				this.__name = m ? (m[1] || m[2]).toLowerCase() : this.declaredClass;
			}
			return this.__name;
		}, originFetch:function () {
			return (dojo.hitch(this._store, this._originFetch)).apply(this, arguments);
		}});
		dojo.declare("dojox.grid.enhanced.plugins._ServerSideLayer", ns._StoreLayer, {constructor:function (args) {
			args = args || {};
			this._url = args.url || "";
			this._isStateful = !!args.isStateful;
			this._onUserCommandLoad = args.onCommandLoad || function () {
			};
			this.__cmds = {cmdlayer:this.name(), enable:true};
			this.useCommands(this._isStateful);
		}, enabled:function (toEnable) {
			var res = this.inherited(arguments);
			this.__cmds.enable = this.__enabled;
			return res;
		}, useCommands:function (toUse) {
			if (typeof toUse != "undefined") {
				this.__cmds.cmdlayer = (toUse && this._isStateful) ? this.name() : null;
			}
			return !!(this.__cmds.cmdlayer);
		}, _fetch:function (userRequest) {
			if (this.__cmds.cmdlayer) {
				dojo.xhrPost({url:this._url || this._store.url, content:this.__cmds, load:dojo.hitch(this, function (responce) {
					this.onCommandLoad(responce, userRequest);
					this.originFetch(userRequest);
				}), error:dojo.hitch(this, this.onCommandError)});
			} else {
				this.onCommandLoad("", userRequest);
				this.originFetch(userRequest);
			}
			return userRequest;
		}, command:function (cmdName, cmdContent) {
			var cmds = this.__cmds;
			if (cmdContent === null) {
				delete cmds[cmdName];
			} else {
				if (typeof cmdContent !== "undefined") {
					cmds[cmdName] = cmdContent;
				}
			}
			return cmds[cmdName];
		}, onCommandLoad:function (response, userRequest) {
			this._onUserCommandLoad(this.__cmds, userRequest, response);
		}, onCommandError:function (error) {
			console.log(error);
			throw error;
		}});
	})();
}

