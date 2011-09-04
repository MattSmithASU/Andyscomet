/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.AccordionContainer"]) {
	dojo._hasResource["dijit.layout.AccordionContainer"] = true;
	dojo.provide("dijit.layout.AccordionContainer");
	dojo.require("dijit._Container");
	dojo.require("dijit._TemplatedMixin");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.layout.AccordionPane");
	dojo.declare("dijit.layout.AccordionContainer", dijit.layout.StackContainer, {duration:dijit.defaultDuration, buttonWidget:"dijit.layout._AccordionButton", baseClass:"dijitAccordionContainer", buildRendering:function () {
		this.inherited(arguments);
		this.domNode.style.overflow = "hidden";
		dijit.setWaiRole(this.domNode, "tablist");
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		if (this.selectedChildWidget) {
			var style = this.selectedChildWidget.containerNode.style;
			style.display = "";
			style.overflow = "auto";
			this.selectedChildWidget._wrapperWidget.set("selected", true);
		}
	}, layout:function () {
		var openPane = this.selectedChildWidget;
		if (!openPane) {
			return;
		}
		var wrapperDomNode = openPane._wrapperWidget.domNode, wrapperDomNodeMargin = dojo._getMarginExtents(wrapperDomNode), wrapperDomNodePadBorder = dojo._getPadBorderExtents(wrapperDomNode), wrapperContainerNode = openPane._wrapperWidget.containerNode, wrapperContainerNodeMargin = dojo._getMarginExtents(wrapperContainerNode), wrapperContainerNodePadBorder = dojo._getPadBorderExtents(wrapperContainerNode), mySize = this._contentBox;
		var totalCollapsedHeight = 0;
		dojo.forEach(this.getChildren(), function (child) {
			if (child != openPane) {
				totalCollapsedHeight += dojo._getMarginSize(child._wrapperWidget.domNode).h;
			}
		});
		this._verticalSpace = mySize.h - totalCollapsedHeight - wrapperDomNodeMargin.h - wrapperDomNodePadBorder.h - wrapperContainerNodeMargin.h - wrapperContainerNodePadBorder.h - openPane._buttonWidget.getTitleHeight();
		this._containerContentBox = {h:this._verticalSpace, w:this._contentBox.w - wrapperDomNodeMargin.w - wrapperDomNodePadBorder.w - wrapperContainerNodeMargin.w - wrapperContainerNodePadBorder.w};
		if (openPane) {
			openPane.resize(this._containerContentBox);
		}
	}, _setupChild:function (child) {
		child._wrapperWidget = new dijit.layout._AccordionInnerContainer({contentWidget:child, buttonWidget:this.buttonWidget, id:child.id + "_wrapper", dir:child.dir, lang:child.lang, textDir:child.textDir, parent:this});
		this.inherited(arguments);
	}, addChild:function (child, insertIndex) {
		if (this._started) {
			dojo.place(child.domNode, this.containerNode, insertIndex);
			if (!child._started) {
				child.startup();
			}
			this._setupChild(child);
			dojo.publish(this.id + "-addChild", [child, insertIndex]);
			this.layout();
			if (!this.selectedChildWidget) {
				this.selectChild(child);
			}
		} else {
			this.inherited(arguments);
		}
	}, removeChild:function (child) {
		if (child._wrapperWidget) {
			dojo.place(child.domNode, child._wrapperWidget.domNode, "after");
			child._wrapperWidget.destroy();
			delete child._wrapperWidget;
		}
		dojo.removeClass(child.domNode, "dijitHidden");
		this.inherited(arguments);
	}, getChildren:function () {
		return dojo.map(this.inherited(arguments), function (child) {
			return child.declaredClass == "dijit.layout._AccordionInnerContainer" ? child.contentWidget : child;
		}, this);
	}, destroy:function () {
		if (this._animation) {
			this._animation.stop();
		}
		dojo.forEach(this.getChildren(), function (child) {
			if (child._wrapperWidget) {
				child._wrapperWidget.destroy();
			} else {
				child.destroyRecursive();
			}
		});
		this.inherited(arguments);
	}, _showChild:function (child) {
		child._wrapperWidget.containerNode.style.display = "block";
		return this.inherited(arguments);
	}, _hideChild:function (child) {
		child._wrapperWidget.containerNode.style.display = "none";
		this.inherited(arguments);
	}, _transition:function (newWidget, oldWidget, animate) {
		if (dojo.isIE < 8) {
			animate = false;
		}
		if (this._animation) {
			this._animation.stop(true);
			delete this._animation;
		}
		var self = this;
		if (newWidget) {
			newWidget._wrapperWidget.set("selected", true);
			var d = this._showChild(newWidget);
			if (this.doLayout && newWidget.resize) {
				newWidget.resize(this._containerContentBox);
			}
		}
		if (oldWidget) {
			oldWidget._wrapperWidget.set("selected", false);
			if (!animate) {
				this._hideChild(oldWidget);
			}
		}
		if (animate) {
			var newContents = newWidget._wrapperWidget.containerNode, oldContents = oldWidget._wrapperWidget.containerNode;
			var wrapperContainerNode = newWidget._wrapperWidget.containerNode, wrapperContainerNodeMargin = dojo._getMarginExtents(wrapperContainerNode), wrapperContainerNodePadBorder = dojo._getPadBorderExtents(wrapperContainerNode), animationHeightOverhead = wrapperContainerNodeMargin.h + wrapperContainerNodePadBorder.h;
			oldContents.style.height = (self._verticalSpace - animationHeightOverhead) + "px";
			this._animation = new dojo.Animation({node:newContents, duration:this.duration, curve:[1, this._verticalSpace - animationHeightOverhead - 1], onAnimate:function (value) {
				value = Math.floor(value);
				newContents.style.height = value + "px";
				oldContents.style.height = (self._verticalSpace - animationHeightOverhead - value) + "px";
			}, onEnd:function () {
				delete self._animation;
				newContents.style.height = "auto";
				oldWidget._wrapperWidget.containerNode.style.display = "none";
				oldContents.style.height = "auto";
				self._hideChild(oldWidget);
			}});
			this._animation.onStop = this._animation.onEnd;
			this._animation.play();
		}
		return d;
	}, _onKeyPress:function (e, fromTitle) {
		if (this.disabled || e.altKey || !(fromTitle || e.ctrlKey)) {
			return;
		}
		var k = dojo.keys, c = e.charOrCode;
		if ((fromTitle && (c == k.LEFT_ARROW || c == k.UP_ARROW)) || (e.ctrlKey && c == k.PAGE_UP)) {
			this._adjacent(false)._buttonWidget._onTitleClick();
			dojo.stopEvent(e);
		} else {
			if ((fromTitle && (c == k.RIGHT_ARROW || c == k.DOWN_ARROW)) || (e.ctrlKey && (c == k.PAGE_DOWN || c == k.TAB))) {
				this._adjacent(true)._buttonWidget._onTitleClick();
				dojo.stopEvent(e);
			}
		}
	}});
	dojo.declare("dijit.layout._AccordionInnerContainer", [dijit._Widget, dijit._CssStateMixin], {baseClass:"dijitAccordionInnerContainer", isContainer:true, isLayoutContainer:true, buildRendering:function () {
		this.domNode = dojo.place("<div class='" + this.baseClass + "'>", this.contentWidget.domNode, "after");
		var child = this.contentWidget, cls = dojo.getObject(this.buttonWidget);
		this.button = child._buttonWidget = (new cls({contentWidget:child, label:child.title, title:child.tooltip, dir:child.dir, lang:child.lang, textDir:child.textDir, iconClass:child.iconClass, id:child.id + "_button", parent:this.parent})).placeAt(this.domNode);
		this.containerNode = dojo.place("<div class='dijitAccordionChildWrapper' style='display:none'>", this.domNode);
		dojo.place(this.contentWidget.domNode, this.containerNode);
	}, postCreate:function () {
		this.inherited(arguments);
		var button = this.button;
		this._contentWidgetWatches = [this.contentWidget.watch("title", dojo.hitch(this, function (name, oldValue, newValue) {
			button.set("label", newValue);
		})), this.contentWidget.watch("tooltip", dojo.hitch(this, function (name, oldValue, newValue) {
			button.set("title", newValue);
		})), this.contentWidget.watch("iconClass", dojo.hitch(this, function (name, oldValue, newValue) {
			button.set("iconClass", newValue);
		}))];
	}, _setSelectedAttr:function (isSelected) {
		this._set("selected", isSelected);
		this.button.set("selected", isSelected);
		if (isSelected) {
			var cw = this.contentWidget;
			if (cw.onSelected) {
				cw.onSelected();
			}
		}
	}, startup:function () {
		this.contentWidget.startup();
	}, destroy:function () {
		this.button.destroyRecursive();
		dojo.forEach(this._contentWidgetWatches || [], function (w) {
			w.unwatch();
		});
		delete this.contentWidget._buttonWidget;
		delete this.contentWidget._wrapperWidget;
		this.inherited(arguments);
	}, destroyDescendants:function () {
		this.contentWidget.destroyRecursive();
	}});
	dojo.declare("dijit.layout._AccordionButton", [dijit._Widget, dijit._TemplatedMixin, dijit._CssStateMixin], {templateString:dojo.cache("dijit.layout", "templates/AccordionButton.html", "<div dojoAttachEvent='onclick:_onTitleClick' class='dijitAccordionTitle'>\n\t<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='onkeypress:_onTitleKeyPress'\n\t\t\tclass='dijitAccordionTitleFocus' role=\"tab\" aria-expanded=\"false\"\n\t\t><span class='dijitInline dijitAccordionArrow' role=\"presentation\"></span\n\t\t><span class='arrowTextUp' role=\"presentation\">+</span\n\t\t><span class='arrowTextDown' role=\"presentation\">-</span\n\t\t><img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon\" dojoAttachPoint='iconNode' style=\"vertical-align: middle\" role=\"presentation\"/>\n\t\t<span role=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>\n\t</div>\n</div>\n"), label:"", _setLabelAttr:{node:"titleTextNode", type:"innerHTML"}, title:"", _setTitleAttr:{node:"titleTextNode", type:"attribute", attribute:"title"}, iconClassAttr:"", _setIconClassAttr:{node:"iconNode", type:"class"}, baseClass:"dijitAccordionTitle", getParent:function () {
		return this.parent;
	}, buildRendering:function () {
		this.inherited(arguments);
		var titleTextNodeId = this.id.replace(" ", "_");
		dojo.attr(this.titleTextNode, "id", titleTextNodeId + "_title");
		dijit.setWaiState(this.focusNode, "labelledby", dojo.attr(this.titleTextNode, "id"));
		dojo.setSelectable(this.domNode, false);
	}, getTitleHeight:function () {
		return dojo._getMarginSize(this.domNode).h;
	}, _onTitleClick:function () {
		var parent = this.getParent();
		parent.selectChild(this.contentWidget, true);
		dijit.focus(this.focusNode);
	}, _onTitleKeyPress:function (evt) {
		return this.getParent()._onKeyPress(evt, this.contentWidget);
	}, _setSelectedAttr:function (isSelected) {
		this._set("selected", isSelected);
		dijit.setWaiState(this.focusNode, "expanded", isSelected);
		dijit.setWaiState(this.focusNode, "selected", isSelected);
		this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
	}});
}

