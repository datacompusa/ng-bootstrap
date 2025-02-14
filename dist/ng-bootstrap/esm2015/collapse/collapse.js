import { Directive, ElementRef, EventEmitter, Input, Output, } from '@angular/core';
import { ngbRunTransition } from '../util/transition/ngbTransition';
import { ngbCollapsingTransition } from '../util/transition/ngbCollapseTransition';
import { NgbCollapseConfig } from './collapse-config';
/**
 * A directive to provide a simple way of hiding and showing elements on the page.
 */
export class NgbCollapse {
    constructor(_element, config) {
        this._element = _element;
        /**
         * If `true`, collapse will be animated.
         *
         * Animation is triggered only when clicked on triggering element
         * or via the `.toggle()` function
         *
         * @since 8.0.0
         */
        this.animation = false;
        /**
         * If `true`, will collapse the element or show it otherwise.
         */
        this.collapsed = false;
        this.ngbCollapseChange = new EventEmitter();
        /**
         * An event emitted when the collapse element is shown, after the transition. It has no payload.
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the collapse element is hidden, after the transition. It has no payload.
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
        this.animation = config.animation;
    }
    ngOnInit() {
        this._element.nativeElement.classList.add('collapse');
        this._runTransition(this.collapsed, false, false);
    }
    ngOnChanges({ collapsed }) {
        if (!collapsed.firstChange) {
            this._runTransition(this.collapsed, this.animation);
        }
    }
    /**
     * Triggers collapsing programmatically.
     *
     * If there is a collapsing transition running already, it will be reversed.
     * If the animations are turned off this happens synchronously.
     *
     * @since 8.0.0
     */
    toggle(open = this.collapsed) {
        this.collapsed = !open;
        this.ngbCollapseChange.next(this.collapsed);
        this._runTransition(this.collapsed, this.animation);
    }
    _runTransition(collapsed, animation, emitEvent = true) {
        ngbRunTransition(this._element.nativeElement, ngbCollapsingTransition, {
            animation,
            runningTransition: 'stop',
            context: { direction: collapsed ? 'hide' : 'show' }
        }).subscribe(() => {
            if (emitEvent) {
                if (collapsed) {
                    this.hidden.emit();
                }
                else {
                    this.shown.emit();
                }
            }
        });
    }
}
NgbCollapse.decorators = [
    { type: Directive, args: [{ selector: '[ngbCollapse]', exportAs: 'ngbCollapse' },] }
];
NgbCollapse.ctorParameters = () => [
    { type: ElementRef },
    { type: NgbCollapseConfig }
];
NgbCollapse.propDecorators = {
    animation: [{ type: Input }],
    collapsed: [{ type: Input, args: ['ngbCollapse',] }],
    ngbCollapseChange: [{ type: Output }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbImNvbGxhcHNlL2NvbGxhcHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxHQUVQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ2pGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBEOztHQUVHO0FBRUgsTUFBTSxPQUFPLFdBQVc7SUFpQ3RCLFlBQW9CLFFBQW9CLEVBQUUsTUFBeUI7UUFBL0MsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQWhDeEM7Ozs7Ozs7V0FPRztRQUNNLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFM0I7O1dBRUc7UUFDbUIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUU5QixzQkFBaUIsR0FBRyxJQUFJLFlBQVksRUFBVyxDQUFDO1FBRTFEOzs7O1dBSUc7UUFDTyxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUUzQzs7OztXQUlHO1FBQ08sV0FBTSxHQUFHLElBQUksWUFBWSxFQUFRLENBQUM7UUFHMkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQUMsQ0FBQztJQUUzRyxRQUFRO1FBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxXQUFXLENBQUMsRUFBQyxTQUFTLEVBQWdCO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO1lBQzFCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckQ7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxPQUFnQixJQUFJLENBQUMsU0FBUztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLGNBQWMsQ0FBQyxTQUFrQixFQUFFLFNBQWtCLEVBQUUsU0FBUyxHQUFHLElBQUk7UUFDN0UsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsdUJBQXVCLEVBQUU7WUFDckUsU0FBUztZQUNULGlCQUFpQixFQUFFLE1BQU07WUFDekIsT0FBTyxFQUFFLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUM7U0FDbEQsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDaEIsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDcEI7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDbkI7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBM0VGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQzs7O1lBZjdELFVBQVU7WUFVSixpQkFBaUI7Ozt3QkFldEIsS0FBSzt3QkFLTCxLQUFLLFNBQUMsYUFBYTtnQ0FFbkIsTUFBTTtvQkFPTixNQUFNO3FCQU9OLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtuZ2JSdW5UcmFuc2l0aW9ufSBmcm9tICcuLi91dGlsL3RyYW5zaXRpb24vbmdiVHJhbnNpdGlvbic7XG5pbXBvcnQge25nYkNvbGxhcHNpbmdUcmFuc2l0aW9ufSBmcm9tICcuLi91dGlsL3RyYW5zaXRpb24vbmdiQ29sbGFwc2VUcmFuc2l0aW9uJztcbmltcG9ydCB7TmdiQ29sbGFwc2VDb25maWd9IGZyb20gJy4vY29sbGFwc2UtY29uZmlnJztcblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0byBwcm92aWRlIGEgc2ltcGxlIHdheSBvZiBoaWRpbmcgYW5kIHNob3dpbmcgZWxlbWVudHMgb24gdGhlIHBhZ2UuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nYkNvbGxhcHNlXScsIGV4cG9ydEFzOiAnbmdiQ29sbGFwc2UnfSlcbmV4cG9ydCBjbGFzcyBOZ2JDb2xsYXBzZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgY29sbGFwc2Ugd2lsbCBiZSBhbmltYXRlZC5cbiAgICpcbiAgICogQW5pbWF0aW9uIGlzIHRyaWdnZXJlZCBvbmx5IHdoZW4gY2xpY2tlZCBvbiB0cmlnZ2VyaW5nIGVsZW1lbnRcbiAgICogb3IgdmlhIHRoZSBgLnRvZ2dsZSgpYCBmdW5jdGlvblxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGFuaW1hdGlvbiA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHdpbGwgY29sbGFwc2UgdGhlIGVsZW1lbnQgb3Igc2hvdyBpdCBvdGhlcndpc2UuXG4gICAqL1xuICBASW5wdXQoJ25nYkNvbGxhcHNlJykgY29sbGFwc2VkID0gZmFsc2U7XG5cbiAgQE91dHB1dCgpIG5nYkNvbGxhcHNlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBlbWl0dGVkIHdoZW4gdGhlIGNvbGxhcHNlIGVsZW1lbnQgaXMgc2hvd24sIGFmdGVyIHRoZSB0cmFuc2l0aW9uLiBJdCBoYXMgbm8gcGF5bG9hZC5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2hvd24gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgY29sbGFwc2UgZWxlbWVudCBpcyBoaWRkZW4sIGFmdGVyIHRoZSB0cmFuc2l0aW9uLiBJdCBoYXMgbm8gcGF5bG9hZC5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgaGlkZGVuID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZiwgY29uZmlnOiBOZ2JDb2xsYXBzZUNvbmZpZykgeyB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29sbGFwc2UnKTtcbiAgICB0aGlzLl9ydW5UcmFuc2l0aW9uKHRoaXMuY29sbGFwc2VkLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoe2NvbGxhcHNlZH06IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoIWNvbGxhcHNlZC5maXJzdENoYW5nZSkge1xuICAgICAgdGhpcy5fcnVuVHJhbnNpdGlvbih0aGlzLmNvbGxhcHNlZCwgdGhpcy5hbmltYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBjb2xsYXBzaW5nIHByb2dyYW1tYXRpY2FsbHkuXG4gICAqXG4gICAqIElmIHRoZXJlIGlzIGEgY29sbGFwc2luZyB0cmFuc2l0aW9uIHJ1bm5pbmcgYWxyZWFkeSwgaXQgd2lsbCBiZSByZXZlcnNlZC5cbiAgICogSWYgdGhlIGFuaW1hdGlvbnMgYXJlIHR1cm5lZCBvZmYgdGhpcyBoYXBwZW5zIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgdG9nZ2xlKG9wZW46IGJvb2xlYW4gPSB0aGlzLmNvbGxhcHNlZCkge1xuICAgIHRoaXMuY29sbGFwc2VkID0gIW9wZW47XG4gICAgdGhpcy5uZ2JDb2xsYXBzZUNoYW5nZS5uZXh0KHRoaXMuY29sbGFwc2VkKTtcbiAgICB0aGlzLl9ydW5UcmFuc2l0aW9uKHRoaXMuY29sbGFwc2VkLCB0aGlzLmFuaW1hdGlvbik7XG4gIH1cblxuICBwcml2YXRlIF9ydW5UcmFuc2l0aW9uKGNvbGxhcHNlZDogYm9vbGVhbiwgYW5pbWF0aW9uOiBib29sZWFuLCBlbWl0RXZlbnQgPSB0cnVlKSB7XG4gICAgbmdiUnVuVHJhbnNpdGlvbih0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5nYkNvbGxhcHNpbmdUcmFuc2l0aW9uLCB7XG4gICAgICBhbmltYXRpb24sXG4gICAgICBydW5uaW5nVHJhbnNpdGlvbjogJ3N0b3AnLFxuICAgICAgY29udGV4dDoge2RpcmVjdGlvbjogY29sbGFwc2VkID8gJ2hpZGUnIDogJ3Nob3cnfVxuICAgIH0pLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAoZW1pdEV2ZW50KSB7XG4gICAgICAgIGlmIChjb2xsYXBzZWQpIHtcbiAgICAgICAgICB0aGlzLmhpZGRlbi5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zaG93bi5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19