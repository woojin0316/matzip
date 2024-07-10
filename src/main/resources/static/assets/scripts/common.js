class LabelObj {
    // HTML 요소를 저장
    element;

    // 인자로 받은 HTML 요소를 element 속성에 할당
    constructor(element) {
        this.element = element;
    }

    // element 유효성 여부 확인
    isValid() {
        return !this.element.classList.contains(HTMLElement.INVALID_CLASS_NAME);
    }

    // b 값에 따라 element 의 유효성을 설정
    setValid(b) {
        if (b === true) {
            this.element.classList.remove(HTMLElement.INVALID_CLASS_NAME);
        }

        if (b === false) {
            this.element.classList.add(HTMLElement.INVALID_CLASS_NAME);
        }
        return this;
    }
}

class MessageObj {
    static cover =null;
    static stack = [];

    static createSimpleOk = (title, content, onclick) => {
        return new MessageObj({
            title: title,
            content: content,
            buttons: [
                {
                    text: '확인',
                    onclick: (obj) => {
                        obj.hide();
                        if(typeof onclick === 'function'){
                            onclick(obj);
                        }
                    }
                }
            ]
        });
    }
    element;

    constructor(params) {
        if (MessageObj.cover === null) {
            const cover = document.createElement('div');
            cover.classList.add('_obj-message-cover');
            MessageObj.cover = cover;
            document.body.prepend(cover);
        }
        params.buttons ??= [];
        const element = new DOMParser().parseFromString(`
            <div class="_obj-message">
                <div class="__title">${params.title}</div>
                <div class="__content">${params.content}</div>
            </div>`, 'text/html').querySelector('._obj-message');
        if (params.buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('__button-container');
            buttonContainer.style.gridTemplateColumns = `repeat(${params.buttons.length}, minmax(0, 1fr))`;

            for (const buttonObject of params.buttons) {
                const button = document.createElement('button');
                button.classList.add('__button');
                button.setAttribute('type', 'button');
                button.innerText = buttonObject.text;
                if (typeof buttonObject.onclick === 'function') {
                    button.onclick = () => {
                        buttonObject.onclick(this);
                    };
                }
                buttonContainer.append(button);
            }
            element.append(buttonContainer);
        }
        document.body.prepend(element);
        this.element = element;
    }

    hide() {
        MessageObj.stack.splice(MessageObj.stack.indexOf(this.element), 1);
        setTimeout(() => {
            if (MessageObj.stack.length === 0) {
                MessageObj.cover.hide();
            }
            this.element.hide();
        }, 100);
    }

    show() {
        MessageObj.stack.push(this.element);
        setTimeout(() => {
            MessageObj.cover.show();
            this.element.show();
        }, 100);
    }
}

HTMLElement.INVALID_CLASS_NAME = '-invalid';
HTMLElement.VISIBLE_CLASS_NAME = '-visible';
// 오타방지를 위해 미리 값을 넣어줬다.

HTMLElement.prototype.disable = function () {
    this.setAttribute('disabled', '');
    return this;
}

HTMLElement.prototype.enable = function () {
    this.removeAttribute('disabled');
    return this;
}

HTMLElement.prototype.hide = function () {
    this.classList.remove(HTMLElement.VISIBLE_CLASS_NAME);
    return this;
}

HTMLElement.prototype.isEnabled = function () {
    return !this.hasAttribute('disabled');
}


HTMLElement.prototype.show = function () {
    this.classList.add(HTMLElement.VISIBLE_CLASS_NAME);
    return this;
}

HTMLInputElement.prototype.tests = function () {
    if (typeof this.dataset.regex !== 'string') {
        return true;
    }
    if (typeof this._regExp === 'undefined') {
        this._regExp = new RegExp(this.dataset.regex);
    }
    return this._regExp.test(this.value);
}


HTMLTextAreaElement.prototype.tests = function () {
    if (typeof this.dataset.regex !== 'string') {
        return true;
    }
    if (typeof this._regExp === 'undefined') {
        this._regExp = new RegExp(this.dataset.regex);
    }
    return this._regExp.test(this.value);
}



// 이 코드는 JavaScript 에서 HTMLElement 객체의 프로토타입에 두 가지 새로운 메소드를 추가하는 방법을 보여줍니다: hide()와 show().
//
// hide() 메소드:
//
//     이 메소드는 호출된 HTMLElement 객체를 화면에서 숨기는 역할을 합니다.
//     이를 위해 classList 속성을 사용하여 해당 요소의 클래스 리스트에서 HTMLElement.VISIBLE_CLASS_NAME을 제거합니다. 여기서 HTMLElement.VISIBLE_CLASS_NAME은 해당 요소가 화면에 보이도록 하는 CSS 클래스의 이름을 가정합니다. 즉, 이 클래스를 제거하면 해당 요소가 화면에서 사라지게 됩니다.
//     마지막으로 this를 반환하여 메소드 체이닝을 가능하게 합니다.
// show() 메소드:
//
//     이 메소드는 호출된 HTMLElement 객체를 화면에 보이도록 하는 역할을 합니다.
//     이를 위해 classList 속성을 사용하여 해당 요소의 클래스 리스트에 HTMLElement.VISIBLE_CLASS_NAME을 추가합니다. 이로써 해당 요소가 화면에 나타나게 됩니다.
//     마지막으로 this를 반환하여 메소드 체이닝을 가능하게 합니다.
//     이러한 두 메소드는 다른 JavaScript 코드에서 사용될 수 있으며, 요소의 표시/숨김을 간단하게 제어하는데 유용합니다. 예를 들어, HTML 요소를 클릭하면 해당 요소를 숨기거나 보이게 하는 이벤트 핸들러를 작성할 때 유용하게 활용할 수 있습니다.


// 자바스크립트에서 프로토타입(Prototype)은 객체 지향 프로그래밍에서 상속을 구현하는 데 사용되는 중요한 개념입니다.
// 모든 JavaScript 객체는 프로토타입을 가지고 있습니다.
// 프로토타입은 해당 객체의 부모 역할을 하며, 객체가 상속받은 메소드나 속성을 포함하고 있습니다.
//
// 모든 함수 객체(Function object)는 prototype 이라는 특수한 속성을 가지고 있습니다.
// 이 prototype 속성은 해당 함수로부터 생성된 객체들이 상속받을 프로토타입 객체를 가리킵니다.
//
// 이때, prototype 속성은 일반적으로 메소드를 정의하거나 상속을 구현하는 데 사용됩니다.
// 예를 들어, 어떤 함수를 생성자로 사용하여 객체를 생성할 때, 해당 함수의 prototype 속성에 정의된 메소드나 속성은 생성된 객체들이 공유하게 됩니다.

// 프로토타입은 JavaScript 의 객체 지향 프로그래밍에서 상속을 구현하는 핵심 메커니즘 중 하나이며, 이를 통해 코드의 재사용성과 유지보수성을 향상시킬 수 있습니다.