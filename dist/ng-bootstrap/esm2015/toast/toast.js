import { Attribute, Component, ContentChild, Directive, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation, ElementRef, NgZone, } from '@angular/core';
import { take } from 'rxjs/operators';
import { NgbToastConfig } from './toast-config';
import { ngbRunTransition } from '../util/transition/ngbTransition';
import { ngbToastFadeInTransition, ngbToastFadeOutTransition } from './toast-transition';
/**
 * This directive allows the usage of HTML markup or other directives
 * inside of the toast's header.
 *
 * @since 5.0.0
 */
export class NgbToastHeader {
}
NgbToastHeader.decorators = [
    { type: Directive, args: [{ selector: '[ngbToastHeader]' },] }
];
/**
 * Toasts provide feedback messages as notifications to the user.
 * Goal is to mimic the push notifications available both on mobile and desktop operating systems.
 *
 * @since 5.0.0
 */
export class NgbToast {
    constructor(ariaLive, config, _zone, _element) {
        this.ariaLive = ariaLive;
        this._zone = _zone;
        this._element = _element;
        /**
         * A template like `<ng-template ngbToastHeader></ng-template>` can be
         * used in the projected content to allow markup usage.
         */
        this.contentHeaderTpl = null;
        /**
         * An event fired after the animation triggered by calling `.show()` method has finished.
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event fired after the animation triggered by calling `.hide()` method has finished.
         *
         * It can only occur in 2 different scenarios:
         * - `autohide` timeout fires
         * - user clicks on a closing cross
         *
         * Additionally this output is purely informative. The toast won't be removed from DOM automatically, it's up
         * to the user to take care of that.
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
        if (this.ariaLive == null) {
            this.ariaLive = config.ariaLive;
        }
        this.delay = config.delay;
        this.autohide = config.autohide;
        this.animation = config.animation;
    }
    ngAfterContentInit() {
        this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
            this._init();
            this.show();
        });
    }
    ngOnChanges(changes) {
        if ('autohide' in changes) {
            this._clearTimeout();
            this._init();
        }
    }
    /**
     * Triggers toast closing programmatically.
     *
     * The returned observable will emit and be completed once the closing transition has finished.
     * If the animations are turned off this happens synchronously.
     *
     * Alternatively you could listen or subscribe to the `(hidden)` output
     *
     * @since 8.0.0
     */
    hide() {
        this._clearTimeout();
        const transition = ngbRunTransition(this._element.nativeElement, ngbToastFadeOutTransition, { animation: this.animation, runningTransition: 'stop' });
        transition.subscribe(() => { this.hidden.emit(); });
        return transition;
    }
    /**
     * Triggers toast opening programmatically.
     *
     * The returned observable will emit and be completed once the opening transition has finished.
     * If the animations are turned off this happens synchronously.
     *
     * Alternatively you could listen or subscribe to the `(shown)` output
     *
     * @since 8.0.0
     */
    show() {
        const transition = ngbRunTransition(this._element.nativeElement, ngbToastFadeInTransition, {
            animation: this.animation,
            runningTransition: 'continue',
        });
        transition.subscribe(() => { this.shown.emit(); });
        return transition;
    }
    _init() {
        if (this.autohide && !this._timeoutID) {
            this._timeoutID = setTimeout(() => this.hide(), this.delay);
        }
    }
    _clearTimeout() {
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
            this._timeoutID = null;
        }
    }
}
NgbToast.decorators = [
    { type: Component, args: [{
                selector: 'ngb-toast',
                exportAs: 'ngbToast',
                encapsulation: ViewEncapsulation.None,
                host: {
                    'role': 'alert',
                    '[attr.aria-live]': 'ariaLive',
                    'aria-atomic': 'true',
                    'class': 'toast',
                    '[class.fade]': 'animation',
                },
                template: `
    <ng-template #headerTpl>
      <strong class="mr-auto">{{header}}</strong>
    </ng-template>
    <ng-template [ngIf]="contentHeaderTpl || header">
      <div class="toast-header">
        <ng-template [ngTemplateOutlet]="contentHeaderTpl || headerTpl"></ng-template>
        <button type="button" class="close" aria-label="Close" i18n-aria-label="@@ngb.toast.close-aria" (click)="hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </ng-template>
    <div class="toast-body">
      <ng-content></ng-content>
    </div>
  `,
                styles: [".ngb-toasts{margin:.5em;position:fixed;right:0;top:0;z-index:1200}ngb-toast{display:block}ngb-toast .toast-header .close{margin-bottom:.25rem;margin-left:auto}"]
            },] }
];
NgbToast.ctorParameters = () => [
    { type: String, decorators: [{ type: Attribute, args: ['aria-live',] }] },
    { type: NgbToastConfig },
    { type: NgZone },
    { type: ElementRef }
];
NgbToast.propDecorators = {
    animation: [{ type: Input }],
    delay: [{ type: Input }],
    autohide: [{ type: Input }],
    header: [{ type: Input }],
    contentHeaderTpl: [{ type: ContentChild, args: [NgbToastHeader, { read: TemplateRef, static: true },] }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbInRvYXN0L3RvYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBRU4sV0FBVyxFQUNYLGlCQUFpQixFQUNqQixVQUFVLEVBQ1YsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDbEUsT0FBTyxFQUFDLHdCQUF3QixFQUFFLHlCQUF5QixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFHdkY7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sY0FBYzs7O1lBRDFCLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBQzs7QUFJekM7Ozs7O0dBS0c7QUE4QkgsTUFBTSxPQUFPLFFBQVE7SUEwRG5CLFlBQ21DLFFBQWdCLEVBQUUsTUFBc0IsRUFBVSxLQUFhLEVBQ3RGLFFBQW9CO1FBREcsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFrQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ3RGLGFBQVEsR0FBUixRQUFRLENBQVk7UUE3QmhDOzs7V0FHRztRQUM4RCxxQkFBZ0IsR0FBMkIsSUFBSSxDQUFDO1FBRWpIOzs7O1dBSUc7UUFDTyxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUUzQzs7Ozs7Ozs7Ozs7V0FXRztRQUNPLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBUSxDQUFDO1FBSzFDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJ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YztZQU5wQixNQUFNO1lBRE4sVUFBVTs7O3dCQWtFVCxLQUFLO29CQVFMLEtBQUs7dUJBTUwsS0FBSztxQkFNTCxLQUFLOytCQU1MLFlBQVksU0FBQyxjQUFjLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUM7b0JBTzlELE1BQU07cUJBY04sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIEF0dHJpYnV0ZSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgRWxlbWVudFJlZixcbiAgTmdab25lLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge05nYlRvYXN0Q29uZmlnfSBmcm9tICcuL3RvYXN0LWNvbmZpZyc7XG5pbXBvcnQge25nYlJ1blRyYW5zaXRpb259IGZyb20gJy4uL3V0aWwvdHJhbnNpdGlvbi9uZ2JUcmFuc2l0aW9uJztcbmltcG9ydCB7bmdiVG9hc3RGYWRlSW5UcmFuc2l0aW9uLCBuZ2JUb2FzdEZhZGVPdXRUcmFuc2l0aW9ufSBmcm9tICcuL3RvYXN0LXRyYW5zaXRpb24nO1xuXG5cbi8qKlxuICogVGhpcyBkaXJlY3RpdmUgYWxsb3dzIHRoZSB1c2FnZSBvZiBIVE1MIG1hcmt1cCBvciBvdGhlciBkaXJlY3RpdmVzXG4gKiBpbnNpZGUgb2YgdGhlIHRvYXN0J3MgaGVhZGVyLlxuICpcbiAqIEBzaW5jZSA1LjAuMFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ2JUb2FzdEhlYWRlcl0nfSlcbmV4cG9ydCBjbGFzcyBOZ2JUb2FzdEhlYWRlciB7XG59XG5cbi8qKlxuICogVG9hc3RzIHByb3ZpZGUgZmVlZGJhY2sgbWVzc2FnZXMgYXMgbm90aWZpY2F0aW9ucyB0byB0aGUgdXNlci5cbiAqIEdvYWwgaXMgdG8gbWltaWMgdGhlIHB1c2ggbm90aWZpY2F0aW9ucyBhdmFpbGFibGUgYm90aCBvbiBtb2JpbGUgYW5kIGRlc2t0b3Agb3BlcmF0aW5nIHN5c3RlbXMuXG4gKlxuICogQHNpbmNlIDUuMC4wXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nYi10b2FzdCcsXG4gIGV4cG9ydEFzOiAnbmdiVG9hc3QnLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBob3N0OiB7XG4gICAgJ3JvbGUnOiAnYWxlcnQnLFxuICAgICdbYXR0ci5hcmlhLWxpdmVdJzogJ2FyaWFMaXZlJyxcbiAgICAnYXJpYS1hdG9taWMnOiAndHJ1ZScsXG4gICAgJ2NsYXNzJzogJ3RvYXN0JyxcbiAgICAnW2NsYXNzLmZhZGVdJzogJ2FuaW1hdGlvbicsXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5nLXRlbXBsYXRlICNoZWFkZXJUcGw+XG4gICAgICA8c3Ryb25nIGNsYXNzPVwibXItYXV0b1wiPnt7aGVhZGVyfX08L3N0cm9uZz5cbiAgICA8L25nLXRlbXBsYXRlPlxuICAgIDxuZy10ZW1wbGF0ZSBbbmdJZl09XCJjb250ZW50SGVhZGVyVHBsIHx8IGhlYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInRvYXN0LWhlYWRlclwiPlxuICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwiY29udGVudEhlYWRlclRwbCB8fCBoZWFkZXJUcGxcIj48L25nLXRlbXBsYXRlPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1sYWJlbD1cIkNsb3NlXCIgaTE4bi1hcmlhLWxhYmVsPVwiQEBuZ2IudG9hc3QuY2xvc2UtYXJpYVwiIChjbGljayk9XCJoaWRlKClcIj5cbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmctdGVtcGxhdGU+XG4gICAgPGRpdiBjbGFzcz1cInRvYXN0LWJvZHlcIj5cbiAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgc3R5bGVVcmxzOiBbJy4vdG9hc3Quc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nYlRvYXN0IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCxcbiAgICBPbkNoYW5nZXMge1xuICAvKipcbiAgICogSWYgYHRydWVgLCB0b2FzdCBvcGVuaW5nIGFuZCBjbG9zaW5nIHdpbGwgYmUgYW5pbWF0ZWQuXG4gICAqXG4gICAqIEFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgb25seSB3aGVuIHRoZSBgLmhpZGUoKWAgb3IgYC5zaG93KClgIGZ1bmN0aW9ucyBhcmUgY2FsbGVkXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgQElucHV0KCkgYW5pbWF0aW9uOiBib29sZWFuO1xuXG4gIHByaXZhdGUgX3RpbWVvdXRJRDtcblxuICAvKipcbiAgICogRGVsYXkgYWZ0ZXIgd2hpY2ggdGhlIHRvYXN0IHdpbGwgaGlkZSAobXMpLlxuICAgKiBkZWZhdWx0OiBgNTAwYCAobXMpIChpbmhlcml0ZWQgZnJvbSBOZ2JUb2FzdENvbmZpZylcbiAgICovXG4gIEBJbnB1dCgpIGRlbGF5OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEF1dG8gaGlkZSB0aGUgdG9hc3QgYWZ0ZXIgYSBkZWxheSBpbiBtcy5cbiAgICogZGVmYXVsdDogYHRydWVgIChpbmhlcml0ZWQgZnJvbSBOZ2JUb2FzdENvbmZpZylcbiAgICovXG4gIEBJbnB1dCgpIGF1dG9oaWRlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUZXh0IHRvIGJlIHVzZWQgYXMgdG9hc3QncyBoZWFkZXIuXG4gICAqIElnbm9yZWQgaWYgYSBDb250ZW50Q2hpbGQgdGVtcGxhdGUgaXMgc3BlY2lmaWVkIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAqL1xuICBASW5wdXQoKSBoZWFkZXI6IHN0cmluZztcblxuICAvKipcbiAgICogQSB0ZW1wbGF0ZSBsaWtlIGA8bmctdGVtcGxhdGUgbmdiVG9hc3RIZWFkZXI+PC9uZy10ZW1wbGF0ZT5gIGNhbiBiZVxuICAgKiB1c2VkIGluIHRoZSBwcm9qZWN0ZWQgY29udGVudCB0byBhbGxvdyBtYXJrdXAgdXNhZ2UuXG4gICAqL1xuICBAQ29udGVudENoaWxkKE5nYlRvYXN0SGVhZGVyLCB7cmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZX0pIGNvbnRlbnRIZWFkZXJUcGw6IFRlbXBsYXRlUmVmPGFueT58IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBmaXJlZCBhZnRlciB0aGUgYW5pbWF0aW9uIHRyaWdnZXJlZCBieSBjYWxsaW5nIGAuc2hvdygpYCBtZXRob2QgaGFzIGZpbmlzaGVkLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBzaG93biA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZmlyZWQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiB0cmlnZ2VyZWQgYnkgY2FsbGluZyBgLmhpZGUoKWAgbWV0aG9kIGhhcyBmaW5pc2hlZC5cbiAgICpcbiAgICogSXQgY2FuIG9ubHkgb2NjdXIgaW4gMiBkaWZmZXJlbnQgc2NlbmFyaW9zOlxuICAgKiAtIGBhdXRvaGlkZWAgdGltZW91dCBmaXJlc1xuICAgKiAtIHVzZXIgY2xpY2tzIG9uIGEgY2xvc2luZyBjcm9zc1xuICAgKlxuICAgKiBBZGRpdGlvbmFsbHkgdGhpcyBvdXRwdXQgaXMgcHVyZWx5IGluZm9ybWF0aXZlLiBUaGUgdG9hc3Qgd29uJ3QgYmUgcmVtb3ZlZCBmcm9tIERPTSBhdXRvbWF0aWNhbGx5LCBpdCdzIHVwXG4gICAqIHRvIHRoZSB1c2VyIHRvIHRha2UgY2FyZSBvZiB0aGF0LlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBoaWRkZW4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAQXR0cmlidXRlKCdhcmlhLWxpdmUnKSBwdWJsaWMgYXJpYUxpdmU6IHN0cmluZywgY29uZmlnOiBOZ2JUb2FzdENvbmZpZywgcHJpdmF0ZSBfem9uZTogTmdab25lLFxuICAgICAgcHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZikge1xuICAgIGlmICh0aGlzLmFyaWFMaXZlID09IG51bGwpIHtcbiAgICAgIHRoaXMuYXJpYUxpdmUgPSBjb25maWcuYXJpYUxpdmU7XG4gICAgfVxuICAgIHRoaXMuZGVsYXkgPSBjb25maWcuZGVsYXk7XG4gICAgdGhpcy5hdXRvaGlkZSA9IGNvbmZpZy5hdXRvaGlkZTtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fem9uZS5vblN0YWJsZS5hc09ic2VydmFibGUoKS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoJ2F1dG9oaWRlJyBpbiBjaGFuZ2VzKSB7XG4gICAgICB0aGlzLl9jbGVhclRpbWVvdXQoKTtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgdG9hc3QgY2xvc2luZyBwcm9ncmFtbWF0aWNhbGx5LlxuICAgKlxuICAgKiBUaGUgcmV0dXJuZWQgb2JzZXJ2YWJsZSB3aWxsIGVtaXQgYW5kIGJlIGNvbXBsZXRlZCBvbmNlIHRoZSBjbG9zaW5nIHRyYW5zaXRpb24gaGFzIGZpbmlzaGVkLlxuICAgKiBJZiB0aGUgYW5pbWF0aW9ucyBhcmUgdHVybmVkIG9mZiB0aGlzIGhhcHBlbnMgc3luY2hyb25vdXNseS5cbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSB5b3UgY291bGQgbGlzdGVuIG9yIHN1YnNjcmliZSB0byB0aGUgYChoaWRkZW4pYCBvdXRwdXRcbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBoaWRlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHRoaXMuX2NsZWFyVGltZW91dCgpO1xuICAgIGNvbnN0IHRyYW5zaXRpb24gPSBuZ2JSdW5UcmFuc2l0aW9uKFxuICAgICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5nYlRvYXN0RmFkZU91dFRyYW5zaXRpb24sIHthbmltYXRpb246IHRoaXMuYW5pbWF0aW9uLCBydW5uaW5nVHJhbnNpdGlvbjogJ3N0b3AnfSk7XG4gICAgdHJhbnNpdGlvbi5zdWJzY3JpYmUoKCkgPT4geyB0aGlzLmhpZGRlbi5lbWl0KCk7IH0pO1xuICAgIHJldHVybiB0cmFuc2l0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIHRvYXN0IG9wZW5pbmcgcHJvZ3JhbW1hdGljYWxseS5cbiAgICpcbiAgICogVGhlIHJldHVybmVkIG9ic2VydmFibGUgd2lsbCBlbWl0IGFuZCBiZSBjb21wbGV0ZWQgb25jZSB0aGUgb3BlbmluZyB0cmFuc2l0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICogSWYgdGhlIGFuaW1hdGlvbnMgYXJlIHR1cm5lZCBvZmYgdGhpcyBoYXBwZW5zIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHkgeW91IGNvdWxkIGxpc3RlbiBvciBzdWJzY3JpYmUgdG8gdGhlIGAoc2hvd24pYCBvdXRwdXRcbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBzaG93KCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGNvbnN0IHRyYW5zaXRpb24gPSBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCwgbmdiVG9hc3RGYWRlSW5UcmFuc2l0aW9uLCB7XG4gICAgICBhbmltYXRpb246IHRoaXMuYW5pbWF0aW9uLFxuICAgICAgcnVubmluZ1RyYW5zaXRpb246ICdjb250aW51ZScsXG4gICAgfSk7XG4gICAgdHJhbnNpdGlvbi5zdWJzY3JpYmUoKCkgPT4geyB0aGlzLnNob3duLmVtaXQoKTsgfSk7XG4gICAgcmV0dXJuIHRyYW5zaXRpb247XG4gIH1cblxuICBwcml2YXRlIF9pbml0KCkge1xuICAgIGlmICh0aGlzLmF1dG9oaWRlICYmICF0aGlzLl90aW1lb3V0SUQpIHtcbiAgICAgIHRoaXMuX3RpbWVvdXRJRCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oaWRlKCksIHRoaXMuZGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyVGltZW91dCgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dElEKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElEKTtcbiAgICAgIHRoaXMuX3RpbWVvdXRJRCA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=