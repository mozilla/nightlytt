/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nightlyApp = {
  
repository: ['comm-central','comm-aurora'],

init: function()
{
  var brandbundle = document.getElementById("bundle_brand");
  if (nightly.variables.name==null)
  {
    nightly.variables.name=brandbundle.getString("brandShortName");
  }
  nightly.variables.brandname=brandbundle.getString("brandFullName");
  nightly.variables.defaulttitle=nightlyApp.storedTitle;
},

openURL: function(url, event)
{
  openTopWin(url);
},

setCustomTitle: function(title)
{
},

setBlankTitle: function()
{
},

setStandardTitle: function()
{
}

}
