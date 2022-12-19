'use strict';

var cardContainer = document.querySelector('.cards');
var cardArray = Array.from(document.querySelectorAll('.card'));
var backButton = document.getElementById('back-button');
var rotateButton = document.getElementById('rotate-button');
var nextButton = document.getElementById('next-button');
var notebookButton = document.getElementById('notebook-button');
var closeModalButton = document.getElementById('close-modal-button');
var modalContainer = document.getElementById('modal-container');
var sheetContainer = document.querySelector(".sheet-container");
var counter = document.getElementById('counter');
var trash = document.getElementById("trash")
var trashCoords = trash.getBoundingClientRect();
var allData, currentKey, data;
var hist = [];
var hist_index = 0;
var count = 0;

document.addEventListener("keydown", function (event) {
  if (event.key == "ArrowRight") nextCard();
  else if (event.key == "ArrowLeft") prevCard();
  else if (event.key == "ArrowDown" || event.key == "ArrowUp") rotateCard(cardArray[0]);
});

window.addEventListener("resize", function () {
  trashCoords = trash.getBoundingClientRect();
})

notebookButton.onclick = function () { modalContainer.classList.remove("hidden") };
closeModalButton.onclick = function () { modalContainer.classList.add("hidden") };

function getData() {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    }
    const response = await fetch("/api", options);
    const json = await response.json();
    resolve(json);
  });
}

function changeData() {
  data = allData[currentKey];
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

  for (const key in allData) {
    let sheet = document.createElement("div");
    sheet.classList.add("sheet");
    sheet.textContent = key;

    sheet.onclick = function () {
      var allSheets = sheetContainer.querySelectorAll(".sheet");
      for(let el of allSheets){
        el.classList.remove("selected");
      }
      sheet.classList.add("selected");
      currentKey = key;
      changeData();
    };

    sheetContainer.appendChild(sheet);
  }
}

function initNotebook() {

  var notebook = document.querySelector(".notebook-content");
  notebook.innerHTML = "";

  var options = document.createElement("div");
  options.classList.add("options");
  var selectFront = document.createElement("div");
  selectFront.classList.add("option");
  selectFront.id = "selectFront";
  selectFront.textContent = "Front of card:"

  var selectHidden = document.createElement("div");
  selectHidden.classList.add("option");
  selectHidden.id = "selectHidden";
  selectHidden.textContent = "Back of card:"

  options.appendChild(selectFront);
  options.appendChild(selectHidden);
  notebook.appendChild(options);

//   <label class="radio-container">
//   <p>Uniform color</p>
//   <input type="radio" name="radio">
//   <span class="checkmark"></span>
// </label>
// <label class="radio-container">
//   <p>Color by angle</p>
//   <input type="radio" checked="checked" name="radio">
//   <span class="checkmark"></span>
// </label>
// <label class="radio-container">
//   <p>Color by speed</p>
//   <input type="radio" name="radio">
//   <span class="checkmark"></span>
// </label>

  for (const content of data) {
    var newItem = document.createElement("div");
    newItem.classList.add("item");

    for (const key in content) {
      var subItem = document.createElement("div");
      subItem.classList.add("subitem");

      var subItemLabel = document.createElement("div");
      subItemLabel.classList.add("subitem-label");
      subItemLabel.textContent = key;

      var subItemContent = document.createElement("div");
      subItemContent.classList.add("subitem-content");
      subItemContent.textContent = content[key];


      subItem.appendChild(subItemLabel);
      subItem.appendChild(subItemContent);
      newItem.appendChild(subItem);
    }

    var counter = document.createElement("div");
    counter.classList.add("counter");
    newItem.appendChild(counter);
    notebook.appendChild(newItem);
  }

}

function initCards() {
  clearStorage();
  backButton.disabled = true;
  for (var i = 0; i < Math.min(data.length, 5); i++) {
    addCardtoDeck(cardContainer);
  }
  setCards();
  detectTouch();
}

function addCardtoDeck() {
  var newCard = document.createElement("div");
  newCard.className = "card";

  var innerCard = document.createElement("div");
  innerCard.className = "card--inner";

  var cardFront = document.createElement("div");
  cardFront.className = "card--front";

  var cardBack = document.createElement("div");
  cardBack.className = "card--back";

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
      ;
      index = Math.floor(Math.random() * data.length);
    }
  }

  var cardFront = card.querySelector(".card--front");
  var cardBack = card.querySelector(".card--back");
  cardFront.innerHTML = "";
  cardBack.innerHTML = "";

  var content = data[index];
  var frontString = content["Meaning"] ?? "";
  var backString = "";
  var subitemCount = 0;

  for (const key in content) {
    if (!["Meaning", "Date", ""].includes(key)){

      var subItem = document.createElement("div");
      subItem.classList.add("subitem");

      var subItemLabel = document.createElement("div");
      subItemLabel.classList.add("subitem-label");
      subItemLabel.textContent = key;

      var subItemContent = document.createElement("div");
      subItemContent.classList.add("subitem-content");
      subItemContent.textContent = content[key];

      subItem.appendChild(subItemLabel);
      subItem.appendChild(subItemContent);
      cardBack.appendChild(subItem);

      backString += key + content[key];
      subitemCount++;
    }
  }

  cardFront.textContent = frontString;

  if(frontString.length > 80){
    cardFront.classList.add("very-long-text");
  }
  else if(frontString.length > 50){
    console.log(frontString.length);
    cardFront.classList.add("long-text");
  }
  else{
    cardFront.classList.remove("long-text", "very-long-text");
  }

  if(backString.length > 80){
    cardBack.classList.add("very-long-text");
  }
  else if(backString.length > 40){
    cardBack.classList.add("long-text");
  }
  else{
    cardBack.classList.remove("long-text", "very-long-text");
  }

  if(subitemCount > 1) cardBack.classList.add("multiple");
  else cardBack.classList.remove("multiple");
  if (newValue) hist.push(index);
}

function setCards() {
  for (var index = 0; index < cardArray.length; index++) {
    var card = cardArray[index];
    card.style.zIndex = cardArray.length - index;
    card.style.opacity = index < 5 ? Math.min(1, 1 - (index - 1) / 5) : 0;
    card.style.transform = 'scale(' + Math.max(0.75, 1 - 0.05 * index) + ') translateY(-' + Math.min(120, 25 * index) + 'px)';
  }
}

function nextCard() {
  if (cardArray.length == 0) return;
  var moveOutWidth = document.body.clientWidth;
  var firstCard = cardArray[0];
  firstCard.style.transform = 'translate(' + Math.min(400, moveOutWidth * 0.5) + 'px, -100px) rotate(30deg)';
  if (firstCard.classList.contains("rotated")) firstCard.classList.remove("rotated");
  shiftCards();
  setTimeout(setCards, 100);
}

function prevCard() {
  if (cardArray.length == 0) return;
  var moveOutWidth = document.body.clientWidth;
  if (hist_index > 0) {
    var prevCard = cardArray[cardArray.length - 1]
    prevCard.style.transform = 'translate(-' + Math.min(400, moveOutWidth) + 'px)';
    retrieveCards();
  }
  else {
    var firstCard = cardArray[0];
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
  var theCard = cardArray.shift();
  cardArray.push(theCard);

  if (hist_index + 5 < hist.length) addCardContent(theCard, hist[hist_index]);
  else addCardContent(theCard);
}

function retrieveCards() {
  backButton.disabled = hist_index <= 1 ? true : false;
  hist_index--;
  counter.textContent = --count;
  var theCard = cardArray.pop();
  cardArray.unshift(theCard);
  addCardContent(theCard, hist[hist_index])
}

function detectTouch() {
  cardArray.forEach(function (el) {

    var hammertime = new Hammer(el);
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    hammertime.on('tap', function () {
      if (el == cardArray[0]) rotateCard(el);
    });

    hammertime.on('pan', function (event) {

      if (el != cardArray[0]) return;
      el.classList.add('moving');
      if (event.deltaX === 0) return;
      if (event.center.x === 0 && event.center.y === 0) return;

      var xMulti = event.deltaX * 0.03;
      var yMulti = event.deltaY / 80;
      var rotate = xMulti * -yMulti;

      el.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
      updateCardEffects(event);

    });

    hammertime.on('panend', function (event) {

      if (el != cardArray[0]) return;
      el.classList.remove('moving');
      resetCardEffects();

      var moveOutWidth = document.body.clientWidth;
      var keep = Math.abs(event.velocityX) < 0.1;

      if (keep) el.style.transform = '';
      else {
        var endX = Math.abs(event.velocityX) * 0.5 * moveOutWidth;
        var toX = event.deltaX > 0 ? endX : -endX;
        var endY = Math.abs(event.velocityY) * 0.5 * moveOutWidth;
        var toY = event.deltaY > 0 ? endY : -endY;
        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;

        el.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
        if (el.classList.contains("rotated")) el.classList.remove("rotated");

        shiftCards();
        setCards();
      }
    });
  });
}

function updateCardEffects(event) {
  var trashDistance = Math.hypot((event.center.x - (trashCoords.x + trashCoords.width / 2)), (event.center.y - (trashCoords.y + trashCoords.height / 2)));
  cardArray[0].style.opacity = cardOpacity(trashDistance);
  if (trashDistance < 100) trash.classList.remove("faded");
  else trash.classList.add("faded");
}

function resetCardEffects() {
  cardArray[0].style.opacity = 1;
  trash.classList.add("faded");
}

async function init() {
  allData = await getData();
  data = allData[Object.keys(allData)[0]];
  initSheets();
  initNotebook();
  initCards();

  sheetContainer.querySelector(".sheet").classList.add("selected");
  backButton.onclick = prevCard;
  rotateButton.onclick = function () { rotateCard(cardArray[0]) };
  nextButton.onclick = nextCard;

}

init();












// function makeCardInteractive(card) {
//   card.addEventListener('mousemove', event => {
//     const rect = card.getBoundingClientRect();
//     const x = event.clientX - rect.left - rect.width / 2;
//     const y = event.clientY - rect.top - rect.height / 2;
//     const rotateX = y / rect.height * 10;
//     const rotateY = -x / rect.width * 10;
//     const perspective = `${rect.width}px`; // added perspective value
//     card.style.transform = `perspective(${perspective}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
//   });
//   card.addEventListener('mouseleave', () => {
//     card.style.transform = 'none';
//     setCards();
//   });
// }

