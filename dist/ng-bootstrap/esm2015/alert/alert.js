import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Renderer2, ElementRef, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig } from './alert-config';
import { ngbRunTransition } from '../util/transition/ngbTransition';
import { ngbAlertFadingTransition } from './alert-transition';
/**
 * Alert is a component to provide contextual feedback messages for user.
 *
 * It supports several alert types and can be dismissed.
 */
export class NgbAlert {
    constructor(config, _renderer, _element) {
        this._renderer = _renderer;
        this._element = _element;
        /**
         * An event emitted when the close button is clicked. It has no payload and only relevant for dismissible alerts.
         *
         * @since 8.0.0
         */
        this.closed = new EventEmitter();
        this.dismissible = config.dismissible;
        this.type = config.type;
        this.animation = config.animation;
    }
    /**
     * Triggers alert closing programmatically (same as clicking on the close button (×)).
     *
     * The returned observable will emit and be completed once the closing transition has finished.
     * If the animations are turned off this happens synchronously.
     *
     * Alternatively you could listen or subscribe to the `(closed)` output
     *
     * @since 8.0.0
     */
    close() {
        const transition = ngbRunTransition(this._element.nativeElement, ngbAlertFadingTransition, { animation: this.animation, runningTransition: 'continue' });
        transition.subscribe(() => this.closed.emit());
        return transition;
    }
    ngOnChanges(changes) {
        const typeChange = changes['type'];
        if (typeChange && !typeChange.firstChange) {
            this._renderer.removeClass(this._element.nativeElement, `alert-${typeChange.previousValue}`);
            this._renderer.addClass(this._element.nativeElement, `alert-${typeChange.currentValue}`);
        }
    }
    ngOnInit() { this._renderer.addClass(this._element.nativeElement, `alert-${this.type}`); }
}
NgbAlert.decorators = [
    { type: Component, args: [{
                selector: 'ngb-alert',
                exportAs: 'ngbAlert',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                host: { 'role': 'alert', 'class': 'alert show', '[class.fade]': 'animation', '[class.alert-dismissible]': 'dismissible' },
                template: `
    <ng-content></ng-content>
    <button *ngIf="dismissible" type="button" class="close" aria-label="Close" i18n-aria-label="@@ngb.alert.close"
      (click)="close()">
      <span aria-hidden="true">&times;</span>
    </button>
    `,
                styles: ["ngb-alert{display:block}"]
            },] }
];
NgbAlert.ctorParameters = () => [
    { type: NgbAlertConfig },
    { type: Renderer2 },
    { type: ElementRef }
];
NgbAlert.propDecorators = {
    animation: [{ type: Input }],
    dismissible: [{ type: Input }],
    type: [{ type: Input }],
    closed: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbImFsZXJ0L2FsZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBSVYsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBSXZCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUU1RDs7OztHQUlHO0FBaUJILE1BQU0sT0FBTyxRQUFRO0lBb0NuQixZQUFZLE1BQXNCLEVBQVUsU0FBb0IsRUFBVSxRQUFvQjtRQUFsRCxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQVI5Rjs7OztXQUlHO1FBQ08sV0FBTSxHQUFHLElBQUksWUFBWSxFQUFRLENBQUM7UUFJMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUs7UUFDSCxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsd0JBQXdCLEVBQ3JELEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUNoRSxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvQyxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxJQUFJLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUU7WUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsU0FBUyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxTQUFTLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1NBQzFGO0lBQ0gsQ0FBQztJQUVELFFBQVEsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O1lBcEYzRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLElBQUksRUFDQSxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLDJCQUEyQixFQUFFLGFBQWEsRUFBQztnQkFDckgsUUFBUSxFQUFFOzs7Ozs7S0FNUDs7YUFFSjs7O1lBeEJPLGNBQWM7WUFWcEIsU0FBUztZQUNULFVBQVU7Ozt3QkE0Q1QsS0FBSzswQkFRTCxLQUFLO21CQVFMLEtBQUs7cUJBT0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgUmVuZGVyZXIyLFxuICBFbGVtZW50UmVmLFxuICBPbkNoYW5nZXMsXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7TmdiQWxlcnRDb25maWd9IGZyb20gJy4vYWxlcnQtY29uZmlnJztcbmltcG9ydCB7bmdiUnVuVHJhbnNpdGlvbn0gZnJvbSAnLi4vdXRpbC90cmFuc2l0aW9uL25nYlRyYW5zaXRpb24nO1xuaW1wb3J0IHtuZ2JBbGVydEZhZGluZ1RyYW5zaXRpb259IGZyb20gJy4vYWxlcnQtdHJhbnNpdGlvbic7XG5cbi8qKlxuICogQWxlcnQgaXMgYSBjb21wb25lbnQgdG8gcHJvdmlkZSBjb250ZXh0dWFsIGZlZWRiYWNrIG1lc3NhZ2VzIGZvciB1c2VyLlxuICpcbiAqIEl0IHN1cHBvcnRzIHNldmVyYWwgYWxlcnQgdHlwZXMgYW5kIGNhbiBiZSBkaXNtaXNzZWQuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nYi1hbGVydCcsXG4gIGV4cG9ydEFzOiAnbmdiQWxlcnQnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgaG9zdDpcbiAgICAgIHsncm9sZSc6ICdhbGVydCcsICdjbGFzcyc6ICdhbGVydCBzaG93JywgJ1tjbGFzcy5mYWRlXSc6ICdhbmltYXRpb24nLCAnW2NsYXNzLmFsZXJ0LWRpc21pc3NpYmxlXSc6ICdkaXNtaXNzaWJsZSd9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8YnV0dG9uICpuZ0lmPVwiZGlzbWlzc2libGVcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGFyaWEtbGFiZWw9XCJDbG9zZVwiIGkxOG4tYXJpYS1sYWJlbD1cIkBAbmdiLmFsZXJ0LmNsb3NlXCJcbiAgICAgIChjbGljayk9XCJjbG9zZSgpXCI+XG4gICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICAgIGAsXG4gIHN0eWxlVXJsczogWycuL2FsZXJ0LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBOZ2JBbGVydCBpbXBsZW1lbnRzIE9uSW5pdCxcbiAgICBPbkNoYW5nZXMge1xuICAvKipcbiAgICogSWYgYHRydWVgLCBhbGVydCBjbG9zaW5nIHdpbGwgYmUgYW5pbWF0ZWQuXG4gICAqXG4gICAqIEFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgb25seSB3aGVuIGNsaWNrZWQgb24gdGhlIGNsb3NlIGJ1dHRvbiAow5cpXG4gICAqIG9yIHZpYSB0aGUgYC5jbG9zZSgpYCBmdW5jdGlvblxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGFuaW1hdGlvbjogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCBhbGVydCBjYW4gYmUgZGlzbWlzc2VkIGJ5IHRoZSB1c2VyLlxuICAgKlxuICAgKiBUaGUgY2xvc2UgYnV0dG9uICjDlykgd2lsbCBiZSBkaXNwbGF5ZWQgYW5kIHlvdSBjYW4gYmUgbm90aWZpZWRcbiAgICogb2YgdGhlIGV2ZW50IHdpdGggdGhlIGAoY2xvc2UpYCBvdXRwdXQuXG4gICAqL1xuICBASW5wdXQoKSBkaXNtaXNzaWJsZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogVHlwZSBvZiB0aGUgYWxlcnQuXG4gICAqXG4gICAqIEJvb3RzdHJhcCBwcm92aWRlcyBzdHlsZXMgZm9yIHRoZSBmb2xsb3dpbmcgdHlwZXM6IGAnc3VjY2VzcydgLCBgJ2luZm8nYCwgYCd3YXJuaW5nJ2AsIGAnZGFuZ2VyJ2AsIGAncHJpbWFyeSdgLFxuICAgKiBgJ3NlY29uZGFyeSdgLCBgJ2xpZ2h0J2AgYW5kIGAnZGFyaydgLlxuICAgKi9cbiAgQElucHV0KCkgdHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBlbWl0dGVkIHdoZW4gdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLiBJdCBoYXMgbm8gcGF5bG9hZCBhbmQgb25seSByZWxldmFudCBmb3IgZGlzbWlzc2libGUgYWxlcnRzLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBjbG9zZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IE5nYkFsZXJ0Q29uZmlnLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyLCBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmKSB7XG4gICAgdGhpcy5kaXNtaXNzaWJsZSA9IGNvbmZpZy5kaXNtaXNzaWJsZTtcbiAgICB0aGlzLnR5cGUgPSBjb25maWcudHlwZTtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYWxlcnQgY2xvc2luZyBwcm9ncmFtbWF0aWNhbGx5IChzYW1lIGFzIGNsaWNraW5nIG9uIHRoZSBjbG9zZSBidXR0b24gKMOXKSkuXG4gICAqXG4gICAqIFRoZSByZXR1cm5lZCBvYnNlcnZhYmxlIHdpbGwgZW1pdCBhbmQgYmUgY29tcGxldGVkIG9uY2UgdGhlIGNsb3NpbmcgdHJhbnNpdGlvbiBoYXMgZmluaXNoZWQuXG4gICAqIElmIHRoZSBhbmltYXRpb25zIGFyZSB0dXJuZWQgb2ZmIHRoaXMgaGFwcGVucyBzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBBbHRlcm5hdGl2ZWx5IHlvdSBjb3VsZCBsaXN0ZW4gb3Igc3Vic2NyaWJlIHRvIHRoZSBgKGNsb3NlZClgIG91dHB1dFxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIGNsb3NlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGNvbnN0IHRyYW5zaXRpb24gPSBuZ2JSdW5UcmFuc2l0aW9uKFxuICAgICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIG5nYkFsZXJ0RmFkaW5nVHJhbnNpdGlvbixcbiAgICAgICAge2FuaW1hdGlvbjogdGhpcy5hbmltYXRpb24sIHJ1bm5pbmdUcmFuc2l0aW9uOiAnY29udGludWUnfSk7XG4gICAgdHJhbnNpdGlvbi5zdWJzY3JpYmUoKCkgPT4gdGhpcy5jbG9zZWQuZW1pdCgpKTtcbiAgICByZXR1cm4gdHJhbnNpdGlvbjtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCB0eXBlQ2hhbmdlID0gY2hhbmdlc1sndHlwZSddO1xuICAgIGlmICh0eXBlQ2hhbmdlICYmICF0eXBlQ2hhbmdlLmZpcnN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIGBhbGVydC0ke3R5cGVDaGFuZ2UucHJldmlvdXNWYWx1ZX1gKTtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCwgYGFsZXJ0LSR7dHlwZUNoYW5nZS5jdXJyZW50VmFsdWV9YCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7IHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCwgYGFsZXJ0LSR7dGhpcy50eXBlfWApOyB9XG59XG4iXX0=