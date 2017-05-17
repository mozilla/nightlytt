/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function arrayBasedTreeView(treeViewData) {
  this.data = treeViewData;
}

arrayBasedTreeView.prototype = {
  data: [],

  get rowCount() {
    return this.data.length;
  },

  getCellText: function (aRow, aColumn) {
    return this.data[aRow][aColumn.id];
  },

  setTree: function (aTreebox) {
    this.treebox = aTreebox;
  },

  isContainer: function (aRow) {
    return false;
  },

  isSeparator: function (aRow) {
    return false;
  },

  isSorted: function () {
    return false;
  },

  getLevel: function (aRow) {
    return 0;
  },

  getImageSrc: function (aRow, aCol) {
    return null;
  },

  getRowProperties: function (aRow, aProps) {
    return "";
  },

  getCellProperties: function (aRow, aCol, aProps) {
    return "";
  },

  getColumnProperties: function (aColID, aCol, aProps) {
    return "";
  },

  cycleHeader: function (aCol) {
  },
};


var paneTitle = {

bundle: null,
variables: [],

init: function(aEvent)
{
  aEvent.originalTarget.defaultView.removeEventListener("load", paneTitle.init, false);

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

  paneTitle.addVariable("AppBuildID");
  paneTitle.addVariable("AppID");
  paneTitle.addVariable("BrandName");
  paneTitle.addVariable("Changeset");
  paneTitle.addVariable("Compiler");
  paneTitle.addVariable("DefaultTitle");
  paneTitle.addVariable("GeckoVersion");
  paneTitle.addVariable("Locale");
  paneTitle.addVariable("Name");
  paneTitle.addVariable("OS");
  paneTitle.addVariable("PlatformBuildID");
  paneTitle.addVariable("PlatformChangeset");
  paneTitle.addVariable("PlatformVersion");
  paneTitle.addVariable("Processor");
  paneTitle.addVariable("Profile");
  paneTitle.addVariable("TabsCount");
  paneTitle.addVariable("TabTitle");
  paneTitle.addVariable("Toolkit");
  paneTitle.addVariable("UserAgent");
  paneTitle.addVariable("Vendor");
  paneTitle.addVariable("Version");
  paneTitle.setupTree();
},

addVariable: function(name)
{
  var text = null;
  try
  {
    var text = paneTitle.bundle.getString("variable."+name+".description");
  } catch (e) { }
  if (text==null)
  {
    text="";
  }
  var value = paneTitle.nightly.getVariable(name);
  paneTitle.variables.push({variable: "${"+name+"}", description: text, value: value});
},

toggled: function()
{
  var checkbox = document.getElementById("enableTitleBar");
  var text = document.getElementById("customTitle");
  text.disabled=!checkbox.checked;
},

setupTree: function () {
  var tree = document.getElementById("variableTree");
  tree.view = new arrayBasedTreeView(paneTitle.variables);
  tree.addEventListener("click", treeOnClickListener, true);
},
}

function treeOnClickListener(aEvent) {
  if (aEvent.originalTarget.tagName === "treechildren") {
    var tree = aEvent.originalTarget.parentNode;
    var tbo = tree.treeBoxObject;

    // get the row, col and child element at the point
    var row = { }, col = { }, child = { };
    tbo.getCellAt(aEvent.clientX, aEvent.clientY, row, col, child);

    // a workaround to skip extraneous clicks
    if (tree.view.selection.currentIndex === row.value) {
      var titlebox = document.getElementById("customTitle");
      var template = titlebox.value + " " + paneTitle.variables[row.value]["variable"];
      titlebox.value = template;
      // manually set pref, pref change isn't triggered if we just set the value
      paneTitle.nightly.preferences.setCharPref("templates.title", template);
    }
  }
}

window.addEventListener("load",paneTitle.init,false);
