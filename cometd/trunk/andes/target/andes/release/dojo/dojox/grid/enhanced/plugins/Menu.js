/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Menu"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Menu"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Menu");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.declare("dojox.grid.enhanced.plugins.Menu", dojox.grid.enhanced._Plugin, {name:"menus", types:["headerMenu", "rowMenu", "cellMenu", "selectedRegionMenu"], constructor:function () {
		var g = this.grid;
		g.showMenu = dojo.hitch(g, this.showMenu);
		g._setRowMenuAttr = dojo.hitch(this, "_setRowMenuAttr");
		g._setCellMenuAttr = dojo.hitch(this, "_setCellMenuAttr");
		g._setSelectedRegionMenuAttr = dojo.hitch(this, "_setSelectedRegionMenuAttr");
	}, onStartUp:function () {
		var type, option = this.option;
		for (type in option) {
			if (dojo.indexOf(this.types, type) >= 0 && option[type]) {
				this._initMenu(type, option[type]);
			}
		}
	}, _initMenu:function (menuType, menu) {
		var g = this.grid;
		if (!g[menuType]) {
			var m = this._getMenuWidget(menu);
			if (!m) {
				return;
			}
			g.set(menuType, m);
			if (menuType != "headerMenu") {
				m._scheduleOpen = function () {
					return;
				};
			}
		}
	}, _getMenuWidget:function (menu) {
		return (menu instanceof dijit.Menu) ? menu : dijit.byId(menu);
	}, _setRowMenuAttr:function (menu) {
		this._setMenuAttr(menu, "rowMenu");
	}, _setCellMenuAttr:function (menu) {
		this._setMenuAttr(menu, "cellMenu");
	}, _setSelectedRegionMenuAttr:function (menu) {
		this._setMenuAttr(menu, "selectedRegionMenu");
	}, _setMenuAttr:function (menu, menuType) {
		var g = this.grid, n = g.domNode;
		if (!menu || !(menu instanceof dijit.Menu)) {
			console.warn(menuType, " of Grid ", g.id, " is not existed!");
			return;
		}
		if (g[menuType]) {
			g[menuType].unBindDomNode(n);
		}
		g[menuType] = menu;
		g[menuType].bindDomNode(n);
	}, showMenu:function (e) {
		var inSelectedRegion = (e.cellNode && dojo.hasClass(e.cellNode, "dojoxGridRowSelected") || e.rowNode && (dojo.hasClass(e.rowNode, "dojoxGridRowSelected") || dojo.hasClass(e.rowNode, "dojoxGridRowbarSelected")));
		if (inSelectedRegion && this.selectedRegionMenu) {
			this.onSelectedRegionContextMenu(e);
			return;
		}
		var info = {target:e.target, coords:e.keyCode !== dojo.keys.F10 && "pageX" in e ? {x:e.pageX, y:e.pageY} : null};
		if (this.rowMenu && (!this.cellMenu || this.selection.isSelected(e.rowIndex) || e.rowNode && dojo.hasClass(e.rowNode, "dojoxGridRowbar"))) {
			this.rowMenu._openMyself(info);
			dojo.stopEvent(e);
			return;
		}
		if (this.cellMenu) {
			this.cellMenu._openMyself(info);
		}
		dojo.stopEvent(e);
	}, destroy:function () {
		var g = this.grid;
		if (g.headerMenu) {
			g.headerMenu.unBindDomNode(g.viewsHeaderNode);
		}
		if (g.rowMenu) {
			g.rowMenu.unBindDomNode(g.domNode);
		}
		if (g.cellMenu) {
			g.cellMenu.unBindDomNode(g.domNode);
		}
		if (g.selectedRegionMenu) {
			g.selectedRegionMenu.destroy();
		}
		this.inherited(arguments);
	}});
	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Menu);
}

