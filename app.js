const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { render } = require("ejs");
const path = require("path");
const methodOverride = require('method-override')
const ejsmate = require('ejs-mate');
const review = require("../major project/models/reviews.js");
const listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localS = require("passport-local")
const User = require("../major project/models/user.js");
const console = require("console");
const {isloggedin} = require("./middleware.js")
const {saveredirecturl} = require("./middleware.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
app.use(cookieParser());

app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method'))


app.set("view engine", "ejs")
app.set("views", path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.engine("ejs",ejsmate)


const mongo_url = "mongodb+srv://kartikpatel1180_db_user:QTZTO3FNWZtBh0fO@cluster0.0r2t0vm.mongodb.net/?appName=Cluster0";

main().then(()=>{
    console.log("db working")
}

)
async function main(params) {await mongoose.connect(mongo_url)
    
};


User.init()
  .then(() => console.log("User indexes created"))
  .catch(err => console.log(err));



const sessionoptions = {
  secret: "mycode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
};

app.use(session(sessionoptions));
app.use(flash());




app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curruser = null;

  if (req.cookies && req.cookies.token) {
    res.locals.curruser = true; // bas login hai ya nahi
  }

  next()
});


app.get("/",(req,res)=>{

    res.send("app working")
})

// index route
app.get("/listings",async(req,res)=>{

const listings = await Listing.find({});
res.render("listings/index",{listings});
})





//new route
app.get("/listings/new", isloggedin,(req, res) => {


  res.render("listings/new");
});

app.post("/listings/new", async (req,res)=>{
const listings = new Listing(req.body.listing);
 await listings.save();
 req.flash("success","new listing created");
res.redirect("/listings")

})

// show route
app.get("/listings/:id",async(req,res)=>{
let {id} = req.params;
let listing = await Listing.findById(id).populate("reviews")
res.render("listings/show",{listing});

});

//reviews post route

app.post("/listings/:id/reviews",isloggedin,async(req,res)=>{
let {id} = req.params;
let listing = await Listing.findById(id)
let newReview = new review(req.body.review)
listing.reviews.push(newReview)

await newReview.save()
await listing.save()
req.flash("success","review added")
res.redirect(`/listings/${id}`)


});

//delete review

app.delete("/listings/:id/reviews/:reviewid",isloggedin,wrapAsync(async(req,res)=>{

    let {id,reviewid} = req.params;

await listing.findByIdAndUpdate(id,{$pull : {reviews : reviewid}})
    await review.findByIdAndDelete(reviewid)
    res.redirect(`/listings/${id}`)
}))



//edit route

app.get("/listings/:id/edit",isloggedin,async(req,res)=>{
let {id} = req.params;
let listing = await Listing.findById(id)
res.render("listings/edit",{listing})
} );

app.put("/listings/:id",async(req,res)=>{

    let {id} = req.params
    await Listing.findByIdAndUpdate(id,{
        title: req.body.listing.title,
    description: req.body.listing.description,
    price: req.body.listing.price,
    location: req.body.listing.location,
    country: req.body.listing.country,
    image: { url: req.body.listing.image.url } ,

    });
res.redirect("/listings")
})

// delete route
 


app.delete("/listings/:id",isloggedin,async(req,res)=>{
await Listing.findByIdAndDelete(req.params.id);
res.redirect("/listings")

})



//signup 

app.get("/signup",(req,res)=>{

res.render("user/signup")

})


app.post("/signup",async(req,res)=>{
  let {username,email,password}=req.body
let user = await User.findOne({
  $or: [
    { email: email },
    { username: username }
  ]
});
if(user){
 req.flash("error", "user already exits or username already taken")
res.redirect("/signup")

}
else{bcrypt.genSalt(10,(err,salt)=>{

    bcrypt.hash(password,salt,async(err,hash)=>{
let createduser= await User.create({
username,
email,
password : hash,



    })
let token = jwt.sign({email},"shhhhhhhha")
res.cookie("token",token)
req.flash("success", "success please login")
res.redirect("/login")
    })

}

    )}})










//login 

app.get("/login",(req,res)=>{

    res.render("user/login")
});

app.post("/login",async (req,res)=>{
let {username,password}=req.body
   let user = await User.findOne({username:username})

   if(!user){
    req.flash("error", "something went wrong")
    return res.redirect("/listings")
   }

   bcrypt.compare(password,user.password,(err,result)=>{
if(result){
    let token = jwt.sign({username: user.username},"shhhhhhhha")
res.cookie("token",token)
 req.flash("success", "logged in")
    res.redirect("/listings")

}else{
    res.send("something went wrong")
}
   })
console.log(user.password)

})







//logout

app.get("/logout",(req,res)=>{

    res.cookie("token","")
    req.flash("success", "logged out")
    res.redirect("/listings")
})































app.listen(8080,()=>{
    console.log("app working")
});

