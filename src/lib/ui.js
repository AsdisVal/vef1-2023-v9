import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    {},
    el('input', { value: query ?? '', name: 'query' }),
    el('button', {}, 'Leita')
  );

  form.addEventListener('submit', searchHandler);

  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  // Þegar við förum inní loadingstate ætlum við að finna loading state element. 
    let loadingElement = parentElement.querySelector('.loading');

    // Sem er að segja okkur að við erum að sækja þessi gögn
    // Ef það finnst ekki, ætlum við að búa það til 
  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    // og bætum því við parentelementið okkar
    parentElement.appendChild(loadingElement);
  }

  // ef það er ekkert form, þá bara hættum við. 
  if (!searchForm) {
    return;
  }

  // annars ætlum við að finna takkan
  const button = searchForm.querySelector('button');
  // og gera hann disabled
  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  // þegar við erum hætt að leita, þá bökkum við og finnum loading elementið
  const loadingElement = parentElement.querySelector('.loading');

  // ef við finnum það þá fjarlægjum við það
  if (loadingElement) {
    loadingElement.remove();
  }

  // ef það er ekki form, þá hættum við(ég) við
  if (!searchForm) {
    return;
  }


  // ef það er form, ætlum við að finna takkan sem er disabled, og fjarlægja attributið disabled 
  // af honum
  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', { class: 'results' });

  if (!results) {
    const noResultsElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultsElement);
    return list;
  }

  if (results.length === 0) {
    const noResultsElement = el(
      'div',
      {},
      `Engar niðurstöður fyrir leit að ${query} 😢`
    );
    list.appendChild(noResultsElement);
    return list;
  }

  

   const headerElement = el(
    'div',
      {class: 'results'},
      el('h2', {class: 'result_title'}, `Leitarniðurstöður fyrir ,,${query}"`
      ),
   );

   list.appendChild(headerElement);

  for (const result of results) {
    const resultElement = el(
      'div',
      {class: 'result'},
      el('p', { class: 'result__id'}, el('a', {href: `/?id=${result.id}`}, result.name)),
      el('p', { class: 'result__status'}, `🚀 ${result.status.name}`),
      el('p', {class: 'result__mission'}, el('span', { class: 'geimferd'}, 'Geimferð:'), ` ${result.mission}`),
      
      // 'li',
      // { class: 'result' },
      // el('span', { class: 'name' }, result.name),
      // el('span', { class: 'mission' }, result.mission)
    );

    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  // Núna ætlum við að finna main elementið, af því við erum hér buin að búa það til
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  // Fjarlægja fyrri niðurstöður.
  // Erum búin að búa það til með results klasanum, ef results finnst þá fjarlægjum við hann
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    // remove fjarlægir results nóðuna úr DOMinu
    resultsElement.remove();
  }

  // setLoading endurspeglar að við séum að leita
  setLoading(mainElement, searchForm) 
  const results = await searchLaunches(query);
  // setLoading endurspeglar að við séum ekki að leita 

  // birtum svo einhverjar niðurstöður
  setNotLoading(mainElement, searchForm);

  // ætlum svo að búa til resultsElement eins og áður
  // hoppum í það 
  const resultsEl = createSearchResults(results, query);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined
) {
  const heading = el(
    'h1',
    { class: 'heading', 'data-foo': 'bar' },
    'Geimskotaleitin 🚀'
  );
  const searchForm = renderSearchForm(searchHandler, query);

  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna geimskot.
 * Hérna erum við að uppfæra viðmótið okkar.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  
  const container = el('main', {});
  
  
  parentElement.appendChild(container);
  


  /* TODO setja loading state og sækja gögn */
  setLoading(parentElement); // þarf að bæta searchform?
  const resultid = await getLaunch(id);  
  setNotLoading(parentElement);
    
  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við
  // myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu
  if (!resultid) {
    /* TODO útfæra villu og tómt state */
    parentElement.appendChild(el('p', {}, 'Ekkert geimskot fannst. 😢'));
    return null;
  }

  const resultElParentElement = el(
    'div', {class: 'resultIdParent'}
    
  );
  
    /* TODO útfæra ef gögn */
  const resultEl = el(
    'div', {class: 'resultIdParent'},
    el('div',
    { class: 'resultid'},
    el('h1', {class: 'result_title'}, resultid.name),
    el('p', {class: 'window_start'}, resultid.window_start),
    el('p', {class: 'window_start'}, resultid.window_end),
    el('h2', {class: 'status'}, el('span', { class: 'geimferd'}, 'Staða: '), `${resultid.status.name}`),
    el('p', {class: 'launchMission'}, `${resultid.status.description}`),
    el('h2', {}, el('span', { class: 'geimferd'}, 'Geimferð: '), `${resultid.mission.name}`),
    el('p', {}, `${resultid.mission.description}`),
    el('img', {class: 'launch__details', src: resultid.image}),
    el('a', { href: '/' }, 'Til baka')
  )); 

  // const backElement = el(
  //   'div', {class: 'resultIdParent'},
  //   el('div',{ class: 'back' },
  //   el('a', { href: '/' }, 'Til baka')
  // ));
  
  resultElParentElement.appendChild(resultEl);

  // if(resultid.image) {
  //   resultEl.appendChild(el('img', {class: 'launch__details', src: resultid.image}))
  // }
  parentElement.appendChild(resultEl);

  

  // parentElement.appendChild(backElement);
  // parentElement.appendChild(createSearchResults(result.image, id));
  // return id;
  return resultid;


}
