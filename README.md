# rust-project

You can use `rust-analyzer` without creating a Cargo project using our extension.

## Usage

Make sure to the install `rust-analyzer` extension first, otherwise our extension won't work.

### Basic

1. Open a empty folder
2. Utilize `rust-project: Initialize` command to activate our extension
3. Create a `*.rs` file
4. You can write rust code using rust-analyzer now

> If there are already rust code in your folder, 
> this extension will be automatically enabled.

### Nest Folder

In the above circumstance, all configuration information about your code will be stored in `.vscode/settings.json`.
As the quantity of files in your project increases, the size of this file will also grow.
To Address this, 
our extension offers a method to manage files within a folder more effectively. 

1. Create a empty folder in your workspace
2. Right click the newly created folder in the explorer
3. Select the Option `Create rust-project`
4. Create a `*.rs` file in the same folder
5. You can write rust code using rust-analyzer now

Please note that it's currently not possible to create rust-project in a non-empty folder.
Doing so would introduce complications for the logic of our extension.

> Our extension determines the location of `*.rs` file using longest-path-matching approach.
> This means that it searches for the `rust-project.json` file with the longest identical path.
> otherwise we use `settings.json` file.
> If creating a `rust-project.json` in a non-empty folder is allowed,
> our logic will break.
>
> While we may consider further improvement in the future,
> this is the current behavior.

Additionally, you have the option to destroy the `rust-project.json` file that you have created.
but ensure that it doesn't contain any `*.rs` files.

### Notice 

Please use the command we provided to alter configuration files 
such as `settings.json` and `rust-project.json`
instead of making manual changes.

If you're interested in delving deeper into the principles behind this extension, you can refer to the [User Manual](https://rust-analyzer.github.io/manual.html#non-cargo-based-projects) provided by the rust-analyzer.


## Q&A

### 1. rust-analyzer prompt: sysroot not found

Our extension will automatically configure the path of sysroot.
If rust-analyzer still can't find this, you could try restart your VSCode 
or press `ctrl + ,` to set the path in settings manually.

### 2. rust-analyzer prompt: `xxx/lib/rustlib/src` in Linux
rust-analyzer need source code of the standard library. 
If these code doesn't exist in your system, please execute the below command to install manually.

```bash
$ rustup component add rust-src
```

> Ref: https://wiki.archlinuxcn.org/zh-tw/Rust

### 3. `settings.json` not actually modified after changing

For convenient of reading the `settings.json`, we store it in the memory.
This implies that every action within our extension initially modifies the data in memory 
and subsequently writes it to the filesystem. 
While we don't recommend manual changes to this file, if you find it necessary to make alterations, please use the "Reload Settings File" command to ensure that your changes take effect.