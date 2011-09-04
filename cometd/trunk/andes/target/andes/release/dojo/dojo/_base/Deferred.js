/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.Deferred"]) {
	dojo._hasResource["dojo._base.Deferred"] = true;
	dojo.provide("dojo._base.Deferred");
	dojo.require("dojo._base.lang");
	(function () {
		var mutator = function () {
		};
		var freeze = Object.freeze || function () {
		};
		dojo.Deferred = function (canceller) {
			var result, finished, isError, head, nextListener;
			var promise = (this.promise = {});
			function complete(value) {
				if (finished) {
					throw new Error("This deferred has already been resolved");
				}
				result = value;
				finished = true;
				notify();
			}
			function notify() {
				var mutated;
				while (!mutated && nextListener) {
					var listener = nextListener;
					nextListener = nextListener.next;
					if ((mutated = (listener.progress == mutator))) {
						finished = false;
					}
					var func = (isError ? listener.error : listener.resolved);
					if (func) {
						try {
							var newResult = func(result);
							if (newResult && typeof newResult.then === "function") {
								newResult.then(dojo.hitch(listener.deferred, "resolve"), dojo.hitch(listener.deferred, "reject"));
								continue;
							}
							var unchanged = mutated && newResult === undefined;
							if (mutated && !unchanged) {
								isError = newResult instanceof Error;
							}
							listener.deferred[unchanged && isError ? "reject" : "resolve"](unchanged ? result : newResult);
						}
						catch (e) {
							listener.deferred.reject(e);
						}
					} else {
						if (isError) {
							listener.deferred.reject(result);
						} else {
							listener.deferred.resolve(result);
						}
					}
				}
			}
			this.resolve = this.callback = function (value) {
				this.fired = 0;
				this.results = [value, null];
				complete(value);
			};
			this.reject = this.errback = function (error) {
				isError = true;
				this.fired = 1;
				complete(error);
				this.results = [null, error];
				if (!error || error.log !== false) {
					(dojo.config.deferredOnError || function (x) {
						console.error(x);
					})(error);
				}
			};
			this.progress = function (update) {
				var listener = nextListener;
				while (listener) {
					var progress = listener.progress;
					progress && progress(update);
					listener = listener.next;
				}
			};
			this.addCallbacks = function (callback, errback) {
				this.then(callback, errback, mutator);
				return this;
			};
			this.then = promise.then = function (resolvedCallback, errorCallback, progressCallback) {
				var returnDeferred = progressCallback == mutator ? this : new dojo.Deferred(promise.cancel);
				var listener = {resolved:resolvedCallback, error:errorCallback, progress:progressCallback, deferred:returnDeferred};
				if (nextListener) {
					head = head.next = listener;
				} else {
					nextListener = head = listener;
				}
				if (finished) {
					notify();
				}
				return returnDeferred.promise;
			};
			var deferred = this;
			this.cancel = promise.cancel = function () {
				if (!finished) {
					var error = canceller && canceller(deferred);
					if (!finished) {
						if (!(error instanceof Error)) {
							error = new Error(error);
						}
						error.log = false;
						deferred.reject(error);
					}
				}
			};
			freeze(promise);
		};
		dojo.extend(dojo.Deferred, {addCallback:function (callback) {
			return this.addCallbacks(dojo.hitch.apply(dojo, arguments));
		}, addErrback:function (errback) {
			return this.addCallbacks(null, dojo.hitch.apply(dojo, arguments));
		}, addBoth:function (callback) {
			var enclosed = dojo.hitch.apply(dojo, arguments);
			return this.addCallbacks(enclosed, enclosed);
		}, fired:-1});
	})();
	dojo.when = function (promiseOrValue, callback, errback, progressHandler) {
		if (promiseOrValue && typeof promiseOrValue.then === "function") {
			return promiseOrValue.then(callback, errback, progressHandler);
		}
		return callback(promiseOrValue);
	};
}

