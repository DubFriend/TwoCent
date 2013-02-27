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



var new_comments_view = function (spec) {
    spec['id'] = spec['id'] || "#tc_comments";
    
    var that = new_view(spec),
        template = spec.template,
        
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

    that.update = function (data) {
        if(data.insertComment) {
            add_comment(data.insertComment['data'], data.insertComment.parentId);
        }
        if(data.comments) {
            $(this.id()).append($(build_comments(data.comments)));
        }
        if(data.isWaiting) {
            if(data.isWaiting === true) {
                this.set_waiting('#tc_loading_comments');
            }
            else if(data.isWaiting === false) {
                this.clear_waiting('#tc_loading_comments');
            }
        }
    };

    return that;
};



var new_form_view = function (spec) {
    var that = new_view(spec),
        id = that.id(),

        clear = function () {
            $(id + ' input[name = "name"]').val("");
            $(id + ' [name = "comment"]').html("");
        },

        add_error = function (inputName, message) {
            var $input = $(id + ' [name="' + inputName + '"]')
            
            $input.addClass('error');
            if(message) {
                $('<span class="error">' + message + '</span>').insertAfter($input);
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


    that.get_data = function () {
        return {
            "name": $(id + ' input[name="name"]').val().trim(),
            "comment": $(id + ' [name="comment"]').html().trim()
        };
    };

    that.update = function (data) {
        if(data.clear === true) {
            clear();
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
        template = spec.template,

        set = function (commentId) {
            $(that.id()).remove();
            $(template).insertAfter($('#tc_' + commentId + ' .response_button'));
        };

    //closure here to retain access to parents update method.
    that.update = (function (parent_update) {
        return function (data) {
            parent_update.apply(this, [data]);
            if(data.set) {
                set(data.set);
            }
        };
    }(that.update));

    return that;
};
