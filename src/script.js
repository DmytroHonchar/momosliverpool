function toggleNav() {
    const overlay = document.querySelector('.nav-overlay');
    const body = document.querySelector('body');

    if (!overlay.classList.contains('active')) {
        overlay.classList.remove('inactive');
        overlay.classList.add('active');
        body.classList.add('no-scroll');
    } else {
        overlay.classList.remove('active');
        overlay.classList.add('inactive');
        body.classList.remove('no-scroll');
    }
}
