var express = require('express');
var router = express.Router();

const userModel = require('./users');
const mailModel = require('./mails');
const passport = require('passport');
var localStrategy = require('passport-local');
const multer = require('multer');
passport.use(new localStrategy(userModel.authenticate()));

function fileFilter (req, file, cb) {
  if(file.mimetype ==='image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype ==="image/svg"){
    cb(null, true)
  }
  else{
    cb(new Error ("Ye kahan aa gye aap ?"));
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    console.log(file)
 const fn =   Date.now()+Math.floor(Math.random*1000000)+file.originalname
 cb(null, fn);
  }
})

const upload = multer({ storage: storage,fileFilter:fileFilter })

/* GET home */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/check/:username',async function (req, res, next) {
const user =await userModel.findOne({username:req.params.username})
  res.json({user});
});
/*using multer show profile photu */
router.post('/formUpload',isLoggedIn,upload.single('image') ,async function(req,res,next){
const loggedInUser =await userModel.findOne({username:req.session.passport.user})
loggedInUser.ProfilePic =req.file.filename;
await loggedInUser.save();
res.redirect(req.headers.referer);
})
router.get('/sent', isLoggedIn, async function (req, res) {
  const loggedInUser = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'sentMails',
      populate: {
        path: 'userid'
      }
    })
  // console.log(loggedInUser)
  res.render('sent', { user: loggedInUser });
})


/*Mail Box Code */
router.post('/compose', async function (req, res) {
  //find  loggedinuser
  const loggedInUser = await userModel.findOne({ username: req.session.passport.user })
  const createdMail = await mailModel.create({
    userid: loggedInUser._id,
    receiver: req.body.receiveremail,
    mailtext: req.body.mailtext
  })
  loggedInUser.sentMails.push(createdMail._id);
  await loggedInUser.save();
  const recieverUser = await userModel.findOne({ email: req.body.receiveremail })
  recieverUser.recievedMails.push(createdMail._id);
  const updatedReceiverUser = await recieverUser.save();
  res.redirect(req.headers.referer);
})
/*Show the Profile Page */
router.get('/profile', isLoggedIn, async function (req, res, next) {
  const fu = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'recievedMails',
      populate: {
        path: 'userid'
      }
    })
  res.render('profile', { user: fu });
});

router.get('/read/mail/:id', isLoggedIn, async function (req, res, next) {
  const mailFound = await mailModel.findOne({ _id: req.params.id })
    .populate("userid")
    mailFound.read = true
    await mailFound.save();
    console.log(mailFound);
  res.render('read', { mail: mailFound });
});
router.get('/delete/mail/:id', function (req, res) {
  mailModel.findOneAndDelete({ _id: req.params.id })
    .then(function () {
      res.redirect('/profile')
    })
})

/*Register Page */
router.get('/register', function (req, res, next) {
  res.render('register');
});
router.post('/register', function (req, res) {
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    mobile: req.body.mobile,
    gender: req.body.gender
  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    })
    .catch(function (e) {
      res.send(e);
    })
});

/*Login Page */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/register'
}), function (req, res, next) { });

/*Logout code */
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) throw err;
  })
  res.redirect('/');
});
/* loggedIn  */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}

module.exports = router;
