/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Providers = {
  _providers: [],
  _selected: null,
  
  addProvider: function(provider)
  {
    this._providers.push(provider);
    if (this._selected == null)
      this._selected = provider;
  },
  
  selectProvider: function(provider)
  {
    this._selected = provider;
  },
  
  getSelectedProvider: function()
  {
    return this._selected;
  },
  
  getProviders: function()
  {
    return this._providers;
  }
}

var PostimageDotOrg = {
  addFormFields: function(formdata)
  {
    formdata.addControl("mode", "local");
    formdata.addControl("um", "image");
    formdata.addControl("mode", "local");
    formdata.addControl("forumurl", "http://postimage.org");
    //formdata.addControl("MAX_FILE_SIZE", 10*1024*1024);
    //formdata.addControl("hash", 671);
  },
  
  getFileFormField: function()
  {
    return "upload[]";
  },
  
  getReferer: function()
  {
    return "http://postimage.org";
  },
  
  getSubmissionURL: function()
  {
    return "http://postimage.org";
  }
}

Providers.addProvider(PostimageDotOrg);
