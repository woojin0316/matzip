const detailAside = document.getElementById('detailAside');

const showDetailAside = (placeIndex, onclose) => {
    loadReviews(placeIndex);
    detailAside.scrollTop = 0;
    detailAside.reviewForm['placeIndex'].value = placeIndex;
    detailAside.querySelectorAll('[rel="closer"]').forEach(closer => closer.onclick = () => {
        detailAside.hide();
        if (typeof onclose === 'function') {
            onclose();
        }
    });
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        loading.hide();
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '맛집 정보를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.', () => {
                location.reload();
            }).show();
            return;
        }
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const placeObject = JSON.parse(xhr.responseText);
        const scheduleObject = JSON.parse(placeObject['schedule']);
        detailAside.querySelector('[rel="name"]').innerText = placeObject['title'];
        detailAside.querySelector('[rel="category"]').innerText = placeObject['placeCategoryText'];
        detailAside.querySelector('[rel="favorite"]').innerText = placeObject['favoriteCount'];
        detailAside.querySelector('[rel="review"]').innerText = placeObject['reviewCount'];
        detailAside.querySelector('[rel="address"]').innerText = `${placeObject['addressPrimary']} ${placeObject['addressSecondary']}`;
        detailAside.querySelector('[rel="contact"]').href = `tel:${placeObject['contactFirst']}-${placeObject['contactSecond']}-${placeObject['contactThird']}`;
        detailAside.querySelector('[rel="contact"]').innerText = `${placeObject['contactFirst']}-${placeObject['contactSecond']}-${placeObject['contactThird']}`;
        detailAside.querySelector('[rel="description"]').innerText = placeObject['description'];
        detailAside.querySelector('[rel="userNickname"]').innerText = placeObject['userNickname'];
        detailAside.querySelector('[rel="createdAt"]').innerText = placeObject['createdAt'];
        for (const day of days) {
            const dayEl = detailAside.querySelector(`[rel="${day}Op"]`);
            const op = scheduleObject[day]['op'];
            const open = scheduleObject[day]['open'];
            const close = scheduleObject[day]['close'];
            dayEl.innerText = op === true ? `${open} - ${close}` : '휴무일';
        }
        if (placeObject['saved'] === true) {
            detailAside.querySelector('[rel="saveButton"]').classList.add('-saved');
        } else {
            detailAside.querySelector('[rel="saveButton"]').classList.remove('-saved');
        }

        detailAside.querySelector('[rel="saveButton"]').onclick = () => {
            if (placeObject['signed'] !== true) {
                MessageObj.createSimpleOk('경고', '로그인 후 사용할 수 있는 기능입니다.').show();
                return;
            }
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('placeIndex', placeObject['index']);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
                    return;
                }
                const responseObject = JSON.parse(xhr.responseText);
                if (responseObject.result === 'success') {
                    if (responseObject['saved'] === true) { //
                        detailAside.querySelector('[rel="saveButton"]').classList.add('-saved');
                    } else {
                        detailAside.querySelector('[rel="saveButton"]').classList.remove('-saved');
                    }
                    return;
                }
                const [dTitle, dContent, dOnclick] = {
                    failure: ['경고', '알 수 없는 이유로 즐겨찾기 정보를 수정하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
                MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
            }
            xhr.open('POST', './placeFavorite/'); // PlaceFavoriteController.postIndex
            xhr.send(formData);
        };
        detailAside.querySelector('[rel="reportButton"]').onclick = () => {
            if (placeObject['signed'] !== true) {
                MessageObj.createSimpleOk('경고', '로그인 후 사용할 수 있는 기능입니다.').show();
                return;
            }
            if (placeObject['mine'] !== false) {
                MessageObj.createSimpleOk('경고', '본인이 등록한 맛집은 신고할 수 없습니다.').show();
                return;
            }
            new MessageObj({
                title: '신고',
                content: '정말로 맛집을 해당 신고할까요? 검토 후 조치가 필요에 따라 적절한 조치가 이루어지며 별도로 결과가 통보되지 않습니다.',
                buttons: [
                    {text: '취소', onclick: instance => instance.hide()},
                    {
                        text: '신고하기', onclick: instance => {
                            instance.hide();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('placeIndex', placeObject['index']);
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
                                    failure: ['경고', '알 수 없는 이유로 맛집을 신고하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                                    failure_duplicate: ['경고', '이미 신고한 이력이 있는 맛집입니다.'],
                                    success: ['알림', '맛집을 성공적으로 신고하였습니다. 검토 후 필요에 따라 적절한 조치가 이러우지며 별도로 결과가 통보되지 않습니다.']
                                }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습ㅈ니다. 잠시 후 다시 시도해 주세요.'];
                                MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
                            }

                            xhr.open('POST', './placeReport/'); // PlaceController.postIndex
                            xhr.send(formData);
                            loading.show();
                        }
                    }
                ]
            }).show();
        };
        detailAside.querySelector('[rel="modifyButton"]').onclick = () => {

        };
        detailAside.querySelector('[rel="deleteButton"]').onclick = () => {
            if (placeObject['signed'] !== true) {
                MessageObj.createSimpleOk('경고', '로그인 후 사용할 수 있는 기능힙니다.').show();
                return;
            }
            if (placeObject['mine'] !== true) {
                MessageObj.createSimpleOk('경고', '본인이 등록한 맛집만 삭제할 수 있습니다.').show();
                return;
            }
            new MessageObj({
                title: '삭제',
                content: '정말로 맛집을 삭제할까요? 삭제한 맛집은 복구할 수 없습니다.',
                buttons: [
                    {text: '취소', onclick: instance => instance.hide()},
                    {
                        text: '삭제하기', onclick: instance => {
                            instance.hide();
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append('index', placeObject['index']);
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
                                    failure: ['경고', '알 수 없는 이유로 맛집을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                                    success: ['알림', '맛집을 성공적으로 삭제하였습니다.', () => {
                                        detailAside.hide();
                                        loadPlaces(); // 삭제 후 브라우저 새로고침
                                        if (typeof onclose === 'function') onclose();
                                    }]
                                }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습ㅈ니다. 잠시 후 다시 시도해 주세요.'];
                                MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
                            }
                            xhr.open('DELETE', './place/'); //PlaceController.deleteIndex
                            xhr.send(formData);
                            loading.show();
                        }
                    }
                ]
            }).show();
        };
        detailAside.show();
    }
    xhr.open('GET', `./place/?index=${placeIndex}`);
    xhr.send();
    loading.show();
};

detailAside.reviewImages = [];
detailAside.reviewForm = detailAside.querySelector(':scope > .review-form');
detailAside.reviewForm.contentLabel = new LabelObj(detailAside.reviewForm.querySelector('[rel="contentLabel"]'));

detailAside.reviewForm['clearButton'].onclick = () => {
    detailAside.reviewImages = [];
    const imageContainerEl = detailAside.reviewForm.querySelector(':scope > .attachment > .image-container');
    imageContainerEl.querySelector(':scope > .empty').style.display = 'flex';
    imageContainerEl.querySelectorAll(':scope > .image-wrapper').forEach(x => x.remove());
    detailAside.reviewForm['images'].value = '';
};

detailAside.reviewForm['deleteButton'].onclick = () => {
    const imageContainerEl = detailAside.reviewForm.querySelector(':scope > .attachment > .image-container');
    const imageWrapperElArray = Array.from(imageContainerEl.querySelectorAll(':scope > .image-wrapper'));
    if (imageWrapperElArray.length === 0) {
        MessageObj.createSimpleOk('경고', '삭제할 이미지가 없습니다.').show();
        return;
    }
    if (imageWrapperElArray.every(x => !x.querySelector(':scope > [type="checkbox"]').checked)) {
        MessageObj.createSimpleOk('경고', '삭제할 이미지를 한 개 이상 선택해 주세요.').show();
        return;
    }
    for (let i = imageWrapperElArray.length - 1; i >= 0; i--) {
        if (imageWrapperElArray[i].querySelector(':scope > [type="checkbox"]').checked) {
            imageWrapperElArray[i].remove();
            detailAside.reviewImages.splice(i, 1);
        }
    }
    if (detailAside.reviewImages.length === 0) {
        imageContainerEl.querySelector(':scope > .empty').style.display = 'flex';
    }
    detailAside.reviewForm['images'].value = '';
};

detailAside.reviewForm['addButton'].onclick = () => {
    detailAside.reviewForm['images'].click();
};

detailAside.reviewForm['images'].onchange = () => {
    if (detailAside.reviewForm['images'].files.length === 0) {
        return;
    }
    const imageContainerEl = detailAside.reviewForm.querySelector(':scope > .attachment > .image-container');
    imageContainerEl.querySelector(':scope > .empty').style.display = 'none';
    for (const file of detailAside.reviewForm['images'].files) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const imageWrapperEl = new DOMParser().parseFromString(`
        <label class="image-wrapper">
            <input type="checkbox">
            <img alt="" class="image" src="">
        </label>
      `, 'text/html').querySelector('.image-wrapper');
            imageWrapperEl.querySelector('.image').src = fileReader.result;
            imageContainerEl.append(imageWrapperEl);
            detailAside.reviewImages.push(file);
        };
        fileReader.readAsDataURL(file);
    }
};

detailAside.reviewForm.onsubmit = e => {
    e.preventDefault();
    // preventDefault 는  onsubmit 세트
    detailAside.reviewForm.contentLabel.setValid(detailAside.reviewForm['content'].tests());
    if (!detailAside.reviewForm.contentLabel.isValid()) {
        detailAside.reviewForm['content'].focus();
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('placeIndex', detailAside.reviewForm['placeIndex'].value);
    formData.append('rating', detailAside.reviewForm['rating'].value);
    formData.append('content', detailAside.reviewForm['content'].value);
    for (const image of detailAside.reviewForm['images'].files) { //이미지가 다수일 수 있기 때문에 for 문 돌림.
        formData.append('_images', image);
    }
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
            failure: ['경고', '알 수 없는 이유로 리뷰를 등록하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
            success: ['알림', '리뷰를 등록해 주셔서 감사합니다.', () => {
                detailAside.reviewForm['rating'].value = 5; //별점 5점으로 초기화
                detailAside.reviewForm['content'].value = ''; //내용 초기화
                detailAside.reviewForm['clearButton'].click(); // 등록된 이미지 다 갖다 치움.
                loadReviews(detailAside.reviewForm['placeIndex'].value); // 리뷰 등록 후 리뷰를 다시 불러와야 함
            }],
        }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
        MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
    }

    xhr.open('POST', './placeReview/'); //PlaceReviewController.postIndex
    xhr.send(formData);
    loading.show();
};

// 맛집 번호로 리뷰를 불러오기 위한 함수
const loadReviews = (placeIndex) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '리뷰 정보를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.', () => {
                location.reload();
            }).show();
            return;
        }
        const reviewContainer = detailAside.querySelector(':scope > .review-container');
        const reviewArray = JSON.parse(xhr.responseText);
        reviewContainer.innerHTML = '';
        if (reviewArray.length === 0) {
            reviewContainer.innerHTML = '<li class="item empty"> 아직 작성된 리뷰가 없어요.</li>';
        }
        for (const reviewObject of reviewArray) {
            const reviewEl = new DOMParser().parseFromString(`
             <li class="item">
            <span class="head">
                <span class="left">
                    <span class="nickname">${reviewObject['userNickname']}</span>
                    <span class="rating">
                        ${'<i class="star fa-solid fa-star"></i>'.repeat(reviewObject['rating'])}
                        ${'<i class="star fa-regular fa-star"></i>'.repeat(5 - reviewObject['rating'])}
                    </span>
                </span>
                <span class="right date">${reviewObject['createdAt']}</span>
            </span>
            <span class="body">
                <span class="image-container" rel="imageContainer" data-flickity></span>
                <span class="content">${reviewObject['content']}</span>
            </span>
            <span class="foot">
                <a href="#" class="link" rel="deleteLink">삭제</a>
                <a href="#" class="link" rel="reportLink">신고</a>
            </span>
        </li>`, 'text/html').querySelector('li.item');
            const imageContainerEl = reviewEl.querySelector('[rel="imageContainer"]');
            for (const imageIndex of reviewObject['imageIndexes']) {
                const imageEl = document.createElement('img');
                imageEl.setAttribute('alt', '');
                imageEl.setAttribute('class', 'image');
                imageEl.setAttribute('src', `./placeReview/image?index=${imageIndex}`);
                imageContainerEl.append(imageEl);
            }
            const deleteLinkEl = reviewEl.querySelector('[rel="deleteLink"]');
            const reportLinkEl = reviewEl.querySelector('[rel="reportLink"]');
            deleteLinkEl.onclick = e => {
                e.preventDefault();
                if (reviewObject['signed'] !== true) {
                    MessageObj.createSimpleOk('경고', '로그인 후 사용할 수 있는 기능입니다.').show();
                    return;
                }
                e.preventDefault();
                if (reviewObject['mine'] !== true) {
                    MessageObj.createSimpleOk('경고', '본인이 등록한 리뷰만 삭제할 수 있습니다.').show();
                    return;
                }
                new MessageObj({
                    title: '삭제',
                    content: '정말로 리뷰를 삭제할까요? 삭제한 리뷰는 복구 불가능합니다.',
                    buttons: [
                        {text: '취소', onclick: instance => instance.hide()},
                        {
                            text: '삭제하기', onclick: instance => {
                                instance.hide();
                                const xhr = new XMLHttpRequest();
                                const formData = new FormData();
                                formData.append('index', reviewObject['index']);
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
                                        failure: ['경고', '알 수 없는 이유로 리뷰를 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                                        success: ['알림', '리뷰를 성공적으로 삭제하였습니다..', () => loadReviews(placeIndex)]
                                    }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
                                    MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
                                }
                                xhr.open('DELETE', './placeReview/');
                                xhr.send(formData);
                                loading.show();
                            }
                        }
                    ]
                }).show();
            };
            reportLinkEl.onclick = e => {
                e.preventDefault();
                if (reviewObject['signed'] !== true) {
                    MessageObj.createSimpleOk('경고', '로그인 후 사용할 수 있는 기능입니다.').show();
                    return;
                }
                if (reviewObject['mine'] !== false) {
                    MessageObj.createSimpleOk('경고', '본인이 등록한 리뷰는 신고할 수 없습니다.').show();
                    return;
                }
                new MessageObj({
                    title: '신고',
                    content: '정말로 해당 리뷰를 신고할까요? 검토 후 필요에 따라 적절한 조치가 이루어지며 별도로 결과가 통보되지 않습니다.',
                    buttons: [
                        {text: '취소', onclick: instance => instance.hide()},
                        {
                            text: '신고하기', onclick: instance => {
                                instance.hide();
                                const xhr = new XMLHttpRequest();
                                const formData = new FormData();
                                formData.append('index', reviewObject['index']);
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
                                        failure: ['경고', '알 수 없는 이유로 리뷰를 신고하지 못하였습니다. 잠시 후 다시 시도해 주세요.'],
                                        failure_duplicate: ['경고', '이미 신고한 이력이 있는 리뷰입니다.'],
                                        success: ['알림', '리뷰를 성공적으로 신고하였습니다. 검토 후 필요에 따라 적절한 조치가 이루어지며 별도로 결과가 통보되지 않습니다.']
                                    }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
                                    MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
                                }
                                xhr.open('POST', './placeReview/report');
                                xhr.send(formData);
                                loading.show();
                            }
                        }
                    ]
                }).show();
            };

            reviewContainer.append(reviewEl);
        }
        applyFlickity();
    }
    xhr.open('GET', `./placeReview/reviews?placeIndex=${placeIndex}`); // PlaceReviewController.getReviews
    xhr.send();
};



