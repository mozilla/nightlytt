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
 *     Dave Townsend <dtownsend@oxymoronical.com>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
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

var extensionAppEnabler = {

prefs: null,
cs: null,

init: function() {
  var pos = gAddonContextMenus.indexOf("menuitem_enable");
  gAddonContextMenus.splice(pos, 0, "menuitem_appenable");
  this.cs = Components.classes["@oxymoronical.com/nightly/addoncompatibility;1"]
                      .createInstance(Components.interfaces.nttIAddonCompatibilityService);
},

initView: function() {
  var enableb = document.getElementById("enableallButton");
  
  if (!this.prefs.getBoolPref("showEnableAll")) {
    enableb.hidden = true;
    return;
  }

  var parent = document.getElementById("viewGroup");
  var node = parent.firstChild;
  while (node != null) {
    if (node.selected) {
      switch (node.id) {
        case "extensions-view":
        case "themes-view":
        case "locales-view":
          enableb.hidden = false;
          break;
        default:
          enableb.hidden = true;
      }
      return;
    }
    node = node.nextSibling;
  }

  enableb.hidden = true;
},

load: function() {
  var prefservice = Components.classes['@mozilla.org/preferences-service;1']
                              .getService(Components.interfaces.nsIPrefService);
  this.prefs = prefservice.getBranch("nightly.")
                          .QueryInterface(Components.interfaces.nsIPrefBranchInternal);

  var context = document.getElementById("addonContextMenu");
  context.addEventListener("popupshowing", function() { extensionAppEnabler.popupShowing(); }, false);
  
  var radios = document.getElementById("viewGroup");
  radios.addEventListener("select", function() { extensionAppEnabler.initView(); }, false);
  this.initView();
},

popupShowing: function() {
  var item = gExtensionsView.selectedItem;
  var menu = document.getElementById("menuitem_appenable");
  var menuclone = document.getElementById("menuitem_appenable_clone");
  var addon = this.cs.getAddonForID(item.getAttribute("addonID"));
  menu.hidden = !(addon.isValid() && addon.needsOverride(false));
  if (menuclone)
    menuclone.hidden = menu.hidden;    
},

appEnable: function() {
  var ev = gExtensionsView;
  var item = ev.selectedItem;
  this.cs.confirmOverride([this.cs.getAddonForID(item.getAttribute("addonID"))], 1);
  this.syncCompatibility();
},

enableAll: function() {
  var addons = [];
  var items = gExtensionsView.children;
  for (var i = 0; i < items.length; i++) {
    var addon = this.cs.getAddonForID(items[i].getAttribute("addonID"));
    if (addon.isValid() && addon.needsOverride(false))
      addons.push(addon);
  }
  if (addons.length > 0) {
    this.cs.confirmOverride(addons, addons.length);
    this.syncCompatibility();
  }
},

syncCompatibility: function() {
  var prefService = Components.classes['@mozilla.org/preferences-service;1']
                              .getService(Components.interfaces.nsIPrefBranch);
  try {
    var checkCompatibility = prefService.getBoolPref("extensions.checkCompatibility");
    prefService.setBoolPref("extensions.checkCompatibility", !checkCompatibility);
    prefService.setBoolPref("extensions.checkCompatibility", checkCompatibility);
 	}
 	catch (e) {
    prefService.setBoolPref("extensions.checkCompatibility", false);
    prefService.setBoolPref("extensions.checkCompatibility", true);
  }
  updateOptionalViews();
  updateGlobalCommands();
}
}

extensionAppEnabler.init();

window.addEventListener("load", function() { extensionAppEnabler.load(); }, false);
