import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * A configuration service for the [NgbCarousel](#/components/carousel/api#NgbCarousel) component.
 *
 * You can inject this service, typically in your root component, and customize its properties
 * to provide default values for all carousels used in the application.
 */
export class NgbCarouselConfig {
    constructor(ngbConfig) {
        this.interval = 5000;
        this.wrap = true;
        this.keyboard = true;
        this.pauseOnHover = true;
        this.pauseOnFocus = true;
        this.showNavigationArrows = true;
        this.showNavigationIndicators = true;
        this.animation = ngbConfig.animation;
    }
}
NgbCarouselConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbCarouselConfig_Factory() { return new NgbCarouselConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbCarouselConfig, providedIn: "root" });
NgbCarouselConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbCarouselConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwtY29uZmlnLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJjYXJvdXNlbC9jYXJvdXNlbC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFFeEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8saUJBQWlCO0lBVTVCLFlBQVksU0FBb0I7UUFSaEMsYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixTQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixpQkFBWSxHQUFHLElBQUksQ0FBQztRQUNwQixpQkFBWSxHQUFHLElBQUksQ0FBQztRQUNwQix5QkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDNUIsNkJBQXdCLEdBQUcsSUFBSSxDQUFDO1FBRUksSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQUMsQ0FBQzs7OztZQVg1RSxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFSeEIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nYkNvbmZpZ30gZnJvbSAnLi4vbmdiLWNvbmZpZyc7XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIHNlcnZpY2UgZm9yIHRoZSBbTmdiQ2Fyb3VzZWxdKCMvY29tcG9uZW50cy9jYXJvdXNlbC9hcGkjTmdiQ2Fyb3VzZWwpIGNvbXBvbmVudC5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCB0aGlzIHNlcnZpY2UsIHR5cGljYWxseSBpbiB5b3VyIHJvb3QgY29tcG9uZW50LCBhbmQgY3VzdG9taXplIGl0cyBwcm9wZXJ0aWVzXG4gKiB0byBwcm92aWRlIGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgY2Fyb3VzZWxzIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBOZ2JDYXJvdXNlbENvbmZpZyB7XG4gIGFuaW1hdGlvbjogYm9vbGVhbjtcbiAgaW50ZXJ2YWwgPSA1MDAwO1xuICB3cmFwID0gdHJ1ZTtcbiAga2V5Ym9hcmQgPSB0cnVlO1xuICBwYXVzZU9uSG92ZXIgPSB0cnVlO1xuICBwYXVzZU9uRm9jdXMgPSB0cnVlO1xuICBzaG93TmF2aWdhdGlvbkFycm93cyA9IHRydWU7XG4gIHNob3dOYXZpZ2F0aW9uSW5kaWNhdG9ycyA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IobmdiQ29uZmlnOiBOZ2JDb25maWcpIHsgdGhpcy5hbmltYXRpb24gPSBuZ2JDb25maWcuYW5pbWF0aW9uOyB9XG59XG4iXX0=