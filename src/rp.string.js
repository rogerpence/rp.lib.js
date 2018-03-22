'use strict';

var rp = rp || {};

//rp.string = rp.string || {};

rp.StringBuilder = class StringBuilder 
{
    constructor() {
        this.buffer = [];
    }

    append(str) {
        this.buffer.push(str);
    }

    clear() {
        this.buffer = [];
    }

    toString(delimiter = '') {
        return this.buffer.join(delimiter);
    }
}

rp.String = class String {

    static removeFromEnd(value, re) {
        const regex = new RegExp(re + '$', 'g');

        return value.replace(regex, '');
    }

    static removeNonNumerics(value) {
        const re = /\D/g;

        return value.replace(re, '');
    }
}
