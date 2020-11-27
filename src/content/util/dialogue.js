/**
* Creates an empty dialogue object.
* @class
*/
class dialogue {
    /* the whole thing looks like this
    <div class="modal-content">
      <div class="modal-header">
          <span class="close">×</span>
          <p>Project Editor</p>
      </div>
      <div class="modal-body" style="display: flex; flex-flow: column nowrap;">
        <div class="dialogitems">
            <a data-translation="manager.createnew.packname">名称</a>
            <input class="textinput" type="text" placeholder="Pack Name">
        </div>
        <div class="dialogitems">
            <a>Pack Description</a>
            <input class="textinput" type="text" placeholder="Pack Description">
        </div>
        <div class="dialogitems">
            <a>Pack UUID</a>
            <input class="textinput" type="text" placeholder="Pack-UUID">
        </div>
        <div class="dialogitems">
            <button>Apply</button>
        </div>
      </div>
      <div class="modal-footer">
          <br>
      </div>
    </div>
    I want to commit die*/
    constructor() {
        let element = document.createElement('div')
        element.setAttribute('class', 'modal-content')
        element.innerHTML = `
        <div class="modal-header">
            <span class="close">×</span>
            <p>If you see this pls tell us</p>
        </div>
        <div class="modal-body" style="display: flex; flex-flow: column nowrap;">
        </div>
        <div class="modal-footer">
        </div>`
        element.children[0].children[0].setAttribute('onclick', `(document.getElementById('dialogue').remove())`)
        /**
         * The HTML element of this dialogue.
         */
        this.element = document.createElement('div')
        this.element.setAttribute('class', 'modal')
        this.element.setAttribute('id', 'dialogue')
        this.element.setAttribute('style', 'display: block;')
        this.element.append(element)
        return this
    }
    /**
     * Sets the title of this dialogue.
     * @param {String} text 
     */
    setTitle(text) {
        this.element.children[0].children[0].children[1].innerText = text
        return this
    }
    /**
     * Adds a text item to this dialogue.
     * @param {String} text 
     */
    addText(text) {
        let element = document.createElement('label')
        element.innerHTML += text
        this.addElement(element)
        return this
    }
    /**
     * Adds an element to the dialogue as a new line.
     * @param {Element} element - The element object to be added. 
     */
    addElement(element) {
        let item = document.createElement('div')
        item.setAttribute('class', 'dialogitems')
        item.append(element)
        this.element.children[0].children[1].innerHTML += item.outerHTML
        return this
    }
    /**
     * Adds a button with a callback when clicked.
     * @param {String} [text=OK] - The text of the button.
     * @param {String} [fn=Close Dialogue] - Sets the onclick attribute.
     * @param {String} [style=Default Styles] - Additional CSS to be applied. 
     */
    addButton(text, fn, style) {
        let element = document.createElement('button')
        element.setAttribute('class', 'modal-button')
        if(text) element.innerText = text
        else element.innerText = 'OK'
        if(fn) element.setAttribute('onclick', fn)
        else element.setAttribute('onclick', `(document.getElementById('dialogue').remove())`)
        if (style) element.style += style
        this.addElement(element)
        console.log(element)
        return this
    }
    /**
     * Adds the HTML text to the dialogue as a new line.
     * @param {String} HTML - The HTML to be added.
     */
    addHTML(HTML) {
        let item = document.createElement('div')
        item.setAttribute('class', 'dialogitems')
        item.innerHTML += HTML
        this.element.children[0].children[1].innerHTML += item.outerHTML
        return this
    }
    /**
     * Displays this dialogue
     */
    show() {
        document.body.append(this.element)
        
        return this
    }
}

module.exports = {
    /**
     * Opens a dialogue with the text given.
     * @param {String} text - The text to alert.
     * @returns The opened dialogue element.
     */
    alert: (text) => {
        const dlg = new dialogue()
        .setTitle('')
        .addText(text)
        .show()
        return dlg
    },
    dialogue
}