/**
 * @license
 * Link.JS Game Engine - v0.0.1
 * Copyright (c) 2013, Vsevolod Strukchinsky
 * hhttps://github.com/floatdrop/link.js
 *
 * Compiled: 2013-05-14
 *
 * Link.JS Game Engine is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
( // Module boilerplate to support browser globals and browserify and AMD.
  typeof define === "function" ? function (m) { define("msgpack-js", m); } :
  typeof exports === "object" ? function (m) { module.exports = m(); } :
  function(m){ this.msgpack = m(); }
)(function () {
"use strict";

var exports = {};

exports.inspect = inspect;
function inspect(buffer) {
  if (buffer === undefined) return "undefined";
  var view;
  var type;
  if (buffer instanceof ArrayBuffer) {
    type = "ArrayBuffer";
    view = new DataView(buffer);
  }
  else if (buffer instanceof DataView) {
    type = "DataView";
    view = buffer;
  }
  if (!view) return JSON.stringify(buffer);
  var bytes = [];
  for (var i = 0; i < buffer.byteLength; i++) {
    if (i > 20) {
      bytes.push("...");
      break;
    }
    var byte = view.getUint8(i).toString(16);
    if (byte.length === 1) byte = "0" + byte;
    bytes.push(byte);
  }
  return "<" + type + " " + bytes.join(" ") + ">";
}

// Encode string as utf8 into dataview at offset
exports.utf8Write = utf8Write;
function utf8Write(view, offset, string) {
  var byteLength = view.byteLength;
  for(var i = 0, l = string.length; i < l; i++) {
    var codePoint = string.charCodeAt(i);

    // One byte of UTF-8
    if (codePoint < 0x80) {
      view.setUint8(offset++, codePoint >>> 0 & 0x7f | 0x00);
      continue;
    }

    // Two bytes of UTF-8
    if (codePoint < 0x800) {
      view.setUint8(offset++, codePoint >>> 6 & 0x1f | 0xc0);
      view.setUint8(offset++, codePoint >>> 0 & 0x3f | 0x80);
      continue;
    }

    // Three bytes of UTF-8.  
    if (codePoint < 0x10000) {
      view.setUint8(offset++, codePoint >>> 12 & 0x0f | 0xe0);
      view.setUint8(offset++, codePoint >>> 6  & 0x3f | 0x80);
      view.setUint8(offset++, codePoint >>> 0  & 0x3f | 0x80);
      continue;
    }

    // Four bytes of UTF-8
    if (codePoint < 0x110000) {
      view.setUint8(offset++, codePoint >>> 18 & 0x07 | 0xf0);
      view.setUint8(offset++, codePoint >>> 12 & 0x3f | 0x80);
      view.setUint8(offset++, codePoint >>> 6  & 0x3f | 0x80);
      view.setUint8(offset++, codePoint >>> 0  & 0x3f | 0x80);
      continue;
    }
    throw new Error("bad codepoint " + codePoint);
  }
}

exports.utf8Read = utf8Read;
function utf8Read(view, offset, length) {
  var string = "";
  for (var i = offset, end = offset + length; i < end; i++) {
    var byte = view.getUint8(i);
    // One byte character
    if ((byte & 0x80) === 0x00) {
      string += String.fromCharCode(byte);
      continue;
    }
    // Two byte character
    if ((byte & 0xe0) === 0xc0) {
      string += String.fromCharCode(
        ((byte & 0x0f) << 6) | 
        (view.getUint8(++i) & 0x3f)
      );
      continue;
    }
    // Three byte character
    if ((byte & 0xf0) === 0xe0) {
      string += String.fromCharCode(
        ((byte & 0x0f) << 12) |
        ((view.getUint8(++i) & 0x3f) << 6) |
        ((view.getUint8(++i) & 0x3f) << 0)
      );
      continue;
    }
    // Four byte character
    if ((byte & 0xf8) === 0xf0) {
      string += String.fromCharCode(
        ((byte & 0x07) << 18) |
        ((view.getUint8(++i) & 0x3f) << 12) |
        ((view.getUint8(++i) & 0x3f) << 6) |
        ((view.getUint8(++i) & 0x3f) << 0)
      );
      continue;
    }
    throw new Error("Invalid byte " + byte.toString(16));
  }
  return string;
}

exports.utf8ByteCount = utf8ByteCount;
function utf8ByteCount(string) {
  var count = 0;
  for(var i = 0, l = string.length; i < l; i++) {
    var codePoint = string.charCodeAt(i);
    if (codePoint < 0x80) {
      count += 1;
      continue;
    }
    if (codePoint < 0x800) {
      count += 2;
      continue;
    }
    if (codePoint < 0x10000) {
      count += 3;
      continue;
    }
    if (codePoint < 0x110000) {
      count += 4;
      continue;
    }
    throw new Error("bad codepoint " + codePoint);
  }
  return count;
}

exports.encode = function (value) {
  var buffer = new ArrayBuffer(sizeof(value));
  var view = new DataView(buffer);
  encode(value, view, 0);
  return buffer;
}

exports.decode = decode;

// http://wiki.msgpack.org/display/MSGPACK/Format+specification
// I've extended the protocol to have two new types that were previously reserved.
//   buffer 16  11011000  0xd8
//   buffer 32  11011001  0xd9
// These work just like raw16 and raw32 except they are node buffers instead of strings.
//
// Also I've added a type for `undefined`
//   undefined  11000100  0xc4

function Decoder(view, offset) {
  this.offset = offset || 0;
  this.view = view;
}
Decoder.prototype.map = function (length) {
  var value = {};
  for (var i = 0; i < length; i++) {
    var key = this.parse();
    value[key] = this.parse();
  }
  return value;
};
Decoder.prototype.buf = function (length) {
  var value = new ArrayBuffer(length);
  (new Uint8Array(value)).set(new Uint8Array(this.view.buffer, this.offset, length), 0);
  this.offset += length;
  return value;
};
Decoder.prototype.raw = function (length) {
  var value = utf8Read(this.view, this.offset, length);
  this.offset += length;
  return value;
};
Decoder.prototype.array = function (length) {
  var value = new Array(length);
  for (var i = 0; i < length; i++) {
    value[i] = this.parse();
  }
  return value;
};
Decoder.prototype.parse = function () {
  var type = this.view.getUint8(this.offset);
  var value, length;
  // FixRaw
  if ((type & 0xe0) === 0xa0) {
    length = type & 0x1f;
    this.offset++;
    return this.raw(length);
  }
  // FixMap
  if ((type & 0xf0) === 0x80) {
    length = type & 0x0f;
    this.offset++;
    return this.map(length);
  }
  // FixArray
  if ((type & 0xf0) === 0x90) {
    length = type & 0x0f;
    this.offset++;
    return this.array(length);
  }
  // Positive FixNum
  if ((type & 0x80) === 0x00) {
    this.offset++;
    return type;
  }
  // Negative Fixnum
  if ((type & 0xe0) === 0xe0) {
    value = this.view.getInt8(this.offset);
    this.offset++;
    return value;
  }
  switch (type) {
  // raw 16
  case 0xda:
    length = this.view.getUint16(this.offset + 1);
    this.offset += 3;
    return this.raw(length);
  // raw 32
  case 0xdb:
    length = this.view.getUint32(this.offset + 1);
    this.offset += 5;
    return this.raw(length);
  // nil
  case 0xc0:
    this.offset++;
    return null;
  // false
  case 0xc2:
    this.offset++;
    return false;
  // true
  case 0xc3:
    this.offset++;
    return true;
  // undefined
  case 0xc4:
    this.offset++;
    return undefined;
  // uint8
  case 0xcc:
    value = this.view.getUint8(this.offset + 1);
    this.offset += 2;
    return value;
  // uint 16
  case 0xcd:
    value = this.view.getUint16(this.offset + 1);
    this.offset += 3;
    return value;
  // uint 32
  case 0xce:
    value = this.view.getUint32(this.offset + 1);
    this.offset += 5;
    return value;
  // int 8
  case 0xd0:
    value = this.view.getInt8(this.offset + 1);
    this.offset += 2;
    return value;
  // int 16
  case 0xd1:
    value = this.view.getInt16(this.offset + 1);
    this.offset += 3;
    return value;
  // int 32
  case 0xd2:
    value = this.view.getInt32(this.offset + 1);
    this.offset += 5;
    return value;
  // map 16
  case 0xde:
    length = this.view.getUint16(this.offset + 1);
    this.offset += 3;
    return this.map(length);
  // map 32
  case 0xdf:
    length = this.view.getUint32(this.offset + 1);
    this.offset += 5;
    return this.map(length);
  // array 16
  case 0xdc:
    length = this.view.getUint16(this.offset + 1);
    this.offset += 3;
    return this.array(length);
  // array 32
  case 0xdd:
    length = this.view.getUint32(this.offset + 1);
    this.offset += 5;
    return this.array(length);
  // buffer 16
  case 0xd8:
    length = this.view.getUint16(this.offset + 1);
    this.offset += 3;
    return this.buf(length);
  // buffer 32
  case 0xd9:
    length = this.view.getUint32(this.offset + 1);
    this.offset += 5;
    return this.buf(length);
  // float
  case 0xca:
    value = this.view.getFloat32(this.offset + 1);
    this.offset += 5;
    return value;
  // double
  case 0xcb:
    value = this.view.getFloat64(this.offset + 1);
    this.offset += 9;
    return value;
  }
  throw new Error("Unknown type 0x" + type.toString(16));
};
function decode(buffer) {
  var view = new DataView(buffer);
  var decoder = new Decoder(view);
  var value = decoder.parse();
  if (decoder.offset !== buffer.byteLength) throw new Error((buffer.byteLength - decoder.offset) + " trailing bytes");
  return value;
}

function encode(value, view, offset) {
  var type = typeof value;

  // Strings Bytes
  if (type === "string") {
    var length = utf8ByteCount(value);
    // fix raw
    if (length < 0x20) {
      view.setUint8(offset, length | 0xa0);
      utf8Write(view, offset + 1, value);
      return 1 + length;
    }
    // raw 16
    if (length < 0x10000) {
      view.setUint8(offset, 0xda);
      view.setUint16(offset + 1, length);
      utf8Write(view, offset + 3, value);
      return 3 + length;
    }
    // raw 32
    if (length < 0x100000000) {
      view.setUint8(offset, 0xdb);
      view.setUint32(offset + 1, length);
      utf8Write(view, offset + 5, value);
      return 5 + length;
    }
  }

  if (value instanceof ArrayBuffer) {
    var length = value.byteLength;
    // buffer 16
    if (length < 0x10000) {
      view.setUint8(offset, 0xd8);
      view.setUint16(offset + 1, length);
      (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 3);
      return 3 + length;
    }
    // buffer 32
    if (length < 0x100000000) {
      view.setUint8(offset, 0xd9);
      view.setUint32(offset + 1, length);
      (new Uint8Array(view.buffer)).set(new Uint8Array(value), offset + 5);
      return 5 + length;
    }
  }
  
  if (type === "number") {
    // Floating Point
    if ((value << 0) !== value) {
      view.setUint8(offset, 0xcb);
      view.setFloat64(offset + 1, value);
      return 9;
    }

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) {
        view.setUint8(offset, value);
        return 1;
      }
      // uint 8
      if (value < 0x100) {
        view.setUint8(offset, 0xcc);
        view.setUint8(offset + 1, value);
        return 2;
      }
      // uint 16
      if (value < 0x10000) {
        view.setUint8(offset, 0xcd);
        view.setUint16(offset + 1, value);
        return 3;
      }
      // uint 32
      if (value < 0x100000000) {
        view.setUint8(offset, 0xce);
        view.setUint32(offset + 1, value);
        return 5;
      }
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) {
      view.setInt8(offset, value);
      return 1;
    }
    // int 8
    if (value >= -0x80) {
      view.setUint8(offset, 0xd0);
      view.setInt8(offset + 1, value);
      return 2;
    }
    // int 16
    if (value >= -0x8000) {
      view.setUint8(offset, 0xd1);
      view.setInt16(offset + 1, value);
      return 3;
    }
    // int 32
    if (value >= -0x80000000) {
      view.setUint8(offset, 0xd2);
      view.setInt32(offset + 1, value);
      return 5;
    }
    throw new Error("Number too small -0x" + (-value).toString(16).substr(1));
  }
  
  // undefined
  if (type === "undefined") {
    view.setUint8(offset, 0xc4);
    return 1;
  }
  
  // null
  if (value === null) {
    view.setUint8(offset, 0xc0);
    return 1;
  }

  // Boolean
  if (type === "boolean") {
    view.setUint8(offset, value ? 0xc3 : 0xc2);
    return 1;
  }
  
  // Container Types
  if (type === "object") {
    var length, size = 0;
    var isArray = Array.isArray(value);

    if (isArray) {
      length = value.length;
    }
    else {
      var keys = Object.keys(value);
      length = keys.length;
    }

    var size;
    if (length < 0x10) {
      view.setUint8(offset, length | (isArray ? 0x90 : 0x80));
      size = 1;
    }
    else if (length < 0x10000) {
      view.setUint8(offset, isArray ? 0xdc : 0xde);
      view.setUint16(offset + 1, length);
      size = 3;
    }
    else if (length < 0x100000000) {
      view.setUint8(offset, isArray ? 0xdd : 0xdf);
      view.setUint32(offset + 1, length);
      size = 5;
    }

    if (isArray) {
      for (var i = 0; i < length; i++) {
        size += encode(value[i], view, offset + size);
      }
    }
    else {
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += encode(key, view, offset + size);
        size += encode(value[key], view, offset + size);
      }
    }
    
    return size;
  }
  throw new Error("Unknown type " + type);
}

function sizeof(value) {
  var type = typeof value;

  // Raw Bytes
  if (type === "string") {
    var length = utf8ByteCount(value);
    if (length < 0x20) {
      return 1 + length;
    }
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }
  
  if (value instanceof ArrayBuffer) {
    var length = value.byteLength;
    if (length < 0x10000) {
      return 3 + length;
    }
    if (length < 0x100000000) {
      return 5 + length;
    }
  }
  
  if (type === "number") {
    // Floating Point
    // double
    if (value << 0 !== value) return 9;

    // Integers
    if (value >=0) {
      // positive fixnum
      if (value < 0x80) return 1;
      // uint 8
      if (value < 0x100) return 2;
      // uint 16
      if (value < 0x10000) return 3;
      // uint 32
      if (value < 0x100000000) return 5;
      // uint 64
      if (value < 0x10000000000000000) return 9;
      throw new Error("Number too big 0x" + value.toString(16));
    }
    // negative fixnum
    if (value >= -0x20) return 1;
    // int 8
    if (value >= -0x80) return 2;
    // int 16
    if (value >= -0x8000) return 3;
    // int 32
    if (value >= -0x80000000) return 5;
    // int 64
    if (value >= -0x8000000000000000) return 9;
    throw new Error("Number too small -0x" + value.toString(16).substr(1));
  }
  
  // Boolean, null, undefined
  if (type === "boolean" || type === "undefined" || value === null) return 1;
  
  // Container Types
  if (type === "object") {
    var length, size = 0;
    if (Array.isArray(value)) {
      length = value.length;
      for (var i = 0; i < length; i++) {
        size += sizeof(value[i]);
      }
    }
    else {
      var keys = Object.keys(value);
      length = keys.length;
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        size += sizeof(key) + sizeof(value[key]);
      }
    }
    if (length < 0x10) {
      return 1 + size;
    }
    if (length < 0x10000) {
      return 3 + size;
    }
    if (length < 0x100000000) {
      return 5 + size;
    }
    throw new Error("Array or object too long 0x" + length.toString(16));
  }
  throw new Error("Unknown type " + type);
}

return exports;

});
(function(o){"function"==typeof define?define(o):"function"==typeof YUI?YUI.add("es5",o):o()})(function(){function o(){}function v(a){a=+a;a!==a?a=0:0!==a&&(a!==1/0&&a!==-(1/0))&&(a=(0<a||-1)*Math.floor(Math.abs(a)));return a}function s(a){var b=typeof a;return null===a||"undefined"===b||"boolean"===b||"number"===b||"string"===b}Function.prototype.bind||(Function.prototype.bind=function(a){var b=this;if("function"!=typeof b)throw new TypeError("Function.prototype.bind called on incompatible "+b);
var d=q.call(arguments,1),c=function(){if(this instanceof c){var e=b.apply(this,d.concat(q.call(arguments)));return Object(e)===e?e:this}return b.apply(a,d.concat(q.call(arguments)))};b.prototype&&(o.prototype=b.prototype,c.prototype=new o,o.prototype=null);return c});var k=Function.prototype.call,p=Object.prototype,q=Array.prototype.slice,h=k.bind(p.toString),t=k.bind(p.hasOwnProperty);t(p,"__defineGetter__")&&(k.bind(p.__defineGetter__),k.bind(p.__defineSetter__),k.bind(p.__lookupGetter__),k.bind(p.__lookupSetter__));
if(2!=[1,2].splice(0).length){var y=Array.prototype.splice;Array.prototype.splice=function(a,b){return arguments.length?y.apply(this,[a===void 0?0:a,b===void 0?this.length-a:b].concat(q.call(arguments,2))):[]}}if(1!=[].unshift(0)){var z=Array.prototype.unshift;Array.prototype.unshift=function(){z.apply(this,arguments);return this.length}}Array.isArray||(Array.isArray=function(a){return h(a)=="[object Array]"});var k=Object("a"),l="a"!=k[0]||!(0 in k);Array.prototype.forEach||(Array.prototype.forEach=
function(a,b){var d=n(this),c=l&&h(this)=="[object String]"?this.split(""):d,e=-1,f=c.length>>>0;if(h(a)!="[object Function]")throw new TypeError;for(;++e<f;)e in c&&a.call(b,c[e],e,d)});Array.prototype.map||(Array.prototype.map=function(a,b){var d=n(this),c=l&&h(this)=="[object String]"?this.split(""):d,e=c.length>>>0,f=Array(e);if(h(a)!="[object Function]")throw new TypeError(a+" is not a function");for(var g=0;g<e;g++)g in c&&(f[g]=a.call(b,c[g],g,d));return f});Array.prototype.filter||(Array.prototype.filter=
function(a,b){var d=n(this),c=l&&h(this)=="[object String]"?this.split(""):d,e=c.length>>>0,f=[],g;if(h(a)!="[object Function]")throw new TypeError(a+" is not a function");for(var i=0;i<e;i++)if(i in c){g=c[i];a.call(b,g,i,d)&&f.push(g)}return f});Array.prototype.every||(Array.prototype.every=function(a,b){var d=n(this),c=l&&h(this)=="[object String]"?this.split(""):d,e=c.length>>>0;if(h(a)!="[object Function]")throw new TypeError(a+" is not a function");for(var f=0;f<e;f++)if(f in c&&!a.call(b,c[f],
f,d))return false;return true});Array.prototype.some||(Array.prototype.some=function(a,b){var d=n(this),c=l&&h(this)=="[object String]"?this.split(""):d,e=c.length>>>0;if(h(a)!="[object Function]")throw new TypeError(a+" is not a function");for(var f=0;f<e;f++)if(f in c&&a.call(b,c[f],f,d))return true;return false});Array.prototype.reduce||(Array.prototype.reduce=function(a){var b=n(this),d=l&&h(this)=="[object String]"?this.split(""):b,c=d.length>>>0;if(h(a)!="[object Function]")throw new TypeError(a+
" is not a function");if(!c&&arguments.length==1)throw new TypeError("reduce of empty array with no initial value");var e=0,f;if(arguments.length>=2)f=arguments[1];else{do{if(e in d){f=d[e++];break}if(++e>=c)throw new TypeError("reduce of empty array with no initial value");}while(1)}for(;e<c;e++)e in d&&(f=a.call(void 0,f,d[e],e,b));return f});Array.prototype.reduceRight||(Array.prototype.reduceRight=function(a){var b=n(this),d=l&&h(this)=="[object String]"?this.split(""):b,c=d.length>>>0;if(h(a)!=
"[object Function]")throw new TypeError(a+" is not a function");if(!c&&arguments.length==1)throw new TypeError("reduceRight of empty array with no initial value");var e,c=c-1;if(arguments.length>=2)e=arguments[1];else{do{if(c in d){e=d[c--];break}if(--c<0)throw new TypeError("reduceRight of empty array with no initial value");}while(1)}do c in this&&(e=a.call(void 0,e,d[c],c,b));while(c--);return e});if(!Array.prototype.indexOf||-1!=[0,1].indexOf(1,2))Array.prototype.indexOf=function(a){var b=l&&
h(this)=="[object String]"?this.split(""):n(this),d=b.length>>>0;if(!d)return-1;var c=0;arguments.length>1&&(c=v(arguments[1]));for(c=c>=0?c:Math.max(0,d+c);c<d;c++)if(c in b&&b[c]===a)return c;return-1};if(!Array.prototype.lastIndexOf||-1!=[0,1].lastIndexOf(0,-3))Array.prototype.lastIndexOf=function(a){var b=l&&h(this)=="[object String]"?this.split(""):n(this),d=b.length>>>0;if(!d)return-1;var c=d-1;arguments.length>1&&(c=Math.min(c,v(arguments[1])));for(c=c>=0?c:d-Math.abs(c);c>=0;c--)if(c in b&&
a===b[c])return c;return-1};if(!Object.keys){var w=!0,x="toString toLocaleString valueOf hasOwnProperty isPrototypeOf propertyIsEnumerable constructor".split(" "),A=x.length,r;for(r in{toString:null})w=!1;Object.keys=function(a){if(typeof a!="object"&&typeof a!="function"||a===null)throw new TypeError("Object.keys called on a non-object");var b=[],d;for(d in a)t(a,d)&&b.push(d);if(w)for(d=0;d<A;d++){var c=x[d];t(a,c)&&b.push(c)}return b}}if(!Date.prototype.toISOString||-1===(new Date(-621987552E5)).toISOString().indexOf("-000001"))Date.prototype.toISOString=
function(){var a,b,d,c;if(!isFinite(this))throw new RangeError("Date.prototype.toISOString called on non-finite value.");c=this.getUTCFullYear();a=this.getUTCMonth();c=c+Math.floor(a/12);a=[(a%12+12)%12+1,this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()];c=(c<0?"-":c>9999?"+":"")+("00000"+Math.abs(c)).slice(0<=c&&c<=9999?-4:-6);for(b=a.length;b--;){d=a[b];d<10&&(a[b]="0"+d)}return c+"-"+a.slice(0,2).join("-")+"T"+a.slice(2).join(":")+"."+("000"+this.getUTCMilliseconds()).slice(-3)+
"Z"};r=!1;try{r=Date.prototype.toJSON&&null===(new Date(NaN)).toJSON()&&-1!==(new Date(-621987552E5)).toJSON().indexOf("-000001")&&Date.prototype.toJSON.call({toISOString:function(){return true}})}catch(H){}r||(Date.prototype.toJSON=function(){var a=Object(this),b;a:if(s(a))b=a;else{b=a.valueOf;if(typeof b==="function"){b=b.call(a);if(s(b))break a}b=a.toString;if(typeof b==="function"){b=b.call(a);if(s(b))break a}throw new TypeError;}if(typeof b==="number"&&!isFinite(b))return null;b=a.toISOString;
if(typeof b!="function")throw new TypeError("toISOString property is not callable");return b.call(a)});var g=Date,m=function(a,b,d,c,e,f,h){var i=arguments.length;if(this instanceof g){i=i==1&&String(a)===a?new g(m.parse(a)):i>=7?new g(a,b,d,c,e,f,h):i>=6?new g(a,b,d,c,e,f):i>=5?new g(a,b,d,c,e):i>=4?new g(a,b,d,c):i>=3?new g(a,b,d):i>=2?new g(a,b):i>=1?new g(a):new g;i.constructor=m;return i}return g.apply(this,arguments)},u=function(a,b){var d=b>1?1:0;return B[b]+Math.floor((a-1969+d)/4)-Math.floor((a-
1901+d)/100)+Math.floor((a-1601+d)/400)+365*(a-1970)},C=RegExp("^(\\d{4}|[+-]\\d{6})(?:-(\\d{2})(?:-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2})(?:\\.(\\d{3}))?)?(Z|(?:([-+])(\\d{2}):(\\d{2})))?)?)?)?$"),B=[0,31,59,90,120,151,181,212,243,273,304,334,365],j;for(j in g)m[j]=g[j];m.now=g.now;m.UTC=g.UTC;m.prototype=g.prototype;m.prototype.constructor=m;m.parse=function(a){var b=C.exec(a);if(b){var d=Number(b[1]),c=Number(b[2]||1)-1,e=Number(b[3]||1)-1,f=Number(b[4]||0),h=Number(b[5]||0),i=Number(b[6]||
0),j=Number(b[7]||0),m=!b[4]||b[8]?0:Number(new g(1970,0)),k=b[9]==="-"?1:-1,l=Number(b[10]||0),b=Number(b[11]||0);if(f<(h>0||i>0||j>0?24:25)&&h<60&&i<60&&j<1E3&&c>-1&&c<12&&l<24&&b<60&&e>-1&&e<u(d,c+1)-u(d,c)){d=((u(d,c)+e)*24+f+l*k)*60;d=((d+h+b*k)*60+i)*1E3+j+m;if(-864E13<=d&&d<=864E13)return d}return NaN}return g.parse.apply(this,arguments)};Date=m;Date.now||(Date.now=function(){return(new Date).getTime()});if("0".split(void 0,0).length){var D=String.prototype.split;String.prototype.split=function(a,
b){return a===void 0&&b===0?[]:D.apply(this,arguments)}}if("".substr&&"b"!=="0b".substr(-1)){var E=String.prototype.substr;String.prototype.substr=function(a,b){return E.call(this,a<0?(a=this.length+a)<0?0:a:a,b)}}j="\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";if(!String.prototype.trim||j.trim()){j="["+j+"]";var F=RegExp("^"+j+j+"*"),G=RegExp(j+j+"*$");String.prototype.trim=function(){if(this===void 0||this===
null)throw new TypeError("can't convert "+this+" to object");return String(this).replace(F,"").replace(G,"")}}var n=function(a){if(a==null)throw new TypeError("can't convert "+a+" to object");return Object(a)}});

(function(f){"function"==typeof define?define(f):"function"==typeof YUI?YUI.add("es5-sham",f):f()})(function(){function f(a){try{return Object.defineProperty(a,"sentinel",{}),"sentinel"in a}catch(c){}}var b=Function.prototype.call,g=Object.prototype,h=b.bind(g.hasOwnProperty),p,q,k,l,i;if(i=h(g,"__defineGetter__"))p=b.bind(g.__defineGetter__),q=b.bind(g.__defineSetter__),k=b.bind(g.__lookupGetter__),l=b.bind(g.__lookupSetter__);Object.getPrototypeOf||(Object.getPrototypeOf=function(a){return a.__proto__||
(a.constructor?a.constructor.prototype:g)});Object.getOwnPropertyDescriptor||(Object.getOwnPropertyDescriptor=function(a,c){if(typeof a!="object"&&typeof a!="function"||a===null)throw new TypeError("Object.getOwnPropertyDescriptor called on a non-object: "+a);if(h(a,c)){var d={enumerable:true,configurable:true};if(i){var b=a.__proto__;a.__proto__=g;var e=k(a,c),f=l(a,c);a.__proto__=b;if(e||f){if(e)d.get=e;if(f)d.set=f;return d}}d.value=a[c];return d}});Object.getOwnPropertyNames||(Object.getOwnPropertyNames=
function(a){return Object.keys(a)});if(!Object.create){var m;if(null===Object.prototype.__proto__||"undefined"==typeof document)m=function(){return{__proto__:null}};else{var r=function(){},b=document.createElement("iframe"),j=document.body||document.documentElement;b.style.display="none";j.appendChild(b);b.src="javascript:";var e=b.contentWindow.Object.prototype;j.removeChild(b);b=null;delete e.constructor;delete e.hasOwnProperty;delete e.propertyIsEnumerable;delete e.isPrototypeOf;delete e.toLocaleString;
delete e.toString;delete e.valueOf;e.__proto__=null;r.prototype=e;m=function(){return new r}}Object.create=function(a,c){function d(){}var b;if(a===null)b=m();else{if(typeof a!=="object"&&typeof a!=="function")throw new TypeError("Object prototype may only be an Object or null");d.prototype=a;b=new d;b.__proto__=a}c!==void 0&&Object.defineProperties(b,c);return b}}if(Object.defineProperty&&(b=f({}),j="undefined"==typeof document||f(document.createElement("div")),!b||!j))var n=Object.defineProperty,
o=Object.defineProperties;if(!Object.defineProperty||n)Object.defineProperty=function(a,c,d){if(typeof a!="object"&&typeof a!="function"||a===null)throw new TypeError("Object.defineProperty called on non-object: "+a);if(typeof d!="object"&&typeof d!="function"||d===null)throw new TypeError("Property description must be an object: "+d);if(n)try{return n.call(Object,a,c,d)}catch(b){}if(h(d,"value"))if(i&&(k(a,c)||l(a,c))){var e=a.__proto__;a.__proto__=g;delete a[c];a[c]=d.value;a.__proto__=e}else a[c]=
d.value;else{if(!i)throw new TypeError("getters & setters can not be defined on this javascript engine");h(d,"get")&&p(a,c,d.get);h(d,"set")&&q(a,c,d.set)}return a};if(!Object.defineProperties||o)Object.defineProperties=function(a,c){if(o)try{return o.call(Object,a,c)}catch(d){}for(var b in c)h(c,b)&&b!="__proto__"&&Object.defineProperty(a,b,c[b]);return a};Object.seal||(Object.seal=function(a){return a});Object.freeze||(Object.freeze=function(a){return a});try{Object.freeze(function(){})}catch(t){var s=
Object.freeze;Object.freeze=function(a){return typeof a=="function"?a:s(a)}}Object.preventExtensions||(Object.preventExtensions=function(a){return a});Object.isSealed||(Object.isSealed=function(){return false});Object.isFrozen||(Object.isFrozen=function(){return false});Object.isExtensible||(Object.isExtensible=function(a){if(Object(a)!==a)throw new TypeError;for(var c="";h(a,c);)c=c+"?";a[c]=true;var b=h(a,c);delete a[c];return b})});

/**
 * @license
 * Pixi.JS - v1.0.0
 * Copyright (c) 2012, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2013-05-12
 *
 * Pixi.JS is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

(function(){

	var root = this;

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
@module PIXI
 */
var PIXI = PIXI || {};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
 * @class Point
 * @constructor 
 * @param x {Number} position of the point
 * @param y {Number} position of the point
 */
PIXI.Point = function(x, y)
{
	/**
	 * @property x 
	 * @type Number
	 * @default 0
	 */
	this.x = x || 0;
	
	/**
	 * @property y
	 * @type Number
	 * @default 0
	 */
	this.y = y || 0;
}

/** 
 * @method clone
 * @return a copy of the point
 */
PIXI.Point.prototype.clone = function()
{
	return new PIXI.Point(this.x, this.y);
}

// constructor
PIXI.Point.constructor = PIXI.Point;


/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 * @class Rectangle
 * @constructor 
 * @param x {Number} position of the rectangle
 * @param y {Number} position of the rectangle
 * @param width {Number} of the rectangle
 * @param height {Number} of the rectangle
 */
PIXI.Rectangle = function(x, y, width, height)
{
	/**
	 * @property x
	 * @type Number
	 * @default 0
	 */
	this.x = x || 0;
	
	/**
	 * @property y
	 * @type Number
	 * @default 0
	 */
	this.y = y || 0;
	
	/**
	 * @property width
	 * @type Number
	 * @default 0
	 */
	this.width = width || 0;
	
	/**
	 * @property height
	 * @type Number
	 * @default 0
	 */
	this.height = height || 0;
}

/** 
 * @method clone
 * @return a copy of the rectangle
 */
PIXI.Rectangle.prototype.clone = function()
{
	return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
}

// constructor
PIXI.Rectangle.constructor = PIXI.Rectangle;


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * this is the base class for all objects that are rendered on the screen.
 * @class DisplayObject
 * @constructor
 */
PIXI.DisplayObject = function()
{
	/**
	 * The coordinate of the object relative to the local coordinates of the parent.
	 * @property position
	 * @type Point
	 */
	this.position = new PIXI.Point();
	
	/**
	 * The scale factor of the object.
	 * @property scale
	 * @type Point
	 */
	this.scale = new PIXI.Point(1,1);//{x:1, y:1};
	
	/**
	 * The rotation of the object in radians.
	 * @property rotation
	 * @type Number
	 */
	this.rotation = 0;
	
	/**
	 * The opacity of the object.
	 * @property alpha
	 * @type Number
	 */	
	this.alpha = 1;
	
	/**
	 * The visibility of the object.
	 * @property visible
	 * @type Boolean
	 */	
	this.visible = true;
	this.cacheVisible = false;
	
	/**
	 * [read-only] The display object container that contains this display object.
	 * @property parent
	 * @type DisplayObjectContainer
	 */	
	this.parent = null;
	
	/**
	 * [read-only] The stage the display object is connected to, or undefined if it is not connected to the stage.
	 * @property stage
	 * @type Stage
	 */	
	this.stage = null;
	
	/**
	 * This is the defined area that will pick up mouse / touch events. It is null by default.
	 * Setting it is a neat way of optimising the hitTest function that the interactionManager will use (as it will not need to hit test all the children)
	 * @property hitArea
	 * @type Rectangle
	 */	
	this.hitArea = null;
	
	this.worldAlpha = 1;
	this.color = [];
	
	this.worldTransform = PIXI.mat3.create()//mat3.identity();
	this.localTransform = PIXI.mat3.create()//mat3.identity();
	
	this.dynamic = true;
	// chach that puppy!
	this._sr = 0;
	this._cr = 1;
	
	this.renderable = false;
	
	// [readonly] best not to toggle directly! use setInteractive()
	this.interactive = false;
	
	/**
	 * This is used to indicate if the displayObject should display a mouse hand cursor on rollover
	 * @property buttonMode
	 * @type Boolean
	 */
	this.buttonMode = false;
	
	/*
	 * MOUSE Callbacks
	 */
	
	/**
	 * A callback that is used when the users clicks on the displayObject with their mouse
	 * @method click
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the user clicks the mouse down over the sprite
	 * @method mousedown
	 * @param interactionData {InteractionData}
	 */
	 
	/**
	 * A callback that is used when the user releases the mouse that was over the displayObject
	 * for this callback to be fired the mouse must have been pressed down over the displayObject
	 * @method mouseup
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the user releases the mouse that was over the displayObject but is no longer over the displayObject
	 * for this callback to be fired, The touch must have started over the displayObject
	 * @method mouseupoutside
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the users mouse rolls over the displayObject
	 * @method mouseover
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the users mouse leaves the displayObject
	 * @method mouseout
	 * @param interactionData {InteractionData}
	 */
	
	
	/*
	 * TOUCH Callbacks
	 */
	
	/**
	 * A callback that is used when the users taps on the sprite with their finger
	 * basically a touch version of click
	 * @method tap
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the user touch's over the displayObject
	 * @method touchstart
	 * @param interactionData {InteractionData}
	 */
	 
	/**
	 * A callback that is used when the user releases a touch over the displayObject
	 * @method touchend
	 * @param interactionData {InteractionData}
	 */
	
	/**
	 * A callback that is used when the user releases the touch that was over the displayObject
	 * for this callback to be fired, The touch must have started over the sprite
	 * @method touchendoutside
	 * @param interactionData {InteractionData}
	 */
}

// constructor
PIXI.DisplayObject.constructor = PIXI.DisplayObject;

/**
 * Indicates if the sprite will have touch and mouse interactivity. It is false by default
 * @method setInteractive
 * @param interactive {Boolean}
 */
PIXI.DisplayObject.prototype.setInteractive = function(interactive)
{
	this.interactive = interactive;
	// TODO more to be done here..
	// need to sort out a re-crawl!
	if(this.stage)this.stage.dirty = true;
}


/**
 * @private
 */
PIXI.DisplayObject.prototype.updateTransform = function()
{
	// TODO OPTIMIZE THIS!! with dirty
	if(this.rotation != this.rotationCache)
	{
		this.rotationCache = this.rotation;
		this._sr =  Math.sin(this.rotation);
		this._cr =  Math.cos(this.rotation);
	}	
	
	var localTransform = this.localTransform;
	var parentTransform = this.parent.worldTransform;
	var worldTransform = this.worldTransform;
	//console.log(localTransform)
	localTransform[0] = this._cr * this.scale.x;
	localTransform[1] = -this._sr * this.scale.y
	localTransform[3] = this._sr * this.scale.x;
	localTransform[4] = this._cr * this.scale.y;
	
	///AAARR GETTER SETTTER!
	localTransform[2] = this.position.x;
	localTransform[5] = this.position.y;
	
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = localTransform[0], a01 = localTransform[1], a02 = localTransform[2],
        a10 = localTransform[3], a11 = localTransform[4], a12 = localTransform[5],

        b00 = parentTransform[0], b01 = parentTransform[1], b02 = parentTransform[2],
        b10 = parentTransform[3], b11 = parentTransform[4], b12 = parentTransform[5];

    worldTransform[0] = b00 * a00 + b01 * a10;
    worldTransform[1] = b00 * a01 + b01 * a11;
    worldTransform[2] = b00 * a02 + b01 * a12 + b02;

    worldTransform[3] = b10 * a00 + b11 * a10;
    worldTransform[4] = b10 * a01 + b11 * a11;
    worldTransform[5] = b10 * a02 + b11 * a12 + b12;

	// because we are using affine transformation, we can optimise the matrix concatenation process.. wooo!
	// mat3.multiply(this.localTransform, this.parent.worldTransform, this.worldTransform);
	this.worldAlpha = this.alpha * this.parent.worldAlpha;		
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A DisplayObjectContainer represents a collection of display objects. It is the base class of all display objects that act as a container for other objects.
 * @class DisplayObjectContainer 
 * @extends DisplayObject
 * @constructor
 */
PIXI.DisplayObjectContainer = function()
{
	PIXI.DisplayObject.call( this );
	
	/**
	 * [read-only] The of children of this container.
	 * @property children {Array}
	 */	
	this.children = [];
	//s
	this.renderable = false;
}

// constructor
PIXI.DisplayObjectContainer.constructor = PIXI.DisplayObjectContainer;
PIXI.DisplayObjectContainer.prototype = Object.create( PIXI.DisplayObject.prototype );

/**
 * Adds a child to the container.
 * @method addChild
 * @param  DisplayObject {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.addChild = function(child)
{
	if(child.parent != undefined)
	{
		child.parent.removeChild(child)
	}
	
	child.parent = this;
	child.childIndex = this.children.length;
	
	this.children.push(child);	
	if(this.stage)
	{
		this.stage.__addChild(child);
	}
}

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 * @method addChildAt
 * @param DisplayObject {DisplayObject}
 * @param index {Number}
 */
PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index)
{
	if(index >= 0 && index <= this.children.length)
	{
		if(child.parent != undefined)
		{
			child.parent.removeChild(child);
		}
	
		if (index == this.children.length)
		{
		  	this.children.push(child);
		}	
		else 
		{
			this.children.splice(index, 0, child);
		}

		child.parent = this;
		child.childIndex = index;
		
		var length = this.children.length;
		for (var i=index; i < length; i++) 
		{
		  this.children[i].childIndex = i;
		}
		
		if(this.stage)
		{
			this.stage.__addChild(child);
		}
	}
	else
	{
		// error!
		
		throw new Error(child + " The index "+ index +" supplied is out of bounds " + this.children.length);
	}
}

/**
 * Swaps the depth of 2 displayObjects
 * @method swapChildren
 * @param  DisplayObject {DisplayObject}
 * @param  DisplayObject2 {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2)
{
	// TODO I already know this??
	var index = this.children.indexOf( child );
	var index2 = this.children.indexOf( child2 );
	
	if ( index !== -1 && index2 !== -1 ) 
	{
		// cool
		if(this.stage)
		{
			// this is to satisfy the webGL batching..
			// TODO sure there is a nicer way to achieve this!
			this.stage.__removeChild(child);
			this.stage.__removeChild(child2);
			
			this.stage.__addChild(child);
			this.stage.__addChild(child2);
		}
		
		// swap the indexes..
		child.childIndex = index2;
		child2.childIndex = index;
		// swap the positions..
		this.children[index] = child2;
		this.children[index2] = child;
		
	}
	else
	{
		throw new Error(child + " Both the supplied DisplayObjects must be a child of the caller " + this);
	}
}

/**
 * Returns the Child at the specified index
 * @method getChildAt
 * @param  index {Number}
 */
PIXI.DisplayObjectContainer.prototype.getChildAt = function(index)
{
	if(index >= 0 && index < this.children.length)
	{
		return this.children[index];
	}
	else
	{
		throw new Error(child + " Both the supplied DisplayObjects must be a child of the caller " + this);
	
	}
}

/**
 * Removes a child from the container.
 * @method removeChild
 * @param  DisplayObject {DisplayObject}
 */
PIXI.DisplayObjectContainer.prototype.removeChild = function(child)
{
	var index = this.children.indexOf( child );

	if ( index !== -1 ) 
	{
		if(this.stage)this.stage.__removeChild(child);
		child.parent = undefined;
		//child.childIndex = 0
		this.children.splice( index, 1 );
	
		// update in dexs!
		for(var i=index,j=this.children.length; i<j; i++)
		{
			this.children[i].childIndex -= 1;
		}
	}
	else
	{
		throw new Error(child + " The supplied DisplayObject must be a child of the caller " + this);
	}
}


/**
 * @private
 */
PIXI.DisplayObjectContainer.prototype.updateTransform = function()
{
	if(!this.visible)return;
	
	PIXI.DisplayObject.prototype.updateTransform.call( this );
	
	for(var i=0,j=this.children.length; i<j; i++)
	{
		this.children[i].updateTransform();	
	}
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.blendModes = {};
PIXI.blendModes.NORMAL = 0;
PIXI.blendModes.SCREEN = 1;


/**
@class Sprite
@extends DisplayObjectContainer
@constructor
@param texture {Texture}
@type String
*/
PIXI.Sprite = function(texture)
{
	PIXI.DisplayObjectContainer.call( this );
	
	 /**
	 * The anchor sets the origin point of the texture.
	 * The default is 0,0 this means the textures origin is the top left 
	 * Setting than anchor to 0.5,0.5 means the textures origin is centered
	 * Setting the anchor to 1,1 would mean the textures origin points will be the bottom right
     * @property anchor
     * @type Point
     */
	this.anchor = new PIXI.Point();
	
	/**
	 * The texture that the sprite is using
	 * @property texture
	 * @type Texture
	 */
	this.texture = texture;
	
	/**
	 * The blend mode of sprite.
	 * currently supports PIXI.blendModes.NORMAL and PIXI.blendModes.SCREEN
	 * @property blendMode
	 * @type uint
	 */
	this.blendMode = PIXI.blendModes.NORMAL;
	
	/**
	 * The width of the sprite (this is initially set by the texture)
	 * @property width
	 * @type #Number
	 */
	this._width = 0;
	
	/**
	 * The height of the sprite (this is initially set by the texture)
	 * @property height
	 * @type #Number
	 */
	this._height = 0;
	
	if(texture.baseTexture.hasLoaded)
	{
		this.updateFrame = true;
	}
	else
	{
		this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
		this.texture.addEventListener( 'update', this.onTextureUpdateBind );
	}
	
	this.renderable = true;
	
	// thi next bit is here for the docs...
	
	
}

// constructor
PIXI.Sprite.constructor = PIXI.Sprite;
PIXI.Sprite.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

// OOH! shiney new getters and setters for width and height
// The width and height now modify the scale (this is what flash does, nice and tidy!)
Object.defineProperty(PIXI.Sprite.prototype, 'width', {
    get: function() {
        return this.scale.x * this.texture.frame.width;
    },
    set: function(value) {
    	this.scale.x = value / this.texture.frame.width
        this._width = value;
    }
});

Object.defineProperty(PIXI.Sprite.prototype, 'height', {
    get: function() {
        return  this.scale.y * this.texture.frame.height;
    },
    set: function(value) {
    	this.scale.y = value / this.texture.frame.height
        this._height = value;
    }
});
 
/**
@method setTexture
@param texture {Texture} The PIXI texture that is displayed by the sprite
*/
PIXI.Sprite.prototype.setTexture = function(texture)
{
	// stop current texture;
	if(this.texture.baseTexture != texture.baseTexture)
	{
		this.textureChange = true;	
	}
	
	this.texture = texture;
	this.updateFrame = true;
}

/**
 * @private
 */
PIXI.Sprite.prototype.onTextureUpdate = function(event)
{
	//this.texture.removeEventListener( 'update', this.onTextureUpdateBind );
	
	// so if _width is 0 then width was not set..
	if(this._width)this.scale.x = this._width / this.texture.frame.width;
	if(this._height)this.scale.y = this._height / this.texture.frame.height;
	
	this.updateFrame = true;
}

// some helper functions..

/**
 * 
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 * @method fromFrame
 * @static
 * @param frameId {String} The frame Id of the texture in the cache
 * @return {Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
PIXI.Sprite.fromFrame = function(frameId)
{
	var texture = PIXI.TextureCache[frameId];
	if(!texture)throw new Error("The frameId '"+ frameId +"' does not exist in the texture cache" + this);
	return new PIXI.Sprite(texture);
}

/**
 * 
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 * @method fromImage
 * @static
 * @param The image url of the texture
 * @return {Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
PIXI.Sprite.fromImage = function(imageId)
{
	var texture = PIXI.Texture.fromImage(imageId);
	return new PIXI.Sprite(texture);
}


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 * @class MovieClip
 * @extends Sprite
 * @constructor
 * @param textures {Array} an array of {Texture} objects that make up the animation
 */
PIXI.MovieClip = function(textures)
{
	PIXI.Sprite.call( this, textures[0]);
	
	/**
	 * The array of textures that make up the animation
	 * @property textures
	 * @type Array
	 */
	this.textures = textures;
	
	/**
	 * [read only] The index MovieClips current frame (this may not have to be a whole number)
	 * @property currentFrame
	 * @type Number
	 */
	this.currentFrame = 0; 
	
	/**
	 * The speed that the MovieClip will play at. Higher is faster, lower is slower
	 * @property animationSpeed
	 * @type Number
	 */
	this.animationSpeed = 1;

	/**
	 * Whether or not the movie clip repeats after playing.
	 * @property loop
	 * @type Boolean
	 */
	this.loop = true;

	/**
	 * Function to call when a MovieClip finishes playing
	 * @property onComplete
	 * @type Function
	 */
	this.onComplete = null;
	
	/**
	 * [read only] indicates if the MovieClip is currently playing
	 * @property playing
	 * @type Boolean
	 */
	this.playing;
}

// constructor
PIXI.MovieClip.constructor = PIXI.MovieClip;
PIXI.MovieClip.prototype = Object.create( PIXI.Sprite.prototype );

/**
 * Stops the MovieClip
 * @method stop
 */
PIXI.MovieClip.prototype.stop = function()
{
	this.playing = false;
}

/**
 * Plays the MovieClip
 * @method play
 */
PIXI.MovieClip.prototype.play = function()
{
	this.playing = true;
}

/**
 * Stops the MovieClip and goes to a specific frame
 * @method gotoAndStop
 * @param frameNumber {Number} frame index to stop at
 */
PIXI.MovieClip.prototype.gotoAndStop = function(frameNumber)
{
	this.playing = false;
	this.currentFrame = frameNumber;
	var round = (this.currentFrame + 0.5) | 0;
	this.setTexture(this.textures[round % this.textures.length]);
}

/**
 * Goes to a specific frame and begins playing the MovieClip
 * @method gotoAndPlay
 * @param frameNumber {Number} frame index to start at
 */
PIXI.MovieClip.prototype.gotoAndPlay = function(frameNumber)
{
	this.currentFrame = frameNumber;
	this.playing = true;
}

PIXI.MovieClip.prototype.updateTransform = function()
{
	PIXI.Sprite.prototype.updateTransform.call(this);
	
	if(!this.playing)return;
	
	this.currentFrame += this.animationSpeed;
	var round = (this.currentFrame + 0.5) | 0;
	if(this.loop || round < this.textures.length)
	{
		this.setTexture(this.textures[round % this.textures.length]);
	}
	else if(round >= this.textures.length)
	{
		this.gotoAndStop(this.textures.length - 1);
		if(this.onComplete)
		{
			this.onComplete();
		}
	}
}
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line(s) of text. To split a line you can use "\n", "\r" or "\r\n"
 * @class Text
 * @extends Sprite
 * @constructor
 * @param {String} text The copy that you would like the text to display
 * @param {Object} [style] The style parameters
 * @param {String} [style.font] default "bold 20pt Arial" The style and size of the font
 * @param {Object} [style.fill="black"] A canvas fillstyle that will be used on the text eg "red", "#00FF00"
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 * @param {String} [style.stroke] A canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00"
 * @param {Number} [style.strokeThickness=0] A number that represents the thickness of the stroke. Default is 0 (no stroke)
 */
PIXI.Text = function(text, style)
{
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));

    this.setText(text);
    this.setStyle(style);
    this.updateText();
    this.dirty = false;
};

// constructor
PIXI.Text.constructor = PIXI.Text;
PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);

/**
 * Set the style of the text
 * @method setStyle
 * @param {Object} [style] The style parameters
 * @param {String} [style.font="bold 20pt Arial"] The style and size of the font
 * @param {Object} [style.fill="black"] A canvas fillstyle that will be used on the text eg "red", "#00FF00"
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 * @param {String} [style.stroke] A canvas fillstyle that will be used on the text stroke eg "blue", "#FCFF00"
 * @param {Number} [style.strokeThickness=0] A number that represents the thickness of the stroke. Default is 0 (no stroke)
 */
PIXI.Text.prototype.setStyle = function(style)
{
    style = style || {};
    style.font = style.font || "bold 20pt Arial";
    style.fill = style.fill || "black";
    style.align = style.align || "left";
    style.strokeThickness = style.strokeThickness || 0;
    this.style = style;
    this.dirty = true;
};

/**
 * Set the copy for the text object. To split a line you can use "\n"
 * @method setText
 * @param {String} text The copy that you would like the text to display
 */
PIXI.Sprite.prototype.setText = function(text)
{
    this.text = text || " ";
    this.dirty = true;
};

/**
 * Renders text
 * @private
 */
PIXI.Text.prototype.updateText = function()
{
	this.context.font = this.style.font;

	//split text into lines
	var lines = this.text.split(/(?:\r\n|\r|\n)/);

	//calculate text width
	var lineWidths = [];
	var maxLineWidth = 0;
	for (var i = 0; i < lines.length; i++)
	{
		var lineWidth = this.context.measureText(lines[i]).width;
		lineWidths[i] = lineWidth;
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
	}
	this.canvas.width = maxLineWidth + this.style.strokeThickness;
	
	//calculate text height
	var lineHeight = this.determineFontHeight("font: " + this.style.font  + ";") + this.style.strokeThickness;
	this.canvas.height = lineHeight * lines.length;

	//set canvas text styles
	this.context.fillStyle = this.style.fill;
	this.context.font = this.style.font;
	
	this.context.strokeStyle = this.style.stroke;
	this.context.lineWidth = this.style.strokeThickness;

	this.context.textBaseline = "top";

	//draw lines line by line
	for (i = 0; i < lines.length; i++)
	{
		var linePosition = new PIXI.Point(this.style.strokeThickness / 2, this.style.strokeThickness / 2 + i * lineHeight);
	
		if(this.style.align == "right")
		{
			linePosition.x += maxLineWidth - lineWidths[i];
		}
		else if(this.style.align == "center")
		{
			linePosition.x += (maxLineWidth - lineWidths[i]) / 2;
		}

		if(this.style.stroke && this.style.strokeThickness)
		{
			this.context.strokeText(lines[i], linePosition.x, linePosition.y);
		}

		if(this.style.fill)
		{
			this.context.fillText(lines[i], linePosition.x, linePosition.y);
		}
	}
	
    this.updateTexture();
};

/**
 * Updates texture size based on canvas size
 * @private
 */
PIXI.Text.prototype.updateTexture = function()
{

    this.texture.baseTexture.width = this.canvas.width;
    this.texture.baseTexture.height = this.canvas.height;
    this.texture.frame.width = this.canvas.width;
    this.texture.frame.height = this.canvas.height;
    PIXI.texturesToUpdate.push(this.texture.baseTexture);
};

/**
 * @private
 */
PIXI.Text.prototype.updateTransform = function()
{
	if(this.dirty)
	{
		this.updateText();	
		this.dirty = false;
	}
	
	PIXI.Sprite.prototype.updateTransform.call(this);
};

/**
 * http://stackoverflow.com/users/34441/ellisbben
 * great solution to the problem!
 * @private
 */
PIXI.Text.prototype.determineFontHeight = function(fontStyle) 
{
	// build a little reference dictionary so if the font style has been used return a
	// cached version...
	var result = PIXI.Text.heightCache[fontStyle];
	
	if(!result)
	{
		var body = document.getElementsByTagName("body")[0];
		var dummy = document.createElement("div");
		var dummyText = document.createTextNode("M");
		dummy.appendChild(dummyText);
		dummy.setAttribute("style", fontStyle);
		body.appendChild(dummy);
		
		result = dummy.offsetHeight;
		PIXI.Text.heightCache[fontStyle] = result;
		
		body.removeChild(dummy);
	}
	
	return result;
};

PIXI.Text.prototype.destroy = function(destroyTexture)
{
	if(destroyTexture)
	{
		this.texture.destroy();
	}
		
};

PIXI.Text.heightCache = {};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Text Object will create a line(s) of text using bitmap font. To split a line you can use "\n", "\r" or "\r\n"
 * You can generate the fnt files using 
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 * @class BitmapText
 * @extends DisplayObjectContainer
 * @constructor
 * @param {String} text The copy that you would like the text to display
 * @param {Object} style The style parameters
 * @param {String} style.font The size (optional) and bitmap font id (required) eq "Arial" or "20px Arial" (must have loaded previously)
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 */
PIXI.BitmapText = function(text, style)
{
    PIXI.DisplayObjectContainer.call(this);

    this.setText(text);
    this.setStyle(style);
    this.updateText();
    this.dirty = false

};

// constructor
PIXI.BitmapText.constructor = PIXI.BitmapText;
PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Set the copy for the text object
 * @method setText
 * @param {String} text The copy that you would like the text to display
 */
PIXI.BitmapText.prototype.setText = function(text)
{
    this.text = text || " ";
    this.dirty = true;
};

/**
 * Set the style of the text
 * @method setStyle
 * @param {Object} style The style parameters
 * @param {String} style.font The size (optional) and bitmap font id (required) eq "Arial" or "20px Arial" (must have loaded previously)
 * @param {String} [style.align="left"] An alignment of the multiline text ("left", "center" or "right")
 */
PIXI.BitmapText.prototype.setStyle = function(style)
{
    style = style || {};
    style.align = style.align || "left";
    this.style = style;

    var font = style.font.split(" ");
    this.fontName = font[font.length - 1];
    this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;

    this.dirty = true;
};

/**
 * Renders text
 * @private
 */
PIXI.BitmapText.prototype.updateText = function()
{
    var data = PIXI.BitmapText.fonts[this.fontName];
    var pos = new PIXI.Point();
    var prevCharCode = null;
    var chars = [];
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this.fontSize / data.size;
    for(var i = 0; i < this.text.length; i++)
    {
        var charCode = this.text.charCodeAt(i);
        if(/(?:\r\n|\r|\n)/.test(this.text.charAt(i)))
        {
            lineWidths.push(pos.x);
            maxLineWidth = Math.max(maxLineWidth, pos.x);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }
        
        var charData = data.chars[charCode];
        if(!charData) continue;

        if(prevCharCode && charData[prevCharCode])
        {
           pos.x += charData.kerning[prevCharCode];
        }
        chars.push({line: line, charCode: charCode, position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
        pos.x += charData.xAdvance;

        prevCharCode = charCode;
    }

    lineWidths.push(pos.x);
    maxLineWidth = Math.max(maxLineWidth, pos.x);

    var lineAlignOffsets = [];
    for(i = 0; i <= line; i++)
    {
        var alignOffset = 0;
        if(this.style.align == "right")
        {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if(this.style.align == "center")
        {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }
        lineAlignOffsets.push(alignOffset);
    }

    for(i = 0; i < chars.length; i++)
    {
        var char = PIXI.Sprite.fromFrame(chars[i].charCode);
        char.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        char.position.y = chars[i].position.y * scale;
        char.scale.x = char.scale.y = scale;
        this.addChild(char);
    }

    this.width = pos.x * scale;
    this.height = (pos.y + data.lineHeight) * scale;
};

/**
 * @private
 */
PIXI.BitmapText.prototype.updateTransform = function()
{
	if(this.dirty)
	{
        while(this.children.length > 0)
        {
            this.removeChild(this.getChildAt(0));
        }
        this.updateText();

        this.dirty = false;
	}
	
	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
};

PIXI.BitmapText.fonts = {};
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



/**
The interaction manager deals with mouse and touch events. At this moment only Sprite's can be interactive.
This manager also supports multitouch.
@class InteractionManager
@constructor
@param stage {Stage}
@type Stage
*/
PIXI.InteractionManager = function(stage)
{
	/**
	 * a refference to the stage
	 * @property stage
	 * @type Stage
	 */
	this.stage = stage;

	// helpers
	this.tempPoint = new PIXI.Point();
	//this.tempMatrix =  mat3.create();
	
	this.mouseoverEnabled = true;
	
	/**
	 * the mouse data 
	 * @property mouse
	 * @type InteractionData
	 */
	this.mouse = new PIXI.InteractionData();
	
	/**
	 * an object that stores current touches (InteractionData) by id reference 
	 * @property touchs
	 * @type Object
	 */
	this.touchs = {};
	
	//tiny little interactiveData pool!
	this.pool = [];
	
	this.interactiveItems = [];

	this.last = 0;
}

// constructor
PIXI.InteractionManager.constructor = PIXI.InteractionManager;

PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject, iParent)
{
	var children = displayObject.children;
	var length = children.length;
	
	//this.interactiveItems = [];
	/// make an interaction tree... {item.__interactiveParent}
	for (var i = length-1; i >= 0; i--)
	{
		var child = children[i];
		
		// push all interactive bits
		if(child.interactive)
		{
			iParent.interactiveChildren = true;
			//child.__iParent = iParent;
			this.interactiveItems.push(child);
			
			if(child.children.length > 0)
			{
				this.collectInteractiveSprite(child, child);
			}
		}
		else
		{
			child.__iParent = null;
			
			if(child.children.length > 0)
			{
				this.collectInteractiveSprite(child, iParent);
			}
		}
	}
}

PIXI.InteractionManager.prototype.setTarget = function(target)
{
	if (window.navigator.msPointerEnabled) 
	{
		// time to remove some of that zoom in ja..
		target.view.style["-ms-content-zooming"] = "none";
    	target.view.style["-ms-touch-action"] = "none"
    
		// DO some window specific touch!
	}
	
	
	{
		
		this.target = target;
		target.view.addEventListener('mousemove',  this.onMouseMove.bind(this), true);
		target.view.addEventListener('mousedown',  this.onMouseDown.bind(this), true);
	 	document.body.addEventListener('mouseup',  this.onMouseUp.bind(this), true);
	 	target.view.addEventListener('mouseout',   this.onMouseUp.bind(this), true);
		
		// aint no multi touch just yet!
		target.view.addEventListener("touchstart", this.onTouchStart.bind(this), true);
		target.view.addEventListener("touchend", this.onTouchEnd.bind(this), true);
		target.view.addEventListener("touchmove", this.onTouchMove.bind(this), true);
	}
	
	
	
}

PIXI.InteractionManager.prototype.update = function()
{
	// frequency of 30fps??
	var now = Date.now();
	var diff = now - this.last;
	diff = (diff * 30) / 1000;
	if(diff < 1)return;
	this.last = now;
	//
	
	// ok.. so mouse events??
	// yes for now :)
	// OPTIMSE - how often to check??
	if(this.dirty)
	{
		this.dirty = false;
		
		var len = this.interactiveItems.length;
		
		for (var i=0; i < this.interactiveItems.length; i++) {
		  this.interactiveItems[i].interactiveChildren = false;
		}
		
		this.interactiveItems = [];
		
		if(this.stage.interactive)this.interactiveItems.push(this.stage);
		// go through and collect all the objects that are interactive..
		this.collectInteractiveSprite(this.stage, this.stage);
	}
	
	// loop through interactive objects!
	var length = this.interactiveItems.length;
	
	if(this.target)this.target.view.style.cursor = "default";	
				
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		if(!item.visible)continue;
		
		// OPTIMISATION - only calculate every time if the mousemove function exists..
		// OK so.. does the object have any other interactive functions?
		// hit-test the clip!
		
		
		if(item.mouseover || item.mouseout || item.buttonMode)
		{
			// ok so there are some functions so lets hit test it..
			item.__hit = this.hitTest(item, this.mouse);
			// ok so deal with interactions..
			// loks like there was a hit!
			if(item.__hit)
			{
				if(item.buttonMode)this.target.view.style.cursor = "pointer";	
				
				if(!item.__isOver)
				{
					
					if(item.mouseover)item.mouseover(this.mouse);
					item.__isOver = true;	
				}
			}
			else
			{
				if(item.__isOver)
				{
					// roll out!
					if(item.mouseout)item.mouseout(this.mouse);
					item.__isOver = false;	
				}
			}
		}
		
		// --->
	}
}

PIXI.InteractionManager.prototype.onMouseMove = function(event)
{
	event.preventDefault();
	
	// TODO optimize by not check EVERY TIME! maybe half as often? //
	var rect = this.target.view.getBoundingClientRect();
	
	this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
	this.mouse.global.y = (event.clientY - rect.top) * ( this.target.height / rect.height);
	
	var length = this.interactiveItems.length;
	var global = this.mouse.global;
	
	
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		
		if(item.mousemove)
		{
			//call the function!
			item.mousemove(this.mouse);
		}
	}
}

PIXI.InteractionManager.prototype.onMouseDown = function(event)
{
	event.preventDefault();
	
	// loop through inteaction tree...
	// hit test each item! -> 
	// --->--->--->--->
	// get interactive items under point??
	// --->--->--->--->
	//stage.__i
	var length = this.interactiveItems.length;
	var global = this.mouse.global;
	
	var index = 0;
	var parent = this.stage;
	
	// while 
	// hit test 
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		
		if(item.mousedown || item.click)
		{
			item.__mouseIsDown = true;
			item.__hit = this.hitTest(item, this.mouse);
			
			if(item.__hit)
			{
				//call the function!
				if(item.mousedown)item.mousedown(this.mouse);
				item.__isDown = true;
				
				// just the one!
				if(!item.interactiveChildren)break;
			}
		}
	}
}

PIXI.InteractionManager.prototype.onMouseUp = function(event)
{
	event.preventDefault();
	var global = this.mouse.global;
	
	
	var length = this.interactiveItems.length;
	var up = false;
	
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		
		if(item.mouseup || item.mouseupoutside || item.click)
		{
			item.__hit = this.hitTest(item, this.mouse);
			
			if(item.__hit && !up)
			{
				//call the function!
				if(item.mouseup)
				{
					item.mouseup(this.mouse);
				}
				if(item.__isDown)
				{
					if(item.click)item.click(this.mouse);
				}
				
				if(!item.interactiveChildren)up = true;
			}
			else
			{
				if(item.__isDown)
				{
					if(item.mouseupoutside)item.mouseupoutside(this.mouse);
				}
			}
		
			item.__isDown = false;	
		}
	}
}

PIXI.InteractionManager.prototype.hitTest = function(item, interactionData)
{
	var global = interactionData.global;
	
	if(!item.visible)return false;
	
	if(item instanceof PIXI.Sprite)
	{
		var worldTransform = item.worldTransform;
		
		var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
            a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
            id = 1 / (a00 * a11 + a01 * -a10);
		
		var x = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id; 
		var y = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
		
		var width = item.texture.frame.width;
		var height = item.texture.frame.height;
		
		var x1 = -width * item.anchor.x;
		
		if(x > x1 && x < x1 + width)
		{
			var y1 = -height * item.anchor.y;
			
			if(y > y1 && y < y1 + height)
			{
				// set the target property if a hit is true!
				interactionData.target = item
				return true;
			}
		}
	}
	else if(item.hitArea)
	{
		var worldTransform = item.worldTransform;
		var hitArea = item.hitArea;
		
		var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
            a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
            id = 1 / (a00 * a11 + a01 * -a10);
		
		var x = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id; 
		var y = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
		
		var x1 = hitArea.x;
		if(x > x1 && x < x1 + hitArea.width)
		{
			var y1 = hitArea.y;
			
			if(y > y1 && y < y1 + hitArea.height)
			{
				return true;
			}
		}
	}
	
	var length = item.children.length;
	
	for (var i = 0; i < length; i++)
	{
		var tempItem = item.children[i];
		var hit = this.hitTest(tempItem, interactionData);
		if(hit)return true;
	}
		
	return false;	
}



PIXI.InteractionManager.prototype.onTouchMove = function(event)
{
	event.preventDefault();
	
	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;
	
	for (var i=0; i < changedTouches.length; i++) 
	{
		var touchEvent = changedTouches[i];
		var touchData = this.touchs[touchEvent.identifier];
		
		// update the touch position
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
	}
	
	var length = this.interactiveItems.length;
	for (var i = 0; i < length; i++)
	{
		var item = this.interactiveItems[i];
		if(item.touchmove)item.touchmove(touchData);
	}
}

PIXI.InteractionManager.prototype.onTouchStart = function(event)
{
	event.preventDefault();
	var rect = this.target.view.getBoundingClientRect();
	
	var changedTouches = event.changedTouches;
	for (var i=0; i < changedTouches.length; i++) 
	{
		var touchEvent = changedTouches[i];
		
		var touchData = this.pool.pop();
		if(!touchData)touchData = new PIXI.InteractionData();
		
		this.touchs[touchEvent.identifier] = touchData;
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
		
		var length = this.interactiveItems.length;
		
		for (var j = 0; j < length; j++)
		{
			var item = this.interactiveItems[j];
			
			if(item.touchstart || item.tap)
			{
				item.__hit = this.hitTest(item, touchData);
				
				if(item.__hit)
				{
					//call the function!
					if(item.touchstart)item.touchstart(touchData);
					item.__isDown = true;
					item.__touchData = touchData;
					
					if(!item.interactiveChildren)break;
				}
			}
		}
	}
	
}

PIXI.InteractionManager.prototype.onTouchEnd = function(event)
{
	event.preventDefault();
	
	
	var rect = this.target.view.getBoundingClientRect();
	var changedTouches = event.changedTouches;
	
	for (var i=0; i < changedTouches.length; i++) 
	{
		 
		var touchEvent = changedTouches[i];
		var touchData = this.touchs[touchEvent.identifier];
		var up = false;
		touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
		touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
		
		var length = this.interactiveItems.length;
		for (var j = 0; j < length; j++)
		{
			var item = this.interactiveItems[j];
			var itemTouchData = item.__touchData; // <-- Here!
			item.__hit = this.hitTest(item, touchData);
		
			if(itemTouchData == touchData)
			{
				// so this one WAS down...
				
				// hitTest??
				
				if(item.touchend || item.tap)
				{
					if(item.__hit && !up)
					{
						if(item.touchend)item.touchend(touchData);
						if(item.__isDown)
						{
							if(item.tap)item.tap(touchData);
						}
						
						if(!item.interactiveChildren)up = true;
					}
					else
					{
						if(item.__isDown)
						{
							if(item.touchendoutside)item.touchendoutside(touchData);
						}
					}
					
					item.__isDown = false;
				}
				
				item.__touchData = null;
					
			}
			else
			{
				
			}
		}
		// remove the touch..
		this.pool.push(touchData);
		this.touchs[touchEvent.identifier] = null;
	}
}

/**
@class InteractionData
@constructor
*/
PIXI.InteractionData = function()
{
	/**
	 * This point stores the global coords of where the touch/mouse event happened
	 * @property global 
	 * @type Point
	 */
	this.global = new PIXI.Point();
	
	// this is here for legacy... but will remove
	this.local = new PIXI.Point();

	/**
	 * The target Sprite that was interacted with
	 * @property target
	 * @type Sprite
	 */
	this.target;
}

/**
 * This will return the local coords of the specified displayObject for this InteractionData
 * @method getLocalPosition
 * @param displayObject {DisplayObject} The DisplayObject that you would like the local coords off
 * @return {Point} A point containing the coords of the InteractionData position relative to the DisplayObject
 */
PIXI.InteractionData.prototype.getLocalPosition = function(displayObject)
{
	var worldTransform = displayObject.worldTransform;
	var global = this.global;
	
	// do a cheeky transform to get the mouse coords;
	var a00 = worldTransform[0], a01 = worldTransform[1], a02 = worldTransform[2],
        a10 = worldTransform[3], a11 = worldTransform[4], a12 = worldTransform[5],
        id = 1 / (a00 * a11 + a01 * -a10);
	// set the mouse coords...
	return new PIXI.Point(a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id,
							   a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id)
}

// constructor
PIXI.InteractionData.constructor = PIXI.InteractionData;



/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
A Stage represents the root of the display tree. Everything connected to the stage is rendered
@class Stage
@extends DisplayObjectContainer
@constructor
@param backgroundColor {Number} the background color of the stage
@param interactive {Boolean} enable / disable interaction (default is false)
*/
PIXI.Stage = function(backgroundColor, interactive)
{
	
	PIXI.DisplayObjectContainer.call( this );
	this.worldTransform = PIXI.mat3.create()//.//identity();
	this.__childrenAdded = [];
	this.__childrenRemoved = [];
	this.childIndex = 0;
	this.stage= this;
	
	this.stage.hitArea = new PIXI.Rectangle(0,0,100000, 100000);
	
	// interaction!
	this.interactive = !!interactive;
	this.interactionManager = new PIXI.InteractionManager(this);
	
	this.setBackgroundColor(backgroundColor);
}

// constructor
PIXI.Stage.constructor = PIXI.Stage;

PIXI.Stage.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

/**
@method updateTransform
@internal
*/
PIXI.Stage.prototype.updateTransform = function()
{
	this.worldAlpha = 1;		
	
	for(var i=0,j=this.children.length; i<j; i++)
	{
		this.children[i].updateTransform();	
	}
	
	if(this.dirty)
	{
		this.dirty = false;
		// update interactive!
		this.interactionManager.dirty = true;
	}

	if(this.interactive)this.interactionManager.update();
}

/**
 * @method setBackgroundColor
 * @param backgroundColor {Number}
 */
PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor)
{
	this.backgroundColor = backgroundColor || 0x000000;
	this.backgroundColorSplit = HEXtoRGB(this.backgroundColor);
	this.backgroundColorString =  "#" + this.backgroundColor.toString(16);
}

/**
 * This will return the point containing global coords of the mouse.
 * @method getMousePosition
 * @return {Point} The point containing the coords of the global InteractionData position.
 */
PIXI.Stage.prototype.getMousePosition = function()
{
	return this.interactionManager.mouse.global;
}

PIXI.Stage.prototype.__addChild = function(child)
{
	if(child.interactive)this.dirty = true;
	
	child.stage = this;
	
	if(child.children)
	{
		for (var i=0; i < child.children.length; i++) 
		{
		  	this.__addChild(child.children[i]);
		};
	}
	
}


PIXI.Stage.prototype.__removeChild = function(child)
{
	if(child.interactive)this.dirty = true;
	
	this.__childrenRemoved.push(child);

	child.stage = undefined;
	
	if(child.children)
	{
		for(var i=0,j=child.children.length; i<j; i++)
		{
		  	this.__removeChild(child.children[i])
		}
	}
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();

function HEXtoRGB(hex) {
	return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
}

/**
 * Provides bind in a cross browser way.
 */
if (typeof Function.prototype.bind != 'function') {
  Function.prototype.bind = (function () {
    var slice = Array.prototype.slice;
    return function (thisArg) {
      var target = this, boundArgs = slice.call(arguments, 1);
 
      if (typeof target != 'function') throw new TypeError();
 
      function bound() {
	var args = boundArgs.concat(slice.call(arguments));
	target.apply(this instanceof bound ? this : thisArg, args);
      }
 
      bound.prototype = (function F(proto) {
          proto && (F.prototype = proto);
          if (!(this instanceof F)) return new F;          
	})(target.prototype);
 
      return bound;
    };
  })();
}

var AjaxRequest = function()
{
	var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
	
	if (window.ActiveXObject)
	{ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
		for (var i=0; i<activexmodes.length; i++)
		{
			try{
				return new ActiveXObject(activexmodes[i])
			}
   			catch(e){
    			//suppress error
   			}
		}
	}
	else if (window.XMLHttpRequest) // if Mozilla, Safari etc
  	{
  		return new XMLHttpRequest()
 	}
 	else
 	{
		return false;
 	}
}








/**
 * https://github.com/mrdoob/eventtarget.js/
 * THankS mr DOob!
 */

PIXI.EventTarget = function () {

	var listeners = {};
	
	this.addEventListener = this.on = function ( type, listener ) {
		
		
		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];
			
		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );
		}

	};

	this.dispatchEvent = this.emit = function ( event ) {
		
		for ( var listener in listeners[ event.type ] ) {

			listeners[ event.type ][ listener ]( event );
			
		}

	};

	this.removeEventListener = this.off = function ( type, listener ) {

		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	};

};



/*
 * A lighter version of the rad gl-matrix created by Brandon Jones, Colin MacKenzie IV
 * you both rock!
 */

function determineMatrixArrayType() {
    PIXI.Matrix = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
    return PIXI.Matrix;
}

determineMatrixArrayType();

PIXI.mat3 = {};

PIXI.mat3.create = function()
{
	var matrix = new PIXI.Matrix(9);

	matrix[0] = 1;
	matrix[1] = 0;
	matrix[2] = 0;
	matrix[3] = 0;
	matrix[4] = 1;
	matrix[5] = 0;
	matrix[6] = 0;
	matrix[7] = 0;
	matrix[8] = 1;
	
	return matrix;
}

PIXI.mat4 = {};

PIXI.mat4.create = function()
{
	var matrix = new PIXI.Matrix(16);

	matrix[0] = 1;
	matrix[1] = 0;
	matrix[2] = 0;
	matrix[3] = 0;
	matrix[4] = 0;
	matrix[5] = 1;
	matrix[6] = 0;
	matrix[7] = 0;
	matrix[8] = 0;
	matrix[9] = 0;
	matrix[10] = 1;
	matrix[11] = 0;
	matrix[12] = 0;
	matrix[13] = 0;
	matrix[14] = 0;
	matrix[15] = 1;
	
	return matrix;
}

PIXI.mat3.multiply = function (mat, mat2, dest) 
{
	if (!dest) { dest = mat; }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2],
	    a10 = mat[3], a11 = mat[4], a12 = mat[5],
	    a20 = mat[6], a21 = mat[7], a22 = mat[8],
	
	    b00 = mat2[0], b01 = mat2[1], b02 = mat2[2],
	    b10 = mat2[3], b11 = mat2[4], b12 = mat2[5],
	    b20 = mat2[6], b21 = mat2[7], b22 = mat2[8];
	
	dest[0] = b00 * a00 + b01 * a10 + b02 * a20;
	dest[1] = b00 * a01 + b01 * a11 + b02 * a21;
	dest[2] = b00 * a02 + b01 * a12 + b02 * a22;
	
	dest[3] = b10 * a00 + b11 * a10 + b12 * a20;
	dest[4] = b10 * a01 + b11 * a11 + b12 * a21;
	dest[5] = b10 * a02 + b11 * a12 + b12 * a22;
	
	dest[6] = b20 * a00 + b21 * a10 + b22 * a20;
	dest[7] = b20 * a01 + b21 * a11 + b22 * a21;
	dest[8] = b20 * a02 + b21 * a12 + b22 * a22;
	
	return dest;
}


PIXI.mat3.toMat4 = function (mat, dest) 
{
	if (!dest) { dest = PIXI.mat4.create(); }
	
	dest[15] = 1;
	dest[14] = 0;
	dest[13] = 0;
	dest[12] = 0;
	
	dest[11] = 0;
	dest[10] = mat[8];
	dest[9] = mat[7];
	dest[8] = mat[6];
	
	dest[7] = 0;
	dest[6] = mat[5];
	dest[5] = mat[4];
	dest[4] = mat[3];
	
	dest[3] = 0;
	dest[2] = mat[2];
	dest[1] = mat[1];
	dest[0] = mat[0];
	
	return dest;
}


/////


PIXI.mat4.create = function()
{
	var matrix = new PIXI.Matrix(16);

	matrix[0] = 1;
	matrix[1] = 0;
	matrix[2] = 0;
	matrix[3] = 0;
	matrix[4] = 0;
	matrix[5] = 1;
	matrix[6] = 0;
	matrix[7] = 0;
	matrix[8] = 0;
	matrix[9] = 0;
	matrix[10] = 1;
	matrix[11] = 0;
	matrix[12] = 0;
	matrix[13] = 0;
	matrix[14] = 0;
	matrix[15] = 1;
	
	return matrix;
}

PIXI.mat4.transpose = function (mat, dest) 
{
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if (!dest || mat === dest) 
	{
	    var a01 = mat[1], a02 = mat[2], a03 = mat[3],
	        a12 = mat[6], a13 = mat[7],
	        a23 = mat[11];
	
	    mat[1] = mat[4];
	    mat[2] = mat[8];
	    mat[3] = mat[12];
	    mat[4] = a01;
	    mat[6] = mat[9];
	    mat[7] = mat[13];
	    mat[8] = a02;
	    mat[9] = a12;
	    mat[11] = mat[14];
	    mat[12] = a03;
	    mat[13] = a13;
	    mat[14] = a23;
	    return mat;
	}
	
	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];
	dest[3] = mat[12];
	dest[4] = mat[1];
	dest[5] = mat[5];
	dest[6] = mat[9];
	dest[7] = mat[13];
	dest[8] = mat[2];
	dest[9] = mat[6];
	dest[10] = mat[10];
	dest[11] = mat[14];
	dest[12] = mat[3];
	dest[13] = mat[7];
	dest[14] = mat[11];
	dest[15] = mat[15];
	return dest;
}

PIXI.mat4.multiply = function (mat, mat2, dest) 
{
	if (!dest) { dest = mat; }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[ 0], a01 = mat[ 1], a02 = mat[ 2], a03 = mat[3];
	var a10 = mat[ 4], a11 = mat[ 5], a12 = mat[ 6], a13 = mat[7];
	var a20 = mat[ 8], a21 = mat[ 9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	// Cache only the current line of the second matrix
    var b0  = mat2[0], b1 = mat2[1], b2 = mat2[2], b3 = mat2[3];  
    dest[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    dest[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    dest[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    dest[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2[4];
    b1 = mat2[5];
    b2 = mat2[6];
    b3 = mat2[7];
    dest[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    dest[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    dest[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    dest[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2[8];
    b1 = mat2[9];
    b2 = mat2[10];
    b3 = mat2[11];
    dest[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    dest[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    dest[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    dest[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2[12];
    b1 = mat2[13];
    b2 = mat2[14];
    b3 = mat2[15];
    dest[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    dest[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    dest[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    dest[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    return dest;
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot fastest. If webGL is not supported by the browser then this function will return a canvas renderer
 * @method autoDetectRenderer
 * @static
 * @param width {Number} the width of the renderers view
 * @param height {Number} the height of the renderers view
 * @param view {Canvas} the canvas to use as a view, optional
 * @param transparent {Boolean} the transparency of the render view, default false
 * @default false
 */
PIXI.autoDetectRenderer = function(width, height, view, transparent)
{
	if(!width)width = 800;
	if(!height)height = 600;

	// BORROWED from Mr Doob (mrdoob.com)
	var webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

	//console.log(webgl);
	if( webgl )
	{
		return new PIXI.WebGLRenderer(width, height, view, transparent);
	}

	return	new PIXI.CanvasRenderer(width, height, view, transparent);
};




/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.shaderFragmentSrc = [
  "precision mediump float;",
  "varying vec2 vTextureCoord;",
  "varying float vColor;",
  "uniform sampler2D uSampler;",
  "void main(void) {",
    "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));",
    "gl_FragColor = gl_FragColor * vColor;",
  "}"
];

PIXI.shaderVertexSrc = [
  "attribute vec2 aVertexPosition;",
  "attribute vec2 aTextureCoord;",
  "attribute float aColor;",
  "uniform mat4 uMVMatrix;",
  "varying vec2 vTextureCoord;",
  "varying float vColor;",
  "void main(void) {",
    "gl_Position = uMVMatrix * vec4(aVertexPosition, 1.0, 1.0);",
    "vTextureCoord = aTextureCoord;",
    "vColor = aColor;",
  "}"
];

PIXI.CompileVertexShader = function(gl, shaderSrc)
{
  return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
}

PIXI.CompileFragmentShader = function(gl, shaderSrc)
{
  return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
}

PIXI._CompileShader = function(gl, shaderSrc, shaderType)
{
  var src = shaderSrc.join("\n");
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI._defaultFrame = new PIXI.Rectangle(0,0,1,1);

/**
 * the WebGLRenderer is draws the stage and all its content onto a webGL enabled canvas. This renderer should be used for browsers support webGL. This Render works by automatically managing webGLBatchs. So no need for Sprite Batch's or Sprite Cloud's
 * Dont forget to add the view to your DOM or you will not see anything :)
 * @class WebGLRenderer
 * @constructor
 * @param width {Number} the width of the canvas view
 * @default 0
 * @param height {Number} the height of the canvas view
 * @default 0
 * @param view {Canvas} the canvas to use as a view, optional
 * @param transparent {Boolean} the transparency of the render view, default false
 * @default false
 * 
 */
PIXI.WebGLRenderer = function(width, height, view, transparent)
{
	// do a catch.. only 1 webGL renderer..

	//console.log(transparent)
	this.transparent = !!transparent;
	
	this.width = width || 800;
	this.height = height || 600;
	
	this.view = view || document.createElement( 'canvas' ); 
    this.view.width = this.width;
	this.view.height = this.height;  
	
	// deal with losing context..	
    var scope = this;
	this.view.addEventListener('webglcontextlost', function(event) { scope.handleContextLost(event); }, false)
	this.view.addEventListener('webglcontextrestored', function(event) { scope.handleContextRestored(event); }, false)

	this.batchs = [];
	
	try 
 	{
        this.gl = this.view.getContext("experimental-webgl",  {  	
    		 alpha: this.transparent,
    		 antialias:false, // SPEED UP??
    		 premultipliedAlpha:true
        });
    } 
    catch (e) 
    {
    	throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
    }
    
    this.initShaders();
    
    
    var gl = this.gl;
    
    this.batch = new PIXI.WebGLBatch(gl);
   	gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, this.transparent); 
    
    this.projectionMatrix =  PIXI.mat4.create();
    this.resize(this.width, this.height)
    this.contextLost = false;
}

// constructor
PIXI.WebGLRenderer.constructor = PIXI.WebGLRenderer;

/**
 * @private 
 */
PIXI.WebGLRenderer.prototype.getBatch = function()
{
	if(PIXI._batchs.length == 0)
	{
		return new PIXI.WebGLBatch(this.gl);
	}
	else
	{
		return PIXI._batchs.pop();
	}
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.returnBatch = function(batch)
{
	batch.clean();	
	PIXI._batchs.push(batch);
}


/**
 * @private
 */
PIXI.WebGLRenderer.prototype.initShaders = function() 
{
	var gl = this.gl;
	var fragmentShader = PIXI.CompileFragmentShader(gl, PIXI.shaderFragmentSrc);
	var vertexShader = PIXI.CompileVertexShader(gl, PIXI.shaderVertexSrc);
	
	this.shaderProgram = gl.createProgram();
	
	var shaderProgram = this.shaderProgram;
	
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	
	shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");
    gl.enableVertexAttribArray(shaderProgram.colorAttribute);


    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	
	PIXI.shaderProgram = this.shaderProgram;
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.checkVisibility = function(displayObject, globalVisible)
{
	var children = displayObject.children;
	
	
	for (var i=0; i < children.length; i++) 
	{
		var child = children[i];
		
		// TODO optimize... shouldt need to loop through everything all the time
		var actualVisibility = child.visible && globalVisible;
		
		// everything should have a batch!
		// time to see whats new!
		if(child.textureChange)
		{
			child.textureChange = false;
			if(actualVisibility)
			{
				this.removeDisplayObject(child)
				this.addDisplayObject(child)
			}
			// update texture!!
		}
		
		if(child.cacheVisible != actualVisibility)
		{
			child.cacheVisible = actualVisibility;
			
			if(child.cacheVisible)
			{
				this.addDisplayObject(child);
			}
			else
			{
				this.removeDisplayObject(child);
			}
		}
		
		if(child.children.length > 0)
		{
			this.checkVisibility(child, actualVisibility);
		}
	};
}


/**
 * Renders the stage to its webGL view
 * @method render
 * @param stage {Stage} the PIXI.Stage element to be rendered
 */
PIXI.WebGLRenderer.prototype.render = function(stage)
{
	if(this.contextLost)return;
	
	
	// if rendering a new stage clear the batchs..
	if(this.__stage !== stage)
	{
		if(this.__stage)this.checkVisibility(this.__stage, false)
		this.__stage = stage;
	}
	
	// update children if need be
	// best to remove first!
	for (var i=0; i < stage.__childrenRemoved.length; i++)
	{
		this.removeDisplayObject(stage.__childrenRemoved[i]);
	}



	// update any textures	
	for (var i=0; i < PIXI.texturesToUpdate.length; i++) this.updateTexture(PIXI.texturesToUpdate[i]);
	for (var i=0; i < PIXI.texturesToDestroy.length; i++) this.destroyTexture(PIXI.texturesToDestroy[i]);
	
	// empty out the arrays
	stage.__childrenRemoved = [];
	stage.__childrenAdded = [];
	PIXI.texturesToUpdate = [];
	PIXI.texturesToDestroy = [];
	// recursivly loop through all items!
	this.checkVisibility(stage, true);
	
	// update the scene graph	
	stage.updateTransform();
	
	var gl = this.gl;
	
	gl.clear(gl.COLOR_BUFFER_BIT)

	gl.clearColor(stage.backgroundColorSplit[0], stage.backgroundColorSplit[1], stage.backgroundColorSplit[2], 0);     
	
	
	// set the correct blend mode!
 	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.projectionMatrix);
   
	// render all the batchs!	
	
	
	var renderable;
	for (var i=0; i < this.batchs.length; i++) 
	{
		renderable = this.batchs[i];
		if(renderable instanceof PIXI.WebGLBatch)
		{
			this.batchs[i].render();
		}
		else if(renderable instanceof PIXI.TilingSprite)
		{
			if(renderable.visible)this.renderTilingSprite(renderable);
		}
		else if(renderable instanceof PIXI.Strip)
		{
			if(renderable.visible)this.renderStrip(renderable);
		}
	}
	
	// interaction
	// run interaction!
	if(stage.interactive)
	{
		//need to add some events!
		if(!stage._interactiveEventsAdded)
		{
			stage._interactiveEventsAdded = true;
			stage.interactionManager.setTarget(this);
		}
	}
	
	// after rendering lets confirm all frames that have been uodated..
	if(PIXI.Texture.frameUpdates.length > 0)
	{
		for (var i=0; i < PIXI.Texture.frameUpdates.length; i++) 
		{
		  	PIXI.Texture.frameUpdates[i].updateFrame = false;
		};
		
		PIXI.Texture.frameUpdates = [];
	}
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.updateTexture = function(texture)
{
	var gl = this.gl;
	
	if(!texture._glTexture)
	{
		texture._glTexture = gl.createTexture();
	}
	
	if(texture.hasLoaded)
	{
		gl.bindTexture(gl.TEXTURE_2D, texture._glTexture);
	 	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
		// reguler...
		
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		if(!texture._powerOf2)
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		else
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}
		
	//	gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	this.refreshBatchs = true;
}

PIXI.WebGLRenderer.prototype.destroyTexture = function(texture)
{
	var gl = this.gl;
	
	if(texture._glTexture)
	{
		texture._glTexture = gl.createTexture();
		gl.deleteTexture(gl.TEXTURE_2D, texture._glTexture);
	}
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.addDisplayObject = function(displayObject)
{
	var objectDetaildisplayObject
	if(!displayObject.stage)return; // means it was removed 
	if(displayObject.__inWebGL)return; //means it is already in webgL
	
	//displayObject.cacheVisible = displayObject.visible;
	
	// TODO if objects parent is not visible then dont add to stage!!!!
	//if(!displayObject.visible)return;

	
	displayObject.batch = null;
	
	//displayObject.cacheVisible = true;
	if(!displayObject.renderable)return;

	// while looping below THE OBJECT MAY NOT HAVE BEEN ADDED
	displayObject.__inWebGL = true;

	/*
	 *  LOOK FOR THE PREVIOUS SPRITE
	 *  This part looks for the closest previous sprite that can go into a batch
	 *  It keeps going back until it finds a sprite or the stage
	 */
	var previousSprite = displayObject;
	do
	{
		if(previousSprite.childIndex == 0)
		{
			previousSprite = previousSprite.parent;
			
		}
		else
		{
			previousSprite = previousSprite.parent.children[previousSprite.childIndex-1];
			// what if the bloop has children???
			while(previousSprite.children.length != 0)
			{
				// keep diggin till we get to the last child
				previousSprite = previousSprite.children[previousSprite.children.length-1];
			}
		}
		
		if(previousSprite == displayObject.stage)break;
	}
	while(!previousSprite.renderable || !previousSprite.__inWebGL)
	//while(!(previousSprite instanceof PIXI.Sprite))

	/*
	 *  LOOK FOR THE NEXT SPRITE
	 *  This part looks for the closest next sprite that can go into a batch
	 *  it keeps looking until it finds a sprite or gets to the end of the display
	 *  scene graph
	 * 
	 *  These look a lot scarier than the actually are...
	 */
	var nextSprite = displayObject;
	do
	{
		// moving forward!
		// if it has no children.. 
		if(nextSprite.children.length == 0)
		{
			// go along to the parent..
			while(nextSprite.childIndex == nextSprite.parent.children.length-1)
			{
				nextSprite = nextSprite.parent;
				if(nextSprite == displayObject.stage)
				{
					nextSprite = null
					break;
				}
			}
			
			if(nextSprite)nextSprite = nextSprite.parent.children[nextSprite.childIndex+1];
			
		}
		else
		{
			nextSprite = nextSprite.children[0];
		}

		if(!nextSprite)break;
	}
	while(!nextSprite.renderable || !nextSprite.__inWebGL)
	
	/*
	 * so now we have the next renderable and the previous renderable
	 * 
	 */
	
	if(displayObject instanceof PIXI.Sprite)
	{
		var previousBatch
		var nextBatch
		
		if(previousSprite instanceof PIXI.Sprite)
		{
			previousBatch = previousSprite.batch;
			
			if(previousBatch)
			{
				if(previousBatch.texture == displayObject.texture.baseTexture && previousBatch.blendMode == displayObject.blendMode)
				{
					previousBatch.insertAfter(displayObject, previousSprite);
					return;
				}
			}
		}
		else
		{
			// TODO reword!
			previousBatch = previousSprite;
		}
	
		if(nextSprite)
		{
			if(nextSprite instanceof PIXI.Sprite)
			{
				nextBatch = nextSprite.batch;
			
				//batch may not exist if item was added to the display list but not to the webGL
				if(nextBatch)
				{
					if(nextBatch.texture == displayObject.texture.baseTexture && nextBatch.blendMode == displayObject.blendMode)
					{
						nextBatch.insertBefore(displayObject, nextSprite);
						return;
					}
					else
					{
						if(nextBatch == previousBatch)
						{
							// THERE IS A SPLIT IN THIS BATCH! //
							var splitBatch = previousBatch.split(nextSprite);
							// COOL!
							// add it back into the array	
							/*
							 * OOPS!
							 * seems the new sprite is in the middle of a batch
							 * lets split it.. 
							 */
							var batch = this.getBatch();

							var index = this.batchs.indexOf( previousBatch );
							batch.init(displayObject);
							this.batchs.splice(index+1, 0, batch, splitBatch);
							
							return;
						}
					}
				}
			}
			else
			{
				// TODO re-word!
				nextBatch = nextSprite;
			}
		}
		
		/*
		 * looks like it does not belong to any batch!
		 * but is also not intersecting one..
		 * time to create anew one!
		 */
		
		var batch =  this.getBatch();
		batch.init(displayObject);

		if(previousBatch) // if this is invalid it means 
		{
			var index = this.batchs.indexOf( previousBatch );
			this.batchs.splice(index+1, 0, batch);
		}
		else
		{
			this.batchs.push(batch);
		}
	
	}
	else if(displayObject instanceof PIXI.TilingSprite)
	{
		// add to a batch!!
		this.initTilingSprite(displayObject);
		this.batchs.push(displayObject);
		
	}
	else if(displayObject instanceof PIXI.Strip)
	{
		// add to a batch!!
		this.initStrip(displayObject);
		this.batchs.push(displayObject);
		
	}
	
	// if its somthing else... then custom codes!
	this.batchUpdate = true;
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.removeDisplayObject = function(displayObject)
{
	//if(displayObject.stage)return;
	displayObject.cacheVisible = false;//displayObject.visible;
	
	if(!displayObject.renderable)return;
	
	displayObject.__inWebGL = false;
		
	/*
	 * removing is a lot quicker..
	 * 
	 */
	var batchToRemove;
	
	if(displayObject instanceof PIXI.Sprite)
	{
		// should always have a batch!
		var batch = displayObject.batch;
		if(!batch)return; // this means the display list has been altered befre rendering
		
		batch.remove(displayObject);
		
		if(batch.size==0)
		{
			batchToRemove = batch
		}
	}
	else
	{
		batchToRemove = displayObject;
	}
	
	/*
	 * Looks like there is somthing that needs removing!
	 */
	if(batchToRemove)	
	{
		var index = this.batchs.indexOf( batchToRemove );
		if(index == -1)return;// this means it was added then removed before rendered
		
		// ok so.. check to see if you adjacent batchs should be joined.
		// TODO may optimise?
		if(index == 0 || index == this.batchs.length-1)
		{
			// wha - eva! just get of the empty batch!
			this.batchs.splice(index, 1);
			if(batchToRemove instanceof PIXI.WebGLBatch)this.returnBatch(batchToRemove);
		
			return;
		}
		
		if(this.batchs[index-1] instanceof PIXI.WebGLBatch && this.batchs[index+1] instanceof PIXI.WebGLBatch)
		{
			if(this.batchs[index-1].texture == this.batchs[index+1].texture && this.batchs[index-1].blendMode == this.batchs[index+1].blendMode)
			{
				//console.log("MERGE")
				this.batchs[index-1].merge(this.batchs[index+1]);
				
				if(batchToRemove instanceof PIXI.WebGLBatch)this.returnBatch(batchToRemove);
				this.returnBatch(this.batchs[index+1]);
				this.batchs.splice(index, 2);
				return;
			}
		}
		
		
		this.batchs.splice(index, 1);
		if(batchToRemove instanceof PIXI.WebGLBatch)this.returnBatch(batchToRemove);
	}
	
	
}

/**
 * resizes the webGL view to the specified width and height
 * @method resize
 * @param width {Number} the new width of the webGL view
 * @param height {Number} the new height of the webGL view
 */
PIXI.WebGLRenderer.prototype.resize = function(width, height)
{
	this.width = width;
	this.height = height;
	
	this.view.width = width;
	this.view.height = height;
	
	this.gl.viewport(0, 0, this.width, this.height);	
	
	var projectionMatrix = this.projectionMatrix;
	
	projectionMatrix[0] = 2/this.width;
	projectionMatrix[5] = -2/this.height;
	projectionMatrix[12] = -1;
	projectionMatrix[13] = 1;
}


/**
 * @private
 */
PIXI.WebGLRenderer.prototype.initTilingSprite = function(sprite)
{
	
	
				
	var gl = this.gl;

	// make the texture tilable..
			
	sprite.verticies = new Float32Array([0, 0,
										  sprite.width, 0,
										  sprite.width,  sprite.height,
										 0,  sprite.height]);
					
	sprite.uvs = new Float32Array([0, 0,
									1, 0,
									1, 1,
									0, 1]);
				
	sprite.colors = new Float32Array([1,1,1,1]);
	
	sprite.indices =  new Uint16Array([0, 1, 3,2])//, 2]);
	
	
	sprite._vertexBuffer = gl.createBuffer();
	sprite._indexBuffer = gl.createBuffer();
	sprite._uvBuffer = gl.createBuffer();
	sprite._colorBuffer = gl.createBuffer();
						
	gl.bindBuffer(gl.ARRAY_BUFFER, sprite._vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sprite.verticies, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, sprite._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  sprite.uvs, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, sprite._colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sprite.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sprite._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sprite.indices, gl.STATIC_DRAW);
    
//    return ( (x > 0) && ((x & (x - 1)) == 0) );

	if(sprite.texture.baseTexture._glTexture)
	{
    	gl.bindTexture(gl.TEXTURE_2D, sprite.texture.baseTexture._glTexture);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		sprite.texture.baseTexture._powerOf2 = true;
	}
	else
	{
		sprite.texture.baseTexture._powerOf2 = true;
	}
	
	/*
	var context = this.context;
	
 	if(!sprite.__tilePattern) sprite.__tilePattern = context.createPattern(sprite.texture.baseTexture.source, "repeat");
 	
	context.beginPath();
	
	var tilePosition = sprite.tilePosition;
	var tileScale = sprite.tileScale;
	
    // offset
    context.scale(tileScale.x,tileScale.y);
    context.translate(tilePosition.x, tilePosition.y);
 	
	context.fillStyle = sprite.__tilePattern;
	context.fillRect(-tilePosition.x,-tilePosition.y,sprite.width / tileScale.x, sprite.height / tileScale.y);
	
    context.translate(-tilePosition.x, -tilePosition.y);
	context.scale(1/tileScale.x, 1/tileScale.y);
	*/
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.renderTilingSprite = function(sprite)
{
	var gl = this.gl;
	var shaderProgram = this.shaderProgram;
	
	var tilePosition = sprite.tilePosition;
	var tileScale = sprite.tileScale;
	
	var offsetX =  tilePosition.x/sprite.texture.baseTexture.width;
	var offsetY =  tilePosition.y/sprite.texture.baseTexture.height;
	
	var scaleX =  (sprite.width / sprite.texture.baseTexture.width)  / tileScale.x///sprite.texture.baseTexture.width;
	var scaleY =  (sprite.height / sprite.texture.baseTexture.height) / tileScale.y///sprite.texture.baseTexture.height;
	//
	//sprite.dirty = true;
	sprite.uvs[0] = 0 + offsetX
	sprite.uvs[1] = 0 - offsetY;
	
	sprite.uvs[2] = (1 * scaleX)  +offsetX
	sprite.uvs[3] = 0 - offsetY;
	
	sprite.uvs[4] = (1 *scaleX) + offsetX
	sprite.uvs[5] = (1 *scaleY) - offsetY;
	
	sprite.uvs[6] = 0  + offsetX
	sprite.uvs[7] = (1 *scaleY) - offsetY;
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sprite._uvBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, sprite.uvs)
	
	this.renderStrip(sprite);
 
}



/**
 * @private
 */
PIXI.WebGLRenderer.prototype.initStrip = function(strip)
{
	// build the strip!
	var gl = this.gl;
	var shaderProgram = this.shaderProgram;
	
	strip._vertexBuffer = gl.createBuffer();
	strip._indexBuffer = gl.createBuffer();
	strip._uvBuffer = gl.createBuffer();
	strip._colorBuffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, strip._vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, strip.verticies, gl.DYNAMIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, strip._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  strip.uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, strip._colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, strip.colors, gl.STATIC_DRAW);

	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, strip._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, strip.indices, gl.STATIC_DRAW);
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.renderStrip = function(strip)
{
	var gl = this.gl;
	var shaderProgram = this.shaderProgram;
//	mat
	var mat4Real = PIXI.mat3.toMat4(strip.worldTransform);
	PIXI.mat4.transpose(mat4Real);
	PIXI.mat4.multiply(this.projectionMatrix, mat4Real, mat4Real )

	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mat4Real);
  
	if(strip.blendMode == PIXI.blendModes.NORMAL)
	{
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}
	else
	{
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
	}
	
	if(!strip.dirty)
	{
		
		gl.bindBuffer(gl.ARRAY_BUFFER, strip._vertexBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, strip.verticies)
	    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
		
		// update the uvs
	   	gl.bindBuffer(gl.ARRAY_BUFFER, strip._uvBuffer);
	    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
			
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, strip.texture.baseTexture._glTexture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, strip._colorBuffer);
	    gl.vertexAttribPointer(shaderProgram.colorAttribute, 1, gl.FLOAT, false, 0, 0);
		
		// dont need to upload!
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, strip._indexBuffer);
    
	
	}
	else
	{
		strip.dirty = false;
		gl.bindBuffer(gl.ARRAY_BUFFER, strip._vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, strip.verticies, gl.STATIC_DRAW)
	    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
		
		// update the uvs
	   	gl.bindBuffer(gl.ARRAY_BUFFER, strip._uvBuffer);
	   	gl.bufferData(gl.ARRAY_BUFFER, strip.uvs, gl.STATIC_DRAW)
	    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
			
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, strip.texture.baseTexture._glTexture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, strip._colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, strip.colors, gl.STATIC_DRAW)
	    gl.vertexAttribPointer(shaderProgram.colorAttribute, 1, gl.FLOAT, false, 0, 0);
		
		// dont need to upload!
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, strip._indexBuffer);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, strip.indices, gl.STATIC_DRAW);
	    
	}
	//console.log(gl.TRIANGLE_STRIP)
	gl.drawElements(gl.TRIANGLE_STRIP, strip.indices.length, gl.UNSIGNED_SHORT, 0);
    
    gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.projectionMatrix);
  
  //  console.log("!!!")
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.handleContextLost = function(event)
{
	event.preventDefault();
	this.contextLost = true;
}

/**
 * @private
 */
PIXI.WebGLRenderer.prototype.handleContextRestored = function(event)
{
	this.gl = this.view.getContext("experimental-webgl",  {  	
		alpha: true
    });
        
	this.initShaders();	
	
	for (var i=0; i < PIXI.TextureCache.length; i++) 
	{
		this.updateTexture(PIXI.TextureCache[i]);
	};
	
	for (var i=0; i <  this.batchs.length; i++) 
	{
		this.batchs[i].restoreLostContext(this.gl)//
		this.batchs[i].dirty = true;
	};
	
	PIXI._restoreBatchs(this.gl);
	
	this.contextLost = false;
}


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI._batchs = [];

/**
 * @private
 */
PIXI._getBatch = function(gl)
{
	if(PIXI._batchs.length == 0)
	{
		return new PIXI.WebGLBatch(gl);
	}
	else
	{
		return PIXI._batchs.pop();
	}
}

/**
 * @private
 */
PIXI._returnBatch = function(batch)
{
	batch.clean();	
	PIXI._batchs.push(batch);
}

/**
 * @private
 */
PIXI._restoreBatchs = function(gl)
{
	for (var i=0; i < PIXI._batchs.length; i++) 
	{
	  PIXI._batchs[i].restoreLostContext(gl);
	};
}

/**
 * A WebGLBatch Enables a group of sprites to be drawn using the same settings.
 * if a group of sprites all have the same baseTexture and blendMode then they can be grouped into a batch. All the sprites in a batch can then be drawn in one go by the GPU which is hugely efficient. ALL sprites in the webGL renderer are added to a batch even if the batch only contains one sprite. Batching is handled automatically by the webGL renderer. A good tip is: the smaller the number of batchs there are, the faster the webGL renderer will run. 
 * @class WebGLBatch
 * @param an instance of the webGL context
 * @return {PIXI.renderers.WebGLBatch} WebGLBatch {@link PIXI.renderers.WebGLBatch}
 */
PIXI.WebGLBatch = function(gl)
{
	this.gl = gl;
	
	this.size = 0;

	this.vertexBuffer =  gl.createBuffer();
	this.indexBuffer =  gl.createBuffer();
	this.uvBuffer =  gl.createBuffer();
	this.colorBuffer =  gl.createBuffer();
	this.blendMode = PIXI.blendModes.NORMAL;
	this.dynamicSize = 1;
}


// constructor
PIXI.WebGLBatch.constructor = PIXI.WebGLBatch;

/**
 * Cleans the batch so that is can be returned to an object pool and reused
 */
PIXI.WebGLBatch.prototype.clean = function()
{
	this.verticies = [];
	this.uvs = [];
	this.indices = [];
	this.colors = [];
	//this.sprites = [];
	this.dynamicSize = 1;
	this.texture = null;
	this.last = null;
	this.size = 0;
	
	this.head;
	this.tail;
}

/*
 * recreates the buffers in the event of a context loss
 */
PIXI.WebGLBatch.prototype.restoreLostContext = function(gl)
{
	this.gl = gl;
	this.vertexBuffer =  gl.createBuffer();
	this.indexBuffer =  gl.createBuffer();
	this.uvBuffer =  gl.createBuffer();
	this.colorBuffer =  gl.createBuffer();
}

/**
 * inits the batch's texture and blend mode based if the supplied sprite
 * @method init
 * @param sprite {Sprite} the first sprite to be added to the batch. Only sprites with the same base texture and blend mode will be allowed to be added to this batch
 */	
PIXI.WebGLBatch.prototype.init = function(sprite)
{
	sprite.batch = this;
	this.dirty = true;
	this.blendMode = sprite.blendMode;
	this.texture = sprite.texture.baseTexture;
//	this.sprites.push(sprite);
	this.head = sprite;
	this.tail = sprite;
	this.size = 1;
	
	this.growBatch();
}

/**
 * inserts a sprite before the specified sprite
 * @method insertBefore
 * @param sprite {Sprite} the sprite to be added
 * @param nextSprite {nextSprite} the first sprite will be inserted before this sprite
 */	
PIXI.WebGLBatch.prototype.insertBefore = function(sprite, nextSprite)
{
	this.size++;
	
	sprite.batch = this;
	this.dirty = true;
	var tempPrev = nextSprite.__prev;
	nextSprite.__prev = sprite;
	sprite.__next = nextSprite;
	
	if(tempPrev)
	{
		sprite.__prev = tempPrev;
		tempPrev.__next = sprite;
	}
	else
	{
		this.head = sprite;
		//this.head.__prev = null
	}
}

/**
 * inserts a sprite after the specified sprite
 * @method insertAfter
 * @param sprite {Sprite} the sprite to be added
 * @param  previousSprite {Sprite} the first sprite will be inserted after this sprite
 */	
PIXI.WebGLBatch.prototype.insertAfter = function(sprite, previousSprite)
{
	this.size++;
	
	
	sprite.batch = this;
	this.dirty = true;
	
	var tempNext = previousSprite.__next;
	previousSprite.__next = sprite;
	sprite.__prev = previousSprite;
	
	if(tempNext)
	{
		sprite.__next = tempNext;
		tempNext.__prev = sprite;
	}
	else
	{
		this.tail = sprite
	}
	
}

/**
 * removes a sprite from the batch
 * @method remove
 * @param sprite {Sprite} the sprite to be removed
 */	
PIXI.WebGLBatch.prototype.remove = function(sprite)
{
	this.size--;
	
	if(this.size == 0)
	{
		sprite.batch = null;
		sprite.__prev = null;
		sprite.__next = null;
		return;
	}
	
	if(sprite.__prev)
	{
		sprite.__prev.__next = sprite.__next;
	}
	else
	{
		this.head = sprite.__next;
		this.head.__prev = null;
	}
	
	if(sprite.__next)
	{
		sprite.__next.__prev = sprite.__prev;
	}
	else
	{
		this.tail = sprite.__prev;
		this.tail.__next = null
	}
	
	sprite.batch = null;
	sprite.__next = null;
	sprite.__prev = null;
	this.dirty = true;
}

/**
 * Splits the batch into two with the specified sprite being the start of the new batch.
 * @method split
 * @param sprite {Sprite} the sprite that indicates where the batch should be split
 * @return {WebGLBatch} the new batch
 */
PIXI.WebGLBatch.prototype.split = function(sprite)
{
	
	//console.log("Splitting batch :" + this.size)
//	console.log(sprite)
//	console.log("-------")
	this.dirty = true;
	
	//var val = (this.tail == this.head)
	//console.log(val + " SAME?");
	var batch = new PIXI.WebGLBatch(this.gl)//PIXI._getBatch(this.gl);
	batch.init(sprite);
	batch.tail = this.tail;
	//console.log("id is " +batcheee.id)
	
	this.tail = sprite.__prev;
	this.tail.__next = null;
	
	sprite.__prev = null;
	// return a splite batch!
	//sprite.__prev.__next = null;
	//sprite.__prev = null;
	
	
	// TODO this size is wrong!
	// need to recalculate :/ problem with a linked list!
	// unless it gets calculated in the "clean"?
	
	// need to loop through items as there is no way to know the length on a linked list :/
	var tempSize = 0;
	while(sprite)
	{
		tempSize++;
		sprite.batch = batch;
		sprite = sprite.__next;
	}
	
	batch.size = tempSize;
	this.size -= tempSize;
	
	return batch;
}

/**
 * Merges two batchs together
 * @method merge
 * @param batch {WebGLBatch} the batch that will be merged 
 */
PIXI.WebGLBatch.prototype.merge = function(batch)
{
	this.dirty = true;
	
	this.tail.__next = batch.head;
	batch.head.__prev = this.tail;
	
	this.size += batch.size;
			
	this.tail = batch.tail;
	
	var sprite = batch.head;
	while(sprite)
	{
		sprite.batch = this;
		sprite = sprite.__next;
	}
	
}

/**
 * Grows the size of the batch. As the elements in the batch cannot have a dynamic size this function is used to increase the size of the batch. It also creates a little extra room so that the batch does not need to be resized every time a sprite is added
 * @methos growBatch
 */
PIXI.WebGLBatch.prototype.growBatch = function()
{
	var gl = this.gl;
	if( this.size == 1)
	{
		this.dynamicSize = 1;
	}
	else
	{
		this.dynamicSize = this.size * 1.5
	}
	// grow verts
	this.verticies = new Float32Array(this.dynamicSize * 8);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,this.verticies , gl.DYNAMIC_DRAW);
	
	this.uvs  = new Float32Array( this.dynamicSize * 8 )  
	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.uvs , gl.DYNAMIC_DRAW);
	
	this.dirtyUVS = true;
	
	this.colors  = new Float32Array( this.dynamicSize * 4 )  
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.colors , gl.DYNAMIC_DRAW);
	
	this.dirtyColors = true;
	
	this.indices = new Uint16Array(this.dynamicSize * 6); 
	var length = this.indices.length/6;
	
	for (var i=0; i < length; i++) 
	{
	    var index2 = i * 6;
	    var index3 = i * 4;
		this.indices[index2 + 0] = index3 + 0;
		this.indices[index2 + 1] = index3 + 1;
		this.indices[index2 + 2] = index3 + 2;
		this.indices[index2 + 3] = index3 + 0;
		this.indices[index2 + 4] = index3 + 2;
		this.indices[index2 + 5] = index3 + 3;
	};
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
	
}

/**
 * Refresh's all the data in the batch and sync's it with the webGL buffers
 * @method refresh
 */
PIXI.WebGLBatch.prototype.refresh = function()
{
	var gl = this.gl;
	
	if (this.dynamicSize < this.size)
	{
		this.growBatch();
	}

	var indexRun = 0;
	var worldTransform, width, height, aX, aY, w0, w1, h0, h1, index
	var a, b, c, d, tx, ty
	
	var displayObject = this.head

	while(displayObject)
	{
		index = indexRun * 8;
		
		var texture = displayObject.texture;
			
		var frame = texture.frame;
		var tw = texture.baseTexture.width;
		var th = texture.baseTexture.height;
		
		this.uvs[index + 0] = frame.x / tw;
		this.uvs[index +1] = frame.y / th;
		
		this.uvs[index +2] = (frame.x + frame.width) / tw;
		this.uvs[index +3] = frame.y / th;
		
		this.uvs[index +4] = (frame.x + frame.width) / tw;
		this.uvs[index +5] = (frame.y + frame.height) / th; 
		
		this.uvs[index +6] = frame.x / tw;
		this.uvs[index +7] = (frame.y + frame.height) / th;
		
		displayObject.updateFrame = false;
		
		colorIndex = indexRun * 4;
		this.colors[colorIndex] = this.colors[colorIndex + 1] = this.colors[colorIndex + 2] = this.colors[colorIndex + 3] = displayObject.worldAlpha;
		
		displayObject = displayObject.__next;
		
		indexRun ++;
	}
	
	this.dirtyUVS = true;
	this.dirtyColors = true;
}

/**
 * Updates all the relevant geometry and uploads the data to the GPU
 * @method update
 */
PIXI.WebGLBatch.prototype.update = function()
{
	var gl = this.gl;
	var worldTransform, width, height, aX, aY, w0, w1, h0, h1, index, index2, index3
	
	var a, b, c, d, tx, ty;
	
	var indexRun = 0;
	
	var displayObject = this.head;
	
	while(displayObject)
	{
		width = displayObject.texture.frame.width;
		height = displayObject.texture.frame.height;
		
		aX = displayObject.anchor.x - displayObject.texture.trim.x
		aY = displayObject.anchor.y - displayObject.texture.trim.y
		w0 = width * (1-aX);
		w1 = width * -aX;
		 
		h0 = height * (1-aY);
		h1 = height * -aY;
		 
		index = indexRun * 8;

		worldTransform = displayObject.worldTransform;
	
		a = worldTransform[0];
		b = worldTransform[3];
		c = worldTransform[1];
		d = worldTransform[4];
		tx = worldTransform[2];
		ty = worldTransform[5];
		
		this.verticies[index + 0 ] = a * w1 + c * h1 + tx; 
		this.verticies[index + 1 ] = d * h1 + b * w1 + ty;
		 
		this.verticies[index + 2 ] = a * w0 + c * h1 + tx; 
		this.verticies[index + 3 ] = d * h1 + b * w0 + ty; 
		
		this.verticies[index + 4 ] = a * w0 + c * h0 + tx; 
		this.verticies[index + 5 ] = d * h0 + b * w0 + ty; 
		
		this.verticies[index + 6] =  a * w1 + c * h0 + tx; 
		this.verticies[index + 7] =  d * h0 + b * w1 + ty; 
		
		if(displayObject.updateFrame || displayObject.texture.updateFrame)
		{
			this.dirtyUVS = true;
			
			var texture = displayObject.texture;
			
			var frame = texture.frame;
			var tw = texture.baseTexture.width;
			var th = texture.baseTexture.height;
			
			this.uvs[index + 0] = frame.x / tw;
			this.uvs[index +1] = frame.y / th;
			
			this.uvs[index +2] = (frame.x + frame.width) / tw;
			this.uvs[index +3] = frame.y / th;
			
			this.uvs[index +4] = (frame.x + frame.width) / tw;
			this.uvs[index +5] = (frame.y + frame.height) / th; 
			
			this.uvs[index +6] = frame.x / tw;
			this.uvs[index +7] = (frame.y + frame.height) / th;
			
			displayObject.updateFrame = false;
		}
		
		// TODO this probably could do with some optimisation....
		if(displayObject.cacheAlpha != displayObject.worldAlpha)
		{
			displayObject.cacheAlpha = displayObject.worldAlpha;
			
			var colorIndex = indexRun * 4;
			this.colors[colorIndex] = this.colors[colorIndex + 1] = this.colors[colorIndex + 2] = this.colors[colorIndex + 3] = displayObject.worldAlpha;
			this.dirtyColors = true;
		}
		
		indexRun++;
		displayObject = displayObject.__next;
   }
}

/**
 * Draws the batch to the frame buffer
 * @method render
 */
PIXI.WebGLBatch.prototype.render = function()
{
	if(this.dirty)
	{
		this.refresh();
		this.dirty = false;
	}
	
	if (this.size == 0)return;
	
	this.update();
	var gl = this.gl;
	
	//TODO optimize this!
	if(this.blendMode == PIXI.blendModes.NORMAL)
	{
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}
	else
	{
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
	}
	
	var shaderProgram = PIXI.shaderProgram;
	
	// update the verts..
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	// ok..
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verticies)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
	
	// update the uvs
   	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);

    if(this.dirtyUVS)
    {
    	this.dirtyUVS = false;
    	gl.bufferSubData(gl.ARRAY_BUFFER,  0, this.uvs);
    }
    
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
	
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture._glTexture);
	
	// update color!
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

	if(this.dirtyColors)
    {
    	this.dirtyColors = false;
    	gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.colors);
	}
	
    gl.vertexAttribPointer(shaderProgram.colorAttribute, 1, gl.FLOAT, false, 0, 0);
	
	// dont need to upload!
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	    
    // DRAW THAT this!
    gl.drawElements(gl.TRIANGLES, this.size * 6, gl.UNSIGNED_SHORT, 0);
}


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * the CanvasRenderer draws the stage and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Dont forget to add the view to your DOM or you will not see anything :)
 * @class CanvasRenderer
 * @constructor
 * @param width {Number} the width of the canvas view
 * @default 0
 * @param height {Number} the height of the canvas view
 * @default 0
 * @param view {Canvas} the canvas to use as a view, optional
 * @param transparent {Boolean} the transparency of the render view, default false
 * @default false
 * 
 */
PIXI.CanvasRenderer = function(width, height, view, transparent)
{
	this.transparent = transparent;
	
	/**
	 * The width of the canvas view
	 * @property width
	 * @type Number
	 * @default 800
	 */
	this.width = width || 800;
	/**
	 * The height of the canvas view
	 * @property height
	 * @type Number
	 * @default 600
	 */
	this.height = height || 600;
	
	this.refresh = true;
	
	/**
	 * The canvas element that the everything is drawn to
	 * @property view
	 * @type Canvas
	 */
	this.view = view || document.createElement( 'canvas' ); 
	
	// hack to enable some hardware acceleration!
	//this.view.style["transform"] = "translatez(0)";
	
    this.view.width = this.width;
	this.view.height = this.height;  
	this.count = 0;
	
	/**
	 * The canvas context that the everything is drawn to
	 * @property context
	 * @type Canvas 2d Context
	 */
	this.context = this.view.getContext("2d");
}

// constructor
PIXI.CanvasRenderer.constructor = PIXI.CanvasRenderer;

/**
 * Renders the stage to its canvas view
 * @method render
 * @param stage {Stage} the Stage element to be rendered
 */
PIXI.CanvasRenderer.prototype.render = function(stage)
{
	// update children if need be
	
	stage.__childrenAdded = [];
	stage.__childrenRemoved = [];
	
	// update textures if need be
	PIXI.texturesToUpdate = [];
	PIXI.texturesToDestroy = [];
	
	this.context.setTransform(1,0,0,1,0,0); 
	stage.updateTransform();
	  
	this.context.setTransform(1,0,0,1,0,0); 
	
	// update the background color
	if(this.view.style.backgroundColor!=stage.backgroundColorString && !this.transparent)this.view.style.backgroundColor = stage.backgroundColorString;

	this.context.clearRect(0, 0, this.width, this.height)
    this.renderDisplayObject(stage);
    //as
   
    // run interaction!
	if(stage.interactive)
	{
		//need to add some events!
		if(!stage._interactiveEventsAdded)
		{
			stage._interactiveEventsAdded = true;
			stage.interactionManager.setTarget(this);
		}
	}
	
	// remove frame updates..
	if(PIXI.Texture.frameUpdates.length > 0)
	{
		PIXI.Texture.frameUpdates = [];
	}
}

/**
 * resizes the canvas view to the specified width and height
 * @param the new width of the canvas view
 * @param the new height of the canvas view
 */
PIXI.CanvasRenderer.prototype.resize = function(width, height)
{
	this.width = width;
	this.height = height;
	
	this.view.width = width;
	this.view.height = height;
}

/**
 * @private
 */
PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject)
{
	var transform = displayObject.worldTransform;
	var context = this.context;
	context.globalCompositeOperation = "source-over"
	var blit = false;
	
	if(!displayObject.visible)return;
		
	if(displayObject instanceof PIXI.Sprite)
	{
		var frame = displayObject.texture.frame;
		
		if(frame)
		{
			context.globalAlpha = displayObject.worldAlpha;
			
			// BLITZ!!!
			/*
			 * if the rotation is 0 then we can blitz it
			 * meaning we dont need to do a transform and also we
			 * can round to the nearest round number for a little extra speed!
			 */
			/*if(displayObject.rotation == 0)
			{
				if(!blit)this.context.setTransform(1,0,0,1,0,0); 
				blit = true;
				context.drawImage(displayObject.texture.baseTexture.image, 
								   frame.x,
								   frame.y,
								   frame.width,
								   frame.height,
								   (transform[2]+ ((displayObject.anchor.x - displayObject.texture.trim.x) * -frame.width) * transform[0]),
								   (transform[5]+ ((displayObject.anchor.y - displayObject.texture.trim.y) * -frame.height)* transform[4]),
								   (displayObject.width * transform[0]),
								   (displayObject.height * transform[4]));
				
			}	
			else
			{*/
				blit = false;
				context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5])
				context.drawImage(displayObject.texture.baseTexture.source, 
								   frame.x,
								   frame.y,
								   frame.width,
								   frame.height,
								   (displayObject.anchor.x - displayObject.texture.trim.x) * -frame.width, 
								   (displayObject.anchor.y - displayObject.texture.trim.y) * -frame.height,
								   frame.width,
								   frame.height);
			//}
		}					   
   	}
   	else if(displayObject instanceof PIXI.Strip)
	{
		context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5])
		this.renderStrip(displayObject);
	}
	else if(displayObject instanceof PIXI.TilingSprite)
	{
		context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5])
		this.renderTilingSprite(displayObject);
	}
	
	// render!
	for (var i=0; i < displayObject.children.length; i++) 
	{
		this.renderDisplayObject(displayObject.children[i]);
	}
	
	
}

/**
 * @private
 */
PIXI.CanvasRenderer.prototype.renderStripFlat = function(strip)
{
	var context = this.context;
	var verticies = strip.verticies;
	var uvs = strip.uvs;
	
	var length = verticies.length/2;
	this.count++;
	
	context.beginPath();
	for (var i=1; i < length-2; i++) 
	{
		
		// draw some triangles!
		var index = i*2;
		
		 var x0 = verticies[index],   x1 = verticies[index+2], x2 = verticies[index+4];
 		 var y0 = verticies[index+1], y1 = verticies[index+3], y2 = verticies[index+5];
 		 
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.lineTo(x2, y2);
		
	};	
	
//	context.globalCompositeOperation = 'lighter';
	context.fillStyle = "#FF0000";
	context.fill();
	context.closePath();
	//context.globalCompositeOperation = 'source-over';	
}

/**
 * @private
 */
PIXI.CanvasRenderer.prototype.renderTilingSprite = function(sprite)
{
	var context = this.context;
	
 	if(!sprite.__tilePattern) sprite.__tilePattern = context.createPattern(sprite.texture.baseTexture.source, "repeat");
 	
	context.beginPath();
	
	var tilePosition = sprite.tilePosition;
	var tileScale = sprite.tileScale;
	
    // offset
    context.scale(tileScale.x,tileScale.y);
    context.translate(tilePosition.x, tilePosition.y);
 	
	context.fillStyle = sprite.__tilePattern;
	context.fillRect(-tilePosition.x,-tilePosition.y,sprite.width / tileScale.x, sprite.height / tileScale.y);
	
	context.scale(1/tileScale.x, 1/tileScale.y);
    context.translate(-tilePosition.x, -tilePosition.y);
    
    context.closePath();
}



/**
 * @private
 */
PIXI.CanvasRenderer.prototype.renderStrip = function(strip)
{
	var context = this.context;
	//context.globalCompositeOperation = 'lighter';
	// draw triangles!!
	var verticies = strip.verticies;
	var uvs = strip.uvs;
	
	var length = verticies.length/2;
	this.count++;
	for (var i=1; i < length-2; i++) 
	{
		
		// draw some triangles!
		var index = i*2;
		
		 var x0 = verticies[index],   x1 = verticies[index+2], x2 = verticies[index+4];
 		 var y0 = verticies[index+1], y1 = verticies[index+3], y2 = verticies[index+5];
 		 
  		 var u0 = uvs[index] * strip.texture.width,   u1 = uvs[index+2] * strip.texture.width, u2 = uvs[index+4]* strip.texture.width;
   		 var v0 = uvs[index+1]* strip.texture.height, v1 = uvs[index+3] * strip.texture.height, v2 = uvs[index+5]* strip.texture.height;


		context.save();
		context.beginPath();
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.lineTo(x2, y2);
		context.closePath();
		
	//	context.fillStyle = "white"//rgb(1, 1, 1,1));
	//	context.fill();
		context.clip();
		
		
        // Compute matrix transform
        var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
        var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
        var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
        var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2 - v0*u1*x2 - u0*x1*v2;
        var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
        var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
        var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2 - v0*u1*y2 - u0*y1*v2;
		
		
		
		    
        context.transform(delta_a/delta, delta_d/delta,
                      delta_b/delta, delta_e/delta,
                      delta_c/delta, delta_f/delta);
                 
		context.drawImage(strip.texture.baseTexture.source, 0, 0);
	  	context.restore();
	};
	
//	context.globalCompositeOperation = 'source-over';	
}









/**
 * @author Mat Groves http://matgroves.com/
 */

PIXI.Strip = function(texture, width, height)
{
	PIXI.DisplayObjectContainer.call( this );
	this.texture = texture;
	this.blendMode = PIXI.blendModes.NORMAL;
	
	try
	{
		this.uvs = new Float32Array([0, 1,
				1, 1,
				1, 0, 0,1]);
	
		this.verticies = new Float32Array([0, 0,
						  0,0,
						  0,0, 0,
						  0, 0]);
						  
		this.colors = new Float32Array([1, 1, 1, 1]);
		
		this.indices = new Uint16Array([0, 1, 2, 3]);
	}
	catch(error)
	{
		this.uvs = [0, 1,
				1, 1,
				1, 0, 0,1];
	
		this.verticies = [0, 0,
						  0,0,
						  0,0, 0,
						  0, 0];
						  
		this.colors = [1, 1, 1, 1];
		
		this.indices = [0, 1, 2, 3];
	}
	
	
	/*
	this.uvs = new Float32Array()
	this.verticies = new Float32Array()
	this.colors = new Float32Array()
	this.indices = new Uint16Array()
*/
	this.width = width;
	this.height = height;
	
	// load the texture!
	if(texture.baseTexture.hasLoaded)
	{
		this.width   = this.texture.frame.width;
		this.height  = this.texture.frame.height;
		this.updateFrame = true;
	}
	else
	{
		this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
		this.texture.addEventListener( 'update', this.onTextureUpdateBind );
	}
	
	this.renderable = true;
}

// constructor
PIXI.Strip.constructor = PIXI.Strip;
PIXI.Strip.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

PIXI.Strip.prototype.setTexture = function(texture)
{
	//TODO SET THE TEXTURES
	//TODO VISIBILITY
	
	// stop current texture 
	this.texture = texture;
	this.width   = texture.frame.width;
	this.height  = texture.frame.height;
	this.updateFrame = true;
}

PIXI.Strip.prototype.onTextureUpdate = function(event)
{
	this.updateFrame = true;
}
// some helper functions..


/**
 * @author Mat Groves http://matgroves.com/
 */


PIXI.Rope = function(texture, points)
{
	PIXI.Strip.call( this, texture );
	this.points = points;
	
	try
	{
		this.verticies = new Float32Array( points.length * 4);
		this.uvs = new Float32Array( points.length * 4);
		this.colors = new Float32Array(  points.length * 2);
		this.indices = new Uint16Array( points.length * 2);
	}
	catch(error)
	{
		this.verticies = verticies
		
		this.uvs = uvs
		this.colors = colors
		this.indices = indices
	}
	
	this.refresh();
}


// constructor
PIXI.Rope.constructor = PIXI.Rope;
PIXI.Rope.prototype = Object.create( PIXI.Strip.prototype );

PIXI.Rope.prototype.refresh = function()
{
	var points = this.points;
	if(points.length < 1)return;
	
	var uvs = this.uvs
	var indices = this.indices;
	var colors = this.colors;
	
	var lastPoint = points[0];
	var nextPoint;
	var perp = {x:0, y:0};
	var point = points[0];
	
	this.count-=0.2;
	
	
	uvs[0] = 0
	uvs[1] = 1
	uvs[2] = 0
	uvs[3] = 1
	
	colors[0] = 1;
	colors[1] = 1;
	
	indices[0] = 0;
	indices[1] = 1;
	
	var total = points.length;
		
	for (var i =  1; i < total; i++) 
	{
		
		var point = points[i];
		var index = i * 4;
		// time to do some smart drawing!
		var amount = i/(total-1)
		
		if(i%2)
		{
			uvs[index] = amount;
			uvs[index+1] = 0;
			
			uvs[index+2] = amount
			uvs[index+3] = 1
		
		}
		else
		{
			uvs[index] = amount
			uvs[index+1] = 0
			
			uvs[index+2] = amount
			uvs[index+3] = 1
		}
		
		index = i * 2;
		colors[index] = 1;
		colors[index+1] = 1;
		
		index = i * 2;
		indices[index] = index;
		indices[index + 1] = index + 1;
		
		lastPoint = point;
	}
}

PIXI.Rope.prototype.updateTransform = function()
{
	
	var points = this.points;
	if(points.length < 1)return;
	
	var verticies = this.verticies 
	
	var lastPoint = points[0];
	var nextPoint;
	var perp = {x:0, y:0};
	var point = points[0];
	
	this.count-=0.2;
	
	verticies[0] = point.x + perp.x 
	verticies[1] = point.y + perp.y //+ 200
	verticies[2] = point.x - perp.x 
	verticies[3] = point.y - perp.y//+200
	// time to do some smart drawing!
	
	var total = points.length;
		
	for (var i =  1; i < total; i++) 
	{
		
		var point = points[i];
		var index = i * 4;
		
		if(i < points.length-1)
		{
			nextPoint = points[i+1];
		}
		else
		{
			nextPoint = point
		}
		
		perp.y = -(nextPoint.x - lastPoint.x);
		perp.x = nextPoint.y - lastPoint.y;
		
		var ratio = (1 - (i / (total-1))) * 10;
				if(ratio > 1)ratio = 1;
				
		var perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
		var num = this.texture.height/2//(20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;
		perp.x /= perpLength;
		perp.y /= perpLength;
	
		perp.x *= num;
		perp.y *= num;
		
		verticies[index] = point.x + perp.x 
		verticies[index+1] = point.y + perp.y
		verticies[index+2] = point.x - perp.x 
		verticies[index+3] = point.y - perp.y

		lastPoint = point;
	}
	
	PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
}

PIXI.Rope.prototype.setTexture = function(texture)
{
	// stop current texture 
	this.texture = texture;
	this.updateFrame = true;
}





/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * A tiling sprite is a fast way of rendering a tiling image
 * @class TilingSprite
 * @extends DisplayObjectContainer
 * @constructor
 * @param texture {Texture} the texture of the tiling sprite
 * @param width {Number}  the width of the tiling sprite
 * @param height {Number} the height of the tiling sprite
 */
PIXI.TilingSprite = function(texture, width, height)
{
	PIXI.DisplayObjectContainer.call( this );
	
	this.texture = texture;
	this.width = width;
	this.height = height;
	this.renderable = true;
	
	/**
	 * The scaling of the image that is being tiled
	 * @property tileScale
	 * @type Point
	 */	
	this.tileScale = new PIXI.Point(1,1);
	/**
	 * The offset position of the image that is being tiled
	 * @property tileScale
	 * @type Point
	 */	
	this.tilePosition = new PIXI.Point(0,0);
	
	this.blendMode = PIXI.blendModes.NORMAL
}

// constructor
PIXI.TilingSprite.constructor = PIXI.TilingSprite;
PIXI.TilingSprite.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

PIXI.TilingSprite.prototype.setTexture = function(texture)
{
	//TODO SET THE TEXTURES
	//TODO VISIBILITY
	
	// stop current texture 
	this.texture = texture;
	this.updateFrame = true;
}

PIXI.TilingSprite.prototype.onTextureUpdate = function(event)
{
	this.updateFrame = true;
}
// some helper functions..


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.BaseTextureCache = {};
PIXI.texturesToUpdate = [];
PIXI.texturesToDestroy = [];

/**
 * A texture stores the information that represents an image. All textures have a base texture
 * @class BaseTexture
 * @extends EventTarget
 * @constructor
 * @param source {String} the source object (image or canvas)
 */
PIXI.BaseTexture = function(source)
{
	PIXI.EventTarget.call( this );
	
	/*
	 * The url of the texture
	 * @property imageUrl
	 * @type String
	 */
	//this.imageUrl = source.src;
	
	/**
	 * [read only] The width of the base texture set when the image has loaded
	 * @property width
	 * @type Number
	 */
	this.width = 100;
	/**
	 * [read only] The height of the base texture set when the image has loaded
	 * @property height
	 * @type Number
	 */
	this.height = 100;
	
	/**
	 * The source that is loaded to create the texture
	 * @property source
	 * @type Image
	 */
	this.source = source//new Image();
	
	if(this.source instanceof Image)
	{
		if(this.source.complete)
		{
			this.hasLoaded = true;
			this.width = this.source.width;
			this.height = this.source.height;
			
			PIXI.texturesToUpdate.push(this);
		}
		else
		{
			
			var scope = this;
			this.source.onload = function(){
				
				scope.hasLoaded = true;
				scope.width = scope.source.width;
				scope.height = scope.source.height;
			
				// add it to somewhere...
				PIXI.texturesToUpdate.push(scope);
				scope.dispatchEvent( { type: 'loaded', content: scope } );
			}
			//	this.image.src = imageUrl;
		}
	}
	else
	{
		this.hasLoaded = true;
		this.width = this.source.width;
		this.height = this.source.height;
			
		//console.log(">!!",this.width)
		PIXI.texturesToUpdate.push(this);
	}
	
	this._powerOf2 = false;
	
}

PIXI.BaseTexture.constructor = PIXI.BaseTexture;

PIXI.BaseTexture.prototype.destroy = function()
{
	
	if(this.source instanceof Image)
	{
		this.source.src = null;
	}
	this.source = null;
	PIXI.texturesToDestroy.push(this);
}


/**
 * 
 * Helper function that returns a base texture based on an image url
 * If the image is not in the base texture cache it will be  created and loaded
 * @static
 * @method fromImage
 * @param imageUrl {String} The image url of the texture
 * @return BaseTexture
 */
PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin)
{
	var baseTexture = PIXI.BaseTextureCache[imageUrl];
	if(!baseTexture)
	{
		var image = new Image();
		if (crossorigin)
		{
			image.crossOrigin = '';
		}
		image.src = imageUrl;
		baseTexture = new PIXI.BaseTexture(image);
		PIXI.BaseTextureCache[imageUrl] = baseTexture;
	}

	return baseTexture;
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.TextureCache = {};
PIXI.FrameCache = {};

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added to the display list directly. To do this use PIXI.Sprite. If no frame is provided then the whole image is used
 * @class Texture
 * @extends EventTarget
 * @constructor
 * @param baseTexture {BaseTexture}
 * @param frmae {Rectangle}
 */
PIXI.Texture = function(baseTexture, frame)
{
	PIXI.EventTarget.call( this );
	
	if(!frame)
	{
		this.noFrame = true;
		frame = new PIXI.Rectangle(0,0,1,1);
	}
	
	this.trim = new PIXI.Point();

	if(baseTexture instanceof PIXI.Texture)
		baseTexture = baseTexture.baseTexture;
	
	/**
	 * The base texture of this texture
	 * @property baseTexture
	 * @type BaseTexture
	 */
	this.baseTexture = baseTexture;
	
	
	
	/**
	 * The frame specifies the region of the base texture that this texture uses
	 * @property frame
	 * @type #Rectangle
	 */
	this.frame = frame;
	
	this.scope = this;
	
	if(baseTexture.hasLoaded)
	{
		if(this.noFrame)frame = new PIXI.Rectangle(0,0, baseTexture.width, baseTexture.height);
		//console.log(frame)
		
		this.setFrame(frame);
	}
	else
	{
		var scope = this;
		baseTexture.addEventListener( 'loaded', function(){ scope.onBaseTextureLoaded()} );
	}
}

PIXI.Texture.constructor = PIXI.Texture;

PIXI.Texture.prototype.onBaseTextureLoaded = function(event)
{
	var baseTexture = this.baseTexture;
	baseTexture.removeEventListener( 'loaded', this.onLoaded );
	
	if(this.noFrame)this.frame = new PIXI.Rectangle(0,0, baseTexture.width, baseTexture.height);
	this.noFrame = false;
	this.width = this.frame.width;
	this.height = this.frame.height;
	
	this.scope.dispatchEvent( { type: 'update', content: this } );
}

PIXI.Texture.prototype.destroy = function(destroyBase)
{
	if(destroyBase)this.baseTexture.destroy();
}

/**
 * Specifies the rectangle region of the baseTexture
 * @method setFrame
 * @param frame {Rectangle}
 */
PIXI.Texture.prototype.setFrame = function(frame)
{
	this.frame = frame;
	this.width = frame.width;
	this.height = frame.height;
	
	if(frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)
	{
		throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
	}
	
	this.updateFrame = true;
	
	PIXI.Texture.frameUpdates.push(this);
	//this.dispatchEvent( { type: 'update', content: this } );
}

/**
 * 
 * Helper function that returns a texture based on an image url
 * If the image is not in the texture cache it will be  created and loaded
 * @static
 * @method fromImage
 * @param imageUrl {String} The image url of the texture
 * @return Texture
 */
PIXI.Texture.fromImage = function(imageUrl, crossorigin)
{
	var texture = PIXI.TextureCache[imageUrl];
	
	if(!texture)
	{
		texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin));
		PIXI.TextureCache[imageUrl] = texture;
	}
	
	return texture;
}

/**
 * 
 * Helper function that returns a texture based on a frame id
 * If the frame id is not in the texture cache an error will be thrown
 * @method fromFrame
 * @param frameId {String} The frame id of the texture
 * @return Texture
 */
PIXI.Texture.fromFrame = function(frameId)
{
	var texture = PIXI.TextureCache[frameId];
	if(!texture)throw new Error("The frameId '"+ frameId +"' does not exist in the texture cache " + this);
	return texture;
}

/**
 * 
 * Helper function that returns a texture based on a canvas element
 * If the canvas is not in the texture cache it will be  created and loaded
 * @static
 * @method fromCanvas
 * @param canvas {Canvas} The canvas element source of the texture
 * @return Texture
 */
PIXI.Texture.fromCanvas = function(canvas)
{
	var	baseTexture = new PIXI.BaseTexture(canvas);
	return new PIXI.Texture(baseTexture);
}


/**
 * 
 * Adds a texture to the textureCache. 
 * @method addTextureToCache
 * @param texture {Texture}
 * @param id {String} the id that the texture will be stored against.
 */
PIXI.Texture.addTextureToCache = function(texture, id)
{
	PIXI.TextureCache[id] = texture;
}

/**
 * 
 * Remove a texture from the textureCache. 
 * @method removeTextureFromCache
 * @param id {String} the id of the texture to be removed
 * @return {Texture} the texture that was removed
 */
PIXI.Texture.removeTextureFromCache = function(id)
{
	var texture = PIXI.TextureCache[id]
	PIXI.TextureCache[id] = null;
	return texture;
}

// this is more for webGL.. it contains updated frames..
PIXI.Texture.frameUpdates = [];


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A Class that loads a bunch of images / sprite sheet / bitmap font files. Once the assets have been loaded they are added to the PIXI Texture cache and can be accessed easily through PIXI.Texture.fromImage() and PIXI.Sprite.fromImage()
 * When all items have been loaded this class will dispatch a "onLoaded" event
 * As each individual item is loaded this class will dispatch a "onProgress" event
 * @class AssetLoader
 * @constructor
 * @extends EventTarget
 * @param {Array} assetURLs an array of image/sprite sheet urls that you would like loaded supported. Supported image formats include "jpeg", "jpg", "png", "gif". Supported sprite sheet data formats only include "JSON" at this time. Supported bitmap font data formats include "xml" and "fnt".
 */
PIXI.AssetLoader = function(assetURLs)
{
	PIXI.EventTarget.call(this);
	
	/**
	 * The array of asset URLs that are going to be loaded
	 * @property assetURLs
	 * @type Array
	 */
	this.assetURLs = assetURLs;

	this.crossorigin = false;

    this.loadersByType = {
        "jpg":  PIXI.ImageLoader,
        "jpeg": PIXI.ImageLoader,
        "png":  PIXI.ImageLoader,
        "gif":  PIXI.ImageLoader,
        "json": PIXI.SpriteSheetLoader,
        "xml":  PIXI.BitmapFontLoader,
        "fnt":  PIXI.BitmapFontLoader
    };
};

/**
Fired when an item has loaded
@event onProgress
**/

/**
Fired when all the assets have loaded
@event onComplete 
**/

// constructor
PIXI.AssetLoader.constructor = PIXI.AssetLoader;

/**
 * This will begin loading the assets sequentially
 */
PIXI.AssetLoader.prototype.load = function()
{
    var scope = this;

	this.loadCount = this.assetURLs.length;

    for (var i=0; i < this.assetURLs.length; i++)
	{
		var fileName = this.assetURLs[i];
		var fileType = fileName.split(".").pop().toLowerCase();

        var loaderClass = this.loadersByType[fileType];
        if(!loaderClass)
            throw new Error(fileType + " is an unsupported file type");

        var loader = new loaderClass(fileName, this.crossorigin);

        loader.addEventListener("loaded", function()
        {
            scope.onAssetLoaded();
        });
        loader.load();
	}
};

/**
 * Invoked after each file is loaded
 * @private
 */
PIXI.AssetLoader.prototype.onAssetLoaded = function()
{
    this.loadCount--;
	this.dispatchEvent({type: "onProgress", content: this});
	if(this.onProgress) this.onProgress();
	
	if(this.loadCount == 0)
	{
		this.dispatchEvent({type: "onComplete", content: this});
		if(this.onComplete) this.onComplete();
	}
};


/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The sprite sheet loader is used to load in JSON sprite sheet data
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish the "JSON" format
 * There is a free version so thats nice, although the paid version is great value for money.
 * It is highly recommended to use Sprite sheets (also know as texture atlas") as it means sprite"s can be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * This loader will also load the image file that the Spritesheet points to as well as the data.
 * When loaded this class will dispatch a "loaded" event
 * @class SpriteSheetLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url the url of the sprite sheet JSON file
 * @param {Boolean} crossorigin
 */

PIXI.SpriteSheetLoader = function(url, crossorigin)
{
	/*
	 * i use texture packer to load the assets..
	 * http://www.codeandweb.com/texturepacker
	 * make sure to set the format as "JSON"
	 */
	PIXI.EventTarget.call(this);
	this.url = url;
	this.baseUrl = url.replace(/[^\/]*$/, "");
	this.texture = null;
	this.frames = {};
	this.crossorigin = crossorigin;
};

// constructor
PIXI.SpriteSheetLoader.constructor = PIXI.SpriteSheetLoader;

/**
 * This will begin loading the JSON file
 */
PIXI.SpriteSheetLoader.prototype.load = function()
{
	this.ajaxRequest = new AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange = function()
	{
		scope.onJSONLoaded();
	};
		
	this.ajaxRequest.open("GET", this.url, true);
	if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
	this.ajaxRequest.send(null)
};

/**
 * Invoke when JSON file is loaded
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onJSONLoaded = function()
{
	if (this.ajaxRequest.readyState == 4)
	{
		 if (this.ajaxRequest.status == 200 || window.location.href.indexOf("http") == -1)
	 	{
			var jsonData = eval("(" + this.ajaxRequest.responseText + ")");
			var textureUrl = this.baseUrl + jsonData.meta.image;

            var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
            this.texture = image.texture.baseTexture;
            var scope = this;
            image.addEventListener("loaded", function(event) {
                 scope.onLoaded();
            });

			var frameData = jsonData.frames;
			for (var i in frameData)
			{
				var rect = frameData[i].frame;
				if (rect)
				{
					PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {x:rect.x, y:rect.y, width:rect.w, height:rect.h});
					
					if(frameData[i].trimmed)
					{
						//var realSize = frameData[i].spriteSourceSize;
						PIXI.TextureCache[i].realSize = frameData[i].spriteSourceSize;
						PIXI.TextureCache[i].trim.x = 0;// (realSize.x / rect.w)
						// calculate the offset!
					}
				}
   			}

            image.load();
	 	}
	}	
};
/**
 * Invoke when all files are loaded (json and texture)
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The image loader class is responsible for loading images file formats ("jpeg", "jpg", "png" and "gif")
 * Once the image has been loaded it is stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * When loaded this class will dispatch a 'loaded' event
 * @class ImageLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url The url of the image
 * @param {Boolean} crossorigin
 */
PIXI.ImageLoader = function(url, crossorigin)
{
    PIXI.EventTarget.call(this);
    this.texture = PIXI.Texture.fromImage(url, crossorigin);
};

// constructor
PIXI.ImageLoader.constructor = PIXI.ImageLoader;

/**
 * Loads image or takes it from cache
 */
PIXI.ImageLoader.prototype.load = function()
{
    if(!this.texture.baseTexture.hasLoaded)
    {
        var scope = this;
        this.texture.baseTexture.addEventListener("loaded", function()
        {
            scope.onLoaded();
        });
    }
    else
    {
        this.onLoaded();
    }
};

/**
 * Invoked when image file is loaded or it is already cached and ready to use
 * @private
 */
PIXI.ImageLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The xml loader is used to load in XML bitmap font data ("xml" or "fnt")
 * To generate the data you can use http://www.angelcode.com/products/bmfont/
 * This loader will also load the image file as the data.
 * When loaded this class will dispatch a "loaded" event
 * @class BitmapFontLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url the url of the sprite sheet JSON file
 * @param {Boolean} crossorigin
 */

PIXI.BitmapFontLoader = function(url, crossorigin)
{
    /*
     * i use texture packer to load the assets..
     * http://www.codeandweb.com/texturepacker
     * make sure to set the format as "JSON"
     */
    PIXI.EventTarget.call(this);
    this.url = url;
    this.baseUrl = url.replace(/[^\/]*$/, "");
    this.texture = null;
    this.crossorigin = crossorigin;
};

// constructor
PIXI.BitmapFontLoader.constructor = PIXI.BitmapFontLoader;

/**
 * This will begin loading the JSON file
 */
PIXI.BitmapFontLoader.prototype.load = function()
{
    this.ajaxRequest = new XMLHttpRequest();
    var scope = this;
    this.ajaxRequest.onreadystatechange = function()
    {
        scope.onXMLLoaded();
    };

    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/xml");
    this.ajaxRequest.send(null)
};

/**
 * Invoked when XML file is loaded
 * @private
 */
PIXI.BitmapFontLoader.prototype.onXMLLoaded = function()
{
    if (this.ajaxRequest.readyState == 4)
    {
        if (this.ajaxRequest.status == 200 || window.location.href.indexOf("http") == -1)
        {
            var textureUrl = this.baseUrl + this.ajaxRequest.responseXML.getElementsByTagName("page")[0].attributes.getNamedItem("file").nodeValue;
            var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
            this.texture = image.texture.baseTexture;

            var data = {};
            var info = this.ajaxRequest.responseXML.getElementsByTagName("info")[0];
            var common = this.ajaxRequest.responseXML.getElementsByTagName("common")[0];
            data.font = info.attributes.getNamedItem("face").nodeValue;
            data.size = parseInt(info.attributes.getNamedItem("size").nodeValue, 10);
            data.lineHeight = parseInt(common.attributes.getNamedItem("lineHeight").nodeValue, 10);
            data.chars = {};

            //parse letters
            var letters = this.ajaxRequest.responseXML.getElementsByTagName("char");

            for (var i = 0; i < letters.length; i++)
            {
                var charCode = parseInt(letters[i].attributes.getNamedItem("id").nodeValue, 10);

                var textureRect = {
                    x: parseInt(letters[i].attributes.getNamedItem("x").nodeValue, 10),
                    y: parseInt(letters[i].attributes.getNamedItem("y").nodeValue, 10),
                    width: parseInt(letters[i].attributes.getNamedItem("width").nodeValue, 10),
                    height: parseInt(letters[i].attributes.getNamedItem("height").nodeValue, 10)
                };
                PIXI.TextureCache[charCode] = new PIXI.Texture(this.texture, textureRect);

                data.chars[charCode] = {
                    xOffset: parseInt(letters[i].attributes.getNamedItem("xoffset").nodeValue, 10),
                    yOffset: parseInt(letters[i].attributes.getNamedItem("yoffset").nodeValue, 10),
                    xAdvance: parseInt(letters[i].attributes.getNamedItem("xadvance").nodeValue, 10),
                    kerning: {}
                };
            }

            //parse kernings
            var kernings = this.ajaxRequest.responseXML.getElementsByTagName("kerning");
            for (i = 0; i < kernings.length; i++)
            {
               var first = parseInt(kernings[i].attributes.getNamedItem("first").nodeValue, 10);
               var second = parseInt(kernings[i].attributes.getNamedItem("second").nodeValue, 10);
               var amount = parseInt(kernings[i].attributes.getNamedItem("amount").nodeValue, 10);

                data.chars[second].kerning[first] = amount;

            }
            PIXI.BitmapText.fonts[data.font] = data;

            var scope = this;
            image.addEventListener("loaded", function() {
                scope.onLoaded();
            });
            image.load();
        }
    }
};

/**
 * Invoked when all files are loaded (xml/fnt and texture)
 * @private
 */
PIXI.BitmapFontLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

 if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = PIXI;
    }
    exports.PIXI = PIXI;
  } else {
    root.PIXI = PIXI;
  }


}).call(this);
/**
 * @author Vsevolod Strukchinsky (@floatdrop)
 */

(function () {

	var root = this;
/**
 * @author Vsevolod Strukchinsky (@floatdrop)
 */

/**
@module LINK
 */
var LINK = LINK || {};

LINK.Cache = {};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
A class Layers represents a named collection of display objects container (layers). It is the base class of all display objects that act as a container for other objects.

Single level layers inheritance: 

@example 
	// Create three layers, that can be getted by layers.top, layers.middle, layers.bottom
	var layers = new LINK.Layers("bottom", "middle", "top");
	layers.top.addChild(...);
	layers.bottom.addChild(...);

Multi level layers inheritance (be careful with swapping between different levels of layers):

@example
	var layers = new LINK.Layers({
			"ground": new LINK.Layers("earth",{"grass": new LINK.Layers("leafs", "flowers")), 
			"sky": new LINK.Layers("birds", "clouds")
		}, "ui");
	layers.ground.earth.addChild(...);
	layers.ground.grass.flowers.addChild(...);
	layers.sky.clouds.addChild(...);
	layers.ui.addChild(...);

@class Layers
@extends DisplayObjectContainer
@constructor
**/
LINK.Layers = function () {
	PIXI.DisplayObjectContainer.call(this);

	this.blockedNames = Object.keys(this);

	this.sort = false;

	for (var argumentIndex in arguments) {
		var arg = arguments[argumentIndex];
		if (typeof arg === "string") {
			this.addLayer(arg);
		} else if (arg instanceof Object) {
			for (var layersGroupName in arg) {
				this[layersGroupName] = arg[layersGroupName];
				this.addChild(arg[layersGroupName]);
			}
		}
	}
};

LINK.Layers.constructor = LINK.Layers;
LINK.Layers.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Creates new layer with name layerName above others layers.
 * @method addLayer
 * @param  layerName {String}
 * @return DisplayObject
 */
LINK.Layers.prototype.addLayer = function (layerName) {
	return this.addLayerAt(layerName, this.children.length);
};

/**
 * Creates new layer with name layerName at specified index.
 * @method addLayerAt
 * @param Layer {DisplayObject}
 * @param index {Number}
 */
LINK.Layers.prototype.addLayerAt = function (layerName, index) {
	if (layerName in this) {
		throw new Error(layerName + " Suplied name already used by " + this[layerName]);
	}
	var layer = new PIXI.DisplayObjectContainer();
	layer.layername = layerName;
	this.addChildAt(layer, index);
	this[layerName] = layer;
	return layer;
};

/**
 * Swaps 2 Layers
 * @method swapChildren
 * @param  LayerName {String}
 * @param  LayerName2 {String}
 */
LINK.Layers.prototype.swapLayers = function (layerName, layerName2) {

	var layer = this[layerName];
	var layer2 = this[layerName2];

	this.swapChildren(layer, layer2);
};

/**
 * Returns the Layer with specified name or creates it
 * @method getLayer
 * @param  layerName {String}
 * @return DisplayObjectContainer
 */
LINK.Layers.prototype.getLayer = function (layerName) {
	if (!this[layerName])
		this.addLayer(layerName);
	return this[layerName];
};

/**
 * Returns the Layer at the specified index
 * @method getLayerAt
 * @param  index {Number}
 * @return DisplayObjectContainer
 */
LINK.Layers.prototype.getLayerAt = function (index) {
	return this.getChildAt(index);
};

/**
 * Removes a layer from the container.
 * @method removeLayer
 * @param String {LayerName}
 */
LINK.Layers.prototype.removeLayer = function (layerName) {
	if (!(layerName in this) || (layerName in this.blockedNames)) return;
	PIXI.DisplayObjectContainer.prototype.removeChild.call(this, this[layerName]);
	delete this[layerName];
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/**
Keyboard class handles keys.

@example
	// LINK.Key is a global LINK.Keyboard manager class

	// Bind keys
	LINK.Key.W.press(moveUpCallback);
	LINK.Key.S.press(moveDownCallback);
	LINK.Key.A.press(moveLeftCallback);
	LINK.Key.D.press(moveRightCallback);

	// Fire all pressed keys
	Object.keys(LINK.Key.pressed).forEach(function (code) { 
		LINK.Key.pressed[code].press(); 
	});

	// Same but shorter
	LINK.Key.runCallbacks();

@class Keyboard
@constructor
**/
LINK.Keyboard = function () {
	var self = this;
	this.pressed = {};
	this.callbacks = {};

	Object.keys(this.Codes).forEach(function (keyName) {
		self[keyName] = {
			press: function (callback) {
				self.callbacks[keyName] = callback;
				return self;
			}
		};
		self[keyName].press(function() {});
		Object.defineProperty(self.pressed, LINK.Keyboard.prototype.Codes[keyName], {
			configurable: true,
			get: function () {
				return {
					press: function () {
						if (self.callbacks[keyName]) {
							self.callbacks[keyName](keyName);
						}
					}
				};
			}
		});
	});

	document.addEventListener('keydown', this.onKeyDown.bind(this), false);
	document.addEventListener('keyup', this.onKeyUp.bind(this), false);
};

LINK.Keyboard.constructor = LINK.Keyboard;

LINK.Keyboard.prototype.runCallbacks = function () {
	var self = this;
	Object.keys(LINK.Key.pressed).forEach(function (code) {
		self.pressed[code].press();
	});
};

LINK.Keyboard.prototype.onKeyDown = function (e, override) {
	return this.modifyKey(e, override || e.keyCode || e.which, true);
};

LINK.Keyboard.prototype.onKeyUp = function (e, override) {
	return this.modifyKey(e, override || e.keyCode || e.which, false);
};

LINK.Keyboard.prototype.modifyKey = function (e, key, val) {
	if (key) {
		Object.defineProperty(this.pressed, key, {
			enumerable: val
		});
	}
	return true;
};

/**
 * Maps names of keys to theirs codes
 * @property Codes
 */
LINK.Keyboard.prototype.Codes = {
	'Backspace': 8,
	'Tab': 9,
	'Enter': 13,
	'Shift': 16,
	'Ctrl': 17,
	'Alt': 18,
	'Pause': 19,
	'Capslock': 20,
	'Esc': 27,
	'Spacebar': 32,
	'Pageup': 33,
	'Pagedown': 34,
	'End': 35,
	'Home': 36,
	'Leftarrow': 37,
	'Uparrow': 38,
	'Rightarrow': 39,
	'Downarrow': 40,
	'Insert': 45,
	'Delete': 46,
	'0': 48,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'5': 53,
	'6': 54,
	'7': 55,
	'8': 56,
	'9': 57,
	'A': 65,
	'B': 66,
	'C': 67,
	'D': 68,
	'E': 69,
	'F': 70,
	'G': 71,
	'H': 72,
	'I': 73,
	'J': 74,
	'K': 75,
	'L': 76,
	'M': 77,
	'N': 78,
	'O': 79,
	'P': 80,
	'Q': 81,
	'R': 82,
	'S': 83,
	'T': 84,
	'U': 85,
	'V': 86,
	'W': 87,
	'X': 88,
	'Y': 89,
	'Z': 90,
	'0numpad': 96,
	'1numpad': 97,
	'2numpad': 98,
	'3numpad': 99,
	'4numpad': 100,
	'5numpad': 101,
	'6numpad': 102,
	'7numpad': 103,
	'8numpad': 104,
	'9numpad': 105,
	'Multiply': 106,
	'Plus': 107,
	'Minut': 109,
	'Dot': 110,
	'Slash1': 111,
	'F1': 112,
	'F2': 113,
	'F3': 114,
	'F4': 115,
	'F5': 116,
	'F6': 117,
	'F7': 118,
	'F8': 119,
	'F9': 120,
	'F10': 121,
	'F11': 122,
	'F12': 123,
	'equal': 187,
	'Coma': 188,
	'Slash': 191,
	'Backslash': 220
};

LINK.Key = new LINK.Keyboard();
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/**
Mouse class handles clicks.

@example
	var mouse = new LINK.Mouse();
	mouse.on.click(shootCallback);
	mouse.on.move(lookCallback);

@class Mouse
@constructor
**/
LINK.Mouse = function (objectToListen) {

	var self = this;

	objectToListen = objectToListen || document;

	/**
	 * The current position of the mouse
	 *
	 * @property position
	 * @type Point
	 * @readOnly
	 */
	this.position = new PIXI.Point(0, 0);
	objectToListen.addEventListener('mousemove', this.onMouseMove.bind(this), false);

	this.callbacks = {};

	this.on = {};

	Object.keys(LINK.Mouse.prototype.Events).forEach(function (eventName) {
		self.on[eventName] = function (callback) {
			self.callbacks[eventName] = callback;
		};

		var event = LINK.Mouse.prototype.Events[eventName];
		if (event === 'mousemove' || event === 'mousewheel') return;
		objectToListen.addEventListener(event, self.onMouse.bind(self), false);

	});

};

LINK.Mouse.constructor = LINK.Mouse;

LINK.Mouse.prototype.onMouse = function (e) {
	this.updateCoords(e);
	var button = e.button || 0;
	if (this.callbacks[button]) {
		this.callbacks[button](e);
	}

	return true;
};

LINK.Mouse.prototype.onMouseMove = function (e) {
	this.updateCoords(e);
	if (this.callbacks.move) {
		this.callbacks.move(e);
	}
	return true;
};

LINK.Mouse.prototype.updateCoords = function (e) {
	this.position.x = e.pageX;
	this.position.y = e.pageY;
};

LINK.Mouse.prototype.Events = {
	wheel: 'mousewheel',
	move: 'mousemove',
	down: 'mousedown',
	up: 'mouseup',
	click: 'click',
	dbclick: 'dblclick',
	rclick: 'contextmenu',
	contextmenu: 'contextmenu'
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
Camera class represents DisplayObjectContainer, that autotrack one of DisplayObject positions.

@example
	var stage = new PIXI.Stage();
	var layers = new LINK.Layers("game","ui");
	stage.addChild(layers);
	var camera = new LINK.Camera();
	camera.follow(player).on(layers.game);

@class Camera
@extends DisplayObjectContainer
@constructor
**/
LINK.Camera = function (width, height) {
	PIXI.DisplayObjectContainer.call(this);

	this.width = width;
	this.height = height;
	this.halfWidth = (width / 2) | 0;
	this.halfHeight = (height / 2) | 0;

	/**
	 * The bounds of that the camera can move to
	 *
	 * @property bounds
	 * @type PIXI.Rectangle
	 * @readOnly
	 * @private
	 */
	var _bounds = new PIXI.Rectangle(0, 0, 0, 0);
	Object.defineProperty(this, "bounds", {
		get: function () {
			return _bounds;
		},
		set: function (n) {
			if (!(n instanceof PIXI.Rectangle)) throw new Error(n + " bounds must be instance of PIXI.Rectangle");
			_bounds = n.clone();
			_bounds.maxX = n.x + n.width - this.width;
			_bounds.minX = n.x;
			_bounds.maxY = n.y + n.height - this.height;
			_bounds.minY = n.y;
		}
	});

	/**
	 * Freezes the camera
	 * @property freeze
	 * @type Boolean
	 */
	this.freeze = false;

	/**
	 * Freezes the camera
	 * @property freeze
	 * @type Boolean
	 * @private
	 */
	this._linkedObject = null;
};

LINK.Camera.constructor = LINK.Camera;
LINK.Camera.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Wraps DisplayObject to pan him and all his childrens.
 * @method on
 * @param object {DisplayObjectContainer}
 */
LINK.Camera.prototype.on = function (object) {
	if (!(object instanceof PIXI.DisplayObjectContainer)) throw new Error(object + " object should be instance of DisplayObjectContainer");

	if (object instanceof PIXI.Stage) {
		while (object.children[0]) {
			this.addChild(object.children[0]);
		}
		object.addChild(this);
		return this;
	}

	if (this.parent) {
		this.off();
	}

	var parent = object.parent;
	if (!parent) {
		throw new Error("Can't bind Camera on DisplayObjectContainer without parent");
	}
	var index = parent.children.indexOf(object);
	parent.removeChild(object);
	this.addChild(object);
	object = this;
	parent.addChildAt(object, index);
	return this;
};

/**
 * Unwraps DisplayObject that was wrapped by "on" method.
 * @method off
 */
LINK.Camera.prototype.off = function () {
	var parent = this.parent;
	if (parent) {
		var index = parent.children.indexOf(this);
		parent.removeChild(this);
		while (this.children[0]) {
			parent.addChildAt(this.children[0], index++);
		}
		return this;
	}
	throw new Error("Can't remove Camera without Camera.parent defined");
};

/**
 * Starts follow on DisplayObject
 * @method follow
 * @param object {DisplayObject}
 */
LINK.Camera.prototype.follow = function (object) {
	this._linkedObject = object;
	return this;
};

/**
@method updateTransform
@internal
*/
LINK.Camera.prototype.updateTransform = function () {
	if (this._linkedObject && !this.freeze) {
		var anchor = this._linkedObject.position.clone();
		anchor.x -= this.halfWidth;
		anchor.y -= this.halfHeight;

		anchor.x = Math.min(this.bounds.maxX, Math.max(this.bounds.minX, anchor.x));
		anchor.y = Math.min(this.bounds.maxY, Math.max(this.bounds.minY, anchor.y));

		this.position = new PIXI.Point(-anchor.x, -anchor.y);
	}
	PIXI.Sprite.prototype.updateTransform.call(this);
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/* global msgpack */

/**
Network class.

This class represents transport between client link.js and server node-link.
Network layer is websockets which support binary encoding of messages wisg msgpack.

@example
	var network = new LINK.Network({binary: true});
	network.onmessage(function (message) { console.log(message); });
	network.onerror(function (error) { console.log("Error: " + error); });
	network.onclose(function (error) { console.log("Closed: " + error); })
	network.connect("localhost");
	
	// some code later

	network.close();

@class Network
@param config {Object}
@constructor
**/

LINK.Network = function (config) {
	this.config = config;
};

LINK.Network.constructor = LINK.Network;

/**
 * Creates new layer with name layerName above others layers.
 * @method connect
 * @param  host {String}
 * @param  port {Number}
 */

LINK.Network.prototype.connect = function (host, port) {
	this.socket = new WebSocket("ws://" + host + (port ? ":" + port : ""));

	this.onopen(this.onopen_callback);
	this.onclose(this.onclose_callback);
	this.onerror(this.onerror_callback);
	this.onmessage(this.onmessage_callback);
};

/**
@private
**/
LINK.Network.prototype.decode = function (event, callback) {
	if (typeof event.data === "string") {
		callback(JSON.parse(event.data));
	} else {
		var reader = new FileReader();
		reader.readAsArrayBuffer(event.data);
		reader.onloadend = function () {
			var message = msgpack.decode(this.result);
			callback(message);
		};
	}
};

/**
 * Creates new layer with name layerName above others layers.
 * @method onmessage
 * @param  callback {Function}
 */

LINK.Network.prototype.onmessage = function (callback) {
	var self = this;
	this.onmessage_callback = callback;
	if (this.socket) this.socket.onmessage = function (e) { self.decode(e, callback); };
};

/**
 * Creates new layer with name layerName above others layers.
 * @method onopen
 * @param  callback {Function}
 */
LINK.Network.prototype.onopen = function (callback) {
	this.onopen_callback = callback;
	if (this.socket) this.socket.onopen = callback;
};

/**
 * Creates new layer with name layerName above others layers.
 * @method onerror
 * @param  callback {Function}
 */
LINK.Network.prototype.onerror = function (callback) {
	this.onerror_callback = callback;
	if (this.socket) this.socket.onerror = callback;
};

/**
 * Creates new layer with name layerName above others layers.
 * @method onclose
 * @param  callback {Function}
 */
LINK.Network.prototype.onclose = function (callback) {
	this.onclose_callback = callback;
	if (this.socket) this.socket.onclose = callback;
};

/**
 * Creates new layer with name layerName above others layers.
 * @method send
 * @param  message {Object}
 */
LINK.Network.prototype.send = function (message) {
	if (this.socket) {
		this.socket.send(this.config.binary ? msgpack.encode(message) : JSON.stringify(message));
	}
};

/**
 * Creates new layer with name layerName above others layers.
 * @method close
 * @param  layerName {String}
 */
LINK.Network.prototype.close = function () {
	if (this.socket) {
		this.socket.close();
	}
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
A class MovieClipManager contains and manages MovieClips.

@example
    var mcn = new PIXI.MovieClipManager();
    mcn.add("walk", new PIXI.MovieClip([texture1, texture2, ...], 0.23));
    mcn.set("walk").animationSpeed(0.22).loop(false).play();
@class MovieClipManager
@extends DisplayObjectContainer
@constructor
**/
LINK.MovieClipManager = function () {
    PIXI.DisplayObjectContainer.call(this);

    /**
     * [read-only] The map of name to MovieClip objects.
     * @property _animations {Object}
     */
    this._animations = {};

    /**
     * [read-only] The current displaying animation.
     * @property children {MovieClip}
     */
    this._current = undefined;

    for (var argumentIndex in arguments) {
        var arg = arguments[argumentIndex];
        this.add(arg.name, arg.clip);
    }

};

LINK.MovieClipManager.constructor = LINK.MovieClipManager;
LINK.MovieClipManager.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Gets movieClip with `name`
 * @method get
 * @param  name {String}
 * @return MovieClip
 */
LINK.MovieClipManager.prototype.get = function (name) {
    return this._animations[name];
};


/**
 * Changes movieClip to another
 * @method set
 * @param  name {String}
 * @return DisplayObject
 */
LINK.MovieClipManager.prototype.set = function (name) {
    if (this._current) {
        this._current.stop();
        this._current.visible = false;
    }
    this._current = this._animations[name];
    if (this._current) {
        this._current.visible = true;
    }
    return this;
};

/**
 * Plays movieClip
 * @method play
 * @param  name {String} (set as undefined to play current MovieClip)
 * @return DisplayObject
 */
LINK.MovieClipManager.prototype.play = function (name) {
    if (name) {
        this.set(name);
    }
    if (this._current) {
        this._current.play();
    }
    return this;
};

/**
 * Stops the current MovieClip and goes to a specific frame
 * @method gotoAndStop
 * @param frameNumber {Number} frame index to stop at
 */
LINK.MovieClipManager.prototype.gotoAndStop = function (frameNumber) {
    this._current.gotoAndStop(frameNumber);
    return this;
};

/**
 * Goes to a specific frame and begins playing the current MovieClip
 * @method gotoAndPlay
 * @param frameNumber {Number} frame index to start at
 */
LINK.MovieClipManager.prototype.gotoAndPlay = function(frameNumber)
{
    this._current.gotoAndPlay(frameNumber);
    return this;
};

/**
 * Sets animationSpeed property on current MovieClip
 * @method animationSpeed
 * @param speed {Number}
 */
LINK.MovieClipManager.prototype.animationSpeed = function(speed)
{
    this._current.animationSpeed = speed;
    return this;
};


/**
 * Sets loop property on current MovieClip
 * @method loop
 * @param isLooped {Boolean}
 */
LINK.MovieClipManager.prototype.loop = function(isLooped)
{
    this._current.loop = isLooped;
    return this;
};

/**
 * Sets onComplete callback on current MovieClip
 * @method onComplete
 * @param frameNumber {Number} frame index to start at
 */
LINK.MovieClipManager.prototype.onComplete = function(callback)
{
    this._current.onComplete = callback;
    return this;
};


/**
 * Stops current MovieClip
 * @method stop
 */
LINK.MovieClipManager.prototype.stop = function () {
    if (this._current) {
        this._current.stop();
    }
    return this;
};

/**
 * Creates new animation with name `name`.
 * @method add
 * @param  name {String}
 * @param  movieClip {MovieClip}
 * @return DisplayObject
 */
LINK.MovieClipManager.prototype.add = function (name, movieClip, speed) {
    this._animations[name] = movieClip;
    movieClip.animationSpeed = speed || movieClip.animationSpeed;
    this.addChild(movieClip);
    movieClip.visible = false;
    return this;
};


/**
 * Removes a animation from the container.
 * @method remove
 * @param name {String}
 */
LINK.MovieClipManager.prototype.remove = function (name) {
    if (this._animations[name] === this._current) {
        this._current.visible = false;
        this._current = undefined;
    }
    delete this._animations[name];
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/**
 * @class JsonLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url the url of the sprite sheet JSON file
 * @param {Boolean} crossorigin
 */

var AjaxRequest = function () {
	var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE

	if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
		for (var i = 0; i < activexmodes.length; i++) {
			try {
				return new window.ActiveXObject(activexmodes[i]);
			} catch (e) {
				//suppress error
			}
		}
	} else if (window.XMLHttpRequest) // if Mozilla, Safari etc
	{
		return new window.XMLHttpRequest();
	} else {
		return false;
	}
};

LINK.JsonLoader = function (url, crossorigin) {
	PIXI.EventTarget.call(this);
	this.url = url;
	this.baseUrl = url.replace(/[^\/]*$/, "");
	this.json = null;
	this.crossorigin = crossorigin;
};

// constructor
LINK.JsonLoader.constructor = LINK.JsonLoader;

/**
 * This will begin loading the JSON file
 */
LINK.JsonLoader.prototype.load = function () {
	this.ajaxRequest = new AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange = function () {
		scope.onJSONLoaded();
	};

	this.ajaxRequest.open("GET", this.url, true);
	if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
	this.ajaxRequest.send(null);
};

/**
 * Invoke when JSON file is loaded
 * @private
 */
LINK.JsonLoader.prototype.onJSONLoaded = function () {
	if (this.ajaxRequest.readyState === 4) {
		if (this.ajaxRequest.status === 200 || window.location.href.indexOf("http") === -1) {
			this.json = JSON.parse(this.ajaxRequest.responseText);
			LINK.Cache[this.url] = this.json;
			this.onLoaded();
		}
	}
};
/**
 * Invoke when all files are loaded (json and texture)
 * @private
 */
LINK.JsonLoader.prototype.onLoaded = function () {
	this.dispatchEvent({
		type: "loaded",
		content: this
	});
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/**
Loader class loads resources into one cache. 

@example
	var audioFile = LINK.Loader.load('Throttle - Inspire.mp3');

@class Loader
@constructor
**/
LINK.Loader = function (assetURLs) {
	PIXI.AssetLoader.call(this, assetURLs);

    this.loadersByType.json = LINK.JsonLoader;
};

LINK.Loader.constructor = LINK.Loader;
LINK.Loader.prototype = Object.create(PIXI.AssetLoader);

LINK.Loader.prototype.load = function(items)
{
	var resources = this.assetURLs;
	this.assetURLs = items || this.assetURLs;
	PIXI.AssetLoader.prototype.load.call(this);
	this.assetURLs = resources;
};
/**
 * @author Vsevolod Strukchinsky @floatdrop
 */

/**
TiledMap class loads json file of tiled map. 

@example
	var stage = new PIXI.Stage();
	var map = new LINK.TiledMap(mapUri, { layerAsCanvas: true });
	stage.addChild(map);


@class TiledMap
@constructor
**/
LINK.TiledMap = function (mapUrl, config) {

	LINK.Layers.call(this);

	var self = this;

	this.config = config;

	this.tilecache = {};

	var loader = new LINK.JsonLoader(mapUrl, false);
	loader.addEventListener("loaded", function (jsonLoader) {
		self.onTiledMapJsonLoaded(jsonLoader);
	});
	loader.load();
};

LINK.TiledMap.constructor = LINK.TiledMap;
LINK.TiledMap.prototype = Object.create(LINK.Layers.prototype);

LINK.TiledMap.prototype.onTiledMapJsonLoaded = function (jsonLoader) {
	var map = jsonLoader.content.json;

	this.scale = {
		x: parseInt(map.properties.scale, 10) || 1,
		y: parseInt(map.properties.scale, 10) || 1
	};

	this.tilesize = {
		width: map.tilewidth,
		height: map.tileheight
	};

	this.tilesets = [];

	this.tilecache = {};

	for (var j = 0, jl = map.tilesets.length; j < jl; ++j) {
		var tsInfo = map.tilesets[j];
		tsInfo.lastgid = tsInfo.firstgid + (tsInfo.imagewidth / tsInfo.tilewidth) * (tsInfo.imageheight / tsInfo.tileheight);
		tsInfo.baseTexture = PIXI.Texture.fromImage(tsInfo.image).baseTexture;
		this.tilesets.push(tsInfo);
	}

	this.version = map.version;

	for (var i = 0, il = map.layers.length; i < il; ++i) {
		if (map.layers[i].type === "tilelayer") this.createTileLayer(map.layers[i]);
	}

};


LINK.TiledMap.prototype.createTileLayer = function (layerJson) {
	var layer = this.addLayer(layerJson.name);
	layer.alpha = layerJson.opacity;
	layer.width = layerJson.width;
	layer.height = layerJson.height;
	layer.visible = layerJson.visible;
	layer.position.x = (layerJson.x * this.tilesize.width) | 0;
	layer.position.y = (layerJson.y * this.tilesize.height) | 0;
	layer.type = layerJson.type;
	for (var index in layerJson.data) {
		var tileIndex = layerJson.data[index];
		if (tileIndex === 0) { continue; }
		var tileset = this.getTileSet(tileIndex);
		var tileTexture = this.getTileTexture(tileIndex, tileset);
		var tileDisplayObject = new PIXI.Sprite(tileTexture);
		tileDisplayObject.position = new PIXI.Point(
		((index % layer.width) | 0) * this.tilesize.width,
		((index / layer.width) | 0) * this.tilesize.height);
		layer.addChild(tileDisplayObject);
	}
};

LINK.TiledMap.prototype.getTileSet = function (index) {
	for (var idx in this.tilesets) {
		var tileset = this.tilesets[idx];
		if (index >= tileset.firstgid && index < tileset.lastgid) return tileset;
	}
	throw new Error("Tileset for index " + index + " not found!");
};

LINK.TiledMap.prototype.getTileTexture = function (index, tileset) {
	if (this.tilecache[index]) {
		return this.tilecache[index];
	}
	var i = index - tileset.firstgid;
	var frame = new PIXI.Rectangle(
	(((i * tileset.tilewidth) % tileset.imagewidth) | 0), (((i * tileset.tilewidth) / tileset.imagewidth) | 0) * tileset.tileheight,
	tileset.tilewidth,
	tileset.tileheight);
	this.tilecache[index] = new PIXI.Texture(tileset.baseTexture, frame);
	return this.tilecache[index];
};
 /**
  * @author Vsevolod Strukchinsky (@floatdrop)
  */

 if (typeof exports !== 'undefined') {
 	if (typeof module !== 'undefined' && module.exports) {
 		exports = module.exports = LINK;
 	}
 	exports.LINK = LINK;
 } else {
 	root.LINK = LINK;
 }


 }).call(this);