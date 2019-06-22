// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;


// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 3760;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });



































































































/* memory initializer */ allocate([255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,60,105,110,118,97,108,105,100,62,0,0,0,0,0,0,0,101,114,114,111,114,0,0,0,116,101,114,109,105,110,97,116,101,100,0,0,0,0,0,0,110,111,114,109,97,108,0,0,110,111,112,114,111,103,114,97,109,0,0,0,0,0,0,0,111,117,116,112,117,116,95,99,97,108,108,98,97,99,107,40,39,37,115,39,41,0,0,0,92,110,0,0,0,0,0,0,92,39,0,0,0,0,0,0,92,48,48,48,0,0,0,0,92,92,0,0,0,0,0,0,123,114,101,116,117,114,110,32,105,110,112,117,116,95,103,101,116,99,104,97,114,95,99,97,108,108,98,97,99,107,40,41,59,125,0,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,56,56,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,55,52,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,55,49,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,54,53,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,52,57,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,52,56,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,49,52,51,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,48,55,51,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,49,48,52,52,46,39,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,57,56,54,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,57,54,52,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,56,57,56,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,56,49,51,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,50,49,57,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,55,54,53,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,55,52,48,46,39,0,0,0,0,0,69,116,101,114,110,97,108,32,108,111,111,112,32,105,110,32,99,111,109,109,97,110,100,32,99,104,97,105,110,32,97,116,32,37,100,58,37,100,46,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,53,56,55,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,53,52,54,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,52,57,51,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,52,56,54,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,52,54,56,46,39,0,0,0,0,0,37,115,12,37,115,12,37,100,12,37,100,12,37,115,12,37,115,12,37,115,12,37,115,0,37,100,12,37,100,12,37,100,12,37,100,12,37,100,12,37,100,12,37,100,12,37,100,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,50,49,50,46,39,0,0,0,0,0,116,104,114,111,119,32,39,66,117,103,32,105,110,32,116,104,101,32,105,110,116,101,114,112,114,101,116,101,114,46,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,32,97,116,32,46,47,46,46,47,105,110,116,101,114,112,114,101,116,101,114,46,99,58,50,48,54,46,39,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
function runPostSets() {


}

var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    }function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _emscripten_run_script(ptr) {
      eval(Pointer_stringify(ptr));
    }

  
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        ret = dest;
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
        dest = ret;
      } else {
        _memcpy(dest, src, num) | 0;
      }
      return dest | 0;
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }var _llvm_memset_p0i8_i64=_memset;

  var _llvm_memset_p0i8_i32=_memset;

  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }

  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }

  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return FUNCTION_TABLE[cmp](base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }

  function _emscripten_asm_const_int(code) {
      var args = Array.prototype.slice.call(arguments, 1);
      return Runtime.getAsmConst(code, args.length).apply(null, args) | 0;
    }

  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  function _abort() {
      Module['abort']();
    }

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");



var FUNCTION_TABLE = [0,0,_is_normal_right,0,_is_nonblocked_left_or_right,0,_is_normal_up,0,_is_normal_down,0,_is_nonblocked_down,0,_dot_sorter,0,_is_normal_left,0];

// EMSCRIPTEN_START_FUNCS

function _slots_order($a,$b){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $dy;
 var $dx;
 $1=$a;
 $2=$b;
 var $3=$1;
 var $4=(($3+20)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$2;
 var $7=(($6+20)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=((($5)-($8))|0);
 $dy=$9;
 var $10=$1;
 var $11=(($10+16)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=$2;
 var $14=(($13+16)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=((($12)-($15))|0);
 $dx=$16;
 var $17=$dy;
 var $18=($17|0)!=0;
 if($18){label=2;break;}else{label=3;break;}
 case 2: 
 var $20=$dy;
 var $24=$20;label=4;break;
 case 3: 
 var $22=$dx;
 var $24=$22;label=4;break;
 case 4: 
 var $24;
 STACKTOP=sp;return $24;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_INSERT_COLOR($head,$elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $parent;
 var $gparent;
 var $tmp;
 $1=$head;
 $2=$elm;
 label=2;break;
 case 2: 
 var $4=$2;
 var $5=(($4)|0);
 var $6=(($5+8)|0);
 var $7=HEAP32[(($6)>>2)];
 $parent=$7;
 var $8=($7|0)!=0;
 if($8){label=3;break;}else{var $16=0;label=4;break;}
 case 3: 
 var $10=$parent;
 var $11=(($10)|0);
 var $12=(($11+12)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=($13|0)==1;
 var $16=$14;label=4;break;
 case 4: 
 var $16;
 if($16){label=5;break;}else{label=99;break;}
 case 5: 
 var $18=$parent;
 var $19=(($18)|0);
 var $20=(($19+8)|0);
 var $21=HEAP32[(($20)>>2)];
 $gparent=$21;
 var $22=$parent;
 var $23=$gparent;
 var $24=(($23)|0);
 var $25=(($24)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($22|0)==($26|0);
 if($27){label=6;break;}else{label=52;break;}
 case 6: 
 var $29=$gparent;
 var $30=(($29)|0);
 var $31=(($30+4)|0);
 var $32=HEAP32[(($31)>>2)];
 $tmp=$32;
 var $33=$tmp;
 var $34=($33|0)!=0;
 if($34){label=7;break;}else{label=11;break;}
 case 7: 
 var $36=$tmp;
 var $37=(($36)|0);
 var $38=(($37+12)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=($39|0)==1;
 if($40){label=8;break;}else{label=11;break;}
 case 8: 
 var $42=$tmp;
 var $43=(($42)|0);
 var $44=(($43+12)|0);
 HEAP32[(($44)>>2)]=0;
 label=9;break;
 case 9: 
 var $46=$parent;
 var $47=(($46)|0);
 var $48=(($47+12)|0);
 HEAP32[(($48)>>2)]=0;
 var $49=$gparent;
 var $50=(($49)|0);
 var $51=(($50+12)|0);
 HEAP32[(($51)>>2)]=1;
 label=10;break;
 case 10: 
 var $53=$gparent;
 $2=$53;
 label=2;break;
 case 11: 
 var $55=$parent;
 var $56=(($55)|0);
 var $57=(($56+4)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=$2;
 var $60=($58|0)==($59|0);
 if($60){label=12;break;}else{label=31;break;}
 case 12: 
 label=13;break;
 case 13: 
 var $63=$parent;
 var $64=(($63)|0);
 var $65=(($64+4)|0);
 var $66=HEAP32[(($65)>>2)];
 $tmp=$66;
 var $67=$tmp;
 var $68=(($67)|0);
 var $69=(($68)|0);
 var $70=HEAP32[(($69)>>2)];
 var $71=$parent;
 var $72=(($71)|0);
 var $73=(($72+4)|0);
 HEAP32[(($73)>>2)]=$70;
 var $74=($70|0)!=0;
 if($74){label=14;break;}else{label=15;break;}
 case 14: 
 var $76=$parent;
 var $77=$tmp;
 var $78=(($77)|0);
 var $79=(($78)|0);
 var $80=HEAP32[(($79)>>2)];
 var $81=(($80)|0);
 var $82=(($81+8)|0);
 HEAP32[(($82)>>2)]=$76;
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 label=17;break;
 case 17: 
 var $86=$parent;
 var $87=(($86)|0);
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=$tmp;
 var $91=(($90)|0);
 var $92=(($91+8)|0);
 HEAP32[(($92)>>2)]=$89;
 var $93=($89|0)!=0;
 if($93){label=18;break;}else{label=22;break;}
 case 18: 
 var $95=$parent;
 var $96=$parent;
 var $97=(($96)|0);
 var $98=(($97+8)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=(($99)|0);
 var $101=(($100)|0);
 var $102=HEAP32[(($101)>>2)];
 var $103=($95|0)==($102|0);
 if($103){label=19;break;}else{label=20;break;}
 case 19: 
 var $105=$tmp;
 var $106=$parent;
 var $107=(($106)|0);
 var $108=(($107+8)|0);
 var $109=HEAP32[(($108)>>2)];
 var $110=(($109)|0);
 var $111=(($110)|0);
 HEAP32[(($111)>>2)]=$105;
 label=21;break;
 case 20: 
 var $113=$tmp;
 var $114=$parent;
 var $115=(($114)|0);
 var $116=(($115+8)|0);
 var $117=HEAP32[(($116)>>2)];
 var $118=(($117)|0);
 var $119=(($118+4)|0);
 HEAP32[(($119)>>2)]=$113;
 label=21;break;
 case 21: 
 label=23;break;
 case 22: 
 var $122=$tmp;
 var $123=$1;
 var $124=(($123)|0);
 HEAP32[(($124)>>2)]=$122;
 label=23;break;
 case 23: 
 var $126=$parent;
 var $127=$tmp;
 var $128=(($127)|0);
 var $129=(($128)|0);
 HEAP32[(($129)>>2)]=$126;
 var $130=$tmp;
 var $131=$parent;
 var $132=(($131)|0);
 var $133=(($132+8)|0);
 HEAP32[(($133)>>2)]=$130;
 label=24;break;
 case 24: 
 label=25;break;
 case 25: 
 var $136=$tmp;
 var $137=(($136)|0);
 var $138=(($137+8)|0);
 var $139=HEAP32[(($138)>>2)];
 var $140=($139|0)!=0;
 if($140){label=26;break;}else{label=29;break;}
 case 26: 
 label=27;break;
 case 27: 
 label=28;break;
 case 28: 
 label=29;break;
 case 29: 
 label=30;break;
 case 30: 
 var $146=$parent;
 $tmp=$146;
 var $147=$2;
 $parent=$147;
 var $148=$tmp;
 $2=$148;
 label=31;break;
 case 31: 
 label=32;break;
 case 32: 
 var $151=$parent;
 var $152=(($151)|0);
 var $153=(($152+12)|0);
 HEAP32[(($153)>>2)]=0;
 var $154=$gparent;
 var $155=(($154)|0);
 var $156=(($155+12)|0);
 HEAP32[(($156)>>2)]=1;
 label=33;break;
 case 33: 
 label=34;break;
 case 34: 
 var $159=$gparent;
 var $160=(($159)|0);
 var $161=(($160)|0);
 var $162=HEAP32[(($161)>>2)];
 $tmp=$162;
 var $163=$tmp;
 var $164=(($163)|0);
 var $165=(($164+4)|0);
 var $166=HEAP32[(($165)>>2)];
 var $167=$gparent;
 var $168=(($167)|0);
 var $169=(($168)|0);
 HEAP32[(($169)>>2)]=$166;
 var $170=($166|0)!=0;
 if($170){label=35;break;}else{label=36;break;}
 case 35: 
 var $172=$gparent;
 var $173=$tmp;
 var $174=(($173)|0);
 var $175=(($174+4)|0);
 var $176=HEAP32[(($175)>>2)];
 var $177=(($176)|0);
 var $178=(($177+8)|0);
 HEAP32[(($178)>>2)]=$172;
 label=36;break;
 case 36: 
 label=37;break;
 case 37: 
 label=38;break;
 case 38: 
 var $182=$gparent;
 var $183=(($182)|0);
 var $184=(($183+8)|0);
 var $185=HEAP32[(($184)>>2)];
 var $186=$tmp;
 var $187=(($186)|0);
 var $188=(($187+8)|0);
 HEAP32[(($188)>>2)]=$185;
 var $189=($185|0)!=0;
 if($189){label=39;break;}else{label=43;break;}
 case 39: 
 var $191=$gparent;
 var $192=$gparent;
 var $193=(($192)|0);
 var $194=(($193+8)|0);
 var $195=HEAP32[(($194)>>2)];
 var $196=(($195)|0);
 var $197=(($196)|0);
 var $198=HEAP32[(($197)>>2)];
 var $199=($191|0)==($198|0);
 if($199){label=40;break;}else{label=41;break;}
 case 40: 
 var $201=$tmp;
 var $202=$gparent;
 var $203=(($202)|0);
 var $204=(($203+8)|0);
 var $205=HEAP32[(($204)>>2)];
 var $206=(($205)|0);
 var $207=(($206)|0);
 HEAP32[(($207)>>2)]=$201;
 label=42;break;
 case 41: 
 var $209=$tmp;
 var $210=$gparent;
 var $211=(($210)|0);
 var $212=(($211+8)|0);
 var $213=HEAP32[(($212)>>2)];
 var $214=(($213)|0);
 var $215=(($214+4)|0);
 HEAP32[(($215)>>2)]=$209;
 label=42;break;
 case 42: 
 label=44;break;
 case 43: 
 var $218=$tmp;
 var $219=$1;
 var $220=(($219)|0);
 HEAP32[(($220)>>2)]=$218;
 label=44;break;
 case 44: 
 var $222=$gparent;
 var $223=$tmp;
 var $224=(($223)|0);
 var $225=(($224+4)|0);
 HEAP32[(($225)>>2)]=$222;
 var $226=$tmp;
 var $227=$gparent;
 var $228=(($227)|0);
 var $229=(($228+8)|0);
 HEAP32[(($229)>>2)]=$226;
 label=45;break;
 case 45: 
 label=46;break;
 case 46: 
 var $232=$tmp;
 var $233=(($232)|0);
 var $234=(($233+8)|0);
 var $235=HEAP32[(($234)>>2)];
 var $236=($235|0)!=0;
 if($236){label=47;break;}else{label=50;break;}
 case 47: 
 label=48;break;
 case 48: 
 label=49;break;
 case 49: 
 label=50;break;
 case 50: 
 label=51;break;
 case 51: 
 label=98;break;
 case 52: 
 var $243=$gparent;
 var $244=(($243)|0);
 var $245=(($244)|0);
 var $246=HEAP32[(($245)>>2)];
 $tmp=$246;
 var $247=$tmp;
 var $248=($247|0)!=0;
 if($248){label=53;break;}else{label=57;break;}
 case 53: 
 var $250=$tmp;
 var $251=(($250)|0);
 var $252=(($251+12)|0);
 var $253=HEAP32[(($252)>>2)];
 var $254=($253|0)==1;
 if($254){label=54;break;}else{label=57;break;}
 case 54: 
 var $256=$tmp;
 var $257=(($256)|0);
 var $258=(($257+12)|0);
 HEAP32[(($258)>>2)]=0;
 label=55;break;
 case 55: 
 var $260=$parent;
 var $261=(($260)|0);
 var $262=(($261+12)|0);
 HEAP32[(($262)>>2)]=0;
 var $263=$gparent;
 var $264=(($263)|0);
 var $265=(($264+12)|0);
 HEAP32[(($265)>>2)]=1;
 label=56;break;
 case 56: 
 var $267=$gparent;
 $2=$267;
 label=2;break;
 case 57: 
 var $269=$parent;
 var $270=(($269)|0);
 var $271=(($270)|0);
 var $272=HEAP32[(($271)>>2)];
 var $273=$2;
 var $274=($272|0)==($273|0);
 if($274){label=58;break;}else{label=77;break;}
 case 58: 
 label=59;break;
 case 59: 
 var $277=$parent;
 var $278=(($277)|0);
 var $279=(($278)|0);
 var $280=HEAP32[(($279)>>2)];
 $tmp=$280;
 var $281=$tmp;
 var $282=(($281)|0);
 var $283=(($282+4)|0);
 var $284=HEAP32[(($283)>>2)];
 var $285=$parent;
 var $286=(($285)|0);
 var $287=(($286)|0);
 HEAP32[(($287)>>2)]=$284;
 var $288=($284|0)!=0;
 if($288){label=60;break;}else{label=61;break;}
 case 60: 
 var $290=$parent;
 var $291=$tmp;
 var $292=(($291)|0);
 var $293=(($292+4)|0);
 var $294=HEAP32[(($293)>>2)];
 var $295=(($294)|0);
 var $296=(($295+8)|0);
 HEAP32[(($296)>>2)]=$290;
 label=61;break;
 case 61: 
 label=62;break;
 case 62: 
 label=63;break;
 case 63: 
 var $300=$parent;
 var $301=(($300)|0);
 var $302=(($301+8)|0);
 var $303=HEAP32[(($302)>>2)];
 var $304=$tmp;
 var $305=(($304)|0);
 var $306=(($305+8)|0);
 HEAP32[(($306)>>2)]=$303;
 var $307=($303|0)!=0;
 if($307){label=64;break;}else{label=68;break;}
 case 64: 
 var $309=$parent;
 var $310=$parent;
 var $311=(($310)|0);
 var $312=(($311+8)|0);
 var $313=HEAP32[(($312)>>2)];
 var $314=(($313)|0);
 var $315=(($314)|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=($309|0)==($316|0);
 if($317){label=65;break;}else{label=66;break;}
 case 65: 
 var $319=$tmp;
 var $320=$parent;
 var $321=(($320)|0);
 var $322=(($321+8)|0);
 var $323=HEAP32[(($322)>>2)];
 var $324=(($323)|0);
 var $325=(($324)|0);
 HEAP32[(($325)>>2)]=$319;
 label=67;break;
 case 66: 
 var $327=$tmp;
 var $328=$parent;
 var $329=(($328)|0);
 var $330=(($329+8)|0);
 var $331=HEAP32[(($330)>>2)];
 var $332=(($331)|0);
 var $333=(($332+4)|0);
 HEAP32[(($333)>>2)]=$327;
 label=67;break;
 case 67: 
 label=69;break;
 case 68: 
 var $336=$tmp;
 var $337=$1;
 var $338=(($337)|0);
 HEAP32[(($338)>>2)]=$336;
 label=69;break;
 case 69: 
 var $340=$parent;
 var $341=$tmp;
 var $342=(($341)|0);
 var $343=(($342+4)|0);
 HEAP32[(($343)>>2)]=$340;
 var $344=$tmp;
 var $345=$parent;
 var $346=(($345)|0);
 var $347=(($346+8)|0);
 HEAP32[(($347)>>2)]=$344;
 label=70;break;
 case 70: 
 label=71;break;
 case 71: 
 var $350=$tmp;
 var $351=(($350)|0);
 var $352=(($351+8)|0);
 var $353=HEAP32[(($352)>>2)];
 var $354=($353|0)!=0;
 if($354){label=72;break;}else{label=75;break;}
 case 72: 
 label=73;break;
 case 73: 
 label=74;break;
 case 74: 
 label=75;break;
 case 75: 
 label=76;break;
 case 76: 
 var $360=$parent;
 $tmp=$360;
 var $361=$2;
 $parent=$361;
 var $362=$tmp;
 $2=$362;
 label=77;break;
 case 77: 
 label=78;break;
 case 78: 
 var $365=$parent;
 var $366=(($365)|0);
 var $367=(($366+12)|0);
 HEAP32[(($367)>>2)]=0;
 var $368=$gparent;
 var $369=(($368)|0);
 var $370=(($369+12)|0);
 HEAP32[(($370)>>2)]=1;
 label=79;break;
 case 79: 
 label=80;break;
 case 80: 
 var $373=$gparent;
 var $374=(($373)|0);
 var $375=(($374+4)|0);
 var $376=HEAP32[(($375)>>2)];
 $tmp=$376;
 var $377=$tmp;
 var $378=(($377)|0);
 var $379=(($378)|0);
 var $380=HEAP32[(($379)>>2)];
 var $381=$gparent;
 var $382=(($381)|0);
 var $383=(($382+4)|0);
 HEAP32[(($383)>>2)]=$380;
 var $384=($380|0)!=0;
 if($384){label=81;break;}else{label=82;break;}
 case 81: 
 var $386=$gparent;
 var $387=$tmp;
 var $388=(($387)|0);
 var $389=(($388)|0);
 var $390=HEAP32[(($389)>>2)];
 var $391=(($390)|0);
 var $392=(($391+8)|0);
 HEAP32[(($392)>>2)]=$386;
 label=82;break;
 case 82: 
 label=83;break;
 case 83: 
 label=84;break;
 case 84: 
 var $396=$gparent;
 var $397=(($396)|0);
 var $398=(($397+8)|0);
 var $399=HEAP32[(($398)>>2)];
 var $400=$tmp;
 var $401=(($400)|0);
 var $402=(($401+8)|0);
 HEAP32[(($402)>>2)]=$399;
 var $403=($399|0)!=0;
 if($403){label=85;break;}else{label=89;break;}
 case 85: 
 var $405=$gparent;
 var $406=$gparent;
 var $407=(($406)|0);
 var $408=(($407+8)|0);
 var $409=HEAP32[(($408)>>2)];
 var $410=(($409)|0);
 var $411=(($410)|0);
 var $412=HEAP32[(($411)>>2)];
 var $413=($405|0)==($412|0);
 if($413){label=86;break;}else{label=87;break;}
 case 86: 
 var $415=$tmp;
 var $416=$gparent;
 var $417=(($416)|0);
 var $418=(($417+8)|0);
 var $419=HEAP32[(($418)>>2)];
 var $420=(($419)|0);
 var $421=(($420)|0);
 HEAP32[(($421)>>2)]=$415;
 label=88;break;
 case 87: 
 var $423=$tmp;
 var $424=$gparent;
 var $425=(($424)|0);
 var $426=(($425+8)|0);
 var $427=HEAP32[(($426)>>2)];
 var $428=(($427)|0);
 var $429=(($428+4)|0);
 HEAP32[(($429)>>2)]=$423;
 label=88;break;
 case 88: 
 label=90;break;
 case 89: 
 var $432=$tmp;
 var $433=$1;
 var $434=(($433)|0);
 HEAP32[(($434)>>2)]=$432;
 label=90;break;
 case 90: 
 var $436=$gparent;
 var $437=$tmp;
 var $438=(($437)|0);
 var $439=(($438)|0);
 HEAP32[(($439)>>2)]=$436;
 var $440=$tmp;
 var $441=$gparent;
 var $442=(($441)|0);
 var $443=(($442+8)|0);
 HEAP32[(($443)>>2)]=$440;
 label=91;break;
 case 91: 
 label=92;break;
 case 92: 
 var $446=$tmp;
 var $447=(($446)|0);
 var $448=(($447+8)|0);
 var $449=HEAP32[(($448)>>2)];
 var $450=($449|0)!=0;
 if($450){label=93;break;}else{label=96;break;}
 case 93: 
 label=94;break;
 case 94: 
 label=95;break;
 case 95: 
 label=96;break;
 case 96: 
 label=97;break;
 case 97: 
 label=98;break;
 case 98: 
 label=2;break;
 case 99: 
 var $458=$1;
 var $459=(($458)|0);
 var $460=HEAP32[(($459)>>2)];
 var $461=(($460)|0);
 var $462=(($461+12)|0);
 HEAP32[(($462)>>2)]=0;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_REMOVE_COLOR($head,$parent,$elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $tmp;
 var $oleft;
 var $oright;
 $1=$head;
 $2=$parent;
 $3=$elm;
 label=2;break;
 case 2: 
 var $5=$3;
 var $6=($5|0)==0;
 if($6){label=4;break;}else{label=3;break;}
 case 3: 
 var $8=$3;
 var $9=(($8)|0);
 var $10=(($9+12)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=($11|0)==0;
 if($12){label=4;break;}else{var $20=0;label=5;break;}
 case 4: 
 var $14=$3;
 var $15=$1;
 var $16=(($15)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($14|0)!=($17|0);
 var $20=$18;label=5;break;
 case 5: 
 var $20;
 if($20){label=6;break;}else{label=152;break;}
 case 6: 
 var $22=$2;
 var $23=(($22)|0);
 var $24=(($23)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=$3;
 var $27=($25|0)==($26|0);
 if($27){label=7;break;}else{label=79;break;}
 case 7: 
 var $29=$2;
 var $30=(($29)|0);
 var $31=(($30+4)|0);
 var $32=HEAP32[(($31)>>2)];
 $tmp=$32;
 var $33=$tmp;
 var $34=(($33)|0);
 var $35=(($34+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==1;
 if($37){label=8;break;}else{label=29;break;}
 case 8: 
 label=9;break;
 case 9: 
 var $40=$tmp;
 var $41=(($40)|0);
 var $42=(($41+12)|0);
 HEAP32[(($42)>>2)]=0;
 var $43=$2;
 var $44=(($43)|0);
 var $45=(($44+12)|0);
 HEAP32[(($45)>>2)]=1;
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 var $48=$2;
 var $49=(($48)|0);
 var $50=(($49+4)|0);
 var $51=HEAP32[(($50)>>2)];
 $tmp=$51;
 var $52=$tmp;
 var $53=(($52)|0);
 var $54=(($53)|0);
 var $55=HEAP32[(($54)>>2)];
 var $56=$2;
 var $57=(($56)|0);
 var $58=(($57+4)|0);
 HEAP32[(($58)>>2)]=$55;
 var $59=($55|0)!=0;
 if($59){label=12;break;}else{label=13;break;}
 case 12: 
 var $61=$2;
 var $62=$tmp;
 var $63=(($62)|0);
 var $64=(($63)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=(($65)|0);
 var $67=(($66+8)|0);
 HEAP32[(($67)>>2)]=$61;
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 var $71=$2;
 var $72=(($71)|0);
 var $73=(($72+8)|0);
 var $74=HEAP32[(($73)>>2)];
 var $75=$tmp;
 var $76=(($75)|0);
 var $77=(($76+8)|0);
 HEAP32[(($77)>>2)]=$74;
 var $78=($74|0)!=0;
 if($78){label=16;break;}else{label=20;break;}
 case 16: 
 var $80=$2;
 var $81=$2;
 var $82=(($81)|0);
 var $83=(($82+8)|0);
 var $84=HEAP32[(($83)>>2)];
 var $85=(($84)|0);
 var $86=(($85)|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=($80|0)==($87|0);
 if($88){label=17;break;}else{label=18;break;}
 case 17: 
 var $90=$tmp;
 var $91=$2;
 var $92=(($91)|0);
 var $93=(($92+8)|0);
 var $94=HEAP32[(($93)>>2)];
 var $95=(($94)|0);
 var $96=(($95)|0);
 HEAP32[(($96)>>2)]=$90;
 label=19;break;
 case 18: 
 var $98=$tmp;
 var $99=$2;
 var $100=(($99)|0);
 var $101=(($100+8)|0);
 var $102=HEAP32[(($101)>>2)];
 var $103=(($102)|0);
 var $104=(($103+4)|0);
 HEAP32[(($104)>>2)]=$98;
 label=19;break;
 case 19: 
 label=21;break;
 case 20: 
 var $107=$tmp;
 var $108=$1;
 var $109=(($108)|0);
 HEAP32[(($109)>>2)]=$107;
 label=21;break;
 case 21: 
 var $111=$2;
 var $112=$tmp;
 var $113=(($112)|0);
 var $114=(($113)|0);
 HEAP32[(($114)>>2)]=$111;
 var $115=$tmp;
 var $116=$2;
 var $117=(($116)|0);
 var $118=(($117+8)|0);
 HEAP32[(($118)>>2)]=$115;
 label=22;break;
 case 22: 
 label=23;break;
 case 23: 
 var $121=$tmp;
 var $122=(($121)|0);
 var $123=(($122+8)|0);
 var $124=HEAP32[(($123)>>2)];
 var $125=($124|0)!=0;
 if($125){label=24;break;}else{label=27;break;}
 case 24: 
 label=25;break;
 case 25: 
 label=26;break;
 case 26: 
 label=27;break;
 case 27: 
 label=28;break;
 case 28: 
 var $131=$2;
 var $132=(($131)|0);
 var $133=(($132+4)|0);
 var $134=HEAP32[(($133)>>2)];
 $tmp=$134;
 label=29;break;
 case 29: 
 var $136=$tmp;
 var $137=(($136)|0);
 var $138=(($137)|0);
 var $139=HEAP32[(($138)>>2)];
 var $140=($139|0)==0;
 if($140){label=31;break;}else{label=30;break;}
 case 30: 
 var $142=$tmp;
 var $143=(($142)|0);
 var $144=(($143)|0);
 var $145=HEAP32[(($144)>>2)];
 var $146=(($145)|0);
 var $147=(($146+12)|0);
 var $148=HEAP32[(($147)>>2)];
 var $149=($148|0)==0;
 if($149){label=31;break;}else{label=34;break;}
 case 31: 
 var $151=$tmp;
 var $152=(($151)|0);
 var $153=(($152+4)|0);
 var $154=HEAP32[(($153)>>2)];
 var $155=($154|0)==0;
 if($155){label=33;break;}else{label=32;break;}
 case 32: 
 var $157=$tmp;
 var $158=(($157)|0);
 var $159=(($158+4)|0);
 var $160=HEAP32[(($159)>>2)];
 var $161=(($160)|0);
 var $162=(($161+12)|0);
 var $163=HEAP32[(($162)>>2)];
 var $164=($163|0)==0;
 if($164){label=33;break;}else{label=34;break;}
 case 33: 
 var $166=$tmp;
 var $167=(($166)|0);
 var $168=(($167+12)|0);
 HEAP32[(($168)>>2)]=1;
 var $169=$2;
 $3=$169;
 var $170=$3;
 var $171=(($170)|0);
 var $172=(($171+8)|0);
 var $173=HEAP32[(($172)>>2)];
 $2=$173;
 label=78;break;
 case 34: 
 var $175=$tmp;
 var $176=(($175)|0);
 var $177=(($176+4)|0);
 var $178=HEAP32[(($177)>>2)];
 var $179=($178|0)==0;
 if($179){label=36;break;}else{label=35;break;}
 case 35: 
 var $181=$tmp;
 var $182=(($181)|0);
 var $183=(($182+4)|0);
 var $184=HEAP32[(($183)>>2)];
 var $185=(($184)|0);
 var $186=(($185+12)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=($187|0)==0;
 if($188){label=36;break;}else{label=57;break;}
 case 36: 
 var $190=$tmp;
 var $191=(($190)|0);
 var $192=(($191)|0);
 var $193=HEAP32[(($192)>>2)];
 $oleft=$193;
 var $194=($193|0)!=0;
 if($194){label=37;break;}else{label=38;break;}
 case 37: 
 var $196=$oleft;
 var $197=(($196)|0);
 var $198=(($197+12)|0);
 HEAP32[(($198)>>2)]=0;
 label=38;break;
 case 38: 
 var $200=$tmp;
 var $201=(($200)|0);
 var $202=(($201+12)|0);
 HEAP32[(($202)>>2)]=1;
 label=39;break;
 case 39: 
 var $204=$tmp;
 var $205=(($204)|0);
 var $206=(($205)|0);
 var $207=HEAP32[(($206)>>2)];
 $oleft=$207;
 var $208=$oleft;
 var $209=(($208)|0);
 var $210=(($209+4)|0);
 var $211=HEAP32[(($210)>>2)];
 var $212=$tmp;
 var $213=(($212)|0);
 var $214=(($213)|0);
 HEAP32[(($214)>>2)]=$211;
 var $215=($211|0)!=0;
 if($215){label=40;break;}else{label=41;break;}
 case 40: 
 var $217=$tmp;
 var $218=$oleft;
 var $219=(($218)|0);
 var $220=(($219+4)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=(($221)|0);
 var $223=(($222+8)|0);
 HEAP32[(($223)>>2)]=$217;
 label=41;break;
 case 41: 
 label=42;break;
 case 42: 
 label=43;break;
 case 43: 
 var $227=$tmp;
 var $228=(($227)|0);
 var $229=(($228+8)|0);
 var $230=HEAP32[(($229)>>2)];
 var $231=$oleft;
 var $232=(($231)|0);
 var $233=(($232+8)|0);
 HEAP32[(($233)>>2)]=$230;
 var $234=($230|0)!=0;
 if($234){label=44;break;}else{label=48;break;}
 case 44: 
 var $236=$tmp;
 var $237=$tmp;
 var $238=(($237)|0);
 var $239=(($238+8)|0);
 var $240=HEAP32[(($239)>>2)];
 var $241=(($240)|0);
 var $242=(($241)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=($236|0)==($243|0);
 if($244){label=45;break;}else{label=46;break;}
 case 45: 
 var $246=$oleft;
 var $247=$tmp;
 var $248=(($247)|0);
 var $249=(($248+8)|0);
 var $250=HEAP32[(($249)>>2)];
 var $251=(($250)|0);
 var $252=(($251)|0);
 HEAP32[(($252)>>2)]=$246;
 label=47;break;
 case 46: 
 var $254=$oleft;
 var $255=$tmp;
 var $256=(($255)|0);
 var $257=(($256+8)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=(($258)|0);
 var $260=(($259+4)|0);
 HEAP32[(($260)>>2)]=$254;
 label=47;break;
 case 47: 
 label=49;break;
 case 48: 
 var $263=$oleft;
 var $264=$1;
 var $265=(($264)|0);
 HEAP32[(($265)>>2)]=$263;
 label=49;break;
 case 49: 
 var $267=$tmp;
 var $268=$oleft;
 var $269=(($268)|0);
 var $270=(($269+4)|0);
 HEAP32[(($270)>>2)]=$267;
 var $271=$oleft;
 var $272=$tmp;
 var $273=(($272)|0);
 var $274=(($273+8)|0);
 HEAP32[(($274)>>2)]=$271;
 label=50;break;
 case 50: 
 label=51;break;
 case 51: 
 var $277=$oleft;
 var $278=(($277)|0);
 var $279=(($278+8)|0);
 var $280=HEAP32[(($279)>>2)];
 var $281=($280|0)!=0;
 if($281){label=52;break;}else{label=55;break;}
 case 52: 
 label=53;break;
 case 53: 
 label=54;break;
 case 54: 
 label=55;break;
 case 55: 
 label=56;break;
 case 56: 
 var $287=$2;
 var $288=(($287)|0);
 var $289=(($288+4)|0);
 var $290=HEAP32[(($289)>>2)];
 $tmp=$290;
 label=57;break;
 case 57: 
 var $292=$2;
 var $293=(($292)|0);
 var $294=(($293+12)|0);
 var $295=HEAP32[(($294)>>2)];
 var $296=$tmp;
 var $297=(($296)|0);
 var $298=(($297+12)|0);
 HEAP32[(($298)>>2)]=$295;
 var $299=$2;
 var $300=(($299)|0);
 var $301=(($300+12)|0);
 HEAP32[(($301)>>2)]=0;
 var $302=$tmp;
 var $303=(($302)|0);
 var $304=(($303+4)|0);
 var $305=HEAP32[(($304)>>2)];
 var $306=($305|0)!=0;
 if($306){label=58;break;}else{label=59;break;}
 case 58: 
 var $308=$tmp;
 var $309=(($308)|0);
 var $310=(($309+4)|0);
 var $311=HEAP32[(($310)>>2)];
 var $312=(($311)|0);
 var $313=(($312+12)|0);
 HEAP32[(($313)>>2)]=0;
 label=59;break;
 case 59: 
 label=60;break;
 case 60: 
 var $316=$2;
 var $317=(($316)|0);
 var $318=(($317+4)|0);
 var $319=HEAP32[(($318)>>2)];
 $tmp=$319;
 var $320=$tmp;
 var $321=(($320)|0);
 var $322=(($321)|0);
 var $323=HEAP32[(($322)>>2)];
 var $324=$2;
 var $325=(($324)|0);
 var $326=(($325+4)|0);
 HEAP32[(($326)>>2)]=$323;
 var $327=($323|0)!=0;
 if($327){label=61;break;}else{label=62;break;}
 case 61: 
 var $329=$2;
 var $330=$tmp;
 var $331=(($330)|0);
 var $332=(($331)|0);
 var $333=HEAP32[(($332)>>2)];
 var $334=(($333)|0);
 var $335=(($334+8)|0);
 HEAP32[(($335)>>2)]=$329;
 label=62;break;
 case 62: 
 label=63;break;
 case 63: 
 label=64;break;
 case 64: 
 var $339=$2;
 var $340=(($339)|0);
 var $341=(($340+8)|0);
 var $342=HEAP32[(($341)>>2)];
 var $343=$tmp;
 var $344=(($343)|0);
 var $345=(($344+8)|0);
 HEAP32[(($345)>>2)]=$342;
 var $346=($342|0)!=0;
 if($346){label=65;break;}else{label=69;break;}
 case 65: 
 var $348=$2;
 var $349=$2;
 var $350=(($349)|0);
 var $351=(($350+8)|0);
 var $352=HEAP32[(($351)>>2)];
 var $353=(($352)|0);
 var $354=(($353)|0);
 var $355=HEAP32[(($354)>>2)];
 var $356=($348|0)==($355|0);
 if($356){label=66;break;}else{label=67;break;}
 case 66: 
 var $358=$tmp;
 var $359=$2;
 var $360=(($359)|0);
 var $361=(($360+8)|0);
 var $362=HEAP32[(($361)>>2)];
 var $363=(($362)|0);
 var $364=(($363)|0);
 HEAP32[(($364)>>2)]=$358;
 label=68;break;
 case 67: 
 var $366=$tmp;
 var $367=$2;
 var $368=(($367)|0);
 var $369=(($368+8)|0);
 var $370=HEAP32[(($369)>>2)];
 var $371=(($370)|0);
 var $372=(($371+4)|0);
 HEAP32[(($372)>>2)]=$366;
 label=68;break;
 case 68: 
 label=70;break;
 case 69: 
 var $375=$tmp;
 var $376=$1;
 var $377=(($376)|0);
 HEAP32[(($377)>>2)]=$375;
 label=70;break;
 case 70: 
 var $379=$2;
 var $380=$tmp;
 var $381=(($380)|0);
 var $382=(($381)|0);
 HEAP32[(($382)>>2)]=$379;
 var $383=$tmp;
 var $384=$2;
 var $385=(($384)|0);
 var $386=(($385+8)|0);
 HEAP32[(($386)>>2)]=$383;
 label=71;break;
 case 71: 
 label=72;break;
 case 72: 
 var $389=$tmp;
 var $390=(($389)|0);
 var $391=(($390+8)|0);
 var $392=HEAP32[(($391)>>2)];
 var $393=($392|0)!=0;
 if($393){label=73;break;}else{label=76;break;}
 case 73: 
 label=74;break;
 case 74: 
 label=75;break;
 case 75: 
 label=76;break;
 case 76: 
 label=77;break;
 case 77: 
 var $399=$1;
 var $400=(($399)|0);
 var $401=HEAP32[(($400)>>2)];
 $3=$401;
 label=152;break;
 case 78: 
 label=151;break;
 case 79: 
 var $404=$2;
 var $405=(($404)|0);
 var $406=(($405)|0);
 var $407=HEAP32[(($406)>>2)];
 $tmp=$407;
 var $408=$tmp;
 var $409=(($408)|0);
 var $410=(($409+12)|0);
 var $411=HEAP32[(($410)>>2)];
 var $412=($411|0)==1;
 if($412){label=80;break;}else{label=101;break;}
 case 80: 
 label=81;break;
 case 81: 
 var $415=$tmp;
 var $416=(($415)|0);
 var $417=(($416+12)|0);
 HEAP32[(($417)>>2)]=0;
 var $418=$2;
 var $419=(($418)|0);
 var $420=(($419+12)|0);
 HEAP32[(($420)>>2)]=1;
 label=82;break;
 case 82: 
 label=83;break;
 case 83: 
 var $423=$2;
 var $424=(($423)|0);
 var $425=(($424)|0);
 var $426=HEAP32[(($425)>>2)];
 $tmp=$426;
 var $427=$tmp;
 var $428=(($427)|0);
 var $429=(($428+4)|0);
 var $430=HEAP32[(($429)>>2)];
 var $431=$2;
 var $432=(($431)|0);
 var $433=(($432)|0);
 HEAP32[(($433)>>2)]=$430;
 var $434=($430|0)!=0;
 if($434){label=84;break;}else{label=85;break;}
 case 84: 
 var $436=$2;
 var $437=$tmp;
 var $438=(($437)|0);
 var $439=(($438+4)|0);
 var $440=HEAP32[(($439)>>2)];
 var $441=(($440)|0);
 var $442=(($441+8)|0);
 HEAP32[(($442)>>2)]=$436;
 label=85;break;
 case 85: 
 label=86;break;
 case 86: 
 label=87;break;
 case 87: 
 var $446=$2;
 var $447=(($446)|0);
 var $448=(($447+8)|0);
 var $449=HEAP32[(($448)>>2)];
 var $450=$tmp;
 var $451=(($450)|0);
 var $452=(($451+8)|0);
 HEAP32[(($452)>>2)]=$449;
 var $453=($449|0)!=0;
 if($453){label=88;break;}else{label=92;break;}
 case 88: 
 var $455=$2;
 var $456=$2;
 var $457=(($456)|0);
 var $458=(($457+8)|0);
 var $459=HEAP32[(($458)>>2)];
 var $460=(($459)|0);
 var $461=(($460)|0);
 var $462=HEAP32[(($461)>>2)];
 var $463=($455|0)==($462|0);
 if($463){label=89;break;}else{label=90;break;}
 case 89: 
 var $465=$tmp;
 var $466=$2;
 var $467=(($466)|0);
 var $468=(($467+8)|0);
 var $469=HEAP32[(($468)>>2)];
 var $470=(($469)|0);
 var $471=(($470)|0);
 HEAP32[(($471)>>2)]=$465;
 label=91;break;
 case 90: 
 var $473=$tmp;
 var $474=$2;
 var $475=(($474)|0);
 var $476=(($475+8)|0);
 var $477=HEAP32[(($476)>>2)];
 var $478=(($477)|0);
 var $479=(($478+4)|0);
 HEAP32[(($479)>>2)]=$473;
 label=91;break;
 case 91: 
 label=93;break;
 case 92: 
 var $482=$tmp;
 var $483=$1;
 var $484=(($483)|0);
 HEAP32[(($484)>>2)]=$482;
 label=93;break;
 case 93: 
 var $486=$2;
 var $487=$tmp;
 var $488=(($487)|0);
 var $489=(($488+4)|0);
 HEAP32[(($489)>>2)]=$486;
 var $490=$tmp;
 var $491=$2;
 var $492=(($491)|0);
 var $493=(($492+8)|0);
 HEAP32[(($493)>>2)]=$490;
 label=94;break;
 case 94: 
 label=95;break;
 case 95: 
 var $496=$tmp;
 var $497=(($496)|0);
 var $498=(($497+8)|0);
 var $499=HEAP32[(($498)>>2)];
 var $500=($499|0)!=0;
 if($500){label=96;break;}else{label=99;break;}
 case 96: 
 label=97;break;
 case 97: 
 label=98;break;
 case 98: 
 label=99;break;
 case 99: 
 label=100;break;
 case 100: 
 var $506=$2;
 var $507=(($506)|0);
 var $508=(($507)|0);
 var $509=HEAP32[(($508)>>2)];
 $tmp=$509;
 label=101;break;
 case 101: 
 var $511=$tmp;
 var $512=(($511)|0);
 var $513=(($512)|0);
 var $514=HEAP32[(($513)>>2)];
 var $515=($514|0)==0;
 if($515){label=103;break;}else{label=102;break;}
 case 102: 
 var $517=$tmp;
 var $518=(($517)|0);
 var $519=(($518)|0);
 var $520=HEAP32[(($519)>>2)];
 var $521=(($520)|0);
 var $522=(($521+12)|0);
 var $523=HEAP32[(($522)>>2)];
 var $524=($523|0)==0;
 if($524){label=103;break;}else{label=106;break;}
 case 103: 
 var $526=$tmp;
 var $527=(($526)|0);
 var $528=(($527+4)|0);
 var $529=HEAP32[(($528)>>2)];
 var $530=($529|0)==0;
 if($530){label=105;break;}else{label=104;break;}
 case 104: 
 var $532=$tmp;
 var $533=(($532)|0);
 var $534=(($533+4)|0);
 var $535=HEAP32[(($534)>>2)];
 var $536=(($535)|0);
 var $537=(($536+12)|0);
 var $538=HEAP32[(($537)>>2)];
 var $539=($538|0)==0;
 if($539){label=105;break;}else{label=106;break;}
 case 105: 
 var $541=$tmp;
 var $542=(($541)|0);
 var $543=(($542+12)|0);
 HEAP32[(($543)>>2)]=1;
 var $544=$2;
 $3=$544;
 var $545=$3;
 var $546=(($545)|0);
 var $547=(($546+8)|0);
 var $548=HEAP32[(($547)>>2)];
 $2=$548;
 label=150;break;
 case 106: 
 var $550=$tmp;
 var $551=(($550)|0);
 var $552=(($551)|0);
 var $553=HEAP32[(($552)>>2)];
 var $554=($553|0)==0;
 if($554){label=108;break;}else{label=107;break;}
 case 107: 
 var $556=$tmp;
 var $557=(($556)|0);
 var $558=(($557)|0);
 var $559=HEAP32[(($558)>>2)];
 var $560=(($559)|0);
 var $561=(($560+12)|0);
 var $562=HEAP32[(($561)>>2)];
 var $563=($562|0)==0;
 if($563){label=108;break;}else{label=129;break;}
 case 108: 
 var $565=$tmp;
 var $566=(($565)|0);
 var $567=(($566+4)|0);
 var $568=HEAP32[(($567)>>2)];
 $oright=$568;
 var $569=($568|0)!=0;
 if($569){label=109;break;}else{label=110;break;}
 case 109: 
 var $571=$oright;
 var $572=(($571)|0);
 var $573=(($572+12)|0);
 HEAP32[(($573)>>2)]=0;
 label=110;break;
 case 110: 
 var $575=$tmp;
 var $576=(($575)|0);
 var $577=(($576+12)|0);
 HEAP32[(($577)>>2)]=1;
 label=111;break;
 case 111: 
 var $579=$tmp;
 var $580=(($579)|0);
 var $581=(($580+4)|0);
 var $582=HEAP32[(($581)>>2)];
 $oright=$582;
 var $583=$oright;
 var $584=(($583)|0);
 var $585=(($584)|0);
 var $586=HEAP32[(($585)>>2)];
 var $587=$tmp;
 var $588=(($587)|0);
 var $589=(($588+4)|0);
 HEAP32[(($589)>>2)]=$586;
 var $590=($586|0)!=0;
 if($590){label=112;break;}else{label=113;break;}
 case 112: 
 var $592=$tmp;
 var $593=$oright;
 var $594=(($593)|0);
 var $595=(($594)|0);
 var $596=HEAP32[(($595)>>2)];
 var $597=(($596)|0);
 var $598=(($597+8)|0);
 HEAP32[(($598)>>2)]=$592;
 label=113;break;
 case 113: 
 label=114;break;
 case 114: 
 label=115;break;
 case 115: 
 var $602=$tmp;
 var $603=(($602)|0);
 var $604=(($603+8)|0);
 var $605=HEAP32[(($604)>>2)];
 var $606=$oright;
 var $607=(($606)|0);
 var $608=(($607+8)|0);
 HEAP32[(($608)>>2)]=$605;
 var $609=($605|0)!=0;
 if($609){label=116;break;}else{label=120;break;}
 case 116: 
 var $611=$tmp;
 var $612=$tmp;
 var $613=(($612)|0);
 var $614=(($613+8)|0);
 var $615=HEAP32[(($614)>>2)];
 var $616=(($615)|0);
 var $617=(($616)|0);
 var $618=HEAP32[(($617)>>2)];
 var $619=($611|0)==($618|0);
 if($619){label=117;break;}else{label=118;break;}
 case 117: 
 var $621=$oright;
 var $622=$tmp;
 var $623=(($622)|0);
 var $624=(($623+8)|0);
 var $625=HEAP32[(($624)>>2)];
 var $626=(($625)|0);
 var $627=(($626)|0);
 HEAP32[(($627)>>2)]=$621;
 label=119;break;
 case 118: 
 var $629=$oright;
 var $630=$tmp;
 var $631=(($630)|0);
 var $632=(($631+8)|0);
 var $633=HEAP32[(($632)>>2)];
 var $634=(($633)|0);
 var $635=(($634+4)|0);
 HEAP32[(($635)>>2)]=$629;
 label=119;break;
 case 119: 
 label=121;break;
 case 120: 
 var $638=$oright;
 var $639=$1;
 var $640=(($639)|0);
 HEAP32[(($640)>>2)]=$638;
 label=121;break;
 case 121: 
 var $642=$tmp;
 var $643=$oright;
 var $644=(($643)|0);
 var $645=(($644)|0);
 HEAP32[(($645)>>2)]=$642;
 var $646=$oright;
 var $647=$tmp;
 var $648=(($647)|0);
 var $649=(($648+8)|0);
 HEAP32[(($649)>>2)]=$646;
 label=122;break;
 case 122: 
 label=123;break;
 case 123: 
 var $652=$oright;
 var $653=(($652)|0);
 var $654=(($653+8)|0);
 var $655=HEAP32[(($654)>>2)];
 var $656=($655|0)!=0;
 if($656){label=124;break;}else{label=127;break;}
 case 124: 
 label=125;break;
 case 125: 
 label=126;break;
 case 126: 
 label=127;break;
 case 127: 
 label=128;break;
 case 128: 
 var $662=$2;
 var $663=(($662)|0);
 var $664=(($663)|0);
 var $665=HEAP32[(($664)>>2)];
 $tmp=$665;
 label=129;break;
 case 129: 
 var $667=$2;
 var $668=(($667)|0);
 var $669=(($668+12)|0);
 var $670=HEAP32[(($669)>>2)];
 var $671=$tmp;
 var $672=(($671)|0);
 var $673=(($672+12)|0);
 HEAP32[(($673)>>2)]=$670;
 var $674=$2;
 var $675=(($674)|0);
 var $676=(($675+12)|0);
 HEAP32[(($676)>>2)]=0;
 var $677=$tmp;
 var $678=(($677)|0);
 var $679=(($678)|0);
 var $680=HEAP32[(($679)>>2)];
 var $681=($680|0)!=0;
 if($681){label=130;break;}else{label=131;break;}
 case 130: 
 var $683=$tmp;
 var $684=(($683)|0);
 var $685=(($684)|0);
 var $686=HEAP32[(($685)>>2)];
 var $687=(($686)|0);
 var $688=(($687+12)|0);
 HEAP32[(($688)>>2)]=0;
 label=131;break;
 case 131: 
 label=132;break;
 case 132: 
 var $691=$2;
 var $692=(($691)|0);
 var $693=(($692)|0);
 var $694=HEAP32[(($693)>>2)];
 $tmp=$694;
 var $695=$tmp;
 var $696=(($695)|0);
 var $697=(($696+4)|0);
 var $698=HEAP32[(($697)>>2)];
 var $699=$2;
 var $700=(($699)|0);
 var $701=(($700)|0);
 HEAP32[(($701)>>2)]=$698;
 var $702=($698|0)!=0;
 if($702){label=133;break;}else{label=134;break;}
 case 133: 
 var $704=$2;
 var $705=$tmp;
 var $706=(($705)|0);
 var $707=(($706+4)|0);
 var $708=HEAP32[(($707)>>2)];
 var $709=(($708)|0);
 var $710=(($709+8)|0);
 HEAP32[(($710)>>2)]=$704;
 label=134;break;
 case 134: 
 label=135;break;
 case 135: 
 label=136;break;
 case 136: 
 var $714=$2;
 var $715=(($714)|0);
 var $716=(($715+8)|0);
 var $717=HEAP32[(($716)>>2)];
 var $718=$tmp;
 var $719=(($718)|0);
 var $720=(($719+8)|0);
 HEAP32[(($720)>>2)]=$717;
 var $721=($717|0)!=0;
 if($721){label=137;break;}else{label=141;break;}
 case 137: 
 var $723=$2;
 var $724=$2;
 var $725=(($724)|0);
 var $726=(($725+8)|0);
 var $727=HEAP32[(($726)>>2)];
 var $728=(($727)|0);
 var $729=(($728)|0);
 var $730=HEAP32[(($729)>>2)];
 var $731=($723|0)==($730|0);
 if($731){label=138;break;}else{label=139;break;}
 case 138: 
 var $733=$tmp;
 var $734=$2;
 var $735=(($734)|0);
 var $736=(($735+8)|0);
 var $737=HEAP32[(($736)>>2)];
 var $738=(($737)|0);
 var $739=(($738)|0);
 HEAP32[(($739)>>2)]=$733;
 label=140;break;
 case 139: 
 var $741=$tmp;
 var $742=$2;
 var $743=(($742)|0);
 var $744=(($743+8)|0);
 var $745=HEAP32[(($744)>>2)];
 var $746=(($745)|0);
 var $747=(($746+4)|0);
 HEAP32[(($747)>>2)]=$741;
 label=140;break;
 case 140: 
 label=142;break;
 case 141: 
 var $750=$tmp;
 var $751=$1;
 var $752=(($751)|0);
 HEAP32[(($752)>>2)]=$750;
 label=142;break;
 case 142: 
 var $754=$2;
 var $755=$tmp;
 var $756=(($755)|0);
 var $757=(($756+4)|0);
 HEAP32[(($757)>>2)]=$754;
 var $758=$tmp;
 var $759=$2;
 var $760=(($759)|0);
 var $761=(($760+8)|0);
 HEAP32[(($761)>>2)]=$758;
 label=143;break;
 case 143: 
 label=144;break;
 case 144: 
 var $764=$tmp;
 var $765=(($764)|0);
 var $766=(($765+8)|0);
 var $767=HEAP32[(($766)>>2)];
 var $768=($767|0)!=0;
 if($768){label=145;break;}else{label=148;break;}
 case 145: 
 label=146;break;
 case 146: 
 label=147;break;
 case 147: 
 label=148;break;
 case 148: 
 label=149;break;
 case 149: 
 var $774=$1;
 var $775=(($774)|0);
 var $776=HEAP32[(($775)>>2)];
 $3=$776;
 label=152;break;
 case 150: 
 label=151;break;
 case 151: 
 label=2;break;
 case 152: 
 var $780=$3;
 var $781=($780|0)!=0;
 if($781){label=153;break;}else{label=154;break;}
 case 153: 
 var $783=$3;
 var $784=(($783)|0);
 var $785=(($784+12)|0);
 HEAP32[(($785)>>2)]=0;
 label=154;break;
 case 154: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_REMOVE($head,$elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $child;
 var $parent;
 var $old;
 var $color;
 var $left;
 $1=$head;
 $2=$elm;
 var $3=$2;
 $old=$3;
 var $4=$2;
 var $5=(($4)|0);
 var $6=(($5)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=($7|0)==0;
 if($8){label=2;break;}else{label=3;break;}
 case 2: 
 var $10=$2;
 var $11=(($10)|0);
 var $12=(($11+4)|0);
 var $13=HEAP32[(($12)>>2)];
 $child=$13;
 label=39;break;
 case 3: 
 var $15=$2;
 var $16=(($15)|0);
 var $17=(($16+4)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=($18|0)==0;
 if($19){label=4;break;}else{label=5;break;}
 case 4: 
 var $21=$2;
 var $22=(($21)|0);
 var $23=(($22)|0);
 var $24=HEAP32[(($23)>>2)];
 $child=$24;
 label=38;break;
 case 5: 
 var $26=$2;
 var $27=(($26)|0);
 var $28=(($27+4)|0);
 var $29=HEAP32[(($28)>>2)];
 $2=$29;
 label=6;break;
 case 6: 
 var $31=$2;
 var $32=(($31)|0);
 var $33=(($32)|0);
 var $34=HEAP32[(($33)>>2)];
 $left=$34;
 var $35=($34|0)!=0;
 if($35){label=7;break;}else{label=8;break;}
 case 7: 
 var $37=$left;
 $2=$37;
 label=6;break;
 case 8: 
 var $39=$2;
 var $40=(($39)|0);
 var $41=(($40+4)|0);
 var $42=HEAP32[(($41)>>2)];
 $child=$42;
 var $43=$2;
 var $44=(($43)|0);
 var $45=(($44+8)|0);
 var $46=HEAP32[(($45)>>2)];
 $parent=$46;
 var $47=$2;
 var $48=(($47)|0);
 var $49=(($48+12)|0);
 var $50=HEAP32[(($49)>>2)];
 $color=$50;
 var $51=$child;
 var $52=($51|0)!=0;
 if($52){label=9;break;}else{label=10;break;}
 case 9: 
 var $54=$parent;
 var $55=$child;
 var $56=(($55)|0);
 var $57=(($56+8)|0);
 HEAP32[(($57)>>2)]=$54;
 label=10;break;
 case 10: 
 var $59=$parent;
 var $60=($59|0)!=0;
 if($60){label=11;break;}else{label=17;break;}
 case 11: 
 var $62=$parent;
 var $63=(($62)|0);
 var $64=(($63)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=$2;
 var $67=($65|0)==($66|0);
 if($67){label=12;break;}else{label=13;break;}
 case 12: 
 var $69=$child;
 var $70=$parent;
 var $71=(($70)|0);
 var $72=(($71)|0);
 HEAP32[(($72)>>2)]=$69;
 label=14;break;
 case 13: 
 var $74=$child;
 var $75=$parent;
 var $76=(($75)|0);
 var $77=(($76+4)|0);
 HEAP32[(($77)>>2)]=$74;
 label=14;break;
 case 14: 
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 label=18;break;
 case 17: 
 var $82=$child;
 var $83=$1;
 var $84=(($83)|0);
 HEAP32[(($84)>>2)]=$82;
 label=18;break;
 case 18: 
 var $86=$2;
 var $87=(($86)|0);
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=$old;
 var $91=($89|0)==($90|0);
 if($91){label=19;break;}else{label=20;break;}
 case 19: 
 var $93=$2;
 $parent=$93;
 label=20;break;
 case 20: 
 var $95=$2;
 var $96=(($95)|0);
 var $97=$old;
 var $98=(($97)|0);
 var $99=$96;
 var $100=$98;
 assert(16 % 1 === 0);HEAP32[(($99)>>2)]=HEAP32[(($100)>>2)];HEAP32[((($99)+(4))>>2)]=HEAP32[((($100)+(4))>>2)];HEAP32[((($99)+(8))>>2)]=HEAP32[((($100)+(8))>>2)];HEAP32[((($99)+(12))>>2)]=HEAP32[((($100)+(12))>>2)];
 var $101=$old;
 var $102=(($101)|0);
 var $103=(($102+8)|0);
 var $104=HEAP32[(($103)>>2)];
 var $105=($104|0)!=0;
 if($105){label=21;break;}else{label=27;break;}
 case 21: 
 var $107=$old;
 var $108=(($107)|0);
 var $109=(($108+8)|0);
 var $110=HEAP32[(($109)>>2)];
 var $111=(($110)|0);
 var $112=(($111)|0);
 var $113=HEAP32[(($112)>>2)];
 var $114=$old;
 var $115=($113|0)==($114|0);
 if($115){label=22;break;}else{label=23;break;}
 case 22: 
 var $117=$2;
 var $118=$old;
 var $119=(($118)|0);
 var $120=(($119+8)|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=(($121)|0);
 var $123=(($122)|0);
 HEAP32[(($123)>>2)]=$117;
 label=24;break;
 case 23: 
 var $125=$2;
 var $126=$old;
 var $127=(($126)|0);
 var $128=(($127+8)|0);
 var $129=HEAP32[(($128)>>2)];
 var $130=(($129)|0);
 var $131=(($130+4)|0);
 HEAP32[(($131)>>2)]=$125;
 label=24;break;
 case 24: 
 label=25;break;
 case 25: 
 label=26;break;
 case 26: 
 label=28;break;
 case 27: 
 var $136=$2;
 var $137=$1;
 var $138=(($137)|0);
 HEAP32[(($138)>>2)]=$136;
 label=28;break;
 case 28: 
 var $140=$2;
 var $141=$old;
 var $142=(($141)|0);
 var $143=(($142)|0);
 var $144=HEAP32[(($143)>>2)];
 var $145=(($144)|0);
 var $146=(($145+8)|0);
 HEAP32[(($146)>>2)]=$140;
 var $147=$old;
 var $148=(($147)|0);
 var $149=(($148+4)|0);
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)!=0;
 if($151){label=29;break;}else{label=30;break;}
 case 29: 
 var $153=$2;
 var $154=$old;
 var $155=(($154)|0);
 var $156=(($155+4)|0);
 var $157=HEAP32[(($156)>>2)];
 var $158=(($157)|0);
 var $159=(($158+8)|0);
 HEAP32[(($159)>>2)]=$153;
 label=30;break;
 case 30: 
 var $161=$parent;
 var $162=($161|0)!=0;
 if($162){label=31;break;}else{label=37;break;}
 case 31: 
 var $164=$parent;
 $left=$164;
 label=32;break;
 case 32: 
 label=33;break;
 case 33: 
 label=34;break;
 case 34: 
 label=35;break;
 case 35: 
 var $169=$left;
 var $170=(($169)|0);
 var $171=(($170+8)|0);
 var $172=HEAP32[(($171)>>2)];
 $left=$172;
 var $173=($172|0)!=0;
 if($173){label=32;break;}else{label=36;break;}
 case 36: 
 label=37;break;
 case 37: 
 label=50;break;
 case 38: 
 label=39;break;
 case 39: 
 var $178=$2;
 var $179=(($178)|0);
 var $180=(($179+8)|0);
 var $181=HEAP32[(($180)>>2)];
 $parent=$181;
 var $182=$2;
 var $183=(($182)|0);
 var $184=(($183+12)|0);
 var $185=HEAP32[(($184)>>2)];
 $color=$185;
 var $186=$child;
 var $187=($186|0)!=0;
 if($187){label=40;break;}else{label=41;break;}
 case 40: 
 var $189=$parent;
 var $190=$child;
 var $191=(($190)|0);
 var $192=(($191+8)|0);
 HEAP32[(($192)>>2)]=$189;
 label=41;break;
 case 41: 
 var $194=$parent;
 var $195=($194|0)!=0;
 if($195){label=42;break;}else{label=48;break;}
 case 42: 
 var $197=$parent;
 var $198=(($197)|0);
 var $199=(($198)|0);
 var $200=HEAP32[(($199)>>2)];
 var $201=$2;
 var $202=($200|0)==($201|0);
 if($202){label=43;break;}else{label=44;break;}
 case 43: 
 var $204=$child;
 var $205=$parent;
 var $206=(($205)|0);
 var $207=(($206)|0);
 HEAP32[(($207)>>2)]=$204;
 label=45;break;
 case 44: 
 var $209=$child;
 var $210=$parent;
 var $211=(($210)|0);
 var $212=(($211+4)|0);
 HEAP32[(($212)>>2)]=$209;
 label=45;break;
 case 45: 
 label=46;break;
 case 46: 
 label=47;break;
 case 47: 
 label=49;break;
 case 48: 
 var $217=$child;
 var $218=$1;
 var $219=(($218)|0);
 HEAP32[(($219)>>2)]=$217;
 label=49;break;
 case 49: 
 label=50;break;
 case 50: 
 var $222=$color;
 var $223=($222|0)==0;
 if($223){label=51;break;}else{label=52;break;}
 case 51: 
 var $225=$1;
 var $226=$parent;
 var $227=$child;
 _Code_RB_REMOVE_COLOR($225,$226,$227);
 label=52;break;
 case 52: 
 var $229=$old;
 STACKTOP=sp;return $229;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_INSERT($head,$elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $tmp;
 var $parent;
 var $comp;
 $2=$head;
 $3=$elm;
 $parent=0;
 $comp=0;
 var $4=$2;
 var $5=(($4)|0);
 var $6=HEAP32[(($5)>>2)];
 $tmp=$6;
 label=2;break;
 case 2: 
 var $8=$tmp;
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{label=10;break;}
 case 3: 
 var $11=$tmp;
 $parent=$11;
 var $12=$3;
 var $13=$parent;
 var $14=_slots_order($12,$13);
 $comp=$14;
 var $15=$comp;
 var $16=($15|0)<0;
 if($16){label=4;break;}else{label=5;break;}
 case 4: 
 var $18=$tmp;
 var $19=(($18)|0);
 var $20=(($19)|0);
 var $21=HEAP32[(($20)>>2)];
 $tmp=$21;
 label=9;break;
 case 5: 
 var $23=$comp;
 var $24=($23|0)>0;
 if($24){label=6;break;}else{label=7;break;}
 case 6: 
 var $26=$tmp;
 var $27=(($26)|0);
 var $28=(($27+4)|0);
 var $29=HEAP32[(($28)>>2)];
 $tmp=$29;
 label=8;break;
 case 7: 
 var $31=$tmp;
 $1=$31;
 label=21;break;
 case 8: 
 label=9;break;
 case 9: 
 label=2;break;
 case 10: 
 label=11;break;
 case 11: 
 var $36=$parent;
 var $37=$3;
 var $38=(($37)|0);
 var $39=(($38+8)|0);
 HEAP32[(($39)>>2)]=$36;
 var $40=$3;
 var $41=(($40)|0);
 var $42=(($41+4)|0);
 HEAP32[(($42)>>2)]=0;
 var $43=$3;
 var $44=(($43)|0);
 var $45=(($44)|0);
 HEAP32[(($45)>>2)]=0;
 var $46=$3;
 var $47=(($46)|0);
 var $48=(($47+12)|0);
 HEAP32[(($48)>>2)]=1;
 label=12;break;
 case 12: 
 var $50=$parent;
 var $51=($50|0)!=0;
 if($51){label=13;break;}else{label=19;break;}
 case 13: 
 var $53=$comp;
 var $54=($53|0)<0;
 if($54){label=14;break;}else{label=15;break;}
 case 14: 
 var $56=$3;
 var $57=$parent;
 var $58=(($57)|0);
 var $59=(($58)|0);
 HEAP32[(($59)>>2)]=$56;
 label=16;break;
 case 15: 
 var $61=$3;
 var $62=$parent;
 var $63=(($62)|0);
 var $64=(($63+4)|0);
 HEAP32[(($64)>>2)]=$61;
 label=16;break;
 case 16: 
 label=17;break;
 case 17: 
 label=18;break;
 case 18: 
 label=20;break;
 case 19: 
 var $69=$3;
 var $70=$2;
 var $71=(($70)|0);
 HEAP32[(($71)>>2)]=$69;
 label=20;break;
 case 20: 
 var $73=$2;
 var $74=$3;
 _Code_RB_INSERT_COLOR($73,$74);
 $1=0;
 label=21;break;
 case 21: 
 var $76=$1;
 STACKTOP=sp;return $76;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_FIND($head,$elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $tmp;
 var $comp;
 $2=$head;
 $3=$elm;
 var $4=$2;
 var $5=(($4)|0);
 var $6=HEAP32[(($5)>>2)];
 $tmp=$6;
 label=2;break;
 case 2: 
 var $8=$tmp;
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{label=10;break;}
 case 3: 
 var $11=$3;
 var $12=$tmp;
 var $13=_slots_order($11,$12);
 $comp=$13;
 var $14=$comp;
 var $15=($14|0)<0;
 if($15){label=4;break;}else{label=5;break;}
 case 4: 
 var $17=$tmp;
 var $18=(($17)|0);
 var $19=(($18)|0);
 var $20=HEAP32[(($19)>>2)];
 $tmp=$20;
 label=9;break;
 case 5: 
 var $22=$comp;
 var $23=($22|0)>0;
 if($23){label=6;break;}else{label=7;break;}
 case 6: 
 var $25=$tmp;
 var $26=(($25)|0);
 var $27=(($26+4)|0);
 var $28=HEAP32[(($27)>>2)];
 $tmp=$28;
 label=8;break;
 case 7: 
 var $30=$tmp;
 $1=$30;
 label=11;break;
 case 8: 
 label=9;break;
 case 9: 
 label=2;break;
 case 10: 
 $1=0;
 label=11;break;
 case 11: 
 var $35=$1;
 STACKTOP=sp;return $35;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_NEXT($elm){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$elm;
 var $2=$1;
 var $3=(($2)|0);
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=6;break;}
 case 2: 
 var $8=$1;
 var $9=(($8)|0);
 var $10=(($9+4)|0);
 var $11=HEAP32[(($10)>>2)];
 $1=$11;
 label=3;break;
 case 3: 
 var $13=$1;
 var $14=(($13)|0);
 var $15=(($14)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=($16|0)!=0;
 if($17){label=4;break;}else{label=5;break;}
 case 4: 
 var $19=$1;
 var $20=(($19)|0);
 var $21=(($20)|0);
 var $22=HEAP32[(($21)>>2)];
 $1=$22;
 label=3;break;
 case 5: 
 label=16;break;
 case 6: 
 var $25=$1;
 var $26=(($25)|0);
 var $27=(($26+8)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=($28|0)!=0;
 if($29){label=7;break;}else{label=9;break;}
 case 7: 
 var $31=$1;
 var $32=$1;
 var $33=(($32)|0);
 var $34=(($33+8)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=(($35)|0);
 var $37=(($36)|0);
 var $38=HEAP32[(($37)>>2)];
 var $39=($31|0)==($38|0);
 if($39){label=8;break;}else{label=9;break;}
 case 8: 
 var $41=$1;
 var $42=(($41)|0);
 var $43=(($42+8)|0);
 var $44=HEAP32[(($43)>>2)];
 $1=$44;
 label=15;break;
 case 9: 
 label=10;break;
 case 10: 
 var $47=$1;
 var $48=(($47)|0);
 var $49=(($48+8)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)!=0;
 if($51){label=11;break;}else{var $63=0;label=12;break;}
 case 11: 
 var $53=$1;
 var $54=$1;
 var $55=(($54)|0);
 var $56=(($55+8)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=(($57)|0);
 var $59=(($58+4)|0);
 var $60=HEAP32[(($59)>>2)];
 var $61=($53|0)==($60|0);
 var $63=$61;label=12;break;
 case 12: 
 var $63;
 if($63){label=13;break;}else{label=14;break;}
 case 13: 
 var $65=$1;
 var $66=(($65)|0);
 var $67=(($66+8)|0);
 var $68=HEAP32[(($67)>>2)];
 $1=$68;
 label=10;break;
 case 14: 
 var $70=$1;
 var $71=(($70)|0);
 var $72=(($71+8)|0);
 var $73=HEAP32[(($72)>>2)];
 $1=$73;
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 var $76=$1;
 STACKTOP=sp;return $76;
  default: assert(0, "bad label: " + label);
 }

}


function _Code_RB_MINMAX($head,$val){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $tmp;
 var $parent;
 $1=$head;
 $2=$val;
 var $3=$1;
 var $4=(($3)|0);
 var $5=HEAP32[(($4)>>2)];
 $tmp=$5;
 $parent=0;
 label=2;break;
 case 2: 
 var $7=$tmp;
 var $8=($7|0)!=0;
 if($8){label=3;break;}else{label=7;break;}
 case 3: 
 var $10=$tmp;
 $parent=$10;
 var $11=$2;
 var $12=($11|0)<0;
 if($12){label=4;break;}else{label=5;break;}
 case 4: 
 var $14=$tmp;
 var $15=(($14)|0);
 var $16=(($15)|0);
 var $17=HEAP32[(($16)>>2)];
 $tmp=$17;
 label=6;break;
 case 5: 
 var $19=$tmp;
 var $20=(($19)|0);
 var $21=(($20+4)|0);
 var $22=HEAP32[(($21)>>2)];
 $tmp=$22;
 label=6;break;
 case 6: 
 label=2;break;
 case 7: 
 var $25=$parent;
 STACKTOP=sp;return $25;
  default: assert(0, "bad label: " + label);
 }

}


function _turn($dir,$clockwise){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$dir;
 $2=$clockwise;
 var $3=$1;
 var $4=($3|0)==1;
 if($4){label=2;break;}else{label=3;break;}
 case 2: 
 var $6=$2;
 var $7=(($6<<24)>>24);
 var $8=($7|0)!=0;
 var $9=($8?0:3);
 $1=$9;
 label=13;break;
 case 3: 
 var $11=$1;
 var $12=($11|0)==2;
 if($12){label=4;break;}else{label=5;break;}
 case 4: 
 var $14=$2;
 var $15=(($14<<24)>>24);
 var $16=($15|0)!=0;
 var $17=($16?3:0);
 $1=$17;
 label=12;break;
 case 5: 
 var $19=$1;
 var $20=($19|0)==0;
 if($20){label=6;break;}else{label=7;break;}
 case 6: 
 var $22=$2;
 var $23=(($22<<24)>>24);
 var $24=($23|0)!=0;
 var $25=($24?2:1);
 $1=$25;
 label=11;break;
 case 7: 
 var $27=$1;
 var $28=($27|0)==3;
 if($28){label=8;break;}else{label=9;break;}
 case 8: 
 var $30=$2;
 var $31=(($30<<24)>>24);
 var $32=($31|0)!=0;
 var $33=($32?1:2);
 $1=$33;
 label=10;break;
 case 9: 
 _emscripten_run_script(2032);
 label=10;break;
 case 10: 
 label=11;break;
 case 11: 
 label=12;break;
 case 12: 
 label=13;break;
 case 13: 
 var $39=$1;
 STACKTOP=sp;return $39;
  default: assert(0, "bad label: " + label);
 }

}


function _add_dot($slot,$dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 $1=$slot;
 var $2=$1;
 var $3=(($2+27)|0);
 var $4=HEAP8[($3)];
 var $5=($4&255);
 var $6=($5|0)<8;
 if($6){label=2;break;}else{label=3;break;}
 case 2: 
 label=4;break;
 case 3: 
 _emscripten_run_script(1952);
 label=4;break;
 case 4: 
 var $10=$1;
 var $11=(($10+27)|0);
 var $12=HEAP8[($11)];
 var $13=($12&255);
 var $14=$1;
 var $15=(($14+28)|0);
 var $16=(($15+$13)|0);
 var $17=$16;
 var $18=$dot;
 assert(1 % 1 === 0);HEAP8[($17)]=HEAP8[($18)];
 var $19=$1;
 var $20=(($19+27)|0);
 var $21=HEAP8[($20)];
 var $22=((($21)+(1))&255);
 HEAP8[($20)]=$22;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _remove_dot($slot,$i){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 $1=$slot;
 $2=$i;
 var $3=$2;
 var $4=($3|0)>=0;
 if($4){label=2;break;}else{label=4;break;}
 case 2: 
 var $6=$2;
 var $7=$1;
 var $8=(($7+27)|0);
 var $9=HEAP8[($8)];
 var $10=($9&255);
 var $11=($6|0)<($10|0);
 if($11){label=3;break;}else{label=4;break;}
 case 3: 
 label=5;break;
 case 4: 
 _emscripten_run_script(1224);
 label=5;break;
 case 5: 
 var $15=$1;
 var $16=(($15+27)|0);
 var $17=HEAP8[($16)];
 var $18=((($17)-(1))&255);
 HEAP8[($16)]=$18;
 var $19=$1;
 var $20=(($19+27)|0);
 var $21=HEAP8[($20)];
 var $22=($21&255);
 var $23=($22|0)==0;
 if($23){label=6;break;}else{label=7;break;}
 case 6: 
 label=8;break;
 case 7: 
 var $26=$2;
 var $27=$1;
 var $28=(($27+28)|0);
 var $29=(($28+$26)|0);
 var $30=$29;
 var $31=$2;
 var $32=((($31)+(1))|0);
 var $33=$1;
 var $34=(($33+28)|0);
 var $35=(($34+$32)|0);
 var $36=$35;
 var $37=$1;
 var $38=(($37+27)|0);
 var $39=HEAP8[($38)];
 var $40=($39&255);
 var $41=$2;
 var $42=((($40)-($41))|0);
 var $43=$42;
 _memmove($30,$36,$43,1,0);
 label=8;break;
 case 8: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _create_slot($x,$y,$ch){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+168)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $slot;
 var $5=sp;
 var $dot=(sp)+(40);
 var $6=(sp)+(48);
 var $7=(sp)+(88);
 var $8=(sp)+(128);
 $2=$x;
 $3=$y;
 $4=$ch;
 var $9=$4;
 var $10=(($9<<24)>>24);
 switch(($10|0)){case 46:case 44:{ label=2;break;}case 124:{ label=3;break;}case 58:{ label=4;break;}case 35:case 61:case 43:case 95:case 36:case 94:case 118:{ label=5;break;}default:{label=6;break;}}break;
 case 2: 
 var $12=_malloc(40);
 HEAP32[((3760)>>2)]=$12;
 var $13=HEAP32[((3760)>>2)];
 var $14=$13;
 var $15=$5;
 _memset($15, 0, 40)|0;
 var $16=(($5+16)|0);
 var $17=$2;
 HEAP32[(($16)>>2)]=$17;
 var $18=(($5+20)|0);
 var $19=$3;
 HEAP32[(($18)>>2)]=$19;
 var $20=$14;
 var $21=$5;
 assert(40 % 1 === 0);(_memcpy($20, $21, 40)|0);
 var $22=HEAP32[((3760)>>2)];
 var $23=$22;
 $slot=$23;
 var $24=$4;
 var $25=(($24<<24)>>24);
 var $26=($25|0)==46;
 var $27=($26&1);
 var $28=(($27)&255);
 var $29=$28&1;
 var $30=$dot;
 var $31=$29&1;
 var $32=HEAP8[($30)];
 var $33=$32&-2;
 var $34=$33|$31;
 HEAP8[($30)]=$34;
 var $35=$dot;
 var $36=HEAP8[($35)];
 var $37=$36&-7;
 var $38=$37|2;
 HEAP8[($35)]=$38;
 var $39=$dot;
 var $40=HEAP8[($39)];
 var $41=$40&-9;
 HEAP8[($39)]=$41;
 var $42=$dot;
 var $43=HEAP8[($42)];
 var $44=$43&-17;
 HEAP8[($42)]=$44;
 var $45=$dot;
 var $46=HEAP8[($45)];
 var $47=$46&-33;
 HEAP8[($45)]=$47;
 var $48=$dot;
 var $49=HEAP8[($48)];
 var $50=$49&-65;
 HEAP8[($48)]=$50;
 var $51=$slot;
 _add_dot($51,$dot);
 var $52=$slot;
 $1=$52;
 label=7;break;
 case 3: 
 var $54=_malloc(40);
 HEAP32[((3760)>>2)]=$54;
 var $55=HEAP32[((3760)>>2)];
 var $56=$55;
 var $57=$6;
 _memset($57, 0, 40)|0;
 var $58=(($6+16)|0);
 var $59=$2;
 HEAP32[(($58)>>2)]=$59;
 var $60=(($6+20)|0);
 var $61=$3;
 HEAP32[(($60)>>2)]=$61;
 var $62=(($6+24)|0);
 var $63=(($62)|0);
 HEAP8[($63)]=124;
 var $64=(($62+1)|0);
 var $65=$64;
 var $66=(($65)|0);
 HEAP8[($66)]=35;
 var $67=$56;
 var $68=$6;
 assert(40 % 1 === 0);(_memcpy($67, $68, 40)|0);
 var $69=HEAP32[((3760)>>2)];
 var $70=$69;
 $1=$70;
 label=7;break;
 case 4: 
 var $72=_malloc(40);
 HEAP32[((3760)>>2)]=$72;
 var $73=HEAP32[((3760)>>2)];
 var $74=$73;
 var $75=(($7)|0);
 var $76=$75;
 HEAP32[(($76)>>2)]=0; HEAP32[((($76)+(4))>>2)]=0; HEAP32[((($76)+(8))>>2)]=0; HEAP32[((($76)+(12))>>2)]=0;
 var $77=(($7+16)|0);
 var $78=$2;
 HEAP32[(($77)>>2)]=$78;
 var $79=(($7+20)|0);
 var $80=$3;
 HEAP32[(($79)>>2)]=$80;
 var $81=(($7+24)|0);
 var $82=(($81)|0);
 HEAP8[($82)]=58;
 var $83=(($81+1)|0);
 var $84=$83;
 var $85=(($84)|0);
 HEAP8[($85)]=1;
 var $86=(($84+1)|0);
 HEAP8[($86)]=1;
 var $87=(($7+27)|0);
 HEAP8[($87)]=0;
 var $88=(($7+28)|0);
 var $89=$88;
 _memset($89, 0, 8)|0;
 var $90=(($7+36)|0);
 HEAP8[($90)]=0;
 var $91=$74;
 var $92=$7;
 assert(40 % 1 === 0);(_memcpy($91, $92, 40)|0);
 var $93=HEAP32[((3760)>>2)];
 var $94=$93;
 $1=$94;
 label=7;break;
 case 5: 
 var $96=_malloc(40);
 HEAP32[((3760)>>2)]=$96;
 var $97=HEAP32[((3760)>>2)];
 var $98=$97;
 var $99=$8;
 _memset($99, 0, 40)|0;
 var $100=(($8+16)|0);
 var $101=$2;
 HEAP32[(($100)>>2)]=$101;
 var $102=(($8+20)|0);
 var $103=$3;
 HEAP32[(($102)>>2)]=$103;
 var $104=(($8+24)|0);
 var $105=(($104)|0);
 var $106=$4;
 HEAP8[($105)]=$106;
 var $107=$98;
 var $108=$8;
 assert(40 % 1 === 0);(_memcpy($107, $108, 40)|0);
 var $109=HEAP32[((3760)>>2)];
 var $110=$109;
 $1=$110;
 label=7;break;
 case 6: 
 $1=0;
 label=7;break;
 case 7: 
 var $113=$1;
 STACKTOP=sp;return $113;
  default: assert(0, "bad label: " + label);
 }

}


function _readcode($str){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $lines=sp;
 var $y;
 var $line;
 var $len;
 var $x;
 var $slot;
 var $2=(sp)+(8);
 var $i;
 $1=$str;
 var $3=$1;
 _split($lines,$3,10);
 HEAP32[((2112)>>2)]=0;
 var $4=(($lines)|0);
 var $5=HEAP32[(($4)>>2)];
 HEAP32[((2192)>>2)]=$5;
 $y=0;
 label=2;break;
 case 2: 
 var $7=$y;
 var $8=HEAP32[((2192)>>2)];
 var $9=($7|0)<($8|0);
 if($9){label=3;break;}else{label=19;break;}
 case 3: 
 var $11=$y;
 var $12=(($lines+4)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($13+($11<<2))|0);
 var $15=HEAP32[(($14)>>2)];
 $line=$15;
 var $16=$line;
 var $17=_strlen($16);
 $len=$17;
 var $18=$len;
 var $19=($18|0)>0;
 if($19){label=4;break;}else{label=7;break;}
 case 4: 
 var $21=$len;
 var $22=((($21)-(1))|0);
 var $23=$line;
 var $24=(($23+$22)|0);
 var $25=HEAP8[($24)];
 var $26=(($25<<24)>>24);
 var $27=($26|0)==13;
 if($27){label=5;break;}else{label=7;break;}
 case 5: 
 var $29=$y;
 var $30=HEAP32[((2192)>>2)];
 var $31=((($30)-(1))|0);
 var $32=($29|0)!=($31|0);
 if($32){label=6;break;}else{label=7;break;}
 case 6: 
 var $34=$len;
 var $35=$line;
 var $36=(($35+$34)|0);
 HEAP8[($36)]=0;
 var $37=$len;
 var $38=((($37)-(1))|0);
 $len=$38;
 label=7;break;
 case 7: 
 var $40=HEAP32[((2112)>>2)];
 var $41=$len;
 var $42=($40|0)<($41|0);
 if($42){label=8;break;}else{label=9;break;}
 case 8: 
 var $44=$len;
 HEAP32[((2112)>>2)]=$44;
 label=9;break;
 case 9: 
 $x=0;
 label=10;break;
 case 10: 
 var $47=$x;
 var $48=$len;
 var $49=($47|0)<($48|0);
 if($49){label=11;break;}else{label=17;break;}
 case 11: 
 var $51=$x;
 var $52=$y;
 var $53=$x;
 var $54=$line;
 var $55=(($54+$53)|0);
 var $56=HEAP8[($55)];
 var $57=_create_slot($51,$52,$56);
 $slot=$57;
 var $58=$slot;
 var $59=($58|0)!=0;
 if($59){label=13;break;}else{label=12;break;}
 case 12: 
 label=16;break;
 case 13: 
 var $62=$slot;
 var $63=_Code_RB_INSERT(3272,$62);
 var $64=$slot;
 var $65=(($64+24)|0);
 var $66=(($65)|0);
 var $67=HEAP8[($66)];
 var $68=(($67<<24)>>24);
 var $69=($68|0)==95;
 if($69){label=14;break;}else{label=15;break;}
 case 14: 
 var $71=HEAP32[((2164)>>2)];
 var $72=$71;
 var $73=HEAP32[((2160)>>2)];
 var $74=((($73)+(1))|0);
 HEAP32[((2160)>>2)]=$74;
 var $75=($74<<3);
 var $76=_realloc($72,$75);
 var $77=$76;
 HEAP32[((2164)>>2)]=$77;
 var $78=HEAP32[((2160)>>2)];
 var $79=((($78)-(1))|0);
 var $80=HEAP32[((2164)>>2)];
 var $81=(($80+($79<<3))|0);
 var $82=(($2)|0);
 var $83=$x;
 HEAP32[(($82)>>2)]=$83;
 var $84=(($2+4)|0);
 var $85=$y;
 HEAP32[(($84)>>2)]=$85;
 var $86=$81;
 var $87=$2;
 assert(8 % 1 === 0);HEAP32[(($86)>>2)]=HEAP32[(($87)>>2)];HEAP32[((($86)+(4))>>2)]=HEAP32[((($87)+(4))>>2)];
 var $88=HEAP32[((2160)>>2)];
 var $89=((($88)-(1))|0);
 var $90=HEAP32[((2164)>>2)];
 var $91=(($90+($89<<3))|0);
 label=15;break;
 case 15: 
 label=16;break;
 case 16: 
 var $94=$x;
 var $95=((($94)+(1))|0);
 $x=$95;
 label=10;break;
 case 17: 
 label=18;break;
 case 18: 
 var $98=$y;
 var $99=((($98)+(1))|0);
 $y=$99;
 label=2;break;
 case 19: 
 label=20;break;
 case 20: 
 $i=0;
 label=21;break;
 case 21: 
 var $103=$i;
 var $104=(($lines)|0);
 var $105=HEAP32[(($104)>>2)];
 var $106=($103|0)<($105|0);
 if($106){label=22;break;}else{label=24;break;}
 case 22: 
 var $108=$i;
 var $109=(($lines+4)|0);
 var $110=HEAP32[(($109)>>2)];
 var $111=(($110+($108<<2))|0);
 var $112=HEAP32[(($111)>>2)];
 _free($112);
 label=23;break;
 case 23: 
 var $114=$i;
 var $115=((($114)+(1))|0);
 $i=$115;
 label=21;break;
 case 24: 
 var $117=(($lines+4)|0);
 var $118=HEAP32[(($117)>>2)];
 var $119=$118;
 _free($119);
 var $120=(($lines+4)|0);
 HEAP32[(($120)>>2)]=0;
 var $121=(($lines)|0);
 HEAP32[(($121)>>2)]=0;
 label=25;break;
 case 25: 
 HEAP32[((2120)>>2)]=1;
 STACKTOP=sp;return 1;
  default: assert(0, "bad label: " + label);
 }

}


function _split($agg_result,$input,$sep){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ret=sp;
 var $str;
 var $end;
 $1=$input;
 $2=$sep;
 var $3=$ret;
 HEAP32[(($3)>>2)]=0; HEAP32[((($3)+(4))>>2)]=0;
 var $4=$1;
 var $5=_strdup($4);
 $1=$5;
 var $6=$1;
 $str=$6;
 label=2;break;
 case 2: 
 var $8=$str;
 var $9=$2;
 var $10=(($9<<24)>>24);
 var $11=_strchr($8,$10);
 $end=$11;
 var $12=($11|0)!=0;
 if($12){label=3;break;}else{label=4;break;}
 case 3: 
 var $14=$end;
 HEAP8[($14)]=0;
 var $15=(($ret+4)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$16;
 var $18=(($ret)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=((($19)+(1))|0);
 HEAP32[(($18)>>2)]=$20;
 var $21=($20<<2);
 var $22=_realloc($17,$21);
 var $23=$22;
 var $24=(($ret+4)|0);
 HEAP32[(($24)>>2)]=$23;
 var $25=$str;
 var $26=_strdup($25);
 var $27=(($ret)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=((($28)-(1))|0);
 var $30=(($ret+4)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=(($31+($29<<2))|0);
 HEAP32[(($32)>>2)]=$26;
 var $33=(($ret)|0);
 var $34=HEAP32[(($33)>>2)];
 var $35=((($34)-(1))|0);
 var $36=(($ret+4)|0);
 var $37=HEAP32[(($36)>>2)];
 var $38=(($37+($35<<2))|0);
 var $39=$end;
 var $40=(($39+1)|0);
 $str=$40;
 label=2;break;
 case 4: 
 var $42=(($ret+4)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=$43;
 var $45=(($ret)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=((($46)+(1))|0);
 HEAP32[(($45)>>2)]=$47;
 var $48=($47<<2);
 var $49=_realloc($44,$48);
 var $50=$49;
 var $51=(($ret+4)|0);
 HEAP32[(($51)>>2)]=$50;
 var $52=$str;
 var $53=_strdup($52);
 var $54=(($ret)|0);
 var $55=HEAP32[(($54)>>2)];
 var $56=((($55)-(1))|0);
 var $57=(($ret+4)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=(($58+($56<<2))|0);
 HEAP32[(($59)>>2)]=$53;
 var $60=(($ret)|0);
 var $61=HEAP32[(($60)>>2)];
 var $62=((($61)-(1))|0);
 var $63=(($ret+4)|0);
 var $64=HEAP32[(($63)>>2)];
 var $65=(($64+($62<<2))|0);
 var $66=$1;
 _free($66);
 var $67=$agg_result;
 var $68=$ret;
 assert(8 % 1 === 0);HEAP32[(($67)>>2)]=HEAP32[(($68)>>2)];HEAP32[((($67)+(4))>>2)]=HEAP32[((($68)+(4))>>2)];
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _loadcode($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$str;
 HEAP32[((2224)>>2)]=0;
 HEAP32[((2192)>>2)]=0;
 HEAP32[((2112)>>2)]=0;
 _delete_code();
 HEAP8[(2240)]=0;
 HEAP32[((16)>>2)]=-1;
 HEAP32[((8)>>2)]=-1;
 var $2=HEAP32[((2164)>>2)];
 var $3=$2;
 _free($3);
 HEAP32[((2164)>>2)]=0;
 HEAP32[((2160)>>2)]=0;
 HEAP32[((3264)>>2)]=0;
 _clear_input_buffer();
 HEAP8[(2168)]=0;
 _clear_fifo();
 var $4=$1;
 var $5=_readcode($4);
 STACKTOP=sp;return $5;
}
Module["_loadcode"] = _loadcode;

function _getframe(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $y;
 var $slot;
 var $x;
 var $y1;
 var $1=HEAP32[((2208)>>2)];
 var $2=HEAP32[((2112)>>2)];
 var $3=((($2)+(1))|0);
 var $4=HEAP32[((2192)>>2)];
 var $5=(Math_imul($3,$4)|0);
 var $6=_realloc($1,$5);
 HEAP32[((2208)>>2)]=$6;
 var $7=HEAP32[((2208)>>2)];
 var $8=HEAP32[((2112)>>2)];
 var $9=((($8)+(1))|0);
 var $10=HEAP32[((2192)>>2)];
 var $11=(Math_imul($9,$10)|0);
 _memset($7, 32, $11)|0;
 $y=0;
 label=2;break;
 case 2: 
 var $13=$y;
 var $14=HEAP32[((2192)>>2)];
 var $15=($13|0)<($14|0);
 if($15){label=3;break;}else{label=5;break;}
 case 3: 
 var $17=HEAP32[((2112)>>2)];
 var $18=$y;
 var $19=HEAP32[((2112)>>2)];
 var $20=((($19)+(1))|0);
 var $21=(Math_imul($18,$20)|0);
 var $22=((($17)+($21))|0);
 var $23=HEAP32[((2208)>>2)];
 var $24=(($23+$22)|0);
 HEAP8[($24)]=10;
 label=4;break;
 case 4: 
 var $26=$y;
 var $27=((($26)+(1))|0);
 $y=$27;
 label=2;break;
 case 5: 
 var $29=HEAP32[((2112)>>2)];
 var $30=((($29)+(1))|0);
 var $31=HEAP32[((2192)>>2)];
 var $32=(Math_imul($30,$31)|0);
 var $33=((($32)-(1))|0);
 var $34=HEAP32[((2208)>>2)];
 var $35=(($34+$33)|0);
 HEAP8[($35)]=0;
 var $36=_Code_RB_MINMAX(3272,-1);
 $slot=$36;
 label=6;break;
 case 6: 
 var $38=$slot;
 var $39=($38|0)!=0;
 if($39){label=7;break;}else{label=15;break;}
 case 7: 
 var $41=$slot;
 var $42=(($41+16)|0);
 var $43=HEAP32[(($42)>>2)];
 $x=$43;
 var $44=$slot;
 var $45=(($44+20)|0);
 var $46=HEAP32[(($45)>>2)];
 $y1=$46;
 var $47=$slot;
 var $48=(($47+24)|0);
 var $49=(($48)|0);
 var $50=HEAP8[($49)];
 var $51=(($50<<24)>>24);
 var $52=($51|0)==0;
 if($52){label=8;break;}else{label=12;break;}
 case 8: 
 var $54=$slot;
 var $55=(($54+27)|0);
 var $56=HEAP8[($55)];
 var $57=($56&255);
 var $58=($57|0)==0;
 if($58){label=9;break;}else{label=10;break;}
 case 9: 
 var $71=32;label=11;break;
 case 10: 
 var $61=$slot;
 var $62=(($61+28)|0);
 var $63=(($62)|0);
 var $64=$63;
 var $65=HEAP8[($64)];
 var $66=$65&1;
 var $67=($66&255);
 var $68=($67|0)!=0;
 var $69=($68?46:44);
 var $71=$69;label=11;break;
 case 11: 
 var $71;
 var $72=(($71)&255);
 var $73=$x;
 var $74=$y1;
 var $75=HEAP32[((2112)>>2)];
 var $76=((($75)+(1))|0);
 var $77=(Math_imul($74,$76)|0);
 var $78=((($73)+($77))|0);
 var $79=HEAP32[((2208)>>2)];
 var $80=(($79+$78)|0);
 HEAP8[($80)]=$72;
 label=13;break;
 case 12: 
 var $82=$slot;
 var $83=(($82+24)|0);
 var $84=(($83)|0);
 var $85=HEAP8[($84)];
 var $86=$x;
 var $87=$y1;
 var $88=HEAP32[((2112)>>2)];
 var $89=((($88)+(1))|0);
 var $90=(Math_imul($87,$89)|0);
 var $91=((($86)+($90))|0);
 var $92=HEAP32[((2208)>>2)];
 var $93=(($92+$91)|0);
 HEAP8[($93)]=$85;
 label=13;break;
 case 13: 
 label=14;break;
 case 14: 
 var $96=$slot;
 var $97=_Code_RB_NEXT($96);
 $slot=$97;
 label=6;break;
 case 15: 
 var $99=HEAP32[((2208)>>2)];
 STACKTOP=sp;return $99;
  default: assert(0, "bad label: " + label);
 }

}


function _get_state_str(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2=HEAP32[((2120)>>2)];
 if(($2|0)==0){ label=2;break;}else if(($2|0)==1){ label=3;break;}else if(($2|0)==2){ label=4;break;}else if(($2|0)==3){ label=5;break;}else{label=6;break;}
 case 2: 
 $1=72;
 label=7;break;
 case 3: 
 $1=64;
 label=7;break;
 case 4: 
 $1=48;
 label=7;break;
 case 5: 
 $1=40;
 label=7;break;
 case 6: 
 $1=24;
 label=7;break;
 case 7: 
 var $9=$1;
 STACKTOP=sp;return $9;
  default: assert(0, "bad label: " + label);
 }

}


function _dot_count(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $n;
 var $slot;
 $n=0;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=5;break;}
 case 3: 
 var $6=$slot;
 var $7=(($6+27)|0);
 var $8=HEAP8[($7)];
 var $9=($8&255);
 var $10=($9|0)!=0;
 var $11=($10&1);
 var $12=$n;
 var $13=((($12)+($11))|0);
 $n=$13;
 label=4;break;
 case 4: 
 var $15=$slot;
 var $16=_Code_RB_NEXT($15);
 $slot=$16;
 label=2;break;
 case 5: 
 var $18=$n;
 STACKTOP=sp;return $18;
  default: assert(0, "bad label: " + label);
 }

}


function _generator_count($all_generators,$active_generators){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $slot;
 $1=$all_generators;
 $2=$active_generators;
 var $3=$1;
 HEAP32[(($3)>>2)]=0;
 var $4=$2;
 HEAP32[(($4)>>2)]=0;
 var $5=_Code_RB_MINMAX(3272,-1);
 $slot=$5;
 label=2;break;
 case 2: 
 var $7=$slot;
 var $8=($7|0)!=0;
 if($8){label=3;break;}else{label=7;break;}
 case 3: 
 var $10=$slot;
 var $11=(($10+24)|0);
 var $12=(($11)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24);
 var $15=($14|0)==58;
 if($15){label=4;break;}else{label=5;break;}
 case 4: 
 var $17=$1;
 var $18=HEAP32[(($17)>>2)];
 var $19=((($18)+(1))|0);
 HEAP32[(($17)>>2)]=$19;
 var $20=$slot;
 var $21=(($20+24)|0);
 var $22=(($21+1)|0);
 var $23=$22;
 var $24=(($23)|0);
 var $25=HEAP8[($24)];
 var $26=(($25<<24)>>24);
 var $27=$2;
 var $28=HEAP32[(($27)>>2)];
 var $29=((($28)+($26))|0);
 HEAP32[(($27)>>2)]=$29;
 label=5;break;
 case 5: 
 label=6;break;
 case 6: 
 var $32=$slot;
 var $33=_Code_RB_NEXT($32);
 $slot=$33;
 label=2;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _getstate(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1040)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $_state;
 var $breakpoints;
 var $numbers=sp;
 var $all_generators=(sp)+(1024);
 var $active_generators=(sp)+(1032);
 var $strframe;
 var $strfifo;
 var $len;
 var $1=_get_state_str();
 $_state=$1;
 $breakpoints=3280;
 var $2=$numbers;
 _memset($2, 0, 1024)|0;
 _generator_count($all_generators,$active_generators);
 var $3=(($numbers)|0);
 var $4=HEAP32[((2112)>>2)];
 var $5=HEAP32[((2192)>>2)];
 var $6=_dot_count();
 var $7=HEAP32[(($all_generators)>>2)];
 var $8=HEAP32[(($active_generators)>>2)];
 var $9=HEAP32[((2160)>>2)];
 var $10=HEAP8[(2168)];
 var $11=(($10<<24)>>24);
 var $12=HEAP32[((2224)>>2)];
 var $13=_snprintf($3,1023,1928,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 64)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$4,HEAP32[(((tempVarArgs)+(8))>>2)]=$5,HEAP32[(((tempVarArgs)+(16))>>2)]=$6,HEAP32[(((tempVarArgs)+(24))>>2)]=$7,HEAP32[(((tempVarArgs)+(32))>>2)]=$8,HEAP32[(((tempVarArgs)+(40))>>2)]=$9,HEAP32[(((tempVarArgs)+(48))>>2)]=$11,HEAP32[(((tempVarArgs)+(56))>>2)]=$12,tempVarArgs)); STACKTOP=tempVarArgs;
 var $14=_getframe();
 $strframe=$14;
 var $15=_get_fifo_str();
 $strfifo=$15;
 var $16=$_state;
 var $17=_strlen($16);
 var $18=((($17)+(1))|0);
 var $19=_strlen(2240);
 var $20=((($18)+($19))|0);
 var $21=((($20)+(1))|0);
 var $22=$breakpoints;
 var $23=_strlen($22);
 var $24=((($21)+($23))|0);
 var $25=((($24)+(1))|0);
 var $26=(($numbers)|0);
 var $27=_strlen($26);
 var $28=((($25)+($27))|0);
 var $29=((($28)+(1))|0);
 var $30=$strframe;
 var $31=_strlen($30);
 var $32=((($29)+($31))|0);
 var $33=((($32)+(1))|0);
 var $34=$strfifo;
 var $35=_strlen($34);
 var $36=((($33)+($35))|0);
 $len=$36;
 var $37=HEAP32[((2200)>>2)];
 var $38=$len;
 var $39=((($38)+(100))|0);
 var $40=_realloc($37,$39);
 HEAP32[((2200)>>2)]=$40;
 var $41=HEAP32[((2200)>>2)];
 var $42=$len;
 var $43=((($42)+(100))|0);
 var $44=((($43)-(1))|0);
 var $45=$_state;
 var $46=HEAP32[((16)>>2)];
 var $47=HEAP32[((8)>>2)];
 var $48=$breakpoints;
 var $49=(($numbers)|0);
 var $50=$strframe;
 var $51=$strfifo;
 var $52=_snprintf($41,$44,1904,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 64)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$45,HEAP32[(((tempVarArgs)+(8))>>2)]=2240,HEAP32[(((tempVarArgs)+(16))>>2)]=$46,HEAP32[(((tempVarArgs)+(24))>>2)]=$47,HEAP32[(((tempVarArgs)+(32))>>2)]=$48,HEAP32[(((tempVarArgs)+(40))>>2)]=$49,HEAP32[(((tempVarArgs)+(48))>>2)]=$50,HEAP32[(((tempVarArgs)+(56))>>2)]=$51,tempVarArgs)); STACKTOP=tempVarArgs;
 var $53=HEAP32[((2200)>>2)];
 STACKTOP=sp;return $53;
}
Module["_getstate"] = _getstate;

function _get_slot($x,$y){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+80)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $dummy=sp;
 var $slot;
 var $3=(sp)+(40);
 $1=$x;
 $2=$y;
 var $4=$1;
 var $5=($4|0)>=0;
 if($5){label=2;break;}else{label=6;break;}
 case 2: 
 var $7=$1;
 var $8=HEAP32[((2112)>>2)];
 var $9=($7|0)<($8|0);
 if($9){label=3;break;}else{label=6;break;}
 case 3: 
 var $11=$2;
 var $12=($11|0)>=0;
 if($12){label=4;break;}else{label=6;break;}
 case 4: 
 var $14=$2;
 var $15=HEAP32[((2192)>>2)];
 var $16=($14|0)<($15|0);
 if($16){label=5;break;}else{label=6;break;}
 case 5: 
 label=7;break;
 case 6: 
 _emscripten_run_script(1824);
 label=7;break;
 case 7: 
 var $20=$dummy;
 _memset($20, 0, 40)|0;
 var $21=(($dummy+16)|0);
 var $22=$1;
 HEAP32[(($21)>>2)]=$22;
 var $23=(($dummy+20)|0);
 var $24=$2;
 HEAP32[(($23)>>2)]=$24;
 var $25=_Code_RB_FIND(3272,$dummy);
 $slot=$25;
 var $26=$slot;
 var $27=($26|0)!=0;
 if($27){label=9;break;}else{label=8;break;}
 case 8: 
 var $29=_malloc(40);
 HEAP32[((3760)>>2)]=$29;
 var $30=HEAP32[((3760)>>2)];
 var $31=$30;
 var $32=$3;
 _memset($32, 0, 40)|0;
 var $33=(($3+16)|0);
 var $34=$1;
 HEAP32[(($33)>>2)]=$34;
 var $35=(($3+20)|0);
 var $36=$2;
 HEAP32[(($35)>>2)]=$36;
 var $37=$31;
 var $38=$3;
 assert(40 % 1 === 0);(_memcpy($37, $38, 40)|0);
 var $39=HEAP32[((3760)>>2)];
 var $40=$39;
 $slot=$40;
 var $41=$slot;
 var $42=_Code_RB_INSERT(3272,$41);
 label=9;break;
 case 9: 
 var $44=$slot;
 STACKTOP=sp;return $44;
  default: assert(0, "bad label: " + label);
 }

}


function _enqueue($bit){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $ii;
 $1=$bit;
 label=2;break;
 case 2: 
 $ii=0;
 var $3=$ii;
 var $4=($3|0)>=0;
 if($4){label=3;break;}else{label=5;break;}
 case 3: 
 var $6=$ii;
 var $7=HEAP32[((2232)>>2)];
 var $8=($6|0)<=($7|0);
 if($8){label=4;break;}else{label=5;break;}
 case 4: 
 label=6;break;
 case 5: 
 _emscripten_run_script(1744);
 label=6;break;
 case 6: 
 var $12=HEAP32[((2236)>>2)];
 var $13=HEAP32[((2232)>>2)];
 var $14=((($13)+(1))|0);
 var $15=$14;
 var $16=_realloc($12,$15);
 HEAP32[((2236)>>2)]=$16;
 var $17=$ii;
 var $18=HEAP32[((2232)>>2)];
 var $19=($17|0)<($18|0);
 if($19){label=7;break;}else{label=8;break;}
 case 7: 
 var $21=$ii;
 var $22=((($21)+(1))|0);
 var $23=HEAP32[((2236)>>2)];
 var $24=(($23+$22)|0);
 var $25=$ii;
 var $26=HEAP32[((2236)>>2)];
 var $27=(($26+$25)|0);
 var $28=HEAP32[((2232)>>2)];
 var $29=$ii;
 var $30=((($28)-($29))|0);
 var $31=$30;
 _memmove($24,$27,$31,1,0);
 var $34=$24;label=9;break;
 case 8: 
 var $34=0;label=9;break;
 case 9: 
 var $34;
 var $35=HEAP32[((2232)>>2)];
 var $36=((($35)+(1))|0);
 HEAP32[((2232)>>2)]=$36;
 var $37=$1;
 var $38=$ii;
 var $39=HEAP32[((2236)>>2)];
 var $40=(($39+$38)|0);
 HEAP8[($40)]=$37;
 var $41=$ii;
 var $42=HEAP32[((2236)>>2)];
 var $43=(($42+$41)|0);
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _dequeue($bit){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ii;
 $2=$bit;
 var $3=HEAP32[((2232)>>2)];
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=2;break;}
 case 2: 
 $1=0;
 label=10;break;
 case 3: 
 var $7=HEAP32[((2232)>>2)];
 var $8=((($7)-(1))|0);
 var $9=HEAP32[((2236)>>2)];
 var $10=(($9+$8)|0);
 var $11=HEAP8[($10)];
 var $12=$2;
 HEAP8[($12)]=$11;
 label=4;break;
 case 4: 
 var $14=HEAP32[((2232)>>2)];
 var $15=((($14)-(1))|0);
 $ii=$15;
 var $16=$ii;
 var $17=($16|0)>=0;
 if($17){label=5;break;}else{label=7;break;}
 case 5: 
 var $19=$ii;
 var $20=HEAP32[((2232)>>2)];
 var $21=($19|0)<($20|0);
 if($21){label=6;break;}else{label=7;break;}
 case 6: 
 label=8;break;
 case 7: 
 _emscripten_run_script(1664);
 label=8;break;
 case 8: 
 var $25=$ii;
 var $26=HEAP32[((2236)>>2)];
 var $27=(($26+$25)|0);
 var $28=$ii;
 var $29=((($28)+(1))|0);
 var $30=HEAP32[((2236)>>2)];
 var $31=(($30+$29)|0);
 var $32=HEAP32[((2232)>>2)];
 var $33=((($32)-(1))|0);
 HEAP32[((2232)>>2)]=$33;
 var $34=$ii;
 var $35=((($33)-($34))|0);
 var $36=$35;
 _memmove($27,$31,$36,1,0);
 label=9;break;
 case 9: 
 $1=1;
 label=10;break;
 case 10: 
 var $39=$1;
 STACKTOP=sp;return $39;
  default: assert(0, "bad label: " + label);
 }

}


function _clear_fifo(){
 var label=0;


 var $1=HEAP32[((2236)>>2)];
 _free($1);
 HEAP32[((2236)>>2)]=0;
 HEAP32[((2232)>>2)]=0;
 return;
}


function _get_fifo_str(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $i;
 var $1=HEAP32[((2216)>>2)];
 var $2=HEAP32[((2232)>>2)];
 var $3=((($2)+(1))|0);
 var $4=_realloc($1,$3);
 HEAP32[((2216)>>2)]=$4;
 $i=0;
 label=2;break;
 case 2: 
 var $6=$i;
 var $7=HEAP32[((2232)>>2)];
 var $8=($6|0)<($7|0);
 if($8){label=3;break;}else{label=5;break;}
 case 3: 
 var $10=$i;
 var $11=HEAP32[((2236)>>2)];
 var $12=(($11+$10)|0);
 var $13=HEAP8[($12)];
 var $14=($13&255);
 var $15=($14|0)!=0;
 var $16=($15?46:44);
 var $17=(($16)&255);
 var $18=$i;
 var $19=HEAP32[((2216)>>2)];
 var $20=(($19+$18)|0);
 HEAP8[($20)]=$17;
 label=4;break;
 case 4: 
 var $22=$i;
 var $23=((($22)+(1))|0);
 $i=$23;
 label=2;break;
 case 5: 
 var $25=HEAP32[((2232)>>2)];
 var $26=HEAP32[((2216)>>2)];
 var $27=(($26+$25)|0);
 HEAP8[($27)]=0;
 var $28=HEAP32[((2216)>>2)];
 STACKTOP=sp;return $28;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_wall($slot,$dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $x;
 var $y;
 var $cmd;
 var $back;
 $2=$slot;
 var $3=$2;
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 $x=$5;
 var $6=$2;
 var $7=(($6+20)|0);
 var $8=HEAP32[(($7)>>2)];
 $y=$8;
 var $9=$2;
 var $10=(($9+24)|0);
 $cmd=$10;
 var $11=$cmd;
 var $12=(($11)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24);
 var $15=($14|0)==124;
 if($15){label=2;break;}else{label=5;break;}
 case 2: 
 var $17=$dot;
 var $18=HEAP8[($17)];
 var $19=($18&255)>>>1;
 var $20=$19&3;
 var $21=($20&255);
 var $22=($21|0)==3;
 if($22){label=4;break;}else{label=3;break;}
 case 3: 
 var $24=$dot;
 var $25=HEAP8[($24)];
 var $26=($25&255)>>>1;
 var $27=$26&3;
 var $28=($27&255);
 var $29=($28|0)==0;
 if($29){label=4;break;}else{label=5;break;}
 case 4: 
 var $31=$dot;
 var $32=HEAP8[($31)];
 var $33=($32&255)>>>1;
 var $34=$33&3;
 var $35=$cmd;
 var $36=(($35+1)|0);
 var $37=$36;
 var $38=(($37)|0);
 HEAP8[($38)]=$34;
 $1=1;
 label=49;break;
 case 5: 
 var $40=$dot;
 var $41=HEAP8[($40)];
 var $42=($41&255)>>>1;
 var $43=$42&3;
 var $44=($43&255);
 var $45=($44|0)==2;
 if($45){label=6;break;}else{label=7;break;}
 case 6: 
 var $66=1;label=11;break;
 case 7: 
 var $48=$dot;
 var $49=HEAP8[($48)];
 var $50=($49&255)>>>1;
 var $51=$50&3;
 var $52=($51&255);
 var $53=($52|0)==1;
 if($53){label=8;break;}else{label=9;break;}
 case 8: 
 var $64=2;label=10;break;
 case 9: 
 var $56=$dot;
 var $57=HEAP8[($56)];
 var $58=($57&255)>>>1;
 var $59=$58&3;
 var $60=($59&255);
 var $61=($60|0)==3;
 var $62=($61?0:3);
 var $64=$62;label=10;break;
 case 10: 
 var $64;
 var $66=$64;label=11;break;
 case 11: 
 var $66;
 $back=$66;
 var $67=$back;
 var $68=($67|0)==2;
 if($68){label=12;break;}else{label=13;break;}
 case 12: 
 var $75=-1;label=14;break;
 case 13: 
 var $71=$back;
 var $72=($71|0)==1;
 var $73=($72?1:0);
 var $75=$73;label=14;break;
 case 14: 
 var $75;
 var $76=$x;
 var $77=((($76)+($75))|0);
 $x=$77;
 var $78=$back;
 var $79=($78|0)==3;
 if($79){label=15;break;}else{label=16;break;}
 case 15: 
 var $86=-1;label=17;break;
 case 16: 
 var $82=$back;
 var $83=($82|0)==0;
 var $84=($83?1:0);
 var $86=$84;label=17;break;
 case 17: 
 var $86;
 var $87=$y;
 var $88=((($87)+($86))|0);
 $y=$88;
 var $89=$dot;
 var $90=HEAP8[($89)];
 var $91=($90&255)>>>4;
 var $92=$91&1;
 var $93=(($92<<24)>>24)!=0;
 if($93){label=18;break;}else{label=33;break;}
 case 18: 
 var $95=$x;
 var $96=$y;
 var $97=_get_slot($95,$96);
 var $98=(($97+24)|0);
 var $99=(($98)|0);
 var $100=HEAP8[($99)];
 var $101=(($100<<24)>>24);
 var $102=($101|0)==61;
 if($102){label=19;break;}else{label=32;break;}
 case 19: 
 var $104=$back;
 var $105=($104|0)==2;
 if($105){label=20;break;}else{label=21;break;}
 case 20: 
 var $112=-1;label=22;break;
 case 21: 
 var $108=$back;
 var $109=($108|0)==1;
 var $110=($109?1:0);
 var $112=$110;label=22;break;
 case 22: 
 var $112;
 var $113=$x;
 var $114=((($113)+($112))|0);
 $x=$114;
 var $115=$back;
 var $116=($115|0)==3;
 if($116){label=23;break;}else{label=24;break;}
 case 23: 
 var $123=-1;label=25;break;
 case 24: 
 var $119=$back;
 var $120=($119|0)==0;
 var $121=($120?1:0);
 var $123=$121;label=25;break;
 case 25: 
 var $123;
 var $124=$y;
 var $125=((($124)+($123))|0);
 $y=$125;
 var $126=$back;
 var $127=(($126)&255);
 var $128=$127&3;
 var $129=$dot;
 var $130=$128&3;
 var $131=$130<<1;
 var $132=HEAP8[($129)];
 var $133=$132&-7;
 var $134=$133|$131;
 HEAP8[($129)]=$134;
 var $135=$x;
 var $136=($135|0)>=0;
 if($136){label=26;break;}else{label=30;break;}
 case 26: 
 var $138=$x;
 var $139=HEAP32[((2112)>>2)];
 var $140=($138|0)<($139|0);
 if($140){label=27;break;}else{label=30;break;}
 case 27: 
 var $142=$y;
 var $143=($142|0)>=0;
 if($143){label=28;break;}else{label=30;break;}
 case 28: 
 var $145=$y;
 var $146=HEAP32[((2192)>>2)];
 var $147=($145|0)<($146|0);
 if($147){label=29;break;}else{label=30;break;}
 case 29: 
 label=31;break;
 case 30: 
 _emscripten_run_script(1584);
 label=31;break;
 case 31: 
 var $151=$x;
 var $152=$y;
 var $153=_get_slot($151,$152);
 var $154=_exec_command_or_add_dot($153,$dot);
 $1=$154;
 label=49;break;
 case 32: 
 $1=1;
 label=49;break;
 case 33: 
 var $157=$cmd;
 var $158=(($157)|0);
 var $159=HEAP8[($158)];
 var $160=(($159<<24)>>24);
 var $161=($160|0)==124;
 if($161){label=34;break;}else{label=36;break;}
 case 34: 
 var $163=$cmd;
 var $164=(($163+1)|0);
 var $165=$164;
 var $166=(($165)|0);
 var $167=HEAP8[($166)];
 var $168=($167&255);
 var $169=($168|0)!=35;
 if($169){label=35;break;}else{label=36;break;}
 case 35: 
 var $171=$cmd;
 var $172=(($171+1)|0);
 var $173=$172;
 var $174=(($173)|0);
 var $175=HEAP8[($174)];
 var $176=$175&3;
 var $177=$dot;
 var $178=$176&3;
 var $179=$178<<1;
 var $180=HEAP8[($177)];
 var $181=$180&-7;
 var $182=$181|$179;
 HEAP8[($177)]=$182;
 label=37;break;
 case 36: 
 var $184=$dot;
 var $185=HEAP8[($184)];
 var $186=($185&255)>>>1;
 var $187=$186&3;
 var $188=($187&255);
 var $189=$dot;
 var $190=HEAP8[($189)];
 var $191=$190&1;
 var $192=(($191<<24)>>24)!=0;
 var $193=$192^1;
 var $194=($193&1);
 var $195=(($194)&255);
 var $196=_turn($188,$195);
 var $197=(($196)&255);
 var $198=$197&3;
 var $199=$dot;
 var $200=$198&3;
 var $201=$200<<1;
 var $202=HEAP8[($199)];
 var $203=$202&-7;
 var $204=$203|$201;
 HEAP8[($199)]=$204;
 label=37;break;
 case 37: 
 var $206=$dot;
 var $207=HEAP8[($206)];
 var $208=($207&255)>>>1;
 var $209=$208&3;
 var $210=($209&255);
 var $211=($210|0)==2;
 if($211){label=38;break;}else{label=39;break;}
 case 38: 
 var $222=-1;label=40;break;
 case 39: 
 var $214=$dot;
 var $215=HEAP8[($214)];
 var $216=($215&255)>>>1;
 var $217=$216&3;
 var $218=($217&255);
 var $219=($218|0)==1;
 var $220=($219?1:0);
 var $222=$220;label=40;break;
 case 40: 
 var $222;
 var $223=$x;
 var $224=((($223)+($222))|0);
 $x=$224;
 var $225=$dot;
 var $226=HEAP8[($225)];
 var $227=($226&255)>>>1;
 var $228=$227&3;
 var $229=($228&255);
 var $230=($229|0)==3;
 if($230){label=41;break;}else{label=42;break;}
 case 41: 
 var $241=-1;label=43;break;
 case 42: 
 var $233=$dot;
 var $234=HEAP8[($233)];
 var $235=($234&255)>>>1;
 var $236=$235&3;
 var $237=($236&255);
 var $238=($237|0)==0;
 var $239=($238?1:0);
 var $241=$239;label=43;break;
 case 43: 
 var $241;
 var $242=$y;
 var $243=((($242)+($241))|0);
 $y=$243;
 var $244=$x;
 var $245=($244|0)>=0;
 if($245){label=44;break;}else{label=47;break;}
 case 44: 
 var $247=$x;
 var $248=HEAP32[((2112)>>2)];
 var $249=($247|0)<($248|0);
 if($249){label=45;break;}else{label=47;break;}
 case 45: 
 var $251=$y;
 var $252=($251|0)>=0;
 if($252){label=46;break;}else{label=47;break;}
 case 46: 
 var $254=$y;
 var $255=HEAP32[((2192)>>2)];
 var $256=($254|0)<($255|0);
 if($256){label=48;break;}else{label=47;break;}
 case 47: 
 $1=1;
 label=49;break;
 case 48: 
 var $259=$x;
 var $260=$y;
 var $261=_get_slot($259,$260);
 var $262=_exec_command_or_add_dot($261,$dot);
 $1=$262;
 label=49;break;
 case 49: 
 var $264=$1;
 STACKTOP=sp;return $264;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_command_or_add_dot($slot,$dot){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $x;
 var $y;
 $2=$slot;
 var $3=HEAP32[((2152)>>2)];
 var $4=((($3)+(1))|0);
 HEAP32[((2152)>>2)]=$4;
 var $5=($3|0)>256;
 if($5){label=2;break;}else{label=3;break;}
 case 2: 
 var $7=$2;
 var $8=(($7+16)|0);
 var $9=HEAP32[(($8)>>2)];
 $x=$9;
 var $10=$2;
 var $11=(($10+20)|0);
 var $12=HEAP32[(($11)>>2)];
 $y=$12;
 var $13=$y;
 var $14=((($13)+(1))|0);
 var $15=$x;
 var $16=((($15)+(1))|0);
 var $17=_snprintf(2240,1023,1464,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$14,HEAP32[(((tempVarArgs)+(8))>>2)]=$16,tempVarArgs)); STACKTOP=tempVarArgs;
 HEAP32[((2120)>>2)]=3;
 var $18=$x;
 HEAP32[((16)>>2)]=$18;
 var $19=$y;
 HEAP32[((8)>>2)]=$19;
 $1=0;
 label=14;break;
 case 3: 
 var $21=$2;
 var $22=(($21+24)|0);
 var $23=(($22)|0);
 var $24=HEAP8[($23)];
 var $25=(($24<<24)>>24);
 switch(($25|0)){case 94:{ label=10;break;}case 118:{ label=11;break;}case 0:{ label=12;break;}case 35:case 124:{ label=4;break;}case 61:{ label=5;break;}case 58:{ label=6;break;}case 43:{ label=7;break;}case 95:{ label=8;break;}case 36:{ label=9;break;}default:{label=13;break;}}break;
 case 4: 
 var $27=$2;
 var $28=_exec_wall($27,$dot);
 $1=$28;
 label=14;break;
 case 5: 
 var $30=$2;
 var $31=_exec_equ($30,$dot);
 $1=$31;
 label=14;break;
 case 6: 
 var $33=$2;
 var $34=_exec_colon($33,$dot);
 $1=$34;
 label=14;break;
 case 7: 
 var $36=$2;
 var $37=_exec_plus($36,$dot);
 $1=$37;
 label=14;break;
 case 8: 
 $1=1;
 label=14;break;
 case 9: 
 var $40=$dot;
 var $41=HEAP8[($40)];
 var $42=$41&1;
 _enqueue($42);
 $1=1;
 label=14;break;
 case 10: 
 var $44=$2;
 var $45=_exec_circumflex($44,$dot);
 $1=$45;
 label=14;break;
 case 11: 
 var $47=$2;
 var $48=_exec_v($47,$dot);
 $1=$48;
 label=14;break;
 case 12: 
 var $50=$2;
 _add_dot($50,$dot);
 $1=1;
 label=14;break;
 case 13: 
 _emscripten_run_script(1384);
 $1=0;
 label=14;break;
 case 14: 
 var $53=$1;
 STACKTOP=sp;return $53;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_equ($slot,$dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $x;
 var $y;
 $2=$slot;
 var $3=$2;
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 $x=$5;
 var $6=$2;
 var $7=(($6+20)|0);
 var $8=HEAP32[(($7)>>2)];
 $y=$8;
 var $9=$dot;
 var $10=HEAP8[($9)];
 var $11=$10&1;
 var $12=(($11<<24)>>24)!=0;
 var $13=$12^1;
 var $14=($13&1);
 var $15=(($14)&255);
 var $16=$15&1;
 var $17=$dot;
 var $18=$16&1;
 var $19=HEAP8[($17)];
 var $20=$19&-2;
 var $21=$20|$18;
 HEAP8[($17)]=$21;
 var $22=$dot;
 var $23=HEAP8[($22)];
 var $24=$23&-17;
 var $25=$24|16;
 HEAP8[($22)]=$25;
 var $26=$dot;
 var $27=HEAP8[($26)];
 var $28=($27&255)>>>1;
 var $29=$28&3;
 var $30=($29&255);
 var $31=($30|0)==2;
 if($31){label=2;break;}else{label=3;break;}
 case 2: 
 var $42=-1;label=4;break;
 case 3: 
 var $34=$dot;
 var $35=HEAP8[($34)];
 var $36=($35&255)>>>1;
 var $37=$36&3;
 var $38=($37&255);
 var $39=($38|0)==1;
 var $40=($39?1:0);
 var $42=$40;label=4;break;
 case 4: 
 var $42;
 var $43=$x;
 var $44=((($43)+($42))|0);
 $x=$44;
 var $45=$dot;
 var $46=HEAP8[($45)];
 var $47=($46&255)>>>1;
 var $48=$47&3;
 var $49=($48&255);
 var $50=($49|0)==3;
 if($50){label=5;break;}else{label=6;break;}
 case 5: 
 var $61=-1;label=7;break;
 case 6: 
 var $53=$dot;
 var $54=HEAP8[($53)];
 var $55=($54&255)>>>1;
 var $56=$55&3;
 var $57=($56&255);
 var $58=($57|0)==0;
 var $59=($58?1:0);
 var $61=$59;label=7;break;
 case 7: 
 var $61;
 var $62=$y;
 var $63=((($62)+($61))|0);
 $y=$63;
 var $64=$x;
 var $65=($64|0)>=0;
 if($65){label=8;break;}else{label=11;break;}
 case 8: 
 var $67=$x;
 var $68=HEAP32[((2112)>>2)];
 var $69=($67|0)<($68|0);
 if($69){label=9;break;}else{label=11;break;}
 case 9: 
 var $71=$y;
 var $72=($71|0)>=0;
 if($72){label=10;break;}else{label=11;break;}
 case 10: 
 var $74=$y;
 var $75=HEAP32[((2192)>>2)];
 var $76=($74|0)<($75|0);
 if($76){label=12;break;}else{label=11;break;}
 case 11: 
 $1=1;
 label=13;break;
 case 12: 
 var $79=$x;
 var $80=$y;
 var $81=_get_slot($79,$80);
 var $82=_exec_command_or_add_dot($81,$dot);
 $1=$82;
 label=13;break;
 case 13: 
 var $84=$1;
 STACKTOP=sp;return $84;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_colon($slot,$dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $gen;
 $1=$slot;
 var $2=$1;
 var $3=(($2+24)|0);
 var $4=(($3)|0);
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24);
 var $7=($6|0)==58;
 if($7){label=2;break;}else{label=3;break;}
 case 2: 
 label=4;break;
 case 3: 
 _emscripten_run_script(1504);
 label=4;break;
 case 4: 
 var $11=$1;
 var $12=(($11+24)|0);
 var $13=(($12+1)|0);
 var $14=$13;
 $gen=$14;
 var $15=$dot;
 var $16=HEAP8[($15)];
 var $17=($16&255)>>>1;
 var $18=$17&3;
 var $19=($18&255);
 var $20=($19|0)==0;
 if($20){label=5;break;}else{label=6;break;}
 case 5: 
 var $22=$gen;
 var $23=(($22)|0);
 var $24=HEAP8[($23)];
 var $25=(($24<<24)>>24)!=0;
 var $26=$25^1;
 var $27=($26&1);
 var $28=(($27)&255);
 var $29=$gen;
 var $30=(($29)|0);
 HEAP8[($30)]=$28;
 label=9;break;
 case 6: 
 var $32=$dot;
 var $33=HEAP8[($32)];
 var $34=($33&255)>>>1;
 var $35=$34&3;
 var $36=($35&255);
 var $37=($36|0)==3;
 if($37){label=7;break;}else{label=8;break;}
 case 7: 
 var $39=$gen;
 var $40=(($39+1)|0);
 var $41=HEAP8[($40)];
 var $42=(($41<<24)>>24)!=0;
 var $43=$42^1;
 var $44=($43&1);
 var $45=(($44)&255);
 var $46=$gen;
 var $47=(($46+1)|0);
 HEAP8[($47)]=$45;
 label=8;break;
 case 8: 
 label=9;break;
 case 9: 
 STACKTOP=sp;return 1;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_plus($slot,$dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $x0;
 var $y0;
 var $x;
 var $y;
 $2=$slot;
 var $3=$2;
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 $x0=$5;
 var $6=$2;
 var $7=(($6+20)|0);
 var $8=HEAP32[(($7)>>2)];
 $y0=$8;
 var $9=$dot;
 var $10=HEAP8[($9)];
 var $11=$10&-17;
 var $12=$11|16;
 HEAP8[($9)]=$12;
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)==2;
 if($18){label=3;break;}else{label=2;break;}
 case 2: 
 var $20=$dot;
 var $21=HEAP8[($20)];
 var $22=($21&255)>>>1;
 var $23=$22&3;
 var $24=($23&255);
 var $25=($24|0)==1;
 if($25){label=3;break;}else{label=28;break;}
 case 3: 
 var $27=$dot;
 var $28=HEAP8[($27)];
 var $29=$28&-7;
 var $30=$29|6;
 HEAP8[($27)]=$30;
 var $31=$x0;
 var $32=$dot;
 var $33=HEAP8[($32)];
 var $34=($33&255)>>>1;
 var $35=$34&3;
 var $36=($35&255);
 var $37=($36|0)==2;
 if($37){label=4;break;}else{label=5;break;}
 case 4: 
 var $48=-1;label=6;break;
 case 5: 
 var $40=$dot;
 var $41=HEAP8[($40)];
 var $42=($41&255)>>>1;
 var $43=$42&3;
 var $44=($43&255);
 var $45=($44|0)==1;
 var $46=($45?1:0);
 var $48=$46;label=6;break;
 case 6: 
 var $48;
 var $49=((($31)+($48))|0);
 $x=$49;
 var $50=$y0;
 var $51=$dot;
 var $52=HEAP8[($51)];
 var $53=($52&255)>>>1;
 var $54=$53&3;
 var $55=($54&255);
 var $56=($55|0)==3;
 if($56){label=7;break;}else{label=8;break;}
 case 7: 
 var $67=-1;label=9;break;
 case 8: 
 var $59=$dot;
 var $60=HEAP8[($59)];
 var $61=($60&255)>>>1;
 var $62=$61&3;
 var $63=($62&255);
 var $64=($63|0)==0;
 var $65=($64?1:0);
 var $67=$65;label=9;break;
 case 9: 
 var $67;
 var $68=((($50)+($67))|0);
 $y=$68;
 var $69=$x;
 var $70=($69|0)>=0;
 if($70){label=10;break;}else{label=15;break;}
 case 10: 
 var $72=$x;
 var $73=HEAP32[((2112)>>2)];
 var $74=($72|0)<($73|0);
 if($74){label=11;break;}else{label=15;break;}
 case 11: 
 var $76=$y;
 var $77=($76|0)>=0;
 if($77){label=12;break;}else{label=15;break;}
 case 12: 
 var $79=$y;
 var $80=HEAP32[((2192)>>2)];
 var $81=($79|0)<($80|0);
 if($81){label=13;break;}else{label=15;break;}
 case 13: 
 var $83=$x;
 var $84=$y;
 var $85=_get_slot($83,$84);
 var $86=_exec_command_or_add_dot($85,$dot);
 var $87=(($86<<24)>>24)!=0;
 if($87){label=15;break;}else{label=14;break;}
 case 14: 
 $1=0;
 label=54;break;
 case 15: 
 var $90=$dot;
 var $91=HEAP8[($90)];
 var $92=$91&-7;
 HEAP8[($90)]=$92;
 var $93=$x0;
 var $94=$dot;
 var $95=HEAP8[($94)];
 var $96=($95&255)>>>1;
 var $97=$96&3;
 var $98=($97&255);
 var $99=($98|0)==2;
 if($99){label=16;break;}else{label=17;break;}
 case 16: 
 var $110=-1;label=18;break;
 case 17: 
 var $102=$dot;
 var $103=HEAP8[($102)];
 var $104=($103&255)>>>1;
 var $105=$104&3;
 var $106=($105&255);
 var $107=($106|0)==1;
 var $108=($107?1:0);
 var $110=$108;label=18;break;
 case 18: 
 var $110;
 var $111=((($93)+($110))|0);
 $x=$111;
 var $112=$y0;
 var $113=$dot;
 var $114=HEAP8[($113)];
 var $115=($114&255)>>>1;
 var $116=$115&3;
 var $117=($116&255);
 var $118=($117|0)==3;
 if($118){label=19;break;}else{label=20;break;}
 case 19: 
 var $129=-1;label=21;break;
 case 20: 
 var $121=$dot;
 var $122=HEAP8[($121)];
 var $123=($122&255)>>>1;
 var $124=$123&3;
 var $125=($124&255);
 var $126=($125|0)==0;
 var $127=($126?1:0);
 var $129=$127;label=21;break;
 case 21: 
 var $129;
 var $130=((($112)+($129))|0);
 $y=$130;
 var $131=$x;
 var $132=($131|0)>=0;
 if($132){label=22;break;}else{label=27;break;}
 case 22: 
 var $134=$x;
 var $135=HEAP32[((2112)>>2)];
 var $136=($134|0)<($135|0);
 if($136){label=23;break;}else{label=27;break;}
 case 23: 
 var $138=$y;
 var $139=($138|0)>=0;
 if($139){label=24;break;}else{label=27;break;}
 case 24: 
 var $141=$y;
 var $142=HEAP32[((2192)>>2)];
 var $143=($141|0)<($142|0);
 if($143){label=25;break;}else{label=27;break;}
 case 25: 
 var $145=$x;
 var $146=$y;
 var $147=_get_slot($145,$146);
 var $148=_exec_command_or_add_dot($147,$dot);
 var $149=(($148<<24)>>24)!=0;
 if($149){label=27;break;}else{label=26;break;}
 case 26: 
 $1=0;
 label=54;break;
 case 27: 
 label=53;break;
 case 28: 
 var $153=$dot;
 var $154=HEAP8[($153)];
 var $155=$154&-7;
 var $156=$155|4;
 HEAP8[($153)]=$156;
 var $157=$x0;
 var $158=$dot;
 var $159=HEAP8[($158)];
 var $160=($159&255)>>>1;
 var $161=$160&3;
 var $162=($161&255);
 var $163=($162|0)==2;
 if($163){label=29;break;}else{label=30;break;}
 case 29: 
 var $174=-1;label=31;break;
 case 30: 
 var $166=$dot;
 var $167=HEAP8[($166)];
 var $168=($167&255)>>>1;
 var $169=$168&3;
 var $170=($169&255);
 var $171=($170|0)==1;
 var $172=($171?1:0);
 var $174=$172;label=31;break;
 case 31: 
 var $174;
 var $175=((($157)+($174))|0);
 $x=$175;
 var $176=$y0;
 var $177=$dot;
 var $178=HEAP8[($177)];
 var $179=($178&255)>>>1;
 var $180=$179&3;
 var $181=($180&255);
 var $182=($181|0)==3;
 if($182){label=32;break;}else{label=33;break;}
 case 32: 
 var $193=-1;label=34;break;
 case 33: 
 var $185=$dot;
 var $186=HEAP8[($185)];
 var $187=($186&255)>>>1;
 var $188=$187&3;
 var $189=($188&255);
 var $190=($189|0)==0;
 var $191=($190?1:0);
 var $193=$191;label=34;break;
 case 34: 
 var $193;
 var $194=((($176)+($193))|0);
 $y=$194;
 var $195=$x;
 var $196=($195|0)>=0;
 if($196){label=35;break;}else{label=40;break;}
 case 35: 
 var $198=$x;
 var $199=HEAP32[((2112)>>2)];
 var $200=($198|0)<($199|0);
 if($200){label=36;break;}else{label=40;break;}
 case 36: 
 var $202=$y;
 var $203=($202|0)>=0;
 if($203){label=37;break;}else{label=40;break;}
 case 37: 
 var $205=$y;
 var $206=HEAP32[((2192)>>2)];
 var $207=($205|0)<($206|0);
 if($207){label=38;break;}else{label=40;break;}
 case 38: 
 var $209=$x;
 var $210=$y;
 var $211=_get_slot($209,$210);
 var $212=_exec_command_or_add_dot($211,$dot);
 var $213=(($212<<24)>>24)!=0;
 if($213){label=40;break;}else{label=39;break;}
 case 39: 
 $1=0;
 label=54;break;
 case 40: 
 var $216=$dot;
 var $217=HEAP8[($216)];
 var $218=$217&-7;
 var $219=$218|2;
 HEAP8[($216)]=$219;
 var $220=$x0;
 var $221=$dot;
 var $222=HEAP8[($221)];
 var $223=($222&255)>>>1;
 var $224=$223&3;
 var $225=($224&255);
 var $226=($225|0)==2;
 if($226){label=41;break;}else{label=42;break;}
 case 41: 
 var $237=-1;label=43;break;
 case 42: 
 var $229=$dot;
 var $230=HEAP8[($229)];
 var $231=($230&255)>>>1;
 var $232=$231&3;
 var $233=($232&255);
 var $234=($233|0)==1;
 var $235=($234?1:0);
 var $237=$235;label=43;break;
 case 43: 
 var $237;
 var $238=((($220)+($237))|0);
 $x=$238;
 var $239=$y0;
 var $240=$dot;
 var $241=HEAP8[($240)];
 var $242=($241&255)>>>1;
 var $243=$242&3;
 var $244=($243&255);
 var $245=($244|0)==3;
 if($245){label=44;break;}else{label=45;break;}
 case 44: 
 var $256=-1;label=46;break;
 case 45: 
 var $248=$dot;
 var $249=HEAP8[($248)];
 var $250=($249&255)>>>1;
 var $251=$250&3;
 var $252=($251&255);
 var $253=($252|0)==0;
 var $254=($253?1:0);
 var $256=$254;label=46;break;
 case 46: 
 var $256;
 var $257=((($239)+($256))|0);
 $y=$257;
 var $258=$x;
 var $259=($258|0)>=0;
 if($259){label=47;break;}else{label=52;break;}
 case 47: 
 var $261=$x;
 var $262=HEAP32[((2112)>>2)];
 var $263=($261|0)<($262|0);
 if($263){label=48;break;}else{label=52;break;}
 case 48: 
 var $265=$y;
 var $266=($265|0)>=0;
 if($266){label=49;break;}else{label=52;break;}
 case 49: 
 var $268=$y;
 var $269=HEAP32[((2192)>>2)];
 var $270=($268|0)<($269|0);
 if($270){label=50;break;}else{label=52;break;}
 case 50: 
 var $272=$x;
 var $273=$y;
 var $274=_get_slot($272,$273);
 var $275=_exec_command_or_add_dot($274,$dot);
 var $276=(($275<<24)>>24)!=0;
 if($276){label=52;break;}else{label=51;break;}
 case 51: 
 $1=0;
 label=54;break;
 case 52: 
 label=53;break;
 case 53: 
 $1=1;
 label=54;break;
 case 54: 
 var $281=$1;
 STACKTOP=sp;return $281;
  default: assert(0, "bad label: " + label);
 }

}


function _exec_circumflex($_,$dot){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $i;
 var $tmp=sp;
 var $len;
 var $str;
 var $i1;
 var $slot;
 var $slot2;
 $2=$_;
 var $3=$dot;
 var $4=HEAP8[($3)];
 var $5=($4&255)>>>1;
 var $6=$5&3;
 var $7=($6&255);
 var $8=($7|0)==3;
 if($8){label=2;break;}else{label=15;break;}
 case 2: 
 var $10=HEAP32[((2232)>>2)];
 var $11=($10|0)!=0;
 if($11){label=4;break;}else{label=3;break;}
 case 3: 
 $1=1;
 label=35;break;
 case 4: 
 label=5;break;
 case 5: 
 $i=0;
 label=6;break;
 case 6: 
 var $16=$i;
 var $17=HEAP32[((2232)>>2)];
 var $18=(((($17|0))/(2))&-1);
 var $19=($16|0)<($18|0);
 if($19){label=7;break;}else{label=9;break;}
 case 7: 
 var $21=$tmp;
 var $22=$i;
 var $23=HEAP32[((2236)>>2)];
 var $24=(($23+$22)|0);
 _memmove($21,$24,1,1,0);
 var $25=$i;
 var $26=HEAP32[((2236)>>2)];
 var $27=(($26+$25)|0);
 var $28=HEAP32[((2232)>>2)];
 var $29=((($28)-(1))|0);
 var $30=$i;
 var $31=((($29)-($30))|0);
 var $32=HEAP32[((2236)>>2)];
 var $33=(($32+$31)|0);
 _memmove($27,$33,1,1,0);
 var $34=HEAP32[((2232)>>2)];
 var $35=((($34)-(1))|0);
 var $36=$i;
 var $37=((($35)-($36))|0);
 var $38=HEAP32[((2236)>>2)];
 var $39=(($38+$37)|0);
 var $40=$tmp;
 _memmove($39,$40,1,1,0);
 label=8;break;
 case 8: 
 var $42=$i;
 var $43=((($42)+(1))|0);
 $i=$43;
 label=6;break;
 case 9: 
 label=10;break;
 case 10: 
 var $46=HEAP32[((2232)>>2)];
 var $47=((($46)+(7))|0);
 var $48=(((($47|0))/(8))&-1);
 $len=$48;
 var $49=$len;
 var $50=((($49)+(1))|0);
 var $51=_calloc($50,1);
 $str=$51;
 $i1=0;
 label=11;break;
 case 11: 
 var $53=$i1;
 var $54=HEAP32[((2232)>>2)];
 var $55=($53|0)<($54|0);
 if($55){label=12;break;}else{label=14;break;}
 case 12: 
 var $57=$i1;
 var $58=HEAP32[((2236)>>2)];
 var $59=(($58+$57)|0);
 var $60=HEAP8[($59)];
 var $61=($60&255);
 var $62=$i1;
 var $63=(((($62|0))%(8))&-1);
 var $64=$61<<$63;
 var $65=$i1;
 var $66=(((($65|0))/(8))&-1);
 var $67=$str;
 var $68=(($67+$66)|0);
 var $69=HEAP8[($68)];
 var $70=(($69<<24)>>24);
 var $71=$70|$64;
 var $72=(($71)&255);
 HEAP8[($68)]=$72;
 label=13;break;
 case 13: 
 var $74=$i1;
 var $75=((($74)+(1))|0);
 $i1=$75;
 label=11;break;
 case 14: 
 _clear_fifo();
 var $77=$str;
 var $78=$len;
 _output($77,$78);
 var $79=$str;
 _free($79);
 label=34;break;
 case 15: 
 var $81=$dot;
 var $82=HEAP8[($81)];
 var $83=($82&255)>>>1;
 var $84=$83&3;
 var $85=($84&255);
 var $86=($85|0)==0;
 if($86){label=16;break;}else{label=17;break;}
 case 16: 
 _clear_fifo();
 label=33;break;
 case 17: 
 var $89=$dot;
 var $90=HEAP8[($89)];
 var $91=($90&255)>>>1;
 var $92=$91&3;
 var $93=($92&255);
 var $94=($93|0)==1;
 if($94){label=18;break;}else{label=25;break;}
 case 18: 
 var $96=_Code_RB_MINMAX(3272,-1);
 $slot=$96;
 label=19;break;
 case 19: 
 var $98=$slot;
 var $99=($98|0)!=0;
 if($99){label=20;break;}else{label=24;break;}
 case 20: 
 var $101=$slot;
 var $102=(($101+24)|0);
 var $103=(($102)|0);
 var $104=HEAP8[($103)];
 var $105=(($104<<24)>>24);
 var $106=($105|0)==58;
 if($106){label=21;break;}else{label=22;break;}
 case 21: 
 var $108=$slot;
 var $109=(($108+24)|0);
 var $110=(($109+1)|0);
 var $111=$110;
 var $112=(($111)|0);
 var $113=HEAP8[($112)];
 var $114=(($113<<24)>>24)!=0;
 var $115=$114^1;
 var $116=($115&1);
 var $117=(($116)&255);
 var $118=$slot;
 var $119=(($118+24)|0);
 var $120=(($119+1)|0);
 var $121=$120;
 var $122=(($121)|0);
 HEAP8[($122)]=$117;
 label=22;break;
 case 22: 
 label=23;break;
 case 23: 
 var $125=$slot;
 var $126=_Code_RB_NEXT($125);
 $slot=$126;
 label=19;break;
 case 24: 
 label=32;break;
 case 25: 
 var $129=_Code_RB_MINMAX(3272,-1);
 $slot2=$129;
 label=26;break;
 case 26: 
 var $131=$slot2;
 var $132=($131|0)!=0;
 if($132){label=27;break;}else{label=31;break;}
 case 27: 
 var $134=$slot2;
 var $135=(($134+24)|0);
 var $136=(($135)|0);
 var $137=HEAP8[($136)];
 var $138=(($137<<24)>>24);
 var $139=($138|0)==58;
 if($139){label=28;break;}else{label=29;break;}
 case 28: 
 var $141=$slot2;
 var $142=(($141+24)|0);
 var $143=(($142+1)|0);
 var $144=$143;
 var $145=(($144+1)|0);
 var $146=HEAP8[($145)];
 var $147=(($146<<24)>>24)!=0;
 var $148=$147^1;
 var $149=($148&1);
 var $150=(($149)&255);
 var $151=$slot2;
 var $152=(($151+24)|0);
 var $153=(($152+1)|0);
 var $154=$153;
 var $155=(($154+1)|0);
 HEAP8[($155)]=$150;
 label=29;break;
 case 29: 
 label=30;break;
 case 30: 
 var $158=$slot2;
 var $159=_Code_RB_NEXT($158);
 $slot2=$159;
 label=26;break;
 case 31: 
 label=32;break;
 case 32: 
 label=33;break;
 case 33: 
 label=34;break;
 case 34: 
 $1=1;
 label=35;break;
 case 35: 
 var $165=$1;
 STACKTOP=sp;return $165;
  default: assert(0, "bad label: " + label);
 }

}


function _output($bytes,$count){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+48)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $buf=sp;
 var $old=(sp)+(8);
 var $3=(sp)+(16);
 var $4=(sp)+(24);
 var $5=(sp)+(32);
 var $6=(sp)+(40);
 var $script;
 $1=$bytes;
 $2=$count;
 var $7=$1;
 var $8=$2;
 _replace_all($3,$7,$8,92,136);
 var $9=$buf;
 var $10=$3;
 assert(8 % 1 === 0);HEAP32[(($9)>>2)]=HEAP32[(($10)>>2)];HEAP32[((($9)+(4))>>2)]=HEAP32[((($10)+(4))>>2)];
 var $11=$old;
 var $12=$buf;
 assert(8 % 1 === 0);HEAP32[(($11)>>2)]=HEAP32[(($12)>>2)];HEAP32[((($11)+(4))>>2)]=HEAP32[((($12)+(4))>>2)];
 var $13=(($buf)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=(($buf+4)|0);
 var $16=HEAP32[(($15)>>2)];
 _replace_all($4,$14,$16,0,128);
 var $17=$buf;
 var $18=$4;
 assert(8 % 1 === 0);HEAP32[(($17)>>2)]=HEAP32[(($18)>>2)];HEAP32[((($17)+(4))>>2)]=HEAP32[((($18)+(4))>>2)];
 var $19=(($old)|0);
 var $20=HEAP32[(($19)>>2)];
 _free($20);
 var $21=$old;
 var $22=$buf;
 assert(8 % 1 === 0);HEAP32[(($21)>>2)]=HEAP32[(($22)>>2)];HEAP32[((($21)+(4))>>2)]=HEAP32[((($22)+(4))>>2)];
 var $23=(($buf)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=(($buf+4)|0);
 var $26=HEAP32[(($25)>>2)];
 _replace_all($5,$24,$26,39,120);
 var $27=$buf;
 var $28=$5;
 assert(8 % 1 === 0);HEAP32[(($27)>>2)]=HEAP32[(($28)>>2)];HEAP32[((($27)+(4))>>2)]=HEAP32[((($28)+(4))>>2)];
 var $29=(($old)|0);
 var $30=HEAP32[(($29)>>2)];
 _free($30);
 var $31=$old;
 var $32=$buf;
 assert(8 % 1 === 0);HEAP32[(($31)>>2)]=HEAP32[(($32)>>2)];HEAP32[((($31)+(4))>>2)]=HEAP32[((($32)+(4))>>2)];
 var $33=(($buf)|0);
 var $34=HEAP32[(($33)>>2)];
 var $35=(($buf+4)|0);
 var $36=HEAP32[(($35)>>2)];
 _replace_all($6,$34,$36,10,112);
 var $37=$buf;
 var $38=$6;
 assert(8 % 1 === 0);HEAP32[(($37)>>2)]=HEAP32[(($38)>>2)];HEAP32[((($37)+(4))>>2)]=HEAP32[((($38)+(4))>>2)];
 var $39=(($old)|0);
 var $40=HEAP32[(($39)>>2)];
 _free($40);
 var $41=(($buf)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=(($buf+4)|0);
 var $44=HEAP32[(($43)>>2)];
 var $45=((($44)+(1))|0);
 var $46=_realloc($42,$45);
 var $47=(($buf)|0);
 HEAP32[(($47)>>2)]=$46;
 var $48=(($buf+4)|0);
 var $49=HEAP32[(($48)>>2)];
 var $50=(($buf)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=(($51+$49)|0);
 HEAP8[($52)]=0;
 var $53=(($buf+4)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=((($54)+(100))|0);
 var $56=_malloc($55);
 $script=$56;
 var $57=$script;
 var $58=(($buf+4)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=((($59)+(100))|0);
 var $61=((($60)-(1))|0);
 var $62=(($buf)|0);
 var $63=HEAP32[(($62)>>2)];
 var $64=_snprintf($57,$61,88,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$63,tempVarArgs)); STACKTOP=tempVarArgs;
 var $65=$script;
 _emscripten_run_script($65);
 var $66=(($buf)|0);
 var $67=HEAP32[(($66)>>2)];
 _free($67);
 var $68=$script;
 _free($68);
 STACKTOP=sp;return;
}


function _exec_v($slot,$dot){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $x;
 var $y;
 var $bit=sp;
 $2=$slot;
 var $3=$2;
 var $4=(($3+16)|0);
 var $5=HEAP32[(($4)>>2)];
 $x=$5;
 var $6=$2;
 var $7=(($6+20)|0);
 var $8=HEAP32[(($7)>>2)];
 $y=$8;
 var $9=_dequeue($bit);
 var $10=(($9<<24)>>24)!=0;
 if($10){label=3;break;}else{label=2;break;}
 case 2: 
 $1=1;
 label=17;break;
 case 3: 
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)!=3;
 if($18){label=4;break;}else{label=16;break;}
 case 4: 
 var $20=HEAP8[($bit)];
 var $21=$20&1;
 var $22=$dot;
 var $23=$21&1;
 var $24=HEAP8[($22)];
 var $25=$24&-2;
 var $26=$25|$23;
 HEAP8[($22)]=$26;
 var $27=$dot;
 var $28=HEAP8[($27)];
 var $29=$28&-17;
 var $30=$29|16;
 HEAP8[($27)]=$30;
 var $31=$dot;
 var $32=HEAP8[($31)];
 var $33=($32&255)>>>1;
 var $34=$33&3;
 var $35=($34&255);
 var $36=($35|0)==2;
 if($36){label=5;break;}else{label=6;break;}
 case 5: 
 var $47=-1;label=7;break;
 case 6: 
 var $39=$dot;
 var $40=HEAP8[($39)];
 var $41=($40&255)>>>1;
 var $42=$41&3;
 var $43=($42&255);
 var $44=($43|0)==1;
 var $45=($44?1:0);
 var $47=$45;label=7;break;
 case 7: 
 var $47;
 var $48=$x;
 var $49=((($48)+($47))|0);
 $x=$49;
 var $50=$dot;
 var $51=HEAP8[($50)];
 var $52=($51&255)>>>1;
 var $53=$52&3;
 var $54=($53&255);
 var $55=($54|0)==3;
 if($55){label=8;break;}else{label=9;break;}
 case 8: 
 var $66=-1;label=10;break;
 case 9: 
 var $58=$dot;
 var $59=HEAP8[($58)];
 var $60=($59&255)>>>1;
 var $61=$60&3;
 var $62=($61&255);
 var $63=($62|0)==0;
 var $64=($63?1:0);
 var $66=$64;label=10;break;
 case 10: 
 var $66;
 var $67=$y;
 var $68=((($67)+($66))|0);
 $y=$68;
 var $69=$x;
 var $70=($69|0)>=0;
 if($70){label=11;break;}else{label=14;break;}
 case 11: 
 var $72=$x;
 var $73=HEAP32[((2112)>>2)];
 var $74=($72|0)<($73|0);
 if($74){label=12;break;}else{label=14;break;}
 case 12: 
 var $76=$y;
 var $77=($76|0)>=0;
 if($77){label=13;break;}else{label=14;break;}
 case 13: 
 var $79=$y;
 var $80=HEAP32[((2192)>>2)];
 var $81=($79|0)<($80|0);
 if($81){label=15;break;}else{label=14;break;}
 case 14: 
 $1=1;
 label=17;break;
 case 15: 
 var $84=$x;
 var $85=$y;
 var $86=_get_slot($84,$85);
 var $87=_exec_command_or_add_dot($86,$dot);
 $1=$87;
 label=17;break;
 case 16: 
 $1=1;
 label=17;break;
 case 17: 
 var $90=$1;
 STACKTOP=sp;return $90;
  default: assert(0, "bad label: " + label);
 }

}


function _move_dots(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $slot;
 var $x;
 var $y;
 var $dot_handled;
 var $i;
 var $dot=sp;
 var $dx;
 var $dy;
 var $newslot;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=26;break;}
 case 3: 
 var $6=$slot;
 var $7=(($6+27)|0);
 var $8=HEAP8[($7)];
 var $9=($8&255);
 var $10=($9|0)==0;
 if($10){label=4;break;}else{label=5;break;}
 case 4: 
 label=25;break;
 case 5: 
 var $13=$slot;
 var $14=(($13+16)|0);
 var $15=HEAP32[(($14)>>2)];
 $x=$15;
 var $16=$slot;
 var $17=(($16+20)|0);
 var $18=HEAP32[(($17)>>2)];
 $y=$18;
 $dot_handled=0;
 $i=0;
 label=6;break;
 case 6: 
 var $20=$i;
 var $21=$slot;
 var $22=(($21+27)|0);
 var $23=HEAP8[($22)];
 var $24=($23&255);
 var $25=($20|0)<($24|0);
 if($25){label=7;break;}else{label=24;break;}
 case 7: 
 var $27=$i;
 var $28=$slot;
 var $29=(($28+28)|0);
 var $30=(($29+$27)|0);
 var $31=$dot;
 var $32=$30;
 assert(1 % 1 === 0);HEAP8[($31)]=HEAP8[($32)];
 var $33=$dot;
 var $34=HEAP8[($33)];
 var $35=($34&255)>>>3;
 var $36=$35&1;
 var $37=(($36<<24)>>24)!=0;
 if($37){label=8;break;}else{label=9;break;}
 case 8: 
 var $39=$i;
 var $40=((($39)+(1))|0);
 $i=$40;
 label=6;break;
 case 9: 
 var $42=$dot_handled;
 var $43=(($42<<24)>>24)!=0;
 if($43){label=11;break;}else{label=10;break;}
 case 10: 
 label=12;break;
 case 11: 
 _emscripten_run_script(1304);
 label=12;break;
 case 12: 
 $dot_handled=1;
 var $47=$slot;
 var $48=$i;
 _remove_dot($47,$48);
 var $49=$dot;
 var $50=HEAP8[($49)];
 var $51=($50&255)>>>1;
 var $52=$51&3;
 var $53=($52&255);
 var $54=($53|0)==2;
 if($54){label=13;break;}else{label=14;break;}
 case 13: 
 var $65=-1;label=15;break;
 case 14: 
 var $57=$dot;
 var $58=HEAP8[($57)];
 var $59=($58&255)>>>1;
 var $60=$59&3;
 var $61=($60&255);
 var $62=($61|0)==1;
 var $63=($62?1:0);
 var $65=$63;label=15;break;
 case 15: 
 var $65;
 $dx=$65;
 var $66=$dot;
 var $67=HEAP8[($66)];
 var $68=($67&255)>>>1;
 var $69=$68&3;
 var $70=($69&255);
 var $71=($70|0)==3;
 if($71){label=16;break;}else{label=17;break;}
 case 16: 
 var $82=-1;label=18;break;
 case 17: 
 var $74=$dot;
 var $75=HEAP8[($74)];
 var $76=($75&255)>>>1;
 var $77=$76&3;
 var $78=($77&255);
 var $79=($78|0)==0;
 var $80=($79?1:0);
 var $82=$80;label=18;break;
 case 18: 
 var $82;
 $dy=$82;
 var $83=$x;
 var $84=$dx;
 var $85=((($83)+($84))|0);
 var $86=($85|0)>=0;
 if($86){label=19;break;}else{label=22;break;}
 case 19: 
 var $88=$x;
 var $89=$dx;
 var $90=((($88)+($89))|0);
 var $91=HEAP32[((2112)>>2)];
 var $92=($90|0)<($91|0);
 if($92){label=20;break;}else{label=22;break;}
 case 20: 
 var $94=$y;
 var $95=$dy;
 var $96=((($94)+($95))|0);
 var $97=($96|0)>=0;
 if($97){label=21;break;}else{label=22;break;}
 case 21: 
 var $99=$y;
 var $100=$dy;
 var $101=((($99)+($100))|0);
 var $102=HEAP32[((2192)>>2)];
 var $103=($101|0)<($102|0);
 if($103){label=23;break;}else{label=22;break;}
 case 22: 
 label=6;break;
 case 23: 
 var $106=$x;
 var $107=$dx;
 var $108=((($106)+($107))|0);
 var $109=$y;
 var $110=$dy;
 var $111=((($109)+($110))|0);
 var $112=_get_slot($108,$111);
 $newslot=$112;
 var $113=$dot;
 var $114=HEAP8[($113)];
 var $115=$114&-9;
 var $116=$115|8;
 HEAP8[($113)]=$116;
 var $117=$newslot;
 _add_dot($117,$dot);
 label=6;break;
 case 24: 
 label=25;break;
 case 25: 
 var $120=$slot;
 var $121=_Code_RB_NEXT($120);
 $slot=$121;
 label=2;break;
 case 26: 
 _retract_low_priority_dots();
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _handle_input($slot,$done){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+40)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $x;
 var $y;
 var $cur=sp;
 var $bit=(sp)+(8);
 var $dot=(sp)+(16);
 var $bit1=(sp)+(24);
 var $dot2=(sp)+(32);
 $2=$slot;
 $3=$done;
 var $4=$2;
 var $5=(($4+16)|0);
 var $6=HEAP32[(($5)>>2)];
 $x=$6;
 var $7=$2;
 var $8=(($7+20)|0);
 var $9=HEAP32[(($8)>>2)];
 $y=$9;
 var $10=HEAP8[(2168)];
 var $11=(($10<<24)>>24)!=0;
 if($11){label=2;break;}else{label=3;break;}
 case 2: 
 $1=1;
 label=37;break;
 case 3: 
 var $14=HEAP32[((2160)>>2)];
 var $15=($14|0)>1;
 if($15){label=4;break;}else{label=19;break;}
 case 4: 
 var $17=HEAP32[((3264)>>2)];
 var $18=HEAP32[((2164)>>2)];
 var $19=(($18+($17<<3))|0);
 var $20=$cur;
 var $21=$19;
 assert(8 % 1 === 0);HEAP32[(($20)>>2)]=HEAP32[(($21)>>2)];HEAP32[((($20)+(4))>>2)]=HEAP32[((($21)+(4))>>2)];
 var $22=(($cur)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=$x;
 var $25=($23|0)==($24|0);
 if($25){label=5;break;}else{label=18;break;}
 case 5: 
 var $27=(($cur+4)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=$y;
 var $30=($28|0)==($29|0);
 if($30){label=6;break;}else{label=18;break;}
 case 6: 
 var $32=_input($bit);
 var $33=(($32<<24)>>24)!=0;
 if($33){label=7;break;}else{label=16;break;}
 case 7: 
 var $35=HEAP8[($bit)];
 var $36=$35&1;
 var $37=$dot;
 var $38=$36&1;
 var $39=HEAP8[($37)];
 var $40=$39&-2;
 var $41=$40|$38;
 HEAP8[($37)]=$41;
 var $42=$dot;
 var $43=HEAP8[($42)];
 var $44=$43&-7;
 HEAP8[($42)]=$44;
 var $45=$dot;
 var $46=HEAP8[($45)];
 var $47=$46&-9;
 HEAP8[($45)]=$47;
 var $48=$dot;
 var $49=HEAP8[($48)];
 var $50=$49&-17;
 var $51=$50|16;
 HEAP8[($48)]=$51;
 var $52=$dot;
 var $53=HEAP8[($52)];
 var $54=$53&-33;
 HEAP8[($52)]=$54;
 var $55=$dot;
 var $56=HEAP8[($55)];
 var $57=$56&-65;
 HEAP8[($55)]=$57;
 var $58=$x;
 var $59=($58|0)>=0;
 if($59){label=8;break;}else{label=13;break;}
 case 8: 
 var $61=$x;
 var $62=HEAP32[((2112)>>2)];
 var $63=($61|0)<($62|0);
 if($63){label=9;break;}else{label=13;break;}
 case 9: 
 var $65=$y;
 var $66=((($65)+(1))|0);
 var $67=($66|0)>=0;
 if($67){label=10;break;}else{label=13;break;}
 case 10: 
 var $69=$y;
 var $70=((($69)+(1))|0);
 var $71=HEAP32[((2192)>>2)];
 var $72=($70|0)<($71|0);
 if($72){label=11;break;}else{label=13;break;}
 case 11: 
 var $74=$x;
 var $75=$y;
 var $76=((($75)+(1))|0);
 var $77=_get_slot($74,$76);
 var $78=_exec_command_or_add_dot($77,$dot);
 var $79=(($78<<24)>>24)!=0;
 if($79){label=13;break;}else{label=12;break;}
 case 12: 
 $1=0;
 label=37;break;
 case 13: 
 var $82=HEAP32[((3264)>>2)];
 var $83=((($82)+(1))|0);
 HEAP32[((3264)>>2)]=$83;
 var $84=HEAP32[((2160)>>2)];
 var $85=($83|0)==($84|0);
 if($85){label=14;break;}else{label=15;break;}
 case 14: 
 HEAP32[((3264)>>2)]=0;
 label=15;break;
 case 15: 
 label=17;break;
 case 16: 
 HEAP8[(2168)]=1;
 label=17;break;
 case 17: 
 var $90=$3;
 HEAP8[($90)]=1;
 label=18;break;
 case 18: 
 label=36;break;
 case 19: 
 var $93=HEAP32[((2224)>>2)];
 var $94=(((($93|0))%(2))&-1);
 var $95=($94|0)==0;
 if($95){label=20;break;}else{label=35;break;}
 case 20: 
 var $97=HEAP32[((2160)>>2)];
 var $98=($97|0)==1;
 if($98){label=21;break;}else{label=24;break;}
 case 21: 
 var $100=HEAP32[((2164)>>2)];
 var $101=(($100)|0);
 var $102=(($101)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=$x;
 var $105=($103|0)==($104|0);
 if($105){label=22;break;}else{label=24;break;}
 case 22: 
 var $107=HEAP32[((2164)>>2)];
 var $108=(($107)|0);
 var $109=(($108+4)|0);
 var $110=HEAP32[(($109)>>2)];
 var $111=$y;
 var $112=($110|0)==($111|0);
 if($112){label=23;break;}else{label=24;break;}
 case 23: 
 label=25;break;
 case 24: 
 _emscripten_run_script(1144);
 label=25;break;
 case 25: 
 var $116=_input($bit1);
 var $117=(($116<<24)>>24)!=0;
 if($117){label=26;break;}else{label=33;break;}
 case 26: 
 var $119=HEAP8[($bit1)];
 var $120=$119&1;
 var $121=$dot2;
 var $122=$120&1;
 var $123=HEAP8[($121)];
 var $124=$123&-2;
 var $125=$124|$122;
 HEAP8[($121)]=$125;
 var $126=$dot2;
 var $127=HEAP8[($126)];
 var $128=$127&-7;
 HEAP8[($126)]=$128;
 var $129=$dot2;
 var $130=HEAP8[($129)];
 var $131=$130&-9;
 HEAP8[($129)]=$131;
 var $132=$dot2;
 var $133=HEAP8[($132)];
 var $134=$133&-17;
 var $135=$134|16;
 HEAP8[($132)]=$135;
 var $136=$dot2;
 var $137=HEAP8[($136)];
 var $138=$137&-33;
 HEAP8[($136)]=$138;
 var $139=$dot2;
 var $140=HEAP8[($139)];
 var $141=$140&-65;
 HEAP8[($139)]=$141;
 var $142=$x;
 var $143=($142|0)>=0;
 if($143){label=27;break;}else{label=32;break;}
 case 27: 
 var $145=$x;
 var $146=HEAP32[((2112)>>2)];
 var $147=($145|0)<($146|0);
 if($147){label=28;break;}else{label=32;break;}
 case 28: 
 var $149=$y;
 var $150=((($149)+(1))|0);
 var $151=($150|0)>=0;
 if($151){label=29;break;}else{label=32;break;}
 case 29: 
 var $153=$y;
 var $154=((($153)+(1))|0);
 var $155=HEAP32[((2192)>>2)];
 var $156=($154|0)<($155|0);
 if($156){label=30;break;}else{label=32;break;}
 case 30: 
 var $158=$x;
 var $159=$y;
 var $160=((($159)+(1))|0);
 var $161=_get_slot($158,$160);
 var $162=_exec_command_or_add_dot($161,$dot2);
 var $163=(($162<<24)>>24)!=0;
 if($163){label=32;break;}else{label=31;break;}
 case 31: 
 $1=0;
 label=37;break;
 case 32: 
 label=34;break;
 case 33: 
 HEAP8[(2168)]=1;
 label=34;break;
 case 34: 
 label=35;break;
 case 35: 
 label=36;break;
 case 36: 
 $1=1;
 label=37;break;
 case 37: 
 var $171=$1;
 STACKTOP=sp;return $171;
  default: assert(0, "bad label: " + label);
 }

}


function _input($bit){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $ch;
 $2=$bit;
 var $3=HEAP32[((2184)>>2)];
 var $4=($3|0)==0;
 if($4){label=2;break;}else{label=5;break;}
 case 2: 
 var $6=_dobweb_getchar();
 $ch=$6;
 var $7=$ch;
 var $8=($7|0)==-1;
 if($8){label=3;break;}else{label=4;break;}
 case 3: 
 $1=0;
 label=6;break;
 case 4: 
 var $11=$ch;
 var $12=(($11)&255);
 HEAP8[(2176)]=$12;
 label=5;break;
 case 5: 
 var $14=HEAP8[(2176)];
 var $15=($14&255);
 var $16=HEAP32[((2184)>>2)];
 var $17=$15>>($16|0);
 var $18=$17&1;
 var $19=(($18)&255);
 var $20=$2;
 HEAP8[($20)]=$19;
 var $21=HEAP32[((2184)>>2)];
 var $22=((($21)+(1))|0);
 var $23=(((($22|0))%(8))&-1);
 HEAP32[((2184)>>2)]=$23;
 $1=1;
 label=6;break;
 case 6: 
 var $25=$1;
 STACKTOP=sp;return $25;
  default: assert(0, "bad label: " + label);
 }

}


function _dot_sorter($dot0,$dot1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$dot0;
 $2=$dot1;
 var $3=$1;
 var $4=$3;
 var $5=HEAP8[($4)];
 var $6=($5&255)>>>1;
 var $7=$6&3;
 var $8=($7&255);
 var $9=$2;
 var $10=$9;
 var $11=HEAP8[($10)];
 var $12=($11&255)>>>1;
 var $13=$12&3;
 var $14=($13&255);
 var $15=((($8)-($14))|0);
 STACKTOP=sp;return $15;
}


function _execute_commands(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+40)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $done_input=sp;
 var $slot;
 var $dot=(sp)+(8);
 var $x;
 var $y;
 var $dot1=(sp)+(16);
 var $dot2=(sp)+(24);
 var $dot3=(sp)+(32);
 HEAP8[($done_input)]=0;
 var $2=_Code_RB_MINMAX(3272,-1);
 $slot=$2;
 label=2;break;
 case 2: 
 var $4=$slot;
 var $5=($4|0)!=0;
 if($5){label=3;break;}else{label=45;break;}
 case 3: 
 var $7=$slot;
 var $8=(($7+24)|0);
 var $9=(($8)|0);
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24);
 var $12=($11|0)==0;
 if($12){label=4;break;}else{label=5;break;}
 case 4: 
 label=44;break;
 case 5: 
 var $15=$slot;
 var $16=(($15+24)|0);
 var $17=(($16)|0);
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24);
 var $20=($19|0)==95;
 if($20){label=6;break;}else{label=11;break;}
 case 6: 
 var $22=$slot;
 var $23=(($22+27)|0);
 HEAP8[($23)]=0;
 var $24=HEAP8[($done_input)];
 var $25=(($24<<24)>>24)!=0;
 if($25){label=7;break;}else{label=8;break;}
 case 7: 
 label=44;break;
 case 8: 
 HEAP32[((2152)>>2)]=0;
 var $28=$slot;
 var $29=_handle_input($28,$done_input);
 var $30=(($29<<24)>>24)!=0;
 if($30){label=10;break;}else{label=9;break;}
 case 9: 
 $1=0;
 label=46;break;
 case 10: 
 label=44;break;
 case 11: 
 var $34=$slot;
 var $35=(($34+28)|0);
 var $36=(($35)|0);
 var $37=$36;
 var $38=$slot;
 var $39=(($38+27)|0);
 var $40=HEAP8[($39)];
 var $41=($40&255);
 _qsort($37,$41,1,(12));
 var $42=$slot;
 var $43=(($42+24)|0);
 var $44=(($43)|0);
 var $45=HEAP8[($44)];
 var $46=(($45<<24)>>24);
 var $47=($46|0)==58;
 if($47){label=12;break;}else{label=38;break;}
 case 12: 
 label=13;break;
 case 13: 
 var $50=$slot;
 var $51=(($50+27)|0);
 var $52=HEAP8[($51)];
 var $53=($52&255);
 var $54=($53|0)!=0;
 if($54){label=14;break;}else{var $78=0;label=17;break;}
 case 14: 
 var $56=$slot;
 var $57=(($56+28)|0);
 var $58=(($57)|0);
 var $59=$58;
 var $60=HEAP8[($59)];
 var $61=($60&255)>>>1;
 var $62=$61&3;
 var $63=($62&255);
 var $64=($63|0)==0;
 if($64){var $76=1;label=16;break;}else{label=15;break;}
 case 15: 
 var $66=$slot;
 var $67=(($66+28)|0);
 var $68=(($67)|0);
 var $69=$68;
 var $70=HEAP8[($69)];
 var $71=($70&255)>>>1;
 var $72=$71&3;
 var $73=($72&255);
 var $74=($73|0)==1;
 var $76=$74;label=16;break;
 case 16: 
 var $76;
 var $78=$76;label=17;break;
 case 17: 
 var $78;
 if($78){label=18;break;}else{label=19;break;}
 case 18: 
 var $80=$slot;
 var $81=(($80+28)|0);
 var $82=(($81)|0);
 var $83=$dot;
 var $84=$82;
 assert(1 % 1 === 0);HEAP8[($83)]=HEAP8[($84)];
 var $85=$slot;
 _remove_dot($85,0);
 var $86=$slot;
 var $87=_exec_colon($86,$dot);
 label=13;break;
 case 19: 
 var $89=$slot;
 var $90=(($89+24)|0);
 var $91=(($90+1)|0);
 var $92=$91;
 var $93=(($92)|0);
 var $94=HEAP8[($93)];
 var $95=(($94<<24)>>24)!=0;
 if($95){label=20;break;}else{label=27;break;}
 case 20: 
 var $97=$slot;
 var $98=(($97+16)|0);
 var $99=HEAP32[(($98)>>2)];
 $x=$99;
 var $100=$slot;
 var $101=(($100+20)|0);
 var $102=HEAP32[(($101)>>2)];
 $y=$102;
 var $103=$slot;
 var $104=(($103+24)|0);
 var $105=(($104+1)|0);
 var $106=$105;
 var $107=(($106+1)|0);
 var $108=HEAP8[($107)];
 var $109=$108&1;
 var $110=$dot1;
 var $111=$109&1;
 var $112=HEAP8[($110)];
 var $113=$112&-2;
 var $114=$113|$111;
 HEAP8[($110)]=$114;
 var $115=$dot1;
 var $116=HEAP8[($115)];
 var $117=$116&-7;
 var $118=$117|2;
 HEAP8[($115)]=$118;
 var $119=$dot1;
 var $120=HEAP8[($119)];
 var $121=$120&-9;
 HEAP8[($119)]=$121;
 var $122=$dot1;
 var $123=HEAP8[($122)];
 var $124=$123&-17;
 var $125=$124|16;
 HEAP8[($122)]=$125;
 var $126=$dot1;
 var $127=HEAP8[($126)];
 var $128=$127&-33;
 HEAP8[($126)]=$128;
 var $129=$dot1;
 var $130=HEAP8[($129)];
 var $131=$130&-65;
 HEAP8[($129)]=$131;
 HEAP32[((2152)>>2)]=0;
 var $132=$x;
 var $133=((($132)+(1))|0);
 var $134=($133|0)>=0;
 if($134){label=21;break;}else{label=26;break;}
 case 21: 
 var $136=$x;
 var $137=((($136)+(1))|0);
 var $138=HEAP32[((2112)>>2)];
 var $139=($137|0)<($138|0);
 if($139){label=22;break;}else{label=26;break;}
 case 22: 
 var $141=$y;
 var $142=($141|0)>=0;
 if($142){label=23;break;}else{label=26;break;}
 case 23: 
 var $144=$y;
 var $145=HEAP32[((2192)>>2)];
 var $146=($144|0)<($145|0);
 if($146){label=24;break;}else{label=26;break;}
 case 24: 
 var $148=$x;
 var $149=((($148)+(1))|0);
 var $150=$y;
 var $151=_get_slot($149,$150);
 var $152=_exec_command_or_add_dot($151,$dot1);
 var $153=(($152<<24)>>24)!=0;
 if($153){label=26;break;}else{label=25;break;}
 case 25: 
 $1=0;
 label=46;break;
 case 26: 
 label=27;break;
 case 27: 
 label=28;break;
 case 28: 
 var $158=$slot;
 var $159=(($158+27)|0);
 var $160=HEAP8[($159)];
 var $161=($160&255);
 var $162=($161|0)!=0;
 if($162){label=29;break;}else{var $186=0;label=32;break;}
 case 29: 
 var $164=$slot;
 var $165=(($164+28)|0);
 var $166=(($165)|0);
 var $167=$166;
 var $168=HEAP8[($167)];
 var $169=($168&255)>>>1;
 var $170=$169&3;
 var $171=($170&255);
 var $172=($171|0)==2;
 if($172){var $184=1;label=31;break;}else{label=30;break;}
 case 30: 
 var $174=$slot;
 var $175=(($174+28)|0);
 var $176=(($175)|0);
 var $177=$176;
 var $178=HEAP8[($177)];
 var $179=($178&255)>>>1;
 var $180=$179&3;
 var $181=($180&255);
 var $182=($181|0)==3;
 var $184=$182;label=31;break;
 case 31: 
 var $184;
 var $186=$184;label=32;break;
 case 32: 
 var $186;
 if($186){label=33;break;}else{label=34;break;}
 case 33: 
 var $188=$slot;
 var $189=(($188+28)|0);
 var $190=(($189)|0);
 var $191=$dot2;
 var $192=$190;
 assert(1 % 1 === 0);HEAP8[($191)]=HEAP8[($192)];
 var $193=$slot;
 _remove_dot($193,0);
 var $194=$slot;
 var $195=_exec_colon($194,$dot2);
 label=28;break;
 case 34: 
 var $197=$slot;
 var $198=(($197+27)|0);
 var $199=HEAP8[($198)];
 var $200=($199&255);
 var $201=($200|0)==0;
 if($201){label=35;break;}else{label=36;break;}
 case 35: 
 label=37;break;
 case 36: 
 _emscripten_run_script(1064);
 label=37;break;
 case 37: 
 label=44;break;
 case 38: 
 label=39;break;
 case 39: 
 var $207=$slot;
 var $208=(($207+27)|0);
 var $209=HEAP8[($208)];
 var $210=(($209<<24)>>24)!=0;
 if($210){label=40;break;}else{label=43;break;}
 case 40: 
 var $212=$slot;
 var $213=(($212+28)|0);
 var $214=(($213)|0);
 var $215=$dot3;
 var $216=$214;
 assert(1 % 1 === 0);HEAP8[($215)]=HEAP8[($216)];
 var $217=$slot;
 _remove_dot($217,0);
 HEAP32[((2152)>>2)]=0;
 var $218=$slot;
 var $219=_exec_command_or_add_dot($218,$dot3);
 var $220=(($219<<24)>>24)!=0;
 if($220){label=42;break;}else{label=41;break;}
 case 41: 
 $1=0;
 label=46;break;
 case 42: 
 label=39;break;
 case 43: 
 label=44;break;
 case 44: 
 var $225=$slot;
 var $226=_Code_RB_NEXT($225);
 $slot=$226;
 label=2;break;
 case 45: 
 $1=1;
 label=46;break;
 case 46: 
 var $229=$1;
 STACKTOP=sp;return $229;
  default: assert(0, "bad label: " + label);
 }

}


function _find_dot($slot,$pred){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $i;
 $2=$slot;
 $3=$pred;
 $i=0;
 label=2;break;
 case 2: 
 var $5=$i;
 var $6=$2;
 var $7=(($6+27)|0);
 var $8=HEAP8[($7)];
 var $9=($8&255);
 var $10=($5|0)<($9|0);
 if($10){label=3;break;}else{label=7;break;}
 case 3: 
 var $12=$3;
 var $13=$i;
 var $14=$2;
 var $15=(($14+28)|0);
 var $16=(($15+$13)|0);
 var $17=FUNCTION_TABLE[$12]($16);
 var $18=(($17<<24)>>24)!=0;
 if($18){label=4;break;}else{label=5;break;}
 case 4: 
 var $20=$i;
 $1=$20;
 label=8;break;
 case 5: 
 label=6;break;
 case 6: 
 var $23=$i;
 var $24=((($23)+(1))|0);
 $i=$24;
 label=2;break;
 case 7: 
 $1=-1;
 label=8;break;
 case 8: 
 var $27=$1;
 STACKTOP=sp;return $27;
  default: assert(0, "bad label: " + label);
 }

}


function _is_nonblocked_down($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $14=0;label=3;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>1;
 var $10=$9&3;
 var $11=($10&255);
 var $12=($11|0)==0;
 var $14=$12;label=3;break;
 case 3: 
 var $14;
 var $15=($14&1);
 var $16=(($15)&255);
 STACKTOP=sp;return $16;
  default: assert(0, "bad label: " + label);
 }

}


function _is_nonblocked_left_or_right($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $23=0;label=5;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>1;
 var $10=$9&3;
 var $11=($10&255);
 var $12=($11|0)==2;
 if($12){var $21=1;label=4;break;}else{label=3;break;}
 case 3: 
 var $14=$dot;
 var $15=HEAP8[($14)];
 var $16=($15&255)>>>1;
 var $17=$16&3;
 var $18=($17&255);
 var $19=($18|0)==1;
 var $21=$19;label=4;break;
 case 4: 
 var $21;
 var $23=$21;label=5;break;
 case 5: 
 var $23;
 var $24=($23&1);
 var $25=(($24)&255);
 STACKTOP=sp;return $25;
  default: assert(0, "bad label: " + label);
 }

}


function _retract_low_priority_dots(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $slot;
 var $x;
 var $y;
 var $i;
 var $dot=sp;
 var $back;
 var $x1;
 var $y1;
 var $i1;
 var $dot2=(sp)+(8);
 var $back3;
 var $x14;
 var $y15;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=64;break;}
 case 3: 
 var $6=$slot;
 var $7=(($6+16)|0);
 var $8=HEAP32[(($7)>>2)];
 $x=$8;
 var $9=$slot;
 var $10=(($9+20)|0);
 var $11=HEAP32[(($10)>>2)];
 $y=$11;
 var $12=$slot;
 var $13=(($12+27)|0);
 var $14=HEAP8[($13)];
 var $15=($14&255);
 var $16=($15|0)<=1;
 if($16){label=5;break;}else{label=4;break;}
 case 4: 
 var $18=$slot;
 var $19=(($18+24)|0);
 var $20=(($19)|0);
 var $21=HEAP8[($20)];
 var $22=(($21<<24)>>24);
 var $23=($22|0)!=0;
 if($23){label=5;break;}else{label=6;break;}
 case 5: 
 label=63;break;
 case 6: 
 var $26=$slot;
 var $27=_find_dot($26,10);
 var $28=($27|0)!=-1;
 if($28){label=7;break;}else{label=34;break;}
 case 7: 
 $i=0;
 label=8;break;
 case 8: 
 var $31=$i;
 var $32=$slot;
 var $33=(($32+27)|0);
 var $34=HEAP8[($33)];
 var $35=($34&255);
 var $36=($31|0)<($35|0);
 if($36){label=9;break;}else{label=33;break;}
 case 9: 
 var $38=$i;
 var $39=$slot;
 var $40=(($39+28)|0);
 var $41=(($40+$38)|0);
 var $42=$dot;
 var $43=$41;
 assert(1 % 1 === 0);HEAP8[($42)]=HEAP8[($43)];
 var $44=$dot;
 var $45=HEAP8[($44)];
 var $46=($45&255)>>>1;
 var $47=$46&3;
 var $48=($47&255);
 var $49=($48|0)==2;
 if($49){label=11;break;}else{label=10;break;}
 case 10: 
 var $51=$dot;
 var $52=HEAP8[($51)];
 var $53=($52&255)>>>1;
 var $54=$53&3;
 var $55=($54&255);
 var $56=($55|0)==1;
 if($56){label=11;break;}else{label=31;break;}
 case 11: 
 var $58=$dot;
 var $59=HEAP8[($58)];
 var $60=($59&255)>>>4;
 var $61=$60&1;
 var $62=(($61<<24)>>24)!=0;
 if($62){label=31;break;}else{label=12;break;}
 case 12: 
 var $64=$slot;
 var $65=$i;
 _remove_dot($64,$65);
 var $66=$dot;
 var $67=HEAP8[($66)];
 var $68=($67&255)>>>1;
 var $69=$68&3;
 var $70=($69&255);
 var $71=($70|0)==2;
 if($71){label=13;break;}else{label=14;break;}
 case 13: 
 var $92=1;label=18;break;
 case 14: 
 var $74=$dot;
 var $75=HEAP8[($74)];
 var $76=($75&255)>>>1;
 var $77=$76&3;
 var $78=($77&255);
 var $79=($78|0)==1;
 if($79){label=15;break;}else{label=16;break;}
 case 15: 
 var $90=2;label=17;break;
 case 16: 
 var $82=$dot;
 var $83=HEAP8[($82)];
 var $84=($83&255)>>>1;
 var $85=$84&3;
 var $86=($85&255);
 var $87=($86|0)==3;
 var $88=($87?0:3);
 var $90=$88;label=17;break;
 case 17: 
 var $90;
 var $92=$90;label=18;break;
 case 18: 
 var $92;
 $back=$92;
 var $93=$x;
 var $94=$back;
 var $95=($94|0)==2;
 if($95){label=19;break;}else{label=20;break;}
 case 19: 
 var $102=-1;label=21;break;
 case 20: 
 var $98=$back;
 var $99=($98|0)==1;
 var $100=($99?1:0);
 var $102=$100;label=21;break;
 case 21: 
 var $102;
 var $103=((($93)+($102))|0);
 $x1=$103;
 var $104=$y;
 var $105=$back;
 var $106=($105|0)==3;
 if($106){label=22;break;}else{label=23;break;}
 case 22: 
 var $113=-1;label=24;break;
 case 23: 
 var $109=$back;
 var $110=($109|0)==0;
 var $111=($110?1:0);
 var $113=$111;label=24;break;
 case 24: 
 var $113;
 var $114=((($104)+($113))|0);
 $y1=$114;
 var $115=$x1;
 var $116=($115|0)>=0;
 if($116){label=25;break;}else{label=29;break;}
 case 25: 
 var $118=$x1;
 var $119=HEAP32[((2112)>>2)];
 var $120=($118|0)<($119|0);
 if($120){label=26;break;}else{label=29;break;}
 case 26: 
 var $122=$y1;
 var $123=($122|0)>=0;
 if($123){label=27;break;}else{label=29;break;}
 case 27: 
 var $125=$y1;
 var $126=HEAP32[((2192)>>2)];
 var $127=($125|0)<($126|0);
 if($127){label=28;break;}else{label=29;break;}
 case 28: 
 label=30;break;
 case 29: 
 _emscripten_run_script(984);
 label=30;break;
 case 30: 
 var $131=$dot;
 var $132=HEAP8[($131)];
 var $133=$132&-33;
 var $134=$133|32;
 HEAP8[($131)]=$134;
 var $135=$x1;
 var $136=$y1;
 var $137=_get_slot($135,$136);
 _add_dot($137,$dot);
 label=32;break;
 case 31: 
 var $139=$i;
 var $140=((($139)+(1))|0);
 $i=$140;
 label=32;break;
 case 32: 
 label=8;break;
 case 33: 
 label=62;break;
 case 34: 
 var $144=$slot;
 var $145=_find_dot($144,4);
 var $146=($145|0)!=-1;
 if($146){label=35;break;}else{label=61;break;}
 case 35: 
 $i1=0;
 label=36;break;
 case 36: 
 var $149=$i1;
 var $150=$slot;
 var $151=(($150+27)|0);
 var $152=HEAP8[($151)];
 var $153=($152&255);
 var $154=($149|0)<($153|0);
 if($154){label=37;break;}else{label=60;break;}
 case 37: 
 var $156=$i1;
 var $157=$slot;
 var $158=(($157+28)|0);
 var $159=(($158+$156)|0);
 var $160=$dot2;
 var $161=$159;
 assert(1 % 1 === 0);HEAP8[($160)]=HEAP8[($161)];
 var $162=$dot2;
 var $163=HEAP8[($162)];
 var $164=($163&255)>>>1;
 var $165=$164&3;
 var $166=($165&255);
 var $167=($166|0)==3;
 if($167){label=38;break;}else{label=58;break;}
 case 38: 
 var $169=$dot2;
 var $170=HEAP8[($169)];
 var $171=($170&255)>>>4;
 var $172=$171&1;
 var $173=(($172<<24)>>24)!=0;
 if($173){label=58;break;}else{label=39;break;}
 case 39: 
 var $175=$slot;
 var $176=$i1;
 _remove_dot($175,$176);
 var $177=$dot2;
 var $178=HEAP8[($177)];
 var $179=($178&255)>>>1;
 var $180=$179&3;
 var $181=($180&255);
 var $182=($181|0)==2;
 if($182){label=40;break;}else{label=41;break;}
 case 40: 
 var $203=1;label=45;break;
 case 41: 
 var $185=$dot2;
 var $186=HEAP8[($185)];
 var $187=($186&255)>>>1;
 var $188=$187&3;
 var $189=($188&255);
 var $190=($189|0)==1;
 if($190){label=42;break;}else{label=43;break;}
 case 42: 
 var $201=2;label=44;break;
 case 43: 
 var $193=$dot2;
 var $194=HEAP8[($193)];
 var $195=($194&255)>>>1;
 var $196=$195&3;
 var $197=($196&255);
 var $198=($197|0)==3;
 var $199=($198?0:3);
 var $201=$199;label=44;break;
 case 44: 
 var $201;
 var $203=$201;label=45;break;
 case 45: 
 var $203;
 $back3=$203;
 var $204=$x;
 var $205=$back3;
 var $206=($205|0)==2;
 if($206){label=46;break;}else{label=47;break;}
 case 46: 
 var $213=-1;label=48;break;
 case 47: 
 var $209=$back3;
 var $210=($209|0)==1;
 var $211=($210?1:0);
 var $213=$211;label=48;break;
 case 48: 
 var $213;
 var $214=((($204)+($213))|0);
 $x14=$214;
 var $215=$y;
 var $216=$back3;
 var $217=($216|0)==3;
 if($217){label=49;break;}else{label=50;break;}
 case 49: 
 var $224=-1;label=51;break;
 case 50: 
 var $220=$back3;
 var $221=($220|0)==0;
 var $222=($221?1:0);
 var $224=$222;label=51;break;
 case 51: 
 var $224;
 var $225=((($215)+($224))|0);
 $y15=$225;
 var $226=$x14;
 var $227=($226|0)>=0;
 if($227){label=52;break;}else{label=56;break;}
 case 52: 
 var $229=$x14;
 var $230=HEAP32[((2112)>>2)];
 var $231=($229|0)<($230|0);
 if($231){label=53;break;}else{label=56;break;}
 case 53: 
 var $233=$y15;
 var $234=($233|0)>=0;
 if($234){label=54;break;}else{label=56;break;}
 case 54: 
 var $236=$y15;
 var $237=HEAP32[((2192)>>2)];
 var $238=($236|0)<($237|0);
 if($238){label=55;break;}else{label=56;break;}
 case 55: 
 label=57;break;
 case 56: 
 _emscripten_run_script(904);
 label=57;break;
 case 57: 
 var $242=$dot2;
 var $243=HEAP8[($242)];
 var $244=$243&-33;
 var $245=$244|32;
 HEAP8[($242)]=$245;
 var $246=$x14;
 var $247=$y15;
 var $248=_get_slot($246,$247);
 _add_dot($248,$dot2);
 label=59;break;
 case 58: 
 var $250=$i1;
 var $251=((($250)+(1))|0);
 $i1=$251;
 label=59;break;
 case 59: 
 label=36;break;
 case 60: 
 label=61;break;
 case 61: 
 label=62;break;
 case 62: 
 label=63;break;
 case 63: 
 var $257=$slot;
 var $258=_Code_RB_NEXT($257);
 $slot=$258;
 label=2;break;
 case 64: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _is_normal_left($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $20=0;label=4;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>4;
 var $10=$9&1;
 var $11=(($10<<24)>>24)!=0;
 if($11){var $20=0;label=4;break;}else{label=3;break;}
 case 3: 
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)==2;
 var $20=$18;label=4;break;
 case 4: 
 var $20;
 var $21=($20&1);
 var $22=(($21)&255);
 STACKTOP=sp;return $22;
  default: assert(0, "bad label: " + label);
 }

}


function _is_normal_right($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $20=0;label=4;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>4;
 var $10=$9&1;
 var $11=(($10<<24)>>24)!=0;
 if($11){var $20=0;label=4;break;}else{label=3;break;}
 case 3: 
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)==1;
 var $20=$18;label=4;break;
 case 4: 
 var $20;
 var $21=($20&1);
 var $22=(($21)&255);
 STACKTOP=sp;return $22;
  default: assert(0, "bad label: " + label);
 }

}


function _is_normal_up($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $20=0;label=4;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>4;
 var $10=$9&1;
 var $11=(($10<<24)>>24)!=0;
 if($11){var $20=0;label=4;break;}else{label=3;break;}
 case 3: 
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)==3;
 var $20=$18;label=4;break;
 case 4: 
 var $20;
 var $21=($20&1);
 var $22=(($21)&255);
 STACKTOP=sp;return $22;
  default: assert(0, "bad label: " + label);
 }

}


function _is_normal_down($dot){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $dot; $dot=STACKTOP;STACKTOP = (STACKTOP + 1)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0);;;HEAP8[($dot)]=HEAP8[(tempParam)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$dot;
 var $2=HEAP8[($1)];
 var $3=($2&255)>>>5;
 var $4=$3&1;
 var $5=(($4<<24)>>24)!=0;
 if($5){var $20=0;label=4;break;}else{label=2;break;}
 case 2: 
 var $7=$dot;
 var $8=HEAP8[($7)];
 var $9=($8&255)>>>4;
 var $10=$9&1;
 var $11=(($10<<24)>>24)!=0;
 if($11){var $20=0;label=4;break;}else{label=3;break;}
 case 3: 
 var $13=$dot;
 var $14=HEAP8[($13)];
 var $15=($14&255)>>>1;
 var $16=$15&3;
 var $17=($16&255);
 var $18=($17|0)==0;
 var $20=$18;label=4;break;
 case 4: 
 var $20;
 var $21=($20&1);
 var $22=(($21)&255);
 STACKTOP=sp;return $22;
  default: assert(0, "bad label: " + label);
 }

}


function _handle_dot_collisions(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $slot;
 var $x;
 var $y;
 var $i;
 var $ii;
 var $x1;
 var $y1;
 var $slot1;
 var $dot0=sp;
 var $dot1=(sp)+(8);
 var $i1;
 var $dot02;
 var $dot13;
 var $dot04;
 var $dot15;
 var $i6;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=60;break;}
 case 3: 
 var $6=$slot;
 var $7=(($6+16)|0);
 var $8=HEAP32[(($7)>>2)];
 $x=$8;
 var $9=$slot;
 var $10=(($9+20)|0);
 var $11=HEAP32[(($10)>>2)];
 $y=$11;
 var $12=$slot;
 var $13=(($12+27)|0);
 var $14=HEAP8[($13)];
 var $15=($14&255);
 var $16=($15|0)==0;
 if($16){label=4;break;}else{label=5;break;}
 case 4: 
 label=59;break;
 case 5: 
 var $19=$slot;
 var $20=(($19+24)|0);
 var $21=(($20)|0);
 var $22=HEAP8[($21)];
 var $23=(($22<<24)>>24);
 var $24=($23|0)==0;
 if($24){label=6;break;}else{label=7;break;}
 case 6: 
 label=8;break;
 case 7: 
 _emscripten_run_script(824);
 label=8;break;
 case 8: 
 var $28=$slot;
 var $29=(($28+27)|0);
 var $30=HEAP8[($29)];
 var $31=($30&255);
 var $32=($31|0)>=2;
 if($32){label=9;break;}else{label=28;break;}
 case 9: 
 var $34=$slot;
 var $35=(($34+28)|0);
 var $36=(($35)|0);
 var $37=$dot0;
 var $38=$36;
 assert(1 % 1 === 0);HEAP8[($37)]=HEAP8[($38)];
 var $39=$slot;
 var $40=(($39+28)|0);
 var $41=(($40+1)|0);
 var $42=$dot1;
 var $43=$41;
 assert(1 % 1 === 0);HEAP8[($42)]=HEAP8[($43)];
 var $44=$slot;
 var $45=(($44+27)|0);
 var $46=HEAP8[($45)];
 var $47=($46&255);
 var $48=($47|0)==2;
 if($48){label=10;break;}else{label=22;break;}
 case 10: 
 var $50=$dot0;
 var $51=HEAP8[($50)];
 var $52=($51&255)>>>1;
 var $53=$52&3;
 var $54=($53&255);
 var $55=$dot1;
 var $56=HEAP8[($55)];
 var $57=($56&255)>>>1;
 var $58=$57&3;
 var $59=($58&255);
 var $60=($59|0)==2;
 if($60){label=11;break;}else{label=12;break;}
 case 11: 
 var $81=1;label=16;break;
 case 12: 
 var $63=$dot1;
 var $64=HEAP8[($63)];
 var $65=($64&255)>>>1;
 var $66=$65&3;
 var $67=($66&255);
 var $68=($67|0)==1;
 if($68){label=13;break;}else{label=14;break;}
 case 13: 
 var $79=2;label=15;break;
 case 14: 
 var $71=$dot1;
 var $72=HEAP8[($71)];
 var $73=($72&255)>>>1;
 var $74=$73&3;
 var $75=($74&255);
 var $76=($75|0)==3;
 var $77=($76?0:3);
 var $79=$77;label=15;break;
 case 15: 
 var $79;
 var $81=$79;label=16;break;
 case 16: 
 var $81;
 var $82=($54|0)==($81|0);
 if($82){label=17;break;}else{label=22;break;}
 case 17: 
 var $84=$dot0;
 var $85=HEAP8[($84)];
 var $86=($85&255)>>>5;
 var $87=$86&1;
 var $88=(($87<<24)>>24)!=0;
 if($88){label=20;break;}else{label=18;break;}
 case 18: 
 var $90=$dot1;
 var $91=HEAP8[($90)];
 var $92=($91&255)>>>5;
 var $93=$92&1;
 var $94=(($93<<24)>>24)!=0;
 if($94){label=20;break;}else{label=19;break;}
 case 19: 
 label=21;break;
 case 20: 
 _emscripten_run_script(744);
 label=21;break;
 case 21: 
 var $98=$dot0;
 var $99=HEAP8[($98)];
 var $100=$99&1;
 var $101=($100&255);
 var $102=$dot1;
 var $103=HEAP8[($102)];
 var $104=$103&1;
 var $105=($104&255);
 var $106=($101|0)==($105|0);
 var $107=($106&1);
 var $108=$slot;
 var $109=(($108+36)|0);
 var $110=HEAP8[($109)];
 var $111=(($110<<24)>>24);
 var $112=$111|$107;
 var $113=(($112)&255);
 HEAP8[($109)]=$113;
 label=23;break;
 case 22: 
 var $115=$slot;
 var $116=(($115+36)|0);
 HEAP8[($116)]=1;
 label=23;break;
 case 23: 
 $i1=0;
 label=24;break;
 case 24: 
 var $119=$i1;
 var $120=$slot;
 var $121=(($120+27)|0);
 var $122=HEAP8[($121)];
 var $123=($122&255);
 var $124=($119|0)<($123|0);
 if($124){label=25;break;}else{label=27;break;}
 case 25: 
 var $126=$i1;
 var $127=$slot;
 var $128=(($127+28)|0);
 var $129=(($128+$126)|0);
 var $130=$129;
 var $131=HEAP8[($130)];
 var $132=$131&-65;
 var $133=$132|64;
 HEAP8[($130)]=$133;
 label=26;break;
 case 26: 
 var $135=$i1;
 var $136=((($135)+(1))|0);
 $i1=$136;
 label=24;break;
 case 27: 
 label=28;break;
 case 28: 
 var $139=$x;
 var $140=((($139)+(1))|0);
 $x1=$140;
 var $141=$y;
 $y1=$141;
 var $142=$x1;
 var $143=($142|0)>=0;
 if($143){label=29;break;}else{label=33;break;}
 case 29: 
 var $145=$x1;
 var $146=HEAP32[((2112)>>2)];
 var $147=($145|0)<($146|0);
 if($147){label=30;break;}else{label=33;break;}
 case 30: 
 var $149=$y1;
 var $150=($149|0)>=0;
 if($150){label=31;break;}else{label=33;break;}
 case 31: 
 var $152=$y1;
 var $153=HEAP32[((2192)>>2)];
 var $154=($152|0)<($153|0);
 if($154){label=32;break;}else{label=33;break;}
 case 32: 
 var $156=$x1;
 var $157=$y1;
 var $158=_get_slot($156,$157);
 var $161=$158;label=34;break;
 case 33: 
 var $161=0;label=34;break;
 case 34: 
 var $161;
 $slot1=$161;
 var $162=$slot1;
 var $163=($162|0)!=0;
 if($163){label=35;break;}else{label=43;break;}
 case 35: 
 var $165=$slot;
 var $166=_find_dot($165,14);
 $i=$166;
 var $167=($166|0)!=-1;
 if($167){label=36;break;}else{label=43;break;}
 case 36: 
 var $169=$slot1;
 var $170=_find_dot($169,2);
 $ii=$170;
 var $171=($170|0)!=-1;
 if($171){label=37;break;}else{label=43;break;}
 case 37: 
 var $173=$i;
 var $174=$slot;
 var $175=(($174+28)|0);
 var $176=(($175+$173)|0);
 $dot02=$176;
 var $177=$ii;
 var $178=$slot1;
 var $179=(($178+28)|0);
 var $180=(($179+$177)|0);
 $dot13=$180;
 var $181=$dot02;
 var $182=$181;
 var $183=HEAP8[($182)];
 var $184=$183&1;
 var $185=($184&255);
 var $186=$dot13;
 var $187=$186;
 var $188=HEAP8[($187)];
 var $189=$188&1;
 var $190=($189&255);
 var $191=($185|0)==($190|0);
 if($191){label=38;break;}else{label=42;break;}
 case 38: 
 var $193=$dot02;
 var $194=$193;
 var $195=HEAP8[($194)];
 var $196=$195&1;
 var $197=(($196<<24)>>24)!=0;
 if($197){label=40;break;}else{label=39;break;}
 case 39: 
 var $199=$slot;
 var $203=$199;label=41;break;
 case 40: 
 var $201=$slot1;
 var $203=$201;label=41;break;
 case 41: 
 var $203;
 var $204=(($203+36)|0);
 HEAP8[($204)]=1;
 label=42;break;
 case 42: 
 var $206=$dot02;
 var $207=$206;
 var $208=HEAP8[($207)];
 var $209=$208&-65;
 var $210=$209|64;
 HEAP8[($207)]=$210;
 var $211=$dot13;
 var $212=$211;
 var $213=HEAP8[($212)];
 var $214=$213&-65;
 var $215=$214|64;
 HEAP8[($212)]=$215;
 label=43;break;
 case 43: 
 var $217=$x;
 $x1=$217;
 var $218=$y;
 var $219=((($218)+(1))|0);
 $y1=$219;
 var $220=$x1;
 var $221=($220|0)>=0;
 if($221){label=44;break;}else{label=48;break;}
 case 44: 
 var $223=$x1;
 var $224=HEAP32[((2112)>>2)];
 var $225=($223|0)<($224|0);
 if($225){label=45;break;}else{label=48;break;}
 case 45: 
 var $227=$y1;
 var $228=($227|0)>=0;
 if($228){label=46;break;}else{label=48;break;}
 case 46: 
 var $230=$y1;
 var $231=HEAP32[((2192)>>2)];
 var $232=($230|0)<($231|0);
 if($232){label=47;break;}else{label=48;break;}
 case 47: 
 var $234=$x1;
 var $235=$y1;
 var $236=_get_slot($234,$235);
 var $239=$236;label=49;break;
 case 48: 
 var $239=0;label=49;break;
 case 49: 
 var $239;
 $slot1=$239;
 var $240=$slot1;
 var $241=($240|0)!=0;
 if($241){label=50;break;}else{label=58;break;}
 case 50: 
 var $243=$slot;
 var $244=_find_dot($243,6);
 $i=$244;
 var $245=($244|0)!=-1;
 if($245){label=51;break;}else{label=58;break;}
 case 51: 
 var $247=$slot1;
 var $248=_find_dot($247,8);
 $ii=$248;
 var $249=($248|0)!=-1;
 if($249){label=52;break;}else{label=58;break;}
 case 52: 
 var $251=$i;
 var $252=$slot;
 var $253=(($252+28)|0);
 var $254=(($253+$251)|0);
 $dot04=$254;
 var $255=$ii;
 var $256=$slot1;
 var $257=(($256+28)|0);
 var $258=(($257+$255)|0);
 $dot15=$258;
 var $259=$dot04;
 var $260=$259;
 var $261=HEAP8[($260)];
 var $262=$261&1;
 var $263=($262&255);
 var $264=$dot15;
 var $265=$264;
 var $266=HEAP8[($265)];
 var $267=$266&1;
 var $268=($267&255);
 var $269=($263|0)==($268|0);
 if($269){label=53;break;}else{label=57;break;}
 case 53: 
 var $271=$dot04;
 var $272=$271;
 var $273=HEAP8[($272)];
 var $274=$273&1;
 var $275=(($274<<24)>>24)!=0;
 if($275){label=55;break;}else{label=54;break;}
 case 54: 
 var $277=$slot;
 var $281=$277;label=56;break;
 case 55: 
 var $279=$slot1;
 var $281=$279;label=56;break;
 case 56: 
 var $281;
 var $282=(($281+36)|0);
 HEAP8[($282)]=1;
 label=57;break;
 case 57: 
 var $284=$dot04;
 var $285=$284;
 var $286=HEAP8[($285)];
 var $287=$286&-65;
 var $288=$287|64;
 HEAP8[($285)]=$288;
 var $289=$dot15;
 var $290=$289;
 var $291=HEAP8[($290)];
 var $292=$291&-65;
 var $293=$292|64;
 HEAP8[($290)]=$293;
 label=58;break;
 case 58: 
 label=59;break;
 case 59: 
 var $296=$slot;
 var $297=_Code_RB_NEXT($296);
 $slot=$297;
 label=2;break;
 case 60: 
 var $299=_Code_RB_MINMAX(3272,-1);
 $slot=$299;
 label=61;break;
 case 61: 
 var $301=$slot;
 var $302=($301|0)!=0;
 if($302){label=62;break;}else{label=82;break;}
 case 62: 
 $i6=0;
 label=63;break;
 case 63: 
 var $305=$i6;
 var $306=$slot;
 var $307=(($306+27)|0);
 var $308=HEAP8[($307)];
 var $309=($308&255);
 var $310=($305|0)<($309|0);
 if($310){label=64;break;}else{label=68;break;}
 case 64: 
 var $312=$i6;
 var $313=$slot;
 var $314=(($313+28)|0);
 var $315=(($314+$312)|0);
 var $316=$315;
 var $317=HEAP8[($316)];
 var $318=($317&255)>>>6;
 var $319=$318&1;
 var $320=(($319<<24)>>24)!=0;
 if($320){label=65;break;}else{label=66;break;}
 case 65: 
 var $322=$slot;
 var $323=$i6;
 _remove_dot($322,$323);
 label=67;break;
 case 66: 
 var $325=$i6;
 var $326=((($325)+(1))|0);
 $i6=$326;
 label=67;break;
 case 67: 
 label=63;break;
 case 68: 
 var $329=$slot;
 var $330=(($329+36)|0);
 var $331=HEAP8[($330)];
 var $332=(($331<<24)>>24)!=0;
 if($332){label=69;break;}else{label=73;break;}
 case 69: 
 var $334=$slot;
 var $335=(($334+24)|0);
 var $336=(($335)|0);
 var $337=HEAP8[($336)];
 var $338=(($337<<24)>>24);
 var $339=($338|0)==0;
 if($339){label=70;break;}else{label=71;break;}
 case 70: 
 label=72;break;
 case 71: 
 _emscripten_run_script(664);
 label=72;break;
 case 72: 
 var $343=$slot;
 var $344=(($343+24)|0);
 var $345=(($344)|0);
 HEAP8[($345)]=35;
 var $346=$slot;
 var $347=(($346+36)|0);
 HEAP8[($347)]=0;
 label=73;break;
 case 73: 
 var $349=$slot;
 var $350=(($349+27)|0);
 var $351=HEAP8[($350)];
 var $352=($351&255);
 var $353=($352|0)<=1;
 if($353){label=74;break;}else{label=75;break;}
 case 74: 
 label=76;break;
 case 75: 
 _emscripten_run_script(584);
 label=76;break;
 case 76: 
 var $357=$slot;
 var $358=(($357+24)|0);
 var $359=(($358)|0);
 var $360=HEAP8[($359)];
 var $361=(($360<<24)>>24);
 var $362=($361|0)!=0;
 if($362){label=77;break;}else{label=78;break;}
 case 77: 
 var $364=$slot;
 var $365=(($364+27)|0);
 var $366=HEAP8[($365)];
 var $367=($366&255);
 var $368=($367|0)!=0;
 if($368){label=79;break;}else{label=78;break;}
 case 78: 
 label=80;break;
 case 79: 
 _emscripten_run_script(504);
 label=80;break;
 case 80: 
 label=81;break;
 case 81: 
 var $373=$slot;
 var $374=_Code_RB_NEXT($373);
 $slot=$374;
 label=61;break;
 case 82: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _cleanup(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $slot;
 var $next;
 var $rem;
 var $dot;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=19;break;}
 case 3: 
 var $6=$slot;
 var $7=_Code_RB_NEXT($6);
 $next=$7;
 var $8=$slot;
 var $9=(($8+24)|0);
 var $10=(($9)|0);
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24);
 var $13=($12|0)==0;
 if($13){label=4;break;}else{label=9;break;}
 case 4: 
 var $15=$slot;
 var $16=(($15+27)|0);
 var $17=HEAP8[($16)];
 var $18=($17&255);
 var $19=($18|0)==0;
 if($19){label=5;break;}else{label=9;break;}
 case 5: 
 var $21=$slot;
 var $22=_Code_RB_REMOVE(3272,$21);
 $rem=$22;
 var $23=$rem;
 var $24=$slot;
 var $25=($23|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 label=8;break;
 case 7: 
 _emscripten_run_script(424);
 label=8;break;
 case 8: 
 var $29=$slot;
 var $30=$29;
 _free($30);
 label=18;break;
 case 9: 
 var $32=$slot;
 var $33=(($32+27)|0);
 var $34=HEAP8[($33)];
 var $35=($34&255);
 var $36=($35|0)!=0;
 if($36){label=10;break;}else{label=17;break;}
 case 10: 
 var $38=$slot;
 var $39=(($38+27)|0);
 var $40=HEAP8[($39)];
 var $41=($40&255);
 var $42=($41|0)==1;
 if($42){label=11;break;}else{label=12;break;}
 case 11: 
 label=13;break;
 case 12: 
 _emscripten_run_script(344);
 label=13;break;
 case 13: 
 var $46=$slot;
 var $47=(($46+28)|0);
 var $48=(($47)|0);
 $dot=$48;
 var $49=$dot;
 var $50=$49;
 var $51=HEAP8[($50)];
 var $52=$51&-9;
 HEAP8[($50)]=$52;
 var $53=$dot;
 var $54=$53;
 var $55=HEAP8[($54)];
 var $56=$55&-33;
 HEAP8[($54)]=$56;
 var $57=$dot;
 var $58=$57;
 var $59=HEAP8[($58)];
 var $60=$59&-17;
 HEAP8[($58)]=$60;
 var $61=$dot;
 var $62=$61;
 var $63=HEAP8[($62)];
 var $64=($63&255)>>>6;
 var $65=$64&1;
 var $66=(($65<<24)>>24)!=0;
 if($66){label=15;break;}else{label=14;break;}
 case 14: 
 label=16;break;
 case 15: 
 _emscripten_run_script(264);
 label=16;break;
 case 16: 
 label=17;break;
 case 17: 
 label=18;break;
 case 18: 
 var $72=$next;
 $slot=$72;
 label=2;break;
 case 19: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _delete_code(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $slot;
 var $next;
 var $rem;
 var $1=_Code_RB_MINMAX(3272,-1);
 $slot=$1;
 label=2;break;
 case 2: 
 var $3=$slot;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=7;break;}
 case 3: 
 var $6=$slot;
 var $7=_Code_RB_NEXT($6);
 $next=$7;
 var $8=$slot;
 var $9=_Code_RB_REMOVE(3272,$8);
 $rem=$9;
 var $10=$rem;
 var $11=$slot;
 var $12=($10|0)==($11|0);
 if($12){label=4;break;}else{label=5;break;}
 case 4: 
 label=6;break;
 case 5: 
 _emscripten_run_script(184);
 label=6;break;
 case 6: 
 var $16=$slot;
 var $17=$16;
 _free($17);
 var $18=$next;
 $slot=$18;
 label=2;break;
 case 7: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _step(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2=HEAP32[((2120)>>2)];
 var $3=($2|0)!=1;
 if($3){label=2;break;}else{label=3;break;}
 case 2: 
 $1=0;
 label=9;break;
 case 3: 
 _move_dots();
 var $6=_execute_commands();
 var $7=(($6<<24)>>24)!=0;
 if($7){label=5;break;}else{label=4;break;}
 case 4: 
 $1=0;
 label=9;break;
 case 5: 
 _handle_dot_collisions();
 _cleanup();
 var $10=HEAP32[((2224)>>2)];
 var $11=((($10)+(1))|0);
 HEAP32[((2224)>>2)]=$11;
 var $12=HEAP32[((2160)>>2)];
 var $13=($12|0)==0;
 if($13){label=7;break;}else{label=6;break;}
 case 6: 
 var $15=HEAP8[(2168)];
 var $16=(($15<<24)>>24);
 var $17=($16|0)!=0;
 if($17){label=7;break;}else{var $22=0;label=8;break;}
 case 7: 
 var $19=_dot_count();
 var $20=($19|0)==0;
 var $22=$20;label=8;break;
 case 8: 
 var $22;
 var $23=($22?2:1);
 HEAP32[((2120)>>2)]=$23;
 var $24=HEAP32[((2120)>>2)];
 var $25=($24|0)==1;
 var $26=($25&1);
 var $27=(($26)&255);
 $1=$27;
 label=9;break;
 case 9: 
 var $29=$1;
 STACKTOP=sp;return $29;
  default: assert(0, "bad label: " + label);
 }

}
Module["_step"] = _step;

function _replace($agg_result,$src,$srclen,$b,$repl){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $i;
 var $5=sp;
 var $replen;
 var $dstlen;
 var $dst;
 var $6=(sp)+(8);
 $1=$src;
 $2=$srclen;
 $3=$b;
 $4=$repl;
 $i=0;
 label=2;break;
 case 2: 
 var $8=$i;
 var $9=$2;
 var $10=($8|0)<($9|0);
 if($10){label=3;break;}else{label=7;break;}
 case 3: 
 var $12=$i;
 var $13=$1;
 var $14=(($13+$12)|0);
 var $15=HEAP8[($14)];
 var $16=($15&255);
 var $17=$3;
 var $18=($17&255);
 var $19=($16|0)==($18|0);
 if($19){label=4;break;}else{label=5;break;}
 case 4: 
 label=7;break;
 case 5: 
 label=6;break;
 case 6: 
 var $23=$i;
 var $24=((($23)+(1))|0);
 $i=$24;
 label=2;break;
 case 7: 
 var $26=$i;
 var $27=$2;
 var $28=($26|0)==($27|0);
 if($28){label=8;break;}else{label=9;break;}
 case 8: 
 var $30=(($5)|0);
 var $31=$1;
 HEAP32[(($30)>>2)]=$31;
 var $32=(($5+4)|0);
 var $33=$2;
 HEAP32[(($32)>>2)]=$33;
 var $34=$agg_result;
 var $35=$5;
 assert(8 % 1 === 0);HEAP32[(($34)>>2)]=HEAP32[(($35)>>2)];HEAP32[((($34)+(4))>>2)]=HEAP32[((($35)+(4))>>2)];
 label=10;break;
 case 9: 
 var $37=$4;
 var $38=_strlen($37);
 $replen=$38;
 var $39=$2;
 var $40=((($39)-(1))|0);
 var $41=$replen;
 var $42=((($40)+($41))|0);
 $dstlen=$42;
 var $43=$dstlen;
 var $44=_malloc($43);
 $dst=$44;
 var $45=$dst;
 var $46=$1;
 var $47=$i;
 assert($47 % 1 === 0);(_memcpy($45, $46, $47)|0);
 var $48=$dst;
 var $49=$i;
 var $50=(($48+$49)|0);
 var $51=$4;
 var $52=$replen;
 assert($52 % 1 === 0);(_memcpy($50, $51, $52)|0);
 var $53=$dst;
 var $54=$i;
 var $55=(($53+$54)|0);
 var $56=$replen;
 var $57=(($55+$56)|0);
 var $58=$1;
 var $59=$i;
 var $60=(($58+$59)|0);
 var $61=(($60+1)|0);
 var $62=$2;
 var $63=$i;
 var $64=((($62)-($63))|0);
 var $65=((($64)-(1))|0);
 assert($65 % 1 === 0);(_memcpy($57, $61, $65)|0);
 var $66=(($6)|0);
 var $67=$dst;
 HEAP32[(($66)>>2)]=$67;
 var $68=(($6+4)|0);
 var $69=$dstlen;
 HEAP32[(($68)>>2)]=$69;
 var $70=$agg_result;
 var $71=$6;
 assert(8 % 1 === 0);HEAP32[(($70)>>2)]=HEAP32[(($71)>>2)];HEAP32[((($70)+(4))>>2)]=HEAP32[((($71)+(4))>>2)];
 label=10;break;
 case 10: 
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _replace_all($agg_result,$src,$srclen,$b,$repl){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1;
 var $2;
 var $3;
 var $4;
 var $dst=sp;
 $1=$src;
 $2=$srclen;
 $3=$b;
 $4=$repl;
 var $5=$1;
 var $6=$2;
 var $7=_memdup($5,$6);
 $1=$7;
 label=2;break;
 case 2: 
 var $9=$1;
 var $10=$2;
 var $11=$3;
 var $12=$4;
 _replace($dst,$9,$10,$11,$12);
 var $13=(($dst)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=$1;
 var $16=($14|0)==($15|0);
 if($16){label=3;break;}else{label=4;break;}
 case 3: 
 var $18=$agg_result;
 var $19=$dst;
 assert(8 % 1 === 0);HEAP32[(($18)>>2)]=HEAP32[(($19)>>2)];HEAP32[((($18)+(4))>>2)]=HEAP32[((($19)+(4))>>2)];
 STACKTOP=sp;return;
 case 4: 
 var $21=$1;
 _free($21);
 var $22=(($dst)|0);
 var $23=HEAP32[(($22)>>2)];
 $1=$23;
 var $24=(($dst+4)|0);
 var $25=HEAP32[(($24)>>2)];
 $2=$25;
 label=2;break;
  default: assert(0, "bad label: " + label);
 }

}


function _memdup($ptr,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $ret;
 $1=$ptr;
 $2=$size;
 var $3=$2;
 var $4=_malloc($3);
 $ret=$4;
 var $5=$ret;
 var $6=$1;
 var $7=$2;
 assert($7 % 1 === 0);(_memcpy($5, $6, $7)|0);
 var $8=$ret;
 STACKTOP=sp;return $8;
}


function _clear_input_buffer(){
 var label=0;


 HEAP8[(2176)]=0;
 HEAP32[((2184)>>2)]=0;
 return;
}


function _dobweb_getchar(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1=_emscripten_asm_const_int(144);
 STACKTOP=sp;return $1;
}


function _malloc($bytes){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2: 
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3: 
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4: 
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((3288)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5: 
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((3328+($18<<2))|0);
 var $20=$19;
 var $_sum111=((($18)+(2))|0);
 var $21=((3328+($_sum111<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((3288)>>2)]=$29;
 label=11;break;
 case 7: 
 var $31=$24;
 var $32=HEAP32[((3304)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8: 
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10: 
 _abort();
 throw "Reached an unreachable!";
 case 11: 
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum113114=$40|4;
 var $44=(($43+$_sum113114)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=341;break;
 case 12: 
 var $50=HEAP32[((3296)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=160;break;}
 case 13: 
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14: 
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((3328+($83<<2))|0);
 var $85=$84;
 var $_sum104=((($83)+(2))|0);
 var $86=((3328+($_sum104<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15: 
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((3288)>>2)]=$94;
 label=20;break;
 case 16: 
 var $96=$89;
 var $97=HEAP32[((3304)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17: 
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18: 
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 label=20;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 var $105=$82<<3;
 var $106=((($105)-($8))|0);
 var $107=$8|3;
 var $108=(($87+4)|0);
 HEAP32[(($108)>>2)]=$107;
 var $109=$87;
 var $110=(($109+$8)|0);
 var $111=$110;
 var $112=$106|1;
 var $_sum106107=$8|4;
 var $113=(($109+$_sum106107)|0);
 var $114=$113;
 HEAP32[(($114)>>2)]=$112;
 var $115=(($109+$105)|0);
 var $116=$115;
 HEAP32[(($116)>>2)]=$106;
 var $117=HEAP32[((3296)>>2)];
 var $118=($117|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21: 
 var $120=HEAP32[((3308)>>2)];
 var $121=$117>>>3;
 var $122=$121<<1;
 var $123=((3328+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((3288)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22: 
 var $130=$125|$126;
 HEAP32[((3288)>>2)]=$130;
 var $_sum109_pre=((($122)+(2))|0);
 var $_pre=((3328+($_sum109_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre;label=25;break;
 case 23: 
 var $_sum110=((($122)+(2))|0);
 var $132=((3328+($_sum110<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((3304)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24: 
 _abort();
 throw "Reached an unreachable!";
 case 25: 
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26: 
 HEAP32[((3296)>>2)]=$106;
 HEAP32[((3308)>>2)]=$111;
 var $143=$88;
 var $mem_0=$143;label=341;break;
 case 27: 
 var $145=HEAP32[((3292)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=160;break;}else{label=28;break;}
 case 28: 
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((3592+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29: 
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30: 
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31: 
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32: 
 var $192=$v_0_i;
 var $193=HEAP32[((3304)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33: 
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34: 
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35: 
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36: 
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37: 
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38: 
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41: 
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42: 
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43: 
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44: 
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46: 
 _abort();
 throw "Reached an unreachable!";
 case 47: 
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48: 
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((3592+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49: 
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50: 
 var $248=1<<$243;
 var $249=$248^-1;
 var $250=HEAP32[((3292)>>2)];
 var $251=$250&$249;
 HEAP32[((3292)>>2)]=$251;
 label=67;break;
 case 51: 
 var $253=$201;
 var $254=HEAP32[((3304)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=55;break;}else{label=52;break;}
 case 52: 
 var $257=(($201+16)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($v_0_i|0);
 if($259){label=53;break;}else{label=54;break;}
 case 53: 
 HEAP32[(($257)>>2)]=$R_1_i;
 label=56;break;
 case 54: 
 var $262=(($201+20)|0);
 HEAP32[(($262)>>2)]=$R_1_i;
 label=56;break;
 case 55: 
 _abort();
 throw "Reached an unreachable!";
 case 56: 
 var $265=($R_1_i|0)==0;
 if($265){label=67;break;}else{label=57;break;}
 case 57: 
 var $267=$R_1_i;
 var $268=HEAP32[((3304)>>2)];
 var $269=($267>>>0)<($268>>>0);
 if($269){label=66;break;}else{label=58;break;}
 case 58: 
 var $271=(($R_1_i+24)|0);
 HEAP32[(($271)>>2)]=$201;
 var $272=(($v_0_i+16)|0);
 var $273=HEAP32[(($272)>>2)];
 var $274=($273|0)==0;
 if($274){label=62;break;}else{label=59;break;}
 case 59: 
 var $276=$273;
 var $277=HEAP32[((3304)>>2)];
 var $278=($276>>>0)<($277>>>0);
 if($278){label=61;break;}else{label=60;break;}
 case 60: 
 var $280=(($R_1_i+16)|0);
 HEAP32[(($280)>>2)]=$273;
 var $281=(($273+24)|0);
 HEAP32[(($281)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $284=(($v_0_i+20)|0);
 var $285=HEAP32[(($284)>>2)];
 var $286=($285|0)==0;
 if($286){label=67;break;}else{label=63;break;}
 case 63: 
 var $288=$285;
 var $289=HEAP32[((3304)>>2)];
 var $290=($288>>>0)<($289>>>0);
 if($290){label=65;break;}else{label=64;break;}
 case 64: 
 var $292=(($R_1_i+20)|0);
 HEAP32[(($292)>>2)]=$285;
 var $293=(($285+24)|0);
 HEAP32[(($293)>>2)]=$R_1_i;
 label=67;break;
 case 65: 
 _abort();
 throw "Reached an unreachable!";
 case 66: 
 _abort();
 throw "Reached an unreachable!";
 case 67: 
 var $297=($rsize_0_i>>>0)<16;
 if($297){label=68;break;}else{label=69;break;}
 case 68: 
 var $299=((($rsize_0_i)+($8))|0);
 var $300=$299|3;
 var $301=(($v_0_i+4)|0);
 HEAP32[(($301)>>2)]=$300;
 var $_sum4_i=((($299)+(4))|0);
 var $302=(($192+$_sum4_i)|0);
 var $303=$302;
 var $304=HEAP32[(($303)>>2)];
 var $305=$304|1;
 HEAP32[(($303)>>2)]=$305;
 label=77;break;
 case 69: 
 var $307=$8|3;
 var $308=(($v_0_i+4)|0);
 HEAP32[(($308)>>2)]=$307;
 var $309=$rsize_0_i|1;
 var $_sum_i137=$8|4;
 var $310=(($192+$_sum_i137)|0);
 var $311=$310;
 HEAP32[(($311)>>2)]=$309;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $312=(($192+$_sum1_i)|0);
 var $313=$312;
 HEAP32[(($313)>>2)]=$rsize_0_i;
 var $314=HEAP32[((3296)>>2)];
 var $315=($314|0)==0;
 if($315){label=75;break;}else{label=70;break;}
 case 70: 
 var $317=HEAP32[((3308)>>2)];
 var $318=$314>>>3;
 var $319=$318<<1;
 var $320=((3328+($319<<2))|0);
 var $321=$320;
 var $322=HEAP32[((3288)>>2)];
 var $323=1<<$318;
 var $324=$322&$323;
 var $325=($324|0)==0;
 if($325){label=71;break;}else{label=72;break;}
 case 71: 
 var $327=$322|$323;
 HEAP32[((3288)>>2)]=$327;
 var $_sum2_pre_i=((($319)+(2))|0);
 var $_pre_i=((3328+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$321;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72: 
 var $_sum3_i=((($319)+(2))|0);
 var $329=((3328+($_sum3_i<<2))|0);
 var $330=HEAP32[(($329)>>2)];
 var $331=$330;
 var $332=HEAP32[((3304)>>2)];
 var $333=($331>>>0)<($332>>>0);
 if($333){label=73;break;}else{var $F1_0_i=$330;var $_pre_phi_i=$329;label=74;break;}
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$317;
 var $336=(($F1_0_i+12)|0);
 HEAP32[(($336)>>2)]=$317;
 var $337=(($317+8)|0);
 HEAP32[(($337)>>2)]=$F1_0_i;
 var $338=(($317+12)|0);
 HEAP32[(($338)>>2)]=$321;
 label=75;break;
 case 75: 
 HEAP32[((3296)>>2)]=$rsize_0_i;
 HEAP32[((3308)>>2)]=$197;
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $341=(($v_0_i+8)|0);
 var $342=$341;
 var $343=($341|0)==0;
 if($343){var $nb_0=$8;label=160;break;}else{var $mem_0=$342;label=341;break;}
 case 78: 
 var $345=($bytes>>>0)>4294967231;
 if($345){var $nb_0=-1;label=160;break;}else{label=79;break;}
 case 79: 
 var $347=((($bytes)+(11))|0);
 var $348=$347&-8;
 var $349=HEAP32[((3292)>>2)];
 var $350=($349|0)==0;
 if($350){var $nb_0=$348;label=160;break;}else{label=80;break;}
 case 80: 
 var $352=(((-$348))|0);
 var $353=$347>>>8;
 var $354=($353|0)==0;
 if($354){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81: 
 var $356=($348>>>0)>16777215;
 if($356){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82: 
 var $358=((($353)+(1048320))|0);
 var $359=$358>>>16;
 var $360=$359&8;
 var $361=$353<<$360;
 var $362=((($361)+(520192))|0);
 var $363=$362>>>16;
 var $364=$363&4;
 var $365=$364|$360;
 var $366=$361<<$364;
 var $367=((($366)+(245760))|0);
 var $368=$367>>>16;
 var $369=$368&2;
 var $370=$365|$369;
 var $371=(((14)-($370))|0);
 var $372=$366<<$369;
 var $373=$372>>>15;
 var $374=((($371)+($373))|0);
 var $375=$374<<1;
 var $376=((($374)+(7))|0);
 var $377=$348>>>($376>>>0);
 var $378=$377&1;
 var $379=$378|$375;
 var $idx_0_i=$379;label=83;break;
 case 83: 
 var $idx_0_i;
 var $381=((3592+($idx_0_i<<2))|0);
 var $382=HEAP32[(($381)>>2)];
 var $383=($382|0)==0;
 if($383){var $v_2_i=0;var $rsize_2_i=$352;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84: 
 var $385=($idx_0_i|0)==31;
 if($385){var $390=0;label=86;break;}else{label=85;break;}
 case 85: 
 var $387=$idx_0_i>>>1;
 var $388=(((25)-($387))|0);
 var $390=$388;label=86;break;
 case 86: 
 var $390;
 var $391=$348<<$390;
 var $v_0_i118=0;var $rsize_0_i117=$352;var $t_0_i116=$382;var $sizebits_0_i=$391;var $rst_0_i=0;label=87;break;
 case 87: 
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i116;
 var $rsize_0_i117;
 var $v_0_i118;
 var $393=(($t_0_i116+4)|0);
 var $394=HEAP32[(($393)>>2)];
 var $395=$394&-8;
 var $396=((($395)-($348))|0);
 var $397=($396>>>0)<($rsize_0_i117>>>0);
 if($397){label=88;break;}else{var $v_1_i=$v_0_i118;var $rsize_1_i=$rsize_0_i117;label=89;break;}
 case 88: 
 var $399=($395|0)==($348|0);
 if($399){var $v_2_i=$t_0_i116;var $rsize_2_i=$396;var $t_1_i=$t_0_i116;label=90;break;}else{var $v_1_i=$t_0_i116;var $rsize_1_i=$396;label=89;break;}
 case 89: 
 var $rsize_1_i;
 var $v_1_i;
 var $401=(($t_0_i116+20)|0);
 var $402=HEAP32[(($401)>>2)];
 var $403=$sizebits_0_i>>>31;
 var $404=(($t_0_i116+16+($403<<2))|0);
 var $405=HEAP32[(($404)>>2)];
 var $406=($402|0)==0;
 var $407=($402|0)==($405|0);
 var $or_cond_i=$406|$407;
 var $rst_1_i=($or_cond_i?$rst_0_i:$402);
 var $408=($405|0)==0;
 var $409=$sizebits_0_i<<1;
 if($408){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i118=$v_1_i;var $rsize_0_i117=$rsize_1_i;var $t_0_i116=$405;var $sizebits_0_i=$409;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90: 
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $410=($t_1_i|0)==0;
 var $411=($v_2_i|0)==0;
 var $or_cond21_i=$410&$411;
 if($or_cond21_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91: 
 var $413=2<<$idx_0_i;
 var $414=(((-$413))|0);
 var $415=$413|$414;
 var $416=$349&$415;
 var $417=($416|0)==0;
 if($417){var $nb_0=$348;label=160;break;}else{label=92;break;}
 case 92: 
 var $419=(((-$416))|0);
 var $420=$416&$419;
 var $421=((($420)-(1))|0);
 var $422=$421>>>12;
 var $423=$422&16;
 var $424=$421>>>($423>>>0);
 var $425=$424>>>5;
 var $426=$425&8;
 var $427=$426|$423;
 var $428=$424>>>($426>>>0);
 var $429=$428>>>2;
 var $430=$429&4;
 var $431=$427|$430;
 var $432=$428>>>($430>>>0);
 var $433=$432>>>1;
 var $434=$433&2;
 var $435=$431|$434;
 var $436=$432>>>($434>>>0);
 var $437=$436>>>1;
 var $438=$437&1;
 var $439=$435|$438;
 var $440=$436>>>($438>>>0);
 var $441=((($439)+($440))|0);
 var $442=((3592+($441<<2))|0);
 var $443=HEAP32[(($442)>>2)];
 var $t_2_ph_i=$443;label=93;break;
 case 93: 
 var $t_2_ph_i;
 var $444=($t_2_ph_i|0)==0;
 if($444){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_228_i=$t_2_ph_i;var $rsize_329_i=$rsize_2_i;var $v_330_i=$v_2_i;label=94;break;}
 case 94: 
 var $v_330_i;
 var $rsize_329_i;
 var $t_228_i;
 var $445=(($t_228_i+4)|0);
 var $446=HEAP32[(($445)>>2)];
 var $447=$446&-8;
 var $448=((($447)-($348))|0);
 var $449=($448>>>0)<($rsize_329_i>>>0);
 var $_rsize_3_i=($449?$448:$rsize_329_i);
 var $t_2_v_3_i=($449?$t_228_i:$v_330_i);
 var $450=(($t_228_i+16)|0);
 var $451=HEAP32[(($450)>>2)];
 var $452=($451|0)==0;
 if($452){label=95;break;}else{var $t_228_i=$451;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 95: 
 var $453=(($t_228_i+20)|0);
 var $454=HEAP32[(($453)>>2)];
 var $455=($454|0)==0;
 if($455){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_228_i=$454;var $rsize_329_i=$_rsize_3_i;var $v_330_i=$t_2_v_3_i;label=94;break;}
 case 96: 
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $456=($v_3_lcssa_i|0)==0;
 if($456){var $nb_0=$348;label=160;break;}else{label=97;break;}
 case 97: 
 var $458=HEAP32[((3296)>>2)];
 var $459=((($458)-($348))|0);
 var $460=($rsize_3_lcssa_i>>>0)<($459>>>0);
 if($460){label=98;break;}else{var $nb_0=$348;label=160;break;}
 case 98: 
 var $462=$v_3_lcssa_i;
 var $463=HEAP32[((3304)>>2)];
 var $464=($462>>>0)<($463>>>0);
 if($464){label=158;break;}else{label=99;break;}
 case 99: 
 var $466=(($462+$348)|0);
 var $467=$466;
 var $468=($462>>>0)<($466>>>0);
 if($468){label=100;break;}else{label=158;break;}
 case 100: 
 var $470=(($v_3_lcssa_i+24)|0);
 var $471=HEAP32[(($470)>>2)];
 var $472=(($v_3_lcssa_i+12)|0);
 var $473=HEAP32[(($472)>>2)];
 var $474=($473|0)==($v_3_lcssa_i|0);
 if($474){label=106;break;}else{label=101;break;}
 case 101: 
 var $476=(($v_3_lcssa_i+8)|0);
 var $477=HEAP32[(($476)>>2)];
 var $478=$477;
 var $479=($478>>>0)<($463>>>0);
 if($479){label=105;break;}else{label=102;break;}
 case 102: 
 var $481=(($477+12)|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=($482|0)==($v_3_lcssa_i|0);
 if($483){label=103;break;}else{label=105;break;}
 case 103: 
 var $485=(($473+8)|0);
 var $486=HEAP32[(($485)>>2)];
 var $487=($486|0)==($v_3_lcssa_i|0);
 if($487){label=104;break;}else{label=105;break;}
 case 104: 
 HEAP32[(($481)>>2)]=$473;
 HEAP32[(($485)>>2)]=$477;
 var $R_1_i122=$473;label=113;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 var $490=(($v_3_lcssa_i+20)|0);
 var $491=HEAP32[(($490)>>2)];
 var $492=($491|0)==0;
 if($492){label=107;break;}else{var $R_0_i120=$491;var $RP_0_i119=$490;label=108;break;}
 case 107: 
 var $494=(($v_3_lcssa_i+16)|0);
 var $495=HEAP32[(($494)>>2)];
 var $496=($495|0)==0;
 if($496){var $R_1_i122=0;label=113;break;}else{var $R_0_i120=$495;var $RP_0_i119=$494;label=108;break;}
 case 108: 
 var $RP_0_i119;
 var $R_0_i120;
 var $497=(($R_0_i120+20)|0);
 var $498=HEAP32[(($497)>>2)];
 var $499=($498|0)==0;
 if($499){label=109;break;}else{var $R_0_i120=$498;var $RP_0_i119=$497;label=108;break;}
 case 109: 
 var $501=(($R_0_i120+16)|0);
 var $502=HEAP32[(($501)>>2)];
 var $503=($502|0)==0;
 if($503){label=110;break;}else{var $R_0_i120=$502;var $RP_0_i119=$501;label=108;break;}
 case 110: 
 var $505=$RP_0_i119;
 var $506=($505>>>0)<($463>>>0);
 if($506){label=112;break;}else{label=111;break;}
 case 111: 
 HEAP32[(($RP_0_i119)>>2)]=0;
 var $R_1_i122=$R_0_i120;label=113;break;
 case 112: 
 _abort();
 throw "Reached an unreachable!";
 case 113: 
 var $R_1_i122;
 var $510=($471|0)==0;
 if($510){label=133;break;}else{label=114;break;}
 case 114: 
 var $512=(($v_3_lcssa_i+28)|0);
 var $513=HEAP32[(($512)>>2)];
 var $514=((3592+($513<<2))|0);
 var $515=HEAP32[(($514)>>2)];
 var $516=($v_3_lcssa_i|0)==($515|0);
 if($516){label=115;break;}else{label=117;break;}
 case 115: 
 HEAP32[(($514)>>2)]=$R_1_i122;
 var $cond_i123=($R_1_i122|0)==0;
 if($cond_i123){label=116;break;}else{label=123;break;}
 case 116: 
 var $518=1<<$513;
 var $519=$518^-1;
 var $520=HEAP32[((3292)>>2)];
 var $521=$520&$519;
 HEAP32[((3292)>>2)]=$521;
 label=133;break;
 case 117: 
 var $523=$471;
 var $524=HEAP32[((3304)>>2)];
 var $525=($523>>>0)<($524>>>0);
 if($525){label=121;break;}else{label=118;break;}
 case 118: 
 var $527=(($471+16)|0);
 var $528=HEAP32[(($527)>>2)];
 var $529=($528|0)==($v_3_lcssa_i|0);
 if($529){label=119;break;}else{label=120;break;}
 case 119: 
 HEAP32[(($527)>>2)]=$R_1_i122;
 label=122;break;
 case 120: 
 var $532=(($471+20)|0);
 HEAP32[(($532)>>2)]=$R_1_i122;
 label=122;break;
 case 121: 
 _abort();
 throw "Reached an unreachable!";
 case 122: 
 var $535=($R_1_i122|0)==0;
 if($535){label=133;break;}else{label=123;break;}
 case 123: 
 var $537=$R_1_i122;
 var $538=HEAP32[((3304)>>2)];
 var $539=($537>>>0)<($538>>>0);
 if($539){label=132;break;}else{label=124;break;}
 case 124: 
 var $541=(($R_1_i122+24)|0);
 HEAP32[(($541)>>2)]=$471;
 var $542=(($v_3_lcssa_i+16)|0);
 var $543=HEAP32[(($542)>>2)];
 var $544=($543|0)==0;
 if($544){label=128;break;}else{label=125;break;}
 case 125: 
 var $546=$543;
 var $547=HEAP32[((3304)>>2)];
 var $548=($546>>>0)<($547>>>0);
 if($548){label=127;break;}else{label=126;break;}
 case 126: 
 var $550=(($R_1_i122+16)|0);
 HEAP32[(($550)>>2)]=$543;
 var $551=(($543+24)|0);
 HEAP32[(($551)>>2)]=$R_1_i122;
 label=128;break;
 case 127: 
 _abort();
 throw "Reached an unreachable!";
 case 128: 
 var $554=(($v_3_lcssa_i+20)|0);
 var $555=HEAP32[(($554)>>2)];
 var $556=($555|0)==0;
 if($556){label=133;break;}else{label=129;break;}
 case 129: 
 var $558=$555;
 var $559=HEAP32[((3304)>>2)];
 var $560=($558>>>0)<($559>>>0);
 if($560){label=131;break;}else{label=130;break;}
 case 130: 
 var $562=(($R_1_i122+20)|0);
 HEAP32[(($562)>>2)]=$555;
 var $563=(($555+24)|0);
 HEAP32[(($563)>>2)]=$R_1_i122;
 label=133;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $567=($rsize_3_lcssa_i>>>0)<16;
 if($567){label=134;break;}else{label=135;break;}
 case 134: 
 var $569=((($rsize_3_lcssa_i)+($348))|0);
 var $570=$569|3;
 var $571=(($v_3_lcssa_i+4)|0);
 HEAP32[(($571)>>2)]=$570;
 var $_sum19_i=((($569)+(4))|0);
 var $572=(($462+$_sum19_i)|0);
 var $573=$572;
 var $574=HEAP32[(($573)>>2)];
 var $575=$574|1;
 HEAP32[(($573)>>2)]=$575;
 label=159;break;
 case 135: 
 var $577=$348|3;
 var $578=(($v_3_lcssa_i+4)|0);
 HEAP32[(($578)>>2)]=$577;
 var $579=$rsize_3_lcssa_i|1;
 var $_sum_i125136=$348|4;
 var $580=(($462+$_sum_i125136)|0);
 var $581=$580;
 HEAP32[(($581)>>2)]=$579;
 var $_sum1_i126=((($rsize_3_lcssa_i)+($348))|0);
 var $582=(($462+$_sum1_i126)|0);
 var $583=$582;
 HEAP32[(($583)>>2)]=$rsize_3_lcssa_i;
 var $584=$rsize_3_lcssa_i>>>3;
 var $585=($rsize_3_lcssa_i>>>0)<256;
 if($585){label=136;break;}else{label=141;break;}
 case 136: 
 var $587=$584<<1;
 var $588=((3328+($587<<2))|0);
 var $589=$588;
 var $590=HEAP32[((3288)>>2)];
 var $591=1<<$584;
 var $592=$590&$591;
 var $593=($592|0)==0;
 if($593){label=137;break;}else{label=138;break;}
 case 137: 
 var $595=$590|$591;
 HEAP32[((3288)>>2)]=$595;
 var $_sum15_pre_i=((($587)+(2))|0);
 var $_pre_i127=((3328+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$589;var $_pre_phi_i128=$_pre_i127;label=140;break;
 case 138: 
 var $_sum18_i=((($587)+(2))|0);
 var $597=((3328+($_sum18_i<<2))|0);
 var $598=HEAP32[(($597)>>2)];
 var $599=$598;
 var $600=HEAP32[((3304)>>2)];
 var $601=($599>>>0)<($600>>>0);
 if($601){label=139;break;}else{var $F5_0_i=$598;var $_pre_phi_i128=$597;label=140;break;}
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 var $_pre_phi_i128;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i128)>>2)]=$467;
 var $604=(($F5_0_i+12)|0);
 HEAP32[(($604)>>2)]=$467;
 var $_sum16_i=((($348)+(8))|0);
 var $605=(($462+$_sum16_i)|0);
 var $606=$605;
 HEAP32[(($606)>>2)]=$F5_0_i;
 var $_sum17_i=((($348)+(12))|0);
 var $607=(($462+$_sum17_i)|0);
 var $608=$607;
 HEAP32[(($608)>>2)]=$589;
 label=159;break;
 case 141: 
 var $610=$466;
 var $611=$rsize_3_lcssa_i>>>8;
 var $612=($611|0)==0;
 if($612){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142: 
 var $614=($rsize_3_lcssa_i>>>0)>16777215;
 if($614){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143: 
 var $616=((($611)+(1048320))|0);
 var $617=$616>>>16;
 var $618=$617&8;
 var $619=$611<<$618;
 var $620=((($619)+(520192))|0);
 var $621=$620>>>16;
 var $622=$621&4;
 var $623=$622|$618;
 var $624=$619<<$622;
 var $625=((($624)+(245760))|0);
 var $626=$625>>>16;
 var $627=$626&2;
 var $628=$623|$627;
 var $629=(((14)-($628))|0);
 var $630=$624<<$627;
 var $631=$630>>>15;
 var $632=((($629)+($631))|0);
 var $633=$632<<1;
 var $634=((($632)+(7))|0);
 var $635=$rsize_3_lcssa_i>>>($634>>>0);
 var $636=$635&1;
 var $637=$636|$633;
 var $I7_0_i=$637;label=144;break;
 case 144: 
 var $I7_0_i;
 var $639=((3592+($I7_0_i<<2))|0);
 var $_sum2_i=((($348)+(28))|0);
 var $640=(($462+$_sum2_i)|0);
 var $641=$640;
 HEAP32[(($641)>>2)]=$I7_0_i;
 var $_sum3_i129=((($348)+(16))|0);
 var $642=(($462+$_sum3_i129)|0);
 var $_sum4_i130=((($348)+(20))|0);
 var $643=(($462+$_sum4_i130)|0);
 var $644=$643;
 HEAP32[(($644)>>2)]=0;
 var $645=$642;
 HEAP32[(($645)>>2)]=0;
 var $646=HEAP32[((3292)>>2)];
 var $647=1<<$I7_0_i;
 var $648=$646&$647;
 var $649=($648|0)==0;
 if($649){label=145;break;}else{label=146;break;}
 case 145: 
 var $651=$646|$647;
 HEAP32[((3292)>>2)]=$651;
 HEAP32[(($639)>>2)]=$610;
 var $652=$639;
 var $_sum5_i=((($348)+(24))|0);
 var $653=(($462+$_sum5_i)|0);
 var $654=$653;
 HEAP32[(($654)>>2)]=$652;
 var $_sum6_i=((($348)+(12))|0);
 var $655=(($462+$_sum6_i)|0);
 var $656=$655;
 HEAP32[(($656)>>2)]=$610;
 var $_sum7_i=((($348)+(8))|0);
 var $657=(($462+$_sum7_i)|0);
 var $658=$657;
 HEAP32[(($658)>>2)]=$610;
 label=159;break;
 case 146: 
 var $660=HEAP32[(($639)>>2)];
 var $661=($I7_0_i|0)==31;
 if($661){var $666=0;label=148;break;}else{label=147;break;}
 case 147: 
 var $663=$I7_0_i>>>1;
 var $664=(((25)-($663))|0);
 var $666=$664;label=148;break;
 case 148: 
 var $666;
 var $667=$rsize_3_lcssa_i<<$666;
 var $K12_0_i=$667;var $T_0_i=$660;label=149;break;
 case 149: 
 var $T_0_i;
 var $K12_0_i;
 var $669=(($T_0_i+4)|0);
 var $670=HEAP32[(($669)>>2)];
 var $671=$670&-8;
 var $672=($671|0)==($rsize_3_lcssa_i|0);
 if($672){label=154;break;}else{label=150;break;}
 case 150: 
 var $674=$K12_0_i>>>31;
 var $675=(($T_0_i+16+($674<<2))|0);
 var $676=HEAP32[(($675)>>2)];
 var $677=($676|0)==0;
 var $678=$K12_0_i<<1;
 if($677){label=151;break;}else{var $K12_0_i=$678;var $T_0_i=$676;label=149;break;}
 case 151: 
 var $680=$675;
 var $681=HEAP32[((3304)>>2)];
 var $682=($680>>>0)<($681>>>0);
 if($682){label=153;break;}else{label=152;break;}
 case 152: 
 HEAP32[(($675)>>2)]=$610;
 var $_sum12_i=((($348)+(24))|0);
 var $684=(($462+$_sum12_i)|0);
 var $685=$684;
 HEAP32[(($685)>>2)]=$T_0_i;
 var $_sum13_i=((($348)+(12))|0);
 var $686=(($462+$_sum13_i)|0);
 var $687=$686;
 HEAP32[(($687)>>2)]=$610;
 var $_sum14_i=((($348)+(8))|0);
 var $688=(($462+$_sum14_i)|0);
 var $689=$688;
 HEAP32[(($689)>>2)]=$610;
 label=159;break;
 case 153: 
 _abort();
 throw "Reached an unreachable!";
 case 154: 
 var $692=(($T_0_i+8)|0);
 var $693=HEAP32[(($692)>>2)];
 var $694=$T_0_i;
 var $695=HEAP32[((3304)>>2)];
 var $696=($694>>>0)<($695>>>0);
 if($696){label=157;break;}else{label=155;break;}
 case 155: 
 var $698=$693;
 var $699=($698>>>0)<($695>>>0);
 if($699){label=157;break;}else{label=156;break;}
 case 156: 
 var $701=(($693+12)|0);
 HEAP32[(($701)>>2)]=$610;
 HEAP32[(($692)>>2)]=$610;
 var $_sum9_i=((($348)+(8))|0);
 var $702=(($462+$_sum9_i)|0);
 var $703=$702;
 HEAP32[(($703)>>2)]=$693;
 var $_sum10_i=((($348)+(12))|0);
 var $704=(($462+$_sum10_i)|0);
 var $705=$704;
 HEAP32[(($705)>>2)]=$T_0_i;
 var $_sum11_i=((($348)+(24))|0);
 var $706=(($462+$_sum11_i)|0);
 var $707=$706;
 HEAP32[(($707)>>2)]=0;
 label=159;break;
 case 157: 
 _abort();
 throw "Reached an unreachable!";
 case 158: 
 _abort();
 throw "Reached an unreachable!";
 case 159: 
 var $709=(($v_3_lcssa_i+8)|0);
 var $710=$709;
 var $711=($709|0)==0;
 if($711){var $nb_0=$348;label=160;break;}else{var $mem_0=$710;label=341;break;}
 case 160: 
 var $nb_0;
 var $712=HEAP32[((3296)>>2)];
 var $713=($nb_0>>>0)>($712>>>0);
 if($713){label=165;break;}else{label=161;break;}
 case 161: 
 var $715=((($712)-($nb_0))|0);
 var $716=HEAP32[((3308)>>2)];
 var $717=($715>>>0)>15;
 if($717){label=162;break;}else{label=163;break;}
 case 162: 
 var $719=$716;
 var $720=(($719+$nb_0)|0);
 var $721=$720;
 HEAP32[((3308)>>2)]=$721;
 HEAP32[((3296)>>2)]=$715;
 var $722=$715|1;
 var $_sum102=((($nb_0)+(4))|0);
 var $723=(($719+$_sum102)|0);
 var $724=$723;
 HEAP32[(($724)>>2)]=$722;
 var $725=(($719+$712)|0);
 var $726=$725;
 HEAP32[(($726)>>2)]=$715;
 var $727=$nb_0|3;
 var $728=(($716+4)|0);
 HEAP32[(($728)>>2)]=$727;
 label=164;break;
 case 163: 
 HEAP32[((3296)>>2)]=0;
 HEAP32[((3308)>>2)]=0;
 var $730=$712|3;
 var $731=(($716+4)|0);
 HEAP32[(($731)>>2)]=$730;
 var $732=$716;
 var $_sum101=((($712)+(4))|0);
 var $733=(($732+$_sum101)|0);
 var $734=$733;
 var $735=HEAP32[(($734)>>2)];
 var $736=$735|1;
 HEAP32[(($734)>>2)]=$736;
 label=164;break;
 case 164: 
 var $738=(($716+8)|0);
 var $739=$738;
 var $mem_0=$739;label=341;break;
 case 165: 
 var $741=HEAP32[((3300)>>2)];
 var $742=($nb_0>>>0)<($741>>>0);
 if($742){label=166;break;}else{label=167;break;}
 case 166: 
 var $744=((($741)-($nb_0))|0);
 HEAP32[((3300)>>2)]=$744;
 var $745=HEAP32[((3312)>>2)];
 var $746=$745;
 var $747=(($746+$nb_0)|0);
 var $748=$747;
 HEAP32[((3312)>>2)]=$748;
 var $749=$744|1;
 var $_sum=((($nb_0)+(4))|0);
 var $750=(($746+$_sum)|0);
 var $751=$750;
 HEAP32[(($751)>>2)]=$749;
 var $752=$nb_0|3;
 var $753=(($745+4)|0);
 HEAP32[(($753)>>2)]=$752;
 var $754=(($745+8)|0);
 var $755=$754;
 var $mem_0=$755;label=341;break;
 case 167: 
 var $757=HEAP32[((2128)>>2)];
 var $758=($757|0)==0;
 if($758){label=168;break;}else{label=171;break;}
 case 168: 
 var $760=_sysconf(30);
 var $761=((($760)-(1))|0);
 var $762=$761&$760;
 var $763=($762|0)==0;
 if($763){label=170;break;}else{label=169;break;}
 case 169: 
 _abort();
 throw "Reached an unreachable!";
 case 170: 
 HEAP32[((2136)>>2)]=$760;
 HEAP32[((2132)>>2)]=$760;
 HEAP32[((2140)>>2)]=-1;
 HEAP32[((2144)>>2)]=-1;
 HEAP32[((2148)>>2)]=0;
 HEAP32[((3732)>>2)]=0;
 var $765=_time(0);
 var $766=$765&-16;
 var $767=$766^1431655768;
 HEAP32[((2128)>>2)]=$767;
 label=171;break;
 case 171: 
 var $769=((($nb_0)+(48))|0);
 var $770=HEAP32[((2136)>>2)];
 var $771=((($nb_0)+(47))|0);
 var $772=((($770)+($771))|0);
 var $773=(((-$770))|0);
 var $774=$772&$773;
 var $775=($774>>>0)>($nb_0>>>0);
 if($775){label=172;break;}else{var $mem_0=0;label=341;break;}
 case 172: 
 var $777=HEAP32[((3728)>>2)];
 var $778=($777|0)==0;
 if($778){label=174;break;}else{label=173;break;}
 case 173: 
 var $780=HEAP32[((3720)>>2)];
 var $781=((($780)+($774))|0);
 var $782=($781>>>0)<=($780>>>0);
 var $783=($781>>>0)>($777>>>0);
 var $or_cond1_i=$782|$783;
 if($or_cond1_i){var $mem_0=0;label=341;break;}else{label=174;break;}
 case 174: 
 var $785=HEAP32[((3732)>>2)];
 var $786=$785&4;
 var $787=($786|0)==0;
 if($787){label=175;break;}else{var $tsize_1_i=0;label=198;break;}
 case 175: 
 var $789=HEAP32[((3312)>>2)];
 var $790=($789|0)==0;
 if($790){label=181;break;}else{label=176;break;}
 case 176: 
 var $792=$789;
 var $sp_0_i_i=3736;label=177;break;
 case 177: 
 var $sp_0_i_i;
 var $794=(($sp_0_i_i)|0);
 var $795=HEAP32[(($794)>>2)];
 var $796=($795>>>0)>($792>>>0);
 if($796){label=179;break;}else{label=178;break;}
 case 178: 
 var $798=(($sp_0_i_i+4)|0);
 var $799=HEAP32[(($798)>>2)];
 var $800=(($795+$799)|0);
 var $801=($800>>>0)>($792>>>0);
 if($801){label=180;break;}else{label=179;break;}
 case 179: 
 var $803=(($sp_0_i_i+8)|0);
 var $804=HEAP32[(($803)>>2)];
 var $805=($804|0)==0;
 if($805){label=181;break;}else{var $sp_0_i_i=$804;label=177;break;}
 case 180: 
 var $806=($sp_0_i_i|0)==0;
 if($806){label=181;break;}else{label=188;break;}
 case 181: 
 var $807=_sbrk(0);
 var $808=($807|0)==-1;
 if($808){var $tsize_0303639_i=0;label=197;break;}else{label=182;break;}
 case 182: 
 var $810=$807;
 var $811=HEAP32[((2132)>>2)];
 var $812=((($811)-(1))|0);
 var $813=$812&$810;
 var $814=($813|0)==0;
 if($814){var $ssize_0_i=$774;label=184;break;}else{label=183;break;}
 case 183: 
 var $816=((($812)+($810))|0);
 var $817=(((-$811))|0);
 var $818=$816&$817;
 var $819=((($774)-($810))|0);
 var $820=((($819)+($818))|0);
 var $ssize_0_i=$820;label=184;break;
 case 184: 
 var $ssize_0_i;
 var $822=HEAP32[((3720)>>2)];
 var $823=((($822)+($ssize_0_i))|0);
 var $824=($ssize_0_i>>>0)>($nb_0>>>0);
 var $825=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i131=$824&$825;
 if($or_cond_i131){label=185;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 185: 
 var $827=HEAP32[((3728)>>2)];
 var $828=($827|0)==0;
 if($828){label=187;break;}else{label=186;break;}
 case 186: 
 var $830=($823>>>0)<=($822>>>0);
 var $831=($823>>>0)>($827>>>0);
 var $or_cond2_i=$830|$831;
 if($or_cond2_i){var $tsize_0303639_i=0;label=197;break;}else{label=187;break;}
 case 187: 
 var $833=_sbrk($ssize_0_i);
 var $834=($833|0)==($807|0);
 var $ssize_0__i=($834?$ssize_0_i:0);
 var $__i=($834?$807:-1);
 var $tbase_0_i=$__i;var $tsize_0_i=$ssize_0__i;var $br_0_i=$833;var $ssize_1_i=$ssize_0_i;label=190;break;
 case 188: 
 var $836=HEAP32[((3300)>>2)];
 var $837=((($772)-($836))|0);
 var $838=$837&$773;
 var $839=($838>>>0)<2147483647;
 if($839){label=189;break;}else{var $tsize_0303639_i=0;label=197;break;}
 case 189: 
 var $841=_sbrk($838);
 var $842=HEAP32[(($794)>>2)];
 var $843=HEAP32[(($798)>>2)];
 var $844=(($842+$843)|0);
 var $845=($841|0)==($844|0);
 var $_3_i=($845?$838:0);
 var $_4_i=($845?$841:-1);
 var $tbase_0_i=$_4_i;var $tsize_0_i=$_3_i;var $br_0_i=$841;var $ssize_1_i=$838;label=190;break;
 case 190: 
 var $ssize_1_i;
 var $br_0_i;
 var $tsize_0_i;
 var $tbase_0_i;
 var $847=(((-$ssize_1_i))|0);
 var $848=($tbase_0_i|0)==-1;
 if($848){label=191;break;}else{var $tsize_244_i=$tsize_0_i;var $tbase_245_i=$tbase_0_i;label=201;break;}
 case 191: 
 var $850=($br_0_i|0)!=-1;
 var $851=($ssize_1_i>>>0)<2147483647;
 var $or_cond5_i=$850&$851;
 var $852=($ssize_1_i>>>0)<($769>>>0);
 var $or_cond6_i=$or_cond5_i&$852;
 if($or_cond6_i){label=192;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 192: 
 var $854=HEAP32[((2136)>>2)];
 var $855=((($771)-($ssize_1_i))|0);
 var $856=((($855)+($854))|0);
 var $857=(((-$854))|0);
 var $858=$856&$857;
 var $859=($858>>>0)<2147483647;
 if($859){label=193;break;}else{var $ssize_2_i=$ssize_1_i;label=196;break;}
 case 193: 
 var $861=_sbrk($858);
 var $862=($861|0)==-1;
 if($862){label=195;break;}else{label=194;break;}
 case 194: 
 var $864=((($858)+($ssize_1_i))|0);
 var $ssize_2_i=$864;label=196;break;
 case 195: 
 var $866=_sbrk($847);
 var $tsize_0303639_i=$tsize_0_i;label=197;break;
 case 196: 
 var $ssize_2_i;
 var $868=($br_0_i|0)==-1;
 if($868){var $tsize_0303639_i=$tsize_0_i;label=197;break;}else{var $tsize_244_i=$ssize_2_i;var $tbase_245_i=$br_0_i;label=201;break;}
 case 197: 
 var $tsize_0303639_i;
 var $869=HEAP32[((3732)>>2)];
 var $870=$869|4;
 HEAP32[((3732)>>2)]=$870;
 var $tsize_1_i=$tsize_0303639_i;label=198;break;
 case 198: 
 var $tsize_1_i;
 var $872=($774>>>0)<2147483647;
 if($872){label=199;break;}else{label=340;break;}
 case 199: 
 var $874=_sbrk($774);
 var $875=_sbrk(0);
 var $notlhs_i=($874|0)!=-1;
 var $notrhs_i=($875|0)!=-1;
 var $or_cond8_not_i=$notrhs_i&$notlhs_i;
 var $876=($874>>>0)<($875>>>0);
 var $or_cond9_i=$or_cond8_not_i&$876;
 if($or_cond9_i){label=200;break;}else{label=340;break;}
 case 200: 
 var $877=$875;
 var $878=$874;
 var $879=((($877)-($878))|0);
 var $880=((($nb_0)+(40))|0);
 var $881=($879>>>0)>($880>>>0);
 var $_tsize_1_i=($881?$879:$tsize_1_i);
 var $_tbase_1_i=($881?$874:-1);
 var $882=($_tbase_1_i|0)==-1;
 if($882){label=340;break;}else{var $tsize_244_i=$_tsize_1_i;var $tbase_245_i=$_tbase_1_i;label=201;break;}
 case 201: 
 var $tbase_245_i;
 var $tsize_244_i;
 var $883=HEAP32[((3720)>>2)];
 var $884=((($883)+($tsize_244_i))|0);
 HEAP32[((3720)>>2)]=$884;
 var $885=HEAP32[((3724)>>2)];
 var $886=($884>>>0)>($885>>>0);
 if($886){label=202;break;}else{label=203;break;}
 case 202: 
 HEAP32[((3724)>>2)]=$884;
 label=203;break;
 case 203: 
 var $888=HEAP32[((3312)>>2)];
 var $889=($888|0)==0;
 if($889){label=204;break;}else{var $sp_067_i=3736;label=211;break;}
 case 204: 
 var $891=HEAP32[((3304)>>2)];
 var $892=($891|0)==0;
 var $893=($tbase_245_i>>>0)<($891>>>0);
 var $or_cond10_i=$892|$893;
 if($or_cond10_i){label=205;break;}else{label=206;break;}
 case 205: 
 HEAP32[((3304)>>2)]=$tbase_245_i;
 label=206;break;
 case 206: 
 HEAP32[((3736)>>2)]=$tbase_245_i;
 HEAP32[((3740)>>2)]=$tsize_244_i;
 HEAP32[((3748)>>2)]=0;
 var $895=HEAP32[((2128)>>2)];
 HEAP32[((3324)>>2)]=$895;
 HEAP32[((3320)>>2)]=-1;
 var $i_02_i_i=0;label=207;break;
 case 207: 
 var $i_02_i_i;
 var $897=$i_02_i_i<<1;
 var $898=((3328+($897<<2))|0);
 var $899=$898;
 var $_sum_i_i=((($897)+(3))|0);
 var $900=((3328+($_sum_i_i<<2))|0);
 HEAP32[(($900)>>2)]=$899;
 var $_sum1_i_i=((($897)+(2))|0);
 var $901=((3328+($_sum1_i_i<<2))|0);
 HEAP32[(($901)>>2)]=$899;
 var $902=((($i_02_i_i)+(1))|0);
 var $903=($902>>>0)<32;
 if($903){var $i_02_i_i=$902;label=207;break;}else{label=208;break;}
 case 208: 
 var $904=((($tsize_244_i)-(40))|0);
 var $905=(($tbase_245_i+8)|0);
 var $906=$905;
 var $907=$906&7;
 var $908=($907|0)==0;
 if($908){var $912=0;label=210;break;}else{label=209;break;}
 case 209: 
 var $910=(((-$906))|0);
 var $911=$910&7;
 var $912=$911;label=210;break;
 case 210: 
 var $912;
 var $913=(($tbase_245_i+$912)|0);
 var $914=$913;
 var $915=((($904)-($912))|0);
 HEAP32[((3312)>>2)]=$914;
 HEAP32[((3300)>>2)]=$915;
 var $916=$915|1;
 var $_sum_i14_i=((($912)+(4))|0);
 var $917=(($tbase_245_i+$_sum_i14_i)|0);
 var $918=$917;
 HEAP32[(($918)>>2)]=$916;
 var $_sum2_i_i=((($tsize_244_i)-(36))|0);
 var $919=(($tbase_245_i+$_sum2_i_i)|0);
 var $920=$919;
 HEAP32[(($920)>>2)]=40;
 var $921=HEAP32[((2144)>>2)];
 HEAP32[((3316)>>2)]=$921;
 label=338;break;
 case 211: 
 var $sp_067_i;
 var $922=(($sp_067_i)|0);
 var $923=HEAP32[(($922)>>2)];
 var $924=(($sp_067_i+4)|0);
 var $925=HEAP32[(($924)>>2)];
 var $926=(($923+$925)|0);
 var $927=($tbase_245_i|0)==($926|0);
 if($927){label=213;break;}else{label=212;break;}
 case 212: 
 var $929=(($sp_067_i+8)|0);
 var $930=HEAP32[(($929)>>2)];
 var $931=($930|0)==0;
 if($931){label=218;break;}else{var $sp_067_i=$930;label=211;break;}
 case 213: 
 var $932=(($sp_067_i+12)|0);
 var $933=HEAP32[(($932)>>2)];
 var $934=$933&8;
 var $935=($934|0)==0;
 if($935){label=214;break;}else{label=218;break;}
 case 214: 
 var $937=$888;
 var $938=($937>>>0)>=($923>>>0);
 var $939=($937>>>0)<($tbase_245_i>>>0);
 var $or_cond47_i=$938&$939;
 if($or_cond47_i){label=215;break;}else{label=218;break;}
 case 215: 
 var $941=((($925)+($tsize_244_i))|0);
 HEAP32[(($924)>>2)]=$941;
 var $942=HEAP32[((3300)>>2)];
 var $943=((($942)+($tsize_244_i))|0);
 var $944=(($888+8)|0);
 var $945=$944;
 var $946=$945&7;
 var $947=($946|0)==0;
 if($947){var $951=0;label=217;break;}else{label=216;break;}
 case 216: 
 var $949=(((-$945))|0);
 var $950=$949&7;
 var $951=$950;label=217;break;
 case 217: 
 var $951;
 var $952=(($937+$951)|0);
 var $953=$952;
 var $954=((($943)-($951))|0);
 HEAP32[((3312)>>2)]=$953;
 HEAP32[((3300)>>2)]=$954;
 var $955=$954|1;
 var $_sum_i18_i=((($951)+(4))|0);
 var $956=(($937+$_sum_i18_i)|0);
 var $957=$956;
 HEAP32[(($957)>>2)]=$955;
 var $_sum2_i19_i=((($943)+(4))|0);
 var $958=(($937+$_sum2_i19_i)|0);
 var $959=$958;
 HEAP32[(($959)>>2)]=40;
 var $960=HEAP32[((2144)>>2)];
 HEAP32[((3316)>>2)]=$960;
 label=338;break;
 case 218: 
 var $961=HEAP32[((3304)>>2)];
 var $962=($tbase_245_i>>>0)<($961>>>0);
 if($962){label=219;break;}else{label=220;break;}
 case 219: 
 HEAP32[((3304)>>2)]=$tbase_245_i;
 label=220;break;
 case 220: 
 var $964=(($tbase_245_i+$tsize_244_i)|0);
 var $sp_160_i=3736;label=221;break;
 case 221: 
 var $sp_160_i;
 var $966=(($sp_160_i)|0);
 var $967=HEAP32[(($966)>>2)];
 var $968=($967|0)==($964|0);
 if($968){label=223;break;}else{label=222;break;}
 case 222: 
 var $970=(($sp_160_i+8)|0);
 var $971=HEAP32[(($970)>>2)];
 var $972=($971|0)==0;
 if($972){label=304;break;}else{var $sp_160_i=$971;label=221;break;}
 case 223: 
 var $973=(($sp_160_i+12)|0);
 var $974=HEAP32[(($973)>>2)];
 var $975=$974&8;
 var $976=($975|0)==0;
 if($976){label=224;break;}else{label=304;break;}
 case 224: 
 HEAP32[(($966)>>2)]=$tbase_245_i;
 var $978=(($sp_160_i+4)|0);
 var $979=HEAP32[(($978)>>2)];
 var $980=((($979)+($tsize_244_i))|0);
 HEAP32[(($978)>>2)]=$980;
 var $981=(($tbase_245_i+8)|0);
 var $982=$981;
 var $983=$982&7;
 var $984=($983|0)==0;
 if($984){var $989=0;label=226;break;}else{label=225;break;}
 case 225: 
 var $986=(((-$982))|0);
 var $987=$986&7;
 var $989=$987;label=226;break;
 case 226: 
 var $989;
 var $990=(($tbase_245_i+$989)|0);
 var $_sum93_i=((($tsize_244_i)+(8))|0);
 var $991=(($tbase_245_i+$_sum93_i)|0);
 var $992=$991;
 var $993=$992&7;
 var $994=($993|0)==0;
 if($994){var $999=0;label=228;break;}else{label=227;break;}
 case 227: 
 var $996=(((-$992))|0);
 var $997=$996&7;
 var $999=$997;label=228;break;
 case 228: 
 var $999;
 var $_sum94_i=((($999)+($tsize_244_i))|0);
 var $1000=(($tbase_245_i+$_sum94_i)|0);
 var $1001=$1000;
 var $1002=$1000;
 var $1003=$990;
 var $1004=((($1002)-($1003))|0);
 var $_sum_i21_i=((($989)+($nb_0))|0);
 var $1005=(($tbase_245_i+$_sum_i21_i)|0);
 var $1006=$1005;
 var $1007=((($1004)-($nb_0))|0);
 var $1008=$nb_0|3;
 var $_sum1_i22_i=((($989)+(4))|0);
 var $1009=(($tbase_245_i+$_sum1_i22_i)|0);
 var $1010=$1009;
 HEAP32[(($1010)>>2)]=$1008;
 var $1011=HEAP32[((3312)>>2)];
 var $1012=($1001|0)==($1011|0);
 if($1012){label=229;break;}else{label=230;break;}
 case 229: 
 var $1014=HEAP32[((3300)>>2)];
 var $1015=((($1014)+($1007))|0);
 HEAP32[((3300)>>2)]=$1015;
 HEAP32[((3312)>>2)]=$1006;
 var $1016=$1015|1;
 var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
 var $1017=(($tbase_245_i+$_sum46_i_i)|0);
 var $1018=$1017;
 HEAP32[(($1018)>>2)]=$1016;
 label=303;break;
 case 230: 
 var $1020=HEAP32[((3308)>>2)];
 var $1021=($1001|0)==($1020|0);
 if($1021){label=231;break;}else{label=232;break;}
 case 231: 
 var $1023=HEAP32[((3296)>>2)];
 var $1024=((($1023)+($1007))|0);
 HEAP32[((3296)>>2)]=$1024;
 HEAP32[((3308)>>2)]=$1006;
 var $1025=$1024|1;
 var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
 var $1026=(($tbase_245_i+$_sum44_i_i)|0);
 var $1027=$1026;
 HEAP32[(($1027)>>2)]=$1025;
 var $_sum45_i_i=((($1024)+($_sum_i21_i))|0);
 var $1028=(($tbase_245_i+$_sum45_i_i)|0);
 var $1029=$1028;
 HEAP32[(($1029)>>2)]=$1024;
 label=303;break;
 case 232: 
 var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
 var $_sum95_i=((($_sum2_i23_i)+($999))|0);
 var $1031=(($tbase_245_i+$_sum95_i)|0);
 var $1032=$1031;
 var $1033=HEAP32[(($1032)>>2)];
 var $1034=$1033&3;
 var $1035=($1034|0)==1;
 if($1035){label=233;break;}else{var $oldfirst_0_i_i=$1001;var $qsize_0_i_i=$1007;label=280;break;}
 case 233: 
 var $1037=$1033&-8;
 var $1038=$1033>>>3;
 var $1039=($1033>>>0)<256;
 if($1039){label=234;break;}else{label=246;break;}
 case 234: 
 var $_sum3940_i_i=$999|8;
 var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
 var $1041=(($tbase_245_i+$_sum105_i)|0);
 var $1042=$1041;
 var $1043=HEAP32[(($1042)>>2)];
 var $_sum41_i_i=((($tsize_244_i)+(12))|0);
 var $_sum106_i=((($_sum41_i_i)+($999))|0);
 var $1044=(($tbase_245_i+$_sum106_i)|0);
 var $1045=$1044;
 var $1046=HEAP32[(($1045)>>2)];
 var $1047=$1038<<1;
 var $1048=((3328+($1047<<2))|0);
 var $1049=$1048;
 var $1050=($1043|0)==($1049|0);
 if($1050){label=237;break;}else{label=235;break;}
 case 235: 
 var $1052=$1043;
 var $1053=HEAP32[((3304)>>2)];
 var $1054=($1052>>>0)<($1053>>>0);
 if($1054){label=245;break;}else{label=236;break;}
 case 236: 
 var $1056=(($1043+12)|0);
 var $1057=HEAP32[(($1056)>>2)];
 var $1058=($1057|0)==($1001|0);
 if($1058){label=237;break;}else{label=245;break;}
 case 237: 
 var $1059=($1046|0)==($1043|0);
 if($1059){label=238;break;}else{label=239;break;}
 case 238: 
 var $1061=1<<$1038;
 var $1062=$1061^-1;
 var $1063=HEAP32[((3288)>>2)];
 var $1064=$1063&$1062;
 HEAP32[((3288)>>2)]=$1064;
 label=279;break;
 case 239: 
 var $1066=($1046|0)==($1049|0);
 if($1066){label=240;break;}else{label=241;break;}
 case 240: 
 var $_pre56_i_i=(($1046+8)|0);
 var $_pre_phi57_i_i=$_pre56_i_i;label=243;break;
 case 241: 
 var $1068=$1046;
 var $1069=HEAP32[((3304)>>2)];
 var $1070=($1068>>>0)<($1069>>>0);
 if($1070){label=244;break;}else{label=242;break;}
 case 242: 
 var $1072=(($1046+8)|0);
 var $1073=HEAP32[(($1072)>>2)];
 var $1074=($1073|0)==($1001|0);
 if($1074){var $_pre_phi57_i_i=$1072;label=243;break;}else{label=244;break;}
 case 243: 
 var $_pre_phi57_i_i;
 var $1075=(($1043+12)|0);
 HEAP32[(($1075)>>2)]=$1046;
 HEAP32[(($_pre_phi57_i_i)>>2)]=$1043;
 label=279;break;
 case 244: 
 _abort();
 throw "Reached an unreachable!";
 case 245: 
 _abort();
 throw "Reached an unreachable!";
 case 246: 
 var $1077=$1000;
 var $_sum34_i_i=$999|24;
 var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
 var $1078=(($tbase_245_i+$_sum96_i)|0);
 var $1079=$1078;
 var $1080=HEAP32[(($1079)>>2)];
 var $_sum5_i_i=((($tsize_244_i)+(12))|0);
 var $_sum97_i=((($_sum5_i_i)+($999))|0);
 var $1081=(($tbase_245_i+$_sum97_i)|0);
 var $1082=$1081;
 var $1083=HEAP32[(($1082)>>2)];
 var $1084=($1083|0)==($1077|0);
 if($1084){label=252;break;}else{label=247;break;}
 case 247: 
 var $_sum3637_i_i=$999|8;
 var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
 var $1086=(($tbase_245_i+$_sum98_i)|0);
 var $1087=$1086;
 var $1088=HEAP32[(($1087)>>2)];
 var $1089=$1088;
 var $1090=HEAP32[((3304)>>2)];
 var $1091=($1089>>>0)<($1090>>>0);
 if($1091){label=251;break;}else{label=248;break;}
 case 248: 
 var $1093=(($1088+12)|0);
 var $1094=HEAP32[(($1093)>>2)];
 var $1095=($1094|0)==($1077|0);
 if($1095){label=249;break;}else{label=251;break;}
 case 249: 
 var $1097=(($1083+8)|0);
 var $1098=HEAP32[(($1097)>>2)];
 var $1099=($1098|0)==($1077|0);
 if($1099){label=250;break;}else{label=251;break;}
 case 250: 
 HEAP32[(($1093)>>2)]=$1083;
 HEAP32[(($1097)>>2)]=$1088;
 var $R_1_i_i=$1083;label=259;break;
 case 251: 
 _abort();
 throw "Reached an unreachable!";
 case 252: 
 var $_sum67_i_i=$999|16;
 var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
 var $1102=(($tbase_245_i+$_sum103_i)|0);
 var $1103=$1102;
 var $1104=HEAP32[(($1103)>>2)];
 var $1105=($1104|0)==0;
 if($1105){label=253;break;}else{var $R_0_i_i=$1104;var $RP_0_i_i=$1103;label=254;break;}
 case 253: 
 var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
 var $1107=(($tbase_245_i+$_sum104_i)|0);
 var $1108=$1107;
 var $1109=HEAP32[(($1108)>>2)];
 var $1110=($1109|0)==0;
 if($1110){var $R_1_i_i=0;label=259;break;}else{var $R_0_i_i=$1109;var $RP_0_i_i=$1108;label=254;break;}
 case 254: 
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1111=(($R_0_i_i+20)|0);
 var $1112=HEAP32[(($1111)>>2)];
 var $1113=($1112|0)==0;
 if($1113){label=255;break;}else{var $R_0_i_i=$1112;var $RP_0_i_i=$1111;label=254;break;}
 case 255: 
 var $1115=(($R_0_i_i+16)|0);
 var $1116=HEAP32[(($1115)>>2)];
 var $1117=($1116|0)==0;
 if($1117){label=256;break;}else{var $R_0_i_i=$1116;var $RP_0_i_i=$1115;label=254;break;}
 case 256: 
 var $1119=$RP_0_i_i;
 var $1120=HEAP32[((3304)>>2)];
 var $1121=($1119>>>0)<($1120>>>0);
 if($1121){label=258;break;}else{label=257;break;}
 case 257: 
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=259;break;
 case 258: 
 _abort();
 throw "Reached an unreachable!";
 case 259: 
 var $R_1_i_i;
 var $1125=($1080|0)==0;
 if($1125){label=279;break;}else{label=260;break;}
 case 260: 
 var $_sum31_i_i=((($tsize_244_i)+(28))|0);
 var $_sum99_i=((($_sum31_i_i)+($999))|0);
 var $1127=(($tbase_245_i+$_sum99_i)|0);
 var $1128=$1127;
 var $1129=HEAP32[(($1128)>>2)];
 var $1130=((3592+($1129<<2))|0);
 var $1131=HEAP32[(($1130)>>2)];
 var $1132=($1077|0)==($1131|0);
 if($1132){label=261;break;}else{label=263;break;}
 case 261: 
 HEAP32[(($1130)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=262;break;}else{label=269;break;}
 case 262: 
 var $1134=1<<$1129;
 var $1135=$1134^-1;
 var $1136=HEAP32[((3292)>>2)];
 var $1137=$1136&$1135;
 HEAP32[((3292)>>2)]=$1137;
 label=279;break;
 case 263: 
 var $1139=$1080;
 var $1140=HEAP32[((3304)>>2)];
 var $1141=($1139>>>0)<($1140>>>0);
 if($1141){label=267;break;}else{label=264;break;}
 case 264: 
 var $1143=(($1080+16)|0);
 var $1144=HEAP32[(($1143)>>2)];
 var $1145=($1144|0)==($1077|0);
 if($1145){label=265;break;}else{label=266;break;}
 case 265: 
 HEAP32[(($1143)>>2)]=$R_1_i_i;
 label=268;break;
 case 266: 
 var $1148=(($1080+20)|0);
 HEAP32[(($1148)>>2)]=$R_1_i_i;
 label=268;break;
 case 267: 
 _abort();
 throw "Reached an unreachable!";
 case 268: 
 var $1151=($R_1_i_i|0)==0;
 if($1151){label=279;break;}else{label=269;break;}
 case 269: 
 var $1153=$R_1_i_i;
 var $1154=HEAP32[((3304)>>2)];
 var $1155=($1153>>>0)<($1154>>>0);
 if($1155){label=278;break;}else{label=270;break;}
 case 270: 
 var $1157=(($R_1_i_i+24)|0);
 HEAP32[(($1157)>>2)]=$1080;
 var $_sum3233_i_i=$999|16;
 var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
 var $1158=(($tbase_245_i+$_sum100_i)|0);
 var $1159=$1158;
 var $1160=HEAP32[(($1159)>>2)];
 var $1161=($1160|0)==0;
 if($1161){label=274;break;}else{label=271;break;}
 case 271: 
 var $1163=$1160;
 var $1164=HEAP32[((3304)>>2)];
 var $1165=($1163>>>0)<($1164>>>0);
 if($1165){label=273;break;}else{label=272;break;}
 case 272: 
 var $1167=(($R_1_i_i+16)|0);
 HEAP32[(($1167)>>2)]=$1160;
 var $1168=(($1160+24)|0);
 HEAP32[(($1168)>>2)]=$R_1_i_i;
 label=274;break;
 case 273: 
 _abort();
 throw "Reached an unreachable!";
 case 274: 
 var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
 var $1171=(($tbase_245_i+$_sum101_i)|0);
 var $1172=$1171;
 var $1173=HEAP32[(($1172)>>2)];
 var $1174=($1173|0)==0;
 if($1174){label=279;break;}else{label=275;break;}
 case 275: 
 var $1176=$1173;
 var $1177=HEAP32[((3304)>>2)];
 var $1178=($1176>>>0)<($1177>>>0);
 if($1178){label=277;break;}else{label=276;break;}
 case 276: 
 var $1180=(($R_1_i_i+20)|0);
 HEAP32[(($1180)>>2)]=$1173;
 var $1181=(($1173+24)|0);
 HEAP32[(($1181)>>2)]=$R_1_i_i;
 label=279;break;
 case 277: 
 _abort();
 throw "Reached an unreachable!";
 case 278: 
 _abort();
 throw "Reached an unreachable!";
 case 279: 
 var $_sum9_i_i=$1037|$999;
 var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
 var $1185=(($tbase_245_i+$_sum102_i)|0);
 var $1186=$1185;
 var $1187=((($1037)+($1007))|0);
 var $oldfirst_0_i_i=$1186;var $qsize_0_i_i=$1187;label=280;break;
 case 280: 
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1189=(($oldfirst_0_i_i+4)|0);
 var $1190=HEAP32[(($1189)>>2)];
 var $1191=$1190&-2;
 HEAP32[(($1189)>>2)]=$1191;
 var $1192=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
 var $1193=(($tbase_245_i+$_sum10_i_i)|0);
 var $1194=$1193;
 HEAP32[(($1194)>>2)]=$1192;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
 var $1195=(($tbase_245_i+$_sum11_i_i)|0);
 var $1196=$1195;
 HEAP32[(($1196)>>2)]=$qsize_0_i_i;
 var $1197=$qsize_0_i_i>>>3;
 var $1198=($qsize_0_i_i>>>0)<256;
 if($1198){label=281;break;}else{label=286;break;}
 case 281: 
 var $1200=$1197<<1;
 var $1201=((3328+($1200<<2))|0);
 var $1202=$1201;
 var $1203=HEAP32[((3288)>>2)];
 var $1204=1<<$1197;
 var $1205=$1203&$1204;
 var $1206=($1205|0)==0;
 if($1206){label=282;break;}else{label=283;break;}
 case 282: 
 var $1208=$1203|$1204;
 HEAP32[((3288)>>2)]=$1208;
 var $_sum27_pre_i_i=((($1200)+(2))|0);
 var $_pre_i24_i=((3328+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1202;var $_pre_phi_i25_i=$_pre_i24_i;label=285;break;
 case 283: 
 var $_sum30_i_i=((($1200)+(2))|0);
 var $1210=((3328+($_sum30_i_i<<2))|0);
 var $1211=HEAP32[(($1210)>>2)];
 var $1212=$1211;
 var $1213=HEAP32[((3304)>>2)];
 var $1214=($1212>>>0)<($1213>>>0);
 if($1214){label=284;break;}else{var $F4_0_i_i=$1211;var $_pre_phi_i25_i=$1210;label=285;break;}
 case 284: 
 _abort();
 throw "Reached an unreachable!";
 case 285: 
 var $_pre_phi_i25_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i25_i)>>2)]=$1006;
 var $1217=(($F4_0_i_i+12)|0);
 HEAP32[(($1217)>>2)]=$1006;
 var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
 var $1218=(($tbase_245_i+$_sum28_i_i)|0);
 var $1219=$1218;
 HEAP32[(($1219)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
 var $1220=(($tbase_245_i+$_sum29_i_i)|0);
 var $1221=$1220;
 HEAP32[(($1221)>>2)]=$1202;
 label=303;break;
 case 286: 
 var $1223=$1005;
 var $1224=$qsize_0_i_i>>>8;
 var $1225=($1224|0)==0;
 if($1225){var $I7_0_i_i=0;label=289;break;}else{label=287;break;}
 case 287: 
 var $1227=($qsize_0_i_i>>>0)>16777215;
 if($1227){var $I7_0_i_i=31;label=289;break;}else{label=288;break;}
 case 288: 
 var $1229=((($1224)+(1048320))|0);
 var $1230=$1229>>>16;
 var $1231=$1230&8;
 var $1232=$1224<<$1231;
 var $1233=((($1232)+(520192))|0);
 var $1234=$1233>>>16;
 var $1235=$1234&4;
 var $1236=$1235|$1231;
 var $1237=$1232<<$1235;
 var $1238=((($1237)+(245760))|0);
 var $1239=$1238>>>16;
 var $1240=$1239&2;
 var $1241=$1236|$1240;
 var $1242=(((14)-($1241))|0);
 var $1243=$1237<<$1240;
 var $1244=$1243>>>15;
 var $1245=((($1242)+($1244))|0);
 var $1246=$1245<<1;
 var $1247=((($1245)+(7))|0);
 var $1248=$qsize_0_i_i>>>($1247>>>0);
 var $1249=$1248&1;
 var $1250=$1249|$1246;
 var $I7_0_i_i=$1250;label=289;break;
 case 289: 
 var $I7_0_i_i;
 var $1252=((3592+($I7_0_i_i<<2))|0);
 var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
 var $1253=(($tbase_245_i+$_sum12_i26_i)|0);
 var $1254=$1253;
 HEAP32[(($1254)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
 var $1255=(($tbase_245_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
 var $1256=(($tbase_245_i+$_sum14_i_i)|0);
 var $1257=$1256;
 HEAP32[(($1257)>>2)]=0;
 var $1258=$1255;
 HEAP32[(($1258)>>2)]=0;
 var $1259=HEAP32[((3292)>>2)];
 var $1260=1<<$I7_0_i_i;
 var $1261=$1259&$1260;
 var $1262=($1261|0)==0;
 if($1262){label=290;break;}else{label=291;break;}
 case 290: 
 var $1264=$1259|$1260;
 HEAP32[((3292)>>2)]=$1264;
 HEAP32[(($1252)>>2)]=$1223;
 var $1265=$1252;
 var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
 var $1266=(($tbase_245_i+$_sum15_i_i)|0);
 var $1267=$1266;
 HEAP32[(($1267)>>2)]=$1265;
 var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
 var $1268=(($tbase_245_i+$_sum16_i_i)|0);
 var $1269=$1268;
 HEAP32[(($1269)>>2)]=$1223;
 var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
 var $1270=(($tbase_245_i+$_sum17_i_i)|0);
 var $1271=$1270;
 HEAP32[(($1271)>>2)]=$1223;
 label=303;break;
 case 291: 
 var $1273=HEAP32[(($1252)>>2)];
 var $1274=($I7_0_i_i|0)==31;
 if($1274){var $1279=0;label=293;break;}else{label=292;break;}
 case 292: 
 var $1276=$I7_0_i_i>>>1;
 var $1277=(((25)-($1276))|0);
 var $1279=$1277;label=293;break;
 case 293: 
 var $1279;
 var $1280=$qsize_0_i_i<<$1279;
 var $K8_0_i_i=$1280;var $T_0_i27_i=$1273;label=294;break;
 case 294: 
 var $T_0_i27_i;
 var $K8_0_i_i;
 var $1282=(($T_0_i27_i+4)|0);
 var $1283=HEAP32[(($1282)>>2)];
 var $1284=$1283&-8;
 var $1285=($1284|0)==($qsize_0_i_i|0);
 if($1285){label=299;break;}else{label=295;break;}
 case 295: 
 var $1287=$K8_0_i_i>>>31;
 var $1288=(($T_0_i27_i+16+($1287<<2))|0);
 var $1289=HEAP32[(($1288)>>2)];
 var $1290=($1289|0)==0;
 var $1291=$K8_0_i_i<<1;
 if($1290){label=296;break;}else{var $K8_0_i_i=$1291;var $T_0_i27_i=$1289;label=294;break;}
 case 296: 
 var $1293=$1288;
 var $1294=HEAP32[((3304)>>2)];
 var $1295=($1293>>>0)<($1294>>>0);
 if($1295){label=298;break;}else{label=297;break;}
 case 297: 
 HEAP32[(($1288)>>2)]=$1223;
 var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
 var $1297=(($tbase_245_i+$_sum24_i_i)|0);
 var $1298=$1297;
 HEAP32[(($1298)>>2)]=$T_0_i27_i;
 var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
 var $1299=(($tbase_245_i+$_sum25_i_i)|0);
 var $1300=$1299;
 HEAP32[(($1300)>>2)]=$1223;
 var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
 var $1301=(($tbase_245_i+$_sum26_i_i)|0);
 var $1302=$1301;
 HEAP32[(($1302)>>2)]=$1223;
 label=303;break;
 case 298: 
 _abort();
 throw "Reached an unreachable!";
 case 299: 
 var $1305=(($T_0_i27_i+8)|0);
 var $1306=HEAP32[(($1305)>>2)];
 var $1307=$T_0_i27_i;
 var $1308=HEAP32[((3304)>>2)];
 var $1309=($1307>>>0)<($1308>>>0);
 if($1309){label=302;break;}else{label=300;break;}
 case 300: 
 var $1311=$1306;
 var $1312=($1311>>>0)<($1308>>>0);
 if($1312){label=302;break;}else{label=301;break;}
 case 301: 
 var $1314=(($1306+12)|0);
 HEAP32[(($1314)>>2)]=$1223;
 HEAP32[(($1305)>>2)]=$1223;
 var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
 var $1315=(($tbase_245_i+$_sum21_i_i)|0);
 var $1316=$1315;
 HEAP32[(($1316)>>2)]=$1306;
 var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
 var $1317=(($tbase_245_i+$_sum22_i_i)|0);
 var $1318=$1317;
 HEAP32[(($1318)>>2)]=$T_0_i27_i;
 var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
 var $1319=(($tbase_245_i+$_sum23_i_i)|0);
 var $1320=$1319;
 HEAP32[(($1320)>>2)]=0;
 label=303;break;
 case 302: 
 _abort();
 throw "Reached an unreachable!";
 case 303: 
 var $_sum1819_i_i=$989|8;
 var $1321=(($tbase_245_i+$_sum1819_i_i)|0);
 var $mem_0=$1321;label=341;break;
 case 304: 
 var $1322=$888;
 var $sp_0_i_i_i=3736;label=305;break;
 case 305: 
 var $sp_0_i_i_i;
 var $1324=(($sp_0_i_i_i)|0);
 var $1325=HEAP32[(($1324)>>2)];
 var $1326=($1325>>>0)>($1322>>>0);
 if($1326){label=307;break;}else{label=306;break;}
 case 306: 
 var $1328=(($sp_0_i_i_i+4)|0);
 var $1329=HEAP32[(($1328)>>2)];
 var $1330=(($1325+$1329)|0);
 var $1331=($1330>>>0)>($1322>>>0);
 if($1331){label=308;break;}else{label=307;break;}
 case 307: 
 var $1333=(($sp_0_i_i_i+8)|0);
 var $1334=HEAP32[(($1333)>>2)];
 var $sp_0_i_i_i=$1334;label=305;break;
 case 308: 
 var $_sum_i15_i=((($1329)-(47))|0);
 var $_sum1_i16_i=((($1329)-(39))|0);
 var $1335=(($1325+$_sum1_i16_i)|0);
 var $1336=$1335;
 var $1337=$1336&7;
 var $1338=($1337|0)==0;
 if($1338){var $1343=0;label=310;break;}else{label=309;break;}
 case 309: 
 var $1340=(((-$1336))|0);
 var $1341=$1340&7;
 var $1343=$1341;label=310;break;
 case 310: 
 var $1343;
 var $_sum2_i17_i=((($_sum_i15_i)+($1343))|0);
 var $1344=(($1325+$_sum2_i17_i)|0);
 var $1345=(($888+16)|0);
 var $1346=$1345;
 var $1347=($1344>>>0)<($1346>>>0);
 var $1348=($1347?$1322:$1344);
 var $1349=(($1348+8)|0);
 var $1350=$1349;
 var $1351=((($tsize_244_i)-(40))|0);
 var $1352=(($tbase_245_i+8)|0);
 var $1353=$1352;
 var $1354=$1353&7;
 var $1355=($1354|0)==0;
 if($1355){var $1359=0;label=312;break;}else{label=311;break;}
 case 311: 
 var $1357=(((-$1353))|0);
 var $1358=$1357&7;
 var $1359=$1358;label=312;break;
 case 312: 
 var $1359;
 var $1360=(($tbase_245_i+$1359)|0);
 var $1361=$1360;
 var $1362=((($1351)-($1359))|0);
 HEAP32[((3312)>>2)]=$1361;
 HEAP32[((3300)>>2)]=$1362;
 var $1363=$1362|1;
 var $_sum_i_i_i=((($1359)+(4))|0);
 var $1364=(($tbase_245_i+$_sum_i_i_i)|0);
 var $1365=$1364;
 HEAP32[(($1365)>>2)]=$1363;
 var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
 var $1366=(($tbase_245_i+$_sum2_i_i_i)|0);
 var $1367=$1366;
 HEAP32[(($1367)>>2)]=40;
 var $1368=HEAP32[((2144)>>2)];
 HEAP32[((3316)>>2)]=$1368;
 var $1369=(($1348+4)|0);
 var $1370=$1369;
 HEAP32[(($1370)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1349)>>2)]=HEAP32[((3736)>>2)];HEAP32[((($1349)+(4))>>2)]=HEAP32[((3740)>>2)];HEAP32[((($1349)+(8))>>2)]=HEAP32[((3744)>>2)];HEAP32[((($1349)+(12))>>2)]=HEAP32[((3748)>>2)];
 HEAP32[((3736)>>2)]=$tbase_245_i;
 HEAP32[((3740)>>2)]=$tsize_244_i;
 HEAP32[((3748)>>2)]=0;
 HEAP32[((3744)>>2)]=$1350;
 var $1371=(($1348+28)|0);
 var $1372=$1371;
 HEAP32[(($1372)>>2)]=7;
 var $1373=(($1348+32)|0);
 var $1374=($1373>>>0)<($1330>>>0);
 if($1374){var $1375=$1372;label=313;break;}else{label=314;break;}
 case 313: 
 var $1375;
 var $1376=(($1375+4)|0);
 HEAP32[(($1376)>>2)]=7;
 var $1377=(($1375+8)|0);
 var $1378=$1377;
 var $1379=($1378>>>0)<($1330>>>0);
 if($1379){var $1375=$1376;label=313;break;}else{label=314;break;}
 case 314: 
 var $1380=($1348|0)==($1322|0);
 if($1380){label=338;break;}else{label=315;break;}
 case 315: 
 var $1382=$1348;
 var $1383=$888;
 var $1384=((($1382)-($1383))|0);
 var $1385=(($1322+$1384)|0);
 var $_sum3_i_i=((($1384)+(4))|0);
 var $1386=(($1322+$_sum3_i_i)|0);
 var $1387=$1386;
 var $1388=HEAP32[(($1387)>>2)];
 var $1389=$1388&-2;
 HEAP32[(($1387)>>2)]=$1389;
 var $1390=$1384|1;
 var $1391=(($888+4)|0);
 HEAP32[(($1391)>>2)]=$1390;
 var $1392=$1385;
 HEAP32[(($1392)>>2)]=$1384;
 var $1393=$1384>>>3;
 var $1394=($1384>>>0)<256;
 if($1394){label=316;break;}else{label=321;break;}
 case 316: 
 var $1396=$1393<<1;
 var $1397=((3328+($1396<<2))|0);
 var $1398=$1397;
 var $1399=HEAP32[((3288)>>2)];
 var $1400=1<<$1393;
 var $1401=$1399&$1400;
 var $1402=($1401|0)==0;
 if($1402){label=317;break;}else{label=318;break;}
 case 317: 
 var $1404=$1399|$1400;
 HEAP32[((3288)>>2)]=$1404;
 var $_sum11_pre_i_i=((($1396)+(2))|0);
 var $_pre_i_i=((3328+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1398;var $_pre_phi_i_i=$_pre_i_i;label=320;break;
 case 318: 
 var $_sum12_i_i=((($1396)+(2))|0);
 var $1406=((3328+($_sum12_i_i<<2))|0);
 var $1407=HEAP32[(($1406)>>2)];
 var $1408=$1407;
 var $1409=HEAP32[((3304)>>2)];
 var $1410=($1408>>>0)<($1409>>>0);
 if($1410){label=319;break;}else{var $F_0_i_i=$1407;var $_pre_phi_i_i=$1406;label=320;break;}
 case 319: 
 _abort();
 throw "Reached an unreachable!";
 case 320: 
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$888;
 var $1413=(($F_0_i_i+12)|0);
 HEAP32[(($1413)>>2)]=$888;
 var $1414=(($888+8)|0);
 HEAP32[(($1414)>>2)]=$F_0_i_i;
 var $1415=(($888+12)|0);
 HEAP32[(($1415)>>2)]=$1398;
 label=338;break;
 case 321: 
 var $1417=$888;
 var $1418=$1384>>>8;
 var $1419=($1418|0)==0;
 if($1419){var $I1_0_i_i=0;label=324;break;}else{label=322;break;}
 case 322: 
 var $1421=($1384>>>0)>16777215;
 if($1421){var $I1_0_i_i=31;label=324;break;}else{label=323;break;}
 case 323: 
 var $1423=((($1418)+(1048320))|0);
 var $1424=$1423>>>16;
 var $1425=$1424&8;
 var $1426=$1418<<$1425;
 var $1427=((($1426)+(520192))|0);
 var $1428=$1427>>>16;
 var $1429=$1428&4;
 var $1430=$1429|$1425;
 var $1431=$1426<<$1429;
 var $1432=((($1431)+(245760))|0);
 var $1433=$1432>>>16;
 var $1434=$1433&2;
 var $1435=$1430|$1434;
 var $1436=(((14)-($1435))|0);
 var $1437=$1431<<$1434;
 var $1438=$1437>>>15;
 var $1439=((($1436)+($1438))|0);
 var $1440=$1439<<1;
 var $1441=((($1439)+(7))|0);
 var $1442=$1384>>>($1441>>>0);
 var $1443=$1442&1;
 var $1444=$1443|$1440;
 var $I1_0_i_i=$1444;label=324;break;
 case 324: 
 var $I1_0_i_i;
 var $1446=((3592+($I1_0_i_i<<2))|0);
 var $1447=(($888+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1447)>>2)]=$I1_0_c_i_i;
 var $1448=(($888+20)|0);
 HEAP32[(($1448)>>2)]=0;
 var $1449=(($888+16)|0);
 HEAP32[(($1449)>>2)]=0;
 var $1450=HEAP32[((3292)>>2)];
 var $1451=1<<$I1_0_i_i;
 var $1452=$1450&$1451;
 var $1453=($1452|0)==0;
 if($1453){label=325;break;}else{label=326;break;}
 case 325: 
 var $1455=$1450|$1451;
 HEAP32[((3292)>>2)]=$1455;
 HEAP32[(($1446)>>2)]=$1417;
 var $1456=(($888+24)|0);
 var $_c_i_i=$1446;
 HEAP32[(($1456)>>2)]=$_c_i_i;
 var $1457=(($888+12)|0);
 HEAP32[(($1457)>>2)]=$888;
 var $1458=(($888+8)|0);
 HEAP32[(($1458)>>2)]=$888;
 label=338;break;
 case 326: 
 var $1460=HEAP32[(($1446)>>2)];
 var $1461=($I1_0_i_i|0)==31;
 if($1461){var $1466=0;label=328;break;}else{label=327;break;}
 case 327: 
 var $1463=$I1_0_i_i>>>1;
 var $1464=(((25)-($1463))|0);
 var $1466=$1464;label=328;break;
 case 328: 
 var $1466;
 var $1467=$1384<<$1466;
 var $K2_0_i_i=$1467;var $T_0_i_i=$1460;label=329;break;
 case 329: 
 var $T_0_i_i;
 var $K2_0_i_i;
 var $1469=(($T_0_i_i+4)|0);
 var $1470=HEAP32[(($1469)>>2)];
 var $1471=$1470&-8;
 var $1472=($1471|0)==($1384|0);
 if($1472){label=334;break;}else{label=330;break;}
 case 330: 
 var $1474=$K2_0_i_i>>>31;
 var $1475=(($T_0_i_i+16+($1474<<2))|0);
 var $1476=HEAP32[(($1475)>>2)];
 var $1477=($1476|0)==0;
 var $1478=$K2_0_i_i<<1;
 if($1477){label=331;break;}else{var $K2_0_i_i=$1478;var $T_0_i_i=$1476;label=329;break;}
 case 331: 
 var $1480=$1475;
 var $1481=HEAP32[((3304)>>2)];
 var $1482=($1480>>>0)<($1481>>>0);
 if($1482){label=333;break;}else{label=332;break;}
 case 332: 
 HEAP32[(($1475)>>2)]=$1417;
 var $1484=(($888+24)|0);
 var $T_0_c8_i_i=$T_0_i_i;
 HEAP32[(($1484)>>2)]=$T_0_c8_i_i;
 var $1485=(($888+12)|0);
 HEAP32[(($1485)>>2)]=$888;
 var $1486=(($888+8)|0);
 HEAP32[(($1486)>>2)]=$888;
 label=338;break;
 case 333: 
 _abort();
 throw "Reached an unreachable!";
 case 334: 
 var $1489=(($T_0_i_i+8)|0);
 var $1490=HEAP32[(($1489)>>2)];
 var $1491=$T_0_i_i;
 var $1492=HEAP32[((3304)>>2)];
 var $1493=($1491>>>0)<($1492>>>0);
 if($1493){label=337;break;}else{label=335;break;}
 case 335: 
 var $1495=$1490;
 var $1496=($1495>>>0)<($1492>>>0);
 if($1496){label=337;break;}else{label=336;break;}
 case 336: 
 var $1498=(($1490+12)|0);
 HEAP32[(($1498)>>2)]=$1417;
 HEAP32[(($1489)>>2)]=$1417;
 var $1499=(($888+8)|0);
 var $_c7_i_i=$1490;
 HEAP32[(($1499)>>2)]=$_c7_i_i;
 var $1500=(($888+12)|0);
 var $T_0_c_i_i=$T_0_i_i;
 HEAP32[(($1500)>>2)]=$T_0_c_i_i;
 var $1501=(($888+24)|0);
 HEAP32[(($1501)>>2)]=0;
 label=338;break;
 case 337: 
 _abort();
 throw "Reached an unreachable!";
 case 338: 
 var $1502=HEAP32[((3300)>>2)];
 var $1503=($1502>>>0)>($nb_0>>>0);
 if($1503){label=339;break;}else{label=340;break;}
 case 339: 
 var $1505=((($1502)-($nb_0))|0);
 HEAP32[((3300)>>2)]=$1505;
 var $1506=HEAP32[((3312)>>2)];
 var $1507=$1506;
 var $1508=(($1507+$nb_0)|0);
 var $1509=$1508;
 HEAP32[((3312)>>2)]=$1509;
 var $1510=$1505|1;
 var $_sum_i134=((($nb_0)+(4))|0);
 var $1511=(($1507+$_sum_i134)|0);
 var $1512=$1511;
 HEAP32[(($1512)>>2)]=$1510;
 var $1513=$nb_0|3;
 var $1514=(($1506+4)|0);
 HEAP32[(($1514)>>2)]=$1513;
 var $1515=(($1506+8)|0);
 var $1516=$1515;
 var $mem_0=$1516;label=341;break;
 case 340: 
 var $1517=___errno_location();
 HEAP32[(($1517)>>2)]=12;
 var $mem_0=0;label=341;break;
 case 341: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }

}
Module["_malloc"] = _malloc;

function _free($mem){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($mem|0)==0;
 if($1){label=140;break;}else{label=2;break;}
 case 2: 
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((3304)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=139;break;}else{label=3;break;}
 case 3: 
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=139;break;}else{label=4;break;}
 case 4: 
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5: 
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=140;break;}else{label=6;break;}
 case 6: 
 var $_sum232=(((-8)-($21))|0);
 var $24=(($mem+$_sum232)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=139;break;}else{label=7;break;}
 case 7: 
 var $29=HEAP32[((3308)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8: 
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9: 
 var $_sum276=((($_sum232)+(8))|0);
 var $35=(($mem+$_sum276)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum277=((($_sum232)+(12))|0);
 var $38=(($mem+$_sum277)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((3328+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10: 
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11: 
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12: 
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13: 
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((3288)>>2)];
 var $57=$56&$55;
 HEAP32[((3288)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14: 
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre307=(($40+8)|0);
 var $_pre_phi308=$_pre307;label=18;break;
 case 16: 
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17: 
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi308=$64;label=18;break;}else{label=19;break;}
 case 18: 
 var $_pre_phi308;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi308)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 _abort();
 throw "Reached an unreachable!";
 case 21: 
 var $69=$24;
 var $_sum266=((($_sum232)+(24))|0);
 var $70=(($mem+$_sum266)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum267=((($_sum232)+(12))|0);
 var $73=(($mem+$_sum267)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22: 
 var $_sum273=((($_sum232)+(8))|0);
 var $78=(($mem+$_sum273)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23: 
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24: 
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25: 
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26: 
 _abort();
 throw "Reached an unreachable!";
 case 27: 
 var $_sum269=((($_sum232)+(20))|0);
 var $93=(($mem+$_sum269)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28: 
 var $_sum268=((($_sum232)+(16))|0);
 var $98=(($mem+$_sum268)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29: 
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30: 
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31: 
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33: 
 _abort();
 throw "Reached an unreachable!";
 case 34: 
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35: 
 var $_sum270=((($_sum232)+(28))|0);
 var $117=(($mem+$_sum270)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((3592+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36: 
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37: 
 var $124=1<<$119;
 var $125=$124^-1;
 var $126=HEAP32[((3292)>>2)];
 var $127=$126&$125;
 HEAP32[((3292)>>2)]=$127;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38: 
 var $129=$72;
 var $130=HEAP32[((3304)>>2)];
 var $131=($129>>>0)<($130>>>0);
 if($131){label=42;break;}else{label=39;break;}
 case 39: 
 var $133=(($72+16)|0);
 var $134=HEAP32[(($133)>>2)];
 var $135=($134|0)==($69|0);
 if($135){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($133)>>2)]=$R_1;
 label=43;break;
 case 41: 
 var $138=(($72+20)|0);
 HEAP32[(($138)>>2)]=$R_1;
 label=43;break;
 case 42: 
 _abort();
 throw "Reached an unreachable!";
 case 43: 
 var $141=($R_1|0)==0;
 if($141){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44: 
 var $143=$R_1;
 var $144=HEAP32[((3304)>>2)];
 var $145=($143>>>0)<($144>>>0);
 if($145){label=53;break;}else{label=45;break;}
 case 45: 
 var $147=(($R_1+24)|0);
 HEAP32[(($147)>>2)]=$72;
 var $_sum271=((($_sum232)+(16))|0);
 var $148=(($mem+$_sum271)|0);
 var $149=$148;
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)==0;
 if($151){label=49;break;}else{label=46;break;}
 case 46: 
 var $153=$150;
 var $154=HEAP32[((3304)>>2)];
 var $155=($153>>>0)<($154>>>0);
 if($155){label=48;break;}else{label=47;break;}
 case 47: 
 var $157=(($R_1+16)|0);
 HEAP32[(($157)>>2)]=$150;
 var $158=(($150+24)|0);
 HEAP32[(($158)>>2)]=$R_1;
 label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $_sum272=((($_sum232)+(20))|0);
 var $161=(($mem+$_sum272)|0);
 var $162=$161;
 var $163=HEAP32[(($162)>>2)];
 var $164=($163|0)==0;
 if($164){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50: 
 var $166=$163;
 var $167=HEAP32[((3304)>>2)];
 var $168=($166>>>0)<($167>>>0);
 if($168){label=52;break;}else{label=51;break;}
 case 51: 
 var $170=(($R_1+20)|0);
 HEAP32[(($170)>>2)]=$163;
 var $171=(($163+24)|0);
 HEAP32[(($171)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_sum233=((($14)-(4))|0);
 var $175=(($mem+$_sum233)|0);
 var $176=$175;
 var $177=HEAP32[(($176)>>2)];
 var $178=$177&3;
 var $179=($178|0)==3;
 if($179){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55: 
 HEAP32[((3296)>>2)]=$26;
 var $181=HEAP32[(($176)>>2)];
 var $182=$181&-2;
 HEAP32[(($176)>>2)]=$182;
 var $183=$26|1;
 var $_sum264=((($_sum232)+(4))|0);
 var $184=(($mem+$_sum264)|0);
 var $185=$184;
 HEAP32[(($185)>>2)]=$183;
 var $186=$15;
 HEAP32[(($186)>>2)]=$26;
 label=140;break;
 case 56: 
 var $psize_0;
 var $p_0;
 var $188=$p_0;
 var $189=($188>>>0)<($15>>>0);
 if($189){label=57;break;}else{label=139;break;}
 case 57: 
 var $_sum263=((($14)-(4))|0);
 var $191=(($mem+$_sum263)|0);
 var $192=$191;
 var $193=HEAP32[(($192)>>2)];
 var $194=$193&1;
 var $phitmp=($194|0)==0;
 if($phitmp){label=139;break;}else{label=58;break;}
 case 58: 
 var $196=$193&2;
 var $197=($196|0)==0;
 if($197){label=59;break;}else{label=112;break;}
 case 59: 
 var $199=HEAP32[((3312)>>2)];
 var $200=($16|0)==($199|0);
 if($200){label=60;break;}else{label=62;break;}
 case 60: 
 var $202=HEAP32[((3300)>>2)];
 var $203=((($202)+($psize_0))|0);
 HEAP32[((3300)>>2)]=$203;
 HEAP32[((3312)>>2)]=$p_0;
 var $204=$203|1;
 var $205=(($p_0+4)|0);
 HEAP32[(($205)>>2)]=$204;
 var $206=HEAP32[((3308)>>2)];
 var $207=($p_0|0)==($206|0);
 if($207){label=61;break;}else{label=140;break;}
 case 61: 
 HEAP32[((3308)>>2)]=0;
 HEAP32[((3296)>>2)]=0;
 label=140;break;
 case 62: 
 var $210=HEAP32[((3308)>>2)];
 var $211=($16|0)==($210|0);
 if($211){label=63;break;}else{label=64;break;}
 case 63: 
 var $213=HEAP32[((3296)>>2)];
 var $214=((($213)+($psize_0))|0);
 HEAP32[((3296)>>2)]=$214;
 HEAP32[((3308)>>2)]=$p_0;
 var $215=$214|1;
 var $216=(($p_0+4)|0);
 HEAP32[(($216)>>2)]=$215;
 var $217=(($188+$214)|0);
 var $218=$217;
 HEAP32[(($218)>>2)]=$214;
 label=140;break;
 case 64: 
 var $220=$193&-8;
 var $221=((($220)+($psize_0))|0);
 var $222=$193>>>3;
 var $223=($193>>>0)<256;
 if($223){label=65;break;}else{label=77;break;}
 case 65: 
 var $225=(($mem+$14)|0);
 var $226=$225;
 var $227=HEAP32[(($226)>>2)];
 var $_sum257258=$14|4;
 var $228=(($mem+$_sum257258)|0);
 var $229=$228;
 var $230=HEAP32[(($229)>>2)];
 var $231=$222<<1;
 var $232=((3328+($231<<2))|0);
 var $233=$232;
 var $234=($227|0)==($233|0);
 if($234){label=68;break;}else{label=66;break;}
 case 66: 
 var $236=$227;
 var $237=HEAP32[((3304)>>2)];
 var $238=($236>>>0)<($237>>>0);
 if($238){label=76;break;}else{label=67;break;}
 case 67: 
 var $240=(($227+12)|0);
 var $241=HEAP32[(($240)>>2)];
 var $242=($241|0)==($16|0);
 if($242){label=68;break;}else{label=76;break;}
 case 68: 
 var $243=($230|0)==($227|0);
 if($243){label=69;break;}else{label=70;break;}
 case 69: 
 var $245=1<<$222;
 var $246=$245^-1;
 var $247=HEAP32[((3288)>>2)];
 var $248=$247&$246;
 HEAP32[((3288)>>2)]=$248;
 label=110;break;
 case 70: 
 var $250=($230|0)==($233|0);
 if($250){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre305=(($230+8)|0);
 var $_pre_phi306=$_pre305;label=74;break;
 case 72: 
 var $252=$230;
 var $253=HEAP32[((3304)>>2)];
 var $254=($252>>>0)<($253>>>0);
 if($254){label=75;break;}else{label=73;break;}
 case 73: 
 var $256=(($230+8)|0);
 var $257=HEAP32[(($256)>>2)];
 var $258=($257|0)==($16|0);
 if($258){var $_pre_phi306=$256;label=74;break;}else{label=75;break;}
 case 74: 
 var $_pre_phi306;
 var $259=(($227+12)|0);
 HEAP32[(($259)>>2)]=$230;
 HEAP32[(($_pre_phi306)>>2)]=$227;
 label=110;break;
 case 75: 
 _abort();
 throw "Reached an unreachable!";
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $261=$15;
 var $_sum235=((($14)+(16))|0);
 var $262=(($mem+$_sum235)|0);
 var $263=$262;
 var $264=HEAP32[(($263)>>2)];
 var $_sum236237=$14|4;
 var $265=(($mem+$_sum236237)|0);
 var $266=$265;
 var $267=HEAP32[(($266)>>2)];
 var $268=($267|0)==($261|0);
 if($268){label=83;break;}else{label=78;break;}
 case 78: 
 var $270=(($mem+$14)|0);
 var $271=$270;
 var $272=HEAP32[(($271)>>2)];
 var $273=$272;
 var $274=HEAP32[((3304)>>2)];
 var $275=($273>>>0)<($274>>>0);
 if($275){label=82;break;}else{label=79;break;}
 case 79: 
 var $277=(($272+12)|0);
 var $278=HEAP32[(($277)>>2)];
 var $279=($278|0)==($261|0);
 if($279){label=80;break;}else{label=82;break;}
 case 80: 
 var $281=(($267+8)|0);
 var $282=HEAP32[(($281)>>2)];
 var $283=($282|0)==($261|0);
 if($283){label=81;break;}else{label=82;break;}
 case 81: 
 HEAP32[(($277)>>2)]=$267;
 HEAP32[(($281)>>2)]=$272;
 var $R7_1=$267;label=90;break;
 case 82: 
 _abort();
 throw "Reached an unreachable!";
 case 83: 
 var $_sum239=((($14)+(12))|0);
 var $286=(($mem+$_sum239)|0);
 var $287=$286;
 var $288=HEAP32[(($287)>>2)];
 var $289=($288|0)==0;
 if($289){label=84;break;}else{var $R7_0=$288;var $RP9_0=$287;label=85;break;}
 case 84: 
 var $_sum238=((($14)+(8))|0);
 var $291=(($mem+$_sum238)|0);
 var $292=$291;
 var $293=HEAP32[(($292)>>2)];
 var $294=($293|0)==0;
 if($294){var $R7_1=0;label=90;break;}else{var $R7_0=$293;var $RP9_0=$292;label=85;break;}
 case 85: 
 var $RP9_0;
 var $R7_0;
 var $295=(($R7_0+20)|0);
 var $296=HEAP32[(($295)>>2)];
 var $297=($296|0)==0;
 if($297){label=86;break;}else{var $R7_0=$296;var $RP9_0=$295;label=85;break;}
 case 86: 
 var $299=(($R7_0+16)|0);
 var $300=HEAP32[(($299)>>2)];
 var $301=($300|0)==0;
 if($301){label=87;break;}else{var $R7_0=$300;var $RP9_0=$299;label=85;break;}
 case 87: 
 var $303=$RP9_0;
 var $304=HEAP32[((3304)>>2)];
 var $305=($303>>>0)<($304>>>0);
 if($305){label=89;break;}else{label=88;break;}
 case 88: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89: 
 _abort();
 throw "Reached an unreachable!";
 case 90: 
 var $R7_1;
 var $309=($264|0)==0;
 if($309){label=110;break;}else{label=91;break;}
 case 91: 
 var $_sum250=((($14)+(20))|0);
 var $311=(($mem+$_sum250)|0);
 var $312=$311;
 var $313=HEAP32[(($312)>>2)];
 var $314=((3592+($313<<2))|0);
 var $315=HEAP32[(($314)>>2)];
 var $316=($261|0)==($315|0);
 if($316){label=92;break;}else{label=94;break;}
 case 92: 
 HEAP32[(($314)>>2)]=$R7_1;
 var $cond298=($R7_1|0)==0;
 if($cond298){label=93;break;}else{label=100;break;}
 case 93: 
 var $318=1<<$313;
 var $319=$318^-1;
 var $320=HEAP32[((3292)>>2)];
 var $321=$320&$319;
 HEAP32[((3292)>>2)]=$321;
 label=110;break;
 case 94: 
 var $323=$264;
 var $324=HEAP32[((3304)>>2)];
 var $325=($323>>>0)<($324>>>0);
 if($325){label=98;break;}else{label=95;break;}
 case 95: 
 var $327=(($264+16)|0);
 var $328=HEAP32[(($327)>>2)];
 var $329=($328|0)==($261|0);
 if($329){label=96;break;}else{label=97;break;}
 case 96: 
 HEAP32[(($327)>>2)]=$R7_1;
 label=99;break;
 case 97: 
 var $332=(($264+20)|0);
 HEAP32[(($332)>>2)]=$R7_1;
 label=99;break;
 case 98: 
 _abort();
 throw "Reached an unreachable!";
 case 99: 
 var $335=($R7_1|0)==0;
 if($335){label=110;break;}else{label=100;break;}
 case 100: 
 var $337=$R7_1;
 var $338=HEAP32[((3304)>>2)];
 var $339=($337>>>0)<($338>>>0);
 if($339){label=109;break;}else{label=101;break;}
 case 101: 
 var $341=(($R7_1+24)|0);
 HEAP32[(($341)>>2)]=$264;
 var $_sum251=((($14)+(8))|0);
 var $342=(($mem+$_sum251)|0);
 var $343=$342;
 var $344=HEAP32[(($343)>>2)];
 var $345=($344|0)==0;
 if($345){label=105;break;}else{label=102;break;}
 case 102: 
 var $347=$344;
 var $348=HEAP32[((3304)>>2)];
 var $349=($347>>>0)<($348>>>0);
 if($349){label=104;break;}else{label=103;break;}
 case 103: 
 var $351=(($R7_1+16)|0);
 HEAP32[(($351)>>2)]=$344;
 var $352=(($344+24)|0);
 HEAP32[(($352)>>2)]=$R7_1;
 label=105;break;
 case 104: 
 _abort();
 throw "Reached an unreachable!";
 case 105: 
 var $_sum252=((($14)+(12))|0);
 var $355=(($mem+$_sum252)|0);
 var $356=$355;
 var $357=HEAP32[(($356)>>2)];
 var $358=($357|0)==0;
 if($358){label=110;break;}else{label=106;break;}
 case 106: 
 var $360=$357;
 var $361=HEAP32[((3304)>>2)];
 var $362=($360>>>0)<($361>>>0);
 if($362){label=108;break;}else{label=107;break;}
 case 107: 
 var $364=(($R7_1+20)|0);
 HEAP32[(($364)>>2)]=$357;
 var $365=(($357+24)|0);
 HEAP32[(($365)>>2)]=$R7_1;
 label=110;break;
 case 108: 
 _abort();
 throw "Reached an unreachable!";
 case 109: 
 _abort();
 throw "Reached an unreachable!";
 case 110: 
 var $368=$221|1;
 var $369=(($p_0+4)|0);
 HEAP32[(($369)>>2)]=$368;
 var $370=(($188+$221)|0);
 var $371=$370;
 HEAP32[(($371)>>2)]=$221;
 var $372=HEAP32[((3308)>>2)];
 var $373=($p_0|0)==($372|0);
 if($373){label=111;break;}else{var $psize_1=$221;label=113;break;}
 case 111: 
 HEAP32[((3296)>>2)]=$221;
 label=140;break;
 case 112: 
 var $376=$193&-2;
 HEAP32[(($192)>>2)]=$376;
 var $377=$psize_0|1;
 var $378=(($p_0+4)|0);
 HEAP32[(($378)>>2)]=$377;
 var $379=(($188+$psize_0)|0);
 var $380=$379;
 HEAP32[(($380)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113: 
 var $psize_1;
 var $382=$psize_1>>>3;
 var $383=($psize_1>>>0)<256;
 if($383){label=114;break;}else{label=119;break;}
 case 114: 
 var $385=$382<<1;
 var $386=((3328+($385<<2))|0);
 var $387=$386;
 var $388=HEAP32[((3288)>>2)];
 var $389=1<<$382;
 var $390=$388&$389;
 var $391=($390|0)==0;
 if($391){label=115;break;}else{label=116;break;}
 case 115: 
 var $393=$388|$389;
 HEAP32[((3288)>>2)]=$393;
 var $_sum248_pre=((($385)+(2))|0);
 var $_pre=((3328+($_sum248_pre<<2))|0);
 var $F16_0=$387;var $_pre_phi=$_pre;label=118;break;
 case 116: 
 var $_sum249=((($385)+(2))|0);
 var $395=((3328+($_sum249<<2))|0);
 var $396=HEAP32[(($395)>>2)];
 var $397=$396;
 var $398=HEAP32[((3304)>>2)];
 var $399=($397>>>0)<($398>>>0);
 if($399){label=117;break;}else{var $F16_0=$396;var $_pre_phi=$395;label=118;break;}
 case 117: 
 _abort();
 throw "Reached an unreachable!";
 case 118: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $402=(($F16_0+12)|0);
 HEAP32[(($402)>>2)]=$p_0;
 var $403=(($p_0+8)|0);
 HEAP32[(($403)>>2)]=$F16_0;
 var $404=(($p_0+12)|0);
 HEAP32[(($404)>>2)]=$387;
 label=140;break;
 case 119: 
 var $406=$p_0;
 var $407=$psize_1>>>8;
 var $408=($407|0)==0;
 if($408){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120: 
 var $410=($psize_1>>>0)>16777215;
 if($410){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121: 
 var $412=((($407)+(1048320))|0);
 var $413=$412>>>16;
 var $414=$413&8;
 var $415=$407<<$414;
 var $416=((($415)+(520192))|0);
 var $417=$416>>>16;
 var $418=$417&4;
 var $419=$418|$414;
 var $420=$415<<$418;
 var $421=((($420)+(245760))|0);
 var $422=$421>>>16;
 var $423=$422&2;
 var $424=$419|$423;
 var $425=(((14)-($424))|0);
 var $426=$420<<$423;
 var $427=$426>>>15;
 var $428=((($425)+($427))|0);
 var $429=$428<<1;
 var $430=((($428)+(7))|0);
 var $431=$psize_1>>>($430>>>0);
 var $432=$431&1;
 var $433=$432|$429;
 var $I18_0=$433;label=122;break;
 case 122: 
 var $I18_0;
 var $435=((3592+($I18_0<<2))|0);
 var $436=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($436)>>2)]=$I18_0_c;
 var $437=(($p_0+20)|0);
 HEAP32[(($437)>>2)]=0;
 var $438=(($p_0+16)|0);
 HEAP32[(($438)>>2)]=0;
 var $439=HEAP32[((3292)>>2)];
 var $440=1<<$I18_0;
 var $441=$439&$440;
 var $442=($441|0)==0;
 if($442){label=123;break;}else{label=124;break;}
 case 123: 
 var $444=$439|$440;
 HEAP32[((3292)>>2)]=$444;
 HEAP32[(($435)>>2)]=$406;
 var $445=(($p_0+24)|0);
 var $_c=$435;
 HEAP32[(($445)>>2)]=$_c;
 var $446=(($p_0+12)|0);
 HEAP32[(($446)>>2)]=$p_0;
 var $447=(($p_0+8)|0);
 HEAP32[(($447)>>2)]=$p_0;
 label=136;break;
 case 124: 
 var $449=HEAP32[(($435)>>2)];
 var $450=($I18_0|0)==31;
 if($450){var $455=0;label=126;break;}else{label=125;break;}
 case 125: 
 var $452=$I18_0>>>1;
 var $453=(((25)-($452))|0);
 var $455=$453;label=126;break;
 case 126: 
 var $455;
 var $456=$psize_1<<$455;
 var $K19_0=$456;var $T_0=$449;label=127;break;
 case 127: 
 var $T_0;
 var $K19_0;
 var $458=(($T_0+4)|0);
 var $459=HEAP32[(($458)>>2)];
 var $460=$459&-8;
 var $461=($460|0)==($psize_1|0);
 if($461){label=132;break;}else{label=128;break;}
 case 128: 
 var $463=$K19_0>>>31;
 var $464=(($T_0+16+($463<<2))|0);
 var $465=HEAP32[(($464)>>2)];
 var $466=($465|0)==0;
 var $467=$K19_0<<1;
 if($466){label=129;break;}else{var $K19_0=$467;var $T_0=$465;label=127;break;}
 case 129: 
 var $469=$464;
 var $470=HEAP32[((3304)>>2)];
 var $471=($469>>>0)<($470>>>0);
 if($471){label=131;break;}else{label=130;break;}
 case 130: 
 HEAP32[(($464)>>2)]=$406;
 var $473=(($p_0+24)|0);
 var $T_0_c245=$T_0;
 HEAP32[(($473)>>2)]=$T_0_c245;
 var $474=(($p_0+12)|0);
 HEAP32[(($474)>>2)]=$p_0;
 var $475=(($p_0+8)|0);
 HEAP32[(($475)>>2)]=$p_0;
 label=136;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 var $478=(($T_0+8)|0);
 var $479=HEAP32[(($478)>>2)];
 var $480=$T_0;
 var $481=HEAP32[((3304)>>2)];
 var $482=($480>>>0)<($481>>>0);
 if($482){label=135;break;}else{label=133;break;}
 case 133: 
 var $484=$479;
 var $485=($484>>>0)<($481>>>0);
 if($485){label=135;break;}else{label=134;break;}
 case 134: 
 var $487=(($479+12)|0);
 HEAP32[(($487)>>2)]=$406;
 HEAP32[(($478)>>2)]=$406;
 var $488=(($p_0+8)|0);
 var $_c244=$479;
 HEAP32[(($488)>>2)]=$_c244;
 var $489=(($p_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($489)>>2)]=$T_0_c;
 var $490=(($p_0+24)|0);
 HEAP32[(($490)>>2)]=0;
 label=136;break;
 case 135: 
 _abort();
 throw "Reached an unreachable!";
 case 136: 
 var $492=HEAP32[((3320)>>2)];
 var $493=((($492)-(1))|0);
 HEAP32[((3320)>>2)]=$493;
 var $494=($493|0)==0;
 if($494){var $sp_0_in_i=3744;label=137;break;}else{label=140;break;}
 case 137: 
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $495=($sp_0_i|0)==0;
 var $496=(($sp_0_i+8)|0);
 if($495){label=138;break;}else{var $sp_0_in_i=$496;label=137;break;}
 case 138: 
 HEAP32[((3320)>>2)]=-1;
 label=140;break;
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 return;
  default: assert(0, "bad label: " + label);
 }

}
Module["_free"] = _free;

function _calloc($n_elements,$elem_size){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($n_elements|0)==0;
 if($1){var $req_0=0;label=4;break;}else{label=2;break;}
 case 2: 
 var $3=(Math_imul($elem_size,$n_elements)|0);
 var $4=$elem_size|$n_elements;
 var $5=($4>>>0)>65535;
 if($5){label=3;break;}else{var $req_0=$3;label=4;break;}
 case 3: 
 var $7=(((($3>>>0))/(($n_elements>>>0)))&-1);
 var $8=($7|0)==($elem_size|0);
 var $_=($8?$3:-1);
 var $req_0=$_;label=4;break;
 case 4: 
 var $req_0;
 var $10=_malloc($req_0);
 var $11=($10|0)==0;
 if($11){label=7;break;}else{label=5;break;}
 case 5: 
 var $13=((($10)-(4))|0);
 var $14=$13;
 var $15=HEAP32[(($14)>>2)];
 var $16=$15&3;
 var $17=($16|0)==0;
 if($17){label=7;break;}else{label=6;break;}
 case 6: 
 _memset($10, 0, $req_0)|0;
 label=7;break;
 case 7: 
 return $10;
  default: assert(0, "bad label: " + label);
 }

}
Module["_calloc"] = _calloc;

function _realloc($oldmem,$bytes){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($oldmem|0)==0;
 if($1){label=2;break;}else{label=3;break;}
 case 2: 
 var $3=_malloc($bytes);
 var $mem_0=$3;label=11;break;
 case 3: 
 var $5=($bytes>>>0)>4294967231;
 if($5){label=4;break;}else{label=5;break;}
 case 4: 
 var $7=___errno_location();
 HEAP32[(($7)>>2)]=12;
 var $mem_0=0;label=11;break;
 case 5: 
 var $9=($bytes>>>0)<11;
 if($9){var $14=16;label=7;break;}else{label=6;break;}
 case 6: 
 var $11=((($bytes)+(11))|0);
 var $12=$11&-8;
 var $14=$12;label=7;break;
 case 7: 
 var $14;
 var $15=((($oldmem)-(8))|0);
 var $16=$15;
 var $17=_try_realloc_chunk($16,$14);
 var $18=($17|0)==0;
 if($18){label=9;break;}else{label=8;break;}
 case 8: 
 var $20=(($17+8)|0);
 var $21=$20;
 var $mem_0=$21;label=11;break;
 case 9: 
 var $23=_malloc($bytes);
 var $24=($23|0)==0;
 if($24){var $mem_0=0;label=11;break;}else{label=10;break;}
 case 10: 
 var $26=((($oldmem)-(4))|0);
 var $27=$26;
 var $28=HEAP32[(($27)>>2)];
 var $29=$28&-8;
 var $30=$28&3;
 var $31=($30|0)==0;
 var $32=($31?8:4);
 var $33=((($29)-($32))|0);
 var $34=($33>>>0)<($bytes>>>0);
 var $35=($34?$33:$bytes);
 assert($35 % 1 === 0);(_memcpy($23, $oldmem, $35)|0);
 _free($oldmem);
 var $mem_0=$23;label=11;break;
 case 11: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }

}
Module["_realloc"] = _realloc;

function _try_realloc_chunk($p,$nb){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($p+4)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=$2&-8;
 var $4=$p;
 var $5=(($4+$3)|0);
 var $6=$5;
 var $7=HEAP32[((3304)>>2)];
 var $8=($4>>>0)<($7>>>0);
 if($8){label=72;break;}else{label=2;break;}
 case 2: 
 var $10=$2&3;
 var $11=($10|0)!=1;
 var $12=($4>>>0)<($5>>>0);
 var $or_cond=$11&$12;
 if($or_cond){label=3;break;}else{label=72;break;}
 case 3: 
 var $_sum3334=$3|4;
 var $14=(($4+$_sum3334)|0);
 var $15=$14;
 var $16=HEAP32[(($15)>>2)];
 var $17=$16&1;
 var $phitmp=($17|0)==0;
 if($phitmp){label=72;break;}else{label=4;break;}
 case 4: 
 var $19=($10|0)==0;
 if($19){label=5;break;}else{label=9;break;}
 case 5: 
 var $21=($nb>>>0)<256;
 if($21){var $newp_0=0;label=73;break;}else{label=6;break;}
 case 6: 
 var $23=((($nb)+(4))|0);
 var $24=($3>>>0)<($23>>>0);
 if($24){label=8;break;}else{label=7;break;}
 case 7: 
 var $26=((($3)-($nb))|0);
 var $27=HEAP32[((2136)>>2)];
 var $28=$27<<1;
 var $29=($26>>>0)>($28>>>0);
 if($29){label=8;break;}else{var $newp_0=$p;label=73;break;}
 case 8: 
 var $newp_0=0;label=73;break;
 case 9: 
 var $32=($3>>>0)<($nb>>>0);
 if($32){label=12;break;}else{label=10;break;}
 case 10: 
 var $34=((($3)-($nb))|0);
 var $35=($34>>>0)>15;
 if($35){label=11;break;}else{var $newp_0=$p;label=73;break;}
 case 11: 
 var $37=(($4+$nb)|0);
 var $38=$37;
 var $39=$2&1;
 var $40=$39|$nb;
 var $41=$40|2;
 HEAP32[(($1)>>2)]=$41;
 var $_sum29=((($nb)+(4))|0);
 var $42=(($4+$_sum29)|0);
 var $43=$42;
 var $44=$34|3;
 HEAP32[(($43)>>2)]=$44;
 var $45=HEAP32[(($15)>>2)];
 var $46=$45|1;
 HEAP32[(($15)>>2)]=$46;
 _dispose_chunk($38,$34);
 var $newp_0=$p;label=73;break;
 case 12: 
 var $48=HEAP32[((3312)>>2)];
 var $49=($6|0)==($48|0);
 if($49){label=13;break;}else{label=15;break;}
 case 13: 
 var $51=HEAP32[((3300)>>2)];
 var $52=((($51)+($3))|0);
 var $53=($52>>>0)>($nb>>>0);
 if($53){label=14;break;}else{var $newp_0=0;label=73;break;}
 case 14: 
 var $55=((($52)-($nb))|0);
 var $56=(($4+$nb)|0);
 var $57=$56;
 var $58=$2&1;
 var $59=$58|$nb;
 var $60=$59|2;
 HEAP32[(($1)>>2)]=$60;
 var $_sum28=((($nb)+(4))|0);
 var $61=(($4+$_sum28)|0);
 var $62=$61;
 var $63=$55|1;
 HEAP32[(($62)>>2)]=$63;
 HEAP32[((3312)>>2)]=$57;
 HEAP32[((3300)>>2)]=$55;
 var $newp_0=$p;label=73;break;
 case 15: 
 var $65=HEAP32[((3308)>>2)];
 var $66=($6|0)==($65|0);
 if($66){label=16;break;}else{label=21;break;}
 case 16: 
 var $68=HEAP32[((3296)>>2)];
 var $69=((($68)+($3))|0);
 var $70=($69>>>0)<($nb>>>0);
 if($70){var $newp_0=0;label=73;break;}else{label=17;break;}
 case 17: 
 var $72=((($69)-($nb))|0);
 var $73=($72>>>0)>15;
 if($73){label=18;break;}else{label=19;break;}
 case 18: 
 var $75=(($4+$nb)|0);
 var $76=$75;
 var $77=(($4+$69)|0);
 var $78=$2&1;
 var $79=$78|$nb;
 var $80=$79|2;
 HEAP32[(($1)>>2)]=$80;
 var $_sum25=((($nb)+(4))|0);
 var $81=(($4+$_sum25)|0);
 var $82=$81;
 var $83=$72|1;
 HEAP32[(($82)>>2)]=$83;
 var $84=$77;
 HEAP32[(($84)>>2)]=$72;
 var $_sum26=((($69)+(4))|0);
 var $85=(($4+$_sum26)|0);
 var $86=$85;
 var $87=HEAP32[(($86)>>2)];
 var $88=$87&-2;
 HEAP32[(($86)>>2)]=$88;
 var $storemerge=$76;var $storemerge27=$72;label=20;break;
 case 19: 
 var $90=$2&1;
 var $91=$90|$69;
 var $92=$91|2;
 HEAP32[(($1)>>2)]=$92;
 var $_sum23=((($69)+(4))|0);
 var $93=(($4+$_sum23)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=$95|1;
 HEAP32[(($94)>>2)]=$96;
 var $storemerge=0;var $storemerge27=0;label=20;break;
 case 20: 
 var $storemerge27;
 var $storemerge;
 HEAP32[((3296)>>2)]=$storemerge27;
 HEAP32[((3308)>>2)]=$storemerge;
 var $newp_0=$p;label=73;break;
 case 21: 
 var $99=$16&2;
 var $100=($99|0)==0;
 if($100){label=22;break;}else{var $newp_0=0;label=73;break;}
 case 22: 
 var $102=$16&-8;
 var $103=((($102)+($3))|0);
 var $104=($103>>>0)<($nb>>>0);
 if($104){var $newp_0=0;label=73;break;}else{label=23;break;}
 case 23: 
 var $106=((($103)-($nb))|0);
 var $107=$16>>>3;
 var $108=($16>>>0)<256;
 if($108){label=24;break;}else{label=36;break;}
 case 24: 
 var $_sum17=((($3)+(8))|0);
 var $110=(($4+$_sum17)|0);
 var $111=$110;
 var $112=HEAP32[(($111)>>2)];
 var $_sum18=((($3)+(12))|0);
 var $113=(($4+$_sum18)|0);
 var $114=$113;
 var $115=HEAP32[(($114)>>2)];
 var $116=$107<<1;
 var $117=((3328+($116<<2))|0);
 var $118=$117;
 var $119=($112|0)==($118|0);
 if($119){label=27;break;}else{label=25;break;}
 case 25: 
 var $121=$112;
 var $122=($121>>>0)<($7>>>0);
 if($122){label=35;break;}else{label=26;break;}
 case 26: 
 var $124=(($112+12)|0);
 var $125=HEAP32[(($124)>>2)];
 var $126=($125|0)==($6|0);
 if($126){label=27;break;}else{label=35;break;}
 case 27: 
 var $127=($115|0)==($112|0);
 if($127){label=28;break;}else{label=29;break;}
 case 28: 
 var $129=1<<$107;
 var $130=$129^-1;
 var $131=HEAP32[((3288)>>2)];
 var $132=$131&$130;
 HEAP32[((3288)>>2)]=$132;
 label=69;break;
 case 29: 
 var $134=($115|0)==($118|0);
 if($134){label=30;break;}else{label=31;break;}
 case 30: 
 var $_pre=(($115+8)|0);
 var $_pre_phi=$_pre;label=33;break;
 case 31: 
 var $136=$115;
 var $137=($136>>>0)<($7>>>0);
 if($137){label=34;break;}else{label=32;break;}
 case 32: 
 var $139=(($115+8)|0);
 var $140=HEAP32[(($139)>>2)];
 var $141=($140|0)==($6|0);
 if($141){var $_pre_phi=$139;label=33;break;}else{label=34;break;}
 case 33: 
 var $_pre_phi;
 var $142=(($112+12)|0);
 HEAP32[(($142)>>2)]=$115;
 HEAP32[(($_pre_phi)>>2)]=$112;
 label=69;break;
 case 34: 
 _abort();
 throw "Reached an unreachable!";
 case 35: 
 _abort();
 throw "Reached an unreachable!";
 case 36: 
 var $144=$5;
 var $_sum=((($3)+(24))|0);
 var $145=(($4+$_sum)|0);
 var $146=$145;
 var $147=HEAP32[(($146)>>2)];
 var $_sum2=((($3)+(12))|0);
 var $148=(($4+$_sum2)|0);
 var $149=$148;
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)==($144|0);
 if($151){label=42;break;}else{label=37;break;}
 case 37: 
 var $_sum14=((($3)+(8))|0);
 var $153=(($4+$_sum14)|0);
 var $154=$153;
 var $155=HEAP32[(($154)>>2)];
 var $156=$155;
 var $157=($156>>>0)<($7>>>0);
 if($157){label=41;break;}else{label=38;break;}
 case 38: 
 var $159=(($155+12)|0);
 var $160=HEAP32[(($159)>>2)];
 var $161=($160|0)==($144|0);
 if($161){label=39;break;}else{label=41;break;}
 case 39: 
 var $163=(($150+8)|0);
 var $164=HEAP32[(($163)>>2)];
 var $165=($164|0)==($144|0);
 if($165){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($159)>>2)]=$150;
 HEAP32[(($163)>>2)]=$155;
 var $R_1=$150;label=49;break;
 case 41: 
 _abort();
 throw "Reached an unreachable!";
 case 42: 
 var $_sum4=((($3)+(20))|0);
 var $168=(($4+$_sum4)|0);
 var $169=$168;
 var $170=HEAP32[(($169)>>2)];
 var $171=($170|0)==0;
 if($171){label=43;break;}else{var $R_0=$170;var $RP_0=$169;label=44;break;}
 case 43: 
 var $_sum3=((($3)+(16))|0);
 var $173=(($4+$_sum3)|0);
 var $174=$173;
 var $175=HEAP32[(($174)>>2)];
 var $176=($175|0)==0;
 if($176){var $R_1=0;label=49;break;}else{var $R_0=$175;var $RP_0=$174;label=44;break;}
 case 44: 
 var $RP_0;
 var $R_0;
 var $177=(($R_0+20)|0);
 var $178=HEAP32[(($177)>>2)];
 var $179=($178|0)==0;
 if($179){label=45;break;}else{var $R_0=$178;var $RP_0=$177;label=44;break;}
 case 45: 
 var $181=(($R_0+16)|0);
 var $182=HEAP32[(($181)>>2)];
 var $183=($182|0)==0;
 if($183){label=46;break;}else{var $R_0=$182;var $RP_0=$181;label=44;break;}
 case 46: 
 var $185=$RP_0;
 var $186=($185>>>0)<($7>>>0);
 if($186){label=48;break;}else{label=47;break;}
 case 47: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $R_1;
 var $190=($147|0)==0;
 if($190){label=69;break;}else{label=50;break;}
 case 50: 
 var $_sum11=((($3)+(28))|0);
 var $192=(($4+$_sum11)|0);
 var $193=$192;
 var $194=HEAP32[(($193)>>2)];
 var $195=((3592+($194<<2))|0);
 var $196=HEAP32[(($195)>>2)];
 var $197=($144|0)==($196|0);
 if($197){label=51;break;}else{label=53;break;}
 case 51: 
 HEAP32[(($195)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=52;break;}else{label=59;break;}
 case 52: 
 var $199=1<<$194;
 var $200=$199^-1;
 var $201=HEAP32[((3292)>>2)];
 var $202=$201&$200;
 HEAP32[((3292)>>2)]=$202;
 label=69;break;
 case 53: 
 var $204=$147;
 var $205=HEAP32[((3304)>>2)];
 var $206=($204>>>0)<($205>>>0);
 if($206){label=57;break;}else{label=54;break;}
 case 54: 
 var $208=(($147+16)|0);
 var $209=HEAP32[(($208)>>2)];
 var $210=($209|0)==($144|0);
 if($210){label=55;break;}else{label=56;break;}
 case 55: 
 HEAP32[(($208)>>2)]=$R_1;
 label=58;break;
 case 56: 
 var $213=(($147+20)|0);
 HEAP32[(($213)>>2)]=$R_1;
 label=58;break;
 case 57: 
 _abort();
 throw "Reached an unreachable!";
 case 58: 
 var $216=($R_1|0)==0;
 if($216){label=69;break;}else{label=59;break;}
 case 59: 
 var $218=$R_1;
 var $219=HEAP32[((3304)>>2)];
 var $220=($218>>>0)<($219>>>0);
 if($220){label=68;break;}else{label=60;break;}
 case 60: 
 var $222=(($R_1+24)|0);
 HEAP32[(($222)>>2)]=$147;
 var $_sum12=((($3)+(16))|0);
 var $223=(($4+$_sum12)|0);
 var $224=$223;
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){label=64;break;}else{label=61;break;}
 case 61: 
 var $228=$225;
 var $229=HEAP32[((3304)>>2)];
 var $230=($228>>>0)<($229>>>0);
 if($230){label=63;break;}else{label=62;break;}
 case 62: 
 var $232=(($R_1+16)|0);
 HEAP32[(($232)>>2)]=$225;
 var $233=(($225+24)|0);
 HEAP32[(($233)>>2)]=$R_1;
 label=64;break;
 case 63: 
 _abort();
 throw "Reached an unreachable!";
 case 64: 
 var $_sum13=((($3)+(20))|0);
 var $236=(($4+$_sum13)|0);
 var $237=$236;
 var $238=HEAP32[(($237)>>2)];
 var $239=($238|0)==0;
 if($239){label=69;break;}else{label=65;break;}
 case 65: 
 var $241=$238;
 var $242=HEAP32[((3304)>>2)];
 var $243=($241>>>0)<($242>>>0);
 if($243){label=67;break;}else{label=66;break;}
 case 66: 
 var $245=(($R_1+20)|0);
 HEAP32[(($245)>>2)]=$238;
 var $246=(($238+24)|0);
 HEAP32[(($246)>>2)]=$R_1;
 label=69;break;
 case 67: 
 _abort();
 throw "Reached an unreachable!";
 case 68: 
 _abort();
 throw "Reached an unreachable!";
 case 69: 
 var $250=($106>>>0)<16;
 if($250){label=70;break;}else{label=71;break;}
 case 70: 
 var $252=HEAP32[(($1)>>2)];
 var $253=$252&1;
 var $254=$103|$253;
 var $255=$254|2;
 HEAP32[(($1)>>2)]=$255;
 var $_sum910=$103|4;
 var $256=(($4+$_sum910)|0);
 var $257=$256;
 var $258=HEAP32[(($257)>>2)];
 var $259=$258|1;
 HEAP32[(($257)>>2)]=$259;
 var $newp_0=$p;label=73;break;
 case 71: 
 var $261=(($4+$nb)|0);
 var $262=$261;
 var $263=HEAP32[(($1)>>2)];
 var $264=$263&1;
 var $265=$264|$nb;
 var $266=$265|2;
 HEAP32[(($1)>>2)]=$266;
 var $_sum5=((($nb)+(4))|0);
 var $267=(($4+$_sum5)|0);
 var $268=$267;
 var $269=$106|3;
 HEAP32[(($268)>>2)]=$269;
 var $_sum78=$103|4;
 var $270=(($4+$_sum78)|0);
 var $271=$270;
 var $272=HEAP32[(($271)>>2)];
 var $273=$272|1;
 HEAP32[(($271)>>2)]=$273;
 _dispose_chunk($262,$106);
 var $newp_0=$p;label=73;break;
 case 72: 
 _abort();
 throw "Reached an unreachable!";
 case 73: 
 var $newp_0;
 return $newp_0;
  default: assert(0, "bad label: " + label);
 }

}


function _dispose_chunk($p,$psize){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=$p;
 var $2=(($1+$psize)|0);
 var $3=$2;
 var $4=(($p+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$5&1;
 var $7=($6|0)==0;
 if($7){label=2;break;}else{var $_0=$p;var $_0277=$psize;label=54;break;}
 case 2: 
 var $9=(($p)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$5&3;
 var $12=($11|0)==0;
 if($12){label=134;break;}else{label=3;break;}
 case 3: 
 var $14=(((-$10))|0);
 var $15=(($1+$14)|0);
 var $16=$15;
 var $17=((($10)+($psize))|0);
 var $18=HEAP32[((3304)>>2)];
 var $19=($15>>>0)<($18>>>0);
 if($19){label=53;break;}else{label=4;break;}
 case 4: 
 var $21=HEAP32[((3308)>>2)];
 var $22=($16|0)==($21|0);
 if($22){label=51;break;}else{label=5;break;}
 case 5: 
 var $24=$10>>>3;
 var $25=($10>>>0)<256;
 if($25){label=6;break;}else{label=18;break;}
 case 6: 
 var $_sum35=(((8)-($10))|0);
 var $27=(($1+$_sum35)|0);
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $_sum36=(((12)-($10))|0);
 var $30=(($1+$_sum36)|0);
 var $31=$30;
 var $32=HEAP32[(($31)>>2)];
 var $33=$24<<1;
 var $34=((3328+($33<<2))|0);
 var $35=$34;
 var $36=($29|0)==($35|0);
 if($36){label=9;break;}else{label=7;break;}
 case 7: 
 var $38=$29;
 var $39=($38>>>0)<($18>>>0);
 if($39){label=17;break;}else{label=8;break;}
 case 8: 
 var $41=(($29+12)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=($42|0)==($16|0);
 if($43){label=9;break;}else{label=17;break;}
 case 9: 
 var $44=($32|0)==($29|0);
 if($44){label=10;break;}else{label=11;break;}
 case 10: 
 var $46=1<<$24;
 var $47=$46^-1;
 var $48=HEAP32[((3288)>>2)];
 var $49=$48&$47;
 HEAP32[((3288)>>2)]=$49;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 11: 
 var $51=($32|0)==($35|0);
 if($51){label=12;break;}else{label=13;break;}
 case 12: 
 var $_pre65=(($32+8)|0);
 var $_pre_phi66=$_pre65;label=15;break;
 case 13: 
 var $53=$32;
 var $54=($53>>>0)<($18>>>0);
 if($54){label=16;break;}else{label=14;break;}
 case 14: 
 var $56=(($32+8)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=($57|0)==($16|0);
 if($58){var $_pre_phi66=$56;label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre_phi66;
 var $59=(($29+12)|0);
 HEAP32[(($59)>>2)]=$32;
 HEAP32[(($_pre_phi66)>>2)]=$29;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 16: 
 _abort();
 throw "Reached an unreachable!";
 case 17: 
 _abort();
 throw "Reached an unreachable!";
 case 18: 
 var $61=$15;
 var $_sum26=(((24)-($10))|0);
 var $62=(($1+$_sum26)|0);
 var $63=$62;
 var $64=HEAP32[(($63)>>2)];
 var $_sum27=(((12)-($10))|0);
 var $65=(($1+$_sum27)|0);
 var $66=$65;
 var $67=HEAP32[(($66)>>2)];
 var $68=($67|0)==($61|0);
 if($68){label=24;break;}else{label=19;break;}
 case 19: 
 var $_sum33=(((8)-($10))|0);
 var $70=(($1+$_sum33)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $73=$72;
 var $74=($73>>>0)<($18>>>0);
 if($74){label=23;break;}else{label=20;break;}
 case 20: 
 var $76=(($72+12)|0);
 var $77=HEAP32[(($76)>>2)];
 var $78=($77|0)==($61|0);
 if($78){label=21;break;}else{label=23;break;}
 case 21: 
 var $80=(($67+8)|0);
 var $81=HEAP32[(($80)>>2)];
 var $82=($81|0)==($61|0);
 if($82){label=22;break;}else{label=23;break;}
 case 22: 
 HEAP32[(($76)>>2)]=$67;
 HEAP32[(($80)>>2)]=$72;
 var $R_1=$67;label=31;break;
 case 23: 
 _abort();
 throw "Reached an unreachable!";
 case 24: 
 var $_sum28=(((16)-($10))|0);
 var $_sum29=((($_sum28)+(4))|0);
 var $85=(($1+$_sum29)|0);
 var $86=$85;
 var $87=HEAP32[(($86)>>2)];
 var $88=($87|0)==0;
 if($88){label=25;break;}else{var $R_0=$87;var $RP_0=$86;label=26;break;}
 case 25: 
 var $90=(($1+$_sum28)|0);
 var $91=$90;
 var $92=HEAP32[(($91)>>2)];
 var $93=($92|0)==0;
 if($93){var $R_1=0;label=31;break;}else{var $R_0=$92;var $RP_0=$91;label=26;break;}
 case 26: 
 var $RP_0;
 var $R_0;
 var $94=(($R_0+20)|0);
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=27;break;}else{var $R_0=$95;var $RP_0=$94;label=26;break;}
 case 27: 
 var $98=(($R_0+16)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=($99|0)==0;
 if($100){label=28;break;}else{var $R_0=$99;var $RP_0=$98;label=26;break;}
 case 28: 
 var $102=$RP_0;
 var $103=($102>>>0)<($18>>>0);
 if($103){label=30;break;}else{label=29;break;}
 case 29: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=31;break;
 case 30: 
 _abort();
 throw "Reached an unreachable!";
 case 31: 
 var $R_1;
 var $107=($64|0)==0;
 if($107){var $_0=$16;var $_0277=$17;label=54;break;}else{label=32;break;}
 case 32: 
 var $_sum30=(((28)-($10))|0);
 var $109=(($1+$_sum30)|0);
 var $110=$109;
 var $111=HEAP32[(($110)>>2)];
 var $112=((3592+($111<<2))|0);
 var $113=HEAP32[(($112)>>2)];
 var $114=($61|0)==($113|0);
 if($114){label=33;break;}else{label=35;break;}
 case 33: 
 HEAP32[(($112)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=34;break;}else{label=41;break;}
 case 34: 
 var $116=1<<$111;
 var $117=$116^-1;
 var $118=HEAP32[((3292)>>2)];
 var $119=$118&$117;
 HEAP32[((3292)>>2)]=$119;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 35: 
 var $121=$64;
 var $122=HEAP32[((3304)>>2)];
 var $123=($121>>>0)<($122>>>0);
 if($123){label=39;break;}else{label=36;break;}
 case 36: 
 var $125=(($64+16)|0);
 var $126=HEAP32[(($125)>>2)];
 var $127=($126|0)==($61|0);
 if($127){label=37;break;}else{label=38;break;}
 case 37: 
 HEAP32[(($125)>>2)]=$R_1;
 label=40;break;
 case 38: 
 var $130=(($64+20)|0);
 HEAP32[(($130)>>2)]=$R_1;
 label=40;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $133=($R_1|0)==0;
 if($133){var $_0=$16;var $_0277=$17;label=54;break;}else{label=41;break;}
 case 41: 
 var $135=$R_1;
 var $136=HEAP32[((3304)>>2)];
 var $137=($135>>>0)<($136>>>0);
 if($137){label=50;break;}else{label=42;break;}
 case 42: 
 var $139=(($R_1+24)|0);
 HEAP32[(($139)>>2)]=$64;
 var $_sum31=(((16)-($10))|0);
 var $140=(($1+$_sum31)|0);
 var $141=$140;
 var $142=HEAP32[(($141)>>2)];
 var $143=($142|0)==0;
 if($143){label=46;break;}else{label=43;break;}
 case 43: 
 var $145=$142;
 var $146=HEAP32[((3304)>>2)];
 var $147=($145>>>0)<($146>>>0);
 if($147){label=45;break;}else{label=44;break;}
 case 44: 
 var $149=(($R_1+16)|0);
 HEAP32[(($149)>>2)]=$142;
 var $150=(($142+24)|0);
 HEAP32[(($150)>>2)]=$R_1;
 label=46;break;
 case 45: 
 _abort();
 throw "Reached an unreachable!";
 case 46: 
 var $_sum32=((($_sum31)+(4))|0);
 var $153=(($1+$_sum32)|0);
 var $154=$153;
 var $155=HEAP32[(($154)>>2)];
 var $156=($155|0)==0;
 if($156){var $_0=$16;var $_0277=$17;label=54;break;}else{label=47;break;}
 case 47: 
 var $158=$155;
 var $159=HEAP32[((3304)>>2)];
 var $160=($158>>>0)<($159>>>0);
 if($160){label=49;break;}else{label=48;break;}
 case 48: 
 var $162=(($R_1+20)|0);
 HEAP32[(($162)>>2)]=$155;
 var $163=(($155+24)|0);
 HEAP32[(($163)>>2)]=$R_1;
 var $_0=$16;var $_0277=$17;label=54;break;
 case 49: 
 _abort();
 throw "Reached an unreachable!";
 case 50: 
 _abort();
 throw "Reached an unreachable!";
 case 51: 
 var $_sum=((($psize)+(4))|0);
 var $167=(($1+$_sum)|0);
 var $168=$167;
 var $169=HEAP32[(($168)>>2)];
 var $170=$169&3;
 var $171=($170|0)==3;
 if($171){label=52;break;}else{var $_0=$16;var $_0277=$17;label=54;break;}
 case 52: 
 HEAP32[((3296)>>2)]=$17;
 var $173=HEAP32[(($168)>>2)];
 var $174=$173&-2;
 HEAP32[(($168)>>2)]=$174;
 var $175=$17|1;
 var $_sum24=(((4)-($10))|0);
 var $176=(($1+$_sum24)|0);
 var $177=$176;
 HEAP32[(($177)>>2)]=$175;
 var $178=$2;
 HEAP32[(($178)>>2)]=$17;
 label=134;break;
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_0277;
 var $_0;
 var $180=HEAP32[((3304)>>2)];
 var $181=($2>>>0)<($180>>>0);
 if($181){label=133;break;}else{label=55;break;}
 case 55: 
 var $_sum1=((($psize)+(4))|0);
 var $183=(($1+$_sum1)|0);
 var $184=$183;
 var $185=HEAP32[(($184)>>2)];
 var $186=$185&2;
 var $187=($186|0)==0;
 if($187){label=56;break;}else{label=109;break;}
 case 56: 
 var $189=HEAP32[((3312)>>2)];
 var $190=($3|0)==($189|0);
 if($190){label=57;break;}else{label=59;break;}
 case 57: 
 var $192=HEAP32[((3300)>>2)];
 var $193=((($192)+($_0277))|0);
 HEAP32[((3300)>>2)]=$193;
 HEAP32[((3312)>>2)]=$_0;
 var $194=$193|1;
 var $195=(($_0+4)|0);
 HEAP32[(($195)>>2)]=$194;
 var $196=HEAP32[((3308)>>2)];
 var $197=($_0|0)==($196|0);
 if($197){label=58;break;}else{label=134;break;}
 case 58: 
 HEAP32[((3308)>>2)]=0;
 HEAP32[((3296)>>2)]=0;
 label=134;break;
 case 59: 
 var $200=HEAP32[((3308)>>2)];
 var $201=($3|0)==($200|0);
 if($201){label=60;break;}else{label=61;break;}
 case 60: 
 var $203=HEAP32[((3296)>>2)];
 var $204=((($203)+($_0277))|0);
 HEAP32[((3296)>>2)]=$204;
 HEAP32[((3308)>>2)]=$_0;
 var $205=$204|1;
 var $206=(($_0+4)|0);
 HEAP32[(($206)>>2)]=$205;
 var $207=$_0;
 var $208=(($207+$204)|0);
 var $209=$208;
 HEAP32[(($209)>>2)]=$204;
 label=134;break;
 case 61: 
 var $211=$185&-8;
 var $212=((($211)+($_0277))|0);
 var $213=$185>>>3;
 var $214=($185>>>0)<256;
 if($214){label=62;break;}else{label=74;break;}
 case 62: 
 var $_sum20=((($psize)+(8))|0);
 var $216=(($1+$_sum20)|0);
 var $217=$216;
 var $218=HEAP32[(($217)>>2)];
 var $_sum21=((($psize)+(12))|0);
 var $219=(($1+$_sum21)|0);
 var $220=$219;
 var $221=HEAP32[(($220)>>2)];
 var $222=$213<<1;
 var $223=((3328+($222<<2))|0);
 var $224=$223;
 var $225=($218|0)==($224|0);
 if($225){label=65;break;}else{label=63;break;}
 case 63: 
 var $227=$218;
 var $228=($227>>>0)<($180>>>0);
 if($228){label=73;break;}else{label=64;break;}
 case 64: 
 var $230=(($218+12)|0);
 var $231=HEAP32[(($230)>>2)];
 var $232=($231|0)==($3|0);
 if($232){label=65;break;}else{label=73;break;}
 case 65: 
 var $233=($221|0)==($218|0);
 if($233){label=66;break;}else{label=67;break;}
 case 66: 
 var $235=1<<$213;
 var $236=$235^-1;
 var $237=HEAP32[((3288)>>2)];
 var $238=$237&$236;
 HEAP32[((3288)>>2)]=$238;
 label=107;break;
 case 67: 
 var $240=($221|0)==($224|0);
 if($240){label=68;break;}else{label=69;break;}
 case 68: 
 var $_pre63=(($221+8)|0);
 var $_pre_phi64=$_pre63;label=71;break;
 case 69: 
 var $242=$221;
 var $243=($242>>>0)<($180>>>0);
 if($243){label=72;break;}else{label=70;break;}
 case 70: 
 var $245=(($221+8)|0);
 var $246=HEAP32[(($245)>>2)];
 var $247=($246|0)==($3|0);
 if($247){var $_pre_phi64=$245;label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre_phi64;
 var $248=(($218+12)|0);
 HEAP32[(($248)>>2)]=$221;
 HEAP32[(($_pre_phi64)>>2)]=$218;
 label=107;break;
 case 72: 
 _abort();
 throw "Reached an unreachable!";
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $250=$2;
 var $_sum2=((($psize)+(24))|0);
 var $251=(($1+$_sum2)|0);
 var $252=$251;
 var $253=HEAP32[(($252)>>2)];
 var $_sum3=((($psize)+(12))|0);
 var $254=(($1+$_sum3)|0);
 var $255=$254;
 var $256=HEAP32[(($255)>>2)];
 var $257=($256|0)==($250|0);
 if($257){label=80;break;}else{label=75;break;}
 case 75: 
 var $_sum18=((($psize)+(8))|0);
 var $259=(($1+$_sum18)|0);
 var $260=$259;
 var $261=HEAP32[(($260)>>2)];
 var $262=$261;
 var $263=($262>>>0)<($180>>>0);
 if($263){label=79;break;}else{label=76;break;}
 case 76: 
 var $265=(($261+12)|0);
 var $266=HEAP32[(($265)>>2)];
 var $267=($266|0)==($250|0);
 if($267){label=77;break;}else{label=79;break;}
 case 77: 
 var $269=(($256+8)|0);
 var $270=HEAP32[(($269)>>2)];
 var $271=($270|0)==($250|0);
 if($271){label=78;break;}else{label=79;break;}
 case 78: 
 HEAP32[(($265)>>2)]=$256;
 HEAP32[(($269)>>2)]=$261;
 var $R7_1=$256;label=87;break;
 case 79: 
 _abort();
 throw "Reached an unreachable!";
 case 80: 
 var $_sum5=((($psize)+(20))|0);
 var $274=(($1+$_sum5)|0);
 var $275=$274;
 var $276=HEAP32[(($275)>>2)];
 var $277=($276|0)==0;
 if($277){label=81;break;}else{var $R7_0=$276;var $RP9_0=$275;label=82;break;}
 case 81: 
 var $_sum4=((($psize)+(16))|0);
 var $279=(($1+$_sum4)|0);
 var $280=$279;
 var $281=HEAP32[(($280)>>2)];
 var $282=($281|0)==0;
 if($282){var $R7_1=0;label=87;break;}else{var $R7_0=$281;var $RP9_0=$280;label=82;break;}
 case 82: 
 var $RP9_0;
 var $R7_0;
 var $283=(($R7_0+20)|0);
 var $284=HEAP32[(($283)>>2)];
 var $285=($284|0)==0;
 if($285){label=83;break;}else{var $R7_0=$284;var $RP9_0=$283;label=82;break;}
 case 83: 
 var $287=(($R7_0+16)|0);
 var $288=HEAP32[(($287)>>2)];
 var $289=($288|0)==0;
 if($289){label=84;break;}else{var $R7_0=$288;var $RP9_0=$287;label=82;break;}
 case 84: 
 var $291=$RP9_0;
 var $292=($291>>>0)<($180>>>0);
 if($292){label=86;break;}else{label=85;break;}
 case 85: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=87;break;
 case 86: 
 _abort();
 throw "Reached an unreachable!";
 case 87: 
 var $R7_1;
 var $296=($253|0)==0;
 if($296){label=107;break;}else{label=88;break;}
 case 88: 
 var $_sum15=((($psize)+(28))|0);
 var $298=(($1+$_sum15)|0);
 var $299=$298;
 var $300=HEAP32[(($299)>>2)];
 var $301=((3592+($300<<2))|0);
 var $302=HEAP32[(($301)>>2)];
 var $303=($250|0)==($302|0);
 if($303){label=89;break;}else{label=91;break;}
 case 89: 
 HEAP32[(($301)>>2)]=$R7_1;
 var $cond53=($R7_1|0)==0;
 if($cond53){label=90;break;}else{label=97;break;}
 case 90: 
 var $305=1<<$300;
 var $306=$305^-1;
 var $307=HEAP32[((3292)>>2)];
 var $308=$307&$306;
 HEAP32[((3292)>>2)]=$308;
 label=107;break;
 case 91: 
 var $310=$253;
 var $311=HEAP32[((3304)>>2)];
 var $312=($310>>>0)<($311>>>0);
 if($312){label=95;break;}else{label=92;break;}
 case 92: 
 var $314=(($253+16)|0);
 var $315=HEAP32[(($314)>>2)];
 var $316=($315|0)==($250|0);
 if($316){label=93;break;}else{label=94;break;}
 case 93: 
 HEAP32[(($314)>>2)]=$R7_1;
 label=96;break;
 case 94: 
 var $319=(($253+20)|0);
 HEAP32[(($319)>>2)]=$R7_1;
 label=96;break;
 case 95: 
 _abort();
 throw "Reached an unreachable!";
 case 96: 
 var $322=($R7_1|0)==0;
 if($322){label=107;break;}else{label=97;break;}
 case 97: 
 var $324=$R7_1;
 var $325=HEAP32[((3304)>>2)];
 var $326=($324>>>0)<($325>>>0);
 if($326){label=106;break;}else{label=98;break;}
 case 98: 
 var $328=(($R7_1+24)|0);
 HEAP32[(($328)>>2)]=$253;
 var $_sum16=((($psize)+(16))|0);
 var $329=(($1+$_sum16)|0);
 var $330=$329;
 var $331=HEAP32[(($330)>>2)];
 var $332=($331|0)==0;
 if($332){label=102;break;}else{label=99;break;}
 case 99: 
 var $334=$331;
 var $335=HEAP32[((3304)>>2)];
 var $336=($334>>>0)<($335>>>0);
 if($336){label=101;break;}else{label=100;break;}
 case 100: 
 var $338=(($R7_1+16)|0);
 HEAP32[(($338)>>2)]=$331;
 var $339=(($331+24)|0);
 HEAP32[(($339)>>2)]=$R7_1;
 label=102;break;
 case 101: 
 _abort();
 throw "Reached an unreachable!";
 case 102: 
 var $_sum17=((($psize)+(20))|0);
 var $342=(($1+$_sum17)|0);
 var $343=$342;
 var $344=HEAP32[(($343)>>2)];
 var $345=($344|0)==0;
 if($345){label=107;break;}else{label=103;break;}
 case 103: 
 var $347=$344;
 var $348=HEAP32[((3304)>>2)];
 var $349=($347>>>0)<($348>>>0);
 if($349){label=105;break;}else{label=104;break;}
 case 104: 
 var $351=(($R7_1+20)|0);
 HEAP32[(($351)>>2)]=$344;
 var $352=(($344+24)|0);
 HEAP32[(($352)>>2)]=$R7_1;
 label=107;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 _abort();
 throw "Reached an unreachable!";
 case 107: 
 var $355=$212|1;
 var $356=(($_0+4)|0);
 HEAP32[(($356)>>2)]=$355;
 var $357=$_0;
 var $358=(($357+$212)|0);
 var $359=$358;
 HEAP32[(($359)>>2)]=$212;
 var $360=HEAP32[((3308)>>2)];
 var $361=($_0|0)==($360|0);
 if($361){label=108;break;}else{var $_1=$212;label=110;break;}
 case 108: 
 HEAP32[((3296)>>2)]=$212;
 label=134;break;
 case 109: 
 var $364=$185&-2;
 HEAP32[(($184)>>2)]=$364;
 var $365=$_0277|1;
 var $366=(($_0+4)|0);
 HEAP32[(($366)>>2)]=$365;
 var $367=$_0;
 var $368=(($367+$_0277)|0);
 var $369=$368;
 HEAP32[(($369)>>2)]=$_0277;
 var $_1=$_0277;label=110;break;
 case 110: 
 var $_1;
 var $371=$_1>>>3;
 var $372=($_1>>>0)<256;
 if($372){label=111;break;}else{label=116;break;}
 case 111: 
 var $374=$371<<1;
 var $375=((3328+($374<<2))|0);
 var $376=$375;
 var $377=HEAP32[((3288)>>2)];
 var $378=1<<$371;
 var $379=$377&$378;
 var $380=($379|0)==0;
 if($380){label=112;break;}else{label=113;break;}
 case 112: 
 var $382=$377|$378;
 HEAP32[((3288)>>2)]=$382;
 var $_sum13_pre=((($374)+(2))|0);
 var $_pre=((3328+($_sum13_pre<<2))|0);
 var $F16_0=$376;var $_pre_phi=$_pre;label=115;break;
 case 113: 
 var $_sum14=((($374)+(2))|0);
 var $384=((3328+($_sum14<<2))|0);
 var $385=HEAP32[(($384)>>2)];
 var $386=$385;
 var $387=HEAP32[((3304)>>2)];
 var $388=($386>>>0)<($387>>>0);
 if($388){label=114;break;}else{var $F16_0=$385;var $_pre_phi=$384;label=115;break;}
 case 114: 
 _abort();
 throw "Reached an unreachable!";
 case 115: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$_0;
 var $391=(($F16_0+12)|0);
 HEAP32[(($391)>>2)]=$_0;
 var $392=(($_0+8)|0);
 HEAP32[(($392)>>2)]=$F16_0;
 var $393=(($_0+12)|0);
 HEAP32[(($393)>>2)]=$376;
 label=134;break;
 case 116: 
 var $395=$_0;
 var $396=$_1>>>8;
 var $397=($396|0)==0;
 if($397){var $I19_0=0;label=119;break;}else{label=117;break;}
 case 117: 
 var $399=($_1>>>0)>16777215;
 if($399){var $I19_0=31;label=119;break;}else{label=118;break;}
 case 118: 
 var $401=((($396)+(1048320))|0);
 var $402=$401>>>16;
 var $403=$402&8;
 var $404=$396<<$403;
 var $405=((($404)+(520192))|0);
 var $406=$405>>>16;
 var $407=$406&4;
 var $408=$407|$403;
 var $409=$404<<$407;
 var $410=((($409)+(245760))|0);
 var $411=$410>>>16;
 var $412=$411&2;
 var $413=$408|$412;
 var $414=(((14)-($413))|0);
 var $415=$409<<$412;
 var $416=$415>>>15;
 var $417=((($414)+($416))|0);
 var $418=$417<<1;
 var $419=((($417)+(7))|0);
 var $420=$_1>>>($419>>>0);
 var $421=$420&1;
 var $422=$421|$418;
 var $I19_0=$422;label=119;break;
 case 119: 
 var $I19_0;
 var $424=((3592+($I19_0<<2))|0);
 var $425=(($_0+28)|0);
 var $I19_0_c=$I19_0;
 HEAP32[(($425)>>2)]=$I19_0_c;
 var $426=(($_0+20)|0);
 HEAP32[(($426)>>2)]=0;
 var $427=(($_0+16)|0);
 HEAP32[(($427)>>2)]=0;
 var $428=HEAP32[((3292)>>2)];
 var $429=1<<$I19_0;
 var $430=$428&$429;
 var $431=($430|0)==0;
 if($431){label=120;break;}else{label=121;break;}
 case 120: 
 var $433=$428|$429;
 HEAP32[((3292)>>2)]=$433;
 HEAP32[(($424)>>2)]=$395;
 var $434=(($_0+24)|0);
 var $_c=$424;
 HEAP32[(($434)>>2)]=$_c;
 var $435=(($_0+12)|0);
 HEAP32[(($435)>>2)]=$_0;
 var $436=(($_0+8)|0);
 HEAP32[(($436)>>2)]=$_0;
 label=134;break;
 case 121: 
 var $438=HEAP32[(($424)>>2)];
 var $439=($I19_0|0)==31;
 if($439){var $444=0;label=123;break;}else{label=122;break;}
 case 122: 
 var $441=$I19_0>>>1;
 var $442=(((25)-($441))|0);
 var $444=$442;label=123;break;
 case 123: 
 var $444;
 var $445=$_1<<$444;
 var $K20_0=$445;var $T_0=$438;label=124;break;
 case 124: 
 var $T_0;
 var $K20_0;
 var $447=(($T_0+4)|0);
 var $448=HEAP32[(($447)>>2)];
 var $449=$448&-8;
 var $450=($449|0)==($_1|0);
 if($450){label=129;break;}else{label=125;break;}
 case 125: 
 var $452=$K20_0>>>31;
 var $453=(($T_0+16+($452<<2))|0);
 var $454=HEAP32[(($453)>>2)];
 var $455=($454|0)==0;
 var $456=$K20_0<<1;
 if($455){label=126;break;}else{var $K20_0=$456;var $T_0=$454;label=124;break;}
 case 126: 
 var $458=$453;
 var $459=HEAP32[((3304)>>2)];
 var $460=($458>>>0)<($459>>>0);
 if($460){label=128;break;}else{label=127;break;}
 case 127: 
 HEAP32[(($453)>>2)]=$395;
 var $462=(($_0+24)|0);
 var $T_0_c10=$T_0;
 HEAP32[(($462)>>2)]=$T_0_c10;
 var $463=(($_0+12)|0);
 HEAP32[(($463)>>2)]=$_0;
 var $464=(($_0+8)|0);
 HEAP32[(($464)>>2)]=$_0;
 label=134;break;
 case 128: 
 _abort();
 throw "Reached an unreachable!";
 case 129: 
 var $467=(($T_0+8)|0);
 var $468=HEAP32[(($467)>>2)];
 var $469=$T_0;
 var $470=HEAP32[((3304)>>2)];
 var $471=($469>>>0)<($470>>>0);
 if($471){label=132;break;}else{label=130;break;}
 case 130: 
 var $473=$468;
 var $474=($473>>>0)<($470>>>0);
 if($474){label=132;break;}else{label=131;break;}
 case 131: 
 var $476=(($468+12)|0);
 HEAP32[(($476)>>2)]=$395;
 HEAP32[(($467)>>2)]=$395;
 var $477=(($_0+8)|0);
 var $_c9=$468;
 HEAP32[(($477)>>2)]=$_c9;
 var $478=(($_0+12)|0);
 var $T_0_c=$T_0;
 HEAP32[(($478)>>2)]=$T_0_c;
 var $479=(($_0+24)|0);
 HEAP32[(($479)>>2)]=0;
 label=134;break;
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 _abort();
 throw "Reached an unreachable!";
 case 134: 
 return;
  default: assert(0, "bad label: " + label);
 }

}



// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



//@ sourceMappingURL=dobweb.js.map