/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Filter"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Filter"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Filter");
	dojo.requireLocalization("dojox.grid.enhanced", "Filter", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hr,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.require("dojox.grid.enhanced.plugins.Dialog");
	dojo.require("dojox.grid.enhanced.plugins.filter.FilterLayer");
	dojo.require("dojox.grid.enhanced.plugins.filter.FilterBar");
	dojo.require("dojox.grid.enhanced.plugins.filter.FilterDefDialog");
	dojo.require("dojox.grid.enhanced.plugins.filter.FilterStatusTip");
	dojo.require("dojox.grid.enhanced.plugins.filter.ClearFilterConfirm");
	(function () {
		var ns = dojox.grid.enhanced.plugins, fns = ns.filter;
		dojo.declare("dojox.grid.enhanced.plugins.Filter", dojox.grid.enhanced._Plugin, {name:"filter", constructor:function (grid, args) {
			this.grid = grid;
			this.nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "Filter");
			args = this.args = dojo.isObject(args) ? args : {};
			if (typeof args.ruleCount != "number" || args.ruleCount < 0) {
				args.ruleCount = 3;
			}
			this._wrapStore();
			var obj = {"plugin":this};
			this.clearFilterDialog = new dojox.grid.enhanced.plugins.Dialog({refNode:this.grid.domNode, title:this.nls["clearFilterDialogTitle"], content:new fns.ClearFilterConfirm(obj)});
			this.filterDefDialog = new fns.FilterDefDialog(obj);
			this.filterBar = new fns.FilterBar(obj);
			this.filterStatusTip = new fns.FilterStatusTip(obj);
			grid.onFilterDefined = function () {
			};
			this.connect(grid.layer("filter"), "onFilterDefined", function (filter) {
				grid.onFilterDefined(grid.getFilter(), grid.getFilterRelation());
			});
		}, destroy:function () {
			this.inherited(arguments);
			try {
				this.grid.unwrap("filter");
				this.filterBar.destroyRecursive();
				this.filterBar = null;
				this.clearFilterDialog.destroyRecursive();
				this.clearFilterDialog = null;
				this.filterStatusTip.destroy();
				this.filterStatusTip = null;
				this.filterDefDialog.destroy();
				this.filterDefDialog = null;
				this.grid = null;
				this.nls = null;
				this.args = null;
			}
			catch (e) {
				console.warn("Filter.destroy() error:", e);
			}
		}, _wrapStore:function () {
			var g = this.grid;
			var args = this.args;
			var filterLayer = args.isServerSide ? new fns.ServerSideFilterLayer(args) : new fns.ClientSideFilterLayer({cacheSize:args.filterCacheSize, fetchAll:args.fetchAllOnFirstFilter, getter:this._clientFilterGetter});
			ns.wrap(g, "_storeLayerFetch", filterLayer);
			this.connect(g, "_onDelete", dojo.hitch(filterLayer, "invalidate"));
		}, onSetStore:function (store) {
			this.filterDefDialog.clearFilter(true);
		}, _clientFilterGetter:function (datarow, cell, rowIndex) {
			return cell.get(rowIndex, datarow);
		}});
	})();
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Filter);
}

