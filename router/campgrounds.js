const express = require('express')
const CampGround = require('../models/campground')
const campgrounds = require('../controller/campground.js')
const AsyncCatchError = require('../utils/AsyncCatchError')
const router = express.Router();
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

router.route('/')
   .get(AsyncCatchError(campgrounds.index))
   .post(isLoggedIn, upload.array('image'), validateCampground, AsyncCatchError(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {
//    console.log(req.body, req.files);
//    res.send("IT WORKED !");
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
   .get(AsyncCatchError(campgrounds.showCampground))
   .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, AsyncCatchError(campgrounds.updateCampground))
   .delete(isLoggedIn, campgrounds.deleteCampgroud)

// router.get('/', AsyncCatchError(campgrounds.index));

// router.post('/', isLoggedIn, validateCampground, AsyncCatchError(campgrounds.createCampground));

// router.get('/:id', AsyncCatchError(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, AsyncCatchError(campgrounds.renderEditForm));

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, AsyncCatchError(campgrounds.updateCampground));

// router.delete('/:id', isLoggedIn, campgrounds.deleteCampgroud)

module.exports = router;