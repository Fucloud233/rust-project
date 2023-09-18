import * as vscode from 'vscode';
import {workspace} from 'vscode';

import * as path from 'path';

import {checkFile} from './fsUtils';

// 项目配置文件名
const PROJECT_FILE_NAME = "rust-project.json";
// vscode settings文件位置
const SETTINGS_FILE_NAME = path.join("vscode", "setting.json");


async function getProjectFile(rootPath: vscode.Uri, filePath: vscode.Uri):
     Promise<vscode.Uri | undefined> {

    // 拆分路径
    let subPaths = path.relative(rootPath.fsPath, filePath.fsPath)
        .split(path.sep);

    // 判断是否存在项目文件
    let hasProjectFile = false;
    let curPath = rootPath;
    for (let subPath of subPaths) {
        // 获取项目文件的Uri
        let projectFileUri = vscode.Uri.joinPath(curPath, PROJECT_FILE_NAME);
        
        // 验证文件是否存在
        if(checkFile(projectFileUri)) {
            hasProjectFile = true;
            return projectFileUri;
        } else {
            curPath = vscode.Uri.joinPath(curPath, subPath);
        }
    }

    return undefined;
}

const createSettingsFile = (settingsFileUri: vscode.Uri, fileName: string) => {
    

};

function createProjectFile(rootUri: vscode. Uri, fileUri: vscode.Uri, fileName: string) {
    // 如果使用vscode优先方法
    
    // 1. 确定settings文件是否存在
    const settingsUri = vscode.Uri.joinPath(rootUri, SETTINGS_FILE_NAME);
    if(checkFile(settingsUri)) {
        
    }
    


    // 如果使用project优先方法
    
}

function modifyProjectFile(projectFileUri: vscode.Uri, fileName: string) {

}

export async function handle(rootUri: vscode.Uri) {
    const watcher = workspace.createFileSystemWatcher("**/*.rs");

    // 当创建文件的时候激活
    watcher.onDidCreate(async (fileUri: vscode.Uri) => {
        // console.log("rootUri: " + rootPath.path + "\nfileUri: " + uri.path);
        // console.log(uri.toJSON());

        const fileName = path.basename(fileUri.fsPath);

        // 获取项目文件
        // 1. 如果存在则修改文件中的项目你文件
        // 2. 如果不存在则根据config设置创建位置
        await getProjectFile(rootUri, fileUri).then(
            (projectFileUri) => {
                if (projectFileUri === undefined) {
                    const isRoot = projectFileUri === rootUri;
                    // createProjectFile(fileUri, fileName, isRoot);
                } else {
                    modifyProjectFile(projectFileUri, fileName);
                }
            }, () => {
                vscode.window.showErrorMessage("项目文件检测失败!");
            }
        );
    });
}