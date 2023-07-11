export class ShoppingList{
  constructor(){
    this.list = [];
    this.id = 0;
  }

  addToList(recipe){
    const {label} = recipe;
    recipe.ingredients.forEach(ingredient => {
      const {food, quantity, measure} = ingredient;
      if(this.list.find(x => x.item === food) !== undefined)
        return;
      this.list.push({"id": ++this.id, "item": food,
         quantity, measure, label, "checked": false});
    });
  }

  _renderListElement(id, item){
    return `
    <div>
      <input type="checkbox" name="list${id}" id = "list${id}">
      <label for="list${id}" id="label-list${id}">${item}</label>
      <span id="span-${id}">🗑</span>
    </div>
    `;
  }

  _addListener(id, element){
    const divElem = document.getElementById(`span-${id}`);
    divElem.addEventListener("click", () => {
      this.list.splice(this.list.findIndex(x => x.id === id), 1);
      element.removeChild(divElem.parentNode);  
    });
    document.getElementById(`list${id}`).addEventListener("click", (e) => {
      const lE = this.list.find(x => x.id === id);
      lE.checked = e.target.checked;
    });
  }

  render(element){
    element.innerHTML = 
      this.list
        .map(x => this._renderListElement(x.id, x.item))
        .join("");
    this.list.forEach(listEl => {
      this._addListener(listEl.id, element);
    });
  }

  async saveList(){

  }

  async getList(id){

  }
}