function _(id) {
    return document.getElementById(id)
}

class ViewLocalStorage {
    static save(key, value, toJSON = false) {
        localStorage.setItem(key, (toJSON)? JSON.stringify(value) : value)
    }

    static get(key, JSON = true, defaultValue = null) {
        let d = localStorage.getItem(key)
        if (d) return (JSON) ? JSON.parse(d) : d
        return defaultValue
    }

    static remove(key) {
        localStorage.removeItem(key)
    }

    static clear(key) {
        localStorage.clear()
    }
}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
class ViewCompiler {
    static compile(templateData, template) {
        let r = template
        for (let key in templateData) {
            r = r.replaceAll('$' + key, templateData[key])
        }
        return r;
    }
}

class ViewUtil {
    static toggleAttribute(ele, attribute) {
        ele.classList.contains(attribute) ? ele.classList.remove(attribute) : ele.classList.add(attribute);
    }
}

class ViewTemplate {
    static ViewsCounter = 0
    ID_ATTRIBUTE = "data-pjs"
    static htmlParser = new DOMParser()
    childrenList = []
    DOMSharedProps = {}
    template
    parent

    constructor(template, parent) {
    	if (typeof template === 'string')
    		this.template = template.trim()
    	else 
    	 	this.template = template.innerHTML.trim()
        
        this.parent = parent
    }

    compile(templateData) {
        let cv = ViewCompiler.compile(templateData, this.template)
        let doc = ViewTemplate.htmlParser.parseFromString(cv, 'text/html');
        return this.signDOM(doc.body, templateData)
    }

    compileArray(dataArray, parent) {
        dataArray.forEach(data => this.compile(data))
    }

    signDOM(DOM, templateData) {
        DOM.setAttribute(this.ID_ATTRIBUTE, ViewTemplate.ViewsCounter += 1)
        this.assignSharedProps(DOM, templateData)
        let final = this.createCtx(DOM, templateData)
        this.childrenList.push(final)
        return final
    }

    assignSharedProps(DOM, templateData) {
        let h = this.DOMSharedProps
        for (let x in h) {
            DOM[x] = (e) => {
                h[x](e, templateData, DOM)
            }
        }
    }

    update (ctx, params) {
    	ctx.templateData = {
    		...ctx.templateData,
    		...params
    	}

    	let cv = ViewCompiler.compile(ctx.templateData, this.template)
        let doc = ViewTemplate.htmlParser.parseFromString(cv, 'text/html');
        ctx.DOM.innerHTML = doc.body.innerHTML
    }

    createCtx(DOM, templateData) {
        let ctx = {
            DOM: DOM,
            templateData: templateData,
            appendToParent: () => {this.parent.appendChild(DOM); return ctx;},
            update: (params) => {this.update(ctx, params)}
        }; 
        return ctx
    }
}
