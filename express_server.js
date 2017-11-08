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
}


app.set('view engine', 'ejs');
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(express.static('assets')); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); //urlencoded -> Parse from forms which are URL encoded, necessary to get that request body
app.use((req, res, next)=>{
  // set the each time a request is made
  templateVars.username = req.cookies.username;
  next();
})

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
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/')
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/')
});

// 404
app.use((req, res) => {
  res.status(404).render('404.ejs', {username : req.cookies.username});
});

















