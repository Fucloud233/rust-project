/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json

import { Uri }  from 'vscode';
import * as config from './config';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectInfo {
    private "sysroot": string;
    private "crates": Crate[];

    constructor(crates: Crate[] = []) {
        this.sysroot = config.getProjectInfo(config.SYSROOT);
        this.crates = crates;
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

    findCrate(crate: Crate, isStrict: boolean=false): number {
        for(let i=0; i<this.crates.length; i++) {
            let curCrate = Object.assign(new Crate(), this.crates[i]);
            if(curCrate.isEqual(crate, isStrict)) {
                return i;
            }
        }
        return -1;
    }

    findCrateWithUri(fileUri: Uri): number {
        for(let i=0; i<this.crates.length; i++) {
            let curCrate = Object.assign(new Crate(), this.crates[i]);
            if(curCrate.isEqualWithUri(fileUri)) {
                return i;
            }
        }
        return -1;
    }
}

export class Crate {
    // TODO: 考虑使用相对路径
    "root_module": string;
    // [注意] 此处是string类型
    "edition": "2015" | "2018" | "2021";
    "deps": string[];

    constructor(fileName: Uri=Uri.parse("")) {
        this.root_module = fileName.fsPath;
        this.edition = config.getProjectInfo(config.DEFAULT_EDITION);
        this.deps = [];
    }

    isEqualWithUri(fileUri: Uri): boolean {
        return this.root_module === fileUri.fsPath;
    }

    isEqual(other: Crate, isStrict: boolean=false): boolean {
        if(isStrict) {
            return this.root_module === other.root_module &&
                this.edition === other.edition;
        } else {
            return this.root_module === other.root_module;
        }
    }
}