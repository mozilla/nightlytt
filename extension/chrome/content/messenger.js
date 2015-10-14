/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {

savedTabmailSetDocumentTitle: null,
tabmailSetDocumentTitle: null,

get defaultTitle() {
  var tabmail = document.getElementById("tabmail");
  return nightlyApp.getWindowTitleForMessenger(tabmail.currentTabInfo);
},

get tabsCount() {
  var tabmail = document.getElementById("tabmail");
  return tabmail.tabInfo.length;
},
get tabTitle() {
  var tabmail = document.getElementById("tabmail");
  return tabmail.currentTabInfo.title;
},

init: function()
{
  var brandbundle = document.getElementById("bundle_brand");
  if (nightly.variables.name==null)
  {
    nightly.variables.name=brandbundle.getString("brandShortName");
  }
  nightly.variables.defaulttitle=brandbundle.getString("brandShortName");
  nightly.variables.brandname=brandbundle.getString("brandFullName");

  var tabmail = document.getElementById("tabmail");
  if (tabmail && typeof(tabmail.setDocumentTitle) === "function")
  {
    nightlyApp.savedTabmailSetDocumentTitle=tabmail.setDocumentTitle;
  }
},

openURL: function(url, event)
{
  var uri = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService)
                      .newURI(url, null, null);

  var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                              .getService(Components.interfaces.nsIExternalProtocolService);
  protocolSvc.loadUrl(uri);
},

customTabmailSetDocumentTitle: function(aTab)
{
  document.title = nightly.generateText(nightly.getTemplate("title"));
},

updateTitle: function()
{
  if (nightlyApp.savedTabmailSetDocumentTitle) {
    var tabmail = document.getElementById("tabmail");
    if (tabmail.setDocumentTitle != nightlyApp.tabmailSetDocumentTitle)
      tabmail.setDocumentTitle = nightlyApp.tabmailSetDocumentTitle;

    nightlyApp.tabmailSetDocumentTitle(window.document.getElementById("tabmail").currentTabInfo);
  }
},

setCustomTitle: function(title)
{
  nightlyApp.tabmailSetDocumentTitle=nightlyApp.customTabmailSetDocumentTitle;
  nightlyApp.updateTitle();
},

setStandardTitle: function()
{
  nightlyApp.tabmailSetDocumentTitle=nightlyApp.savedTabmailSetDocumentTitle;
  nightlyApp.updateTitle();
},

/**
 * Calculates the title like tabmail's setDocumentTitle(), but doesn't set.
 * See Bug 502389 for the details.
 */
getWindowTitleForMessenger: function(aTab)
{
  let docTitle = aTab.title;

  if (docTitle && !Application.platformIsMac)
    docTitle += document.documentElement
                        .getAttribute("titlemenuseparator");

  if (!docTitle || !Application.platformIsMac)
    docTitle += document.documentElement
                        .getAttribute("titlemodifier");

  return docTitle;
},

openAboutNightly: function () {
  var tabmail = document.getElementById("tabmail");
  tabmail.openTab("contentTab", { contentPage: "about:nightly" });
},

}
