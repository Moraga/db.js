/**
 * Javascript JSON Queries
 * @author Alejandro Moraga <moraga86@gmail.com>
 */
(function(ref) {
	'use strict';
	
	function db(data) {
		this[0] = data.slice(0);
	}
	
	db.prototype = {
		find: function(query) {
			var match=[], field, k, i=this[0].length;
			for (field in query)
				for (k in query[field])
					match.push('this.'+ k +'(item.'+ field +', query.'+ field +'.'+ k +')');
			match = Function.call(null, 'item', 'query', 'return '+ match.join('&&'));
			for (; i--; match.call(operators, this[0][i], query) || this[0].splice(i, 1));
			return this;
		},
		
		join: function(right, fields, property, append) {
			this[0] = join(this[0], right, fields, property, append);
			return this;
		},
		
		left_join: function(right, fields, property, append) {
			this[0] = join(this[0], right, fields, property, append, true);
			return this;
		},
		
		right_join: function(right, fields, property, append) {
			this[0] = join(right, this[0], fields, property, append, true);
			return this;
		},
		
		group: function() {
			var argsn=arguments.length, match=true, i=0, j, k;
			for (; i < this[0].length; i++) {
				for (this[0][i].count=1, j=this[0].length; --j > i;) {
					for (k=0; k < argsn; k++)
						if (this[0][i][arguments[k]] != this[0][j][arguments[k]]) {
							match = false;
							break;
						}
					if (match) {
						this[0][i].count++;
						this[0].splice(j, 1);
					}
					else
						match = true;
				}
			}
			return this;
		},
		
		sort: function(fields) {
			var field, fn = [];
			for (field in fields)
				fn.push(['this.rank(a.'+ field +')', 'this.rank(b.'+ field +')'][fields[field] == 'asc' ? 'slice' : 'reverse'](0).join('-'));
			fn = Function.call(null, 'a', 'b', 'return '+ fn.join('||'));
			this[0].sort(function(a, b) {
				return fn.call(sort, a, b);
			});
			return this;
		},
		
		each: function(fn) {
			for (var i=0, len=this[0].length; i < len; fn.call(this[0][i], i++));
			return this;
		},
		
		size: function() {
			return this[0].length;
		},
		
		get: function(i) {
			return this[0][i];
		},
		
		all: function() {
			return this[0];
		}
	};
	
	var operators = {
		equal: function(a, b) { return a == b },
		not: function(a, b) { return a != b },
		in: function(a, b) { return b.indexOf(a) > -1 },
		nin: function(a, b) { return b.indexOf(a) == -1 },
		gt: function(a, b) { return a > b },
		gte: function(a, b) { return a >= b },
		lt: function(a, b) { return a < b },
		lte: function(a, b) { return a <= b },
		between: function(a, b) { return a >= b[0] && a <= b[1] },
		match: function(a, b) { return a.match(b) }
	};
	
	function join(left, right, fields, property, append, inclusive) {
		var obj, match, added=0, temp=[], fn=fields.length, ln=left.length, rn=right.length, i=0, j=0;
		if (typeof fields[0][0] != 'object') {
			fields = [fields];
			fn = 1;
		}
		for (; i < fn; temp.push('a.'+ fields[i][0] +'==b.'+ (fields[i][1] || fields[i][0])), i++);
		for (match=Function.call(this, 'a', 'b', 'return '+ temp.join('&&')), temp=[], i=0; i < ln; i++) {
			obj = extend({}, left[i]);
			if (property)
				obj[property] = append ? [] : null;
			for (j=0; j < rn; j++) {
				if (match(left[i], right[j])) {
					if (property) {
						if (append) {
							obj[property].push(right[j]);
							continue;
						}
						else
							obj[property] = extend({}, right[j]);
					}
					else
						extend(obj, right[j]);
					added = temp.push(obj);
				}
			}
			
			if (added)
				added = 0;
			else if (append || inclusive)
				temp.push(obj);
		}
		return temp;
	}
	
	var sort = {
		rank: function(obj) {
			return typeof obj == 'string' ? this.str(obj) : obj;
		},
		str: function(str) {
			str = str.toUpperCase();
			for (var i=str.length, r=(i - 1) * i / 2 * 127; i--; r += str.charCodeAt(i));
			return r;
		}
	};
	
	function extend(a) {
		for (var i=1, k, len=arguments.length; i < len; i++)
			for (k in arguments[i])
				a[k] = arguments[i][k]
		return a;
	}
	
	ref.db = function(data) {
		return new db(data);
	};
	
})(window);