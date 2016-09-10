var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


router.get('/show/:category', function(req, res, next) {
    var posts= db.get('posts');
    posts.find({category:req.params.category},{},function (err, posts) {
        res.render('index',{

            'title': req.params.category,
            'posts':posts
        });
    });

});


/* GET users listing. */
router.get('/add', function(req, res, next) {
        res.render('addcategory',{
            'title':"add category"
    })

});


router.post('/add' ,function (req, res, next) {
    var name= req.body.name;

    //Form validation
    req.checkBody('name','Category Name is required').notEmpty();;

    var errors= req.validationErrors();
    if(errors){
        res.render('addcategory',{
            'title':"add category",
            'errors':errors
        });
    }else {
        var categories= db.get('categories');
        categories.insert({
            'name':name
        },function (err,post) {
            if(err){
                res.send(err);
            }else {
                req.flash('success','category added.');
                res.location('/');
                res.redirect('/');
            }
        });
    }
})

module.exports = router;
