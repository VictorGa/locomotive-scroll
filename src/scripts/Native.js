import Core from './Core';

export default class extends Core {
    constructor(options = {}) {
        super(options);

        window.addEventListener('scroll', this.checkScroll, false);
    }

    init() {
        this.instance.scroll.y = window.scrollY;

        this.addElements();
        this.detectElements();

        super.init();
    }

    checkScroll() {
        super.checkScroll();

        if (this.els.length) {
            this.instance.scroll.y = window.scrollY;

            if(!this.hasScrollTicking) {
                requestAnimationFrame(() => {
                    this.detectElements();
                });
                this.hasScrollTicking = true;
            }
        }
    }

    checkResize() {
        if (this.els.length) {
            this.windowHeight = window.innerHeight;

            if(!this.hasScrollTicking) {
                requestAnimationFrame(() => {
                    this.updateElements();
                });
                this.hasScrollTicking = true;
            }
        }
    }

    addElements() {
        const els = this.el.querySelectorAll('[data-'+this.name+']');
        els.forEach((el, i) => {
            const {top: elTop, height} = el.getBoundingClientRect();
            let cl = el.dataset[this.name + 'Class'] || this.class;
            let clAnchor = el.dataset[this.name + 'ClassAnchor'] || this.anchorClass;
            let top = elTop + this.instance.scroll.y;
            let bottom = top + el.offsetHeight;
            let repeat = el.dataset[this.name + 'Repeat'];
            let call = el.dataset[this.name + 'Call'];

            const {offset, anchorOffset} = this.updateOffsets(el);

            if(repeat == 'false') {
                repeat = false;
            } else if (repeat != undefined) {
                repeat = true;
            } else {
                repeat = this.repeat;
            }

            this.els[i] = {
                el: el,
                class: cl,
                anchorClass: clAnchor,
                top: top + offset,
                anchorTop: top + anchorOffset,
                bottom: bottom,
                anchorBottom: bottom - anchorOffset/2,
                offset: offset,
                anchorOffset: anchorOffset,
                repeat: repeat,
                inView: false,
                inAnchorView: false,
                call: call
            }
        });
    }

    updateOffsets(el) {
        let offset = el.dataset[this.name + 'Offset'] || this.offset;
        if(el.dataset[this.name + 'Offset'] && el.dataset[this.name + 'Offset'].includes('%')) {
            // Parse as percentage
            offset = parseInt(el.dataset[this.name + 'Offset']);
            offset = el.offsetHeight * (offset/100);
        } else {
            offset = parseInt(offset);
        }

        let anchorOffset = el.dataset[this.name + 'AnchorOffset'] || this.anchorOffset;
        if(el.dataset[this.name + 'AnchorOffset'] && el.dataset[this.name + 'AnchorOffset'].includes('%')) {
            // Parse as percentage
            anchorOffset = parseInt(el.dataset[this.name + 'AnchorOffset']);
            anchorOffset = el.offsetHeight * (anchorOffset/100);
        } else {
            anchorOffset = parseInt(offset);
        }

        return {offset, anchorOffset}
    }

    updateElements() {
        this.els.forEach((el, i) => {
            const top = el.el.getBoundingClientRect().top + this.instance.scroll.y;
            const bottom = top + el.el.offsetHeight;

            // Update % anchor points
            const {offset, anchorOffset} = this.updateOffsets(el.el);

            this.els[i].top = top + offset;
            this.els[i].anchorTop = top + anchorOffset;
            this.els[i].offset = offset;
            this.els[i].anchorOffset = anchorOffset;
            this.els[i].bottom = bottom;
            this.els[i].anchorBottom = bottom - anchorOffset/2;


        });

        this.hasScrollTicking = false;
    }

    /**
     * Scroll to a desired target.
     *
     * @param  {object} options
     * @return {void}
     */
    scrollTo(targetOption, offsetOption) {
        let target;
        let offset = offsetOption ? parseInt(offsetOption) : 0;

        if(typeof targetOption === 'string') {

            if(targetOption === 'top') {
                target = this.html;
            } else if(targetOption === 'bottom') {
                offset = this.html.offsetHeight - window.innerHeight;
            } else {
                target = document.querySelectorAll(targetOption)[0];
            }

        } else if(!targetOption.target) {
            target = targetOption;
        }

        if (target) {
            offset = target.getBoundingClientRect().top + offset;
        }
        offset += this.instance.scroll.y;

        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    }

    update() {
        this.updateElements();
    }

    destroy() {
        super.destroy();

        window.removeEventListener('scroll', this.checkScroll, false);
    }

}
