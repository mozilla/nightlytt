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

  this.version = this.appinfo.version.replace(/^([^\.]+\.[0-9]+[a-z]*).*/i, "$1");

  if (this.prefService.getBoolPref(PREF_FORCE_COMPAT)) {
    this.setCompatPrefs();
  }

  this.wrappedJSObject = this;
}

nttAddonCompatibilityService.prototype = {
  classDescription: "Nightly Tester Tools Addon Compatibility",
  classID: Components.ID("{126c18c5-386c-4c13-b59f-dc909e78aea0}"),
  contractID: "@mozilla.com/nightly/addoncompatibility;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  // nsIObserver
  observe : function (subject, topic, data) {
    if (topic == "nsPref:changed") {
      switch (data) {
        case PREF_FORCE_COMPAT:
          this.setCompatPrefsHelper();
          break;
        default:
          break;
      }
    }
  },

  setCompatPrefsHelper : function () {
    let self = this;
    let notifyObject = { restart: true };
    function sendNotification(options) {
      let { count } = options;
      let startCount = count();
      self.setCompatPrefs();
      notifyObject.restart = startCount !== count();
      self.obs.notifyObservers(null, "_nttACS", JSON.stringify(notifyObject));
    }
    try {
      Cu.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.getAddonsByTypes(null, function (aAddons) {
        function count() {
          return aAddons.filter(function isPendingAddon(aAddon) {
            return (aAddon.pendingOperations & AddonManager.PENDING_ENABLE) != 0 ||
                   (aAddon.pendingOperations & AddonManager.PENDING_DISABLE) != 0
            ;
          }).length;
        }
        sendNotification({count: count});
      });
    } catch (e) {
      // old extension manager API
      let counter = 0;
      function count() {
        // Feel free to write the real count() for the old EM API,
        // but now it's always returning a different number
        return counter++;
      }
      sendNotification({count: count});
    }
  },

  setCompatPrefs : function () {
    var prefs = [];

    switch (this.appinfo.name) {
      case "Songbird":
        /**
         * Excluding Songbird because it is based on Gecko 1.9.2
         * and "extensions.checkCompatibility.nightly" preference
         * introduced in Gecko 7.
         *
         * @see http://kb.mozillazine.org/Extensions.checkCompatibility
         * @see http://www.oxymoronical.com/blog/2011/05/How-to-disable-extension-compatibility-checking-on-Nightly-builds-of-Firefox
         */
        break;
      default:
        prefs.push(PREF_CHECK_COMPAT_NIGHTLY);
        break;
    }
    prefs.push(PREF_CHECK_COMPAT_PREFIX + this.version);

    var enable = !this.prefService.getBoolPref(PREF_FORCE_COMPAT);
    for (var i = 0; i < prefs.length; i++) {
      this.prefService.setBoolPref(prefs[i], enable);
    }
  },

  restart : function () {
    let canceled = Cc["@mozilla.org/supports-PRBool;1"]
                   .createInstance(Ci.nsISupportsPRBool);
    this.obs.notifyObservers(canceled, "quit-application-requested", "restart");

    if (canceled.data) {
      return false; // somebody canceled our quit request
    }

    // restart
    Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup)
        .quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);

    return true;
  },
};

var components = [nttAddonCompatibilityService];

if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule(components);
