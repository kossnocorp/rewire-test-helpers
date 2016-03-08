test: test-lint test-unit test-system

test-lint:
	node_modules/.bin/standard --verbose | node_modules/.bin/snazzy

test-unit:
	node_modules/.bin/mocha --require test/power_assert_loader test/unit

test-unit-watch:
	node_modules/.bin/mocha --require test/power_assert_loader test/unit --watch

test-system:
	node_modules/.bin/mocha --require test/power_assert_loader test/system/original/test
	node_modules/.bin/mocha --require test/system/babel_plugin_es5/babel_loader test/system/babel_plugin_es5/test
	node_modules/.bin/mocha --require test/system/babel_plugin_es2015/babel_loader test/system/babel_plugin_es2015/test
	node_modules/.bin/mocha --require test/system/babel_plugin_glob_es2015/babel_loader test/system/babel_plugin_glob_es2015/test
