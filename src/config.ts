import * as cp from 'child_process';

const execShell = (cmd: string) => 
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                // return resolve(cmd + "error!");
                reject(err);
            }

            return resolve(out);
        });
    });


// 获取sysroot的路径
async function getSysroot(): Promise<string> {
    const cmd = "rustc --print sysroot";

    return execShell(cmd)
        .then((o) => { return o.trim();})
        .catch(()=>{
            // TODO: 需要对异常进行处理
            return "";
        });
};

export class Config {
    static sysroot: string = "";

    static async init() {
        Config.sysroot = await getSysroot();
    }
}