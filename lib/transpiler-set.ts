import { TypescriptTranspiler, CompilerOptions, RootFile4Transpile, OutputFile } from "./typescript-transpiler"
import * as path from "path"

export { CompilerOptions, RootFile4Transpile, OutputFile, writeFile } from "./typescript-transpiler"

/**
 * This class holds set of transpilers based on list of different root directories.
 * The list is specified at the very initialisation of the instance 
 */
export class TranspilerSet {
    private transpilerInstances: TranspilerSet.TranspilerInstance[]

    constructor(rootWorkingDirs: string[], private compilerOptions: CompilerOptions) {


        this.transpilerInstances =
            rootWorkingDirs.map( dir => { 
                return {  
                        rootWorkingDir: dir, 
                        transpiler: new TypescriptTranspiler(dir, compilerOptions) 
                    } 
            })
    }

    /**
     * Names of the files should be specified as full path to root to allow correct detection
     * of their root working directory and that to enable uase of the right transpiler instance
     */
    public transpile(file: RootFile4Transpile): OutputFile[]
    {
        for( let trInstane of this.transpilerInstances )
        {
            // if has the same root as the root dir of cur transpiler
            if( file.name.indexOf( trInstane.rootWorkingDir ) === 0 )
            {
                // to make Typescript transpiler to output to correct source maps paths especialy in .js.map files
                // the 'sources' map property
                this.compilerOptions.mapRoot = path.dirname( file.name )

                return trInstane.transpiler.transpile( [ file ] )
            }
        }

        throw (`Typescript Error: Failed to find root working directory for the file ${file.name}`)
    }
}

namespace TranspilerSet {
    export interface TranspilerInstance {
        rootWorkingDir: string
        transpiler: TypescriptTranspiler
    }
}
