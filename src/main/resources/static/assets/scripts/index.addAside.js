const addAside = document.getElementById('addAside');


{
    addAside.days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    addAside.form = addAside.querySelector(':scope > .form');
    addAside.form.thumbnailLabel = new LabelObj(addAside.form.querySelector('[rel="thumbnailLabel"]'));
    addAside.form.titleLabel = new LabelObj(addAside.form.querySelector('[rel="titleLabel"]'));
    addAside.form.categoryLabel = new LabelObj(addAside.form.querySelector('[rel="categoryLabel"]'));
    addAside.form.contactLabel = new LabelObj(addAside.form.querySelector('[rel="contactLabel"]'));
    addAside.form.addressLabel = new LabelObj(addAside.form.querySelector('[rel="addressLabel"]'));
    addAside.form.descriptionLabel = new LabelObj(addAside.form.querySelector('[rel="descriptionLabel"]'));
    for (const day of addAside.days) {
        addAside.form[`${day}Op`].oninput = () => {
            if (addAside.form[`${day}Op`].checked) {
                addAside.form[`${day}Open`].enable();
                addAside.form[`${day}Close`].enable();
            } else {
                addAside.form[`${day}Open`].disable().value = '';
                addAside.form[`${day}Close`].disable().value = '';
            }
        }
    }
}


{
    addAside.addingMarker = null;
    addAside.form['addressFind'].onclick = () => {
        addressFinder.show((data) => {
            const geocoder = new kakao.maps.services.Geocoder(); // 주소 -> 좌표 변환을 위한 객체
            geocoder.addressSearch(data['address'], (result, status) => {
                if(status !== kakao.maps.services.Status.OK){
                    return;
                }
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.instance.setCenter(coords);
                map.instance.setLevel(3);
                addAside.addingMarker?.setMap(null);
                addAside.addingMarker = new kakao.maps.Marker({
                    map: map.instance,
                    position:coords
                });
                // marker.setMap(map.instance);
                addAside.form['latitude'].value = coords.getLat();
                addAside.form['longitude'].value = coords.getLng();
            });
            // addressFinder.show 함수에서 돌려준 데이터(zoneCode(우편주소), address(기본주소))를 각각의 올바른 input 의 value 로 지정하기
            addAside.form['addressPostal'].value = data['zonecode'];
            addAside.form['addressPrimary'].value = data['address'];
            addressFinder.hide();
        });
    }
}

{
    addAside.form['thumbnail'].onchange = () => {
// alert('zzz');
        const thumbnailLabel = addAside.form.querySelector(':scope > .thumbnail');
        const imageWrapper = thumbnailLabel.querySelector(':scope > .image-wrapper');
        const empty = imageWrapper.querySelector(':scope >.empty');
        const image = imageWrapper.querySelector(':scope > .image');
        if (addAside.form['thumbnail'].files.length === 0) {
            empty.style.display = 'block';
            image.style.display = 'none';
            return;
        }``
        const fileReader = new FileReader(); // 이미지 파일을 Base64 인코딩하기 위한 존재
        fileReader.onload = () => {
            empty.style.display = 'none';
            image.style.display = 'block';
            image.setAttribute('src', fileReader.result);
        };
        fileReader.readAsDataURL(addAside.form['thumbnail'].files[0]);
    }
}

addAside.form['cancelButton'].onclick = () => {
    addAside.addingMarker?.setMap(null);
    showListAside();
}


{

    addAside.form.onsubmit = (e) => {
        e.preventDefault();
        addAside.form.thumbnailLabel.setValid(addAside.form['thumbnail'].files.length > 0);
        addAside.form.titleLabel.setValid(addAside.form['title'].tests());
        addAside.form.categoryLabel.setValid(addAside.form['category'].value !== '-1');
        addAside.form.contactLabel.setValid(addAside.form["contactFirst"].tests() && addAside.form['contactSecond'].tests() && addAside.form['contactThird'].tests());
        addAside.form.addressLabel.setValid(addAside.form['addressPostal'].tests() && addAside.form['addressPrimary'].tests() && addAside.form['addressSecondary'].tests());
        if(addAside.form['thumbnail'].files.length === 0){
            MessageObj.createSimpleOk('경고', '대표이미지를 선택해 주세요.').show();
            addAside.scrollTop = 0;
            return;
        }
        if (addAside.days.every(day => !addAside.form[`${day}Op`].checked)) {
            MessageObj.createSimpleOk('경고', '영업 일정을 확인해 주세요. 일주일에 하루 이상 영업하도록 체크해야 합니다.').show();
            return;
        }
        if (addAside.days.some(day => addAside.form[`${day}Op`].checked && (addAside.form[`${day}Open`].value === '' || addAside.form[`${day}Close`].value === ''))) {
            MessageObj.createSimpleOk('경고', '영업 일정을 확인해 주세요. 영업으로 표시된 요일은 오픈과 마감 시간을 작성하여야 합니다.').show();
            return;
        }
        const scheduleObject = {};
        addAside.days.forEach(day => {
            const op = addAside.form[`${day}Op`].checked;
            scheduleObject[day] = {};
            scheduleObject[day]['op'] = op;
            if(op){
                scheduleObject[day]['open'] = addAside.form[`${day}Open`].value;
                scheduleObject[day]['close'] = addAside.form[`${day}Close`].value;
            }
        });
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('_thumbnail', addAside.form['thumbnail'].files[0]);
        formData.append('title', addAside.form['title'].value);
        formData.append('placeCategoryCode', addAside.form['category'].value);
        formData.append('contactFirst', addAside.form['contactFirst'].value);
        formData.append('contactSecond', addAside.form['contactSecond'].value);
        formData.append('contactThird', addAside.form['contactThird'].value);
        formData.append('addressPostal', addAside.form['addressPostal'].value);
        formData.append('addressPrimary', addAside.form['addressPrimary'].value);
        formData.append('addressSecondary', addAside.form['addressSecondary'].value);
        formData.append('latitude', addAside.form['latitude'].value);
        formData.append('longitude', addAside.form['longitude'].value);
        formData.append('description', addAside.form['description'].value);
        formData.append('schedule', JSON.stringify(scheduleObject));
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE){
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.').show();
                return;
            }
            const responseObject = JSON.parse(xhr.responseText);
            const [dTitle, dContent, dOnclick] = {
                failure: ['경고', '알 수 없는 이유로 맛집을 등록하지 못하였습니다. 다시 시도해 주세요.'],
                failure_duplicate_contact: ['경고', '입력하신 연락처는 이미 사용 중입니다. 다시 확인해 주세요.', () => addAside.form['contactFirst'].focus()],
                success: ['알림', '맛집을 성공적으로 등록하였습니다..', () => {
                    addAside.addingMarker?.setMap(null);
                    showListAside();
                }]
            }[responseObject.result] || ['경고', '서버가 알 수 없는 응답을 반환하였습니다. 잠시 후 다시 시도해 주세요.'];
            MessageObj.createSimpleOk(dTitle, dContent, dOnclick).show();
        }

        xhr.open('POST', './place/'); // PlaceController.postIndex
        xhr.send(formData);
    };
}