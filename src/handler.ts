import * as path from 'path';
import * as vscode from 'vscode';
import {Uri} from 'vscode';
import * as config from './config';
import * as fsUtils from './fsUtils';
import { ProjectInfo, Crate, PROJECT_FILE_NAME } from './projectInfo';
import { SettingsFile } from './settingsFile';



async function getProjectFileUri(rootPath: Uri, filePath: Uri):
     Promise<Uri | undefined> {

    // 拆分路径
    let subPaths = path.relative(rootPath.fsPath, filePath.fsPath)
        .split(path.sep);

    // 判断是否存在项目文件
    let hasProjectFile = false;
    let curPath = rootPath;
    for (let subPath of subPaths) {
        // 获取项目文件的Uri
        let projectFileUri = Uri.joinPath(curPath, PROJECT_FILE_NAME);
        
        // 验证文件是否存在
        if(await fsUtils.checkFile(projectFileUri)) {
            hasProjectFile = true;
            return projectFileUri;
        } else {
            curPath = Uri.joinPath(curPath, subPath);
        }
    }

    return undefined;
}

function createBySettingsFile(rootUri:  Uri, fileUri: Uri) {
    const crate = new Crate(fileUri);
    const projectInfo = new ProjectInfo([crate]);
    try {
        new SettingsFile(rootUri).appendProjectInfo(projectInfo);
    } catch (e) {
        console.log(e);
    }
}

// TODO: 使用rust-project配置
function createByProjectFile(rootUri: Uri, fileUri: Uri) {
    // 判断文件是否在根目录
    const isRoot = rootUri === fileUri;
    
    // 1. 在rust-project中配置
    let projectInfo = new ProjectInfo([new Crate(fileUri)]);
    let projectInfoUri =  Uri.joinPath(
        Uri.parse(path.dirname(fileUri.path)), PROJECT_FILE_NAME);
    fsUtils.writeJsonFile(projectInfoUri, projectInfo);

    console.log("projectInfoUri: ", projectInfoUri);

    // 2. 然后在.vscode/settings.json中配置
    if(!isRoot) {
        new SettingsFile(rootUri).appendProjectInfoUri(projectInfoUri);
    }
} 

// TODO: 修改rust-project配置文件
function modifyProjectFile(projectFileUri: Uri, fileUri: Uri) {

}

export async function handle(rootUri: Uri, fileUri: Uri) {
    // const fileName = path.basename(fileUri.fsPath);

    // 检测rust-project.json项目文件
    try {
        const saveMethod = config.getSaveMethod();
        switch(saveMethod) {
            // 如果使用存储在settings中
            case config.SaveMethod.settings: {
                createBySettingsFile(rootUri, fileUri);
            };

            // 如果使用存储在rust-project中
            case config.SaveMethod.rustProject: {
                // 1. 查找projectfile文件
                let projectFileUri = await getProjectFileUri(rootUri, fileUri);
                if (projectFileUri) {
                    // (1) 存在 -> 修改该项目文件
                    modifyProjectFile(projectFileUri, fileUri);
                } else {
                    // (2) 不存在 -> 在当前文件中创建rust-project
                    createByProjectFile(rootUri, fileUri);
                }
            }
        };
    } catch (error) {
        vscode.window.showErrorMessage("项目文件检测失败!");
    }
}