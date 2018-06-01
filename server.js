var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('./node_modules/body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');
var flash = require('flash');
var querystring = require('querystring');

mongoose.connect('mongodb://localhost:27017/Artsy');

var User = require('./app/models/user');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});
router.route('/user/info/:user_id')
    .post(function (req, res) {
        User.findByIdAndUpdate(
            req.params.user_id, {
                "local.name": req.body.name,
                "local.biography": req.body.biography
            },
            function (err, succ) {
                if (err) {
                    var data = {
                        success: false
                    }
                    res.redirect('http://localhost:8080/profile/editprofile?' + querystring.stringify(data));
                } else {
                    var data = {
                        success: true
                    }
                    res.redirect('http://localhost:8080/profile/editprofile?' + querystring.stringify(data));
                }
            })
    });
router.route('/artwork/list/:user_id')
    .get(function (req, res) {
        User.findById(req.params.user_id,
            function (err, user) {
                if (err)
                    throw err;
                var artJSON = user.local.art;
                res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
                res.send({
                    'data': artJSON
                });
            })

    })

router.route('/artwork/upload')
    .post(function (req, res) {
        var form = new formidable.IncomingForm();
        form.uploadDir = "./public/";
        form.keepExtensions = true;
        form.parse(req, function (err, fields, files) {
            var oldpath = files.artworkfilelocation.path;
            var newpath = "./public/" + files.artworkfilelocation.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.error(err.stack)
                    res.redirect('http://localhost:8080/profile/submitartwork?success=false');
                }
            });
            if (err) {
                console.error(err.stack)
                res.redirect('http://localhost:8080/profile/submitartwork?success=false');
                next();
            }
            var artArray = {
                artworkname: fields.artworkname,
                artworkfilelocation: newpath
            };

            User.findByIdAndUpdate(
                fields.userid, {
                    $push: {
                        "local.art": artArray
                    }
                },
                function (err, succ) {
                    if (err) {
                        console.error(err.stack);
                        var data = {
                            success: false
                        }
                        res.redirect('http://localhost:8080/profile/submitartwork?' + querystring.stringify(data));
                    } else {
                        var data = {
                            success: true
                        }
                        res.redirect('http://localhost:8080/profile/submitartwork?' + querystring.stringify(data));
                    }
                })
        });
    });

app.use('/api', router);
app.use('/public', express.static('public'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);