# TypeScript Plugin for DocPad
Adds support for [TypeScript](http://Typescriptlang.org/) to JavaScript compilation to [DocPad](https://docpad.org)

Convention:  `.js.ts` only files with that extension
Doesnt't process files that end with '.ts' or '.d.ts'. If env=default all '.ts' files are copied as they are to support source maps.

## Install

```
npm install --save git://github.com/a4everyone/docpad-plugin-typescript.git

```

## Configure

### Defaults

The default configuration for this plugin is the equivalent of default options of [TypeScript](http://Typescriptlang.org/)'s **tsconfig.json** options to your [DocPad configuration file](http://docpad.org/docs/config):

1. Simple form. May be used almost any option for [tsconfig.json](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

``` coffee
plugins:
  typescript:
    target: 'es3'
    sourceMap: true
```

2. Environments specific options. Same as simple options but for each Docpad's enviorment. (environments development is the default) :

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
> Don't use `tsc` options: out, outFile, outDir

## History
You can discover the history inside the [History.md](/History.md) file


## License
Licensed under the Apache 2.0 License -- see license.txt
<br/>Copyright &copy; 2016 [A4E Ltd.](http://a4everyone.com)
