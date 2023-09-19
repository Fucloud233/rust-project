/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json
import * as vscode from 'vscode';

// 临时设置的值
const sysroot = "123";

export class ProjectInfo {
    "sysroot": string;
    "crates": Crate[];

    constructor(crates: Crate[]) {
        this.sysroot = sysroot;
        this.crates = crates;
    }
}

export class Crate {
    "root_module": string;
    "edition": 2015 | 2018 | 2021;
    "deps": string[];

    constructor(fileName: vscode.Uri) {
        this.root_module = fileName.fsPath;
        this.edition = 2021;
        this.deps = [];
    }
}