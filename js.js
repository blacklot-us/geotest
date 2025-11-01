(async () => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    Object.assign(canvas.style, { float: 'right', userSelect: 'none' });
    canvas.draggable = false;

    ['contextmenu', 'dragstart'].forEach(ev => canvas.addEventListener(ev, e => e.preventDefault()));
    canvas.addEventListener('mousedown', e => { if (e.button !== 0) e.preventDefault(); });

    footer.appendChild(canvas);

    try {
        const res = await fetch('example.png', { cache: 'no-store' });
        if (!res.ok) return;
        const blob = await res.blob();
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(blob);
    } catch (err) {
        // fallback opcional
    }
})();
