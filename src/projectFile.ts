/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json
import * as vscode from 'vscode';
import {Config} from './config';

export class ProjectInfo {
    "sysroot": string;
    "crates": Crate[];

    constructor(crates: Crate[]) {
        this.sysroot = Config.sysroot;
        this.crates = crates;
    }
}

export class Crate {
    "root_module": string;
    // [注意] 此处是string类型
    "edition": "2015" | "2018" | "2021";
    "deps": string[];

    constructor(fileName: vscode.Uri) {
        this.root_module = fileName.fsPath;
        this.edition = "2021";
        this.deps = [];
    }
}