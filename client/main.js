import { Recipe } from "./recipe.js";
import { ShoppingList } from "./shoppinglist.js";

const KEY = "17a117cc72203109eacfce3afae1487f";
const ID  = "d66e5273";

//HTML ELEMENTS
const search     = document.getElementById("search");
const code     = document.getElementById("code");
const go         = document.getElementById("go");
const recipes    = document.getElementById("recipes-container");
const mainRecipe = document.getElementById("main-recipe");
const mainRecipeContainer = document.getElementById("main-recipe-container");
const closeBttn  = document.getElementById("close");
const listContainer = document.getElementById("list-container");
const addToListBttn = document.getElementById("atlb");
const lookBttn      = document.getElementById("look");
const saveBttn      = document.getElementById("save");
const shareBttn     = document.getElementById("share");
const deleteBttn     = document.getElementById("delete");

const list = new ShoppingList();
let id = "notnew";

let hits =  [];
let recipe = null;

if(window.localStorage.getItem("hits") !== null)
  hits = JSON.parse(window.localStorage.getItem("hits"));
search.value= "";
code.value="";

//Local Storage
if(recipe == null  && window.localStorage.getItem("recipe") !== null){
  recipe = new Recipe(undefined);
  recipe.retrieve();
  mainRecipe.style.display = "grid";
  recipe.render(mainRecipeContainer);
}
if(window.localStorage.getItem("list") != null){
  let temp = JSON.parse(window.localStorage.getItem("list"));
  list.list = temp.list;
  list.id = temp.id;
  list.render(listContainer);
}
if(hits.length > 0){
  let html = ""
  hits.forEach((hit,i) => {
    html += `<div class = "small-recipe" search-index=${i}>${hit.recipe.label} - ${hit.recipe.source}</div>`;
  });
  recipes.innerHTML = html;
  addListeners();
}

//Opens recipe from search
async function openRecipe(element){
  const indx = element.target.getAttribute("search-index");
  const {uri} = hits[indx].recipe;
  const params = new URLSearchParams({
    "type":"public",
    uri,
    "app_id":ID,
    "app_key":KEY
  });
  const response = await fetch("https://api.edamam.com/api/recipes/v2/by-uri?"+params);
  const resBody = await response.json();
  recipe = new Recipe(resBody);
  mainRecipe.style.display = "grid";
  recipe.render(mainRecipeContainer);
  recipe.saveToLocalStorage();
}

//dynamically adds listener to the elements
function addListeners(){
  const rec = document.getElementsByClassName("small-recipe");
  for(let i = 0; i < rec.length; i++)
    rec[i].addEventListener("click", openRecipe);
}

//searches in the external API
async function onPressGo(){
  const {value} = search;
  const keywords = value.split(" ");
  
  let req = "https://api.edamam.com/api/recipes/v2?type=public&q="
  
  keywords.forEach((x,i) => {
    if(i !== 0)
      req += "%20";
    req +=  x;
  });
  
  req += `&app_id=${ID}&app_key=${KEY}`;
  
  const response = await fetch(req); 
  const resBody  = await response.json();
  
  let html = "";
  hits = resBody["hits"];
  hits.forEach((hit,i) => {
    html += `<div class = "small-recipe" search-index=${i}>${hit.recipe.label} - ${hit.recipe.source}</div>`;
  });
  if(hits.length === 0)
    html += `<div style="font-family:kalam, sans-serif"> Search returned no result ☹️. Try Again!</div>`
  recipes.innerHTML = html; 
  addListeners();
  window.localStorage.setItem("hits", JSON.stringify(hits));
}

//adds ingredients to the list
function addToList(){
  if(recipe == null)
  return;
  list.addToList(recipe);
  list.render(listContainer);
}

//Event Listeners
go.addEventListener("click", onPressGo);

//Load from global storage
lookBttn.addEventListener("click", async () => {
  const cd = code.value;
  id = await list.getList(cd, listContainer);
});

//Save it to local storage
saveBttn.addEventListener("click", async () => {
  list.saveToLocalStorage();
});

//Save it to global
shareBttn.addEventListener("click", async () => {
  id = await list.saveList(id);
  if(id !== "notnew"){
    navigator.clipboard.writeText(id);
    alert(`Copied code to Clipboard!
       Don't forget to save the code somewhere. 
       Codes expires in 3 days`);
  }
});

//Delete from global
deleteBttn.addEventListener("click", async () => {
  if(id === "notnew")
    return;
    console.log(id)
  const res = await fetch(`/delete/${id}`, {"method":"DELETE"});

  if(!res.ok){
    alert("Unexpected Error");
    return;
  }

  alert("Successfully Deleted");
  list.reset();
  id = "notnew";
  list.render(listContainer);
});

//Keydown Enter event
document.addEventListener("keydown", async (event) => {
  if(event.key === "Enter")
    await onPressGo();
  if(event.key === "Shift"){
  }
});

//Adds to shopping list event listener
addToListBttn.addEventListener("click", addToList);

//Close button for closing main recipe
closeBttn.addEventListener("click", () => {
  mainRecipe.style.display = "none";
  window.localStorage.removeItem("recipe");
});