import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Output, PLATFORM_ID, TemplateRef, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbCarouselConfig } from './carousel-config';
import { BehaviorSubject, combineLatest, NEVER, Subject, timer, zip } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { ngbRunTransition } from '../util/transition/ngbTransition';
import { ngbCarouselTransitionIn, ngbCarouselTransitionOut, NgbSlideEventDirection } from './carousel-transition';
let nextId = 0;
/**
 * A directive that wraps the individual carousel slide.
 */
export class NgbSlide {
    constructor(tplRef) {
        this.tplRef = tplRef;
        /**
         * Slide id that must be unique for the entire document.
         *
         * If not provided, will be generated in the `ngb-slide-xx` format.
         */
        this.id = `ngb-slide-${nextId++}`;
        /**
         * An event emitted when the slide transition is finished
         *
         * @since 8.0.0
         */
        this.slid = new EventEmitter();
    }
}
NgbSlide.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbSlide]' },] }
];
NgbSlide.ctorParameters = () => [
    { type: TemplateRef }
];
NgbSlide.propDecorators = {
    id: [{ type: Input }],
    slid: [{ type: Output }]
};
/**
 * Carousel is a component to easily create and control slideshows.
 *
 * Allows to set intervals, change the way user interacts with the slides and provides a programmatic API.
 */
export class NgbCarousel {
    constructor(config, _platformId, _ngZone, _cd, _container) {
        this._platformId = _platformId;
        this._ngZone = _ngZone;
        this._cd = _cd;
        this._container = _container;
        this.NgbSlideEventSource = NgbSlideEventSource;
        this._destroy$ = new Subject();
        this._interval$ = new BehaviorSubject(0);
        this._mouseHover$ = new BehaviorSubject(false);
        this._focused$ = new BehaviorSubject(false);
        this._pauseOnHover$ = new BehaviorSubject(false);
        this._pauseOnFocus$ = new BehaviorSubject(false);
        this._pause$ = new BehaviorSubject(false);
        this._wrap$ = new BehaviorSubject(false);
        /**
         * An event emitted just before the slide transition starts.
         *
         * See [`NgbSlideEvent`](#/components/carousel/api#NgbSlideEvent) for payload details.
         */
        this.slide = new EventEmitter();
        /**
         * An event emitted right after the slide transition is completed.
         *
         * See [`NgbSlideEvent`](#/components/carousel/api#NgbSlideEvent) for payload details.
         *
         * @since 8.0.0
         */
        this.slid = new EventEmitter();
        /*
         * Keep the ids of the panels currently transitionning
         * in order to allow only the transition revertion
         */
        this._transitionIds = null;
        this.animation = config.animation;
        this.interval = config.interval;
        this.wrap = config.wrap;
        this.keyboard = config.keyboard;
        this.pauseOnHover = config.pauseOnHover;
        this.pauseOnFocus = config.pauseOnFocus;
        this.showNavigationArrows = config.showNavigationArrows;
        this.showNavigationIndicators = config.showNavigationIndicators;
    }
    /**
     * Time in milliseconds before the next slide is shown.
     */
    set interval(value) {
        this._interval$.next(value);
    }
    get interval() { return this._interval$.value; }
    /**
     * If `true`, will 'wrap' the carousel by switching from the last slide back to the first.
     */
    set wrap(value) {
        this._wrap$.next(value);
    }
    get wrap() { return this._wrap$.value; }
    /**
     * If `true`, will pause slide switching when mouse cursor hovers the slide.
     *
     * @since 2.2.0
     */
    set pauseOnHover(value) {
        this._pauseOnHover$.next(value);
    }
    get pauseOnHover() { return this._pauseOnHover$.value; }
    /**
     * If `true`, will pause slide switching when the focus is inside the carousel.
     */
    set pauseOnFocus(value) {
        this._pauseOnFocus$.next(value);
    }
    get pauseOnFocus() { return this._pauseOnFocus$.value; }
    set mouseHover(value) { this._mouseHover$.next(value); }
    get mouseHover() { return this._mouseHover$.value; }
    set focused(value) { this._focused$.next(value); }
    get focused() { return this._focused$.value; }
    arrowLeft() {
        this.focus();
        this.prev(NgbSlideEventSource.ARROW_LEFT);
    }
    arrowRight() {
        this.focus();
        this.next(NgbSlideEventSource.ARROW_RIGHT);
    }
    ngAfterContentInit() {
        // setInterval() doesn't play well with SSR and protractor,
        // so we should run it in the browser and outside Angular
        if (isPlatformBrowser(this._platformId)) {
            this._ngZone.runOutsideAngular(() => {
                const hasNextSlide$ = combineLatest([
                    this.slide.pipe(map(slideEvent => slideEvent.current), startWith(this.activeId)),
                    this._wrap$, this.slides.changes.pipe(startWith(null))
                ])
                    .pipe(map(([currentSlideId, wrap]) => {
                    const slideArr = this.slides.toArray();
                    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
                    return wrap ? slideArr.length > 1 : currentSlideIdx < slideArr.length - 1;
                }), distinctUntilChanged());
                combineLatest([
                    this._pause$, this._pauseOnHover$, this._mouseHover$, this._pauseOnFocus$, this._focused$, this._interval$,
                    hasNextSlide$
                ])
                    .pipe(map(([pause, pauseOnHover, mouseHover, pauseOnFocus, focused, interval, hasNextSlide]) => ((pause || (pauseOnHover && mouseHover) || (pauseOnFocus && focused) || !hasNextSlide) ?
                    0 :
                    interval)), distinctUntilChanged(), switchMap(interval => interval > 0 ? timer(interval, interval) : NEVER), takeUntil(this._destroy$))
                    .subscribe(() => this._ngZone.run(() => this.next(NgbSlideEventSource.TIMER)));
            });
        }
        this.slides.changes.pipe(takeUntil(this._destroy$)).subscribe(() => this._cd.markForCheck());
    }
    ngAfterContentChecked() {
        let activeSlide = this._getSlideById(this.activeId);
        this.activeId = activeSlide ? activeSlide.id : (this.slides.length ? this.slides.first.id : '');
    }
    ngAfterViewInit() {
        // Initialize the 'active' class (not managed by the template)
        if (this.activeId) {
            const element = this._getSlideElement(this.activeId);
            if (element) {
                element.classList.add('active');
            }
        }
    }
    ngOnDestroy() { this._destroy$.next(); }
    /**
     * Navigates to a slide with the specified identifier.
     */
    select(slideId, source) {
        this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source);
    }
    /**
     * Navigates to the previous slide.
     */
    prev(source) {
        this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.RIGHT, source);
    }
    /**
     * Navigates to the next slide.
     */
    next(source) {
        this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.LEFT, source);
    }
    /**
     * Pauses cycling through the slides.
     */
    pause() { this._pause$.next(true); }
    /**
     * Restarts cycling through the slides from left to right.
     */
    cycle() { this._pause$.next(false); }
    /**
     * Set the focus on the carousel.
     */
    focus() { this._container.nativeElement.focus(); }
    _cycleToSelected(slideIdx, direction, source) {
        const transitionIds = this._transitionIds;
        if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) {
            // Revert prevented
            return;
        }
        let selectedSlide = this._getSlideById(slideIdx);
        if (selectedSlide && selectedSlide.id !== this.activeId) {
            this._transitionIds = [this.activeId, slideIdx];
            this.slide.emit({ prev: this.activeId, current: selectedSlide.id, direction: direction, paused: this._pause$.value, source });
            const options = {
                animation: this.animation,
                runningTransition: 'stop',
                context: { direction },
            };
            const transitions = [];
            const activeSlide = this._getSlideById(this.activeId);
            if (activeSlide) {
                const activeSlideTransition = ngbRunTransition(this._getSlideElement(activeSlide.id), ngbCarouselTransitionOut, options);
                activeSlideTransition.subscribe(() => { activeSlide.slid.emit({ isShown: false, direction, source }); });
                transitions.push(activeSlideTransition);
            }
            const previousId = this.activeId;
            this.activeId = selectedSlide.id;
            const nextSlide = this._getSlideById(this.activeId);
            const transition = ngbRunTransition(this._getSlideElement(selectedSlide.id), ngbCarouselTransitionIn, options);
            transition.subscribe(() => { nextSlide === null || nextSlide === void 0 ? void 0 : nextSlide.slid.emit({ isShown: true, direction, source }); });
            transitions.push(transition);
            zip(...transitions).pipe(take(1)).subscribe(() => {
                this._transitionIds = null;
                this.slid.emit({ prev: previousId, current: selectedSlide.id, direction: direction, paused: this._pause$.value, source });
            });
        }
        // we get here after the interval fires or any external API call like next(), prev() or select()
        this._cd.markForCheck();
    }
    _getSlideEventDirection(currentActiveSlideId, nextActiveSlideId) {
        const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
        const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);
        return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.RIGHT : NgbSlideEventDirection.LEFT;
    }
    _getSlideById(slideId) {
        return this.slides.find(slide => slide.id === slideId) || null;
    }
    _getSlideIdxById(slideId) {
        const slide = this._getSlideById(slideId);
        return slide != null ? this.slides.toArray().indexOf(slide) : -1;
    }
    _getNextSlide(currentSlideId) {
        const slideArr = this.slides.toArray();
        const currentSlideIdx = this._getSlideIdxById(currentSlideId);
        const isLastSlide = currentSlideIdx === slideArr.length - 1;
        return isLastSlide ? (this.wrap ? slideArr[0].id : slideArr[slideArr.length - 1].id) :
            slideArr[currentSlideIdx + 1].id;
    }
    _getPrevSlide(currentSlideId) {
        const slideArr = this.slides.toArray();
        const currentSlideIdx = this._getSlideIdxById(currentSlideId);
        const isFirstSlide = currentSlideIdx === 0;
        return isFirstSlide ? (this.wrap ? slideArr[slideArr.length - 1].id : slideArr[0].id) :
            slideArr[currentSlideIdx - 1].id;
    }
    _getSlideElement(slideId) {
        return this._container.nativeElement.querySelector(`#slide-${slideId}`);
    }
}
NgbCarousel.decorators = [
    { type: Component, args: [{
                selector: 'ngb-carousel',
                exportAs: 'ngbCarousel',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                host: {
                    'class': 'carousel slide',
                    '[style.display]': '"block"',
                    'tabIndex': '0',
                    '(keydown.arrowLeft)': 'keyboard && arrowLeft()',
                    '(keydown.arrowRight)': 'keyboard && arrowRight()',
                    '(mouseenter)': 'mouseHover = true',
                    '(mouseleave)': 'mouseHover = false',
                    '(focusin)': 'focused = true',
                    '(focusout)': 'focused = false',
                    '[attr.aria-activedescendant]': 'activeId'
                },
                template: `
    <ol class="carousel-indicators" [class.sr-only]="!showNavigationIndicators" role="tablist">
      <li *ngFor="let slide of slides" [class.active]="slide.id === activeId"
          role="tab" [attr.aria-labelledby]="'slide-' + slide.id" [attr.aria-controls]="'slide-' + slide.id"
          [attr.aria-selected]="slide.id === activeId"
          (click)="focus();select(slide.id, NgbSlideEventSource.INDICATOR);"></li>
    </ol>
    <div class="carousel-inner">
      <div *ngFor="let slide of slides; index as i; count as c" class="carousel-item" [id]="'slide-' + slide.id" role="tabpanel">
        <span class="sr-only" i18n="Currently selected slide number read by screen reader@@ngb.carousel.slide-number">
          Slide {{i + 1}} of {{c}}
        </span>
        <ng-template [ngTemplateOutlet]="slide.tplRef"></ng-template>
      </div>
    </div>
    <a class="carousel-control-prev" role="button" (click)="arrowLeft()" *ngIf="showNavigationArrows">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only" i18n="@@ngb.carousel.previous">Previous</span>
    </a>
    <a class="carousel-control-next" role="button" (click)="arrowRight()" *ngIf="showNavigationArrows">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only" i18n="@@ngb.carousel.next">Next</span>
    </a>
  `
            },] }
];
NgbCarousel.ctorParameters = () => [
    { type: NgbCarouselConfig },
    { type: undefined, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: ElementRef }
];
NgbCarousel.propDecorators = {
    slides: [{ type: ContentChildren, args: [NgbSlide,] }],
    animation: [{ type: Input }],
    activeId: [{ type: Input }],
    interval: [{ type: Input }],
    wrap: [{ type: Input }],
    keyboard: [{ type: Input }],
    pauseOnHover: [{ type: Input }],
    pauseOnFocus: [{ type: Input }],
    showNavigationArrows: [{ type: Input }],
    showNavigationIndicators: [{ type: Input }],
    slide: [{ type: Output }],
    slid: [{ type: Output }]
};
export var NgbSlideEventSource;
(function (NgbSlideEventSource) {
    NgbSlideEventSource["TIMER"] = "timer";
    NgbSlideEventSource["ARROW_LEFT"] = "arrowLeft";
    NgbSlideEventSource["ARROW_RIGHT"] = "arrowRight";
    NgbSlideEventSource["INDICATOR"] = "indicator";
})(NgbSlideEventSource || (NgbSlideEventSource = {}));
export const NGB_CAROUSEL_DIRECTIVES = [NgbCarousel, NgbSlide];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbImNhcm91c2VsL2Nhcm91c2VsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxlQUFlLEVBQ2YsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBRU4sTUFBTSxFQUNOLFdBQVcsRUFFWCxXQUFXLEVBQ1gsaUJBQWlCLEVBRWxCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRWxELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBYyxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM1RixPQUFPLEVBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hHLE9BQU8sRUFBQyxnQkFBZ0IsRUFBdUIsTUFBTSxrQ0FBa0MsQ0FBQztBQUN4RixPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLHdCQUF3QixFQUN4QixzQkFBc0IsRUFFdkIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFFZjs7R0FFRztBQUVILE1BQU0sT0FBTyxRQUFRO0lBZW5CLFlBQW1CLE1BQXdCO1FBQXhCLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBZDNDOzs7O1dBSUc7UUFDTSxPQUFFLEdBQUcsYUFBYSxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBRXRDOzs7O1dBSUc7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LEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsZ0JBQWdCO29CQUN6QixpQkFBaUIsRUFBRSxTQUFTO29CQUM1QixVQUFVLEVBQUUsR0FBRztvQkFDZixxQkFBcUIsRUFBRSx5QkFBeUI7b0JBQ2hELHNCQUFzQixFQUFFLDBCQUEwQjtvQkFDbEQsY0FBYyxFQUFFLG1CQUFtQjtvQkFDbkMsY0FBYyxFQUFFLG9CQUFvQjtvQkFDcEMsV0FBVyxFQUFFLGdCQUFnQjtvQkFDN0IsWUFBWSxFQUFFLGlCQUFpQjtvQkFDL0IsOEJBQThCLEVBQUUsVUFBVTtpQkFDM0M7Z0JBQ0QsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCVDthQUNGOzs7WUFsRk8saUJBQWlCOzRDQTRNUyxNQUFNLFNBQUMsV0FBVztZQXZObEQsTUFBTTtZQVJOLGlCQUFpQjtZQUlqQixVQUFVOzs7cUJBb0dULGVBQWUsU0FBQyxRQUFRO3dCQWtCeEIsS0FBSzt1QkFPTCxLQUFLO3VCQUtMLEtBQUs7bUJBVUwsS0FBSzt1QkFVTCxLQUFLOzJCQU9MLEtBQUs7MkJBVUwsS0FBSzttQ0FZTCxLQUFLO3VDQU9MLEtBQUs7b0JBT0wsTUFBTTttQkFTTixNQUFNOztBQXNSVCxNQUFNLENBQU4sSUFBWSxtQkFLWDtBQUxELFdBQVksbUJBQW1CO0lBQzdCLHNDQUFlLENBQUE7SUFDZiwrQ0FBd0IsQ0FBQTtJQUN4QixpREFBMEIsQ0FBQTtJQUMxQiw4Q0FBdUIsQ0FBQTtBQUN6QixDQUFDLEVBTFcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQUs5QjtBQUVELE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFBMQVRGT1JNX0lELFxuICBRdWVyeUxpc3QsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgQWZ0ZXJWaWV3SW5pdFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7aXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7TmdiQ2Fyb3VzZWxDb25maWd9IGZyb20gJy4vY2Fyb3VzZWwtY29uZmlnJztcblxuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIGNvbWJpbmVMYXRlc3QsIE5FVkVSLCBPYnNlcnZhYmxlLCBTdWJqZWN0LCB0aW1lciwgemlwfSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZGlzdGluY3RVbnRpbENoYW5nZWQsIG1hcCwgc3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtuZ2JSdW5UcmFuc2l0aW9uLCBOZ2JUcmFuc2l0aW9uT3B0aW9uc30gZnJvbSAnLi4vdXRpbC90cmFuc2l0aW9uL25nYlRyYW5zaXRpb24nO1xuaW1wb3J0IHtcbiAgbmdiQ2Fyb3VzZWxUcmFuc2l0aW9uSW4sXG4gIG5nYkNhcm91c2VsVHJhbnNpdGlvbk91dCxcbiAgTmdiU2xpZGVFdmVudERpcmVjdGlvbixcbiAgTmdiQ2Fyb3VzZWxDdHhcbn0gZnJvbSAnLi9jYXJvdXNlbC10cmFuc2l0aW9uJztcblxubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgaW5kaXZpZHVhbCBjYXJvdXNlbCBzbGlkZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JTbGlkZV0nfSlcbmV4cG9ydCBjbGFzcyBOZ2JTbGlkZSB7XG4gIC8qKlxuICAgKiBTbGlkZSBpZCB0aGF0IG11c3QgYmUgdW5pcXVlIGZvciB0aGUgZW50aXJlIGRvY3VtZW50LlxuICAgKlxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHdpbGwgYmUgZ2VuZXJhdGVkIGluIHRoZSBgbmdiLXNsaWRlLXh4YCBmb3JtYXQuXG4gICAqL1xuICBASW5wdXQoKSBpZCA9IGBuZ2Itc2xpZGUtJHtuZXh0SWQrK31gO1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBlbWl0dGVkIHdoZW4gdGhlIHNsaWRlIHRyYW5zaXRpb24gaXMgZmluaXNoZWRcbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2xpZCA9IG5ldyBFdmVudEVtaXR0ZXI8TmdiU2luZ2xlU2xpZGVFdmVudD4oKTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHBsUmVmOiBUZW1wbGF0ZVJlZjxhbnk+KSB7fVxufVxuXG4vKipcbiAqIENhcm91c2VsIGlzIGEgY29tcG9uZW50IHRvIGVhc2lseSBjcmVhdGUgYW5kIGNvbnRyb2wgc2xpZGVzaG93cy5cbiAqXG4gKiBBbGxvd3MgdG8gc2V0IGludGVydmFscywgY2hhbmdlIHRoZSB3YXkgdXNlciBpbnRlcmFjdHMgd2l0aCB0aGUgc2xpZGVzIGFuZCBwcm92aWRlcyBhIHByb2dyYW1tYXRpYyBBUEkuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nYi1jYXJvdXNlbCcsXG4gIGV4cG9ydEFzOiAnbmdiQ2Fyb3VzZWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjYXJvdXNlbCBzbGlkZScsXG4gICAgJ1tzdHlsZS5kaXNwbGF5XSc6ICdcImJsb2NrXCInLFxuICAgICd0YWJJbmRleCc6ICcwJyxcbiAgICAnKGtleWRvd24uYXJyb3dMZWZ0KSc6ICdrZXlib2FyZCAmJiBhcnJvd0xlZnQoKScsXG4gICAgJyhrZXlkb3duLmFycm93UmlnaHQpJzogJ2tleWJvYXJkICYmIGFycm93UmlnaHQoKScsXG4gICAgJyhtb3VzZWVudGVyKSc6ICdtb3VzZUhvdmVyID0gdHJ1ZScsXG4gICAgJyhtb3VzZWxlYXZlKSc6ICdtb3VzZUhvdmVyID0gZmFsc2UnLFxuICAgICcoZm9jdXNpbiknOiAnZm9jdXNlZCA9IHRydWUnLFxuICAgICcoZm9jdXNvdXQpJzogJ2ZvY3VzZWQgPSBmYWxzZScsXG4gICAgJ1thdHRyLmFyaWEtYWN0aXZlZGVzY2VuZGFudF0nOiAnYWN0aXZlSWQnXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPG9sIGNsYXNzPVwiY2Fyb3VzZWwtaW5kaWNhdG9yc1wiIFtjbGFzcy5zci1vbmx5XT1cIiFzaG93TmF2aWdhdGlvbkluZGljYXRvcnNcIiByb2xlPVwidGFibGlzdFwiPlxuICAgICAgPGxpICpuZ0Zvcj1cImxldCBzbGlkZSBvZiBzbGlkZXNcIiBbY2xhc3MuYWN0aXZlXT1cInNsaWRlLmlkID09PSBhY3RpdmVJZFwiXG4gICAgICAgICAgcm9sZT1cInRhYlwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCInc2xpZGUtJyArIHNsaWRlLmlkXCIgW2F0dHIuYXJpYS1jb250cm9sc109XCInc2xpZGUtJyArIHNsaWRlLmlkXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLXNlbGVjdGVkXT1cInNsaWRlLmlkID09PSBhY3RpdmVJZFwiXG4gICAgICAgICAgKGNsaWNrKT1cImZvY3VzKCk7c2VsZWN0KHNsaWRlLmlkLCBOZ2JTbGlkZUV2ZW50U291cmNlLklORElDQVRPUik7XCI+PC9saT5cbiAgICA8L29sPlxuICAgIDxkaXYgY2xhc3M9XCJjYXJvdXNlbC1pbm5lclwiPlxuICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgc2xpZGUgb2Ygc2xpZGVzOyBpbmRleCBhcyBpOyBjb3VudCBhcyBjXCIgY2xhc3M9XCJjYXJvdXNlbC1pdGVtXCIgW2lkXT1cIidzbGlkZS0nICsgc2xpZGUuaWRcIiByb2xlPVwidGFicGFuZWxcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCIgaTE4bj1cIkN1cnJlbnRseSBzZWxlY3RlZCBzbGlkZSBudW1iZXIgcmVhZCBieSBzY3JlZW4gcmVhZGVyQEBuZ2IuY2Fyb3VzZWwuc2xpZGUtbnVtYmVyXCI+XG4gICAgICAgICAgU2xpZGUge3tpICsgMX19IG9mIHt7Y319XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInNsaWRlLnRwbFJlZlwiPjwvbmctdGVtcGxhdGU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8YSBjbGFzcz1cImNhcm91c2VsLWNvbnRyb2wtcHJldlwiIHJvbGU9XCJidXR0b25cIiAoY2xpY2spPVwiYXJyb3dMZWZ0KClcIiAqbmdJZj1cInNob3dOYXZpZ2F0aW9uQXJyb3dzXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImNhcm91c2VsLWNvbnRyb2wtcHJldi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCIgaTE4bj1cIkBAbmdiLmNhcm91c2VsLnByZXZpb3VzXCI+UHJldmlvdXM8L3NwYW4+XG4gICAgPC9hPlxuICAgIDxhIGNsYXNzPVwiY2Fyb3VzZWwtY29udHJvbC1uZXh0XCIgcm9sZT1cImJ1dHRvblwiIChjbGljayk9XCJhcnJvd1JpZ2h0KClcIiAqbmdJZj1cInNob3dOYXZpZ2F0aW9uQXJyb3dzXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImNhcm91c2VsLWNvbnRyb2wtbmV4dC1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCIgaTE4bj1cIkBAbmdiLmNhcm91c2VsLm5leHRcIj5OZXh0PC9zcGFuPlxuICAgIDwvYT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBOZ2JDYXJvdXNlbCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQsXG4gICAgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgQENvbnRlbnRDaGlsZHJlbihOZ2JTbGlkZSkgc2xpZGVzOiBRdWVyeUxpc3Q8TmdiU2xpZGU+O1xuXG4gIHB1YmxpYyBOZ2JTbGlkZUV2ZW50U291cmNlID0gTmdiU2xpZGVFdmVudFNvdXJjZTtcblxuICBwcml2YXRlIF9kZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByaXZhdGUgX2ludGVydmFsJCA9IG5ldyBCZWhhdmlvclN1YmplY3QoMCk7XG4gIHByaXZhdGUgX21vdXNlSG92ZXIkID0gbmV3IEJlaGF2aW9yU3ViamVjdChmYWxzZSk7XG4gIHByaXZhdGUgX2ZvY3VzZWQkID0gbmV3IEJlaGF2aW9yU3ViamVjdChmYWxzZSk7XG4gIHByaXZhdGUgX3BhdXNlT25Ib3ZlciQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGZhbHNlKTtcbiAgcHJpdmF0ZSBfcGF1c2VPbkZvY3VzJCA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UpO1xuICBwcml2YXRlIF9wYXVzZSQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGZhbHNlKTtcbiAgcHJpdmF0ZSBfd3JhcCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGZhbHNlKTtcblxuICAvKipcbiAgICogQSBmbGFnIHRvIGVuYWJsZS9kaXNhYmxlIHRoZSBhbmltYXRpb25zLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGFuaW1hdGlvbjogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIHNsaWRlIGlkIHRoYXQgc2hvdWxkIGJlIGRpc3BsYXllZCAqKmluaXRpYWxseSoqLlxuICAgKlxuICAgKiBGb3Igc3Vic2VxdWVudCBpbnRlcmFjdGlvbnMgdXNlIG1ldGhvZHMgYHNlbGVjdCgpYCwgYG5leHQoKWAsIGV0Yy4gYW5kIHRoZSBgKHNsaWRlKWAgb3V0cHV0LlxuICAgKi9cbiAgQElucHV0KCkgYWN0aXZlSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBuZXh0IHNsaWRlIGlzIHNob3duLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGludGVydmFsKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9pbnRlcnZhbCQubmV4dCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgaW50ZXJ2YWwoKSB7IHJldHVybiB0aGlzLl9pbnRlcnZhbCQudmFsdWU7IH1cblxuICAvKipcbiAgICogSWYgYHRydWVgLCB3aWxsICd3cmFwJyB0aGUgY2Fyb3VzZWwgYnkgc3dpdGNoaW5nIGZyb20gdGhlIGxhc3Qgc2xpZGUgYmFjayB0byB0aGUgZmlyc3QuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgd3JhcCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3dyYXAkLm5leHQodmFsdWUpO1xuICB9XG5cbiAgZ2V0IHdyYXAoKSB7IHJldHVybiB0aGlzLl93cmFwJC52YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIGFsbG93cyB0byBpbnRlcmFjdCB3aXRoIGNhcm91c2VsIHVzaW5nIGtleWJvYXJkICdhcnJvdyBsZWZ0JyBhbmQgJ2Fycm93IHJpZ2h0Jy5cbiAgICovXG4gIEBJbnB1dCgpIGtleWJvYXJkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHdpbGwgcGF1c2Ugc2xpZGUgc3dpdGNoaW5nIHdoZW4gbW91c2UgY3Vyc29yIGhvdmVycyB0aGUgc2xpZGUuXG4gICAqXG4gICAqIEBzaW5jZSAyLjIuMFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHBhdXNlT25Ib3Zlcih2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3BhdXNlT25Ib3ZlciQubmV4dCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgcGF1c2VPbkhvdmVyKCkgeyByZXR1cm4gdGhpcy5fcGF1c2VPbkhvdmVyJC52YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHdpbGwgcGF1c2Ugc2xpZGUgc3dpdGNoaW5nIHdoZW4gdGhlIGZvY3VzIGlzIGluc2lkZSB0aGUgY2Fyb3VzZWwuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgcGF1c2VPbkZvY3VzKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fcGF1c2VPbkZvY3VzJC5uZXh0KHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYXVzZU9uRm9jdXMoKSB7IHJldHVybiB0aGlzLl9wYXVzZU9uRm9jdXMkLnZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgJ3ByZXZpb3VzJyBhbmQgJ25leHQnIG5hdmlnYXRpb24gYXJyb3dzIHdpbGwgYmUgdmlzaWJsZSBvbiB0aGUgc2xpZGUuXG4gICAqXG4gICAqIEBzaW5jZSAyLjIuMFxuICAgKi9cbiAgQElucHV0KCkgc2hvd05hdmlnYXRpb25BcnJvd3M6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgbmF2aWdhdGlvbiBpbmRpY2F0b3JzIGF0IHRoZSBib3R0b20gb2YgdGhlIHNsaWRlIHdpbGwgYmUgdmlzaWJsZS5cbiAgICpcbiAgICogQHNpbmNlIDIuMi4wXG4gICAqL1xuICBASW5wdXQoKSBzaG93TmF2aWdhdGlvbkluZGljYXRvcnM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQganVzdCBiZWZvcmUgdGhlIHNsaWRlIHRyYW5zaXRpb24gc3RhcnRzLlxuICAgKlxuICAgKiBTZWUgW2BOZ2JTbGlkZUV2ZW50YF0oIy9jb21wb25lbnRzL2Nhcm91c2VsL2FwaSNOZ2JTbGlkZUV2ZW50KSBmb3IgcGF5bG9hZCBkZXRhaWxzLlxuICAgKi9cbiAgQE91dHB1dCgpIHNsaWRlID0gbmV3IEV2ZW50RW1pdHRlcjxOZ2JTbGlkZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBlbWl0dGVkIHJpZ2h0IGFmdGVyIHRoZSBzbGlkZSB0cmFuc2l0aW9uIGlzIGNvbXBsZXRlZC5cbiAgICpcbiAgICogU2VlIFtgTmdiU2xpZGVFdmVudGBdKCMvY29tcG9uZW50cy9jYXJvdXNlbC9hcGkjTmdiU2xpZGVFdmVudCkgZm9yIHBheWxvYWQgZGV0YWlscy5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2xpZCA9IG5ldyBFdmVudEVtaXR0ZXI8TmdiU2xpZGVFdmVudD4oKTtcblxuICAvKlxuICAgKiBLZWVwIHRoZSBpZHMgb2YgdGhlIHBhbmVscyBjdXJyZW50bHkgdHJhbnNpdGlvbm5pbmdcbiAgICogaW4gb3JkZXIgdG8gYWxsb3cgb25seSB0aGUgdHJhbnNpdGlvbiByZXZlcnRpb25cbiAgICovXG4gIHByaXZhdGUgX3RyYW5zaXRpb25JZHM6IFtzdHJpbmcsIHN0cmluZ10gfCBudWxsID0gbnVsbDtcblxuICBzZXQgbW91c2VIb3Zlcih2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9tb3VzZUhvdmVyJC5uZXh0KHZhbHVlKTsgfVxuXG4gIGdldCBtb3VzZUhvdmVyKCkgeyByZXR1cm4gdGhpcy5fbW91c2VIb3ZlciQudmFsdWU7IH1cblxuICBzZXQgZm9jdXNlZCh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9mb2N1c2VkJC5uZXh0KHZhbHVlKTsgfVxuXG4gIGdldCBmb2N1c2VkKCkgeyByZXR1cm4gdGhpcy5fZm9jdXNlZCQudmFsdWU7IH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNvbmZpZzogTmdiQ2Fyb3VzZWxDb25maWcsIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgX3BsYXRmb3JtSWQsIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgICAgcHJpdmF0ZSBfY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIF9jb250YWluZXI6IEVsZW1lbnRSZWYpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gICAgdGhpcy5pbnRlcnZhbCA9IGNvbmZpZy5pbnRlcnZhbDtcbiAgICB0aGlzLndyYXAgPSBjb25maWcud3JhcDtcbiAgICB0aGlzLmtleWJvYXJkID0gY29uZmlnLmtleWJvYXJkO1xuICAgIHRoaXMucGF1c2VPbkhvdmVyID0gY29uZmlnLnBhdXNlT25Ib3ZlcjtcbiAgICB0aGlzLnBhdXNlT25Gb2N1cyA9IGNvbmZpZy5wYXVzZU9uRm9jdXM7XG4gICAgdGhpcy5zaG93TmF2aWdhdGlvbkFycm93cyA9IGNvbmZpZy5zaG93TmF2aWdhdGlvbkFycm93cztcbiAgICB0aGlzLnNob3dOYXZpZ2F0aW9uSW5kaWNhdG9ycyA9IGNvbmZpZy5zaG93TmF2aWdhdGlvbkluZGljYXRvcnM7XG4gIH1cblxuICBhcnJvd0xlZnQoKSB7XG4gICAgdGhpcy5mb2N1cygpO1xuICAgIHRoaXMucHJldihOZ2JTbGlkZUV2ZW50U291cmNlLkFSUk9XX0xFRlQpO1xuICB9XG5cbiAgYXJyb3dSaWdodCgpIHtcbiAgICB0aGlzLmZvY3VzKCk7XG4gICAgdGhpcy5uZXh0KE5nYlNsaWRlRXZlbnRTb3VyY2UuQVJST1dfUklHSFQpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIC8vIHNldEludGVydmFsKCkgZG9lc24ndCBwbGF5IHdlbGwgd2l0aCBTU1IgYW5kIHByb3RyYWN0b3IsXG4gICAgLy8gc28gd2Ugc2hvdWxkIHJ1biBpdCBpbiB0aGUgYnJvd3NlciBhbmQgb3V0c2lkZSBBbmd1bGFyXG4gICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMuX3BsYXRmb3JtSWQpKSB7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYXNOZXh0U2xpZGUkID0gY29tYmluZUxhdGVzdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2xpZGUucGlwZShtYXAoc2xpZGVFdmVudCA9PiBzbGlkZUV2ZW50LmN1cnJlbnQpLCBzdGFydFdpdGgodGhpcy5hY3RpdmVJZCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwJCwgdGhpcy5zbGlkZXMuY2hhbmdlcy5waXBlKHN0YXJ0V2l0aChudWxsKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcCgoW2N1cnJlbnRTbGlkZUlkLCB3cmFwXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNsaWRlQXJyID0gdGhpcy5zbGlkZXMudG9BcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTbGlkZUlkeCA9IHRoaXMuX2dldFNsaWRlSWR4QnlJZChjdXJyZW50U2xpZGVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdyYXAgPyBzbGlkZUFyci5sZW5ndGggPiAxIDogY3VycmVudFNsaWRlSWR4IDwgc2xpZGVBcnIubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuICAgICAgICBjb21iaW5lTGF0ZXN0KFtcbiAgICAgICAgICB0aGlzLl9wYXVzZSQsIHRoaXMuX3BhdXNlT25Ib3ZlciQsIHRoaXMuX21vdXNlSG92ZXIkLCB0aGlzLl9wYXVzZU9uRm9jdXMkLCB0aGlzLl9mb2N1c2VkJCwgdGhpcy5faW50ZXJ2YWwkLFxuICAgICAgICAgIGhhc05leHRTbGlkZSRcbiAgICAgICAgXSlcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgoW3BhdXNlLCBwYXVzZU9uSG92ZXIsIG1vdXNlSG92ZXIsIHBhdXNlT25Gb2N1cywgZm9jdXNlZCwgaW50ZXJ2YWwsXG4gICAgICAgICAgICAgICAgICAgICAgaGFzTmV4dFNsaWRlXTogW2Jvb2xlYW4sIGJvb2xlYW4sIGJvb2xlYW4sIGJvb2xlYW4sIGJvb2xlYW4sIG51bWJlciwgYm9vbGVhbl0pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAoKHBhdXNlIHx8IChwYXVzZU9uSG92ZXIgJiYgbW91c2VIb3ZlcikgfHwgKHBhdXNlT25Gb2N1cyAmJiBmb2N1c2VkKSB8fCAhaGFzTmV4dFNsaWRlKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCkpLFxuXG4gICAgICAgICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSwgc3dpdGNoTWFwKGludGVydmFsID0+IGludGVydmFsID4gMCA/IHRpbWVyKGludGVydmFsLCBpbnRlcnZhbCkgOiBORVZFUiksXG4gICAgICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLm5leHQoTmdiU2xpZGVFdmVudFNvdXJjZS5USU1FUikpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuc2xpZGVzLmNoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fY2QubWFya0ZvckNoZWNrKCkpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCkge1xuICAgIGxldCBhY3RpdmVTbGlkZSA9IHRoaXMuX2dldFNsaWRlQnlJZCh0aGlzLmFjdGl2ZUlkKTtcbiAgICB0aGlzLmFjdGl2ZUlkID0gYWN0aXZlU2xpZGUgPyBhY3RpdmVTbGlkZS5pZCA6ICh0aGlzLnNsaWRlcy5sZW5ndGggPyB0aGlzLnNsaWRlcy5maXJzdC5pZCA6ICcnKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSAnYWN0aXZlJyBjbGFzcyAobm90IG1hbmFnZWQgYnkgdGhlIHRlbXBsYXRlKVxuICAgIGlmICh0aGlzLmFjdGl2ZUlkKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZ2V0U2xpZGVFbGVtZW50KHRoaXMuYWN0aXZlSWQpO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHsgdGhpcy5fZGVzdHJveSQubmV4dCgpOyB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byBhIHNsaWRlIHdpdGggdGhlIHNwZWNpZmllZCBpZGVudGlmaWVyLlxuICAgKi9cbiAgc2VsZWN0KHNsaWRlSWQ6IHN0cmluZywgc291cmNlPzogTmdiU2xpZGVFdmVudFNvdXJjZSkge1xuICAgIHRoaXMuX2N5Y2xlVG9TZWxlY3RlZChzbGlkZUlkLCB0aGlzLl9nZXRTbGlkZUV2ZW50RGlyZWN0aW9uKHRoaXMuYWN0aXZlSWQsIHNsaWRlSWQpLCBzb3VyY2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byB0aGUgcHJldmlvdXMgc2xpZGUuXG4gICAqL1xuICBwcmV2KHNvdXJjZT86IE5nYlNsaWRlRXZlbnRTb3VyY2UpIHtcbiAgICB0aGlzLl9jeWNsZVRvU2VsZWN0ZWQodGhpcy5fZ2V0UHJldlNsaWRlKHRoaXMuYWN0aXZlSWQpLCBOZ2JTbGlkZUV2ZW50RGlyZWN0aW9uLlJJR0hULCBzb3VyY2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byB0aGUgbmV4dCBzbGlkZS5cbiAgICovXG4gIG5leHQoc291cmNlPzogTmdiU2xpZGVFdmVudFNvdXJjZSkge1xuICAgIHRoaXMuX2N5Y2xlVG9TZWxlY3RlZCh0aGlzLl9nZXROZXh0U2xpZGUodGhpcy5hY3RpdmVJZCksIE5nYlNsaWRlRXZlbnREaXJlY3Rpb24uTEVGVCwgc291cmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZXMgY3ljbGluZyB0aHJvdWdoIHRoZSBzbGlkZXMuXG4gICAqL1xuICBwYXVzZSgpIHsgdGhpcy5fcGF1c2UkLm5leHQodHJ1ZSk7IH1cblxuICAvKipcbiAgICogUmVzdGFydHMgY3ljbGluZyB0aHJvdWdoIHRoZSBzbGlkZXMgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxuICAgKi9cbiAgY3ljbGUoKSB7IHRoaXMuX3BhdXNlJC5uZXh0KGZhbHNlKTsgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZvY3VzIG9uIHRoZSBjYXJvdXNlbC5cbiAgICovXG4gIGZvY3VzKCkgeyB0aGlzLl9jb250YWluZXIubmF0aXZlRWxlbWVudC5mb2N1cygpOyB9XG5cbiAgcHJpdmF0ZSBfY3ljbGVUb1NlbGVjdGVkKHNsaWRlSWR4OiBzdHJpbmcsIGRpcmVjdGlvbjogTmdiU2xpZGVFdmVudERpcmVjdGlvbiwgc291cmNlPzogTmdiU2xpZGVFdmVudFNvdXJjZSkge1xuICAgIGNvbnN0IHRyYW5zaXRpb25JZHMgPSB0aGlzLl90cmFuc2l0aW9uSWRzO1xuICAgIGlmICh0cmFuc2l0aW9uSWRzICYmICh0cmFuc2l0aW9uSWRzWzBdICE9PSBzbGlkZUlkeCB8fCB0cmFuc2l0aW9uSWRzWzFdICE9PSB0aGlzLmFjdGl2ZUlkKSkge1xuICAgICAgLy8gUmV2ZXJ0IHByZXZlbnRlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZWxlY3RlZFNsaWRlID0gdGhpcy5fZ2V0U2xpZGVCeUlkKHNsaWRlSWR4KTtcbiAgICBpZiAoc2VsZWN0ZWRTbGlkZSAmJiBzZWxlY3RlZFNsaWRlLmlkICE9PSB0aGlzLmFjdGl2ZUlkKSB7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uSWRzID0gW3RoaXMuYWN0aXZlSWQsIHNsaWRlSWR4XTtcbiAgICAgIHRoaXMuc2xpZGUuZW1pdChcbiAgICAgICAgICB7cHJldjogdGhpcy5hY3RpdmVJZCwgY3VycmVudDogc2VsZWN0ZWRTbGlkZS5pZCwgZGlyZWN0aW9uOiBkaXJlY3Rpb24sIHBhdXNlZDogdGhpcy5fcGF1c2UkLnZhbHVlLCBzb3VyY2V9KTtcblxuICAgICAgY29uc3Qgb3B0aW9uczogTmdiVHJhbnNpdGlvbk9wdGlvbnM8TmdiQ2Fyb3VzZWxDdHg+ID0ge1xuICAgICAgICBhbmltYXRpb246IHRoaXMuYW5pbWF0aW9uLFxuICAgICAgICBydW5uaW5nVHJhbnNpdGlvbjogJ3N0b3AnLFxuICAgICAgICBjb250ZXh0OiB7ZGlyZWN0aW9ufSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHRyYW5zaXRpb25zOiBBcnJheTxPYnNlcnZhYmxlPGFueT4+ID0gW107XG4gICAgICBjb25zdCBhY3RpdmVTbGlkZSA9IHRoaXMuX2dldFNsaWRlQnlJZCh0aGlzLmFjdGl2ZUlkKTtcbiAgICAgIGlmIChhY3RpdmVTbGlkZSkge1xuICAgICAgICBjb25zdCBhY3RpdmVTbGlkZVRyYW5zaXRpb24gPVxuICAgICAgICAgICAgbmdiUnVuVHJhbnNpdGlvbih0aGlzLl9nZXRTbGlkZUVsZW1lbnQoYWN0aXZlU2xpZGUuaWQpLCBuZ2JDYXJvdXNlbFRyYW5zaXRpb25PdXQsIG9wdGlvbnMpO1xuICAgICAgICBhY3RpdmVTbGlkZVRyYW5zaXRpb24uc3Vic2NyaWJlKCgpID0+IHsgYWN0aXZlU2xpZGUuc2xpZC5lbWl0KHtpc1Nob3duOiBmYWxzZSwgZGlyZWN0aW9uLCBzb3VyY2V9KTsgfSk7XG4gICAgICAgIHRyYW5zaXRpb25zLnB1c2goYWN0aXZlU2xpZGVUcmFuc2l0aW9uKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJldmlvdXNJZCA9IHRoaXMuYWN0aXZlSWQ7XG4gICAgICB0aGlzLmFjdGl2ZUlkID0gc2VsZWN0ZWRTbGlkZS5pZDtcbiAgICAgIGNvbnN0IG5leHRTbGlkZSA9IHRoaXMuX2dldFNsaWRlQnlJZCh0aGlzLmFjdGl2ZUlkKTtcbiAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2dldFNsaWRlRWxlbWVudChzZWxlY3RlZFNsaWRlLmlkKSwgbmdiQ2Fyb3VzZWxUcmFuc2l0aW9uSW4sIG9wdGlvbnMpO1xuICAgICAgdHJhbnNpdGlvbi5zdWJzY3JpYmUoKCkgPT4geyBuZXh0U2xpZGUgPy5zbGlkLmVtaXQoe2lzU2hvd246IHRydWUsIGRpcmVjdGlvbiwgc291cmNlfSk7IH0pO1xuICAgICAgdHJhbnNpdGlvbnMucHVzaCh0cmFuc2l0aW9uKTtcblxuICAgICAgemlwKC4uLnRyYW5zaXRpb25zKS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25JZHMgPSBudWxsO1xuICAgICAgICB0aGlzLnNsaWQuZW1pdChcbiAgICAgICAgICAgIHtwcmV2OiBwcmV2aW91c0lkLCBjdXJyZW50OiBzZWxlY3RlZFNsaWRlICEuaWQsIGRpcmVjdGlvbjogZGlyZWN0aW9uLCBwYXVzZWQ6IHRoaXMuX3BhdXNlJC52YWx1ZSwgc291cmNlfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB3ZSBnZXQgaGVyZSBhZnRlciB0aGUgaW50ZXJ2YWwgZmlyZXMgb3IgYW55IGV4dGVybmFsIEFQSSBjYWxsIGxpa2UgbmV4dCgpLCBwcmV2KCkgb3Igc2VsZWN0KClcbiAgICB0aGlzLl9jZC5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFNsaWRlRXZlbnREaXJlY3Rpb24oY3VycmVudEFjdGl2ZVNsaWRlSWQ6IHN0cmluZywgbmV4dEFjdGl2ZVNsaWRlSWQ6IHN0cmluZyk6IE5nYlNsaWRlRXZlbnREaXJlY3Rpb24ge1xuICAgIGNvbnN0IGN1cnJlbnRBY3RpdmVTbGlkZUlkeCA9IHRoaXMuX2dldFNsaWRlSWR4QnlJZChjdXJyZW50QWN0aXZlU2xpZGVJZCk7XG4gICAgY29uc3QgbmV4dEFjdGl2ZVNsaWRlSWR4ID0gdGhpcy5fZ2V0U2xpZGVJZHhCeUlkKG5leHRBY3RpdmVTbGlkZUlkKTtcblxuICAgIHJldHVybiBjdXJyZW50QWN0aXZlU2xpZGVJZHggPiBuZXh0QWN0aXZlU2xpZGVJZHggPyBOZ2JTbGlkZUV2ZW50RGlyZWN0aW9uLlJJR0hUIDogTmdiU2xpZGVFdmVudERpcmVjdGlvbi5MRUZUO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U2xpZGVCeUlkKHNsaWRlSWQ6IHN0cmluZyk6IE5nYlNsaWRlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc2xpZGVzLmZpbmQoc2xpZGUgPT4gc2xpZGUuaWQgPT09IHNsaWRlSWQpIHx8IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRTbGlkZUlkeEJ5SWQoc2xpZGVJZDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCBzbGlkZSA9IHRoaXMuX2dldFNsaWRlQnlJZChzbGlkZUlkKTtcbiAgICByZXR1cm4gc2xpZGUgIT0gbnVsbCA/IHRoaXMuc2xpZGVzLnRvQXJyYXkoKS5pbmRleE9mKHNsaWRlKSA6IC0xO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TmV4dFNsaWRlKGN1cnJlbnRTbGlkZUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNsaWRlQXJyID0gdGhpcy5zbGlkZXMudG9BcnJheSgpO1xuICAgIGNvbnN0IGN1cnJlbnRTbGlkZUlkeCA9IHRoaXMuX2dldFNsaWRlSWR4QnlJZChjdXJyZW50U2xpZGVJZCk7XG4gICAgY29uc3QgaXNMYXN0U2xpZGUgPSBjdXJyZW50U2xpZGVJZHggPT09IHNsaWRlQXJyLmxlbmd0aCAtIDE7XG5cbiAgICByZXR1cm4gaXNMYXN0U2xpZGUgPyAodGhpcy53cmFwID8gc2xpZGVBcnJbMF0uaWQgOiBzbGlkZUFycltzbGlkZUFyci5sZW5ndGggLSAxXS5pZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlQXJyW2N1cnJlbnRTbGlkZUlkeCArIDFdLmlkO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJldlNsaWRlKGN1cnJlbnRTbGlkZUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNsaWRlQXJyID0gdGhpcy5zbGlkZXMudG9BcnJheSgpO1xuICAgIGNvbnN0IGN1cnJlbnRTbGlkZUlkeCA9IHRoaXMuX2dldFNsaWRlSWR4QnlJZChjdXJyZW50U2xpZGVJZCk7XG4gICAgY29uc3QgaXNGaXJzdFNsaWRlID0gY3VycmVudFNsaWRlSWR4ID09PSAwO1xuXG4gICAgcmV0dXJuIGlzRmlyc3RTbGlkZSA/ICh0aGlzLndyYXAgPyBzbGlkZUFycltzbGlkZUFyci5sZW5ndGggLSAxXS5pZCA6IHNsaWRlQXJyWzBdLmlkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlQXJyW2N1cnJlbnRTbGlkZUlkeCAtIDFdLmlkO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U2xpZGVFbGVtZW50KHNsaWRlSWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihgI3NsaWRlLSR7c2xpZGVJZH1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc2xpZGUgY2hhbmdlIGV2ZW50IGVtaXR0ZWQgcmlnaHQgYWZ0ZXIgdGhlIHNsaWRlIHRyYW5zaXRpb24gaXMgY29tcGxldGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlNsaWRlRXZlbnQge1xuICAvKipcbiAgICogVGhlIHByZXZpb3VzIHNsaWRlIGlkLlxuICAgKi9cbiAgcHJldjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBzbGlkZSBpZC5cbiAgICovXG4gIGN1cnJlbnQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIHNsaWRlIGV2ZW50IGRpcmVjdGlvbi5cbiAgICpcbiAgICogUG9zc2libGUgdmFsdWVzIGFyZSBgJ2xlZnQnIHwgJ3JpZ2h0J2AuXG4gICAqL1xuICBkaXJlY3Rpb246IE5nYlNsaWRlRXZlbnREaXJlY3Rpb247XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHBhdXNlKCkgbWV0aG9kIHdhcyBjYWxsZWQgKGFuZCBubyBjeWNsZSgpIGNhbGwgd2FzIGRvbmUgYWZ0ZXJ3YXJkcykuXG4gICAqXG4gICAqIEBzaW5jZSA1LjEuMFxuICAgKi9cbiAgcGF1c2VkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTb3VyY2UgdHJpZ2dlcmluZyB0aGUgc2xpZGUgY2hhbmdlIGV2ZW50LlxuICAgKlxuICAgKiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGAndGltZXInIHwgJ2Fycm93TGVmdCcgfCAnYXJyb3dSaWdodCcgfCAnaW5kaWNhdG9yJ2BcbiAgICpcbiAgICogQHNpbmNlIDUuMS4wXG4gICAqL1xuICBzb3VyY2U/OiBOZ2JTbGlkZUV2ZW50U291cmNlO1xufVxuXG4vKipcbiAqIEEgc2xpZGUgY2hhbmdlIGV2ZW50IGVtaXR0ZWQgcmlnaHQgYWZ0ZXIgdGhlIHNsaWRlIHRyYW5zaXRpb24gaXMgY29tcGxldGVkLlxuICpcbiAqIEBzaW5jZSA4LjAuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlNpbmdsZVNsaWRlRXZlbnQge1xuICAvKipcbiAgICogdHJ1ZSBpZiB0aGUgc2xpZGUgaXMgc2hvd24sIGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgaXNTaG93bjogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIHNsaWRlIGV2ZW50IGRpcmVjdGlvbi5cbiAgICpcbiAgICogUG9zc2libGUgdmFsdWVzIGFyZSBgJ2xlZnQnIHwgJ3JpZ2h0J2AuXG4gICAqL1xuICBkaXJlY3Rpb246IE5nYlNsaWRlRXZlbnREaXJlY3Rpb247XG5cbiAgLyoqXG4gICAqIFNvdXJjZSB0cmlnZ2VyaW5nIHRoZSBzbGlkZSBjaGFuZ2UgZXZlbnQuXG4gICAqXG4gICAqIFBvc3NpYmxlIHZhbHVlcyBhcmUgYCd0aW1lcicgfCAnYXJyb3dMZWZ0JyB8ICdhcnJvd1JpZ2h0JyB8ICdpbmRpY2F0b3InYFxuICAgKlxuICAgKi9cbiAgc291cmNlPzogTmdiU2xpZGVFdmVudFNvdXJjZTtcbn1cblxuZXhwb3J0IGVudW0gTmdiU2xpZGVFdmVudFNvdXJjZSB7XG4gIFRJTUVSID0gJ3RpbWVyJyxcbiAgQVJST1dfTEVGVCA9ICdhcnJvd0xlZnQnLFxuICBBUlJPV19SSUdIVCA9ICdhcnJvd1JpZ2h0JyxcbiAgSU5ESUNBVE9SID0gJ2luZGljYXRvcidcbn1cblxuZXhwb3J0IGNvbnN0IE5HQl9DQVJPVVNFTF9ESVJFQ1RJVkVTID0gW05nYkNhcm91c2VsLCBOZ2JTbGlkZV07XG4iXX0=