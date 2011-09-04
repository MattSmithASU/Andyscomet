/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.FullScreen"]) {
	dojo._hasResource["dijit._editor.plugins.FullScreen"] = true;
	dojo.provide("dijit._editor.plugins.FullScreen");
	dojo.require("dojo.window");
	dojo.require("dojo.i18n");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,az,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,kk,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.FullScreen", dijit._editor._Plugin, {zIndex:500, _origState:null, _origiFrameState:null, _resizeHandle:null, isFullscreen:false, toggle:function () {
		this.button.set("checked", !this.button.get("checked"));
	}, _initButton:function () {
		var strings = dojo.i18n.getLocalization("dijit._editor", "commands"), editor = this.editor;
		this.button = new dijit.form.ToggleButton({label:strings["fullScreen"], dir:editor.dir, lang:editor.lang, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "FullScreen", tabIndex:"-1", onChange:dojo.hitch(this, "_setFullScreen")});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.addKeyHandler(dojo.keys.F11, true, true, dojo.hitch(this, function (e) {
			this.toggle();
			dojo.stopEvent(e);
			setTimeout(dojo.hitch(this, function () {
				this.editor.focus();
			}), 250);
			return true;
		}));
		this.connect(this.editor.domNode, "onkeydown", "_containFocus");
	}, _containFocus:function (e) {
		if (this.isFullscreen) {
			var ed = this.editor;
			if (!ed.isTabIndent && ed._fullscreen_oldOnKeyDown && e.keyCode === dojo.keys.TAB) {
				var f = dijit.getFocus();
				var avn = this._getAltViewNode();
				if (f.node == ed.iframe || (avn && f.node === avn)) {
					setTimeout(dojo.hitch(this, function () {
						ed.toolbar.focus();
					}), 10);
				} else {
					if (avn && dojo.style(ed.iframe, "display") === "none") {
						setTimeout(dojo.hitch(this, function () {
							dijit.focus(avn);
						}), 10);
					} else {
						setTimeout(dojo.hitch(this, function () {
							ed.focus();
						}), 10);
					}
				}
				dojo.stopEvent(e);
			} else {
				if (ed._fullscreen_oldOnKeyDown) {
					ed._fullscreen_oldOnKeyDown(e);
				}
			}
		}
	}, _resizeEditor:function () {
		var vp = dojo.window.getBox();
		dojo.marginBox(this.editor.domNode, {w:vp.w, h:vp.h});
		var hHeight = this.editor.getHeaderHeight();
		var fHeight = this.editor.getFooterHeight();
		var extents = dojo._getPadBorderExtents(this.editor.domNode);
		var fcpExtents = dojo._getPadBorderExtents(this.editor.iframe.parentNode);
		var fcmExtents = dojo._getMarginExtents(this.editor.iframe.parentNode);
		var cHeight = vp.h - (hHeight + extents.h + fHeight);
		dojo.marginBox(this.editor.iframe.parentNode, {h:cHeight, w:vp.w});
		dojo.marginBox(this.editor.iframe, {h:cHeight - (fcpExtents.h + fcmExtents.h)});
	}, _getAltViewNode:function () {
	}, _setFullScreen:function (full) {
		var vp = dojo.window.getBox();
		var ed = this.editor;
		var body = dojo.body();
		var editorParent = ed.domNode.parentNode;
		this.isFullscreen = full;
		if (full) {
			while (editorParent && editorParent !== dojo.body()) {
				dojo.addClass(editorParent, "dijitForceStatic");
				editorParent = editorParent.parentNode;
			}
			this._editorResizeHolder = this.editor.resize;
			ed.resize = function () {
			};
			ed._fullscreen_oldOnKeyDown = ed.onKeyDown;
			ed.onKeyDown = dojo.hitch(this, this._containFocus);
			this._origState = {};
			this._origiFrameState = {};
			var domNode = ed.domNode, domStyle = domNode && domNode.style || {};
			this._origState = {width:domStyle.width || "", height:domStyle.height || "", top:dojo.style(domNode, "top") || "", left:dojo.style(domNode, "left") || "", position:dojo.style(domNode, "position") || "static", marginBox:dojo.marginBox(ed.domNode)};
			var iframe = ed.iframe, iframeStyle = iframe && iframe.style || {};
			var bc = dojo.style(ed.iframe, "backgroundColor");
			this._origiFrameState = {backgroundColor:bc || "transparent", width:iframeStyle.width || "auto", height:iframeStyle.height || "auto", zIndex:iframeStyle.zIndex || ""};
			dojo.style(ed.domNode, {position:"absolute", top:"0px", left:"0px", zIndex:this.zIndex, width:vp.w + "px", height:vp.h + "px"});
			dojo.style(ed.iframe, {height:"100%", width:"100%", zIndex:this.zIndex, backgroundColor:bc !== "transparent" && bc !== "rgba(0, 0, 0, 0)" ? bc : "white"});
			dojo.style(ed.iframe.parentNode, {height:"95%", width:"100%"});
			if (body.style && body.style.overflow) {
				this._oldOverflow = dojo.style(body, "overflow");
			} else {
				this._oldOverflow = "";
			}
			if (dojo.isIE && !dojo.isQuirks) {
				if (body.parentNode && body.parentNode.style && body.parentNode.style.overflow) {
					this._oldBodyParentOverflow = body.parentNode.style.overflow;
				} else {
					try {
						this._oldBodyParentOverflow = dojo.style(body.parentNode, "overflow");
					}
					catch (e) {
						this._oldBodyParentOverflow = "scroll";
					}
				}
				dojo.style(body.parentNode, "overflow", "hidden");
			}
			dojo.style(body, "overflow", "hidden");
			var resizer = function () {
				var vp = dojo.window.getBox();
				if ("_prevW" in this && "_prevH" in this) {
					if (vp.w === this._prevW && vp.h === this._prevH) {
						return;
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
					this._resizeEditor();
				}), 10);
			};
			this._resizeHandle = dojo.connect(window, "onresize", this, resizer);
			this._resizeHandle2 = dojo.connect(ed, "resize", dojo.hitch(this, function () {
				if (this._resizer) {
					clearTimeout(this._resizer);
					delete this._resizer;
				}
				this._resizer = setTimeout(dojo.hitch(this, function () {
					delete this._resizer;
					this._resizeEditor();
				}), 10);
			}));
			this._resizeEditor();
			var dn = this.editor.toolbar.domNode;
			setTimeout(function () {
				dojo.window.scrollIntoView(dn);
			}, 250);
		} else {
			if (this._resizeHandle) {
				dojo.disconnect(this._resizeHandle);
				this._resizeHandle = null;
			}
			if (this._resizeHandle2) {
				dojo.disconnect(this._resizeHandle2);
				this._resizeHandle2 = null;
			}
			if (this._rst) {
				clearTimeout(this._rst);
				this._rst = null;
			}
			while (editorParent && editorParent !== dojo.body()) {
				dojo.removeClass(editorParent, "dijitForceStatic");
				editorParent = editorParent.parentNode;
			}
			if (this._editorResizeHolder) {
				this.editor.resize = this._editorResizeHolder;
			}
			if (!this._origState && !this._origiFrameState) {
				return;
			}
			if (ed._fullscreen_oldOnKeyDown) {
				ed.onKeyDown = ed._fullscreen_oldOnKeyDown;
				delete ed._fullscreen_oldOnKeyDown;
			}
			var self = this;
			setTimeout(function () {
				var mb = self._origState.marginBox;
				var oh = self._origState.height;
				if (dojo.isIE && !dojo.isQuirks) {
					body.parentNode.style.overflow = self._oldBodyParentOverflow;
					delete self._oldBodyParentOverflow;
				}
				dojo.style(body, "overflow", self._oldOverflow);
				delete self._oldOverflow;
				dojo.style(ed.domNode, self._origState);
				dojo.style(ed.iframe.parentNode, {height:"", width:""});
				dojo.style(ed.iframe, self._origiFrameState);
				delete self._origState;
				delete self._origiFrameState;
				var pWidget = dijit.getEnclosingWidget(ed.domNode.parentNode);
				if (pWidget && pWidget.resize) {
					pWidget.resize();
				} else {
					if (!oh || oh.indexOf("%") < 0) {
						setTimeout(dojo.hitch(this, function () {
							ed.resize({h:mb.h});
						}), 0);
					}
				}
				dojo.window.scrollIntoView(self.editor.toolbar.domNode);
			}, 100);
		}
	}, updateState:function () {
		this.button.set("disabled", this.get("disabled"));
	}, destroy:function () {
		if (this._resizeHandle) {
			dojo.disconnect(this._resizeHandle);
			this._resizeHandle = null;
		}
		if (this._resizeHandle2) {
			dojo.disconnect(this._resizeHandle2);
			this._resizeHandle2 = null;
		}
		if (this._resizer) {
			clearTimeout(this._resizer);
			this._resizer = null;
		}
		this.inherited(arguments);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "fullscreen") {
			o.plugin = new dijit._editor.plugins.FullScreen({zIndex:("zIndex" in o.args) ? o.args.zIndex : 500});
		}
	});
}

