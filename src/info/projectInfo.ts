/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json

import { Uri }  from 'vscode';
import * as path from 'path';

import { projectConfig, PathType } from '../config';
import { Exclude, Expose, Type } from 'class-transformer';
import { getAbsoluteUri, getRelativeUri, uriToString } from '../utils/fs';
import { relativeUriToCrateName } from '../utils/info';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectInfo {
    private "sysroot": string;
    @Exclude()
    private _crates: Crate[];

    constructor(crates: Crate[] = []) {
        this.sysroot = projectConfig.sysroot;
        this._crates = crates;
    }

    setCrate(crate: Crate, index: number) {
        this.crates[index] = crate;

        console.log("after set:");
        console.log(this.crates);
    }

    removeCrate(index: number) {
        this.crates.splice(index, 1);
    }

    pushCrate(crate: Crate) {
        this.crates.push(crate);
    }

    checkCrate(crate: Crate, isStrict: boolean=false): boolean {
        for(let _curCrate of this.crates) {
            let curCrate = Object.assign(new Crate(), _curCrate);
            if(curCrate.isEqual(crate, isStrict)) {
                return true;
            }
        }
        return false;
    }

    // [注意] 如果使用Exclude 有getter必须要用setter
    @Type(()=>Crate)
    @Expose({name: "crates"})
    get crates(): Crate[] {
        return this._crates;
    }
    set crates(crates: Crate[]) {
        this._crates = crates;
    }

    findCrate(crate: Crate, isStrict: boolean=false): number {
        if(this.crates === undefined) {
            return -1;
        }

        return this.crates.findIndex((elem)=>{
            return elem.isEqual(crate, isStrict);
        });
    }

    findCrateWithUri(fileUri: Uri): number {
        if(this.crates === undefined) {
            return -1;
        }

        return this.crates.findIndex((elem)=>{
            return elem.isEqualWithUri(fileUri);
        });
    }

    /**
     * 用于验证crates的依赖树
     */
    updatesCrates() {

    }
}

export class Crate {
    // 既保留绝对路径 又保留相对路径
    @Exclude()
    private _root_module: Uri ;
    @Exclude()
    private _relative_root_module: string;

    private display_name: string;
    // [注意] 此处是string类型
    private "edition": "2015" | "2018" | "2021";
    @Type(() => Dep)
    private deps: Dep[];

    constructor(fileName: Uri=Uri.parse("")) {
        this._relative_root_module = getRelativeUri(fileName);
        this._root_module = fileName;

        this.display_name = relativeUriToCrateName(this._relative_root_module);
        this.edition = projectConfig.defaultEdition;
        this.deps = [];
    }

    appendDep(dep: Dep) {
        this.deps.push(dep);
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

    isEqual(other: Crate, isStrict: boolean=false): boolean {
        if(isStrict) {
            return this._root_module.fsPath === other._root_module.fsPath &&
                this.edition === other.edition;
        } else {
            return this._root_module.fsPath === other._root_module.fsPath;
        }
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
}

export class Dep {
    private crate: number;
    private name: string;

    constructor(index: number, name: string) {
        this.crate = index;
        this.name = name;
    }

    get index(): number {
        return this.crate;
    }
}