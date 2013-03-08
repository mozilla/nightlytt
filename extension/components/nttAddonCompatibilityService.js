/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const PREF_FORCE_COMPAT         = "nightly.disableCheckCompatibility";
const PREF_CHECK_COMPAT_PREFIX  = "extensions.checkCompatibility.";
const PREF_CHECK_COMPAT_NIGHTLY = "extensions.checkCompatibility.nightly";


function nttAddonCompatibilityService() {
  this.prefService = Cc['@mozilla.org/preferences-service;1']
                     .getService(Ci.nsIPrefBranch2);
                 
  this.prefService.addObserver(PREF_FORCE_COMPAT, this, false);

  this.appinfo = Cc["@mozilla.org/xre/app-info;1"]
                 .getService(Ci.nsIXULAppInfo);

  this.obs = Cc["@mozilla.org/observer-service;1"]
             .getService(Ci.nsIObserverService);

  if(this.prefService.getBoolPref(PREF_FORCE_COMPAT)) {
    this.setCompatPrefs();
  }
}

nttAddonCompatibilityService.prototype = {
  classDescription: "Nightly Tester Tools Addon Compatibility",
  classID: Components.ID("{126c18c5-386c-4c13-b59f-dc909e78aea0}"),
  contractID: "@mozilla.com/nightly/addoncompatibility;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  // nsIObserver
  observe : function(subject, topic, data) {
    if (topic == "nsPref:changed") {
      switch(data) {
        case PREF_FORCE_COMPAT:
          this.setCompatPrefsHelper();
          break;
        default:
          break;
      }
    }
  },


  get version() {
    return this.appinfo.version.replace(/^([^\.]+\.[0-9]+[a-z]*).*/i, "$1");
  },

  setCompatPrefsHelper : function() {
    try{
      Cu.import("resource://gre/modules/AddonManager.jsm");
      let self = this;
      function countPendingAddonsAndNotifyToRestartCallback(aAddons) {
        function count() {
          return aAddons.reduce(function (aAccumulator, aAddon) {
              return aAccumulator + (
                (aAddon.pendingOperations & AddonManager.PENDING_ENABLE) != 0 ||
                (aAddon.pendingOperations & AddonManager.PENDING_DISABLE) != 0 
              );
            }, 0);
        }

        let startCount = count();
        self.setCompatPrefs();
        if (startCount != count()) {
          self.obs.notifyObservers(null, "nttACS", "restartNeeded");
        } else {
          self.obs.notifyObservers(null, "nttACS", null);
        }
      }
      AddonManager.getAddonsByTypes(null, countPendingAddonsAndNotifyToRestartCallback);
    } catch(e) {
      // old extension manager API
      this.setCompatPrefs();
      this.obs.notifyObservers(null, "nttACS", "restartNeeded");
    }
  },


  setCompatPrefs : function() {
    var prefs = [];
    
    switch(this.appinfo.name) {
      case "Songbird":
        break;
      default:
        prefs.push(PREF_CHECK_COMPAT_NIGHTLY);
        break;
    }
    prefs.push(PREF_CHECK_COMPAT_PREFIX + this.version);

    var enable = !this.prefService.getBoolPref(PREF_FORCE_COMPAT);
    for(var i = 0; i < prefs.length; i++)
      this.prefService.setBoolPref(prefs[i], enable);
  }
};

var components = [nttAddonCompatibilityService];

if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule(components);
