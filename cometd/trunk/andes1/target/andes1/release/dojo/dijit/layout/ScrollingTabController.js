/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.ScrollingTabController"]) {
	dojo._hasResource["dijit.layout.ScrollingTabController"] = true;
	dojo.provide("dijit.layout.ScrollingTabController");
	dojo.require("dijit.layout.TabController");
	dojo.require("dijit._WidgetsInTemplateMixin");
	dojo.require("dijit.Menu");
	dojo.require("dijit.form.Button");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.layout.ScrollingTabController", [dijit.layout.TabController, dijit._WidgetsInTemplateMixin], {templateString:dojo.cache("dijit.layout", "templates/ScrollingTabController.html", "<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerMenuButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_menuBtn\" containerId=\"${containerId}\" iconClass=\"dijitTabStripMenuIcon\"\n\t\t\tdropDownPosition=\"below-alt, above-alt\"\n\t\t\tdojoAttachPoint=\"_menuBtn\" showLabel=false title=\"\">&#9660;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_leftBtn\" iconClass=\"dijitTabStripSlideLeftIcon\"\n\t\t\tdojoAttachPoint=\"_leftBtn\" dojoAttachEvent=\"onClick: doSlideLeft\" showLabel=false title=\"\">&#9664;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\n\t\t\tid=\"${id}_rightBtn\" iconClass=\"dijitTabStripSlideRightIcon\"\n\t\t\tdojoAttachPoint=\"_rightBtn\" dojoAttachEvent=\"onClick: doSlideRight\" showLabel=false title=\"\">&#9654;</div>\n\t<div class='dijitTabListWrapper' dojoAttachPoint='tablistWrapper'>\n\t\t<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'\n\t\t\t\tdojoAttachPoint='containerNode' class='nowrapTabStrip'></div>\n\t</div>\n</div>\n"), useMenu:true, useSlider:true, tabStripClass:"", widgetsInTemplate:true, _minScroll:5, _setClassAttr:{node:"containerNode", type:"class"}, buildRendering:function () {
		this.inherited(arguments);
		var n = this.domNode;
		this.scrollNode = this.tablistWrapper;
		this._initButtons();
		if (!this.tabStripClass) {
			this.tabStripClass = "dijitTabContainer" + this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "") + "None";
			dojo.addClass(n, "tabStrip-disabled");
		}
		dojo.addClass(this.tablistWrapper, this.tabStripClass);
	}, onStartup:function () {
		this.inherited(arguments);
		dojo.style(this.domNode, "visibility", "visible");
		this._postStartup = true;
	}, onAddChild:function (page, insertIndex) {
		this.inherited(arguments);
		dojo.forEach(["label", "iconClass"], function (attr) {
			this.pane2watches[page.id].push(this.pane2button[page.id].watch(attr, dojo.hitch(this, function (name, oldValue, newValue) {
				if (this._postStartup && this._dim) {
					this.resize(this._dim);
				}
			})));
		}, this);
		dojo.style(this.containerNode, "width", (dojo.style(this.containerNode, "width") + 200) + "px");
	}, onRemoveChild:function (page, insertIndex) {
		var button = this.pane2button[page.id];
		if (this._selectedTab === button.domNode) {
			this._selectedTab = null;
		}
		this.inherited(arguments);
	}, _initButtons:function () {
		this._btnWidth = 0;
		this._buttons = dojo.query("> .tabStripButton", this.domNode).filter(function (btn) {
			if ((this.useMenu && btn == this._menuBtn.domNode) || (this.useSlider && (btn == this._rightBtn.domNode || btn == this._leftBtn.domNode))) {
				this._btnWidth += dojo._getMarginSize(btn).w;
				return true;
			} else {
				dojo.style(btn, "display", "none");
				return false;
			}
		}, this);
	}, _getTabsWidth:function () {
		var children = this.getChildren();
		if (children.length) {
			var leftTab = children[this.isLeftToRight() ? 0 : children.length - 1].domNode, rightTab = children[this.isLeftToRight() ? children.length - 1 : 0].domNode;
			return rightTab.offsetLeft + dojo.style(rightTab, "width") - leftTab.offsetLeft;
		} else {
			return 0;
		}
	}, _enableBtn:function (width) {
		var tabsWidth = this._getTabsWidth();
		width = width || dojo.style(this.scrollNode, "width");
		return tabsWidth > 0 && width < tabsWidth;
	}, resize:function (dim) {
		if (this.domNode.offsetWidth == 0) {
			return;
		}
		this._dim = dim;
		this.scrollNode.style.height = "auto";
		this._contentBox = dijit.layout.marginBox2contentBox(this.domNode, {h:0, w:dim.w});
		this._contentBox.h = this.scrollNode.offsetHeight;
		dojo.contentBox(this.domNode, this._contentBox);
		var enable = this._enableBtn(this._contentBox.w);
		this._buttons.style("display", enable ? "" : "none");
		this._leftBtn.layoutAlign = "left";
		this._rightBtn.layoutAlign = "right";
		this._menuBtn.layoutAlign = this.isLeftToRight() ? "right" : "left";
		dijit.layout.layoutChildren(this.domNode, this._contentBox, [this._menuBtn, this._leftBtn, this._rightBtn, {domNode:this.scrollNode, layoutAlign:"client"}]);
		if (this._selectedTab) {
			if (this._anim && this._anim.status() == "playing") {
				this._anim.stop();
			}
			var w = this.scrollNode, sl = this._convertToScrollLeft(this._getScrollForSelectedTab());
			w.scrollLeft = sl;
		}
		this._setButtonClass(this._getScroll());
		this._postResize = true;
		return {h:this._contentBox.h, w:dim.w};
	}, _getScroll:function () {
		var sl = (this.isLeftToRight() || dojo.isIE < 8 || (dojo.isIE && dojo.isQuirks) || dojo.isWebKit) ? this.scrollNode.scrollLeft : dojo.style(this.containerNode, "width") - dojo.style(this.scrollNode, "width") + (dojo.isIE == 8 ? -1 : 1) * this.scrollNode.scrollLeft;
		return sl;
	}, _convertToScrollLeft:function (val) {
		if (this.isLeftToRight() || dojo.isIE < 8 || (dojo.isIE && dojo.isQuirks) || dojo.isWebKit) {
			return val;
		} else {
			var maxScroll = dojo.style(this.containerNode, "width") - dojo.style(this.scrollNode, "width");
			return (dojo.isIE == 8 ? -1 : 1) * (val - maxScroll);
		}
	}, onSelectChild:function (page) {
		var tab = this.pane2button[page.id];
		if (!tab || !page) {
			return;
		}
		var node = tab.domNode;
		if (this._postResize && node != this._selectedTab) {
			this._selectedTab = node;
			var sl = this._getScroll();
			if (sl > node.offsetLeft || sl + dojo.style(this.scrollNode, "width") < node.offsetLeft + dojo.style(node, "width")) {
				this.createSmoothScroll().play();
			}
		}
		this.inherited(arguments);
	}, _getScrollBounds:function () {
		var children = this.getChildren(), scrollNodeWidth = dojo.style(this.scrollNode, "width"), containerWidth = dojo.style(this.containerNode, "width"), maxPossibleScroll = containerWidth - scrollNodeWidth, tabsWidth = this._getTabsWidth();
		if (children.length && tabsWidth > scrollNodeWidth) {
			return {min:this.isLeftToRight() ? 0 : children[children.length - 1].domNode.offsetLeft, max:this.isLeftToRight() ? (children[children.length - 1].domNode.offsetLeft + dojo.style(children[children.length - 1].domNode, "width")) - scrollNodeWidth : maxPossibleScroll};
		} else {
			var onlyScrollPosition = this.isLeftToRight() ? 0 : maxPossibleScroll;
			return {min:onlyScrollPosition, max:onlyScrollPosition};
		}
	}, _getScrollForSelectedTab:function () {
		var w = this.scrollNode, n = this._selectedTab, scrollNodeWidth = dojo.style(this.scrollNode, "width"), scrollBounds = this._getScrollBounds();
		var pos = (n.offsetLeft + dojo.style(n, "width") / 2) - scrollNodeWidth / 2;
		pos = Math.min(Math.max(pos, scrollBounds.min), scrollBounds.max);
		return pos;
	}, createSmoothScroll:function (x) {
		if (arguments.length > 0) {
			var scrollBounds = this._getScrollBounds();
			x = Math.min(Math.max(x, scrollBounds.min), scrollBounds.max);
		} else {
			x = this._getScrollForSelectedTab();
		}
		if (this._anim && this._anim.status() == "playing") {
			this._anim.stop();
		}
		var self = this, w = this.scrollNode, anim = new dojo._Animation({beforeBegin:function () {
			if (this.curve) {
				delete this.curve;
			}
			var oldS = w.scrollLeft, newS = self._convertToScrollLeft(x);
			anim.curve = new dojo._Line(oldS, newS);
		}, onAnimate:function (val) {
			w.scrollLeft = val;
		}});
		this._anim = anim;
		this._setButtonClass(x);
		return anim;
	}, _getBtnNode:function (e) {
		var n = e.target;
		while (n && !dojo.hasClass(n, "tabStripButton")) {
			n = n.parentNode;
		}
		return n;
	}, doSlideRight:function (e) {
		this.doSlide(1, this._getBtnNode(e));
	}, doSlideLeft:function (e) {
		this.doSlide(-1, this._getBtnNode(e));
	}, doSlide:function (direction, node) {
		if (node && dojo.hasClass(node, "dijitTabDisabled")) {
			return;
		}
		var sWidth = dojo.style(this.scrollNode, "width");
		var d = (sWidth * 0.75) * direction;
		var to = this._getScroll() + d;
		this._setButtonClass(to);
		this.createSmoothScroll(to).play();
	}, _setButtonClass:function (scroll) {
		var scrollBounds = this._getScrollBounds();
		this._leftBtn.set("disabled", scroll <= scrollBounds.min);
		this._rightBtn.set("disabled", scroll >= scrollBounds.max);
	}});
	dojo.declare("dijit.layout._ScrollingTabControllerButtonMixin", null, {baseClass:"dijitTab tabStripButton", templateString:dojo.cache("dijit.layout", "templates/_ScrollingTabControllerButton.html", "<div dojoAttachEvent=\"onclick:_onClick\">\n\t<div role=\"presentation\" class=\"dijitTabInnerDiv\" dojoattachpoint=\"innerDiv,focusNode\">\n\t\t<div role=\"presentation\" class=\"dijitTabContent dijitButtonContents\" dojoattachpoint=\"tabContent\">\n\t\t\t<img role=\"presentation\" alt=\"\" src=\"${_blankGif}\" class=\"dijitTabStripIcon\" dojoAttachPoint=\"iconNode\"/>\n\t\t\t<span dojoAttachPoint=\"containerNode,titleNode\" class=\"dijitButtonText\"></span>\n\t\t</div>\n\t</div>\n</div>\n"), tabIndex:"", isFocusable:function () {
		return false;
	}});
	dojo.declare("dijit.layout._ScrollingTabControllerButton", [dijit.form.Button, dijit.layout._ScrollingTabControllerButtonMixin]);
	dojo.declare("dijit.layout._ScrollingTabControllerMenuButton", [dijit.form.Button, dijit._HasDropDown, dijit.layout._ScrollingTabControllerButtonMixin], {containerId:"", tabIndex:"-1", isLoaded:function () {
		return false;
	}, loadDropDown:function (callback) {
		this.dropDown = new dijit.Menu({id:this.containerId + "_menu", dir:this.dir, lang:this.lang, textDir:this.textDir});
		var container = dijit.byId(this.containerId);
		dojo.forEach(container.getChildren(), function (page) {
			var menuItem = new dijit.MenuItem({id:page.id + "_stcMi", label:page.title, iconClass:page.iconClass, dir:page.dir, lang:page.lang, textDir:page.textDir, onClick:function () {
				container.selectChild(page);
			}});
			this.dropDown.addChild(menuItem);
		}, this);
		callback();
	}, closeDropDown:function (focus) {
		this.inherited(arguments);
		if (this.dropDown) {
			this.dropDown.destroyRecursive();
			delete this.dropDown;
		}
	}});
}

