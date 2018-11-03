# JSON_safe
JSON tool kit, support circular structure / solve Uncaught TypeError.

# Example
```js
const JSON_safe = require('JSON_safe');
var obj = {
    version: "1.0.1",
    circularOBJ: {},
    deepCircular: {}
}
obj.circularOBJ.self = obj.circularOBJ;
obj.deepCircular = {
    one:{
        tow:{
            more:{
                root: obj
            }
        }
    }
}
var json = JSON_safe.stringify(obj);
var parsed = JSON_safe.parse(json);
console.log(json);
console.log(parsed);
```

# Usage
