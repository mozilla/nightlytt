/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
var EXPORTED_SYMBOLS = ["iniFiles"];

const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm } = Components;

var appInfo = Cc["@mozilla.org/xre/app-info;1"]
              .getService(Ci.nsIXULAppInfo)
              .QueryInterface(Ci.nsIXULRuntime);

var directoryService;

function iniFileExtractor (aName) {
  this.mININame = aName;
}

iniFileExtractor.prototype = {
  mININame : null,
  mFile : null,
  mINIParser : null,
  
  get iniParser(){
  try {
    if (!this.mINIParser) {
      this.mFile = this.findIniFile(this.mININame);
      this.mINIParser = Cm.getClassObjectByContractID(
                            "@mozilla.org/xpcom/ini-parser-factory;1",
                            Ci.nsIINIParserFactory)
                        .createINIParser(this.mFile);
    }
    return this.mINIParser;
  } catch (e) { Cu.reportError (e); }
  },

  findIniFile : function (aName) {
  try{
    if (!directoryService) {
      directoryService = Cc["@mozilla.org/file/directory_service;1"]
                         .getService(Ci.nsIProperties);
    }

    var inifile = directoryService.get("GreD", Ci.nsIFile);
    inifile.append(aName);

    if (!inifile.exists()) {
      inifile = directoryService.get("CurProcD", Ci.nsIFile);
      inifile.append(aName);
    }

    return inifile;
    } catch (e) { Cu.reportError(e); }
  },

  getString : function (section, key) {
    try {
      return this.iniParser.getString(section, key);
    } catch (e) {
      Cu.reportError(e);
      return undefined;
    }
  }
}

var iniFiles = {};

iniFiles.application = new iniFileExtractor("application.ini");
iniFiles.platform = new iniFileExtractor("platform.ini");
iniFiles.appInfo = appInfo;

iniFiles.changeSet = iniFiles.application.getString("App","SourceStamp");
iniFiles.repo = iniFiles.application.getString("App","SourceRepository");

iniFiles.platformChangeSet = iniFiles.platform.getString("Build","SourceStamp");
iniFiles.platformRepo = iniFiles.platform.getString("Build","SourceRepository");
