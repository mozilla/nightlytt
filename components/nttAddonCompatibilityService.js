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
 * Erik Vold <erikvvold@gmail.com>
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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

function nttAddonCompatibilityService() {
  Services.prefs.addObserver("", this, false);

  if(Services.prefs.getBoolPref("nightly.disableCheckCompatibility"))
    this.setCompatPrefs();
}

nttAddonCompatibilityService.prototype = {
  classDescription: "Nightly Tester Tools Addon Compatibility",
  classID: Components.ID("{126c18c5-386c-4c13-b59f-dc909e78aea0}"),
  contractID: "@mozilla.com/nightly/addoncompatibility;1",
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver]),

  // nsIObserver
  observe : function(subject, topic, data) {
    if (topic == "nsPref:changed") {
      switch(data) {
        case "nightly.disableCheckCompatibility":
          this.setCompatPrefs();
          break;
        default:
          break;
      }
    }
  },

  setCompatPrefs : function() {
    var prefs = ["extensions.checkCompatibility",
                 "extensions.checkCompatibility.3.6b",
                 "extensions.checkCompatibility.3.6",
                 "extensions.checkCompatibility.3.6p",
                 "extensions.checkCompatibility.3.6pre",
                 "extensions.checkCompatibility.3.7a",
                 "extensions.checkCompatibility.4.0b",
                 "extensions.checkCompatibility.4.0pre",
                 "extensions.checkCompatibility.4.0p",
                 "extensions.checkCompatibility.4.2a",
                 "extensions.checkCompatibility.4.2a1",
                 "extensions.checkCompatibility.4.2a1pre",
                 "extensions.checkCompatibility.4.2",
                 "extensions.checkCompatibility.4.2b",
                 "extensions.checkCompatibility.5.0",
                 "extensions.checkCompatibility.5.0a",
                 "extensions.checkCompatibility.5.0b",
                 "extensions.checkCompatibility.6.0",
                 "extensions.checkCompatibility.6.0a",
                 "extensions.checkCompatibility.6.0b",
                 "extensions.checkCompatibility.7.0",
                 "extensions.checkCompatibility.7.0a",
                 "extensions.checkCompatibility.7.0b",
                 "extensions.checkCompatibility.nightly"];

    var appInfo = Services.appinfo;
    if (appInfo.name == "Thunderbird") {
      prefs = ["extensions.checkCompatibility",
               "extensions.checkCompatibility.3.0",
               "extensions.checkCompatibility.3.1p",
               "extensions.checkCompatibility.3.1pre",
               "extensions.checkCompatibility.3.1a",
               "extensions.checkCompatibility.3.1b",
               "extensions.checkCompatibility.3.1",
               "extensions.checkCompatibility.3.2a",
               "extensions.checkCompatibility.3.3a",
               "extensions.checkCompatibility.7.0a",
               "extensions.checkCompatibility.7.0b",
               "extensions.checkCompatibility.nightly"];
    }
    else if (appInfo.name == "SeaMonkey") {
     prefs = ["extensions.checkCompatibility",
              "extensions.checkCompatibility.2.0",
              "extensions.checkCompatibility.2.1p",
              "extensions.checkCompatibility.2.1pre",
              "extensions.checkCompatibility.2.1a",
              "extensions.checkCompatibility.2.1b",
              "extensions.checkCompatibility.2.1",
              "extensions.checkCompatibility.2.2a",
              "extensions.checkCompatibility.2.2b",
              "extensions.checkCompatibility.2.4a",
              "extensions.checkCompatibility.2.4b",
              "extensions.checkCompatibility.nightly"];
    }
    else if (appInfo.name == "Songbird") {
     prefs = ["extensions.checkCompatibility",
              "extensions.checkCompatibility.1.8",
              "extensions.checkCompatibility.1.9",
              "extensions.checkCompatibility.1.10"];
    }

    var enable = !Services.prefs.getBoolPref("nightly.disableCheckCompatibility");
    for(var i = 0; i < prefs.length; i++)
      Services.prefs.setBoolPref(prefs[i], enable);
  }
};

var components = [nttAddonCompatibilityService];

if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule(components);
