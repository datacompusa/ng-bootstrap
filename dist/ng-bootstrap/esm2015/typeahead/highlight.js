import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { regExpEscape, toString } from '../util/util';
/**
 * A component that helps with text highlighting.
 *
 * If splits the `result` text into parts that contain the searched `term` and generates the HTML markup to simplify
 * highlighting:
 *
 * Ex. `result="Alaska"` and `term="as"` will produce `Al<span class="ngb-highlight">as</span>ka`.
 */
export class NgbHighlight {
    constructor() {
        /**
         * The CSS class for `<span>` elements wrapping the `term` inside the `result`.
         */
        this.highlightClass = 'ngb-highlight';
    }
    ngOnChanges(changes) {
        const result = toString(this.result);
        const terms = Array.isArray(this.term) ? this.term : [this.term];
        const escapedTerms = terms.map(term => regExpEscape(toString(term))).filter(term => term);
        this.parts = escapedTerms.length ? result.split(new RegExp(`(${escapedTerms.join('|')})`, 'gmi')) : [result];
    }
}
NgbHighlight.decorators = [
    { type: Component, args: [{
                selector: 'ngb-highlight',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                template: `<ng-template ngFor [ngForOf]="parts" let-part let-isOdd="odd">` +
                    `<span *ngIf="isOdd; else even" [class]="highlightClass">{{part}}</span><ng-template #even>{{part}}</ng-template>` +
                    `</ng-template>`,
                styles: [".ngb-highlight{font-weight:700}"]
            },] }
];
NgbHighlight.propDecorators = {
    highlightClass: [{ type: Input }],
    result: [{ type: Input }],
    term: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaGxpZ2h0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJ0eXBlYWhlYWQvaGlnaGxpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFhLHVCQUF1QixFQUFpQixpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNySCxPQUFPLEVBQUMsWUFBWSxFQUFFLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUVwRDs7Ozs7OztHQU9HO0FBVUgsTUFBTSxPQUFPLFlBQVk7SUFUekI7UUFZRTs7V0FFRztRQUNNLG1CQUFjLEdBQUcsZUFBZSxDQUFDO0lBd0I1QyxDQUFDO0lBUkMsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRixJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvRyxDQUFDOzs7WUF0Q0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2dCQUN6QixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLFFBQVEsRUFBRSxnRUFBZ0U7b0JBQ3RFLGtIQUFrSDtvQkFDbEgsZ0JBQWdCOzthQUVyQjs7OzZCQU9FLEtBQUs7cUJBUUwsS0FBSzttQkFNTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIElucHV0LCBPbkNoYW5nZXMsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBTaW1wbGVDaGFuZ2VzLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3JlZ0V4cEVzY2FwZSwgdG9TdHJpbmd9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCBoZWxwcyB3aXRoIHRleHQgaGlnaGxpZ2h0aW5nLlxuICpcbiAqIElmIHNwbGl0cyB0aGUgYHJlc3VsdGAgdGV4dCBpbnRvIHBhcnRzIHRoYXQgY29udGFpbiB0aGUgc2VhcmNoZWQgYHRlcm1gIGFuZCBnZW5lcmF0ZXMgdGhlIEhUTUwgbWFya3VwIHRvIHNpbXBsaWZ5XG4gKiBoaWdobGlnaHRpbmc6XG4gKlxuICogRXguIGByZXN1bHQ9XCJBbGFza2FcImAgYW5kIGB0ZXJtPVwiYXNcImAgd2lsbCBwcm9kdWNlIGBBbDxzcGFuIGNsYXNzPVwibmdiLWhpZ2hsaWdodFwiPmFzPC9zcGFuPmthYC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmdiLWhpZ2hsaWdodCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICB0ZW1wbGF0ZTogYDxuZy10ZW1wbGF0ZSBuZ0ZvciBbbmdGb3JPZl09XCJwYXJ0c1wiIGxldC1wYXJ0IGxldC1pc09kZD1cIm9kZFwiPmAgK1xuICAgICAgYDxzcGFuICpuZ0lmPVwiaXNPZGQ7IGVsc2UgZXZlblwiIFtjbGFzc109XCJoaWdobGlnaHRDbGFzc1wiPnt7cGFydH19PC9zcGFuPjxuZy10ZW1wbGF0ZSAjZXZlbj57e3BhcnR9fTwvbmctdGVtcGxhdGU+YCArXG4gICAgICBgPC9uZy10ZW1wbGF0ZT5gLCAgLy8gdGVtcGxhdGUgbmVlZHMgdG8gYmUgZm9ybWF0dGVkIGluIGEgY2VydGFpbiB3YXkgc28gd2UgZG9uJ3QgYWRkIGVtcHR5IHRleHQgbm9kZXNcbiAgc3R5bGVVcmxzOiBbJy4vaGlnaGxpZ2h0LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBOZ2JIaWdobGlnaHQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICBwYXJ0czogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFRoZSBDU1MgY2xhc3MgZm9yIGA8c3Bhbj5gIGVsZW1lbnRzIHdyYXBwaW5nIHRoZSBgdGVybWAgaW5zaWRlIHRoZSBgcmVzdWx0YC5cbiAgICovXG4gIEBJbnB1dCgpIGhpZ2hsaWdodENsYXNzID0gJ25nYi1oaWdobGlnaHQnO1xuXG4gIC8qKlxuICAgKiBUaGUgdGV4dCBoaWdobGlnaHRpbmcgaXMgYWRkZWQgdG8uXG4gICAqXG4gICAqIElmIHRoZSBgdGVybWAgaXMgZm91bmQgaW5zaWRlIHRoaXMgdGV4dCwgaXQgd2lsbCBiZSBoaWdobGlnaHRlZC5cbiAgICogSWYgdGhlIGB0ZXJtYCBjb250YWlucyBhcnJheSB0aGVuIGFsbCB0aGUgaXRlbXMgZnJvbSBpdCB3aWxsIGJlIGhpZ2hsaWdodGVkIGluc2lkZSB0aGUgdGV4dC5cbiAgICovXG4gIEBJbnB1dCgpIHJlc3VsdD86IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXJtIG9yIGFycmF5IG9mIHRlcm1zIHRvIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBTaW5jZSB2ZXJzaW9uIGB2NC4yLjBgIHRlcm0gY291bGQgYmUgYSBgc3RyaW5nW11gXG4gICAqL1xuICBASW5wdXQoKSB0ZXJtOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXTtcblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdG9TdHJpbmcodGhpcy5yZXN1bHQpO1xuXG4gICAgY29uc3QgdGVybXMgPSBBcnJheS5pc0FycmF5KHRoaXMudGVybSkgPyB0aGlzLnRlcm0gOiBbdGhpcy50ZXJtXTtcbiAgICBjb25zdCBlc2NhcGVkVGVybXMgPSB0ZXJtcy5tYXAodGVybSA9PiByZWdFeHBFc2NhcGUodG9TdHJpbmcodGVybSkpKS5maWx0ZXIodGVybSA9PiB0ZXJtKTtcblxuICAgIHRoaXMucGFydHMgPSBlc2NhcGVkVGVybXMubGVuZ3RoID8gcmVzdWx0LnNwbGl0KG5ldyBSZWdFeHAoYCgke2VzY2FwZWRUZXJtcy5qb2luKCd8Jyl9KWAsICdnbWknKSkgOiBbcmVzdWx0XTtcbiAgfVxufVxuIl19