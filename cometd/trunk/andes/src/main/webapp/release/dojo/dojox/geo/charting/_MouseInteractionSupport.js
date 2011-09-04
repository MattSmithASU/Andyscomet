/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.geo.charting._MouseInteractionSupport"]) {
	dojo._hasResource["dojox.geo.charting._MouseInteractionSupport"] = true;
	dojo.provide("dojox.geo.charting._MouseInteractionSupport");
	dojo.declare("dojox.geo.charting._MouseInteractionSupport", null, {_map:null, _mapClickLocation:null, _screenClickLocation:null, _mouseDragListener:null, _mouseUpListener:null, _currentFeature:null, _cancelMouseClick:null, constructor:function (map) {
		this._map = map;
		this._mapClickLocation = {x:0, y:0};
		this._screenClickLocation = {x:0, y:0};
		this._cancelMouseClick = false;
		this._map.surface.connect("onmousemove", this, this._mouseMoveHandler);
		this._map.surface.connect("onmousedown", this, this._mouseDownHandler);
		var wheelEventName = !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll";
		this._map.surface.connect(wheelEventName, this, this._mouseWheelHandler);
		if (dojo.isIE) {
			dojo.connect(dojo.doc, "ondragstart", this, dojo.stopEvent);
			dojo.connect(dojo.doc, "onselectstart", this, dojo.stopEvent);
		}
	}, _mouseDoubleClickHandler:function (mouseEvent) {
		dojo.stopEvent(mouseEvent);
		var feature = this._getFeatureFromMouseEvent(mouseEvent);
		if (feature) {
			this._map.fitToMapArea(feature._bbox, 15, true);
		}
	}, _mouseClickHandler:function (mouseEvent) {
		dojo.stopEvent(mouseEvent);
		var feature = this._getFeatureFromMouseEvent(mouseEvent);
		if (feature) {
			feature._onclickHandler(mouseEvent);
		}
	}, _mouseDownHandler:function (mouseEvent) {
		dojo.stopEvent(mouseEvent);
		this._cancelMouseClick = false;
		this._screenClickLocation.x = mouseEvent.pageX;
		this._screenClickLocation.y = mouseEvent.pageY;
		var containerBounds = this._map._getContainerBounds();
		var offX = mouseEvent.pageX - containerBounds.x, offY = mouseEvent.pageY - containerBounds.y;
		var mapPoint = this._map.screenCoordsToMapCoords(offX, offY);
		this._mapClickLocation.x = mapPoint.x;
		this._mapClickLocation.y = mapPoint.y;
		if (!dojo.isIE) {
			this._mouseDragListener = dojo.connect(dojo.doc, "onmousemove", this, this._mouseDragHandler);
			this._mouseUpListener = dojo.connect(dojo.doc, "onmouseup", this, this._mouseUpHandler);
		} else {
			var node = dojo.byId(this._map.container);
			this._mouseDragListener = dojo.connect(node, "onmousemove", this, this._mouseDragHandler);
			this._mouseUpListener = dojo.connect(node, "onmouseup", this, this._mouseUpHandler);
			node.setCapture();
		}
	}, _mouseUpHandler:function (mouseEvent) {
		this._map.mapObj.marker._needTooltipRefresh = true;
		if (!this._cancelMouseClick) {
			this._mouseClickHandler(mouseEvent);
		}
		this._cancelMouseClick = false;
		if (this._mouseDragListener) {
			dojo.disconnect(this._mouseDragListener);
			this._mouseDragListener = null;
		}
		if (this._mouseUpListener) {
			dojo.disconnect(this._mouseUpListener);
			this._mouseUpListener = null;
		}
		if (dojo.isIE) {
			dojo.byId(this._map.container).releaseCapture();
		}
	}, _getFeatureFromMouseEvent:function (mouseEvent) {
		var shapeID = mouseEvent.target.parentNode.id;
		return this._map.mapObj.features[shapeID];
	}, _mouseMoveHandler:function (mouseEvent) {
		if (this._mouseDragListener) {
			return;
		}
		var feature = this._getFeatureFromMouseEvent(mouseEvent);
		if (feature != this._currentFeature) {
			if (this._currentFeature) {
				this._currentFeature._onmouseoutHandler();
			}
			this._currentFeature = feature;
			if (feature) {
				feature._onmouseoverHandler();
			}
		}
		if (feature) {
			feature._onmousemoveHandler(mouseEvent);
		}
	}, _mouseDragHandler:function (mouseEvent) {
		dojo.stopEvent(mouseEvent);
		var dx = Math.abs(mouseEvent.pageX - this._screenClickLocation.x);
		var dy = Math.abs(mouseEvent.pageY - this._screenClickLocation.y);
		if (!this._cancelMouseClick && (dx > 1 || dy > 1)) {
			this._cancelMouseClick = true;
			this._map.mapObj.marker.hide();
		}
		var cBounds = this._map._getContainerBounds();
		var offX = mouseEvent.pageX - cBounds.x, offY = mouseEvent.pageY - cBounds.y;
		var mapPoint = this._map.screenCoordsToMapCoords(offX, offY);
		var mapOffsetX = mapPoint.x - this._mapClickLocation.x;
		var mapOffsetY = mapPoint.y - this._mapClickLocation.y;
		var currentMapCenter = this._map.getMapCenter();
		this._map.setMapCenter(currentMapCenter.x - mapOffsetX, currentMapCenter.y - mapOffsetY);
	}, _mouseWheelHandler:function (mouseEvent) {
		dojo.stopEvent(mouseEvent);
		this._map.mapObj.marker.hide();
		var containerBounds = this._map._getContainerBounds();
		var offX = mouseEvent.pageX - containerBounds.x, offY = mouseEvent.pageY - containerBounds.y;
		var invariantMapPoint = this._map.screenCoordsToMapCoords(offX, offY);
		var power = mouseEvent[(dojo.isMozilla ? "detail" : "wheelDelta")] / (dojo.isMozilla ? -3 : 120);
		var scaleFactor = Math.pow(1.2, power);
		this._map.setMapScaleAt(this._map.getMapScale() * scaleFactor, invariantMapPoint.x, invariantMapPoint.y, false);
		this._map.mapObj.marker._needTooltipRefresh = true;
	}});
}

