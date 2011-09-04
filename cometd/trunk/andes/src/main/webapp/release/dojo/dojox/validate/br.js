/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.validate.br"]) {
	dojo._hasResource["dojox.validate.br"] = true;
	dojo.provide("dojox.validate.br");
	dojo.require("dojox.validate._base");
	dojox.validate.br.isValidCnpj = function (value) {
		if (!dojo.isString(value)) {
			if (!value) {
				return false;
			}
			value = value + "";
			while (value.length < 14) {
				value = "0" + value;
			}
		}
		var flags = {format:["##.###.###/####-##", "########/####-##", "############-##", "##############"]};
		if (dojox.validate.isNumberFormat(value, flags)) {
			value = value.replace("/", "").replace(/\./g, "").replace("-", "");
			var cgc = [];
			var dv = [];
			var i, j, tmp;
			for (i = 0; i < 10; i++) {
				tmp = "";
				for (j = 0; j < value.length; j++) {
					tmp += "" + i;
				}
				if (value === tmp) {
					return false;
				}
			}
			for (i = 0; i < 12; i++) {
				cgc.push(parseInt(value.charAt(i), 10));
			}
			for (i = 12; i < 14; i++) {
				dv.push(parseInt(value.charAt(i), 10));
			}
			var base = [9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6].reverse();
			var sum = 0;
			for (i = 0; i < cgc.length; i++) {
				sum += cgc[i] * base[i];
			}
			var dv0 = sum % 11;
			if (dv0 == dv[0]) {
				sum = 0;
				base = [9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5].reverse();
				cgc.push(dv0);
				for (i = 0; i < cgc.length; i++) {
					sum += cgc[i] * base[i];
				}
				var dv1 = sum % 11;
				if (dv1 === dv[1]) {
					return true;
				}
			}
		}
		return false;
	};
	dojox.validate.br.computeCnpjDv = function (value) {
		if (!dojo.isString(value)) {
			if (!value) {
				return "";
			}
			value = value + "";
			while (value.length < 12) {
				value = "0" + value;
			}
		}
		var flags = {format:["##.###.###/####", "########/####", "############"]};
		if (dojox.validate.isNumberFormat(value, flags)) {
			value = value.replace("/", "").replace(/\./g, "");
			var cgc = [];
			var i, j, tmp;
			for (i = 0; i < 10; i++) {
				tmp = "";
				for (j = 0; j < value.length; j++) {
					tmp += "" + i;
				}
				if (value === tmp) {
					return "";
				}
			}
			for (i = 0; i < value.length; i++) {
				cgc.push(parseInt(value.charAt(i), 10));
			}
			var base = [9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6].reverse();
			var sum = 0;
			for (i = 0; i < cgc.length; i++) {
				sum += cgc[i] * base[i];
			}
			var dv0 = sum % 11;
			sum = 0;
			base = [9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5].reverse();
			cgc.push(dv0);
			for (i = 0; i < cgc.length; i++) {
				sum += cgc[i] * base[i];
			}
			var dv1 = sum % 11;
			return ("" + dv0) + dv1;
		}
		return "";
	};
	dojox.validate.br.isValidCpf = function (value) {
		if (!dojo.isString(value)) {
			if (!value) {
				return false;
			}
			value = value + "";
			while (value.length < 11) {
				value = "0" + value;
			}
		}
		var flags = {format:["###.###.###-##", "#########-##", "###########"]};
		if (dojox.validate.isNumberFormat(value, flags)) {
			value = value.replace("-", "").replace(/\./g, "");
			var cpf = [];
			var dv = [];
			var i, j, tmp;
			for (i = 0; i < 10; i++) {
				tmp = "";
				for (j = 0; j < value.length; j++) {
					tmp += "" + i;
				}
				if (value === tmp) {
					return false;
				}
			}
			for (i = 0; i < 9; i++) {
				cpf.push(parseInt(value.charAt(i), 10));
			}
			for (i = 9; i < 12; i++) {
				dv.push(parseInt(value.charAt(i), 10));
			}
			var base = [9, 8, 7, 6, 5, 4, 3, 2, 1].reverse();
			var sum = 0;
			for (i = 0; i < cpf.length; i++) {
				sum += cpf[i] * base[i];
			}
			var dv0 = sum % 11;
			if (dv0 == dv[0]) {
				sum = 0;
				base = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].reverse();
				cpf.push(dv0);
				for (i = 0; i < cpf.length; i++) {
					sum += cpf[i] * base[i];
				}
				var dv1 = sum % 11;
				if (dv1 === dv[1]) {
					return true;
				}
			}
		}
		return false;
	};
	dojox.validate.br.computeCpfDv = function (value) {
		if (!dojo.isString(value)) {
			if (!value) {
				return "";
			}
			value = value + "";
			while (value.length < 9) {
				value = "0" + value;
			}
		}
		var flags = {format:["###.###.###", "#########"]};
		if (dojox.validate.isNumberFormat(value, flags)) {
			value = value.replace(/\./g, "");
			var cpf = [];
			for (i = 0; i < 10; i++) {
				tmp = "";
				for (j = 0; j < value.length; j++) {
					tmp += "" + i;
				}
				if (value === tmp) {
					return "";
				}
			}
			for (i = 0; i < value.length; i++) {
				cpf.push(parseInt(value.charAt(i), 10));
			}
			var base = [9, 8, 7, 6, 5, 4, 3, 2, 1].reverse();
			var sum = 0;
			for (i = 0; i < cpf.length; i++) {
				sum += cpf[i] * base[i];
			}
			var dv0 = sum % 11;
			sum = 0;
			base = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].reverse();
			cpf.push(dv0);
			for (i = 0; i < cpf.length; i++) {
				sum += cpf[i] * base[i];
			}
			var dv1 = sum % 11;
			return ("" + dv0) + dv1;
		}
		return "";
	};
}

