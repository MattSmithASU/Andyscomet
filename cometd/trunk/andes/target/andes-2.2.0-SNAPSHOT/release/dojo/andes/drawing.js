/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["andes.drawing"]) {
	dojo._hasResource["andes.drawing"] = true;
	dojo.provide("andes.drawing");
	(function () {
		dojo.cookie("mikeDev", null, {expires:-1});
		var drawingId = "drawing";
		var _drawing;
		var _surfaceLoaded = false;
		var stencils = {line:"dojox.drawing.stencil.Line", rect:"dojox.drawing.stencil.Rect", ellipse:"dojox.drawing.stencil.Ellipse", vector:"dojox.drawing.tools.custom.Vector", axes:"dojox.drawing.tools.custom.Axes", textBlock:"dojox.drawing.tools.TextBlock"};
		var hasStatement = {"dojox.drawing.stencil.Line":true, "dojox.drawing.stencil.Rect":true, "dojox.drawing.stencil.Ellipse":true, "dojox.drawing.tools.custom.Vector":true, "dojox.drawing.tools.custom.Axes":true};
		var hasLabel = {"dojox.drawing.tools.custom.Axes":true};
		var getStatementPosition = function (box) {
			var gap = 10;
			return {deleteEmptyCreate:false, deleteEmptyModify:false, data:{x:box.x2 + gap, y:box.y1, showEmpty:true}};
		};
		var items = {};
		var masterMap = {};
		dojo.addOnLoad(function () {
			_drawing = dijit.byId(drawingId);
			var cn = dojo.connect(_drawing, "onSurfaceReady", function () {
				dojo.disconnect(cn);
				andes.WordTip.add(_drawing);
				andes.drawing.onSurfaceReady();
				if (_drawing.stencils) {
					console.warn("Label double click connected");
					dojo.connect(_drawing.stencils, "onLabelDoubleClick", andes.drawing, "onLabelDoubleClick");
				}
			});
			dojo.connect(_drawing, "onRenderStencil", andes.drawing, "onRenderStencil");
			if (dojo.isIE) {
				dojo.connect(dojo.global, "onfocus", andes.drawing, "onWindowFocus");
				dojo.connect(dojo.doc, "onfocusout", this, function () {
					if (this._activeElement != document.activeElement) {
						this._activeElement = document.activeElement;
					} else {
						andes.drawing.onWindowBlur();
					}
				});
			} else {
				if (dojo.isSafari) {
					dojo.connect(window, "onblur", andes.drawing, "onWindowBlur");
					dojo.connect(window, "onfocus", andes.drawing, "onWindowFocus");
				} else {
					dojo.connect(dojo.doc, "onblur", andes.drawing, "onWindowBlur");
					dojo.connect(dojo.doc, "onfocus", andes.drawing, "onWindowFocus");
				}
			}
		});
		andes.drawing = {onLabelDoubleClick:function (obj) {
			var s = masterMap[obj.id].statement;
			if (s.getText() == "") {
				s.select();
				s.deselect();
			}
			s.editMode = true;
			s.edit();
		}, onRenderStencil:function (item) {
			if (items[item.id]) {
				console.warn("BLOCKED on render: ", item.id);
				return;
			}
			if (hasStatement[item.type] || hasLabel[item.type]) {
				var box = item.getBounds();
				var props = getStatementPosition(box);
				if (hasLabel[item.type]) {
					props.data.text = andes.defaults.zAxisEnabled ? "x and y and z" : "x and y";
				}
				var statement = _drawing.addStencil("textBlock", props);
				if (hasLabel[item.type]) {
					var s = statement;
					s.customType = "axes";
					item.connect(statement, "onChangeText", this, function (value) {
						item.setLabel(value);
						console.log("-------> onChangeText calling setLabel for ", item.id, ": ", value);
						this.add(item, true);
						_drawing.removeStencil(s);
					});
				} else {
					if (hasStatement[item.type]) {
						var c = new andes.Combo({master:item, statement:statement, onCreate:dojo.hitch(this, function () {
							this.add(c, true);
						})});
					}
				}
			} else {
				if (item.isText && andes.defaults.text.deleteEmptyCreate && !item.getText()) {
					return;
				}
				console.log("ADD EQU OR STT>>>", item.customType);
				this.add(item, true);
			}
		}, addGroup:function (group) {
			items[group.id] = group;
			dojo.forEach(group.items, function (item) {
				dojo.connect(item.master, "onClick", this, function (item) {
					if (item.buttonType == "checkbox") {
						if (item.selected) {
							var pos = dojo.indexOf(item.group.checked, item.value);
							item.group.checked.splice(pos, 1);
							item.deselect();
						} else {
							item.group.checked.push(item.value);
							item.select();
						}
					} else {
						if (item.buttonType == "radio") {
							item.group.checked = [item.value];
							var myId = item.id;
							dojo.forEach(item.buttons, function (button) {
								if (button.id == myId) {
									if (!button.selected) {
										button.select();
									}
								} else {
									if (button.selected) {
										button.deselect();
									}
								}
							});
						}
					}
					if (item.buttonType != "checkbox") {
						var data = andes.convert.drawingToAndes(group, "modify-object");
						andes.drawing.save(data);
					}
				});
			});
		}, add:function (item, saveToServer, noConnect) {
			var i = 0;
			while (items[item.id]) {
				dojox.drawing.util.common.uid(item.type);
				item.id = item.type + i++;
			}
			items[item.id] = item;
			if (item.master) {
				masterMap[item.master.id] = item;
			}
			if (noConnect) {
				return;
			}
			item.connect("onDelete", this, function (item) {
				var id = item.id;
				console.log("----------------------------> onDelete", id);
				this.remove(item);
				if (!item.mod) {
					this.save({action:"delete-object", id:item.id});
				}
			});
			item.connect("onChangeData", this, function (item) {
				if (item.mod == true) {
					return;
				}
				console.log("----------------> onChangeData andes.drawing", item.id, item.type);
				item.mod = true;
				item.attr(andes.defaults["unknown"]);
				item.mod = false;
				var data = andes.convert.drawingToAndes(item, "modify-object");
				console.info("Save mod to server", data);
				this.save(data);
			});
			if (saveToServer) {
				var data = andes.convert.drawingToAndes(item, "new-object");
				console.info("Save new to server:", data);
				this.save(data);
			}
		}, remove:function (item) {
			delete items[item.id];
		}, handleServerActions:function (data) {
			console.log("handleServerActions starting", data.length);
			var getNum = function (m) {
				if (!m.id) {
					return 0;
				}
				var ar = m.id.match(/\d/g);
				if (!ar || !ar.length) {
					return 0;
				}
				return parseInt(ar.join(""), 10);
			};
			var idNum = 0;
			dojo.forEach(data, function (m) {
				idNum = Math.max(getNum(m), idNum);
			});
			++idNum;
			dojox.drawing.util.common.idSetStart(idNum);
			var mods = [];
			var min = 2, max = 5;
			dojo.forEach(data, function (obj, i) {
				if (obj.action == "new-object") {
					var o = andes.convert.andesToDrawing(obj);
					var t = o.stencilType;
					if (t == "vector" || t == "line" || t == "ellipse" || t == "rect") {
						var statement = _drawing.addStencil("textBlock", o.statement);
						var master = _drawing.addStencil(o.stencilType, o.master);
						items[statement.id] = statement;
						items[master.id] = master;
						var combo = new andes.Combo({master:master, statement:statement, id:o.id});
						this.add(combo);
					} else {
						if (o.type == "button" && o.items) {
							var butt = dojo.map(o.items, function (item) {
								var statement = _drawing.addStencil("text", item.statement);
								var master = _drawing.addUI(item.stencilType, item);
								master.group = o;
								items[statement.id] = statement;
								items[master.id] = master;
								return {master:master, statement:statement};
							});
							var buttOnly = dojo.map(butt, function (x) {
								return x.master;
							});
							dojo.forEach(butt, function (x) {
								x.master.buttons = buttOnly;
							});
							var buttonCombo = new andes.buttonCombo(butt, o.id);
							buttonCombo.group = o;
							this.addGroup(buttonCombo);
						} else {
							var item = _drawing.addStencil(o.stencilType, o);
							var ID = item.id;
							ID = ID.indexOf("TextBlock");
							if (item.stencilType == "textBlock" && ID != -1) {
								item.util.uid(item.type);
							}
							item.customType = obj.type;
							this.add(item);
						}
					}
				} else {
					if (obj.action == "modify-object") {
						mods.push(obj);
					} else {
						if (obj.action == "delete-object") {
							if (items[obj.id]) {
								items[obj.id].mod = true;
								if (items[obj.id].type == "andes.Combo") {
									items[obj.id].master.destroy();
								} else {
									items[obj.id].destroy();
								}
								delete items[obj.id];
							}
						} else {
							if (obj.action == "set-score") {
								andes.help.score(obj.score);
							} else {
								if (obj.action == "new-user-dialog") {
									andes.error({title:"Welcome to Andes!", message:obj.text, dialogType:andes.error.OK});
									dojo.connect(dojo.byId("andesButtonPageDefault"), "click", function () {
										andes.principles.review("vec1a-video.html", "IntroVideo", null, "width=650,height=395");
									});
								} else {
									if (obj.action == "set-styles") {
										if (obj["tool"] && obj["style"]) {
											var disable = obj["style"] == "disabled" ? true : false;
											var tool = dojox.drawing.getRegistered("button", obj["tool"]);
											disable ? tool.disable() : tool.enable();
										}
									} else {
										if (obj.action == "set-preference") {
											andes.preferenceRegistry.setPref(obj["name"], obj["value"]);
										} else {
											if (obj.action == "log") {
											} else {
												console.warn("UNUSED ANDES OBJECT:", obj);
											}
										}
									}
								}
							}
						}
					}
				}
			}, this);
			dojo.forEach(mods, function (obj) {
				if (items[obj.id]) {
					items[obj.id].mod = true;
					items[obj.id].attr(andes.defaults[obj.mode]);
					if (obj.x !== undefined) {
						items[obj.id].attr({x:obj.x, y:obj.y});
					}
					if (obj["x-statement"] !== undefined) {
						items[obj.id].statement.attr({x:obj["x-statement"], y:obj["y-statement"]});
					}
					if (obj.type == "vector" || obj.type == "line") {
						if (obj.radius == 0 && obj.angle == 0) {
							obj.angle = 1;
						}
						items[obj.id].master.attr({angle:obj.angle, radius:obj.radius, cosphi:obj.cosphi});
					} else {
						if (obj.type == "axes") {
							items[obj.id].attr({angle:obj.angle, radius:obj.radius, cosphi:obj.cosphi});
						} else {
							if (obj.type == "ellipse" || obj.type == "rectangle") {
								items[obj.id].master.attr({height:obj.height, width:obj.width});
							} else {
								if (obj.type == "button" && obj.checked) {
									items[obj.id].group.checked = obj.checked;
									dojo.forEach(items[obj.id].items, function (pair) {
										if (dojo.indexOf(obj.checked, pair.master.value) != -1) {
											pair.master.select();
										} else {
											pair.master.deselect();
										}
									});
								}
							}
						}
					}
					if (items[obj.id].isText == true && obj.text) {
						items[obj.id].attr({text:obj.text});
					}
					if (obj.text && items[obj.id].type == "andes.Combo") {
						items[obj.id].textEdit(obj.text);
					}
					items[obj.id].mod = false;
				}
			}, this);
			data = null;
		}, onSurfaceReady:function () {
			_surfaceLoaded = true;
			if (this._initialData) {
				this.handleServerActions(this._initialData);
			}
		}, save:function (data) {
			var dfd = andes.api.step(data);
			dfd.addCallback(this, function (data) {
				setTimeout(dojo.hitch(this, function () {
					this.handleServerActions(data);
				}), 0);
			});
			dfd.addErrback(this, "onError");
		}, load:function () {
			this.loadProject = function () {
				console.info("load server data", andes.userId, andes.projectId, andes.sectionId);
				andes.api.open({user:andes.userId, problem:andes.projectId, section:andes.sectionId, extra:andes.extra}).addCallback(this, function (data) {
					setTimeout(dojo.hitch(this, function () {
						this.onLoad(data);
					}), 0);
				}).addErrback(this, "onError");
			};
			if (andes.closeFirst) {
				andes.api.close({}).addCallback(this, "loadProject").addErrback(this, "onError");
			} else {
				this.loadProject();
			}
		}, onLoad:function (data) {
			this._initialData = data;
			if (_surfaceLoaded) {
				this.handleServerActions(this._initialData);
			}
		}, onError:function (err) {
			console.error("There was an error in the project data:", err);
			if (!this._initialData) {
				andes.api.close({});
				dojo.cookie("andes", null, {expires:-1});
			}
		}, onWindowBlur:function () {
			console.log("Lost window focus for ", this.name || "canvas", "; ", this);
			andes.api.recordAction({type:"window", name:this.name || "canvas", value:"blur"});
		}, onWindowFocus:function () {
			console.log("Gained window focus for ", this.name || "canvas", "; ", this);
			andes.api.recordAction({type:"window", name:this.name || "canvas", value:"focus"});
		}};
	})();
}

