/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cr = Components.results;


function NTT_MakeStream(data)
{
  var stream = Cc["@mozilla.org/io/string-input-stream;1"]
                 .createInstance(Ci.nsIStringInputStream);
  stream.setData(data, data.length);
  return stream;
}

const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function NTT_decode64(input)
{
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  do
  {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 != 64)
    {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64)
    {
      output = output + String.fromCharCode(chr3);
    }
  }
  while (i < input.length);

  return output;
}

function MultipartFormData()
{
  this.boundary = "hsdluicmwos";
  this.controls = [];
  this.files = [];
  this.postdata = "";
}

MultipartFormData.prototype = {

boundary: null,
controls: null,
files: null,
length: null,
postdata: null,

getPostData: function()
{
  if (this.postdata)
    return this.postdata;

  var data = "";

  for (var name in this.controls)
  {
    data+="\r\n--"+this.boundary+"\r\n";
    data+="Content-Disposition: form-data; name=\""+name+"\"\r\n\r\n";
    data+=this.controls[name];
  }

  for (var name in this.files)
  {
    var filedata = this.files[name];
    data+="\r\n--"+this.boundary+"\r\n";
    data+="Content-Disposition: form-data; name=\""+name+"\"; filename=\""+filedata.filename+"\"\r\n";
    data+="Content-Type: "+filedata.contenttype+"\r\n";
    if (filedata.source)
    {
      data+="Content-Transfer-Encoding: base64\r\n\r\n";

      var fis = Cc["@mozilla.org/network/file-input-stream;1"]
                  .createInstance(Ci.nsIFileInputStream);
      fis.init(filedata.source, 1, 384, Ci.nsIFileInputStream.CLOSE_ON_EOF);

      var bis = Cc["@mozilla.org/binaryinputstream;1"]
                  .createInstance(Ci.nsIBinaryInputStream);
      bis.setInputStream(fis);

      // TODO this isnt needed as yet
    }
    else
    {
      data+="Content-Transfer-Encoding: binary\r\n\r\n";
      if (filedata.encoding == "base64")
      {
        data+=NTT_decode64(filedata.data);
      }
      else if (filedata.encoding == "binary")
      {
        data+=filedata.data;
      }
    }
  }
  data+="\r\n--"+this.boundary+"--\r\n";

  this.length = data.length-2;
  this.postdata = data;

  return data;
},

getPostDataStream: function()
{
  return NTT_MakeStream(this.getPostData());
},

getHeaders: function()
{
  if (!this.length)
    this.getPostData();

  var headers = "";
  headers+="Content-Type: "+this.getContentType()+"\r\n";
  headers+="Content-Length: "+this.length+"\r\n";
  return headers;
},

getHeaderStream: function()
{
  return NTT_MakeStream(this.getHeaders());
},

getContentType: function()
{
  return "multipart/form-data; boundary=\""+this.boundary+"\"";
},

addControl: function(name, value)
{
  this.controls[name]=value;
  this.postdata = null;
  this.length = null;
},

addFile: function(name, contenttype, file)
{
  throw Components.results.NS_NOT_IMPLEMENTED;
  var filedata = {
    filename: file.leafName,
    contenttype: contenttype,
    source: file
  };
  this.files[name] = filedata;
  this.postdata = null;
  this.length = null;
},

addFileData: function(name, filename, contenttype, encoding, data)
{
  var filedata = {
    filename: filename,
    contenttype: contenttype,
    encoding: encoding,
    data: data
  };
  this.files[name] = filedata;
  this.postdata = null;
  this.length = null;
},
}