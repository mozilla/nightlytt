/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var paneTitle = {

bundle: null,

init: function()
{
  var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
              .getService(Components.interfaces.nsIWindowMediator);      
  var window = mediator.getMostRecentWindow("navigator:browser");
  if (!window)
    window=mediator.getMostRecentWindow("mail:3pane");
  if (!window)
    window=mediator.getMostRecentWindow("calendarMainWindow");
  if (!window)
    window=mediator.getMostRecentWindow("Songbird:Main");
  if (window)
    paneTitle.nightly=window.nightly;

  paneTitle.toggled();

  paneTitle.bundle=document.getElementById("variablesBundle");
  
  paneTitle.addVariable("DefaultTitle");
  paneTitle.addVariable("TabTitle");
  paneTitle.addVariable("AppID");
  paneTitle.addVariable("Vendor");
  paneTitle.addVariable("Name");
  paneTitle.addVariable("Version");
  paneTitle.addVariable("AppBuildID");
  paneTitle.addVariable("Changeset");
  paneTitle.addVariable("PlatformBuildID");
  paneTitle.addVariable("PlatformVersion");
  paneTitle.addVariable("GeckoVersion");
  paneTitle.addVariable("BrandName");
  paneTitle.addVariable("UserAgent");
  paneTitle.addVariable("Locale");
  paneTitle.addVariable("OS");
  paneTitle.addVariable("Processor");
  paneTitle.addVariable("Compiler");
  paneTitle.addVariable("Toolkit");
  paneTitle.addVariable("Profile");
},

addVariable: function(name)
{
  var list = document.getElementById("varList");
  var item = document.createElement("listitem");
  item.appendChild(document.createElement("listcell")).setAttribute('label',"${"+name+"}");
  var text = null;
  try
  {
    var text = paneTitle.bundle.getString("variable."+name+".description");
  } catch (e) { }
  if (text==null)
  {
    text="";
  }
  item.appendChild(document.createElement("listcell")).setAttribute('label',text);
  var value = paneTitle.nightly.getVariable(name);
  if (value==null)
  {
    value="Undefined";
  }
  item.appendChild(document.createElement("listcell")).setAttribute('label',value);
  item.addEventListener("click", function() {
    var titlebox = document.getElementById("customTitle");
    var template = titlebox.value + " ${" + name + "}";
    titlebox.value = template;
    // manually set pref, pref change isn't triggered if we just set the value
    paneTitle.nightly.preferences.setCharPref("templates.title", template);
  }, true);
  list.appendChild(item);
},

toggled: function()
{
  var checkbox = document.getElementById("enableTitleBar");
  var text = document.getElementById("customTitle");
  text.disabled=!checkbox.checked;
}
}

window.addEventListener("load",paneTitle.init,false);
