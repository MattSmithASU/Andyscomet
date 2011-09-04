/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.geo.charting.Map"]) {
	dojo._hasResource["dojox.geo.charting.Map"] = true;
	dojo.provide("dojox.geo.charting.Map");
	dojo.require("dojox.gfx");
	dojo.require("dojox.geo.charting._base");
	dojo.require("dojox.geo.charting._Feature");
	dojo.require("dojox.geo.charting._Marker");
	dojo.require("dojox.geo.charting._MouseInteractionSupport");
	dojo.require("dojox.geo.charting._TouchInteractionSupport");
	dojo.declare("dojox.geo.charting.Map", null, {defaultColor:"#B7B7B7", highlightColor:"#D5D5D5", series:[], constructor:function (container, shapeFile) {
		dojo.style(container, "display", "block");
		this.container = container;
		var containerBounds = this._getContainerBounds();
		this.surface = dojox.gfx.createSurface(container, containerBounds.w, containerBounds.h);
		this._createZoomingCursor();
		this.mapObj = this.surface.createGroup();
		this.mapObj.features = {};
		dojo.xhrGet({url:shapeFile, handleAs:"json", sync:true, load:dojo.hitch(this, "_init")});
		if (this._isMobileDevice()) {
			this._touchInteractionSupport = new dojox.geo.charting._TouchInteractionSupport(this);
		} else {
			this._mouseInteractionSupport = new dojox.geo.charting._MouseInteractionSupport(this);
		}
	}, _getContainerBounds:function () {
		var coords = dojo.coords(this.container);
		var marginBox = dojo.marginBox(this.container);
		var contentBox = dojo.contentBox(this.container);
		return {x:coords.x, y:coords.y, w:contentBox.w || 100, h:contentBox.h || 100};
	}, _isMobileDevice:function () {
		return (dojo.isSafari && (navigator.userAgent.indexOf("iPhone") > -1 || navigator.userAgent.indexOf("iPod") > -1 || navigator.userAgent.indexOf("iPad") > -1)) || (navigator.userAgent.toLowerCase().indexOf("android") > -1);
	}, setMarkerData:function (markerFile) {
		dojo.xhrGet({url:markerFile, handleAs:"json", handle:dojo.hitch(this, "_appendMarker")});
	}, setDataStore:function (dataStore, query) {
		this.dataStore = dataStore;
		var self = this;
		this.dataStore.fetch({query:query, onComplete:function (items) {
			var item = items[0];
			var attributes = self.dataStore.getAttributes(item);
			dojo.forEach(attributes, function (name) {
				if (self.mapObj.features[name]) {
					self.mapObj.features[name].setValue(self.dataStore.getValue(item, name));
				}
			});
		}});
	}, addSeries:function (series) {
		this.series = series;
	}, fitToMapArea:function (mapArea, pixelMargin, animate, onAnimationEnd) {
		if (!pixelMargin) {
			var pixelMargin = 0;
		}
		var width = mapArea.w;
		var height = mapArea.h;
		var containerBounds = this._getContainerBounds();
		var scale = Math.min((containerBounds.w - 2 * pixelMargin) / width, (containerBounds.h - 2 * pixelMargin) / height);
		this.setMapCenterAndScale(mapArea.x + mapArea.w / 2, mapArea.y + mapArea.h / 2, scale, animate, onAnimationEnd);
	}, fitToMapContents:function (pixelMargin, animate, onAnimationEnd) {
		var bbox = this.mapObj.boundBox;
		this.fitToMapArea(bbox, pixelMargin, animate, onAnimationEnd);
	}, setMapCenter:function (centerX, centerY, animate, onAnimationEnd) {
		var currentScale = this.getMapScale();
		this.setMapCenterAndScale(centerX, centerY, currentScale, animate, onAnimationEnd);
	}, _createAnimation:function (onShape, fromTransform, toTransform, onAnimationEnd) {
		var anim = dojox.gfx.fx.animateTransform({duration:1000, shape:onShape, transform:[{name:"translate", start:[fromTransform.dx, fromTransform.dy], end:[toTransform.dx, toTransform.dy]}, {name:"scale", start:[fromTransform.xx], end:[toTransform.xx]}]});
		var listener = dojo.connect(anim, "onEnd", this, function (event) {
			onAnimationEnd(event);
			dojo.disconnect(listener);
		});
		return anim;
	}, setMapCenterAndScale:function (centerX, centerY, scale, animate, onAnimationEnd) {
		var bbox = this.mapObj.boundBox;
		var containerBounds = this._getContainerBounds();
		var offsetX = containerBounds.w / 2 - scale * (centerX - bbox.x);
		var offsetY = containerBounds.h / 2 - scale * (centerY - bbox.y);
		var newTransform = new dojox.gfx.matrix.Matrix2D({xx:scale, yy:scale, dx:offsetX, dy:offsetY});
		var currentTransform = this.mapObj.getTransform();
		if (!animate || !currentTransform) {
			this.mapObj.setTransform(newTransform);
		} else {
			var anim = this._createAnimation(this.mapObj, currentTransform, newTransform, onAnimationEnd);
			anim.play();
		}
	}, getMapCenter:function () {
		var containerBounds = this._getContainerBounds();
		return this.screenCoordsToMapCoords(containerBounds.w / 2, containerBounds.h / 2);
	}, setMapScale:function (scale, animate, onAnimationEnd) {
		var containerBounds = this._getContainerBounds();
		invariantMapPoint = this.screenCoordsToMapCoords(containerBounds.w / 2, containerBounds.h / 2);
		this.setMapScaleAt(scale, invariantMapPoint.x, invariantMapPoint.y, animate, onAnimationEnd);
	}, setMapScaleAt:function (scale, fixedMapX, fixedMapY, animate, onAnimationEnd) {
		var invariantMapPoint = null;
		var invariantScreenPoint = null;
		invariantMapPoint = {x:fixedMapX, y:fixedMapY};
		invariantScreenPoint = this.mapCoordsToScreenCoords(invariantMapPoint.x, invariantMapPoint.y);
		var bbox = this.mapObj.boundBox;
		var offsetX = invariantScreenPoint.x - scale * (invariantMapPoint.x - bbox.x);
		var offsetY = invariantScreenPoint.y - scale * (invariantMapPoint.y - bbox.y);
		var newTransform = new dojox.gfx.matrix.Matrix2D({xx:scale, yy:scale, dx:offsetX, dy:offsetY});
		var currentTransform = this.mapObj.getTransform();
		if (!animate || !currentTransform) {
			this.mapObj.setTransform(newTransform);
		} else {
			var anim = this._createAnimation(this.mapObj, currentTransform, newTransform, onAnimationEnd);
			anim.play();
		}
	}, getMapScale:function () {
		var mat = this.mapObj.getTransform();
		var scale = mat ? mat.xx : 1;
		return scale;
	}, mapCoordsToScreenCoords:function (mapX, mapY) {
		var matrix = this.mapObj.getTransform();
		var screenPoint = dojox.gfx.matrix.multiplyPoint(matrix, mapX, mapY);
		return screenPoint;
	}, screenCoordsToMapCoords:function (screenX, screenY) {
		var invMatrix = dojox.gfx.matrix.invert(this.mapObj.getTransform());
		var mapPoint = dojox.gfx.matrix.multiplyPoint(invMatrix, screenX, screenY);
		return mapPoint;
	}, _init:function (shapeData) {
		this.mapObj.boundBox = {x:shapeData.layerExtent[0], y:shapeData.layerExtent[1], w:(shapeData.layerExtent[2] - shapeData.layerExtent[0]), h:shapeData.layerExtent[3] - shapeData.layerExtent[1]};
		this.fitToMapContents(3);
		dojo.forEach(shapeData.featureNames, function (item) {
			var featureShape = shapeData.features[item];
			featureShape.bbox.x = featureShape.bbox[0];
			featureShape.bbox.y = featureShape.bbox[1];
			featureShape.bbox.w = featureShape.bbox[2];
			featureShape.bbox.h = featureShape.bbox[3];
			var feature = new dojox.geo.charting._Feature(this, item, featureShape);
			feature.init();
			this.mapObj.features[item] = feature;
		}, this);
		this.mapObj.marker = new dojox.geo.charting._Marker({}, this);
	}, _appendMarker:function (markerData) {
		this.mapObj.marker = new dojox.geo.charting._Marker(markerData, this);
	}, _createZoomingCursor:function () {
		if (!dojo.byId("mapZoomCursor")) {
			var mapZoomCursor = dojo.doc.createElement("div");
			dojo.attr(mapZoomCursor, "id", "mapZoomCursor");
			dojo.addClass(mapZoomCursor, "mapZoomIn");
			dojo.style(mapZoomCursor, "display", "none");
			dojo.body().appendChild(mapZoomCursor);
		}
	}, onFeatureClick:function (feature) {
	}, onFeatureOver:function (feature) {
	}, onZoomEnd:function (feature) {
	}});
}

