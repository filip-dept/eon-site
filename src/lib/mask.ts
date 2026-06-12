'use client';

export interface MaskRefs {
  heroEl: HTMLElement;
  frameEl: HTMLElement;          // .mediaFrame (tall 1:1.35 rounded rect)
  svgEl: SVGSVGElement;
  maskEl: SVGMaskElement;
  mediaEl: SVGForeignObjectElement; // holds the <video>, fills the frame
  revealRectEl: SVGRectElement;  // white reveal (entrance wipe)
  chatCutEl: SVGPathElement;     // black cutout for chat module
  scrollCutEl: SVGCircleElement; // black cutout for scroll indicator
  chatCardEl: HTMLElement;
  scrollIndicatorEl: HTMLElement;
}

/* CHAT_GAP=20 → cutout is 40px wider & higher than the modal, centered. */
const CHAT_GAP = 20;
/* Concave fillet radius where the notch meets the image's top edge */
const FILLET = 24;

export interface MaskController {
  frameW: number;
  frameH: number;
  layout: () => void;
  setReveal: (p: number) => void;
  setScroll: (p: number) => void;
  /** 0→1: the chat notch pushes down into the image (entrance) */
  setChatCut: (p: number) => void;
}

export function initMask(refs: MaskRefs): MaskController {
  const {
    frameEl, svgEl, maskEl, mediaEl, revealRectEl, chatCutEl, scrollCutEl,
    chatCardEl, scrollIndicatorEl,
  } = refs;

  let chatGeom = { cx: 0, cw: 0, ch: 0, r: 0, f: 0 }; // resting notch geometry
  let chatP = 1;            // notch depth 0→1 (animated during entrance)

  const ctrl: MaskController = {
    frameW: 0,
    frameH: 0,
    layout,
    setReveal,
    setScroll,
    setChatCut,
  } as MaskController;

  function layout() {
    const fr = frameEl.getBoundingClientRect();
    const w = fr.width;
    const h = fr.height;
    ctrl.frameW = w;
    ctrl.frameH = h;

    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.setAttribute('preserveAspectRatio', 'none');

    /* Video box fills the frame exactly — object-fit: cover inside the
       foreignObject keeps it clipped + centered at any video aspect. */
    mediaEl.setAttribute('x', '0');
    mediaEl.setAttribute('y', '0');
    mediaEl.setAttribute('width', String(w));
    mediaEl.setAttribute('height', String(h));

    /* Mask region = the frame (a bit taller to include the chat cut above) */
    maskEl.setAttribute('maskUnits', 'userSpaceOnUse');
    maskEl.setAttribute('x', '0');
    maskEl.setAttribute('y', '-40');
    maskEl.setAttribute('width', String(w));
    maskEl.setAttribute('height', String(h + 90));

    /* Reveal rect spans the frame width; height set by setReveal (entrance wipe) */
    revealRectEl.setAttribute('x', '0');
    revealRectEl.setAttribute('width', String(w));

    /* Chat cutout geometry — measured on the card's UNTRANSFORMED wrapper so
       entrance transforms (y/scale on the card) never distort the notch */
    const measureEl = chatCardEl.parentElement ?? chatCardEl;
    const cc = measureEl.getBoundingClientRect();
    const cx = cc.left - fr.left - CHAT_GAP;
    const cw = cc.width + CHAT_GAP * 2;
    const ch = (cc.top - fr.top) + cc.height + CHAT_GAP;
    const r  = 24 + CHAT_GAP;
    /* fillet shrinks gracefully if the notch nearly spans the frame */
    const f  = Math.max(0, Math.min(FILLET, cx, w - (cx + cw)));
    chatGeom = { cx, cw, ch, r, f };
    drawChatCut();

    /* The indicator is positioned by CSS (position: sticky) — it stays near the
       viewport bottom until the frame's bottom scrolls past. */
    layoutScrollCut();
  }

  /* Concave fillets where the notch meets the image's top edge (Figma's
     inverted inner radius), rounded bottom corners. The notch depth scales
     with chatP so the entrance can "push" it into the image — radii shrink
     proportionally while the notch is shallow, so corners are always soft. */
  function drawChatCut() {
    const { cx, cw, ch, r, f } = chatGeom;
    const effCh = ch * chatP;
    if (effCh < 0.5) {
      chatCutEl.setAttribute('d', '');
      return;
    }
    const k  = Math.min(1, effCh / (f + r || 1));
    const f2 = f * k;
    const r2 = r * k;
    // top edge (left of notch) → fillet sweeps down into the left wall →
    // rounded bottom corners → up the right wall → fillet sweeps out to the top edge
    chatCutEl.setAttribute('d',
      `M ${cx - f2},0` +
      ` A ${f2} ${f2} 0 0 1 ${cx},${f2}` +
      ` L ${cx},${effCh - r2}` +
      ` Q ${cx},${effCh} ${cx + r2},${effCh}` +
      ` L ${cx + cw - r2},${effCh}` +
      ` Q ${cx + cw},${effCh} ${cx + cw},${effCh - r2}` +
      ` L ${cx + cw},${f2}` +
      ` A ${f2} ${f2} 0 0 1 ${cx + cw + f2},0` +
      ` Z`
    );
  }

  function setChatCut(p: number) {
    chatP = Math.min(1, Math.max(0, p));
    drawChatCut();
  }

  function layoutScrollCut() {
    const fr = frameEl.getBoundingClientRect();
    const sc = scrollIndicatorEl.getBoundingClientRect();
    const cx = sc.left - fr.left + sc.width / 2;
    const cy = sc.top - fr.top + sc.height / 2;
    scrollCutEl.setAttribute('cx', String(cx));
    scrollCutEl.setAttribute('cy', String(cy));
    /* hole hidden — the indicator sits directly on the video, no cutout ring */
    scrollCutEl.dataset.baseR = '0';
    scrollCutEl.setAttribute('r', '0');
  }

  function setReveal(p: number) {
    const h = ctrl.frameH * Math.min(1, Math.max(0, p));
    revealRectEl.setAttribute('y', '0');
    revealRectEl.setAttribute('height', String(h));
  }

  function setScroll(_p: number) {
    /* The scroll cut stays hidden and the indicator's position + exit are now
       handled by CSS sticky, so there's nothing to drive per scroll frame. */
  }

  layout();
  setReveal(0);
  setScroll(0);

  return ctrl;
}
