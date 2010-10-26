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
 
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const LOAD_DELAY = 50;

Cc["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Ci.mozIJSSubScriptLoader)
  .loadSubScript("chrome://nightly/content/includes/tree-utils.js", null);

function BP_CreateArray(source)
{
  var result = Cc["@mozilla.org/array;1"]
                 .createInstance(Ci.nsIMutableArray);
  
  for (var key in source)
    result.appendElement(source[key], false);
  
  return result;
}

function nttBreakpadIncident(file)
{
  this.id = file.leafName;
  this.id = this.id.substring(0, this.id.length - 4);
  this.date = file.lastModifiedTime;
  this.file = file;
}

nttBreakpadIncident.prototype = {
date: null,
id: null,
file: null,

QueryInterface: XPCOMUtils.generateQI([Ci.nttIBreakpadIncident])
}

function nttBreakpadService() {
  this.wrappedJSObject = this;

  var obs = Cc["@mozilla.org/observer-service;1"]
             .getService(Ci.nsIObserverService);
  obs.addObserver(this, "quit-application", false);

  this._dirs = [];
  this._databases = [];
  this._listeners = [];
  this._incidents = [];
  this._orderedIncidents = [];

  this._findBreakpad();
  if (this.reportdir)
    this._dirs.push(this.reportdir);
  else
  {
    this.loaded = true;
    this._loading = true;
  }
}

nttBreakpadService.prototype = {

reportdir: null,

loaded: false,
_loading: false,
_dirs: null,
_databases: null,
_loadTimer: null,
_listeners: null,

incidents: null,
orderedIncidents: null,

addProgressListener: function(listener)
{
  if (!this.loaded)
    this._listeners.push(listener);
  else
    listener.onDatabaseLoaded();
},

loadDatabase: function()
{
  if (this._loading)
    return;

  this._loading = true;

  if (this.reportdir && this.reportdir.exists())
  {
    this.incidents = [];
    this.orderedIncidents = [];

    this._loadTimer = Cc["@mozilla.org/timer;1"]
                       .createInstance(Ci.nsITimer);
    this._loadTimer.init(this, LOAD_DELAY, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  }
  else
    this.loaded = true;
},

observe: function(subject, topic, data)
{
  switch (topic)
  {
    case "quit-application":
      if (this._loadTimer)
      {
        // Shutdown during load, clear references
        this._loadTimer.cancel();
        this._loadTimer = null;
        this._databases = [];
        this._dirs = [];
        this._listeners = [];
      }
      var obs = Cc["@mozilla.org/observer-service;1"]
                 .getService(Ci.nsIObserverService);
      obs.removeObserver(this, "quit-application");
      break;
    case "timer-callback":
      this.run();
      break;
  }
},

run: function()
{
  if (this._dirs.length>0)
    this._scanDir(this._dirs.pop());
  else if (this._databases.length>0)
    this._loadDatabase(this._databases.pop());
  else
  {
    this.loaded = true;
    if (this._listeners.length == 0) {
      this._loadTimer = null;
      return;
    }
    var listener = this._listeners.pop();
    listener.onDatabaseLoaded();
    if (this._listeners.length == 0) {
      this._loadTimer = null;
      return;
    }
  }
  this._loadTimer.init(this, LOAD_DELAY, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
},

_scanDir: function(dir)
{
  var entries = dir.directoryEntries;
  while (entries.hasMoreElements())
  {
    var ndir = entries.getNext().QueryInterface(Ci.nsIFile);
    if (ndir.isDirectory())
      this._dirs.push(ndir);
    else
    {
      var ext = ndir.leafName;
      ext = ext.substring(ext.length - 4);
      if (ext == ".txt")
        this._databases.push(ndir);
    }
  }
},

_loadDatabase: function(database)
{
  var incident = new nttBreakpadIncident(database);
  this._addIncident(incident);
},

_findBreakpad: function()
{
  var directoryService = Cc["@mozilla.org/file/directory_service;1"]
                           .getService(Ci.nsIProperties);
  var dir = directoryService.get("DefProfRt", Ci.nsIFile);
  if (dir.leafName.toLowerCase() == "profiles")
    dir = dir.parent;
  dir.append("Crash Reports");
  if (dir.exists() && dir.isDirectory())
    this.reportdir = dir;
},

_addIncident: function(incident)
{
  var pos = 0;
  while ((pos < this.orderedIncidents.length) && (this.orderedIncidents[pos].date > incident.date))
    pos++;
  
  this.orderedIncidents.splice(pos, 0, incident);
  this.incidents[incident.id]=incident;
},

getRecentIncidents: function(date)
{
  var result = Cc["@mozilla.org/array;1"]
                 .createInstance(Ci.nsIMutableArray);
  
  for (var i = 0; i < this.orderedIncidents.length; i++)
  {
    if (this.orderedIncidents[i].date<date)
      break;
      
    result.appendElement(this.orderedIncidents[i], false);
  }
  
  return result;
},

getPreviousIncidents: function(count)
{
  var result = Cc["@mozilla.org/array;1"]
                 .createInstance(Ci.nsIMutableArray);
  
  count=Math.min(count, this.orderedIncidents.length);
  
  for (var i = 0; i < count; i++)
    result.appendElement(this.orderedIncidents[i], false);
  
  return result;
},

getIncident: function(id)
{
  return this.incidents[id];
},

getIncidents: function()
{
  return TB_CreateArray(this.orderedIncidents);
},

getTreeView: function()
{
  var share = {};
  var tv = new XULTreeView(share);
  tv.childData.reserveChildren(true);
  
  var vparent = tv.childData;
  
  for (var i = 0; i < this.orderedIncidents.length; i++)
  {
    var incident = this.orderedIncidents[i];
    record = new XULTreeViewRecord(share);
    record.setColumnPropertyName("incidentID", "id");
    record.setColumnPropertyName("incidentDate", "date");
    record.setColumnProperties("incidentID", "name incident");
    record.id = incident.id;
    record.date = (new Date(incident.date)).toLocaleString();
    tv.childData.appendChild(record);
  }
  
  return tv;
},

classDescription: "Nightly Tester Breakpad Service",
contractID: "@blueprintit.co.uk/breakpad;1",
classID: Components.ID("{b33388ca-71b4-4194-b822-2cbd0e89ffc0}"),
QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver])
}

function NSGetModule(compMgr, fileSpec)
  XPCOMUtils.generateModule([nttBreakpadService]);
