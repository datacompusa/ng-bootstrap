import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgbDate } from './ngb-date';
import { toInteger } from '../util/util';
import { NgbDatepickerI18n } from './datepicker-i18n';
export class NgbDatepickerNavigationSelect {
    constructor(i18n, _renderer) {
        this.i18n = i18n;
        this._renderer = _renderer;
        this.select = new EventEmitter();
        this._month = -1;
        this._year = -1;
    }
    changeMonth(month) { this.select.emit(new NgbDate(this.date.year, toInteger(month), 1)); }
    changeYear(year) { this.select.emit(new NgbDate(toInteger(year), this.date.month, 1)); }
    ngAfterViewChecked() {
        if (this.date) {
            if (this.date.month !== this._month) {
                this._month = this.date.month;
                this._renderer.setProperty(this.monthSelect.nativeElement, 'value', this._month);
            }
            if (this.date.year !== this._year) {
                this._year = this.date.year;
                this._renderer.setProperty(this.yearSelect.nativeElement, 'value', this._year);
            }
        }
    }
}
NgbDatepickerNavigationSelect.decorators = [
    { type: Component, args: [{
                selector: 'ngb-datepicker-navigation-select',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                template: `
    <select #month
      [disabled]="disabled"
      class="custom-select"
      i18n-aria-label="@@ngb.datepicker.select-month" aria-label="Select month"
      i18n-title="@@ngb.datepicker.select-month" title="Select month"
      (change)="changeMonth($any($event).target.value)">
        <option *ngFor="let m of months" [attr.aria-label]="i18n.getMonthFullName(m, date?.year)"
                [value]="m">{{ i18n.getMonthShortName(m, date?.year) }}</option>
    </select><select #year
      [disabled]="disabled"
      class="custom-select"
      i18n-aria-label="@@ngb.datepicker.select-year" aria-label="Select year"
      i18n-title="@@ngb.datepicker.select-year" title="Select year"
      (change)="changeYear($any($event).target.value)">
        <option *ngFor="let y of years" [value]="y">{{ i18n.getYearNumerals(y) }}</option>
    </select>
  `,
                styles: ["ngb-datepicker-navigation-select>.custom-select{-ms-flex:1 1 auto;flex:1 1 auto;font-size:.875rem;height:1.85rem;padding:0 .5rem}ngb-datepicker-navigation-select>.custom-select:focus{z-index:1}ngb-datepicker-navigation-select>.custom-select::-ms-value{background-color:transparent!important}"]
            },] }
];
NgbDatepickerNavigationSelect.ctorParameters = () => [
    { type: NgbDatepickerI18n },
    { type: Renderer2 }
];
NgbDatepickerNavigationSelect.propDecorators = {
    date: [{ type: Input }],
    disabled: [{ type: Input }],
    months: [{ type: Input }],
    years: [{ type: Input }],
    select: [{ type: Output }],
    monthSelect: [{ type: ViewChild, args: ['month', { static: true, read: ElementRef },] }],
    yearSelect: [{ type: ViewChild, args: ['year', { static: true, read: ElementRef },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1uYXZpZ2F0aW9uLXNlbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9kYXRlcGlja2VyLW5hdmlnYXRpb24tc2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUVqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUEwQnBELE1BQU0sT0FBTyw2QkFBNkI7SUFjeEMsWUFBbUIsSUFBdUIsRUFBVSxTQUFvQjtRQUFyRCxTQUFJLEdBQUosSUFBSSxDQUFtQjtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFSOUQsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFXLENBQUM7UUFLdkMsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1osVUFBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXdELENBQUM7SUFFNUUsV0FBVyxDQUFDLEtBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEcsVUFBVSxDQUFDLElBQVksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEcsa0JBQWtCO1FBQ2hCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNsRjtZQUNELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoRjtTQUNGO0lBQ0gsQ0FBQzs7O1lBdkRGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsa0NBQWtDO2dCQUM1QyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBRXJDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQlQ7O2FBQ0Y7OztZQXpCTyxpQkFBaUI7WUFKdkIsU0FBUzs7O21CQStCUixLQUFLO3VCQUNMLEtBQUs7cUJBQ0wsS0FBSztvQkFDTCxLQUFLO3FCQUVMLE1BQU07MEJBRU4sU0FBUyxTQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQzt5QkFDbkQsU0FBUyxTQUFDLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEFmdGVyVmlld0NoZWNrZWQsXG4gIFZpZXdDaGlsZCxcbiAgRWxlbWVudFJlZixcbiAgUmVuZGVyZXIyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ2JEYXRlfSBmcm9tICcuL25nYi1kYXRlJztcbmltcG9ydCB7dG9JbnRlZ2VyfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IHtOZ2JEYXRlcGlja2VySTE4bn0gZnJvbSAnLi9kYXRlcGlja2VyLWkxOG4nO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ2ItZGF0ZXBpY2tlci1uYXZpZ2F0aW9uLXNlbGVjdCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBzdHlsZVVybHM6IFsnLi9kYXRlcGlja2VyLW5hdmlnYXRpb24tc2VsZWN0LnNjc3MnXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c2VsZWN0ICNtb250aFxuICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkXCJcbiAgICAgIGNsYXNzPVwiY3VzdG9tLXNlbGVjdFwiXG4gICAgICBpMThuLWFyaWEtbGFiZWw9XCJAQG5nYi5kYXRlcGlja2VyLnNlbGVjdC1tb250aFwiIGFyaWEtbGFiZWw9XCJTZWxlY3QgbW9udGhcIlxuICAgICAgaTE4bi10aXRsZT1cIkBAbmdiLmRhdGVwaWNrZXIuc2VsZWN0LW1vbnRoXCIgdGl0bGU9XCJTZWxlY3QgbW9udGhcIlxuICAgICAgKGNoYW5nZSk9XCJjaGFuZ2VNb250aCgkYW55KCRldmVudCkudGFyZ2V0LnZhbHVlKVwiPlxuICAgICAgICA8b3B0aW9uICpuZ0Zvcj1cImxldCBtIG9mIG1vbnRoc1wiIFthdHRyLmFyaWEtbGFiZWxdPVwiaTE4bi5nZXRNb250aEZ1bGxOYW1lKG0sIGRhdGU/LnllYXIpXCJcbiAgICAgICAgICAgICAgICBbdmFsdWVdPVwibVwiPnt7IGkxOG4uZ2V0TW9udGhTaG9ydE5hbWUobSwgZGF0ZT8ueWVhcikgfX08L29wdGlvbj5cbiAgICA8L3NlbGVjdD48c2VsZWN0ICN5ZWFyXG4gICAgICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuICAgICAgY2xhc3M9XCJjdXN0b20tc2VsZWN0XCJcbiAgICAgIGkxOG4tYXJpYS1sYWJlbD1cIkBAbmdiLmRhdGVwaWNrZXIuc2VsZWN0LXllYXJcIiBhcmlhLWxhYmVsPVwiU2VsZWN0IHllYXJcIlxuICAgICAgaTE4bi10aXRsZT1cIkBAbmdiLmRhdGVwaWNrZXIuc2VsZWN0LXllYXJcIiB0aXRsZT1cIlNlbGVjdCB5ZWFyXCJcbiAgICAgIChjaGFuZ2UpPVwiY2hhbmdlWWVhcigkYW55KCRldmVudCkudGFyZ2V0LnZhbHVlKVwiPlxuICAgICAgICA8b3B0aW9uICpuZ0Zvcj1cImxldCB5IG9mIHllYXJzXCIgW3ZhbHVlXT1cInlcIj57eyBpMThuLmdldFllYXJOdW1lcmFscyh5KSB9fTwvb3B0aW9uPlxuICAgIDwvc2VsZWN0PlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIE5nYkRhdGVwaWNrZXJOYXZpZ2F0aW9uU2VsZWN0IGltcGxlbWVudHMgQWZ0ZXJWaWV3Q2hlY2tlZCB7XG4gIEBJbnB1dCgpIGRhdGU6IE5nYkRhdGU7XG4gIEBJbnB1dCgpIGRpc2FibGVkOiBib29sZWFuO1xuICBASW5wdXQoKSBtb250aHM6IG51bWJlcltdO1xuICBASW5wdXQoKSB5ZWFyczogbnVtYmVyW107XG5cbiAgQE91dHB1dCgpIHNlbGVjdCA9IG5ldyBFdmVudEVtaXR0ZXI8TmdiRGF0ZT4oKTtcblxuICBAVmlld0NoaWxkKCdtb250aCcsIHtzdGF0aWM6IHRydWUsIHJlYWQ6IEVsZW1lbnRSZWZ9KSBtb250aFNlbGVjdDogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgneWVhcicsIHtzdGF0aWM6IHRydWUsIHJlYWQ6IEVsZW1lbnRSZWZ9KSB5ZWFyU2VsZWN0OiBFbGVtZW50UmVmO1xuXG4gIHByaXZhdGUgX21vbnRoID0gLTE7XG4gIHByaXZhdGUgX3llYXIgPSAtMTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaTE4bjogTmdiRGF0ZXBpY2tlckkxOG4sIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgY2hhbmdlTW9udGgobW9udGg6IHN0cmluZykgeyB0aGlzLnNlbGVjdC5lbWl0KG5ldyBOZ2JEYXRlKHRoaXMuZGF0ZS55ZWFyLCB0b0ludGVnZXIobW9udGgpLCAxKSk7IH1cblxuICBjaGFuZ2VZZWFyKHllYXI6IHN0cmluZykgeyB0aGlzLnNlbGVjdC5lbWl0KG5ldyBOZ2JEYXRlKHRvSW50ZWdlcih5ZWFyKSwgdGhpcy5kYXRlLm1vbnRoLCAxKSk7IH1cblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuZGF0ZSkge1xuICAgICAgaWYgKHRoaXMuZGF0ZS5tb250aCAhPT0gdGhpcy5fbW9udGgpIHtcbiAgICAgICAgdGhpcy5fbW9udGggPSB0aGlzLmRhdGUubW9udGg7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFByb3BlcnR5KHRoaXMubW9udGhTZWxlY3QubmF0aXZlRWxlbWVudCwgJ3ZhbHVlJywgdGhpcy5fbW9udGgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZGF0ZS55ZWFyICE9PSB0aGlzLl95ZWFyKSB7XG4gICAgICAgIHRoaXMuX3llYXIgPSB0aGlzLmRhdGUueWVhcjtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0UHJvcGVydHkodGhpcy55ZWFyU2VsZWN0Lm5hdGl2ZUVsZW1lbnQsICd2YWx1ZScsIHRoaXMuX3llYXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19