/**
 * Javascript JSON Queries
 * @author Alejandro Moraga <moraga86@gmail.com>
 */
(function(ref, undefined) {
	'use strict';
	
	var debug = {};
	
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
		
		filter: function(fn) {
			this[0] = this[0].filter(fn, this[0]);
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
		
		right_join: function(right, fields, property, append, inclusive) {
			this[0] = join(right, this[0], fields, property, append, inclusive == undefined || inclusive);
			return this;
		},
		
		reverse: function() {
			this[0].reverse();
			return this;
		},
		
		group: function(fields, options) {
			var match=[], copy, sum =[[], []], i, j, k;
			for (i=0; i < fields.length; match.push('a.'+ fields[i] +'==b.'+ fields[i++]));
			match = Function.call(null, 'a', 'b', 'return '+ match.join('&&'));
			if (!options) options = {};
			options.count = options.count || 'count';
			for (k in options.sum) {
				sum[0].push('this.'+ k +' =0');
				sum[1].push('this.'+ k +'+=b.'+ options.sum[k]);
			}
			sum[0] = Function.call(null, sum[0].join(';'));
			sum[1] = Function.call(null, 'b', sum[1].join(';'));
			for (i=0; i < this[0].length; i++) {
				copy = extend({}, this[0][i]);
				sum[0].call(this[0][i]);
				if (options.appendTo)
					this[0][i][options.appendTo] = [];
				if (options.count)
					this[0][i][options.count] = 0;
				for (j=this[0].length; j--;) {
					if (match(this[0][i], this[0][j])) {
						this[0][i][options.count]++;
						sum[1].call(this[0][i], this[0][j]);
						if (options.appendTo)
							this[0][i][options.appendTo].unshift(i == j ? copy : this[0].splice(j, 1)[0]);
						else if (i !== j)
							this[0].splice(j, 1);
					}
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
		
		slice: function() {
			this[0] = [].slice.apply(this[0], arguments);
			return this;
		},
		
		limit: function(offset, count) {
			return this.slice.apply(this, count == undefined ? [0, offset] : [offset, offset + count])
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
		},
		
		apply: function(fn) {
			for (var i=this[0].length; i--; (this[0][i]=fn.call(this[0][i], i)) || this[0].splice(i, 1));
			return this;
		},
		
		scope: function(fn) {
			fn.call(this);
			return this;
		},
		
		debug: function(act, fn) {
			if (act == undefined)
				return debug;
			else if (typeof act == 'boolean')
				this.each(function(i) {
					debug[this] = act;
				});
			else if (debug[act])
				fn.call(this);
			return this;
		}
	};
	
	var operators = {
		eq: function(a, b) { return a == b },
		not: function(a, b) { return a != b },
		'in': function(a, b) { return b.indexOf(a) > -1 },
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
		if (typeof fields[0] != 'object') {
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