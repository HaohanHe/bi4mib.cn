/**
 * Star Field — Hipparcos 真实星等分布
 * 数据覆盖 RA 0-2.7h，Dec 全范围
 * 用真实星等/颜色 + 均匀铺满画面 + 时间漂移
 */
const StarField = {
    canvas: null,
    ctx: null,
    realStars: [],
    observerLat: 43.88,
    observerLon: 125.32,
    animId: null,
    dpr: 1,
    w: 0,
    h: 0,
    _running: false,
    _visible: true,

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'starfield';
        this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        const hero = document.querySelector('.hero');
        if (!hero) return;
        hero.insertBefore(this.canvas, hero.firstChild);

        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();

        this.startRender();
        this.loadAsync();
        window.addEventListener('resize', () => this.resize());
    },

    async loadAsync() {
        try {
            const [starsResp] = await Promise.allSettled([
                fetch('data/stars.json'),
                this.detectLocation()
            ]);
            if (starsResp.status === 'fulfilled' && starsResp.value.ok) {
                this.realStars = await starsResp.value.json();
                this._prepareStars();
            }
        } catch (e) {}
    },

    // 预处理：给每颗星分配一个稳定的伪随机 x 位置（基于 RA 哈希），
    // y 用真实 Dec，这样既有真实纬度分布又铺满画面
    _prepareStars() {
        for (let i = 0; i < this.realStars.length; i++) {
            const s = this.realStars[i];
            // 用 RA 作为伪随机种子生成 0-1 的 x 位置
            const hash = Math.sin(s.r * 12.9898 + s.d * 78.233) * 43758.5453;
            s._x = hash - Math.floor(hash); // 0-1 均匀分布
            // y 用真实 Dec：-90°~+90° → 1~0
            s._y = (90 - s.d * 180 / Math.PI) / 180;
        }
    },

    detectLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        this.observerLat = pos.coords.latitude;
                        this.observerLon = pos.coords.longitude;
                        resolve();
                    },
                    () => this.ipLocation().then(resolve),
                    { timeout: 3000, maximumAge: 600000 }
                );
            } else {
                this.ipLocation().then(resolve);
            }
        });
    },

    async ipLocation() {
        try {
            const resp = await fetch('https://ip-api.com/json/?fields=lat,lon');
            if (resp.ok) {
                const data = await resp.json();
                if (data.lat && data.lon) {
                    this.observerLat = data.lat;
                    this.observerLon = data.lon;
                }
            }
        } catch (e) {}
    },

    resize() {
        const hero = document.querySelector('.hero');
        if (!hero || !this.canvas) return;
        const rect = hero.getBoundingClientRect();
        this.w = rect.width;
        this.h = rect.height;
        this.canvas.width = this.w * this.dpr;
        this.canvas.height = this.h * this.dpr;
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },

    render(time) {
        if (!this.ctx || !this.realStars.length) return;
        const ctx = this.ctx;
        const w = this.w;
        const h = this.h;

        // 极深背景
        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0.0, '#0c0a10');
        grad.addColorStop(0.3, '#0d0f1a');
        grad.addColorStop(0.7, '#080b18');
        grad.addColorStop(1.0, '#060812');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 缓慢水平漂移（模拟天球自转）
        const drift = (time * 0.000003) % 1;

        const stars = this.realStars;
        for (let i = 0, len = stars.length; i < len; i++) {
            const s = stars[i];
            const m = s.m;

            // x = 伪随机位置 + 缓慢漂移
            let x = ((s._x + drift) % 1) * w;
            // y = 真实 Dec 分布
            const y = s._y * h;

            // 星等 → 尺寸和亮度
            let sz, alpha;
            if (m < 1)      { sz = 3.0; alpha = 1.0; }
            else if (m < 2)  { sz = 2.3; alpha = 0.88; }
            else if (m < 3)  { sz = 1.8; alpha = 0.72; }
            else if (m < 4)  { sz = 1.4; alpha = 0.58; }
            else if (m < 5)  { sz = 1.1; alpha = 0.44; }
            else if (m < 6)  { sz = 0.85; alpha = 0.34; }
            else if (m < 7)  { sz = 0.65; alpha = 0.26; }
            else              { sz = 0.5; alpha = 0.2; }

            // 微弱闪烁
            const twinkle = 1 + 0.1 * Math.sin(time * 0.0005 + i * 7.31);
            alpha *= twinkle;

            // 恒星色温
            const hue = this._starHue(m, i);

            // 亮星光晕
            if (m < 3.0) {
                const glowR = m < 1 ? sz * 14 : sz * 8;
                const ga = m < 1 ? 0.18 : 0.08;
                const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
                g.addColorStop(0, 'hsla(' + hue + ', 40%, 85%, ' + (alpha * ga) + ')');
                g.addColorStop(0.5, 'hsla(' + hue + ', 30%, 80%, ' + (alpha * ga * 0.3) + ')');
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);
            }

            // 星点
            ctx.beginPath();
            ctx.arc(x, y, sz * twinkle, 0, Math.PI * 2);
            ctx.fillStyle = 'hsla(' + hue + ', 40%, 95%, ' + alpha + ')';
            ctx.fill();
        }
    },

    _starHue(mag, idx) {
        // 基于索引的伪随机色温分布
        const t = (Math.sin(idx * 0.1) + 1) / 2;
        if (mag < 1.5) return t < 0.5 ? 220 : 45;
        if (t < 0.12) return 220;  // 蓝白
        if (t < 0.3) return 190;   // 浅蓝
        if (t < 0.55) return 50;   // 黄白
        if (t < 0.75) return 30;   // 黄
        return 8;                   // 橙红
    },

    startRender() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        this._heroObserver = new IntersectionObserver((entries) => {
            this._visible = entries[0].isIntersecting;
            if (this._visible && !this._running) this._startLoop();
        }, { threshold: 0 });
        this._heroObserver.observe(hero);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._running = false;
            } else if (this._visible) {
                this._startLoop();
            }
        });

        this._startLoop();
    },

    _startLoop() {
        if (this._running) return;
        this._running = true;
        const loop = (t) => {
            if (!this._running) return;
            this.render(t);
            this.animId = requestAnimationFrame(loop);
        };
        this.animId = requestAnimationFrame(loop);
    },

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this._heroObserver) this._heroObserver.disconnect();
        if (this.canvas) this.canvas.remove();
    }
};
