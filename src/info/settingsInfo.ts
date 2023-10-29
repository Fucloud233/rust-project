import { Uri } from 'vscode';
import { ProjectInfo } from "./projectInfo";
import { Exclude, Type, Expose } from 'class-transformer';
import Crate from './Crate';

const FIELD_NAME = "rust-analyzer.linkedProjects";

// ProjectInfo 可能存在多个 (但我们尽量保证只有1个 且只操作1个)
// String 肯定才能在多个
export class SettingsInfo {
    // 将项目信息分为两个数组进行存储
    @Exclude()
    private infoItems: ProjectInfo[];
    @Exclude()
    private infoPathItems: String[];

    constructor() {
        this.infoItems = [];
        this.infoPathItems = [];
    }

    // 添加项目信息
    appendProjectInfo(projectInfo: ProjectInfo | Uri) {
        if(projectInfo instanceof Uri) {
            this.infoPathItems.push(projectInfo.fsPath);
        } else {
            this.infoItems.push(projectInfo);
        }
    }

    get cratesFromFirstProject(): Crate[] {
        let project = this.firstInfoItem;
        if(project === undefined) {
            return [];
        }
        return project.crates;
    }

    @Type(() => ProjectInfo)
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
            if(project instanceof String) {
                this.infoPathItems.push(project);
            } else if(project instanceof ProjectInfo) {
                this.infoItems.push(project);
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

    /**
     * @deprecated
     * 返回第一个项目信息
     */
    get firstProject(): ProjectInfo | undefined {
        // 如果读取为空 
        if(this.projects === undefined) {
            return undefined;
        }

        // [注意] 只能使用这种写法 否则编译器会认为存在String
        for(let project of this.projects) {
            if(project instanceof ProjectInfo) {
                return project;
            }
        }  
    }

    /**
     * @deprecated
     * 返回第一个项目信息的下标
     */

    get firstProjectIndex(): number {
        return this.projects.findIndex((elem) => {
            return elem instanceof ProjectInfo;
        });
    }

    /**
     * @deprecated
     * 返回所有的项目信息
     */
    private get projects(): (ProjectInfo | String)[] {
        return this[FIELD_NAME];
    }
}