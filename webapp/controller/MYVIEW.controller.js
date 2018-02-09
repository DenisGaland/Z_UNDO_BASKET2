sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../TABLE/TableExampleUtils",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/table/SelectionMode",
	"sap/ui/table/SelectionBehavior",
	"sap/ui/core/BusyIndicator"
], function(Controller, TableExampleUtils, MessageToast, MessageBox, JSONModel, ODataModel, ResourceModel, SelectionMode,
	SelectionBehavior, BusyIndicator) {
	"use strict";
	return Controller.extend("z_undo_basket2.controller.MYVIEW", {
		onInit: function() {
			var i18nModel = new ResourceModel({
				bundleName: "z_undo_basket2.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			var oView = this.getView();
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setText(site);
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			this.GetBasketHeader("INITSCREEN");
			oView.byId("H_Header").setVisible(false);
			oView.byId("savebasket").setVisible(false);
		},

		CheckSelected: function() {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZBASKET_HEADER_SRV_01/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(IEan='CHECKBASKET')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.Matnr !== "") {
					oView.byId("H_Header").setVisible(true);
					oView.byId("eancode").setValue(response.Ean11);
					oView.byId("descr").setValue(response.Maktx);
					oView.byId("prx").setValue(response.Price);
					oView.byId("ccy").setText(oView.getModel("i18n").getResourceBundle().getText("price_in_eur"));
					oView.byId("unit").setText(oView.getModel("i18n").getResourceBundle().getText("quantity_in_ea"));
					oView.byId("stk").setValue(Math.floor(response.Labst));
					oView.byId("save").setVisible(false);
					oView.byId("clear").setVisible(true);
					oView.byId("Article").setVisible(false);
					oView.byId("savebasket").setVisible(true);
					oView.byId("scroll").setHeight("250px");
				} else {
					var path = $.sap.getModulePath("z_undo_basket2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					var infoMsg = oView.getModel("i18n").getResourceBundle().getText("no_basket_exists");
					MessageBox.error(infoMsg, {
						title: "Error",
						styleClass: "",
						initialFocus: oView.byId("SearchArt").focus(),
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		SaveBasket: function() {
			var oView = this.getView();
			var qty = parseInt(oView.byId("qty").getSelectedKey());
			var stk = parseInt(oView.byId("stk").getValue());
			var model = new JSONModel();
			if (qty > stk) {
				var path = $.sap.getModulePath("z_undo_basket2", "/audio");
				var aud = new Audio(path + "/MOREINFO.png");
				aud.play();
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("quantity_remove");
				MessageBox.error(infoMsg, {
					title: "Error"
				});
			} else {
				qty = qty * -1;
				var URL = "/sap/opu/odata/sap/ZBASKET_SAVE1_SRV/";
				var OData = new ODataModel(URL, true);
				var query = "ItemsSet(IQuantity=" + qty + ")";
				debugger;
				BusyIndicator.show();
				OData.read(query, null, null, true, function(response) {
					BusyIndicator.hide();
					var infoMsg2 = oView.getModel("i18n").getResourceBundle().getText("the_basket_has_been_saved");
					MessageToast.show(infoMsg2, {
						my: "center top",
						at: "center top"
					});
					oView.byId("H_Header").setVisible(false);
					oView.byId("Article").setVisible(true);
					oView.byId("SearchArt").setVisible(true);
					oView.byId("clear").setVisible(true);
					oView.byId("save").setVisible(true);
					oView.byId("savebasket").setVisible(false);
					oView.byId("table1").setVisible(false);
					oView.setModel(model, "itemModel");
					oView.byId("qty").setSelectedKey("1");
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
					oView.byId("TOOL_BAR").setVisible(false);
				}, function(error) {
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				});
			}
		},

		searchArt: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var material = oView.byId("SearchArt").getValue();
			var URL = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/MessageSet(PValue='08" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				if (response.EMessage !== "" && response.EZtype === "E") {
					BusyIndicator.hide();
					var path = $.sap.getModulePath("z_undo_basket2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					var infoMsg = oView.getModel("i18n").getResourceBundle().getText("scan_a_valid_material");
					MessageBox.error(infoMsg, {
						title: "Error",
						styleClass: "",
						initialFocus: oView.byId("SearchArt").focus(),
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					oTable.setVisible(true);
					oController.GetBasketHeader(material);
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		GetBasketHeader: function(material) {
			var oController = this;
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZBASKET_HEADER_SRV_01/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(IEan='" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				debugger;
				if (response.Matnr !== "") {
					oView.byId("H_Header").setVisible(true);
					oView.byId("eancode").setValue(response.Ean11);
					oView.byId("descr").setValue(response.Maktx);
					oView.byId("prx").setValue(response.Price);
					oView.byId("ccy").setText(oView.getModel("i18n").getResourceBundle().getText("price_in_eur"));
					oView.byId("unit").setText(oView.getModel("i18n").getResourceBundle().getText("quantity_in_ea"));
					oView.byId("stk").setValue(response.Labst);
					oView.byId("save").setVisible(false);
					oView.byId("clear").setVisible(true);
					oView.byId("Article").setVisible(false);
					oView.byId("savebasket").setVisible(true);
					oView.byId("SearchArt").setValue("");
					oView.byId("SearchArt").setVisible(false);
					oView.byId("TOOL_BAR").setVisible(true);
					oController.GetData("D");
				} else {
					if (material === "INITSCREEN") {
						oController.GetData("D");
					} else {
						oController.GetData("A/" + material);
					}
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});

		},

		ClearLabels: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table1");
			var Button = oView.byId("TOOL_BAR");
			var URL = "/sap/opu/odata/sap/ZBASKET_ITEMS_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "ItemsSet?$filter=ZembArt%20eq%20%27U/T%27";
			var model = new JSONModel();
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				oView.byId("eancode").setValue("");
				oView.byId("descr").setValue("");
				oView.byId("prx").setValue("");
				oView.byId("ccy").setText("");
				oView.byId("unit").setText("");
				oView.byId("stk").setValue("");
				oView.byId("H_Header").setVisible(false);
				oView.byId("Article").setVisible(true);
				oView.byId("SearchArt").setVisible(true);
				oView.byId("savebasket").setVisible(false);
				oView.byId("scroll").setHeight("420px");
				oView.byId("save").setVisible(true);
				oTable.setVisible(false);
				Button.setVisible(false);
				oView.setModel(model, "itemModel");
				var infoMsg = oView.getModel("i18n").getResourceBundle().getText("list_cleared");
				MessageToast.show(infoMsg, {
					my: "center top",
					at: "center top"
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("SearchArt").focus();
			});
		},

		GetData: function(action) {
			var oView = this.getView();
			var searchString = "U/" + action;
			this.getView().byId("SearchArt").setValue("");
			var URL = "/sap/opu/odata/sap/ZBASKET_ITEMS_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet?$filter=ZembArt" + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.EMessage !== "" && response.EZtype === "E") {
					var path = $.sap.getModulePath("z_undo_basket2", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response.EMessage, MessageBox.Icon.ERROR);
				} else {
					var newArray = response.results;
					var lines = newArray.length;
					var sum = 0;
					for (var i = 0; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Qty) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					if (lines > 0) {
						var oArticle = oView.byId("TOOL_BAR");
						oArticle.setVisible(true);
						oView.byId("table1").setVisible(true);
						if (lines > 8) {
							oView.byId("Scroll").setVisible(true);
						}
					}
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					oView.setModel(model, "itemModel");
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("SearchArt").focus();
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
			var aSelectionModes = [];
			jQuery.each(SelectionMode, function(k, v) {
				if (k !== SelectionMode.Multi) {
					aSelectionModes.push({
						key: k,
						text: v
					});
				}
			});
			var aSelectionBehaviors = [];
			jQuery.each(SelectionBehavior, function(k, v) {
				aSelectionBehaviors.push({
					key: k,
					text: v
				});
			});
			// create JSON model instance
			var oModel = new sap.ui.model.json.JSONModel({
				"selectionitems": aSelectionModes,
				"behavioritems": aSelectionBehaviors
			});
			oView.setModel(oModel, "selectionmodel");
		}
	});
});