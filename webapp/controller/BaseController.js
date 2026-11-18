sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel"
    ],
    function(Controller, JSONModel) {
      "use strict";
  
      return Controller.extend("subscriptionpricedetermination.controller.BaseController", {
        onInitBaseController: function() {
            var oLocalModel = new JSONModel();

            this.fnSetModel(oLocalModel, "BaseModel");
        },

        fnSetModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        fnGetModel: function(sName) {
            return this.getView().getModel(sName);
        }
      });
    }
  );
  