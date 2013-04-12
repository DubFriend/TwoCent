<?php
ini_set('display_errors', 1); 
error_reporting(E_ALL);

require '../utilities/datalayer0.2/datalayer/datalayer.php';
require 'server/comment.php';
//require 'recaptcha.php';
require 'server/admin.php';

$DB = new PDO("mysql:host=localhost;dbname=comment_test", 'root', 'P0l.ar-B3ar');

try{
	$Controller = new \comment_system\Controller_Admin(array(
		"database" => $DB,
		"get" => $_GET,
		"post" => $_POST,
		"pageName" => isset($_GET['pageName']) ? $_GET['pageName'] : null,
		"remoteAddr" => $_SERVER['REMOTE_ADDR']
	));
}
catch(\comment_system\Bad_Url_Exception $e) {
	echo \comment_system\format_error($e);
	exit;
}


$action = NULL;
if(isset($_GET['act'])) {
	$action = $_GET['act'];
}

switch($action) {
	
	case "next_comments":
		echo json_encode($Controller->get_next());
		break;


	//admin
	case "edit_comment":
		$Controller->edit_comment();
		echo json_encode(array(
			"GET" => $_GET,
			"POST" => $_POST
		));
		break;

	case "delete_comment":
		$Controller->delete_comment();
		echo json_encode(array(
			"GET" => $_GET,
			"POST" => $_POST
		));
		break;

	default:
		echo $Controller->index();
		break;
}
?>