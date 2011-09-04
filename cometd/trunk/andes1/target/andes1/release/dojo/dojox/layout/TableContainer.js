/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.layout.TableContainer"]) {
	dojo._hasResource["dojox.layout.TableContainer"] = true;
	dojo.experimental("dojox.layout.TableContainer");
	dojo.provide("dojox.layout.TableContainer");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.declare("dojox.layout.TableContainer", dijit.layout._LayoutWidget, {cols:1, labelWidth:"100", showLabels:true, orientation:"horiz", spacing:1, customClass:"", postCreate:function () {
		this.inherited(arguments);
		this._children = [];
		this.connect(this, "set", function (name, value) {
			if (value && (name == "orientation" || name == "customClass" || name == "cols")) {
				this.layout();
			}
		});
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		if (this._initialized) {
			return;
		}
		var children = this.getChildren();
		if (children.length < 1) {
			return;
		}
		this._initialized = true;
		dojo.addClass(this.domNode, "dijitTableLayout");
		dojo.forEach(children, function (child) {
			if (!child.started && !child._started) {
				child.startup();
			}
		});
		this.resize();
		this.layout();
	}, resize:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (typeof child.resize == "function") {
				child.resize();
			}
		});
	}, layout:function () {
		if (!this._initialized) {
			return;
		}
		var children = this.getChildren();
		var childIds = {};
		var _this = this;
		function addCustomClass(node, type, count) {
			if (_this.customClass != "") {
				var clazz = _this.customClass + "-" + (type || node.tagName.toLowerCase());
				dojo.addClass(node, clazz);
				if (arguments.length > 2) {
					dojo.addClass(node, clazz + "-" + count);
				}
			}
		}
		dojo.forEach(this._children, dojo.hitch(this, function (child) {
			childIds[child.id] = child;
		}));
		dojo.forEach(children, dojo.hitch(this, function (child, index) {
			if (!childIds[child.id]) {
				this._children.push(child);
			}
		}));
		var table = dojo.create("table", {"width":"100%", "class":"tableContainer-table tableContainer-table-" + this.orientation, "cellspacing":this.spacing}, this.domNode);
		var tbody = dojo.create("tbody");
		table.appendChild(tbody);
		addCustomClass(table, "table", this.orientation);
		var width = Math.floor(100 / this.cols) + "%";
		var labelRow = dojo.create("tr", {}, tbody);
		var childRow = (!this.showLabels || this.orientation == "horiz") ? labelRow : dojo.create("tr", {}, tbody);
		var maxCols = this.cols * (this.showLabels ? 2 : 1);
		var numCols = 0;
		dojo.forEach(this._children, dojo.hitch(this, function (child, index) {
			var colspan = child.colspan || 1;
			if (colspan > 1) {
				colspan = this.showLabels ? Math.min(maxCols - 1, colspan * 2 - 1) : Math.min(maxCols, colspan);
			}
			if (numCols + colspan - 1 + (this.showLabels ? 1 : 0) >= maxCols) {
				numCols = 0;
				labelRow = dojo.create("tr", {}, tbody);
				childRow = this.orientation == "horiz" ? labelRow : dojo.create("tr", {}, tbody);
			}
			var labelCell;
			if (this.showLabels) {
				labelCell = dojo.create("td", {"class":"tableContainer-labelCell"}, labelRow);
				if (child.spanLabel) {
					dojo.attr(labelCell, this.orientation == "vert" ? "rowspan" : "colspan", 2);
				} else {
					addCustomClass(labelCell, "labelCell");
					var labelProps = {"for":child.get("id")};
					var label = dojo.create("label", labelProps, labelCell);
					if (Number(this.labelWidth) > -1 || String(this.labelWidth).indexOf("%") > -1) {
						dojo.style(labelCell, "width", String(this.labelWidth).indexOf("%") < 0 ? this.labelWidth + "px" : this.labelWidth);
					}
					label.innerHTML = child.get("label") || child.get("title");
				}
			}
			var childCell;
			if (child.spanLabel && labelCell) {
				childCell = labelCell;
			} else {
				childCell = dojo.create("td", {"class":"tableContainer-valueCell"}, childRow);
			}
			if (colspan > 1) {
				dojo.attr(childCell, "colspan", colspan);
			}
			addCustomClass(childCell, "valueCell", index);
			childCell.appendChild(child.domNode);
			numCols += colspan + (this.showLabels ? 1 : 0);
		}));
		if (this.table) {
			this.table.parentNode.removeChild(this.table);
		}
		dojo.forEach(children, function (child) {
			if (typeof child.layout == "function") {
				child.layout();
			}
		});
		this.table = table;
		this.resize();
	}, destroyDescendants:function (preserveDom) {
		dojo.forEach(this._children, function (child) {
			child.destroyRecursive(preserveDom);
		});
	}, _setSpacingAttr:function (value) {
		this.spacing = value;
		if (this.table) {
			this.table.cellspacing = Number(value);
		}
	}});
	dojo.extend(dijit._Widget, {label:"", title:"", spanLabel:false, colspan:1});
}

