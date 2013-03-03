$(document).ready(function () {

    var nameValidator = new_text_validator({
            minLength: 3,
            maxLength: 32
        }),

        commentValidator = new_text_validator({
            minLength: 10,
            maxLength: 2048
        }),

        form_validate = function (data) {
            var i, isValid = true,
                status = {
                    "name": nameValidator.validate(data.name),
                    "comment": commentValidator.validate(data.comment)
                };

            for(key in status) {
                if(status[key]['status'] === false) {
                    isValid = false;
                }
            }
            status['status'] = isValid;

            return status;
        },

        commentModel = new_comment_model(),
        commentView = new_comment_view(),
        mainFormModel = new_main_form_model({validate: form_validate}),
        mainFormView = new_main_form_view(),
        responseFormModel = new_response_form_model({validate: form_validate}),
        responseFormView = new_response_form_view(),
        controller;


    commentView.init();
    commentModel.init();
    mainFormModel.init();
    mainFormView.init();
    responseFormModel.init();
    responseFormView.init();

    mainFormModel.subscribe(mainFormView);
    mainFormModel.subscribe(commentView);
    responseFormModel.subscribe(responseFormView);
    responseFormModel.subscribe(commentView);
    commentModel.subscribe(commentView);

    controller = new_controller({
        commentModel: commentModel,
        mainFormModel: mainFormModel,
        mainFormView: mainFormView,
        responseFormModel: responseFormModel,
        responseFormView: responseFormView,
    });
    controller.init();

});
