import * as vscode from 'vscode';
import * as path from 'path';

import { checkFile } from './fsUtils';
import { ProjectInfo, Crate } from './projectFile';
import { SettingsFile } from './settingsFile';

// 项目配置文件名
const PROJECT_FILE_NAME = "rust-project.json";

async function getProjectFileUri(rootPath: vscode.Uri, filePath: vscode.Uri):
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
        if(await checkFile(projectFileUri)) {
            hasProjectFile = true;
            return projectFileUri;
        } else {
            curPath = vscode.Uri.joinPath(curPath, subPath);
        }
    }

    return undefined;
}

async function createBySettingsFile(rootUri: vscode. Uri, fileUri: vscode.Uri) {
    const crate = new Crate(fileUri);
    const projectInfo = new ProjectInfo([crate]);
    try {
        let settingsFile = new SettingsFile(rootUri);
        await settingsFile.load();
        settingsFile.appendProjectInfo(projectInfo);
        settingsFile.save();
    } catch (e) {
        console.log(e);
    }
}

// TODO: 使用rust-project配置
async function createByProjectFile(rootUri: vscode.Uri, fileUri: vscode.Uri) {
    // 判断文件是否在根目录
    // 1. 在rust-project中配置
    // 2. 然后在.vscode/settings.json中配置
} 

// TODO: 修改rust-project配置文件
function modifyProjectFile(projectFileUri: vscode.Uri, fileUri: vscode.Uri) {

}

export async function handle(rootUri: vscode.Uri, fileUri: vscode.Uri) {
    // const fileName = path.basename(fileUri.fsPath);

    // 检测rust-project.json项目文件
    try {
        let projectFileUri = await getProjectFileUri(rootUri, fileUri);

        if (projectFileUri) {
            // 1. 如果存在则修改该项目你文件
            modifyProjectFile(projectFileUri, fileUri);
        } else {
            // 2. 如果不存在则根据config设置创建位置
            if(true) {
                createBySettingsFile(rootUri, fileUri);
            } else {
                createByProjectFile(rootUri, fileUri);
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage("项目文件检测失败!");
    }
}