(function () {
    var view;

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

                $('#qunit-fixture').append('<div id="twocent"><div id="comments"></div></div>');
                view = new_comments_view({
                    template: template
                });
            }
        }
    );

    test("add_comments", function () {
        var comment = {
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

        view.update([comment]);

        comment['id'] = 'twocent_1';
        comment['children'][0]['id'] = 'twocent_2';
        
        deepEqual(
            {
                "id": $('#comments #twocent_1').attr("id"),
                "name": $('#comments #twocent_1 > .name').html(),
                "comment": $('#comments #twocent_1 > .comment').html(),
                "date": $('#comments #twocent_1 > .date').html(),
                "children": [
                    {
                        "id": $('#twocent_1 #twocent_2').attr("id"),
                        "name": $("#twocent_1 #twocent_2 > .name").html(),
                        "comment": $("#twocent_1 #twocent_2 > .comment").html(),
                        "date": $("#twocent_1 #twocent_2 > .date").html()
                    }
                ]
            },
            comment
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
                    '<form id="main_form">' +
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
        $('#main_form input[name="name"]').val(" bob ");
        $('#main_form [name="comment"]').html(" bob comment ");
        deepEqual(
            view.get_data(),
            {
                "name": "bob",
                "comment": "bob comment"
            }
        );
    });

    test("clear", function () {
        $('#main_form input[name="name"]').val(" bob ");
        $('#main_form [name="comment"]').html(" bob comment ");
        view.clear();
        deepEqual(
            {
                "name": $('#main_form input[name="name"]').val(),
                "comment": $('#main_form [name="comment"]').html()
            },
            {
                "name": "",
                "comment": ""
            }
        );
    });

    test("add_error", function () {
        view.add_error("name", "message");
        ok($('#main_form input[name="name"]').hasClass("error"), "error class added to input");
        deepEqual($("#main_form span.error").html(), "message", "message added.");
    });

    //depends on test "add_error"
    test("clear_error", function () {
        view.add_error("name", "message");
        view.clear_error();
        ok(! $('#main_form input[name="name"]').hasClass("error"), "error class removed from input");
        deepEqual($("#main_form span.error").html(), undefined, "message removed.");
    });

    test("set_waiting", function () {
        view.set_waiting();
        ok($('#main_form').hasClass("faded"), "faded class added");
        ok($('#main_form .spinner').html(), "spinner inserted");
        deepEqual(
            $('#main_form input[type="submit"]').attr("disabled"),
            "disabled",
            "form submit button disabled"
        );
    });

    //depends on test "set_waiting"
    test("clear_waiting", function () {
        view.set_waiting();
        view.clear_waiting();
        ok(! $('#main_form').hasClass("faded"), "faded class removed");
        ok(! $('#main_form .spinner').html(), "spinner removed");
        deepEqual(
            $('#main_form input[type="submit"]').attr("disabled"),
            undefined,
            "form submit button enabled"
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
                        '<div id="comments">' +

                            '<div class="comment_wrap" id="twocent_1">' +
                                '<div class="name">bob</div>' +
                                '<div class="comment">bob comment</div>' +
                                '<div class="date">bob date</div>' +
                                '<button type="button" class="response_button">respond</button>' +

                                '<div class="comment_wrap" id="twocent_2">' +
                                    '<div class="name">alice</div>' +
                                    '<div class="comment">alice comment</div>' +
                                    '<div class="date">alice date</div>' +
                                    '<button type="button" class="response_button">respond</button>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +
                    '</div>';

                template = "" +
                '<div id="response_form">' +
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
        view.set("#twocent_1");
        deepEqual(
            $("#twocent_1 > #response_form").prop("outerHTML"),
            $(template).prop("outerHTML"),
            "adds new form"
        );

        view.set("#twocent_2");
        deepEqual(
            $("#twocent_1 > #response_form").prop("outerHTML"),
            undefined,
            "removes old form on next set"
        );

        deepEqual(
            $("#twocent_2 > #response_form").prop("outerHTML"),
            $(template).prop("outerHTML"),
            "adds new form, nested"
        );
    });

    //depends on test "set"
    test("get_data", function () {
        view.set("#twocent_1");

        $('#response_form input[name="name"]').val(" bob ");
        $('#response_form [name="comment"]').html(" bob comment ");
        deepEqual(
            view.get_data(),
            {
                "name": "bob",
                "comment": "bob comment"
            }
        );
    });


}());