/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ListMouseMixin"]) {
	dojo._hasResource["dijit.form._ListMouseMixin"] = true;
	dojo.provide("dijit.form._ListMouseMixin");
	dojo.require("dijit.form._ListBase");
	dojo.declare("dijit.form._ListMouseMixin", dijit.form._ListBase, {postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onmousedown", "_onMouseDown");
		this.connect(this.domNode, "onmouseup", "_onMouseUp");
		this.connect(this.domNode, "onmouseover", "_onMouseOver");
		this.connect(this.domNode, "onmouseout", "_onMouseOut");
	}, _onMouseDown:function (evt) {
		dojo.stopEvent(evt);
		if (this._hoveredNode) {
			this.onUnhover(this._hoveredNode);
			this._hoveredNode = null;
		}
		this._isDragging = true;
		this._setSelectedAttr(this._getTarget(evt));
	}, _onMouseUp:function (evt) {
		dojo.stopEvent(evt);
		this._isDragging = false;
		var selectedNode = this._getSelectedAttr();
		var target = this._getTarget(evt);
		var hoveredNode = this._hoveredNode;
		if (selectedNode && target == selectedNode) {
			this.onClick(selectedNode);
		} else {
			if (hoveredNode && target == hoveredNode) {
				this._setSelectedAttr(hoveredNode);
				this.onClick(hoveredNode);
			}
		}
	}, _onMouseOut:function (evt) {
		if (this._hoveredNode) {
			this.onUnhover(this._hoveredNode);
			if (this._getSelectedAttr() == this._hoveredNode) {
				this.onSelect(this._hoveredNode);
			}
			this._hoveredNode = null;
		}
		if (this._isDragging) {
			this._cancelDrag = (new Date()).getTime() + 1000;
		}
	}, _onMouseOver:function (evt) {
		if (this._cancelDrag) {
			var time = (new Date()).getTime();
			if (time > this._cancelDrag) {
				this._isDragging = false;
			}
			this._cancelDrag = null;
		}
		var node = this._getTarget(evt);
		if (!node) {
			return;
		}
		if (this._hoveredNode != node) {
			if (this._hoveredNode) {
				this._onMouseOut({target:this._hoveredNode});
			}
			if (node && node.parentNode == this.containerNode) {
				if (this._isDragging) {
					this._setSelectedAttr(node);
				} else {
					this._hoveredNode = node;
					this.onHover(node);
				}
			}
		}
	}});
}

