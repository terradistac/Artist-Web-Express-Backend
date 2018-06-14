var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('./node_modules/body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');
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

// route to edit user profile info
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
// route to retrieve user profile information and return as a JSON file
router.route('/user/info/:user_id')
    .get(function (req, res) {
        User.findById(req.params.user_id,
            function (err, user) {
                if (err)
                    throw err;
                var userJSON = user.local;
                res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
                res.send({
                    'data': userJSON
                });
            })

    })
// route to retrive list of all artwork uploaded by a particular user
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
// route to upload new tags into tag array
router.route('/artwork/tags')
    .post(function (req, res) {
        User.findById(
            req.body.userid,
            function (err, user) {
                var foundart = user.local.art.id(req.body.artworkid);
                console.log(req.body.tag);
                foundart.tags.push(req.body.tag);
                console.log(foundart.tags);
                user.save();
                if (err) {
                    console.error(err.stack);
                    var data = {
                        success: false
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                } else {
                    var data = {
                        success: true
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                }
            })

    })
// route to update artwork name
router.route('/artwork/edit')
    .post(function (req, res) {
        User.findById(
            req.body.userid,
            function (err, user) {
                var foundart = user.local.art.id(req.body.artworkid);
                console.log(req.body.tag);
                foundart.artworkname = req.body.artworkname;
                console.log(foundart.artworkname);
                user.save();
                if (err) {
                    console.error(err.stack);
                    var data = {
                        success: false
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                } else {
                    var data = {
                        success: true
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                }
            })

    })
// route to delete tags
router.route('/artwork/tags/delete')
    .post(function (req, res) {
        User.findById(
            req.body.userid,
            function (err, user) {
                var foundart = user.local.art.id(req.body.artworkid);
                console.log(req.body.tag);
                foundart.tags.pull(req.body.tag);
                console.log(foundart.tags);
                user.save();
                if (err) {
                    console.error(err.stack);
                    var data = {
                        success: false
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                } else {
                    var data = {
                        success: true
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                }
            })

    })
// route to edit tags
router.route('/artwork/tags/edit')
    .post(function (req, res) {
        User.findById(
            req.body.userid,
            function (err, user) {
                var foundart = user.local.art.id(req.body.artworkid);
                console.log(req.body.tag);
                foundart.tags.pull(req.body.oldtag);
                foundart.tags.push(req.body.tag);
                console.log(foundart.tags);
                user.save();
                if (err) {
                    console.error(err.stack);
                    var data = {
                        success: false
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                } else {
                    var data = {
                        success: true
                    }
                    res.redirect('http://localhost:8080/profile/editartwork?' + querystring.stringify(data));
                }
            })

    })
// route to upload new artwork image files and save file path in database
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
// route to search all art for tags
router.route('/search/artwork/tags')
    .get(function (req, res) {
        // add code here.
    })

app.use('/api', router);
app.use('/public', express.static('public'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);