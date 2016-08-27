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

var ImageShack = {
  addFormFields: function(formdata)
  {
    formdata.addControl("uploadtype", "on");
    formdata.addControl("url", "paste image url here");
    formdata.addControl("MAX_FILE_SIZE", "3145728");
    formdata.addControl("refer", "");
    formdata.addControl("brand", "");
    formdata.addControl("optsize", "320x320");
  },

  getFileFormField: function()
  {
    return "fileupload";
  },

  getReferer: function()
  {
    return "http://imageshack.us/";
  },

  getSubmissionURL: function()
  {
    return "http://imageshack.us/";
  }
}

Providers.addProvider(ImageShack);
