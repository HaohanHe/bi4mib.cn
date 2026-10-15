# BI4MIB.cn

何浩�?(BI4MIB) 的个人主�?—�?业余无线�?/ 项目 / 通联日志。由�?PHP 动态站点转建的 GitHub Pages 静态版本�?
## 站点结构

| 文件 | 说明 |
| --- | --- |
| `index.html` | 首页（中文，默认�?|
| `index-en.html` | 首页（English�?|
| `index-ja.html` | 首页（日本語�?|
| `logs.html` | 通联日志页（数据来自 `data/logs.json`，前端筛�?排序/分页�?|
| `data/` | 站点公开数据（projects / logs / config / modules / stars 等） |
| `css/` `js/` | 样式与脚�?|
| `embed/` | 可嵌入第三方的静态资料页 |
| `CNAME` | 自定义域�?`bi4mib.cn` |

## 说明

- GitHub Pages 不运�?PHP，原站的服务端渲染（多语言、模块开关、数据注入）在此处以预渲染方式完成；
  语言版本在构建时生成，切换语言即跳转对应文件�?- 原站的访问统计（`/api/track.php`）无后端，已移除�?- `logs.json` 更新后推送即可，日志页自动反映�?
## 本地重建

`scripts/build.mjs` 记录了从�?PHP 模板生成本站点的完整过程�?