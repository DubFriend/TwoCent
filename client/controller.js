var controller = {
    
};


var new_comment = function (spec) {
    var that = Object.create(controller);
        model = spec.model,
        view = spec.view,
        responseFormController = spec.responseFormController || {
            bind_response_buttons: function () {}
        },
        bind_more_comments = function () {
            $(window).scroll(function () {
                if($(window).scrollTop() + get_window_height() >= $(document).height() - 25) {
                    model.get_next_comments(function () {
                        responseFormController.bind_response_buttons();
                    });
                }
            });
        };

    that.init = function () {
        bind_more_comments();
    }

    return that;
};


var new_form = function (spec) {
    var that = Object.create(controller),
        formModel = spec.formModel,
        formView = spec.formView,
        formId = spec.formId,
        responseFormController = spec.responseFormController || {
            bind_response_buttons: function () {}
        };

    that.bind_response_buttons = function () {
        var that = this;
        $("#twocent .response_button").click(function() {
            var id = $(this).parent().attr("id").slice(3);
            formView.update({set:id});
            that.bind_form();
        });
    };

    that.bind_form = function () {
        $(formId).submit(function(e) {
            e.preventDefault();
            formModel.submit_comment(function () {
                that.bind_response_buttons();
            });
        });
    };

    that.init = function () {
        that.bind_form();
    };

    return that;
};



var new_response_form = function (spec) {
    spec = spec || {};
    var that = new_form(spec);

    that.init = function () {
        this.bind_response_buttons();
    };

    return that;
};
