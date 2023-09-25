/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json

import * as vscode from 'vscode';
import * as config from './config';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectInfo {
    "sysroot": string;
    "crates": Crate[];

    constructor(crates: Crate[]) {
        this.sysroot = config.getProjectInfo(config.SYSROOT);
        this.crates = crates;
    }
}

export class Crate {
    // TODO: 考虑使用相对路径
    "root_module": string;
    // [注意] 此处是string类型
    "edition": "2015" | "2018" | "2021";
    "deps": string[];

    constructor(fileName: vscode.Uri) {
        this.root_module = fileName.fsPath;
        this.edition = config.getProjectInfo(config.DEFAULT_EDITION);
        this.deps = [];
    }
}