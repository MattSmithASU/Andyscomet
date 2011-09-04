/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.EnhancedGrid"]) {
	dojo._hasResource["dojox.grid.EnhancedGrid"] = true;
	dojo.provide("dojox.grid.EnhancedGrid");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.grid.enhanced._PluginManager");
	dojo.requireLocalization("dojox.grid.enhanced", "EnhancedGrid", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hr,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.experimental("dojox.grid.EnhancedGrid");
	dojo.declare("dojox.grid.EnhancedGrid", dojox.grid.DataGrid, {plugins:null, pluginMgr:null, keepSelection:false, _pluginMgrClass:dojox.grid.enhanced._PluginManager, postMixInProperties:function () {
		this._nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "EnhancedGrid", this.lang);
		this.inherited(arguments);
	}, postCreate:function () {
		this.pluginMgr = new this._pluginMgrClass(this);
		this.pluginMgr.preInit();
		this.inherited(arguments);
		this.pluginMgr.postInit();
	}, plugin:function (name) {
		return this.pluginMgr.getPlugin(name);
	}, startup:function () {
		this.inherited(arguments);
		this.pluginMgr.startup();
	}, createSelection:function () {
		this.selection = new dojox.grid.enhanced.DataSelection(this);
	}, canSort:function (colIndex, field) {
		return true;
	}, doKeyEvent:function (e) {
		try {
			var view = this.focus.focusView;
			view.content.decorateEvent(e);
			if (!e.cell) {
				view.header.decorateEvent(e);
			}
		}
		catch (e) {
		}
		this.inherited(arguments);
	}, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
		if (!inAttrName) {
			this.invalidated[inRowIndex] = true;
			return;
		}
		this.inherited(arguments);
	}, mixin:function (target, source) {
		var props = {};
		for (var p in source) {
			if (p == "_inherited" || p == "declaredClass" || p == "constructor" || source["privates"] && source["privates"][p]) {
				continue;
			}
			props[p] = source[p];
		}
		dojo.mixin(target, props);
	}, _copyAttr:function (idx, attr) {
		if (!attr) {
			return;
		}
		return this.inherited(arguments);
	}, _getHeaderHeight:function () {
		this.inherited(arguments);
		return dojo.marginBox(this.viewsHeaderNode).h;
	}, _fetch:function (start, isRender) {
		if (this.items) {
			return this.inherited(arguments);
		}
		start = start || 0;
		if (this.store && !this._pending_requests[start]) {
			if (!this._isLoaded && !this._isLoading) {
				this._isLoading = true;
				this.showMessage(this.loadingMessage);
			}
			this._pending_requests[start] = true;
			try {
				var req = {start:start, count:this.rowsPerPage, query:this.query, sort:this.getSortProps(), queryOptions:this.queryOptions, isRender:isRender, onBegin:dojo.hitch(this, "_onFetchBegin"), onComplete:dojo.hitch(this, "_onFetchComplete"), onError:dojo.hitch(this, "_onFetchError")};
				this._storeLayerFetch(req);
			}
			catch (e) {
				this._onFetchError(e, {start:start, count:this.rowsPerPage});
			}
		}
		return 0;
	}, _storeLayerFetch:function (req) {
		this.store.fetch(req);
	}, getCellByField:function (field) {
		return dojo.filter(this.layout.cells, function (cell) {
			return cell.field == field;
		})[0];
	}, onMouseUp:function (e) {
	}, createView:function () {
		var view = this.inherited(arguments);
		if (dojo.isMoz) {
			var ascendDom = function (inNode, inWhile) {
				for (var n = inNode; n && inWhile(n); n = n.parentNode) {
				}
				return n;
			};
			var makeNotTagName = function (inTagName) {
				var name = inTagName.toUpperCase();
				return function (node) {
					return node.tagName != name;
				};
			};
			var func = view.header.getCellX;
			view.header.getCellX = function (e) {
				var x = func.call(view.header, e);
				var n = ascendDom(e.target, makeNotTagName("th"));
				if (n && n !== e.target && dojo.isDescendant(e.target, n)) {
					x += n.firstChild.offsetLeft;
				}
				return x;
			};
		}
		return view;
	}, destroy:function () {
		delete this._nls;
		this.selection.destroy();
		this.pluginMgr.destroy();
		this.inherited(arguments);
	}});
	dojo.provide("dojox.grid.enhanced.DataSelection");
	dojo.require("dojox.grid.enhanced.plugins._SelectionPreserver");
	dojo.declare("dojox.grid.enhanced.DataSelection", dojox.grid.DataSelection, {constructor:function (grid) {
		if (grid.keepSelection) {
			this.preserver = new dojox.grid.enhanced.plugins._SelectionPreserver(this);
		}
	}, _range:function (inFrom, inTo) {
		this.grid._selectingRange = true;
		this.inherited(arguments);
		this.grid._selectingRange = false;
		this.onChanged();
	}, deselectAll:function (inItemOrIndex) {
		this.grid._selectingRange = true;
		this.inherited(arguments);
		this.grid._selectingRange = false;
		this.onChanged();
	}, destroy:function () {
		if (this.preserver) {
			this.preserver.destroy();
		}
	}});
	dojox.grid.EnhancedGrid.markupFactory = function (props, node, ctor, cellFunc) {
		return dojox.grid._Grid.markupFactory(props, node, ctor, dojo.partial(dojox.grid.DataGrid.cell_markupFactory, cellFunc));
	};
	dojox.grid.EnhancedGrid.registerPlugin = function (clazz, props) {
		dojox.grid.enhanced._PluginManager.registerPlugin(clazz, props);
	};
}

