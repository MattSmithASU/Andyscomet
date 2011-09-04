/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.css3.fx"]) {
	dojo._hasResource["dojox.css3.fx"] = true;
	dojo.provide("dojox.css3.fx");
	dojo.require("dojo.fx");
	dojo.require("dojox.html.ext-dojo.style");
	dojo.require("dojox.fx.ext-dojo.complex");
	dojo.mixin(dojox.css3.fx, {puff:function (args) {
		return dojo.fx.combine([dojo.fadeOut(args), this.expand({node:args.node, endScale:args.endScale || 2})]);
	}, expand:function (args) {
		return dojo.animateProperty({node:args.node, properties:{transform:{start:"scale(1)", end:"scale(" + [args.endScale || 3] + ")"}}});
	}, shrink:function (args) {
		return this.expand({node:args.node, endScale:0.01});
	}, rotate:function (args) {
		return dojo.animateProperty({node:args.node, duration:args.duration || 1000, properties:{transform:{start:"rotate(" + (args.startAngle || "0deg") + ")", end:"rotate(" + (args.endAngle || "360deg") + ")"}}});
	}, flip:function (args) {
		var anims = [], whichAnims = args.whichAnims || [0, 1, 2, 3], direction = args.direction || 1, transforms = [{start:"scale(1, 1) skew(0deg,0deg)", end:"scale(0, 1) skew(0," + (direction * 30) + "deg)"}, {start:"scale(0, 1) skew(0deg," + (direction * 30) + "deg)", end:"scale(-1, 1) skew(0deg,0deg)"}, {start:"scale(-1, 1) skew(0deg,0deg)", end:"scale(0, 1) skew(0deg," + (-direction * 30) + "deg)"}, {start:"scale(0, 1) skew(0deg," + (-direction * 30) + "deg)", end:"scale(1, 1) skew(0deg,0deg)"}];
		for (var i = 0; i < whichAnims.length; i++) {
			anims.push(dojo.animateProperty(dojo.mixin({node:args.node, duration:args.duration || 600, properties:{transform:transforms[whichAnims[i]]}}, args)));
		}
		return dojo.fx.chain(anims);
	}, bounce:function (args) {
		var anims = [], n = args.node, duration = args.duration || 1000, scaleX = args.scaleX || 1.2, scaleY = args.scaleY || 0.6, ds = dojo.style, oldPos = ds(n, "position"), newPos = "absolute", oldTop = ds(n, "top"), combinedAnims = [], bTime = 0, round = Math.round, jumpHeight = args.jumpHeight || 70;
		if (oldPos !== "absolute") {
			newPos = "relative";
		}
		var a1 = dojo.animateProperty({node:n, duration:duration / 6, properties:{transform:{start:"scale(1, 1)", end:"scale(" + scaleX + ", " + scaleY + ")"}}});
		dojo.connect(a1, "onBegin", function () {
			ds(n, {transformOrigin:"50% 100%", position:newPos});
		});
		anims.push(a1);
		var a2 = dojo.animateProperty({node:n, duration:duration / 6, properties:{transform:{end:"scale(1, 1)", start:"scale(" + scaleX + ", " + scaleY + ")"}}});
		combinedAnims.push(a2);
		combinedAnims.push(new dojo.Animation(dojo.mixin({curve:[], duration:duration / 3, delay:duration / 12, onBegin:function () {
			bTime = (new Date).getTime();
		}, onAnimate:function () {
			var cTime = (new Date).getTime();
			ds(n, {top:parseInt(ds(n, "top")) - round(jumpHeight * ((cTime - bTime) / this.duration)) + "px"});
			bTime = cTime;
		}}, args)));
		anims.push(dojo.fx.combine(combinedAnims));
		anims.push(dojo.animateProperty(dojo.mixin({duration:duration / 3, onEnd:function () {
			ds(n, {position:oldPos});
		}, properties:{top:oldTop}}, args)));
		anims.push(a1);
		anims.push(a2);
		return dojo.fx.chain(anims);
	}});
}

