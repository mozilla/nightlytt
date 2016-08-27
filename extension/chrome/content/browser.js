/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {

storedTitle: document.documentElement.getAttribute("titlemodifier"),

get defaultTitle() {
  var tabbrowser = document.getElementById("content");
  return tabbrowser.getWindowTitleForBrowser(tabbrowser.mCurrentBrowser);
},

get tabsCount() {
  var tabbrowser = document.getElementById("content");
  return tabbrowser.visibleTabs ? tabbrowser.visibleTabs.length : tabbrowser.browsers.length;
},
get tabTitle() {
  var tabbrowser = document.getElementById("content");
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
  nightly.variables.defaulttitle=nightlyApp.storedTitle;

  var tabbrowser = document.getElementById("content");
  nightlyApp.oldUpdateTitlebar = tabbrowser.updateTitlebar;

  tabbrowser.updateTitlebar = nightly.updateTitlebar;
  tabbrowser.addEventListener("DOMTitleChanged", nightly.updateTitlebar, false);
},

openURL: function(url)
{
  gBrowser.selectedTab = gBrowser.addTab(url);
},

openNotification: function(id, message, label, accessKey, callback) {
  var action = {
    label: label,
    callback: callback,
    accessKey: accessKey
  };
  if (typeof PopupNotifications != "undefined") {
    var options = {
      timeout: Date.now() + 10000
    };

    PopupNotifications.show(gBrowser.selectedBrowser, id,
      message, "urlbar", action, null, options);
  } else {
    let nb = gBrowser.getNotificationBox();

    nb.appendNotification(
      message, id,
      "chrome://nightly/content/brand/icon.png",
      nb.PRIORITY_INFO_HIGH, [ action ]);
  }
},

setCustomTitle: function(title)
{
  document.getElementById("content").ownerDocument.title = title;
},

setStandardTitle: function()
{
  var tabbrowser = document.getElementById("content");
  nightlyApp.oldUpdateTitlebar.call(tabbrowser);
},

}
