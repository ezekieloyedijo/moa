export const INTRO_KEY = "moa-intro-seen";

/**
 * Inline script run before first paint: shows the intro loader on the first
 * visit only (never with reduced motion) by adding `html.intro`.
 */
export const introScript = `try{if(!localStorage.getItem('${INTRO_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro')}}catch(e){}`;
