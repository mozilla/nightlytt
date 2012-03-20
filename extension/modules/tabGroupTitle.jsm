var EXPORTED_SYMBOLS = ["getTabGroupTitle"];

const Cc = Components.classes;
const Ci = Components.interfaces;

const GROUP_DATA_IDENTIFIER = "tabview-group";

let sstore = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);


/**
 * Simply retrieves the active tabgroup's title from sessionStore
 */
function getActiveGroupName(win) {
  let data = "", groupTitle = "";
  try {
    data = sstore.getWindowValue(win, win.TabView.GROUPS_IDENTIFIER);
    if (data) {
      let parsedData = {};
      parsedData = JSON.parse(data);
      let activeGroupId = parsedData.activeGroupId;
      data = sstore.getWindowValue(win, GROUP_DATA_IDENTIFIER);
      parsedData = JSON.parse(data);
      groupTitle = parsedData[activeGroupId].title;
    }
  } catch (e) { }
  
  return groupTitle;
}

/**
 * Calculates Tab Group's title for nightlyApp
 * @param {nsIDOMWindow} win A window which contains nightly.
 *
 * In Gecko 1.x title is set to "Undefined" as in other Apps
 * Before FF10 title is managed by TabView
 * After that we manages the title: SessionStore to load and save, borrowed code to generate
 */
function getTabGroupTitle(win) {
  let nightlyApp = win.nightlyApp;
  let TabView = win.TabView;
  
  // TabView isn't implemented
  if (!("TabView" in win))
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
