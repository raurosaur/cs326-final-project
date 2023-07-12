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

  _renderListElement(id, item, checked){
    return `
    <div>
      <input type="checkbox" name="list${id}" id = "list${id}" ${checked?"checked":""}>
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
      this.saveToLocalStorage();
    });
    document.getElementById(`list${id}`).addEventListener("click", (e) => {
      const lE = this.list.find(x => x.id === id);
      lE.checked = e.target.checked;
    });
  }

  render(element){
    element.innerHTML = 
      this.list
        .map(x => this._renderListElement(x.id, x.item, x["checked"]))
        .join("");
    this.list.forEach(listEl => {
      this._addListener(listEl.id, element);
    });
  }

  async saveList(uniqid){
    const res = await fetch(`/list/${uniqid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uniqid,
        "list":this.list,
        "id": this.id
      })
    });
    if(!res.ok){
      alert("Invalid ID");
      return "notnew";
    }
    const js = await res.json();
    return ("id" in js) ? js.id : "notnew";
  }

  async getList(uniqid, element){
    const response = await fetch(`list/${uniqid}`, {
      method:"GET",
    });

    if(!response.ok){
      alert("Error 404");
      return "notnew";
    }
    
    const js = await response.json();

    if(js === null){
      alert("Not found! Has it been longer than 3 days?");
      return "notnew";
    }
    const {list, id} = js;
    this.list = list;
    this.id = id;
    this.render(element);
    return uniqid;
  }

  saveToLocalStorage(){
    window.localStorage.setItem("list", JSON.stringify({list: this.list, id: this.id}));
  }

  reset(){
    this.list = [];
    this.id = 0;
  }
}