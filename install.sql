#mysql -u user -p < install.sql

USE comment_test; #change to your projects database name

CREATE TABLE IF NOT EXISTS Comment(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	parent INTEGER,
	page INTEGER NOT NULL,
	name VARCHAR(64),
	comment VARCHAR(4096) NOT NULL,
	date DATETIME NOT NULL,
	INDEX(parent),
	INDEX(page),
	INDEX(date)
);

CREATE TABLE IF NOT EXISTS Page(
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(64),
	INDEX(name)
);
