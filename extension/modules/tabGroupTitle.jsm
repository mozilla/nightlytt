var EXPORTED_SYMBOLS = ["initTabGroup","getTabGroupTitle"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results; 

let obs = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService)
let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
let sstore = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);

let _privateBrowsing = {};
_privateBrowsing.transitionMode = "";

let initialized = false;

try { 
  log("don't forget to enable: nightly.logging" );
  Components.utils.import("resource://nightly/Logging.jsm");
}
catch(e) {log(e);}
  
function log(m){
  if (typeof(LOG) === "function") {
    LOG(m);
  } else {
    dump(m + '\n');
    Components.utils.reportError(m);
  }
}

/**
 * Waits for a browser window to finish loading before running the callback
 *
 * @usage runOnLoad(window, callback): Apply a callback to to run on a window when it loads.
 * @param [function] callback: 1-parameter function that gets a browser window.
 * @param [function] winType: a parameter that defines what kind of window is "browser window".
 */
function runOnLoad(window, callback, winType) {
  // Listen for one load event before checking the window type
  window.addEventListener("load", function() {
    window.removeEventListener("load", arguments.callee, false);

    // Now that the window has loaded, only handle browser windows
    if (window.document.documentElement.getAttribute("windowtype") == winType)
      callback(window);
  }, false);
}

/**
 * Add functionality to existing browser windows
 *
 * @usage runOnWindows(callback): Apply a callback to each open browser window.
 * @param [function] callback: 1-parameter function that gets a browser window.
 * @param [function] winType: a parameter that defines what kind of window is "browser window".
 */
function runOnWindows(callback, winType) {
  // Wrap the callback in a function that ignores failures
  function watcher(window) {
    try {
      callback(window);
    }
    catch(ex) {}
  }

  // Add functionality to existing windows
  let browserWindows = wm.getEnumerator(winType);
  while (browserWindows.hasMoreElements()) {
    // Only run the watcher immediately if the browser is completely loaded
    let browserWindow = browserWindows.getNext();
    if (browserWindow.document.readyState == "complete")
      watcher(browserWindow);
    // Wait for the window to load before continuing
    else
      runOnLoad(browserWindow, watcher, winType);
  }
}


/**
 * Runs title loader at startup.
 * Fires only once (due to unregistering)
 */
function wrObserver(aSubject, aTopic, aData) {
  if (aTopic == "sessionstore-windows-restored")
    obs.removeObserver(wrObserver, "sessionstore-windows-restored");
  else 
    return;

  log(aTopic);
  runOnWindows(loadAndUpdateGroupName, "navigator:browser");
}

/**
 * Manages Private Browsing transitions
 * and takes care about unregistering
 */
function pbObserver(aSubject, aTopic, aData) {
  if (aTopic == "private-browsing") {
    // We could probably do this in private-browsing-change-granted, but
    // this seems like a nicer spot, right in the middle of the process.
    if (aData == "enter") {
      //log("savestart: pb-enter");
      //runOnWindows(onPBEnter, "navigator:browser");
    }
  } else if (aTopic == "private-browsing-change-granted") {
    if (aData == "enter" || aData == "exit") {
      _privateBrowsing.transitionMode = aData;
    }
  } else if (aTopic == "private-browsing-transition-complete") {
    // We use .transitionMode here, as aData is empty.
    if (_privateBrowsing.transitionMode == "enter") {
      log("savestart: pb-enter-complete");
      //onPBEnter(wm.getMostRecentWindow("navigator:browser"));
    }
    else if (_privateBrowsing.transitionMode == "exit") {
      log("loadstart: pb-exit-complete");
      //onPBExit(wm.getMostRecentWindow("navigator:browser"));
    }
    _privateBrowsing.transitionMode = "";
  } else if (aTopic == "quit-application") {
    obs.removeObserver(pbObserver, "quit-application");
    obs.removeObserver(pbObserver, "private-browsing");
    obs.removeObserver(pbObserver, "private-browsing-change-granted");
    obs.removeObserver(pbObserver, "private-browsing-transition-complete");
    log("unregistered");
  } else {
    log("aTopic=" + aTopic + ", aData=" + aData);
  }
}

/**
 * Runs title loader 
 * and updates the titlebar if nightly is initialized
 * @param {nsIDOMWindow} win A window which contains nightly.
 */
function loadAndUpdateGroupName(win) {
  loadActiveGroupName(win);
  if (win.nightly.preferences) {
    win.nightly.updateTitlebar();
    log("updated: "+win.document.title);
  } else {
    log("update rerun: "+win.document.title);
    win.addEventListener("nightlytt-tabgrouptitle-initialized", function() {
      win.removeEventListener("nightlytt-tabgrouptitle-initialized", arguments.callee, false);
      log("update rerun catched!");
      loadAndUpdateGroupName(win);
    }, false);
  }
}

/**
 * Loads title on Private Browsing mode exit
 * if TabView isn't initialized
 * @param {nsIDOMWindow} win A window which contains nightly.
 */
function onPBExit(win) {
  let TabView = win.TabView;
  if (!TabView._window)
    loadAndUpdateGroupName(win);
}

/**
 * Saves and removes title on Private Browsing mode enter
 * if TabView isn't initialized
 * @param {nsIDOMWindow} win A window which contains nightly.
 */
function onPBEnter(win) {
  let nightlyApp = win.nightlyApp;
  let nightly = win.nightly;
  let TabView = win.TabView;
  if (!TabView._window) {
    saveActiveGroupName(win);
    nightlyApp._lastSessionGroupName = "";
    nightly.updateTitlebar();
  }
}

/**
 * Loads the active group's name for the given window 
 * @param {nsIDOMWindow} win A window where to load the value.
 */
function loadActiveGroupName(win) {
  let nightlyApp = win.nightlyApp;
  nightlyApp._lastSessionGroupName = getActiveGroupName(win);
}

function getActiveGroupName(win) {
  let data = "", groupTitle = "";
  try {
    data = sstore.getWindowValue(win, win.TabView.GROUPS_IDENTIFIER);
    if (data) {
      let parsedData = {};
      parsedData = JSON.parse(data);
      let activeGroupId = parsedData.activeGroupId;
      data = sstore.getWindowValue(win, "tabview-group");
      parsedData = JSON.parse(data);
      groupTitle = parsedData[activeGroupId].title;
      log("loaded title: " + groupTitle);
    }
  } catch (e) { log(e); }
  
  return groupTitle;
}

/** 
 * Saves the active group's name for the given window.
 * @param {nsIDOMWindow} win A window where to save the value.
 */
function saveActiveGroupName(win) {
  let nightlyApp = win.nightlyApp;
  let groupName = nightlyApp.tabGroupTitle;
  let verify = "";
  sstore.setWindowValue(
    win, 
    nightlyApp.LAST_SESSION_GROUP_NAME_IDENTIFIER, 
    groupName
  );
  
  verify = sstore.getWindowValue(
    win,
    nightlyApp.LAST_SESSION_GROUP_NAME_IDENTIFIER
  );
  
  log("saved: " + groupName + ", verify: "+ verify);
}

/**
 * How to take care about the (last used) group title
 *
 * In Gecko 1.x title is set to "Undefined" as in other Apps
 * Before FF10 title is managed by TabView
 * After that we manages the title: SessionStore to load and save, borrowed code to generate
 * @param {nsIDOMWindow} win A window which contains nightly.
 */
function initTabGroup(win) {
  
  if (typeof(win.TabView) === "undefined") {
    win.nightlyApp._lastSessionGroupName = null;
  } else if (win.TabView && typeof(win.TabView.getActiveGroupName) === "undefined") {
    if (!initialized) {
      //obs.addObserver(wrObserver, "sessionstore-windows-restored", false);

      //obs.addObserver(pbObserver, "quit-application", false);
      //obs.addObserver(pbObserver, "private-browsing", false);
      //obs.addObserver(pbObserver, "private-browsing-change-granted", false);
      //obs.addObserver(pbObserver, "private-browsing-transition-complete", false);
      
      initialized = true;
    }
    
    win.addEventListener("nightlytt-tabgrouptitle-initialized", function() {
      log("catched!");
    }, false);    

    /** 
     * Starting from FF7 we could easily save it to SessionStore
     * Note: there are workarounds (see Bug 655269) to save it before FF7 but we doesn't mind.
     *
     * Listening to Bug 659591 (landed in FF7) - instead "domwindowclosed", 
     * to store active group's name for showing at next startup
     */
    win.addEventListener("SSWindowClosing", function() {
      win.removeEventListener("SSWindowClosing", arguments.calle, false);
      log("SSWindowClosing");
      //saveActiveGroupName(win);
    }, false);
    
    
    // Notifying ourselves 
    let event = win.document.createEvent("Events");
    event.initEvent("nightlytt-tabgrouptitle-initialized", true, true);
    win.document.dispatchEvent(event);
    log("fired "+"nightlytt-tabgrouptitle-initialized");
  }
}

/**
 * Calculates Tab Group's title for nightlyApp
 * @param {nsIDOMWindow} win A window which contains nightly.
 */
function getTabGroupTitle(win) {
  let nightlyApp = win.nightlyApp;
  let TabView = win.TabView;
  
  // TabView isn't implemented
  if (typeof(TabView) === "undefined")
    return "";

  // If we are before Bug 682996, 
  // use TabView's own implementation except it is null
  if (typeof(TabView.getActiveGroupName) === "function")
    return TabView.getActiveGroupName() || "";

  // TabView isn't initialized
  if (!TabView._window) {
    return getActiveGroupName(win);
  }

  // We get the active group this way, instead of querying
  // GroupItems.getActiveGroupItem() because the tabSelect event
  // will not have happened by the time the browser tries to
  // update the title.
  let groupItem = null;
  let activeTab = win.gBrowser.selectedTab;
  let activeTabItem = activeTab._tabViewTabItem;

  if (activeTab.pinned) {
    // It's an app tab, so it won't have a .tabItem. However, its .parent
    // will already be set as the active group. 
    groupItem = TabView._window.GroupItems.getActiveGroupItem();
  } else if (activeTabItem) {
    groupItem = activeTabItem.parent;
  }

  // groupItem may still be null, if the active tab is an orphan.
  return groupItem ? groupItem.getTitle() : "";
}
