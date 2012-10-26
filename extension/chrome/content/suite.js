/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {
  
repository: ['comm-central','comm-aurora'],

oldUpdateTitlebar: null,
debugQATitleModifierWorkaround: null,

get defaultTitle() {
  var tabbrowser = gBrowser;
  return nightlyApp.getWindowTitleForNavigator(tabbrowser.mCurrentBrowser);
},

get tabTitle() {
  var tabbrowser = gBrowser;
  return tabbrowser.mCurrentBrowser.contentTitle;
},

init: function()
{
  var brandbundle = document.getElementById("bundle_brand");
  if (nightly.variables.name==null)
  {
    nightly.variables.name=brandbundle.getString("brandShortName");
  }
  nightly.variables.brandname=brandbundle.getString("brandFullName");

  var tabbrowser = document.getElementById("content");
  if (tabbrowser && typeof(tabbrowser.updateTitlebar) === "function") {
    nightlyApp.oldUpdateTitlebar = tabbrowser.updateTitlebar;

    tabbrowser.updateTitlebar = nightly.updateTitlebar;
    tabbrowser.addEventListener("DOMTitleChanged", nightly.updateTitlebar, false);

    var debugQABundle = document.getElementById("debugQANavigatorBundle");
    if (debugQABundle) {
      var titlemodifier = debugQABundle.getFormattedString("titlemodifier",
                                                  [nightly.variables.name,
                                                  nightly.variables.appbuildid]);

      if (document.documentElement.getAttribute("titlemodifier") === titlemodifier){
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
  document.getElementById("content").ownerDocument.title = title;
},

setStandardTitle: function()
{
  if (nightlyApp.oldUpdateTitlebar) {
    var tabbrowser = document.getElementById("content");
    nightlyApp.oldUpdateTitlebar.call(tabbrowser);
  }
},

/**
 * Calculates the title like tabbrowser's updateTitlebar(), but doesn't set.
 * See related Bug 457548 and suite/browser/tabbrowser.xml for details.
 */
getWindowTitleForNavigator: function (aBrowser) {
  var newTitle = "";
  var docTitle;
  var docElement = document.documentElement;
  var sep = docElement.getAttribute("titlemenuseparator");
  var modifier = nightlyApp.debugQATitleModifierWorkaround || 
                 docElement.getAttribute("titlemodifier");

  if (aBrowser.docShell.contentViewer)
    docTitle = aBrowser.contentTitle;

  if (!docTitle && !modifier) {
    docTitle = aBrowser.getTitleForURI(aBrowser.mCurrentBrowser.currentURI);
    if (!docTitle) {
      docTitle = aBrowser.mStringBundle.getString("tabs.untitled");
    }
  }

  if (docTitle) {
    newTitle += docElement.getAttribute("titlepreface") + docTitle;
    if (modifier)
      newTitle += sep;
  }
  newTitle += modifier;

  try {
    if (docElement.getAttribute("chromehidden").indexOf("location") != -1) {
      var uri  = aBrowser.mURIFixup.createExposableURI(
                   aBrowser.mCurrentBrowser.currentURI);
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
