/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._ExpandingTextAreaMixin"]) {
	dojo._hasResource["dijit.form._ExpandingTextAreaMixin"] = true;
	dojo.provide("dijit.form._ExpandingTextAreaMixin");
	(function () {
		var needsHelpShrinking;
		dojo.declare("dijit.form._ExpandingTextAreaMixin", null, {_setValueAttr:function () {
			this.inherited(arguments);
			this.resize();
		}, postCreate:function () {
			this.inherited(arguments);
			var textarea = this.textbox;
			if (needsHelpShrinking == undefined) {
				var te = dojo.create("textarea", {rows:"5", cols:"20", value:" ", style:{zoom:1, overflow:"hidden", visibility:"hidden", position:"absolute", border:"0px solid black", padding:"0px"}}, dojo.body(), "last");
				needsHelpShrinking = te.scrollHeight >= te.clientHeight;
				dojo.body().removeChild(te);
			}
			this.connect(textarea, "onscroll", "_resizeLater");
			this.connect(textarea, "onresize", "_resizeLater");
			this.connect(textarea, "onfocus", "_resizeLater");
			textarea.style.overflowY = "hidden";
			this._estimateHeight();
			this._resizeLater();
		}, _onInput:function (e) {
			this.inherited(arguments);
			this.resize();
		}, _estimateHeight:function () {
			var textarea = this.textbox;
			textarea.style.height = "auto";
			textarea.rows = (textarea.value.match(/\n/g) || []).length + 2;
		}, _resizeLater:function () {
			setTimeout(dojo.hitch(this, "resize"), 0);
		}, resize:function () {
			function textareaScrollHeight() {
				var empty = false;
				if (textarea.value === "") {
					textarea.value = " ";
					empty = true;
				}
				var sh = textarea.scrollHeight;
				if (empty) {
					textarea.value = "";
				}
				return sh;
			}
			var textarea = this.textbox;
			if (textarea.style.overflowY == "hidden") {
				textarea.scrollTop = 0;
			}
			if (this.resizeTimer) {
				clearTimeout(this.resizeTimer);
			}
			this.resizeTimer = null;
			if (this.busyResizing) {
				return;
			}
			this.busyResizing = true;
			if (textareaScrollHeight() || textarea.offsetHeight) {
				var currentHeight = textarea.style.height;
				if (!(/px/.test(currentHeight))) {
					currentHeight = textareaScrollHeight();
					textarea.rows = 1;
					textarea.style.height = currentHeight + "px";
				}
				var newH = parseInt(currentHeight) + textareaScrollHeight() - textarea.clientHeight;
				var newHpx = newH + "px";
				if (newHpx != textarea.style.height) {
					textarea.rows = 1;
					textarea.style.height = newHpx;
				}
				if (needsHelpShrinking) {
					var scrollHeight = textareaScrollHeight();
					textarea.style.height = "auto";
					if (textareaScrollHeight() < scrollHeight) {
						newHpx = newH - scrollHeight + textareaScrollHeight() + "px";
					}
					textarea.style.height = newHpx;
				}
				textarea.style.overflowY = textareaScrollHeight() > textarea.clientHeight ? "auto" : "hidden";
			} else {
				this._estimateHeight();
			}
			this.busyResizing = false;
		}, destroy:function () {
			if (this.resizeTimer) {
				clearTimeout(this.resizeTimer);
			}
			if (this.shrinkTimer) {
				clearTimeout(this.shrinkTimer);
			}
			this.inherited(arguments);
		}});
	})();
}

