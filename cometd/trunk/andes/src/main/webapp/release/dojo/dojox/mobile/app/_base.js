/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app._base"]) {
	dojo._hasResource["dojox.mobile.app._base"] = true;
	dojo.provide("dojox.mobile.app._base");
	dojo.experimental("dojox.mobile.app._base");
	dojo.require("dijit._base");
	dojo.require("dijit._WidgetBase");
	dojo.require("dojox.mobile");
	dojo.require("dojox.mobile.parser");
	dojo.require("dojox.mobile.Button");
	dojo.require("dojox.mobile.app._event");
	dojo.require("dojox.mobile.app._Widget");
	dojo.require("dojox.mobile.app.StageController");
	dojo.require("dojox.mobile.app.SceneController");
	dojo.require("dojox.mobile.app.SceneAssistant");
	dojo.require("dojox.mobile.app.AlertDialog");
	dojo.require("dojox.mobile.app.List");
	dojo.require("dojox.mobile.app.ListSelector");
	dojo.require("dojox.mobile.app.TextBox");
	dojo.require("dojox.mobile.app.ImageView");
	dojo.require("dojox.mobile.app.ImageThumbView");
	(function () {
		var stageController;
		var appInfo;
		var jsDependencies = ["dojox.mobile", "dojox.mobile.parser"];
		var loadedResources = {};
		var loadingDependencies;
		var rootNode;
		var sceneResources = [];
		function loadResources(resources, callback) {
			var resource;
			var url;
			do {
				resource = resources.pop();
				if (resource.source) {
					url = resource.source;
				} else {
					if (resource.module) {
						url = dojo.baseUrl + dojo._getModuleSymbols(resource.module).join("/") + ".js";
					} else {
						alert("Error: invalid JavaScript resource " + dojo.toJson(resource));
						return;
					}
				}
			} while (resources.length > 0 && loadedResources[url]);
			if (resources.length < 1 && loadedResources[url]) {
				callback();
				return;
			}
			dojo.xhrGet({url:url, sync:false}).addCallbacks(function (text) {
				dojo["eval"](text);
				loadedResources[url] = true;
				if (resources.length > 0) {
					loadResources(resources, callback);
				} else {
					callback();
				}
			}, function () {
				alert("Failed to load resource " + url);
			});
		}
		var pushFirstScene = function () {
			stageController = new dojox.mobile.app.StageController(rootNode);
			var defaultInfo = {id:"com.test.app", version:"1.0.0", initialScene:"main"};
			if (dojo.global["appInfo"]) {
				dojo.mixin(defaultInfo, dojo.global["appInfo"]);
			}
			appInfo = dojox.mobile.app.info = defaultInfo;
			if (appInfo.title) {
				var titleNode = dojo.query("head title")[0] || dojo.create("title", {}, dojo.query("head")[0]);
				document.title = appInfo.title;
			}
			stageController.pushScene(appInfo.initialScene);
		};
		var initBackButton = function () {
			var hasNativeBack = false;
			if (dojo.global.BackButton) {
				BackButton.override();
				dojo.connect(document, "backKeyDown", function (e) {
					dojo.publish("/dojox/mobile/app/goback");
				});
				hasNativeBack = true;
			} else {
				if (dojo.global.Mojo) {
				}
			}
			if (hasNativeBack) {
				dojo.addClass(dojo.body(), "mblNativeBack");
			}
		};
		dojo.mixin(dojox.mobile.app, {init:function (node) {
			rootNode = node || dojo.body();
			dojox.mobile.app.STAGE_CONTROLLER_ACTIVE = true;
			dojo.subscribe("/dojox/mobile/app/goback", function () {
				stageController.popScene();
			});
			dojo.subscribe("/dojox/mobile/app/alert", function (params) {
				dojox.mobile.app.getActiveSceneController().showAlertDialog(params);
			});
			dojo.subscribe("/dojox/mobile/app/pushScene", function (sceneName, params) {
				stageController.pushScene(sceneName, params || {});
			});
			dojo.xhrGet({url:"view-resources.json", load:function (data) {
				var resources = [];
				if (data) {
					sceneResources = data = dojo.fromJson(data);
					for (var i = 0; i < data.length; i++) {
						if (!data[i].scene) {
							resources.push(data[i]);
						}
					}
				}
				if (resources.length > 0) {
					loadResources(resources, pushFirstScene);
				} else {
					pushFirstScene();
				}
			}, error:pushFirstScene});
			initBackButton();
		}, getActiveSceneController:function () {
			return stageController.getActiveSceneController();
		}, getStageController:function () {
			return stageController;
		}, loadResources:function (resources, callback) {
			loadResources(resources, callback);
		}, loadResourcesForScene:function (sceneName, callback) {
			var resources = [];
			for (var i = 0; i < sceneResources.length; i++) {
				if (sceneResources[i].scene == sceneName) {
					resources.push(sceneResources[i]);
				}
			}
			if (resources.length > 0) {
				loadResources(resources, callback);
			} else {
				callback();
			}
		}, resolveTemplate:function (sceneName) {
			return "app/views/" + sceneName + "/" + sceneName + "-scene.html";
		}, resolveAssistant:function (sceneName) {
			return "app/assistants/" + sceneName + "-assistant.js";
		}});
	})();
}

