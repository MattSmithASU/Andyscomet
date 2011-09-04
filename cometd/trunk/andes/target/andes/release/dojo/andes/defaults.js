/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.defaults"]) {
	dojo._hasResource["andes.defaults"] = true;
	dojo.provide("andes.defaults");
	(function () {
		andes.defaults = {clickMode:true, clickable:true, zAxis:false, zAxisEnabled:true, zAngle:225, current:null, currentHit:null, angleSnap:1, renderHitLines:true, renderHitLayer:true, labelSameColor:true, locked:{fill:"#262626", color:"#000000"}, correct:{fill:"#CCFFCC", color:"#009900"}, incorrect:{fill:"#FE7070", color:"#D20202"}, unknown:{fill:"#cccccc", color:"#000000"}, norm:{width:1, color:"#000000", style:"Solid", cap:"round", fill:"#CCCCCC"}, selected:{width:6, color:"#00FF00", style:"Solid", cap:"round", fill:"#E11EBB"}, highlighted:{width:6, color:"#FF00FF", style:"Solid", cap:"round", fill:"#E11EBB"}, disabled:{width:1, color:"#666666", style:"solid", cap:"round", fill:"#cccccc"}, hitNorm:{width:10, color:{r:0, g:255, b:255, a:0.0001}, style:"Solid", cap:"round", fill:{r:255, g:255, b:255, a:0.0001}}, hitSelected:{width:6, color:"#FF9900", style:"Solid", cap:"round", fill:{r:255, g:255, b:255, a:0}}, hitHighlighted:{width:6, color:"#FFFF00", style:"Solid", cap:"round", fill:{r:255, g:255, b:255, a:0}}, anchors:{size:10, width:2, color:"#999", style:"solid", fill:"#fff", cap:"square", minSize:10, marginZero:5}, arrows:{length:30, width:16}, text:{minWidth:150, deleteEmptyCreate:true, deleteEmptyModify:true, pad:3, size:"12px", family:"sans-serif", weight:"normal", color:"#000000"}, textDisabled:{size:"12px", family:"sans-serif", weight:"normal", color:"#cccccc"}, textMode:{create:{width:2, style:"dotted", color:"#666666", fill:null}, edit:{width:1, style:"dashed", color:"#666", fill:null}}, button:{radioButtonRadius:15, checkboxWidth:15, norm:{"color":"#cccccc", "fill":{type:"linear", x1:0, x2:0, y1:0, y2:100, colors:[{offset:0.5, color:"#ffffff"}, {offset:1, color:"#e5e5e5"}]}}, over:{"fill":{type:"linear", x1:0, x2:0, y1:0, y2:100, colors:[{offset:0.5, color:"#ffffff"}, {offset:1, color:"#e1eaf5"}]}, "color":"#92a0b3"}, down:{"fill":{type:"linear", x1:0, x2:0, y1:0, y2:100, colors:[{offset:0, color:"#e1eaf5"}, {offset:1, color:"#ffffff"}]}, "color":"#92a0b3"}, selected:{"fill":{type:"linear", x1:0, x2:0, y1:0, y2:100, colors:[{offset:0, color:"#97b4bf"}, {offset:1, color:"#c8dae1"}]}, "color":"#92a0b3"}, icon:{norm:{fill:null, color:"#92a0b3"}, selected:{fill:"#ffffff", color:"#92a0b3"}}}, copy:function () {
			var cpy = function (obj) {
				if (typeof (obj) != "object" || obj === null || obj === undefined) {
					return obj;
				}
				var o;
				if (obj.push) {
					o = [];
					for (var i = 0; i < obj.length; i++) {
						o.push(cpy(obj[i]));
					}
					return o;
				}
				o = {};
				for (var nm in obj) {
					if (nm != "copy") {
						if (typeof (obj[nm]) == "object") {
							o[nm] = cpy(obj[nm]);
						} else {
							o[nm] = obj[nm];
						}
					}
				}
				return o;
			};
			var o = cpy(this);
			o.current = o.norm;
			o.currentHit = o.hitNorm;
			o.currentText = o.text;
			return o;
		}};
		var a = andes.defaults;
		a.norm.fill = a.unknown.fill;
		a.norm.color = a.unknown.color;
		a.disabled.color = a.locked.color;
		a.disabled.fill = a.locked.fill;
		a.textDisabled.color = a.locked.fill;
	})();
}

