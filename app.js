if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}


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
// const { campgroundSchema, reviewSchema } = require('./schema.js')
// const Review = require('./models/review.js')

const userRoutes = require('./router/user.js')
const campgroundRoutes = require('./router/campgrounds.js')
const reviewRoutes = require('./router/reviews.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp')

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

app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
   secret: 'thisshouldbebettersecret',
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   // delete req.session;
   // console.log(req.session);
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