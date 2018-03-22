'use strict';

var rp = rp || {};

rp.AutoComplete = class AutoComplete 
{
    constructor(options) 
    {
        rp.dom.setObjectDefaultValue(options, 'size', 12);
        rp.dom.setObjectDefaultValue(options, 'wait', 300);
        rp.dom.setObjectDefaultValue(options, 'display', 'text');
        rp.dom.setObjectDefaultValue(options, 'textField', 'text');
        rp.dom.setObjectDefaultValue(options, 'valueField', 'value');
        rp.dom.setObjectDefaultValue(options, 'selectClass', '');
        rp.dom.setObjectDefaultValue(options, 'divClass', '');
        rp.dom.setObjectDefaultValue(options, 'incrementalSearch', false);

        options.selectId = options.itemInputId + '__select';

        this.options = options;
        this.options.ajaxAction = this.showList;

        let selectTag = document.getElementById(this.options.selectId)
        if (!selectTag) {
            let sb = new rp.StringBuilder();
            sb.append(`<div class="${options.divClass}">`);            
            sb.append(`<select class="${options.selectClass}"`);
            sb.append(' style="position:absolute;display:none;"');
            sb.append(` data-input="${options.itemInputId}"`);
            sb.append(` id="${options.selectId}" size="${options.size}" />`);
            sb.append('</div');
            document.body.insertAdjacentHTML('afterbegin', sb.toString());
        }

        this.itemInput = document.getElementById(options.itemInputId);
        if (!this.itemInput) {
            console.error('Element not found in rp.autocomplete constructor');
            console.error('Element Id not found ===> ' + options.itemInputId);
            throw new Error('Element not found in rp.autocomplete constructor: ' + options.itemInputId);
        }
        this.itemInput.setAttribute('data-value', '');

        this.itemList = document.getElementById(options.selectId);
        if (!this.itemList) {
            console.error('Element not found in rp.autocomplete constructor');
            console.error('Element Id not found ===> ' + options.selectId);
            throw new Error('Element not found in rp.autocomplete constructor: ' + options.selectId);
        }

        this.timer = null;
        this.value = null;
        this.handlers = {}

        this.assignEventhandlers();
    }

    clearInputItem() {
        this.itemInput.value = '';
        this.itemInput.setAttribute('data-value', '');        
    }

    showList(json) 
    {
        let list = [];

        let getOptionHTML = function (text, value) {
            return `<option data-value="${value}">${text}</option>`;
        }

        let textField = this.options.textField;
        let valueField = this.options.valueField;
        
        for (var i = 0; i < json.length; i++) {
            list.push(getOptionHTML(json[i][textField], json[i][valueField]));
        }

        if (list.length < this.options.size) {
            this.itemList.setAttribute('size', list.length);
        }

        rp.dom.clearElementChildren(this.itemList);
        this.itemList.insertAdjacentHTML('afterbegin', list.join(''));

        let inputElementLocation = rp.dom.elementLocation(this.itemInput);

        this.itemList.style.left = inputElementLocation.left + 'px';
        this.itemList.style.top = inputElementLocation.top +
                                     inputElementLocation.height + 'px';
        this.itemList.style.width = inputElementLocation.width + 'px';
        this.itemList.style.display = 'inline';
        this.itemList.selectedIndex = 0;

        //
        // The two lines that follow code ensure the input element's value 
        // is set to the first item in the list. I don't think this is the 
        // appropriate behavior. It's too cumbersome to remove an entire 
        // value to start the search over again.
        //
        // let sel = this.getSelectedTextAndValue();
        // this.assignItem(sel);

        this.itemList.focus();
    }

    getList(searchValue) 
    {
        if (typeof this.options.onSetQueryString === 'function') {
            searchValue = this.options.onSetQueryString.call(this, searchValue);
        }

        let opts = {
            url: this.options.url + searchValue,            
            method: 'GET',
            headers: new Headers({
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest'
            }),
            credentials: 'same-origin',
            dataType: 'json',
            action: this.options.ajaxAction,
            context: this
        };

        let httpReq = new rp.ajax.HTTPRequest();
        httpReq.submit(opts);
    }

    destroy() 
    {        
        this.itemInput.removeEventListener('keyup', this.handlers.onItemKeyUp);
        this.itemList.removeEventListener('click', this.handlers.onItemListClick);
        this.itemList.removeEventListener('change', this.handlers.onItemListChange);
        this.itemList.removeEventListener('keyup', this.handlers.onItemListKeyUp);
        this.itemList.removeEventListener('blur', this.handlers.onItemListBlur);

        rp.dom.removeElement(this.itemList);         
    }

    assignItem(text, value) {
        if (typeof this.options.onItemListDisplay == 'function') {
            this.itemInput.value = 
                this.options.onItemListDisplay.call(this, text, value);
        }
        else {
            if (this.options.display == 'text') {
                this.itemInput.value = text;
            }
            else {
                this.itemInput.value = value;
            }
        }                
        this.itemInput.setAttribute('data-value', value);    
        this.itemInput.value = text;
    }

    getSelectedTextAndValue() {
        let index = this.itemList.selectedIndex;
        if (index === -1) {
            index = 0;
        }
        let opt = this.itemList.options[index];

        if (typeof opt === undefined) {
            return undefined;
        }            

        let value = opt.dataset.value;
        let text = opt.value;

        return {
            text: text,
            value: value
        }
    };

    assignEventhandlers() 
    {
        let that = this;

        this.handlers.onItemKeyUp = function(e) 
        {
            const TAB_KEY = 9;

            if (e.keyCode == TAB_KEY && e.target.value == '') {
                return;
            }

            if (this.timer) {
                clearInterval(this.timer);
            }

            this.timer = setTimeout(function() {
                that.getList(e.target.value);
            }, that.options.wait)
        };

        this.handlers.onItemListClick = function(e) 
        {
            that.handlers.onItemListBlur(e);
        };

        this.handlers.onItemFocus = function(e) {
            if (typeof that.options.onItemFocus === 'function') {
                that.options.onItemFocus.call(that);
            }            
        }

        this.handlers.onItemListChange = function(e) 
        {
            let sel = that.getSelectedTextAndValue();
            if (sel !== undefined ) {
                that.assignItem(sel.text, sel.value);

                if (typeof that.options.onItemListChange === 'function') {
                    that.options.onItemListChange.call(that, sel.value);
                }
            }                
        };

        this.handlers.onItemListKeyUp = function(e) 
        {
            const ESCAPE_KEY = 27;
            const BACKSPACE = 8;
            const TAB_KEY = 9;
            const a_KEY = 65;
            const z_KEY = 90;

            if (e.keyCode >= a_KEY && e.keyCode <= z_KEY) {
                that.itemInput.value = that.itemInput.value + String.fromCharCode(e.keyCode).toLocaleLowerCase();
                e.preventDefault();
                e.stopPropagation();
                that.itemList.style.display = 'none';

                if (that.options.incrementalSearch) {
                    that.getList(that.itemInput.value);
                }
                else {
                    that.itemInput.focus();
                }
                return;
            }

            if (e.keyCode == ESCAPE_KEY) {
                that.itemList.style.display = 'none';
                that.clearInputItem();
                e.preventDefault();
                e.stopPropagation();

                that.itemInput.focus();
                return;
            }
            if (e.keyCode == BACKSPACE) {
                let len = that.itemInput.value.length;
                that.itemInput.value = that.itemInput.value.substring(0, len - 1);                                 
                e.preventDefault();
                e.stopPropagation();
                that.itemList.style.display = 'none';

                if (that.options.incrementalSearch) {
                    that.getList(that.itemInput.value);
                }
                else {
                    that.itemInput.focus();
                }
                return;
            }                    
        };

        this.handlers.onItemListBlur = function(e) 
        {
            if (that.itemList.style.display === 'none') {
                that.itemInput.focus();
                return;
            }
            
            if (that.options.focusElementIdAfterSearch) {
                let nextEl = document.getElementById(that.options.focusElementIdAfterSearch)
                if (nextEl) {
                    nextEl.focus();
                }
            }

            e.target.style.display = 'none';

            // Assign selected value to target value element if available.
            // Check if a target element ID is expliclitly provided.
            let target = document.getElementById(that.options.targetValueElementId);
            if (!target) {
                // If not check for __value element.
                target = document.getElementById(that.options.itemInputId + '__value');                
            }
            if (target) {
                let sel = that.getSelectedTextAndValue();                    
                target.value = sel.value;
            }                
            
            if (typeof that.options.onItemListBlur === 'function') {
                let sel = that.getSelectedTextAndValue();
                if (sel !== undefined) {
                    that.assignItem(sel.text, sel.value);
                    that.options.onItemListBlur.call(that, sel.text, sel.value);
                }                    
                else {
                    that.options.onItemListBlur.call(that, undefined);                    
                }
            }            
        };
      
        // 'keyup' event on search input element.            
        this.itemInput.addEventListener('keyup', this.handlers.onItemKeyUp);

        this.itemInput.addEventListener('focus', this.handlers.onItemFocus);
        
        // Click event on list presented. 
        // 'change' has already fired and set the selected 
        // value so just make the list go away. 
        this.itemList.addEventListener('click', this.handlers.onItemListClick);

        // 'change' event on list presented. 
        // governs what's displayed in search input element
        // and optionally calls custom onChange event.
        this.itemList.addEventListener('change', this.handlers.onItemListChange);

        // 'keyup' event on list presented. 
        // Governs behavior when escape or backspace is pressed
        // when list is presented. This is probably desktop-only 
        // behavior.                    
        this.itemList.addEventListener('keyup', this.handlers.onItemListKeyUp);

        // 'blur' event on list presented.
        // Governs behavior when list presented loses focus.
        this.itemList.addEventListener('blur', this.handlers.onItemListBlur);        
    }
}