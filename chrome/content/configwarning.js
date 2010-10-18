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

const Cc = Components.classes;
const Ci = Components.interfaces;

var gOS = null;

var observer = {
  observe: function(subject, topic, data) {
    window.focus();
  }
}

function init() {
  var bundle = document.getElementById("bundle");
  setLabelForButton(document.documentElement.getButton("accept"), bundle.getString("Yes"));
  setLabelForButton(document.documentElement.getButton("cancel"), bundle.getString("No"));

  gOS = Cc["@mozilla.org/observer-service;1"].
        getService(Ci.nsIObserverService);
  gOS.addObserver(observer, "xul-window-visible", false);
}

function unload() {
  gOS.removeObserver(observer, "xul-window-visible");
  gOS = null;
}

function setLabelForButton(button, label)
{
  var accessKey = null;
  if (/ *\(\&([^&])\)(:)?$/.test(label)) {
    label = RegExp.leftContext + RegExp.$2;
    accessKey = RegExp.$1;
  } else if (/^(.*[^&])?\&(([^&]).*$)/.test(label)) {
    label = RegExp.$1 + RegExp.$2;
    accessKey = RegExp.$3;
  }
  // && is the magic sequence to embed an & in your label.
  label = label.replace(/\&\&/g, "&");
  button.label = label;
  if (accessKey)
    button.accessKey = accessKey;
}

function accept() {
  var cs = Cc["@oxymoronical.com/nightly/addoncompatibility;1"].
           createInstance(Ci.nttIAddonCompatibilityService);
  var em = Cc["@mozilla.org/extensions/manager;1"].
           getService(Ci.nsIExtensionManager);
  var items = em.getItemList(Ci.nsIUpdateItem.TYPE_ADDON, {});
  for (var i = 0; i < items.length; i++) {
    var addon = cs.getAddonForID(items[i].id);
    if (!addon.isValid())
      continue;
    if (!addon.needsOverride(false) && addon.needsOverride(true))
      addon.overrideCompatibility(true);
  }

  var prefs = Cc["@mozilla.org/preferences-service;1"].
              getService(Ci.nsIPrefBranch);
  if (prefs.prefHasUserValue("extensions.checkCompatibility"))
    prefs.clearUserPref("extensions.checkCompatibility");
  if (prefs.prefHasUserValue("extensions.checkUpdateSecurity"))
    prefs.clearUserPref("extensions.checkUpdateSecurity");
}
