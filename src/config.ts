import * as cp from 'child_process';
import * as vscode from 'vscode';

export const EXTENSION_NAME = "rust-project";
export const PROJECT_INFO = "projectInfo";
export const SYSROOT = "sysroot";
export const DEFAULT_EDITION = "defaultEdition";

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
            .catch(()=>{
                // TODO: 需要对异常进行处理
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