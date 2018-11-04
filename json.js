/**
 * JSON tool kit, support circular structure
 * @author zhzluke96
 */

const is = require('is-obj-type');
const ref2obj = ref_string => root => ref_string ? eval("root." + ref_string) : root;
const global_placeholder = "[Global Object]";

// circular placeholder
const circular_placeholder = "CIRCULAR";

// replace global
const repG = obj => {
    var cache = []
    function recu(_o){
        if(is.obj(_o) || is.arr(_o)){
            for (let vi in _o) {
                let v = _o[vi];
                if(~cache.indexOf(v))continue;
                else cache.push(v);
                _o[vi] = recu(v);
            }
        }else if(is.global(_o)){
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
        keys = [];
    // node environ
    if(typeof global !== "undefined")value = repG(value);
    const ret = JSON.stringify(value, function(key, val) {
        if (cache.length) {
            // pop cache
            var cur = cache.indexOf(this);
            if(~cur) {
                cache.splice(cur + 1);
                keys.splice(cur, Infinity, key);
            }else {
                cache.push(this);
                keys.push(key);
            }
            // skip Global ref
            if (is.global(val)) return global_placeholder;
            if (is.obj(val) && !is.null(val)) {
                // Provided circulation/loop structure path hints
                // ~ => root path
                if (~cache.indexOf(val)) return `[${circular_placeholder} ~${[""].concat(keys.slice(0,cache.indexOf(val))).join(".")}]`;
            }
        } else cache.push(value);
        return is.func(replacer) ? replacer.call(this, key, val) : val;
    }, space);
    // manual GC
    delete cache,keys;
    return ret;
}

/**
 * JSON string parse to Object
 * @param  {String} json       json string (With circulation path mark)
 * @param  {function} replacer replacer function
 * @return {Object}            json => object
 */
function parse(json, replacer) {
    let re = new RegExp(`\\[${circular_placeholder} ~(\\.(.+))?\\]`);
    var ret = JSON.parse(json, (key, val) => {
        if (is.str(val) && re.test(val)) return ref2obj(val.match(re)[2] || "");
        if (val === global_placeholder) return typeof window !== "undefined"? window : (global !== "undefined"? global : (DOMWindow !== "undefined"? DOMWindow : "[UNKNOWN]"));
        return is.func(replacer) ? replacer.call(this, key, val) : val;
    })
    ret = emit(ret);
    // GC
    delete re;
    return ret;
    // Partial function emit
    function emit(obj) {
        var that = obj;
        return recu(obj);
        // recursion emit sub-func
        function recu(_o) {
            for (let oi in _o) {
                let o = _o[oi];
                if (is.func(o)) _o[oi] = o(that);
                else if (is.obj(o) || is.arr(o)) recu(o);
            }
            return _o;
        }
    }
}

module.exports = {stringify,parse};
