const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET = process.env.JWTSECRET;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('JWT');
opts.secretOrKey = SECRET;
passport.use('userLogin',new JwtStrategy(opts, function(jwt_payload, done) {
    if (jwt_payload && jwt_payload.jwtdata && jwt_payload.jwtdata.email) {
        return done(null, jwt_payload);
    } else {
        return done(null, false);
    }
}));

const SECRET1 = process.env.ADMINJWTSECRET;
var opts1 = {};
opts1.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('JWT');
opts1.secretOrKey = SECRET1;
passport.use('adminLogin',new JwtStrategy(opts1, function(jwt_payload, done) {
    if (jwt_payload && jwt_payload.jwtdata && jwt_payload.jwtdata.email) {
        return done(null, jwt_payload);
    } else {
        return done(null, false);
    }
}));

module.exports = passport;
