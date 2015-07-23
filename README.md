Javascript JSON Queries
=======================

Isn't a database, but a functional, fast and simple way to manipulate data in Javascript.

## Methods:

* ```find ( Object query )```
* ```filter ( Function )```
* ```join ( Array data , Object match, String putIn, Bool append )```
* ```left_join ( Array data, Object match, String putIn, Bool append )```
* ```right_join ( Array data, Object match, String putIn, Bool append )```
* ```reverse ( void )```
* ```group ( Array [prop], ... , Object options )```
* ```sort ( Object {prop: asc|desc, ...} )```
* ```slice ( Number start , Number end )```
* ```limit ( Number offset, Number count )```
* ```each ( Function ) ```
* ```size ( void )```
* ```get ( Number index ) ```
* ```all ( void ) ```
* ```apply ( Function ) ```
* ```scope ( Function )```
* ```add ( Array data )```
* ```clone ( void )```
* ```print ( ...properties )```
* ```debug ( String name, Function )```

## Operators

* eq - Equal
* not - Not equal
* in - In array
* nin - Not int array
* gt - greater than
* gte - greater than or equal
* lt - lower than
* lte - lower than or equal
* between - between interval
* match - regular expression

## Examples

Considering:

```js
var products = [
	{name: "notebook", cat: 1, price: 1799.00},
	{name: "computer", cat: 1, price: 978.50},
	{name: "js book" , cat: 2, price: 31.00},
	{name: "py book" , cat: 2, price: 29.00},
	{name: "game"    , cat: 3, price: 150.00},
	{name: "ipod"    , cat: 4, price: 190.00}
];
```

**Find, sort and print**

```js
db(products)
	.find({
		price: {lte: 190},
		cat: {in: [2, 3]}
	})
	.sort({price: 'desc', name: 'asc'})
	.print('name', 'price');

// py book 29.00
// js book 31.00
// game 150.00
```

**filter***

```js
db(products)
	.filter(function(product) {
		return product.price <= 1000;
 	})
 	...
 ```
 
 ***join***
 
 ```js
 var categories = [
	{id: 1, name: "computer"},
	{id: 2, name: "books"},
	{id: 3, name: "games"},
	{id: 4, name: "apple"},
	{id: 5, name: "car"}
];

db(products)
	.join(categories, ['cat', 'id'], 'category')
	...
```
 
***scope***
 
```js
db(products)
	.scope(function() {
		if (externalVar) {
			this.sort({price: 'asc'});
		}
		
		if (anotherExternalVar) {
			this.group(['cat']);
		}
	})
	...
```
 
## Cases

DB.js was used to generate complex charts and statistics from Brazil President Elections 2014 manipulating data from hundreds of studies.

## License

MIT.

## Author
 
Alejandro Moraga <moraga86@gmail.com>