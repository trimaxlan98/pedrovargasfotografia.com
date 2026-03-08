"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = exports.ContactStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["CLIENT"] = "CLIENT";
})(Role || (exports.Role = Role = {}));
var ContactStatus;
(function (ContactStatus) {
    ContactStatus["PENDING"] = "PENDING";
    ContactStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ContactStatus["RESPONDED"] = "RESPONDED";
    ContactStatus["CLOSED"] = "CLOSED";
})(ContactStatus || (exports.ContactStatus = ContactStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["DEPOSIT_PAID"] = "DEPOSIT_PAID";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
//# sourceMappingURL=index.js.map