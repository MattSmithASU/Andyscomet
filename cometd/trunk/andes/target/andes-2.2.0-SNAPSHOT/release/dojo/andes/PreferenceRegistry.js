/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.PreferenceRegistry"]) {
	dojo._hasResource["andes.PreferenceRegistry"] = true;
	dojo.provide("andes.PreferenceRegistry");
	(function () {
		_prefs = {};
		andes.preferenceRegistry = {registerPref:function (pref, setter, scope) {
			_prefs[pref] = {set:setter, scope:scope};
		}, savePref:function (pref, value) {
			if (!_prefs[pref]) {
				console.warn("Must register preference before saving to it");
				return false;
			} else {
				if (_prefs[pref].value != value) {
					andes.api.recordAction({type:"set-preference", name:pref, value:value});
				}
				return true;
			}
		}, setPref:function (pref, value) {
			if (_prefs[pref]) {
				_prefs[pref].value = value;
				var f = _prefs[pref].set, s = _prefs[pref].scope;
				f.call(s, value);
				return true;
			} else {
				console.warn("Attempted to set a preference not registered");
				return false;
			}
		}};
	})();
}

