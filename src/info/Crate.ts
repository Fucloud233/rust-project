/* eslint-disable @typescript-eslint/naming-convention */
import { Exclude, Expose, Type } from "class-transformer";
import { Uri } from "vscode";
import path = require("path");

import { getAbsoluteUri, getRelativeUri, uriToString } from "../utils/fs";
import { relativeUriToCrateName } from "../utils/info";
import { PathType, projectConfig } from "../config";
import Dep from "./Dep";

export default class Crate {
    // 既保留绝对路径 又保留相对路径
    @Exclude()
    private _root_module: Uri ;
    @Exclude()
    private _relative_root_module: string;

    private display_name: string;
    // [注意] 此处是string类型
    private "edition": "2015" | "2018" | "2021";
    @Exclude()
    private _deps: Dep[];

    constructor(fileName: Uri=Uri.parse(""), folderPath: Uri | undefined=undefined) {
        this._relative_root_module = getRelativeUri(fileName, folderPath);
        this._root_module = fileName;

        this.display_name = relativeUriToCrateName(this._relative_root_module);
        this.edition = projectConfig.defaultEdition;
        this._deps = [];
    }

    isEqualWithUri(fileUri: Uri | string): boolean {
        // [注意] 不能直接比较Uri对象 需要比较fsPath对象
        let fileUriStr = uriToString(fileUri);
        if(path.isAbsolute(fileUriStr)) {
            return fileUriStr === this._root_module.fsPath;
        } else {
            return fileUriStr === this._relative_root_module;
        }
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

    // 通过getter/setter重新定义字段root_module
    @Expose({name: "root_module"})
    get rootModule(): string {
        switch(projectConfig.pathType) {
            case PathType.relative: return this._relative_root_module;
            case PathType.absolute: return this._root_module.fsPath;
        }
    }

    set rootModule(uriStr: string) {
        if(path.isAbsolute(uriStr)) {
            this._root_module = Uri.parse(uriStr);
            this._relative_root_module = getRelativeUri(this._root_module);
        } else {
            this._root_module = getAbsoluteUri(uriStr);
            this._relative_root_module = uriStr;
        }
    }

    get displayName(): string {
        return this.display_name;
    }

    get relativeRootModule(): string {
        return this._relative_root_module;
    }

    get absoluteRootModule(): string {
        return this._root_module.fsPath;
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