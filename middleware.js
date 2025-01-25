const CampGround = require('./models/campground')
const Review = require('./models/review.js')
const { campgroundSchema, reviewSchema } = require('./schema.js')
const ExpressError = require('./utils/expressError')

module.exports.isLoggedIn = (req, res, next) => {
   // console.log('REQ USER... ', req.user);
   if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'You must be signin first !')
      return res.redirect('/login')
   }
   next();
}

module.exports.storeReturnTo = (req, res, next) => {
   if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
   }
   next();
}

module.exports.validateCampground = (req, res, next) => {
   const { error } = campgroundSchema.validate(req.body);
   if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400)
   } else {
      next();
   }
}

module.exports.isAuthor = async (req, res, next) => {
   const { id } = req.params;
   const campground = await CampGround.findById(id);
   if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You have no permission to do it !');
      return res.redirect(`/campgrounds/${id}`)
   }
   next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
   const { id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You have no permission to do it !');
      return res.redirect(`/campgrounds/${id}`)
   }
   next();
}

module.exports.validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 404);
   } else {
      next();
   }
}