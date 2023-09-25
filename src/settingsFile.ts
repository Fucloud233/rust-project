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

            // console.log(this.settingsJson);
        } catch (error) {
            throw error;
        }
    }

    // 保存文件
    async save() {
        try{
            // console.log(JSON.stringify(this.settingsJson));
            writeJsonFile(this.settingsUri, this.settingsJson);
        } catch(error) {
            throw error;
        }
    }

    /* 如果在接口内部封装load+save 如果需要调用多次操作 则会重复IO读写 */

    // 添加项目信息
    async appendProjectInfo(projectInfo: ProjectInfo) {
        this.settingsJson[FIELD_NAME].push(projectInfo);
    }

    async appendProjectInfoUri(projectInfoUri: Uri) {
        let filePath = projectInfoUri.fsPath;
        
        // 防止重复出现
        for(const item of this.settingsJson[FIELD_NAME]) {
            // console.log("item:", item);

            if(item === filePath) {
                return;
            }
        }

        this.settingsJson[FIELD_NAME].push(projectInfoUri.fsPath);
    }

    appendCrate(crate: Crate) {
        
    }
}