const longURL = document.querySelector('#longURL');
const form = document.querySelector('#submitForm');

if(form){
  form.addEventListener('submit', (event)=>{
    if(longURL.value === ''){
      event.preventDefault();
      if(!document.querySelector('#warning')){
        const warning = document.createElement('p');
        const strong = document.createElement('strong');
        strong.innerHTML = 'Please input a valid URL.';
        warning.setAttribute('id','warning');
        warning.appendChild(strong);
        form.appendChild(warning);
            
      }
      for(const child of form.children){
        if(child){
          child.blur();
        }
      }
    }   
  });  
}

// truncate text
const longUrls = document.querySelectorAll(".longUrl");
if(longUrls.length > 0){
  const maxLength = 35;
  for(let td of longUrls){
    if(td.innerHTML.length > maxLength){
      td.innerHTML = `${td.innerHTML.slice(0, maxLength + 1)}...`
    }
  }
}