// import * as cp from 'child_process';
import * as vscode from 'vscode';

const EXTENSION_NAME = "rust-project";

// the config name in our extension
const CONFIG_SECTION_NAME = EXTENSION_NAME;

export enum ProjectConfigItem {
    sysroot = 'sysroot',
    defaultEdition = 'defaultEdition'
}

export function getConfigItem(itemName: ProjectConfigItem) {
    const configInfo = vscode.workspace.getConfiguration(CONFIG_SECTION_NAME);
    return configInfo[itemName];
}

// const execShell = (cmd: string) => 
//     new Promise<string>((resolve, reject) => {
//         cp.exec(cmd, (err, out) => {
//             if (err) {
//                 // return resolve(cmd + "error!");
//                 reject(err);
//             }

//             return resolve(out);
//         });
//     });


// // 获取sysroot的路径
// function initSysroot() {
//     const projectInfo = getProjectInfo();

//     // 当空的时候自动生成
//     const value = projectInfo.get(SYSROOT);
//     if (value === undefined || value === "") {
//         const cmd = "rustc --print sysroot";
//         execShell(cmd)
//             .then((o) => { 
//                 // 更新项目信息
//                 projectInfo.update(SYSROOT, o.trim(), true);
//             })
//             .catch((err)=>{
//                 // TODO: 需要对异常进行处理
//                 vscode.window.showErrorMessage(err);
//                 return "";
//             });
//     }
// };

// // 初始化配置
// export function initConfig() {
//     initSysroot();
// }