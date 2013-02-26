var new_ajax = function () {
    return {
        send_request: function (spec) {
            var type = spec['type'] || 'get',
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
        },

        bind_form_submit: function(spec) {
            var statusCallback = spec.statusCallback || function (status) {},
                validate = spec.validate || function () {
                    return {
                        "status": true,
                        "default": {"status": true}
                    };
                };

            spec.FormRef.submit(function(e) {
                var status = validate();
                e.preventDefault();
                if(status['status'] === true) {
                    if(spec.before) {
                        //jquery's beforeSend, apparently happens after dom post variables are grabbed.
                        spec.before();
                    }
                    send_ajax_request({
                        type: "post",
                        url: spec.url,
                        data: $(e.target).serialize(),
                        dataType: spec.dataType,
                        beforeSend: spec.beforeSend,
                        success: spec.success,
                        error: spec['error']
                    });   
                }
                statusCallback(status);
            });
        }
    };
};




var model = (function () {
    var subscribers = [];
    return {
        publish: function (data) {
            var i;
            for(i = 0; i < subscribers.length; i += 1) {
                subscribers[i].update(data);
            }
        },
        subscribe: function (view) {
            subscribers.push(view);
        }
    };
}());


var new_comment_model = function (spec) {
    var that = Object.create(model),
        comment_data;
    
    that.get_next_comments = function () {
        //some ajax calls (seperate object, goes here)
        this.publish(data);
    };

    that.test = function (data) {
        this.publish(data);
    };



    return that;
};


var new_form_model = function (spec) {
    var that = Object.create(model);

    return that;
};


var new_response_form_model = function (spec) {
    var that = new_form(spec);

    return that;
};
