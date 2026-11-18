sap.ui.define([
    // "sap/ui/core/mvc/Controller",
    "subscriptionpricedetermination/controller/BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/Input"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Fragment, Filter, FilterOperator, newInput) {
        "use strict";

        return BaseController.extend("subscriptionpricedetermination.controller.landingPage", {
            onInit: function () {
                this.onInitBaseController();
                var oJModel = this.fnGetModel("BaseModel");
                oJModel.setProperty("/AddOn", {});
                oJModel.setProperty("/matPriceArr", []);
                // debugger
                // var finalJModel = new sap.ui.model.json.JSONModel();
                // this.getView().setModel(finalJModel);
                this.getSalesOrg();
                var oViewGenAIModel = new JSONModel({
                    iconTooltipText: "GenAI Recommendations to select Usage Based Billing",
                    GenAIText:"",
                  });
                  this.getView().setModel(oViewGenAIModel, "ViewGenAIModel");
                const sImagePath = sap.ui.require.toUrl("subscriptionpricedetermination") + "/images/image1.png";
                // this.getView().byId("info").setIcon(sImagePath);
            },

            GetGenAIRecommendation: function(CustomerCode){
                // debugger
                var oMsg = this.byId("ms");
                var oBusy = new sap.m.BusyDialog();
                oBusy.open();
                fetch("https://presales-be-app.cfapps.eu10-004.hana.ondemand.com/get_business_percentage", { 
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({"user_query": parseInt(CustomerCode)}),
                  })
                  .then(response => {
                    if (!response.ok) {
                    //   throw new Error(`HTTP error! status: ${response.status}`);
                    //   console.log('${response.status}'); 
                    }
                    return response.json();
                  }).then(data => {
                    var result = Object.values(data.response) ;
                    // debugger
                    oBusy.close();
                    var formattedText = "Predicted Usage: " + result[0] + "\n" + "Predicted Increase in Revenue: " + result[1] + "\n\n" + result[2];
                    // oMsg.setVisible(true);
                    // oMsg.setText(formattedText);
                    this.fnGetModel("BaseModel").setProperty("/GenAIRecommendationText", formattedText);
                    this.fnGetModel("BaseModel").refresh(true);

            //         for (var key in result) {
            //             if (result.hasOwnProperty(key)) {
            //                 var sLowerCaseKey = key.toLowerCase();
            //         if(sLowerCaseKey == "analysis"){
            //             this.fnGetModel("BaseModel").setProperty("/GenAIRecommendationText", result[key]);
            //             oBusy.close();  
            //         }
            //         else if(sLowerCaseKey == "explanation"){
            //             this.fnGetModel("BaseModel").setProperty("/GenAIRecommendationText", result[key]);
            //             oBusy.close();
            //         }
            //         else if(sLowerCaseKey == "reason"){
            //             this.fnGetModel("BaseModel").setProperty("/GenAIRecommendationText", result[key]);
            //             oBusy.close();  
            //         }
            //         else if(sLowerCaseKey == "message"){
            //             this.fnGetModel("BaseModel").setProperty("/GenAIRecommendationText", result[key]);
            //             oBusy.close();  
            //         }
            //         else{
            //             oBusy.close();  
            //         }
                   
            //     }
            // }
                  });
            },
            onPressInformation:function(oEvent){
                // debugger
                var oJModel = this.fnGetModel("BaseModel");
                // var GenAIRecommendation = oJModel.getProperty("/GenAIRecommendationText");
                // this.getView().getModel("ViewGenAIModel").setProperty( "/GenAIText",GenAIRecommendation);
                // this.byId("ms").setVisible(true);


                var oButton = oEvent.getSource(),
				oView = this.getView();

                // create popover
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.GenAIPopover",
                        controller: this
                    }).then(function(oPopover) {
                        oView.addDependent(oPopover);
                        // oPopover.bindElement("/ProductCollection/0");
                        // this.getView().getModel("ViewGenAIModel").setProperty( "/GenAIText",GenAIRecommendation);
                        oView.byId("ms").setVisible(true);
                        return oPopover;
                    });
                }
                this._pPopover.then(function(oPopover) {
                    oPopover.openBy(oButton);
                });

            },
            
            onPressDiscountInfo: function(oEvent) {
                var oJModel = this.fnGetModel("BaseModel");
                var GenAIRecommendation = oJModel.getProperty("/GenAiDiscountText");
                // this.getView().getModel("ViewGenAIModel").setProperty( "/GenAIDiscText",GenAIRecommendation);
                // this.byId("ms1").setVisible(true);

                var oButton = oEvent.getSource(),
				oView = this.getView();


                // create popover
                if (!this._qPopover) {
                    this._qPopover = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.GenAIDiscount",
                        controller: this
                    }).then(function(qPopover) {
                        oView.addDependent(qPopover);
                        // oPopover.bindElement("/ProductCollection/0");
                        // this.getView().getModel("ViewGenAIModel").setProperty( "/GenAIText",GenAIRecommendation);
                        oView.byId("ms1").setVisible(true);
                        return qPopover;
                    });
                }
                this._qPopover.then(function(qPopover) {
                    qPopover.openBy(oButton);
                });

            },

            onSearch: function(oEvent) {
                var sQuery = oEvent.getParameter("value");
                // debugger
                
                var parentList = oEvent.getSource().getId();

                if (parentList.includes('selectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("SalesOrganizationName", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                    // update list binding
                    var oList = this.byId("selectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                } else if (parentList.includes('distributionSelectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("ChannelName", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                                    // update list binding
                    var oList = this.byId("distributionSelectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                } else if (parentList.includes('divisionSelectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("DivisionName", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                                    // update list binding
                    var oList = this.byId("divisionSelectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                } else if (parentList.includes('plantSelectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("PlantName", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                                    // update list binding
                    var oList = this.byId("plantSelectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                } else if (parentList.includes('custSelectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("CustomerId", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                                    // update list binding
                    var oList = this.byId("custSelectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                } else if (parentList.includes('offeringSelectDialog')) {
                    var InputFilter = new sap.ui.model.Filter({
                        filters: [
                          new sap.ui.model.Filter("OfferingId", sap.ui.model.FilterOperator.Contains, sQuery),
                          new sap.ui.model.Filter("OfferingName", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                      });
                                    // update list binding
                    var oList = this.byId("offeringSelectDialog");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(InputFilter);
                }
            },

            getSalesOrg: function(oEvent) {
                // debugger
                var oModel = this.getOwnerComponent().getModel();
                var oJModel = this.fnGetModel("BaseModel");
                oModel.read("/A_SalesOrganizationText", {
                    filters: [
                        new Filter({
                            path: "Language",
                            operator: FilterOperator.EQ,
                            value1: "EN"
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        oJModel.setProperty("/SalesOrg", res.results);
                        // oJModel.setData(res.results);                       
                        // this.getView().setModel(oJModel, "DistChannel");
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                    }
                });
            },



            onValueHelpRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();

                var oBusy = new sap.m.BusyDialog();
    
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.SalesValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },

            onValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
    
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
    
            onValueHelpClose: function (oEvent) {
                // debugger
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
    
                this.byId("salesOrg").setValue(oSelectedItem.getTitle());

                var salesCode = oSelectedItem.getDescription();

                // debugger

                this.fnGetModel("BaseModel").setProperty("/salesCode", salesCode);
                this.fnGetModel("BaseModel").setProperty("/salesOrgName", oSelectedItem.getTitle());

                this.getDistributionChannel(salesCode);

                this.byId("distributionChannel").setEnabled(true);
            },

            getDistributionChannel: function(oEvent) {
                // var oModel = this.getOwnerComponent().getModel("ZDISTRIBUTIONCHANNEL_CDS");
                
                var oModel = this.getOwnerComponent().getModel("DISTRIBUTIONCHANNEL_CDS");
                var oBusy = new sap.m.BusyDialog();
                // var oJModel = new sap.ui.model.json.JSONModel();
                // debugger
                var oJModel = this.fnGetModel("BaseModel");

                oBusy.open();
                oModel.read("/ZDistributionChannel", {
                    filters: [
                        new Filter({
                            path: "SalesOrganization",
                            operator: FilterOperator.EQ,
                            value1: oEvent
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // oJModel.setData(res.results);
                        // this.getView().setModel(oJModel, "DistChannelModel");
                        // this.getView().setModel(oJModel, "DistChannel");
                        oJModel.setProperty("/DistChannel", res.results);
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },
            
            onDistValueHelpClose: function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
    
                this.byId("distributionChannel").setValue(oSelectedItem.getTitle());

                var salesCode = this.byId("salesOrg").getValue();
                var distChannel = oSelectedItem.getDescription();

                // debugger
                this.fnGetModel("BaseModel").setProperty("/distChannel", distChannel);
                this.fnGetModel("BaseModel").setProperty("/distChannelName", oSelectedItem.getTitle());
                
                this.getDivision(distChannel);
                this.getPlant(distChannel);
                this.byId("division").setEnabled(true);

            },

            getDivision: function(oEvent) {
                var salesCode = this.fnGetModel("BaseModel").getData().salesCode;
                // debugger
                // var oModel = this.getOwnerComponent().getModel("ZDIVISIONLIST_CDS");
                var oModel = this.getOwnerComponent().getModel("DIVISIONLIST_CDS");
                var oBusy = new sap.m.BusyDialog();
                // var _oJModel = new sap.ui.model.json.JSONModel();
                var oJModel = this.fnGetModel("BaseModel");
                oBusy.open();
                oModel.read("/ZDivisionList", {
                    filters: [
                        new Filter({
                            path: "SalesOrganization",
                            operator: FilterOperator.EQ,
                            value1: salesCode
                        }),
                        new Filter({
                            path: "DistributionChannel",
                            operator: FilterOperator.EQ,
                            value1: oEvent
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // _oJModel.setData(res.results);
                        // this.getView().setModel(_oJModel, "DivisionModel");
                        oJModel.setProperty("/Division", res.results);
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },

            onDivisionValueHelpClose: function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
    
                this.byId("division").setValue(oSelectedItem.getTitle());

                // var salesCode = this.byId("division").getValue();
                // var distChannel = oSelectedItem.getDescription();
                var divisionCode = oSelectedItem.getDescription();
                this.fnGetModel("BaseModel").setProperty("/divisionCode", divisionCode);
                this.byId("plantList").setEnabled(true);
                // debugger
                
                // this.getDivision(distChannel);
            },

            onDistributionValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
    
                if (!this._qValueHelpDialog) {
                    this._qValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.DistributionValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._qValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },

            onDivisionValueHelp: function(oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
    
                if (!this._tValueHelpDialog) {
                    this._tValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.DivisionValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._tValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },


            onPlantValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
    
                if (!this._rValueHelpDialog) {
                    this._rValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.PlantValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._rValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },

            getPlant: function(oEvent) {
                var salesCode = this.fnGetModel("BaseModel").getData().salesCode;
                // debugger
                var oBusy = new sap.m.BusyDialog();
                // var oModel = this.getOwnerComponent().getModel("ZPlantList_cds");
                var oModel = this.getOwnerComponent().getModel("PLANTLIST_CDS");
                // var _oJModel = new sap.ui.model.json.JSONModel();
                var oJModel = this.fnGetModel("BaseModel");
                oBusy.open();
                oModel.read("/ZPLANTLIST", {
                    filters: [
                        new Filter({
                            path: "SalesOrganization",
                            operator: FilterOperator.EQ,
                            value1: salesCode
                        }),
                        new Filter({
                            path: "DistributionChannel",
                            operator: FilterOperator.EQ,
                            value1: oEvent
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // _oJModel.setData(res.results);
                        // this.getView().setModel(_oJModel, "PlantModel");
                        oJModel.setProperty("/Plant", res.results);
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },

            onPlantValueHelpClose: function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
    
                this.byId("plantList").setValue(oSelectedItem.getTitle());
                

                // var salesCode = this.byId("division").getValue();
                // var distChannel = oSelectedItem.getDescription();

                // var plantCode = oSelectedItem.getDescription();

                // debugger
                
                // this.getDivision(distChannel);
                // debugger
                var plantCode = oSelectedItem.getDescription();
                this.fnGetModel("BaseModel").setProperty("/plant", plantCode);
                this.getCustomer();
                this.byId("custId").setEnabled(true);
                this.byId("offerId").setEnabled(true);
                // this.byId("unitOfPurchase").setEnabled(true);
            },

            getCustomer: function(oEvent) {
                var salesCode = this.fnGetModel("BaseModel").getData().salesCode;
                var distChannelCode = this.fnGetModel("BaseModel").getData().distChannel;
                var divisionCode = this.fnGetModel("BaseModel").getData().divisionCode;
                // debugger
                var oBusy = new sap.m.BusyDialog();
                // var oModel = this.getOwnerComponent().getModel("ZCUSTOMERLIST_CDS");
                var oModel = this.getOwnerComponent().getModel("CUSTOMERLIST_CDS");
                // var _oJModel = new sap.ui.model.json.JSONModel();
                var oJModel = this.fnGetModel("BaseModel");
                oBusy.open();
                oModel.read("/ZCustomerList", {
                    filters: [
                        new Filter({
                            path: "SalesOrganization",
                            operator: FilterOperator.EQ,
                            value1: salesCode
                        }),
                        new Filter({
                            path: "DistributionChannel",
                            operator: FilterOperator.EQ,
                            value1: distChannelCode
                        }),
                        new Filter({
                            path: "Division",
                            operator: FilterOperator.EQ,
                            value1: divisionCode
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // _oJModel.setData(res.results);
                        // this.getView().setModel(_oJModel, "CustModel");
                        oJModel.setProperty("/Customer", res.results);
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },

            onCustValueHelpClose: function(oEvent) {
                // debugger
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
                var custCode = oSelectedItem.getTitle();
                var custName = oSelectedItem.getDescription();
                this.fnGetModel("BaseModel").setProperty("/custCode", custCode);
                this.fnGetModel("BaseModel").setProperty("/custName", custName);
    
                this.byId("custId").setValue(oSelectedItem.getTitle());
                this.byId("custName").setText(oSelectedItem.getDescription());
                // debugger
                // this.setOfferingTableBinding();
                this.getOfferings();
                this.GetGenAIRecommendation(custCode);
            },

            onCustomerValueHelp: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
    
                if (!this._sValueHelpDialog) {
                    this._sValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.CustomerValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._sValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },

            onOfferingValueHelp: function(oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
    
                if (!this._uValueHelpDialog) {
                    this._uValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.OfferingValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._uValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
            },

            onOfferingValueHelpClose: function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
    
                if (!oSelectedItem) {
                    return;
                }
                // debugger
    
                this.byId("offerId").setValue(oSelectedItem.getTitle());
                this.byId("offeringName").setText(oSelectedItem.getDescription());
                this.fnGetModel("BaseModel").setProperty("/offerName", oSelectedItem.getDescription());
                this.byId("unitOfPurchase").setValue(1);
                this.byId("unitOfPurchase").setEnabled(true);
                this.setOfferingTableBinding();
            },
            getOfferings: function() {
                var salesCode = this.fnGetModel("BaseModel").getData().salesCode;
                var distChannelCode = this.fnGetModel("BaseModel").getData().distChannel;
                var oBusy = new sap.m.BusyDialog();

                var oModel = this.getOwnerComponent().getModel("OFFERINGNAME_CDS");
                var oJModel = this.fnGetModel("BaseModel");
                // var _oJModel = new sap.ui.model.json.JSONModel();
                oBusy.open();
                oModel.read("/ZOfferingName", {
                    filters: [
                        new Filter({
                            path: "SalesOrganization",
                            operator: FilterOperator.EQ,
                            value1: salesCode
                        }),
                        new Filter({
                            path: "DistributionChannel",
                            operator: FilterOperator.EQ,
                            value1: distChannelCode
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // _oJModel.setData(res.results);
                        // this.getView().setModel(_oJModel, "offeringsModel");
                        oJModel.setProperty("/Offerings", res.results);
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },

            setOfferingTableBinding: function() {
                var oBusy = new sap.m.BusyDialog();
                oBusy.open();
                var offeringId = this.byId("offerId").getValue();
                // debugger
                var oModel = this.getOwnerComponent().getModel("OFFITEMDESC_cds");
                // var _oJModel = new sap.ui.model.json.JSONModel();
                var oJModel = this.fnGetModel("BaseModel");
                oModel.read("/ZOFFITEMDESC", {
                    filters: [
                        new Filter({
                            path: "OfferingId",
                            operator: FilterOperator.EQ,
                            value1: offeringId
                        })
                    ],
                    success: function(res) {
                        // console.log(res);
                        // _oJModel.setData(res.results);
                        // this.getView().setModel(_oJModel, "offModel");
                        // debugger
                        var aOfferTable = res.results.map(function (oItem) {
    oItem.isSelected = oItem.OPTIONAL !== "X";
    return oItem;
});

oJModel.setProperty("/OfferTable", aOfferTable);
                        oJModel.setProperty("/OfferTable", res.results);
                        this.byId("offeringsTable").getBinding("items").refresh();

                        var oCurrentDate = new Date();
                        var sFormattedDate = sap.ui.core.format.DateFormat.getDateInstance({pattern: "dd.MM.yyyy"}).format(oCurrentDate);

                        oJModel.setProperty("/currentDate", sFormattedDate);

                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
            },

            onStep2: function() {
                // console.log("YAYYYY");
                var offeringId = this.byId("offerId").getValue();
                this.byId("selectedOffering").setText(offeringId);
            },

            onUsageBilling: function(oEvent) {
                // debugger
                var iIndex = oEvent.getParameter("selectedIndex"),
                oGroup = oEvent.getSource();

                if(iIndex === 0) {
                    this.byId("exp").setVisible(true);
                    this.byId("info").setVisible(true);
                } else {
                    this.byId("exp").setVisible(false);
                    this.byId("info").setVisible(false);
                    
                    this.byId("rbg4").setSelectedIndex(-1);
                }
            },

            // onConfigureProduct: function(oEvent) {
            //     var that = this;
            //     var oView = this.getView();
            //     var oSelectedItem = oEvent.getSource().getParent();
            //     var oBindingContext = oSelectedItem.getBindingContext("BaseModel").getObject();
            //     var _oJModel = new sap.ui.model.json.JSONModel();
            
            //     var oModel = this.getView().getModel();
            //     var oJModel = this.fnGetModel("BaseModel");
            //     oJModel.setProperty("/matNumber", oBindingContext.matnr);
            
            //     if (!this._wValueHelpDialog) {
            //         this._wValueHelpDialog = Fragment.load({
            //             id: oView.getId(),
            //             name: "subscriptionpricedetermination.view.fragments.CustomiseValueHelp",
            //             controller: this
            //         }).then(function (oDialog) {
            //             that.onFetchCharacteristics(oBindingContext);
            //             oDialog.setModel(_oJModel, "configModel");
            //             oView.addDependent(oDialog);
            //             return oDialog;
            //         });
            //     }
            //     this._wValueHelpDialog.then(function(oDialog) {
            //         oDialog.getModel("configModel").setData(oBindingContext);
            //         that.onFetchCharacteristics(oBindingContext);
            //         that.onFetchFixedPrice(oBindingContext);
            
            //         // Restore total value for the product if it exists
            //         var matnr = oBindingContext.matnr;
            //         var matPriceArr = oJModel.getProperty("/matPriceArr") || [];
            //         var totalValue = 0;
            
            //         var matPrice = matPriceArr.find(item => item.id === matnr);
            //         if (matPrice) {
            //             totalValue = matPrice.addOnPrice || 0;
            //         }
            
            //         oJModel.setProperty("/totalPrice", totalValue);
            
            //         oDialog.open();
            //     });
            // },

            onConfigureProduct: function(oEvent) {
                var that = this;
                var oView = this.getView();
                var oSelectedItem = oEvent.getSource().getParent();
                var oBindingContext = oSelectedItem.getBindingContext("BaseModel").getObject();
                var _oJModel = new sap.ui.model.json.JSONModel();
            
                var oModel = this.getView().getModel();
                var oJModel = this.fnGetModel("BaseModel");
                oJModel.setProperty("/matNumber", oBindingContext.matnr);
                oJModel.setProperty("/dialogReopened", false);
            
                if (!this._wValueHelpDialog) {
                    this._wValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "subscriptionpricedetermination.view.fragments.CustomiseValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        that.onFetchCharacteristics(oBindingContext);
                        oDialog.setModel(_oJModel, "configModel");
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
            
                this._wValueHelpDialog.then(function(oDialog) {
                    oDialog.getModel("configModel").setData(oBindingContext);
                    that.onFetchCharacteristics(oBindingContext);
                    that.onFetchFixedPrice(oBindingContext);
            
                    // Store initial selections to track changes
                    var savedSelections = oJModel.getProperty("/selections/" + oBindingContext.matnr) || {};
                    that._initialSelections = JSON.parse(JSON.stringify(savedSelections));
            
                    // Restore total value for the product if it exists
                    var matnr = oBindingContext.matnr;
                    var matPriceArr = oJModel.getProperty("/matPriceArr") || [];
                    var totalValue = 0;
            
                    var matPrice = matPriceArr.find(item => item.id === matnr);
                    if (matPrice) {
                        totalValue = matPrice.addOnPrice || 0;
                    }
            
                    oJModel.setProperty("/totalPrice", totalValue);
                    oJModel.setProperty("/dialogReopened", true);
            
                    oDialog.open();
                });
            },

            

            // onFetchCharacteristics: function(oBindingContext) {
            //     var oBusy = new sap.m.BusyDialog();
            //     oBusy.open();
            //     this._matnrData = {};
            
            //     var selectedItem = oBindingContext.matnr;
            //     var oModel = this.getOwnerComponent().getModel("ZMatWithCharac_cds");
            //     var oJModel = new sap.ui.model.json.JSONModel();
            //     var _globalModel = this.fnGetModel("BaseModel");
            //     var savedSelections = _globalModel.getProperty("/selections/" + selectedItem) || {};

            //     // console.log("Saved Selections:", savedSelections);
            //     console.log("Fetching Saved Selections for", selectedItem, ":", savedSelections);

            //     // _globalModel.setProperty("/currentAddOnTotal", 0);
            //     // _globalModel.setProperty("/totalPrice", _globalModel.getProperty("/FixedPrice"));
            
            //     oModel.read("/ZMatWithCharac", {
            //         urlParameters: {
            //             "$expand": "tovalues"
            //         },
            //         filters: [
            //             new sap.ui.model.Filter({
            //                 path: "Item",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: selectedItem
            //             })
            //         ],
            //         success: function(res) {
            //             console.log(res);
            //             oJModel.setData(res.results);
            //             _globalModel.setProperty("/characValues", res.results);
            //             this.getView().setModel(oJModel, "charModel");
            
            //             var oLayout = this.byId("configBox");
            //             oLayout.removeAllItems();
            
            //             var mandatoryFieldExists = false;
            
            //             oJModel.getData().forEach(function(characteristic, i) {
            //                 var labelText = characteristic.CharacteristicName;
            
            //                 if (characteristic.mandatory === "X") {
            //                     labelText += " *";
            //                     mandatoryFieldExists = true;
            //                 }
            
            //                 var element = new sap.m.Label({
            //                     text: labelText,
            //                 });
            
            //                 var newInput = new sap.m.Select({
            //                     enabled: !mandatoryFieldExists || characteristic.mandatory === "X",
            //                     forceSelection: false,
            //                     width: "120px",
            //                     change: this.onDropdownChange.bind(this),
            //                     customData: [
            //                         new sap.ui.core.CustomData({
            //                             key: "characteristicName",
            //                             value: characteristic.CharacteristicName
            //                         })
            //                     ]
            //                 });
            
            //                 var results = characteristic.tovalues.results;
            
            //                 results.forEach(function(result) {
            //                     newInput.addItem(new sap.ui.core.Item({
            //                         key: result.Value,
            //                         text: result.Value
            //                     }));
            //                 });
            
            //                 // Set the saved selection if it exists
            //                 if (savedSelections[characteristic.CharacteristicName]) {
            //                     newInput.setSelectedKey(savedSelections[characteristic.CharacteristicName]);
            //                 }

            //                 var vBox = new sap.m.VBox({
            //                     items: [element, newInput],
            //                     width: "200px",
            //                     alignItems: "Center" // Ensure it uses full width
            //                 });

            //                 oLayout.addItem(vBox);
            //                 vBox.addStyleClass("sapUiMediumMarginTop");

            //             }.bind(this));
            
            //             oBusy.close();
            //         }.bind(this),
            //         error: function(err) {
            //             console.error("Error fetching characteristics:", err);
            //             sap.m.MessageToast.show("Failed to fetch characteristics data.");
            //             oBusy.close();
            //         }
            //     });
            // },

            onFetchCharacteristics: function(oBindingContext) {
                var oBusy = new sap.m.BusyDialog();
                oBusy.open();
                this._matnrData = {};
            
                var selectedItem = oBindingContext.matnr;
                var oModel = this.getOwnerComponent().getModel("MATWITHCHARAC_cds");
                var oJModel = new sap.ui.model.json.JSONModel();
                var _globalModel = this.fnGetModel("BaseModel");
                var savedSelections = _globalModel.getProperty("/selections/" + selectedItem) || {};
            
                oModel.read("/ZMatWithCharac", {
                    urlParameters: {
                        "$expand": "tovalues"
                    },
                    filters: [
                        new sap.ui.model.Filter({
                            path: "Item",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: selectedItem
                        })
                    ],
                    success: function(res) {
                        oJModel.setData(res.results);
                        _globalModel.setProperty("/characValues", res.results);
                        this.getView().setModel(oJModel, "charModel");
            
                        var oLayout = this.byId("configBox");
                        oLayout.removeAllItems();
            
                        var mandatoryFieldExists = false;
            
                        oJModel.getData().forEach(function(characteristic, i) {
                            var labelText = characteristic.CharacteristicName;
            
                            if (characteristic.mandatory === "X") {
                                labelText += " *";
                                mandatoryFieldExists = true;
                            }
            
                            var element = new sap.m.Label({
                                text: labelText,
                            });
            
                            var newInput = new sap.m.Select({
                                enabled: !mandatoryFieldExists || characteristic.mandatory === "X",
                                forceSelection: false,
                                width: "120px",
                                change: this.onDropdownChange.bind(this),
                                customData: [
                                    new sap.ui.core.CustomData({
                                        key: "characteristicName",
                                        value: characteristic.CharacteristicName
                                    })
                                ]
                            });
            
                            var results = characteristic.tovalues.results;
            
                            results.forEach(function(result) {
                                newInput.addItem(new sap.ui.core.Item({
                                    key: result.Value,
                                    text: result.Value
                                }));
                            });
            
                            // Set the saved selection if it exists
                            if (savedSelections[characteristic.CharacteristicName]) {
                                newInput.setSelectedKey(savedSelections[characteristic.CharacteristicName]);
                            }
            
                            var vBox = new sap.m.VBox({
                                items: [element, newInput],
                                width: "200px",
                                alignItems: "Center" // Ensure it uses full width
                            });
            
                            oLayout.addItem(vBox);
                            vBox.addStyleClass("sapUiMediumMarginTop");
                            vBox.addStyleClass("sapUiMediumMarginBottom");
                        }.bind(this));
            
                        oBusy.close();
                    }.bind(this),
                    error: function(err) {
                        console.error("Error fetching characteristics:", err);
                        // sap.m.MessageToast.show("Failed to fetch characteristics data.");
                        oBusy.close();
                    }
                });
            },

            // onFetchFixedPrice: function(oBindingContext) {
            //     var oModel = this.getOwnerComponent().getModel("ZFIXEDPRICE_CDS");
            //     var _globalModel = this.fnGetModel("BaseModel");
            //     var selectedItem = oBindingContext.matnr;
            //     var oBusy = new sap.m.BusyDialog();

            //     oBusy.open();

            //     oModel.read("/ZFixedPrice", {
            //         filters: [
            //             new sap.ui.model.Filter({
            //                 path: "Matnr",
            //                 operator: sap.ui.model.FilterOperator.EQ,
            //                 value1: selectedItem
            //             })
            //         ],
            //         success: function(res) {
            //             oBusy.close();
            //             if (res.results && res.results.length > 0) {
            //                 var fixedItemPrice = parseFloat(res.results[0].fixedItemprice).toFixed(2);
            //                 _globalModel.setProperty("/FixedPrice", fixedItemPrice);
            //                 console.log("Fetched Fixed Price:", fixedItemPrice);
            //             } else {
            //                 _globalModel.setProperty("/FixedPrice", "0.00");
            //                 console.log("No Fixed Price data found for selected item, setting to 0.");
            //                 sap.m.MessageToast.show("No fixed price data found for the selected item. Setting price to 0.");
            //             }
            //         }.bind(this),
            //         error: function(err) {
            //             oBusy.close();
            //             _globalModel.setProperty("/FixedPrice", "0.00");
            //             console.error("Error fetching fixed price data:", err);
            //             sap.m.MessageToast.show("Failed to fetch fixed price data. Setting price to 0.");
            //         }
            //     });
            // },

            onFetchFixedPrice: function(oBindingContext) {
                var oModel = this.getOwnerComponent().getModel("FIXEDPRICE_CDS");
                var _globalModel = this.fnGetModel("BaseModel");
                var selectedItem = oBindingContext.matnr;
                var oBusy = new sap.m.BusyDialog();
            
                oBusy.open();
            
                oModel.read("/ZFixedPrice", {
                    filters: [
                        new sap.ui.model.Filter({
                            path: "Matnr",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: selectedItem
                        })
                    ],
                    success: function(res) {
                        oBusy.close();
                        if (res.results && res.results.length > 0) {
                            var fixedItemPrice = parseFloat(res.results[0].fixedItemprice).toFixed(2);
                            _globalModel.setProperty("/FixedPrice", fixedItemPrice);
                            // console.log("Fetched Fixed Price:", fixedItemPrice);
                        } else {
                            _globalModel.setProperty("/FixedPrice", "0.00");
                            // console.log("No Fixed Price data found for selected item, setting to 0.");
                            sap.m.MessageToast.show("No fixed price data found for the selected item. Setting price to 0.");
                        }
                    }.bind(this),
                    error: function(err) {
                        oBusy.close();
                        _globalModel.setProperty("/FixedPrice", "0.00");
                        console.error("Error fetching fixed price data:", err);
                        // sap.m.MessageToast.show("Failed to fetch fixed price data. Setting price to 0.");
                    }
                });
            },

            // onDropdownChange: function (oEvent) {
            //     var selectedKey = oEvent.getSource().getSelectedKey();
            //     var characteristicName = oEvent.getSource().getCustomData()[0].getValue(); 
            
            //     this._callServiceForDropdown(selectedKey)
            //     .then(function(price) {
            //         var oJModel = this.getView().getModel("BaseModel");
            //         var existingPrices = oJModel.getProperty("/AddOn") || {}; // Ensure AddOn is an object
            
            //         // Update or add the price for the characteristic
            //         existingPrices[characteristicName] = price;
            //         oJModel.setProperty("/AddOn", existingPrices);
            //         this.recalculateTotalPrice();
                    
            //         console.log("Price updated for " + characteristicName + ": " + price);
            //     }.bind(this))
            //     .catch(function(error) {
            //         console.error("Error fetching data for selection:", error);
            //         sap.m.MessageToast.show("Error fetching data for selection.");
            //     });
            // },

            onDropdownChange: function (oEvent) {
                var selectedKey = oEvent.getSource().getSelectedKey();
                var characteristicName = oEvent.getSource().getCustomData()[0].getValue();
                var oJModel = this.getView().getModel("BaseModel");
                var dialogReopened = oJModel.getProperty("/dialogReopened");
            
                if (dialogReopened) {
                    // Reset all other dropdown selections
                    var oLayout = this.byId("configBox");
                    var aItems = oLayout.getItems();
            
                    aItems.forEach(function(oVBox) {
                        var oDropdown = oVBox.getItems()[1];
                        var oLabel = oVBox.getItems()[0];
                        var currentCharacteristicName = oLabel.getText().replace(" *", "");
            
                        // Reset the dropdown only if it's not the one being changed
                        if (currentCharacteristicName !== characteristicName) {
                            oDropdown.setSelectedKey("");
                        }
                    });
            
                    // Clear the selections in your model as well
                    this._initialSelections = {}; // Clear initial selections
                    oJModel.setProperty("/dialogReopened", false); // Reset the flag
                }
            
                // Continue with your existing logic
                this._callServiceForDropdown(selectedKey)
                    .then(function(price) {
                        var existingPrices = oJModel.getProperty("/AddOn") || {}; 
                        existingPrices[characteristicName] = price;
                        oJModel.setProperty("/AddOn", existingPrices);
                        this.recalculateTotalPrice();
                    }.bind(this))
                    .catch(function(error) {
                        console.error("Error fetching data for selection:", error);
                        sap.m.MessageToast.show("Error fetching data for selection.");
                    });
            },


            recalculateTotalPrice: function() {
                var _globalModel = this.fnGetModel("BaseModel");
                var fixedPrice = parseFloat(_globalModel.getProperty("/FixedPrice")) || 0;
                var existingPrices = _globalModel.getProperty("/AddOn") || {}; // Ensure AddOn is an object
            
                // Calculate total add-on price
                var totalAddOnPrice = this.sumObjectValues(existingPrices);
                // var totalPrice = fixedPrice + totalAddOnPrice;
                var totalPrice = totalAddOnPrice;
            
                // Update model properties
                _globalModel.setProperty("/currentAddOnTotal", totalAddOnPrice);
                _globalModel.setProperty("/totalPrice", totalPrice);

                // var x = this.byId("baseVal").getText();
                // var y = this.byId("totalPriceText").getText();
                // this.byId("totalVal").setText(parseFloat(x) + parseFloat(y));
            
                var totalPriceControl = this.byId("totalPriceText");
                if (totalPriceControl) {
                    totalPriceControl.setText(totalPrice.toFixed(2));
                }
            },


            _callServiceForDropdown: function (selectedKey) {
                // var oJModel = new sap.ui.model.json.JSONModel();
                var oBusy = new sap.m.BusyDialog();
                oBusy.open();
                var oJModel = this.fnGetModel("BaseModel");
                
                var oModel = this.getOwnerComponent().getModel("ADDONPRICE_CDS");

                var matnr = oJModel.getProperty("/matNumber");


                return new Promise((resolve, reject) => {
                    oModel.read("/ZAddOnPrice", {
                        filters: [
                            new sap.ui.model.Filter({
                                path: "Matnr",
                                operator: sap.ui.model.FilterOperator.EQ,
                                value1: matnr
                            }),
                            new sap.ui.model.Filter({
                                path: "vctext",
                                operator: sap.ui.model.FilterOperator.EQ,
                                value1: selectedKey
                            }),
                            new sap.ui.model.Filter({
                                path: "ConditionCurrencyUnit",
                                operator: sap.ui.model.FilterOperator.EQ,
                                value1: "USD"
                            })
                        ],
                        success: function(res) {
                            var price = (res.results && res.results.length > 0) ? res.results[0].addOnItemPrice : null;
                            // this.updateTotalPrice(price);
                            resolve(price); // Return the price
                            oBusy.close();
                        }.bind(this),
                        error: function(err) {
                            console.error("Error fetching data:", err);
                            reject(err);
                            oBusy.close();
                        }
                    });
                });
            },

            // updateTotalPrice: function(price) {
            //     var _globalModel = this.fnGetModel("BaseModel");
            //     var fixedPrice = parseFloat(_globalModel.getProperty("/FixedPrice"));
            //     var currentAddOnTotal = _globalModel.getProperty("/currentAddOnTotal") || 0;
            //     var intPrice = parseFloat(price);

            //     currentAddOnTotal += intPrice;
            //     var totalPrice = fixedPrice + currentAddOnTotal;

            //     _globalModel.setProperty("/currentAddOnTotal", currentAddOnTotal);
            //     _globalModel.setProperty("/totalPrice", totalPrice);

            //     var totalPriceControl = this.byId("totalPriceText");
            //     if (totalPriceControl) {
            //         totalPriceControl.setText(totalPrice);
            //     }
            // },

            updateTotalPrice: function() {
                var _globalModel = this.fnGetModel("BaseModel");
                var fixedPrice = parseFloat(_globalModel.getProperty("/FixedPrice")) || 0;
                var currentAddOnTotal = this.sumObjectValues(_globalModel.getProperty("/AddOn")) || 0;
            
                // Calculate total price
                var totalPrice = fixedPrice + currentAddOnTotal;
            
                // Update the model
                _globalModel.setProperty("/totalPrice", totalPrice.toFixed(2));
            
                // Update the total price field in the dialog
                var totalPriceControl = this.byId("totalPriceText");
                if (totalPriceControl) {
                    totalPriceControl.setText(totalPrice.toFixed(2));
                }
            },

            resetTotalPrice: function() {
                var _globalModel = this.fnGetModel("BaseModel");
                var fixedPrice = parseFloat(_globalModel.getProperty("/FixedPrice")) || 0;
                
                // Initialize total price with base price
                _globalModel.setProperty("/totalPrice", fixedPrice.toFixed(2));
                _globalModel.setProperty("/AddOn", {}); // Clear add-on prices
            },

            // sumObjectValues: function(obj) {
            //     // Initialize the sum to zero
            //     let sum = 0;
            
            //     // Iterate over each property in the object
            //     for (let key in obj) {
            //         if (obj.hasOwnProperty(key)) {
            //             // Convert string value to float
            //             let value = parseFloat(obj[key]);
            
            //             // Check if the value is a number
            //             if (!isNaN(value)) {
            //                 // Add the value to the sum
            //                 sum += value;
            //             } else {
            //                 console.warn(`Value for ${key} is not a number: ${obj[key]}`);
            //             }
            //         }
            //     }
            
            //     return sum;
            // },

            sumObjectValues: function(obj) {
                // Initialize the sum to zero
                let sum = 0;
            
                // Iterate over each property in the object
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        // Convert string value to float
                        let value = parseFloat(obj[key]);
            
                        // Check if the value is a number and is not NaN
                        if (!isNaN(value)) {
                            // Add the value to the sum
                            sum += value;
                        } else {
                            // Log a warning if the value is not a valid number
                            console.warn(`Value for ${key} is not a number or is invalid: ${obj[key]}`);
                        }
                    }
                }
            
                // Return the computed sum
                return sum;
            },

            // onAddOnPrice:function() {
            //     var oJModel = this.fnGetModel("BaseModel");
            //     var addOn = oJModel.getProperty("/AddOn");
            //     var matnr = oJModel.getProperty("/matNumber");

            //     var selectedData = {};

            //     var matPriceArr = oJModel.getProperty("/matPriceArr");

            //     var total = this.sumObjectValues(addOn);
            //     var matPrice = { "id": matnr, "addOnPrice": total };
            //     // oJModel.setProperty("/matAddOn" + matnr, matPrice);

            //     const index = matPriceArr.findIndex(item => item.id === matPrice.id);

            //     if (index !== -1) {
            //         // Object with the same id found, replace it
            //         matPriceArr[index] = matPrice;
            //     } else {
            //         // Object with the same id not found, push the new object
            //         matPriceArr.push(matPrice);
            //     }


            //     // matPriceArr.push(matPrice);
            //     oJModel.setProperty("/matPriceArr", matPriceArr);
            //     oJModel.setProperty("/AddOn", {});

            //     oJModel.setProperty("/selections/" + matnr, selectedData);


            //     this.onDialogClose();
            // },

            // onAddOnPrice: function() {
            //     var oJModel = this.fnGetModel("BaseModel");
            //     var addOn = oJModel.getProperty("/AddOn");
            //     var matnr = oJModel.getProperty("/matNumber");
            
            //     var matPriceArr = oJModel.getProperty("/matPriceArr");
            
            //     var total = this.sumObjectValues(addOn);
            //     var matPrice = { "id": matnr, "addOnPrice": total };
            
            //     const index = matPriceArr.findIndex(item => item.id === matPrice.id);
            
            //     if (index !== -1) {
            //         // Object with the same id found, replace it
            //         matPriceArr[index] = matPrice;
            //     } else {
            //         // Object with the same id not found, push the new object
            //         matPriceArr.push(matPrice);
            //     }
            
            //     oJModel.setProperty("/matPriceArr", matPriceArr);
            //     oJModel.setProperty("/AddOn", {});
            
            //     // Save selected characteristics to the BaseModel
            //     var selectedData = {};
            
            //     var oLayout = this.byId("configBox");
            //     var aItems = oLayout.getItems();
            
            //     for (var i = 0; i < aItems.length; i += 2) {
            //         var oLabel = aItems[i];
            //         var oSelect = aItems[i + 1];
            //         var characteristicName = oLabel.getText().replace(" *", ""); // Remove asterisk if mandatory
            
            //         selectedData[characteristicName] = oSelect.getSelectedKey();
            //     }
            

            //     console.log("Selected Data:", selectedData);

            //     if (!oJModel.getProperty("/selections")) {
            //         oJModel.setProperty("/selections", {});
            //     }

            //     oJModel.setProperty("/selections/" + matnr, selectedData);
            //     console.log("Saved Data in BaseModel:", oJModel.getProperty("/selections/" + matnr));
            
            //     this.onDialogClose();
            // },

            // onAddOnPrice: function() {
            //     var oJModel = this.fnGetModel("BaseModel");
            //     var addOn = oJModel.getProperty("/AddOn");
            //     var matnr = oJModel.getProperty("/matNumber");
            
            //     var matPriceArr = oJModel.getProperty("/matPriceArr");
            
            //     var total = this.sumObjectValues(addOn);
            //     var matPrice = { "id": matnr, "addOnPrice": total };
            
            //     const index = matPriceArr.findIndex(item => item.id === matPrice.id);
            
            //     if (index !== -1) {
            //         // Object with the same id found, replace it
            //         matPriceArr[index] = matPrice;
            //     } else {
            //         // Object with the same id not found, push the new object
            //         matPriceArr.push(matPrice);
            //     }
            
            //     oJModel.setProperty("/matPriceArr", matPriceArr);
            //     oJModel.setProperty("/AddOn", {});
            
            //     // Save selected characteristics to the BaseModel
            //     var selectedData = {};
            
            //     var oLayout = this.byId("configBox");
            //     var aItems = oLayout.getItems();
            
            //     aItems.forEach(function(oItem) {
            //         if (oItem instanceof sap.m.VBox) {
            //             var aVBoxItems = oItem.getItems();
                        
            //             // Check if VBox has exactly two items: a label and a select
            //             if (aVBoxItems.length === 2) {
            //                 var oLabel = aVBoxItems[0];
            //                 var oSelect = aVBoxItems[1];
            
            //                 // Ensure that the items are of the correct type
            //                 if (oLabel instanceof sap.m.Label && oSelect instanceof sap.m.Select) {
            //                     var characteristicName = oLabel.getText().replace(" *", ""); // Remove asterisk if mandatory
            //                     selectedData[characteristicName] = oSelect.getSelectedKey();
            //                 } else {
            //                     console.warn("Expected Label and Select, but found:", oLabel.getMetadata().getName(), "and", oSelect.getMetadata().getName());
            //                 }
            //             } else {
            //                 console.warn("VBox does not contain exactly two items. Actual count:", aVBoxItems.length);
            //             }
            //         } else {
            //             console.warn("Item is not a VBox. Actual type:", oItem.getMetadata().getName());
            //         }
            //     });
            
            //     console.log("Selected Data:", selectedData);
            
            //     if (!oJModel.getProperty("/selections")) {
            //         oJModel.setProperty("/selections", {});
            //     }
            
            //     oJModel.setProperty("/selections/" + matnr, selectedData);
            //     console.log("Saved Data in BaseModel:", oJModel.getProperty("/selections/" + matnr));
            
            //     this.onDialogClose();
            // },        
            
            onAddOnPrice: function() {
                var oJModel = this.fnGetModel("BaseModel");
                var addOn = oJModel.getProperty("/AddOn");
                var matnr = oJModel.getProperty("/matNumber");
            
                var matPriceArr = oJModel.getProperty("/matPriceArr");
            
                // Calculate total add-on price
                var total = this.sumObjectValues(addOn);
                var matPrice = { "id": matnr, "addOnPrice": total };
            
                const index = matPriceArr.findIndex(item => item.id === matPrice.id);
            
                if (index !== -1) {
                    // Object with the same id found, replace it
                    matPriceArr[index] = matPrice;
                } else {
                    // Object with the same id not found, push the new object
                    matPriceArr.push(matPrice);
                }
            
                // Update model properties
                oJModel.setProperty("/matPriceArr", matPriceArr);
                oJModel.setProperty("/AddOn", {});
            
                // Save selected characteristics to the BaseModel
                var selectedData = {};
            
                var oLayout = this.byId("configBox");
                var aItems = oLayout.getItems();
            
                aItems.forEach(function(oItem) {
                    if (oItem instanceof sap.m.VBox) {
                        var aVBoxItems = oItem.getItems();
                        
                        // Check if VBox has exactly two items: a label and a select
                        if (aVBoxItems.length === 2) {
                            var oLabel = aVBoxItems[0];
                            var oSelect = aVBoxItems[1];
            
                            // Ensure that the items are of the correct type
                            if (oLabel instanceof sap.m.Label && oSelect instanceof sap.m.Select) {
                                var characteristicName = oLabel.getText().replace(" *", ""); // Remove asterisk if mandatory
                                selectedData[characteristicName] = oSelect.getSelectedKey();
                            } else {
                                console.warn("Expected Label and Select, but found:", oLabel.getMetadata().getName(), "and", oSelect.getMetadata().getName());
                            }
                        } else {
                            console.warn("VBox does not contain exactly two items. Actual count:", aVBoxItems.length);
                        }
                    } else {
                        console.warn("Item is not a VBox. Actual type:", oItem.getMetadata().getName());
                    }
                });
            
                // console.log("Selected Data:", selectedData);
            
                // Update selections model
                var selections = oJModel.getProperty("/selections") || {};
                selections[matnr] = selectedData;
                oJModel.setProperty("/selections", selections);
            
                // console.log("Saved Data in BaseModel:", selections);
                
                this.onDialogClose();
            },

            

            // onDialogClose: function () {
            //     // Clear the dynamic content of the dialog when it is closed
            //     this.byId("configBox").removeAllItems();
            //     this.byId("configDialog").close();
            // },

            onDialogClose: function () {
                var oJModel = this.fnGetModel("BaseModel");
                var matnr = oJModel.getProperty("/matNumber");
            
                // Save the total value to the model before closing the dialog
                var totalValue = oJModel.getProperty("/totalPrice") || 0;
                var matPriceArr = oJModel.getProperty("/matPriceArr") || [];
            
                const index = matPriceArr.findIndex(item => item.id === matnr);
            
                // if (index !== -1) {
                //     // matPriceArr[index].addOnPrice = totalValue;
                //     matPriceArr[index].totalPrice = totalValue;
                // } else {
                //     matPriceArr.push({ id: matnr, addOnPrice: totalValue,});
                // }
            
                // oJModel.setProperty("/matPriceArr", matPriceArr);
            
                // Clear dynamic content
                this.byId("configBox").removeAllItems();
                this.byId("configDialog").close();
            },

            createPriceString: function(matnr, matAddOnPrice) {
                // Create a map from Array 2 for quick lookup by id
                const priceMap = new Map(matAddOnPrice.map(item => [item.id, item.addOnPrice]));
            
                // Initialize an array to hold the string parts
                const resultParts = [];
            
                // Iterate through Array 1 and build the string
                matnr.forEach(item => {
                    // Get the price for the current matnr from the map or use 0 if not found
                    const price = priceMap.get(item.matnr) || 0;
                    
                    // Format the string part for the current matnr
                    const part = `${item.matnr}:${parseFloat(price).toFixed(2)}:${parseInt(item.QUANT_VALUE)}`;
            
                    // Add the part to the result array
                    resultParts.push(part);
                });
            
                // Join all parts with commas to form the final string
                return resultParts.join(',');
            },

            onPressReview: function(oEvent) {
                this.byId("actualDisc").setValue("");
                this.byId("salesPrice").setText("");
                this.byId("predProfit").setText("");
                this.byId("monthlyActualDisc").setValue("");
                this.byId("monthlySalesPrice").setText("");
                var oBusy = new sap.m.BusyDialog();
                oBusy.open();
                var oModel = this.getOwnerComponent().getModel("calculate");
                var oJModel = this.fnGetModel("BaseModel");
                var url = this.getOwnerComponent().getModel("calculate").sServiceUrl;

                var term = this.byId("offeringTerm").getValue();
                var yearlyProfit = this.byId("yearlyProfit").getValue();
                var orgProfit = this.byId("orgProfit").getValue();
                var hwDepreciation = this.byId("hwDepr").getValue();
                var yearInflation = this.byId("yrInflate").getValue();

                var rbGrp = this.byId("rbg3").getSelectedIndex();
                var usageBill = 0;

                if(rbGrp === 0) {
                    var usageIndex = this.byId("rbg4").getSelectedIndex();
                    if(usageIndex === -1) {
                        usageBill = 0;
                    } else if (usageIndex === 0) {
                        usageBill = 5;
                    } else if (usageIndex === 1) {
                        usageBill = 10;
                    } else {
                        usageBill = 15;
                    }
                }

                var salesOrg = oJModel.getProperty("/salesCode");
                var customer = oJModel.getProperty("/custCode");
                var plant = oJModel.getProperty("/plant");
                var distChannel = oJModel.getProperty("/distChannel");
                var matnr = oJModel.getProperty("/OfferTable");
                var matAddOnPrice = oJModel.getProperty("/matPriceArr");
                // var material = matnr.map(item => `${item.matnr}:12.22`).join(','); 
                var material = this.createPriceString(matnr, matAddOnPrice);

                var url1 = "calculate(customer='" + customer + "'" + ",plant='" + plant + "'" + ",salesorg='" + salesOrg + "'" + ",dischannel='" + distChannel + "'" + ",term=" + term  + ",minyearlyprofit=" + yearlyProfit + ",oprofit=" + orgProfit + ",inflation=" + yearInflation + ",depreciation=" + hwDepreciation + ",usage=" + usageBill + ",matnr='" + material + "')";
                
                jQuery.ajax({
                    method: "GET",
                    // url: url + "/calculate(customer=%272200000%27,plant=%274111%27,salesorg=%274100%27,dischannel=%2701%27,term=3,minyearlyprofit=50,oprofit=50,matnr=%27HW_003:100,SW_003:200%27)",
                    url: url + url1,
                    contentType: "application/json",
                    success: function(res) {
                        // console.log(res);
                        oJModel.setProperty("/profitCalculations", res.value);
                        oBusy.close();
                        this.setReviewData();
                        this.onGenAIDisc();
                    }.bind(this),
                    error: function(err) {
                        console.log(err);
                        oBusy.close();
                    }
                });
                
            },

            setReviewData: function() {
                var oJModel = this.fnGetModel("BaseModel");
                var unitOfPurchase = this.byId("unitOfPurchase").getValue();

                // this.byId("offeringPrice").setValue(oJModel.getData().profitCalculations[0].netOfferingPrice.toFixed(2));
                this.byId("offeringPrice").setText((oJModel.getData().profitCalculations[0].netOfferingPrice.toFixed(2))*unitOfPurchase);
                // this.byId("targetPrice").setValue(oJModel.getData().profitCalculations[0].targetOfferingPrice.toFixed(2));
                this.byId("targetPrice").setText((oJModel.getData().profitCalculations[0].targetOfferingPrice.toFixed(2))*unitOfPurchase);
                this.byId("maxDiscount").setText(oJModel.getData().profitCalculations[0].maximumPermissibleDiscount.toFixed(2));
                // debugger
                if ((oJModel.getData().profitCalculations[0].maximumPermissibleDiscount) < 0) {
                    this.byId("errorMsg").setVisible(true);
                } else {
                    this.byId("errorMsg").setVisible(false);
                }
                // this.byId("monthlyOfferingPrice").setValue((oJModel.getData().profitCalculations[0].netOfferingPrice.toFixed(2))/12);
                var x  = oJModel.getData().profitCalculations[0].netOfferingPrice;
                var y = (x/12).toFixed(2);
                this.byId("monthlyOfferingPrice").setText(y*unitOfPurchase);   

                // this.byId("monthlyOfferingPrice").setText(((oJModel.getData().profitCalculations[0].netOfferingPrice.toFixed(2))/12)*unitOfPurchase);    
                // this.byId("monthlyTargetPrice").setValue(((oJModel.getData().profitCalculations[0].targetOfferingPrice)/12).toFixed(2));
                this.byId("monthlyTargetPrice").setText((((oJModel.getData().profitCalculations[0].targetOfferingPrice)/12).toFixed(2))*unitOfPurchase)
                this.byId("monthlyMaxDiscount").setText(oJModel.getData().profitCalculations[0].maximumPermissibleDiscount.toFixed(2));
            },

            onActDiscCalc: function(oEvent) {
                // debugger
                var that = this;
                var oJModel = this.fnGetModel("BaseModel");
                var termCost = oJModel.getData().profitCalculations[0].totalTermCost;
                var actDiscount = this.byId("actualDisc").getValue();
                var netPrice = this.byId("offeringPrice").getText();
                var term = this.byId("offeringTerm").getValue();

                var unitOfPurchase = this.byId("unitOfPurchase").getValue();

                var salesPrice = (netPrice*(100-actDiscount))/100;
                // var predProfit = ((salesPrice*term) - termCost)/termCost*100;
                var predProfit = ((salesPrice*term) - (termCost*unitOfPurchase))/(termCost*unitOfPurchase)*100;
                this.byId("salesPrice").setText(salesPrice.toFixed(2));
                this.byId("predProfit").setText(predProfit.toFixed(2));

                // this.byId("monthlySalesPrice").setText(salesPrice.toFixed(2)/12);

                // this.byId("monthlySalesPrice").setText(salesPrice/12).toFixed(2);
                var x = salesPrice/12;
                this.byId("monthlySalesPrice").setText(x.toFixed(2));

                // var discount = this.byId("actualDisc").getValue();
                // var CustomerCode = this.fnGetModel("BaseModel").getData().custCode;
            },

            // onActDiscCalc: function (oEvent) {
            
            //     const oJModel = this.fnGetModel("BaseModel");
            //     const termCost = oJModel.getData().profitCalculations[0].totalTermCost;
            
            //     const actDiscount = parseFloat(this.byId("maxDiscount").getValue());
            //     const netPrice = parseFloat(this.byId("offeringPrice").getValue());
            //     const term = parseFloat(this.byId("offeringTerm").getValue());
            //     const unitOfPurchase = parseFloat(this.byId("unitOfPurchase").getValue());
            
            //     const salesPrice = (netPrice * (100 - actDiscount)) / 100;
            //     const predProfit = ((salesPrice * term) - (termCost * unitOfPurchase)) / (termCost * unitOfPurchase) * 100;
            
            //     this.byId("salesPrice").setValue(salesPrice.toFixed(2));
            //     this.byId("predProfit").setValue(predProfit.toFixed(2));
            //     this.byId("monthlySalesPrice").setValue((salesPrice / 12).toFixed(2));
            // },            

            onGenAIDisc: function() {
                // debugger
                const oJModel = this.fnGetModel("BaseModel");
                const actDiscount = parseFloat(this.byId("maxDiscount").getText());
                // Always show the message strip with existing GenAI recommendation if already available
                const existingGenAiText = oJModel.getProperty("/GenAiDiscountText");
                const oMsgStrip = this.byId("ms1");
            
                // if (existingGenAiText) {
                    // oMsgStrip.setVisible(true);
                    // oMsgStrip.setText("Recommended Discount: " + existingGenAiText);
                // }
            
                // GenAI service call - only once
                // if (!this._bGenAIDiscountCalled) {
                    const discount = actDiscount;
                    const customerCode = oJModel.getData().custCode;
            
                    const oBusy = new sap.m.BusyDialog();
                    oBusy.open();
            
                    fetch("https://presales-be-app.cfapps.eu10-004.hana.ondemand.com/get_discount", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            "user_query": parseInt(customerCode),
                            "discount": parseInt(discount)
                        }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            // console.error(`HTTP error! status: ${response.status}`);
                            return;
                        }
                        return response.json();
                    })
                    .then(data => {
                        var result = Object.values(data.response);
                        var formattedMsg = "Recommended Discount: " + result[1] + "\n\n" + "Analysis: " + result[0];    
                        if (data && data.response) {
                            oJModel.setProperty("/GenAiDiscountText", formattedMsg);
                            // oJModel.refresh();
                            // oMsgStrip.setVisible(true);
                            // oMsgStrip.setText(formattedMsg);
                        }
                    })
                    .catch(error => {
                        console.error("Fetch error:", error);
                    })
                    .finally(() => {
                        oBusy.close();
                    });
            
                    // this._bGenAIDiscountCalled = true;
                // }
            },
            

            onSetDiscount: function(oEvent) {
                var sValue = oEvent.getParameter("value");

                // Determine the source input field
                var oSourceInput = oEvent.getSource();
                var sSourceInputId = oSourceInput.getId();
    
                // Get the other input control based on the source
                var oOtherInput = (sSourceInputId === this.byId("actualDisc").getId()) 
                    ? this.byId("monthlyActualDisc") 
                    : this.byId("actualDisc");
    
                // Update the other input control if the value is different
                if (oOtherInput.getValue() !== sValue) {
                    oOtherInput.setValue(sValue);
                }
            }

            // onValueHelpRequest2: function (oEvent) {
            //     var sInputValue = oEvent.getSource().getValue(),
            //         oView = this.getView();

            //     var oBusy = new sap.m.BusyDialog();
    
            //     if (!this._pValueHelpDialog) {
            //         this._pValueHelpDialog = Fragment.load({
            //             id: oView.getId(),
            //             name: "subscriptionpricedetermination.view.fragments.useCase2.SalesOrganization",
            //             controller: this
            //         }).then(function (oDialog) {
            //             oView.addDependent(oDialog);
            //             return oDialog;
            //         });
            //     }
            //     this._pValueHelpDialog.then(function(oDialog) {
            //         // Create a filter for the binding
            //         // oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
            //         // Open ValueHelpDialog filtered by the input's value
            //         oDialog.open(sInputValue);
            //     });
            // },

            // onValueHelpClose2: function (oEvent) {
            //     var oSelectedItem = oEvent.getParameter("selectedItem");
            //     oEvent.getSource().getBinding("items").filter([]);
    
            //     if (!oSelectedItem) {
            //         return;
            //     }
            //     // debugger
    
            //     this.byId("salesOrg1").setValue(oSelectedItem.getTitle());

            //     var salesCode = oSelectedItem.getDescription();

            //     // debugger

            //     this.fnGetModel("BaseModel").setProperty("/salesCode", salesCode);

            //     this.getDistributionChannel(salesCode);

            //     this.byId("distributionChannel").setEnabled(true);
            // },
        });
    });
