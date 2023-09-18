/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json

export const FIELD_NAME = "rust-analyzer.linkedProjects";

export class ProjectFIle {
    "sysroot": string;
    "crates": Crates[];
}

export class Crates {
    "root_module": string;
    "edition": 2015 | 2018 | 2021;
    "deps": string[];
}