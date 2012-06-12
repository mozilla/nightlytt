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

const ourAddonID = "{8620c15f-30dc-4dba-a131-7c5d20cf4a29}";


function init() {
  var has_EM = "@mozilla.org/extensions/manager;1" in Components.classes;
  if (has_EM) {
    extensionLoader();
  } else {
    addonLoader();
  }
}

function fillContributorsCB(addon) {
  appendToList("about", "about", [ addon.creator ], "label");
  appendToList("contributors", "contributorsList", addon.contributors, "li");
}

function addonLoader() {
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
  AddonManager.getAddonByID(ourAddonID, function(addon) {
    fillContributorsCB(addon);
  });
}

function extensionLoader() {
  function EM_NS(aProperty)
  {
    return "http://www.mozilla.org/2004/em-rdf#" + aProperty;
  }

  var em = Cc['@mozilla.org/extensions/manager;1']
    .getService(Ci.nsIExtensionManager);
  var rdfs = Cc["@mozilla.org/rdf/rdf-service;1"]
    .getService(Ci.nsIRDFService);
  var ds = em.datasource;
  var extension = rdfs.GetResource("urn:mozilla:item:" + ourAddonID);

  var addon = {};

  var arc = rdfs.GetResource(EM_NS("homepageURL"));
  addon.creator = {};
  var homepage = ds.GetTarget(extension, arc, true);
  if (homepage)
    addon.creator.url = homepage.QueryInterface(Ci.nsIRDFLiteral).Value;

  arc = rdfs.GetResource(EM_NS("creator"));
  var creator = ds.GetTarget(extension, arc, true);
  if (creator)
    addon.creator.name = creator.QueryInterface(Ci.nsIRDFLiteral).Value;

  arc = rdfs.GetResource(EM_NS("contributor"));
  var contributors = ds.GetTargets(extension, arc, true);
  if (contributors.hasMoreElements()) {
    addon.contributors = [];
    while (contributors.hasMoreElements()) {
      var contributor = {};
      contributor.name = contributors.getNext().QueryInterface(Ci.nsIRDFLiteral).Value;
      addon.contributors.push(contributor);
    }
  }

  fillContributorsCB(addon);
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
 