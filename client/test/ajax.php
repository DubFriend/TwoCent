<?php
//echo "foo";

ini_set('display_errors',1); 
error_reporting(E_ALL);

switch($_GET['type']) {
	case "success":
		echo json_encode(array("test" => "success"));
	break;
}

?>