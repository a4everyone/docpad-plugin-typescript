let exportPlugin = require('./docpad-tsplugin')

import { TranspilerSet, CompilerOptions, RootFile4Transpile, OutputFile, writeFile } from "./transpiler-set"

interface DocpadTypescriptOptions extends CompilerOptions {
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
    private transpilerSet: TranspilerSet
    private isSourceMap: boolean = false

    private matchJsEndOfFile = /\.js$/
    private matchJsTsEndOfFile = /\.js\.ts$/
    private matchNoJsOnlyTsEndOfFile = /^.*?[^\.][^j][^s]\.ts$/

    render(opts, next) : any {
        let config = this.getPluginConfig()

        if ( opts.inExtension === 'ts'  && opts.outExtension === 'js' )
        {
            try {
                // to make correct placemnet of output files
                // config.outDir = this.docpad.config.outPath
                // set outFile for correct path and more important to combine all tripple slash references in one file
                config.outFile = opts.file.attributes.outPath

                // It is very important that file name to be specified by full path to work correctly detection of the
                // working directory and correct transpiler instance
                let fullPathFileName: string = opts.file.attributes.fullPath
                let mtime: number = opts.file.attributes.mtime.getTime() 
                // fix output file names (like maps) by removing .js.ts from the name
                fullPathFileName = fullPathFileName.replace(this.matchJsTsEndOfFile, '.ts')

                let srcContent = opts.content

                let rootFile: RootFile4Transpile = { 
                        name: fullPathFileName,
                        content: srcContent,
                        mtime: mtime
                     }
                let outFiles = this.transpilerSet.transpile( rootFile )

                let jsFileInd = this.getJsFileIndex(outFiles)

                // chnage Docpad document content to transpiled file text
                let jsFile = outFiles[jsFileInd]
                opts.content = jsFile.text

                outFiles.splice(jsFileInd, 1)

                // add this file as .ts file
                if( this.isSourceMap )
                    outFiles.push({
                            name: config.outFile.replace(this.matchJsEndOfFile, '.ts'),
                            writeByteOrderMark: jsFile.writeByteOrderMark, // use same as one of the JS file
                            text: srcContent
                        })

                this.writeComplementaryFiles(outFiles)
                
                return next()
            } catch(err) {
                return next(err)
            }
        } else {
            return next()
        }
    }
    
    /**
     * extendCollection() is used to exclude from rendering files that have extension .ts but are not .js.ts files 
     */
    extendCollections(...opt) {
        let config = this.getPluginConfig()

        let extendedCollection: any[] = []

        extendedCollection.push(
            this.docpad.getDatabase().findAllLive({filename: /\.js\.ts$/})
                .on('add', (document) => document.setMetaDefaults({referencesOthers:true, uglify: true})) // uglify is becuase docpad-plugin-uglify
        )

        /*
         * If there is no source map spceified then no need to render *.ts files to Docpad's 'out' folder
         */
        this.isSourceMap = ( config.inlineSourceMap === true || config.sourceMap === true )

        if( ! this.isSourceMap ) {
            this.excludedStylesheets = this.docpad.getDatabase().findAllLive({
                filename: this.matchNoJsOnlyTsEndOfFile  // all files ending with .ts but not those ending with .js.ts 
            })

            extendedCollection.push(
                this.excludedStylesheets.on('add', (model) => model.set({ render: false, write: false }) )
            )
        }

        return extendedCollection
    }

    /**
     * Executed after each change of Docpad's configuration a.k. docpad.coffee file
     * Used to validate plugin configuration. And if conf changed to set new working dirs and outPath
     */
    docpadLoaded(opts, next) {
        let config = this.getPluginConfig()

        try { 
            this.validateConfig(config)

            // What evere is specified in Docpad config file: relative or full path the config.documentsPaths property
            // always returns full path to root

            // init transpaler service based on configuration
            this.transpilerSet = new TranspilerSet(this.docpad.config.documentsPaths, config)            

            return next()
        } catch(err) {
            return next(err)
        }
    }

    constructor(...params) {
        return TypescriptPlugin.__super__.constructor.apply(this, params)
    }

    private writeComplementaryFiles(files: OutputFile[])
    {
        files.forEach( file => writeFile(file) )
    }

    private getJsFileIndex(files: OutputFile[]): number
    {
        for(let ind=0; ind < files.length; ind++)
        {
            let file = files[ind]
            if( this.matchJsEndOfFile.test(file.name) )
                return ind
        }

        return null;
    }

    /**
     * Docpad has put the proper environment configuration only environments key muest be removed
     */
    private getPluginConfig() {
        let config = this.getConfig()
        delete config.environments

        return config
    }

    private validateConfig(config: DocpadTypescriptOptions) {
        let forbiddenKeys = ['out', 'outFile', 'outDir', 'mapRoot', 'rootDir', 'sourceRoot', 'watch']
        

        for(let key in config) {
            if( forbiddenKeys.indexOf(key) >= 0 )
                throw "The Docpad's 'typescript' plugin is configured with forbidden option: " + key
        }
    }
}

arguments[2].exports = exportPlugin("typescript", TypescriptPlugin )
