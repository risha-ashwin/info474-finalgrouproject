// scroller.js
// Small Scroller abstraction that computes active step index and progress
// and exposes a lightweight .on(action, cb)
(function () {

    function Scroller(containerSelector, stepSelector, trigger) {
        this.container = document.querySelector(containerSelector) || document.body;
        this.steps = Array.prototype.slice.call(document.querySelectorAll(stepSelector));
        this.sectionPositions = [];
        this.trigger = trigger || 'top'; // 'top' or 'center'
        this.currentIndex = -1;
        this.onActive = function () { };
        this.onProgress = function () { };

        var self = this;

        // Compute absolute page positions of each section
        this.resize = function () {
            self.sectionPositions = [];
            self.steps.forEach(function (el) {
                var rect = el.getBoundingClientRect();
                var top = rect.top + window.pageYOffset;
                if (self.trigger === 'center') {
                    var centerY = top + (rect.height / 2);
                    self.sectionPositions.push(centerY);
                } else {
                    self.sectionPositions.push(top);
                }
            });
        };

        // Determine which section is active and progress through it
        this.position = function () {
            var triggerY = (self.trigger === 'center')
                ? window.pageYOffset + window.innerHeight / 2
                : window.pageYOffset + 10;

            var sectionIndex = 0;
            for (var i = 0; i < self.sectionPositions.length; i++) {
                if (triggerY >= self.sectionPositions[i]) sectionIndex = i;
                else break;
            }
            sectionIndex = Math.min(self.sectionPositions.length - 1, sectionIndex);

            var elem = self.steps[sectionIndex];

            // Use data-active-index if present
            var ai = elem.hasAttribute('data-active-index')
                ? +elem.getAttribute('data-active-index')
                : sectionIndex;

            if (self.currentIndex !== ai) {
                self.currentIndex = ai;
                self.onActive(ai);
            }

            // Compute progress through current section (0..1)
            var rect = elem.getBoundingClientRect();
            var elemTop = rect.top + window.pageYOffset;
            var elemHeight = rect.height || 1; // avoid divide-by-zero
            var rawSectionProgress = (triggerY - elemTop) / elemHeight;
            var progress = Math.max(0, Math.min(1, rawSectionProgress));
            self.onProgress(ai, progress);
        };

        window.addEventListener('resize', this.resize);
        window.addEventListener('scroll', this.position);

        // Initial calculation
        setTimeout(function () {
            self.resize();
            self.position();
        }, 50);
    }

    Scroller.prototype.on = function (action, cb) {
        if (action === 'active') this.onActive = cb;
        if (action === 'progress') this.onProgress = cb;
        return this;
    };

    window.Scroller = Scroller;

})();