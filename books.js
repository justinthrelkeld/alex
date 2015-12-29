var isValidIsbn = function(str) {

    var sum,
        weight,
        digit,
        check,
        i;

    str = str.replace(/[^0-9X]/gi, '');

    if (str.length != 10 && str.length != 13) {
        return false;
    }

    if (str.length == 13) {
        sum = 0;
        for (i = 0; i < 12; i++) {
            digit = parseInt(str[i]);
            if (i % 2 == 1) {
                sum += 3*digit;
            } else {
                sum += digit;
            }
        }
        check = (10 - (sum % 10)) % 10;
        return (check == str[str.length-1]);
    }

    if (str.length == 10) {
        weight = 10;
        sum = 0;
        for (i = 0; i < 9; i++) {
            digit = parseInt(str[i]);
            sum += weight*digit;
            weight--;
        }
        check = 11 - (sum % 11);
        if (check == 10) {
            check = 'X';
        }
        return (check == str[str.length-1].toUpperCase());
    }
}

Meteor.methods({
  addBook: function(item){
    console.log("adding " + item.title);
    console.log("---------")
    console.log(item);
    console.log("---------");

    if(Meteor.isClient){
      Session.set("booksResearch", [])
    }

    if (Books.find({googleId: item.googleId}).count() > 0){
      console.log("looks like " + item.title + " already exists, adding a copy instead");
      Books.update({googleId: item.googleId}, {$push: {copies: {owner: "test", status: "unknown", dateAdded: new Date(), location: "on shelf"}}});
      return "added copy"
    } else{

      console.log("finding ISBNs for " + item.title);
      var isbn13,
          isbn10;
      for (var i = item.industryIdentifiers.length - 1; i >= 0; i--) {
        switch (item.industryIdentifiers[i].type) {
          case "ISBN_13":
            isbn13 = item.industryIdentifiers[i].identifier;
            break;
          case "ISBN_10":
            isbn10 = item.industryIdentifiers[i].identifier;
            break;
        }
      }
      Books.insert({
        title: item.title,
        description: item.description,
        authors: item.authors,
        isbn13: isbn13,
        isbn10: isbn10,
        googleId: item.googleId,
        industryIdentifiers: item.industryIdentifiers,
        publisher: item.publisher,
        publishedDate: item.publishedDate,
        pageCount: item.pageCount,
        imageLinks: item.imageLinks,
        categories: item.categories,
        dateAdded: new Date(),
        copies: [{owner: "test", status: "unknown", dateAdded: new Date(), location: "on shelf"}]
      });
    }
  },
  deleteBook: function(id){
    console.log("removing " + id);
    Books.remove({_id: id});
  },
  findBook: function(title){
    console.log("looking for " + title);
    var titleFindRegex = new RegExp(title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "ig")
    foundBooks = Books.find({$or: [{googleId: title}, {title: titleFindRegex}, {isbn13: title}, {isbn10: title}]}).fetch()
    // console.log(foundBooks)
    return foundBooks
  }
})
if (Meteor.isServer) {
  Meteor.methods({
    researchBook: function(title){
        title = title.toString()
        this.unblock();
        console.log("looking up " + title)
        // if(Books.find({'industryIdentifiers': {$elemMatch: {"identifier": title}}}).count() > 0 ){
        //   console.log("this book exists in the library");
        //   return "book exists";
        // } else{
          var qurl = "https://www.googleapis.com/books/v1/volumes?q=" + (isValidIsbn(title) ? "isbn:" + title.replace(/[^0-9X]/gi, '') : title.replace(/\s/gi, '+') ) +  "&maxResults=5"
          console.log(qurl)
          return Meteor.http.call("GET", qurl)
        // };
    }
  })
}
