/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Code borrowed from crash me now (simple) extension:
 *   https://addons.mozilla.org/addon/crash-me-now-simple/ */

// Just a sanity check
let appInfo = Components.classes["@mozilla.org/xre/app-info;1"];
if (appInfo && appInfo.getService(Components.interfaces.nsIXULRuntime)
    .processType != Components.interfaces.nsIXULRuntime.PROCESS_TYPE_DEFAULT) {
  Components.utils.import("resource://gre/modules/ctypes.jsm");
  var zero = new ctypes.intptr_t(8);
  var badptr = ctypes.cast(zero, ctypes.PointerType(ctypes.int32_t));
  var crash = badptr.contents;
}
