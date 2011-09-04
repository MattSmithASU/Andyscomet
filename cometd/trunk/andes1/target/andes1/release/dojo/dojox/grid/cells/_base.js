/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.cells._base"]) {
	dojo._hasResource["dojox.grid.cells._base"] = true;
	dojo.provide("dojox.grid.cells._base");
	dojo.require("dojox.grid.util");
	dojo.require("dijit._Widget");
	dojo.declare("dojox.grid._DeferredTextWidget", dijit._Widget, {deferred:null, _destroyOnRemove:true, postCreate:function () {
		if (this.deferred) {
			this.deferred.addBoth(dojo.hitch(this, function (text) {
				if (this.domNode) {
					this.domNode.innerHTML = text;
				}
			}));
		}
	}});
	(function () {
		var focusSelectNode = function (inNode) {
			try {
				dojox.grid.util.fire(inNode, "focus");
				dojox.grid.util.fire(inNode, "select");
			}
			catch (e) {
			}
		};
		var whenIdle = function () {
			setTimeout(dojo.hitch.apply(dojo, arguments), 0);
		};
		var dgc = dojox.grid.cells;
		dojo.declare("dojox.grid.cells._Base", null, {styles:"", classes:"", editable:false, alwaysEditing:false, formatter:null, defaultValue:"...", value:null, hidden:false, noresize:false, draggable:true, _valueProp:"value", _formatPending:false, constructor:function (inProps) {
			this._props = inProps || {};
			dojo.mixin(this, inProps);
			if (this.draggable === undefined) {
				this.draggable = true;
			}
		}, _defaultFormat:function (inValue, callArgs) {
			var s = this.grid.formatterScope || this;
			var f = this.formatter;
			if (f && s && typeof f == "string") {
				f = this.formatter = s[f];
			}
			var v = (inValue != this.defaultValue && f) ? f.apply(s, callArgs) : inValue;
			if (typeof v == "undefined") {
				return this.defaultValue;
			}
			if (v && v.addBoth) {
				v = new dojox.grid._DeferredTextWidget({deferred:v}, dojo.create("span", {innerHTML:this.defaultValue}));
			}
			if (v && v.declaredClass && v.startup) {
				return "<div class='dojoxGridStubNode' linkWidget='" + v.id + "' cellIdx='" + this.index + "'>" + this.defaultValue + "</div>";
			}
			return v;
		}, format:function (inRowIndex, inItem) {
			var f, i = this.grid.edit.info, d = this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
			d = (d && d.replace && this.grid.escapeHTMLInData) ? d.replace(/&/g, "&amp;").replace(/</g, "&lt;") : d;
			if (this.editable && (this.alwaysEditing || (i.rowIndex == inRowIndex && i.cell == this))) {
				return this.formatEditing(d, inRowIndex);
			} else {
				return this._defaultFormat(d, [d, inRowIndex, this]);
			}
		}, formatEditing:function (inDatum, inRowIndex) {
		}, getNode:function (inRowIndex) {
			return this.view.getCellNode(inRowIndex, this.index);
		}, getHeaderNode:function () {
			return this.view.getHeaderCellNode(this.index);
		}, getEditNode:function (inRowIndex) {
			return (this.getNode(inRowIndex) || 0).firstChild || 0;
		}, canResize:function () {
			var uw = this.unitWidth;
			return uw && (uw !== "auto");
		}, isFlex:function () {
			var uw = this.unitWidth;
			return uw && dojo.isString(uw) && (uw == "auto" || uw.slice(-1) == "%");
		}, applyEdit:function (inValue, inRowIndex) {
			this.grid.edit.applyCellEdit(inValue, this, inRowIndex);
		}, cancelEdit:function (inRowIndex) {
			this.grid.doCancelEdit(inRowIndex);
		}, _onEditBlur:function (inRowIndex) {
			if (this.grid.edit.isEditCell(inRowIndex, this.index)) {
				this.grid.edit.apply();
			}
		}, registerOnBlur:function (inNode, inRowIndex) {
			if (this.commitOnBlur) {
				dojo.connect(inNode, "onblur", function (e) {
					setTimeout(dojo.hitch(this, "_onEditBlur", inRowIndex), 250);
				});
			}
		}, needFormatNode:function (inDatum, inRowIndex) {
			this._formatPending = true;
			whenIdle(this, "_formatNode", inDatum, inRowIndex);
		}, cancelFormatNode:function () {
			this._formatPending = false;
		}, _formatNode:function (inDatum, inRowIndex) {
			if (this._formatPending) {
				this._formatPending = false;
				dojo.setSelectable(this.grid.domNode, true);
				this.formatNode(this.getEditNode(inRowIndex), inDatum, inRowIndex);
			}
		}, formatNode:function (inNode, inDatum, inRowIndex) {
			if (dojo.isIE) {
				whenIdle(this, "focus", inRowIndex, inNode);
			} else {
				this.focus(inRowIndex, inNode);
			}
		}, dispatchEvent:function (m, e) {
			if (m in this) {
				return this[m](e);
			}
		}, getValue:function (inRowIndex) {
			return this.getEditNode(inRowIndex)[this._valueProp];
		}, setValue:function (inRowIndex, inValue) {
			var n = this.getEditNode(inRowIndex);
			if (n) {
				n[this._valueProp] = inValue;
			}
		}, focus:function (inRowIndex, inNode) {
			focusSelectNode(inNode || this.getEditNode(inRowIndex));
		}, save:function (inRowIndex) {
			this.value = this.value || this.getValue(inRowIndex);
		}, restore:function (inRowIndex) {
			this.setValue(inRowIndex, this.value);
		}, _finish:function (inRowIndex) {
			dojo.setSelectable(this.grid.domNode, false);
			this.cancelFormatNode();
		}, apply:function (inRowIndex) {
			this.applyEdit(this.getValue(inRowIndex), inRowIndex);
			this._finish(inRowIndex);
		}, cancel:function (inRowIndex) {
			this.cancelEdit(inRowIndex);
			this._finish(inRowIndex);
		}});
		dgc._Base.markupFactory = function (node, cellDef) {
			var d = dojo;
			var formatter = d.trim(d.attr(node, "formatter") || "");
			if (formatter) {
				cellDef.formatter = dojo.getObject(formatter) || formatter;
			}
			var get = d.trim(d.attr(node, "get") || "");
			if (get) {
				cellDef.get = dojo.getObject(get);
			}
			var getBoolAttr = function (attr, cell, cellAttr) {
				var value = d.trim(d.attr(node, attr) || "");
				if (value) {
					cell[cellAttr || attr] = !(value.toLowerCase() == "false");
				}
			};
			getBoolAttr("sortDesc", cellDef);
			getBoolAttr("editable", cellDef);
			getBoolAttr("alwaysEditing", cellDef);
			getBoolAttr("noresize", cellDef);
			getBoolAttr("draggable", cellDef);
			var value = d.trim(d.attr(node, "loadingText") || d.attr(node, "defaultValue") || "");
			if (value) {
				cellDef.defaultValue = value;
			}
			var getStrAttr = function (attr, cell, cellAttr) {
				var value = d.trim(d.attr(node, attr) || "") || undefined;
				if (value) {
					cell[cellAttr || attr] = value;
				}
			};
			getStrAttr("styles", cellDef);
			getStrAttr("headerStyles", cellDef);
			getStrAttr("cellStyles", cellDef);
			getStrAttr("classes", cellDef);
			getStrAttr("headerClasses", cellDef);
			getStrAttr("cellClasses", cellDef);
		};
		dojo.declare("dojox.grid.cells.Cell", dgc._Base, {constructor:function () {
			this.keyFilter = this.keyFilter;
		}, keyFilter:null, formatEditing:function (inDatum, inRowIndex) {
			this.needFormatNode(inDatum, inRowIndex);
			return "<input class=\"dojoxGridInput\" type=\"text\" value=\"" + inDatum + "\">";
		}, formatNode:function (inNode, inDatum, inRowIndex) {
			this.inherited(arguments);
			this.registerOnBlur(inNode, inRowIndex);
		}, doKey:function (e) {
			if (this.keyFilter) {
				var key = String.fromCharCode(e.charCode);
				if (key.search(this.keyFilter) == -1) {
					dojo.stopEvent(e);
				}
			}
		}, _finish:function (inRowIndex) {
			this.inherited(arguments);
			var n = this.getEditNode(inRowIndex);
			try {
				dojox.grid.util.fire(n, "blur");
			}
			catch (e) {
			}
		}});
		dgc.Cell.markupFactory = function (node, cellDef) {
			dgc._Base.markupFactory(node, cellDef);
			var d = dojo;
			var keyFilter = d.trim(d.attr(node, "keyFilter") || "");
			if (keyFilter) {
				cellDef.keyFilter = new RegExp(keyFilter);
			}
		};
		dojo.declare("dojox.grid.cells.RowIndex", dgc.Cell, {name:"Row", postscript:function () {
			this.editable = false;
		}, get:function (inRowIndex) {
			return inRowIndex + 1;
		}});
		dgc.RowIndex.markupFactory = function (node, cellDef) {
			dgc.Cell.markupFactory(node, cellDef);
		};
		dojo.declare("dojox.grid.cells.Select", dgc.Cell, {options:null, values:null, returnIndex:-1, constructor:function (inCell) {
			this.values = this.values || this.options;
		}, formatEditing:function (inDatum, inRowIndex) {
			this.needFormatNode(inDatum, inRowIndex);
			var h = ["<select class=\"dojoxGridSelect\">"];
			for (var i = 0, o, v; ((o = this.options[i]) !== undefined) && ((v = this.values[i]) !== undefined); i++) {
				h.push("<option", (inDatum == v ? " selected" : ""), " value=\"" + v + "\"", ">", o, "</option>");
			}
			h.push("</select>");
			return h.join("");
		}, getValue:function (inRowIndex) {
			var n = this.getEditNode(inRowIndex);
			if (n) {
				var i = n.selectedIndex, o = n.options[i];
				return this.returnIndex > -1 ? i : o.value || o.innerHTML;
			}
		}});
		dgc.Select.markupFactory = function (node, cell) {
			dgc.Cell.markupFactory(node, cell);
			var d = dojo;
			var options = d.trim(d.attr(node, "options") || "");
			if (options) {
				var o = options.split(",");
				if (o[0] != options) {
					cell.options = o;
				}
			}
			var values = d.trim(d.attr(node, "values") || "");
			if (values) {
				var v = values.split(",");
				if (v[0] != values) {
					cell.values = v;
				}
			}
		};
		dojo.declare("dojox.grid.cells.AlwaysEdit", dgc.Cell, {alwaysEditing:true, _formatNode:function (inDatum, inRowIndex) {
			this.formatNode(this.getEditNode(inRowIndex), inDatum, inRowIndex);
		}, applyStaticValue:function (inRowIndex) {
			var e = this.grid.edit;
			e.applyCellEdit(this.getValue(inRowIndex), this, inRowIndex);
			e.start(this, inRowIndex, true);
		}});
		dgc.AlwaysEdit.markupFactory = function (node, cell) {
			dgc.Cell.markupFactory(node, cell);
		};
		dojo.declare("dojox.grid.cells.Bool", dgc.AlwaysEdit, {_valueProp:"checked", formatEditing:function (inDatum, inRowIndex) {
			return "<input class=\"dojoxGridInput\" type=\"checkbox\"" + (inDatum ? " checked=\"checked\"" : "") + " style=\"width: auto\" />";
		}, doclick:function (e) {
			if (e.target.tagName == "INPUT") {
				this.applyStaticValue(e.rowIndex);
			}
		}});
		dgc.Bool.markupFactory = function (node, cell) {
			dgc.AlwaysEdit.markupFactory(node, cell);
		};
	})();
}

