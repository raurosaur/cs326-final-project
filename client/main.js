import { Recipe } from "./recipe.js";
import { ShoppingList } from "./shoppinglist.js";

const KEY = "17a117cc72203109eacfce3afae1487f";
const ID  = "d66e5273";

//HTML ELEMENTS
const search = document.getElementById("search");
const go = document.getElementById("go");
const recipes = document.getElementById("recipes-container");
const mainRecipe = document.getElementById("main-recipe");
const mainRecipeContainer = document.getElementById("main-recipe-container");
const closeBttn = document.getElementById("close");
const listContainer = document.getElementById("list-container");
const addToListBttn = document.getElementById("atlb");

const list = new ShoppingList();

let hits = [];
let recipe = null;

search.value="";

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
}

function addListeners(){
  const rec = document.getElementsByClassName("small-recipe");
  for(let i = 0; i < rec.length; i++)
    rec[i].addEventListener("click", openRecipe);
}

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
}


function addToList(){
  if(recipe == null)
  return;
  list.addToList(recipe);
  list.render(listContainer);
}

//Event Listeners
go.addEventListener("click", onPressGo);

document.addEventListener("keydown", async (event) => {
  if(event.key === "Enter")
    await onPressGo();
  if(event.key === "Shift")
    console.log(list.list);
});

addToListBttn.addEventListener("click", addToList);

closeBttn.addEventListener("click", () => {
  mainRecipe.style.display = "none";
});