import * as vscode from 'vscode';
import * as path from 'path';
import { checkFile, writeJsonFile, readJsonFile } from './fsUtils';
import { Crate, ProjectInfo } from './projectFile';

const SETTINGS_FILE_NAME = path.join(".vscode", "settings.json");
const FIELD_NAME = "rust-analyzer.linkedProjects";
 

export class SettingsFile {
    settingsUri: vscode.Uri;
    settingsJson: any;

    constructor(rootUri: vscode.Uri) {
        this.settingsUri = vscode.Uri.joinPath(rootUri, SETTINGS_FILE_NAME);
        this.settingsJson = {};
    }

    // 读取文件
    async load() {
        try {
            // 读取settings文件
            if(await checkFile(this.settingsUri)) {
                // 读取正常
                this.settingsJson = await readJsonFile(this.settingsUri);
            }

            // 但缺少fieldName时 需要创建字段名
            if(!this.settingsJson.hasOwnProperty(FIELD_NAME)) {
                this.settingsJson[FIELD_NAME] = [];
            }

            console.log(this.settingsJson);
        } catch (error) {
            throw error;
        }
    }

    // 保存文件
    async save() {
        try{
            console.log(JSON.stringify(this.settingsJson));
            writeJsonFile(this.settingsUri, this.settingsJson);
        } catch(error) {
            throw error;
        }
    }

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo) {
        this.settingsJson[FIELD_NAME].push(projectInfo);
    }

    appendCrate(crate: Crate) {
        
    }
}