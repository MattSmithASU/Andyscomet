/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.selection"]) {
	dojo._hasResource["dijit._editor.selection"] = true;
	dojo.provide("dijit._editor.selection");
	dojo.getObject("_editor.selection", true, dijit);
	dojo.mixin(dijit._editor.selection, {getType:function () {
		if (dojo.isIE < 9) {
			return dojo.doc.selection.type.toLowerCase();
		} else {
			var stype = "text";
			var oSel;
			try {
				oSel = dojo.global.getSelection();
			}
			catch (e) {
			}
			if (oSel && oSel.rangeCount == 1) {
				var oRange = oSel.getRangeAt(0);
				if ((oRange.startContainer == oRange.endContainer) && ((oRange.endOffset - oRange.startOffset) == 1) && (oRange.startContainer.nodeType != 3)) {
					stype = "control";
				}
			}
			return stype;
		}
	}, getSelectedText:function () {
		if (dojo.isIE < 9) {
			if (dijit._editor.selection.getType() == "control") {
				return null;
			}
			return dojo.doc.selection.createRange().text;
		} else {
			var selection = dojo.global.getSelection();
			if (selection) {
				return selection.toString();
			}
		}
		return "";
	}, getSelectedHtml:function () {
		if (dojo.isIE < 9) {
			if (dijit._editor.selection.getType() == "control") {
				return null;
			}
			return dojo.doc.selection.createRange().htmlText;
		} else {
			var selection = dojo.global.getSelection();
			if (selection && selection.rangeCount) {
				var i;
				var html = "";
				for (i = 0; i < selection.rangeCount; i++) {
					var frag = selection.getRangeAt(i).cloneContents();
					var div = dojo.doc.createElement("div");
					div.appendChild(frag);
					html += div.innerHTML;
				}
				return html;
			}
			return null;
		}
	}, getSelectedElement:function () {
		if (dijit._editor.selection.getType() == "control") {
			if (dojo.isIE < 9) {
				var range = dojo.doc.selection.createRange();
				if (range && range.item) {
					return dojo.doc.selection.createRange().item(0);
				}
			} else {
				var selection = dojo.global.getSelection();
				return selection.anchorNode.childNodes[selection.anchorOffset];
			}
		}
		return null;
	}, getParentElement:function () {
		if (dijit._editor.selection.getType() == "control") {
			var p = this.getSelectedElement();
			if (p) {
				return p.parentNode;
			}
		} else {
			if (dojo.isIE < 9) {
				var r = dojo.doc.selection.createRange();
				r.collapse(true);
				return r.parentElement();
			} else {
				var selection = dojo.global.getSelection();
				if (selection) {
					var node = selection.anchorNode;
					while (node && (node.nodeType != 1)) {
						node = node.parentNode;
					}
					return node;
				}
			}
		}
		return null;
	}, hasAncestorElement:function (tagName) {
		return this.getAncestorElement.apply(this, arguments) != null;
	}, getAncestorElement:function (tagName) {
		var node = this.getSelectedElement() || this.getParentElement();
		return this.getParentOfType(node, arguments);
	}, isTag:function (node, tags) {
		if (node && node.tagName) {
			var _nlc = node.tagName.toLowerCase();
			for (var i = 0; i < tags.length; i++) {
				var _tlc = String(tags[i]).toLowerCase();
				if (_nlc == _tlc) {
					return _tlc;
				}
			}
		}
		return "";
	}, getParentOfType:function (node, tags) {
		while (node) {
			if (this.isTag(node, tags).length) {
				return node;
			}
			node = node.parentNode;
		}
		return null;
	}, collapse:function (beginning) {
		if (window.getSelection) {
			var selection = dojo.global.getSelection();
			if (selection.removeAllRanges) {
				if (beginning) {
					selection.collapseToStart();
				} else {
					selection.collapseToEnd();
				}
			} else {
				selection.collapse(beginning);
			}
		} else {
			if (dojo.isIE) {
				var range = dojo.doc.selection.createRange();
				range.collapse(beginning);
				range.select();
			}
		}
	}, remove:function () {
		var sel = dojo.doc.selection;
		if (dojo.isIE < 9) {
			if (sel.type.toLowerCase() != "none") {
				sel.clear();
			}
			return sel;
		} else {
			sel = dojo.global.getSelection();
			sel.deleteFromDocument();
			return sel;
		}
	}, selectElementChildren:function (element, nochangefocus) {
		var win = dojo.global;
		var doc = dojo.doc;
		var range;
		element = dojo.byId(element);
		if (doc.selection && dojo.isIE < 9 && dojo.body().createTextRange) {
			range = element.ownerDocument.body.createTextRange();
			range.moveToElementText(element);
			if (!nochangefocus) {
				try {
					range.select();
				}
				catch (e) {
				}
			}
		} else {
			if (win.getSelection) {
				var selection = dojo.global.getSelection();
				if (dojo.isOpera) {
					if (selection.rangeCount) {
						range = selection.getRangeAt(0);
					} else {
						range = doc.createRange();
					}
					range.setStart(element, 0);
					range.setEnd(element, (element.nodeType == 3) ? element.length : element.childNodes.length);
					selection.addRange(range);
				} else {
					selection.selectAllChildren(element);
				}
			}
		}
	}, selectElement:function (element, nochangefocus) {
		var range;
		var doc = dojo.doc;
		var win = dojo.global;
		element = dojo.byId(element);
		if (dojo.isIE < 9 && dojo.body().createTextRange) {
			try {
				var tg = element.tagName ? element.tagName.toLowerCase() : "";
				if (tg === "img" || tg === "table") {
					range = dojo.body().createControlRange();
				} else {
					range = dojo.body().createRange();
				}
				range.addElement(element);
				if (!nochangefocus) {
					range.select();
				}
			}
			catch (e) {
				this.selectElementChildren(element, nochangefocus);
			}
		} else {
			if (dojo.global.getSelection) {
				var selection = win.getSelection();
				range = doc.createRange();
				if (selection.removeAllRanges) {
					if (dojo.isOpera) {
						if (selection.getRangeAt(0)) {
							range = selection.getRangeAt(0);
						}
					}
					range.selectNode(element);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
	}, inSelection:function (node) {
		if (node) {
			var newRange;
			var doc = dojo.doc;
			var range;
			if (dojo.global.getSelection) {
				var sel = dojo.global.getSelection();
				if (sel && sel.rangeCount > 0) {
					range = sel.getRangeAt(0);
				}
				if (range && range.compareBoundaryPoints && doc.createRange) {
					try {
						newRange = doc.createRange();
						newRange.setStart(node, 0);
						if (range.compareBoundaryPoints(range.START_TO_END, newRange) === 1) {
							return true;
						}
					}
					catch (e) {
					}
				}
			} else {
				if (doc.selection) {
					range = doc.selection.createRange();
					try {
						newRange = node.ownerDocument.body.createControlRange();
						if (newRange) {
							newRange.addElement(node);
						}
					}
					catch (e1) {
						try {
							newRange = node.ownerDocument.body.createTextRange();
							newRange.moveToElementText(node);
						}
						catch (e2) {
						}
					}
					if (range && newRange) {
						if (range.compareEndPoints("EndToStart", newRange) === 1) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}});
}

