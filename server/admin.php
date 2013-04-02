<?php
namespace comment_system;

//extend original comment classes with inline edit and delete functionality on all comments.

class Controller_Admin extends Controller {
	protected function build_default_model($Database, $PageData) {
		return new \comment_system\Model_Admin(
			$this->build_default_comment_data($Database),
			$PageData
		);
	}

	protected function build_default_view() {
		return new \comment_system\View_Admin();
	}

	function edit_comment() {}
	function delete_comment() {}
}

class Model_Admin extends Model {

}

class View_Admin extends View {
	//recursively builds comment and its responses.
	protected function build_comment(array $passedComment = NULL) {
		$id = $name = $comment = $date = $children = NULL;

		if($passedComment) {
			$id = get_or_default($passedComment, 'id');
			$name = get_or_default($passedComment, 'name');
			$comment = get_or_default($passedComment, 'comment');
			$date = get_or_default($passedComment, 'date');
			$children = get_or_default($passedComment, 'children');
		}

		$html = "" .
		"<div class='comment_wrap' id='tc_$id'>" .
			"<form class='edit_comment_form'>" .
				"<input type='text' class='name' value='$name'/>" .
				"<textarea class='comment'>$comment</textarea>" .
				"<button class='edit_button'>edit</button>" .
				"<button class='delete_button'>delete</button>" .
			"</form>" .
			"<div class='date'>$date</div>";

		if($children) {
			foreach($children as $child) {
				$html .= $this->build_comment($child);
			}
		}

		$html .= "</div>";
		return $html;
	}

	protected function build_js() {
		return "
		<script src='../jquery/jquery.js'></script>
		<script src='http://www.google.com/recaptcha/api/js/recaptcha_ajax.js'></script>
		<script src='client/spin.js'></script>
		<script src='client/lib.js'></script>
		<script src='client/validator.js'></script>
		<script src='client/model.js'></script>
		<script src='client/view.js'></script>
		<script src='client/controller.js'></script>
		<script src='client/admin.js'></script>";
	}
}
?>