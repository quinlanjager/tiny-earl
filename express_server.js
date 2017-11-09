require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.port || 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const templateVars = { 
    urls: urlDatabase,
    user: undefined
}


app.set('view engine', 'ejs');
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/* Middleware */
app.use(express.static('assets')); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); //urlencoded -> Parse from forms which are URL encoded, necessary to get that request body
app.use((req, res, next)=>{
  // set the each time a request is made
  if(req.cookies.user_id && req.cookies.user_id in users){
    templateVars.user = users[req.cookies.user_id];
  }
  else {
    templateVars.user = undefined;
  }
  next();
})

/* Routes */
app.get(['/', '/urls/new'], (req, res) => {
  res.render('urls_new', templateVars);
});

// /urls/ requests
app.get('/urls/:id', (req, res) => {
  templateVars.shortenedUrl = req.params.id;
  if(templateVars.shortenedUrl in urlDatabase){
    templateVars.longUrl = urlDatabase[templateVars.shortenedUrl];
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/404');
  }
});

app.get('/urls', (req, res) => {
  res.render('urls_index', templateVars);
});

app.get('/u/:id', (req, res) => {
  if(req.params.id in urlDatabase){
    let longURL = urlDatabase[req.params.id];
    if(!longURL.match(/https?:\/\//)){
      longURL = "http://" + longURL;
    }
    res.redirect(longURL);
  } else {
    res.redirect('/404');
  }
});

app.get('/register', (req, res) => {
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  res.render('urls_login', templateVars);
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
    const newUser = {
      id,
      email : req.body.email,
      password : req.body.password
    }
    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect('/register');
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
  if(shortenedUrl in urlDatabase){
    urlDatabase[shortenedUrl] = newURL;
    res.redirect(`/urls/${shortenedUrl}`);
  } else {
    res.redirect('/404');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const shortenedUrl = req.params.id;
  if(shortenedUrl in urlDatabase){
    delete urlDatabase[shortenedUrl];
    res.redirect("/urls");
  } else {
    res.redirect('/404');
  }
});

app.post('/login', (req, res) => {
  for(let user in users){
    user = users[user];
    if(user.email === req.body.email && user.password === req.body.password){
      res.cookie('user_id', user.id);
      res.redirect('/')
    }
  }
  res.status(403).send('Incorrect email or password');
  
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/')
});

// 404
app.use((req, res) => {
  const stat = 404;  
  res.status(stat).render('404.ejs', templateVars);
});














