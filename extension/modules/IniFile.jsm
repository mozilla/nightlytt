/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
var EXPORTED_SYMBOLS = ["IniFile"];

const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Gecko 1.9.0/1.9.1 and Songbird compatibility - add XPCOMUtils.defineLazyServiceGetter
if (!("defineLazyServiceGetter" in XPCOMUtils)) {
  XPCOMUtils.defineLazyServiceGetter = function XPCU_defineLazyServiceGetter(obj, prop, contract, iface)
  {
    obj.__defineGetter__(prop, function XPCU_serviceGetter()
    {
      delete obj[prop];
      return obj[prop] = Cc[contract].getService(Ci[iface]);
    });
  };
}

XPCOMUtils.defineLazyServiceGetter(this, "dirsvc", "@mozilla.org/file/directory_service;1", "nsIProperties");

function IniFile (aName) {
  this._filename = aName;
}

IniFile.prototype = {
  _filename : null,
  _file : null,
  mINIParser : null,
  
  get iniParser(){
    if (!this.mINIParser) {
      this._file = this.findIniFile(this._filename);
      this.mINIParser = Cm.getClassObjectByContractID(
                            "@mozilla.org/xpcom/ini-parser-factory;1",
                            Ci.nsIINIParserFactory)
                        .createINIParser(this._file);
    }
    return this.mINIParser;
  },

  findIniFile : function (aName) {
    var inifile = dirsvc.get("GreD", Ci.nsIFile);
    inifile.append(aName);

    if (!inifile.exists()) {
      inifile = dirsvc.get("CurProcD", Ci.nsIFile);
      inifile.append(aName);
    }

    return inifile;
  },

  getString : function (section, key) {
    try {
      return this.iniParser.getString(section, key);
    } catch (e) {
      return undefined;
    }
  }
}
