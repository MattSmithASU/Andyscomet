/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.compat"]) {
	dojo._hasResource["dojox.mobile.compat"] = true;
	dojo.provide("dojox.mobile.compat");
	dojo.require("dijit._base.sniff");
	dojo.require("dojo._base.fx");
	dojo.require("dojo.fx");
	dojo.require("dojox.fx.flip");
	if (!dojo.isWebKit) {
		dojo.extend(dojox.mobile.View, {_doTransition:function (fromNode, toNode, transition, dir) {
			var anim;
			this.wakeUp(toNode);
			if (!transition || transition == "none") {
				toNode.style.display = "";
				fromNode.style.display = "none";
				toNode.style.left = "0px";
				this.invokeCallback();
			} else {
				if (transition == "slide" || transition == "cover" || transition == "reveal") {
					var w = fromNode.offsetWidth;
					var s1 = dojo.fx.slideTo({node:fromNode, duration:400, left:-w * dir, top:dojo.style(fromNode, "top")});
					var s2 = dojo.fx.slideTo({node:toNode, duration:400, left:0, top:dojo.style(toNode, "top")});
					toNode.style.position = "absolute";
					toNode.style.left = w * dir + "px";
					toNode.style.display = "";
					anim = dojo.fx.combine([s1, s2]);
					dojo.connect(anim, "onEnd", this, function () {
						fromNode.style.display = "none";
						toNode.style.position = "relative";
						toWidget = dijit.byNode(toNode);
						if (!dojo.hasClass(toWidget.domNode, "out")) {
							toWidget.containerNode.style.paddingTop = "";
						}
						this.invokeCallback();
					});
					anim.play();
				} else {
					if (transition == "slidev" || transition == "coverv") {
						var h = fromNode.offsetHeight;
						var s1 = dojo.fx.slideTo({node:fromNode, duration:400, left:0, top:-h * dir});
						var s2 = dojo.fx.slideTo({node:toNode, duration:400, left:0, top:0});
						toNode.style.position = "absolute";
						toNode.style.top = h * dir + "px";
						toNode.style.left = "0px";
						toNode.style.display = "";
						anim = dojo.fx.combine([s1, s2]);
						dojo.connect(anim, "onEnd", this, function () {
							fromNode.style.display = "none";
							toNode.style.position = "relative";
							this.invokeCallback();
						});
						anim.play();
					} else {
						if (transition == "flip" || transition == "flip2") {
							anim = dojox.fx.flip({node:fromNode, dir:"right", depth:0.5, duration:400});
							toNode.style.position = "absolute";
							toNode.style.left = "0px";
							dojo.connect(anim, "onEnd", this, function () {
								fromNode.style.display = "none";
								toNode.style.position = "relative";
								toNode.style.display = "";
								this.invokeCallback();
							});
							anim.play();
						} else {
							anim = dojo.fx.chain([dojo.fadeOut({node:fromNode, duration:600}), dojo.fadeIn({node:toNode, duration:600})]);
							toNode.style.position = "absolute";
							toNode.style.left = "0px";
							toNode.style.display = "";
							dojo.style(toNode, "opacity", 0);
							dojo.connect(anim, "onEnd", this, function () {
								fromNode.style.display = "none";
								toNode.style.position = "relative";
								dojo.style(fromNode, "opacity", 1);
								this.invokeCallback();
							});
							anim.play();
						}
					}
				}
			}
		}, wakeUp:function (node) {
			if (dojo.isIE && !node._wokeup) {
				node._wokeup = true;
				var disp = node.style.display;
				node.style.display = "";
				var nodes = node.getElementsByTagName("*");
				for (var i = 0, len = nodes.length; i < len; i++) {
					var val = nodes[i].style.display;
					nodes[i].style.display = "none";
					nodes[i].style.display = "";
					nodes[i].style.display = val;
				}
				node.style.display = disp;
			}
		}});
		dojo.extend(dojox.mobile.Switch, {_changeState:function (state, anim) {
			var on = (state === "on");
			var pos;
			if (!on) {
				pos = -this.inner.firstChild.firstChild.offsetWidth;
			} else {
				pos = 0;
			}
			this.left.style.display = "";
			this.right.style.display = "";
			var _this = this;
			var f = function () {
				dojo.removeClass(_this.domNode, on ? "mblSwitchOff" : "mblSwitchOn");
				dojo.addClass(_this.domNode, on ? "mblSwitchOn" : "mblSwitchOff");
				_this.left.style.display = on ? "" : "none";
				_this.right.style.display = !on ? "" : "none";
			};
			if (anim) {
				var a = dojo.fx.slideTo({node:this.inner, duration:300, left:pos, onEnd:f});
				a.play();
			} else {
				f();
			}
		}});
		if (dojo.isIE) {
			dojo.extend(dojox.mobile.RoundRect, {buildRendering:function () {
				dojox.mobile.createRoundRect(this);
				this.domNode.className = "mblRoundRect";
			}});
			dojox.mobile.RoundRectList._addChild = dojox.mobile.RoundRectList.prototype.addChild;
			dojo.extend(dojox.mobile.RoundRectList, {buildRendering:function () {
				dojox.mobile.createRoundRect(this, true);
				this.domNode.className = "mblRoundRectList";
			}, postCreate:function () {
				this.redrawBorders();
			}, addChild:function (widget) {
				dojox.mobile.RoundRectList._addChild.apply(this, arguments);
				this.redrawBorders();
				if (dojox.mobile.applyPngFilter) {
					dojox.mobile.applyPngFilter(widget.domNode);
				}
			}, redrawBorders:function () {
				var lastChildFound = false;
				for (var i = this.containerNode.childNodes.length - 1; i >= 0; i--) {
					var c = this.containerNode.childNodes[i];
					if (c.tagName == "LI") {
						c.style.borderBottomStyle = lastChildFound ? "solid" : "none";
						lastChildFound = true;
					}
				}
			}});
			dojo.extend(dojox.mobile.EdgeToEdgeList, {buildRendering:function () {
				this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
				this.domNode.className = "mblEdgeToEdgeList";
			}});
			if (dojox.mobile.IconContainer) {
				dojox.mobile.IconContainer._addChild = dojox.mobile.IconContainer.prototype.addChild;
				dojo.extend(dojox.mobile.IconContainer, {addChild:function (widget) {
					dojox.mobile.IconContainer._addChild.apply(this, arguments);
					if (dojox.mobile.applyPngFilter) {
						dojox.mobile.applyPngFilter(widget.domNode);
					}
				}});
			}
			dojo.mixin(dojox.mobile, {createRoundRect:function (_this, isList) {
				var i;
				_this.domNode = dojo.doc.createElement("DIV");
				_this.domNode.style.padding = "0px";
				_this.domNode.style.backgroundColor = "transparent";
				_this.domNode.style.borderStyle = "none";
				_this.containerNode = dojo.doc.createElement(isList ? "UL" : "DIV");
				_this.containerNode.className = "mblRoundRectContainer";
				if (_this.srcNodeRef) {
					_this.srcNodeRef.parentNode.replaceChild(_this.domNode, _this.srcNodeRef);
					for (i = 0, len = _this.srcNodeRef.childNodes.length; i < len; i++) {
						_this.containerNode.appendChild(_this.srcNodeRef.removeChild(_this.srcNodeRef.firstChild));
					}
					_this.srcNodeRef = null;
				}
				_this.domNode.appendChild(_this.containerNode);
				for (i = 0; i <= 5; i++) {
					var top = dojo.create("DIV");
					top.className = "mblRoundCorner mblRoundCorner" + i + "T";
					_this.domNode.insertBefore(top, _this.containerNode);
					var bottom = dojo.create("DIV");
					bottom.className = "mblRoundCorner mblRoundCorner" + i + "B";
					_this.domNode.appendChild(bottom);
				}
			}});
			if (dojox.mobile.ScrollableView) {
				dojo.extend(dojox.mobile.ScrollableView, {postCreate:function () {
					var dummy = dojo.create("DIV", {className:"mblDummyForIE", innerHTML:"&nbsp;"}, this.containerNode, "first");
					dojo.style(dummy, {position:"relative", marginBottom:"-2px", fontSize:"1px"});
				}});
			}
		}
		if (dojo.isIE <= 6) {
			dojox.mobile.applyPngFilter = function (root) {
				root = root || dojo.body();
				var nodes = root.getElementsByTagName("IMG");
				var blank = dojo.moduleUrl("dojo", "resources/blank.gif");
				for (var i = 0, len = nodes.length; i < len; i++) {
					var img = nodes[i];
					var w = img.offsetWidth;
					var h = img.offsetHeight;
					if (w === 0 || h === 0) {
						if (dojo.style(img, "display") != "none") {
							continue;
						}
						img.style.display = "";
						w = img.offsetWidth;
						h = img.offsetHeight;
						img.style.display = "none";
						if (w === 0 || h === 0) {
							continue;
						}
					}
					var src = img.src;
					if (src.indexOf("resources/blank.gif") != -1) {
						continue;
					}
					img.src = blank;
					img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
					img.style.width = w + "px";
					img.style.height = h + "px";
				}
			};
		}
		dojox.mobile.loadCssFile = function (file) {
			if (dojo.doc.createStyleSheet) {
				setTimeout(function (file) {
					return function () {
						dojo.doc.createStyleSheet(file);
					};
				}(file), 0);
			} else {
				dojo.create("LINK", {href:file, type:"text/css", rel:"stylesheet"}, dojo.doc.getElementsByTagName("head")[0]);
			}
		};
		dojox.mobile.loadCss = function (files) {
			if (!dojo.global._loadedCss) {
				var obj = {};
				dojo.forEach(dojox.mobile.getCssPaths(), function (path) {
					obj[path] = true;
				});
				dojo.global._loadedCss = obj;
			}
			if (!dojo.isArray(files)) {
				files = [files];
			}
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				if (!dojo.global._loadedCss[file]) {
					dojo.global._loadedCss[file] = true;
					dojox.mobile.loadCssFile(file);
				}
			}
		};
		dojox.mobile.getCssPaths = function () {
			var paths = [];
			var i, j;
			var s = dojo.doc.styleSheets;
			for (i = 0; i < s.length; i++) {
				if (s[i].href) {
					continue;
				}
				var r = s[i].cssRules || s[i].imports;
				if (!r) {
					continue;
				}
				for (j = 0; j < r.length; j++) {
					if (r[j].href) {
						paths.push(r[j].href);
					}
				}
			}
			var elems = dojo.doc.getElementsByTagName("link");
			for (i = 0, len = elems.length; i < len; i++) {
				if (elems[i].href) {
					paths.push(elems[i].href);
				}
			}
			return paths;
		};
		dojox.mobile.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;
		dojox.mobile.loadCompatCssFiles = function () {
			var paths = dojox.mobile.getCssPaths();
			for (var i = 0; i < paths.length; i++) {
				var href = paths[i];
				if ((href.match(dojox.mobile.loadCompatPattern) || location.href.indexOf("mobile/tests/")) && href.indexOf("-compat.css") == -1) {
					var compatCss = href.substring(0, href.length - 4) + "-compat.css";
					dojox.mobile.loadCss(compatCss);
				}
			}
		};
		dojox.mobile.hideAddressBar = function (evt, doResize) {
			if (doResize !== false) {
				dojox.mobile.resizeAll();
			}
		};
		dojo.addOnLoad(function () {
			if (dojo.config["mblLoadCompatCssFiles"] !== false) {
				setTimeout(function () {
					dojox.mobile.loadCompatCssFiles();
				}, 0);
			}
			if (dojox.mobile.applyPngFilter) {
				dojox.mobile.applyPngFilter();
			}
		});
	}
}

