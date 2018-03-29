'use strict';

var rp = rp || {};

rp.dom = class dom 
{
    static findEl(selector) {
        if (selector.startsWith('#')) {
            return document.getElementById(selector.substring(1));
        }
        else {
            return document.querySelector(selector);
        }
    }

    static documentReady(fn) {
        if (document.attachEvent ? document.readyState === "complete" :
                                   document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    static elementLocation(el) {
        if (typeof el == 'string') {
            el = document.getElementById(el);
        }

        if (!el) {
            throw new Error('Element not found.');
        }

        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset ||
                     document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset ||
                    document.documentElement.scrollTop;
        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    }

    static getElementById(id) {
        let element = document.getElementById(id);

        if (!element) {
            console.error('Element not found in DOM');
            console.error('Element Id not found ===> ' + id);
            throw new Error('Element not found in DOM: ' + id);
        }

        return element;
    }

    static clearElementChildren(parent) {
        let el;
        if (typeof parent == 'string') {
            el = document.getElementById(parent);
        }
        else {
            el = parent;
        }

        if (!el) {
            throw new Error('Element not found.');
        }
        
        let range = document.createRange();
        range.selectNodeContents(el);
        range.deleteContents();
    };

    static setObjectDefaultValue(obj, key, value) {
        if (!obj.hasOwnProperty(key)) {
            obj[key] = value;
        }
    }

    static removeElement(el) {
        if (typeof el === 'string') {
            el = document.getElementById(el);
        }

        if (!el) {
            return;
        }
    
        try {
            el.parentElement.removeChild(el);
        }
        catch (error) {

        }            
    }
}
