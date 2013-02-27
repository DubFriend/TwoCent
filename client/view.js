"use strict";

$.fn.spin = function (opts) {
    this.each(function () {
        var $this = $(this),
            data = $this.data();
        if (data.spinner) {
            data.spinner.stop();
            delete data.spinner;
        }
        if (opts !== false) {
            data.spinner = new Spinner(
                $.extend({
                    color: $this.css('color')
                }, opts)
            ).spin(this);
        }
    });
    return this;
};



var new_view = function (spec) {
    var id = spec['id'],
        spinConfig = spec.spinConfig || {
            lines: 9,
            length: 9,
            width: 7,
            radius: 17,
            corners: 1, //(0..1)
            rotate: 0, // The rotation offset
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 74, // Afterglow percentage
            shadow: true,
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9,
            top: 'auto', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };

    return {
        id: function () {
            return id;
        },

        update: function (newData) {
            throw "view.update should be overridden";
        },
        
        set_waiting: function () {
            $(id).spin(spinConfig);
            $(id).addClass("faded");
            $(id + ' input[type="submit"]').attr("disabled", "disabled");
        },
        
        clear_waiting: function () {
            $(id + ' input[type="submit"]').removeAttr("disabled");
            $(id).removeClass("faded");
            $(id).spin(false);
        },

        add_success: function (message) {
            $(id).append($('<p class="success">' + message + '</p>')); 
        },

        clear_success: function () {
            $(id + " p.success").remove();
        }
    };
};



var new_comments_view = function (spec) {
    spec['id'] = spec['id'] || "#tc_comments";
    var that = new_view(spec),
        template = spec.template,
        build_comments = function (comments) {
            var i,
                com,
                $comment,
                allComments = [];

            for(i = 0; i < comments.length; i += 1) {
                com = comments[i];
                $comment = $(template);

                $comment.attr('id', 'tc_' + com['id']);
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
        $(this.id()).append($(build_comments(data)));
    };

    that.add_comment = function(commentData, parentId) {
        var $comment = $(build_comments([commentData]));
        if(parentId) {
            $(this.id() + ' #tc_' + parentId).append($comment);
        }
        else {
            $(this.id()).prepend($comment);
        }
    };

    return that;
};



var new_form_view = function (spec) {
    var that = new_view(spec),//Object.create(view),
        id = that.id();

    that.get_data = function () {
        return {
            "name": $(id + ' input[name="name"]').val().trim(),
            "comment": $(id + ' [name="comment"]').html().trim()
        };
    };

    that.clear = function () {
        $(id + ' input[name = "name"]').val("");
        $(id + ' [name = "comment"]').html("");
    };

    that.add_error = function (inputName, message) {
        var $input = $(id + ' [name="' + inputName + '"]')
        $input.addClass('error');
        if(message) {
            $('<span class="error">' + message + '</span>').insertAfter($input);
        }
    };

    that.clear_error = function () {
        $(id + ' span.error').remove();
        $(id + ' .error').removeClass("error");
    };

    return that;
};



var new_main_form_view = function (spec) {
    spec = spec || {};
    spec['id'] = spec['id'] || "#tc_main_form";
    var that = new_form_view(spec);
    return that;
};



var new_response_form_view = function (spec) {
    spec = spec || {};
    spec['id'] = spec['id'] || "#tc_response_form";
    var that = new_form_view(spec),
        template = spec.template;

    that.set = function (commentId) {
        $(this.id()).remove();
        $(template).insertAfter($(commentId + ' .response_button'));
    };

    return that;
};
