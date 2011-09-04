/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx3d.scheduler"]) {
	dojo._hasResource["dojox.gfx3d.scheduler"] = true;
	dojo.provide("dojox.gfx3d.scheduler");
	dojo.provide("dojox.gfx3d.drawer");
	dojo.require("dojox.gfx3d.vector");
	dojo.mixin(dojox.gfx3d.scheduler, {zOrder:function (buffer, order) {
		order = order ? order : dojox.gfx3d.scheduler.order;
		buffer.sort(function (a, b) {
			return order(b) - order(a);
		});
		return buffer;
	}, bsp:function (buffer, outline) {
		outline = outline ? outline : dojox.gfx3d.scheduler.outline;
		var p = new dojox.gfx3d.scheduler.BinarySearchTree(buffer[0], outline);
		dojo.forEach(buffer.slice(1), function (item) {
			p.add(item, outline);
		});
		return p.iterate(outline);
	}, order:function (it) {
		return it.getZOrder();
	}, outline:function (it) {
		return it.getOutline();
	}});
	dojo.declare("dojox.gfx3d.scheduler.BinarySearchTree", null, {constructor:function (obj, outline) {
		this.plus = null;
		this.minus = null;
		this.object = obj;
		var o = outline(obj);
		this.orient = o[0];
		this.normal = dojox.gfx3d.vector.normalize(o);
	}, add:function (obj, outline) {
		var epsilon = 0.5, o = outline(obj), v = dojox.gfx3d.vector, n = this.normal, a = this.orient, BST = dojox.gfx3d.scheduler.BinarySearchTree;
		if (dojo.every(o, function (item) {
			return Math.floor(epsilon + v.dotProduct(n, v.substract(item, a))) <= 0;
		})) {
			if (this.minus) {
				this.minus.add(obj, outline);
			} else {
				this.minus = new BST(obj, outline);
			}
		} else {
			if (dojo.every(o, function (item) {
				return Math.floor(epsilon + v.dotProduct(n, v.substract(item, a))) >= 0;
			})) {
				if (this.plus) {
					this.plus.add(obj, outline);
				} else {
					this.plus = new BST(obj, outline);
				}
			} else {
				throw "The case: polygon cross siblings' plate is not implemneted yet";
			}
		}
	}, iterate:function (outline) {
		var epsilon = 0.5;
		var v = dojox.gfx3d.vector;
		var sorted = [];
		var subs = null;
		var view = {x:0, y:0, z:-10000};
		if (Math.floor(epsilon + v.dotProduct(this.normal, v.substract(view, this.orient))) <= 0) {
			subs = [this.plus, this.minus];
		} else {
			subs = [this.minus, this.plus];
		}
		if (subs[0]) {
			sorted = sorted.concat(subs[0].iterate());
		}
		sorted.push(this.object);
		if (subs[1]) {
			sorted = sorted.concat(subs[1].iterate());
		}
		return sorted;
	}});
	dojo.mixin(dojox.gfx3d.drawer, {conservative:function (todos, objects, viewport) {
		dojo.forEach(this.objects, function (item) {
			item.destroy();
		});
		dojo.forEach(objects, function (item) {
			item.draw(viewport.lighting);
		});
	}, chart:function (todos, objects, viewport) {
		dojo.forEach(this.todos, function (item) {
			item.draw(viewport.lighting);
		});
	}});
}

