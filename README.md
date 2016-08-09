# TypeScript Plugin for DocPad
Adds support for [TypeScript](http://Typescriptlang.org/) to JavaScript compilation/transpile to [DocPad](https://docpad.org)  
The plugin is solely based on TypeScript's native suport for [NodeJS](https://nodejs.org/) with [Typescript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)

Convention:
  * Renders to Docpad's `out` dir only files with extension `.js.ts`
  * Support source maps
  * Tripple slash reference like `/// <reference path="...">` are included as part of the file

> **NOTE:** 
> * Doesn't renders to `out` dir files that end with `.ts` or `.d.ts`. These may be used to be 'included'/referenced in `.js.ts` files
> * If in the configuration is specified `sourceMap: true` all `.ts` files are copied to `out` to support source maps debugging
> * If Docpad has installed `docpad-plugin-uglify` this plugin is going to add automatically meta data propert `uglify: true` to all `.js.ts` files


> **RESTRICTIONS:**
> * Use UTF-8 encoding for your `.ts` files
> * Use small caps/lowercase extensions
> * The piped extension .js.ts must be last. No extra piped extensions/convertions allowed at that version.

## Install

```
npm install --save git://github.com/a4everyone/docpad-plugin-typescript.git

```

## Configure

### Defaults

The default configuration for this plugin is the equivalent of default options of [TypeScript](http://Typescriptlang.org/)'s **tsconfig.json** options to your [DocPad configuration file](http://docpad.org/docs/config):

1.Simple form. May be used almost any option for [tsconfig.json](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

``` coffee
plugins:
  typescript:
    target: 'es3'
    sourceMap: true
```

2.Environments specific options. Same as simple options but for each Docpad's enviorment. (environments development is the default) :

``` coffee
plugins:
	typescript:
		# Disable source maps on the development environment.
		environments:
			development:
				target: 'es3'
				sourceMap: true
			prod:
				target: 'es3'
				sourceMap: false			
```

> **WARNING**
> Don't use `tsc` options: out, outFile, outDir, mapRoot, rootDir, sourceRoot, watch

## History
You can discover the history inside the [History.md](/History.md) file


## License
Licensed under the Apache 2.0 License -- see license.txt
<br/>Copyright &copy; 2016 [A4E Ltd.](http://a4everyone.com)
