import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * A configuration service for the [`NgbNav`](#/components/nav/api#NgbNav) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the navs used in the application.
 *
 * @since 5.2.0
 */
export class NgbNavConfig {
    constructor(ngbConfig) {
        this.destroyOnHide = true;
        this.orientation = 'horizontal';
        this.roles = 'tablist';
        this.keyboard = false;
        this.animation = ngbConfig.animation;
    }
}
NgbNavConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbNavConfig_Factory() { return new NgbNavConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbNavConfig, providedIn: "root" });
NgbNavConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbNavConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsibmF2L25hdi1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFFeEM7Ozs7Ozs7R0FPRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBT3ZCLFlBQVksU0FBb0I7UUFMaEMsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFDckIsZ0JBQVcsR0FBOEIsWUFBWSxDQUFDO1FBQ3RELFVBQUssR0FBc0IsU0FBUyxDQUFDO1FBQ3JDLGFBQVEsR0FBaUMsS0FBSyxDQUFDO1FBRVgsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQUMsQ0FBQzs7OztZQVI1RSxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFWeEIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nYkNvbmZpZ30gZnJvbSAnLi4vbmdiLWNvbmZpZyc7XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIHNlcnZpY2UgZm9yIHRoZSBbYE5nYk5hdmBdKCMvY29tcG9uZW50cy9uYXYvYXBpI05nYk5hdikgY29tcG9uZW50LlxuICpcbiAqIFlvdSBjYW4gaW5qZWN0IHRoaXMgc2VydmljZSwgdHlwaWNhbGx5IGluIHlvdXIgcm9vdCBjb21wb25lbnQsIGFuZCBjdXN0b21pemUgdGhlIHZhbHVlcyBvZiBpdHMgcHJvcGVydGllcyBpblxuICogb3JkZXIgdG8gcHJvdmlkZSBkZWZhdWx0IHZhbHVlcyBmb3IgYWxsIHRoZSBuYXZzIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBzaW5jZSA1LjIuMFxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBOZ2JOYXZDb25maWcge1xuICBhbmltYXRpb246IGJvb2xlYW47XG4gIGRlc3Ryb3lPbkhpZGUgPSB0cnVlO1xuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICdob3Jpem9udGFsJztcbiAgcm9sZXM6ICd0YWJsaXN0JyB8IGZhbHNlID0gJ3RhYmxpc3QnO1xuICBrZXlib2FyZDogYm9vbGVhbiB8ICdjaGFuZ2VXaXRoQXJyb3dzJyA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKG5nYkNvbmZpZzogTmdiQ29uZmlnKSB7IHRoaXMuYW5pbWF0aW9uID0gbmdiQ29uZmlnLmFuaW1hdGlvbjsgfVxufVxuIl19