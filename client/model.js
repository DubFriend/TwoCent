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
    var subscribers = [],
        pageId = undefined;

    return {
        init: function () {
            if(pageId === undefined) {
                pageId = $('#tc_page_id').html();
                $('#tc_page_id').remove();
                isAllreadyInit = true;
            }
        },

        publish: function (data) {
            var i;
            for(i = 0; i < subscribers.length; i += 1) {
                subscribers[i].update(data);
            }
        },
        
        subscribe: function (view) {
            subscribers.push(view);
        },
        
        page_id: function () {
            return pageId;
        }
    };
}());



var new_model = function (spec) {
    var that = Object.create(model),
        ajax = spec.ajax || new_ajax();

    that._ajax = function (config) {
        ajax.send_request(config);
    };

    return that;
};



//should only be one instance of comment_model
var new_comment_model = function (spec) {
    spec = spec || {};

    var that = new_model(spec),
        lastCommentId = $("#tc_comments > .comment_wrap").last().attr("id").slice(3),
        nextCommentsUrl = spec.nextCommentsUrl || "index.php?act=next_comments",
        nextCommentsFlag = true,
        
        build_url = function (pageId, lastCommentId) {
            var url = nextCommentsUrl + "&page=" + pageId;
            if(lastCommentId) {
                url += "&last_id=" + lastCommentId;
            }
            return url;
        };
        
    that.get_next_comments = function () {
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
            return {
                "status": true,
                "default": {"status": true}
            };
        },
        status_callback = spec.status_callback || function (status) {},
        get_data = function () {
            return {
                "name": $(formId + ' input[name="name"]').val().trim(),
                "comment": $(formId + ' [name="comment"]').html().trim(),
                "parent": $(formId + ' input[name=""]').html() || "",
                "pageId": that.page_id()
            };
        };

    that.get_captcha_key = function () {
        return "6LcARN0SAAAAACoo8eA5xCX76zdfN6m7RVPzwgPG";
    };








    that.submit_comment = function (e) {
        e.preventDefault();
        var status = validate(),
            formData = get_data();

        if(status['status'] === true) {
            
            this.publish({isWaiting: true});

            this._ajax({
                url: submitCommentUrl,
                data: formData,
                dataType: spec.dataType || 'json',
                beforeSend: spec.beforeSend,
                success: function (json) {
                    if(json['status'] === false) {
                        this.publish({
                            error: {
                                message: json['message']
                            }
                        });
                    }
                    else {
                        formData['id'] = json['id'];
                        this.publish({
                            insertComment: {
                                data: formData,
                                parendId: get_parent_id()
                            }
                        });
                    }
                    this.publish({isWaiting: false});
                },
                error: function () {
                    alert("ajax error");
                    this.publish({isWaiting: false});
                }
            });

        }
        status_callback(status);
    };



    

    return that;
};

var new_main_form_model = function (spec) {
    spec.formId = spec.formId || '#tc_main_form';

    var that = new_form(spec);
    return that;
};

var new_response_form_model = function (spec) {
    spec.formId = spec.formId || '#tc_response_form';

    var that = new_form(spec);
    return that;
};
