// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

var mysql = require('mysql');
var crypto = require('crypto');

var connection = mysql.createConnection({
    host: 'mysql.cis.ksu.edu',
    user: 'projusr_flower',
    password: 'rosesarenotredKSU',
    database: 'proj_flowerapp'
});

//connection.query('USE vidyawxx_build2');

// expose this function to our app using module.exports
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from users where id = " + id, function(err, rows) {
            done(err, rows[0]);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            saltField: 'salt',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
						var firstName = req.body.firstName;
						var lastName = req.body.lastName;
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE username = '" + username + "'", function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else if (password != confirmPassword) {
                  return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUserMysql = new Object();

                    newUserMysql.username = username;
                    newUserMysql.password = password; // use the generateHash function in our user model
										newUserMysql.firstName = firstName;
										newUserMysql.lastName = lastName;
										//console.log(firstName + " " + lastName);

										// create salt
										var salt = crypto.randomBytes(16).toString('hex');
										//console.log("Salt: " + salt);
										//console.log("Password: " + password);
										var hashedPassword = crypto.createHmac('sha256',salt).update(password).digest('hex');
										newUserMysql.password = hashedPassword;
										//console.log("Encrypted password: " + hashedPassword);
										//process.exit();

										// by default insert role = 0
                    var insertQuery = "INSERT INTO users (username, password, salt, firstName, lastName, role ) values ('" + username + "','" + hashedPassword + "','" + salt + "','" + firstName + "','" + lastName + "',0)";
                    console.log(insertQuery);
                    connection.query(insertQuery, function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            saltField: 'salt',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form

            connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'", function(err, rows) {
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!(rows[0].password == crypto.createHmac('sha256',rows[0].salt).update(password).digest('hex')))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);

            });
        }));
};
