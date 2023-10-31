/* eslint-disable @typescript-eslint/naming-convention */
import { Exclude, Expose, Type } from "class-transformer";
import { Uri } from "vscode";

import { getRelativeUri, getRootUri, toAbsolutePath } from "../utils/fs";
import { relativeUriToCrateName } from "../utils/info";
import { projectConfig } from "../config";
import Dep from "./Dep";

export default class Crate {
    /* the difference between _root_module and root_module
        * _root_module
            - type: vscode.URI
            - is absolute path
            - for file reading and writing
            - for comparison between Cates
        * root_module
            - type: string
            - is relative path
            - is the value of field 'root_module'
     */
    @Exclude()
    private _root_module: Uri ;
    private root_module: string;

    private display_name: string;
    // [注意] 此处是string类型
    private "edition": "2015" | "2018" | "2021";
    @Exclude()
    private _deps: Dep[];

    constructor(fileName: Uri=Uri.parse(""), folderUri: Uri=getRootUri()) {
        // the folderPath is critical to get absolute path 
        this.root_module = getRelativeUri(fileName, folderUri);
        this._root_module = fileName;

        this.display_name = relativeUriToCrateName(this.root_module);
        this.edition = projectConfig.defaultEdition;
        this._deps = [];
    }

    isEqualWithUri(filePath: Uri): boolean {
        // Important: you should compare with fsPath instead of URI Object
        return filePath.fsPath === this._root_module.fsPath;
    }

    isEqualWithName(name: string): boolean {
        return this.display_name === name;
    }

    isEqual(other: Crate, isStrict: boolean=false): boolean {
        let flag = this._root_module.fsPath === other._root_module.fsPath
            && this.display_name === other.display_name;
        
        if(isStrict) {
            flag = flag && this.edition === other.edition;
        }

        return flag;
    }

    appendDep(dep: Dep) {
        this.deps.push(dep);
    }

    removeDep(dep: Dep) {
        const index = this.findDep(dep);
        if(index !== -1) {
            this.deps.splice(index, 1);
        }
    }

    removeDepWithIndex(index: number) {
        this.deps.splice(index, 1);
    }

    findDep(dep: Dep): number {
        return this.deps.findIndex(curDep=>
            curDep.name === dep.name);
    }

    hasDeps(): boolean {
        return this.deps.length > 0;
    }

    // update folderPath for correcting the root_module
    // the crate using root_folder as the folderPath
    updateRootModule(folderPath: Uri) {
        this._root_module = toAbsolutePath(this.relativeRootModule, folderPath);
    }

    get rootModule(): Uri {
        return this._root_module;
    }

    get relativeRootModule(): string {
        return this.root_module;
    }

    get displayName(): string {
        return this.display_name;
    }

    @Type(() => Dep)
    @Expose({name: "deps"})
    get deps(): Dep[] {
        return this._deps;
    }
    set deps(deps: Dep[]) {
        this._deps = deps;
    }
}