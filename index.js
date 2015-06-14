var Bluebird = require('bluebird');
var github = require('octonode');
var esprima = require('esprima');
var UrlPattern = require('url-pattern');
var _ = require('lodash');
var Table = require('cli-table');

var fs = Bluebird.promisifyAll(require('fs'));
var client = github.client();
var issuePattern = new UrlPattern(':owner/:repo/issues/:number');

/**
 * API call to GitHub issues
 * @param  {Object} params Params
 * @return {Object}        Promise
 */
var getIssue = function(params) {
  var url = ['/repos', params.owner, params.repo, 'issues', params.number].join('/');
  return new Bluebird(function(resolve, reject) {
    client.get(url, {}, function(err, status, body) {
      return err ? reject(err) : resolve(body);
    });
  });
};


/**
 * Extracts issues info from string
 * @param  {String} str String
 * @return {Object}     Issue
 */
var extractIssue = function(str) {
  return str.split(' ')
  .filter(function findGitHubUrl(block) {
    return block.indexOf('github.com') !== -1;
  })
  .map(function(url) {
    var cleaned = url.replace('\n', '').replace('https://github.com/', '');
    return issuePattern.match(cleaned);
  });
};

/**
 * Reads files based on a dir
 * @param  {String} dir Dir
 * @return {Array}     Contents
 */
var readFilesInDir = function(dir) {
  return fs.readdirAsync(dir).map(function(file) {
    return fs.readFileAsync(dir + file, 'utf8');
  });
};

/**
 * Displays the issues as a tablw
 * @param  {Array} issues Issues
 */
var display = function(issues) {
  var table = new Table({ head: ['URL', 'State']});
  issues.forEach(function(issue) { table.push([issue.url, issue.state]); });
  console.log(table.toString());
};

module.exports.show = function(dir) {
  return readFilesInDir(dir).map(function(content) {
    var comments = esprima.parse(content, {comment: true, loc: true }).comments;
    var issues = _.chain(comments)
    .pluck('value')
    .map(extractIssue)
    .flatten()
    .value();
    return Bluebird.map(issues, getIssue);
  })
  .then(function(res) {return _.flatten(res);})
  .then(display);
};

