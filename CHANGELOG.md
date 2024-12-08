# Change Log

## [0.1.2] - 2024.11.08

This extension may not work properly due to `rust-analyzer` now.

### Added

- Add notifaction to tell user the problem about this extension. 

## [0.1.1] - 2023.11.11

### Added

- Rename create/destroy rust-project into add/remove
- Create `vscode/settings.json` file when use `Add rust-project to Folder`

### Fixed

- `Reload Settings File` command error
  
### Deleted

- Auto init sysroot

## [0.1.0] - 2023.11.03

### Added

- Unite the Auto and Manual Mode
- Implement create and destroy rust-project
- Remove the way to store `*.rs` file paths using relative or absolute paths.
- Translate documents into English
- Refactor code related to ProjectFile and ProjectInfo

## [0.0.4] - 2023.10.07

### Added

- 优化创建项目的方式，使用Auto/Manual模式
- 添加选择Crate的路径保存类型（相对/绝对）
- 添加指令
  - 导入（或取消导入）Crate
  - 刷新依赖
  - 验证依赖是否循环

## [0.0.3] - 2023.09.26

### Added

- 添加图标

## [0.0.2] - 2023.09.26

### Added

- 优化插件启动的条件，只有当`Cargo.toml`不存在时，才能激活插件

### Fixed

- 修复当使用`settings`保存方法时，也会保存`rust-project`的Bug 

## [Unreleased]