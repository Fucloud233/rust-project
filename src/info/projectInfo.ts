/* eslint-disable @typescript-eslint/naming-convention */

// https://zhuanlan.zhihu.com/p/654967992
// https://github.com/Fucloud233/ra-exmaple/blob/method-3/.vscode/settings.json

import { Uri }  from 'vscode';
import { Exclude, Expose, Type } from 'class-transformer';
import assert = require('assert');

import { getConfigItem, ProjectConfigItem } from '../config';
import { ImportCyclesError } from '../error';
import Crate from './Crate';
import Dep from './Dep';

// 项目配置文件名
export const PROJECT_FILE_NAME = "rust-project.json";

export class ProjectInfo {
    private "sysroot": string;
    @Exclude()
    private _crates: Crate[];

    constructor(crates: Crate[] = []) {
        this.sysroot = getConfigItem(ProjectConfigItem.sysroot);
        this._crates = crates;
    }

    setCrate(crate: Crate, index: number) {
        this.crates[index] = crate;

        console.log("after set:");
        console.log(this.crates);
    }

    removeCrate(index: number) {
        this.crates.splice(index, 1);

        // 在删除crate时 crate的相对顺序改变 需要刷新依赖
        this.refreshDeps();
    }

    removeCrateWithUri(fileUri: Uri) {
        let crateIndex = this.findCrateIndexWithUri(fileUri);
        if(crateIndex === -1) {
            return;
        }

        console.log(crateIndex);
        this.removeCrate(crateIndex);
    }

    pushCrate(crate: Crate) {
        this.crates.push(crate);
    }


    // [注意] 如果使用Exclude 有getter必须要用setter
    @Type(()=>Crate)
    @Expose({name: "crates"})
    get crates(): Crate[] {
        return this._crates;
    }
    set crates(crates: Crate[]) {
        this._crates = crates;
    }

    findCrate(crate: Crate, isStrict: boolean=false): Crate | undefined {
        if(this.crates === undefined) {
            return undefined;
        }

        return this.crates.find(
            elem => elem.isEqual(crate, isStrict));
    }

    findCrateWithUri(fileUri: Uri): Crate | undefined {
        if(this.crates === undefined) {
            return undefined;
        }

        return this.crates.find(
            elem => elem.isEqualWithUri(fileUri));
    }

    findCrateWithName(name: string): Crate | undefined {
        return this.crates === undefined ? undefined
            : this.crates.find(
                (elem)=>elem.isEqualWithName(name));
    }

    findCrateIndex(crate: Crate, isStrict: boolean=false): number{
        return this.crates === undefined ? -1
            : this.crates.findIndex(
                (elem)=>elem.isEqual(crate, isStrict));
    }

    findCrateIndexWithUri(fileUri: Uri): number {
        return this.crates === undefined ? -1
            : this.crates.findIndex(
                (elem)=>elem.isEqualWithUri(fileUri));
    }

    findCrateIndexWithName(name: string): number {
        return this.crates === undefined ? -1
            : this.crates.findIndex(
                (elem)=>elem.isEqualWithName(name));
    }

    /**
     * 用于验证crates的依赖树
     */
    updatesCrates() {

    }
    
    /* -------------------------------------------------------------------------------- */
    /* Deps相关函数
    /* -------------------------------------------------------------------------------- */

    refreshDeps() {
        // 选择存在以来的crate
        this.crates.filter((crate)=>crate.hasDeps)
            .forEach((crate)=>{
                crate.deps = crate.deps.map((dep: Dep) => {
                    // 如果找不到对应的crate下标 则需要检索
                    if(this.crates[dep.index] === undefined
                        || !this.crates[dep.index].isEqualWithName(dep.name)) {
                        let index = this.findCrateIndexWithName(dep.name);
                        dep.index = index;
                    }
                    return dep;
                }).filter((dep) => dep.index !== -1);
                // 最后过滤找不到的crate
            });
    }

    /**
     * 验证输入的Crate的Deps树是否合法
     * @param curCrate 
     */
    checkCrateDeps(curCrate: Crate) {
        // 记录已经验证通过Crate下标
        let okIndex: number[] = [];
        // 记录导入链
        let importChain: Crate[] = [curCrate];

        // 开始验证该Crate的合法性
        let crateStack: Crate[] = [curCrate];
        while(crateStack.length > 0) {
            let topCrate = crateStack.pop();
            assert(topCrate !== undefined);
            
            // 逐个验证dep合法性
            for(let dep of topCrate.deps) {
                let depCrate = this.crates[dep.index];

                // 1. 先验证dep与实际Crate是否匹配
                // [注意] 假设每次dep都是合法的
                // if(depCrate===undefined || !depCrate.isEqualWithName(dep.name)) {
                //     throw new DepNotFoundError(curCrate.displayName, dep.name);
                // }

                if(depCrate.isEqual(curCrate)) {
                    importChain.push(depCrate);
                    throw new ImportCyclesError(
                        importChain.map(crate=>crate.displayName)
                    );
                }

                if(dep.index in okIndex) {
                    // 该Crate被验证过了 则直接跳过
                    continue;
                } else if (!depCrate.hasDeps()) {
                    // Crate没有依赖 肯定是对的
                    okIndex.push(dep.index);
                    continue;
                } 

                crateStack.push(depCrate);
                importChain.push(depCrate);
            }
        }
    } 
}
