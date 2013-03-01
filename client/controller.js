var controller = {

};


var new_comment = function (spec) {
    var that = Object.create(controller);
        model = spec.model,
        view = spec.view,
        bind_more_comments = function () {
            $(window).scroll(function () {
                if($(window).scrollTop() + get_window_height() >= $(document).height() - 25) {
                    model.get_next_comments();
                }
            });
        };

    model.subscribe(view);
    that.init = function () {
        bind_more_comments();
    }
    return that;
};


var new_form = function (spec) {
    var that = Object.create(controller),
        formModel = spec.formModel,
        formId = spec.formId,
        bind_form = function () {
            $(formId).submit(function(e) {
                formModel.submitComment(e);
            });
        };
    return that;
};

var new_response_form = function (spec) {
    spec = spec || {};
    var that = new_form(spec);
    return that;
};
