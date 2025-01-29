const { cloudinary } = require('../cloudinary/index');
const CampGround = require('../models/campground')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
   const campgrounds = await CampGround.find({});
   res.render('CampGround/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
   res.render('CampGround/new')
}

module.exports.createCampground = async (req, res, next) => {
   // if (!req.body.campground) throw new ExpressError(' Invalid Compound Data!!', 404)
   const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
   const campground = new CampGround(req.body.campground);
   campground.geometry = geoData.features[0].geometry;
   campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
   campground.author = req.user._id;
   await campground.save();
   console.log(campground);
   req.flash('success', 'Successfully create a new campground');
   res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
   const campground = await CampGround.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
         path: 'author'
      }
   }).populate('author');
   console.log(campground);
   if (!campground) {
      req.flash('error', 'Campground not found')
      return res.redirect('/campgrounds')
   }
   res.render('CampGround/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
   const { id } = req.params;
   const campground = await CampGround.findById(id);
   if (!campground) {
      req.flash('error', 'Campground not found')
      return res.redirect('/campgrounds')
   }
   res.render('CampGround/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
   const { id } = req.params;
   console.log(req.body);
   const campground = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
   const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
   campground.images.push(...imgs);
   await campground.save();
   if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
         await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
      console.log(campground);
   }
   req.flash('success', 'Successfully updated');
   res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampgroud = async (req, res) => {
   const { id } = req.params;
   await CampGround.findByIdAndDelete(id);
   req.flash('success', 'Successfully delete campground');
   res.redirect('/campgrounds')
}