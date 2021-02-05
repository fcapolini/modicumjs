## typescript

```
cd <project-root>
tsc --init
```
* "target": "ES2015"
* "module": "amd"
* "outFile": "./app/bin/index.js"
* "rootDir": "./src"

## require.js

* https://requirejs.org
* https://requirejs.org/docs/start.html
```
cd <project-root>
npm install requirejs
cd app
mkdir lib
cd lib
ln -s ../../node_modules/requirejs/require.js require.js
```

## ionic core

```
cd <project-root>
npm install @ionic/core
cd app
ln -s ../node_modules/@ionic ionic
```
