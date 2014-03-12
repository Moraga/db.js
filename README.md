Javascript JSON Queries
================

Example

	var users = [
		{name: 'A', age: 27, sex: 'M'},
		{name: 'B', age: 23, sex: 'F'},
		{name: 'C', age: 35, sex: 'M'},
		{name: 'A', age: 24, sex: 'F'},
		{name: 'D', age: 28, sex: 'F'},
		{name: 'A', age: 27, sex: ''}
	];
	
	var sex = [
		{id: 'M', label: 'Male'},
		{id: 'F', label: 'Female'},
	];
	
	db(users)
		.find({
			name: {
				in: ['A', 'B', 'C']
			},
			age: {
				gte: 25
			},
			sex: {
				not: ''
			}
		})
		.group('name')
		.find({
			count: {
				gte: 1
			}
		})
		.left_join(sex, ['id', sex'], 'sex')
		.each(function(i) {
			console.log([i, this.name, this.age, this.sex.label || ''].join(' '));
		});