/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

const ADDON_ID = "{8620c15f-30dc-4dba-a131-7c5d20cf4a29}";


function init() {
  window.removeEventListener("load", init, false);

  try {
    var { AddonManager: manager } = Cu.import("resource://gre/modules/AddonManager.jsm");
  } catch (e) {
    var manager = ExtensionManager;
  }

  manager.getAddonByID(ADDON_ID, fillContributorsCallback);
}

function fillContributorsCallback(aAddon) {
  appendToList("about", "about", [ aAddon.creator ], "label");
  appendToList("contributors", "contributorsList", aAddon.contributors, "li");
}

var ExtensionManager = {
  getAddonByID: function (aID, aCallback) {
    if (!aID || typeof aID !== "string") {
      throw Components.Exception("aID must be a non-empty string",
                                 Cr.NS_ERROR_INVALID_ARG);
    }

    if (typeof aCallback !== "function") {
      throw Components.Exception("aCallback must be a function",
                                 Cr.NS_ERROR_INVALID_ARG);
    }

    function EM_NS(aProperty) {
      return "http://www.mozilla.org/2004/em-rdf#" + aProperty;
    }

    var em = Cc['@mozilla.org/extensions/manager;1']
             .getService(Ci.nsIExtensionManager);
    var rdfs = Cc["@mozilla.org/rdf/rdf-service;1"]
               .getService(Ci.nsIRDFService);
    var ds = em.datasource;
    var extension = rdfs.GetResource("urn:mozilla:item:" + aID);

    var addon = { creator: {}, contributors: [] };

    arc = rdfs.GetResource(EM_NS("creator"));
    var creator = ds.GetTarget(extension, arc, true);
    if (creator) {
      addon.creator.name = creator.QueryInterface(Ci.nsIRDFLiteral).Value;
    }

    arc = rdfs.GetResource(EM_NS("contributor"));
    var contributors = ds.GetTargets(extension, arc, true);
    if (contributors.hasMoreElements()) {
      while (contributors.hasMoreElements()) {
        addon.contributors.push({
          name: contributors.getNext().QueryInterface(Ci.nsIRDFLiteral).Value
        });
      }
    }

    aCallback(addon);
  }
}

function appendToList(aHeaderId, aNodeId, aItems, aEType) {
  var header = document.getElementById(aHeaderId);
  var node = document.getElementById(aNodeId);

  if (!aItems || aItems.length === 0) {
    header.hidden = true;
    return 0;
  }

  aItems.forEach(function (aCurrentItem) {
    var url = aCurrentItem.url;
    var listElem = document.createElement(aEType);
    var textContainer = listElem;
    if (url) {
      textContainer = document.createElement("a");
      listElem.appendChild(textContainer);
      textContainer.href = url;
    }
    textContainer.textContent = aCurrentItem.name;
    node.appendChild(listElem);
  });

  return aItems.length;
}


window.addEventListener("load", init, false);
