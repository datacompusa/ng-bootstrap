import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * A configuration service for the [NgbAlert](#/components/alert/api#NgbAlert) component.
 *
 * You can inject this service, typically in your root component, and customize its properties
 * to provide default values for all alerts used in the application.
 */
export class NgbAlertConfig {
    constructor(ngbConfig) {
        this.dismissible = true;
        this.type = 'warning';
        this.animation = ngbConfig.animation;
    }
}
NgbAlertConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbAlertConfig_Factory() { return new NgbAlertConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbAlertConfig, providedIn: "root" });
NgbAlertConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbAlertConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtY29uZmlnLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJhbGVydC9hbGVydC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFFeEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sY0FBYztJQUt6QixZQUFZLFNBQW9CO1FBSGhDLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLFNBQUksR0FBRyxTQUFTLENBQUM7UUFFbUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQUMsQ0FBQzs7OztZQU41RSxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFSeEIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nYkNvbmZpZ30gZnJvbSAnLi4vbmdiLWNvbmZpZyc7XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIHNlcnZpY2UgZm9yIHRoZSBbTmdiQWxlcnRdKCMvY29tcG9uZW50cy9hbGVydC9hcGkjTmdiQWxlcnQpIGNvbXBvbmVudC5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCB0aGlzIHNlcnZpY2UsIHR5cGljYWxseSBpbiB5b3VyIHJvb3QgY29tcG9uZW50LCBhbmQgY3VzdG9taXplIGl0cyBwcm9wZXJ0aWVzXG4gKiB0byBwcm92aWRlIGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgYWxlcnRzIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBOZ2JBbGVydENvbmZpZyB7XG4gIGFuaW1hdGlvbjogYm9vbGVhbjtcbiAgZGlzbWlzc2libGUgPSB0cnVlO1xuICB0eXBlID0gJ3dhcm5pbmcnO1xuXG4gIGNvbnN0cnVjdG9yKG5nYkNvbmZpZzogTmdiQ29uZmlnKSB7IHRoaXMuYW5pbWF0aW9uID0gbmdiQ29uZmlnLmFuaW1hdGlvbjsgfVxufVxuIl19