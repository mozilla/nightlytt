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

function arrayBasedTreeView (treeViewData) {
  this.data = treeViewData;
}

arrayBasedTreeView.prototype = {

data: [],

get rowCount()
{ 
  return this.data.length 
},

getCellText: function(row,column)
{
  return this.data[row][column.id];
},

setTree: function(treebox)
{
  this.treebox = treebox;
},

isContainer: function(row)
{
  return false; 
},

isSeparator: function(row)
{
  return false;
},

isSorted: function(){
  return false;
},

getLevel: function(row)
{
  return 0; 
},

getImageSrc: function(row,col)
{
  return null;
},

getRowProperties: function(row,props)
{
},

getCellProperties: function(row,col,props)
{
},

getColumnProperties: function(colid,col,props)
{
},

cycleHeader: function(col)
{
},

};


var paneTitle = {

bundle: null,
variables: [],

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
  if (value==null)
  {
    value="Undefined";
  }
  paneTitle.variables.push({variable: "${"+name+"}", description: text, value: value});
},

toggled: function()
{
  var checkbox = document.getElementById("enableTitleBar");
  var text = document.getElementById("customTitle");
  text.disabled=!checkbox.checked;
},

setupTree: function(){
  var tree = document.getElementById("variablesTree");
  tree.view = new arrayBasedTreeView(paneTitle.variables);
  tree.addEventListener("click", function(event) {
    var tbo = tree.treeBoxObject;

    // get the row, col and child element at the point
    var row = { }, col = { }, child = { };
    tbo.getCellAt(event.clientX, event.clientY, row, col, child);

    // a workaround to skip clicks from scrollbar
    if (tree.view.selection.currentIndex === row.value) {
      var titlebox = document.getElementById("customTitle");
      var template = titlebox.value + " " + paneTitle.variables[row.value]["variable"];
      titlebox.value = template;
      // manually set pref, pref change isn't triggered if we just set the value
      paneTitle.nightly.preferences.setCharPref("templates.title", template);
    }
  }, true);
},
}

window.addEventListener("load",paneTitle.init,false);
