import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A configuration service for the [`NgbPagination`](#/components/pagination/api#NgbPagination) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the paginations used in the application.
 */
export class NgbPaginationConfig {
    constructor() {
        this.disabled = false;
        this.boundaryLinks = false;
        this.directionLinks = true;
        this.ellipses = true;
        this.maxSize = 0;
        this.pageSize = 10;
        this.rotate = false;
    }
}
NgbPaginationConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbPaginationConfig_Factory() { return new NgbPaginationConfig(); }, token: NgbPaginationConfig, providedIn: "root" });
NgbPaginationConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi1jb25maWcuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbInBhZ2luYXRpb24vcGFnaW5hdGlvbi1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFekM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sbUJBQW1CO0lBRGhDO1FBRUUsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUN0QixtQkFBYyxHQUFHLElBQUksQ0FBQztRQUN0QixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFDWixhQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2QsV0FBTSxHQUFHLEtBQUssQ0FBQztLQUVoQjs7OztZQVZBLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEEgY29uZmlndXJhdGlvbiBzZXJ2aWNlIGZvciB0aGUgW2BOZ2JQYWdpbmF0aW9uYF0oIy9jb21wb25lbnRzL3BhZ2luYXRpb24vYXBpI05nYlBhZ2luYXRpb24pIGNvbXBvbmVudC5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCB0aGlzIHNlcnZpY2UsIHR5cGljYWxseSBpbiB5b3VyIHJvb3QgY29tcG9uZW50LCBhbmQgY3VzdG9taXplIHRoZSB2YWx1ZXMgb2YgaXRzIHByb3BlcnRpZXMgaW5cbiAqIG9yZGVyIHRvIHByb3ZpZGUgZGVmYXVsdCB2YWx1ZXMgZm9yIGFsbCB0aGUgcGFnaW5hdGlvbnMgdXNlZCBpbiB0aGUgYXBwbGljYXRpb24uXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhZ2luYXRpb25Db25maWcge1xuICBkaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZGFyeUxpbmtzID0gZmFsc2U7XG4gIGRpcmVjdGlvbkxpbmtzID0gdHJ1ZTtcbiAgZWxsaXBzZXMgPSB0cnVlO1xuICBtYXhTaXplID0gMDtcbiAgcGFnZVNpemUgPSAxMDtcbiAgcm90YXRlID0gZmFsc2U7XG4gIHNpemU6ICdzbScgfCAnbGcnO1xufVxuIl19