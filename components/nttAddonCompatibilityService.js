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

const PREFIX_NS_EM                    = "http://www.mozilla.org/2004/em-rdf#";
const PREFIX_ITEM_URI                 = "urn:mozilla:item:";
const RDFURI_INSTALL_MANIFEST_ROOT    = "urn:mozilla:install-manifest";
const FILE_INSTALL_MANIFEST           = "install.rdf";
const TOOLKIT_ID                      = "toolkit@mozilla.org"

var gEM = null;
var gRDF = null;
var gApp = null;
var gVC = null;
var gCheckCompatibility = true;
var gCheckUpdateSecurity = true;
var gPrefs = null;

function EM_NS(property) {
  return PREFIX_NS_EM + property;
}

function EM_R(property) {
  return gRDF.GetResource(EM_NS(property));
}

function getRDFProperty(ds, source, property) {
  var value = ds.GetTarget(source, EM_R(property), true);
  if (value && value instanceof Ci.nsIRDFLiteral)
    return value.Value;
  return null;
}

function removeRDFProperty(ds, source, property) {
  var arc = EM_R(property);
  var targets = ds.GetTargets(source, arc, true);
  while (targets.hasMoreElements())
    ds.Unassert(source, arc, targets.getNext());
}

function extractXPI(xpi) {
  // XXX For 1.9 final we can switch to just extracting/compressing install.rdf
  var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].
                  createInstance(Ci.nsIZipReader);
  zipReader.open(xpi);
  if (!zipReader.hasEntry(FILE_INSTALL_MANIFEST)) {
    zipReader.close();
    return null;
  }
  var dirs = Cc["@mozilla.org/file/directory_service;1"].
             getService(Ci.nsIProperties);
  var file = dirs.get("TmpD", Ci.nsILocalFile);
  file.append("tmpxpi");
  file.createUnique(Ci.nsIFile.DIRECTORY_TYPE, 0755);
  var entries = zipReader.findEntries("*");
  while (entries.hasMore()) {
    var path = entries.getNext();
    var entry = zipReader.getEntry(path);
    if (path.substring(path.length - 1) == "/")
      path = path.substring(0, entry.length - 1);
    var parts = path.split("/");
    var target = file.clone();
    for (var i = 0; i < parts.length; i++)
      target.append(parts[i]);
    if (entry.isDirectory) {
      if (!target.exists())
        target.create(Ci.nsIFile.DIRECTORY_TYPE, 0755);
    }
    else {
      var parent = target.parent;
      if (!parent.exists())
        parent.create(Ci.nsIFile.DIRECTORY_TYPE, 0755);
      zipReader.extract(path, target);
    }
  }
  zipReader.close();
  return file;
}

function loadManifest(file) {
  var ioServ = Cc["@mozilla.org/network/io-service;1"].
               getService(Ci.nsIIOService);
  var fph = ioServ.getProtocolHandler("file")
                  .QueryInterface(Ci.nsIFileProtocolHandler);
  return gRDF.GetDataSourceBlocking(fph.getURLSpecFromFile(file));
}

function recursiveUpdate(zipWriter, path, dir) {
  var entries = dir.directoryEntries;
  while (entries.hasMoreElements()) {
    var entry = entries.getNext().QueryInterface(Ci.nsIFile);
    if (entry.isDirectory()) {
      var newPath = path + entry.leafName + "/";
      zipWriter.addEntryDirectory(newPath, entry.lastModifiedTime, false);
      recursiveUpdate(zipWriter, newPath, entry);
    }
    else {
      zipWriter.addEntryFile(path + entry.leafName, Ci.nsIZipWriter.COMPRESSION_NONE,
                             entry, false);
    }
  }
}

function updateXPI(xpi, file) {
  // XXX For 1.9 final we can switch to just extracting/compressing install.rdf
  var zipWriter = Cc["@mozilla.org/zipwriter;1"].
                  createInstance(Ci.nsIZipWriter);
  zipWriter.open(xpi, 0x04 | 0x08 | 0x20);
  recursiveUpdate(zipWriter, "", file);
  zipWriter.close();
}

function nttAddonUpdateChecker(addon) {
  this.addon = addon;
}

nttAddonUpdateChecker.prototype = {
  addon: null,
  busy: null,

  checkForUpdates: function() {
    this.busy = true;
    LOG("Searching for compatibility information for " + this.addon.id);
    gEM.update([this.addon], 1,
               Ci.nsIExtensionManager.UPDATE_SYNC_COMPATIBILITY, this);

    // Spin an event loop to wait for the update check to complete.
    var tm = Cc["@mozilla.org/thread-manager;1"].
             getService(Ci.nsIThreadManager);
    var thread = tm.currentThread;
    while (this.busy)
      thread.processNextEvent(true);
  },

  // nsIAddonUpdateCheckListener implementation
  onUpdateStarted: function() {
  },

  onUpdateEnded: function() {
    this.busy = false;
  },

  onAddonUpdateStarted: function(addon) {
  },

  onAddonUpdateEnded: function(addon, status) {
    if (status & Ci.nsIAddonUpdateCheckListener.STATUS_DATA_FOUND) {
      LOG("Found new compatibility information for " + addon.id + ": " + addon.minAppVersion + " " + addon.maxAppVersion);
      this.addon.minAppVersion = addon.minAppVersion;
      this.addon.maxAppVersion = addon.maxAppVersion;
      this.addon.targetAppID = addon.targetAppID;
      this.addon.overrideVersions();
    }
  }
};

function nttAddonDetail() {
  this.wrappedJSObject = this;
}

nttAddonDetail.prototype = {
  datasource: null,
  root: null,

  xpi: null,
  file: null,

  id: null,
  name: null,
  version: null,
  type: Ci.nsIUpdateItem.TYPE_EXTENSION,
  updateRDF: null,
  updateKey: null,
  iconURL: "chrome://mozapps/skin/xpinstall/xpinstallItemGeneric.png",

  installLocationKey: null,
  xpiURL: null,
  xpiHash: null,

  appResource: null,
  targetAppID: null,
  minAppVersion: null,
  maxAppVersion: null,

  init: function() {
    if (!this.id)
      this.id = getRDFProperty(this.datasource, this.root, "id");
    this.name = getRDFProperty(this.datasource, this.root, "name");
    this.version = getRDFProperty(this.datasource, this.root, "version");
    this.updateRDF = getRDFProperty(this.datasource, this.root, "updateURL");
    this.updateKey = getRDFProperty(this.datasource, this.root, "updateKey");

    var apps = this.datasource.GetTargets(this.root, EM_R("targetApplication"), true);
    while (apps.hasMoreElements()) {
      var app = apps.getNext().QueryInterface(Ci.nsIRDFResource);
      var id = getRDFProperty(this.datasource, app, "id");
      if (id == gApp.ID || id == TOOLKIT_ID) {
        this.minAppVersion = getRDFProperty(this.datasource, app, "minVersion");
        this.maxAppVersion = getRDFProperty(this.datasource, app, "maxVersion");
        if (this.minAppVersion && this.maxAppVersion) {
          this.appResource = app;
          this.targetAppID = id;
          if (id == gApp.ID)
            break;
        }
      }
    }
  },

  initWithXPI: function(xpi) {
    this.xpi = xpi;
    this.file = extractXPI(xpi);
    var rdf = this.file.clone();
    rdf.append(FILE_INSTALL_MANIFEST);
    this.datasource = loadManifest(rdf);
    this.root = gRDF.GetResource(RDFURI_INSTALL_MANIFEST_ROOT);
    this.init();
  },

  initWithDataSource: function(ds, root, id) {
    this.datasource = ds;
    this.root = root;
    this.id = id;
    this.init();
  },

  cleanup: function() {
    if (this.file && this.file.exists)
      this.file.remove(true);
  },

  overrideVersions: function() {
    removeRDFProperty(this.datasource, this.appResource, "minVersion");
    this.datasource.Assert(this.appResource, EM_R("minVersion"), gRDF.GetLiteral(this.minAppVersion), true);
    removeRDFProperty(this.datasource, this.appResource, "maxVersion");
    this.datasource.Assert(this.appResource, EM_R("maxVersion"), gRDF.GetLiteral(this.maxAppVersion), true);
    this.datasource.QueryInterface(Ci.nsIRDFRemoteDataSource).Flush();
    if (this.xpi && this.file)
      updateXPI(this.xpi, this.file);
  },

  overrideCompatibility: function(ignorePrefs) {
    if (!this.isValid())
      return;

    var changed = false;

    if (gCheckCompatibility || ignorePrefs) {
      var version = (gApp.ID == this.targetAppID) ? gApp.version : gApp.platformVersion;
      if (gVC.compare(version, this.minAppVersion) < 0) {
        LOG("minVersion " + this.minAppVersion + " is too high, reducing to " + version);
        if (!this.datasource.GetTarget(this.appResource, EM_R("oldMinVersion"), true))
          this.datasource.Assert(this.appResource, EM_R("oldMinVersion"), gRDF.GetLiteral(this.minAppVersion), true);
        removeRDFProperty(this.datasource, this.appResource, "minVersion");
        this.datasource.Assert(this.appResource, EM_R("minVersion"), gRDF.GetLiteral(version), true);
        this.minAppVersion = version;
        changed = true;
      }
      else if (gVC.compare(version, this.maxAppVersion) > 0) {
        LOG("maxVersion " + this.maxAppVersion + " is too low, increasing to " + version);
        if (!this.datasource.GetTarget(this.appResource, EM_R("oldMaxVersion"), true))
          this.datasource.Assert(this.appResource, EM_R("oldMaxVersion"), gRDF.GetLiteral(this.maxAppVersion), true);
        removeRDFProperty(this.datasource, this.appResource, "maxVersion");
        this.datasource.Assert(this.appResource, EM_R("maxVersion"), gRDF.GetLiteral(version), true);
        this.maxAppVersion = version;
        changed = true;
      }

      if (changed && !this.xpi) {
        // This updates any UI bound to the datasource
        var compatprop = EM_R("compatible");
        var truth = gRDF.GetLiteral("true");
        this.datasource.Assert(this.root, compatprop, truth, true);
        this.datasource.Unassert(this.root, compatprop, truth);
      }
    }

    if (!this.isUpdateSecure(ignorePrefs)) {
      LOG("Addon is insecure, removing update URL");
      removeRDFProperty(this.datasource, this.root, "updateURL");
      this.updateRDF = null;
      changed = true;

      // This updates any UI bound to the datasource
      compatprop = EM_R("providesUpdatesSecurely");
      truth = gRDF.GetLiteral("true");
      this.datasource.Assert(this.root, compatprop, truth, true);
      this.datasource.Unassert(this.root, compatprop, truth);
    }

    if (changed) {
      this.datasource.QueryInterface(Ci.nsIRDFRemoteDataSource).Flush();
      if (this.xpi && this.file)
        updateXPI(this.xpi, this.file);
    }
  },

  isValid: function() {
    return !!this.appResource;
  },

  isCompatible: function(ignorePrefs) {
    if (!gCheckCompatibility && !ignorePrefs)
      return true;

    var version = (gApp.ID == this.targetAppID) ? gApp.version : gApp.platformVersion;
    if (gVC.compare(version, this.minAppVersion) < 0)
      return false;
    if (gVC.compare(version, this.maxAppVersion) > 0)
      return false;
    return true;
  },

  isUpdateSecure: function(ignorePrefs) {
    if (!gCheckUpdateSecurity && !ignorePrefs)
      return true;

    if (!this.updateRDF)
      return true;
    if (this.updateKey)
      return true;
    return (this.updateRDF.substring(0, 6) == "https:");
  },

  needsOverride: function(ignorePrefs) {
    return (!this.isCompatible(ignorePrefs) || !this.isUpdateSecure(ignorePrefs));
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nttIAddon, Ci.nsIUpdateItem]),
};

function nttAddonCompatibilityService() {
  this.wrappedJSObject = this;
}

nttAddonCompatibilityService.prototype = {
  id: null,

  init: function() {
    Components.utils.import("resource://nightly/Logging.jsm");

    gEM = Cc["@mozilla.org/extensions/manager;1"].
          getService(Ci.nsIExtensionManager);
    gRDF = Cc["@mozilla.org/rdf/rdf-service;1"].
           getService(Ci.nsIRDFService);
    gApp = Cc["@mozilla.org/xre/app-info;1"].
           getService(Ci.nsIXULAppInfo).QueryInterface(Ci.nsIXULRuntime);
    gVC = Cc["@mozilla.org/xpcom/version-comparator;1"].
          getService(Ci.nsIVersionComparator);
    if (gVC.compare(gApp.platformVersion, "1.9b5") >= 0)
      this.id = gEM.addInstallListener(this);
    gPrefs = Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService)
                       .getBranch("extensions.")
                       .QueryInterface(Components.interfaces.nsIPrefBranch2);
    try {
      gCheckCompatibility = gPrefs.getBoolPref("checkCompatibility");
    }
    catch (e) { }
    try {
      gCheckUpdateSecurity = gPrefs.getBoolPref("checkUpdateSecurity");
    }
    catch (e) { }
    gPrefs.addObserver("", this, false);
  },

  // nsIAddonCompatibilityService implementation
  getAddonForID: function(id) {
    var addon = new nttAddonDetail();
    addon.initWithDataSource(gEM.datasource, gRDF.GetResource(PREFIX_ITEM_URI + id), id);
    return addon;
  },

  confirmOverride: function(addons, count) {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
             getService(Ci.nsIWindowMediator);
    win = wm.getMostRecentWindow("Extension:Manager");
    if (win && win.top)
      win = win.top;

    var params = Cc["@mozilla.org/array;1"].
                 createInstance(Ci.nsIMutableArray);
    for (var i = 0; i < addons.length; i++)
      params.appendElement(addons[i], false);
    var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].
             getService(Ci.nsIWindowWatcher);
    ww.openWindow(win, "chrome://nightly/content/extensions/incompatible.xul", "",
                  "chrome,centerscreen,modal,dialog,titlebar", params);
    return true;
  },

  // nsIAddonInstallListener implementation
  onDownloadStarted: function(addon) {
  },

  onDownloadProgress: function(addon, value, maxValue) {
  },

  onDownloadEnded: function(addon) {
  },

  onInstallStarted: function(addon) {
    LOG("Install Started for " + addon.xpiURL);
    var ioServ = Cc["@mozilla.org/network/io-service;1"].
                 getService(Ci.nsIIOService);
    var fph = ioServ.getProtocolHandler("file")
                    .QueryInterface(Ci.nsIFileProtocolHandler);
    var file = fph.getFileFromURLSpec(addon.xpiURL);
    if (file.exists()) {
      try {
        var addon = new nttAddonDetail();
        addon.initWithXPI(file);
        if (addon.isValid()) {
          if (!addon.isCompatible(false)) {
            // Check if there are remote updates available
            var checker = new nttAddonUpdateChecker(addon);
            checker.checkForUpdates();
          }

          if (addon.needsOverride(false))
            this.confirmOverride([addon], 1);
          else
            LOG("Add-on is already compatible: '" + addon.updateRDF + "' " + addon.minAppVersion + "-" + addon.maxAppVersion);
        }
        else {
          WARN("Add-on seems to be invalid");
        }
        addon.cleanup();
      }
      catch (e) {
        ERROR("Exception during compatibility check " + e);
      }
    }
  },

  onCompatibilityCheckStarted: function(addon) {
  },

  onCompatibilityCheckEnded: function(addon, status) {
  },

  onInstallEnded: function(addon, status) {
  },

  onInstallsCompleted: function() {
  },

  // nsIObserver implementation
  observe: function(subject, topic, data) {
    switch (topic) {
      case "app-startup":
        var os = Cc["@mozilla.org/observer-service;1"].
                 getService(Ci.nsIObserverService);
        os.addObserver(this, "profile-after-change", false);
        os.addObserver(this, "quit-application", false);
        break;
      case "profile-after-change":
        this.init();
        break;
      case "quit-application":
        if (this.id)
          gEM.removeInstallListenerAt(this.id);
        gEM = null;
        gRDF = null;
        gApp = null;
        gVC = null;
        gPrefs.removeObserver("", this);
        gPrefs = null;
        break;
      case "nsPref:changed":
        switch (data) {
          case "checkCompatibility":
            try {
              gCheckCompatibility = gPrefs.getBoolPref(data);
            }
            catch (e) {
              gCheckCompatibility = true;
            }
            break;
          case "checkUpdateSecurity":
            try {
              gCheckUpdateSecurity = gPrefs.getBoolPref(data);
            }
            catch (e) {
              gCheckUpdateSecurity = true;
            }
            break;
        }
        break;
      default:
        WARN("Unknown event " + topic);
    }
  },

  classDescription: "Nightly Tester Install Monitor",
  contractID: "@oxymoronical.com/nightly/addoncompatibility;1",
  classID: Components.ID("{801207d5-037c-4565-80ed-ede8f7a7c100}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAddonInstallListener, Ci.nsIObserver]),
  _xpcom_categories: [{
    category: "app-startup",
    service: true
  }]
}

function NSGetModule(compMgr, fileSpec)
  XPCOMUtils.generateModule([nttAddonCompatibilityService]);
