require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
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

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true})); //urlencoded -> Parse from forms which are URL encoded

// get requests
app.get(['/', '/urls/new'], (req, res) => {
  res.render('urls_new');
});

// /urls/ requests
app.get('/urls/:shortened', (req, res) => {
  const shortenedUrl = req.params.shortened;
  if(shortenedUrl in urlDatabase){
    const templateVars = {
      shortenedUrl : shortenedUrl,
      longUrl : urlDatabase[shortenedUrl]
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(404).render('404.ejs');
  }
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
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
    res.status(404).render('404.ejs');
  }
});

//post requests
app.post('/urls', (req, res) => {
  if(req.body.longURL){ // If an id from form, longUrl was submitted
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(404).render('404.ejs');
  }
});

// 404
app.use((req, res) => {
  res.status(404).render('404.ejs');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});