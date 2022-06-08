/**
 * -Import du data, vue.js, Tags.js et DomFilter.js
 * 1- Création du dom
 * 2- Création du Filtre recherche
 * 3- Voir les statue du tags
 * 4- Filtre les tags
 * 5- Mise a jour les tags
 * 6- Rendre visuel les filtres
 */


 import recette from "../data/recipes.js";
 import Recipe from "../vue/vue.js";
 import Tag from "../vue/tag.js";
 import DomFilter from "../models/domFilter.js";
 
 export default {
 
     recette: [],
     filteredRecipes: [],
 
     filterTypes: ['ingredients', 'appliances', 'ustensils'],
 
     tags: {
         ingredients: [],
         ustensils: [],
         appliances: []
     },
 
     tagsClasses: {
         ingredients: 'primary',
         appliances: 'success',
         ustensils: 'danger',
     },
 
     stateTags: [],
 
 
     stateFilter: undefined,
 
     dom: {
         search: document.querySelector('[data-search]'),
         tags: document.querySelector('[data-filter-tags]'),
         filters: {
             ingredients: new DomFilter(document.querySelector('[data-filter="ingredients"]')),
             appliances: new DomFilter(document.querySelector('[data-filter="appliances"]')),
             ustensils: new DomFilter(document.querySelector('[data-filter="ustensils"]')),
         },
         recette: document.querySelector('[data-recipes]'),
         norecipes: document.querySelector('[data-norecipes]'),
     },
 
          /**
      * Filtre de recherche
      */

           filterSearch(recette) {
            // cherche dans  name, description, ingredients name
        const saisieUtil = this.dom.search.value.toLowerCase();
        recette = recette.filter((recipe) => {
            if (recipe.name.includes(saisieUtil)) return true;
           if (recipe.description.toLowerCase().includes(saisieUtil)) return true;
           if (recipe.appliance.includes(saisieUtil)) return true;
           if (!!recipe.ustensils.find((ustensil) => ustensil.includes(saisieUtil))) return true;
           else if (recipe.ingredients.find((ingredient) => ingredient.name.toLowerCase().includes(saisieUtil))) return true;
            return false;

        });
        return recette;
        },
 

     activeIn (filter) {
         if (this.stateFilter) this.activeOut();// Close active filter
         this.stateFilter = filter;// Set active filter
         // Listen click outside
         this.clickOutsideListener = this.clickOutside.bind(this);
         document.addEventListener("click", this.clickOutsideListener);
         // Set visual active state
         filter.container.classList.add('active');
         filter.label.style.display = 'none';
         filter.input.style.display = '';
         filter.input.focus();
         this.renderFilter();
     },
 
 
     activeOut () {
         document.removeEventListener("click", this.clickOutsideListener);
         const filter = this.stateFilter;// Shortcut
         // Reset visual active state
         filter.container.classList.remove('active');
         filter.container.classList.remove('expanded');
         filter.label.style.display = '';
         filter.input.style.display = 'none';
         filter.input.value = "";
         filter.results.style.display = 'none';
         // Remove active filter
         this.stateFilter = null;
     },
 
 
     toggle (filter) {
         if (this.stateFilter != filter) this.activeIn(filter);// Not active do it
         // Toggle visual expanded state
         filter.container.classList.toggle('expanded');
         // Focus input on open
         if (filter.container.classList.contains('expanded')) filter.input.focus();
     },
 
     clickOutside (e) {
         let clickTarget = e.target;
         do {
             if (clickTarget == this.stateFilter.container) return;
             clickTarget = clickTarget.parentNode;
         } while (clickTarget);
         this.activeOut();
     },
 
     /**
      * Ajout des tags
      */
     addTag (tag) {
         const id = this.stateTags.findIndex((item) => item.name == tag.name);
         if (id < 0) {
             this.stateTags.push(tag);
             this.renderTags();
             this.renderRecipes();
         }
     },
 
     /**
      * suppression du tags
      */
 
     removeTag (tag) {
         const id = this.stateTags.findIndex((item) => item.name == tag.name && item.type == tag.type );
         if (id >= 0) {
             this.stateTags.splice(id, 1);
             this.renderTags();
             this.renderRecipes();
         }
     },
 
     /**
      * cherche tags active
      */
     tagIsActive (tag) {
         const id = this.stateTags.findIndex((item) => item.name == tag.name && item.type == tag.type );
         if (id >= 0) return true;
         return false;
     },
     
 /**
  * Voir les statue du tags
  */
     checkStateTags (filtered) {
         this.updateAvailableTags(filtered);
         const stateTagsLength = this.stateTags.length;
         this.stateTags.forEach((tag, key) => {
             if (!this.tags[tag.type].includes(tag.name)) this.stateTags.splice(key, 1);
         });
         if (stateTagsLength != this.stateTags.length) this.renderTags();// Rerender on change
     },
     
/**
 * Mise a jour du Tags
 */
     filterTags(recette) {
         this.stateTags.forEach((tag) => {
             recette = recette.filter((recipe) => recipe.tagAvailable(tag));
         });
         return recette;
     },
 
 /**
  * Fonction mise a jour du tag
  */
     updateAvailableTags (recette = this.filteredRecipes) {
         // supprimer tags
         this.tags.ingredients = [];
         this.tags.ustensils = [];
         this.tags.appliances = [];
         // Réecrite une nouvelle tags
         recette.forEach((recipe) => {
             recipe.ingredients.forEach((ingredient) => {
                 if (!this.tags.ingredients.includes(ingredient.name)) this.tags.ingredients.push(ingredient.name);
             });
             recipe.ustensils.forEach((ustensil) => {
                 if (!this.tags.ustensils.includes(ustensil)) this.tags.ustensils.push(ustensil);
             });
             if (!this.tags.appliances.includes(recipe.appliance)) this.tags.appliances.push(recipe.appliance);
         });
     },
 
      /**
  * Utilisation du Fonction Filtre recherche ou etat du tags ou mise a jour du tag valable
  */
  
     applyFilterRecipes () {
         let filtered = [];
         if (this.dom.search.value.length < 3) filtered = this.recette;
         else filtered = this.filterSearch(this.recette);// cherche filtre
         this.checkStateTags(filtered);// efface les tags active invalide
         filtered = this.filterTags(filtered);//filtre tags
         this.updateAvailableTags(filtered);
         if (this.stateFilter) this.renderFilter();// Rerender en active
         return this.filteredRecipes = filtered;
     },

     
     renderTags () {
        this.dom.tags.innerHTML = '';
        this.stateTags.forEach((tag) => {
            const elTag = tag.renderTag(this.tagsClasses[tag.type]);
            elTag.querySelector('button').addEventListener('click', (e) => this.removeTag(tag));// Remove tag on click
            this.dom.tags.append(elTag);
        });
    },


    renderFilter () {
        if (!this.stateFilter) return;
        const filter = this.stateFilter; // Shortcut
        filter.results.style.display = 'none';
        filter.results.innerHTML = '';// Clean container
        this.tags[filter.name].forEach((item) => {
            const tag = new Tag(item, filter.name)
            if (this.tagIsActive(tag)) return;// Escape active tags
            if (filter.input.value.length > 0 && !tag.name.includes(filter.input.value.toLowerCase())) return;// Escape search result
            const elTag = tag.renderLi();
            elTag.addEventListener('click', (e) => {// Add tag on click
                e.stopPropagation();
                this.addTag(tag);
            });
            filter.results.append(elTag);
        });
        if (filter.results.children.length > 0) filter.results.style.display = '';
    },


    renderRecipes () {
        this.dom.norecipes.style.display = 'none';
        this.applyFilterRecipes();
        this.dom.recette.innerHTML = '';
        //if (this.dom.search.value.length < 3 && this.stateTags.length == 0) return;
        this.filteredRecipes.forEach((recipe) => {
            this.dom.recette.append(recipe.render());
        });
        if (this.filteredRecipes.length == 0) this.dom.norecipes.style.display = '';
    },


     async fetchData () {
         recette.forEach((recipe) => this.recette.push(new Recipe(recipe)));
         return new Promise((resolve) => resolve(''));
     },

     async init () {
        await this.fetchData();
        this.renderRecipes();
        // Bind
        for (const [, filter] of Object.entries(this.dom.filters)) {
            filter.label.addEventListener('click', (e) => {// Active state
                this.activeIn(filter);
            });
            filter.expand.addEventListener('click', (e) => {// Expand state
                this.toggle(filter);
            });
            filter.input.addEventListener('keyup', this.renderFilter.bind(this));// Filter input change
        }
        this.dom.search.addEventListener('keyup', this.renderRecipes.bind(this));// Search input change
    },
 }
 