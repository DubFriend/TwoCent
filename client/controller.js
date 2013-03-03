var new_controller = function (spec) {
    var that = {},
        commentModel = spec.commentModel,
        mainFormModel = spec.mainFormModel,
        responseFormModel = spec.responseFormModel,
        responseFormView = spec.responseFormView,

        bind_more_comments = function () {
            $(window).scroll(function () {
                if($(window).scrollTop() + get_window_height() >= $(document).height() - 25) {
                    commentModel.get_next_comments(function () {
                        bind_response_buttons();
                    });
                }
            });
        },

        bind_form = function (formModel) {
            $(formModel.form_id()).submit(function(e) {
                e.preventDefault();
                formModel.submit_comment(function () {
                    bind_response_buttons();
                });
            });
        },

        bind_response_buttons = function () {
            var that = this;
            $("#twocent .response_button").click(function() {
                var id = $(this).parent().attr("id").slice(3);
                responseFormView.update({set:id});
                bind_form(responseFormModel);
            });
        };

    that.init = function () {
        bind_more_comments();
        bind_form(mainFormModel);
        bind_response_buttons();
    };

    return that;
};
