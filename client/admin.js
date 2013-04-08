$(document).ready(function () {

    var commentModel = new_comment_model(),
        commentView = new_admin_comment_view(),

        adminModel = new_admin_model({
            editCommentUrl: "index.php?act=edit",
            deleteCommentUrl: "index.php?act=delete"
        }),

        controller;

    commentView.init();
    commentModel.init();
    commentModel.subscribe(commentView);

    controller = new_admin_controller({
        commentModel: commentModel,
        model: adminModel
    });

    controller.init();
});
