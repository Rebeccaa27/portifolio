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

// Native horizontal scrolling supports touch, trackpads and keyboard navigation.
const track = document.querySelector('#project-track');
const slides = [...track.querySelectorAll('.project')];
const dots = [...document.querySelectorAll('.slide-dots button')];
const previous = document.querySelector('#prev-project');
const next = document.querySelector('#next-project');
const counter = document.querySelector('.slide-count');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let scrollFrame;
function nearestSlide() {
  const left = track.getBoundingClientRect().left;
  return slides.reduce((best, slide, index) =>
    Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(slides[best].getBoundingClientRect().left - left) ? index : best, 0);
}
function updateControls() {
  activeSlide = nearestSlide();
  previous.disabled = activeSlide === 0;
  next.disabled = activeSlide === slides.length - 1;
  counter.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  dots.forEach((dot, index) => {
    if (index === activeSlide) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}
function goToSlide(index) {
  const destination = slides[Math.max(0, Math.min(slides.length - 1, index))];
  const offset = destination.getBoundingClientRect().left - track.getBoundingClientRect().left;
  track.scrollTo({ left: track.scrollLeft + offset, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
previous.addEventListener('click', () => goToSlide(activeSlide - 1));
next.addEventListener('click', () => goToSlide(activeSlide + 1));
dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));
track.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(updateControls);
}, { passive: true });
track.addEventListener('keydown', event => {
  if (event.target !== track) return;
  const directions = { ArrowRight: activeSlide + 1, ArrowLeft: activeSlide - 1, Home: 0, End: slides.length - 1 };
  if (Object.hasOwn(directions, event.key)) {
    event.preventDefault();
    goToSlide(directions[event.key]);
  }
});
window.addEventListener('resize', updateControls);
updateControls();

