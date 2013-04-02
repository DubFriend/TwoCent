(function () {
    var view,
        get_comments = function (){
            return {
                "id": "1",
                "name": "bob",
                "comment": "bobcomment",
                "date": "date1",
                "children": [
                    {
                        "id": "2",
                        "name": "alice",
                        "comment": "alicecomment",
                        "date": "date2"
                    }
                ]
            };
        };

    module(
        "comment view",
        {
            setup: function () {
                var template = "" +
                    '<div class="comment_wrap">' +
                        '<div class="name"></div>' +
                        '<div class="comment"></div>' +
                        '<div class="date"></div>' +
                        '<button class="response_button" type="button">Response</button>' +
                    '</div>';

                $('#qunit-fixture').append(
                    '<div id="twocent">' +
                        '<div id="tc_comments"></div>' +
                        '<div id="tc_loading_comments"></div>' +
                    '</div>'
                );
                
                view = new_comment_view({
                    template: template
                });
                view.init();
            }
        }
    );

    test("add_comments", function () {
        var comment = get_comments();

        view.update({comments:[comment]});

        comment['id'] = 'tc_1';
        comment['children'][0]['id'] = 'tc_2';
        
        deepEqual(
            {
                "id": $('#tc_comments #tc_1').attr("id"),
                "name": $('#tc_comments #tc_1 > .name').html(),
                "comment": $('#tc_comments #tc_1 > .comment').html(),
                "date": $('#tc_comments #tc_1 > .date').html(),
                "children": [
                    {
                        "id": $('#tc_1 #tc_2').attr("id"),
                        "name": $("#tc_1 #tc_2 > .name").html(),
                        "comment": $("#tc_1 #tc_2 > .comment").html(),
                        "date": $("#tc_1 #tc_2 > .date").html()
                    }
                ]
            },
            comment
        );
    });

    //depends on test "add_comments"
    test("insert a comment nested", function () {
        var singleComment = {
            "id": "3",
            "name": "will",
            "comment": "willcomment",
            "parent": "2",
            "date": "date3"
        };

        view.update({comments:[get_comments()]});

        view.update({
            comment: singleComment
        });

        singleComment['id'] = "tc_3";
        
        deepEqual(
            {
                "id": $('#tc_2 #tc_3').attr("id"),
                "name": $("#tc_2 #tc_3 > .name").html(),
                "comment": $("#tc_2 #tc_3 > .comment").html(),
                "date": $("#tc_2 #tc_3 > .date").html(),
                "parent": "2"
            },
            singleComment
        );
    });

    //depends on test "add_comments"
    test("insert a comment no parent", function () {
        var singleComment = {
            "id": "3",
            "name": "will",
            "comment": "willcomment",
            "date": "date3"
        };

        view.update({comments:[get_comments()]});

        view.update({
            comment: singleComment
        });

        singleComment['id'] = "tc_3";
        
        deepEqual(
            {
                "id": $('#tc_comments > #tc_3').attr("id"),
                "name": $("#tc_comments > #tc_3 > .name").html(),
                "comment": $("#tc_comments > #tc_3 > .comment").html(),
                "date": $("#tc_comments > #tc_3 > .date").html()
            },
            singleComment
        );
    });

    test("waiting status", function () {
        view.update({isWaiting:true});
        ok($('#tc_loading_comments').hasClass('faded'), "faded class added");
        ok($('#tc_loading_comments .spinner').html(), "spinner added");

        view.update({isWaiting:false});
        ok(!$('#tc_loading_comments').hasClass('faded'), "faded class removed");
        ok(!$('#tc_loading_comments .spinner').html(), "spinner removed");
    });

}());




(function () {
    var view;
    module(
        "main form view",
        {
            setup: function () {
                var html = "" +
                    '<div id="twocent">' +
                        '<form id="tc_main_form">' +
                            '<input type="text" name="name"/>' +
                            '<textarea name="comment"></textarea>' +
                            '<input type="submit" disabled/>' +
                        '</form>' +
                    '</div>';

                $('#qunit-fixture').append(html);

                view = new_main_form_view({captcha: {
                    create: function () {},
                    reload: function () {}
                }});
            }
        }
    );

    test("get_data", function () {
        $('#tc_main_form input[name="name"]').val(" bob ");
        $('#tc_main_form [name="comment"]').html(" bob comment ");
        deepEqual(
            view.get_data(),
            {
                "name": "bob",
                "comment": "bob comment"
            }
        );
    });

    test("clear", function () {
        $('#tc_main_form input[name="name"]').val(" bob ");
        $('#tc_main_form [name="comment"]').html(" bob comment ");

        view.update({clear:true});
        
        deepEqual(
            {
                "name": $('#tc_main_form input[name="name"]').val(),
                "comment": $('#tc_main_form [name="comment"]').html()
            },
            {
                "name": "",
                "comment": ""
            }
        );
    });

    test("add_error", function () {
        view.update({
            error: {inputName: "name", message: "message"}
        });

        ok($('#tc_main_form input[name="name"]').hasClass("error"), "error class added to input");
        deepEqual($("#tc_main_form span.error").html(), "message", "message added.");
    });

    test("add_error, no inputName", function () {
        view.update({
            error: {message: "message"}
        });
        deepEqual($("#tc_main_form span.error").html(), "message", "message added.");
    });

    test("add array of errors", function () {
        view.update({
            error: [
                {inputName: "name", message: "message"},
                {inputName: "comment", message: "another"}
            ]
        });

        ok($('#tc_main_form input[name="name"]').hasClass("error"), "error class added to name input");
        ok($('#tc_main_form [name="comment"]').hasClass("error"), "error class added to comment input");
        deepEqual($("#tc_main_form span.error").first().html(), "message", "first message added.");
        deepEqual($("#tc_main_form span.error").last().html(), "another", "second message added.");
    });

    //depends on test "add_error"
    test("clear_error", function () {
        view.update({
            error: {inputName: "name", message: "message"}
        });

        view.update({
            error: false
        });
        
        ok(! $('#tc_main_form input[name="name"]').hasClass("error"), "error class removed from input");
        deepEqual($("#tc_main_form span.error").html(), undefined, "message removed.");
    });

    test("set_waiting", function () {
        view.update({isWaiting: true});

        ok($('#tc_main_form').hasClass("faded"), "faded class added");
        ok($('#tc_main_form .spinner').html(), "spinner inserted");
        deepEqual(
            $('#tc_main_form input[type="submit"]').attr("disabled"),
            "disabled",
            "form submit button disabled"
        );
    });

    //depends on test "set_waiting"
    test("clear_waiting", function () {
        view.update({isWaiting: true});
        view.update({isWaiting: false});
        
        ok(! $('#tc_main_form').hasClass("faded"), "faded class removed");
        ok(! $('#tc_main_form .spinner').html(), "spinner removed");
        deepEqual(
            $('#tc_main_form input[type="submit"]').attr("disabled"),
            undefined,
            "form submit button enabled"
        );
    });

    test("add_success", function () {
        view.update({success: "test"});
        
        deepEqual(
            $("#tc_main_form .success").html(),
            "test",
            "success message added"
        );
    });

    //depends on test "add_success"
    test("clear_success", function () {
        view.update({success: "test"});
        view.update({success: "test"});
        view.update({success: false});
        
        deepEqual(
            $("#tc_main_form .success").html(),
            undefined,
            "success messages removed"
        );
    });

}());



(function () {
    var view,
        template;
    
    module(
        "response form view",
        {
            setup: function () {
                var html = "" +
                    '<div id="twocent">' +
                        '<div id="tc_comments">' +

                            '<div class="comment_wrap" id="tc_1">' +
                                '<div class="name">bob</div>' +
                                '<div class="comment">bob comment</div>' +
                                '<div class="date">bob date</div>' +
                                '<button type="button" class="response_button">respond</button>' +

                                '<div class="comment_wrap" id="tc_2">' +
                                    '<div class="name">alice</div>' +
                                    '<div class="comment">alice comment</div>' +
                                    '<div class="date">alice date</div>' +
                                    '<button type="button" class="response_button">respond</button>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +
                    '</div>';

                template = "" +
                '<div id="tc_response_form">' +
                    '<input type="text" name="name"/>' +
                    '<textarea name="comment"></textarea>' +
                    '<input type="submit"/>' +
                '</div>';

                $('#qunit-fixture').append(html);

                
                view = new_response_form_view({
                    template: template,
                    captcha: {
                        create: function () {},
                        destroy: function () {}
                    }
                });
            }
        }
    );

    test("set", function () {
        view.update({set: 1});
        

        ok($("#tc_1 > #tc_response_form").html(), "adds new form");
        /*deepEqual(
            $("#tc_1 > #tc_response_form").prop("outerHTML"),
            $(template).prop("outerHTML"),
            "adds new form"
        );*/

        view.update({set: 2});

        deepEqual(
            $("#tc_1 > #tc_response_form").prop("outerHTML"),
            undefined,
            "removes old form on next set"
        );

        ok($("#tc_2 > #tc_response_form").html(), "adds new form, nested");

        /*deepEqual(
            $("#tc_2 > #tc_response_form").prop("outerHTML"),
            $(template).hide().slideDown().prop("outerHTML"),
            "adds new form, nested"
        );*/
    });

    //depends on test "set"
    test("get_data", function () {
        view.update({set: 1});
        $('#tc_response_form input[name="name"]').val(" bob ");
        $('#tc_response_form [name="comment"]').html(" bob comment ");
        
        deepEqual(
            view.get_data(),
            {
                "name": "bob",
                "comment": "bob comment"
            }
        );
    });

    //depends on test "set"
    test("test inherits parent update", function () {
        view.update({set: 1});
        view.update({isWaiting: true});
        
        ok($('#tc_response_form').hasClass('faded'));
    })

}());