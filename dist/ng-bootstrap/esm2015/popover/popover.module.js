import { NgModule } from '@angular/core';
import { NgbPopover, NgbPopoverWindow } from './popover';
import { CommonModule } from '@angular/common';
export { NgbPopover } from './popover';
export { NgbPopoverConfig } from './popover-config';
export class NgbPopoverModule {
}
NgbPopoverModule.decorators = [
    { type: NgModule, args: [{
                declarations: [NgbPopover, NgbPopoverWindow],
                exports: [NgbPopover],
                imports: [CommonModule],
                entryComponents: [NgbPopoverWindow]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbInBvcG92ZXIvcG9wb3Zlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2QyxPQUFPLEVBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU3QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBU2xELE1BQU0sT0FBTyxnQkFBZ0I7OztZQU41QixRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDO2dCQUM1QyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7Z0JBQ3JCLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsZUFBZSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7YUFDcEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtOZ2JQb3BvdmVyLCBOZ2JQb3BvdmVyV2luZG93fSBmcm9tICcuL3BvcG92ZXInO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmV4cG9ydCB7TmdiUG9wb3Zlcn0gZnJvbSAnLi9wb3BvdmVyJztcbmV4cG9ydCB7TmdiUG9wb3ZlckNvbmZpZ30gZnJvbSAnLi9wb3BvdmVyLWNvbmZpZyc7XG5leHBvcnQge1BsYWNlbWVudH0gZnJvbSAnLi4vdXRpbC9wb3NpdGlvbmluZyc7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW05nYlBvcG92ZXIsIE5nYlBvcG92ZXJXaW5kb3ddLFxuICBleHBvcnRzOiBbTmdiUG9wb3Zlcl0sXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICBlbnRyeUNvbXBvbmVudHM6IFtOZ2JQb3BvdmVyV2luZG93XVxufSlcbmV4cG9ydCBjbGFzcyBOZ2JQb3BvdmVyTW9kdWxlIHtcbn1cbiJdfQ==