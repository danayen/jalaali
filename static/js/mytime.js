odoo.define('web.mytime', function (require) {
    "use strict";

    const { _t } = require('web.core');
    const { session } = require('@web/session');
    const { time } = require('@web/core');

    /**
     * Returns the user preferred calendar code using user_context of
     * Odoo session_info structure.
     * The returned code is a single character:
     * '' or 'g': Gregorian Calendar (Default)
     * 'j' : Persian Calendar (Jalali)
     * 'h' : Hijri Calendar (Hijri)
     * @param {*} user_context
     */
    time.getCalendar = function (user_context) {
        user_context = user_context || session.user_context;
        return user_context && typeof user_context.calendar === 'string'
            ? user_context.calendar.startsWith('j') ? 'j' : ''
            : user_context && user_context.lang === 'fa_IR'
                ? 'j'
                : _t.database.parameters.code === 'fa_IR'
                    ? 'j'
                    : '';
    };

    time.getUserDateFormat = function (user_context) {
        user_context = user_context || session.user_context;
        return user_context && typeof user_context.date_format === 'string'
            ? user_context.date_format
            : '';
    };

    time.fixPersianLocale = function () {
        // You may need to adjust this part according to how moment.js is handled in Odoo 17
        return typeof moment !== 'undefined' && moment.fixPersian && moment.fixPersian();
    };

    time.fixTempusDominusBootstrap4 = function () {
        // You may need to adjust this part according to how jQuery is handled in Odoo 17
        const proto = $ && $.fn &&
            $.fn['datetimepicker'] && $.fn['datetimepicker'].Constructor &&
            $.fn['datetimepicker'].Constructor.prototype;
        if (proto && !proto.$fixed) {
            console.warn("fixTempusDominusBootstrap4");
            proto.$fixed = true;
        }
    };

    time._getLangDateFormat = time.getLangDateFormat;
    time.getLangDateFormat = function () {
        time.fixPersianLocale();
        if (time.getCalendar() === 'j') {
            switch (time.getUserDateFormat()) {
                case 'YYYY/M/D':
                    return "jYYYY/jM/jD";
                default:
                    return "jYYYY/jMM/jDD";
            }
        }
        return time._getLangDateFormat();
    };

    time._getLangDatetimeFormat = time.getLangDatetimeFormat;
    time.getLangDatetimeFormat = function () {
        time.fixPersianLocale();
        if (time.getCalendar() === 'j') {
            switch (time.getUserDateFormat()) {
                case 'YYYY/M/D':
                    return "jYYYY/jM/jD HH:mm:ss";
                default:
                    return "jYYYY/jMM/jDD HH:mm:ss";
            }
        }
        return time._getLangDatetimeFormat();
    };
});

if (typeof odoo !== 'undefined' && odoo.session_info && odoo.session_info.user_context) {
    odoo.session_info.user_context.getCalendar = function () {
        const user_context = odoo.session_info.user_context;
        return time.getCalendar(user_context);
    };

    odoo.session_info.user_context.getUserDateFormat = function () {
        const user_context = odoo.session_info.user_context;
        return time.getUserDateFormat(user_context);
    };

    odoo.getCalendar = function () {
        const user_context = odoo.session_info.user_context;
        return time.getCalendar(user_context);
    };

    odoo.getUserDateFormat = function () {
        const user_context = odoo.session_info.user_context;
        return time.getUserDateFormat(user_context);
    };
}
