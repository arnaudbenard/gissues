# Gissues

Gissues reads your files and looks for github issues. It will then display them in a table in your console.

## Status

This is a WIP, simple proof of concept.

## Reason

If you add GitHub issues url in your comments, it because quickly a hassle to check the status of each issues. Following all the issues isn't sustainable when working on multiple projects. It will help you find closed issues and see how you can resolve them.

## Ambitions

I would like to group the issues by projects in order to see which dependency is causing the most problems in your project. My ambition is to make this a bad package detector. Issues number isn't the main factor for bad packages, it could simply be assiociated with popularity (take with a pinch of salt).

## How to use

```
npm install gissues
```

```js

gissues.show('./test/sample/'); // Promise

```

Happy hacking!
