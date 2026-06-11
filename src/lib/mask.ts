'use client';

export interface MaskRefs {
  heroEl: HTMLElement;
  frameEl: HTMLElement;          // .mediaFrame (one-viewport window into the tall image)
  svgEl: SVGSVGElement;
  maskEl: SVGMaskElement;
  imageEl: SVGImageElement;
  revealRectEl: SVGRectElement;  // white reveal (entrance wipe)
  chatCutEl: SVGPathElement;     // black cutout for chat module
  scrollCutEl: SVGCircleElement; // black cutout for scroll indicator
  chatCardEl: HTMLElement;
  scrollIndicatorEl: HTMLElement;
}

const SCROLL_R = 28;
const SCROLL_BOTTOM = 40;
/* CHAT_GAP=20 → cutout is 40px wider & higher than the modal, centered. */
const CHAT_GAP = 20;
const SCROLL_GAP = 8;

export interface MaskController {
  frameW: number;
  frameH: number;
  scrollRange: number;
  setImageAspect: (aspect: number) => void;
  getHeroHeight: () => number;
  layout: () => void;
  setReveal: (p: number) => void;
  setScroll: (p: number) => void;
}

export function initMask(refs: MaskRefs): MaskController {
  const {
    frameEl, svgEl, maskEl, imageEl, revealRectEl, chatCutEl, scrollCutEl,
    chatCardEl, scrollIndicatorEl,
  } = refs;

  let imgAspect = 0;        // natural height / width
  let scrollRange = 0;      // px the tall image can scroll inside the window
  let pEnd = 0.82;          // scroll progress at which the image reaches its end

  const ctrl: MaskController = {
    frameW: 0,
    frameH: 0,
    get scrollRange() { return scrollRange; },
    setImageAspect,
    getHeroHeight,
    layout,
    setReveal,
    setScroll,
  } as MaskController;

  function setImageAspect(a: number) { imgAspect = a; }

  /* Extra scroll past the image end, for the indicator's fluid exit */
  function exitBuffer() { return window.innerHeight * 0.4; }

  function getHeroHeight() {
    return Math.round(window.innerHeight * 1.5);
  }

  function layout() {
    const fr = frameEl.getBoundingClientRect();
    const w = fr.width;
    const h = fr.height;
    ctrl.frameW = w;
    ctrl.frameH = h;

    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.setAttribute('preserveAspectRatio', 'none');

    /* Display the image at full window width with its natural (tall) height */
    const aspect = imgAspect || h / w;
    const imgDisplayH = Math.max(h, w * aspect);
    scrollRange = Math.max(0, imgDisplayH - h);
    pEnd = scrollRange > 0 ? scrollRange / (scrollRange + exitBuffer()) : 0.82;

    imageEl.setAttribute('x', '0');
    imageEl.setAttribute('y', '0');
    imageEl.setAttribute('width', String(w));
    imageEl.setAttribute('height', String(imgDisplayH));
    imageEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    /* Mask region = the visible window (a bit taller to include the chat cut above) */
    maskEl.setAttribute('maskUnits', 'userSpaceOnUse');
    maskEl.setAttribute('x', '0');
    maskEl.setAttribute('y', '-40');
    maskEl.setAttribute('width', String(w));
    maskEl.setAttribute('height', String(h + 80));

    /* Reveal rect spans the window width; height set by setReveal (entrance wipe) */
    revealRectEl.setAttribute('x', '0');
    revealRectEl.setAttribute('width', String(w));

    /* Chat cutout — sharp top corners, rounded bottom corners */
    const cc = chatCardEl.getBoundingClientRect();
    const cx = cc.left - fr.left - CHAT_GAP;
    const cw = cc.width + CHAT_GAP * 2;
    const ch = (cc.top - fr.top) + cc.height + CHAT_GAP;
    const r  = 24 + CHAT_GAP;
    // M top-left → top-right → bottom-right arc → bottom-left arc → close
    chatCutEl.setAttribute('d',
      `M ${cx},0 L ${cx + cw},0 L ${cx + cw},${ch - r} Q ${cx + cw},${ch} ${cx + cw - r},${ch} L ${cx + r},${ch} Q ${cx},${ch} ${cx},${ch - r} Z`
    );

    layoutScrollCut();
  }

  function layoutScrollCut() {
    const fr = frameEl.getBoundingClientRect();
    const sc = scrollIndicatorEl.getBoundingClientRect();
    const cx = sc.left - fr.left + sc.width / 2;
    const cy = sc.top - fr.top + sc.height / 2;
    const r = sc.width / 2 + SCROLL_GAP;
    scrollCutEl.setAttribute('cx', String(cx));
    scrollCutEl.setAttribute('cy', String(cy));
    scrollCutEl.dataset.baseR = String(r);
    scrollCutEl.setAttribute('r', String(r));
  }

  function setReveal(p: number) {
    const h = ctrl.frameH * Math.min(1, Math.max(0, p));
    revealRectEl.setAttribute('y', '0');
    revealRectEl.setAttribute('height', String(h));
  }

  function setScroll(p: number) {
    p = Math.min(1, Math.max(0, p));

    /* Scroll the tall image through the window until its end is reached at pEnd */
    const imgP = pEnd > 0 ? Math.min(1, p / pEnd) : 0;
    imageEl.setAttribute('y', String(-scrollRange * imgP));

    /* Indicator + its cutout fluidly exit once the image end is reached */
    const baseR = Number(scrollCutEl.dataset.baseR ?? 0);
    if (p > pEnd) {
      const t = (p - pEnd) / (1 - pEnd);   // 0→1
      const eased = t * t;
      scrollCutEl.setAttribute('r', String(baseR * (1 - eased)));
      scrollIndicatorEl.style.opacity = String(1 - eased);
    } else {
      scrollCutEl.setAttribute('r', String(baseR));
      scrollIndicatorEl.style.opacity = '1';
    }
  }

  layout();
  setReveal(0);
  setScroll(0);

  return ctrl;
}
