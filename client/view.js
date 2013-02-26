var view = {
    update: function (newData) {
        throw "view.update should be overridden";
    }
};

var new_comments_view = function (spec) {
    var that = Object.create(view),
        template = spec.template,
        build_comments = function (comments) {
            var i,
                com,
                $comment,
                allComments = [];

            for(i = 0; i < comments.length; i += 1) {
                com = comments[i];
                $comment = $(template);

                $comment.attr('id', 'twocent_' + com['id']);
                $comment.find('.name').html(com['name']);
                $comment.find('.comment').html(com.comment);
                $comment.find('.date').html(com.date);

                if(com['children']) {
                    $comment.append(build_comments(com['children']));
                }
                allComments.push($comment.prop("outerHTML"));
            }

            return allComments.join("");
        };

    that.update = function (data) {
        $("#twocent #comments").append($(build_comments(data)));
    };

    return that;
};

var new_form_view = function (spec) {
    var id = spec.formId;
    return {
        get_data: function () {
            return {
                "name": $('#twocent ' + id + ' input[name="name"]').val().trim(),
                "comment": $('#twocent ' + id + ' [name="comment"]').html().trim()
            };
        },
        clear: function () {
            $('#twocent ' + id + ' input[name = "name"]').val("");
            $('#twocent ' + id + ' [name = "comment"]').html("");
        },
        add_error: function (inputName, message) {
            var $input = $('#twocent ' + id + ' [name="' + inputName + '"]')
            $input.addClass('error');
            if(message) {
                $('<span class="error">' + message + '</span>').insertAfter($input);
            }
        },
        clear_error: function () {
            $('#twocent ' + id + ' span.error').remove();
            $('#twocent ' + id + ' .error').removeClass("error");
        }
    }
}

var new_main_form_view = function (spec) {
    var that = new_form_view({formId: "#main_form"});
    return that;
};

var new_response_form_view = function (spec) {
    var that = new_form_view({formId: "#response_form"}),
        template = spec.template;

    that.set = function (commentId) {
        $('#response_form').remove();
        $(template).insertAfter($(commentId + ' .response_button'));
    };

    return that;
};
