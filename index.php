<?php
ini_set('display_errors',1); 
error_reporting(E_ALL);
require '../utilities/datalayer0.2/datalayer/datalayer.php';
require 'server/comment.php';
require 'recaptcha.php';

$DB = new PDO("mysql:host=localhost;dbname=comment_test", 'root', 'P0l.ar-B3ar');

$Controller = new \comment_system\Controller(
	$_GET, $_POST, $_SERVER,
	new \comment_system\Model(
		new \DataLayer(array(
			"PDO" => $DB,
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
		))
	),
	new \comment_system\View()
);
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