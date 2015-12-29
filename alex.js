Router.route('/', function () {
  // this.render('home');
  this.layout('app')
  this.render('admin');
});

Router.route('/admin', function () {
  // TODO: check if admin first, then show login/error if not
  this.render('admin');
});
