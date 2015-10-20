/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {

_oldUpdateTitlebar: null,
debugQATitleModifierWorkaround: null,

get oldUpdateTitlebar() {
  if (!nightlyApp._oldUpdateTitlebar) {
    var { WARN, LOG, ERROR } = Components.utils.import("resource://nightly/Logging.jsm", {});
    WARN("No suitable title bar function was found! Title bar customization is incomplete! Please file a bug!");
  }
  return nightlyApp._oldUpdateTitlebar;
},

set oldUpdateTitlebar(aParam) {
  nightlyApp._oldUpdateTitlebar = aParam;
},

get defaultTitle() {
  if (nightlyApp.oldUpdateTitlebar) {
    return nightlyApp.getWindowTitleForNavigator.call(gBrowser);
  }
},

get tabsCount() {
  return gBrowser.browsers.length;
},
get tabTitle() {
  if (nightlyApp.oldUpdateTitlebar) {
    return gBrowser.contentTitle;
  }
},

init: function()
{
  var brandbundle = document.getElementById("bundle_brand");
  if (nightly.variables.name==null)
  {
    nightly.variables.name=brandbundle.getString("brandShortName");
  }
  nightly.variables.brandname=brandbundle.getString("brandFullName");

  if ("gBrowser" in window && typeof(gBrowser.updateTitlebar) === "function") {
    nightlyApp.oldUpdateTitlebar = gBrowser.updateTitlebar;

    gBrowser.updateTitlebar = nightly.updateTitlebar;
    gBrowser.addEventListener("DOMTitleChanged", nightly.updateTitlebar, false);

    var debugQABundle = document.getElementById("debugQANavigatorBundle");
    if (debugQABundle) {
      var debugQAModifier = debugQABundle.getFormattedString("titlemodifier",
                                                  [nightly.variables.name,
                                                  nightly.variables.appbuildid]);

      var docModifier = document.documentElement.getAttribute("titlemodifier");
      if (docModifier === debugQAModifier) {
        nightlyApp.debugQATitleModifierWorkaround = nightly.variables.name;
      }
    }
  }
},

openURL: function(url, event)
{
  openTopWin(url);
},

setCustomTitle: function(title)
{
  if (nightlyApp.oldUpdateTitlebar) {
    gBrowser.ownerDocument.title = title;
  }
},

setStandardTitle: function()
{
  if (nightlyApp.oldUpdateTitlebar) {
    nightlyApp.oldUpdateTitlebar.call(gBrowser);
  }
},

/**
 * This is mostly a copy of tabbrowser's updateTitlebar():
 * - calculates the title (like updateTitlebar())
 * - returns the value (in opposite to updateTitlebar() which sets it to window directly)
 * - is enhanced to work seamlessly with SeaMonkey Debug and QA UI addon
 *
 * See related Bug 457548 and suite/browser/tabbrowser.xml for details.
 */
getWindowTitleForNavigator: function () {
  var newTitle = "";
  var docTitle;
  var docElement = document.documentElement;
  var sep = docElement.getAttribute("titlemenuseparator");
  var modifier = "";

  if (!Application.platformIsMac) {
    modifier = nightlyApp.debugQATitleModifierWorkaround ||
               docElement.getAttribute("titlemodifier");
  }

  /**
   * TODO Explain this check
   */
  if (this.docShell.contentViewer)
    /**
     * Strip out any null bytes in the content title, since the
     * underlying widget implementations of nsWindow::SetTitle pass
     * null-terminated strings to system APIs.
     */
    docTitle = this.contentTitle.replace("\0", "");

  if (!docTitle && !modifier) {
    docTitle = this.getTitleForURI(this.currentURI);
    if (!docTitle) {
      /**
       * Here we actually override contenttitlesetting, because we
       * don't want the titledefault value.
       */
      docTitle = this.mStringBundle.getString("tabs.untitled");
    }
  }

  if (docTitle) {
    newTitle += docElement.getAttribute("titlepreface") + docTitle;
    if (modifier)
      newTitle += sep;
  }
  newTitle += modifier;

  /**
   * If location bar is hidden and the URL type supports a host,
   * add the scheme and host to the title to prevent spoofing.
   * XXX https://bugzilla.mozilla.org/show_bug.cgi?id=22183#c239
   * (only for schemes that support a host)
   */
  try {
    if (docElement.getAttribute("chromehidden").indexOf("location") != -1) {
      var uri = this.mURIFixup.createExposableURI(
                  this.currentURI);
      if (uri.schemeIs("about"))
        newTitle = uri.spec + sep + newTitle;
      else if (uri.host)
        newTitle = uri.prePath + sep + newTitle;
    }
  } catch (e) {
  }

  return newTitle;
},


}
