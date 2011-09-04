/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.profile"]) {
	dojo._hasResource["andes.profile"] = true;
	dojo.provide("andes.profile");
	dojo.require("dojo.parser");
	dojo.require("dijit.layout.BorderContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("andes.widget.ExpandoPane");
	dojo.require("dojox.drawing.util.typeset");
	dojo.require("dojox.widget.UpgradeBar");
	dojo.require("dijit.MenuBar");
	dojo.require("dijit.PopupMenuBarItem");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuItem");
	dojo.require("dijit.PopupMenuItem");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.form.NumberSpinner");
	dojo.require("dijit.form.ToggleButton");
	dojo.require("dijit.Tooltip");
	dojo.require("andes.defaults");
	dojo.require("andes.main");
	dojo.require("dojox.drawing");
	dojo.require("dojox.drawing.plugins.drawing.Silverlight");
	dojo.require("dojox.drawing.plugins.drawing.GreekPalette");
	dojo.require("dojox.drawing.tools.TextBlock");
	dojo.require("dojox.drawing.tools.Rect");
	dojo.require("dojox.drawing.tools.Ellipse");
	dojo.require("dojox.drawing.tools.Line");
	dojo.require("dojox.drawing.tools.Path");
	dojo.require("dojox.drawing.tools.Pencil");
	dojo.require("dojox.drawing.tools.custom.Vector");
	dojo.require("dojox.drawing.tools.custom.Equation");
	dojo.require("dojox.drawing.tools.custom.Axes");
	dojo.require("dojox.drawing.tools.Arrow");
	dojo.require("dojox.drawing.plugins.tools.Pan");
	dojo.require("dojox.drawing.plugins.tools.Zoom");
	dojo.require("dojox.drawing.ui.Toolbar");
	dojo.require("dojox.drawing.ui.Button");
	dojo.require("dojox.drawing.library.icons");
	dojo.require("andes.Combo");
	dojo.require("andes.positioning");
	dojo.require("andes.principles");
}

