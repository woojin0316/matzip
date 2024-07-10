const listAside = document.getElementById('listAside');

const loadPlaces = () => {
    const mapBounds = map.instance.getBounds();
    const swCoords = mapBounds.getSouthWest();
    const neCoords = mapBounds.getNorthEast();
    console.log(`남서 위경도 : ${swCoords.getLat()} / ${swCoords.getLng()}`);
    console.log(`북동 위경도 : ${neCoords.getLat()} / ${neCoords.getLng()}`);
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {

            return;
        }
        const placesEl = listAside.querySelector(':scope > .places');
        const placeArray = JSON.parse(xhr.responseText); // [{...}, {...}, {...}, ...]
        placesEl.innerHTML = '';
        if(placeArray.length === 0){
            placesEl.innerHTML='<li class="empty">현재 위치에 등록된 맛집이 없어요.<br><br>위치를 옮기거나 맛집을 등록해 보세요.</li>';
            return;
        }
        map.markers ??= []; // map.markers 가 undefined 인 경우를 대비하여 이 경우 빈 배열로 최초 할당
        map.markers.forEach(marker => marker.setMap(null)); // map.markers 가 가지고 있는 모든 마커에 대해 setMap(null)을 해주어 지도에서 마커 삭제
        map.markers=[]; //map.markers 를 다시 빈 배열로 할당하여 이전 마커들을 기억에서 지움
        for (const placeObject of placeArray){ // 이 for 문은 브라우저에서 등록되는 각 각의 정보들을 업데이트 및 기록해준다.
            const schedule = JSON.parse(placeObject['schedule']);
            const todaySchedule = schedule[placeObject['day']];
            const op = todaySchedule['op'];    //영업 여부 (true / false)
            const open = todaySchedule['open']; // 오픈시간 {HH:mm}
            const close = todaySchedule['close'];  //마감시간 {HH:mm}
            let opStatusText = '';
            let opDetailText = '';
            if (op === true){
                opStatusText = '영업일';
                opDetailText = `${open}`+' ~ '+`${close}`;
            }else{
                opStatusText = '휴무일';
            }

            console.log(`${op} ${open} ${close}`);
            //DOMParser() >>DOMParser()는 JavaScript 에서 사용되는 내장 객체 중 하나로, 문자열 형식의 XML 또는 HTML 을 파싱하여 DOM(Document Object Model)을 생성합니다.
            //DOMParser()와 parseFromString() 을 한 세트로 사용한다고 생각하면 된다.
            const placeEl = new DOMParser().parseFromString(`
            <li class="item">
            <img src="./place/thumbnail?index=${placeObject['index']}"
                 alt="" class="thumbnail">
            <div class="info">
                <h3 class="title">
                    <span class="title">${placeObject['title']}</span>
                    <span class="category">${placeObject['placeCategoryText']}</span>
<!--                    ^  자신있으면 카테고리 코드 말고 텍스트 띄워보기 (DTO 사용)-->
                </h3>
                <span class="op">
                <span class="status">${opStatusText}</span>
<!--              (어려움) 영업일이면 '영업일'로, 휴무일이면 '휴무일' 로 표시 -->
                <span class="detail">${opDetailText}</span>
<!--             (어려움)  영업일이면 'HH:mm ~ HH:mm'(오픈시간 ~ 마감시간)로, 휴무일이면 빈칸으로 표시   -->
            </span>
                <span class="address">${placeObject['addressPrimary']} ${placeObject['addressSecondary']}</span>
                <a  class="contact" href="tel:${placeObject['contactFirst']}-${placeObject['contactSecond']}-${placeObject['contactThird']}">${placeObject['contactFirst']}-${placeObject['contactSecond']}-${placeObject['contactThird']}</a>
                <ul class="menu">
                    <li class="item favorite">
                        <i class="icon fa-solid fa-star"></i>
                        <span class="text">${placeObject['favoriteCount']}</span>
                    </li>
                    <li class="item review">
                        <i class="icon fa-solid fa-comments"></i>
                        <span class="text">${placeObject['reviewCount']}</span>
                    </li>
                </ul>
            </div>
        </li>`, 'text/html').querySelector('li.item');
            placeEl.onclick = () => { // 좌표 클릭 시 포커징 해주는 로직
                map.instance.setCenter(new kakao.maps.LatLng(placeObject['latitude'], placeObject['longitude']));
                map.instance.setLevel(2);
                listAside.hide();
                showDetailAside(placeObject['index'], () =>listAside.show());
            }
            placesEl.append(placeEl);
            const marker = new kakao.maps.Marker({
                map: map.instance,
                position: new kakao.maps.LatLng(placeObject['latitude'], placeObject['longitude'])// 좌표 만드는 방법
            }); // 마커 만드는 방법
            map.markers.push(marker); // 우리가 만든 배열에 추가하기위한 로직
        }
    }

    xhr.open('GET', `./place/byCoords?minLat=${swCoords.getLat()}&minLng=${swCoords.getLng()}&maxLat=${neCoords.getLat()}&maxLng=${neCoords.getLng()}`); // PlaceController.getByCoords
    xhr.send(formData);
};