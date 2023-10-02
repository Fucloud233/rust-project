import * as cp from 'child_process';
import * as vscode from 'vscode';

export const EXTENSION_NAME = "rust-project";

// 配置信息字段名
export const PROJECT_INFO = "projectInfo";
    export const SYSROOT = "sysroot";
    export const DEFAULT_EDITION = "defaultEdition";
    /**
     * @deprecated 已经迁移为Create Method
     */
    export const SAVE_METHOD = "saveMethod";
    // 创建Project的方式
    export const CREATE_METHOD = "createMethod";

/**
 * @deprecated 已经迁移为Create Method
 */
export enum SaveMethod {
    settings = 1,
    rustProject
}

export enum CreateMethod {
    auto = 1, 
    manual
}

const execShell = (cmd: string) => 
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                // return resolve(cmd + "error!");
                reject(err);
            }

            return resolve(out);
        });
    });


// 获取sysroot的路径
function initSysroot() {
    const projectInfo = getProjectInfo();

    // 当空的时候自动生成
    const value = projectInfo.get(SYSROOT);
    if (value === undefined || value === "") {
        const cmd = "rustc --print sysroot";
        execShell(cmd)
            .then((o) => { 
                // 更新项目信息
                projectInfo.update(SYSROOT, o.trim(), true);
            })
            .catch((err)=>{
                // TODO: 需要对异常进行处理
                vscode.window.showErrorMessage(err);
                return "";
            });
    }
};

// 初始化配置
export function initConfig() {
    initSysroot();
}

export function getConfig(section: string): any {
    section = EXTENSION_NAME + "." + section;
    return vscode.workspace.getConfiguration(section);
}

// 获取ProjectInfo 信息
export function getProjectInfo(section: string = ""): any {
    const projectInfo = getConfig(PROJECT_INFO);
    if(section === "") {
        return projectInfo;
    } else {
        return projectInfo.get(section);
    }
}

/**
 * @deprecated 已经迁移为Create Method
 */
// 获取配置信息
export function getSaveMethod(): SaveMethod {
    const saveMethod = getProjectInfo(SAVE_METHOD);

    switch(saveMethod) {
        case "settings": return SaveMethod.settings;
        case "rust-project": return SaveMethod.rustProject;
        default: return SaveMethod.settings;
    }
}

export function getCreateMethod(): CreateMethod {
    const createMethod = getProjectInfo(CREATE_METHOD);

    switch(createMethod) {
        case "auto": return CreateMethod.auto;
        case "manual": return CreateMethod.manual;
        default: return CreateMethod.auto; 
    }
}