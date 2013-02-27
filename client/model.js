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
        pageId = undefined,
        templates = {},
        isAllreadyInit = false;

    return {
        init: function () {
            if(isAllreadyInit) {
                throw "can only call init (globally) once.";
            }
            else {
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
    var that = new_model(spec),
        lastCommentId = undefined,
        nextCommentsUrl = spec.nextCommentsUrl || "index.php?act=next_comments",
        build_url = function (pageId, lastCommentId) {
            var url = nextCommentsUrl + "&page=" + pageId;
            if(lastCommentId) {
                url += "&last_id=" + lastCommentId;
            }
            return url;
        };
        
    that.get_next_comments = function () {
        this.publish({
            isWaiting: true
        });
        this._ajax({
            url: build_url(
                this.page_id(),
                lastCommentId
            ),
            success: function (json) {
                this.publish({
                    isWaiting: false,
                    comments: json
                });
                lastCommentId = json[json.length - 1]["id"];
            }
        });
    };

    return that;
};



var new_form_model = function (spec) {
    var that = new_model(spec);

    that.get_captcha_key = function () {
        return "6LcARN0SAAAAACoo8eA5xCX76zdfN6m7RVPzwgPG";
    };

    return that;
};


var new_response_form_model = function (spec) {
    var that = new_form(spec);

    return that;
};
