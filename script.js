const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    viewerImage.src = button.dataset.image;
    viewerImage.alt = button.querySelector('img').alt;
    document.querySelector('#viewer-title').textContent = button.dataset.title;
    viewer.showModal();
    document.body.classList.add('modal-open');
    document.querySelector('.viewer-scroll').scrollTo(0, 0);
  });
});
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('modal-open'));
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
