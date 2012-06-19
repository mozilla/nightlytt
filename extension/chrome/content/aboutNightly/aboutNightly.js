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
 *     Szabolcs Hubai <szab.hu@gmail.com>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2012
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Robert Strong <robert.bugzilla@gmail.com>
 *   Blair McBride <bmcbride@mozilla.com>
 *   Marcos Santiago <littledodgeviper@sbcglobal.net>
 *   Jimmy Phan <jphan9@gmail.com>
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

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

const ADDON_ID = "{8620c15f-30dc-4dba-a131-7c5d20cf4a29}";


function init() {
  window.removeEventListener("load", init, false);

  var manager = null;
  try {
    var { AddonManager: manager } = Cu.import("resource://gre/modules/AddonManager.jsm");
  } catch (e) {
    var manager = ExtensionManager;
  }

  if (manager) {
    manager.getAddonByID(ADDON_ID, fillContributorsCallback);
  } else {
    throw Components.Exception("no usable Manager found",
                               Cr.NS_ERROR_NOT_IMPLEMENTED);
  }
}

function fillContributorsCallback(aAddon) {
  appendToList("about", "about", [ aAddon.creator ], "label");
  appendToList("contributors", "contributorsList", aAddon.contributors, "li");
}

var ExtensionManager = {
  getAddonByID: function (aID, aCallback) {
    if (!aID || typeof aID != "string")
      throw Components.Exception("aID must be a non-empty string",
                                 Cr.NS_ERROR_INVALID_ARG);

    if (typeof aCallback != "function")
      throw Components.Exception("aCallback must be a function",
                                 Cr.NS_ERROR_INVALID_ARG);

    function EM_NS(aProperty)
    {
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
    if (creator)
      addon.creator.name = creator.QueryInterface(Ci.nsIRDFLiteral).Value;

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

  if (!aItems || aItems.length == 0) {
    header.hidden = true;
    return 0;
  }

  aItems.forEach(function (currentItem) {
    var url = currentItem.url;
    var listElem = document.createElement(aEType);
    var textContainer = listElem;
    if (url) {
      textContainer = document.createElement("a");
      listElem.appendChild(textContainer);
      textContainer.href = url;
    }
    textContainer.textContent = currentItem.name;
    node.appendChild(listElem);
  });

  return aItems.length;
}


window.addEventListener("load", init, false);
