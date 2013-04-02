(function () {
	var Validator;
	module(
		"Validator",
		{
			setup: function () {
				Validator = new_text_validator({
					regex: /^([a-z]+)$/,
					minLength: 3,
					maxLength: 5
				});
			}
		}
	);

	test("pass", function () {
		deepEqual(
			Validator.validate("test"),
			{
				'status': true,
				'isnt_short': true,
				'isnt_long': true,
				'is_regex_pass': true
			}
		);
	});

	test("fail: too short", function () {
		deepEqual(Validator.validate("abc")['status'], true, "boundary condition");
		deepEqual(
			Validator.validate("po"),
			{
				'status': false,
				'isnt_short': false,
				'isnt_long': true,
				'is_regex_pass': true
			}
		);
	});

	test("fail: too long", function () {
		deepEqual(Validator.validate("abcde")['status'], true, "boundary condition");
		deepEqual(
			Validator.validate("abcdef"),
			{

				'status': false,
				'isnt_short': true,
				'isnt_long': false,
				'is_regex_pass': true
			}
		);
	});

	test("fail: regex fail", function () {
		deepEqual(
			Validator.validate("TEST"),
			{
				'status': false,
				'isnt_short': true,
				'isnt_long': true,
				'is_regex_pass': false
			}
		);
	});

	test("null config: pass", function () {
		Validator = new_text_validator({});
		deepEqual(
			Validator.validate("TEST"),
			{
				'status': true,
				'isnt_long': true,
				'isnt_short': true,
				'is_regex_pass': null
			}
		);
	});



}());