// Taken from:
// http://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields

module.exports = {
  sort_by: function() {
    var fields = [],
      n_fields = arguments.length,
      field, name, reverse, cmp;

    // preprocess sorting options
    for (var i = 0; i < n_fields; i++) {
      field = arguments[i];
      if (typeof field === 'string') {
	name = field;
	cmp = default_cmp;
      }
      else {
	name = field.name;
	cmp = getCmpFunc(field.primer, field.reverse);
      }
      fields.push({
	name: name,
	cmp: cmp
      });
    }

    // final comparison function
    return function(A, B) {
      var a, b, name, result;
      for (var i = 0; i < n_fields; i++) {
	result = 0;
	field = fields[i];
	name = field.name;

	result = field.cmp(A[name], B[name]);
	if (result !== 0) break;
      }
      return result;
    }
  }
}

// utility functions

function default_cmp(a, b) {
  if (a == b) return 0;
  return a < b ? -1 : 1;
}

function getCmpFunc(primer, reverse) {
  var dfc = default_cmp, // closer in scope
      cmp = default_cmp;
  if (primer) {
      cmp = function(a, b) {
	  return dfc(primer(a), primer(b));
      };
  }
  if (reverse) {
      return function(a, b) {
	  return -1 * cmp(a, b);
      };
  }
  return cmp;
}


    /*
    You need to build up a list of fields to sort by like this:
     (the fields can just be the field name like username below, or a {name: 'filedname', reverse: true})
     
     Don't worry about the primer option, I don't think we need it.
    */
      
    //sort_fields = [{name:'name', reverse: false}, {name:'port', reverse: false}, 'username']
    
    // you can see that it works by reversing some of them.
    //result = data.configurations.sort(sort_by('username', 'port']));
     
    // use array expanded into arguments
    //args =  [{name: 'name', primer: function(x){return x.toUpperCase();} }, 'username', 'port'];
    //result = data.configurations.sort(sort_by.apply(this, args));
    
    //$('div').append(JSON.stringify(result, null, '<br />'));
