import { Injectable } from '@angular/core';
import { NgbConfig } from '../ngb-config';
import * as i0 from "@angular/core";
import * as i1 from "../ngb-config";
/**
 * A configuration service for the [`NgbPopover`](#/components/popover/api#NgbPopover) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the popovers used in the application.
 */
export class NgbPopoverConfig {
    constructor(ngbConfig) {
        this.autoClose = true;
        this.placement = 'auto';
        this.triggers = 'click';
        this.disablePopover = false;
        this.openDelay = 0;
        this.closeDelay = 0;
        this.animation = ngbConfig.animation;
    }
}
NgbPopoverConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbPopoverConfig_Factory() { return new NgbPopoverConfig(i0.ɵɵinject(i1.NgbConfig)); }, token: NgbPopoverConfig, providedIn: "root" });
NgbPopoverConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
NgbPopoverConfig.ctorParameters = () => [
    { type: NgbConfig }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci1jb25maWcuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbInBvcG92ZXIvcG9wb3Zlci1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7QUFFeEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBVzNCLFlBQVksU0FBb0I7UUFUaEMsY0FBUyxHQUFtQyxJQUFJLENBQUM7UUFDakQsY0FBUyxHQUFtQixNQUFNLENBQUM7UUFDbkMsYUFBUSxHQUFHLE9BQU8sQ0FBQztRQUVuQixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUV2QixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUVxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFBQyxDQUFDOzs7O1lBWjVFLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQVJ4QixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UGxhY2VtZW50QXJyYXl9IGZyb20gJy4uL3V0aWwvcG9zaXRpb25pbmcnO1xuaW1wb3J0IHtOZ2JDb25maWd9IGZyb20gJy4uL25nYi1jb25maWcnO1xuXG4vKipcbiAqIEEgY29uZmlndXJhdGlvbiBzZXJ2aWNlIGZvciB0aGUgW2BOZ2JQb3BvdmVyYF0oIy9jb21wb25lbnRzL3BvcG92ZXIvYXBpI05nYlBvcG92ZXIpIGNvbXBvbmVudC5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCB0aGlzIHNlcnZpY2UsIHR5cGljYWxseSBpbiB5b3VyIHJvb3QgY29tcG9uZW50LCBhbmQgY3VzdG9taXplIHRoZSB2YWx1ZXMgb2YgaXRzIHByb3BlcnRpZXMgaW5cbiAqIG9yZGVyIHRvIHByb3ZpZGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGFsbCB0aGUgcG9wb3ZlcnMgdXNlZCBpbiB0aGUgYXBwbGljYXRpb24uXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE5nYlBvcG92ZXJDb25maWcge1xuICBhbmltYXRpb246IGJvb2xlYW47XG4gIGF1dG9DbG9zZTogYm9vbGVhbiB8ICdpbnNpZGUnIHwgJ291dHNpZGUnID0gdHJ1ZTtcbiAgcGxhY2VtZW50OiBQbGFjZW1lbnRBcnJheSA9ICdhdXRvJztcbiAgdHJpZ2dlcnMgPSAnY2xpY2snO1xuICBjb250YWluZXI6IHN0cmluZztcbiAgZGlzYWJsZVBvcG92ZXIgPSBmYWxzZTtcbiAgcG9wb3ZlckNsYXNzOiBzdHJpbmc7XG4gIG9wZW5EZWxheSA9IDA7XG4gIGNsb3NlRGVsYXkgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKG5nYkNvbmZpZzogTmdiQ29uZmlnKSB7IHRoaXMuYW5pbWF0aW9uID0gbmdiQ29uZmlnLmFuaW1hdGlvbjsgfVxufVxuIl19