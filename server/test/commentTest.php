<?php
require_once 'comment.php';
require_once '../../utilities/datalayer0.2/datalayer/datalayer.php';


class CommentTest extends PHPUnit_Framework_TestCase {
	private $isSqlite = TRUE,
	        $DB,
	        $Comment,
	        $date1 = "2013-02-15 16:34:58",
	        $date2 = "2013-02-15 16:34:59",
	        $date3 = "2013-02-15 16:35:00",
	        $pageAId, $pageBId,
	        $bobCommentId, $aliceCommentId, $joeCommentId, $maryCommentId;

	function setUp() {
		if($this->isSqlite) {
			$this->DB = new PDO("sqlite::memory:");
			$this->create_database();
		}
		else {
			$this->DB = new PDO("mysql:host=localhost;dbname=comment_test", 'root', 'P0l.ar-B3ar');
		}
		$this->insert_default_rows();
	}

	function tearDown() {
		if(!$this->isSqlite) {
			$this->clear_database();
		}
	}

	private function create_controller(
						$get = NULL,
						$post = NULL,
						$server = NULL,
						$captcha = NULL,
						$pageName = NULL) {
		$config = array(
			"database" => $this->DB,
			"get" => $get,
			"post" => $post,
			"server" => $server,
			//"model" => $this->create_model(),
			"view" => null,
			"maxNumComments" => 3
		);

		if($captcha) {
			$config['captcha'] = $captcha;
		}
		if($pageName) {
			$config['pageName'] = $pageName;
		}
		

		return new \comment_system\Controller($config);
	}

	private function create_model() {
		return new \comment_system\Model(
			new \DataLayer(array(
				"PDO" => $this->DB,
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
		);
	}

	//create in memory sqlite database for fast unit testing.
	private function create_database() {
		//NOTE: the in memory versions dont have indexes, messes with sqlite's auto increment...

		$this->DB->exec(
			"CREATE TABLE IF NOT EXISTS Comment (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				parent INTEGER,
				page INTEGER NOT NULL,
				name VARCHAR(64),
				comment VARCHAR(4096) NOT NULL,
				date DATETIME NOT NULL
			)"
		);

		$this->DB->exec(
			"CREATE TABLE IF NOT EXISTS Page (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name VARCHAR(64)
			)"
		);
	}

	private function clear_database() {
		$this->DB->exec('TRUNCATE TABLE Comment');
		$this->DB->exec('TRUNCATE TABLE Page');
	}

	private function insert_default_rows() {
		$this->pageAId = $this->insert('Page', array("name" => "pageA"));
		$this->pageBId = $this->insert('Page', array("name" => "pageB"));

		$this->bobCommentId = $this->insert('Comment', array(
			"page" => $this->pageAId,
			"name" => "bob",
			"comment" => "bob comment",
			"date" => $this->date2
		));

		$this->aliceCommentId = $this->insert('Comment', array(
			"page" => $this->pageAId,
			"parent" => $this->bobCommentId,
			"name" => "alice",
			"comment" => "alice response",
			"date" => $this->date1
		));

		$this->joeCommentId = $this->insert('Comment', array(
			"page" => $this->pageAId,
			"name" => "joe",
			"comment" => "joe comment",
			"date" => $this->date1
		));

		$this->maryCommentId = $this->insert('Comment', array(
			"page" => $this->pageBId,
			"name" => "mary",
			"comment" => "mary comment",
			"date" => $this->date1
		));
	}

	private function get_expected_bob() {
		return array(
			"id" => $this->bobCommentId,
			"parent" => NULL,
			"pageName" => "pageA",
			"pageId" => $this->pageAId,
			"name" => "bob",
			"comment" => "bob comment",
			"date" => $this->date2,
			"children" => array(
				array(
					"id" => $this->aliceCommentId,
					"parent" => $this->bobCommentId,
					"pageName" => "pageA",
					"pageId" => $this->pageAId,
					"name" => "alice",
					"comment" => "alice response",
					"date" => $this->date1
				)
			)
		);
	}

	private function get_expected_joe() {
		return array(
			"id" => $this->joeCommentId,
			"parent" => NULL,
			"pageId" => $this->pageAId,
			"pageName" => "pageA",
			"name" => "joe",
			"comment" => "joe comment",
			"date" => $this->date1
		);
	}

	private function get_expected_mary() {
		return array(
			"id" => $this->maryCommentId,
			"parent" => NULL,
			"pageId" => $this->pageBId,
			"pageName" => "pageB",
			"name" => "mary",
			"comment" => "mary comment",
			"date" => $this->date1
		);
	}

	private function insert($table, array $values) {
		$sql = "INSERT INTO $table (" . 
			implode(",", array_keys($values)) . ") VALUES (:" . 
			implode(",:", array_keys($values)) .")";

		$STH = $this->DB->prepare($sql);
		$STH->execute($values);
		return $this->DB->lastInsertId();
	}

	private function select($table, $id) {
		$stmt = $this->DB->prepare("SELECT * FROM $table where id = ?");
		if ($stmt->execute(array($id))) {
			return $stmt->fetch(PDO::FETCH_ASSOC);
		}
	}



//-------------------------------------- BEGIN TESTS ---------------------------------------------



	function test_page_table_setup() {
		$this->assertEquals(
			array(
				"id" => $this->pageAId,
				"name" => "pageA"
			),
			$this->select('Page', $this->pageAId)
		);

		$this->assertEquals(
			array(
				"id" => $this->pageBId,
				"name" => "pageB"
			),
			$this->select('Page', $this->pageBId)
		);
	}

	function test_comment_table_setup() {
		$this->assertEquals(
			array(
				"id" => $this->bobCommentId,
				"parent" => NULL,
				"page" => $this->pageAId,
				"name" => "bob",
				"comment" => "bob comment",
				"date" => $this->date2
			),
			$this->select('Comment', $this->bobCommentId)
		);

		$this->assertEquals(
			array(
				"id" => $this->aliceCommentId,
				"parent" => $this->bobCommentId,
				"page" => $this->pageAId,
				"name" => "alice",
				"comment" => "alice response",
				"date" => $this->date1
			),
			$this->select('Comment', $this->aliceCommentId)
		);

		$this->assertEquals(
			array(
				"id" => $this->joeCommentId,
				"parent" => NULL,
				"page" => $this->pageAId,
				"name" => "joe",
				"comment" => "joe comment",
				"date" => $this->date1
			),
			$this->select('Comment', $this->joeCommentId)
		);
	}




	function test_get_next_first_query() {
		$Ctl = $this->create_controller(null, null, null, null, "pageA");
		$this->assertEquals(
			array(
				$this->get_expected_joe(),
				$this->get_expected_bob()
			),
			$Ctl->get_next()
		);
	}

	function test_get_next_first_query_pageB() {
		$Ctl = $this->create_controller(null, null, null, null, "pageB");
		$this->assertEquals(
			array($this->get_expected_mary()),
			$Ctl->get_next()
		);
	}

	function test_get_next() {
		$Ctl = $this->create_controller(array(
			"page" => $this->pageAId,
			"last_id" => $this->joeCommentId
		));

		$this->assertEquals(
			array($this->get_expected_bob()),
			$Ctl->get_next()
		);
	}

	function test_insert_comment() {

		$Ctl = $this->create_controller(
			NULL,
			array(
				"parent" => $this->joeCommentId,
				"pageId" => $this->pageAId,
				"name" => "mary",
				"comment" => "mary response",
				"date" => $this->date1,
				"recaptcha_challenge_field" => NULL,
				"recaptcha_response_field" => NULL
			),
			array(
				"REMOTE_ADDR" => NULL
			),
			new \comment_system\NullCaptcha()
		);

		$id = $Ctl->insert_comment()['primary'];

		$this->assertEquals(
			array(
				"id" => $id,
				"page" => $this->pageAId,
				"parent" => $this->joeCommentId,
				"name" => "mary",
				"comment" => "mary response",
				"date" => $this->date1
			),
			$this->select("Comment", 5)
		);

		$this->assertFalse($this->select("Page", 3));
	}
}
?>