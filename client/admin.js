$(document).ready(function () {

    var commentModel = new_comment_model(),
        commentView = new_admin_comment_view(),

        adminModel = new_admin_model({
            editCommentUrl: "admin.php?act=edit_comment",
            deleteCommentUrl: "admin.php?act=delete_comment"
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
