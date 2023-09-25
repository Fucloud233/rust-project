import * as vscode from 'vscode';
import {Uri} from 'vscode';
import * as path from 'path';

import { checkFile, writeJsonFile, readJsonFile } from './fsUtils';
import { Crate, ProjectInfo } from './projectInfo';

const SETTINGS_FILE_NAME = path.join(".vscode", "settings.json");
const FIELD_NAME = "rust-analyzer.linkedProjects";
 

export class SettingsFile {
    settingsUri: Uri;
    settingsJson: any;

    constructor(rootUri: Uri) {
        this.settingsUri = Uri.joinPath(rootUri, SETTINGS_FILE_NAME);
        this.settingsJson = {};
    }

    // 读取文件
    private async load() {
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

            // console.log(this.settingsJson);
        } catch (error) {
            throw error;
        }
    }

    // 保存文件
    private async save() {
        try{
            // console.log(JSON.stringify(this.settingsJson));
            writeJsonFile(this.settingsUri, this.settingsJson);
        } catch(error) {
            throw error;
        }
    }

    // 添加项目信息
    async appendProjectInfo(projectInfo: ProjectInfo) {
        await this.load();
        this.settingsJson[FIELD_NAME].push(projectInfo);
        this.save();
    }

    async appendProjectInfoUri(projectInfoUri: Uri) {
        await this.load();
        this.settingsJson[FIELD_NAME].push(projectInfoUri.fsPath);
        this.save();
    }

    appendCrate(crate: Crate) {
        
    }
}