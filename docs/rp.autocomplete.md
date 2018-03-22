

### rp.AutoComplete: a plain-vanilla JavaScript autocomplete object

---

rp.AutoComplete is a plain vanilla JavaScript autocomplete object. It has one purpose: to Ajax enable a lookup for an `input` tag. Your HTML needs to provide the input tag, but otherwise rp.AutoComplete injects the HTML it needs for the lookup list into the page.  

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
* **targetValueElementId** Option. This is the ID of an input text element (which is generally hidden) into which the selected value is recorded. Providing this element makes it easy to read the selected value on the server side. (For client side work, after having made a section the itemInputId gets a `data-value` attribute with the selected value assigned to it).
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
