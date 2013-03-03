var new_text_validator = function (config) {
	var regex = config['regex'],
		minLength = config['minLength'] || 0,
		maxLength = config['maxLength'] || 128,
		//the following methods should return, true/false
		//(or null if the corresponding config data isn't set)
		isnt_short = function (text) {
			if(text.length < minLength) {
				return false;
			}
			else {
				return true;
			}
		},
		isnt_long = function (text) {
			if(text.length > maxLength) {
				return false;
			}
			else {
				return true;
			}
		},
		is_regex_pass = function (text) {
			if(regex) {
				return regex.test(text) ? true : false;
			}
			else return null;
		};

	return {
		validate: function (text) {
			var status = true,
				stat,
				details = {
					"isnt_short": isnt_short(text),
					"isnt_long": isnt_long(text),
					"is_regex_pass": is_regex_pass(text)
				};

			for(stat in details) {
				if(details[stat] !== true && details[stat] !== null) {
					status = false;
					break;
				}
			}
			details['status'] = status;
			return details;
		}
	};
};
