const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const User = require("./user")

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1454496522488-7a8e488e8606"
          : v,
    },
  },

  price: Number,
  location: String,
  country: String,
  reviews : [{ type:Schema.Types.ObjectId,
    ref: "Review"}],

    owner:{
type : Schema.Types.ObjectId,
ref :"User",



    }
    });
    
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews }
    });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
