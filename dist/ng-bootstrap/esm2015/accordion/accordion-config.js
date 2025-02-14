import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * A configuration service for the [NgbAccordion](#/components/accordion/api#NgbAccordion) component.
 *
 * You can inject this service, typically in your root component, and customize its properties
 * to provide default values for all accordions used in the application.
 */
export class NgbAccordionConfig {
    constructor(ngbConfig) {
        this.closeOthers = false;
        this.animation = ngbConfig.animation;
    }
}
NgbAccordionConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbAccordionConfig_Factory() { return new NgbAccordionConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbAccordionConfig, providedIn: "root" });
NgbAccordionConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbAccordionConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsiYWNjb3JkaW9uL2FjY29yZGlvbi1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFFeEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sa0JBQWtCO0lBSzdCLFlBQVksU0FBb0I7UUFIaEMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFHZ0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQUMsQ0FBQzs7OztZQU41RSxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFSeEIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge05nYkNvbmZpZ30gZnJvbSAnLi4vbmdiLWNvbmZpZyc7XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIHNlcnZpY2UgZm9yIHRoZSBbTmdiQWNjb3JkaW9uXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JBY2NvcmRpb24pIGNvbXBvbmVudC5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCB0aGlzIHNlcnZpY2UsIHR5cGljYWxseSBpbiB5b3VyIHJvb3QgY29tcG9uZW50LCBhbmQgY3VzdG9taXplIGl0cyBwcm9wZXJ0aWVzXG4gKiB0byBwcm92aWRlIGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgYWNjb3JkaW9ucyB1c2VkIGluIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTmdiQWNjb3JkaW9uQ29uZmlnIHtcbiAgYW5pbWF0aW9uOiBib29sZWFuO1xuICBjbG9zZU90aGVycyA9IGZhbHNlO1xuICB0eXBlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmdiQ29uZmlnOiBOZ2JDb25maWcpIHsgdGhpcy5hbmltYXRpb24gPSBuZ2JDb25maWcuYW5pbWF0aW9uOyB9XG59XG4iXX0=