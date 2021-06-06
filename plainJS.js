function _(id) {
    return document.getElementById(id)
}

function _c(t) {
    return document.createElement(t)
}

function _cs(css) {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.setAttribute('id', 'uib')
    style.innerHTML = css;
    document.getElementsByTagName('head')[0].appendChild(style);
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
    DOMSharedAttrs = {}
    DOMSharedEvents = {}
    template
    parent
    DOMS = []

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
        this.assignSharedEvents(DOM, templateData)
        this.assignSharedAttrs(DOM, templateData)
        let final = this.createCtx(DOM, templateData)
        this.childrenList.push(final)
        return final
    }

    assignSharedEvents(DOM, templateData) {
        let h = this.DOMSharedEvents
        for (let x in h) {
            DOM[x] = (e) => {
                h[x](e, templateData, DOM)
            }
        }
    }

    assignSharedAttrs(DOM, templateData) {
        let h = this.DOMSharedAttrs
        for (let x in h) {
            DOM.setAttribute(x, h[x])
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
        this.DOMS.push(DOM)
        let ctx = {
            DOM: DOM,
            templateData: templateData,
            appendToParent: () => {this.parent.appendChild(DOM); return ctx;},
            update: (params) => {this.update(ctx, params)}
        };
        return ctx
    }

    getDOMS () {
        return this.DOMS;
    }
}
