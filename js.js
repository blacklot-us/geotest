(async () => {
    if (document.readyState === 'loading') {
        await new Promise(res => document.addEventListener('DOMContentLoaded', res, { once: true }));
    }

    const footer = document.querySelector('footer');
    if (!footer) return;

    const loadImageFromBlob = async (blob) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        return { img, url };
    };

    const makeCanvas = (width, height, style = {}) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        Object.assign(canvas.style, style);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D context not available');

        canvas.draggable = false;
        const prevent = e => { if (e.type === 'mousedown' && e.button === 0) return; e.preventDefault(); };
        canvas.addEventListener('contextmenu', prevent);
        canvas.addEventListener('dragstart', prevent);
        canvas.addEventListener('mousedown', prevent);

        return { canvas, ctx };
    };

    try {
        const [r1, r2] = await Promise.all([
            fetch('example.png', { cache: 'no-store' }),
            fetch('example2.png', { cache: 'no-store' })
        ]);
        if (!r1.ok || !r2.ok) {
            console.error('Failed to fetch images', r1.status, r2.status);
            return;
        }

        const [b1, b2] = await Promise.all([r1.blob(), r2.blob()]);
        const [{ img: img1, url: url1 }, { img: img2, url: url2 }] = await Promise.all([
            loadImageFromBlob(b1),
            loadImageFromBlob(b2)
        ]);

        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            position: 'relative',
            width: '100%',
            height: `${img1.height}px`,
            margin: '8px 0 0'
        });

        const scale = img1.height / img2.height;
        const bgWidth = Math.round(img2.width * scale);
        const bgHeight = img1.height;

        const { canvas: canvasBg, ctx: ctxBg } = makeCanvas(bgWidth, bgHeight, {
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '0',
            zIndex: '1',
            width: `${bgWidth}px`,
            height: `${bgHeight}px`
        });

        const { canvas: canvasFg, ctx: ctxFg } = makeCanvas(img1.width, img1.height, {
            position: 'absolute',
            right: '0',
            top: '0',
            zIndex: '2',
            opacity: '0.95',
            width: `${img1.width}px`,
            height: `${img1.height}px`
        });

        ctxBg.drawImage(img2, 0, 0, bgWidth, bgHeight);
        ctxFg.drawImage(img1, 0, 0);

        wrapper.append(canvasBg, canvasFg);
        footer.appendChild(wrapper);

        URL.revokeObjectURL(url1);
        URL.revokeObjectURL(url2);
    } catch (err) {
        console.error(err);
    }
})();
