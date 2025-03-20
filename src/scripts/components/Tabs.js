const rootSelector = '[data-js-tabs]';

class Tabs {
  selectors = {
    root: rootSelector,
    button: '[data-js-tabs-button]',
    content: '[data-js-tabs-content]',
  };

  stateClasses = {
    isActive: 'is-active',
  };

  stateAttributes = {
    ariaSelected: 'aria-selected',
    tabIndex: 'tabindex',
  };

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.buttonElements = this.rootElement.querySelectorAll(this.selectors.button);
    this.contentElements = this.rootElement.querySelectorAll(this.selectors.content);
    this.state = this.getProxyState({
      activeTabIndex: [...this.buttonElements].findIndex(buttonElement =>
        buttonElement.classList.contains(this.stateClasses.isActive)
      ),
    });
    this.limitTabsIndex = this.buttonElements.length - 1;
    this.bindEvents();
  }

  getProxyState(initialSate) {
    return new Proxy(initialSate, {
      get: (target, prop) => {
        return target[prop];
      },
      set: (target, prop, value) => {
        target[prop] = value;

        this.updateUI();

        return true;
      },
    });
  }

  updateUI() {
    const { activeTabIndex } = this.state;

    this.buttonElements.forEach((buttonElement, index) => {
      const isActive = index === activeTabIndex;

      buttonElement.classList.toggle(this.stateClasses.isActive, isActive);
      buttonElement.setAttribute(this.stateAttributes.ariaSelected, isActive.toString());
      buttonElement.setAttribute(this.stateAttributes.tabIndex, isActive ? '0' : '-1');
    });

    this.contentElements.forEach((contentElement, index) => {
      const isActive = index === activeTabIndex;

      contentElement.classList.toggle(this.stateClasses.isActive, isActive);
    });
  }

  onButtonClick(buttonIndex) {
    this.state.activeTabIndex = buttonIndex;
    this.updateUI();
  }

  activateTab(newTabIndex) {
    this.state.activeTabIndex = newTabIndex;
    this.buttonElements[newTabIndex].focus();
  }

  previousTab = () => {
    const newTabIndex = this.state.activeTabIndex === 0 ? this.limitTabsIndex : this.state.activeTabIndex - 1;

    this.activateTab(newTabIndex);
  };

  nextTab = () => {
    const newTabIndex = this.state.activeTabIndex === this.limitTabsIndex ? 0 : this.state.activeTabIndex + 1;

    this.activateTab(newTabIndex);
  };

  firsTab = () => {
    this.activateTab(0);
  };

  lastTab = () => {
    this.activateTab(this.limitTabsIndex);
  };

  onKeyDown = event => {
    const { code, metaKey } = event;

    const action = {
      ArrowLeft: this.previousTab,
      ArrowRight: this.nextTab,
      ArrowHome: this.firsTab,
      ArrowEnd: this.lastTab,
    }[code];

    const isMacHomeKey = metaKey && code === 'ArrowLeft';
    const isMacEndKey = metaKey && code === 'ArrowRight';

    if (isMacHomeKey) {
      this.firsTab();
      return;
    }

    if (isMacEndKey) {
      this.lastTab();
      return;
    }

    action?.();
  };

  bindEvents() {
    this.buttonElements.forEach((buttonElement, index) => {
      buttonElement.addEventListener('click', () => this.onButtonClick(index));
    });
    this.rootElement.addEventListener('keydown', this.onKeyDown);
  }
}

class TabsCollections {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll(rootSelector).forEach(element => {
      new Tabs(element);
    });
  }
}

export default TabsCollections;
