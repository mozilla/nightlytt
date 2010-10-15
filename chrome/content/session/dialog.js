# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Nightly Tester Tools.
#
# The Initial Developer of the Original Code is
#      Dave Townsend <dtownsend@oxymoronical.com>.
#
# Portions created by the Initial Developer are Copyright (C) 2007
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****
#
const XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var gArgs = null;

function acceptRestore()
{
  for (var w in gArgs.state.windows)
  {
    var win = gArgs.state.windows[w];
    for (var t = win.tabs.length-1; t>=0; t--)
    {
      var tab = win.tabs[t];
      if (tab._control.getAttribute("value") !== "true")
      {
        win.tabs.splice(t, 1);
        if (t < win.selected)
          win.selected--;
      }
      else
        delete tab["_control"];
    }
  }
  gArgs.result = true;
}

function addTab(parent, tab)
{
  var item = document.createElementNS(XULNS, "treeitem");
  item.setAttribute("container", "false");
  parent.appendChild(item);
  var row = document.createElementNS(XULNS, "treerow");
  item.appendChild(row);
  var cell = document.createElementNS(XULNS, "treecell");
  if (tab.entries[tab.index-1].title)
    cell.setAttribute("label", tab.entries[tab.index-1].title);
  else
    cell.setAttribute("label", "(Untitled)");
  cell.setAttribute("editable", "false");
  row.appendChild(cell);
  cell = document.createElementNS(XULNS, "treecell");
  cell.setAttribute("value", "true");
  row.appendChild(cell);
  tab._control = cell;
}

function addWindow(parent, win)
{
  var item = document.createElementNS(XULNS, "treeitem");
  item.setAttribute("container", "true");
  item.setAttribute("open", "true");
  parent.appendChild(item);
  var row = document.createElementNS(XULNS, "treerow");
  item.appendChild(row);
  var cell = document.createElementNS(XULNS, "treecell");
  cell.setAttribute("label", "Window");
  cell.setAttribute("editable", "false");
  row.appendChild(cell);
  cell = document.createElementNS(XULNS, "treecell");
  cell.setAttribute("editable", "false");
  row.appendChild(cell);
  var children = document.createElementNS(XULNS, "treechildren");
  item.appendChild(children);
  for (var i in win.tabs)
    addTab(children, win.tabs[i]);
}

function loadState(event)
{
  gArgs = window.arguments[0];
  var parent = document.getElementById("treechildren");
  var windows = gArgs.state.windows;
  for (var i in windows)
    addWindow(parent, windows[i]);
}

window.addEventListener("load", loadState, false);
 