/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
var EXPORTED_SYMBOLS = ["LOG", "WARN", "ERROR"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

var gLoggingEnabled = false;

function logMessage(text, level) {
  var caller = null;
  try {
    caller = Components.stack.caller.caller;
  }
  catch (e) { }

  var msg = Cc["@mozilla.org/scripterror;1"].
            createInstance(Ci.nsIScriptError);
  if (caller) {
    var filename = caller.filename;
    var sourceLine = caller.sourceLine;
    var lineNumber = caller.lineNumber;
  }
  else {
    var filename = "";
    var sourceLine = "";
    var lineNumber = 0;
  }
  msg.init(text, filename, sourceLine, lineNumber, 0,
           level, "XUL JavaScript");

  var console = Cc["@mozilla.org/consoleservice;1"].
                getService(Ci.nsIConsoleService);
  console.logMessage(msg);
}

function ERROR(string) {
  dump("NTT ERROR: " + string + "\n");
  logMessage("NTT: " + string, Ci.nsIScriptError.errorFlag);
}

function WARN(string) {
  dump("NTT WARN : " + string + "\n");
  logMessage("NTT: " + string, Ci.nsIScriptError.warningFlag);
}

function LOG(string) {
  if (gLoggingEnabled) {
    dump("NTT LOG  : " + string + "\n");
    
    var caller = null;
    try {
      caller = Components.stack.caller;
    }
    catch (e) { }
    
    if (caller)
      string += " (" + caller.filename + ":" + caller.lineNumber + ")";

    var console = Cc["@mozilla.org/consoleservice;1"].
                  getService(Ci.nsIConsoleService);
    console.logStringMessage("NTT: " + string);
  }
}

var prefs = Cc["@mozilla.org/preferences-service;1"].
            getService(Ci.nsIPrefBranch);
try {
  gLoggingEnabled = prefs.getBoolPref("nightly.logging");
}
catch (e) { }
