import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbDatepicker } from './datepicker';
import { NgbDatepickerI18n } from './datepicker-i18n';
import { NgbDatepickerKeyboardService } from './datepicker-keyboard-service';
import { NgbDatepickerService } from './datepicker-service';
/**
 * A component that renders one month including all the days, weekdays and week numbers. Can be used inside
 * the `<ng-template ngbDatepickerMonths></ng-template>` when you want to customize months layout.
 *
 * For a usage example, see [custom month layout demo](#/components/datepicker/examples#custommonth)
 *
 * @since 5.3.0
 */
export class NgbDatepickerMonth {
    constructor(i18n, datepicker, _keyboardService, _service) {
        this.i18n = i18n;
        this.datepicker = datepicker;
        this._keyboardService = _keyboardService;
        this._service = _service;
    }
    /**
     * The first date of month to be rendered.
     *
     * This month must one of the months present in the
     * [datepicker state](#/components/datepicker/api#NgbDatepickerState).
     */
    set month(month) {
        this.viewModel = this._service.getMonth(month);
    }
    onKeyDown(event) { this._keyboardService.processKey(event, this.datepicker); }
    doSelect(day) {
        if (!day.context.disabled && !day.hidden) {
            this.datepicker.onDateSelect(day.date);
        }
    }
}
NgbDatepickerMonth.decorators = [
    { type: Component, args: [{
                selector: 'ngb-datepicker-month',
                host: { 'role': 'grid', '(keydown)': 'onKeyDown($event)' },
                encapsulation: ViewEncapsulation.None,
                template: `
    <div *ngIf="datepicker.showWeekdays" class="ngb-dp-week ngb-dp-weekdays" role="row">
      <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-weekday ngb-dp-showweek"></div>
      <div *ngFor="let w of viewModel.weekdays" class="ngb-dp-weekday small" role="columnheader">
        {{ i18n.getWeekdayShortName(w) }}
      </div>
    </div>
    <ng-template ngFor let-week [ngForOf]="viewModel.weeks">
      <div *ngIf="!week.collapsed" class="ngb-dp-week" role="row">
        <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-week-number small text-muted">{{ i18n.getWeekNumerals(week.number) }}</div>
        <div *ngFor="let day of week.days" (click)="doSelect(day); $event.preventDefault()" class="ngb-dp-day" role="gridcell"
          [class.disabled]="day.context.disabled"
          [tabindex]="day.tabindex"
          [class.hidden]="day.hidden"
          [class.ngb-dp-today]="day.context.today"
          [attr.aria-label]="day.ariaLabel">
          <ng-template [ngIf]="!day.hidden">
            <ng-template [ngTemplateOutlet]="datepicker.dayTemplate" [ngTemplateOutletContext]="day.context"></ng-template>
          </ng-template>
        </div>
      </div>
    </ng-template>
  `,
                styles: ["ngb-datepicker-month{display:block}.ngb-dp-week-number,.ngb-dp-weekday{font-style:italic;line-height:2rem;text-align:center}.ngb-dp-weekday{color:#5bc0de;color:var(--info)}.ngb-dp-week{border-radius:.25rem;display:-ms-flexbox;display:flex}.ngb-dp-weekdays{background-color:#f8f9fa;background-color:var(--light);border-bottom:1px solid rgba(0,0,0,.125);border-radius:0}.ngb-dp-day,.ngb-dp-week-number,.ngb-dp-weekday{height:2rem;width:2rem}.ngb-dp-day{cursor:pointer}.ngb-dp-day.disabled,.ngb-dp-day.hidden{cursor:default;pointer-events:none}.ngb-dp-day[tabindex=\"0\"]{z-index:1}"]
            },] }
];
NgbDatepickerMonth.ctorParameters = () => [
    { type: NgbDatepickerI18n },
    { type: NgbDatepicker },
    { type: NgbDatepickerKeyboardService },
    { type: NgbDatepickerService }
];
NgbDatepickerMonth.propDecorators = {
    month: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1tb250aC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9kYXRlcGlja2VyLW1vbnRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDM0UsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFJMUQ7Ozs7Ozs7R0FPRztBQThCSCxNQUFNLE9BQU8sa0JBQWtCO0lBYzdCLFlBQ1csSUFBdUIsRUFBUyxVQUF5QixFQUN4RCxnQkFBOEMsRUFBVSxRQUE4QjtRQUR2RixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWU7UUFDeEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUE4QjtRQUFVLGFBQVEsR0FBUixRQUFRLENBQXNCO0lBQUcsQ0FBQztJQWZ0Rzs7Ozs7T0FLRztJQUNILElBQ0ksS0FBSyxDQUFDLEtBQW9CO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQVFELFNBQVMsQ0FBQyxLQUFvQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0YsUUFBUSxDQUFDLEdBQWlCO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQzs7O1lBckRGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxJQUFJLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBQztnQkFDeEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBRXJDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCVDs7YUFDRjs7O1lBMUNPLGlCQUFpQjtZQURqQixhQUFhO1lBRWIsNEJBQTRCO1lBQzVCLG9CQUFvQjs7O29CQWdEekIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBJbnB1dCwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ2JEYXRlcGlja2VyfSBmcm9tICcuL2RhdGVwaWNrZXInO1xuaW1wb3J0IHtOZ2JEYXRlcGlja2VySTE4bn0gZnJvbSAnLi9kYXRlcGlja2VyLWkxOG4nO1xuaW1wb3J0IHtOZ2JEYXRlcGlja2VyS2V5Ym9hcmRTZXJ2aWNlfSBmcm9tICcuL2RhdGVwaWNrZXIta2V5Ym9hcmQtc2VydmljZSc7XG5pbXBvcnQge05nYkRhdGVwaWNrZXJTZXJ2aWNlfSBmcm9tICcuL2RhdGVwaWNrZXItc2VydmljZSc7XG5pbXBvcnQge01vbnRoVmlld01vZGVsLCBEYXlWaWV3TW9kZWx9IGZyb20gJy4vZGF0ZXBpY2tlci12aWV3LW1vZGVsJztcbmltcG9ydCB7TmdiRGF0ZVN0cnVjdH0gZnJvbSAnLi9uZ2ItZGF0ZS1zdHJ1Y3QnO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IHRoYXQgcmVuZGVycyBvbmUgbW9udGggaW5jbHVkaW5nIGFsbCB0aGUgZGF5cywgd2Vla2RheXMgYW5kIHdlZWsgbnVtYmVycy4gQ2FuIGJlIHVzZWQgaW5zaWRlXG4gKiB0aGUgYDxuZy10ZW1wbGF0ZSBuZ2JEYXRlcGlja2VyTW9udGhzPjwvbmctdGVtcGxhdGU+YCB3aGVuIHlvdSB3YW50IHRvIGN1c3RvbWl6ZSBtb250aHMgbGF5b3V0LlxuICpcbiAqIEZvciBhIHVzYWdlIGV4YW1wbGUsIHNlZSBbY3VzdG9tIG1vbnRoIGxheW91dCBkZW1vXSgjL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9leGFtcGxlcyNjdXN0b21tb250aClcbiAqXG4gKiBAc2luY2UgNS4zLjBcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmdiLWRhdGVwaWNrZXItbW9udGgnLFxuICBob3N0OiB7J3JvbGUnOiAnZ3JpZCcsICcoa2V5ZG93biknOiAnb25LZXlEb3duKCRldmVudCknfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc3R5bGVVcmxzOiBbJy4vZGF0ZXBpY2tlci1tb250aC5zY3NzJ10sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdJZj1cImRhdGVwaWNrZXIuc2hvd1dlZWtkYXlzXCIgY2xhc3M9XCJuZ2ItZHAtd2VlayBuZ2ItZHAtd2Vla2RheXNcIiByb2xlPVwicm93XCI+XG4gICAgICA8ZGl2ICpuZ0lmPVwiZGF0ZXBpY2tlci5zaG93V2Vla051bWJlcnNcIiBjbGFzcz1cIm5nYi1kcC13ZWVrZGF5IG5nYi1kcC1zaG93d2Vla1wiPjwvZGl2PlxuICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgdyBvZiB2aWV3TW9kZWwud2Vla2RheXNcIiBjbGFzcz1cIm5nYi1kcC13ZWVrZGF5IHNtYWxsXCIgcm9sZT1cImNvbHVtbmhlYWRlclwiPlxuICAgICAgICB7eyBpMThuLmdldFdlZWtkYXlTaG9ydE5hbWUodykgfX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtd2VlayBbbmdGb3JPZl09XCJ2aWV3TW9kZWwud2Vla3NcIj5cbiAgICAgIDxkaXYgKm5nSWY9XCIhd2Vlay5jb2xsYXBzZWRcIiBjbGFzcz1cIm5nYi1kcC13ZWVrXCIgcm9sZT1cInJvd1wiPlxuICAgICAgICA8ZGl2ICpuZ0lmPVwiZGF0ZXBpY2tlci5zaG93V2Vla051bWJlcnNcIiBjbGFzcz1cIm5nYi1kcC13ZWVrLW51bWJlciBzbWFsbCB0ZXh0LW11dGVkXCI+e3sgaTE4bi5nZXRXZWVrTnVtZXJhbHMod2Vlay5udW1iZXIpIH19PC9kaXY+XG4gICAgICAgIDxkaXYgKm5nRm9yPVwibGV0IGRheSBvZiB3ZWVrLmRheXNcIiAoY2xpY2spPVwiZG9TZWxlY3QoZGF5KTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiBjbGFzcz1cIm5nYi1kcC1kYXlcIiByb2xlPVwiZ3JpZGNlbGxcIlxuICAgICAgICAgIFtjbGFzcy5kaXNhYmxlZF09XCJkYXkuY29udGV4dC5kaXNhYmxlZFwiXG4gICAgICAgICAgW3RhYmluZGV4XT1cImRheS50YWJpbmRleFwiXG4gICAgICAgICAgW2NsYXNzLmhpZGRlbl09XCJkYXkuaGlkZGVuXCJcbiAgICAgICAgICBbY2xhc3MubmdiLWRwLXRvZGF5XT1cImRheS5jb250ZXh0LnRvZGF5XCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImRheS5hcmlhTGFiZWxcIj5cbiAgICAgICAgICA8bmctdGVtcGxhdGUgW25nSWZdPVwiIWRheS5oaWRkZW5cIj5cbiAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJkYXRlcGlja2VyLmRheVRlbXBsYXRlXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cImRheS5jb250ZXh0XCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgICA8L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmctdGVtcGxhdGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgTmdiRGF0ZXBpY2tlck1vbnRoIHtcbiAgLyoqXG4gICAqIFRoZSBmaXJzdCBkYXRlIG9mIG1vbnRoIHRvIGJlIHJlbmRlcmVkLlxuICAgKlxuICAgKiBUaGlzIG1vbnRoIG11c3Qgb25lIG9mIHRoZSBtb250aHMgcHJlc2VudCBpbiB0aGVcbiAgICogW2RhdGVwaWNrZXIgc3RhdGVdKCMvY29tcG9uZW50cy9kYXRlcGlja2VyL2FwaSNOZ2JEYXRlcGlja2VyU3RhdGUpLlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IG1vbnRoKG1vbnRoOiBOZ2JEYXRlU3RydWN0KSB7XG4gICAgdGhpcy52aWV3TW9kZWwgPSB0aGlzLl9zZXJ2aWNlLmdldE1vbnRoKG1vbnRoKTtcbiAgfVxuXG4gIHZpZXdNb2RlbDogTW9udGhWaWV3TW9kZWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaTE4bjogTmdiRGF0ZXBpY2tlckkxOG4sIHB1YmxpYyBkYXRlcGlja2VyOiBOZ2JEYXRlcGlja2VyLFxuICAgICAgcHJpdmF0ZSBfa2V5Ym9hcmRTZXJ2aWNlOiBOZ2JEYXRlcGlja2VyS2V5Ym9hcmRTZXJ2aWNlLCBwcml2YXRlIF9zZXJ2aWNlOiBOZ2JEYXRlcGlja2VyU2VydmljZSkge31cblxuICBvbktleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHsgdGhpcy5fa2V5Ym9hcmRTZXJ2aWNlLnByb2Nlc3NLZXkoZXZlbnQsIHRoaXMuZGF0ZXBpY2tlcik7IH1cblxuICBkb1NlbGVjdChkYXk6IERheVZpZXdNb2RlbCkge1xuICAgIGlmICghZGF5LmNvbnRleHQuZGlzYWJsZWQgJiYgIWRheS5oaWRkZW4pIHtcbiAgICAgIHRoaXMuZGF0ZXBpY2tlci5vbkRhdGVTZWxlY3QoZGF5LmRhdGUpO1xuICAgIH1cbiAgfVxufVxuIl19