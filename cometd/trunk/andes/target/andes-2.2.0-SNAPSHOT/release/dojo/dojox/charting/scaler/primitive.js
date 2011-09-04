/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.scaler.primitive"]) {
	dojo._hasResource["dojox.charting.scaler.primitive"] = true;
	dojo.provide("dojox.charting.scaler.primitive");
	dojox.charting.scaler.primitive = {buildScaler:function (min, max, span, kwArgs) {
		if (min == max) {
			min -= 0.5;
			max += 0.5;
		}
		return {bounds:{lower:min, upper:max, from:min, to:max, scale:span / (max - min), span:span}, scaler:dojox.charting.scaler.primitive};
	}, buildTicks:function (scaler, kwArgs) {
		return {major:[], minor:[], micro:[]};
	}, getTransformerFromModel:function (scaler) {
		var offset = scaler.bounds.from, scale = scaler.bounds.scale;
		return function (x) {
			return (x - offset) * scale;
		};
	}, getTransformerFromPlot:function (scaler) {
		var offset = scaler.bounds.from, scale = scaler.bounds.scale;
		return function (x) {
			return x / scale + offset;
		};
	}};
}

