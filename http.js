/**
 * Module dependencies
 */

var request = require('superagent');

/**
 * Create a HTTP logger
 *
 * @param {Object} config
 * @return {Function}
 */

module.exports = function(config) {
  var defaultHost = config.host;
  var drain = config.drain;
  var debug = config.debug;
  var buffer = [];
  var flush = config.flush || 1000;

  return function(app) {
    app.logger(function(ns, level, str, task) {
      var host = task.repo ? task.repo : defaultHost;

      // TODO compute severtiy from level
      var prefix = [
        '<110>6',
        (new Date).toISOString(),
        host,
        task.sha || 'grappler',
        ns,
        '- - '
      ].join(' ');

      var out = str.split('\n').map(function(line) {
        line = prefix + line;
        if (line.charAt(line.length - 1) !== '\n') line += '\n';
        return line.length + ' ' + line;
      }).join('');

      // TODO rate limit
      buffer.push(out);
    });

    setInterval(function() {
      if (!buffer.length) return;
      var str = buffer.join('');
      buffer = [];
      request
        .post(drain)
        .send(str)
        .set('content-type', 'text/plain')
        .end(function(err, res) {
          if (!debug) return;
          if (err) return console.error(err.stack || err);
          if (res && !res.ok && debug) return console.error(res.text);
        });
    }, flush);
  };
};
