/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.uuid.generateRandomUuid"]) {
	dojo._hasResource["dojox.uuid.generateRandomUuid"] = true;
	dojo.provide("dojox.uuid.generateRandomUuid");
	dojox.uuid.generateRandomUuid = function () {
		var HEX_RADIX = 16;
		function _generateRandomEightCharacterHexString() {
			var random32bitNumber = Math.floor((Math.random() % 1) * Math.pow(2, 32));
			var eightCharacterHexString = random32bitNumber.toString(HEX_RADIX);
			while (eightCharacterHexString.length < 8) {
				eightCharacterHexString = "0" + eightCharacterHexString;
			}
			return eightCharacterHexString;
		}
		var hyphen = "-";
		var versionCodeForRandomlyGeneratedUuids = "4";
		var variantCodeForDCEUuids = "8";
		var a = _generateRandomEightCharacterHexString();
		var b = _generateRandomEightCharacterHexString();
		b = b.substring(0, 4) + hyphen + versionCodeForRandomlyGeneratedUuids + b.substring(5, 8);
		var c = _generateRandomEightCharacterHexString();
		c = variantCodeForDCEUuids + c.substring(1, 4) + hyphen + c.substring(4, 8);
		var d = _generateRandomEightCharacterHexString();
		var returnValue = a + hyphen + b + hyphen + c + d;
		returnValue = returnValue.toLowerCase();
		return returnValue;
	};
}

