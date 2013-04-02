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
		//"pageName" => "pageB",
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
	case "new_comment":
		$response =  $Controller->insert_comment();
		if(isset($response['status']) && $response['status'] === FALSE) {
			echo json_encode($response);
		}
		else {
			echo json_encode(array("id" => $response['primary']));
		}
		break;
	case "next_comments":
		echo json_encode($Controller->get_next());
		break;
	default:
		echo $Controller->index();
		break;
}
?>