/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.geo.charting._TouchInteractionSupport"]) {
	dojo._hasResource["dojox.geo.charting._TouchInteractionSupport"] = true;
	dojo.provide("dojox.geo.charting._TouchInteractionSupport");
	dojo.declare("dojox.geo.charting._TouchInteractionSupport", [], {_map:null, _centerTouchLocation:null, _touchMoveListener:null, _touchEndListener:null, _initialFingerSpacing:null, _initialScale:null, _tapCount:null, _tapThreshold:null, _lastTap:null, constructor:function (map) {
		this._map = map;
		this._centerTouchLocation = {x:0, y:0};
		this._map.surface.connect("touchstart", this, this._touchStartHandler);
		this._map.surface.connect("touchmove", this, this._touchMoveHandler);
		this._map.surface.connect("touchend", this, this._touchEndHandler);
		this._tapCount = 0;
		this._lastTap = {x:0, y:0};
		this._tapThreshold = 100;
	}, _getTouchBarycenter:function (touchEvent) {
		var touches = touchEvent.touches;
		var firstTouch = touches[0];
		var secondTouch = null;
		if (touches.length > 1) {
			secondTouch = touches[1];
		} else {
			secondTouch = touches[0];
		}
		var containerBounds = this._map._getContainerBounds();
		var middleX = (firstTouch.pageX + secondTouch.pageX) / 2 - containerBounds.x;
		var middleY = (firstTouch.pageY + secondTouch.pageY) / 2 - containerBounds.y;
		return {x:middleX, y:middleY};
	}, _getFingerSpacing:function (touchEvent) {
		var touches = touchEvent.touches;
		var spacing = -1;
		if (touches.length >= 2) {
			var dx = (touches[1].pageX - touches[0].pageX);
			var dy = (touches[1].pageY - touches[0].pageY);
			spacing = Math.sqrt(dx * dx + dy * dy);
		}
		return spacing;
	}, _isDoubleTap:function (touchEvent) {
		var isDoubleTap = false;
		var touches = touchEvent.touches;
		if ((this._tapCount > 0) && touches.length == 1) {
			var dx = (touches[0].pageX - this._lastTap.x);
			var dy = (touches[0].pageY - this._lastTap.y);
			var distance = dx * dx + dy * dy;
			if (distance < this._tapThreshold) {
				isDoubleTap = true;
			} else {
				this._tapCount = 0;
			}
		}
		this._tapCount++;
		this._lastTap.x = touches[0].pageX;
		this._lastTap.y = touches[0].pageY;
		setTimeout(dojo.hitch(this, function () {
			this._tapCount = 0;
		}), 300);
		return isDoubleTap;
	}, _doubleTapHandler:function (touchEvent) {
		var feature = this._getFeatureFromTouchEvent(touchEvent);
		if (feature) {
			this._map.fitToMapArea(feature._bbox, 15, true);
		} else {
			console.log("default x2 zoom");
			var touches = touchEvent.touches;
			var containerBounds = this._getContainerBounds();
			var offX = touches[0].pageX - containerBounds.x;
			var offY = touches[0].pageY - containerBounds.y;
			var mapPoint = this._map.screenCoordsToMapCoords(offX, offY);
			this._map.setMapCenterAndScale(mapPoint.x, mapPoint.y, this._map.getMapScale() * 2, true);
		}
	}, _getFeatureFromTouchEvent:function (touchEvent) {
		var shapeID = touchEvent.target.parentNode.id;
		return this._map.mapObj.features[shapeID];
	}, _touchStartHandler:function (touchEvent) {
		dojo.stopEvent(touchEvent);
		if (this._isDoubleTap(touchEvent)) {
			this._doubleTapHandler(touchEvent);
			return;
		}
		var middlePoint = this._getTouchBarycenter(touchEvent);
		var mapPoint = this._map.screenCoordsToMapCoords(middlePoint.x, middlePoint.y);
		this._centerTouchLocation.x = mapPoint.x;
		this._centerTouchLocation.y = mapPoint.y;
		this._initialFingerSpacing = this._getFingerSpacing(touchEvent);
		this._initialScale = this._map.getMapScale();
		if (!this._touchMoveListener) {
			this._touchMoveListener = dojo.connect(dojo.global, "touchmove", this, this._touchMoveHandler);
		}
		if (!this._touchEndListener) {
			this._touchEndListener = dojo.connect(dojo.global, "touchend", this, this._touchEndHandler);
		}
	}, _touchEndHandler:function (touchEvent) {
		dojo.stopEvent(touchEvent);
		var touches = touchEvent.touches;
		if (touches.length == 0) {
			if (this._touchMoveListener) {
				dojo.disconnect(this._touchMoveListener);
				this._touchMoveListener = null;
			}
			if (this._touchEndListener) {
				dojo.disconnect(this._touchEndListener);
				this._touchEndListener = null;
			}
		} else {
			var middlePoint = this._getTouchBarycenter(touchEvent);
			var mapPoint = this._map.screenCoordsToMapCoords(middlePoint.x, middlePoint.y);
			this._centerTouchLocation.x = mapPoint.x;
			this._centerTouchLocation.y = mapPoint.y;
		}
	}, _touchMoveHandler:function (touchEvent) {
		dojo.stopEvent(touchEvent);
		var middlePoint = this._getTouchBarycenter(touchEvent);
		var mapPoint = this._map.screenCoordsToMapCoords(middlePoint.x, middlePoint.y);
		var mapOffsetX = mapPoint.x - this._centerTouchLocation.x;
		var mapOffsetY = mapPoint.y - this._centerTouchLocation.y;
		var scaleFactor = 1;
		var touches = touchEvent.touches;
		if (touches.length >= 2) {
			var fingerSpacing = this._getFingerSpacing(touchEvent);
			scaleFactor = fingerSpacing / this._initialFingerSpacing;
			this._map.setMapScale(this._initialScale * scaleFactor);
		}
		var currentMapCenter = this._map.getMapCenter();
		this._map.setMapCenter(currentMapCenter.x - mapOffsetX, currentMapCenter.y - mapOffsetY);
	}});
}

