/**
 * Preload images function
 * @param {string} selector - The CSS selector for the images to be preloaded. Default is 'img'.
 * @returns {Promise} A promise that resolves when all the images are loaded.
 */
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), { background: true }, resolve);
    });
};

/** Direction constants */
const NEXT = 1;
const PREV = -1;

/**
 * Slideshow Class
 */
class Slideshow {
    DOM = {
        el: null,
        slides: null,
        slidesInner: null
    };

    current = 0;
    slidesTotal = 0;
    isAnimating = false;
    _textElements = null;

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

                    const elements = {
                        heading: upcomingSlide.querySelectorAll('.work-heading'),
                        link: upcomingSlide.querySelectorAll('.work-link'),
                        link2: upcomingSlide.querySelectorAll('.link-2.white'),
                        number: upcomingSlide.querySelectorAll('.work-number-serif'),
                        para: upcomingSlide.querySelectorAll('.par-sm.white.center'),
                        tags: upcomingSlide.querySelectorAll('.tag.white')
                    };

                    gsap.set([
                        ...elements.heading,
                        ...elements.link,
                        ...elements.link2
                    ], { y: '1.1em', opacity: 1 });

                    gsap.set(elements.number, { y: '1.2em', opacity: 1 });
                    gsap.set(elements.para, { y: '2.5em', opacity: 1 });
                    gsap.set(elements.tags, { opacity: 0 });

                    this._textElements = elements;
                },
                onComplete: () => {
                    currentSlide.classList.remove('slide--current');
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
            }, 'start+=0')
            .fromTo(upcomingInner, {
                scale: 1.1
            }, {
                scale: 1
            }, 'start+=0')
            .add(() => {
                const elements = this._textElements;

                gsap.to([
                    ...elements.link,
                    ...elements.link2,
                    ...elements.number
                ], {
                    y: '0em',
                    delay: .6,
                    duration: 1.4,
                    ease: 'quart.out'
                });

                gsap.to([
                    ...elements.heading,
                    ...elements.para
                ], {
                    y: '0em',
                    delay: .8,
                    duration: 1.2,
                    ease: 'quart.out'
                });

                gsap.to(elements.tags, {
                    opacity: 1,
                    delay: .6,
                    duration: 1.4,
                    ease: 'power1.out'
                });
            }, 'start+=0.6');
    }
}

// Initialize slideshow
const slides = document.querySelector('.slides');
const slideshow = new Slideshow(slides);

document.querySelector('.slides-nav__item--prev').addEventListener('click', () => slideshow.prev());
document.querySelector('.slides-nav__item--next').addEventListener('click', () => slideshow.next());

// Enable scroll and gesture navigation
Observer.create({
    type: 'wheel,touch,pointer',
    onDown: () => slideshow.prev(),
    onUp: () => slideshow.next(),
    wheelSpeed: -1,
    tolerance: 10
});

// Preload images and run initial animation
preloadImages('.slide__img').then(() => {
    document.body.classList.remove('loading');

    // Animate first slide and navbar after 2.5s delay
    gsap.delayedCall(2.5, () => {
        const firstSlide = slideshow.DOM.slides[0];
        const elements = {
            heading: firstSlide.querySelectorAll('.work-heading'),
            link: firstSlide.querySelectorAll('.work-link'),
            link2: firstSlide.querySelectorAll('.link-2.white'),
            number: firstSlide.querySelectorAll('.work-number-serif'),
            para: firstSlide.querySelectorAll('.par-sm.white.center'),
            tags: firstSlide.querySelectorAll('.tag.white')
        };

        // Set initial states (already hidden via CSS to avoid flicker)
        gsap.set([
            ...elements.heading,
            ...elements.link,
            ...elements.link2,
            elements.number,
            elements.para
        ], { opacity: 1 });

        // Animate navbar and text
        const tl = gsap.timeline();

        // Animate navbar (correct class: .nav-work)
        tl.to('.nav-work', {
            opacity: 1,
            duration: 1,
            ease: 'power2.out'
        }, 0);

        // Animate text elements
        tl.to([
            ...elements.link,
            ...elements.link2,
            ...elements.number
        ], {
            y: '0em',
            duration: 1.4,
            ease: 'quart.out'
        }, 0.2);

        tl.to([
            ...elements.heading,
            ...elements.para
        ], {
            y: '0em',
            duration: 1.2,
            ease: 'quart.out'
        }, 0.4);

        tl.to(elements.tags, {
            opacity: 1,
            duration: 1.4,
            ease: 'power1.out'
        }, 0.2);
    });
});
