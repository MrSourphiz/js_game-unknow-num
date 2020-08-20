'use strict';
(function () {
  const MIN_WIDTH = 50; // минимальная ширина одной ячейки
  const MIN_QUANTITY = 9; // минимальное количество ячеек

  const TEXT_GREEN_COLOR = '#009900';
  const TEXT_RED_COLOR = '#ff0000';
  const DISABLED_BTN_COLOR = '#c0c0c0';

  let cellQuantity; // количество ячеек, записывается при генерации таблицы

  let templateCell = document.querySelector('#playing-cell').content.querySelector('.playing-ground__item');
  let fragment = document.createDocumentFragment();

  let sidebarMenu = document.querySelector('.sidebar-menu');
  let openSidebarBtn = document.querySelector('.open-btn');
  let closeSidebarBtn = document.querySelector('.close-btn');

  let complexity = document.querySelector('.complexity__list');
  let complexityOptions = complexity.querySelectorAll('option');
  let complexityButton = document.querySelector('.complexity__button');

  let stopWatchInput = document.querySelector('.stop-watch');
  let startDate;
  let clocktimer;
  let timerIsActivate = false;

  let currentNumInput = document.getElementById('current-num');
  let targetNumInput = document.getElementById('target-num');

  let wrapSection = document.querySelector('.main-wrap');

  let playingSection = document.querySelector('.playing-ground');
  let playingTable = document.querySelector('.playing-ground__list');
  let playingTableCell = playingTable.querySelectorAll('li');

  let popup = document.querySelector('.popup');
  let popupText = popup.querySelector('.popup__text');

  let generateRandomNumber = function (min, max) {
    let randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    return randomNumber;
  };

  let getUniqueArrayItems = function (arr) {
    let uniqueArr = [];

    arr.forEach(function (item, i, currentArr) {
      let copyArr = currentArr.slice();
      copyArr.splice(i, 1);

      if (copyArr.indexOf(item) === -1) {
        uniqueArr.push(item);
      }
    });

    return uniqueArr;
  };

  let getValue = function () {
    let option;
    let optionValue;
    for (let i = 0; i < complexityOptions.length; i++) {
      option = complexityOptions[i];
      if (option.selected === true) {
        optionValue = option.value;
      }
    }
    return Number(optionValue);
  };

  let getWidth = function () {
    playingTable.style.width = MIN_WIDTH * getValue() + 'px';
    playingSection.style.width = playingTable.style.width;
    wrapSection.style.width = (MIN_WIDTH * getValue()) * 2 + 'px';
  };

  let getCellQuantity = function () {
    cellQuantity = getValue() * getValue();
  };

  let getTargetNumber = function (number) {
    targetNumInput.value = number * generateRandomNumber(15, 35);
  };

  let openSidebar = function () {
    sidebarMenu.style.marginLeft = 0;
    openSidebarBtn.classList.add('visually-hidden');
  };

  let closeSidebar = function () {
    sidebarMenu.style.marginLeft = '-280px';
    openSidebarBtn.classList.remove('visually-hidden');
    complexity.classList.add('visually-hidden');
  };

  let toggleComplexity = function () {
    if (complexity.classList.contains('visually-hidden')) {
      complexity.classList.remove('visually-hidden');
    } else {
      complexity.classList.add('visually-hidden');
    }
  };

  let openPopup = function () {
    popup.style.marginRight = 0;
  };

  let closePopup = function () {
    popup.style.marginRight = '-253px';
  };

  let popupAnimation = function () {
    openPopup();
    setTimeout(closePopup, 900);
  };

  let addCellContent = function (array, maxLength, cellMarker) {
    let playingTableText = document.querySelectorAll('.playing-ground__text');
    let emptyTableText = document.querySelectorAll('.playing-ground__text:not(.pos-num)');

    for (let i = 0; i < array.length; i++) {
      let arrayElement = array[i];
      switch (true) {
        case cellMarker === 'pos-num':
          playingTableText[arrayElement].textContent = generateRandomNumber(1, maxLength);
          playingTableText[arrayElement].classList.add('pos-num');
          break;
        case cellMarker === 'neg-num':
          emptyTableText[i].textContent = generateRandomNumber(1, maxLength - 1);
          emptyTableText[i].classList.add('neg-num');
          break;
        case cellMarker === 'img-cell':
          arrayElement.classList.add('img-cell');
          arrayElement.style.backgroundImage = 'url(img/icon_' + generateRandomNumber(1, 4) + '.svg)';
          break;
      }
    }
  };

  let generatePositiveNumericCells = function (maxLength) { // генерируем массив позитивными числами
    let array = [];
    let arrOfIndex;
    let minLimit = 3;

    if (maxLength === MIN_QUANTITY) {
      minLimit = 5;
    } else if (maxLength > MIN_QUANTITY) {
      minLimit = Math.round(maxLength / 1.3);
    }

    let randomLength = generateRandomNumber(minLimit, maxLength);

    for (let i = 0; i < randomLength; i++) { // генерируем массив с индексами рандомной длины
      let arrElement = generateRandomNumber(0, maxLength - 1);
      array.push(arrElement);
    }

    arrOfIndex = getUniqueArrayItems(array); // убираем повторяющиеся значения

    addCellContent(arrOfIndex, maxLength, 'pos-num');// перебираем этот массив, в ячеку с индексом генерируем рандомное число
  };

  let generateNegativeNumericCells = function (maxLength) { // генерируем массив с негативными числами
    let emptyTableText = document.querySelectorAll('.playing-ground__text:not(.pos-num)');
    let bonusIndex = 1;

    if (maxLength === MIN_QUANTITY) {
      bonusIndex = 2;
    } else if (maxLength > MIN_QUANTITY) {
      bonusIndex = 4;
    }

    let lengthOfNegativArr = Math.round(emptyTableText.length - bonusIndex);
    let negativeArr = new Array(lengthOfNegativArr);

    addCellContent(negativeArr, maxLength, 'neg-num');// перебираем этот массив, в ячеку с индексом генерируем рандомное число
  };

  let generateBonusCells = function (maxLength) { // генерируем массив с бонусами
    let emptyCells = document.querySelectorAll('.playing-ground__text:not(.pos-num):not(.neg-num)');

    addCellContent(emptyCells, maxLength, 'img-cell');// перебираем этот массив, в ячеку с индексом генерируем рандомное число
  };

  let removeCells = function () {
    let cells = document.querySelectorAll('.playing-ground__item');
    for (let i = 0; i < cells.length; i++) {
      playingTable.removeChild(cells[i]);
    }
  };

  let executeTimer = function () {
    let thisDate = new Date();
    let time = thisDate.getTime() - startDate.getTime();

    let milisec = time % 1000;
    time -= milisec;
    milisec = Math.floor(milisec / 10);
    time = Math.floor(time / 1000);

    let seconds = time % 60;
    time -= seconds;
    time = Math.floor(time / 60);

    let minutes = time % 60;
    time -= minutes;
    time = Math.floor(time / 60);

    let hour = time % 60;

    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if (milisec < 10) {
      milisec = '0' + milisec;
    }

    stopWatchInput.value = hour + ':' + minutes + ':' + seconds + '.' + milisec;
    clocktimer = setTimeout(executeTimer, 10);
  };

  let startTime = function () {
    if (startDate === undefined) {
      startDate = new Date();
    }
    executeTimer();
    return;
  };

  let pauseTime = function () {
    clearTimeout(clocktimer);
  };

  let resetTime = function () {
    startDate = undefined;
    clearTimeout(clocktimer);
    stopWatchInput.value = '00:00:00.00';
  };

  let checkInputsEquality = function () {
    if (currentNumInput.value === targetNumInput.value) {
      pauseTime();
    }
  };

  let checkDisabledButtons = function () {
    let playingTableButton = document.querySelectorAll('.playing-ground__button');
    let disableElementCounter = 0;

    for (let i = 0; i < playingTableButton.length; i++) {
      let buttonElement = playingTableButton[i];
      if (buttonElement.disabled) {
        disableElementCounter++;
      }
    }
    if (playingTableButton.length === disableElementCounter) {
      pauseTime();
    }
  };

  let fillNumberCells = function (cellClass, textContent) {
    switch (true) {
      case cellClass === 'pos-num':
        popupText.textContent = '+ ' + textContent;
        popupText.style.color = TEXT_GREEN_COLOR;
        break;
      case cellClass === 'neg-num':
        popupText.textContent = '- ' + textContent;
        popupText.style.color = TEXT_RED_COLOR;
        break;
    }
  };

  let fillBonusCells = function (styleString) {
    switch (true) {
      case styleString === 'url("img/icon_1.svg")':
        currentNumInput.value = 0;
        popupText.style.color = 'black';
        popupText.textContent = 'кхе-кхе, произошло обнуление';
        break;
      case styleString === 'url("img/icon_2.svg")':
        currentNumInput.value = Number(currentNumInput.value) + 50;
        popupText.style.color = 'black';
        popupText.textContent = 'Только тсс. + 50';
        checkInputsEquality();
        break;
      case styleString === 'url("img/icon_3.svg")':
        currentNumInput.value = targetNumInput.value;
        popupText.style.color = 'black';
        popupText.textContent = 'Да вы знаете, КТО я?';
        checkInputsEquality();
        break;
      case styleString === 'url("img/icon_4.svg")':
        currentNumInput.value = Number(currentNumInput.value) + 150;
        popupText.style.color = 'black';
        popupText.textContent = 'Кто рано встает, тому бог подает! + 150';
        checkInputsEquality();
        break;
    }
  };

  let addContentEvents = function (array) {
    for (let j = 0; j < array.length; j++) {
      let cellListElement = array[j];
      let cellButton = cellListElement.children[0];
      let cellText = cellButton.children[0];
      let cellTextContent = Number(cellText.textContent);

      cellButton.addEventListener('click', function () {
        popupAnimation();

        if (!timerIsActivate) {
          timerIsActivate = !timerIsActivate;
          startTime();
        }

        switch (true) {
          case cellText.classList.contains('pos-num'):
            cellText.classList.remove('visually-hidden');
            currentNumInput.value = Number(currentNumInput.value) + cellTextContent;
            fillNumberCells('pos-num', cellTextContent);
            cellButton.setAttribute('disabled', 'disabled');
            cellButton.style.backgroundColor = DISABLED_BTN_COLOR;
            checkInputsEquality();
            checkDisabledButtons();
            break;
          case cellText.classList.contains('neg-num'):
            cellText.classList.remove('visually-hidden');
            currentNumInput.value = Number(currentNumInput.value) - cellTextContent;
            fillNumberCells('neg-num', cellTextContent);
            cellButton.setAttribute('disabled', 'disabled');
            cellButton.style.backgroundColor = DISABLED_BTN_COLOR;
            checkInputsEquality();
            checkDisabledButtons();
            break;
          case cellText.classList.contains('img-cell'):
            cellText.style.display = 'block';
            fillBonusCells(cellText.style.backgroundImage);
            cellText.classList.remove('visually-hidden');
            cellButton.setAttribute('disabled', 'disabled');
            cellButton.style.backgroundColor = DISABLED_BTN_COLOR;
            checkDisabledButtons();
            break;
        }
      });
    }
  };

  let getListContent = function () {
    let cellList = [];

    for (let i = playingTableCell.length; i < cellQuantity; i++) {
      let cellElement = templateCell.cloneNode(true);
      fragment.appendChild(cellElement);

      cellList.push(cellElement);
    }

    playingTable.appendChild(fragment);

    generatePositiveNumericCells(cellQuantity);
    generateNegativeNumericCells(cellQuantity);
    generateBonusCells(cellQuantity);
    getTargetNumber(cellQuantity);
    addContentEvents(cellList);
  };

  let createTable = function () {
    getValue();
    getWidth();
    getCellQuantity();
    removeCells();
    getListContent();
    resetTime();
    closeSidebar();
    currentNumInput.value = 0;
    popupText.textContent = '';
    popup.classList.add('popup__close');
    timerIsActivate = false;
  };

  createTable();

  complexity.addEventListener('change', createTable);
  openSidebarBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  complexityButton.addEventListener('click', toggleComplexity);
})();
