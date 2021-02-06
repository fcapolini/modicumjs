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

## npm notes

* [npm-init](https://docs.npmjs.com/cli/v6/commands/npm-init)
* [npm-install](https://docs.npmjs.com/cli/v6/commands/npm-install)
* [npm-link](https://docs.npmjs.com/cli/v6/commands/npm-link)
* [npm-publish](https://docs.npmjs.com/cli/v6/commands/npm-publish)
