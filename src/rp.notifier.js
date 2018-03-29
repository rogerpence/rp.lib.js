'use strict';

var rp = rp || {};

let rp$ = rp.dom.findEl;

function interval(func, wait, times){
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
};

rp.notifier = class Notifier
{
    constructor(options) {
        if (typeof rp.notifier.status == 'undefined') {
            rp.notifier.status = '';
        }            
        const FADE_TIME = 6000;
        this.nofade = '';

        if (options.customIcon !== undefined) {
            this.customIcon = options.customIcon;
        }

        this.manualClose = options.manualClose === undefined ? true : options.manualClose;
        this.disappear = options.disappear === undefined ? true: options.disappear;
        if (!this.disappear) {
            this.manualClose = true;
            this.nofade = 'note-no-fade';
        }
        this.status = options.status === undefined ? 'primary' : options.status;
        this.fadeTime = options.fadeTime === undefined ? FADE_TIME : options.fadeTime;
        
        this.disappearTimer = ''
        this.handlers = {};        
        this.assignHandlers();    
    }

    fade(element) {
        var op = 1;  // initial opacity
    
        let that = this;
        var timer = setInterval(function () {            
            if (op <= 0.3) {                
                clearInterval(timer);
                element.removeEventListener('click', that.handlers.onClick);
                rp.dom.removeElement(element);
                that.shiftNotesUp();
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, 150);
    }

    slideOut(element) {
        console.log(rp.notifier.status);
        let top = 0;
        let height = 0;
        let notes = document.querySelectorAll('.note-container');
        if (notes.length > 1) {
            top = rp.String.removeFromEnd(notes[notes.length-2].style.top, 'px');
            height = rp.String.removeFromEnd(notes[notes.length-2].style.height, 'px');
        }
        element.style.top = (parseInt(top,10) + parseInt(height,10) + 8) + 'px';
        let sel = rp.dom.elementLocation(element);
        let currentLeft = window.innerWidth;
        let left = window.innerWidth - sel.width - 10;    
    
        let that = this;        
        let slidingTimer;
        slidingTimer = setInterval(function() {
            currentLeft = currentLeft - 10;
            if (currentLeft < left) {
                currentLeft = left;
            }
            if (left == currentLeft) {                
                rp.notifier.status = 'sliding done';
                console.log(rp.notifier.status);
                clearInterval(slidingTimer);

            }        
            element.style.left =  currentLeft + 'px';
            element.style.visibility = 'visible';        
        }, 10);    
    }
        
    shiftNotesUp() {
        const SPACE_BETWEEN = 8;
        const TOP_DECREMENTER = 2;
        let notes = document.querySelectorAll('.note-container');
        let newTop = SPACE_BETWEEN;

        let that = this;
        for (var i = 0; i < notes.length; i++) {
            let currentNote = notes[i];
            let currentTop = currentNote.style.top;
            let sel = rp.dom.elementLocation(currentNote);

            currentTop = parseInt(rp.String.removeFromEnd(currentTop, 'px'),10);
            let shiftingTimer;
            shiftingTimer = setInterval(function() {
                currentTop = currentTop - TOP_DECREMENTER;
                if (currentTop < newTop) {
                    currentTop = newTop;
                }
                if (currentTop === newTop) {     
                    console.log('shifting done');                              
                    console.log(rp.notifier.status);
                    clearInterval(shiftingTimer);
                    newTop += sel.height + SPACE_BETWEEN;
                    return;
                }
                currentNote.style.top = currentTop + 'px';
            }, 1);
        }
    }

    getIcon(status) {
        let icons = {  
            'primary': 'fa-circle-notch',
            'secondary': 'fa-bullhorn',
            'success' : 'fa-thumbs-up',
            'danger' : 'fa-exclamation',
            'warning' : 'fa-exclamation-triangle',
            'info' : 'fa-info', 
            'light' : 'fa-sun',
            'dark' : 'fa-moon'
        }

        if (icons[this.status] === undefined) {
            return this.status;
        }
        else {
            return icons[this.status];
        }            
    }

    getHTML(heading, msg) {
        let icon;
        if (this.customIcon !== undefined) {
            icon = this.customIcon;
        }
        else {
            icon = this.getIcon();
        }
        let note = new rp.StringBuilder();

        note.append(`<div class="note-container ${this.status} ${this.nofade}"`); 
        note.append(' style="position:absolute;visibility:hidden" ');
        note.append(` data-disappear="${this.disappear}">`);
        note.append(`<div class="icon-container ${this.status}-dark">`);
        note.append(`<i class="fa ${icon}"></i>`);
        note.append('</div>');
        note.append('<div class="text">');
        note.append('<div class="headline">');
        note.append(`${heading}`); 
        note.append('</div>');
        note.append('<div class="detail">');
        note.append(`${msg}`); 
        note.append('</div>');      
        note.append('</div>');  
        if (this.manualClose) {
            note.append('<div class="close-icon">');
            note.append('<a href="#" title="Close this notice" class="notifier-close"><i class="fa fa-times"></i></a>');
        }            
        note.append('</div>');       
        note.append('</div>');     

        return note.toString();
    }        

    assignHandlers() {
        let that = this;

        this.handlers.onClick = function(e) {
            let element = e.target.parentElement.parentElement.parentElement;
            element.removeEventListener('click', that.handlers.onClick);
            window.clearTimeout(this.disappearTimer);
            rp.dom.removeElement(element);
            that.shiftNotesUp();
        };
    }
    
    show(heading, msg) {      
        rp.notifier.status = 'sliding';
        let newTop = 0;
        const SPACE_BETWEEN = 8;

        let notes = document.querySelectorAll('.rp-note');

        rp$('body').insertAdjacentHTML('beforeend', this.getHTML(heading, msg));

        let newNote = rp$('body').lastElementChild;

        if (this.manualClose) {
            newNote.addEventListener('click', this.handlers.onClick);
        }            
        
        newTop = SPACE_BETWEEN;

        for (let i = 0; i < notes.length; i++) {
            let sel = rp.dom.elementLocation(notes[i]);
            newTop += sel.height + SPACE_BETWEEN;
        }
        
        let sel = rp.dom.elementLocation(newNote);
        newNote.style.height = sel.height + 'px';
        newNote.style.width = '600px';
        newNote.style.top = newTop + 'px';
        
        this.slideOut(newNote);

        let that = this;       
        let fadingTimer;
        if (this.disappear) {
            fadingTimer =  setTimeout(function(){       
                rp.notifier.status = 'fading';      
                console.log(rp.notifier.status);
                that.fade(newNote);        
                clearInterval(fadingTimer);
            }, that.fadeTime);
        }                       
    }
};

rp.dom.documentReady(function() {
    let count = 3;

    let n1 = new rp.notifier({'disappear' : true,
                              'manualClose' : true,
                              'fadeTime' : 7000,
                              'status': 'success'});
     n1.show('Images done uploading', `${count} image(s) were successfully uploaded.`);

    setTimeout(function() {
        let n2 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : false,
                                  'status': 'warning'});
    n2.show('There are input errors', 'See the error list on this page.');   
    }, 5000)

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : false, 
                                  'status': 'danger'});
        n3.show('Danger', 'Watch out for snakes!');
    }, 7000);        

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : true,
                                  'customIcon' : 'fa-arrows',                                  
                                  'fadeTime': 12000,
                                  'status': 'success'});
        n3.show('Success', 'Watch out for snakes');
    }, 15000);        

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : true,
                                  'fadeTime': 12000,
                                  'status': 'primary'});
        n3.show('Primary', 'If everybody had an ocean, across the USA');
    }, 20000);        

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : true,
                                  'status': 'secondary'});
        n3.show('Secondary', 'Second hand man');
    }, 25000);        

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : true,
                                  'status': 'light'})
        n3.show('Light', 'Blinded by the light');
    }, 30000);        

    setTimeout(function(){
        let n3 = new rp.notifier({'disappear' : true, 
                                  'manualClose' : true,
                                  'status': 'dark'});                                  
        n3.show('Dark', 'Darkness on the edge of town');
    }, 35000);        

});
