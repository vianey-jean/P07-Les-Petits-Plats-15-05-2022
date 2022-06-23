/**
 * 1- création objet name et type du tags
 * 2- Création du squelette du tag
 * 3- export du Tag
 */

export default class Tag {

    constructor(name, type) {
        this.name = name;
        this.type = type;
    }

    renderTag(classSuffix = 'primary') {
        const elTag = document.createElement('span');
        elTag.classList.add('tag');
        elTag.classList.add('tag-' + classSuffix);
        elTag.innerText = this.name.charAt(0).toUpperCase() + this.name.slice(1);// UCFirst
        const elButton = document.createElement('button');
        elButton.classList.add('tag-control');
        elButton.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      </svg>`;


        elTag.append(elButton);
        return elTag;
    }


    renderLi() {
        const elTag = document.createElement('li');
        elTag.innerText = this.name.charAt(0).toUpperCase() + this.name.slice(1);// UCFirst
        return elTag;
    }

}