const footer = document.querySelector('footer');
if (footer) {
    const img = Object.assign(document.createElement('img'), {
        src: 'example.png',
        alt: 'example img',
        width: 200,
        height: 200
    });
    // move image to the right
    img.style.cssFloat = 'right';
    footer.appendChild(img);
}