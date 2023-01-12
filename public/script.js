'use strict';

let cardContainer = document.querySelector('.cards');
let cardArray = Array.from(document.querySelectorAll('.card'));
let backButton = document.getElementById("back-button");
let modalContainer = document.getElementById('modal-container');
let wordsNav = document.getElementById("words-nav");
let uploadNav = document.getElementById("upload-nav");
let uploadContainer = document.querySelector(".upload-container");
let inputField = document.getElementById("input-field");
let successMessage = document.getElementById("success-message");
let submitFileButton = document.getElementById("submit-file-button");
let notebook = document.querySelector(".notebook-content");
let sheetContainer = document.querySelector(".sheet-container");
let counter = document.getElementById('counter');
let allData, data, sheets, currentSheet;
let headers, frontHeaders, backHeaders;
let hist = [];
let hist_index = 0;
let count = 0;
let updated = false;

document.addEventListener("keydown", function (event) {
  if (event.key == "ArrowRight") nextCard();
  else if (event.key == "ArrowLeft") prevCard();
  else if (event.key == "ArrowDown" || event.key == "ArrowUp") rotateCard(cardArray[0]);
});

function toggleWordsNav() {
  wordsNav.classList.add("selected");
  uploadNav.classList.remove("selected");

  successMessage.classList.add("hidden");
  uploadContainer.classList.add("hidden");
  notebook.classList.remove("hidden");
  sheetContainer.classList.remove("hidden");
}

function toggleUploadNav() {
  wordsNav.classList.remove("selected");
  uploadNav.classList.add("selected");

  uploadContainer.classList.remove("hidden");
  notebook.classList.add("hidden");
  sheetContainer.classList.add("hidden");
}

wordsNav.onclick = function() {
  if(updated) init();
  updated = false;
  toggleWordsNav();
}
uploadNav.onclick = toggleUploadNav;

function getData() {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    }

    try {
      const responseHeader = await fetch("/api-headers", options)
      const header = await responseHeader.json();
  
      const responseResult = await fetch("/api", options);
      const result = await responseResult.json();
  
      resolve({ result: result, header: header });
    } catch (error) {
      
      let options = newEl({ type: "div", className: "options" });
      options.textContent = "Something went wrong. The source file could not be read. Try uploading another file.";
      options.style.background = "rgba(255, 210, 210)";
      notebook.appendChild(options);

      reject(error);
    }

  });
}

function changeData() {
  data = allData[currentSheet];
  initNotebook();
  initCards();
}

function clearStorage() {
  cardContainer.innerHTML = "";
  cardArray = [];
  hist = [];
  hist_index = 0;
}

function initSheets() {

  sheetContainer.innerHTML = "";

  for (const sheet in allData) {
    let sheetSelector = document.createElement("div");
    sheetSelector.classList.add("sheet-selector");
    sheetSelector.textContent = sheet;

    sheetSelector.onclick = function () {
      let allSheets = sheetContainer.querySelectorAll(".sheet-selector");
      for (let el of allSheets) {
        el.classList.remove("selected");
      }
      sheetSelector.classList.add("selected");
      currentSheet = sheet;
      changeData();
    };

    sheetContainer.appendChild(sheetSelector);
  }
}

function initNotebook() {

  notebook.innerHTML = "";

  if (data.length == 0) {
    let options = newEl({ type: "div", className: "options" });
    options.textContent = "This sheet is empty. Enter more content so that it can be displayed.";
    options.style.background = "rgba(255, 210, 210)";
    notebook.appendChild(options);
    return;
  }

  let options = newEl({ type: "div", className: "options" });
  let instructions = newEl({ type: "div", className: "instructions" });
  let selectFront = newEl({ type: "div", className: "option", id: "selectFront", textContent: "Front of card:" });
  let selectBack = newEl({ type: "div", className: "option", id: "selectBack", textContent: "Back of card:" });

  instructions.textContent = "Select which columns should appear at the front/back of the cards.";
  options.appendChild(instructions);
  options.appendChild(selectFront);
  options.appendChild(selectBack);
  notebook.appendChild(options);

  for (const position of [
    {selector: selectFront, header: frontHeaders[currentSheet]},
    {selector: selectBack, header: backHeaders[currentSheet]}
  ]){
    for (const headerName of headers[currentSheet]) {
      let container = newEl({ type: "div", className: "checkbox-container", id: headerName });
      let label = newEl({ type: "label" });
      let input = newEl({ type: "input" });
      let span = newEl({ type: "span" });
      input.type = "checkbox";
      span.textContent = headerName;

      if(position.header.includes(headerName)) input.checked = "checked";
      input.onclick = function(){
        if(input.checked) position.header.push(headerName);
        else removeItemFromArray(position.header, headerName);
        initCards();
      }

      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
      position.selector.append(container);
    }
  }

  for (const content of data) {

    let newItem = newEl({ type: "div", className: "item" });

    for (const key in content) {
      let subItem = newEl({ type: "div", className: "subitem" });
      let subItemLabel = newEl({ type: "div", className: "subitem-label", textContent: key });
      let subItemContent = newEl({ type: "div", className: "subitem-content", textContent: content[key] });

      subItem.appendChild(subItemLabel);
      subItem.appendChild(subItemContent);
      newItem.appendChild(subItem);
    }

    let counter = newEl({ type: "div", className: "counter" });
    newItem.appendChild(counter);
    notebook.appendChild(newItem);
  }

}

function initButtons() {
  document.getElementById('back-button').onclick = prevCard;
  document.getElementById('rotate-button').onclick = function () { rotateCard(cardArray[0]) };
  document.getElementById('next-button').onclick = nextCard;
  document.getElementById('notebook-button').onclick = function () { modalContainer.classList.remove("hidden") };
  document.getElementById('close-modal-button').onclick = function () {
    successMessage.classList.add("hidden"); 
    modalContainer.classList.add("hidden");
    if(updated) init();
    updated = false; 
  };
  submitFileButton.onclick = function () {
    document.forms["upload-file"].submit();
    inputField.value = "";
    successMessage.classList.remove("hidden");
    submitFileButton.disabled = true;
    updated = true;
  }
  inputField.oninput = function () {
    submitFileButton.disabled = false;
  }
}

function initCards() {
  clearStorage();
  backButton.disabled = true;
  for (let i = 0; i < Math.min(data.length, 5); i++) {
    addCardtoDeck(cardContainer);
  }
  setCards();
  detectTouch();
}

function addCardtoDeck() {
  let newCard = newEl({ type: "div", className: "card" });
  let innerCard = newEl({ type: "div", className: "card--inner" });
  let cardFront = newEl({ type: "div", className: "card--front" });
  let cardBack = newEl({ type: "div", className: "card--back" });

  cardContainer.append(newCard);
  newCard.append(innerCard);
  innerCard.append(cardFront);
  innerCard.append(cardBack);
  cardArray.push(newCard);
  addCardContent(newCard);
}

function addCardContent(card, index) {

  const newValue = index ? false : true;
  index = index ?? Math.floor(Math.random() * data.length);
  if (data.length > 5) {
    while (hist.slice((-1) * Math.min(hist.length, 5)).includes(index)) {
      index = Math.floor(Math.random() * data.length);
    }
  }
  else if (data.length > 1 && hist.length > 0) {
    while (index == hist[hist.length - 1]) {
      index = Math.floor(Math.random() * data.length);
    }
  }

  let cardFront = card.querySelector(".card--front");
  let cardBack = card.querySelector(".card--back");
  cardFront.innerHTML = "";
  cardBack.innerHTML = "";

  let content = data[index];

  let frontAttributes = {length: 0, subItemCount: 0};
  let backAttributes = {length: 0, subItemCount: 0};
  let iterator = [
    {cardSide: cardFront, header: frontHeaders[currentSheet], attributes: frontAttributes},
    {cardSide: cardBack, header: backHeaders[currentSheet], attributes: backAttributes}
  ]

    for (const position of iterator){
      let columnCount = 0;
      for(const key in content){
        if(position.header.includes(key)){

          columnCount++;
          let subItem = newEl({ type: "div", className: "subitem" });
          let subItemLabel = newEl({ type: "div", className: "subitem-label", textContent: key });
          let subItemContent = newEl({ type: "div", className: "subitem-content", textContent: content[key] });
    
          if(position.header.length > 1) subItem.appendChild(subItemLabel);
          subItem.appendChild(subItemContent);
          position.cardSide.appendChild(subItem);

          position.attributes.length += content[key].length;
          position.attributes.subItemCount++;
        }
      }

      let sizeModifier = columnCount >= 3 ? columnCount * 10 : 0;
      position.cardSide.style.fontSize = setFontSize(position.attributes.length + sizeModifier) + "px";
      if (position.attributes.subItemCount > 1) position.cardSide.classList.add("multiple");
      else position.cardSide.classList.remove("multiple");
    }

  if (newValue) hist.push(index);
}

function setCards() {
  for (let index = 0; index < cardArray.length; index++) {
    let card = cardArray[index];
    card.style.zIndex = cardArray.length - index;
    card.style.opacity = index < 5 ? Math.min(1, 1 - (index - 1) / 5) : 0;
    card.style.transform = 'scale(' + Math.max(0.75, 1 - 0.05 * index) + ') translateY(-' + Math.min(120, 25 * index) + 'px)';
  }
}

function nextCard() {
  if (cardArray.length == 0) return;
  let moveOutWidth = document.body.clientWidth;
  let firstCard = cardArray[0];
  firstCard.style.transform = 'translate(' + Math.min(400, moveOutWidth * 0.5) + 'px, -100px) rotate(30deg)';
  if (firstCard.classList.contains("rotated")) firstCard.classList.remove("rotated");
  shiftCards();
  setTimeout(setCards, 100);
}

function prevCard() {
  if (cardArray.length == 0) return;
  let moveOutWidth = document.body.clientWidth;
  if (hist_index > 0) {
    let prevCard = cardArray[cardArray.length - 1]
    prevCard.style.transform = 'translate(-' + Math.min(400, moveOutWidth) + 'px)';
    retrieveCards();
  }
  else {
    let firstCard = cardArray[0];
    firstCard.style.transform = 'translate(' + -Math.min(100, moveOutWidth * 0.5) + 'px, 0)';
  }

  setTimeout(setCards, 100);
}

function rotateCard(el) {
  if (cardArray.length == 0) return;
  if (el.classList.contains("rotated")) el.classList.remove("rotated");
  else el.classList.add("rotated");
}

function shiftCards() {
  backButton.disabled = false;
  hist_index++;
  counter.textContent = ++count;
  let theCard = cardArray.shift();
  cardArray.push(theCard);

  if (hist_index + 5 < hist.length) addCardContent(theCard, hist[hist_index]);
  else addCardContent(theCard);
}

function retrieveCards() {
  backButton.disabled = hist_index <= 1 ? true : false;
  hist_index--;
  counter.textContent = --count;
  let theCard = cardArray.pop();
  cardArray.unshift(theCard);
  addCardContent(theCard, hist[hist_index])
}

function detectTouch() {
  cardArray.forEach(function (el) {

    let hammertime = new Hammer(el);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    hammertime.on('tap', function () {
      if (el == cardArray[0]) rotateCard(el);
    });

    hammertime.on('pan', function (event) {

      if (el != cardArray[0]) return;
      el.classList.add('moving');
      if (event.deltaX === 0) return;
      if (event.center.x === 0 && event.center.y === 0) return;

      let xMulti = event.deltaX * 0.03;
      let yMulti = event.deltaY / 80;
      let rotate = xMulti * -yMulti;

      el.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';

    });

    hammertime.on('panend', function (event) {

      if (el != cardArray[0]) return;
      el.classList.remove('moving');

      let moveOutWidth = document.body.clientWidth;
      let keep = Math.abs(event.velocityX) < 0.1;

      if (keep) el.style.transform = '';
      else {
        let endX = Math.abs(event.velocityX) * 0.5 * moveOutWidth;
        let toX = event.deltaX > 0 ? endX : -endX;
        let endY = Math.abs(event.velocityY) * 0.5 * moveOutWidth;
        let toY = event.deltaY > 0 ? endY : -endY;
        let xMulti = event.deltaX * 0.03;
        let yMulti = event.deltaY / 80;
        let rotate = xMulti * yMulti;

        el.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
        if (el.classList.contains("rotated")) el.classList.remove("rotated");

        shiftCards();
        setCards();
      }
    });
  });
}


async function init() {

  let response;

  try{
    response = await getData();
  } catch(error) {
    console.log(error);
    return;
  }

  headers = response.header;
  frontHeaders = Object.assign({}, headers);
  backHeaders = Object.assign({}, headers);

  allData = response.result;
  currentSheet = Object.keys(allData)[0];
  data = allData[currentSheet];

  for(let sheet in headers){
    let headerArray = headers[sheet];
    frontHeaders[sheet] = [headerArray[0]];
    backHeaders[sheet] = headerArray.slice(1);
  }

  initSheets();
  initNotebook();
  initCards();
  initButtons();

  sheetContainer.querySelector(".sheet-selector").classList.add("selected");
}

init();

