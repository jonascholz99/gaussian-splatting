
var loadWasm = (() => {
  var _scriptDir = import.meta.url;
  
  return (
function(moduleArg = {}) {

var Module=moduleArg;var readyPromiseResolve,readyPromiseReject;var readyPromise=new Promise((resolve,reject)=>{readyPromiseResolve=resolve;readyPromiseReject=reject});var moduleOverrides=Object.assign({},Module);var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=true;var scriptDirectory="";var read_,readAsync,readBinary;if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.startsWith("blob:")){scriptDirectory=""}else{scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1)}{read_=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=(url,onload,onerror)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.error.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];function intArrayFromBase64(s){var decoded=atob(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}var wasmMemory;var ABORT=false;var EXITSTATUS;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateMemoryViews(){var b=wasmMemory.buffer;Module["HEAP8"]=HEAP8=new Int8Array(b);Module["HEAP16"]=HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAPU16"]=HEAPU16=new Uint16Array(b);Module["HEAP32"]=HEAP32=new Int32Array(b);Module["HEAPU32"]=HEAPU32=new Uint32Array(b);Module["HEAPF32"]=HEAPF32=new Float32Array(b);Module["HEAPF64"]=HEAPF64=new Float64Array(b)}var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;Module["monitorRunDependencies"]?.(runDependencies)}function removeRunDependency(id){runDependencies--;Module["monitorRunDependencies"]?.(runDependencies);if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}function abort(what){Module["onAbort"]?.(what);what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";var isDataURI=filename=>filename.startsWith(dataURIPrefix);var wasmBinaryFile;wasmBinaryFile="data:application/octet-stream;base64,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X2N4eGFiaXYxMTZfX3NoaW1fdHlwZV9pbmZvRQAAAAAMBgAAGAQAABAEAABOMTBfX2N4eGFiaXYxMTdfX2NsYXNzX3R5cGVfaW5mb0UAAAAMBgAASAQAADwEAABOMTBfX2N4eGFiaXYxMTdfX3BiYXNlX3R5cGVfaW5mb0UAAAAMBgAAeAQAADwEAABOMTBfX2N4eGFiaXYxMTlfX3BvaW50ZXJfdHlwZV9pbmZvRQAMBgAAqAQAAJwEAAAAAAAAHAUAAAEAAAACAAAAAwAAAAQAAAAFAAAATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAAwGAAD0BAAAPAQAAHYAAADgBAAAKAUAAGIAAADgBAAANAUAAGMAAADgBAAAQAUAAGgAAADgBAAATAUAAGEAAADgBAAAWAUAAHMAAADgBAAAZAUAAHQAAADgBAAAcAUAAGkAAADgBAAAfAUAAGoAAADgBAAAiAUAAGwAAADgBAAAlAUAAG0AAADgBAAAoAUAAHgAAADgBAAArAUAAHkAAADgBAAAuAUAAGYAAADgBAAAxAUAAGQAAADgBAAA0AUAAAAAAABsBAAAAQAAAAYAAAADAAAABAAAAAcAAAAIAAAACQAAAAoAAAAAAAAAVAYAAAEAAAALAAAAAwAAAAQAAAAHAAAADAAAAA0AAAAOAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAAwGAAAsBgAAbAQAAHVuc2lnbmVkIHNob3J0AHVuc2lnbmVkIGludABmbG9hdAB1aW50NjRfdAB1bnNpZ25lZCBjaGFyAGJvb2wAdW5zaWduZWQgbG9uZwBzdGQ6OndzdHJpbmcAc3RkOjpzdHJpbmcAc3RkOjp1MTZzdHJpbmcAc3RkOjp1MzJzdHJpbmcAZG91YmxlAHZvaWQAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ2NF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ2NF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4Ac3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGRvdWJsZT4ATlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUUAAAAA5AUAAJIJAABOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQAA5AUAANwJAABOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQAA5AUAACQKAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRHNOU18xMWNoYXJfdHJhaXRzSURzRUVOU185YWxsb2NhdG9ySURzRUVFRQAAAOQFAABsCgAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURpTlNfMTFjaGFyX3RyYWl0c0lEaUVFTlNfOWFsbG9jYXRvcklEaUVFRUUAAADkBQAAuAoAAE4xMGVtc2NyaXB0ZW4zdmFsRQAA5AUAAAQLAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAOQFAAAgCwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAADkBQAASAsAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAA5AUAAHALAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAAOQFAACYCwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAADkBQAAwAsAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAA5AUAAOgLAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUAAOQFAAAQDAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAADkBQAAOAwAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAA5AUAAGAMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l4RUUAAOQFAACIDAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeUVFAADkBQAAsAwAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWZFRQAA5AUAANgMAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAAOQFAAAADQBBqBoLAzAPAQ==";function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}var binary=tryParseAsDataURI(file);if(binary){return binary}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}function getBinaryPromise(binaryFile){return Promise.resolve().then(()=>getBinarySync(binaryFile))}function instantiateArrayBuffer(binaryFile,imports,receiver){return getBinaryPromise(binaryFile).then(binary=>WebAssembly.instantiate(binary,imports)).then(receiver,reason=>{err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason)})}function instantiateAsync(binary,binaryFile,imports,callback){return instantiateArrayBuffer(binaryFile,imports,callback)}function createWasm(){var info={"a":wasmImports};function receiveInstance(instance,module){wasmExports=instance.exports;wasmMemory=wasmExports["k"];updateMemoryViews();addOnInit(wasmExports["l"]);removeRunDependency("wasm-instantiate");return wasmExports}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){receiveInstance(result["instance"])}if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err(`Module.instantiateWasm callback failed with error: ${e}`);readyPromiseReject(e)}}instantiateAsync(wasmBinary,wasmBinaryFile,info,receiveInstantiationResult).catch(readyPromiseReject);return{}}var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module)}};var noExitRuntime=Module["noExitRuntime"]||true;var __embind_register_bigint=(primitiveType,name,size,minRange,maxRange)=>{};var embind_init_charCodes=()=>{var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i)}embind_charCodes=codes};var embind_charCodes;var readLatin1String=ptr=>{var ret="";var c=ptr;while(HEAPU8[c]){ret+=embind_charCodes[HEAPU8[c++]]}return ret};var awaitingDependencies={};var registeredTypes={};var typeDependencies={};var BindingError;var throwBindingError=message=>{throw new BindingError(message)};var InternalError;function sharedRegisterType(rawType,registeredInstance,options={}){var name=registeredInstance.name;if(!rawType){throwBindingError(`type "${name}" must have a positive integer typeid pointer`)}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else{throwBindingError(`Cannot register type '${name}' twice`)}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach(cb=>cb())}}function registerType(rawType,registeredInstance,options={}){if(!("argPackAdvance"in registeredInstance)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}return sharedRegisterType(rawType,registeredInstance,options)}var GenericWireTypeSize=8;var __embind_register_bool=(rawType,name,trueValue,falseValue)=>{name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(wt){return!!wt},"toWireType":function(destructors,o){return o?trueValue:falseValue},"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":function(pointer){return this["fromWireType"](HEAPU8[pointer])},destructorFunction:null})};var emval_freelist=[];var emval_handles=[];var __emval_decref=handle=>{if(handle>9&&0===--emval_handles[handle+1]){emval_handles[handle]=undefined;emval_freelist.push(handle)}};var count_emval_handles=()=>emval_handles.length/2-5-emval_freelist.length;var init_emval=()=>{emval_handles.push(0,1,undefined,1,null,1,true,1,false,1);Module["count_emval_handles"]=count_emval_handles};var Emval={toValue:handle=>{if(!handle){throwBindingError("Cannot use deleted val. handle = "+handle)}return emval_handles[handle]},toHandle:value=>{switch(value){case undefined:return 2;case null:return 4;case true:return 6;case false:return 8;default:{const handle=emval_freelist.pop()||emval_handles.length;emval_handles[handle]=value;emval_handles[handle+1]=1;return handle}}}};function readPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>2])}var EmValType={name:"emscripten::val","fromWireType":handle=>{var rv=Emval.toValue(handle);__emval_decref(handle);return rv},"toWireType":(destructors,value)=>Emval.toHandle(value),"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":readPointer,destructorFunction:null};var __embind_register_emval=rawType=>registerType(rawType,EmValType);var floatReadValueFromPointer=(name,width)=>{switch(width){case 4:return function(pointer){return this["fromWireType"](HEAPF32[pointer>>2])};case 8:return function(pointer){return this["fromWireType"](HEAPF64[pointer>>3])};default:throw new TypeError(`invalid float width (${width}): ${name}`)}};var __embind_register_float=(rawType,name,size)=>{name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":value=>value,"toWireType":(destructors,value)=>value,"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":floatReadValueFromPointer(name,size),destructorFunction:null})};var integerReadValueFromPointer=(name,width,signed)=>{switch(width){case 1:return signed?pointer=>HEAP8[pointer]:pointer=>HEAPU8[pointer];case 2:return signed?pointer=>HEAP16[pointer>>1]:pointer=>HEAPU16[pointer>>1];case 4:return signed?pointer=>HEAP32[pointer>>2]:pointer=>HEAPU32[pointer>>2];default:throw new TypeError(`invalid integer width (${width}): ${name}`)}};var __embind_register_integer=(primitiveType,name,size,minRange,maxRange)=>{name=readLatin1String(name);if(maxRange===-1){maxRange=4294967295}var fromWireType=value=>value;if(minRange===0){var bitshift=32-8*size;fromWireType=value=>value<<bitshift>>>bitshift}var isUnsignedType=name.includes("unsigned");var checkAssertions=(value,toTypeName)=>{};var toWireType;if(isUnsignedType){toWireType=function(destructors,value){checkAssertions(value,this.name);return value>>>0}}else{toWireType=function(destructors,value){checkAssertions(value,this.name);return value}}registerType(primitiveType,{name:name,"fromWireType":fromWireType,"toWireType":toWireType,"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":integerReadValueFromPointer(name,size,minRange!==0),destructorFunction:null})};var __embind_register_memory_view=(rawType,dataTypeIndex,name)=>{var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){var size=HEAPU32[handle>>2];var data=HEAPU32[handle+4>>2];return new TA(HEAP8.buffer,data,size)}name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":decodeMemoryView,"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":decodeMemoryView},{ignoreDuplicateRegistrations:true})};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx};var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf8"):undefined;var UTF8ArrayToString=(heapOrArray,idx,maxBytesToRead)=>{var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str};var UTF8ToString=(ptr,maxBytesToRead)=>ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):"";var __embind_register_std_string=(rawType,name)=>{name=readLatin1String(name);var stdStringIsUTF8=name==="std::string";registerType(rawType,{name:name,"fromWireType"(value){var length=HEAPU32[value>>2];var payload=value+4;var str;if(stdStringIsUTF8){var decodeStartPtr=payload;for(var i=0;i<=length;++i){var currentBytePtr=payload+i;if(i==length||HEAPU8[currentBytePtr]==0){var maxRead=currentBytePtr-decodeStartPtr;var stringSegment=UTF8ToString(decodeStartPtr,maxRead);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+1}}}else{var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[payload+i])}str=a.join("")}_free(value);return str},"toWireType"(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value)}var length;var valueIsOfTypeString=typeof value=="string";if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)){throwBindingError("Cannot pass non-string to std::string")}if(stdStringIsUTF8&&valueIsOfTypeString){length=lengthBytesUTF8(value)}else{length=value.length}var base=_malloc(4+length+1);var ptr=base+4;HEAPU32[base>>2]=length;if(stdStringIsUTF8&&valueIsOfTypeString){stringToUTF8(value,ptr,length+1)}else{if(valueIsOfTypeString){for(var i=0;i<length;++i){var charCode=value.charCodeAt(i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits")}HEAPU8[ptr+i]=charCode}}else{for(var i=0;i<length;++i){HEAPU8[ptr+i]=value[i]}}}if(destructors!==null){destructors.push(_free,base)}return base},"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":readPointer,destructorFunction(ptr){_free(ptr)}})};var UTF16Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf-16le"):undefined;var UTF16ToString=(ptr,maxBytesToRead)=>{var endPtr=ptr;var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;while(!(idx>=maxIdx)&&HEAPU16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder)return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr));var str="";for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)break;str+=String.fromCharCode(codeUnit)}return str};var stringToUTF16=(str,outPtr,maxBytesToWrite)=>{maxBytesToWrite??=2147483647;if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr};var lengthBytesUTF16=str=>str.length*2;var UTF32ToString=(ptr,maxBytesToRead)=>{var i=0;var str="";while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)break;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}return str};var stringToUTF32=(str,outPtr,maxBytesToWrite)=>{maxBytesToWrite??=2147483647;if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr};var lengthBytesUTF32=str=>{var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len};var __embind_register_std_wstring=(rawType,charSize,name)=>{name=readLatin1String(name);var decodeString,encodeString,readCharAt,lengthBytesUTF;if(charSize===2){decodeString=UTF16ToString;encodeString=stringToUTF16;lengthBytesUTF=lengthBytesUTF16;readCharAt=pointer=>HEAPU16[pointer>>1]}else if(charSize===4){decodeString=UTF32ToString;encodeString=stringToUTF32;lengthBytesUTF=lengthBytesUTF32;readCharAt=pointer=>HEAPU32[pointer>>2]}registerType(rawType,{name:name,"fromWireType":value=>{var length=HEAPU32[value>>2];var str;var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i*charSize;if(i==length||readCharAt(currentBytePtr)==0){var maxReadBytes=currentBytePtr-decodeStartPtr;var stringSegment=decodeString(decodeStartPtr,maxReadBytes);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+charSize}}_free(value);return str},"toWireType":(destructors,value)=>{if(!(typeof value=="string")){throwBindingError(`Cannot pass non-string to C++ string type ${name}`)}var length=lengthBytesUTF(value);var ptr=_malloc(4+length+charSize);HEAPU32[ptr>>2]=length/charSize;encodeString(value,ptr+4,length+charSize);if(destructors!==null){destructors.push(_free,ptr)}return ptr},"argPackAdvance":GenericWireTypeSize,"readValueFromPointer":readPointer,destructorFunction(ptr){_free(ptr)}})};var __embind_register_void=(rawType,name)=>{name=readLatin1String(name);registerType(rawType,{isVoid:true,name:name,"argPackAdvance":0,"fromWireType":()=>undefined,"toWireType":(destructors,o)=>undefined})};var getHeapMax=()=>2147483648;var growMemory=size=>{var b=wasmMemory.buffer;var pages=(size-b.byteLength+65535)/65536;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){}};var _emscripten_resize_heap=requestedSize=>{var oldSize=HEAPU8.length;requestedSize>>>=0;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}var alignUp=(x,multiple)=>x+(multiple-x%multiple)%multiple;for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false};embind_init_charCodes();BindingError=Module["BindingError"]=class BindingError extends Error{constructor(message){super(message);this.name="BindingError"}};InternalError=Module["InternalError"]=class InternalError extends Error{constructor(message){super(message);this.name="InternalError"}};init_emval();var wasmImports={f:__embind_register_bigint,h:__embind_register_bool,g:__embind_register_emval,e:__embind_register_float,b:__embind_register_integer,a:__embind_register_memory_view,d:__embind_register_std_string,c:__embind_register_std_wstring,i:__embind_register_void,j:_emscripten_resize_heap};var wasmExports=createWasm();var ___wasm_call_ctors=()=>(___wasm_call_ctors=wasmExports["l"])();var ___getTypeName=a0=>(___getTypeName=wasmExports["__getTypeName"])(a0);var _pack=Module["_pack"]=(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10)=>(_pack=Module["_pack"]=wasmExports["m"])(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);var _malloc=Module["_malloc"]=a0=>(_malloc=Module["_malloc"]=wasmExports["o"])(a0);var _free=Module["_free"]=a0=>(_free=Module["_free"]=wasmExports["p"])(a0);var __emscripten_stack_restore=a0=>(__emscripten_stack_restore=wasmExports["_emscripten_stack_restore"])(a0);var __emscripten_stack_alloc=a0=>(__emscripten_stack_alloc=wasmExports["_emscripten_stack_alloc"])(a0);var _emscripten_stack_get_current=()=>(_emscripten_stack_get_current=wasmExports["emscripten_stack_get_current"])();var ___cxa_is_pointer_type=a0=>(___cxa_is_pointer_type=wasmExports["__cxa_is_pointer_type"])(a0);var calledRun;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function run(){if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}run();


  return readyPromise
}
);
})();
export default loadWasm;