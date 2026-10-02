import React, { useState, useEffect, useMemo, useRef } from "https://esm.sh/react@19";
import { createRoot } from "https://esm.sh/react-dom@19/client";
import { motion, arc } from "https://esm.sh/motion/react";
import { ChevronLeft, ChevronRight } from "https://esm.sh/lucide-react";

const WIDTH_DEFAULT = 'clamp(80px, 10vw, 120px)';
const WIDTH_ACTIVE = 'clamp(120px, 15vw, 180px)';

// phones: much bigger cards, and the drawer slides so the active card stays in view
const MOBILE_QUERY = '(max-width: 639px)';
const MOBILE = { default: 0.36, active: 0.74, lift: 0.5, gap: 12, target: -0.04 };
// the stack is turned 50deg around Y, so on screen: x' = x*cos50 + z*sin50
const COS = Math.cos(50 * Math.PI / 180), SIN = Math.sin(50 * Math.PI / 180);

const useViewport = () => {
  const get = () => ({ width: window.innerWidth, isMobile: window.matchMedia(MOBILE_QUERY).matches });
  const [vp, setVp] = useState(get);
  useEffect(() => {
    const onResize = () => setVp(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
};

const ASSETS = [
{
  title: 'Sidewalk',
  src: 'https://images.unsplash.com/photo-1779525822769-d1bbd2c0e4bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Red roof',
  src: 'https://images.unsplash.com/photo-1779525822818-07a55330f964?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Signs',
  src: 'https://images.unsplash.com/photo-1779525822831-a3f03711c7d7?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Speed limit',
  src: 'https://images.unsplash.com/photo-1779525822819-8ddef8f8ee18?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Lilac tree',
  src: 'https://images.unsplash.com/photo-1779525822839-26386802c4fd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Light-colored house',
  src: 'https://images.unsplash.com/photo-1778494824647-af2adeacd8b8?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Street light pole',
  src: 'https://images.unsplash.com/photo-1779525822731-4bde2805c932?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

{
  title: 'Tree-lined street',
  src: 'https://images.unsplash.com/photo-1779618258222-556cd048c6d0?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }];



const App = () => {
  const [activeIndex, setActiveIndex] = useState(2);

  const activeContent = useMemo(() => ASSETS[activeIndex], [activeIndex]);

  const { width: vw, isMobile } = useViewport();
  const wDefault = isMobile ? vw * MOBILE.default : null;
  const wActive = isMobile ? vw * MOBILE.active : null;
  // the row's total width is constant, so we know where the active card's centre will land;
  // shift the row so it ends up at MOBILE.target (fraction of screen width from centre)
  const rowWidth = (ASSETS.length - 1) * (wDefault + MOBILE.gap) + wActive;
  const activeCentre = activeIndex * (wDefault + MOBILE.gap) + wActive / 2 - rowWidth / 2 - 150;
  const activeDepth = (ASSETS.length - activeIndex) * 20;
  const rowShift = isMobile ?
  (vw * MOBILE.target - activeDepth * SIN) / COS - activeCentre :
  0;
  const spring = { type: 'spring', bounce: 0.25, duration: 0.6 };

  const toPrev = () => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const toNext = () => {
    setActiveIndex(prev => Math.min(ASSETS.length - 1, prev + 1));
  };

  const toSlide = index => {
    setActiveIndex(index);
  };

  // swipe left/right on touch screens
  const touchStart = useRef(null);
  const onTouchStart = e => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = e => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    dx < 0 ? toNext() : toPrev();
  };

  return /*#__PURE__*/(
    React.createElement("div", { className: "antialiased text-neutral-800 flex items-center justify-center w-screen h-dvh overflow-hidden touch-pan-y", onTouchStart, onTouchEnd }, /*#__PURE__*/

    React.createElement("div", { className: "h-[400px] pb-20 shrink-0 flex justify-center items-end transform-3d -rotate-x-10 rotate-y-50" }, /*#__PURE__*/
    React.createElement(motion.div, {
      className: "shrink-0 flex items-end transform-3d",
      style: { gap: isMobile ? MOBILE.gap : 12 },
      initial: false,
      animate: { x: rowShift },
      transition: spring },
    ASSETS.map((el, i) => {
      const isActive = activeIndex === i;
      {/* put perspective here so the rotation won't be from small to large */}
      return /*#__PURE__*/(
        React.createElement(motion.div, {
          key: el.title
          // hide the div with `h-0` to prevent the image being unclickable, remove it to see the issue
          , className: "h-0 mb-20 shrink-0 perspective-[1200px] bg-yellow-100 transform-3d flex items-center justify-center",
          style: { transform: `translateZ(${(ASSETS.length - i) * 20}px) translateX(-150px)` } // use translateZ to make the left side of the image clickable
        }, /*#__PURE__*/
        React.createElement(motion.img, {
          className: "aspect-3/4 object-cover cursor-pointer transform-3d",
          initial: false,
          animate: isMobile ?
          { width: isActive ? wActive : wDefault, transform: `rotateY(-90deg) translateY(${isActive ? -wActive * MOBILE.lift : 0}px)` } :
          { width: isActive ? WIDTH_ACTIVE : WIDTH_DEFAULT, transform: `rotateY(-90deg) translateY(${isActive ? -150 : 0}px)` },
          transition: spring,
          src: el.src,
          alt: el.title,
          onClick: () => toSlide(i) })));



    }))), /*#__PURE__*/



    React.createElement("div", { className: "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 w-fit px-2 mx-auto flex items-center gap-4 justify-center text-neutral-700 rounded-full bg-neutral-200/50 backdrop-blur-xs border border-neutral-200/80 shadow-sm" }, /*#__PURE__*/

    React.createElement("button", { onClick: toPrev, "aria-label": "Previous photo", className: "p-3 cursor-pointer" }, /*#__PURE__*/
    React.createElement(ChevronLeft, null)), /*#__PURE__*/


    React.createElement("div", { className: "w-[180px] flex justify-center items-center" },
    ASSETS.map((_, i) => /*#__PURE__*/
    React.createElement("div", {
      key: i,
      onClick: () => toSlide(i),
      className: "py-4 px-1 cursor-pointer" }, /*#__PURE__*/
    React.createElement("div", {
      className: `rounded-full cursor-pointer h-2 transition-[width,background-color] duration-300 ${activeIndex === i ? 'w-7 bg-current' : 'w-2 bg-current/30'}` })))), /*#__PURE__*/




    React.createElement("button", { onClick: toNext, "aria-label": "Next photo", className: "p-3 cursor-pointer" }, /*#__PURE__*/
    React.createElement(ChevronRight, null)))));




};

const root = createRoot(document.getElementById("app"));

root.render( /*#__PURE__*/React.createElement(App, null));