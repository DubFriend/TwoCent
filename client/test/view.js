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

                $('#qunit-fixture').append('<div id="twocent"><div id="tc_comments"></div></div>');
                view = new_comments_view({
                    template: template
                });
            }
        }
    );

    test("add_comments", function () {
        var comment = get_comments();

        view.update([comment]);

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
            "date": "date3"
        };

        view.update([get_comments()]);

        view.add_comment(singleComment, 2);
        singleComment['id'] = "tc_3";
        
        deepEqual(
            {
                "id": $('#tc_2 #tc_3').attr("id"),
                "name": $("#tc_2 #tc_3 > .name").html(),
                "comment": $("#tc_2 #tc_3 > .comment").html(),
                "date": $("#tc_2 #tc_3 > .date").html()
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

        view.update([get_comments()]);

        view.add_comment(singleComment);
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

                view = new_main_form_view();
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
        view.clear();
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
        view.add_error("name", "message");
        ok($('#tc_main_form input[name="name"]').hasClass("error"), "error class added to input");
        deepEqual($("#tc_main_form span.error").html(), "message", "message added.");
    });

    //depends on test "add_error"
    test("clear_error", function () {
        view.add_error("name", "message");
        view.clear_error();
        ok(! $('#tc_main_form input[name="name"]').hasClass("error"), "error class removed from input");
        deepEqual($("#tc_main_form span.error").html(), undefined, "message removed.");
    });

    test("set_waiting", function () {
        view.set_waiting();
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
        view.set_waiting();
        view.clear_waiting();
        ok(! $('#tc_main_form').hasClass("faded"), "faded class removed");
        ok(! $('#tc_main_form .spinner').html(), "spinner removed");
        deepEqual(
            $('#tc_main_form input[type="submit"]').attr("disabled"),
            undefined,
            "form submit button enabled"
        );
    });

    test("add_success", function () {
        view.add_success("test");
        deepEqual(
            $("#tc_main_form .success").html(),
            "test",
            "success message added"
        );
    });

    //depends on test "add_success"
    test("clear_success", function () {
        view.add_success("test");
        view.add_success("test2")
        view.clear_success("test");
        deepEqual(
            $("#tc_main_form .success").html(),
            undefined,
            "success messages removed"
        );
    });

}());

(function () {
    var view, template;
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

                view = new_response_form_view({template: template});
            }
        }
    );

    test("set", function () {
        view.set("#tc_1");
        deepEqual(
            $("#tc_1 > #tc_response_form").prop("outerHTML"),
            $(template).prop("outerHTML"),
            "adds new form"
        );

        view.set("#tc_2");
        deepEqual(
            $("#tc_1 > #tc_response_form").prop("outerHTML"),
            undefined,
            "removes old form on next set"
        );

        deepEqual(
            $("#tc_2 > #tc_response_form").prop("outerHTML"),
            $(template).prop("outerHTML"),
            "adds new form, nested"
        );
    });

    //depends on test "set"
    test("get_data", function () {
        view.set("#tc_1");

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


}());