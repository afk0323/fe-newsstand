import { HEADER_CLASS, PATH, TITLE, STYLE } from '../constants/press-header.js';
import { STATE, LIST, PAGE, ARROW } from '../constants/press-data.js';
import { subscribeEvent } from './press-header.js';
import { getSliceIds } from '../utils/shuffle.js';
import { getSnackBar } from '../utils/snack-bar.js';

/**
 * 언론사 그리드의 INIT
 */
const initPressGrid = (pressData, pressList) => {
  setGrid();
  setGridFrame();
  setGridArrow(pressData, pressList);
  setGridLogo(pressData, pressList);
  setGridButton(pressData, pressList);
  changeIcon();
};

/**
 * 언론사 그리드의 설정
 */
const setGrid = () => {
  const gridWrapper = document.querySelector('.press__wrapper-grid');
  const gridElement = `
    <ul class='press-logo__wrapper-grid'></ul>
    <img class='arrows-logo__img-left none' src='./assets/icons/chevron-left.svg'></img>
    <img class='arrows-logo__img-right' src='./assets/icons/chevron-right.svg'></img>
  `;
  gridWrapper.innerHTML = gridElement;
};

const setGridFrame = () => {
  const pressWrapper = document.querySelector(`.press-logo__wrapper-grid`);
  const initFrame = Array.from({ length: 24 }, (_, idx) => idx);
  initFrame.sort((a, b) => b - a);

  initFrame.forEach((frame) => {
    const pressElement = `
      <li class='press-logo__li'>
        <img class='img${frame}' src=''></img>
        <button class="press-logo__li-button none">
          <img class="press-logo__li-img" src='./assets/icons/button-plus.svg' />
          <p class="press-logo__li-p">구독하기</p>
        </button>
      </li>
    `;
    pressWrapper.insertAdjacentHTML('afterbegin', pressElement);
  });
};

/**
 * 언론사 그리드의 화살표
 */
const setGridArrow = (pressData, pressIds) => {
  const arrowLeft = document.querySelector(`.arrows-logo__img-left`);
  const arrowRight = document.querySelector(`.arrows-logo__img-right`);
  const arrowNumber = Math.ceil(pressIds.length / 24);
  if (!(arrowNumber > 1)) arrowRight.classList.add('none');

  setGridArrowEvent(pressData, pressIds, arrowLeft, -1);
  setGridArrowEvent(pressData, pressIds, arrowRight, +1);
};

const setGridArrowEvent = (pressData, pressIds, arrowDirect, direction) => {
  arrowDirect.addEventListener('click', () => {
    PAGE.GRID += direction;

    setGridLogo(pressData, pressIds);
    setGridArrowNone(pressIds);
  });
};

const setGridArrowNone = (pressIds) => {
  const arrowLeft = document.querySelector(`.arrows-logo__img-left`);
  const arrowRight = document.querySelector(`.arrows-logo__img-right`);
  const arrowNumber = Math.ceil(pressIds.length / 24);

  const showLeftArrow = PAGE.GRID > 0;
  const showRightArrow = PAGE.GRID < ARROW.THRESHOLD;

  arrowLeft.classList.toggle('none', !(arrowNumber > 1) || !showLeftArrow);
  arrowRight.classList.toggle('none', !(arrowNumber > 1) || !showRightArrow);
};

/**
 * 언론사 그리드의 로고
 */
const setGridLogo = (pressData, pressIds) => {
  const sliceIds = getSliceIds(pressIds, PAGE.GRID, 24);
  getGridLogo(pressData, sliceIds);
};

const getGridLogo = (pressData, sliceIds) => {
  sliceIds.forEach((sliceId, idx) => {
    const selectPress = pressData.find((data) => data.id === sliceId);
    const logoWapper = document.querySelector(`.img${idx}`);
    logoWapper.setAttribute('pressid', sliceId); // 속성 넣어주기

    let mode = localStorage.getItem('mode');
    if (mode === 'light') logoWapper.src = selectPress.lightSrc;
    if (mode === 'dark') logoWapper.src = selectPress.darkSrc;
  });
};

/**
 * 언론사 그리드의 라이트/다크모드
 */
const toggleMode = () => {
  const pressLogos = document.querySelectorAll(`.press-logo__wrapper-grid img`);
  pressLogos.forEach((logo) => changeSrc(logo));
};

const changeIcon = () => {
  const modeImg = document.querySelector('.mode__img');
  modeImg.addEventListener('click', () => toggleMode());
};

const changeSrc = (logo) => {
  const isLightMode = logo.src.includes('light-press-logo');
  const isDarkMode = logo.src.includes('dark-press-logo');

  if (isLightMode || isDarkMode) {
    const newLogoSrc = isLightMode
      ? logo.src.replace('light-press-logo', 'dark-press-logo')
      : logo.src.replace('dark-press-logo', 'light-press-logo');

    logo.src = newLogoSrc;
  }
};

/**
 * 언론사 그리드의 구독하기 버튼
 */
const setGridButton = (pressData, pressIds) => {
  const pressLis = document.querySelectorAll(`.press-logo__li`);
  const pressIdsLen = pressIds.length;
  const slicePressLis = [];
  pressLis.forEach((li, idx) => (idx < pressIdsLen ? slicePressLis.push(li) : ''));
  slicePressLis.forEach((li) => {
    const isSubscribe = getSubscribeState(li);
    setGridButtonChange(isSubscribe, li);
    setGridButtonEvent(li);
    setGridButtonClick(pressData, pressIds, li);
  });
};

const getSubscribeState = (li) => {
  const pressImg = li.querySelector('img');
  const pressId = Number(pressImg.getAttribute('pressid'));
  const pressSub = LIST.SUBSCRIBE.includes(pressId);
  return pressSub;
};

const setGridButtonChange = (isSubscribe, li) => {
  const buttonImg = li.querySelector(`.press-logo__li-img`);
  const buttonP = li.querySelector(`.press-logo__li-p`);

  const newButtonSrc = isSubscribe ? buttonImg.src.replace('plus', 'closed') : buttonImg.src.replace('closed', 'plus');
  const newButtonP = isSubscribe ? '해지하기' : '구독하기';

  buttonImg.src = newButtonSrc;
  buttonP.innerText = newButtonP;
};

const setGridButtonEvent = (li) => {
  const pressImg = li.querySelector('img');
  const pressButton = li.querySelector('button');

  li.addEventListener('mouseover', () => {
    pressImg.classList.add('none');
    pressButton.classList.remove('none');
    li.classList.add(`press-logo__li-hover`);
  });

  li.addEventListener('mouseout', () => {
    pressImg.classList.remove('none');
    pressButton.classList.add('none');
    li.classList.remove(`press-logo__li-hover`);
  });
};

const setGridButtonClick = (pressData, pressIds, li) => {
  li.addEventListener('click', () => {
    const pressImg = li.querySelector('img');
    const pressId = Number(pressImg.getAttribute('pressid'));
    const isSubscribe = LIST.SUBSCRIBE.includes(pressId);
    isSubscribe ? (LIST.SUBSCRIBE = LIST.SUBSCRIBE.filter((id) => id !== pressId)) : LIST.SUBSCRIBE.push(pressId);
    setGridButtonChange(!isSubscribe, li);

    if (isSubscribe) {
      //취소
      if (pressIds.length < 96) initPressGrid(pressData, LIST.SUBSCRIBE);
    }
    if (!isSubscribe) {
      //구독
      getSnackBar();
      const snackBar = document.querySelector('.snack-bar');
      snackBar.classList.remove('hidden');

      setTimeout(() => {
        snackBar.classList.add('hidden');
        const h2Entire = document.querySelector(`.${HEADER_CLASS.H2_ENTIRE}`);
        const h2Subscribe = document.querySelector(`.${HEADER_CLASS.H2_SUBSCRIBE}`);
        const imgList = document.querySelector(`.${HEADER_CLASS.IMG_LIST}`);
        const imgGrid = document.querySelector(`.${HEADER_CLASS.IMG_GRID}`);
        const gridWrapper = document.querySelector(`.${HEADER_CLASS.WRAPPER_GRID}`);
        const listWrapper = document.querySelector(`.${HEADER_CLASS.WRAPPER_LIST}`);

        subscribeEvent(pressData, h2Entire, h2Subscribe, imgList, imgGrid, gridWrapper, listWrapper);
      }, 5000);
    }
  });
};

export { initPressGrid };
