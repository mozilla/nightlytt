/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

/*
Called when the item has been removed.
We'll just log success here.
*/
function onRemoved() {
  console.log("Item removed successfully");
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

function buildInfoIntoClipboard() {
  return browser.runtime.getBrowserInfo().then(function (info) {
    browser.runtime.getBackgroundPage().then(function (page) {
      // TODO: Add changeset id
      console.log(page.navigator.userAgent + " ID:" + info.buildID);
    });
  });
}

/*
Create all the context menu items.
*/
browser.contextMenus.create({
  id: "copy-build-info",
  title: browser.i18n.getMessage("copyBuildInfo"),
  contexts: ["all"]
}, onCreated);

browser.contextMenus.create({
  id: "insert-build-info",
  title: browser.i18n.getMessage("insertBuildInfo"),
  contexts: ["all"]
}, onCreated);

/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/
browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "copy-build-info":
      buildInfoIntoClipboard();
      break;
    case "insert-build-info":
      buildInfoIntoClipboard();
      break;
  }
});