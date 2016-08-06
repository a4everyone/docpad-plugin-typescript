/// <reference path="../../typescript/lib/typescriptServices.d.ts" />

var exportPlugin = require('./docpad-tsplugin');

interface DocpadTypescriptOptions extends ts.CompilerOptions {
    environments?: any
}

// ambient declaration to tell TypeScript what comes from Docpad parent class
declare interface TypescriptPlugin {
    getConfig(): DocpadTypescriptOptions
} 

class TypescriptPlugin {
    static __super__: any 
    public docpad: any
    private excludedStylesheets: any

    render(opts, next) : any {
        var config, inExtension, outExtension;
        config = this.getTsConfig();
        
        console.log(config)

        inExtension = opts.inExtension, outExtension = opts.outExtension;
        if ((inExtension === 'ts' ) && (outExtension === null || outExtension === 'js')) {
            // opts.content = compiler.compileToES3( opts.content, opts.file.attributes.fullPath );
            return next();
        } else {
            return next();
        }
    }
    
    /**
     * extendCollection() is used to exclude from rendering files that have extension .ts but are not .js.ts files 
     */
    extendCollections(...opt) {
        let config = this.getTsConfig()
        let docpad = this.docpad

        console.log('----------------------------------------------------------------------------------------------------')
        console.log(config)
        console.log('----------------------------------------------------------------------------------------------------')

        /*
         * If there is no source map spceified then no need to render *.ts files to Docpad's 'out' folder
         */
        if(config.inlineSourceMap !== true && config.sourceMap !== true ) {
            this.excludedStylesheets = docpad.getDatabase().findAllLive({
                filename: /^.*?[^\.][^j][^s]\.ts$/  // all files ending with .ts but not those ending with .js.ts 
            })

            return this.excludedStylesheets.on('add', function(model) {
                return model.set({
                    render: false,
                    write: false
                })
            })
        }
    }

    constructor(...params) {
	    TypescriptPlugin


        return TypescriptPlugin.__super__.constructor.apply(this, params);
    }

    /**
     * Docpad has put the proper environment configuration only environments key muest be removed
     */
    getTsConfig() {
        let config = this.getConfig()
        delete config.environments
        return config
    }
}

arguments[2].exports = exportPlugin("typescript", TypescriptPlugin );
