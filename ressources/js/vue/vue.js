/**
 * 1- Import du Ingredients
 * 2- Création du Recipe pour récuperer tous les datas
 * 3- Création description dans la recette trouvé
 * 4- Création du squelette dans la recette trouvé
 * 5- Ajout ingrédient à la page recette
 * 6-Import Recipe
 */


import Ingredient from "../models/ingredient.js";



export default class Recipe {

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.servings = data.servings;
        this.time = data.time;
        this.description = data.description;
        this.appliance = data.appliance.toLowerCase();

        this.ustensils = [];
        data.ustensils.forEach((ustensil) => this.ustensils.push(ustensil.toLowerCase()));

        this.ingredients = [];
        data.ingredients.forEach( (ingredient) => this.ingredients.push(new Ingredient(ingredient)));
    }

    get shortDescription () {
        const limit = 200;
        if (this.description.length <= limit) return this.description;
        let description = this.description.substr(0, limit - 1);
        return description.substr(0, description.lastIndexOf(" ")) + " &hellip;";
    }

 
    tagAvailable (tag) {//pour montrer les tags qui son inclue dans chaque type avec le nom du tag
        if (tag.type == 'ingredients') return !! this.ingredients.find((ingredient) => ingredient.name == tag.name);
        if (tag.type == 'ustensils') return this.ustensils.includes(tag.name);
        if (tag.type == 'appliances') return this.appliance == tag.name;
    }

 
    render () {
        const elRecipe = document.createElement('article');
        elRecipe.classList.add('card');

        let photo = "";
        photo = this.name;
        photo = photo.replace(/,/g, "");
        photo = photo.replace(/'/g, ' ');
        photo = photo.replace(/ /g, '-');
        photo = photo.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036F\u1DC0-\u1DFF\u1AB0-\u1AFF]+/g, '');

        elRecipe.innerHTML = `<!--Lier a son photo avec le nom en miniscule de json-->
            <div class="card-picture"><img class="card-img-top"  src="ressources/images/img/${photo}.jpg" 
      alt="${this.name}" /></div>
            <div class="card-header">
                <div class="card-header-title">${this.name}</div>
                <div class="card-header-time">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM10.5 5H9V11L14.2 14.2L15 12.9L10.5 10.2V5Z" fill="black"/></svg>
                    ${this.time} min
                </div>
            </div>
            <div class="card-body">
                <div class="card-body-ingredients"></div>
                <div class="card-body-recipe">${this.shortDescription}</div>
            </div>
        `;
        let ingredients = elRecipe.querySelector('.card-body-ingredients');
        this.ingredients.forEach((ingredient) => {
            if (ingredient.quantity) ingredients.innerHTML += `<div class="ingredient"><b>${ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1)}:</b> ${ingredient.quantity} ${(ingredient.unit) ? ingredient.unit : ''}</div>`;
            else ingredients.innerHTML += `<div class="ingredient"><b>${ingredient.name}</div>`;
        });
        return elRecipe;
    }
}