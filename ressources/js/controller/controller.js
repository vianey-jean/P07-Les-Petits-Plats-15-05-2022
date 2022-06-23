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
    /**
     * Création du tableau comme recette pour resultat de recherche
     * Filterecipes = tous les recette
     */
    recette: [],
    filteredRecipes: [],

    filterTypes: ['ingredients', 'appliances', 'ustensils'],

    /**
     * Création du tableau pour recuperaion des ingredients, appareils et ustensils
     */
    tags: {
        ingredients: [],
        ustensils: [],
        appliances: []
    },

    /**
     * mise en forme des tags
     */
    tagsClasses: {
        ingredients: 'primary',
        appliances: 'success',
        ustensils: 'danger',
    },

    /**
     * Création du tableau tags
     */
    stateTags: [],


    stateFilter: undefined,

    /**
     * relier à la page index pour selector
     */
    dom: {
        search: document.querySelector('[data-search]'), //Selection sur le barre de recherche
        tags: document.querySelector('[data-filter-tags]'),//selection sur les tags
        filters: {
            ingredients: new DomFilter(document.querySelector('[data-filter="ingredients"]')),//selection dans ingredients
            appliances: new DomFilter(document.querySelector('[data-filter="appliances"]')),//selection dans apparareil
            ustensils: new DomFilter(document.querySelector('[data-filter="ustensils"]')),//selection dans ustensils
        },
        recette: document.querySelector('[data-recipes]'),//selection a la resultat recette
        norecipes: document.querySelector('[data-norecipes]'),//selection message erreur sur resultats
    },

    /**
      * Filtre dans le barre de recherche
      */

    filterSearch(recette) {
        // cherche dans  name, description, ingredients name
        const saisieUtil = this.dom.search.value.toLowerCase();//saisie utilisateur tous en miniscule
        /**
         * algorithme de recherche dans nom du recette, description et ingredients.
         */
        recette = recette.filter((recipe) => {
            if (recipe.name.toLowerCase().includes(saisieUtil)) return true;
            if (recipe.description.toLowerCase().includes(saisieUtil)) return true;

            if (recipe.ingredients.find((ingredient) => ingredient.name.toLowerCase().includes(saisieUtil))) return true;
            //else if (recipe.ingredients.find((ingredient) => ingredient.name.toLowerCase().includes(saisieUtil))) return true;
            return false;

        });
        return recette;
    },

    //ouverture pour être active les tags dans ingrédient, appareils et ustensils
    activeIn(filter) {
        if (this.stateFilter) this.activeOut();// Fermeture des filtre active
        this.stateFilter = filter;// Définir le filtre active
        // Clique dehors
        this.clickOutsideListener = this.clickOutside.bind(this);
        document.addEventListener("click", this.clickOutsideListener);
        // Définir l'état actif visuel
        filter.container.classList.add('active');
        filter.label.style.display = 'none';
        filter.input.style.display = '';
        filter.input.focus();
        this.renderFilter();
    },

    //Fermeture pour etre active les tags dans ingrédient, appareils et ustensils
    activeOut() {
        document.removeEventListener("click", this.clickOutsideListener);
        const filter = this.stateFilter;// Shortcut
        // Réinitialiser l'état actif visuel
        filter.container.classList.remove('active');
        filter.container.classList.remove('expanded');
        filter.label.style.display = '';
        filter.input.style.display = 'none';
        filter.input.value = "";
        filter.results.style.display = 'none';
        //Supprimer le filtre actif
        this.stateFilter = null;
    },

    //activation du svg pour montrer les tags respectives
    toggle(filter) {
        if (this.stateFilter != filter) this.activeIn(filter);
        // Bascule l'état visuel développé
        filter.container.classList.toggle('expanded');
        // Concentrer l'entrée sur l'ouverture
        if (filter.container.classList.contains('expanded')) filter.input.focus();
    },

    //pour cliqué en dehors et les tags son non-active
    clickOutside(e) {
        let clickTarget = e.target;
        do {
            if (clickTarget == this.stateFilter.container) return;
            clickTarget = clickTarget.parentNode;
        } while (clickTarget);
        this.activeOut();
    },

    /**
      * Ajout des tags au dessus
      */
    addTag(tag) {
        const id = this.stateTags.findIndex((item) => item.name == tag.name);
        if (id < 0) {
            this.stateTags.push(tag);
            this.renderTags();
            this.renderRecipes();
        }
    },

    /**
      * suppression du tags au dessus
      */

    removeTag(tag) {
        const id = this.stateTags.findIndex((item) => item.name == tag.name && item.type == tag.type);
        if (id >= 0) {
            this.stateTags.splice(id, 1);
            this.renderTags();
            this.renderRecipes();
        }
    },

    /**
      * activation des tags
      */
    tagIsActive(tag) {
        const id = this.stateTags.findIndex((item) => item.name == tag.name && item.type == tag.type);
        if (id >= 0) return true;
        return false;
    },

    /**
  * Voir les statue du tags
  */
    checkStateTags(filtered) {
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
  * Fonction mise a jour du tag avec les filtres  et mettre dans les tags repesctives, (ingredients, appareil et ustensils)
  */
    updateAvailableTags(recette = this.filteredRecipes) {
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

    applyFilterRecipes() {
        let filtered = [];
        if (this.dom.search.value.length < 3) filtered = this.recette;// si la saisie utilisateur est < 3, montre tous les recettes
        else filtered = this.filterSearch(this.recette);// si non applique la fonction filterSearch pour les filtre de la recherche avec la saisie utilisateur
        this.checkStateTags(filtered);// efface les tags active invalide
        filtered = this.filterTags(filtered);//filtre tags en meme temps suivant la saaisie utilisateur
        this.updateAvailableTags(filtered);//utilisation du fonction updateavailableTags pour mettre a jours les tags dans ingrédient et appareil suivant la saisie utilisateur
        if (this.stateFilter) this.renderFilter();// Rerender en active
        return this.filteredRecipes = filtered;
    },

    //mise en forme les atgs selectionnées 
    renderTags() {
        this.dom.tags.innerHTML = '';
        this.stateTags.forEach((tag) => {
            const elTag = tag.renderTag(this.tagsClasses[tag.type]);
            elTag.querySelector('button').addEventListener('click', (e) => this.removeTag(tag));// Remove tag on click
            this.dom.tags.append(elTag);
        });
    },

    /**
 * création d'une fonction pour faire de recherche même plus de 1 caractère dans les tags et les activé
 */
    renderFilter() {
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

    /**
 * fonction pour mettre le message erreur
 */
    renderRecipes() {
        this.dom.norecipes.style.display = 'none';//message erreur est inactive
        this.applyFilterRecipes();//application des filtres de recherche sur barre de recherche
        this.dom.recette.innerHTML = '';
        this.filteredRecipes.forEach((recipe) => {//rendre visible tous les recettes
            this.dom.recette.append(recipe.render());//mettre dans nouvelle tableau les recette
        });
        if (this.filteredRecipes.length == 0) this.dom.norecipes.style.display = '';// si recherche est = 0, affiche message erreur
    },
    /**
 * Connection avec le fichier data
 */

    async fetchData() {
        recette.forEach((recipe) => this.recette.push(new Recipe(recipe)));
        return new Promise((resolve) => resolve(''));
    },

    /**
      * création fonction init
      */
    async init() {
        await this.fetchData();//attendre les donné avec fetchdata
        this.renderRecipes();
        // activation du recherche sur tags 
        for (const [, filter] of Object.entries(this.dom.filters)) {
            filter.label.addEventListener('click', (e) => {// Saisie dans les tags soit active
                this.activeIn(filter);
            });
            filter.expand.addEventListener('click', (e) => {// Icon svg soit active
                this.toggle(filter);
            });
            filter.input.addEventListener('keyup', this.renderFilter.bind(this));// changement entré filtre
        }
        this.dom.search.addEventListener('keyup', this.renderRecipes.bind(this));// Modification de l'entrée de recherche
    },
}
