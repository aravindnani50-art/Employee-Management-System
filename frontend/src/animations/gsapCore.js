import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { Observer } from 'gsap/Observer';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

// Register all GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    Flip,
    Draggable,
    Observer,
    MotionPathPlugin,
    TextPlugin,
    SplitText,
    ScrambleTextPlugin,
    InertiaPlugin
  );
}

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Draggable,
  Observer,
  MotionPathPlugin,
  TextPlugin,
  SplitText,
  ScrambleTextPlugin,
  InertiaPlugin
};

export default gsap;
