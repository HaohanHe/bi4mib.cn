/**
 * BI4MIB.cn -> GitHub Pages static build
 * 参照原 PHP 站点 (index.php) 的渲染逻辑，把它转成纯静态站点：
 *  - 预渲染 zh/en/ja 三个语言版本（index.html / index-en.html / index-ja.html）
 *  - 模块开关（modules.json）与 PHP 行为保持一致（隐藏禁用区块/导航）
 *  - logs.html 的 /api/logs.php 改为前端直读 data/logs.json（算法 1:1 移植）
 *  - main.js 去掉 sendBeacon('/api/track.php') 统计回传，语言切换改为跳转到对应语言文件
 * 输入:  原始备份站点目录 (SRC)
 * 输出:  out/  （直接作为 GitHub Pages 仓库内容推送）
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const SRC = 'C:/Users/xxhzb/Downloads/bi4mib.cn/bi4mib.cn/index';
const OUT = new URL('./out/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OVERRIDE = new URL('./override/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const VERSION = '20261015v2';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const read = (p) => readFileSync(join(SRC, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));
// override/ 优先：内容与样式更新以 override 目录为准
const readOrOverride = (p) => existsSync(join(OVERRIDE, p)) ? readFileSync(join(OVERRIDE, p), 'utf8') : read(p);
const readJsonOrOverride = (p) => JSON.parse(readOrOverride(p));

const translations = readJson('data/translations.json');
const modules = readJson('data/modules.json');
const config = readJson('data/config.json');
const projectsData = readJsonOrOverride('data/projects.json');
const reviewsData = readJson('data/reviews.json');
const postsData = readJson('data/posts.json');
const logsData = readJson('data/logs.json');

const moduleEnabled = (k) => (k in modules ? modules[k] !== false : true);

// 与 index.php 的 t() 等价：按语言取值，缺失回退 key
function t(key, lang) {
  const value = key.split('.').reduce((acc, k) => (acc && typeof acc === 'object' && k in acc ? acc[k] : undefined), translations);
  if (value && typeof value === 'object' && lang in value) return value[lang];
  return key;
}

const featuredPosts = (postsData.posts || []).filter((p) => p && p.featured === true);

// PHP 的隐藏逻辑：禁用模块 -> 删区块 + 删导航项；无精选文章 -> 删轮播
const hiddenSections = [];
for (const key of ['projects', 'reviews', 'logs', 'blog']) {
  if (!moduleEnabled(key)) hiddenSections.push(key);
}
if (featuredPosts.length === 0) hiddenSections.push('carousel');

const hiddenNav = ['projects', 'reviews', 'logs', 'blog'].filter((k) => !moduleEnabled(k));

const LOCALE = { zh: 'zh_CN', en: 'en_US', ja: 'ja_JP' };

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    `;

function renderIndex(lang) {
  let html = read('index.html');

  const replacements = {
    '{{lang}}': lang,
    '{{nav.about}}': t('nav.about', lang),
    '{{nav.projects}}': t('nav.projects', lang),
    '{{nav.reviews}}': t('nav.reviews', lang),
    '{{nav.logs}}': t('nav.logs', lang),
    '{{nav.blog}}': t('nav.blog', lang),
    '{{nav.contact}}': t('nav.contact', lang),
    '{{nav.home}}': t('nav.home', lang),
    '{{nav.skipToContent}}': t('nav.skipToContent', lang),
    '{{nav.mainNavigation}}': t('nav.mainNavigation', lang),
    '{{nav.language}}': t('nav.language', lang),
    '{{nav.selectLanguage}}': t('nav.selectLanguage', lang),
    '{{nav.openMenu}}': t('nav.openMenu', lang),
    '{{nav.tags}}': t('nav.tags', lang),
    '{{nav.featuredPosts}}': t('nav.featuredPosts', lang),
    '{{nav.previousSlide}}': t('nav.previousSlide', lang),
    '{{nav.nextSlide}}': t('nav.nextSlide', lang),
    '{{nav.slidePages}}': t('nav.slidePages', lang),
    '{{nav.socialLinks}}': t('nav.socialLinks', lang),
    '{{nav.avatarPlaceholder}}': t('nav.avatarPlaceholder', lang),
    '{{nav.footerNavigation}}': t('nav.footerNavigation', lang),
    '{{hero.subtitle}}': t('hero.subtitle', lang),
    '{{hero.tag.radio}}': t('hero.tag.radio', lang),
    '{{hero.tag.opensource}}': t('hero.tag.opensource', lang),
    '{{hero.tag.tech}}': t('hero.tag.tech', lang),
    '{{section.about.title}}': t('sections.about.title', lang),
    '{{section.about.bio}}': t('sections.about.bio', lang),
    '{{section.projects.title}}': t('sections.projects.title', lang),
    '{{section.reviews.title}}': t('sections.reviews.title', lang),
    '{{section.logs.title}}': t('sections.logs.title', lang),
    '{{section.logs.tableLabel}}': t('sections.logs.tableLabel', lang),
    '{{section.logs.stats.label}}': t('sections.logs.stats.label', lang),
    '{{section.logs.stats.total}}': t('sections.logs.stats.total', lang),
    '{{section.logs.stats.countries}}': t('sections.logs.stats.countries', lang),
    '{{section.logs.stats.modes}}': t('sections.logs.stats.modes', lang),
    '{{section.logs.table.time}}': t('sections.logs.table.time', lang),
    '{{section.logs.table.callsign}}': t('sections.logs.table.callsign', lang),
    '{{section.logs.table.name}}': t('sections.logs.table.name', lang),
    '{{section.logs.table.qth}}': t('sections.logs.table.qth', lang),
    '{{section.logs.table.mode}}': t('sections.logs.table.mode', lang),
    '{{section.logs.table.rst}}': t('sections.logs.table.rst', lang),
    '{{section.blog.title}}': t('sections.blog.title', lang),
    '{{section.contact.title}}': t('sections.contact.title', lang),
    '{{section.contact.qsl.title}}': t('sections.contact.qsl.title', lang),
    '{{section.contact.qsl.callsign}}': t('sections.contact.qsl.callsign', lang),
    '{{section.contact.qsl.qth}}': t('sections.contact.qsl.qth', lang),
    '{{section.contact.qsl.email}}': t('sections.contact.qsl.email', lang),
    '{{footer.copyright}}': t('footer.copyright', lang),
    '{{footer.beian.icp}}': t('footer.beian.icp', lang),
    '{{footer.beian.police}}': t('footer.beian.police', lang),
    '{{cookie.title}}': t('cookie.title', lang),
    '{{cookie.message}}': t('cookie.message', lang),
    '{{cookie.accept}}': t('cookie.accept', lang),
    "{{lang === 'zh' ? 'zh_CN' : 'en_US'}}": LOCALE[lang],
    '{{totalLogs}}': String(logsData.statistics?.totalQSO ?? 0),
    '{{callsign}}': config.callsign ?? 'BI4MIB',
    '{{qth}}': config.qth ?? '',
    '{{email}}': config.email ?? '',
    '{{qrz}}': config.social?.qrz ?? '#',
    '{{bandbbs}}': config.social?.bandbbs ?? '#',
    '{{github}}': config.social?.github ?? '#',
    '{{bilibili}}': config.social?.bilibili ?? '#',
    '{{linkedin}}': config.social?.linkedin ?? '#',
    '{{gitee}}': config.social?.gitee ?? '#',
    '{{projectsData}}': JSON.stringify(projectsData, null, 0).replace(/<\//g, '<\\/'),
  };
  for (const [k, v] of Object.entries(replacements)) {
    html = html.split(k).join(v);
  }

  // 隐藏禁用区块（对应 PHP 的 preg_replace）
  for (const id of hiddenSections) {
    html = html.replace(new RegExp(`\\s*<section[^>]*id="${id}"[^>]*>[\\s\\S]*?</section>`, 'g'), '');
  }
  // 删除禁用模块的导航项
  for (const key of hiddenNav) {
    html = html.replace(new RegExp(`\\s*<li role="none"><a href="#${key}" role="menuitem">[^<]*</a></li>`, 'g'), '');
    html = html.replace(new RegExp(`\\s*<a href="#${key}">[^<]*</a>`, 'g'), '');
  }

  // hreflang / canonical 指向真实预渲染文件
  const file = lang === 'zh' ? '' : `index-${lang}.html`;
  html = html
    .replace('href="https://bi4mib.cn/?lang=zh"', 'href="https://bi4mib.cn/"')
    .replace('href="https://bi4mib.cn/?lang=en"', 'href="https://bi4mib.cn/index-en.html"')
    .replace('href="https://bi4mib.cn/?lang=ja"', 'href="https://bi4mib.cn/index-ja.html"')
    .replace('href="https://bi4mib.cn/" rel="canonical"', `href="https://bi4mib.cn/${file}" rel="canonical"`)
    .replace('content="https://bi4mib.cn/"', `content="https://bi4mib.cn/${file}"`)
    .replace(/href="([^"]*)\?v=VERSION"/g, `href="$1?v=${VERSION}"`)
    .replace(/src="([^"]*)\?v=\d+"|src="js\/main\.js\?v=\d+"/g, (m, p1) => (p1 ? `src="${p1}?v=${VERSION}"` : `src="js/main.js?v=${VERSION}"`))
    .replace('</head>', FONT_LINKS + '</head>');

  return html;
}

for (const lang of ['zh', 'en', 'ja']) {
  const name = lang === 'zh' ? 'index.html' : `index-${lang}.html`;
  writeFileSync(join(OUT, name), renderIndex(lang));
  console.log(`rendered ${name}`);
}

// ---- 静态资源拷贝（override 优先） ----
mkdirSync(join(OUT, 'css'));
mkdirSync(join(OUT, 'js'));
mkdirSync(join(OUT, 'data'));
copyFileSync(existsSync(join(OVERRIDE, 'css/style.css')) ? join(OVERRIDE, 'css/style.css') : join(SRC, 'css/style.css'), join(OUT, 'css/style.css'));
copyFileSync(join(SRC, 'js/sky.js'), join(OUT, 'js/sky.js'));

// 只打包公开数据文件：排除 secure_config.php / visitor_details / ip_geo / lang_cache /
// analytics / .rate_* / .attempts_* / .online_visitors 等敏感与运行期文件
const PUBLIC_DATA = ['translations.json', 'config.json', 'modules.json', 'projects.json', 'reviews.json', 'posts.json', 'activities.json', 'logs.json', 'stars.json'];
for (const f of PUBLIC_DATA) {
  copyFileSync(existsSync(join(OVERRIDE, 'data', f)) ? join(OVERRIDE, 'data', f) : join(SRC, 'data', f), join(OUT, 'data', f));
}

const IMAGES = ['1774270392249.jpg', 'top.hsyscn.opedrgent.jpg', 'maptq.png', '备案图标.png'];
for (const f of IMAGES) copyFileSync(join(SRC, f), join(OUT, f));

// ---- main.js：去掉追踪回传，语言切换改为跳转预渲染文件 ----
let mainJs = read('js/main.js');
mainJs = mainJs.replace(`if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track.php', payload.toString());
        }

`, '');
mainJs = mainJs.replace(
  `        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === lang);
            opt.setAttribute('aria-selected', String(opt.dataset.lang === lang));
        });

        location.reload();`,
  `        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === lang);
            opt.setAttribute('aria-selected', String(opt.dataset.lang === lang));
        });

        location.href = lang === 'zh' ? '/' : '/index-' + lang + '.html';`
);
writeFileSync(join(OUT, 'js/main.js'), mainJs);
console.log('patched js/main.js');

// ---- logs.html：/api/logs.php 1:1 移植为前端静态数据版 ----
let logsHtml = read('logs.html');
const logsScript = `
    const DATA_URL = 'data/logs.json';
    let currentPage = 1;
    let currentMode = 'all';
    let currentSearch = '';
    let currentSort = 'date_desc';
    let debounceTimer = null;
    let allLogs = [];

    function getDXCC(callsign) {
        const c = (callsign || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (/^B[ABCDFGHJKLMNP]/.test(c)) return 'CN';
        if (/^S2/.test(c)) return 'BD';
        if (/^J[HS]/.test(c)) return 'JA';
        if (/^HL/.test(c)) return 'HL';
        if (/^[KNW][0-9]/.test(c)) return 'NA';
        if (/^R[0-9]/.test(c)) return 'RU';
        if (/^[GM][0-9]/.test(c)) return 'G';
        if (/^D[A-R][0-9]/.test(c)) return 'DL';
        if (/^F[A-K][0-9]/.test(c)) return 'F';
        if (/^VK[0-9]/.test(c)) return 'VK';
        return c.charAt(0);
    }

    function computeStats(logs) {
        const dxcc = new Set();
        const modes = new Set();
        logs.forEach(l => {
            const d = getDXCC(l.callsign);
            if (d) dxcc.add(d);
            if (l.mode) modes.add(l.mode);
        });
        return { totalQSO: logs.length, countries: dxcc.size, modes: [...modes].sort() };
    }

    async function initData() {
        try {
            const res = await fetch(DATA_URL);
            const data = await res.json();
            allLogs = data.logs || [];
        } catch (e) {
            console.error('Failed to load logs:', e);
        }
        loadLogs();
    }

    function sortLogs(logs, sort) {
        const key = l => (l.date || '') + (l.time || '');
        const sorted = [...logs];
        switch (sort) {
            case 'date_asc':
                sorted.sort((a, b) => key(a).localeCompare(key(b)));
                break;
            case 'callsign':
                sorted.sort((a, b) => (a.callsign || '').localeCompare(b.callsign || ''));
                break;
            case 'mode':
                sorted.sort((a, b) => (a.mode || '').localeCompare(b.mode || ''));
                break;
            default:
                sorted.sort((a, b) => key(b).localeCompare(key(a)));
        }
        return sorted;
    }

    async function loadLogs(page = 1) {
        currentPage = page;

        let logs = [...allLogs];
        if (currentSearch) {
            const s = currentSearch.toLowerCase();
            logs = logs.filter(l =>
                (l.callsign || '').toLowerCase().includes(s) ||
                (l.name || '').toLowerCase().includes(s) ||
                (l.qth || '').toLowerCase().includes(s) ||
                (l.country || '').toLowerCase().includes(s)
            );
        }

        const stats = computeStats(allLogs);
        const data = {
            success: true,
            callsign: 'BI4MIB',
            statistics: stats,
            filters: { modes: [...new Set(logs.map(l => l.mode || ''))].filter(Boolean).sort() }
        };

        if (currentMode && currentMode !== 'all') {
            logs = logs.filter(l => (l.mode || '').toLowerCase() === currentMode);
        }

        logs = sortLogs(logs, currentSort);

        const total = logs.length;
        const perPage = 20;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        const cur = Math.min(page, totalPages);
        data.logs = logs.slice((cur - 1) * perPage, cur * perPage);
        data.pagination = { page: cur, per_page: perPage, total, total_pages: totalPages };
        data.last_updated = '';

        updateStats(data.statistics);
        renderModeFilters(data.filters?.modes || []);
        renderLogs(data.logs, data.pagination);
        renderPagination(data.pagination);
        renderResultCount(data.pagination);
    }
`;
logsHtml = logsHtml.replace(/\s*const API_URL = '\/api\/logs\.php';[\s\S]*?function loadLogs\(page = 1\) \{[\s\S]*?\n    \}/, logsScript);
logsHtml = logsHtml.replace(/\n    loadLogs\(\);\n    <\/script>/, '\n    initData();\n    </script>');
// 内联样式整体替换为 redesign 版本，并加载同套字体
if (existsSync(join(OVERRIDE, 'logs-inline-style.css'))) {
  const newStyle = readFileSync(join(OVERRIDE, 'logs-inline-style.css'), 'utf8');
  logsHtml = logsHtml.replace(/<style>[\s\S]*?<\/style>/, () => `<style>\n${newStyle}</style>`);
  logsHtml = logsHtml.replace('</head>', FONT_LINKS + '</head>');
}
logsHtml = logsHtml.replace('https://bi4mib.cn/备案图标.png', '备案图标.png');
writeFileSync(join(OUT, 'logs.html'), logsHtml);
console.log('built logs.html (static data port)');

// ---- 其余静态页/文件 ----
copyFileSync(join(SRC, 'maintenance.html'), join(OUT, 'maintenance.html'));
copyFileSync(join(SRC, 'baidu_verify_codeva-E8sdKsQQy4.html'), join(OUT, 'baidu_verify_codeva-E8sdKsQQy4.html'));
mkdirSync(join(OUT, 'embed'));
copyFileSync(join(SRC, 'embed/profile.html'), join(OUT, 'embed/profile.html'));
copyFileSync(join(SRC, 'embed/profile.css'), join(OUT, 'embed/profile.css'));
copyFileSync(join(SRC, 'embed/logs-static.html'), join(OUT, 'embed/logs-static.html'));

writeFileSync(join(OUT, 'CNAME'), 'bi4mib.cn\n');
writeFileSync(join(OUT, '.nojekyll'), '');

writeFileSync(join(OUT, '404.html'), `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>404 - BI4MIB</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link rel="stylesheet" href="css/style.css?v=${VERSION}">
</head>
<body>
<main id="main-content" style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="text-align:center;padding:24px;">
    <p style="font-size:64px;color:var(--color-gold);margin-bottom:8px;">404</p>
    <h1 style="font-weight:300;margin-bottom:16px;">页面不存在 / Page Not Found</h1>
    <p style="color:var(--text-secondary);margin-bottom:24px;">73 &amp; Good DX!</p>
    <a href="/" style="color:var(--color-gold);"><i class="fas fa-arrow-left"></i> 返回首页</a>
  </div>
</main>
</body>
</html>
`);

writeFileSync(join(OUT, 'README.md'), `# BI4MIB.cn

何浩瀚 (BI4MIB) 的个人主页 —— 业余无线电 / 项目 / 通联日志。由原 PHP 动态站点转建的 GitHub Pages 静态版本。

## 站点结构

| 文件 | 说明 |
| --- | --- |
| \`index.html\` | 首页（中文，默认） |
| \`index-en.html\` | 首页（English） |
| \`index-ja.html\` | 首页（日本語） |
| \`logs.html\` | 通联日志页（数据来自 \`data/logs.json\`，前端筛选/排序/分页） |
| \`data/\` | 站点公开数据（projects / logs / config / modules / stars 等） |
| \`css/\` \`js/\` | 样式与脚本 |
| \`embed/\` | 可嵌入第三方的静态资料页 |
| \`CNAME\` | 自定义域名 \`bi4mib.cn\` |

## 说明

- GitHub Pages 不运行 PHP，原站的服务端渲染（多语言、模块开关、数据注入）在此处以预渲染方式完成；
  语言版本在构建时生成，切换语言即跳转对应文件。
- 原站的访问统计（\`/api/track.php\`）无后端，已移除。
- \`logs.json\` 更新后推送即可，日志页自动反映。

## 本地重建

\`scripts/build.mjs\` 记录了从原 PHP 模板生成本站点的完整过程。
`);

mkdirSync(join(OUT, 'scripts'));
copyFileSync(new URL('./build.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), join(OUT, 'scripts/build.mjs'));

console.log('build complete ->', OUT);
