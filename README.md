DataTorrent Console
===================

Open-source, web-based user interface for use with [DataTorrent](http://datatorrent.com), a stream-processing platform for developing real-time, big data applications in Hadoop.
Built with Angular.


Setting up dev environment
--------------------------
### Installing Current Dependencies
Uses the `bower.json` and `package.json` files:

    npm install .
    bower install .

### Use Gulp tasks

* `gulp serve` to launch a browser sync server (default=localhost:9000) on the source files
 * To run the server on a different port, run `PORT=19000 gulp serve`
 * If your gateway is running on a port other than 3390, override it like so: `GATEWAY_PORT=9090 gulp serve`
 * Note that you can combine the two overrides above. For example: `GATEWAY_PORT=9090 PORT=19000 gulp serve`
 * To prevent a browser window from opening, pass the `--dont-open` flag to this command, e.g. `gulp serve --dont-open`
* `gulp` or `gulp build` to build an optimized version of the application in `/dist`
* `gulp serve:dist` to launch a server on the optimized application
* `gulp test` to launch unit tests with Karma

Working with Dependencies
-------------------------
### Installing a bower package
To use a package from bower, first run the bower install command:

    bower install PACKAGE_NAME[#VERSION_TAG] [--save]

Then, use grunt to automatically inject this package into index.html:

    grunt bower-install

### Updating packages

    bower update [PACKAGE_NAME]
    grunt bower-install    

### Uninstalling a package

    bower uninstall [PACKAGE_NAME] --save
    grunt bower-install


App components & sections
-------------------------
The files in this project are organized into feature/component directories, rather than `controllers`, `directives`, `services` folders, etc. Components that are used in multiple locations of the dashboard should be placed in the `app/components` directory. Specific page code (e.g. templates and controllers for specific pages) should be placed in the `app/pages` folder, or one of its subfolders. For more info on this type of organization, read [Best Practice Recommendations for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub).

### Updating `index.html` with app scripts
The following command walks the `app` directory and updates `app/index.html` with all the `.js` files:
    
    grunt appscripts

This script excludes files that end in `_test.js` and all `js` files inside of `bower_components`.

Stylesheets
-----------
This project uses the [LESS CSS pre-processor](http://lesscss.org/) to organize its styling. A "manifest" file is located at `app/styles/main.less`, which @imports all style dependencies (eg. from a bower component) and custom DataTorrent UI component styles (eg. `/app/styles/navbar.less`).

### Variables & Mixins
Whenever possible, custom DataTorrent UI component styles should use variables and mixins from the Twitter Bootstrap library. This makes theming/skinning as easy as overriding these variables. When additional variables are required specifically for DataTorrent UI components, they should be declared in `/app/styles/main.less` with appropriate defaults.

### Themes
A "theme" is really just a file that overrides Twitter Bootstrap and other DataTorrent-UI-specific variables (defined in `/app/styles/main.less`). To create a new theme, create a `.less` file inside `/app/styles/themes/` directory, then run:

    grunt serve --theme=[YOUR_THEME_FILENAME_NO_EXTENSION]

### Theme Overrides
On rare occasion, it is useful to have a final theme-agnostic file to place important overrides. These should be placed into `/app/styles/theme-overrides.less`. The only use-case for this as of this writing is to override the path to Twitter Bootstrap fonts (`@icon-font-path`) from the theme file, which often has the default value set.

App Data Framework
--------------------------

Please see wiki [App Data Framework](../wiki/App-Data-Framework)