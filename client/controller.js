var new_controller = function (spec) {
    var that = {},
        commentModel = spec.commentModel,
        mainFormModel = spec.mainFormModel,
        mainFormView = spec.mainFormView,
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

        bind_main_form_focus = function () {
            var $form = $(mainFormView.id()),
                set_captcha = function () {
                    if(! $('#main_recaptcha').html()) {
                        mainFormView.destroy_captcha();
                        mainFormView.create_captcha("main_recaptcha");
                        responseFormView.remove();
                    }
                };

            $form.find('input[name="name"]').focus(set_captcha);
            $form.find('[name="comment"]').focus(set_captcha);
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
        bind_main_form_focus();
    };

    return that;
};


var new_admin_controller = function (spec) {
    var that = new_controller(spec),
        
};
