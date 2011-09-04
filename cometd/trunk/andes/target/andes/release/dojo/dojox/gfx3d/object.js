/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx3d.object"]) {
	dojo._hasResource["dojox.gfx3d.object"] = true;
	dojo.provide("dojox.gfx3d.object");
	dojo.require("dojox.gfx");
	dojo.require("dojox.gfx3d.lighting");
	dojo.require("dojox.gfx3d.scheduler");
	dojo.require("dojox.gfx3d.vector");
	dojo.require("dojox.gfx3d.gradient");
	var out = function (o, x) {
		if (arguments.length > 1) {
			o = x;
		}
		var e = {};
		for (var i in o) {
			if (i in e) {
				continue;
			}
		}
	};
	dojo.declare("dojox.gfx3d.Object", null, {constructor:function () {
		this.object = null;
		this.matrix = null;
		this.cache = null;
		this.renderer = null;
		this.parent = null;
		this.strokeStyle = null;
		this.fillStyle = null;
		this.shape = null;
	}, setObject:function (newObject) {
		this.object = dojox.gfx.makeParameters(this.object, newObject);
		return this;
	}, setTransform:function (matrix) {
		this.matrix = dojox.gfx3d.matrix.clone(matrix ? dojox.gfx3d.matrix.normalize(matrix) : dojox.gfx3d.identity, true);
		return this;
	}, applyRightTransform:function (matrix) {
		return matrix ? this.setTransform([this.matrix, matrix]) : this;
	}, applyLeftTransform:function (matrix) {
		return matrix ? this.setTransform([matrix, this.matrix]) : this;
	}, applyTransform:function (matrix) {
		return matrix ? this.setTransform([this.matrix, matrix]) : this;
	}, setFill:function (fill) {
		this.fillStyle = fill;
		return this;
	}, setStroke:function (stroke) {
		this.strokeStyle = stroke;
		return this;
	}, toStdFill:function (lighting, normal) {
		return (this.fillStyle && typeof this.fillStyle["type"] != "undefined") ? lighting[this.fillStyle.type](normal, this.fillStyle.finish, this.fillStyle.color) : this.fillStyle;
	}, invalidate:function () {
		this.renderer.addTodo(this);
	}, destroy:function () {
		if (this.shape) {
			var p = this.shape.getParent();
			if (p) {
				p.remove(this.shape);
			}
			this.shape = null;
		}
	}, render:function (camera) {
		throw "Pure virtual function, not implemented";
	}, draw:function (lighting) {
		throw "Pure virtual function, not implemented";
	}, getZOrder:function () {
		return 0;
	}, getOutline:function () {
		return null;
	}});
	dojo.declare("dojox.gfx3d.Scene", dojox.gfx3d.Object, {constructor:function () {
		this.objects = [];
		this.todos = [];
		this.schedule = dojox.gfx3d.scheduler.zOrder;
		this._draw = dojox.gfx3d.drawer.conservative;
	}, setFill:function (fill) {
		this.fillStyle = fill;
		dojo.forEach(this.objects, function (item) {
			item.setFill(fill);
		});
		return this;
	}, setStroke:function (stroke) {
		this.strokeStyle = stroke;
		dojo.forEach(this.objects, function (item) {
			item.setStroke(stroke);
		});
		return this;
	}, render:function (camera, deep) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		if (deep) {
			this.todos = this.objects;
		}
		dojo.forEach(this.todos, function (item) {
			item.render(m, deep);
		});
	}, draw:function (lighting) {
		this.objects = this.schedule(this.objects);
		this._draw(this.todos, this.objects, this.renderer);
	}, addTodo:function (newObject) {
		if (dojo.every(this.todos, function (item) {
			return item != newObject;
		})) {
			this.todos.push(newObject);
			this.invalidate();
		}
	}, invalidate:function () {
		this.parent.addTodo(this);
	}, getZOrder:function () {
		var zOrder = 0;
		dojo.forEach(this.objects, function (item) {
			zOrder += item.getZOrder();
		});
		return (this.objects.length > 1) ? zOrder / this.objects.length : 0;
	}});
	dojo.declare("dojox.gfx3d.Edges", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultEdges);
	}, setObject:function (newObject, style) {
		this.object = dojox.gfx.makeParameters(this.object, (newObject instanceof Array) ? {points:newObject, style:style} : newObject);
		return this;
	}, getZOrder:function () {
		var zOrder = 0;
		dojo.forEach(this.cache, function (item) {
			zOrder += item.z;
		});
		return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		this.cache = dojo.map(this.object.points, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
	}, draw:function () {
		var c = this.cache;
		if (this.shape) {
			this.shape.setShape("");
		} else {
			this.shape = this.renderer.createPath();
		}
		var p = this.shape.setAbsoluteMode("absolute");
		if (this.object.style == "strip" || this.object.style == "loop") {
			p.moveTo(c[0].x, c[0].y);
			dojo.forEach(c.slice(1), function (item) {
				p.lineTo(item.x, item.y);
			});
			if (this.object.style == "loop") {
				p.closePath();
			}
		} else {
			for (var i = 0; i < this.cache.length; ) {
				p.moveTo(c[i].x, c[i].y);
				i++;
				p.lineTo(c[i].x, c[i].y);
				i++;
			}
		}
		p.setStroke(this.strokeStyle);
	}});
	dojo.declare("dojox.gfx3d.Orbit", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultOrbit);
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		var angles = [0, Math.PI / 4, Math.PI / 3];
		var center = dojox.gfx3d.matrix.multiplyPoint(m, this.object.center);
		var marks = dojo.map(angles, function (item) {
			return {x:this.center.x + this.radius * Math.cos(item), y:this.center.y + this.radius * Math.sin(item), z:this.center.z};
		}, this.object);
		marks = dojo.map(marks, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
		var normal = dojox.gfx3d.vector.normalize(marks);
		marks = dojo.map(marks, function (item) {
			return dojox.gfx3d.vector.substract(item, center);
		});
		var A = {xx:marks[0].x * marks[0].y, xy:marks[0].y * marks[0].y, xz:1, yx:marks[1].x * marks[1].y, yy:marks[1].y * marks[1].y, yz:1, zx:marks[2].x * marks[2].y, zy:marks[2].y * marks[2].y, zz:1, dx:0, dy:0, dz:0};
		var B = dojo.map(marks, function (item) {
			return -Math.pow(item.x, 2);
		});
		var X = dojox.gfx3d.matrix.multiplyPoint(dojox.gfx3d.matrix.invert(A), B[0], B[1], B[2]);
		var theta = Math.atan2(X.x, 1 - X.y) / 2;
		var probes = dojo.map(marks, function (item) {
			return dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.rotate(-theta), item.x, item.y);
		});
		var a = Math.pow(probes[0].x, 2);
		var b = Math.pow(probes[0].y, 2);
		var c = Math.pow(probes[1].x, 2);
		var d = Math.pow(probes[1].y, 2);
		var rx = Math.sqrt((a * d - b * c) / (d - b));
		var ry = Math.sqrt((a * d - b * c) / (a - c));
		this.cache = {cx:center.x, cy:center.y, rx:rx, ry:ry, theta:theta, normal:normal};
	}, draw:function (lighting) {
		if (this.shape) {
			this.shape.setShape(this.cache);
		} else {
			this.shape = this.renderer.createEllipse(this.cache);
		}
		this.shape.applyTransform(dojox.gfx.matrix.rotateAt(this.cache.theta, this.cache.cx, this.cache.cy)).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, this.cache.normal));
	}});
	dojo.declare("dojox.gfx3d.Path3d", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultPath3d);
		this.segments = [];
		this.absolute = true;
		this.last = {};
		this.path = "";
	}, _collectArgs:function (array, args) {
		for (var i = 0; i < args.length; ++i) {
			var t = args[i];
			if (typeof (t) == "boolean") {
				array.push(t ? 1 : 0);
			} else {
				if (typeof (t) == "number") {
					array.push(t);
				} else {
					if (t instanceof Array) {
						this._collectArgs(array, t);
					} else {
						if ("x" in t && "y" in t) {
							array.push(t.x);
							array.push(t.y);
						}
					}
				}
			}
		}
	}, _validSegments:{m:3, l:3, z:0}, _pushSegment:function (action, args) {
		var group = this._validSegments[action.toLowerCase()], segment;
		if (typeof (group) == "number") {
			if (group) {
				if (args.length >= group) {
					segment = {action:action, args:args.slice(0, args.length - args.length % group)};
					this.segments.push(segment);
				}
			} else {
				segment = {action:action, args:[]};
				this.segments.push(segment);
			}
		}
	}, moveTo:function () {
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "M" : "m", args);
		return this;
	}, lineTo:function () {
		var args = [];
		this._collectArgs(args, arguments);
		this._pushSegment(this.absolute ? "L" : "l", args);
		return this;
	}, closePath:function () {
		this._pushSegment("Z", []);
		return this;
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		var path = "";
		var _validSegments = this._validSegments;
		dojo.forEach(this.segments, function (item) {
			path += item.action;
			for (var i = 0; i < item.args.length; i += _validSegments[item.action.toLowerCase()]) {
				var pt = dojox.gfx3d.matrix.multiplyPoint(m, item.args[i], item.args[i + 1], item.args[i + 2]);
				path += " " + pt.x + " " + pt.y;
			}
		});
		this.cache = path;
	}, _draw:function () {
		return this.parent.createPath(this.cache);
	}});
	dojo.declare("dojox.gfx3d.Triangles", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultTriangles);
	}, setObject:function (newObject, style) {
		if (newObject instanceof Array) {
			this.object = dojox.gfx.makeParameters(this.object, {points:newObject, style:style});
		} else {
			this.object = dojox.gfx.makeParameters(this.object, newObject);
		}
		return this;
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		var c = dojo.map(this.object.points, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
		this.cache = [];
		var pool = c.slice(0, 2);
		var center = c[0];
		if (this.object.style == "strip") {
			dojo.forEach(c.slice(2), function (item) {
				pool.push(item);
				pool.push(pool[0]);
				this.cache.push(pool);
				pool = pool.slice(1, 3);
			}, this);
		} else {
			if (this.object.style == "fan") {
				dojo.forEach(c.slice(2), function (item) {
					pool.push(item);
					pool.push(center);
					this.cache.push(pool);
					pool = [center, item];
				}, this);
			} else {
				for (var i = 0; i < c.length; ) {
					this.cache.push([c[i], c[i + 1], c[i + 2], c[i]]);
					i += 3;
				}
			}
		}
	}, draw:function (lighting) {
		this.cache = dojox.gfx3d.scheduler.bsp(this.cache, function (it) {
			return it;
		});
		if (this.shape) {
			this.shape.clear();
		} else {
			this.shape = this.renderer.createGroup();
		}
		dojo.forEach(this.cache, function (item) {
			this.shape.createPolyline(item).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, dojox.gfx3d.vector.normalize(item)));
		}, this);
	}, getZOrder:function () {
		var zOrder = 0;
		dojo.forEach(this.cache, function (item) {
			zOrder += (item[0].z + item[1].z + item[2].z) / 3;
		});
		return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
	}});
	dojo.declare("dojox.gfx3d.Quads", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultQuads);
	}, setObject:function (newObject, style) {
		this.object = dojox.gfx.makeParameters(this.object, (newObject instanceof Array) ? {points:newObject, style:style} : newObject);
		return this;
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix), i;
		var c = dojo.map(this.object.points, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
		this.cache = [];
		if (this.object.style == "strip") {
			var pool = c.slice(0, 2);
			for (i = 2; i < c.length; ) {
				pool = pool.concat([c[i], c[i + 1], pool[0]]);
				this.cache.push(pool);
				pool = pool.slice(2, 4);
				i += 2;
			}
		} else {
			for (i = 0; i < c.length; ) {
				this.cache.push([c[i], c[i + 1], c[i + 2], c[i + 3], c[i]]);
				i += 4;
			}
		}
	}, draw:function (lighting) {
		this.cache = dojox.gfx3d.scheduler.bsp(this.cache, function (it) {
			return it;
		});
		if (this.shape) {
			this.shape.clear();
		} else {
			this.shape = this.renderer.createGroup();
		}
		for (var x = 0; x < this.cache.length; x++) {
			this.shape.createPolyline(this.cache[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, dojox.gfx3d.vector.normalize(this.cache[x])));
		}
	}, getZOrder:function () {
		var zOrder = 0;
		for (var x = 0; x < this.cache.length; x++) {
			var i = this.cache[x];
			zOrder += (i[0].z + i[1].z + i[2].z + i[3].z) / 4;
		}
		return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
	}});
	dojo.declare("dojox.gfx3d.Polygon", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultPolygon);
	}, setObject:function (newObject) {
		this.object = dojox.gfx.makeParameters(this.object, (newObject instanceof Array) ? {path:newObject} : newObject);
		return this;
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		this.cache = dojo.map(this.object.path, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
		this.cache.push(this.cache[0]);
	}, draw:function (lighting) {
		if (this.shape) {
			this.shape.setShape({points:this.cache});
		} else {
			this.shape = this.renderer.createPolyline({points:this.cache});
		}
		this.shape.setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, dojox.gfx3d.matrix.normalize(this.cache)));
	}, getZOrder:function () {
		var zOrder = 0;
		for (var x = 0; x < this.cache.length; x++) {
			zOrder += this.cache[x].z;
		}
		return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
	}, getOutline:function () {
		return this.cache.slice(0, 3);
	}});
	dojo.declare("dojox.gfx3d.Cube", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultCube);
		this.polygons = [];
	}, setObject:function (newObject) {
		this.object = dojox.gfx.makeParameters(this.object, newObject);
	}, render:function (camera) {
		var a = this.object.top;
		var g = this.object.bottom;
		var b = {x:g.x, y:a.y, z:a.z};
		var c = {x:g.x, y:g.y, z:a.z};
		var d = {x:a.x, y:g.y, z:a.z};
		var e = {x:a.x, y:a.y, z:g.z};
		var f = {x:g.x, y:a.y, z:g.z};
		var h = {x:a.x, y:g.y, z:g.z};
		var polygons = [a, b, c, d, e, f, g, h];
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		var p = dojo.map(polygons, function (item) {
			return dojox.gfx3d.matrix.multiplyPoint(m, item);
		});
		a = p[0];
		b = p[1];
		c = p[2];
		d = p[3];
		e = p[4];
		f = p[5];
		g = p[6];
		h = p[7];
		this.cache = [[a, b, c, d, a], [e, f, g, h, e], [a, d, h, e, a], [d, c, g, h, d], [c, b, f, g, c], [b, a, e, f, b]];
	}, draw:function (lighting) {
		this.cache = dojox.gfx3d.scheduler.bsp(this.cache, function (it) {
			return it;
		});
		var cache = this.cache.slice(3);
		if (this.shape) {
			this.shape.clear();
		} else {
			this.shape = this.renderer.createGroup();
		}
		for (var x = 0; x < cache.length; x++) {
			this.shape.createPolyline(cache[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, dojox.gfx3d.vector.normalize(cache[x])));
		}
	}, getZOrder:function () {
		var top = this.cache[0][0];
		var bottom = this.cache[1][2];
		return (top.z + bottom.z) / 2;
	}});
	dojo.declare("dojox.gfx3d.Cylinder", dojox.gfx3d.Object, {constructor:function () {
		this.object = dojo.clone(dojox.gfx3d.defaultCylinder);
	}, render:function (camera) {
		var m = dojox.gfx3d.matrix.multiply(camera, this.matrix);
		var angles = [0, Math.PI / 4, Math.PI / 3];
		var center = dojox.gfx3d.matrix.multiplyPoint(m, this.object.center);
		var marks = dojo.map(angles, function (item) {
			return {x:this.center.x + this.radius * Math.cos(item), y:this.center.y + this.radius * Math.sin(item), z:this.center.z};
		}, this.object);
		marks = dojo.map(marks, function (item) {
			return dojox.gfx3d.vector.substract(dojox.gfx3d.matrix.multiplyPoint(m, item), center);
		});
		var A = {xx:marks[0].x * marks[0].y, xy:marks[0].y * marks[0].y, xz:1, yx:marks[1].x * marks[1].y, yy:marks[1].y * marks[1].y, yz:1, zx:marks[2].x * marks[2].y, zy:marks[2].y * marks[2].y, zz:1, dx:0, dy:0, dz:0};
		var B = dojo.map(marks, function (item) {
			return -Math.pow(item.x, 2);
		});
		var X = dojox.gfx3d.matrix.multiplyPoint(dojox.gfx3d.matrix.invert(A), B[0], B[1], B[2]);
		var theta = Math.atan2(X.x, 1 - X.y) / 2;
		var probes = dojo.map(marks, function (item) {
			return dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.rotate(-theta), item.x, item.y);
		});
		var a = Math.pow(probes[0].x, 2);
		var b = Math.pow(probes[0].y, 2);
		var c = Math.pow(probes[1].x, 2);
		var d = Math.pow(probes[1].y, 2);
		var rx = Math.sqrt((a * d - b * c) / (d - b));
		var ry = Math.sqrt((a * d - b * c) / (a - c));
		if (rx < ry) {
			var t = rx;
			rx = ry;
			ry = t;
			theta -= Math.PI / 2;
		}
		var top = dojox.gfx3d.matrix.multiplyPoint(m, dojox.gfx3d.vector.sum(this.object.center, {x:0, y:0, z:this.object.height}));
		var gradient = this.fillStyle.type == "constant" ? this.fillStyle.color : dojox.gfx3d.gradient(this.renderer.lighting, this.fillStyle, this.object.center, this.object.radius, Math.PI, 2 * Math.PI, m);
		if (isNaN(rx) || isNaN(ry) || isNaN(theta)) {
			rx = this.object.radius, ry = 0, theta = 0;
		}
		this.cache = {center:center, top:top, rx:rx, ry:ry, theta:theta, gradient:gradient};
	}, draw:function () {
		var c = this.cache, v = dojox.gfx3d.vector, m = dojox.gfx.matrix, centers = [c.center, c.top], normal = v.substract(c.top, c.center);
		if (v.dotProduct(normal, this.renderer.lighting.incident) > 0) {
			centers = [c.top, c.center];
			normal = v.substract(c.center, c.top);
		}
		var color = this.renderer.lighting[this.fillStyle.type](normal, this.fillStyle.finish, this.fillStyle.color), d = Math.sqrt(Math.pow(c.center.x - c.top.x, 2) + Math.pow(c.center.y - c.top.y, 2));
		if (this.shape) {
			this.shape.clear();
		} else {
			this.shape = this.renderer.createGroup();
		}
		this.shape.createPath("").moveTo(0, -c.rx).lineTo(d, -c.rx).lineTo(d, c.rx).lineTo(0, c.rx).arcTo(c.ry, c.rx, 0, true, true, 0, -c.rx).setFill(c.gradient).setStroke(this.strokeStyle).setTransform([m.translate(centers[0]), m.rotate(Math.atan2(centers[1].y - centers[0].y, centers[1].x - centers[0].x))]);
		if (c.rx > 0 && c.ry > 0) {
			this.shape.createEllipse({cx:centers[1].x, cy:centers[1].y, rx:c.rx, ry:c.ry}).setFill(color).setStroke(this.strokeStyle).applyTransform(m.rotateAt(c.theta, centers[1]));
		}
	}});
	dojo.declare("dojox.gfx3d.Viewport", dojox.gfx.Group, {constructor:function () {
		this.dimension = null;
		this.objects = [];
		this.todos = [];
		this.renderer = this;
		this.schedule = dojox.gfx3d.scheduler.zOrder;
		this.draw = dojox.gfx3d.drawer.conservative;
		this.deep = false;
		this.lights = [];
		this.lighting = null;
	}, setCameraTransform:function (matrix) {
		this.camera = dojox.gfx3d.matrix.clone(matrix ? dojox.gfx3d.matrix.normalize(matrix) : dojox.gfx3d.identity, true);
		this.invalidate();
		return this;
	}, applyCameraRightTransform:function (matrix) {
		return matrix ? this.setCameraTransform([this.camera, matrix]) : this;
	}, applyCameraLeftTransform:function (matrix) {
		return matrix ? this.setCameraTransform([matrix, this.camera]) : this;
	}, applyCameraTransform:function (matrix) {
		return this.applyCameraRightTransform(matrix);
	}, setLights:function (lights, ambient, specular) {
		this.lights = (lights instanceof Array) ? {sources:lights, ambient:ambient, specular:specular} : lights;
		var view = {x:0, y:0, z:1};
		this.lighting = new dojox.gfx3d.lighting.Model(view, this.lights.sources, this.lights.ambient, this.lights.specular);
		this.invalidate();
		return this;
	}, addLights:function (lights) {
		return this.setLights(this.lights.sources.concat(lights));
	}, addTodo:function (newObject) {
		if (dojo.every(this.todos, function (item) {
			return item != newObject;
		})) {
			this.todos.push(newObject);
		}
	}, invalidate:function () {
		this.deep = true;
		this.todos = this.objects;
	}, setDimensions:function (dim) {
		if (dim) {
			var w = dojo.isString(dim.width) ? parseInt(dim.width) : dim.width;
			var h = dojo.isString(dim.height) ? parseInt(dim.height) : dim.height;
			if (this.rawNode) {
				var trs = this.rawNode.style;
				trs.height = h;
				trs.width = w;
			}
			this.dimension = {width:w, height:h};
		} else {
			this.dimension = null;
		}
	}, render:function () {
		if (!this.todos.length) {
			return;
		}
		var m = dojox.gfx3d.matrix;
		for (var x = 0; x < this.todos.length; x++) {
			this.todos[x].render(dojox.gfx3d.matrix.normalize([m.cameraRotateXg(180), m.cameraTranslate(0, this.dimension.height, 0), this.camera]), this.deep);
		}
		this.objects = this.schedule(this.objects);
		this.draw(this.todos, this.objects, this);
		this.todos = [];
		this.deep = false;
	}});
	dojox.gfx3d.Viewport.nodeType = dojox.gfx.Group.nodeType;
	dojox.gfx3d._creators = {createEdges:function (edges, style) {
		return this.create3DObject(dojox.gfx3d.Edges, edges, style);
	}, createTriangles:function (tris, style) {
		return this.create3DObject(dojox.gfx3d.Triangles, tris, style);
	}, createQuads:function (quads, style) {
		return this.create3DObject(dojox.gfx3d.Quads, quads, style);
	}, createPolygon:function (points) {
		return this.create3DObject(dojox.gfx3d.Polygon, points);
	}, createOrbit:function (orbit) {
		return this.create3DObject(dojox.gfx3d.Orbit, orbit);
	}, createCube:function (cube) {
		return this.create3DObject(dojox.gfx3d.Cube, cube);
	}, createCylinder:function (cylinder) {
		return this.create3DObject(dojox.gfx3d.Cylinder, cylinder);
	}, createPath3d:function (path) {
		return this.create3DObject(dojox.gfx3d.Path3d, path);
	}, createScene:function () {
		return this.create3DObject(dojox.gfx3d.Scene);
	}, create3DObject:function (objectType, rawObject, style) {
		var obj = new objectType();
		this.adopt(obj);
		if (rawObject) {
			obj.setObject(rawObject, style);
		}
		return obj;
	}, adopt:function (obj) {
		obj.renderer = this.renderer;
		obj.parent = this;
		this.objects.push(obj);
		this.addTodo(obj);
		return this;
	}, abandon:function (obj, silently) {
		for (var i = 0; i < this.objects.length; ++i) {
			if (this.objects[i] == obj) {
				this.objects.splice(i, 1);
			}
		}
		obj.parent = null;
		return this;
	}, setScheduler:function (scheduler) {
		this.schedule = scheduler;
	}, setDrawer:function (drawer) {
		this.draw = drawer;
	}};
	dojo.extend(dojox.gfx3d.Viewport, dojox.gfx3d._creators);
	dojo.extend(dojox.gfx3d.Scene, dojox.gfx3d._creators);
	delete dojox.gfx3d._creators;
	dojo.extend(dojox.gfx.Surface, {createViewport:function () {
		var viewport = this.createObject(dojox.gfx3d.Viewport, null, true);
		viewport.setDimensions(this.getDimensions());
		return viewport;
	}});
}

