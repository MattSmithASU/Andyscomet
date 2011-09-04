/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.utils"]) {
	dojo._hasResource["dojox.gfx.utils"] = true;
	dojo.provide("dojox.gfx.utils");
	dojo.require("dojox.gfx");
	(function () {
		var d = dojo, g = dojox.gfx, gu = g.utils;
		dojo.mixin(gu, {forEach:function (object, f, o) {
			o = o || d.global;
			f.call(o, object);
			if (object instanceof g.Surface || object instanceof g.Group) {
				d.forEach(object.children, function (shape) {
					gu.forEach(shape, f, o);
				});
			}
		}, serialize:function (object) {
			var t = {}, v, isSurface = object instanceof g.Surface;
			if (isSurface || object instanceof g.Group) {
				t.children = d.map(object.children, gu.serialize);
				if (isSurface) {
					return t.children;
				}
			} else {
				t.shape = object.getShape();
			}
			if (object.getTransform) {
				v = object.getTransform();
				if (v) {
					t.transform = v;
				}
			}
			if (object.getStroke) {
				v = object.getStroke();
				if (v) {
					t.stroke = v;
				}
			}
			if (object.getFill) {
				v = object.getFill();
				if (v) {
					t.fill = v;
				}
			}
			if (object.getFont) {
				v = object.getFont();
				if (v) {
					t.font = v;
				}
			}
			return t;
		}, toJson:function (object, prettyPrint) {
			return d.toJson(gu.serialize(object), prettyPrint);
		}, deserialize:function (parent, object) {
			if (object instanceof Array) {
				return d.map(object, d.hitch(null, gu.deserialize, parent));
			}
			var shape = ("shape" in object) ? parent.createShape(object.shape) : parent.createGroup();
			if ("transform" in object) {
				shape.setTransform(object.transform);
			}
			if ("stroke" in object) {
				shape.setStroke(object.stroke);
			}
			if ("fill" in object) {
				shape.setFill(object.fill);
			}
			if ("font" in object) {
				shape.setFont(object.font);
			}
			if ("children" in object) {
				d.forEach(object.children, d.hitch(null, gu.deserialize, shape));
			}
			return shape;
		}, fromJson:function (parent, json) {
			return gu.deserialize(parent, d.fromJson(json));
		}, toSvg:function (surface) {
			var deferred = new dojo.Deferred();
			if (dojox.gfx.renderer === "svg") {
				try {
					var svg = gu._cleanSvg(gu._innerXML(surface.rawNode));
					deferred.callback(svg);
				}
				catch (e) {
					deferred.errback(e);
				}
			} else {
				if (!gu._initSvgSerializerDeferred) {
					gu._initSvgSerializer();
				}
				var jsonForm = dojox.gfx.utils.toJson(surface);
				var serializer = function () {
					try {
						var sDim = surface.getDimensions();
						var width = sDim.width;
						var height = sDim.height;
						var node = gu._gfxSvgProxy.document.createElement("div");
						gu._gfxSvgProxy.document.body.appendChild(node);
						dojo.withDoc(gu._gfxSvgProxy.document, function () {
							dojo.style(node, "width", width);
							dojo.style(node, "height", height);
						}, this);
						var ts = gu._gfxSvgProxy[dojox._scopeName].gfx.createSurface(node, width, height);
						var draw = function (surface) {
							try {
								gu._gfxSvgProxy[dojox._scopeName].gfx.utils.fromJson(surface, jsonForm);
								var svg = gu._cleanSvg(node.innerHTML);
								surface.clear();
								surface.destroy();
								gu._gfxSvgProxy.document.body.removeChild(node);
								deferred.callback(svg);
							}
							catch (e) {
								deferred.errback(e);
							}
						};
						ts.whenLoaded(null, draw);
					}
					catch (ex) {
						deferred.errback(ex);
					}
				};
				if (gu._initSvgSerializerDeferred.fired > 0) {
					serializer();
				} else {
					gu._initSvgSerializerDeferred.addCallback(serializer);
				}
			}
			return deferred;
		}, _gfxSvgProxy:null, _initSvgSerializerDeferred:null, _svgSerializerInitialized:function () {
			gu._initSvgSerializerDeferred.callback(true);
		}, _initSvgSerializer:function () {
			if (!gu._initSvgSerializerDeferred) {
				gu._initSvgSerializerDeferred = new dojo.Deferred();
				var f = dojo.doc.createElement("iframe");
				dojo.style(f, {display:"none", position:"absolute", width:"1em", height:"1em", top:"-10000px"});
				var intv;
				if (dojo.isIE) {
					f.onreadystatechange = function () {
						if (f.contentWindow.document.readyState == "complete") {
							f.onreadystatechange = function () {
							};
							intv = setInterval(function () {
								if (f.contentWindow[dojo._scopeName] && f.contentWindow[dojox._scopeName].gfx && f.contentWindow[dojox._scopeName].gfx.utils) {
									clearInterval(intv);
									f.contentWindow.parent[dojox._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
									f.contentWindow.parent[dojox._scopeName].gfx.utils._svgSerializerInitialized();
								}
							}, 50);
						}
					};
				} else {
					f.onload = function () {
						f.onload = function () {
						};
						intv = setInterval(function () {
							if (f.contentWindow[dojo._scopeName] && f.contentWindow[dojox._scopeName].gfx && f.contentWindow[dojox._scopeName].gfx.utils) {
								clearInterval(intv);
								f.contentWindow.parent[dojox._scopeName].gfx.utils._gfxSvgProxy = f.contentWindow;
								f.contentWindow.parent[dojox._scopeName].gfx.utils._svgSerializerInitialized();
							}
						}, 50);
					};
				}
				var uri = (dojo.config["dojoxGfxSvgProxyFrameUrl"] || dojo.moduleUrl("dojox", "gfx/resources/gfxSvgProxyFrame.html"));
				f.setAttribute("src", uri);
				dojo.body().appendChild(f);
			}
		}, _innerXML:function (node) {
			if (node.innerXML) {
				return node.innerXML;
			} else {
				if (node.xml) {
					return node.xml;
				} else {
					if (typeof XMLSerializer != "undefined") {
						return (new XMLSerializer()).serializeToString(node);
					}
				}
			}
			return null;
		}, _cleanSvg:function (svg) {
			if (svg) {
				if (svg.indexOf("xmlns=\"http://www.w3.org/2000/svg\"") == -1) {
					svg = svg.substring(4, svg.length);
					svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"" + svg;
				}
				svg = svg.replace(/\bdojoGfx\w*\s*=\s*(['"])\w*\1/g, "");
			}
			return svg;
		}});
	})();
}

