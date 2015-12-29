Books = new Mongo.Collection('books');

if (Meteor.isServer) {
  Meteor.publish("books", function () {
    return books.find();
  });
}

if (Meteor.isClient) {
  Session.setDefault('booksResearch', []);

  Template.admin.helpers({
    books: function () {
      return Books.find({}, {});
    },
    booksResearch: function(){
      return Session.get('booksResearch');
    }
  });
  Template.admin.events({
    'submit .add-books': function (event) {
      event.preventDefault()
      var items_to_add = event.target.books_to_input.value;
      var items_arr = items_to_add.split(',');

      for (var i = items_arr.length - 1; i >= 0; i--) {
        Meteor.call('researchBook', items_arr[i], function(error, response){

          var booksResearch = Session.get('booksResearch');

          for (var i = response.data.items.length - 1; i >= 0; i--) {
            var object = response.data.items[i].volumeInfo;
            object.googleId = response.data.items[i].id;
            booksResearch.push(object)
          };
          Session.set("booksResearch", booksResearch)
        });
      };
    },
    'click button.delete_book': function() {
      Meteor.call('deleteBook', this._id);
    },
    'click .choose_book': function() {
      Meteor.call('addBook', this);

    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

}

Router.route('/', function () {
  // this.render('home');
  this.layout('app')
  this.render('admin');
});

Router.route('/admin', function () {
  // TODO: check if admin first, then show login/error if not
  this.render('admin');
});

Router.route('/b/:googleId', function () {
  this.render('book_detail', {
    data: function () { return Books.findOne({googleId: this.params.googleId}); }
  });
});
