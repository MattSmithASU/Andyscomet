/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.manager.StencilUI"]) {
	dojo._hasResource["dojox.drawing.manager.StencilUI"] = true;
	dojo.provide("dojox.drawing.manager.StencilUI");
	(function () {
		var surface, surfaceNode;
		dojox.drawing.manager.StencilUI = dojox.drawing.util.oo.declare(function (options) {
			surface = options.surface;
			this.canvas = options.canvas;
			this.defaults = dojox.drawing.defaults.copy();
			this.mouse = options.mouse;
			this.keys = options.keys;
			this._mouseHandle = this.mouse.register(this);
			this.stencils = {};
		}, {register:function (stencil) {
			this.stencils[stencil.id] = stencil;
			return stencil;
		}, onUiDown:function (obj) {
			if (!this._isStencil(obj)) {
				return;
			}
			this.stencils[obj.id].onDown(obj);
		}, onUiUp:function (obj) {
			if (!this._isStencil(obj)) {
				return;
			}
			this.stencils[obj.id].onUp(obj);
		}, onOver:function (obj) {
			if (!this._isStencil(obj)) {
				return;
			}
			this.stencils[obj.id].onOver(obj);
		}, onOut:function (obj) {
			if (!this._isStencil(obj)) {
				return;
			}
			this.stencils[obj.id].onOut(obj);
		}, _isStencil:function (obj) {
			return !!obj.id && !!this.stencils[obj.id] && this.stencils[obj.id].type == "drawing.library.UI.Button";
		}});
	})();
}

