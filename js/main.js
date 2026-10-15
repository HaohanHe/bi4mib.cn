/**
 * BI4MIB 个人网站主JavaScript文件
 * Human-Centered Design System
 * @version 4.0.0 - Full Accessibility Support
 */

// ============================================
// 移动端菜单交互 - 无障碍增强
// ============================================

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.mobile-overlay');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!menuToggle) return;

    function toggleMenu() {
        const isOpen = menuToggle.classList.toggle('active');
        overlay?.classList.toggle('active');
        mobileNav?.classList.toggle('active');
        document.body.style.overflow = isOpen ? 'hidden' : '';

        // 更新 ARIA 状态
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label',
            isOpen ? (menuToggle.dataset.closeLabel || '关闭菜单') : (menuToggle.dataset.openLabel || '打开菜单')
        );

        // 更新移动端导航菜单的可见性
        if (mobileNav) {
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
        }

        if (isOpen) {
            menuToggle.focus();
        }
    }

    function closeMenu() {
        menuToggle?.classList.remove('active');
        overlay?.classList.remove('active');
        mobileNav?.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', menuToggle.dataset.openLabel || '打开菜单');

        if (mobileNav) {
            mobileNav.setAttribute('aria-hidden', 'true');
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', closeMenu);

    // 为所有导航链接添加点击事件
    document.querySelectorAll('.nav-list a, .mobile-nav-list a, .footer-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (overlay?.classList.contains('active') || mobileNav?.classList.contains('active')) closeMenu();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (overlay?.classList.contains('active') || mobileNav?.classList.contains('active'))) {
            closeMenu();
            menuToggle.focus();
        }
    });
}

// ============================================
// 导航栏滚动效果 - Glass Header
// ============================================

/**
 * 初始化导航栏滚动效果
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // 滚动超过50px时添加背景
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    // 使用 requestAnimationFrame 优化滚动性能
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// 平滑滚动导航
// ============================================

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-list a, .footer-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// 页面加载动画
// ============================================

/**
 * 初始化页面加载动画
 */
function initPageAnimations() {
    // 为各区块添加淡入动画
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });
}

// ============================================
// Liquid Glass 鼠标跟随光泽效果
// ============================================

/**
 * 初始化液态玻璃光泽效果
 * 鼠标移动时，玻璃卡片会显示光泽折射
 */
function initLiquidShine() {
    const shineElements = document.querySelectorAll('.liquid-shine');
    
    // 检测是否为触摸设备
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    shineElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            element.style.setProperty('--mouse-x', `${x}%`);
            element.style.setProperty('--mouse-y', `${y}%`);
        });

        element.addEventListener('mouseleave', () => {
            element.style.setProperty('--mouse-x', '50%');
            element.style.setProperty('--mouse-y', '50%');
        });
    });
}

// ============================================
// 3D 卡片倾斜效果
// ============================================

/**
 * 初始化3D卡片倾斜效果
 * 鼠标悬停时卡片会有轻微的3D倾斜
 */
function initCardTilt() {
    const cards = document.querySelectorAll('.project-card, .review-card, .blog-card, .stat-card');
    
    // 检测是否为触摸设备
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// Hero 视差效果
// ============================================

/**
 * 初始化Hero区域视差效果
 */
function initHeroContentParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    let ticking = false;

    function handleParallax() {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        
        if (scrollY < heroHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
            heroContent.style.opacity = Math.max(0, 1 - (scrollY / heroHeight));
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleParallax);
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// 卡片悬浮动画
// ============================================

/**
 * 初始化卡片悬浮动画
 * 卡片进入视口时依次浮现
 */
function initCardReveal() {
}

// ============================================
// 导航链接高亮
// ============================================

/**
 * 初始化导航链接高亮
 * 根据当前滚动位置高亮对应导航项
 */
function initNavHighlight() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    
    if (!sections.length || !navLinks.length) return;

    let ticking = false;

    function highlightNav() {
        const scrollY = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(highlightNav);
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// 玻璃光泽脉冲效果
// ============================================

/**
 * 初始化玻璃光泽脉冲效果
 * 为重要卡片添加微妙的光泽脉冲动画
 */
function initGlassPulse() {
    const pulseElements = document.querySelectorAll('.log-stat, .qsl-info');
    
    pulseElements.forEach((element, index) => {
        element.style.animation = `glassPulse 6s ease-in-out infinite ${index * 0.8}s`;
    });
}

// ============================================
// 数据加载与渲染
// ============================================

const DataManager = {
    data: {},
    
    async loadAll() {
        try {
            const modules = await this.fetchJSON('data/modules.json');
            this.data.modules = modules || {};
            
            const config = await this.fetchJSON('data/config.json');
            this.data.config = config || {};
            
            if (this.isModuleEnabled('projects')) {
                // 优先读 PHP 内联数据（绕过浏览器缓存），fallback 到 fetch
                const inlineEl = document.getElementById('inline-projects');
                if (inlineEl && inlineEl.textContent.trim()) {
                    try {
                        this.data.projects = JSON.parse(inlineEl.textContent);
                    } catch (e) {
                        console.warn('[Projects] 内联数据解析失败，fallback 到 fetch');
                        this.data.projects = await this.fetchJSON('data/projects.json');
                    }
                } else {
                    this.data.projects = await this.fetchJSON('data/projects.json');
                }
            }
            if (this.isModuleEnabled('reviews')) {
                this.data.reviews = await this.fetchJSON('data/reviews.json');
            }
            if (this.isModuleEnabled('logs')) {
                this.data.logs = await this.fetchJSON('data/logs.json');
            }
            if (this.isModuleEnabled('blog')) {
                this.data.posts = await this.fetchJSON('data/posts.json');
            }
            if (this.isModuleEnabled('activities')) {
                this.data.activities = await this.fetchJSON('data/activities.json');
            }
            
            this.renderAll();
        } catch (error) {
            console.error('数据加载失败:', error);
        }
    },
    
    async fetchJSON(url) {
        try {
            // 数据文件加时间戳破缓存（Nginx 可能返回304让浏览器用旧缓存）
            const ts = url.includes('/data/') ? `?_v=2` : '';
            const fullUrl = url + ts;
            const response = await fetch(fullUrl);
            if (!response.ok) return null;
            const data = await response.json();
            // 调试：打印请求URL和返回数据摘要
            if (url.includes('projects')) {
                console.log('[fetchJSON] URL:', fullUrl);
                console.log('[fetchJSON] status:', response.status);
                console.log('[fetchJSON] keys:', Object.keys(data));
                console.log('[fetchJSON] projects count:', data.projects?.length);
            }
            return data;
        } catch (e) {
            console.warn('加载失败:', url);
            return null;
        }
    },
    
    isModuleEnabled(key) {
        return this.data.modules ? (this.data.modules[key] !== false) : true;
    },
    
    renderAll() {
        this.updateModuleVisibility();
        this.renderProjects();
        this.renderReviews();
        this.renderLogs();
        this.renderBlog();
        this.renderContact();
    },
    
    updateModuleVisibility() {
        const modules = [
            { key: 'projects', selector: '#projects' },
            { key: 'reviews', selector: '#reviews' },
            { key: 'logs', selector: '#logs' },
            { key: 'blog', selector: '#blog' },
            { key: 'activities', selector: null },
            { key: 'qsl', selector: null }
        ];
        
        modules.forEach(mod => {
            if (mod.selector) {
                const el = document.querySelector(mod.selector);
                if (el) {
                    el.style.display = this.isModuleEnabled(mod.key) ? '' : 'none';
                }
            }
        });
        
        this.updateNavVisibility();
    },
    
    updateNavVisibility() {
        const navLinks = document.querySelectorAll('.nav-list a, .mobile-nav-list a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                const moduleKey = this.getModuleKeyFromSection(sectionId);
                if (moduleKey && !this.isModuleEnabled(moduleKey)) {
                    link.style.display = 'none';
                } else {
                    link.style.display = '';
                }
            }
        });
    },
    
    getModuleKeyFromSection(sectionId) {
        const map = {
            'projects': 'projects',
            'reviews': 'reviews',
            'logs': 'logs',
            'blog': 'blog'
        };
        return map[sectionId] || null;
    },
    
    renderProjects() {
        const container = document.querySelector('.projects-grid');
        console.log('[Projects] data.projects:', this.data.projects);
        console.log('[Projects] projects count:', this.data.projects?.projects?.length || 0);
        console.log('[Projects] source:', document.getElementById('inline-projects')?.textContent ? 'inline (PHP)' : 'fetch');
        if (!container || !this.data.projects?.projects?.length) return;

        container.innerHTML = this.data.projects.projects.map(p => {
            const hasImage = p.images && p.images.length > 0 && p.images[0];
            const imageUrl = hasImage ? p.images[0] : '';
            const imageHtml = hasImage
                ? `<img src="${imageUrl}" alt="${this.escapeHtml(p.name || '')}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.nextElementSibling.setAttribute('aria-hidden', 'true');">`
                : '';
            const placeholderHtml = `<div class="project-placeholder" style="${hasImage ? 'display:none;' : ''}" aria-hidden="true">${p.name?.charAt(0) || 'P'}</div>`;
            const githubUrl = (p.links && p.links.github) || '';
            const platformLabel = p.platform || '';
            const categoryLabel = p.category || '';

            const cardInner = `
                <div class="project-image">
                    ${imageHtml}
                    ${placeholderHtml}
                </div>
                <div class="project-content">
                    <h3 class="project-title">${this.escapeHtml(p.name || '')}</h3>
                    <p class="project-description">${this.escapeHtml(p.description || '')}</p>
                    <div class="project-tags">
                        ${(p.tags || []).slice(0, 4).map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('')}
                    </div>
                    <div class="project-meta">
                        ${platformLabel ? `<span><i class="fas fa-desktop"></i> ${this.escapeHtml(platformLabel)}</span>` : ''}
                        ${categoryLabel ? `<span><i class="fas fa-folder"></i> ${this.escapeHtml(categoryLabel)}</span>` : ''}
                        ${p.stars ? `<span><i class="fas fa-star"></i> ${p.stars}</span>` : ''}
                    </div>
                </div>
            `;

            // 有 GitHub 链接则包裹为可点击卡片
            if (githubUrl) {
                return `<a href="${this.escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-card liquid-shine project-link" aria-label="查看项目: ${this.escapeHtml(p.name || '')}">${cardInner}</a>`;
            }
            return `<div class="project-card liquid-shine">${cardInner}</div>`;
        }).join('');

        this.initCarousel();
    },

    initCarousel() {
        const track = document.querySelector('.carousel-track.projects-grid');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        if (!track || !prevBtn || !nextBtn) return;

        const scrollAmount = 404; // 380px card + 24px gap
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    },
    
    renderReviews() {
        const container = document.querySelector('.reviews-grid');
        if (!container || !this.data.reviews?.reviews?.length) return;
        
        container.innerHTML = this.data.reviews.reviews.map(r => `
            <div class="review-card liquid-shine">
                <div class="review-header">
                    <h3 class="review-title">${this.escapeHtml(r.title || r.deviceName || '')}</h3>
                    <div class="review-rating">
                        ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                    </div>
                </div>
                <p class="review-excerpt">${this.escapeHtml(r.summary || r.content?.substring(0, 100) || '')}</p>
            </div>
        `).join('');
    },
    
    renderLogs() {
        const tbody = document.querySelector('.logs-table tbody');
        const statsContainer = document.querySelector('.logs-stats');
        if (!tbody) return;

        const logsSection = document.getElementById('logs');
        if (!logsSection) return;

        let modeFilterContainer = logsSection.querySelector('.logs-mode-filter');
        if (!modeFilterContainer) {
            const wrapper = logsSection.querySelector('.logs-table-wrapper');
            if (wrapper) {
                modeFilterContainer = document.createElement('div');
                modeFilterContainer.className = 'logs-mode-filter';
                wrapper.parentNode.insertBefore(modeFilterContainer, wrapper);
            }
        }

        let showMoreContainer = logsSection.querySelector('.logs-show-more');
        if (!showMoreContainer) {
            const wrapper = logsSection.querySelector('.logs-table-wrapper');
            if (wrapper) {
                showMoreContainer = document.createElement('div');
                showMoreContainer.className = 'logs-show-more';
                wrapper.parentNode.insertBefore(showMoreContainer, wrapper.nextSibling);
            }
        }

        const allLogs = this.data.logs?.logs || [];
        allLogs.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
            const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
            return dateB - dateA;
        });

        if (statsContainer) {
            const uniqueModes = new Set(allLogs.map(l => l.mode).filter(Boolean));
            function getDXCC(cs) {
                if (!cs) return null;
                const c = cs.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
            const allDXCC = new Set();
            allLogs.forEach(l => {
                const dxcc = getDXCC(l.callsign);
                if (dxcc) allDXCC.add(dxcc);
            });
            const statTotalQSO = document.getElementById('stat-totalQSO');
            const statCountries = document.getElementById('stat-countries');
            const statModes = document.getElementById('stat-modes');
            if (statTotalQSO) statTotalQSO.textContent = allLogs.length;
            if (statCountries) statCountries.textContent = allDXCC.size;
            if (statModes) statModes.textContent = uniqueModes.size;
        }

        const modes = [...new Set(allLogs.map(l => l.mode).filter(Boolean))].sort();
        if (modeFilterContainer && modes.length > 1) {
            const currentMode = modeFilterContainer.dataset.activeMode || 'all';
            modeFilterContainer.innerHTML = `<button class="log-mode-pill${currentMode === 'all' ? ' active' : ''}" data-mode="all">全部</button>` +
                modes.map(m => `<button class="log-mode-pill${currentMode === m ? ' active' : ''}" data-mode="${this.escapeHtml(m)}">${this.escapeHtml(m.toUpperCase())}</button>`).join('');

            if (!modeFilterContainer.dataset.bound) {
                modeFilterContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('.log-mode-pill');
                    if (!btn) return;
                    modeFilterContainer.querySelectorAll('.log-mode-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const mode = btn.dataset.mode;
                    modeFilterContainer.dataset.activeMode = mode;
                    this.renderLogsFiltered(allLogs, mode, tbody, showMoreContainer);
                });
                modeFilterContainer.dataset.bound = '1';
            }
        }

        this._allLogsCache = allLogs;
        this.renderLogsFiltered(allLogs, modeFilterContainer?.dataset.activeMode || 'all', tbody, showMoreContainer);
    },

    renderLogsFiltered(allLogs, mode, tbody, showMoreContainer) {
        const filtered = mode && mode !== 'all' ? allLogs.filter(l => l.mode === mode) : allLogs;
        const showCount = parseInt(showMoreContainer?.dataset.showCount || '10');
        const visible = filtered.slice(0, showCount);

        const getThText = (index) => {
            const ths = document.querySelectorAll('.logs-table th');
            return ths[index] ? ths[index].textContent : '';
        };

        tbody.innerHTML = visible.map(log => {
            const qth = log.country || log.qth || '-';
            return `<tr>
                <td data-label="${getThText(0)}">${log.date || ''}</td>
                <td data-label="${getThText(1)}">${this.escapeHtml(log.callsign || '')}</td>
                <td data-label="${getThText(2)}">${this.escapeHtml(log.name || '')}</td>
                <td data-label="${getThText(3)}">${this.escapeHtml(qth)}</td>
                <td data-label="${getThText(4)}">${this.escapeHtml(log.mode || '')}</td>
                <td data-label="${getThText(5)}">${log.rstSent || ''}/${log.rstReceived || ''}</td>
            </tr>`;
        }).join('');

        if (showMoreContainer) {
            if (filtered.length > showCount) {
                showMoreContainer.innerHTML = `<button class="logs-show-more-btn" id="logsShowMoreBtn">显示更多 (${filtered.length - showCount} 条)</button>`;
                const btn = document.getElementById('logsShowMoreBtn');
                if (btn) {
                    btn.onclick = () => {
                        showMoreContainer.dataset.showCount = String(showCount + 20);
                        this.renderLogsFiltered(allLogs, mode, tbody, showMoreContainer);
                    };
                }
            } else if (filtered.length > 10) {
                showMoreContainer.innerHTML = `<button class="logs-show-more-btn" id="logsCollapseBtn">收起</button>`;
                const btn = document.getElementById('logsCollapseBtn');
                if (btn) {
                    btn.onclick = () => {
                        showMoreContainer.dataset.showCount = '10';
                        this.renderLogsFiltered(allLogs, mode, tbody, showMoreContainer);
                    };
                }
            } else {
                showMoreContainer.innerHTML = '';
            }
        }
    },
    
    renderBlog() {
        const container = document.querySelector('.blog-grid');
        if (!container || !this.data.posts?.posts?.length) return;
        
        container.innerHTML = this.data.posts.posts.slice(0, 6).map(p => `
            <div class="blog-card liquid-shine">
                <div class="blog-content">
                    <div class="blog-date">${p.date || p.createdAt || ''}</div>
                    <h3 class="blog-title">${this.escapeHtml(p.title || '')}</h3>
                    <p class="blog-excerpt">${this.escapeHtml((p.content || p.excerpt || '').substring(0, 100))}</p>
                </div>
            </div>
        `).join('');
    },
    
    renderContact() {
        const qslContainer = document.querySelector('.qsl-info');

        if (qslContainer && this.data.config) {
            const c = this.data.config;
            qslContainer.innerHTML = `
                <h3>${qslContainer.querySelector('h3')?.textContent || 'QSL 信息'}</h3>
                <dl>
                    <dt>${qslContainer.querySelectorAll('dt')[0]?.textContent || '呼号'}</dt>
                    <dd>${this.escapeHtml(c.callsign || 'BI4MIB')}</dd>
                    <dt>${qslContainer.querySelectorAll('dt')[1]?.textContent || 'QTH'}</dt>
                    <dd>${this.escapeHtml(c.qth || '')}</dd>
                    <dt>${qslContainer.querySelectorAll('dt')[2]?.textContent || '邮箱'}</dt>
                    <dd><a href="mailto:${this.escapeHtml(c.email || '')}">${this.escapeHtml(c.email || '')}</a></dd>
                </dl>
            `;
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatNumber(num) {
        if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num?.toString() || '0';
    }
};

// ============================================
// 轮播图功能
// ============================================

const Carousel = {
    currentIndex: 0,
    slides: [],
    autoplayInterval: null,
    isHovered: false,

    init() {
        const track = document.getElementById('carouselTrack');
        const dotsContainer = document.getElementById('carouselDots');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const carouselEl = document.getElementById('featuredCarousel');

        if (!track) return;

        const featuredPosts = this.getFeaturedPosts();
        if (!featuredPosts.length) return;

        this.slides = featuredPosts;
        this.renderSlides(track);
        this.renderDots(dotsContainer);
        this.updateAria();
        this.startAutoplay();

        prevBtn?.addEventListener('click', () => this.prev());
        nextBtn?.addEventListener('click', () => this.next());

        track.addEventListener('mouseenter', () => { this.isHovered = true; });
        track.addEventListener('mouseleave', () => { this.isHovered = false; });

        carouselEl?.addEventListener('mouseenter', () => this.stopAutoplay());
        carouselEl?.addEventListener('mouseleave', () => {
            if (!this.isHovered) this.startAutoplay();
        });

        // 键盘导航
        carouselEl?.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    prevBtn?.focus();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    nextBtn?.focus();
                    break;
            }
        });

        // 让轮播区域可聚焦
        if (carouselEl && !carouselEl.getAttribute('tabindex')) {
            carouselEl.setAttribute('tabindex', '0');
        }
    },

    getFeaturedPosts() {
        const placeholder = document.getElementById('featuredPosts');
        if (!placeholder) return [];
        try {
            return JSON.parse(placeholder.textContent || '[]');
        } catch {
            return [];
        }
    },

    renderSlides(track) {
        track.innerHTML = this.slides.map((post, i) => `
            <div class="carousel-slide" data-index="${i}" role="group" aria-roledescription="slide" aria-label="Slide ${i + 1} of ${this.slides.length}">
                <a href="#blog" tabindex="-1">
                    ${post.cover
                        ? `<img src="${post.cover}" alt="${this.escapeHtml(post.title)}" class="carousel-image">`
                        : `<div class="carousel-placeholder"><i class="fas fa-image" aria-hidden="true"></i></div>`
                    }
                    <div class="carousel-content">
                        <h3 class="carousel-title">${this.escapeHtml(post.title)}</h3>
                        <p class="carousel-excerpt">${this.escapeHtml(post.excerpt || '')}</p>
                    </div>
                </a>
            </div>
        `).join('');
    },

    renderDots(container) {
        if (!container) return;
        container.innerHTML = this.slides.map((_, i) =>
            `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" role="tab" aria-selected="${i === 0}" aria-label="Slide ${i + 1}" tabindex="0"></button>`
        ).join('');

        container.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.index));
                dot.focus();
            });
        });
    },

    goTo(index) {
        this.currentIndex = index;
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
        this.updateDots();
        this.updateAria();
    },

    next() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goTo(nextIndex);
    },

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goTo(prevIndex);
    },

    updateDots() {
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
            dot.setAttribute('aria-selected', String(i === this.currentIndex));
            dot.setAttribute('tabindex', i === this.currentIndex ? '0' : '-1');
        });
    },

    updateAria() {
        const carouselEl = document.getElementById('featuredCarousel');
        if (carouselEl) {
            carouselEl.setAttribute('aria-label', `Slide ${this.currentIndex + 1} of ${this.slides.length}`);
        }
        
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', String(i !== this.currentIndex));
        });
    },

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            if (!this.isHovered) this.next();
        }, 5000);
    },

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Cookie Consent Banner
// ============================================

const CookieConsent = {
    _sessionKey: 'bi4mib_track_session',
    _trackInterval: 30 * 60 * 1000,
    _tracked: false,

    init() {
        const banner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('cookieAccept');

        if (!banner || !acceptBtn) return;

        if (this.hasConsent()) {
            banner.classList.remove('show');
            this._enableTracking();
            return;
        }

        setTimeout(() => {
            banner.classList.add('show');
            acceptBtn.focus();
        }, 1000);

        acceptBtn.addEventListener('click', () => {
            this.accept();
            this._enableTracking();
            banner.classList.remove('show');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && banner.classList.contains('show')) {
                this.accept();
                this._enableTracking();
                banner.classList.remove('show');
            }
        });
    },

    hasConsent() {
        return document.cookie.includes('bi4mib_cookie_consent=accepted');
    },

    accept() {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `bi4mib_cookie_consent=accepted;expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;
    },

    _shouldTrack() {
        try {
            // 过滤 prerender / hidden 状态的页面（参考 GoatCounter）
            if (document.visibilityState === 'prerender' || document.visibilityState === 'hidden') {
                return false;
            }
            const session = sessionStorage.getItem(this._sessionKey);
            if (session) {
                const data = JSON.parse(session);
                if (data.page === window.location.pathname &&
                    Date.now() - data.time < this._trackInterval) {
                    return false;
                }
            }
            return true;
        } catch (e) {
            return true;
        }
    },

    _sendVisit() {
        if (!this.hasConsent()) return;
        if (!this._shouldTrack()) return;

        const payload = new URLSearchParams({
            ref: document.referrer || 'direct',
            lang: document.documentElement.lang || 'unknown',
            screen: `${window.screen.width}x${window.screen.height}`,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            title: document.title || ''
        });

                sessionStorage.setItem(this._sessionKey, JSON.stringify({
            page: window.location.pathname,
            time: Date.now()
        }));
    },

    _enableTracking() {
        this._sendVisit();

        window.addEventListener('popstate', () => {
            setTimeout(() => this._sendVisit(), 1000);
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this._sendVisit();
            }
        });
    }
};

// ============================================
// 语言切换器 - 无障碍增强
// ============================================

const LangSwitcher = {
    focusedIndex: -1,

    init() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langOptions = document.querySelectorAll('.lang-option');

        if (!langBtn || !langDropdown) return;

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle(langBtn, langDropdown);
        });

        langBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle(langBtn, langDropdown);
                if (langDropdown.classList.contains('active')) {
                    this.focusedIndex = 0;
                    this.focusOption(langOptions, 0);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.open(langBtn, langDropdown);
                this.focusedIndex = 0;
                this.focusOption(langOptions, 0);
            }
        });

        langDropdown.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close(langBtn, langDropdown);
                    langBtn.focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusedIndex = Math.min(this.focusedIndex + 1, langOptions.length - 1);
                    this.focusOption(langOptions, this.focusedIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
                    this.focusOption(langOptions, this.focusedIndex);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.focusedIndex = 0;
                    this.focusOption(langOptions, 0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.focusedIndex = langOptions.length - 1;
                    this.focusOption(langOptions, this.focusedIndex);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const activeOpt = langOptions[this.focusedIndex];
                    if (activeOpt) {
                        this.setLanguage(activeOpt.dataset.lang);
                        this.close(langBtn, langDropdown);
                    }
                    break;
            }
        });

        langOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                this.setLanguage(option.dataset.lang);
                this.close(langBtn, langDropdown);
            });
            option.addEventListener('focus', () => { this.focusedIndex = index; });
        });

        document.addEventListener('click', (e) => {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                this.close(langBtn, langDropdown);
            }
        });
    },

    open(btn, dropdown) {
        dropdown.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
    },

    close(btn, dropdown) {
        dropdown.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        this.focusedIndex = -1;
    },

    toggle(btn, dropdown) {
        const isOpen = dropdown.classList.contains('active');
        if (isOpen) {
            this.close(btn, dropdown);
        } else {
            this.open(btn, dropdown);
        }
    },

    focusOption(options, index) {
        options[index]?.focus();
        options.forEach((opt, i) => opt.setAttribute('aria-selected', String(i === index)));
    },

    setLanguage(lang) {
        const currentLangSpan = document.getElementById('currentLang');
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `bi4mib_lang=${lang};expires=${expires.toUTCString()};path=/;Secure;SameSite=Strict`;

        if (currentLangSpan && lang) {
            currentLangSpan.textContent = lang;
        }

        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === lang);
            opt.setAttribute('aria-selected', String(opt.dataset.lang === lang));
        });

        location.href = lang === 'zh' ? '/' : '/index-' + lang + '.html';
    }
};

// ============================================
// 初始化
// ============================================

// ============================================
// 统计数字滚动动画
// ============================================

function initStatCounters() {
    const statValues = document.querySelectorAll('.stat-value');
    if (!statValues.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.textContent, 10);
                if (isNaN(target) || target === 0) return;
                const duration = 1200;
                const start = performance.now();
                const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

                function animate(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    el.textContent = Math.round(easeOutQuart(progress) * target);
                    if (progress < 1) requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => observer.observe(el));
}

// ============================================
// 分区标题入场动画
// ============================================

function initSectionTitles() {
}

// ============================================
// 日志表格行交错入场
// ============================================

function initLogRowReveal() {
    const table = document.querySelector('.logs-table tbody');
    if (!table) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const rows = table.querySelectorAll('tr');
                rows.forEach((row, i) => {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-12px)';
                    row.style.transition = `opacity 0.4s ease ${i * 0.03}s, transform 0.4s ease ${i * 0.03}s`;
                    requestAnimationFrame(() => {
                        row.style.opacity = '1';
                        row.style.transform = 'translateX(0)';
                    });
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(table);
}

function init() {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initPageAnimations();
    initLiquidShine();
    initCardTilt();
    initHeroContentParallax();
    initCardReveal();
    initNavHighlight();
    initGlassPulse();
    initStatCounters();
    initSectionTitles();
    initLogRowReveal();
    LangSwitcher.init();
    CookieConsent.init();

    DataManager.loadAll();
    Carousel.init();

    if (typeof StarField !== 'undefined') {
        StarField.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.BI4MIB = {
    refresh: () => location.reload(),
    DataManager: DataManager
};
