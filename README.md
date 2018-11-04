# JSON_smart
JSON tool kit, support circular structure / solve Uncaught TypeError.

# Installation
```
$ npm install json-smart
```

# Example
```js
const JSON_smart = require('JSON_smart');
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
var json = JSON_smart.stringify(obj);
var parsed = JSON_smart.parse(json);
console.log(json);
console.log(parsed);
```
output:
```
{
	"version": "1.0.1",
	"g": "[Global Object]",
	"circularOBJ": {
		"self": "[CIRCULAR ~.circularOBJ]"
	},
	"deepCircular": {
		"one": {
			"tow": {
				"more": {
					"root": "[CIRCULAR ~]"
				}
			}
		},
		"self": "[CIRCULAR ~.deepCircular]"
	}
}

{version: "1.0.1", g: Window, circularOBJ: {…}, deepCircular: {…}}
```
# Usage
like JSON.

# About
have fun.
