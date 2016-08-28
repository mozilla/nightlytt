var EXPORTED_SYMBOLS = ["dlg", "dlsg"];

Components.utils.import("resource://nightly/XPCOMUtils.jsm");

var dlg = XPCOMUtils.defineLazyGetter;
var dlsg = XPCOMUtils.defineLazyServiceGetter.bind(XPCOMUtils);
