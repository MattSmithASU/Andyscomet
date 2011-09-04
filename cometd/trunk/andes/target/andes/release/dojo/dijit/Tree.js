/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Tree"]) {
	dojo._hasResource["dijit.Tree"] = true;
	dojo.provide("dijit.Tree");
	dojo.require("dojo.fx");
	dojo.require("dojo.DeferredList");
	dojo.require("dijit._Widget");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._Container");
	dojo.require("dijit._Contained");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dojo.cookie");
	dojo.require("dijit.tree.TreeStoreModel");
	dojo.require("dijit.tree.ForestStoreModel");
	dojo.require("dijit.tree._dndSelector");
	dojo.declare("dijit._TreeNode", [dijit._Widget, dijit._TemplatedMixin, dijit._Container, dijit._Contained, dijit._CssStateMixin], {item:null, isTreeNode:true, label:"", _setLabelAttr:{node:"labelNode", type:"innerText"}, isExpandable:null, isExpanded:false, state:"UNCHECKED", templateString:dojo.cache("dijit", "templates/TreeNode.html", "<div class=\"dijitTreeNode\" role=\"presentation\"\n\t><div dojoAttachPoint=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\" dojoAttachEvent=\"onmouseenter:_onMouseEnter, onmouseleave:_onMouseLeave, onclick:_onClick, ondblclick:_onDblClick\"\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"\n\t\t/><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"\n\t\t></span\n\t\t><span dojoAttachPoint=\"contentNode\"\n\t\t\tclass=\"dijitTreeContent\" role=\"presentation\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"\n\t\t\t/><span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\" dojoAttachEvent=\"onfocus:_onLabelFocus\"></span>\n\t\t</span\n\t></div>\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\n</div>\n"), baseClass:"dijitTreeNode", cssStateNodes:{rowNode:"dijitTreeRow", labelNode:"dijitTreeLabel"}, _setTooltipAttr:{node:"rowNode", type:"attribute", attribute:"title"}, buildRendering:function () {
		this.inherited(arguments);
		this._setExpando();
		this._updateItemClasses(this.item);
		if (this.isExpandable) {
			dijit.setWaiState(this.labelNode, "expanded", this.isExpanded);
		}
		this.setSelected(false);
	}, _setIndentAttr:function (indent) {
		var pixels = (Math.max(indent, 0) * this.tree._nodePixelIndent) + "px";
		dojo.style(this.domNode, "backgroundPosition", pixels + " 0px");
		dojo.style(this.rowNode, this.isLeftToRight() ? "paddingLeft" : "paddingRight", pixels);
		dojo.forEach(this.getChildren(), function (child) {
			child.set("indent", indent + 1);
		});
		this._set("indent", indent);
	}, markProcessing:function () {
		this.state = "LOADING";
		this._setExpando(true);
	}, unmarkProcessing:function () {
		this._setExpando(false);
	}, _updateItemClasses:function (item) {
		var tree = this.tree, model = tree.model;
		if (tree._v10Compat && item === model.root) {
			item = null;
		}
		this._applyClassAndStyle(item, "icon", "Icon");
		this._applyClassAndStyle(item, "label", "Label");
		this._applyClassAndStyle(item, "row", "Row");
	}, _applyClassAndStyle:function (item, lower, upper) {
		var clsName = "_" + lower + "Class";
		var nodeName = lower + "Node";
		var oldCls = this[clsName];
		this[clsName] = this.tree["get" + upper + "Class"](item, this.isExpanded);
		dojo.replaceClass(this[nodeName], this[clsName] || "", oldCls || "");
		dojo.style(this[nodeName], this.tree["get" + upper + "Style"](item, this.isExpanded) || {});
	}, _updateLayout:function () {
		var parent = this.getParent();
		if (!parent || parent.rowNode.style.display == "none") {
			dojo.addClass(this.domNode, "dijitTreeIsRoot");
		} else {
			dojo.toggleClass(this.domNode, "dijitTreeIsLast", !this.getNextSibling());
		}
	}, _setExpando:function (processing) {
		var styles = ["dijitTreeExpandoLoading", "dijitTreeExpandoOpened", "dijitTreeExpandoClosed", "dijitTreeExpandoLeaf"], _a11yStates = ["*", "-", "+", "*"], idx = processing ? 0 : (this.isExpandable ? (this.isExpanded ? 1 : 2) : 3);
		dojo.replaceClass(this.expandoNode, styles[idx], styles);
		this.expandoNodeText.innerHTML = _a11yStates[idx];
	}, expand:function () {
		if (this._expandDeferred) {
			return this._expandDeferred;
		}
		this._wipeOut && this._wipeOut.stop();
		this.isExpanded = true;
		dijit.setWaiState(this.labelNode, "expanded", "true");
		if (this.tree.showRoot || this !== this.tree.rootNode) {
			dijit.setWaiRole(this.containerNode, "group");
		}
		dojo.addClass(this.contentNode, "dijitTreeContentExpanded");
		this._setExpando();
		this._updateItemClasses(this.item);
		if (this == this.tree.rootNode) {
			dijit.setWaiState(this.tree.domNode, "expanded", "true");
		}
		var def, wipeIn = dojo.fx.wipeIn({node:this.containerNode, duration:dijit.defaultDuration, onEnd:function () {
			def.callback(true);
		}});
		def = (this._expandDeferred = new dojo.Deferred(function () {
			wipeIn.stop();
		}));
		wipeIn.play();
		return def;
	}, collapse:function () {
		if (!this.isExpanded) {
			return;
		}
		if (this._expandDeferred) {
			this._expandDeferred.cancel();
			delete this._expandDeferred;
		}
		this.isExpanded = false;
		dijit.setWaiState(this.labelNode, "expanded", "false");
		if (this == this.tree.rootNode) {
			dijit.setWaiState(this.tree.domNode, "expanded", "false");
		}
		dojo.removeClass(this.contentNode, "dijitTreeContentExpanded");
		this._setExpando();
		this._updateItemClasses(this.item);
		if (!this._wipeOut) {
			this._wipeOut = dojo.fx.wipeOut({node:this.containerNode, duration:dijit.defaultDuration});
		}
		this._wipeOut.play();
	}, indent:0, setChildItems:function (items) {
		var tree = this.tree, model = tree.model, defs = [];
		dojo.forEach(this.getChildren(), function (child) {
			dijit._Container.prototype.removeChild.call(this, child);
		}, this);
		this.state = "LOADED";
		if (items && items.length > 0) {
			this.isExpandable = true;
			dojo.forEach(items, function (item) {
				var id = model.getIdentity(item), existingNodes = tree._itemNodesMap[id], node;
				if (existingNodes) {
					for (var i = 0; i < existingNodes.length; i++) {
						if (existingNodes[i] && !existingNodes[i].getParent()) {
							node = existingNodes[i];
							node.set("indent", this.indent + 1);
							break;
						}
					}
				}
				if (!node) {
					node = this.tree._createTreeNode({item:item, tree:tree, isExpandable:model.mayHaveChildren(item), label:tree.getLabel(item), tooltip:tree.getTooltip(item), dir:tree.dir, lang:tree.lang, indent:this.indent + 1});
					if (existingNodes) {
						existingNodes.push(node);
					} else {
						tree._itemNodesMap[id] = [node];
					}
				}
				this.addChild(node);
				if (this.tree.autoExpand || this.tree._state(item)) {
					defs.push(tree._expandNode(node));
				}
			}, this);
			dojo.forEach(this.getChildren(), function (child, idx) {
				child._updateLayout();
			});
		} else {
			this.isExpandable = false;
		}
		if (this._setExpando) {
			this._setExpando(false);
		}
		this._updateItemClasses(this.item);
		if (this == tree.rootNode) {
			var fc = this.tree.showRoot ? this : this.getChildren()[0];
			if (fc) {
				fc.setFocusable(true);
				tree.lastFocused = fc;
			} else {
				tree.domNode.setAttribute("tabIndex", "0");
			}
		}
		return new dojo.DeferredList(defs);
	}, getTreePath:function () {
		var node = this;
		var path = [];
		while (node && node !== this.tree.rootNode) {
			path.unshift(node.item);
			node = node.getParent();
		}
		path.unshift(this.tree.rootNode.item);
		return path;
	}, getIdentity:function () {
		return this.tree.model.getIdentity(this.item);
	}, removeChild:function (node) {
		this.inherited(arguments);
		var children = this.getChildren();
		if (children.length == 0) {
			this.isExpandable = false;
			this.collapse();
		}
		dojo.forEach(children, function (child) {
			child._updateLayout();
		});
	}, makeExpandable:function () {
		this.isExpandable = true;
		this._setExpando(false);
	}, _onLabelFocus:function (evt) {
		this.tree._onNodeFocus(this);
	}, setSelected:function (selected) {
		dijit.setWaiState(this.labelNode, "selected", selected);
		dojo.toggleClass(this.rowNode, "dijitTreeRowSelected", selected);
	}, setFocusable:function (selected) {
		this.labelNode.setAttribute("tabIndex", selected ? "0" : "-1");
	}, _onClick:function (evt) {
		this.tree._onClick(this, evt);
	}, _onDblClick:function (evt) {
		this.tree._onDblClick(this, evt);
	}, _onMouseEnter:function (evt) {
		this.tree._onNodeMouseEnter(this, evt);
	}, _onMouseLeave:function (evt) {
		this.tree._onNodeMouseLeave(this, evt);
	}});
	dojo.declare("dijit.Tree", [dijit._Widget, dijit._TemplatedMixin], {store:null, model:null, query:null, label:"", showRoot:true, childrenAttr:["children"], paths:[], path:[], selectedItems:null, selectedItem:null, openOnClick:false, openOnDblClick:false, templateString:dojo.cache("dijit", "templates/Tree.html", "<div class=\"dijitTree dijitTreeContainer\" role=\"tree\"\n\tdojoAttachEvent=\"onkeypress:_onKeyPress\">\n\t<div class=\"dijitInline dijitTreeIndent\" style=\"position: absolute; top: -9999px\" dojoAttachPoint=\"indentDetector\"></div>\n</div>\n"), persist:true, autoExpand:false, dndController:"dijit.tree._dndSelector", dndParams:["onDndDrop", "itemCreator", "onDndCancel", "checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold"], onDndDrop:null, itemCreator:null, onDndCancel:null, checkAcceptance:null, checkItemAcceptance:null, dragThreshold:5, betweenThreshold:0, _nodePixelIndent:19, _publish:function (topicName, message) {
		dojo.publish(this.id, [dojo.mixin({tree:this, event:topicName}, message || {})]);
	}, postMixInProperties:function () {
		this.tree = this;
		if (this.autoExpand) {
			this.persist = false;
		}
		this._itemNodesMap = {};
		if (!this.cookieName) {
			this.cookieName = this.id + "SaveStateCookie";
		}
		this._loadDeferred = new dojo.Deferred();
		this.inherited(arguments);
	}, postCreate:function () {
		this._initState();
		if (!this.model) {
			this._store2model();
		}
		this.connect(this.model, "onChange", "_onItemChange");
		this.connect(this.model, "onChildrenChange", "_onItemChildrenChange");
		this.connect(this.model, "onDelete", "_onItemDelete");
		this._load();
		this.inherited(arguments);
		if (this.dndController) {
			if (dojo.isString(this.dndController)) {
				this.dndController = dojo.getObject(this.dndController);
			}
			var params = {};
			for (var i = 0; i < this.dndParams.length; i++) {
				if (this[this.dndParams[i]]) {
					params[this.dndParams[i]] = this[this.dndParams[i]];
				}
			}
			this.dndController = new this.dndController(this, params);
		}
	}, _store2model:function () {
		this._v10Compat = true;
		dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
		var modelParams = {id:this.id + "_ForestStoreModel", store:this.store, query:this.query, childrenAttrs:this.childrenAttr};
		if (this.params.mayHaveChildren) {
			modelParams.mayHaveChildren = dojo.hitch(this, "mayHaveChildren");
		}
		if (this.params.getItemChildren) {
			modelParams.getChildren = dojo.hitch(this, function (item, onComplete, onError) {
				this.getItemChildren((this._v10Compat && item === this.model.root) ? null : item, onComplete, onError);
			});
		}
		this.model = new dijit.tree.ForestStoreModel(modelParams);
		this.showRoot = Boolean(this.label);
	}, onLoad:function () {
	}, _load:function () {
		this.model.getRoot(dojo.hitch(this, function (item) {
			var rn = (this.rootNode = this.tree._createTreeNode({item:item, tree:this, isExpandable:true, label:this.label || this.getLabel(item), indent:this.showRoot ? 0 : -1}));
			if (!this.showRoot) {
				rn.rowNode.style.display = "none";
				dijit.setWaiRole(this.domNode, "presentation");
				dijit.setWaiRole(rn.labelNode, "presentation");
				dijit.setWaiRole(rn.containerNode, "tree");
			}
			this.domNode.appendChild(rn.domNode);
			var identity = this.model.getIdentity(item);
			if (this._itemNodesMap[identity]) {
				this._itemNodesMap[identity].push(rn);
			} else {
				this._itemNodesMap[identity] = [rn];
			}
			rn._updateLayout();
			this._expandNode(rn).addCallback(dojo.hitch(this, function () {
				this._loadDeferred.callback(true);
				this.onLoad();
			}));
		}), function (err) {
			console.error(this, ": error loading root: ", err);
		});
	}, getNodesByItem:function (item) {
		if (!item) {
			return [];
		}
		var identity = dojo.isString(item) ? item : this.model.getIdentity(item);
		return [].concat(this._itemNodesMap[identity]);
	}, _setSelectedItemAttr:function (item) {
		this.set("selectedItems", [item]);
	}, _setSelectedItemsAttr:function (items) {
		var tree = this;
		this._loadDeferred.addCallback(dojo.hitch(this, function () {
			var identities = dojo.map(items, function (item) {
				return (!item || dojo.isString(item)) ? item : tree.model.getIdentity(item);
			});
			var nodes = [];
			dojo.forEach(identities, function (id) {
				nodes = nodes.concat(tree._itemNodesMap[id] || []);
			});
			this.set("selectedNodes", nodes);
		}));
	}, _setPathAttr:function (path) {
		if (path.length) {
			return this.set("paths", [path]);
		} else {
			return this.set("paths", []);
		}
	}, _setPathsAttr:function (paths) {
		var tree = this;
		return new dojo.DeferredList(dojo.map(paths, function (path) {
			var d = new dojo.Deferred();
			path = dojo.map(path, function (item) {
				return dojo.isString(item) ? item : tree.model.getIdentity(item);
			});
			if (path.length) {
				tree._loadDeferred.addCallback(function () {
					selectPath(path, [tree.rootNode], d);
				});
			} else {
				d.errback("Empty path");
			}
			return d;
		})).addCallback(setNodes);
		function selectPath(path, nodes, def) {
			var nextPath = path.shift();
			var nextNode = dojo.filter(nodes, function (node) {
				return node.getIdentity() == nextPath;
			})[0];
			if (!!nextNode) {
				if (path.length) {
					tree._expandNode(nextNode).addCallback(function () {
						selectPath(path, nextNode.getChildren(), def);
					});
				} else {
					def.callback(nextNode);
				}
			} else {
				def.errback("Could not expand path at " + nextPath);
			}
		}
		function setNodes(newNodes) {
			tree.set("selectedNodes", dojo.map(dojo.filter(newNodes, function (x) {
				return x[0];
			}), function (x) {
				return x[1];
			}));
		}
	}, _setSelectedNodeAttr:function (node) {
		this.set("selectedNodes", [node]);
	}, _setSelectedNodesAttr:function (nodes) {
		this._loadDeferred.addCallback(dojo.hitch(this, function () {
			this.dndController.setSelection(nodes);
		}));
	}, mayHaveChildren:function (item) {
	}, getItemChildren:function (parentItem, onComplete) {
	}, getLabel:function (item) {
		return this.model.getLabel(item);
	}, getIconClass:function (item, opened) {
		return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf";
	}, getLabelClass:function (item, opened) {
	}, getRowClass:function (item, opened) {
	}, getIconStyle:function (item, opened) {
	}, getLabelStyle:function (item, opened) {
	}, getRowStyle:function (item, opened) {
	}, getTooltip:function (item) {
		return "";
	}, _onKeyPress:function (e) {
		if (e.altKey) {
			return;
		}
		var dk = dojo.keys;
		var treeNode = dijit.getEnclosingWidget(e.target);
		if (!treeNode) {
			return;
		}
		var key = e.charOrCode;
		if (typeof key == "string" && key != " ") {
			if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
				this._onLetterKeyNav({node:treeNode, key:key.toLowerCase()});
				dojo.stopEvent(e);
			}
		} else {
			if (this._curSearch) {
				clearTimeout(this._curSearch.timer);
				delete this._curSearch;
			}
			var map = this._keyHandlerMap;
			if (!map) {
				map = {};
				map[dk.ENTER] = "_onEnterKey";
				map[dk.SPACE] = map[" "] = "_onEnterKey";
				map[this.isLeftToRight() ? dk.LEFT_ARROW : dk.RIGHT_ARROW] = "_onLeftArrow";
				map[this.isLeftToRight() ? dk.RIGHT_ARROW : dk.LEFT_ARROW] = "_onRightArrow";
				map[dk.UP_ARROW] = "_onUpArrow";
				map[dk.DOWN_ARROW] = "_onDownArrow";
				map[dk.HOME] = "_onHomeKey";
				map[dk.END] = "_onEndKey";
				this._keyHandlerMap = map;
			}
			if (this._keyHandlerMap[key]) {
				this[this._keyHandlerMap[key]]({node:treeNode, item:treeNode.item, evt:e});
				dojo.stopEvent(e);
			}
		}
	}, _onEnterKey:function (message) {
		this._publish("execute", {item:message.item, node:message.node});
		this.dndController.userSelect(message.node, dojo.isCopyKey(message.evt), message.evt.shiftKey);
		this.onClick(message.item, message.node, message.evt);
	}, _onDownArrow:function (message) {
		var node = this._getNextNode(message.node);
		if (node && node.isTreeNode) {
			this.focusNode(node);
		}
	}, _onUpArrow:function (message) {
		var node = message.node;
		var previousSibling = node.getPreviousSibling();
		if (previousSibling) {
			node = previousSibling;
			while (node.isExpandable && node.isExpanded && node.hasChildren()) {
				var children = node.getChildren();
				node = children[children.length - 1];
			}
		} else {
			var parent = node.getParent();
			if (!(!this.showRoot && parent === this.rootNode)) {
				node = parent;
			}
		}
		if (node && node.isTreeNode) {
			this.focusNode(node);
		}
	}, _onRightArrow:function (message) {
		var node = message.node;
		if (node.isExpandable && !node.isExpanded) {
			this._expandNode(node);
		} else {
			if (node.hasChildren()) {
				node = node.getChildren()[0];
				if (node && node.isTreeNode) {
					this.focusNode(node);
				}
			}
		}
	}, _onLeftArrow:function (message) {
		var node = message.node;
		if (node.isExpandable && node.isExpanded) {
			this._collapseNode(node);
		} else {
			var parent = node.getParent();
			if (parent && parent.isTreeNode && !(!this.showRoot && parent === this.rootNode)) {
				this.focusNode(parent);
			}
		}
	}, _onHomeKey:function () {
		var node = this._getRootOrFirstNode();
		if (node) {
			this.focusNode(node);
		}
	}, _onEndKey:function (message) {
		var node = this.rootNode;
		while (node.isExpanded) {
			var c = node.getChildren();
			node = c[c.length - 1];
		}
		if (node && node.isTreeNode) {
			this.focusNode(node);
		}
	}, multiCharSearchDuration:250, _onLetterKeyNav:function (message) {
		var cs = this._curSearch;
		if (cs) {
			cs.pattern = cs.pattern + message.key;
			clearTimeout(cs.timer);
		} else {
			cs = this._curSearch = {pattern:message.key, startNode:message.node};
		}
		var self = this;
		cs.timer = setTimeout(function () {
			delete self._curSearch;
		}, this.multiCharSearchDuration);
		var node = cs.startNode;
		do {
			node = this._getNextNode(node);
			if (!node) {
				node = this._getRootOrFirstNode();
			}
		} while (node !== cs.startNode && (node.label.toLowerCase().substr(0, cs.pattern.length) != cs.pattern));
		if (node && node.isTreeNode) {
			if (node !== cs.startNode) {
				this.focusNode(node);
			}
		}
	}, isExpandoNode:function (node, widget) {
		return dojo.isDescendant(node, widget.expandoNode);
	}, _onClick:function (nodeWidget, e) {
		var domElement = e.target, isExpandoClick = this.isExpandoNode(domElement, nodeWidget);
		if ((this.openOnClick && nodeWidget.isExpandable) || isExpandoClick) {
			if (nodeWidget.isExpandable) {
				this._onExpandoClick({node:nodeWidget});
			}
		} else {
			this._publish("execute", {item:nodeWidget.item, node:nodeWidget, evt:e});
			this.onClick(nodeWidget.item, nodeWidget, e);
			this.focusNode(nodeWidget);
		}
		dojo.stopEvent(e);
	}, _onDblClick:function (nodeWidget, e) {
		var domElement = e.target, isExpandoClick = (domElement == nodeWidget.expandoNode || domElement == nodeWidget.expandoNodeText);
		if ((this.openOnDblClick && nodeWidget.isExpandable) || isExpandoClick) {
			if (nodeWidget.isExpandable) {
				this._onExpandoClick({node:nodeWidget});
			}
		} else {
			this._publish("execute", {item:nodeWidget.item, node:nodeWidget, evt:e});
			this.onDblClick(nodeWidget.item, nodeWidget, e);
			this.focusNode(nodeWidget);
		}
		dojo.stopEvent(e);
	}, _onExpandoClick:function (message) {
		var node = message.node;
		this.focusNode(node);
		if (node.isExpanded) {
			this._collapseNode(node);
		} else {
			this._expandNode(node);
		}
	}, onClick:function (item, node, evt) {
	}, onDblClick:function (item, node, evt) {
	}, onOpen:function (item, node) {
	}, onClose:function (item, node) {
	}, _getNextNode:function (node) {
		if (node.isExpandable && node.isExpanded && node.hasChildren()) {
			return node.getChildren()[0];
		} else {
			while (node && node.isTreeNode) {
				var returnNode = node.getNextSibling();
				if (returnNode) {
					return returnNode;
				}
				node = node.getParent();
			}
			return null;
		}
	}, _getRootOrFirstNode:function () {
		return this.showRoot ? this.rootNode : this.rootNode.getChildren()[0];
	}, _collapseNode:function (node) {
		if (node._expandNodeDeferred) {
			delete node._expandNodeDeferred;
		}
		if (node.isExpandable) {
			if (node.state == "LOADING") {
				return;
			}
			node.collapse();
			this.onClose(node.item, node);
			if (node.item) {
				this._state(node.item, false);
				this._saveState();
			}
		}
	}, _expandNode:function (node, recursive) {
		if (node._expandNodeDeferred && !recursive) {
			return node._expandNodeDeferred;
		}
		var model = this.model, item = node.item, _this = this;
		switch (node.state) {
		  case "UNCHECKED":
			node.markProcessing();
			var def = (node._expandNodeDeferred = new dojo.Deferred());
			model.getChildren(item, function (items) {
				node.unmarkProcessing();
				var scid = node.setChildItems(items);
				var ed = _this._expandNode(node, true);
				scid.addCallback(function () {
					ed.addCallback(function () {
						def.callback();
					});
				});
			}, function (err) {
				console.error(_this, ": error loading root children: ", err);
			});
			break;
		  default:
			def = (node._expandNodeDeferred = node.expand());
			this.onOpen(node.item, node);
			if (item) {
				this._state(item, true);
				this._saveState();
			}
		}
		return def;
	}, focusNode:function (node) {
		dijit.focus(node.labelNode);
	}, _onNodeFocus:function (node) {
		if (node && node != this.lastFocused) {
			if (this.lastFocused && !this.lastFocused._destroyed) {
				this.lastFocused.setFocusable(false);
			}
			node.setFocusable(true);
			this.lastFocused = node;
		}
	}, _onNodeMouseEnter:function (node) {
	}, _onNodeMouseLeave:function (node) {
	}, _onItemChange:function (item) {
		var model = this.model, identity = model.getIdentity(item), nodes = this._itemNodesMap[identity];
		if (nodes) {
			var label = this.getLabel(item), tooltip = this.getTooltip(item);
			dojo.forEach(nodes, function (node) {
				node.set({item:item, label:label, tooltip:tooltip});
				node._updateItemClasses(item);
			});
		}
	}, _onItemChildrenChange:function (parent, newChildrenList) {
		var model = this.model, identity = model.getIdentity(parent), parentNodes = this._itemNodesMap[identity];
		if (parentNodes) {
			dojo.forEach(parentNodes, function (parentNode) {
				parentNode.setChildItems(newChildrenList);
			});
		}
	}, _onItemDelete:function (item) {
		var model = this.model, identity = model.getIdentity(item), nodes = this._itemNodesMap[identity];
		if (nodes) {
			dojo.forEach(nodes, function (node) {
				this.dndController.removeTreeNode(node);
				var parent = node.getParent();
				if (parent) {
					parent.removeChild(node);
				}
				node.destroyRecursive();
			}, this);
			delete this._itemNodesMap[identity];
		}
	}, _initState:function () {
		if (this.persist) {
			var cookie = dojo.cookie(this.cookieName);
			this._openedItemIds = {};
			if (cookie) {
				dojo.forEach(cookie.split(","), function (item) {
					this._openedItemIds[item] = true;
				}, this);
			}
		}
	}, _state:function (item, expanded) {
		if (!this.persist) {
			return false;
		}
		var id = this.model.getIdentity(item);
		if (arguments.length === 1) {
			return this._openedItemIds[id];
		}
		if (expanded) {
			this._openedItemIds[id] = true;
		} else {
			delete this._openedItemIds[id];
		}
	}, _saveState:function () {
		if (!this.persist) {
			return;
		}
		var ary = [];
		for (var id in this._openedItemIds) {
			ary.push(id);
		}
		dojo.cookie(this.cookieName, ary.join(","), {expires:365});
	}, destroy:function () {
		if (this._curSearch) {
			clearTimeout(this._curSearch.timer);
			delete this._curSearch;
		}
		if (this.rootNode) {
			this.rootNode.destroyRecursive();
		}
		if (this.dndController && !dojo.isString(this.dndController)) {
			this.dndController.destroy();
		}
		this.rootNode = null;
		this.inherited(arguments);
	}, destroyRecursive:function () {
		this.destroy();
	}, resize:function (changeSize) {
		if (changeSize) {
			dojo.marginBox(this.domNode, changeSize);
		}
		this._nodePixelIndent = dojo._getMarginSize(this.tree.indentDetector).w;
		if (this.tree.rootNode) {
			this.tree.rootNode.set("indent", this.showRoot ? 0 : -1);
		}
	}, _createTreeNode:function (args) {
		return new dijit._TreeNode(args);
	}});
}

