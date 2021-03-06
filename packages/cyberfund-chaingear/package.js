Package.describe({
  name: "cyberfund:cyberfund-chaingear",
  version: "0.0.1",
  // Brief, one-line summary of the package.
  summary: "",
  // URL to the Git repository containing the source code for this package.
  git: "",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.1.0.2");
  api.use(["underscore", "cyberfund:cyberfund-base"]);
  api.use(["ui", "templating"], "client");
  api.addFiles("cyberfund-chaingear.js", ["client", "server"]);
  api.addFiles(["client/cyberfund-chaingear-client.js", "client/cgLink/cgLink.html",
  "client/cgLink/cgLink.js", "client/cgLink/cgLink.css",
  "client/cgLinkCard/cgLinkCard.html", "client/cgLinkCard/cgLinkCard.js",
  "client/cgLinkCard/cgLinkCard.css"], "client");
});

Package.onTest(function(api) {
  api.use("tinytest");
  api.use("cyberfund:cyberfund-chaingear");
  api.addFiles("cyberfund-chaingear-tests.js");
});
