import { Uri } from 'vscode';
import * as path from 'path';

import { checkFile, writeJsonFile, readJsonFile } from './fsUtils';
import { Crate, ProjectInfo } from './projectInfo';

const SETTINGS_FILE_NAME = path.join(".vscode", "settings.json");
const FIELD_NAME = "rust-analyzer.linkedProjects";
const CRATES = "crates"
 

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

    /**
     * 向ProjectInfo中添加Crate 
     * @param crate 
     */
    async appendCrateToProjectInfo(crate: Crate) {
        try {
            let projects = this.settingsJson[FIELD_NAME];

            const index = this.getFirstProjectInfoIndex();
            if(index == -1) {
                projects.push(new ProjectInfo([crate]));
            } else {
                // 存在项目则插入
                projects[index][CRATES].push(crate);
            }
        } catch (err) {
            console.log("appendCreateToProjectInfo:\n", err);
        } 
    }

    async removeCrateFromProjectInfo(fileUri: Uri) {
        let projects: [] = this.settingsJson[FIELD_NAME];
        const index = this.getFirstProjectInfoIndex();
        
        if(index==-1) {
            return;
        }        

        let crates: [] = projects[index][CRATES];
        const indexToDelet = crates.findIndex((crate) => {
            crate["root_module"] == fileUri.fsPath
        })
        crates.splice(indexToDelet, 1);
    }

    appendCrate(crate: Crate) {
        
    }

    // 获得第一个项目的索引
    private getFirstProjectInfoIndex(): number {
        let projects = this.settingsJson[FIELD_NAME];
        
        for(let i=0; i<projects.length; i++) {
            if(typeof projects[i] !== 'string') {
                return i;
            }
        }

        return -1;
    }
}