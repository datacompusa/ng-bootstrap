import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * Configuration service for the NgbToast component. You can inject this service, typically in your root component,
 * and customize the values of its properties in order to provide default values for all the toasts used in the
 * application.
 *
 * @since 5.0.0
 */
export class NgbToastConfig {
    constructor(ngbConfig) {
        this.autohide = true;
        this.delay = 500;
        this.ariaLive = 'polite';
        this.animation = ngbConfig.animation;
    }
}
NgbToastConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbToastConfig_Factory() { return new NgbToastConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbToastConfig, providedIn: "root" });
NgbToastConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbToastConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QtY29uZmlnLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJ0b2FzdC90b2FzdC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUE2QnhDOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxjQUFjO0lBTXpCLFlBQVksU0FBb0I7UUFKaEMsYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFLLEdBQUcsR0FBRyxDQUFDO1FBQ1osYUFBUSxHQUF1QixRQUFRLENBQUM7UUFFSixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFBQyxDQUFDOzs7O1lBUDVFLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQXBDeEIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nYkNvbmZpZ30gZnJvbSAnLi4vbmdiLWNvbmZpZyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIHVzZWQgdG8gdHlwZSBhbGwgdG9hc3QgY29uZmlnIG9wdGlvbnMuIFNlZSBgTmdiVG9hc3RDb25maWdgLlxuICpcbiAqIEBzaW5jZSA1LjAuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlRvYXN0T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IGlmIHRoZSB0b2FzdCBjb21wb25lbnQgc2hvdWxkIGVtaXQgdGhlIGBoaWRlKClgIG91dHB1dFxuICAgKiBhZnRlciBhIGNlcnRhaW4gYGRlbGF5YCBpbiBtcy5cbiAgICovXG4gIGF1dG9oaWRlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGVsYXkgaW4gbXMgYWZ0ZXIgd2hpY2ggdGhlIGBoaWRlKClgIG91dHB1dCBzaG91bGQgYmUgZW1pdHRlZC5cbiAgICovXG4gIGRlbGF5PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUeXBlIG9mIGFyaWEtbGl2ZSBhdHRyaWJ1dGUgdG8gYmUgdXNlZC5cbiAgICpcbiAgICogQ291bGQgYmUgb25lIG9mIHRoZXNlIDIgdmFsdWVzIChhcyBzdHJpbmcpOlxuICAgKiAtIGBwb2xpdGVgIChkZWZhdWx0KVxuICAgKiAtIGBhbGVydGBcbiAgICovXG4gIGFyaWFMaXZlPzogJ3BvbGl0ZScgfCAnYWxlcnQnO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gc2VydmljZSBmb3IgdGhlIE5nYlRvYXN0IGNvbXBvbmVudC4gWW91IGNhbiBpbmplY3QgdGhpcyBzZXJ2aWNlLCB0eXBpY2FsbHkgaW4geW91ciByb290IGNvbXBvbmVudCxcbiAqIGFuZCBjdXN0b21pemUgdGhlIHZhbHVlcyBvZiBpdHMgcHJvcGVydGllcyBpbiBvcmRlciB0byBwcm92aWRlIGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgdGhlIHRvYXN0cyB1c2VkIGluIHRoZVxuICogYXBwbGljYXRpb24uXG4gKlxuICogQHNpbmNlIDUuMC4wXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE5nYlRvYXN0Q29uZmlnIGltcGxlbWVudHMgTmdiVG9hc3RPcHRpb25zIHtcbiAgYW5pbWF0aW9uOiBib29sZWFuO1xuICBhdXRvaGlkZSA9IHRydWU7XG4gIGRlbGF5ID0gNTAwO1xuICBhcmlhTGl2ZTogJ3BvbGl0ZScgfCAnYWxlcnQnID0gJ3BvbGl0ZSc7XG5cbiAgY29uc3RydWN0b3IobmdiQ29uZmlnOiBOZ2JDb25maWcpIHsgdGhpcy5hbmltYXRpb24gPSBuZ2JDb25maWcuYW5pbWF0aW9uOyB9XG59XG4iXX0=