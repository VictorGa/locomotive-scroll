import { defaults } from './options';

export default class {
    constructor(options = {}) {
        window.scrollTo(0,0);

        Object.assign(this, defaults, options);

        this.namespace = 'locomotive';
        this.html = document.documentElement;
        this.windowHeight = window.innerHeight;
        this.windowMiddle = this.windowHeight / 2;
        this.els = [];

        this.hasScrollTicking = false;
        this.hasCallEventSet = false;

        this.checkScroll = this.checkScroll.bind(this);
        this.checkResize = this.checkResize.bind(this);

        this.instance = {
            scroll: {
                x: 0,
                y: 0
            },
            limit: this.html.offsetHeight
        }

        if (this.getDirection) {
            this.instance.direction = null;
        }

        if (this.getDirection) {
            this.instance.speed = 0;
        }

        this.html.classList.add(this.initClass);

        window.addEventListener('resize', this.checkResize, false);
    }

    init() {
        this.initEvents();
    }

    checkScroll() {
        this.dispatchScroll();
    }

    checkResize() {}

    initEvents() {
        this.scrollToEls = this.el.querySelectorAll(`[data-${this.name}-to]`);
        this.setScrollTo = this.setScrollTo.bind(this);

        this.scrollToEls.forEach((el) => {
            el.addEventListener('click', this.setScrollTo, false);
        });
    }

    setScrollTo(event) {
        event.preventDefault();

        this.scrollTo(
            event.currentTarget.getAttribute(`data-${this.name}-href`) || event.currentTarget.getAttribute('href'),
            event.currentTarget.getAttribute(`data-${this.name}-offset`)
        );
    }

    addElements() {}

    detectElements(hasCallEventSet) {
        const scrollTop = this.instance.scroll.y;
        const scrollBottom = scrollTop + this.windowHeight;

        this.els.forEach((el, i) => {
            if (!el.inView || hasCallEventSet) {
                if ((scrollBottom >= el.top) && (scrollTop < el.bottom)) {
                    this.setInView(el, i);
                }
            }

            if(typeof el.anchorOffset !== 'undefined') {
                const anchorOffsetScrollTop = scrollTop - (el.anchorTop + (el.offsetHeight - (el.offsetHeight * .25)));
                // console.log(el.call, el.anchorOffset, scrollTop,  el.anchorTop, anchorOffsetScrollTop)
                if((scrollTop >= el.anchorTop) && anchorOffsetScrollTop <= 0) {
                    console.log(el.call, 'in-anchor-view')
                    this.setInAnchorView(el, i)
                } 

                if(el.inAnchorView) {
                    if (anchorOffsetScrollTop > 0) {
                        console.log(el.call, 'out-anchor-view')
                        this.setOutOfAnchorView(el, i);
                    }
                }
            }

            if (el.inView) {
                if ((scrollBottom < el.top) || (scrollTop > el.bottom)) {
                    this.setOutOfView(el, i);
                }
            }
        });

        this.hasScrollTicking = false;
    }

    setInView(current, i) {
        this.els[i].inView = true;
        current.el.classList.add(current.class);

        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'enter');

            if (!current.repeat && typeof current.anchorOffset === 'undefined') {
                this.els[i].call = false
            }
        }

        if (!current.repeat && !current.speed && !current.sticky && typeof current.anchorOffset === 'undefined') {
            if (!current.call || current.call && this.hasCallEventSet) {
                this.els.splice(i, 1);
            }
        }
    }

    setInAnchorView(current, i) {
        this.els[i].inAnchorView = true;
        current.el.classList.add(current.anchorClass);

        
        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'anchor-enter');

            // if (!current.repeat) {
            //     this.els[i].call = false
            // }
        }
    }

    setOutOfView(current, i) {
        if (current.speed !== undefined) {
            this.els[i].inView = false;
        }

        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'exit');
        }

        if (current.repeat) {
            current.el.classList.remove(current.class);
        }
    }

    setOutOfAnchorView(current, i) {
        this.els[i].inAnchorView = false;

        if (current.call && this.hasCallEventSet) {
            this.dispatchCall(current, 'anchor-exit');
        }

        current.el.classList.remove(current.anchorClass);
    }

    dispatchCall(current, way) {
        this.callWay = way;
        this.callValue = current.call.split(',').map(item => item.trim());
        this.callObj = current;

        if (this.callValue.length == 1) this.callValue = this.callValue[0];

        const callEvent = new Event(this.namespace + 'call');
        this.el.dispatchEvent(callEvent);
    }

    dispatchScroll() {
        const scrollEvent = new Event(this.namespace + 'scroll');
        this.el.dispatchEvent(scrollEvent);
    }

    setEvents(event, func) {
        this.el.addEventListener(this.namespace + event, () => {
            switch (event) {
                case 'scroll':
                    return func(this.instance);
                case 'call':
                    return func(this.callValue, this.callWay, this.callObj);
                default:
                    return func();
            }
        }, false);

        if (event === 'call') {
            this.hasCallEventSet = true;
            this.detectElements(true);
        }
    }

    startScroll() {}

    stopScroll() {}

    setScroll(x,y) {
        this.instance.scroll = {
            x: 0,
            y: 0
        }
    }

    destroy() {
        window.removeEventListener('resize', this.checkResize, false);

        this.scrollToEls.forEach((el) => {
            el.removeEventListener('click', this.setScrollTo, false);
        });
    }
}
