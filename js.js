(async () => {
    if (document.readyState === 'loading') {
        await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }

    const footer = document.querySelector('footer');
    if (!footer) return;

    const fetchBlob = url => fetch(url, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(url + ' not found'); return r.blob(); });
    const blobToImage = async blob => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        return { img, url };
    };

    const makeCanvas = (w, h, css = {}) => {
        const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
        Object.assign(c.style, css);
        ['contextmenu', 'dragstart', 'mousedown'].forEach(ev => c.addEventListener(ev, e => {
            if (e.type === 'mousedown' && e.button === 0) return;
            e.preventDefault();
        }));
        const ctx = c.getContext('2d');
        if (!ctx) throw new Error('2D context not available');
        return { c, ctx };
    };

    try {
        const [b1, b2] = await Promise.all([fetchBlob('example.png'), fetchBlob('example2.png')]);
        const [{ img: img1, url: u1 }, { img: img2, url: u2 }] = await Promise.all([blobToImage(b1), blobToImage(b2)]);

        const bgHeight = img1.height;
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, { position: 'relative', width: '100%', height: bgHeight + 'px', margin: '8px 0 0' });

        const footerWidth = () => footer.clientWidth || document.documentElement.clientWidth;
        const { c: canvasBg, ctx: ctxBg } = makeCanvas(footerWidth(), bgHeight, { position: 'absolute', left: '0', top: '0', zIndex: '1', width: '100%', height: bgHeight + 'px' });
        const { c: canvasFg, ctx: ctxFg } = makeCanvas(img1.width, img1.height, { position: 'absolute', right: '0', top: '0', zIndex: '2', opacity: '0.95', width: img1.width + 'px', height: img1.height + 'px' });

        const drawBg = () => {
            const w = footerWidth();
            canvasBg.width = w;
            canvasBg.height = bgHeight;
            canvasBg.style.height = bgHeight + 'px';
            ctxBg.drawImage(img2, 0, 0, w, bgHeight);
        };

        ctxFg.drawImage(img1, 0, 0);
        drawBg();

        wrapper.append(canvasBg, canvasFg);
        footer.appendChild(wrapper);

        URL.revokeObjectURL(u1);
        URL.revokeObjectURL(u2);

        let raf;
        window.addEventListener('resize', () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(drawBg);
        });
    } catch (e) {
        console.error(e);
    }
})();
