(function () {
    var ajax,
        url = "ajax.php";
    
    module(
        "ajax test",
        {
            setup: function () {
                ajax = new_ajax();

                $('#qunit-fixture').append(
                    '<div id="twocent">' +
                        '<form id="test_form">' +
                            '<input type="text" name="test" value="test value"/>' +
                        '</form>' +
                    '</div>'
                );
            }
        }
    );

    asyncTest("send_request: get", function () {
        expect(2);
        
        var isSuccessCalled = false;
        
        ajax.send_request({
            url: url + "?type=success",
            success: function (json) {
                isSuccessCalled = true;
                deepEqual(
                    json,
                    {"test":"success"},
                    "response recieved"
                );
                start();
            },
            beforeSend: function () {
                ok(!isSuccessCalled, "beforeSend called, before response");
            }
        });
    });
}());



(function () {
    var model,
        send_config,
        publishData,
        subscriber = {
            update: function (data) {
                publishData = data;
            }
        };

    module(
        "comment_model",
        {
            setup: function () {
                $('#qunit-fixture').append(
                    '<div id="tc_data">' +
                        '<div id="tc_page_id">1</div>' +
                    '</div>' +
                    '<div id="tc_comments">' +
                        '<div class="comment_wrap" id="tc_3"></div>' +
                    '</div>'
                );
                
                send_config = undefined;
                
                model = new_comment_model({
                    ajax: {
                        send_request: function (config) {
                            send_config = config;
                        }
                    }
                });
                model.init();
                model.subscribe(subscriber);
            }
        }
    );


    test("get_next_comments", function () {
        model.get_next_comments();
        
        deepEqual(
            send_config.url,
            "index.php?act=next_comments&page=1&last_id=3",
            "correct url"
        );

        deepEqual(
            publishData,
            {
                isWaiting: true
            },
            "isWaiting before response published"
        );

        send_config.success.apply(model, [[{
            "id": 4
        }]]);

        deepEqual(
            publishData,
            {
                isWaiting:false,
                comments: [{
                    "id": 4
                }]
            },
            "published correct data on success"
        );

        model.get_next_comments();

        deepEqual(
            send_config.url,
            "index.php?act=next_comments&page=1&last_id=4",
            "lastId gets set."
        );
    });

}());


(function () {
    var model,
        sendConfig,
        publishData = [],
        statusCallbackResults,
        subscriber = {
            update: function (data) {
                publishData.push(data);
            }
        },
        nullEvent = {
            preventDefault: function () {}
        };

    module(
        "main form_model",
        {
            setup: function () {
                $('#qunit-fixture').append(
                    '<div id="twocent">' +
                        '<form id="tc_main_form">' +
                            '<input type="text" name="name" value="bob"/>' +
                            '<textarea name="comment">bob message</textarea>' +
                            '<input type="submit" disabled/>' +
                        '</form>' +
                        '<div id="tc_page_id">1</div>' +
                    '</div>'
                );
                
                sendConfig = undefined;
                statusCallbackResults = undefined;
                
                model = new_form_model({
                    ajax: {
                        send_request: function (config) {
                            sendConfig = config;
                        }
                    },
                    formId: "#tc_main_form",
                    status_callback: function (status) {
                        statusCallbackResults = status;
                    }
                });
                model.init();
                model.subscribe(subscriber);
            }
        }
    );


    test("submit_comment", function () {
        model.submit_comment();

        deepEqual(
            sendConfig.url,
            "index.php?act=new_comment",
            "correct url"
        );

        deepEqual(
            publishData.pop(),
            {isWaiting: true, error: false},
            "isWaiting before response published"
        );

        sendConfig.success.apply(model, [{
            "id": 4
        }]);

        deepEqual(
            publishData.pop(),
            {isWaiting: false},
            "isWaiting published false on success"
        );

        deepEqual(
            publishData.pop(),
            {
                "comment": {
                    "comment": "bob message",
                    "id": 4,
                    "name": "bob",
                    "pageId": "1",
                    "recaptcha_challenge_field": "",
                    "recaptcha_response_field": ""
                },
                "success": "Your message has been posted!"
            },
            "published correct data on success"
        );

        deepEqual(
            statusCallbackResults,
            {"status": true},
            "status callback is called."
        );

        sendConfig.success.apply(model, [{
            "status": false,
            "message": "foo"
        }]);

        publishData.pop();

        deepEqual(
            publishData.pop(),
            {
                clear_captcha: true,
                error: {message:"foo"}
            },
            "publishes error message"
        );
    });


}());




(function () {
    var model,
        sendConfig,
        publishData = [],
        subscriber = {
            update: function (data) {
                publishData.push(data);
            }
        },
        nullEvent = {
            preventDefault: function () {}
        };

    module(
        "response form model",
        {
            setup: function () {
                $('#qunit-fixture').append(
                    '<div id="twocent">' +
                        '<div id="2">' +
                            '<form id="tc_response_form">' +
                                '<input type="text" name="name" value="bob"/>' +
                                '<textarea name="comment">bob message</textarea>' +
                                '<input type="submit"/>' +
                            '</form>' +
                        '</div>' +
                        '<div id="tc_page_id">1</div>' +
                    '</div>'
                );
                
                sendConfig = undefined;
                
                model = new_form_model({
                    ajax: {
                        send_request: function (config) {
                            sendConfig = config;
                        }
                    },
                    formId: "#tc_response_form"
                });
                model.init();
                model.subscribe(subscriber);
            }
        }
    );


    test("submit_comment", function () {
        model.submit_comment();

        sendConfig.success.apply(model, [{
            "id": 4
        }]);

        publishData.pop();
           
        deepEqual(
            publishData.pop(),
            {
                "comment": {
                    "comment": "bob message",
                    "id": 4,
                    "name": "bob",
                    "pageId": "1",
                    "recaptcha_challenge_field": "",
                    "recaptcha_response_field": ""
                },
                "success": "Your message has been posted!"
            },
            "published correct data on success"
        );       
    });


}());