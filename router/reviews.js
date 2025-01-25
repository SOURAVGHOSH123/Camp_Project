const express = require('express')
const router = express.Router({ mergeParams: true })
const AsyncCatchError = require('../utils/AsyncCatchError')
const Review = require('../models/review.js')
const CampGround = require('../models/campground')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js')
const reviews = require('../controller/review.js')

router.post('/', isLoggedIn, validateReview, AsyncCatchError(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, AsyncCatchError(reviews.deleteReview))

module.exports = router;