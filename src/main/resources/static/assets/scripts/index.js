const cover = document.getElementById('cover');
const loading = document.getElementById('loading');
const loginForm = document.getElementById('loginForm');
const map = document.getElementById('map');
const recoverDialog = document.getElementById('recoverDialog');
const registerForm = document.getElementById('registerForm');
const addressFinder = document.getElementById('addressFinder');



const loadMap = (lat, lng, lv) => {
    lat ??= 35.8715411;
    lng ??= 128.601505;
    lv ??= 3; // 확대 레벨
    map.instance = new kakao.maps.Map(map, {
        center: new kakao.maps.LatLng(lat, lng),
        level: lv
    });
    kakao.maps.event.addListener(map.instance, 'bounds_changed', () => {
        const mapCenter = map.instance.getCenter();
        localStorage.setItem('mapLastLat', mapCenter.getLat());
        localStorage.setItem('mapLastLng', mapCenter.getLng());
        localStorage.setItem('mapLastLv', map.instance.getLevel());
    });    // 개발자도구 어플리케이션 로컬 스토리지에 키 / 값 을 상시 업데이트 및 값을 저장하게해주는 로직
    kakao.maps.event.addListener(map.instance, 'dragend', () => {
        // 드래그 끝났을 때
        loadPlaces();
    });
    kakao.maps.event.addListener(map.instance, 'zoom_changed', () => {
      // 확대/축소했을 때
      loadPlaces();
    });
    kakao.maps.event.addListener(map.instance, 'tilesloaded', () => { //지도가 다 불러와졌을 때 새로고침해도 유지
        loadPlaces();
    });
};

const showLogin = () => {
    registerForm.hide();
    recoverDialog.hide();
    loginForm['email'].value = '';
    loginForm['email'].focus();
    loginForm['password'].value = '';
    loginForm.show();
    cover.show(() => {
        loginForm.hide();
        cover.hide();
    });
    // cover.show(() => {loginForm.hide(); cover.hide();});:
    //     cover.show() 함수를 호출하고, 클릭 이벤트 핸들러로 콜백 함수를 전달합니다.
    //     콜백 함수는 loginForm.hide(); cover.hide();를 실행합니다.
    //     즉, 클릭 이벤트가 발생하면 로그인 폼을 숨기고 (loginForm.hide()), 그리고 cover 도 숨깁니다 (cover.hide()).enable
    //     이렇게 하면 사용자가 cover 를 클릭할 때마다 로그인 폼과 cover 가 숨겨지게 됩니다.
};

const showRegister = () => {
    loginForm.hide();
    registerForm['emailSalt'].value = '';
    registerForm['email'].enable(); // registerForm['email'].removeAttribute('disabled');
    registerForm['email'].focus();
    registerForm['email'].value = '';
    registerForm['emailSend'].enable();
    registerForm['emailCode'].disable();
    registerForm['emailCode'].value = '';
    registerForm['emailVerify'].disable();
    registerForm['password'].value = '';
    registerForm['passwordCheck'].value = '';
    registerForm['nickname'].value = '';
    registerForm['agree'].checked = false;
    registerForm.show();

    cover.show(() => {
        registerForm.hide();
        showLogin();
    })
}
const showRecover = () => {
    recoverDialog.querySelector('[name="type"][value="email"]').checked = true;
    recoverDialog.emailForm['nickname'].value = '';
    recoverDialog.passwordForm['emailSalt'].value = '';
    recoverDialog.passwordForm['email'].enable().value = '';
    recoverDialog.passwordForm['emailSend'].enable();
    recoverDialog.passwordForm['emailCode'].disable().value = '';
    recoverDialog.passwordForm['emailVerify'].disable();
    recoverDialog.show();
    cover.show(() => {
        recoverDialog.hide();
        showLogin();
    })
}

const showAddAside = () => {
    addAside.show();
};

const showListAside = () => {
    addAside.hide();
    listAside.show();
};


cover.show = (onclick) => { //
    cover.onclick = onclick;
    cover.classList.add(HTMLElement.VISIBLE_CLASS_NAME);
}


document.body.querySelectorAll('[rel="showLoginCaller"]').forEach(el => el.addEventListener('click', showLogin));
document.body.querySelectorAll('[rel="showRegisterCaller"]').forEach(el => el.addEventListener('click', showRegister));
document.body.querySelectorAll('[rel="showRecoverCaller"]').forEach(el => el.addEventListener('click', showRecover));
document.body.querySelectorAll('[rel="showListAsideCaller"]').forEach(el => el.addEventListener('click', showListAside));
document.body.querySelectorAll('[rel="showAddAsideCaller"]').forEach(el => el.addEventListener('click', showAddAside));  // 브라우저에 만든 버튼 클릭 시 각 html을 띄워주기 위한 로직

loginForm.emailLabel = new LabelObj(loginForm.querySelector('[rel="emailLabel"]'));
loginForm.passwordLabel = new LabelObj(loginForm.querySelector('[rel="passwordLabel"]'));

loginForm.onsubmit = e => {
    e.preventDefault();
    loginForm.emailLabel.setValid(loginForm['email'].tests());
    loginForm.passwordLabel.setValid(loginForm['password'].tests());
    if (!loginForm.emailLabel.isValid() || !loginForm.passwordLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', loginForm['email'].value);
    formData.append('password', loginForm['password'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        if (responseObject.result === 'success') {
            location.reload();
            return;
        }
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '이메일 혹은 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.', () => loginForm['email'].focus()],
            failure_suspended: ['경고', '이용이 일시적으로 정지된 계정입니다. 고객센터를 통해 문의해 주세요.']
        } [responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('POST', './user/login'); //UserController.postLogin
    xhr.send(formData);
    loading.show();
};

registerForm.emailLabel = new LabelObj(registerForm.querySelector('[rel="emailLabel"]'));
registerForm.passwordLabel = new LabelObj(registerForm.querySelector('[rel="passwordLabel"]'))
registerForm.nicknameLabel = new LabelObj(registerForm.querySelector('[rel="nicknameLabel"]'))

registerForm['emailSend'].onclick = () => {

    registerForm.emailLabel.setValid(registerForm['email'].tests());
    if (!registerForm.emailLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', registerForm['email'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '알 수 없는 이유로 인증번호를 전송하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
            failure_duplicate_email: ['경고', '해당 이메일은 이미 사용 중입니다. 다른 이메일을 입력해 주세요.', () => {
                registerForm['email'].focus();
            }],
            success: ['알림', '입력하신 이메일로 인증번호를 전송하였습니다. 인증번호는 3분간만 유효하니 유의해 주세요.', () => {
                registerForm['emailSalt'].value = responseObject['salt'];
                registerForm['email'].disable();
                registerForm['emailSend'].disable();
                registerForm['emailCode'].enable();
                registerForm['emailCode'].focus();
                registerForm['emailVerify'].enable();

            }]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('POST', './user/registerEmail'); // UserController :: postRegisterEmail
    xhr.send(formData);
    loading.show();
};


registerForm['emailVerify'].onclick = () => {
    registerForm.emailLabel.setValid(registerForm['emailCode'].tests());
    if (!registerForm.emailLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', registerForm['email'].value);
    formData.append('code', registerForm['emailCode'].value);
    formData.append('salt', registerForm['emailSalt'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            loading.hide();
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.', () => registerForm['emailCode'].focus()],
            failure_expired: ['경고', '인증번호가 만료되었습니다. 다시 시도해 주세요.', () => {
                registerForm['emailSalt'].value = '';
                registerForm['email'].enable(); // registerForm['email'].removeAttribute('disabled');
                registerForm['emailSend'].enable();
                registerForm['emailCode'].disable();
                registerForm['emailCode'].value = '';
                registerForm['emailVerify'].disable();
            }],
            success: ['알림', '이메일 인증이 완료되었습니다. 회원가입을 계속해 주세요.', () => {
                registerForm['emailCode'].disable();
                registerForm['emailVerify'].disable();
                registerForm['password'].focus();
            }]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('PATCH', './user/registerEmail');
    xhr.send(formData);
    loading.show();
};

registerForm.onsubmit = e => {
    e.preventDefault();
    registerForm.passwordLabel.setValid(registerForm['password'].tests());
    registerForm.nicknameLabel.setValid(registerForm['nickname'].tests());
    if (registerForm['emailSend'].isEnabled() || registerForm['emailVerify'].isEnabled()) {
        MessageObj.createSimpleOk('경고', '이메일 인증을 완료해 주세요.');
        return;
    }
    if (registerForm['password'].value !== registerForm['passwordCheck'].value) {
        MessageObj.createSimpleOk('경고', '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.').show();
        return;
    }
    if (!registerForm.passwordLabel.isValid() || !registerForm.nicknameLabel.isValid()) {
        return;
    }

    if (!registerForm['agree'].checked) {
        MessageObj.createSimpleOk('경고', '서비스 이용약관에 동의하지 않으셨습니다. 동의해주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', registerForm[`email`].value);
    formData.append('code', registerForm[`emailCode`].value);
    formData.append('salt', registerForm[`emailSalt`].value);
    formData.append('password', registerForm[`password`].value);
    formData.append('nickname', registerForm[`nickname`].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '알 수 없는 이유로 회원가입에 실패하였습니다. 잠시 후 다시 시도해 주세요.'],
            failure_duplicate_cate: ['경고', `입력하신 이메일 <b>${registerForm['email'].value}</b>은 이미 사용 중입니다. 다른 이메일을 입력해 주세요.`, () => {
                registerForm['emailSalt'].value = '';
                registerForm['email'].enable().focus();
                registerForm['emailSend'].enable();
                registerForm['emailCode'].disable().value = '';
                registerForm['emailVerify'].disable();
            }],
            failure_duplicate_nickname: ['경고', `입력하신 닉네임 <b>${registerForm['nickname'].value}</b>은 이미 사용 중입니다. 다른 닉네임을 사용해 주세요.`, () => registerForm['nickname'].focus()],
            success: ['알림', '회원가입해 주셔서 감사드립니다. 확인 버튼을 클릭하면 로그인 페이지로 이동합니다.', () => showLogin()]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('POST', './user/'); // userController.postIndex
    xhr.send(formData);
    loading.show();
}

recoverDialog.emailForm = recoverDialog.querySelector('[rel="emailForm"]');
recoverDialog.emailForm.nicknameLabel = new LabelObj(recoverDialog.emailForm.querySelector('[rel="nicknameLabel"]'));
recoverDialog.passwordForm = recoverDialog.querySelector('[rel="passwordForm"]');
recoverDialog.passwordForm.emailLabel = new LabelObj(recoverDialog.passwordForm.querySelector('[rel="emailLabel"]'));
recoverDialog.passwordForm.passwordLabel = new LabelObj(recoverDialog.passwordForm.querySelector('[rel="passwordLabel"]'));

recoverDialog.querySelector('[name="cancelButton"]').onclick = () => {
    showLogin();
};

recoverDialog.emailForm.onsubmit = e => {
    e.preventDefault();
    recoverDialog.emailForm.nicknameLabel.setValid(recoverDialog.emailForm['nickname'].tests());
    if (!recoverDialog.emailForm.nicknameLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '입력하신 닉네임으로 회원 정보를 찾을 수 없습니다.다시 확인해 주세요.'],
            success: ['알림', `입력하신 닉네임으로 찾은 회원의 이메일은 <b>${responseObject['email']}</b>입니다. 확인 버튼을 클릭하면 로그인 페이지로 돌아갑니다.`, () => showLogin()]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('GET', `./user/email?nickname=${recoverDialog.emailForm['nickname'].value}`); //UserController > getEmail
    xhr.send();
    loading.show();
};


recoverDialog.passwordForm['emailSend'].onclick = () => {
    recoverDialog.passwordForm.emailLabel.setValid(recoverDialog.passwordForm['email'].value);
    if (!recoverDialog.passwordForm.emailLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', recoverDialog.passwordForm['email'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '입력하신 이메일을 사용하는 회원이 없습니다. 다시 확인해 주세요.', () => recoverDialog.passwordForm['email'].focus()],
            success: ['알림', '입력하신 이메일로 인증번호를 전송하였습니다. 인증번호는 3분간만 유효하니 유의해 주세요.', () => {
                recoverDialog.passwordForm['emailSalt'].value = responseObject['salt'];
                recoverDialog.passwordForm['email'].disable(); // registerForm['email'].removeAttribute('disabled');
                recoverDialog.passwordForm['emailSend'].disable();
                recoverDialog.passwordForm['emailCode'].enable();
                recoverDialog.passwordForm['emailCode'].focus();
                recoverDialog.passwordForm['emailVerify'].enable();
            }]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }
    xhr.open('POST', './user/resetPasswordEmail'); // UserController.resetPasswordEmail
    xhr.send(formData);
    loading.show();

}

recoverDialog.passwordForm['emailVerify'].onclick = () => {
    recoverDialog.passwordForm.emailLabel.setValid(recoverDialog.passwordForm['emailCode'].tests());
    if (!recoverDialog.passwordForm.emailLabel.isValid()) {
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', recoverDialog.passwordForm['email'].value);
    formData.append('code', recoverDialog.passwordForm['emailCode'].value);
    formData.append('salt', recoverDialog.passwordForm['emailSalt'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '인증번호가 올바르지 않습니다. 다시 확인해 주세요.', () => recoverDialog.passwordForm['emailCode'].focus()],
            failure_expired: ['경고', '인증번호가 만료되었습니다. 다시 시도해 주세요.', () => {
                recoverDialog.passwordForm['emailSalt'].value = '';
                recoverDialog.passwordForm['email'].enable(); // registerForm['email'].removeAttribute('disabled');
                recoverDialog.passwordForm['emailSend'].enable();
                recoverDialog.passwordForm['emailCode'].disable();
                recoverDialog.passwordForm['emailCode'].value = '';
                recoverDialog.passwordForm['emailVerify'].disable();
            }],
            success: ['알림', '이메일 인증이 완료되었습니다. 변경할 비밀번호를 입력해 주세요.', () => {
                recoverDialog.passwordForm['emailCode'].disable();
                recoverDialog.passwordForm['emailVerify'].disable();
                recoverDialog.passwordForm['password'].enable().focus();
                recoverDialog.passwordForm['passwordCheck'].enable();
            }]
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('PATCH', './user/resetPasswordEmail');
    xhr.send(formData);
}


recoverDialog.passwordForm.onsubmit = e => {
    e.preventDefault();
    if (recoverDialog.passwordForm['emailSend'].isEnabled() || recoverDialog.passwordForm['emailVerify'].isEnabled()) {
        MessageObj.createSimpleOk('경고', '이메일 인증을 완료해 주세요.').show();
        return;
    }
    recoverDialog.passwordForm.passwordLabel.setValid(recoverDialog.passwordForm['password']);
    if (!recoverDialog.passwordForm.passwordLabel.isValid()) {
        return;
    }
    if (recoverDialog.passwordForm['password'].value !== recoverDialog.passwordForm['passwordCheck'].value) {
        MessageObj.createSimpleOk('경고', '재입력한 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.', () => recoverDialog.passwordForm['password'].focus()).show();
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', recoverDialog.passwordForm['email'].value);
    formData.append('code', recoverDialog.passwordForm['emailCode'].value);
    formData.append('salt', recoverDialog.passwordForm['emailSalt'].value);
    formData.append('password', recoverDialog.passwordForm['password'].value);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
            return;
        }
        const responseObject = JSON.parse(xhr.responseText);
        const [dTitle, dContent, dOnclick] = {
            failure: ['경고', '알 수 없는 이유로 비밀번호를 재설정하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
            success: ['알림', '비밀번호를 성공적으로 재설정하였습니다. 확인 버튼을 클릭하면 로그인 페이지로 이동합니다..', () => showLogin()]
        }
            [responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }
    xhr.open('PATCH', './user/resetPassword');
    xhr.send(formData);
};



addressFinder.show = (oncomplete) => {
    // 카카오 주소 찾기 API 활용하여 addressFinder 의 자식인 dialog 에 주소 찾기 embed 하기. (이전에 했던 거임)
    // 단, 카카오 주소 찾기의 oncomplete 자리에는 전달 받은 매개변수인 oncomplete 을 할당하면 됨.
    new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: oncomplete
    }).embed(addressFinder.querySelector(':scope > .dialog')); // embed 는 지도를 요소 안에 띄움. open 을 쓰면 지도가 새 창으로 별도로 뜸
    addressFinder.classList.add(HTMLElement.VISIBLE_CLASS_NAME);
}


addressFinder.onclick = (e) => {
    if (e.target !== e.currentTarget) {
        return;
    }
    addressFinder.hide();
}

if (!isNaN(parseFloat(localStorage.getItem('mapLastLat'))) &&
    !isNaN(parseFloat(localStorage.getItem('mapLastLng'))) &&
    !isNaN(parseFloat(localStorage.getItem('mapLastLv')))) {
    loadMap(
        parseFloat(localStorage.getItem('mapLastLat')),
        parseFloat(localStorage.getItem('mapLastLng')),
        parseInt(localStorage.getItem('mapLastLv'))
    );
} else {
    navigator.geolocation.getCurrentPosition((data) => {
        // navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

// 위 코드에서 successCallback 은 위치를 가져오는 데 성공했을 때 호출될 콜백 함수이고, errorCallback 은 위치를 가져오는 데 실패했을 때 호출될 콜백 함수입니다.
// options 는 선택적으로 사용할 수 있는 위치 요청 설정입니다.
// 성공적으로 위치를 가져오면 successCallback 이 호출되고, 이 콜백 함수에는 Position 객체가 전달됩니다. Position 객체에는 사용자의 현재 위치와 관련된 정보가 포함되어 있습니다.
// 위치를 가져오는 데 실패하면 errorCallback 이 호출되고, 이 콜백 함수에는 PositionError 객체가 전달됩니다. PositionError 객체에는 발생한 오류에 대한 정보가 포함되어 있습니다.
// navigator.geolocation.getCurrentPosition()은
// 웹 브라우저의 Geolocation API 를 사용하여 사용자의 현재 위치를 가져오는 함수를 호출합니다.
//이 함수는 다음과 같은 매개변수를 가질 수 있습니다:

//successCallback: 위치를 성공적으로 가져올 때 호출되는 콜백 함수입니다. 이 콜백 함수는 Position 객체를 인수로 받습니다.

//errorCallback: 위치를 가져오는 데 실패했을 때 호출되는 콜백 함수입니다. 이 콜백 함수는 PositionError 객체를 인수로 받습니다.

//options: 위치 요청의 설정을 지정하는 객체입니다. 이 객체에는 세부적인 설정이 들어갈 수 있습니다.
        loadMap(data.coords.latitude, data.coords.longitude);
        //data.coords.latitude : Geolocation API 를 통해 얻은 위치 정보 객체에서 사용자의 현재 위도를 나타내는 속성
    }, () => {
        loadMap();
    });
}

//리뷰 사진 슬라이딩해주는 Flickity 를 사용하기 위함.
const applyFlickity = () => {
    document.body.querySelectorAll('[data-flickity]').forEach(el => {
        new Flickity(el, {
            cellAlign: 'left',
            contain: true,
            pageDots: false,
            wrapAround: true
        });
    });
};

applyFlickity();