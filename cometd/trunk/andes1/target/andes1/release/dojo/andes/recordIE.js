/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



(function () {
	var self = this;
	var andes = window.opener.andes;
	this.onfocus = function () {
		andes.drawing.onWindowFocus.call(self);
	};
	this.document.onfocusout = function () {
		if (this._activeElement != document.activeElement) {
			this._activeElement = document.activeElement;
		} else {
			andes.drawing.onWindowBlur.call(self);
		}
	};
	this.onunload = function () {
		andes.drawing.onWindowBlur.call(self);
	};
})();

