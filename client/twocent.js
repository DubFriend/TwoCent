$(document).ready(function () {

    var commentModel = new_comment_model(),
        commentView = new_comment_view(),
        mainFormModel = new_main_form_model(),
        mainFormView = new_main_form_view(),
        responseFormModel = new_response_form_model(),
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
        responseFormModel: responseFormModel,
        responseFormView: responseFormView,
    });
    controller.init();

});
