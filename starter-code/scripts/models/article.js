(function(module) {
  function Article (opts) {
    // DONE: Convert property assignment to Functional Programming style.
    Object.keys(opts).forEach(function(prop) {
      this[prop] = opts[prop];
    }, this); // The optional 'this' here is necessary to keep context.
  }

  Article.allArticles = [];

  Article.prototype.toHtml = function(scriptTemplateId) {
    var template = Handlebars.compile(scriptTemplateId.text());
    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);
    return template(this);
  };

  // Set up a table for articles.
  Article.createTable = function() {
    // webDb helps us query our data
    webDB.execute(
      // TODO: What SQL command do we run here inside these quotes?
        //DONE
      'CREATE TABLE IF NOT EXISTS logs(' +
      'id INTEGER PRIMARY KEY, ' +
      'title VARCHAR, ' +
      'category VARCHAR, ' +
      'author VARCHAR, ' +
      'authorUrl VARCHAR, ' +
      'publishedOn VARCHAR, ' +
      'body VARCHAR);',
      function() {
        console.log('Successfully set up the articles table.');
      }
    );
  };

  // NOTE: Refactored to expect articles from the database, rather than localStorage.
  Article.loadAll = function(rows) {
    Article.allArticles = rows.map(function(ele) {
      return new Article(ele);
    });
  };

  Article.prototype.insertRecord = function() {
    webDB.execute(
      [{
        // NOTE: this method will be called elsewhere after we retrieve our JSON
        // <----- TODO: complete our SQL query here, inside the quotes.
        //DONE
        'sql': 'INSERT INTO logs(title, category, author, authorUrl, publishedOn, body) VALUES(?, ?, ?, ?, ?, ?);',
        'data': [this.title, this.category, this.author, this.authorUrl, this.publishedOn, this.body]
      }]
    );
  };

  Article.fetchAll = function(nextFunction) {
    webDB.execute(
      // <-----TODO: fill these quotes to query our table.
      //THIS SEEMS RIGHT
      'SELECT * FROM logs',
      function(rows) {
        // if we have data in the table
        if (rows.length) {
        /* TODO:
           1 - Use Article.loadAll to instanitate these rows,
           //DONE

           2 - invoke the function that was passed in to fectchAll */
           //DONE
          Article.loadAll(rows);
          nextFunction();

        } else {
          $.getJSON('/data/hackerIpsum.json', function(responseData) {
            responseData.forEach(function(obj) {
              var article = new Article(obj); // This will instantiate an article instance based on each article object from our JSON.
              /* TODO:
               1 - 'insert' the newly-instantiated article in the DB: see method on line 37
             */
              article.insertRecord();
            });
            webDB.execute(
              'SELECT * FROM logs', // <-----TODO: query our table for articles once more
              function(rows) {
                // TODO:
                // 1 - Use Article.loadAll to process our rows,
                // 2 - invoke the function that was passed in to fetchAll
                Article.loadAll(rows);
                nextFunction();
              });
          });
        }
      });
  };


  Article.prototype.deleteRecord = function() {
    webDB.execute(
      [
        {
          /* NOTE: this is an advanced admin option, so you will need to test
              out an individual query in the console */
          'sql': 'DELETE FROM logs WHERE id = ?', // <---TODO: Delete an article instance from the database based on its id:
          'data': [this.id]
        }
      ]
    );
  };

  Article.clearTable = function() {
    webDB.execute(
      'DELETE FROM logs;' // <----TODO: delete all records from the articles table.
    );
  };

  Article.allAuthors = function() {
    return Article.allArticles.map(function(article) {
      return article.author;
    })
    .reduce(function(uniqueNames, curName) {
      if (uniqueNames.indexOf(curName) === -1) {
        uniqueNames.push(curName);
      }
      return uniqueNames;
    }, []);
  };

  Article.numWordsAll = function() {
    return Article.allArticles.map(function(article) {
      return article.body.match(/\w+/g).length;
    })
    .reduce(function(a, b) {
      return a + b;
    });
  };

  Article.numWordsByAuthor = function() {
    return Article.allAuthors().map(function(currentAuthor) {
      return {
        name: currentAuthor,
        numWords: Article.allArticles.filter(function(article) {
          return article.author === currentAuthor;
        })
        .map(function(currentAuthorsArticle) {
          return currentAuthorsArticle.body.match(/\w+/g).length;
        })
        .reduce(function(previousWords, currentWords) {
          return previousWords + currentWords;
        })
      };
    });
  };

// TODO: ensure that our table has been created.
  Article.createTable();
  module.Article = Article;
})(window);
