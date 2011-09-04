/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]) {
	dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"] = true;
	dojo.provide("dijit._editor.plugins.EnterKeyHandling");
	dojo.require("dojo.window");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit._editor.range");
	dojo.declare("dijit._editor.plugins.EnterKeyHandling", dijit._editor._Plugin, {blockNodeForEnter:"BR", constructor:function (args) {
		if (args) {
			if ("blockNodeForEnter" in args) {
				args.blockNodeForEnter = args.blockNodeForEnter.toUpperCase();
			}
			dojo.mixin(this, args);
		}
	}, setEditor:function (editor) {
		if (this.editor === editor) {
			return;
		}
		this.editor = editor;
		if (this.blockNodeForEnter == "BR") {
			this.editor.customUndo = true;
			editor.onLoadDeferred.addCallback(dojo.hitch(this, function (d) {
				this.connect(editor.document, "onkeypress", function (e) {
					if (e.charOrCode == dojo.keys.ENTER) {
						var ne = dojo.mixin({}, e);
						ne.shiftKey = true;
						if (!this.handleEnterKey(ne)) {
							dojo.stopEvent(e);
						}
					}
				});
				return d;
			}));
		} else {
			if (this.blockNodeForEnter) {
				var h = dojo.hitch(this, this.handleEnterKey);
				editor.addKeyHandler(13, 0, 0, h);
				editor.addKeyHandler(13, 0, 1, h);
				this.connect(this.editor, "onKeyPressed", "onKeyPressed");
			}
		}
	}, onKeyPressed:function (e) {
		if (this._checkListLater) {
			if (dojo.withGlobal(this.editor.window, "isCollapsed", dijit)) {
				var liparent = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, ["LI"]);
				if (!liparent) {
					dijit._editor.RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
					var block = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]);
					if (block) {
						block.innerHTML = this.bogusHtmlContent;
						if (dojo.isIE) {
							var r = this.editor.document.selection.createRange();
							r.move("character", -1);
							r.select();
						}
					} else {
						console.error("onKeyPressed: Cannot find the new block node");
					}
				} else {
					if (dojo.isMoz) {
						if (liparent.parentNode.parentNode.nodeName == "LI") {
							liparent = liparent.parentNode.parentNode;
						}
					}
					var fc = liparent.firstChild;
					if (fc && fc.nodeType == 1 && (fc.nodeName == "UL" || fc.nodeName == "OL")) {
						liparent.insertBefore(fc.ownerDocument.createTextNode("\xa0"), fc);
						var newrange = dijit.range.create(this.editor.window);
						newrange.setStart(liparent.firstChild, 0);
						var selection = dijit.range.getSelection(this.editor.window, true);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}
				}
			}
			this._checkListLater = false;
		}
		if (this._pressedEnterInBlock) {
			if (this._pressedEnterInBlock.previousSibling) {
				this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
			}
			delete this._pressedEnterInBlock;
		}
	}, bogusHtmlContent:"&nbsp;", blockNodes:/^(?:P|H1|H2|H3|H4|H5|H6|LI)$/, handleEnterKey:function (e) {
		var selection, range, newrange, startNode, endNode, brNode, doc = this.editor.document, br, rs, txt;
		if (e.shiftKey) {
			var parent = dojo.withGlobal(this.editor.window, "getParentElement", dijit._editor.selection);
			var header = dijit.range.getAncestor(parent, this.blockNodes);
			if (header) {
				if (header.tagName == "LI") {
					return true;
				}
				selection = dijit.range.getSelection(this.editor.window);
				range = selection.getRangeAt(0);
				if (!range.collapsed) {
					range.deleteContents();
					selection = dijit.range.getSelection(this.editor.window);
					range = selection.getRangeAt(0);
				}
				if (dijit.range.atBeginningOfContainer(header, range.startContainer, range.startOffset)) {
					br = doc.createElement("br");
					newrange = dijit.range.create(this.editor.window);
					header.insertBefore(br, header.firstChild);
					newrange.setStartBefore(br.nextSibling);
					selection.removeAllRanges();
					selection.addRange(newrange);
				} else {
					if (dijit.range.atEndOfContainer(header, range.startContainer, range.startOffset)) {
						newrange = dijit.range.create(this.editor.window);
						br = doc.createElement("br");
						header.appendChild(br);
						header.appendChild(doc.createTextNode("\xa0"));
						newrange.setStart(header.lastChild, 0);
						selection.removeAllRanges();
						selection.addRange(newrange);
					} else {
						rs = range.startContainer;
						if (rs && rs.nodeType == 3) {
							txt = rs.nodeValue;
							dojo.withGlobal(this.editor.window, function () {
								startNode = doc.createTextNode(txt.substring(0, range.startOffset));
								endNode = doc.createTextNode(txt.substring(range.startOffset));
								brNode = doc.createElement("br");
								if (endNode.nodeValue == "" && dojo.isWebKit) {
									endNode = doc.createTextNode("\xa0");
								}
								dojo.place(startNode, rs, "after");
								dojo.place(brNode, startNode, "after");
								dojo.place(endNode, brNode, "after");
								dojo.destroy(rs);
								newrange = dijit.range.create(dojo.gobal);
								newrange.setStart(endNode, 0);
								selection.removeAllRanges();
								selection.addRange(newrange);
							});
							return false;
						}
						return true;
					}
				}
			} else {
				selection = dijit.range.getSelection(this.editor.window);
				if (selection.rangeCount) {
					range = selection.getRangeAt(0);
					if (range && range.startContainer) {
						if (!range.collapsed) {
							range.deleteContents();
							selection = dijit.range.getSelection(this.editor.window);
							range = selection.getRangeAt(0);
						}
						rs = range.startContainer;
						if (rs && rs.nodeType == 3) {
							dojo.withGlobal(this.editor.window, dojo.hitch(this, function () {
								var endEmpty = false;
								var offset = range.startOffset;
								if (rs.length < offset) {
									ret = this._adjustNodeAndOffset(rs, offset);
									rs = ret.node;
									offset = ret.offset;
								}
								txt = rs.nodeValue;
								startNode = doc.createTextNode(txt.substring(0, offset));
								endNode = doc.createTextNode(txt.substring(offset));
								brNode = doc.createElement("br");
								if (!endNode.length) {
									endNode = doc.createTextNode("\xa0");
									endEmpty = true;
								}
								if (startNode.length) {
									dojo.place(startNode, rs, "after");
								} else {
									startNode = rs;
								}
								dojo.place(brNode, startNode, "after");
								dojo.place(endNode, brNode, "after");
								dojo.destroy(rs);
								newrange = dijit.range.create(dojo.gobal);
								newrange.setStart(endNode, 0);
								newrange.setEnd(endNode, endNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								if (endEmpty && !dojo.isWebKit) {
									dijit._editor.selection.remove();
								} else {
									dijit._editor.selection.collapse(true);
								}
							}));
						} else {
							dojo.withGlobal(this.editor.window, dojo.hitch(this, function () {
								var brNode = doc.createElement("br");
								rs.appendChild(brNode);
								var endNode = doc.createTextNode("\xa0");
								rs.appendChild(endNode);
								newrange = dijit.range.create(dojo.global);
								newrange.setStart(endNode, 0);
								newrange.setEnd(endNode, endNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								dijit._editor.selection.collapse(true);
							}));
						}
					}
				} else {
					dijit._editor.RichText.prototype.execCommand.call(this.editor, "inserthtml", "<br>");
				}
			}
			return false;
		}
		var _letBrowserHandle = true;
		selection = dijit.range.getSelection(this.editor.window);
		range = selection.getRangeAt(0);
		if (!range.collapsed) {
			range.deleteContents();
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}
		var block = dijit.range.getBlockAncestor(range.endContainer, null, this.editor.editNode);
		var blockNode = block.blockNode;
		if ((this._checkListLater = (blockNode && (blockNode.nodeName == "LI" || blockNode.parentNode.nodeName == "LI")))) {
			if (dojo.isMoz) {
				this._pressedEnterInBlock = blockNode;
			}
			if (/^(\s|&nbsp;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|\xA0)<\/span>)?(<br>)?$/.test(blockNode.innerHTML)) {
				blockNode.innerHTML = "";
				if (dojo.isWebKit) {
					newrange = dijit.range.create(this.editor.window);
					newrange.setStart(blockNode, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
				}
				this._checkListLater = false;
			}
			return true;
		}
		if (!block.blockNode || block.blockNode === this.editor.editNode) {
			try {
				dijit._editor.RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
			}
			catch (e2) {
			}
			block = {blockNode:dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]), blockContainer:this.editor.editNode};
			if (block.blockNode) {
				if (block.blockNode != this.editor.editNode && (!(block.blockNode.textContent || block.blockNode.innerHTML).replace(/^\s+|\s+$/g, "").length)) {
					this.removeTrailingBr(block.blockNode);
					return false;
				}
			} else {
				block.blockNode = this.editor.editNode;
			}
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}
		var newblock = doc.createElement(this.blockNodeForEnter);
		newblock.innerHTML = this.bogusHtmlContent;
		this.removeTrailingBr(block.blockNode);
		var endOffset = range.endOffset;
		var node = range.endContainer;
		if (node.length < endOffset) {
			var ret = this._adjustNodeAndOffset(node, endOffset);
			node = ret.node;
			endOffset = ret.offset;
		}
		if (dijit.range.atEndOfContainer(block.blockNode, node, endOffset)) {
			if (block.blockNode === block.blockContainer) {
				block.blockNode.appendChild(newblock);
			} else {
				dojo.place(newblock, block.blockNode, "after");
			}
			_letBrowserHandle = false;
			newrange = dijit.range.create(this.editor.window);
			newrange.setStart(newblock, 0);
			selection.removeAllRanges();
			selection.addRange(newrange);
			if (this.editor.height) {
				dojo.window.scrollIntoView(newblock);
			}
		} else {
			if (dijit.range.atBeginningOfContainer(block.blockNode, range.startContainer, range.startOffset)) {
				dojo.place(newblock, block.blockNode, block.blockNode === block.blockContainer ? "first" : "before");
				if (newblock.nextSibling && this.editor.height) {
					newrange = dijit.range.create(this.editor.window);
					newrange.setStart(newblock.nextSibling, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
					dojo.window.scrollIntoView(newblock.nextSibling);
				}
				_letBrowserHandle = false;
			} else {
				if (block.blockNode === block.blockContainer) {
					block.blockNode.appendChild(newblock);
				} else {
					dojo.place(newblock, block.blockNode, "after");
				}
				_letBrowserHandle = false;
				if (block.blockNode.style) {
					if (newblock.style) {
						if (block.blockNode.style.cssText) {
							newblock.style.cssText = block.blockNode.style.cssText;
						}
					}
				}
				rs = range.startContainer;
				var firstNodeMoved;
				if (rs && rs.nodeType == 3) {
					var nodeToMove, tNode;
					endOffset = range.endOffset;
					if (rs.length < endOffset) {
						ret = this._adjustNodeAndOffset(rs, endOffset);
						rs = ret.node;
						endOffset = ret.offset;
					}
					txt = rs.nodeValue;
					startNode = doc.createTextNode(txt.substring(0, endOffset));
					endNode = doc.createTextNode(txt.substring(endOffset, txt.length));
					dojo.place(startNode, rs, "before");
					dojo.place(endNode, rs, "after");
					dojo.destroy(rs);
					var parentC = startNode.parentNode;
					while (parentC !== block.blockNode) {
						var tg = parentC.tagName;
						var newTg = doc.createElement(tg);
						if (parentC.style) {
							if (newTg.style) {
								if (parentC.style.cssText) {
									newTg.style.cssText = parentC.style.cssText;
								}
							}
						}
						if (parentC.tagName === "FONT") {
							if (parentC.color) {
								newTg.color = parentC.color;
							}
							if (parentC.face) {
								newTg.face = parentC.face;
							}
							if (parentC.size) {
								newTg.size = parentC.size;
							}
						}
						nodeToMove = endNode;
						while (nodeToMove) {
							tNode = nodeToMove.nextSibling;
							newTg.appendChild(nodeToMove);
							nodeToMove = tNode;
						}
						dojo.place(newTg, parentC, "after");
						startNode = parentC;
						endNode = newTg;
						parentC = parentC.parentNode;
					}
					nodeToMove = endNode;
					if (nodeToMove.nodeType == 1 || (nodeToMove.nodeType == 3 && nodeToMove.nodeValue)) {
						newblock.innerHTML = "";
					}
					firstNodeMoved = nodeToMove;
					while (nodeToMove) {
						tNode = nodeToMove.nextSibling;
						newblock.appendChild(nodeToMove);
						nodeToMove = tNode;
					}
				}
				newrange = dijit.range.create(this.editor.window);
				var nodeForCursor;
				var innerMostFirstNodeMoved = firstNodeMoved;
				if (this.blockNodeForEnter !== "BR") {
					while (innerMostFirstNodeMoved) {
						nodeForCursor = innerMostFirstNodeMoved;
						tNode = innerMostFirstNodeMoved.firstChild;
						innerMostFirstNodeMoved = tNode;
					}
					if (nodeForCursor && nodeForCursor.parentNode) {
						newblock = nodeForCursor.parentNode;
						newrange.setStart(newblock, 0);
						selection.removeAllRanges();
						selection.addRange(newrange);
						if (this.editor.height) {
							dijit.scrollIntoView(newblock);
						}
						if (dojo.isMoz) {
							this._pressedEnterInBlock = block.blockNode;
						}
					} else {
						_letBrowserHandle = true;
					}
				} else {
					newrange.setStart(newblock, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
					if (this.editor.height) {
						dijit.scrollIntoView(newblock);
					}
					if (dojo.isMoz) {
						this._pressedEnterInBlock = block.blockNode;
					}
				}
			}
		}
		return _letBrowserHandle;
	}, _adjustNodeAndOffset:function (node, offset) {
		while (node.length < offset && node.nextSibling && node.nextSibling.nodeType == 3) {
			offset = offset - node.length;
			node = node.nextSibling;
		}
		var ret = {"node":node, "offset":offset};
		return ret;
	}, removeTrailingBr:function (container) {
		var para = /P|DIV|LI/i.test(container.tagName) ? container : dijit._editor.selection.getParentOfType(container, ["P", "DIV", "LI"]);
		if (!para) {
			return;
		}
		if (para.lastChild) {
			if ((para.childNodes.length > 1 && para.lastChild.nodeType == 3 && /^[\s\xAD]*$/.test(para.lastChild.nodeValue)) || para.lastChild.tagName == "BR") {
				dojo.destroy(para.lastChild);
			}
		}
		if (!para.childNodes.length) {
			para.innerHTML = this.bogusHtmlContent;
		}
	}});
}

