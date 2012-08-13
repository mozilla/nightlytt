/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Nightly Tester Tools.
 *
 * The Initial Developer of the Original Code is
 *     Heather Arthur <fayearthur@gmail.com>
 *
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

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
