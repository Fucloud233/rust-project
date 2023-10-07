# Change Log

All notable changes to the "test-fs" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.


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