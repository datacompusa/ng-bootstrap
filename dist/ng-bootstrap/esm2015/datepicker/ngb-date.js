import { isInteger } from '../util/util';
/**
 * A simple class that represents a date that datepicker also uses internally.
 *
 * It is the implementation of the `NgbDateStruct` interface that adds some convenience methods,
 * like `.equals()`, `.before()`, etc.
 *
 * All datepicker APIs consume `NgbDateStruct`, but return `NgbDate`.
 *
 * In many cases it is simpler to manipulate these objects together with
 * [`NgbCalendar`](#/components/datepicker/api#NgbCalendar) than native JS Dates.
 *
 * See the [date format overview](#/components/datepicker/overview#date-model) for more details.
 *
 * @since 3.0.0
 */
export class NgbDate {
    constructor(year, month, day) {
        this.year = isInteger(year) ? year : null;
        this.month = isInteger(month) ? month : null;
        this.day = isInteger(day) ? day : null;
    }
    /**
     * A **static method** that creates a new date object from the `NgbDateStruct`,
     *
     * ex. `NgbDate.from({year: 2000, month: 5, day: 1})`.
     *
     * If the `date` is already of `NgbDate` type, the method will return the same object.
     */
    static from(date) {
        if (date instanceof NgbDate) {
            return date;
        }
        return date ? new NgbDate(date.year, date.month, date.day) : null;
    }
    /**
     * Checks if the current date is equal to another date.
     */
    equals(other) {
        return other != null && this.year === other.year && this.month === other.month && this.day === other.day;
    }
    /**
     * Checks if the current date is before another date.
     */
    before(other) {
        if (!other) {
            return false;
        }
        if (this.year === other.year) {
            if (this.month === other.month) {
                return this.day === other.day ? false : this.day < other.day;
            }
            else {
                return this.month < other.month;
            }
        }
        else {
            return this.year < other.year;
        }
    }
    /**
     * Checks if the current date is after another date.
     */
    after(other) {
        if (!other) {
            return false;
        }
        if (this.year === other.year) {
            if (this.month === other.month) {
                return this.day === other.day ? false : this.day > other.day;
            }
            else {
                return this.month > other.month;
            }
        }
        else {
            return this.year > other.year;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdiLWRhdGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2dhYnJpZWwvRGV2ZWxvcG1lbnQvbmctYm9vdHN0cmFwL3NyYy8iLCJzb3VyY2VzIjpbImRhdGVwaWNrZXIvbmdiLWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUV2Qzs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILE1BQU0sT0FBTyxPQUFPO0lBOEJsQixZQUFZLElBQVksRUFBRSxLQUFhLEVBQUUsR0FBVztRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxJQUFJLENBQUM7UUFDL0MsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQU0sSUFBSSxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLElBQUksQ0FBQztJQUM5QyxDQUFDO0lBbEJEOzs7Ozs7T0FNRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBMkI7UUFDckMsSUFBSSxJQUFJLFlBQVksT0FBTyxFQUFFO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3BFLENBQUM7SUFRRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxLQUE0QjtRQUNqQyxPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDM0csQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLEtBQTRCO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUM5RDtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQzthQUNqQztTQUNGO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxLQUE0QjtRQUNoQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUM5QixPQUFPLElBQUksQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDOUQ7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFDakM7U0FDRjthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDL0I7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nYkRhdGVTdHJ1Y3R9IGZyb20gJy4vbmdiLWRhdGUtc3RydWN0JztcbmltcG9ydCB7aXNJbnRlZ2VyfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuXG4vKipcbiAqIEEgc2ltcGxlIGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIGRhdGUgdGhhdCBkYXRlcGlja2VyIGFsc28gdXNlcyBpbnRlcm5hbGx5LlxuICpcbiAqIEl0IGlzIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYE5nYkRhdGVTdHJ1Y3RgIGludGVyZmFjZSB0aGF0IGFkZHMgc29tZSBjb252ZW5pZW5jZSBtZXRob2RzLFxuICogbGlrZSBgLmVxdWFscygpYCwgYC5iZWZvcmUoKWAsIGV0Yy5cbiAqXG4gKiBBbGwgZGF0ZXBpY2tlciBBUElzIGNvbnN1bWUgYE5nYkRhdGVTdHJ1Y3RgLCBidXQgcmV0dXJuIGBOZ2JEYXRlYC5cbiAqXG4gKiBJbiBtYW55IGNhc2VzIGl0IGlzIHNpbXBsZXIgdG8gbWFuaXB1bGF0ZSB0aGVzZSBvYmplY3RzIHRvZ2V0aGVyIHdpdGhcbiAqIFtgTmdiQ2FsZW5kYXJgXSgjL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9hcGkjTmdiQ2FsZW5kYXIpIHRoYW4gbmF0aXZlIEpTIERhdGVzLlxuICpcbiAqIFNlZSB0aGUgW2RhdGUgZm9ybWF0IG92ZXJ2aWV3XSgjL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9vdmVydmlldyNkYXRlLW1vZGVsKSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzaW5jZSAzLjAuMFxuICovXG5leHBvcnQgY2xhc3MgTmdiRGF0ZSBpbXBsZW1lbnRzIE5nYkRhdGVTdHJ1Y3Qge1xuICAvKipcbiAgICogVGhlIHllYXIsIGZvciBleGFtcGxlIDIwMTZcbiAgICovXG4gIHllYXI6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIG1vbnRoLCBmb3IgZXhhbXBsZSAxPUphbiAuLi4gMTI9RGVjIGFzIGluIElTTyA4NjAxXG4gICAqL1xuICBtb250aDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgZGF5IG9mIG1vbnRoLCBzdGFydGluZyB3aXRoIDFcbiAgICovXG4gIGRheTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBICoqc3RhdGljIG1ldGhvZCoqIHRoYXQgY3JlYXRlcyBhIG5ldyBkYXRlIG9iamVjdCBmcm9tIHRoZSBgTmdiRGF0ZVN0cnVjdGAsXG4gICAqXG4gICAqIGV4LiBgTmdiRGF0ZS5mcm9tKHt5ZWFyOiAyMDAwLCBtb250aDogNSwgZGF5OiAxfSlgLlxuICAgKlxuICAgKiBJZiB0aGUgYGRhdGVgIGlzIGFscmVhZHkgb2YgYE5nYkRhdGVgIHR5cGUsIHRoZSBtZXRob2Qgd2lsbCByZXR1cm4gdGhlIHNhbWUgb2JqZWN0LlxuICAgKi9cbiAgc3RhdGljIGZyb20oZGF0ZT86IE5nYkRhdGVTdHJ1Y3QgfCBudWxsKTogTmdiRGF0ZSB8IG51bGwge1xuICAgIGlmIChkYXRlIGluc3RhbmNlb2YgTmdiRGF0ZSkge1xuICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuICAgIHJldHVybiBkYXRlID8gbmV3IE5nYkRhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRheSkgOiBudWxsO1xuICB9XG5cbiAgY29uc3RydWN0b3IoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcikge1xuICAgIHRoaXMueWVhciA9IGlzSW50ZWdlcih5ZWFyKSA/IHllYXIgOiA8YW55Pm51bGw7XG4gICAgdGhpcy5tb250aCA9IGlzSW50ZWdlcihtb250aCkgPyBtb250aCA6IDxhbnk+bnVsbDtcbiAgICB0aGlzLmRheSA9IGlzSW50ZWdlcihkYXkpID8gZGF5IDogPGFueT5udWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBkYXRlIGlzIGVxdWFsIHRvIGFub3RoZXIgZGF0ZS5cbiAgICovXG4gIGVxdWFscyhvdGhlcj86IE5nYkRhdGVTdHJ1Y3QgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG90aGVyICE9IG51bGwgJiYgdGhpcy55ZWFyID09PSBvdGhlci55ZWFyICYmIHRoaXMubW9udGggPT09IG90aGVyLm1vbnRoICYmIHRoaXMuZGF5ID09PSBvdGhlci5kYXk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGRhdGUgaXMgYmVmb3JlIGFub3RoZXIgZGF0ZS5cbiAgICovXG4gIGJlZm9yZShvdGhlcj86IE5nYkRhdGVTdHJ1Y3QgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgaWYgKCFvdGhlcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnllYXIgPT09IG90aGVyLnllYXIpIHtcbiAgICAgIGlmICh0aGlzLm1vbnRoID09PSBvdGhlci5tb250aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXkgPT09IG90aGVyLmRheSA/IGZhbHNlIDogdGhpcy5kYXkgPCBvdGhlci5kYXk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tb250aCA8IG90aGVyLm1vbnRoO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy55ZWFyIDwgb3RoZXIueWVhcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGRhdGUgaXMgYWZ0ZXIgYW5vdGhlciBkYXRlLlxuICAgKi9cbiAgYWZ0ZXIob3RoZXI/OiBOZ2JEYXRlU3RydWN0IHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmICghb3RoZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMueWVhciA9PT0gb3RoZXIueWVhcikge1xuICAgICAgaWYgKHRoaXMubW9udGggPT09IG90aGVyLm1vbnRoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRheSA9PT0gb3RoZXIuZGF5ID8gZmFsc2UgOiB0aGlzLmRheSA+IG90aGVyLmRheTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vbnRoID4gb3RoZXIubW9udGg7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnllYXIgPiBvdGhlci55ZWFyO1xuICAgIH1cbiAgfVxufVxuIl19