export function toInteger(value) {
    return parseInt(`${value}`, 10);
}
export function toString(value) {
    return (value !== undefined && value !== null) ? `${value}` : '';
}
export function getValueInRange(value, max, min = 0) {
    return Math.max(Math.min(value, max), min);
}
export function isString(value) {
    return typeof value === 'string';
}
export function isNumber(value) {
    return !isNaN(toInteger(value));
}
export function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}
export function isDefined(value) {
    return value !== undefined && value !== null;
}
export function padNumber(value) {
    if (isNumber(value)) {
        return `0${value}`.slice(-2);
    }
    else {
        return '';
    }
}
export function regExpEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
export function hasClassName(element, className) {
    return element && element.className && element.className.split &&
        element.className.split(/\s+/).indexOf(className) >= 0;
}
if (typeof Element !== 'undefined' && !Element.prototype.closest) {
    // Polyfill for ie10+
    if (!Element.prototype.matches) {
        // IE uses the non-standard name: msMatchesSelector
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    Element.prototype.closest = function (s) {
        let el = this;
        if (!document.documentElement.contains(el)) {
            return null;
        }
        do {
            if (el.matches(s)) {
                return el;
            }
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}
export function closest(element, selector) {
    if (!selector) {
        return null;
    }
    /*
     * In certain browsers (e.g. Edge 44.18362.449.0) HTMLDocument does
     * not support `Element.prototype.closest`. To emulate the correct behaviour
     * we return null when the method is missing.
     *
     * Note that in evergreen browsers `closest(document.documentElement, 'html')`
     * will return the document element whilst in Edge null will be returned. This
     * compromise was deemed good enough.
     */
    if (typeof element.closest === 'undefined') {
        return null;
    }
    return element.closest(selector);
}
/**
 * Force a browser reflow
 * @param element element where to apply the reflow
 */
export function reflow(element) {
    return (element || document.body).offsetHeight;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsidXRpbC91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBVTtJQUNsQyxPQUFPLFFBQVEsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQVU7SUFDakMsT0FBTyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbkUsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsS0FBYSxFQUFFLEdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNqRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUMsS0FBVTtJQUNqQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUFVO0lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBVTtJQUNsQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDckYsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBVTtJQUNsQyxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztBQUMvQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxLQUFhO0lBQ3JDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ25CLE9BQU8sSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5QjtTQUFNO1FBQ0wsT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUFDLElBQUk7SUFDL0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUFDLE9BQVksRUFBRSxTQUFpQjtJQUMxRCxPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSztRQUMxRCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRCxJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO0lBQ2hFLHFCQUFxQjtJQUVyQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7UUFDOUIsbURBQW1EO1FBQ25ELE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFJLE9BQU8sQ0FBQyxTQUFpQixDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7S0FDckg7SUFFRCxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLENBQVM7UUFDNUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxHQUFHO1lBQ0QsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqQixPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUN4QyxRQUFRLEVBQUUsS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7UUFDM0MsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7Q0FDSDtBQUVELE1BQU0sVUFBVSxPQUFPLENBQUMsT0FBb0IsRUFBRSxRQUFpQjtJQUM3RCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2IsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsSUFBSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO1FBQzFDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsT0FBb0I7SUFDekMsT0FBTyxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlOiBhbnkpOiBudW1iZXIge1xuICByZXR1cm4gcGFyc2VJbnQoYCR7dmFsdWV9YCwgMTApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9TdHJpbmcodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkgPyBgJHt2YWx1ZX1gIDogJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWx1ZUluUmFuZ2UodmFsdWU6IG51bWJlciwgbWF4OiBudW1iZXIsIG1pbiA9IDApOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4odmFsdWUsIG1heCksIG1pbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyh2YWx1ZTogYW55KTogdmFsdWUgaXMgc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcih2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVtYmVyIHtcbiAgcmV0dXJuICFpc05hTih0b0ludGVnZXIodmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW50ZWdlcih2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsdWUpICYmIE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmaW5lZCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFkTnVtYmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSkge1xuICAgIHJldHVybiBgMCR7dmFsdWV9YC5zbGljZSgtMik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdFeHBFc2NhcGUodGV4dCkge1xuICByZXR1cm4gdGV4dC5yZXBsYWNlKC9bLVtcXF17fSgpKis/LixcXFxcXiR8I1xcc10vZywgJ1xcXFwkJicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQ2xhc3NOYW1lKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudC5jbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc05hbWUuc3BsaXQgJiZcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KC9cXHMrLykuaW5kZXhPZihjbGFzc05hbWUpID49IDA7XG59XG5cbmlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgLy8gUG9seWZpbGwgZm9yIGllMTArXG5cbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgLy8gSUUgdXNlcyB0aGUgbm9uLXN0YW5kYXJkIG5hbWU6IG1zTWF0Y2hlc1NlbGVjdG9yXG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IChFbGVtZW50LnByb3RvdHlwZSBhcyBhbnkpLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuXG4gIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihzOiBzdHJpbmcpIHtcbiAgICBsZXQgZWwgPSB0aGlzO1xuICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGVsKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRvIHtcbiAgICAgIGlmIChlbC5tYXRjaGVzKHMpKSB7XG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH1cbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudCB8fCBlbC5wYXJlbnROb2RlO1xuICAgIH0gd2hpbGUgKGVsICE9PSBudWxsICYmIGVsLm5vZGVUeXBlID09PSAxKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3Nlc3QoZWxlbWVudDogSFRNTEVsZW1lbnQsIHNlbGVjdG9yPzogc3RyaW5nKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgaWYgKCFzZWxlY3Rvcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLypcbiAgICogSW4gY2VydGFpbiBicm93c2VycyAoZS5nLiBFZGdlIDQ0LjE4MzYyLjQ0OS4wKSBIVE1MRG9jdW1lbnQgZG9lc1xuICAgKiBub3Qgc3VwcG9ydCBgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdGAuIFRvIGVtdWxhdGUgdGhlIGNvcnJlY3QgYmVoYXZpb3VyXG4gICAqIHdlIHJldHVybiBudWxsIHdoZW4gdGhlIG1ldGhvZCBpcyBtaXNzaW5nLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgaW4gZXZlcmdyZWVuIGJyb3dzZXJzIGBjbG9zZXN0KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ2h0bWwnKWBcbiAgICogd2lsbCByZXR1cm4gdGhlIGRvY3VtZW50IGVsZW1lbnQgd2hpbHN0IGluIEVkZ2UgbnVsbCB3aWxsIGJlIHJldHVybmVkLiBUaGlzXG4gICAqIGNvbXByb21pc2Ugd2FzIGRlZW1lZCBnb29kIGVub3VnaC5cbiAgICovXG4gIGlmICh0eXBlb2YgZWxlbWVudC5jbG9zZXN0ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuY2xvc2VzdChzZWxlY3Rvcik7XG59XG5cbi8qKlxuICogRm9yY2UgYSBicm93c2VyIHJlZmxvd1xuICogQHBhcmFtIGVsZW1lbnQgZWxlbWVudCB3aGVyZSB0byBhcHBseSB0aGUgcmVmbG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWZsb3coZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgcmV0dXJuIChlbGVtZW50IHx8IGRvY3VtZW50LmJvZHkpLm9mZnNldEhlaWdodDtcbn1cbiJdfQ==