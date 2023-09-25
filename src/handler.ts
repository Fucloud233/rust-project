import * as vscode from 'vscode';
import {Uri} from 'vscode';

import * as config from './config';
import { ProjectInfo, Crate} from './projectInfo';
import { SettingsFile } from './settingsFile';
import { ProjectFile, getProjectFileUri } from './projectFile';


async function createSettingsFile(rootUri:  Uri, fileUri: Uri) {
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

// 使用rust-project配置
async function createProjectFile(projectFileUri: Uri, rootUri: Uri, fileUri: Uri) {
    // 1. 在rust-project中配置
    let projectFile = new ProjectFile(projectFileUri);
    projectFile.init(new Crate(fileUri));
    projectFile.save();

    // 2. 然后在.vscode/settings.json中配置
    const isRoot = rootUri === fileUri;
    if(!isRoot) {
        let settingsFile = new SettingsFile(rootUri);
        await settingsFile.load();
        settingsFile.appendProjectInfoUri(projectFileUri);
        settingsFile.save();
    }
} 

// 修改rust-project配置文件
async function modifyProjectFile(projectFileUri: Uri, fileUri: Uri) {
    let projectFile = new ProjectFile(projectFileUri);
    await projectFile.load();

    // console.log(projectFile);

    projectFile.appendCrate(new Crate(fileUri));
    projectFile.save();
}

export async function handle(rootUri: Uri, fileUri: Uri) {
    // 检测rust-project.json项目文件
    try {
        const saveMethod = config.getSaveMethod();
        switch(saveMethod) {
            // 如果使用存储在settings中
            case config.SaveMethod.settings: {
                createSettingsFile(rootUri, fileUri);
            };

            // 如果使用存储在rust-project中
            case config.SaveMethod.rustProject: {
                // 1. 查找projectfile文件
                let [projectFileUri, isExist] = await getProjectFileUri(rootUri, fileUri);

                if (isExist) {
                    // (1) 存在 -> 修改该项目文件
                    modifyProjectFile(projectFileUri, fileUri);
                } else {
                    // (2) 不存在 -> 在当前文件中创建rust-project
                    createProjectFile(projectFileUri, rootUri, fileUri);
                }
            }
        };
    } catch (error) {
        vscode.window.showErrorMessage("项目文件检测失败!");
    }
}