$(document).ready(function () {



    var commentModel = new_comment_model(),
        commentView = new_comment_view(),
        comment,

        mainFormModel = new_main_form_model(/*{formId: "#tc_main_form"}*/),
        mainFormView = new_main_form_view(),
        mainForm,

        responseFormModel = new_response_form_model(/*{formId: "#tc_response_form"}*/),
        responseFormView = new_response_form_view(),
        responseForm;

    commentView.init();
    commentModel.init();

    mainFormModel.init();
    mainFormView.init();
    mainFormModel.subscribe(mainFormView);
    mainFormModel.subscribe(commentView);


    responseFormModel.init();
    responseFormView.init();
    responseFormModel.subscribe(responseFormView);
    responseFormModel.subscribe(commentView);
    responseForm = new_response_form({
        formId: "#tc_response_form",
        formModel: responseFormModel,
        formView: responseFormView
    });

    responseForm.init();



    commentModel.subscribe(commentView);
    comment = new_comment({
        model: commentModel,
        view: commentView,
        responseFormController: responseForm
    });
    comment.init();


    mainForm = new_form({
        formId: "#tc_main_form",
        formModel: mainFormModel,
        formView: responseFormView
        //responseFormController: responseForm
    });
    
    mainForm.init();

});