/**
 * Preload images function
 * @param {string} selector - The CSS selector for the images to be preloaded. Default is 'img'.
 * @returns {Promise} A promise that resolves when all the images are loaded.
 */
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        // Use the imagesLoaded library to ensure all images are fully loaded.
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

/** Direction constants */
const NEXT = 1;
const PREV = -1;

/**
 * Slideshow Class
 * Manages slideshow functionality including navigation and animations.
 */
class Slideshow {

    DOM = {
        el: null,            // Main slideshow container
        slides: null,        // Individual slides
        slidesInner: null    // Inner content of slides (usually images)
    };

    current = 0;
    slidesTotal = 0;
    isAnimating = false;

    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.DOM.slides = [...this.DOM.el.querySelectorAll('.slide')];
        this.DOM.slidesInner = this.DOM.slides.map(item => item.querySelector('.slide__img'));

        this.DOM.slides[this.current].classList.add('slide--current');
        this.slidesTotal = this.DOM.slides.length;
    }

    next() {
        this.navigate(NEXT);
    }

    prev() {
        this.navigate(PREV);
    }

    navigate(direction) {
        if (this.isAnimating) return false;
        this.isAnimating = true;
    
        const previous = this.current;
        this.current = direction === 1
            ? this.current < this.slidesTotal - 1 ? ++this.current : 0
            : this.current > 0 ? --this.current : this.slidesTotal - 1;
    
        const currentSlide = this.DOM.slides[previous];
        const currentInner = this.DOM.slidesInner[previous];
        const upcomingSlide = this.DOM.slides[this.current];
        const upcomingInner = this.DOM.slidesInner[this.current];
    
        gsap
            .timeline({
                defaults: {
                    duration: 1.1,
                    ease: 'power2.inOut'
                },
                onStart: () => {
                    upcomingSlide.classList.add('slide--current');
                },
                onComplete: () => {
                    currentSlide.classList.remove('slide--current');
    
                    // Delay interaction for 1.5s (or whatever delay you like)
                    setTimeout(() => {
                        this.isAnimating = false;
                    }, 1500);
                }
            })
            .addLabel('start', 0)
            .to(currentSlide, {
                scale: 0.6,
                yPercent: -direction * 90,
                rotation: direction * 20,
                autoAlpha: 0
            }, 'start')
            .fromTo(upcomingSlide, {
                scale: 0.8,
                yPercent: direction * 100,
                rotation: 0,
                autoAlpha: 1
            }, {
                scale: 1,
                yPercent: 0
            }, 'start+=0.1')
            .fromTo(upcomingInner, {
                scale: 1.1
            }, {
                scale: 1
            }, 'start+=0.1')
            .add(() => {
                // 🎯 TEXT REVEAL ANIMATION
                const elements = {
                    heading: upcomingSlide.querySelector('.work-heading'),
                    link: upcomingSlide.querySelector('.work-link'),
                    link2: upcomingSlide.querySelector('.link-2.white'),
                    number: upcomingSlide.querySelector('.work-number-serif'),
                    para: upcomingSlide.querySelector('.par-sm.white.center'),
                    tags: upcomingSlide.querySelectorAll('.tag.white')
                };
    
                // Initial States
                gsap.set([
                    elements.heading,
                    elements.link,
                    elements.link2
                ], { y: '1em' });
    
                gsap.set(elements.number, { y: '1.2em' });
                gsap.set(elements.para, { y: '2.5em' });
                gsap.set(elements.tags, { opacity: 0 });
    
                // Animate group 1
                gsap.to([
                    elements.link,
                    elements.link2,
                    elements.number
                ], {
                    y: '0em',
                    delay: 1.5,
                    duration: 1.2,
                    ease: 'quart.out'
                });
    
                // Animate group 2
                gsap.to([
                    elements.heading,
                    elements.para
                ], {
                    y: '0em',
                    delay: 1.7,
                    duration: 1,
                    ease: 'quart.out'
                });
    
                // Animate tags opacity
                gsap.to(elements.tags, {
                    opacity: 1,
                    delay: 1.5,
                    duration: 1.2,
                    ease: 'power1.out'
                });
            }, 'start+=0.6'); // Run text animation shortly after slide starts showing
    }
    
}

// Initialize slideshow
const slides = document.querySelector('.slides');
const slideshow = new Slideshow(slides);

document.querySelector('.slides-nav__item--prev').addEventListener('click', () => slideshow.prev());
document.querySelector('.slides-nav__item--next').addEventListener('click', () => slideshow.next());

// Initialize the GSAP Observer plugin
Observer.create({
    type: 'wheel,touch,pointer',
    onDown: () => slideshow.prev(),
    onUp: () => slideshow.next(),
    wheelSpeed: -1,
    tolerance: 10
});

// Preload all images
preloadImages('.slide__img').then(() => document.body.classList.remove('loading'));
