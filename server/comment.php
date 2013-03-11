<?php
namespace comment_system;
//requires datalayer.

function get_or_default(array $array, $key, $default = NULL) {
	return isset($array[$key]) ? $array[$key] : $default;
}


class Controller {
	private $get,
	        $post,
	        
	        //$server,
	        $remoteAddr,

	        $Model,
	        $View,
	        $maxNumComments,
	        $Captcha,
	        $pageId, // set in constructor.
	        $PageData;

	function __construct(array $config = array()) {
		$this->get = \comment_system\get_or_default($config, 'get', array());
		$this->post = \comment_system\get_or_default($config,'post', array());
		

		//$this->server = \comment_system\get_or_default($config, 'server', array());
		$this->remoteAddr = \comment_system\get_or_default($config, 'remoteAddr');

		$Database = $config['database'];

		if(isset($config['pageData'])) {
			$this->PageData = $config['pageData'];
		}
		else {
			$this->PageData = $this->build_default_page_data($Database);
		}

		if(isset($config['model'])) {
			$this->Model = $config['model'];
		}
		else {
			$this->Model = $this->build_default_model($Database, $this->PageData);
		}
		
		if(isset($config['view'])) {
			$this->View = $config['view'];
		}
		else {
			$this->View = $this->build_default_view();
		}
		$this->maxNumComments = \comment_system\get_or_default($config, 'maxNumComments', 50);
		$this->Captcha = isset($config['captcha']) ? $config['captcha'] : new ReCaptcha();



		$this->pageId = $this->get_page_id(\comment_system\get_or_default($config, 'pageName'));
	}

	private function get_page_id($pageName) {
		$pageId = null;
		if($pageName) {
			$pageId = $this->PageData->select("@name = ?", array($pageName), array("id"))->next()['id'];
		}
		else if($this->is_page_id_valid(\comment_system\get_or_default($this->post, 'pageId'))) {
			$pageId = $this->post['pageId'];
		}
		else if($this->is_page_id_valid(\comment_system\get_or_default($this->get, 'page'))) {
			$pageId = $this->get['page'];
		}
		return $pageId;
	}

	private function is_page_id_valid($pageId) {
		$isValid = false;
		$results = $this->PageData->select("@id = ?", array($pageId));
		if($results) {
			if($results->count() == 1) {
				$isValid = true;
			}
		}
		return $isValid;
	}

	private function build_default_model($Database, $PageData) {
		return new \comment_system\Model(
			new \DataLayer(array(
				"PDO" => $Database,
				"primaryTable" => "Comment",
				"primaryKey" => "id",
				"tableLinks" => array(
					"INNER page = Page.id"
				),
				"fieldMap" => array(
					"id" => "Comment.id",
					"parent" => "Comment.parent",
					"pageId" => "Comment.page",
					"pageName" => "Page.name",
					"comment" => "Comment.comment",
					"name" => "Comment.name",
					"date" => "Comment.date"
				)
			)),
			$PageData
		);
	}

	private function build_default_view() {
		return new \comment_system\View();
	}

	private function build_default_page_data($Database) {
		return new \Datalayer(array(
            "PDO" => $Database,
            "primaryTable" => "Page",
            "primaryKey" => "id",
            "fieldMap" => array(
                "id" => "Page.id",
                "name" => "Page.name"
            )
        ));
	}

	function get_next($numComments = NULL) {
		$numResults = $numComments ? $numComments : $this->maxNumComments;
		$lastId = isset($this->get['last_id']) ? $this->get['last_id'] : NULL;
		return $this->Model->get_next($lastId, $this->pageId, $numResults);
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
			$this->remoteAddr,//$this->server['REMOTE_ADDR'],
			\comment_system\get_or_default($this->post, "recaptcha_challenge_field"),
			\comment_system\get_or_default($this->post, "recaptcha_response_field")
		);
	}

	//sends out an initial templated prepopulated with the first entries.
	function index() {
		return $this->View->build_page($this->get_next(), $this->pageId);
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
			$PageData,
	        $commentCount;
	        //TODO doesnt appear to be used...
	        //$lastId,
	        //TODO captcha_key might as well just handle this.
	        //$privateCaptchaKey = "6LcARN0SAAAAAEF6mlK_bzW7ESmgzs1Zsr6E5v7f";

	function __construct($DB, $PageData) {
		$this->DB = $DB;
		$this->PageData = $PageData;
	}


	function captcha_key() {
		return "6LcARN0SAAAAAEF6mlK_bzW7ESmgzs1Zsr6E5v7f";
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
		if($this->is_post_valid($values)) {	
			if(isset($values['id'])) {
				unset($values['id']);
			}
			return $this->DB->insert($values);
		}
	}

	private function is_post_valid(array $post) {
		$isPostValid = false;
		if($this->is_in_range(\comment_system\get_or_default($post, 'name'), 3, 32)
		&& $this->is_in_range(\comment_system\get_or_default($post, 'comment'), 10, 2048)
		&& $this->is_in_range(\comment_system\get_or_default($post, 'date'), 19, 19)
		&& $this->is_valid_page_id(\comment_system\get_or_default($post, 'pageId'))
		&& $this->is_valid_parent_id(\comment_system\get_or_default($post, 'parent'))
		) {
			$isPostValid = true;
		}
		return $isPostValid;
	}

	private function is_valid_parent_id($id) {
		$isValidParentId = false;
		if($id) {  
			$result = $this->DB->select("@id = ?", array($id));
			if($result) {
				if($result->count() == 1) {
					$isValidParentId = true;
				}
			}
		}
		else {
			$isValidParentId = true;
		}
		return $isValidParentId;
	}

	private function is_valid_page_id($id) {
		$isValidPageId = false;
		$results = $this->PageData->select("@id = ?", array($id));
		if($results) {
			if($results->count() == 1) {
				$isValidPageId = true;
			}
		}
		return $isValidPageId;
	}

	private function is_in_range($string, $min, $max) {
		return (strlen($string) >= $min && strlen($string) <= $max);
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
				<script src='client/validator.js'></script>
				<script src='client/model.js'></script>
				<script src='client/view.js'></script>
				<script src='client/controller.js'></script>
				<script src='client/twocent.js'></script>
			</body>
		</html>";
	}

	private function build_response_form() {
		return "<form id='tc_response_form'>
<input type='text' name='name' placeholder='Your Name Here.'/>
<textarea name='comment' placeholder='Enter a cool comment :)'></textarea>
<div id='response_recaptcha'></div>
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
			<div id='main_recaptcha'></div>
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