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

var session = {

init: function(event)
{
  var menu = document.getElementById("nightly-session-restore");
  var ds = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties);
  var file = ds.get("ProfD", Ci.nsIFile);
  file.append("sessionstore.bak");
  if (!file.exists)
    menu.setAttribute("disabled", "true");
},

_readFile: function(file)
{
  try
  {
    var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                           .createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file, 0x01, 0, 0);
    var cvstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                             .createInstance(Components.interfaces.nsIConverterInputStream);
    cvstream.init(stream, "UTF-8", 1024, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    
    var content = "";
    var data = {};
    while (cvstream.readString(4096, data))
      content += data.value;
    cvstream.close();
    
    return content.replace(/\r\n?/g, "\n");
  }
  catch (ex) { }
  
  return null;
},

restore: function()
{
  var ds = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties);
  var file = ds.get("ProfD", Ci.nsIFile);
  file.append("sessionstore.bak");
  if (file.exists)
  {
    var data = this._readFile(file);
    if (data)
    {
      try
      {
        var s = Components.utils.Sandbox("about:blank");
        var state = Components.utils.evalInSandbox(data, s);
        var args = {
          state: state,
          result: false
        };
        window.openDialog("chrome://nightly/content/session/session.xul", "_blank", "chrome,all,modal", args);
        if (args.result)
        {
          var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                             .getService(Components.interfaces.nsISessionStore);
          var win = OpenBrowserWindow();
          win.addEventListener("load", function() { ss.setWindowState(win, args.state.toSource(), true); }, false);
        }
        return;
      }
      catch (ex)
      {
      }
    }
    alert("Unable to read from file, this is unrecoverable.");
  }
  else
    alert("There is no session information to restore.");
}
}

window.addEventListener("load", session.init, false);
