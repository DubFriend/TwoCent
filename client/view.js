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

    $('#tc_main_form input[type="submit"]').removeAttr("disabled");

    return {
        id: function () {
            return id;
        },

        update: function (newData) {
            throw "view.update should be overridden";
        },
        
        set_waiting: function (optId) {
            var divId = optId || id;
            $(divId).spin(spinConfig);
            $(divId).addClass("faded");
            $(divId + ' input[type="submit"]').attr("disabled", "disabled");
        },
        
        clear_waiting: function (optId) {
            var divId = optId || id;
            $(divId + ' input[type="submit"]').removeAttr("disabled");
            $(divId).removeClass("faded");
            $(divId).spin(false);
        },

        add_success: function (message, optId) {
            var divId = optId || id;
            $(divId).append($('<p class="success">' + message + '</p>')); 
        },

        clear_success: function (optId) {
            var divId = optId || id;
            $(divId + " p.success").remove();
        }
    };
};



var new_comment_view = function (spec) {
    spec = spec || {};
    spec['id'] = spec['id'] || "#tc_comments";
    
    var that = new_view(spec),
        template,
        isAllreadyInit = false,
        
        build_comments = function (comments) {
            var i, com,
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
        },

        add_comment = function(commentData, parentId) {
            var $comment = $(build_comments([commentData]));
            if(parentId) {
                $(that.id() + ' #tc_' + parentId).append($comment);
            }
            else {
                $(that.id()).prepend($comment);
            }
        };

    that.init = function () {
        if(isAllreadyInit) {
            throw "cannot init comment view more than once.";
        }
        else {
            template = spec.template || $('#tc_comment_template').html();
            $('#tc_comment_template').remove();
            isAllreadyInit = true;
        }
    };

    that.update = function (data) {
        if(data.comment) {
            add_comment(data.comment, data.comment['parent']);
        }

        if(data.comments) {
            $(this.id()).append($(build_comments(data.comments)));
        }
        
        if(data.isWaiting === true) {
            this.set_waiting('#tc_loading_comments');
        }
        else if(data.isWaiting === false) {
            this.clear_waiting('#tc_loading_comments');
        }
    };

    return that;
};



var new_form_view = function (spec) {
    var that = new_view(spec),
        id = that.id(),
        captcha = spec.captcha || Recaptcha,
        clear = function () {
            var $comment = $(id + ' [name = "comment"]');
            $(id + ' input[name = "name"]').val("");
            $comment.val("");
            $comment.html("");
        },

        add_error = function (inputName, message) {
            var $input,
                $message = $('<span class="error">' + message + '</span>');

            if(inputName) {
                $input = $(id + ' [name="' + inputName + '"]');
                $input.addClass('error');
                if(message) {
                    $message.insertAfter($input);
                }
            }
            else if(message) {
                $(id).append($message);
            }
        },

        clear_error = function () {
            $(id + ' span.error').remove();
            $(id + ' .error').removeClass("error");
        },

        update_error = function (error) {
            var i;
            
            if(error) {
                if(error instanceof Array) {
                    for(i = 0; i < error.length; i++) {
                        add_error(error[i].inputName, error[i].message);
                    }
                }
                else {
                    add_error(error.inputName, error.message);
                }
            }
            else if(error === false) {
                clear_error();
            }
        },

        update_success = function (message) {
            if(message) {
                that.add_success(message);
                clear();
                that.reload_captcha();
                setTimeout(function () {
                    that.clear_success();
                }, 5000);
            }
            else if(message === false) {
                that.clear_success();
            }
        },

        update_waiting = function (isWaiting) {
            if(isWaiting === true) {
                that.set_waiting();
            }
            else if(isWaiting === false) {
                that.clear_waiting();
            }
        };

    that.create_captcha = function (divId) {
        captcha.create("6LcARN0SAAAAACoo8eA5xCX76zdfN6m7RVPzwgPG", divId, {theme: "clean"});
    };

    that.reload_captcha = function () {
        captcha.reload();
    };

    that.init = function () {
        that.create_captcha("main_recaptcha");
    };

    that.get_data = function () {
        return {
            "name": $(id + ' input[name="name"]').val().trim(),
            "comment": $(id + ' [name="comment"]').html().trim()
        };
    };

    that.update = function (data) {
        if(data.clear === true) {
            clear();
            that.reload_captcha();
        }
        if(data.clear_captcha === true) {
            that.reload_captcha();
        }
        update_error(data.error);
        update_success(data.success);
        update_waiting(data.isWaiting);        
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
        parent_update = that.update,
        template = spec.template,
        set = function (commentId) {
            $(that.id()).remove();
            $(template).insertAfter($('#tc_' + commentId + ' > .response_button'));
            that.create_captcha("response_recaptcha");
        };

    that.init = function () {
        if(!template) {
            template = $('#tc_response_form_template').html();
        }
        $('#tc_response_form_template').remove();
    };

    that.remove = function () {
        $(that.id()).remove();
    };
        
    that.update = function (data) {
        parent_update.apply(this, [data]);
        if(data.set) {
            set(data.set);
        }
        if(data.success) {
            $(that.id()).remove();
        }
    };

    return that;
};
