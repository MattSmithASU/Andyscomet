/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.ResizeTableColumn"]) {
	dojo._hasResource["dojox.editor.plugins.ResizeTableColumn"] = true;
	dojo.provide("dojox.editor.plugins.ResizeTableColumn");
	dojo.require("dojox.editor.plugins.TablePlugins");
	dojo.declare("dojox.editor.plugins.ResizeTableColumn", dojox.editor.plugins.TablePlugins, {constructor:function () {
		this.isLtr = this.dir ? (this.dir == "ltr") : dojo._isBodyLtr();
		this.ruleDiv = dojo.create("div", {style:"top: -10000px; z-index: 10001"}, dojo.body(), "last");
	}, setEditor:function (editor) {
		var ruleDiv = this.ruleDiv;
		this.editor = editor;
		this.editor.customUndo = true;
		this.onEditorLoaded();
		editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			this.connect(this.editor.editNode, "onmousemove", function (evt) {
				var editorCoords = dojo.coords(editor.iframe, true), ex = editorCoords.x, cx = evt.clientX;
				if (!this.isDragging) {
					var obj = evt.target;
					if (obj.tagName && obj.tagName.toLowerCase() == "td") {
						var objCoords = dojo.coords(obj), ox = objCoords.x, ow = objCoords.w, pos = ex + objCoords.x - 2;
						if (this.isLtr) {
							ruleDiv.headerColumn = true;
							if (!isBoundary(obj, "first") || cx > ox + ow / 2) {
								pos += ow;
								ruleDiv.headerColumn = false;
							}
						} else {
							ruleDiv.headerColumn = false;
							if (isBoundary(obj, "first") && cx > ox + ow / 2) {
								pos += ow;
								ruleDiv.headerColumn = true;
							}
						}
						dojo.style(ruleDiv, {position:"absolute", cursor:"col-resize", display:"block", width:"4px", backgroundColor:"transparent", top:editorCoords.y + objCoords.y + "px", left:pos + "px", height:objCoords.h + "px"});
						this.activeCell = obj;
					} else {
						dojo.style(ruleDiv, {display:"none", top:"-10000px"});
					}
				} else {
					var activeCell = this.activeCell, activeCoords = dojo.coords(activeCell), ax = activeCoords.x, aw = activeCoords.w, sibling = nextSibling(activeCell), siblingCoords, sx, sw, containerCoords = dojo.coords(getTable(activeCell).parentNode), ctx = containerCoords.x, ctw = containerCoords.w;
					if (sibling) {
						siblingCoords = dojo.coords(sibling);
						sx = siblingCoords.x;
						sw = siblingCoords.w;
					}
					if (this.isLtr && ((ruleDiv.headerColumn && sibling && ctx < cx && cx < ax + aw) || ((!sibling && ax < cx && cx < ctx + ctw) || (sibling && ax < cx && cx < sx + sw))) || !this.isLtr && ((ruleDiv.headerColumn && sibling && ctx > cx && cx > ax) || ((!sibling && ax + aw > cx && cx > ctx) || (sibling && ax + aw > cx && cx > sx)))) {
						dojo.style(ruleDiv, {left:ex + cx + "px"});
					}
				}
			});
			this.connect(ruleDiv, "onmousedown", function (evt) {
				var editorCoords = dojo.coords(editor.iframe, true), tableCoords = dojo.coords(getTable(this.activeCell));
				this.isDragging = true;
				dojo.style(editor.editNode, {cursor:"col-resize"});
				dojo.style(ruleDiv, {width:"1px", left:evt.clientX + "px", top:editorCoords.y + tableCoords.y + "px", height:tableCoords.h + "px", backgroundColor:"#777"});
			});
			this.connect(ruleDiv, "onmouseup", function (evt) {
				var activeCell = this.activeCell, activeCoords = dojo.coords(activeCell), aw = activeCoords.w, ax = activeCoords.x, sibling = nextSibling(activeCell), siblingCoords, sx, sw, editorCoords = dojo.coords(editor.iframe), ex = editorCoords.x, table = getTable(activeCell), tableCoords = dojo.coords(table), cs = table.getAttribute("cellspacing"), cx = evt.clientX, headerCell = getHeaderCell(activeCell), headerSibling, newWidth, newSiblingWidth;
				if (!cs || (cs = parseInt(cs, 10)) < 0) {
					cs = 2;
				}
				if (sibling) {
					siblingCoords = dojo.coords(sibling);
					sx = siblingCoords.x;
					sw = siblingCoords.w;
					headerSibling = getHeaderCell(sibling);
				}
				if (this.isLtr) {
					if (ruleDiv.headerColumn) {
						newWidth = ex + ax + aw - cx;
					} else {
						newWidth = cx - ex - ax;
						if (sibling) {
							newSiblingWidth = ex + sx + sw - cx - cs;
						}
					}
				} else {
					if (ruleDiv.headerColumn) {
						newWidth = cx - ex - ax;
					} else {
						newWidth = ex + ax + aw - cx;
						if (sibling) {
							newSiblingWidth = cx - ex - sx - cs;
						}
					}
				}
				this.isDragging = false;
				marginBox(headerCell, newWidth);
				if (sibling) {
					if (!ruleDiv.headerColumn) {
						marginBox(headerSibling, newSiblingWidth);
					}
				}
				if (ruleDiv.headerColumn && isBoundary(activeCell, "first") || isBoundary(activeCell, "last")) {
					dojo.marginBox(table, {w:tableCoords.w + newWidth - aw});
				}
				marginBox(headerCell, dojo.coords(activeCell).w);
				if (sibling) {
					marginBox(headerSibling, dojo.coords(sibling).w);
				}
				dojo.style(editor.editNode, {cursor:"auto"});
				dojo.style(ruleDiv, {display:"none", top:"-10000px"});
				this.activeCell = null;
			});
		}));
		function isBoundary(n, b) {
			var nodes = dojo.withGlobal(editor.window, "query", dojo, ["> td", n.parentNode]);
			switch (b) {
			  case "first":
				return nodes[0] == n;
			  case "last":
				return nodes[nodes.length - 1] == n;
			  default:
				return false;
			}
		}
		function nextSibling(node) {
			node = node.nextSibling;
			while (node) {
				if (node.tagName && node.tagName.toLowerCase() == "td") {
					break;
				}
				node = node.nextSibling;
			}
			return node;
		}
		function getTable(t) {
			while ((t = t.parentNode) && t.tagName.toLowerCase() != "table") {
			}
			return t;
		}
		function getHeaderCell(t) {
			var tds = dojo.withGlobal(editor.window, "query", dojo, ["td", getTable(t)]), len = tds.length;
			for (var i = 0; i < len; i++) {
				if (dojo.coords(tds[i]).x == dojo.coords(t).x) {
					return tds[i];
				}
			}
			return null;
		}
		function marginBox(node, width) {
			if (dojo.isIE) {
				var s = node.currentStyle, bl = px(node, s.borderLeftWidth), br = px(node, s.borderRightWidth), pl = px(node, s.paddingLeft), pr = px(node, s.paddingRight);
				node.style.width = width - bl - br - pl - pr;
			} else {
				dojo.marginBox(node, {w:width});
			}
			function px(element, avalue) {
				if (!avalue) {
					return 0;
				}
				if (avalue == "medium") {
					return 1;
				}
				if (avalue.slice && avalue.slice(-2) == "px") {
					return parseFloat(avalue);
				}
				with (element) {
					var sLeft = style.left;
					var rsLeft = runtimeStyle.left;
					runtimeStyle.left = currentStyle.left;
					try {
						style.left = avalue;
						avalue = style.pixelLeft;
					}
					catch (e) {
						avalue = 0;
					}
					style.left = sLeft;
					runtimeStyle.left = rsLeft;
				}
				return avalue;
			}
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		if (o.args && o.args.command) {
			var cmd = o.args.command.charAt(0).toLowerCase() + o.args.command.substring(1, o.args.command.length);
			if (cmd == "resizeTableColumn") {
				o.plugin = new dojox.editor.plugins.ResizeTableColumn({commandName:cmd});
			}
		}
	});
}

