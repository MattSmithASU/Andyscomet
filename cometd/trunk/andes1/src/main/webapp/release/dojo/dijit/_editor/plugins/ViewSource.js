/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.ViewSource"]) {
	dojo._hasResource["dijit._editor.plugins.ViewSource"] = true;
	dojo.provide("dijit._editor.plugins.ViewSource");
	dojo.require("dojo.window");
	dojo.require("dojo.i18n");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.ViewSource", dijit._editor._Plugin, {stripScripts:true, stripComments:true, stripIFrames:true, readOnly:false, _fsPlugin:null, toggle:function () {
		if (dojo.isWebKit) {
			this._vsFocused = true;
		}
		this.button.set("checked", !this.button.get("checked"));
	}, _initButton:function () {
		var strings = dojo.i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
		this.button = new dijit.form.ToggleButton({label:strings["viewSource"], dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "ViewSource", tabIndex:"-1", onChange:dojo.hitch(this, "_showSource")});
		if (dojo.isIE == 7) {
			this._ieFixNode = dojo.create("div", {style:{opacity:"0", zIndex:"-1000", position:"absolute", top:"-1000px"}}, dojo.body());
		}
		this.button.set("readOnly", false);
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.addKeyHandler(dojo.keys.F12, true, true, dojo.hitch(this, function (e) {
			this.button.focus();
			this.toggle();
			dojo.stopEvent(e);
			setTimeout(dojo.hitch(this, function () {
				this.editor.focus();
			}), 100);
		}));
	}, _showSource:function (source) {
		var ed = this.editor;
		var edPlugins = ed._plugins;
		var html;
		this._sourceShown = source;
		var self = this;
		try {
			if (!this.sourceArea) {
				this._createSourceView();
			}
			if (source) {
				ed._sourceQueryCommandEnabled = ed.queryCommandEnabled;
				ed.queryCommandEnabled = function (cmd) {
					var lcmd = cmd.toLowerCase();
					if (lcmd === "viewsource") {
						return true;
					} else {
						return false;
					}
				};
				this.editor.onDisplayChanged();
				html = ed.get("value");
				html = this._filter(html);
				ed.set("value", html);
				this._pluginList = [];
				dojo.forEach(edPlugins, function (p) {
					if (!(p instanceof dijit._editor.plugins.ViewSource)) {
						p.set("disabled", true);
					}
				});
				if (this._fsPlugin) {
					this._fsPlugin._getAltViewNode = function () {
						return self.sourceArea;
					};
				}
				this.sourceArea.value = html;
				var is = dojo._getMarginSize(ed.iframe.parentNode);
				dojo.marginBox(this.sourceArea, {w:is.w, h:is.h});
				dojo.style(ed.iframe, "display", "none");
				dojo.style(this.sourceArea, {display:"block"});
				var resizer = function () {
					var vp = dojo.window.getBox();
					if ("_prevW" in this && "_prevH" in this) {
						if (vp.w === this._prevW && vp.h === this._prevH) {
							return;
						} else {
							this._prevW = vp.w;
							this._prevH = vp.h;
						}
					} else {
						this._prevW = vp.w;
						this._prevH = vp.h;
					}
					if (this._resizer) {
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					this._resizer = setTimeout(dojo.hitch(this, function () {
						delete this._resizer;
						this._resize();
					}), 10);
				};
				this._resizeHandle = dojo.connect(window, "onresize", this, resizer);
				setTimeout(dojo.hitch(this, this._resize), 100);
				this.editor.onNormalizedDisplayChanged();
				this.editor.__oldGetValue = this.editor.getValue;
				this.editor.getValue = dojo.hitch(this, function () {
					var txt = this.sourceArea.value;
					txt = this._filter(txt);
					return txt;
				});
			} else {
				if (!ed._sourceQueryCommandEnabled) {
					return;
				}
				dojo.disconnect(this._resizeHandle);
				delete this._resizeHandle;
				if (this.editor.__oldGetValue) {
					this.editor.getValue = this.editor.__oldGetValue;
					delete this.editor.__oldGetValue;
				}
				ed.queryCommandEnabled = ed._sourceQueryCommandEnabled;
				if (!this._readOnly) {
					html = this.sourceArea.value;
					html = this._filter(html);
					ed.beginEditing();
					ed.set("value", html);
					ed.endEditing();
				}
				dojo.forEach(edPlugins, function (p) {
					p.set("disabled", false);
				});
				dojo.style(this.sourceArea, "display", "none");
				dojo.style(ed.iframe, "display", "block");
				delete ed._sourceQueryCommandEnabled;
				this.editor.onDisplayChanged();
			}
			setTimeout(dojo.hitch(this, function () {
				var parent = ed.domNode.parentNode;
				if (parent) {
					var container = dijit.getEnclosingWidget(parent);
					if (container && container.resize) {
						container.resize();
					}
				}
				ed.resize();
			}), 300);
		}
		catch (e) {
			console.log(e);
		}
	}, updateState:function () {
		this.button.set("disabled", this.get("disabled"));
	}, _resize:function () {
		var ed = this.editor;
		var tbH = ed.getHeaderHeight();
		var fH = ed.getFooterHeight();
		var eb = dojo.position(ed.domNode);
		var containerPadding = dojo._getPadBorderExtents(ed.iframe.parentNode);
		var containerMargin = dojo._getMarginExtents(ed.iframe.parentNode);
		var extents = dojo._getPadBorderExtents(ed.domNode);
		var mExtents = dojo._getMarginExtents(ed.domNode);
		var edb = {w:eb.w - (extents.w + mExtents.w), h:eb.h - (tbH + extents.h + mExtents.h + fH)};
		if (this._fsPlugin && this._fsPlugin.isFullscreen) {
			var vp = dojo.window.getBox();
			edb.w = (vp.w - extents.w);
			edb.h = (vp.h - (tbH + extents.h + fH));
		}
		if (dojo.isIE) {
			edb.h -= 2;
		}
		if (this._ieFixNode) {
			var _ie7zoom = -this._ieFixNode.offsetTop / 1000;
			edb.w = Math.floor((edb.w + 0.9) / _ie7zoom);
			edb.h = Math.floor((edb.h + 0.9) / _ie7zoom);
		}
		dojo.marginBox(this.sourceArea, {w:edb.w - (containerPadding.w + containerMargin.w), h:edb.h - (containerPadding.h + containerMargin.h)});
		dojo.marginBox(ed.iframe.parentNode, {h:edb.h});
	}, _createSourceView:function () {
		var ed = this.editor;
		var edPlugins = ed._plugins;
		this.sourceArea = dojo.create("textarea");
		if (this.readOnly) {
			dojo.attr(this.sourceArea, "readOnly", true);
			this._readOnly = true;
		}
		dojo.style(this.sourceArea, {padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
		dojo.place(this.sourceArea, ed.iframe, "before");
		if (dojo.isIE && ed.iframe.parentNode.lastChild !== ed.iframe) {
			dojo.style(ed.iframe.parentNode.lastChild, {width:"0px", height:"0px", padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
		}
		ed._viewsource_oldFocus = ed.focus;
		var self = this;
		ed.focus = function () {
			if (self._sourceShown) {
				self.setSourceAreaCaret();
			} else {
				try {
					if (this._vsFocused) {
						delete this._vsFocused;
						dijit.focus(ed.editNode);
					} else {
						ed._viewsource_oldFocus();
					}
				}
				catch (e) {
					console.log(e);
				}
			}
		};
		var i, p;
		for (i = 0; i < edPlugins.length; i++) {
			p = edPlugins[i];
			if (p && (p.declaredClass === "dijit._editor.plugins.FullScreen" || p.declaredClass === (dijit._scopeName + "._editor.plugins.FullScreen"))) {
				this._fsPlugin = p;
				break;
			}
		}
		if (this._fsPlugin) {
			this._fsPlugin._viewsource_getAltViewNode = this._fsPlugin._getAltViewNode;
			this._fsPlugin._getAltViewNode = function () {
				return self._sourceShown ? self.sourceArea : this._viewsource_getAltViewNode();
			};
		}
		this.connect(this.sourceArea, "onkeydown", dojo.hitch(this, function (e) {
			if (this._sourceShown && e.keyCode == dojo.keys.F12 && e.ctrlKey && e.shiftKey) {
				this.button.focus();
				this.button.set("checked", false);
				setTimeout(dojo.hitch(this, function () {
					ed.focus();
				}), 100);
				dojo.stopEvent(e);
			}
		}));
	}, _stripScripts:function (html) {
		if (html) {
			html = html.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig, "");
			html = html.replace(/<\s*script\b([^<>]|\s)*>?/ig, "");
			html = html.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig, "");
		}
		return html;
	}, _stripComments:function (html) {
		if (html) {
			html = html.replace(/<!--(.|\s){1,}?-->/g, "");
		}
		return html;
	}, _stripIFrames:function (html) {
		if (html) {
			html = html.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig, "");
		}
		return html;
	}, _filter:function (html) {
		if (html) {
			if (this.stripScripts) {
				html = this._stripScripts(html);
			}
			if (this.stripComments) {
				html = this._stripComments(html);
			}
			if (this.stripIFrames) {
				html = this._stripIFrames(html);
			}
		}
		return html;
	}, setSourceAreaCaret:function () {
		var win = dojo.global;
		var elem = this.sourceArea;
		dijit.focus(elem);
		if (this._sourceShown && !this.readOnly) {
			if (dojo.isIE) {
				if (this.sourceArea.createTextRange) {
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveStart("character", -99999);
					range.moveStart("character", 0);
					range.moveEnd("character", 0);
					range.select();
				}
			} else {
				if (win.getSelection) {
					if (elem.setSelectionRange) {
						elem.setSelectionRange(0, 0);
					}
				}
			}
		}
	}, destroy:function () {
		if (this._ieFixNode) {
			dojo.body().removeChild(this._ieFixNode);
		}
		if (this._resizer) {
			clearTimeout(this._resizer);
			delete this._resizer;
		}
		if (this._resizeHandle) {
			dojo.disconnect(this._resizeHandle);
			delete this._resizeHandle;
		}
		this.inherited(arguments);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "viewsource") {
			o.plugin = new dijit._editor.plugins.ViewSource({readOnly:("readOnly" in o.args) ? o.args.readOnly : false, stripComments:("stripComments" in o.args) ? o.args.stripComments : true, stripScripts:("stripScripts" in o.args) ? o.args.stripScripts : true, stripIFrames:("stripIFrames" in o.args) ? o.args.stripIFrames : true});
		}
	});
}

