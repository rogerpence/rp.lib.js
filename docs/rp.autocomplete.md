

### rp.AutoComplete: a plain-vanilla JavaScript autocomplete object

---

`rp.AutoComplete` is a plain vanilla JavaScript autocomplete object. It has one purpose: to Ajax enable a lookup for an `input` tag. Your HTML needs to provide the input tag, but otherwise `rp.AutoComplete` injects the HTML it needs for the lookup list into the page.  

`rp.AutoComplete` works by dynamically building a fixed-size `select` tag (essentially using the `select` tag as a listbox) and displaying it adjacent to its corresponding input element. The CodePen below shows the core behavior of how the `select` tag is displayed.

<p data-height="265" data-theme-id="0" data-slug-hash="MPvOPx" data-default-tab="js,result" data-user="rogerpence" data-pen-title="Make a select tag appear and disappear" class="codepen">See the Pen <a href="https://codepen.io/rogerpence/pen/MPvOPx/">Make a select tag appear and disappear</a> by roger pence (<a href="https://codepen.io/rogerpence">@rogerpence</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

<p data-height="265" data-theme-id="dark" data-slug-hash="MPvOPx" data-default-tab="js,result" data-user="rogerpence" data-pen-title="Make a select tag appear and disappear" data-preview="true" class="codepen">See the Pen <a href="https://codepen.io/rogerpence/pen/MPvOPx/">Make a select tag appear and disappear</a> by roger pence (<a href="https://codepen.io/rogerpence">@rogerpence</a>) on <a href="https://codepen.io">CodePen</a>.</p>



Minimal basic usage:

##### HTML

        <input id="state" />

##### JavaScript 

	let listOptions = {
	    itemInputId: 'state',         
	    url: '../api/doctors?startswith='
	}  

	new rp.AutoComplete(listOptions);

Lotto produces this:

![](https://rogerpence.com/storage/images/autocomplete.2458181.59358.png?1)

#### Implementation

When rp.AutoComplete is instanced it adds a `div` tag with a child `select` just above the target document's ending `body` tag. The `div` is provided for potential styling use. At runtime, rp.AutoComplete generates `option` tags for the `select` tag.

A note here about uppercase versus lowercase searches.    

#### Properties: 

* **itemInputId** - Required. The element id of an input tag used to enter search text.
* **url** - Required. The URL of an HTTP Json service. The value from the input field identified by `itemInputId` is appended to the end of this URL when the service is called. 
* **focusElementIdAfterSearch** Optional (but recommended). The ID of the element to receive focus after the search is performed and the `itemInputId` element loses focus. Providing this value ensures correct tabbing order after the search selection is made. 
* **targetValueElementId** Optional. It's usually handy to use a hidden input field to make the selected value easily available to the server side. By default, `rp.autocomplete` looks for an element ID of `itemInputId + '__value'` and if found, stores the selected search's value in that element's `value` attribute. 

	Use this property if you need to need to explicitly provide a target value element Id (I'm looking at you ASP.NET Webforms!). 

	For client side work, after having made a section the `itemInputId` gets a `data-value` attribute with the selected value assigned to it).
* **incrementalSearch** Optional. If `true` the search is perfor
med incrementally as backspace key is pressed (thereby removing the last search character each time the backspace key is pressed). For example, assume the current search value is 'john.' When `incrementalSearch` is true, when the backspace key is pressed (and 'john' becomes 'joh') the search is refreshed from the 'joh' value. When `incrementalSearch` is false the user needs to type another key to refresh the search list. Defaults to `false`.
* **textField** Optional. The name of the Json property to display as text for an associated list item. Defaults to `text`.
* **valueField** Optional. The name of the Json property to use as the value for the associated list item. Defaults to `value`. 
* **size** Optional. The number of rows displayed for the associated `select` tag (corresponds to the `select` tag's `size` attribute). Defaults to 12.
* **wait** Optional. The number of milliseconds to wait after typing stops before making the Ajax call. Defaults to 300.
* **display** Optional. Either `text` or `value` to indicate what from the associated list item should be displayed in the input tag when a selection is made. Defaults to `text`. 
* **selectClass** Optional. A space-delimited set of class names for the associated `select` tag. Defaults to an empty string.
* **divClass** Optional. A space-delimited set of class names for the associated `select` tag's owning `div` tag. Defaults to an empty string. 

#### Events

These events let you tailor the behavior of rp.AutoComplete to your specific needs. All events are called with the current instance of the rp.autocomplete as the context. This makes it easy to call class instance methods from these event handlers.
  
* **onItemFocus** - No arguments. This event is raised when the input item receives focus. 
* **onSetQueryString** - Arguments: searchValue. This event handler allows you to customize the URL for the Ajax call. This handler is generally used to perform a cascading search with multiple text boxes. 
* **onItemListDisplay** - Arguments: text, value.  
* **onItemListChange** - Arguments: value. Use this event to capture the item value while the list is being scrolled. This probably has no use in an app but is good for debugging to the console 
* **onItemListBlur** - Arguments: text, value. Use this event if you want to fetch the selected item immediately after the selection has been made. You might use this method to populate a linked dropdown. item is an object with value and text properties of the selected item. If no selection was made when the event is raises its first argument is undefined. 

### Notes:

* **Watch your z-order!** In some cases a parent element's z-index may cause the select list to appear behind that parent element. If you need to control the z-order of the select list, use the `selectClass` property to ensure a high z-index value on the select list. (The default z-index of the select list is `auto`).

	For example: 

	In a CSS file named `Page.css` define this class:

		.top-most {
			z-index: 10000;
		}

	and specify that class name as the selectClass property value:
	
		selectClass: 'top-most'		

	To ensure topmost behavior of your select list, you may also need to ensure the z-index of the parent element is lower than the z-order you specify.

	> The [z-context](https://github.com/gwwar/z-context) Chrome extension is a great aid in diagnosing z-index issues.  

* **Getting more than a single value back**  	

	select trim(fullName), npi concat '|' concat pacid
		
		1588634182  |0042210403 