var exportPlugin = require('./docpad-tsplugin');

class TypescriptPlugin {
    static __super__: any
    public config: any 

    render(opts, next) : any {
        var config, inExtension, outExtension;
        config = this.config;
        
        console.log(config)

        inExtension = opts.inExtension, outExtension = opts.outExtension;
        if ((inExtension === 'ts' ) && (outExtension === null || outExtension === 'js')) {
            // opts.content = compiler.compileToES3( opts.content, opts.file.attributes.fullPath );
            return next();
        } else {
            return next();
        }
    }
    
    constructor(...params) {
	    console.log('Instanciated')
        return TypescriptPlugin.__super__.constructor.apply(this, params);
    }
}

arguments[2].exports = exportPlugin("typescript", TypescriptPlugin );
