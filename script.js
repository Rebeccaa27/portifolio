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

// One independent conversation gallery per AI project.
const aiProjects = (window.portfolioAIProjects || []).filter(project => Array.isArray(project.images) && project.images.length > 0);
const galleryRoot = document.querySelector('#ai-galleries');
if (aiProjects.length) galleryRoot.replaceChildren();
aiProjects.forEach(project => {
  let current = 0;
  const card = document.createElement('article');
  card.className = 'ai-card';
  const heading = document.createElement('h3');
  heading.textContent = project.name;
  const description = document.createElement('p');
  description.textContent = project.description;
  const stage = document.createElement('button');
  stage.type = 'button';
  stage.className = 'conversation-stage';
  stage.setAttribute('aria-label', `Ampliar conversa de ${project.name}`);
  const picture = document.createElement('img');
  picture.loading = 'lazy';
  const enlarge = document.createElement('span');
  enlarge.className = 'zoom';
  enlarge.textContent = 'Ver a conversa maior ↗';
  stage.append(picture, enlarge);
  const caption = document.createElement('p');
  caption.className = 'conversation-caption';
  const controls = document.createElement('div');
  controls.className = 'conversation-controls';
  const back = document.createElement('button');
  back.type = 'button'; back.textContent = '←'; back.setAttribute('aria-label', `Print anterior de ${project.name}`);
  const position = document.createElement('span');
  position.setAttribute('aria-live', 'polite');
  position.setAttribute('aria-atomic', 'true');
  const forward = document.createElement('button');
  forward.type = 'button'; forward.textContent = '→'; forward.setAttribute('aria-label', `Próximo print de ${project.name}`);
  function renderConversation() {
    const item = project.images[current];
    picture.src = item.src;
    picture.alt = item.alt || `${project.name}: print ${current + 1} da conversa`;
    caption.textContent = item.caption || '';
    position.textContent = `Print ${current + 1} de ${project.images.length}`;
    back.disabled = current === 0;
    forward.disabled = current === project.images.length - 1;
  }
  back.addEventListener('click', () => { if (current > 0) { current--; renderConversation(); } });
  forward.addEventListener('click', () => { if (current < project.images.length - 1) { current++; renderConversation(); } });
  stage.addEventListener('click', () => {
    viewerImage.src = picture.src;
    viewerImage.alt = picture.alt;
    viewer.classList.add('conversation-viewer');
    document.querySelector('#viewer-title').textContent = `${project.name} — print ${current + 1} de ${project.images.length}`;
    viewer.showModal();
    document.body.classList.add('modal-open');
    document.querySelector('.viewer-scroll').scrollTo(0, 0);
  });
  controls.append(back, position, forward);
  card.append(heading, description, stage, caption, controls);
  galleryRoot.append(card);
  renderConversation();
});
viewer.addEventListener('close', () => viewer.classList.remove('conversation-viewer'));

