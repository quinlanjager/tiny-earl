require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const fs = require('fs');
const PORT = process.env.port || 8080;

const urlDatabase = {
  '1' : {
    '3445' : {
      longUrl : 'http://www.example.com',
      dateCreated : undefined,
      visited : 0,
      stats: {
        dates : {
          'Sat Nov 11 2017' : {
            unique : [],
            totalVisitors: 1
          },
        },
          totalUnique : [],
          totalVisitors : 0,
        }
      }
  }
};

const users = {

};

const errors = {
  '404' : 'we couldn\'t find the page you were asking for.',
  '403' : 'This page can\'t be completed with your credentials.',
  'Incorrect credentials' : 'the username or password submitted didn\'t match our records.',
  'Account exists' : 'an account is already associated with that email.'
};
const quotes = [
  'Your URL deserves to be tiny',
  'Quality tiny URLs for cheap',
  'Canadian made tiny URLs',
  'Only the finest tiny URLs',
  'Now hiring URL artists',
  'So sweet, so delicious',
  'Fresh baked tiny URLs',
  'Premium quality tiny URLs'
]

/* bcrypt setting */

const saltRounds = 10;

/** Handy helper functions */

function generateRandomString(){
  let resultString = '';
  let characters = 'abcdefhijklmnopqrstuvwxyz';
  characters += characters.toUpperCase() + '1234567890';
  while(resultString.length < 6){
    const charIndex = Math.floor(Math.random() * characters.length);
    resultString += characters[charIndex];
  }
  return resultString;
}

const checkLoggedIn = (req) => req.session.user_id in users;

const findShortUrl = (req) => {
  for(const userId in urlDatabase){
    for(const shortUrl in urlDatabase[userId]){
      if(shortUrl === req.params.id){
        return urlDatabase[userId][shortUrl];
      }
    }
  }
};

const generateTemplateVars = (req) => {
  const { user_id } = req.session;
  const quote = quotes[Math.floor(Math.random()*quotes.length)]; // generate random quote for the header.
  return {
    urls : urlDatabase[user_id],
    user : users[user_id],
    urlId : req.urlId,
    quote
  };
};

const generateErrorPage = (status) => {
  return (req, res, next) => {
    if(Number(status)){
      res.status(status);
    }
    const templateVars = generateTemplateVars(req);
    templateVars.status = status;
    templateVars.statusMessage = errors[status];
    res.render('error_message', templateVars);
  }
};

const checkUrlIdExistsForUser = (req) => {
  if(generateTemplateVars(req).urls){
    return req.params.id in generateTemplateVars(req).urls;
  }
  return false;
};

/** Express initialization */

app.set('view engine', 'ejs');
app.listen(PORT);

/** Middleware */

app.use(express.static('assets')); 
app.use(cookieSession({
  name: 'session',
  secret: 'kingkong'
}));
app.use(bodyParser.urlencoded({extended: true})); //urlencoded -> Parse from forms which are URL encoded, necessary to get that request body

/** Routes */

app.get('/', (req, res) => {
  if(checkLoggedIn(req)){
    res.render('urls_index', generateTemplateVars(req));
    return;
  }
  res.redirect('/login');
});

/** urls/ and urls/new */

app.get('/urls/', (req, res) => {
   if(checkLoggedIn(req)){
    res.render('urls_index', generateTemplateVars(req));
    return;
  }
  generateErrorPage('403')(req, res);
});

// Add a URL
app.post('/urls', (req, res) => {
  if(checkLoggedIn(req)){
    const {user_id} = req.session;
    if(req.body.longURL){ // If an id from form, longUrl was submitted
      const shortURL = generateRandomString();
      const date = new Date(Date.now());
      if(!urlDatabase[user_id]){
        urlDatabase[user_id] = {};
      }
      urlDatabase[user_id][shortURL] = {
        id : shortURL,
        longUrl : req.body.longURL,
        dateCreated : date.toDateString(),
        stats: {
          dates : {},
          totalUnique : [],
          totalVisitors : 0
        }
      }
      res.redirect(`/urls/${shortURL}`);
      return;
    }
  }
  generateErrorPage('403')(req, res);
});

app.get('/urls/new', (req, res) => {
  if(!checkLoggedIn(req)){
    res.redirect('/login')
    return;
  }
  res.render('urls_new', generateTemplateVars(req));
});


/** /urls/:id */

app.get('/urls/:id', (req, res) => {
  const {user_id} = req.session;
  const {id} = req.params;

  if(!checkLoggedIn(req)){
    generateErrorPage('403')(req, res);
    return;
  }
  if(checkUrlIdExistsForUser(req)){
    req.urlId = id;
    res.render('urls_show', generateTemplateVars(req));
    return;
  }
  //if URL exists, but doesn't belong to the current user.
  if(findShortUrl(req)){
    generateErrorPage('403')(req, res);
    return;
  }
  generateErrorPage('404')(req, res);
});

app.post('/urls/:id/delete', (req, res) => {
  if(checkLoggedIn(req)){
    const shortenedUrl = req.params.id;
    const {user_id} = req.session;
    if(checkUrlIdExistsForUser(req)){
      delete urlDatabase[user_id][shortenedUrl];
      res.redirect('/urls');
      return;
    }
  }
  generateErrorPage('403')(req, res);
});

// change a URL's destination.
app.post('/urls/:id/', (req, res) => {
  if(checkLoggedIn(req)){
    const shortenedUrl = req.params.id;
    const newURL = req.body.newURL;
    if(checkUrlIdExistsForUser(req)){
      const { user_id } = req.session;
      urlDatabase[user_id][shortenedUrl] = newURL;
      res.redirect('/urls/');
      return;
    }
  }
  generateErrorPage('403')(req, res); 
});

app.get('/urls/:id/stats', (req, res) => {
  const {user_id} = req.session;
  const {id} = req.params;
  if(!checkLoggedIn(req)){
    generateErrorPage('403')(req, res);
    return;
  }

  if(checkUrlIdExistsForUser(req)){
    req.urlId = id;
    /// write to JSON first
    fs.writeFile(`assets/${id}_stats.json`, JSON.stringify(findShortUrl(req).stats), (err) =>{
      if(err){
        console.log(err);
      }
      res.render('urls_show_stats', generateTemplateVars(req));
      return;
    });
  }
  //if URL exists, but doesn't belong to the current user.
});


/** /register routes */

app.get('/register', (req, res) => {
  if(!checkLoggedIn(req)){
    res.render('urls_register', generateTemplateVars(req));
    return;
  }
  res.redirect('/');
});

// creating a new account
app.post('/register', (req, res) => {
  if(!req.body.email || !req.body.password){
    generateErrorPage('403')(req, res);
    return;
  }
  for(const user in users){ // checking if submitted email is already in database
    if(users[user].email === req.body.email){
      generateErrorPage('Account exists')(req, res);
      return;
    }
  }

  const id = generateRandomString();
  bcrypt.hash(req.body.password, saltRounds, (err, hash) =>{
    const newUser = {
      id,
      email : req.body.email,
      password : hash
    };
    users[id] = newUser;
    req.session.user_id = id;
    res.redirect("/");
  });
});

/** /login and /logout routes */

app.get('/login', (req, res) => {
  if(!checkLoggedIn(req)){
    res.render('urls_login', generateTemplateVars(req));
    return;
  }
  res.redirect('/');
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  let foundUser = false;
  for(let user in users){
    user = users[user];
    if(user.email === email){
      foundUser = true;
      bcrypt.compare(password, user.password, (err, result) => {
        if(result){
          req.session.user_id = user.id;
          res.redirect('/');
          return;
        }
        generateErrorPage('Incorrect credentials')(req, res); 
      });
    } 
  }
  if (!foundUser){
    generateErrorPage('Incorrect credentials')(req, res);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get('/u/:id', (req, res) => {
  const shortUrl = findShortUrl(req);
  const date = new Date(Date.now());
  let longURL = shortUrl.longUrl;
  const userIP = req.ip;
  if(longURL){
    // Add at least HTTP if it's not present.
    if(!longURL.match(/https?:\/\//)){ 
      longURL = 'http://' + longURL;
    }
    // tracking
    if(!(shortUrl.stats.totalUnique.includes(userIP))){
      shortUrl.stats.totalUnique.push(userIP);
    }
    if(!(date.toDateString() in shortUrl.stats.dates)){
      shortUrl.stats.dates[date.toDateString()] = {
        totalUnique : [userIP],
        totalVisitors : 1
      } 
    } else {
      shortUrl.stats.dates[date.toDateString()].totalUnique.push(userIP);
      shortUrl.stats.dates[date.toDateString()].totalVisitors++;     
    }
    shortUrl.stats.totalVisitors++;
    res.redirect(longURL);
    return;
  }
  generateErrorPage('404')(req, res);
});

// 404 if no other get/post request could be matched
app.use(generateErrorPage('404'));