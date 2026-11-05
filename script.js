const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerPrev = document.querySelector('#viewer-prev');
const viewerNext = document.querySelector('#viewer-next');
const viewerPosition = document.querySelector('#viewer-position');
let viewerItems = [];
let viewerIndex = 0;
let viewerOnChange = null;
function renderViewer() {
  const item = viewerItems[viewerIndex];
  viewerImage.src = item.src;
  viewerImage.alt = item.alt || item.title || 'Imagem do projeto';
  document.querySelector('#viewer-title').textContent = item.title || 'Imagem do projeto';
  viewerPosition.textContent = `${viewerIndex + 1} de ${viewerItems.length}`;
  viewerPrev.disabled = viewerIndex === 0;
  viewerNext.disabled = viewerIndex === viewerItems.length - 1;
  document.querySelector('.viewer-scroll').scrollTo(0, 0);
  if (viewerOnChange) viewerOnChange(viewerIndex);
}
function openViewer(items, index, isConversation = false, onChange = null) {
  viewerItems = items;
  viewerIndex = index;
  viewerOnChange = onChange;
  viewer.classList.toggle('conversation-viewer', isConversation);
  renderViewer();
  viewer.showModal();
  document.body.classList.add('modal-open');
}
function stepViewer(delta) {
  const nextIndex = viewerIndex + delta;
  if (nextIndex < 0 || nextIndex >= viewerItems.length) return;
  viewerIndex = nextIndex;
  renderViewer();
}
viewerPrev.addEventListener('click', () => stepViewer(-1));
viewerNext.addEventListener('click', () => stepViewer(1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    stepViewer(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
viewer.addEventListener('close', () => { viewerItems = []; viewerOnChange = null; });
const flowButtons = [...document.querySelectorAll('[data-image]')];
const flowImages = flowButtons.map(button => ({ src: button.dataset.image, alt: button.querySelector('img').alt, title: button.dataset.title }));
flowButtons.forEach((button, index) => button.addEventListener('click', () => openViewer(flowImages, index)));
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('modal-open'));
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });

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
    const images = project.images.map((item, index) => ({
      src: item.src,
      alt: item.alt || `${project.name}: print ${index + 1}`,
      title: `${project.name} — print ${index + 1} de ${project.images.length}`
    }));
    openViewer(images, current, true, index => { current = index; renderConversation(); });
  });
  controls.append(back, position, forward);
  card.append(heading, description, stage, caption, controls);
  galleryRoot.append(card);
  renderConversation();
});
viewer.addEventListener('close', () => viewer.classList.remove('conversation-viewer'));



// 1.5x magnification with vivid orange background and black text.
const halo = document.querySelector('#cursor-halo');
const magnified = halo.querySelector('.magnified-content');
const lensToggle = document.querySelector('#lens-toggle');
const cursorMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lensPreferenceKey = 'portfolio-lens-enabled';
let lensEnabled = false;
try { lensEnabled = localStorage.getItem(lensPreferenceKey) === 'true'; } catch {}
function updateLensToggle() {
  lensToggle.setAttribute('aria-pressed', String(lensEnabled));
  lensToggle.textContent = lensEnabled ? 'Desativar lupa' : 'Ativar lupa';
}
updateLensToggle();
let lensDirty = true;
let lensFrame = 0;
let pointerPosition = null;
function refreshLens() { lensDirty = true; halo.classList.remove('visible'); }
function clearClone(clone) {
  clone.querySelectorAll('script,#cursor-halo,#lens-toggle').forEach(node => node.remove());
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  return clone;
}
function rebuildLens() {
  magnified.replaceChildren();
  magnified.style.width = `${document.documentElement.clientWidth}px`;
  const modal = viewer.open ? viewer : null;
  const parent = modal || document.body;
  if (halo.parentNode !== parent) parent.append(halo);
  if (modal) {
    const bounds = modal.getBoundingClientRect();
    const copy = clearClone(modal.cloneNode(true));
    Object.assign(copy.style, { position: 'absolute', margin: '0', left: `${bounds.left}px`, top: `${bounds.top + window.scrollY}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, maxHeight: 'none', maxWidth: 'none' });
    magnified.append(copy);
    const sourceScroller = modal.querySelector('.popup-content,.viewer-scroll');
    const cloneScroller = copy.querySelector('.popup-content,.viewer-scroll');
    if (sourceScroller && cloneScroller) {
      cloneScroller.scrollTop = sourceScroller.scrollTop;
      cloneScroller.scrollLeft = sourceScroller.scrollLeft;
    }
  } else {
    for (const source of [...document.body.children]) {
      if (source.matches('header,main,footer') && !source.hidden) {
        const bounds = source.getBoundingClientRect();
        const computed = getComputedStyle(source);
        const copy = clearClone(source.cloneNode(true));
        Object.assign(copy.style, {
          position: 'absolute', margin: '0',
          left: `${bounds.left}px`, top: `${bounds.top + window.scrollY}px`,
          width: `${bounds.width}px`, height: `${bounds.height}px`,
          display: computed.display, alignItems: computed.alignItems,
          justifyContent: computed.justifyContent, flexDirection: computed.flexDirection
        });
        magnified.append(copy);
      }
    }
  }
  lensDirty = false;
}
function paintLens() {
  if (!pointerPosition || !lensEnabled || !cursorMedia.matches || reducedMotion.matches || viewer.open) { halo.classList.remove('visible'); return; }
  if (lensDirty) rebuildLens();
  const { x, y } = pointerPosition;
  halo.style.left = `${x}px`;
  halo.style.top = `${y}px`;
  magnified.style.transform = `translate(${105 - x * 1.5}px, ${105 - (y + window.scrollY) * 1.5}px) scale(1.5)`;
  halo.classList.add('visible');
}
function hideLens() { cancelAnimationFrame(lensFrame); pointerPosition = null; halo.classList.remove('visible'); }
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || event.target.closest('#lens-toggle, .shot, .conversation-stage, dialog')) { hideLens(); return; }
  pointerPosition = { x: event.clientX, y: event.clientY };
  cancelAnimationFrame(lensFrame);
  lensFrame = requestAnimationFrame(paintLens);
}, { passive: true });
document.addEventListener('scroll', event => {
  if (event.target instanceof Element && event.target.closest('#cursor-halo')) return;
  if (event.target !== document) lensDirty = true;
  cancelAnimationFrame(lensFrame);
  lensFrame = requestAnimationFrame(paintLens);
}, { capture: true, passive: true });
document.addEventListener('click', event => {
  if (event.target.closest('#cursor-halo')) return;
  refreshLens();
});
document.addEventListener('toggle', event => { if (!event.target.closest('#cursor-halo')) refreshLens(); }, true);
document.addEventListener('load', event => { if (event.target instanceof HTMLImageElement && !event.target.closest('#cursor-halo')) refreshLens(); }, true);
window.addEventListener('resize', refreshLens);
document.fonts.ready.then(refreshLens);
document.documentElement.addEventListener('pointerleave', hideLens);
window.addEventListener('blur', hideLens);
document.addEventListener('keydown', hideLens);
reducedMotion.addEventListener('change', hideLens);
cursorMedia.addEventListener('change', hideLens);
lensToggle.addEventListener('click', () => {
  lensEnabled = !lensEnabled;
  updateLensToggle();
  try { localStorage.setItem(lensPreferenceKey, String(lensEnabled)); } catch {}
  hideLens();
});


viewer.addEventListener('close', refreshLens);
