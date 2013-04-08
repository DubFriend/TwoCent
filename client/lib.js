//Some Language Add Ons a la "JavaScript the Good Parts"
if(typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('curry', function() {
    var slice = Array.prototype.slice;
    args = slice.apply(arguments),
    that = this;
    return function() {
        return that.apply(null, args.concat(slice.apply(arguments)));
    };
});


//jquery's $(window).height() wasnt working correctly...
function get_window_height() {
    var myHeight = 0;
    if(typeof(window.innerWidth) == 'number') {
        //Non-IE
        myHeight = window.innerHeight;
    }
    else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myHeight = document.documentElement.clientHeight;
    }
    else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myHeight = document.body.clientHeight;
    }
    return myHeight;
};

var trim_id = function (id) {
    return id.slice(3);
};