<?php
namespace comment_system;
//requires datalayer.

function get_or_default(array $array, $key, $default = NULL) {
	return isset($array[$key]) ? $array[$key] : $default;
}


class Controller {
	private $get,
	        $post,
	        $Model,
	        $View,
	        $maxNumComments,
	        $Captcha;

	function __construct($get, $post, $server, $Model, $View, $maxNumComments = 50, $Captcha = NULL) {
		$this->get = $get;
		$this->post = $post;
		$this->server = $server;
		$this->Model = $Model;
		$this->View = $View;
		$this->maxNumComments = $maxNumComments;
		$this->Captcha = $Captcha ? $Captcha : new ReCaptcha();
	}

	function get_next($numComments = NULL) {
		$numResults = $numComments ? $numComments : $this->maxNumComments;
		$lastId = isset($this->get['last_id']) ? $this->get['last_id'] : NULL;

		return $this->Model->get_next($lastId, $this->get['page'], $numResults);
	}

	function insert_comment() {
		if($this->is_captcha_valid()) {
			return $this->Model->insert_comment($this->post);
		}
		else return array(
			"status" => FALSE,
			"message" => "captcha validation failed."
		);
	}

	private function is_captcha_valid() {
		return $this->Captcha->is_valid(
			$this->Model->captcha_key(),
			$this->server['REMOTE_ADDR'],
			$this->post["recaptcha_challenge_field"],
			$this->post["recaptcha_response_field"]
		);
	}

	//sends out an initial templated prepopulated with the first entries.
	function index() {
		return $this->View->build_page($this->get_next(), 1);
	}
}


class ReCaptcha {
	function is_valid($key, $ip, $challenge, $response) {
		$resp = recaptcha_check_answer (
			$key,
			$ip,
			$challenge,
			$response
		);
		return $resp->is_valid ? TRUE : FALSE;
	}
}

class NullCaptcha {
	function is_valid($key, $ip, $challenge, $response) {
		return TRUE;
	}
}




class Model {
	private $DB,
	        $commentCount,
	        $lastId,
	        $privateCaptchaKey = "6LcARN0SAAAAAEF6mlK_bzW7ESmgzs1Zsr6E5v7f";

	function __construct($DB) {
		$this->DB = $DB;
	}


	function captcha_key() {
		return $this->privateCaptchaKey;
	}


	function get_next($startId, $page, $numComments) {
		$this->commentCount = 0;
		return $this->recursive_get_next($startId, $page, $numComments, NULL);
	}

	private function recursive_get_next($startId, $page, $numComments, $parent) {
		$result = array();
		if($parent) {
			//prepared statement on LIMIT here apparently fails because getting converted to string.
			//TODO change DataLayer to handle this.
			//http://stackoverflow.com/questions/10014147/limit-keyword-on-mysql-with-prepared-statement-maybe-still-a-bug
			$RootResults = $this->DB->select(
				"@pageId = ? AND @parent = ? LIMIT $numComments",
				array($page, $parent)
			);
		}
		else {
			$idLessThanStatement = "";
			$valuesArray = array($page);
			if($startId) {
				$idLessThanStatement = "@id < ? AND";
				$valuesArray = array($startId, $page);
			}
			$RootResults = $this->DB->select(
				"$idLessThanStatement @pageId = ? AND @parent IS NULL ORDER BY @id DESC LIMIT $numComments",
				$valuesArray
			);
		}
		
		while($row = $RootResults->next()) {
			if($this->commentCount < $numComments) {
				//TODO this implementation will cause some responses to be missed, when using
				//get_next(), (starts with the next root element so missing children of the 
				//last element wont get loaded).
				//I'm leaving a fix out for now to minimize complexity (its a pretty minor issue)
				$this->commentCount += 1;
				$responses = $this->recursive_get_next(
					$startId,
					$page,
					$numComments,
					$row['id']
				);
				if($responses) {
					$row['children'] = $responses;
				}
				$result[] = $row;
			}
		}
		return $result;
	}

	function insert_comment(array $post) {
		$values = $this->DB->filter_array($post);

		if(!isset($values['date'])) {
			$values['date'] = date('Y-m-d H:i:s');
		}
		
		if(isset($values['id'])) {
			unset($values['id']);
		}
		return $this->DB->insert($values);
	}
}







class View {

	function build_comment_system(array $comments = NULL, $pageId) {
		return "
		<div id='twocent'>
			<div id='tc_data' style='display:none;height:0px;'>
				<div id='tc_page_id'>$pageId</div>
				<div id='tc_templates'>
					<div id='tc_comment_template'>" . $this->build_comment() ."</div>
					<div id='tc_response_form_template'>" . $this->build_response_form() . "</div>
				</div>
			</div>
			" . $this->build_main_comment_form('tc_main_form') . "
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
				" . $this->build_comment_system($comments, $pageId) . "
				<script src='../jquery/jquery.js'></script>
				<script src='http://www.google.com/recaptcha/api/js/recaptcha_ajax.js'></script>
				<script src='client/spin.js'></script>
				<script src='client/lib.js'></script>
				<script src='client/model.js'></script>
				<script src='client/view.js'></script>
				<script src='client/controller.js'></script>
				<script src='client/twocent.js'></script>
			</body>
		</html>";
	}

	private function build_response_form() {
		return "
		<form id='tc_response_form'>
			<input type='text' name='name' placeholder='Your Name Here.'/>
			<textarea name='comment' placeholder='Enter a cool comment :)'></textarea>
			<div id='recaptcha'></div>
			<input type='submit' value='Submit response'>
		</form>";
	}

	private function build_main_comment_form($id = NULL, $class = NULL) {
		$idElem = $id ? " id='$id'" : NULL;
		$idClass = $class ? " class='$class'" : NULL;
		$formConfig = $idElem . $idClass;
		return "
		<form$formConfig>
			<input type='hidden' name='pageId'/>
			<div><label>Name</label> 
				<input type='text' name='name' placeholder='Your Name Here.'/>
			</div>
			<div><label>Comment</label>
				<textarea name='comment' placeholder='Enter a cool comment :)'></textarea>
			</div>
			<div id='recaptcha'></div>
			<input type='submit' value='Submit a new comment' disabled/>
		</form>";
	}

	private function build_all_comments(array $comments = NULL) {
		$html = "";
		foreach($comments as $comment) {
			$html .= $this->build_comment($comment);
		}
		return $html;
	}

	//recursively builds comment and its responses.
	private function build_comment(array $passedComment = NULL) {
		$id = $name = $comment = $date = $children = NULL;

		if($passedComment) {
			$id = get_or_default($passedComment, 'id');
			$name = get_or_default($passedComment, 'name');
			$comment = get_or_default($passedComment, 'comment');
			$date = get_or_default($passedComment, 'date');
			$children = get_or_default($passedComment, 'children');
		}

		$html = "<div class='comment_wrap' id='tc_$id'>
<div class='name'>$name</div>
<div class='comment'>$comment</div>
<div class='date'>$date</div>
<button type='button' class='response_button'>Respond</button>";
			if($children) {
				foreach($children as $child) {
					$html .= $this->build_comment($child);
				}
			}
$html .= "
</div>";
		return $html;
	}
}
?>