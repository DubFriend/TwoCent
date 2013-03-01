(function () {
    var commentModel = new_comment_model(),
        commentView = new_comment_view(),
        comment;

    commentView.init();
    commentModel.init();

    comment = new_comment({
        model: commentModel,
        view: commentView
    });

    comment.init();
}());