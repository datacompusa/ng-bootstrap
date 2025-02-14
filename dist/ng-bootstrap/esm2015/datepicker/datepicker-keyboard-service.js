import { Injectable } from '@angular/core';
import { Key } from '../util/key';
import * as i0 from "@angular/core";
/**
 * A service that represents the keyboard navigation.
 *
 * Default keyboard shortcuts [are documented in the overview](#/components/datepicker/overview#keyboard-shortcuts)
 *
 * @since 5.2.0
 */
export class NgbDatepickerKeyboardService {
    /**
     * Processes a keyboard event.
     */
    processKey(event, datepicker) {
        const { state, calendar } = datepicker;
        // tslint:disable-next-line:deprecation
        switch (event.which) {
            case Key.PageUp:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, event.shiftKey ? 'y' : 'm', 1));
                break;
            case Key.PageDown:
                datepicker.focusDate(calendar.getNext(state.focusedDate, event.shiftKey ? 'y' : 'm', 1));
                break;
            case Key.End:
                datepicker.focusDate(event.shiftKey ? state.maxDate : state.lastDate);
                break;
            case Key.Home:
                datepicker.focusDate(event.shiftKey ? state.minDate : state.firstDate);
                break;
            case Key.ArrowLeft:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, 'd', 1));
                break;
            case Key.ArrowUp:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, 'd', calendar.getDaysPerWeek()));
                break;
            case Key.ArrowRight:
                datepicker.focusDate(calendar.getNext(state.focusedDate, 'd', 1));
                break;
            case Key.ArrowDown:
                datepicker.focusDate(calendar.getNext(state.focusedDate, 'd', calendar.getDaysPerWeek()));
                break;
            case Key.Enter:
            case Key.Space:
                datepicker.focusSelect();
                break;
            default:
                return;
        }
        event.preventDefault();
        event.stopPropagation();
    }
}
NgbDatepickerKeyboardService.ɵprov = i0.ɵɵdefineInjectable({ factory: function NgbDatepickerKeyboardService_Factory() { return new NgbDatepickerKeyboardService(); }, token: NgbDatepickerKeyboardService, providedIn: "root" });
NgbDatepickerKeyboardService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1rZXlib2FyZC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJkYXRlcGlja2VyL2RhdGVwaWNrZXIta2V5Ym9hcmQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxhQUFhLENBQUM7O0FBRWhDOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyw0QkFBNEI7SUFDdkM7O09BRUc7SUFDSCxVQUFVLENBQUMsS0FBb0IsRUFBRSxVQUF5QjtRQUN4RCxNQUFNLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxHQUFHLFVBQVUsQ0FBQztRQUNyQyx1Q0FBdUM7UUFDdkMsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ25CLEtBQUssR0FBRyxDQUFDLE1BQU07Z0JBQ2IsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekYsTUFBTTtZQUNSLEtBQUssR0FBRyxDQUFDLFFBQVE7Z0JBQ2YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekYsTUFBTTtZQUNSLEtBQUssR0FBRyxDQUFDLEdBQUc7Z0JBQ1YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RFLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxJQUFJO2dCQUNYLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2RSxNQUFNO1lBQ1IsS0FBSyxHQUFHLENBQUMsU0FBUztnQkFDaEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxPQUFPO2dCQUNkLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRixNQUFNO1lBQ1IsS0FBSyxHQUFHLENBQUMsVUFBVTtnQkFDakIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxTQUFTO2dCQUNoQixVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUYsTUFBTTtZQUNSLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQztZQUNmLEtBQUssR0FBRyxDQUFDLEtBQUs7Z0JBQ1osVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN6QixNQUFNO1lBQ1I7Z0JBQ0UsT0FBTztTQUNWO1FBQ0QsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMxQixDQUFDOzs7O1lBMUNGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOZ2JEYXRlcGlja2VyfSBmcm9tICcuL2RhdGVwaWNrZXInO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4uL3V0aWwva2V5JztcblxuLyoqXG4gKiBBIHNlcnZpY2UgdGhhdCByZXByZXNlbnRzIHRoZSBrZXlib2FyZCBuYXZpZ2F0aW9uLlxuICpcbiAqIERlZmF1bHQga2V5Ym9hcmQgc2hvcnRjdXRzIFthcmUgZG9jdW1lbnRlZCBpbiB0aGUgb3ZlcnZpZXddKCMvY29tcG9uZW50cy9kYXRlcGlja2VyL292ZXJ2aWV3I2tleWJvYXJkLXNob3J0Y3V0cylcbiAqXG4gKiBAc2luY2UgNS4yLjBcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTmdiRGF0ZXBpY2tlcktleWJvYXJkU2VydmljZSB7XG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSBrZXlib2FyZCBldmVudC5cbiAgICovXG4gIHByb2Nlc3NLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGRhdGVwaWNrZXI6IE5nYkRhdGVwaWNrZXIpIHtcbiAgICBjb25zdCB7c3RhdGUsIGNhbGVuZGFyfSA9IGRhdGVwaWNrZXI7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgc3dpdGNoIChldmVudC53aGljaCkge1xuICAgICAgY2FzZSBLZXkuUGFnZVVwOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCBldmVudC5zaGlmdEtleSA/ICd5JyA6ICdtJywgMSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LlBhZ2VEb3duOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXROZXh0KHN0YXRlLmZvY3VzZWREYXRlLCBldmVudC5zaGlmdEtleSA/ICd5JyA6ICdtJywgMSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkVuZDpcbiAgICAgICAgZGF0ZXBpY2tlci5mb2N1c0RhdGUoZXZlbnQuc2hpZnRLZXkgPyBzdGF0ZS5tYXhEYXRlIDogc3RhdGUubGFzdERhdGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkhvbWU6XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNEYXRlKGV2ZW50LnNoaWZ0S2V5ID8gc3RhdGUubWluRGF0ZSA6IHN0YXRlLmZpcnN0RGF0ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBLZXkuQXJyb3dMZWZ0OlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd1VwOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIGNhbGVuZGFyLmdldERheXNQZXJXZWVrKCkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd1JpZ2h0OlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXROZXh0KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd0Rvd246XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNEYXRlKGNhbGVuZGFyLmdldE5leHQoc3RhdGUuZm9jdXNlZERhdGUsICdkJywgY2FsZW5kYXIuZ2V0RGF5c1BlcldlZWsoKSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkVudGVyOlxuICAgICAgY2FzZSBLZXkuU3BhY2U6XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNTZWxlY3QoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==