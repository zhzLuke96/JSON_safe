/**
 * JSON tool kit, support circular structure
 * @author zhzluke96
 */

// Partial function
const isType = type => obj => (new RegExp(type,"i")).test(Object.prototype.toString.call(obj).replace(/^\[object /, "").replace(/\]$/, ""));
const ref2obj = ref_string => root => ref_string ? eval("root." + ref_string) : root;

// global object not stringify,mark placeholder only
const isGlobal = obj => isType("Window")(obj) || isType("Global")(obj) || isType("DOMWindow")(obj);
const global_placeholder = "[Global Object]";

// circular placeholder
const circular_placeholder = "CIRCULAR";

// replace global
const repG = obj => {
    var cache = []
    function recu(_o){
        if(isType("Object")(_o) || isType("Array")(_o)){
            for (let vi in _o) {
                let v = _o[vi];
                if(~cache.indexOf(v))continue;
                else cache.push(v);
                _o[vi] = recu(v);
            }
        }else if(isGlobal(_o)){
            return global_placeholder;
        }
        return _o;
    }
    delete cache;
    return recu(obj);
}
/**
 * JSON stringify, support circular structure
 * @param  {Object} value           input
 * @param  {String} space           format string
 * @param  {function} replacer      replacer function
 * @return {String}                 json string
 */
function stringify(value, space, replacer) {
    // *JSON.stringify cant accept String("")
    // *String("") will => undefined
    space = space == undefined ? "\t" : (space == "" ? undefined : space);
    let cache = [],
        keys = [],
        isObj = isType("Object"),
        isNull = isType("Null"),
        replacer_use = isType("Function")(replacer);
    // node environ
    if(typeof global !== "undefined")value = repG(value);
    const ret = JSON.stringify(value, function(key, val) {
        if (cache.length) {
            // pop cache
            var cur = cache.indexOf(this);
            ~cur ? cache.splice(cur + 1) : cache.push(this);
            ~cur ? keys.splice(cur, Infinity, key) : keys.push(key);
            // skip Global ref
            if (isGlobal(val)) return global_placeholder;
            if (isObj(val) && !isNull(val)) {
                // Provided circulation/loop structure path hints
                // ~ => root path
                if (~cache.indexOf(val)) return `[${circular_placeholder} ~${[""].concat(keys.slice(0,cache.indexOf(val))).join(".")}]`;
            }
        } else cache.push(value);
        return replacer_use ? replacer.call(this, key, val) : val;
    }, space);
    // manual GC
    cache = keys = isObj = isNull = null;
    return ret;
}

/**
 * JSON string parse to Object
 * @param  {String} json       json string (With circulation path mark)
 * @param  {function} replacer replacer function
 * @return {Object}            json => object
 */
function parse(json, replacer) {
    let isObj = isType("Object"),
        isArr = isType("Array"),
        isFunc = isType("Function"),
        isStr = isType("String"),
        replacer_use = isFunc(replacer),
        re = new RegExp(`\\[${circular_placeholder} ~(\\.(.+))?\\]`);
    var ret = JSON.parse(json, (key, val) => {
        if (isStr(val) && re.test(val)) return ref2obj(val.match(re)[2] || "");
        if (val === global_placeholder) return typeof window !== "undefined"? window : (global !== "undefined"? global : (DOMWindow !== "undefined"? DOMWindow : "[UNKNOWN]"));
        return replacer_use ? replacer.call(this, key, val) : val;
    })
    ret = emit(ret);
    // GC
    delete re, isObj, isArr, isFunc, isStr;
    return ret;

    // Partial function emit
    function emit(obj) {
        var that = obj;
        return recu(obj);
        // recursion emit sub-func
        function recu(_o) {
            for (let oi in _o) {
                let o = _o[oi];
                if (isFunc(o)) _o[oi] = o(that);
                else if (isObj(o) || isArr(o)) recu(o);
            }
            return _o;
        }
    }
}

// const JSON_safe = require('JSON_safe');
const JSON_safe = {
    stringify: stringify,
    parse: parse
}
var obj = {
    version: "1.0.1",
    g: typeof(window) !== "undefined"?window:global,
    circularOBJ: {},
    deepCircular: {}
}
obj.circularOBJ.self = obj.circularOBJ;
obj.deepCircular = {
    one: {
        tow: {
            more: {
                root: obj
            }
        }
    }
}
obj.deepCircular.self = obj.deepCircular
var json = JSON_safe.stringify(obj);
var parsed = JSON_safe.parse(json);
console.log(json);
console.log(parsed);
