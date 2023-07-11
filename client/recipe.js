export class Recipe{

  constructor(jsonObj){
    const {url, label, image, ingredients
      , calories, cuisineType: cuisine, mealType,
      cautions:allergens, source} = jsonObj.hits[0].recipe;

    this.url = url;
    this.label = label;
    this.image = image;
    this.ingredients = ingredients;
    this.calories = calories;
    this.cuisine = cuisine;
    this.mealType = mealType;
    this.allergens = allergens;
    this.source = source;
  }

  shoppingList(){
    return this.ingredients.map(x => `${x.food} --- ${x.quantity} ${x.measure}`);
  }

  render(element){
    let html = "";

    html += `
      <h3 id = "label"> ${this.label}</h3>
      <div id = "source"> ${this.source}</div>
      <img src= "${this.image}" alt="Picture of ${this.label}">
      <div id = "ingredients">
        <h4>Ingredients</h4>
        <ul>
          ${this.ingredients.map(x => `<li>${x.text}</li>`).join("")}
        </ul>
      </div>
      <div id = "allergens"><strong>Allergens:</strong> ${this.allergens.join(" | ")}</div>
      <div id = "calories"><strong>Calories:</strong> ${Math.round(this.calories)} kcal</div>
      <a href="${this.url}" id="url"a> Full Recipe! </a>
    `;

    element.innerHTML = html;
  }
}