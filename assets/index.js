const longURL = document.querySelector("#longURL");
const form = document.querySelector("#submitForm");

form.addEventListener("submit", (event)=>{
  if(longURL.value === ""){
    event.preventDefault();
    if(!document.querySelector("#warning")){
      const warning = document.createElement("p");
      const strong = document.createElement("strong");
      strong.innerHTML = "Please input a valid URL.";
      warning.setAttribute("id","warning");
      warning.appendChild(strong);
      document.querySelector("form").appendChild(warning);
            
      for(const child of form.children){
        if(child.type ==="submit"){
        child.blur();
        }
      }
    }
  }
});