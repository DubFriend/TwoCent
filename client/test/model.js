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
        publishData,
        subscriber = {
            update: function (data) {
                publishData = data;
            }
        },
        nullEvent = {
            preventDefault: function () {}
        };

    module(
        "form_model",
        {
            setup: function () {
                $('#qunit-fixture').append(
                    '<div id="twocent">' +
                        '<form id="tc_main_form">' +
                            '<input type="text" name="name"/>' +
                            '<textarea name="comment"></textarea>' +
                            '<input type="submit" disabled/>' +
                        '</form>' +
                        '<div id="tc_page_id">1</div>' +
                    '</div>'
                );
                
                sendConfig = undefined;
                
                model = new_form_model({
                    ajax: {
                        send_request: function (config) {
                            sendConfig = config;
                        }
                    }
                });
                model.init();
                model.subscribe(subscriber);
            }
        }
    );


    test("submit_comment", function () {
        model.submit_comment(nullEvent);
    });


}());