require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const PORT = process.env.port || 8080;

/* bcrypt settings */
const saltRounds = 10;

const urlDatabase = {
  "1" : {
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "2" : {
     "9sm5xK": "http://www.google.com"
  }
};

const users = {
  "1": {
    id: "1", 
    email: "quinlan.jager@gmail.com", 
    password: "purple-monkey-dinosaur"
  },
 "2": {
    id: "2", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

/* Handy helpers */
function generateRandomString(){
  let resultString = "";
  let characters = "abcdefhijklmnopqrstuvwxyz";
  characters += characters.toUpperCase() + "1234567890";
  while(resultString.length < 6){
    const charIndex = Math.floor(Math.random() * characters.length);
    resultString += characters[charIndex];
  }
  return resultString;
}

const checkLoggedIn = (req) => req.session.user_id in users;

const findLongUrl = (req) => {
  for(const userId in urlDatabase){
    for(const shortUrl in urlDatabase[userId]){
      if(shortUrl === req.params.id){
        return urlDatabase[userId][shortUrl];
      }
    }
  }
}

const checkUrlIdExistsForLoggedInUser = (req) => req.params.id in generateTemplateVars(req).urls;

const generateTemplateVars = (req) => {
  const { user_id } = req.session;
  return {
    urls : urlDatabase[user_id],
    user : users[user_id],
    longUrl : req.longUrl,
    shortenedUrl : req.shortenedUrl
  }
}

app.set('view engine', 'ejs');


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/* Middleware */
app.use(express.static('assets')); 
app.use(cookieSession({
  name: 'session',
  secret: 'kingkong'
}));
app.use(bodyParser.urlencoded({extended: true})); //urlencoded -> Parse from forms which are URL encoded, necessary to get that request body

/* Routes */
app.get(['/', '/urls/new'], (req, res) => {
  if(checkLoggedIn(req)){
    res.render('urls_new', generateTemplateVars(req));
  } else {
    res.redirect('/register');
  }
});

// /urls/ requests
app.get('/urls/:id', (req, res) => {
  const {user_id} = req.session;
  const {id} = req.params;
  if(checkUrlIdExistsForLoggedInUser(req)){
    req.longUrl = urlDatabase[user_id][id];
    req.shortenedUrl = id;
    res.render('urls_show', generateTemplateVars(req));
  } else {
    res.redirect('/404');
  }
});

app.get('/urls', (req, res) => {
  res.render('urls_index', generateTemplateVars(req));
});

app.get('/u/:id', (req, res) => {
  let longURL = findLongUrl(req);
  if(longURL){
    if(!longURL.match(/https?:\/\//)){
      longURL = "http://" + longURL;
    }
    res.redirect(longURL);
  } else {
    res.redirect('/404');
  }
});

app.get('/register', (req, res) => {
  res.render('urls_register', generateTemplateVars(req));
});

app.get('/login', (req, res) => {
  res.render('urls_login', generateTemplateVars(req));
});

app.post('/register', (req, res) => {
  // error handling
  if(!req.body.email || !req.body.password){
    res.status(400).send('400');
  } else {
    for(const user in users){
      if(users[user].email === req.body.email){
        res.status(400).send('400');
      }
    }
    const id = generateRandomString();
    bcrypt.hash(req.body.password, saltRounds, (err, hash) =>{
      const newUser = {
        id,
        email : req.body.email,
        password : hash
      }
      users[id] = newUser;
      req.session.user_id = id;
      res.redirect('/');
    });
  }
});

app.post('/urls', (req, res) => {
  if(req.body.longURL){ // If an id from form, longUrl was submitted
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/404');
  }
});

app.post('/urls/:id/', (req, res) => {
  const shortenedUrl = req.params.id;
  const newURL = req.body.newURL;
  if(checkUrlIdExistsForLoggedInUser(req)){
    const { user_id } = req.session;
    urlDatabase[user_id][shortenedUrl] = newURL;
    res.redirect(`/urls/${shortenedUrl}`);
  } else {
    res.status(401).send("Not allowed to do that.");
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const shortenedUrl = req.params.id;
  if(checkUrlIdExistsForLoggedInUser(req)){
    delete urlDatabase[shortenedUrl];
    res.redirect("/urls");
  } else {
    res.status(401).send("Not allowed to do that.");
  }
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  let foundUser = false;
  for(let user in users){
    user = users[user];
    if(user.email === email){
      foundUser = true;
      bcrypt.hash(password, user.password, (err, result) =>{
        if(result){
          req.session.user_id = user.id;
          res.redirect('/')
        } else {
          res.status(403).send('Incorrect email or password');   
        }
      });
    } 
  }
  if (!foundUser){
    res.status(403).send('Incorrect email or password');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/')
});

// 404
app.use((req, res) => {
  const stat = 404;  
  res.status(stat).render('404.ejs', generateTemplateVars(req));
});














