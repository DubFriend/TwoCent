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

	function edit_comment() {
		$this->Model->edit_comment(
			$this->get['id'],
			$this->post['name'],
			$this->post['comment']
		);
	}
	function delete_comment() {
		$this->Model->delete_comment_recursive($this->get['id']);
	}
}

class Model_Admin extends Model {
	function edit_comment($id, $name, $comment) {
		$this->DB->update($id, array("name" => $name, "comment" => $comment));
	}

	//recursively delete comment and its children.
	function delete_comment_recursive($id) {
		$Results = $this->DB->select("@parent = ?", array($id), array("id"));
		while($row = $Results->next()) {
			$this->delete_comment_recursive($row['id']);
		}
		$this->DB->delete($id);
	}
}

class View_Admin  {

	function build_comment_system(array $comments = NULL, $pageId) {
		return "
		<div id='twocent'>
			<div id='tc_data' style='display:none;height:0px;'>
				<div id='tc_page_id'>$pageId</div>
				<div id='tc_templates'>
					<div id='tc_comment_template'>" . $this->build_comment() ."</div>
				</div>
			</div>
			<div id='tc_comments'>" . $this->build_all_comments($comments) . "</div>
			<div id='tc_loading_comments'></div>
		</div>";
	}
	
	function build_page(array $comments = NULL, $pageId) {
		return "
		<html>
			<head>
				<title>Comment Example</title>
				<link rel='stylesheet' href='client/style.css'>
			</head>
			<body>
				" . $this->build_comment_system($comments, $pageId) . 
				    $this->build_js() . "
			</body>
		</html>";
	}

	private function build_all_comments(array $comments = NULL) {
		$html = "";
		foreach($comments as $comment) {
			$html .= $this->build_comment($comment);
		}
		return $html;
	}

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
			"<input type='text' class='name' value='$name'/>" .
			"<textarea class='comment'>$comment</textarea>" .
			"<div class='date'>$date</div>" .
			"<button class='edit_button'>edit</button>" .
			"<button class='delete_button'>delete</button>";

		if($children) {
			foreach($children as $child) {
				$html .= $this->build_comment($child);
			}
		}

		$html .= "</div>";
		return $html;
	}

	protected function build_js() {
		return "" .
		"<script src='../jquery/jquery.js'></script>" .
		"<script src='http://www.google.com/recaptcha/api/js/recaptcha_ajax.js'></script>" .
		"<script src='client/spin.js'></script>" .
		"<script src='client/lib.js'></script>" .
		"<script src='client/validator.js'></script>" .
		"<script src='client/model.js'></script>" .
		"<script src='client/view.js'></script>" .
		"<script src='client/controller.js'></script>" .
		"<script src='client/admin.js'></script>";
	}
}
?>