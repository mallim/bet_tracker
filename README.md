
Bet Tracker
=========

## Purpose

Used to keep track my football bettings for Singapore Pools, also a demonstration of using [AngularJS](http://www.angularjs.org), [angularjs-nvd3-directives](https://github.com/cmaurer/angularjs-nvd3-directives) and [Bookshelf](http://bookshelfjs.org/)

## Stack
* Persistence store: sqlite3 based on [Bookshelf](http://bookshelfjs.org/)
* Backend: [Node.js](http://nodejs.org/)
* Awesome [AngularJS](http://www.angularjs.org/) on the client
* CSS based on [Twitter's bootstrap](http://getbootstrap.com/)

## Installation

### Platform & tools

You need to install Node.js and then the development tools. Node.js comes with a package manager called [npm](http://npmjs.org) for installing NodeJS applications and libraries.
* [Install node.js](http://nodejs.org/download/) (requires node.js version >= 0.8.4)
* Install Grunt-CLI, knex-cli, bower as global npm modules:

    npm install -g grunt-cli knex-cli bower

* Install the other libraries

    ```
    npm install 
    ```
and
    ```
    bower install 
    ```

(Note that you may need to uninstall grunt 0.3 globally before installing grunt-cli)

### How to Use  
  
* To create the database

    ```
    knex migrate:latest 
    ```
* Use another tool to populate the database in ./db/bet_tracker.db
* Run the web server 

    ```
    grunt
    ```
* Point to http://localhost:3000for a nice dashboard

### Development

  [Grunt](http://gruntjs.com/) tasks to build your app:

    $ grunt dev              # take note that this is with livereload
    
    $ grunt release          # to compile and minify the client side source code
    
## License

And of course:

MIT: http://mallim.mit-license.org
        

