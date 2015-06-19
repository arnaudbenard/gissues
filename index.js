var Bluebird = require('bluebird');
var github = require('octonode');
var esprima = require('esprima');
var UrlPattern = require('url-pattern');
var _ = require('lodash');
var Table = require('cli-table');
var dir = require('node-dir');

var client = github.client();
var issuePattern = new UrlPattern(':owner/:repo/issues/:number');

/**
 * API call to GitHub issues
 * @param  {Object} params Params
 * @return {Object}        Promise
 */
var fetchIssue = function(params) {
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
var URLToObj = function(str) {
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
 * Extract
 * @param  {String} content Content
 * @return {Object}         Issue object
 */
var extractIssuesFromContent = function(content) {
  var comments = esprima.parse(content, {comment: true, loc: true }).comments;
  return _.chain(comments)
  .pluck('value')
  .map(URLToObj)
  .flatten()
  .value();
};

/**
 * Reads files based on a dir
 * @param  {String} dirname dirname
 * @return {Array}     Contents
 */
var getIssuesFromCode = function(dirname) {
  var issues = [];
  return new Bluebird(function(resolve, reject) {
    dir.readFiles(dirname, {
      match: /.js$/,
      exclude: /^\./
    }, function(err, content, next) {
        if (err) return reject(err);
        issues = issues.concat(extractIssuesFromContent(content));
        next();
    },
    function(err){
        if (err) return reject(err);
        resolve(issues);
    });
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

/**
 * Main function
 * @param  {String} dirname dir name
 * @return {Object}         Promise
 */
module.exports.show = function(dirname) {
  return getIssuesFromCode(dirname)
  .map(fetchIssue)
  .then(display);
};

