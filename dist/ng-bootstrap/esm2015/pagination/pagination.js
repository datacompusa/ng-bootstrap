import { Component, ContentChild, Directive, EventEmitter, Input, Output, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { getValueInRange, isNumber } from '../util/util';
import { NgbPaginationConfig } from './pagination-config';
/**
 * A directive to match the 'ellipsis' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationEllipsis {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationEllipsis.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationEllipsis]' },] }
];
NgbPaginationEllipsis.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive to match the 'first' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationFirst {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationFirst.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationFirst]' },] }
];
NgbPaginationFirst.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive to match the 'last' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationLast {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationLast.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationLast]' },] }
];
NgbPaginationLast.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive to match the 'next' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationNext {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationNext.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationNext]' },] }
];
NgbPaginationNext.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive to match the page 'number' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationNumber {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationNumber.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationNumber]' },] }
];
NgbPaginationNumber.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive to match the 'previous' link template
 *
 * @since 4.1.0
 */
export class NgbPaginationPrevious {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPaginationPrevious.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPaginationPrevious]' },] }
];
NgbPaginationPrevious.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A component that displays page numbers and allows to customize them in several ways.
 */
export class NgbPagination {
    constructor(config) {
        this.pageCount = 0;
        this.pages = [];
        /**
         *  The current page.
         *
         *  Page numbers start with `1`.
         */
        this.page = 1;
        /**
         *  An event fired when the page is changed. Will fire only if collection size is set and all values are valid.
         *
         *  Event payload is the number of the newly selected page.
         *
         *  Page numbers start with `1`.
         */
        this.pageChange = new EventEmitter(true);
        this.disabled = config.disabled;
        this.boundaryLinks = config.boundaryLinks;
        this.directionLinks = config.directionLinks;
        this.ellipses = config.ellipses;
        this.maxSize = config.maxSize;
        this.pageSize = config.pageSize;
        this.rotate = config.rotate;
        this.size = config.size;
    }
    hasPrevious() { return this.page > 1; }
    hasNext() { return this.page < this.pageCount; }
    nextDisabled() { return !this.hasNext() || this.disabled; }
    previousDisabled() { return !this.hasPrevious() || this.disabled; }
    selectPage(pageNumber) { this._updatePages(pageNumber); }
    ngOnChanges(changes) { this._updatePages(this.page); }
    isEllipsis(pageNumber) { return pageNumber === -1; }
    /**
     * Appends ellipses and first/last page number to the displayed pages
     */
    _applyEllipses(start, end) {
        if (this.ellipses) {
            if (start > 0) {
                // The first page will always be included. If the displayed range
                // starts after the third page, then add ellipsis. But if the range
                // starts on the third page, then add the second page instead of
                // an ellipsis, because the ellipsis would only hide a single page.
                if (start > 2) {
                    this.pages.unshift(-1);
                }
                else if (start === 2) {
                    this.pages.unshift(2);
                }
                this.pages.unshift(1);
            }
            if (end < this.pageCount) {
                // The last page will always be included. If the displayed range
                // ends before the third-last page, then add ellipsis. But if the range
                // ends on third-last page, then add the second-last page instead of
                // an ellipsis, because the ellipsis would only hide a single page.
                if (end < (this.pageCount - 2)) {
                    this.pages.push(-1);
                }
                else if (end === (this.pageCount - 2)) {
                    this.pages.push(this.pageCount - 1);
                }
                this.pages.push(this.pageCount);
            }
        }
    }
    /**
     * Rotates page numbers based on maxSize items visible.
     * Currently selected page stays in the middle:
     *
     * Ex. for selected page = 6:
     * [5,*6*,7] for maxSize = 3
     * [4,5,*6*,7] for maxSize = 4
     */
    _applyRotation() {
        let start = 0;
        let end = this.pageCount;
        let leftOffset = Math.floor(this.maxSize / 2);
        let rightOffset = this.maxSize % 2 === 0 ? leftOffset - 1 : leftOffset;
        if (this.page <= leftOffset) {
            // very beginning, no rotation -> [0..maxSize]
            end = this.maxSize;
        }
        else if (this.pageCount - this.page < leftOffset) {
            // very end, no rotation -> [len-maxSize..len]
            start = this.pageCount - this.maxSize;
        }
        else {
            // rotate
            start = this.page - leftOffset - 1;
            end = this.page + rightOffset;
        }
        return [start, end];
    }
    /**
     * Paginates page numbers based on maxSize items per page.
     */
    _applyPagination() {
        let page = Math.ceil(this.page / this.maxSize) - 1;
        let start = page * this.maxSize;
        let end = start + this.maxSize;
        return [start, end];
    }
    _setPageInRange(newPageNo) {
        const prevPageNo = this.page;
        this.page = getValueInRange(newPageNo, this.pageCount, 1);
        if (this.page !== prevPageNo && isNumber(this.collectionSize)) {
            this.pageChange.emit(this.page);
        }
    }
    _updatePages(newPage) {
        this.pageCount = Math.ceil(this.collectionSize / this.pageSize);
        if (!isNumber(this.pageCount)) {
            this.pageCount = 0;
        }
        // fill-in model needed to render pages
        this.pages.length = 0;
        for (let i = 1; i <= this.pageCount; i++) {
            this.pages.push(i);
        }
        // set page within 1..max range
        this._setPageInRange(newPage);
        // apply maxSize if necessary
        if (this.maxSize > 0 && this.pageCount > this.maxSize) {
            let start = 0;
            let end = this.pageCount;
            // either paginating or rotating page numbers
            if (this.rotate) {
                [start, end] = this._applyRotation();
            }
            else {
                [start, end] = this._applyPagination();
            }
            this.pages = this.pages.slice(start, end);
            // adding ellipses
            this._applyEllipses(start, end);
        }
    }
}
NgbPagination.decorators = [
    { type: Component, args: [{
                selector: 'ngb-pagination',
                changeDetection: ChangeDetectionStrategy.OnPush,
                host: { 'role': 'navigation' },
                template: `
    <ng-template #first><span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span></ng-template>
    <ng-template #previous><span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span></ng-template>
    <ng-template #next><span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span></ng-template>
    <ng-template #last><span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span></ng-template>
    <ng-template #ellipsis>...</ng-template>
    <ng-template #defaultNumber let-page let-currentPage="currentPage">
      {{ page }}
      <span *ngIf="page === currentPage" class="sr-only">(current)</span>
    </ng-template>
    <ul [class]="'pagination' + (size ? ' pagination-' + size : '')">
      <li *ngIf="boundaryLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="First" i18n-aria-label="@@ngb.pagination.first-aria" class="page-link" href
          (click)="selectPage(1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplFirst?.templateRef || first"
                       [ngTemplateOutletContext]="{disabled: previousDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="directionLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="Previous" i18n-aria-label="@@ngb.pagination.previous-aria" class="page-link" href
          (click)="selectPage(page-1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplPrevious?.templateRef || previous"
                       [ngTemplateOutletContext]="{disabled: previousDisabled()}"></ng-template>
        </a>
      </li>
      <li *ngFor="let pageNumber of pages" class="page-item" [class.active]="pageNumber === page"
        [class.disabled]="isEllipsis(pageNumber) || disabled" [attr.aria-current]="(pageNumber === page ? 'page' : null)">
        <a *ngIf="isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
          <ng-template [ngTemplateOutlet]="tplEllipsis?.templateRef || ellipsis"
                       [ngTemplateOutletContext]="{disabled: true, currentPage: page}"></ng-template>
        </a>
        <a *ngIf="!isEllipsis(pageNumber)" class="page-link" href (click)="selectPage(pageNumber); $event.preventDefault()"
          [attr.tabindex]="disabled ? '-1' : null" [attr.aria-disabled]="disabled ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNumber?.templateRef || defaultNumber"
                       [ngTemplateOutletContext]="{disabled: disabled, $implicit: pageNumber, currentPage: page}"></ng-template>
        </a>
      </li>
      <li *ngIf="directionLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Next" i18n-aria-label="@@ngb.pagination.next-aria" class="page-link" href
          (click)="selectPage(page+1); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNext?.templateRef || next"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="boundaryLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Last" i18n-aria-label="@@ngb.pagination.last-aria" class="page-link" href
          (click)="selectPage(pageCount); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplLast?.templateRef || last"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>
    </ul>
  `
            },] }
];
NgbPagination.ctorParameters = () => [
    { type: NgbPaginationConfig }
];
NgbPagination.propDecorators = {
    tplEllipsis: [{ type: ContentChild, args: [NgbPaginationEllipsis, { static: false },] }],
    tplFirst: [{ type: ContentChild, args: [NgbPaginationFirst, { static: false },] }],
    tplLast: [{ type: ContentChild, args: [NgbPaginationLast, { static: false },] }],
    tplNext: [{ type: ContentChild, args: [NgbPaginationNext, { static: false },] }],
    tplNumber: [{ type: ContentChild, args: [NgbPaginationNumber, { static: false },] }],
    tplPrevious: [{ type: ContentChild, args: [NgbPaginationPrevious, { static: false },] }],
    disabled: [{ type: Input }],
    boundaryLinks: [{ type: Input }],
    directionLinks: [{ type: Input }],
    ellipses: [{ type: Input }],
    rotate: [{ type: Input }],
    collectionSize: [{ type: Input }],
    maxSize: [{ type: Input }],
    page: [{ type: Input }],
    pageSize: [{ type: Input }],
    pageChange: [{ type: Output }],
    size: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsicGFnaW5hdGlvbi9wYWdpbmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFFTix1QkFBdUIsRUFFdkIsV0FBVyxFQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUUsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBd0N4RDs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUFtQixXQUFrRDtRQUFsRCxnQkFBVyxHQUFYLFdBQVcsQ0FBdUM7SUFBRyxDQUFDOzs7WUFGMUUsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLG9DQUFvQyxFQUFDOzs7WUFoRHpELFdBQVc7O0FBcURiOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLFlBQW1CLFdBQWtEO1FBQWxELGdCQUFXLEdBQVgsV0FBVyxDQUF1QztJQUFHLENBQUM7OztZQUYxRSxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsaUNBQWlDLEVBQUM7OztZQTFEdEQsV0FBVzs7QUErRGI7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxpQkFBaUI7SUFDNUIsWUFBbUIsV0FBa0Q7UUFBbEQsZ0JBQVcsR0FBWCxXQUFXLENBQXVDO0lBQUcsQ0FBQzs7O1lBRjFFLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxnQ0FBZ0MsRUFBQzs7O1lBcEVyRCxXQUFXOztBQXlFYjs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLGlCQUFpQjtJQUM1QixZQUFtQixXQUFrRDtRQUFsRCxnQkFBVyxHQUFYLFdBQVcs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QyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakM7SUFDSCxDQUFDOzs7WUE3UkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsWUFBWSxFQUFDO2dCQUM1QixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTREVDthQUNGOzs7WUF4S08sbUJBQW1COzs7MEJBNkt4QixZQUFZLFNBQUMscUJBQXFCLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3VCQUNuRCxZQUFZLFNBQUMsa0JBQWtCLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3NCQUNoRCxZQUFZLFNBQUMsaUJBQWlCLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3NCQUMvQyxZQUFZLFNBQUMsaUJBQWlCLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3dCQUMvQyxZQUFZLFNBQUMsbUJBQW1CLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDOzBCQUNqRCxZQUFZLFNBQUMscUJBQXFCLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3VCQUtuRCxLQUFLOzRCQUtMLEtBQUs7NkJBS0wsS0FBSzt1QkFLTCxLQUFLO3FCQU9MLEtBQUs7NkJBU0wsS0FBSztzQkFLTCxLQUFLO21CQU9MLEtBQUs7dUJBS0wsS0FBSzt5QkFTTCxNQUFNO21CQU9OLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgRGlyZWN0aXZlLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIE9uQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtnZXRWYWx1ZUluUmFuZ2UsIGlzTnVtYmVyfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IHtOZ2JQYWdpbmF0aW9uQ29uZmlnfSBmcm9tICcuL3BhZ2luYXRpb24tY29uZmlnJztcblxuLyoqXG4gKiBBIGNvbnRleHQgZm9yIHRoZVxuICogKiBgTmdiUGFnaW5hdGlvbkZpcnN0YFxuICogKiBgTmdiUGFnaW5hdGlvblByZXZpb3VzYFxuICogKiBgTmdiUGFnaW5hdGlvbk5leHRgXG4gKiAqIGBOZ2JQYWdpbmF0aW9uTGFzdGBcbiAqICogYE5nYlBhZ2luYXRpb25FbGxpcHNpc2BcbiAqXG4gKiBsaW5rIHRlbXBsYXRlcyBpbiBjYXNlIHlvdSB3YW50IHRvIG92ZXJyaWRlIG9uZS5cbiAqXG4gKiBAc2luY2UgNC4xLjBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHQge1xuICAvKipcbiAgICogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBwYWdlIG51bWJlclxuICAgKi9cbiAgY3VycmVudFBhZ2U6IG51bWJlcjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCB0aGUgY3VycmVudCBsaW5rIGlzIGRpc2FibGVkXG4gICAqL1xuICBkaXNhYmxlZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIGNvbnRleHQgZm9yIHRoZSBgTmdiUGFnaW5hdGlvbk51bWJlcmAgbGluayB0ZW1wbGF0ZSBpbiBjYXNlIHlvdSB3YW50IHRvIG92ZXJyaWRlIG9uZS5cbiAqXG4gKiBFeHRlbmRzIGBOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHRgLlxuICpcbiAqIEBzaW5jZSA0LjEuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlBhZ2luYXRpb25OdW1iZXJDb250ZXh0IGV4dGVuZHMgTmdiUGFnaW5hdGlvbkxpbmtDb250ZXh0IHtcbiAgLyoqXG4gICAqIFRoZSBwYWdlIG51bWJlciwgZGlzcGxheWVkIGJ5IHRoZSBjdXJyZW50IHBhZ2UgbGluay5cbiAgICovXG4gICRpbXBsaWNpdDogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIG1hdGNoIHRoZSAnZWxsaXBzaXMnIGxpbmsgdGVtcGxhdGVcbiAqXG4gKiBAc2luY2UgNC4xLjBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYWdpbmF0aW9uRWxsaXBzaXNdJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFnaW5hdGlvbkVsbGlwc2lzIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHQ+KSB7fVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIG1hdGNoIHRoZSAnZmlyc3QnIGxpbmsgdGVtcGxhdGVcbiAqXG4gKiBAc2luY2UgNC4xLjBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYWdpbmF0aW9uRmlyc3RdJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFnaW5hdGlvbkZpcnN0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHQ+KSB7fVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIG1hdGNoIHRoZSAnbGFzdCcgbGluayB0ZW1wbGF0ZVxuICpcbiAqIEBzaW5jZSA0LjEuMFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ25nLXRlbXBsYXRlW25nYlBhZ2luYXRpb25MYXN0XSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhZ2luYXRpb25MYXN0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHQ+KSB7fVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIG1hdGNoIHRoZSAnbmV4dCcgbGluayB0ZW1wbGF0ZVxuICpcbiAqIEBzaW5jZSA0LjEuMFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ25nLXRlbXBsYXRlW25nYlBhZ2luYXRpb25OZXh0XSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhZ2luYXRpb25OZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ2JQYWdpbmF0aW9uTGlua0NvbnRleHQ+KSB7fVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIG1hdGNoIHRoZSBwYWdlICdudW1iZXInIGxpbmsgdGVtcGxhdGVcbiAqXG4gKiBAc2luY2UgNC4xLjBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYWdpbmF0aW9uTnVtYmVyXSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhZ2luYXRpb25OdW1iZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nYlBhZ2luYXRpb25OdW1iZXJDb250ZXh0Pikge31cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0byBtYXRjaCB0aGUgJ3ByZXZpb3VzJyBsaW5rIHRlbXBsYXRlXG4gKlxuICogQHNpbmNlIDQuMS4wXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmctdGVtcGxhdGVbbmdiUGFnaW5hdGlvblByZXZpb3VzXSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhZ2luYXRpb25QcmV2aW91cyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdiUGFnaW5hdGlvbkxpbmtDb250ZXh0Pikge31cbn1cblxuLyoqXG4gKiBBIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHBhZ2UgbnVtYmVycyBhbmQgYWxsb3dzIHRvIGN1c3RvbWl6ZSB0aGVtIGluIHNldmVyYWwgd2F5cy5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmdiLXBhZ2luYXRpb24nLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaG9zdDogeydyb2xlJzogJ25hdmlnYXRpb24nfSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGUgI2ZpcnN0PjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGkxOG49XCJAQG5nYi5wYWdpbmF0aW9uLmZpcnN0XCI+JmxhcXVvOyZsYXF1bzs8L3NwYW4+PC9uZy10ZW1wbGF0ZT5cbiAgICA8bmctdGVtcGxhdGUgI3ByZXZpb3VzPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIGkxOG49XCJAQG5nYi5wYWdpbmF0aW9uLnByZXZpb3VzXCI+JmxhcXVvOzwvc3Bhbj48L25nLXRlbXBsYXRlPlxuICAgIDxuZy10ZW1wbGF0ZSAjbmV4dD48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBpMThuPVwiQEBuZ2IucGFnaW5hdGlvbi5uZXh0XCI+JnJhcXVvOzwvc3Bhbj48L25nLXRlbXBsYXRlPlxuICAgIDxuZy10ZW1wbGF0ZSAjbGFzdD48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIiBpMThuPVwiQEBuZ2IucGFnaW5hdGlvbi5sYXN0XCI+JnJhcXVvOyZyYXF1bzs8L3NwYW4+PC9uZy10ZW1wbGF0ZT5cbiAgICA8bmctdGVtcGxhdGUgI2VsbGlwc2lzPi4uLjwvbmctdGVtcGxhdGU+XG4gICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0TnVtYmVyIGxldC1wYWdlIGxldC1jdXJyZW50UGFnZT1cImN1cnJlbnRQYWdlXCI+XG4gICAgICB7eyBwYWdlIH19XG4gICAgICA8c3BhbiAqbmdJZj1cInBhZ2UgPT09IGN1cnJlbnRQYWdlXCIgY2xhc3M9XCJzci1vbmx5XCI+KGN1cnJlbnQpPC9zcGFuPlxuICAgIDwvbmctdGVtcGxhdGU+XG4gICAgPHVsIFtjbGFzc109XCIncGFnaW5hdGlvbicgKyAoc2l6ZSA/ICcgcGFnaW5hdGlvbi0nICsgc2l6ZSA6ICcnKVwiPlxuICAgICAgPGxpICpuZ0lmPVwiYm91bmRhcnlMaW5rc1wiIGNsYXNzPVwicGFnZS1pdGVtXCJcbiAgICAgICAgW2NsYXNzLmRpc2FibGVkXT1cInByZXZpb3VzRGlzYWJsZWQoKVwiPlxuICAgICAgICA8YSBhcmlhLWxhYmVsPVwiRmlyc3RcIiBpMThuLWFyaWEtbGFiZWw9XCJAQG5nYi5wYWdpbmF0aW9uLmZpcnN0LWFyaWFcIiBjbGFzcz1cInBhZ2UtbGlua1wiIGhyZWZcbiAgICAgICAgICAoY2xpY2spPVwic2VsZWN0UGFnZSgxKTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiBbYXR0ci50YWJpbmRleF09XCJwcmV2aW91c0Rpc2FibGVkKCkgPyAnLTEnIDogbnVsbFwiXG4gICAgICAgICAgW2F0dHIuYXJpYS1kaXNhYmxlZF09XCJwcmV2aW91c0Rpc2FibGVkKCkgPyAndHJ1ZScgOiBudWxsXCI+XG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRwbEZpcnN0Py50ZW1wbGF0ZVJlZiB8fCBmaXJzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGlzYWJsZWQ6IHByZXZpb3VzRGlzYWJsZWQoKSwgY3VycmVudFBhZ2U6IHBhZ2V9XCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cblxuICAgICAgPGxpICpuZ0lmPVwiZGlyZWN0aW9uTGlua3NcIiBjbGFzcz1cInBhZ2UtaXRlbVwiXG4gICAgICAgIFtjbGFzcy5kaXNhYmxlZF09XCJwcmV2aW91c0Rpc2FibGVkKClcIj5cbiAgICAgICAgPGEgYXJpYS1sYWJlbD1cIlByZXZpb3VzXCIgaTE4bi1hcmlhLWxhYmVsPVwiQEBuZ2IucGFnaW5hdGlvbi5wcmV2aW91cy1hcmlhXCIgY2xhc3M9XCJwYWdlLWxpbmtcIiBocmVmXG4gICAgICAgICAgKGNsaWNrKT1cInNlbGVjdFBhZ2UocGFnZS0xKTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiBbYXR0ci50YWJpbmRleF09XCJwcmV2aW91c0Rpc2FibGVkKCkgPyAnLTEnIDogbnVsbFwiXG4gICAgICAgICAgW2F0dHIuYXJpYS1kaXNhYmxlZF09XCJwcmV2aW91c0Rpc2FibGVkKCkgPyAndHJ1ZScgOiBudWxsXCI+XG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRwbFByZXZpb3VzPy50ZW1wbGF0ZVJlZiB8fCBwcmV2aW91c1wiXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGlzYWJsZWQ6IHByZXZpb3VzRGlzYWJsZWQoKX1cIj48L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgICAgPGxpICpuZ0Zvcj1cImxldCBwYWdlTnVtYmVyIG9mIHBhZ2VzXCIgY2xhc3M9XCJwYWdlLWl0ZW1cIiBbY2xhc3MuYWN0aXZlXT1cInBhZ2VOdW1iZXIgPT09IHBhZ2VcIlxuICAgICAgICBbY2xhc3MuZGlzYWJsZWRdPVwiaXNFbGxpcHNpcyhwYWdlTnVtYmVyKSB8fCBkaXNhYmxlZFwiIFthdHRyLmFyaWEtY3VycmVudF09XCIocGFnZU51bWJlciA9PT0gcGFnZSA/ICdwYWdlJyA6IG51bGwpXCI+XG4gICAgICAgIDxhICpuZ0lmPVwiaXNFbGxpcHNpcyhwYWdlTnVtYmVyKVwiIGNsYXNzPVwicGFnZS1saW5rXCIgdGFiaW5kZXg9XCItMVwiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+XG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRwbEVsbGlwc2lzPy50ZW1wbGF0ZVJlZiB8fCBlbGxpcHNpc1wiXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGlzYWJsZWQ6IHRydWUsIGN1cnJlbnRQYWdlOiBwYWdlfVwiPjwvbmctdGVtcGxhdGU+XG4gICAgICAgIDwvYT5cbiAgICAgICAgPGEgKm5nSWY9XCIhaXNFbGxpcHNpcyhwYWdlTnVtYmVyKVwiIGNsYXNzPVwicGFnZS1saW5rXCIgaHJlZiAoY2xpY2spPVwic2VsZWN0UGFnZShwYWdlTnVtYmVyKTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIlxuICAgICAgICAgIFthdHRyLnRhYmluZGV4XT1cImRpc2FibGVkID8gJy0xJyA6IG51bGxcIiBbYXR0ci5hcmlhLWRpc2FibGVkXT1cImRpc2FibGVkID8gJ3RydWUnIDogbnVsbFwiPlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJ0cGxOdW1iZXI/LnRlbXBsYXRlUmVmIHx8IGRlZmF1bHROdW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie2Rpc2FibGVkOiBkaXNhYmxlZCwgJGltcGxpY2l0OiBwYWdlTnVtYmVyLCBjdXJyZW50UGFnZTogcGFnZX1cIj48L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgICAgPGxpICpuZ0lmPVwiZGlyZWN0aW9uTGlua3NcIiBjbGFzcz1cInBhZ2UtaXRlbVwiIFtjbGFzcy5kaXNhYmxlZF09XCJuZXh0RGlzYWJsZWQoKVwiPlxuICAgICAgICA8YSBhcmlhLWxhYmVsPVwiTmV4dFwiIGkxOG4tYXJpYS1sYWJlbD1cIkBAbmdiLnBhZ2luYXRpb24ubmV4dC1hcmlhXCIgY2xhc3M9XCJwYWdlLWxpbmtcIiBocmVmXG4gICAgICAgICAgKGNsaWNrKT1cInNlbGVjdFBhZ2UocGFnZSsxKTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiBbYXR0ci50YWJpbmRleF09XCJuZXh0RGlzYWJsZWQoKSA/ICctMScgOiBudWxsXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWRpc2FibGVkXT1cIm5leHREaXNhYmxlZCgpID8gJ3RydWUnIDogbnVsbFwiPlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJ0cGxOZXh0Py50ZW1wbGF0ZVJlZiB8fCBuZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkaXNhYmxlZDogbmV4dERpc2FibGVkKCksIGN1cnJlbnRQYWdlOiBwYWdlfVwiPjwvbmctdGVtcGxhdGU+XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaSAqbmdJZj1cImJvdW5kYXJ5TGlua3NcIiBjbGFzcz1cInBhZ2UtaXRlbVwiIFtjbGFzcy5kaXNhYmxlZF09XCJuZXh0RGlzYWJsZWQoKVwiPlxuICAgICAgICA8YSBhcmlhLWxhYmVsPVwiTGFzdFwiIGkxOG4tYXJpYS1sYWJlbD1cIkBAbmdiLnBhZ2luYXRpb24ubGFzdC1hcmlhXCIgY2xhc3M9XCJwYWdlLWxpbmtcIiBocmVmXG4gICAgICAgICAgKGNsaWNrKT1cInNlbGVjdFBhZ2UocGFnZUNvdW50KTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiBbYXR0ci50YWJpbmRleF09XCJuZXh0RGlzYWJsZWQoKSA/ICctMScgOiBudWxsXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWRpc2FibGVkXT1cIm5leHREaXNhYmxlZCgpID8gJ3RydWUnIDogbnVsbFwiPlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJ0cGxMYXN0Py50ZW1wbGF0ZVJlZiB8fCBsYXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkaXNhYmxlZDogbmV4dERpc2FibGVkKCksIGN1cnJlbnRQYWdlOiBwYWdlfVwiPjwvbmctdGVtcGxhdGU+XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBOZ2JQYWdpbmF0aW9uIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgcGFnZUNvdW50ID0gMDtcbiAgcGFnZXM6IG51bWJlcltdID0gW107XG5cbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uRWxsaXBzaXMsIHtzdGF0aWM6IGZhbHNlfSkgdHBsRWxsaXBzaXM6IE5nYlBhZ2luYXRpb25FbGxpcHNpcztcbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uRmlyc3QsIHtzdGF0aWM6IGZhbHNlfSkgdHBsRmlyc3Q6IE5nYlBhZ2luYXRpb25GaXJzdDtcbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uTGFzdCwge3N0YXRpYzogZmFsc2V9KSB0cGxMYXN0OiBOZ2JQYWdpbmF0aW9uTGFzdDtcbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uTmV4dCwge3N0YXRpYzogZmFsc2V9KSB0cGxOZXh0OiBOZ2JQYWdpbmF0aW9uTmV4dDtcbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uTnVtYmVyLCB7c3RhdGljOiBmYWxzZX0pIHRwbE51bWJlcjogTmdiUGFnaW5hdGlvbk51bWJlcjtcbiAgQENvbnRlbnRDaGlsZChOZ2JQYWdpbmF0aW9uUHJldmlvdXMsIHtzdGF0aWM6IGZhbHNlfSkgdHBsUHJldmlvdXM6IE5nYlBhZ2luYXRpb25QcmV2aW91cztcblxuICAvKipcbiAgICogSWYgYHRydWVgLCBwYWdpbmF0aW9uIGxpbmtzIHdpbGwgYmUgZGlzYWJsZWQuXG4gICAqL1xuICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCB0aGUgXCJGaXJzdFwiIGFuZCBcIkxhc3RcIiBwYWdlIGxpbmtzIGFyZSBzaG93bi5cbiAgICovXG4gIEBJbnB1dCgpIGJvdW5kYXJ5TGlua3M6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgdGhlIFwiTmV4dFwiIGFuZCBcIlByZXZpb3VzXCIgcGFnZSBsaW5rcyBhcmUgc2hvd24uXG4gICAqL1xuICBASW5wdXQoKSBkaXJlY3Rpb25MaW5rczogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCB0aGUgZWxsaXBzaXMgc3ltYm9scyBhbmQgZmlyc3QvbGFzdCBwYWdlIG51bWJlcnMgd2lsbCBiZSBzaG93biB3aGVuIGBtYXhTaXplYCA+IG51bWJlciBvZiBwYWdlcy5cbiAgICovXG4gIEBJbnB1dCgpIGVsbGlwc2VzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHJvdGF0ZSBwYWdlcyB3aGVuIGBtYXhTaXplYCA+IG51bWJlciBvZiBwYWdlcy5cbiAgICpcbiAgICogVGhlIGN1cnJlbnQgcGFnZSBhbHdheXMgc3RheXMgaW4gdGhlIG1pZGRsZSBpZiBgdHJ1ZWAuXG4gICAqL1xuICBASW5wdXQoKSByb3RhdGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqICBUaGUgbnVtYmVyIG9mIGl0ZW1zIGluIHlvdXIgcGFnaW5hdGVkIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqICBOb3RlLCB0aGF0IHRoaXMgaXMgbm90IHRoZSBudW1iZXIgb2YgcGFnZXMuIFBhZ2UgbnVtYmVycyBhcmUgY2FsY3VsYXRlZCBkeW5hbWljYWxseSBiYXNlZCBvblxuICAgKiAgYGNvbGxlY3Rpb25TaXplYCBhbmQgYHBhZ2VTaXplYC4gRXguIGlmIHlvdSBoYXZlIDEwMCBpdGVtcyBpbiB5b3VyIGNvbGxlY3Rpb24gYW5kIGRpc3BsYXlpbmcgMjAgaXRlbXMgcGVyIHBhZ2UsXG4gICAqICB5b3UnbGwgZW5kIHVwIHdpdGggNSBwYWdlcy5cbiAgICovXG4gIEBJbnB1dCgpIGNvbGxlY3Rpb25TaXplOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqICBUaGUgbWF4aW11bSBudW1iZXIgb2YgcGFnZXMgdG8gZGlzcGxheS5cbiAgICovXG4gIEBJbnB1dCgpIG1heFNpemU6IG51bWJlcjtcblxuICAvKipcbiAgICogIFRoZSBjdXJyZW50IHBhZ2UuXG4gICAqXG4gICAqICBQYWdlIG51bWJlcnMgc3RhcnQgd2l0aCBgMWAuXG4gICAqL1xuICBASW5wdXQoKSBwYWdlID0gMTtcblxuICAvKipcbiAgICogIFRoZSBudW1iZXIgb2YgaXRlbXMgcGVyIHBhZ2UuXG4gICAqL1xuICBASW5wdXQoKSBwYWdlU2l6ZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiAgQW4gZXZlbnQgZmlyZWQgd2hlbiB0aGUgcGFnZSBpcyBjaGFuZ2VkLiBXaWxsIGZpcmUgb25seSBpZiBjb2xsZWN0aW9uIHNpemUgaXMgc2V0IGFuZCBhbGwgdmFsdWVzIGFyZSB2YWxpZC5cbiAgICpcbiAgICogIEV2ZW50IHBheWxvYWQgaXMgdGhlIG51bWJlciBvZiB0aGUgbmV3bHkgc2VsZWN0ZWQgcGFnZS5cbiAgICpcbiAgICogIFBhZ2UgbnVtYmVycyBzdGFydCB3aXRoIGAxYC5cbiAgICovXG4gIEBPdXRwdXQoKSBwYWdlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFnaW5hdGlvbiBkaXNwbGF5IHNpemUuXG4gICAqXG4gICAqIEJvb3RzdHJhcCBjdXJyZW50bHkgc3VwcG9ydHMgc21hbGwgYW5kIGxhcmdlIHNpemVzLlxuICAgKi9cbiAgQElucHV0KCkgc2l6ZTogJ3NtJyB8ICdsZyc7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBOZ2JQYWdpbmF0aW9uQ29uZmlnKSB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGNvbmZpZy5kaXNhYmxlZDtcbiAgICB0aGlzLmJvdW5kYXJ5TGlua3MgPSBjb25maWcuYm91bmRhcnlMaW5rcztcbiAgICB0aGlzLmRpcmVjdGlvbkxpbmtzID0gY29uZmlnLmRpcmVjdGlvbkxpbmtzO1xuICAgIHRoaXMuZWxsaXBzZXMgPSBjb25maWcuZWxsaXBzZXM7XG4gICAgdGhpcy5tYXhTaXplID0gY29uZmlnLm1heFNpemU7XG4gICAgdGhpcy5wYWdlU2l6ZSA9IGNvbmZpZy5wYWdlU2l6ZTtcbiAgICB0aGlzLnJvdGF0ZSA9IGNvbmZpZy5yb3RhdGU7XG4gICAgdGhpcy5zaXplID0gY29uZmlnLnNpemU7XG4gIH1cblxuICBoYXNQcmV2aW91cygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucGFnZSA+IDE7IH1cblxuICBoYXNOZXh0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYWdlIDwgdGhpcy5wYWdlQ291bnQ7IH1cblxuICBuZXh0RGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNOZXh0KCkgfHwgdGhpcy5kaXNhYmxlZDsgfVxuXG4gIHByZXZpb3VzRGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNQcmV2aW91cygpIHx8IHRoaXMuZGlzYWJsZWQ7IH1cblxuICBzZWxlY3RQYWdlKHBhZ2VOdW1iZXI6IG51bWJlcik6IHZvaWQgeyB0aGlzLl91cGRhdGVQYWdlcyhwYWdlTnVtYmVyKTsgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHsgdGhpcy5fdXBkYXRlUGFnZXModGhpcy5wYWdlKTsgfVxuXG4gIGlzRWxsaXBzaXMocGFnZU51bWJlcik6IGJvb2xlYW4geyByZXR1cm4gcGFnZU51bWJlciA9PT0gLTE7IH1cblxuICAvKipcbiAgICogQXBwZW5kcyBlbGxpcHNlcyBhbmQgZmlyc3QvbGFzdCBwYWdlIG51bWJlciB0byB0aGUgZGlzcGxheWVkIHBhZ2VzXG4gICAqL1xuICBwcml2YXRlIF9hcHBseUVsbGlwc2VzKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuZWxsaXBzZXMpIHtcbiAgICAgIGlmIChzdGFydCA+IDApIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IHBhZ2Ugd2lsbCBhbHdheXMgYmUgaW5jbHVkZWQuIElmIHRoZSBkaXNwbGF5ZWQgcmFuZ2VcbiAgICAgICAgLy8gc3RhcnRzIGFmdGVyIHRoZSB0aGlyZCBwYWdlLCB0aGVuIGFkZCBlbGxpcHNpcy4gQnV0IGlmIHRoZSByYW5nZVxuICAgICAgICAvLyBzdGFydHMgb24gdGhlIHRoaXJkIHBhZ2UsIHRoZW4gYWRkIHRoZSBzZWNvbmQgcGFnZSBpbnN0ZWFkIG9mXG4gICAgICAgIC8vIGFuIGVsbGlwc2lzLCBiZWNhdXNlIHRoZSBlbGxpcHNpcyB3b3VsZCBvbmx5IGhpZGUgYSBzaW5nbGUgcGFnZS5cbiAgICAgICAgaWYgKHN0YXJ0ID4gMikge1xuICAgICAgICAgIHRoaXMucGFnZXMudW5zaGlmdCgtMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnQgPT09IDIpIHtcbiAgICAgICAgICB0aGlzLnBhZ2VzLnVuc2hpZnQoMik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYWdlcy51bnNoaWZ0KDEpO1xuICAgICAgfVxuICAgICAgaWYgKGVuZCA8IHRoaXMucGFnZUNvdW50KSB7XG4gICAgICAgIC8vIFRoZSBsYXN0IHBhZ2Ugd2lsbCBhbHdheXMgYmUgaW5jbHVkZWQuIElmIHRoZSBkaXNwbGF5ZWQgcmFuZ2VcbiAgICAgICAgLy8gZW5kcyBiZWZvcmUgdGhlIHRoaXJkLWxhc3QgcGFnZSwgdGhlbiBhZGQgZWxsaXBzaXMuIEJ1dCBpZiB0aGUgcmFuZ2VcbiAgICAgICAgLy8gZW5kcyBvbiB0aGlyZC1sYXN0IHBhZ2UsIHRoZW4gYWRkIHRoZSBzZWNvbmQtbGFzdCBwYWdlIGluc3RlYWQgb2ZcbiAgICAgICAgLy8gYW4gZWxsaXBzaXMsIGJlY2F1c2UgdGhlIGVsbGlwc2lzIHdvdWxkIG9ubHkgaGlkZSBhIHNpbmdsZSBwYWdlLlxuICAgICAgICBpZiAoZW5kIDwgKHRoaXMucGFnZUNvdW50IC0gMikpIHtcbiAgICAgICAgICB0aGlzLnBhZ2VzLnB1c2goLTEpO1xuICAgICAgICB9IGVsc2UgaWYgKGVuZCA9PT0gKHRoaXMucGFnZUNvdW50IC0gMikpIHtcbiAgICAgICAgICB0aGlzLnBhZ2VzLnB1c2godGhpcy5wYWdlQ291bnQgLSAxKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhZ2VzLnB1c2godGhpcy5wYWdlQ291bnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVzIHBhZ2UgbnVtYmVycyBiYXNlZCBvbiBtYXhTaXplIGl0ZW1zIHZpc2libGUuXG4gICAqIEN1cnJlbnRseSBzZWxlY3RlZCBwYWdlIHN0YXlzIGluIHRoZSBtaWRkbGU6XG4gICAqXG4gICAqIEV4LiBmb3Igc2VsZWN0ZWQgcGFnZSA9IDY6XG4gICAqIFs1LCo2Kiw3XSBmb3IgbWF4U2l6ZSA9IDNcbiAgICogWzQsNSwqNiosN10gZm9yIG1heFNpemUgPSA0XG4gICAqL1xuICBwcml2YXRlIF9hcHBseVJvdGF0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgbGV0IGVuZCA9IHRoaXMucGFnZUNvdW50O1xuICAgIGxldCBsZWZ0T2Zmc2V0ID0gTWF0aC5mbG9vcih0aGlzLm1heFNpemUgLyAyKTtcbiAgICBsZXQgcmlnaHRPZmZzZXQgPSB0aGlzLm1heFNpemUgJSAyID09PSAwID8gbGVmdE9mZnNldCAtIDEgOiBsZWZ0T2Zmc2V0O1xuXG4gICAgaWYgKHRoaXMucGFnZSA8PSBsZWZ0T2Zmc2V0KSB7XG4gICAgICAvLyB2ZXJ5IGJlZ2lubmluZywgbm8gcm90YXRpb24gLT4gWzAuLm1heFNpemVdXG4gICAgICBlbmQgPSB0aGlzLm1heFNpemU7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBhZ2VDb3VudCAtIHRoaXMucGFnZSA8IGxlZnRPZmZzZXQpIHtcbiAgICAgIC8vIHZlcnkgZW5kLCBubyByb3RhdGlvbiAtPiBbbGVuLW1heFNpemUuLmxlbl1cbiAgICAgIHN0YXJ0ID0gdGhpcy5wYWdlQ291bnQgLSB0aGlzLm1heFNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJvdGF0ZVxuICAgICAgc3RhcnQgPSB0aGlzLnBhZ2UgLSBsZWZ0T2Zmc2V0IC0gMTtcbiAgICAgIGVuZCA9IHRoaXMucGFnZSArIHJpZ2h0T2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiBbc3RhcnQsIGVuZF07XG4gIH1cblxuICAvKipcbiAgICogUGFnaW5hdGVzIHBhZ2UgbnVtYmVycyBiYXNlZCBvbiBtYXhTaXplIGl0ZW1zIHBlciBwYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlQYWdpbmF0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGxldCBwYWdlID0gTWF0aC5jZWlsKHRoaXMucGFnZSAvIHRoaXMubWF4U2l6ZSkgLSAxO1xuICAgIGxldCBzdGFydCA9IHBhZ2UgKiB0aGlzLm1heFNpemU7XG4gICAgbGV0IGVuZCA9IHN0YXJ0ICsgdGhpcy5tYXhTaXplO1xuXG4gICAgcmV0dXJuIFtzdGFydCwgZW5kXTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFBhZ2VJblJhbmdlKG5ld1BhZ2VObykge1xuICAgIGNvbnN0IHByZXZQYWdlTm8gPSB0aGlzLnBhZ2U7XG4gICAgdGhpcy5wYWdlID0gZ2V0VmFsdWVJblJhbmdlKG5ld1BhZ2VObywgdGhpcy5wYWdlQ291bnQsIDEpO1xuXG4gICAgaWYgKHRoaXMucGFnZSAhPT0gcHJldlBhZ2VObyAmJiBpc051bWJlcih0aGlzLmNvbGxlY3Rpb25TaXplKSkge1xuICAgICAgdGhpcy5wYWdlQ2hhbmdlLmVtaXQodGhpcy5wYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVQYWdlcyhuZXdQYWdlOiBudW1iZXIpIHtcbiAgICB0aGlzLnBhZ2VDb3VudCA9IE1hdGguY2VpbCh0aGlzLmNvbGxlY3Rpb25TaXplIC8gdGhpcy5wYWdlU2l6ZSk7XG5cbiAgICBpZiAoIWlzTnVtYmVyKHRoaXMucGFnZUNvdW50KSkge1xuICAgICAgdGhpcy5wYWdlQ291bnQgPSAwO1xuICAgIH1cblxuICAgIC8vIGZpbGwtaW4gbW9kZWwgbmVlZGVkIHRvIHJlbmRlciBwYWdlc1xuICAgIHRoaXMucGFnZXMubGVuZ3RoID0gMDtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLnBhZ2VDb3VudDsgaSsrKSB7XG4gICAgICB0aGlzLnBhZ2VzLnB1c2goaSk7XG4gICAgfVxuXG4gICAgLy8gc2V0IHBhZ2Ugd2l0aGluIDEuLm1heCByYW5nZVxuICAgIHRoaXMuX3NldFBhZ2VJblJhbmdlKG5ld1BhZ2UpO1xuXG4gICAgLy8gYXBwbHkgbWF4U2l6ZSBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5tYXhTaXplID4gMCAmJiB0aGlzLnBhZ2VDb3VudCA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgIGxldCBlbmQgPSB0aGlzLnBhZ2VDb3VudDtcblxuICAgICAgLy8gZWl0aGVyIHBhZ2luYXRpbmcgb3Igcm90YXRpbmcgcGFnZSBudW1iZXJzXG4gICAgICBpZiAodGhpcy5yb3RhdGUpIHtcbiAgICAgICAgW3N0YXJ0LCBlbmRdID0gdGhpcy5fYXBwbHlSb3RhdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgW3N0YXJ0LCBlbmRdID0gdGhpcy5fYXBwbHlQYWdpbmF0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucGFnZXMgPSB0aGlzLnBhZ2VzLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICAvLyBhZGRpbmcgZWxsaXBzZXNcbiAgICAgIHRoaXMuX2FwcGx5RWxsaXBzZXMoc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9XG59XG4iXX0=