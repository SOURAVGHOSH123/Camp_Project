const Review = require('../models/review.js')
const CampGround = require('../models/campground')

module.exports.createReview = async (req, res) => {
   const campground = await CampGround.findById(req.params.id);
   const review = new Review(req.body.review);
   review.author = req.user._id;
   // console.log(review);
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   req.flash('success', 'Successfully save review');
   res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
   const { id, reviewId } = req.params;
   await CampGround.findByIdAndUpdate(id, { $pull: { review: reviewId } })
   await Review.findByIdAndDelete(reviewId)
   req.flash('success', 'Successfully deleted review');
   res.redirect(`/campgrounds/${id}`)
}