Code Pulse Website
==================

This project is a build setup that generates the Code Pulse website's pages. It runs using [node.js](http://nodejs.org/) to generate files in the 'dist' directory.

Before you can actually build things yourself, you'll need to install node.js, then run `npm install` to download the dependencies.
Once you've done that, run `node build` to generate the `dist` directory, which will contain the actual website as static files. These can be copied over to some static web server or the gh-pages branch. Don't modify anything in `dist`, since your changes will be undone the next time you or anyone runs `node build`.