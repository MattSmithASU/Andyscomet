/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.wai"]) {
	dojo._hasResource["dijit._base.wai"] = true;
	dojo.provide("dijit._base.wai");
	dojo.require("dijit._base._waiMixin");
	dijit.wai = {onload:function () {
		var div = dojo.create("div", {id:"a11yTestNode", style:{cssText:"border: 1px solid;" + "border-color:red green;" + "position: absolute;" + "height: 5px;" + "top: -999px;" + "background-image: url(\"" + (dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")) + "\");"}}, dojo.body());
		var cs = dojo.getComputedStyle(div);
		if (cs) {
			var bkImg = cs.backgroundImage;
			var needsA11y = (cs.borderTopColor == cs.borderRightColor) || (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)"));
			dojo[needsA11y ? "addClass" : "removeClass"](dojo.body(), "dijit_a11y");
			if (dojo.isIE) {
				div.outerHTML = "";
			} else {
				dojo.body().removeChild(div);
			}
		}
	}};
	if (dojo.isIE || dojo.isMoz) {
		dojo._loaders.unshift(dijit.wai.onload);
	}
}

