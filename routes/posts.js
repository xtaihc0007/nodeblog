var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' });
var mongo = require('mongodb');
var db = require('monk')('botest1883.cloudapp.net/nodeblog');
var bcrypt= require('bcryptjs');
var azure = require('azure-storage');

/* GET users listing. */
router.get('/add', function(req, res, next) {

    var categories= db.get('categories');
    categories.find({},{},function (err, categories) {
        console.log(categories);
        res.render('addpost',{
            'title':"add post",
            'categories':categories
        });
    })

});

router.get('/show/:id', function(req, res, next) {
    var posts= db.get('posts');
    posts.findById(req.params.id,function (err, post) {
        res.render('show',{
            'post':post
        });
    });

});

router.get('/display/:author',function (req, res, next) {
    var posts= db.get('posts');
    posts.find({author:req.params.author},{},function (err, posts) {
        res.render('index',{
            'title': req.params.username,
            'posts':posts
        });
    });
})

router.post('/addcomment',function (req, res, next) {
    var name= req.body.name;
    var email= req.body.email;
    var body= req.body.body;
    var postid= req.body.postid;
    var commentdate= new Date();


    //Form validation
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','Email format is invalied.').isEmail();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    var errors= req.validationErrors();
    if(errors){
        var categories= db.get('categories');
        var posts= db.get('posts');
        categories.find({},{},function (err, categories) {
           posts.findById(postid,function (err, post) {
               res.render('show',{
                   'errors':errors,
                   'post':post,
                   'title': 'show',
                   'categories':categories
               });
           })
        });

    }else {
        var comment = {
            "name": name,
            "email": email,
            "body": body,
            "commentdate": commentdate
        }

        var posts = db.get('posts');

        posts.update({
            "_id": postid
        },{
            $push:{
                "comments": comment
            }
        }, function(err, doc){
            if(err){
                throw err;
            } else {
                req.flash('success', 'Comment Added');
                res.location('/posts/show/'+postid);
                res.redirect('/posts/show/'+postid);
            }
        });

    }
})

router.post('/add', upload.single('mainimage') ,function (req, res, next) {
    console.log(req.body.userid);
    var author= req.body.author;
    var title= req.body.title;
    var category= req.body.category;
    var body= req.body.body;
    var date= new Date();
    if(req.file){
        var mainimage= req.file.filename;
    }else {
        var mainimage="noimage.jpg";
    }

    //Form validation
    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();
    req.checkBody('category','category is required').notEmpty();
    console.log(category);
    var errors= req.validationErrors();
    if(errors){
        var categories= db.get('categories');
        categories.find({},{},function (errors, categories) {
            res.render('addpost',{
                'errors':errors,
                'title':"add post",
                'categories':categories
            });
        });

    }else {
          //  console.log(req.file);
        //var bs = azure.createBlobService('storage0009','kuGlOb5PsLB90b2wJkqIHqKpT0+nIkbbp7pIlx6x5w4lsbmZU+Tz1lsl0Mi1lqwIe+FHufO/tpZTNyCFRPgvaA==');
        //bs.createBlockBlobFromLocalFile ('containernodejs', req.file.originalname, req.file.path, function(error, result, response){
        //if(error) throw error;
           // console.log(bs.host.primaryHost);
            //console.log(result);
            var posts= db.get('posts');
            posts.insert({
                'title':title,
                'body':body,
                'category':category,
                'date':date,
                'author':author,
                'mainimage':mainimage
            },function (err,post) {
                if(err){
                    res.send(err);
                }else {
                    req.flash('success','post added.');
                    res.location('/');
                    res.redirect('/');
                }
            });

       // });

        
    }
})

module.exports = router;
