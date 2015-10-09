/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {

storedTitle: document.documentElement.getAttribute("titlemodifier"),

init: function()
{
  // var brandbundle = document.getElementById("bundle_brand");
  var bundleSvc = Components.classes["@mozilla.org/intl/stringbundle;1"]
                  .getService(Components.interfaces.nsIStringBundleService);
  var brandbundle = bundleSvc.
                    createBundle("chrome://branding/locale/brand.properties");

  if (nightly.variables.name==null)
  {
    nightly.variables.name=brandbundle.GetStringFromName("brandShortName");
  }
  nightly.variables.brandname=brandbundle.GetStringFromName("brandFullName");
  nightly.variables.defaulttitle=nightlyApp.storedTitle;
},

openURL: function(url, event)
{
  openUILink(url, event, false, true);
},

setCustomTitle: function(title)
{
  var titlebar = document.getElementsByTagName("sb-sys-titlebar")[0];
  titlebar.setAttribute("value", title);
},

setBlankTitle: function()
{
  var titlebar = document.getElementsByTagName("sb-sys-titlebar")[0];
  titlebar.setAttribute("value", "");
},

setStandardTitle: function()
{
  var titlebar = document.getElementsByTagName("sb-sys-titlebar")[0];
  titlebar.setAttribute("value", nightlyApp.storedTitle);
}

}

// songbird doesn't appear to initialize XPCOM components at startup
try {
  Components.classes["@mozilla.com/nightly/addoncompatibility;1"].createInstance();
} catch(e) {}

