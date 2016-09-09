/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Code borrowed from crash me now (simple) extension:
 *   https://addons.mozilla.org/addon/crash-me-now-simple/ */

Components.utils.import("resource://gre/modules/ctypes.jsm");


var crashme = {
  CHROME: 'chrome',
  CONTENT: 'content',

  onMenuItemCommand: function(event, how=this.CHROME) {
    switch(how) {
      case(this.CHROME):
        this.crash();
        break;
      case(this.CONTENT):
        this.crash_content()
    }
  },

  crash: function() {
    // ctypes checks for NULL pointer derefs, so just go near-NULL.
    var zero = new ctypes.intptr_t(8);
    var badptr = ctypes.cast(zero, ctypes.PointerType(ctypes.int32_t));
    var crash = badptr.contents;
  },

  crash_content: function() {
    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
             getService(Ci.nsIWindowMediator);
    let win = wm.getMostRecentWindow("navigator:browser");
    let browser = win.gBrowser.selectedBrowser;
    if (browser.isRemoteBrowser) {
      browser.messageManager.loadFrameScript("chrome://nightly/content/crashmeContent.js", true);
    } else {
      // Could try harder and force-load an e10s window or something.
    }
  },
};
