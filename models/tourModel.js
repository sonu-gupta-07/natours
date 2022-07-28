const mongoose = require('mongoose');

const slugify = require('slugify');

//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a name'],
      maxlength: [
        40,
        'A tour must not have a length of more than 40 characters'
      ]
    },
    slug: String,
    duration: {
      type: Number,
      required: [1, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [1, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a name']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      required: [1, 'A tour must have minimum 1 rating'],
      max: [5, ' A tour must have maximum 1 rating ']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [1, 'The tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'The tour must have a imageCover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: {
      type: [Date]
    },
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// doc middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  // console.log(this);
  // point to currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// this now point to current query and not document

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// aggregate middleware (this object point to current aggregation object)

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
