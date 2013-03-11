//simple wrapper ajax call to be mocked out in tests. 
var new_ajax = function () {
    return {
        send_request: function (spec) {
            var type = spec['type'] || 'GET',
                dataType = spec.dataType || 'json',
                
                error = spec['error'] || function (jqXHR, textStatus, errorThrown) {
                    alert("ajax ERROR : \n" + errorThrown + "\n" + textStatus);
                },
                
                success = spec.success || function(json) { 
                    alert(JSON.stringify(json)); 
                };

            $.ajax({
                type: type,
                url: spec.url,
                dataType: dataType,
                data: spec['data'],
                error: error,
                beforeSend: spec.beforeSend,
                success: success
            });
        }
    };
};



var model = (function () {
    var pageId = undefined;

    return {
        init: function () {
            if(pageId === undefined) {
                pageId = $('#tc_page_id').html();
                $('#tc_page_id').remove();
            }
        },

        page_id: function () {
            return pageId;
        }
    };
}());



var new_model = function (spec) {
    var that = Object.create(model),
        ajax = spec.ajax || new_ajax(),
        subscribers = [];

    that.publish = function (data) {
        var i;
        for(i = 0; i < subscribers.length; i += 1) {
            subscribers[i].update(data);
        }
    };

    that.subscribe = function (view) {
        subscribers.push(view);
    };

    that._ajax = function (config) {
        ajax.send_request(config);
    };

    return that;
};



//should only be one instance of comment_model
var new_comment_model = function (spec) {
    spec = spec || {};

    var that = new_model(spec),
        lastCommentId = $("#tc_comments > .comment_wrap").last().attr("id"),
        nextCommentsUrl = spec.nextCommentsUrl || "index.php?act=next_comments",
        nextCommentsFlag = true,
        
        build_url = function (pageId, lastCommentId) {
            var url = nextCommentsUrl + "&page=" + pageId;
            if(lastCommentId) {
                url += "&last_id=" + lastCommentId;
            }
            return url;
        };

    lastCommentId = lastCommentId ? lastCommentId.slice(3) : undefined;
        
    that.get_next_comments = function (on_success_extra) {
        var on_success_extra = on_success_extra || function () {};
        if(nextCommentsFlag) {
            nextCommentsFlag = false;
            
            this.publish({isWaiting: true});

            this._ajax({
                url: build_url(
                    this.page_id(),
                    lastCommentId
                ),
                success: function (json) {
                    that.publish({
                        isWaiting: false,
                        comments: json
                    });
                    if(json[json.length -1]) {
                        lastCommentId = json[json.length - 1]["id"];
                    }
                    nextCommentsFlag = true;
                    on_success_extra();
                }
            });
        }
    };

    return that;
};



var new_form_model = function (spec) {
    var that = new_model(spec),
        submitCommentUrl = spec.submitCommentUrl || "index.php?act=new_comment",
        formId = spec.formId,

        validate = spec.validate || function () {
            return {"status": true};
        },

        status_callback = spec.status_callback || function (status) {
            var fine_grained_response = function (statusItem, inputName) {
                var error = {};
                if(statusItem.status === false) {
                    error.inputName = inputName;
                    if(statusItem.isnt_short === false) {
                        error.message = "input is too short.";
                    }
                    else if(statusItem.isnt_long === false) {
                        error.message = "input is too long.";
                    }
                }

                that.publish({error: error});
            };
            //clear error
            that.publish({error: false});
            if(status.captcha && status.captcha.status === false) {
                that.publish({
                    error: {
                        message: "Captcha not set."
                    }
                });
            }


            if(status.status === false) {
                fine_grained_response(status.name, "name");
                fine_grained_response(status.comment, "comment");
            }
        },
        
        get_data = function () {
            var $form = $(formId),
                name = $form.find('input[name="name"]').val(),
                comment = $form.find('[name="comment"]').val(),
                challenge = $form.find('[name="recaptcha_challenge_field"]').val(),
                response = $form.find('[name="recaptcha_response_field"]').val(),

                data = {
                    "recaptcha_challenge_field": challenge ? challenge.trim() : "",
                    "recaptcha_response_field": response ? response.trim() : "",
                    "name": name ? name.trim() : "",
                    "comment": comment ? comment.trim() : "",
                    "pageId": that.page_id()
                },
                parentId = get_parent_id();

            if(parentId) {
                data['parent'] = parentId;
            }
            return data;
        },

        get_parent_id = function () {
            if(formId === "#tc_response_form") {
                return $(formId).parent().attr("id").slice(3);
            }
        };

    that.form_id = function () {
        return formId;
    };

    that.submit_comment = function (on_success_extra) {
        var on_success_extra = on_success_extra || function () {},
            formData = get_data(),
            status = validate({
                name: formData['name'],
                comment: formData.comment,
                captcha: formData.recaptcha_response_field
            });

        if(status['status'] === true) {
            
            this.publish({
                isWaiting: true,
                error: false
            });

            this._ajax({
                type: "POST",
                url: submitCommentUrl,
                data: formData,
                dataType: spec.dataType || 'json',
                dataType: "text",
                beforeSend: spec.beforeSend,
                success: function (json) {
                    //alert(json);
                    if(json['status'] === false) {
                        that.publish({
                            error: {
                                message: json['message']
                            },
                            clear_captcha: true
                        });
                    }
                    else {
                        formData['id'] = json['id'];
                        that.publish({
                            comment: formData,
                            success: "Your message has been posted!"
                        });
                    }
                    that.publish({isWaiting: false});
                    on_success_extra();
                },
                error: function () {
                    alert("ajax error");
                    that.publish({isWaiting: false});
                }
            });

        }
        status_callback(status);
    };

    return that;
};

var new_main_form_model = function (spec) {
    spec = spec || {};
    spec.formId = spec.formId || '#tc_main_form';

    var that = new_form_model(spec);
    return that;
};

var new_response_form_model = function (spec) {
    spec = spec || {};
    spec.formId = spec.formId || '#tc_response_form';

    var that = new_form_model(spec);
    return that;
};
