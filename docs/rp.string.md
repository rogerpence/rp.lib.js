### rp.String: a plain-vanilla JavaScript string library

---

`rp.String` is a namespace that provides string classes and functions. It doesn't aim to be the ultimate string library--quite the opposite. Its intent to put in one place routines that I use frequently. 

If you need something more complete, take a look at: 

* [Voca string library](https://vocajs.com/)
* [Strman string library](https://dleitee.github.io/strman/)

### Classes

#### StringBuilder

A simple string builder class. This class is similar to, but far less featured, than the StringBuilder class that Java or .NET provide. 

##### Constructor

*   `rp.String.StringBuilder()` Return a new instance of `StringBuilder`. 

##### Methods 

*   `append()` Append a string to this instance.

*   `clear()` Clear the current instance.

*   `toString(delimeter='')` Return the current instance as a string with each line separated by `delimiter`; its default value is an empty string. 

#### Usage

    let sb = new rp.StringBuilder();
    sb.append('hello ');
    sb.append('world');

    let str = sb.toString()

    Returns 'hello world'    

#### Notes 
