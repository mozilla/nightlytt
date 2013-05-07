/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EXPORTED_SYMBOLS = ["IniFile"];

const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm } = Components;

const {dlg, dlsg} = Cu.import("resource://nightly/dlg.jsm", {});

dlsg(this, "dirsvc", "@mozilla.org/file/directory_service;1", "nsIProperties");

function findIniFile(aName) {
  var inifile = dirsvc.get("GreD", Ci.nsIFile);
  inifile.append(aName);

  if (!inifile.exists()) {
    inifile = dirsvc.get("CurProcD", Ci.nsIFile);
    inifile.append(aName);
  }

  return inifile;
}

function createINIParser(aFile) {
  var iniParser = Cm.getClassObjectByContractID(
                      "@mozilla.org/xpcom/ini-parser-factory;1",
                      Ci.nsIINIParserFactory)
                  .createINIParser(aFile);
  return iniParser;
}

function IniFile (aName) {
  this._filename = aName;
  dlg(this, "_file", function () {
    return findIniFile(aName);
  });
  dlg(this, "_iniParser", function () {
    return createINIParser(this._file);
  });
}

IniFile.prototype = {
  getString : function (section, key) {
    try {
      return this._iniParser.getString(section, key);
    } catch (e) {
      return undefined;
    }
  }
}
