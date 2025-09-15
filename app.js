if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}
// require('dotenv').config();


const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
// const CampGround = require('./models/campground')
const methodOverride = require('method-override')
// const AsyncCatchError = require('./utils/AsyncCatchError')
const ExpressError = require('./utils/expressError')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user.js')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
// const { campgroundSchema, reviewSchema } = require('./schema.js')
// const Review = require('./models/review.js')

const userRoutes = require('./router/user.js')
const campgroundRoutes = require('./router/campgrounds.js')
const reviewRoutes = require('./router/reviews.js')
const MongoStore = require('connect-mongo');
// const MongoDBStore = require("connect-mongo")(session);

// const dbURL = process.env.DB_URL;
const dbURL = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbURL)

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"))
db.once('open', () => {
   console.log('Database is Connected!');
})

const app = express()

app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(
   mongoSanitize({
      replaceWith: '_',
   }),
);

app.use(express.static(path.join(__dirname, 'public')));

// const store = new MongoDBStore({
//    url: dbURL,
//    secret: 'thisshouldbebettersecret',
//    touchAfter: 24 * 60 * 60
// })

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
   mongoUrl: dbURL,
   touchAfter: 24 * 60 * 60,
   secret,
});

store.on("error", function (e) {
   console.log("Session store error", e);
})

const sessionConfig = {
   store,
   name: 'session',
   secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
   "https://stackpath.bootstrapcdn.com/",
   // "https://api.tiles.mapbox.com/",
   // "https://api.mapbox.com/",
   "https://kit.fontawesome.com/",
   "https://cdnjs.cloudflare.com/",
   "https://cdn.jsdelivr.net",
   "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
   "https://kit-free.fontawesome.com/",
   "https://stackpath.bootstrapcdn.com/",
   // "https://api.mapbox.com/",
   // "https://api.tiles.mapbox.com/",
   "https://fonts.googleapis.com/",
   "https://use.fontawesome.com/",
   "https://cdn.jsdelivr.net",
   "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
   // "https://api.mapbox.com/",
   // "https://a.tiles.mapbox.com/",
   // "https://b.tiles.mapbox.com/",
   // "https://events.mapbox.com/",
   "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: [],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", "blob:"],
         objectSrc: [],
         imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/df08ufqmp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
            "https://api.maptiler.com/",
         ],
         fontSrc: ["'self'", ...fontSrcUrls],
      },
   })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   // delete req.session;
   // console.log(req.session);
   // console.log(req.query);
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/review', reviewRoutes)

app.get('/fakeUser', async (req, res) => {
   const user = new User({ email: 'Sourav123@gmal.com', username: 'Sourav Ghosh' });
   const newUser = await User.register(user, 'Sou1234');
   res.send(newUser)
})

app.get('/', (req, res) => {
   res.render('home');
})


app.all(/(.*)/, (req, res, next) => {
   next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Something going to Error!!'
   res.status(statusCode).render('error', { err });
   // res.send('Oh No! Something Gone Wrong!')
})

app.listen(8000, () => {
   console.log('App listen in 8000');
})