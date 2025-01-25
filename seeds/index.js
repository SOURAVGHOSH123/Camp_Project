const mongoose = require('mongoose')
const CampGround = require('../models/campground')
const Review = require('../models/review')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')


mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"))
db.once('open', () => {
   console.log('Database is Connected!');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
   await CampGround.deleteMany({})
   await Review.deleteMany({})
   for (let i = 0; i <= 30; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new CampGround({
         author: '678c8f9681fb1e778c87e61a',
         location: `${cities[random1000].city}, ${cities[random1000].state}`,
         title: `${sample(descriptors)} ${sample(places)}`,
         price: `${price}`,
         description: `Any what you opinion you want to add on this description ${Math.floor(Math.random() * 10) + 1}`,
         images: [
            {
               url: 'https://res.cloudinary.com/df08ufqmp/image/upload/v1737661177/YalmCamp/sccuatzwlimvzgsxuako.jpg',
               filename: 'YalmCamp/sccuatzwlimvzgsxuako'
            },
            {
               url: 'https://res.cloudinary.com/df08ufqmp/image/upload/v1737661180/YalmCamp/npyzmkqjdut8fr3vzv6z.jpg',
               filename: 'YalmCamp/npyzmkqjdut8fr3vzv6z'
            },
            {
               url: 'https://res.cloudinary.com/df08ufqmp/image/upload/v1737661181/YalmCamp/udht4pei7g4vfuailkmk.jpg',
               filename: 'YalmCamp/udht4pei7g4vfuailkmk'
            }
         ]
      })
      await camp.save()
   }
}

seedDB().then(() => {
   mongoose.connection.close();
})