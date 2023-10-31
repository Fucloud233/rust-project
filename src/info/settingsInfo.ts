import * as path from 'path';
import { Uri } from 'vscode';
import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';

import { ProjectInfo } from "./projectInfo";
import Crate from './Crate';
import * as utils from '../utils/fs';

const FIELD_NAME = "rust-analyzer.linkedProjects";

// ProjectInfo 可能存在多个 (但我们尽量保证只有1个 且只操作1个)
// String 肯定才能在多个
export class SettingsInfo {
    // 项目信息 项
    @Exclude()
    private infoItems: ProjectInfo[];
    // 项目信息路径 项 - ruest-project.json路径
    @Exclude()
    private infoPathItems: string[];

    constructor() {
        this.infoItems = [];
        this.infoPathItems = [];
    }

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo | Uri) {
        if(projectInfo instanceof Uri) {
            // 使用相对路径存储
            let relativePath = utils.getRelativeUri(projectInfo);
            this.infoPathItems.push(relativePath);
        } else {
            this.infoItems.push(projectInfo);
        }
    }

    /**
     * 传入文件夹路径 验证rust-project是否存在
     * @param folderUri 
     * @returns 
     */
    checkRustProjectExist(folderUri: Uri): boolean {
        // 获得相对路径
        let folderPath = utils.getRelativeUri(folderUri);

        for(let infoPath of this.infoPathItems) {
            // startsWith -> boolean
            if(infoPath.startsWith(folderPath)) {
                return true;
            }
        }

        return false;
    }

    getLongestMatchingPath(fileUri: Uri): Uri | undefined {
        if(this.infoPathItems.length === 0) {
            return undefined;
        }
        
        let relativeFolderPath = path.dirname(utils.getRelativeUri(fileUri));

        let matchingPaths = this.infoPathItems
            .filter((infoPath, _i, _a) => infoPath.startsWith(relativeFolderPath))
            .sort((a, b) => a.length - b.length);
        
        if(matchingPaths.length === 0) {
            return undefined;
        }

        return utils.getAbsoluteUri(matchingPaths[0]);
    }

    get cratesFromFirstProject(): Crate[] {
        let project = this.firstInfoItem;
        if(project === undefined) {
            return [];
        }
        return project.crates;
    }

    // use custom transfomer, remember to let 'toClassOnly' true
    // otherwise class-transformer will use below functiong 
    // when InstanceToPlain
    @Transform(value => {
        let items: any[] = value['value'];
        return items.map((item, _index, _array) => {
            if(typeof item === 'string') {
                return item;
            }
            return plainToInstance(ProjectInfo, item);
        });
    }, { toClassOnly: true })
    @Expose({name: FIELD_NAME})
    get linkedProjects(): (String | ProjectInfo)[] {
        let projects: (String | ProjectInfo)[] = [];

        for(let infoPathItem  of this.infoPathItems) {
            projects.push(infoPathItem);
        }

        for(let infoItem of this.infoItems) {
            projects.push(infoItem);
        }

        return projects;
    }

    set linkedProjects(projects: (String | ProjectInfo)[] ) {
        // 根据输入Project类型放在不同的数组之中            
        for(let project of projects) {
            if(project instanceof ProjectInfo) {
                this.infoItems.push(project);
            } else if(typeof project === 'string') {
                // !!! use 'typeof' judge the type of string
                this.infoPathItems.push(project);
            }
        }
    } 

    /**
     * @deprecated
     * 记录项目信息内容
     */
    // @Type(() => ProjectInfo)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private "rust-analyzer.linkedProjects": (ProjectInfo| String) [];

    /**
     * 返回第一个项目信息
     */
    get firstInfoItem(): ProjectInfo | undefined {
        if (this.infoItems.length === 0) {
            return undefined;
        }

        return this.infoItems[0];
    }
}