(() => {
  const HIGH_SCORE_KEY = "food-rush-high-score";

  const FOODS = [
    { id: "burger", name: "Burger", emoji: "🍔", prepTime: 3200, complexity: 1 },
    { id: "pizza", name: "Pizza", emoji: "🍕", prepTime: 4200, complexity: 2 },
    { id: "fries", name: "Fries", emoji: "🍟", prepTime: 2600, complexity: 1 },
    { id: "drink", name: "Soda", emoji: "🥤", prepTime: 1800, complexity: 1 },
    { id: "dessert", name: "Dessert", emoji: "🍰", prepTime: 3800, complexity: 2 },
    { id: "salad", name: "Salad", emoji: "🥗", prepTime: 3000, complexity: 1 },
  ];

  const LEVELS = [
    {
      id: 1,
      name: "Food Truck Frenzy",
      description: "Your first shift! Keep it simple and stay focused on perfect orders.",
      totalCustomers: 7,
      customerGoal: 5,
      spawnDelay: { min: 3200, max: 5200 },
      patience: { min: 16000, max: 22000 },
      orderSize: { min: 1, max: 2 },
      timeLimit: 120000,
    },
    {
      id: 2,
      name: "Downtown Lunch Rush",
      description: "More customers, less patience. Multitask to survive the rush hour!",
      totalCustomers: 10,
      customerGoal: 8,
      spawnDelay: { min: 2600, max: 4100 },
      patience: { min: 13000, max: 19000 },
      orderSize: { min: 1, max: 3 },
      timeLimit: 140000,
    },
    {
      id: 3,
      name: "Evening Crowd",
      description: "Orders get complex and combos are the key to big scores.",
      totalCustomers: 13,
      customerGoal: 10,
      spawnDelay: { min: 2200, max: 3600 },
      patience: { min: 11000, max: 17000 },
      orderSize: { min: 2, max: 3 },
      timeLimit: 150000,
    },
    {
      id: 4,
      name: "VIP Gala",
      description: "Demanding guests with extravagant tastes. Keep everyone smiling!",
      totalCustomers: 16,
      customerGoal: 12,
      spawnDelay: { min: 1900, max: 3000 },
      patience: { min: 9500, max: 15000 },
      orderSize: { min: 2, max: 4 },
      timeLimit: 160000,
    },
  ];

  const CUSTOMER_NAMES = [
    "Avery",
    "Kai",
    "Jordan",
    "Luna",
    "Maya",
    "Eli",
    "Nova",
    "Theo",
    "Sofia",
    "Hugo",
    "Zara",
    "Miles",
    "Ivy",
    "Noah",
    "Leah",
    "Owen",
    "Jade",
    "Remy",
  ];

  const screens = {
    menu: null,
    levelIntro: null,
    game: null,
    levelComplete: null,
    gameOver: null,
  };

  const elements = {
    playBtn: null,
    beginLevelBtn: null,
    pauseBtn: null,
    restartBtn: null,
    serveBtn: null,
    clearTrayBtn: null,
    nextLevelBtn: null,
    playAgainBtn: null,
    returnMenuBtn: null,
    kitchenItems: null,
    customersContainer: null,
    trayItems: null,
    trayStatus: null,
    messageBanner: null,
    hudLevel: null,
    hudScore: null,
    hudHighScore: null,
    hudCombo: null,
    hudCustomers: null,
    hudLives: null,
    hudTimer: null,
    levelTitle: null,
    levelDescription: null,
    levelGoal: null,
    levelTime: null,
    levelCompleteSummary: null,
    levelScore: null,
    levelCombo: null,
    levelPerfect: null,
    gameOverSummary: null,
    finalScore: null,
    finalCombo: null,
    finalCustomers: null,
  };

  const kitchenStations = new Map();

  const game = {
    state: "menu",
    levelIndex: 0,
    score: 0,
    scoreAtLevelStart: 0,
    highScore: 0,
    comboCount: 0,
    bestCombo: 0,
    levelServed: 0,
    totalServed: 0,
    lives: 3,
    tray: [],
    customers: [],
    selectedCustomerId: null,
    levelMistakes: 0,
    levelPeakCombo: 0,
    levelPerfectBonus: 0,
    levelScoreEarned: 0,
    levelTimeRemaining: 0,
    spawnCountdown: 0,
    spawnedCustomers: 0,
    processedCustomers: 0,
    isRunning: false,
    isPaused: false,
    lastTimestamp: 0,
    rafId: 0,
  };

  let messageTimeoutId = null;

  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const loadHighScore = () => {
    const stored = Number(window.localStorage?.getItem(HIGH_SCORE_KEY));
    if (!Number.isNaN(stored) && stored > 0) {
      game.highScore = stored;
    }
    updateHud();
  };

  const saveHighScore = () => {
    if (window.localStorage) {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(game.highScore));
    }
  };

  const formatSeconds = (milliseconds) => `${Math.ceil(milliseconds / 1000)}s`;

  const showScreen = (key) => {
    Object.values(screens).forEach((screen) => {
      if (screen) {
        screen.classList.add("hidden");
      }
    });
    if (screens[key]) {
      screens[key].classList.remove("hidden");
    }
  };

  const updateHud = () => {
    const level = LEVELS[game.levelIndex] ?? LEVELS[LEVELS.length - 1];
    if (elements.hudLevel) {
      elements.hudLevel.textContent = `${level ? `${game.levelIndex + 1} • ${level.name}` : "-"}`;
    }
    if (elements.hudScore) {
      elements.hudScore.textContent = Math.round(game.score).toLocaleString();
    }
    if (elements.hudHighScore) {
      elements.hudHighScore.textContent = Math.round(game.highScore).toLocaleString();
    }
    if (elements.hudCombo) {
      const displayCombo = game.comboCount > 0 ? game.comboCount : 1;
      elements.hudCombo.textContent = `x${displayCombo}`;
    }
    if (elements.hudCustomers && level) {
      elements.hudCustomers.textContent = `${game.levelServed} / ${level.customerGoal}`;
    }
    if (elements.hudLives) {
      elements.hudLives.textContent = String(game.lives);
    }
    if (elements.hudTimer) {
      elements.hudTimer.textContent = formatSeconds(game.levelTimeRemaining);
    }
  };

  const resetMessageBanner = () => {
    if (!elements.messageBanner) return;
    elements.messageBanner.classList.add("hidden");
    elements.messageBanner.textContent = "";
    elements.messageBanner.classList.remove("success", "warning", "info");
    if (messageTimeoutId) {
      window.clearTimeout(messageTimeoutId);
      messageTimeoutId = null;
    }
  };

  const showMessage = (text, type = "info", duration = 2600) => {
    if (!elements.messageBanner) return;
    resetMessageBanner();
    elements.messageBanner.textContent = text;
    elements.messageBanner.classList.remove("hidden");
    elements.messageBanner.classList.add(type);
    if (duration > 0) {
      messageTimeoutId = window.setTimeout(() => {
        resetMessageBanner();
      }, duration);
    }
  };

  const setTrayStatus = (text) => {
    if (elements.trayStatus) {
      elements.trayStatus.textContent = text;
    }
  };

  const clearTray = () => {
    game.tray = [];
    renderTray();
    setTrayStatus("Serving tray is empty.");
  };

  const renderTray = () => {
    if (!elements.trayItems) return;
    elements.trayItems.innerHTML = "";
    game.tray.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "tray-item";
      div.innerHTML = `<span class="tray-emoji">${item.emoji}</span><span>${item.name}</span>`;
      div.title = "Click to remove from tray";
      div.addEventListener("click", () => {
        game.tray.splice(index, 1);
        renderTray();
        updateServeButtonState();
      });
      elements.trayItems.appendChild(div);
    });
    updateServeButtonState();
  };

  const updateServeButtonState = () => {
    if (!elements.serveBtn) return;
    const hasSelection = Boolean(game.selectedCustomerId);
    const canServe = game.state === "playing" && !game.isPaused && hasSelection && game.tray.length > 0;
    elements.serveBtn.disabled = !canServe;
  };

  const kitchenStationFor = (foodId) => kitchenStations.get(foodId);

  const renderKitchen = () => {
    if (!elements.kitchenItems) return;
    elements.kitchenItems.innerHTML = "";
    kitchenStations.clear();

    FOODS.forEach((food) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "food-button";
      button.dataset.foodId = food.id;
      button.innerHTML = `
        <span class="food-emoji">${food.emoji}</span>
        <span class="food-label">${food.name}</span>
        <span class="food-meta">Prep: ${(food.prepTime / 1000).toFixed(1)}s</span>
        <span class="food-progress"><span></span></span>
      `;
      button.addEventListener("click", () => startFoodPrep(food.id));
      elements.kitchenItems.appendChild(button);
      const progress = button.querySelector(".food-progress span");
      kitchenStations.set(food.id, {
        food,
        button,
        progressEl: progress,
        prepping: false,
        progress: 0,
      });
    });
  };

  const startFoodPrep = (foodId) => {
    if (game.state !== "playing" || game.isPaused) return;
    const station = kitchenStationFor(foodId);
    if (!station) return;
    if (station.prepping) {
      showMessage(`${station.food.name} station is still cooking!`, "warning", 1800);
      return;
    }
    if (game.tray.length >= 5) {
      showMessage("Your serving tray is full! Serve an order first.", "warning");
      return;
    }
    station.prepping = true;
    station.progress = 0;
    station.button.classList.add("prepping");
    if (station.progressEl) {
      station.progressEl.style.width = "0%";
    }
  };

  const finishFoodPrep = (station) => {
    station.prepping = false;
    station.progress = 0;
    station.button.classList.remove("prepping");
    if (station.progressEl) {
      station.progressEl.style.width = "0%";
    }
    if (game.state !== "playing") return;
    if (game.tray.length >= 5) {
      showMessage("Tray is full! Serve an order before preparing more.", "warning", 2400);
      setTrayStatus("Tray is full. Serve a customer to clear space.");
      return;
    }
    game.tray.push(station.food);
    renderTray();
    setTrayStatus(`${station.food.name} is ready to serve.`);
    showMessage(`${station.food.name} prepared!`, "success", 1800);
  };

  const createOrder = (level) => {
    const size = Math.round(randomBetween(level.orderSize.min, level.orderSize.max));
    const order = [];
    for (let i = 0; i < size; i += 1) {
      const food = pickOne(FOODS);
      order.push(food);
    }
    return order;
  };

  const buildOrderTags = (order) => order.map((item) => `<span class="order-tag">${item.emoji} ${item.name}</span>`).join("");

  const buildCustomerCard = (customer) => {
    const card = document.createElement("article");
    card.className = "customer-card";
    card.dataset.customerId = customer.id;

    card.innerHTML = `
      <div class="customer-info">
        <span class="customer-name">${customer.name}</span>
        <div class="customer-order">${buildOrderTags(customer.order)}</div>
        <div class="patience-wrapper">
          <span class="happiness-emoji">😄</span>
          <span class="patience-bar"><span></span></span>
        </div>
      </div>
      <button class="secondary" type="button">Select</button>
    `;

    const button = card.querySelector("button");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectCustomer(customer.id);
    });

    card.addEventListener("click", () => selectCustomer(customer.id));

    customer.elements = {
      card,
      happiness: card.querySelector(".happiness-emoji"),
      patienceFill: card.querySelector(".patience-bar span"),
    };

    return card;
  };

  const selectCustomer = (id) => {
    if (game.state !== "playing") return;
    game.selectedCustomerId = id;
    game.customers.forEach((customer) => {
      if (!customer.elements) return;
      if (customer.id === id) {
        customer.elements.card.classList.add("selected");
        setTrayStatus(`Serving ${customer.name}: ${customer.order.length} item${customer.order.length > 1 ? "s" : ""}.`);
      } else {
        customer.elements.card.classList.remove("selected");
      }
    });
    updateServeButtonState();
  };

  const spawnCustomer = () => {
    const level = LEVELS[game.levelIndex];
    if (!level) return;
    if (game.spawnedCustomers >= level.totalCustomers) return;

    const patience = randomBetween(level.patience.min, level.patience.max);
    const customer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: pickOne(CUSTOMER_NAMES),
      patience,
      maxPatience: patience,
      order: createOrder(level),
      elements: null,
    };

    const card = buildCustomerCard(customer);
    elements.customersContainer?.appendChild(card);
    game.customers.push(customer);
    game.spawnedCustomers += 1;
    showMessage(`${customer.name} has arrived with an order!`, "info", 2000);
  };

  const removeCustomer = (customer) => {
    if (customer.elements?.card?.parentElement) {
      customer.elements.card.parentElement.removeChild(customer.elements.card);
    }
    game.customers = game.customers.filter((entry) => entry.id !== customer.id);
    if (game.selectedCustomerId === customer.id) {
      game.selectedCustomerId = null;
      setTrayStatus("Select a customer to serve their order.");
    }
    updateServeButtonState();
  };

  const customerHappinessEmoji = (ratio) => {
    if (ratio >= 0.75) return "😄";
    if (ratio >= 0.5) return "🙂";
    if (ratio >= 0.3) return "😟";
    return "😠";
  };

  const customerPatienceColor = (ratio) => {
    if (ratio >= 0.6) return "linear-gradient(135deg, #37c4a2, #77e093)";
    if (ratio >= 0.4) return "linear-gradient(135deg, #ffd166, #fca311)";
    return "linear-gradient(135deg, #ff6b6b, #ff8e7f)";
  };

  const awardScoreForCustomer = (customer) => {
    const patienceRatio = customer.patience / customer.maxPatience;
    const base = 100 * customer.order.length;
    const speedMultiplier = 1 + patienceRatio;
    game.comboCount += 1;
    game.levelPeakCombo = Math.max(game.levelPeakCombo, game.comboCount);
    game.bestCombo = Math.max(game.bestCombo, game.comboCount);
    const comboMultiplier = 1 + (game.comboCount - 1) * 0.25;
    let earned = Math.round(base * speedMultiplier * comboMultiplier);
    let tip = 0;
    if (patienceRatio >= 0.7) {
      tip = 25;
      earned += tip;
    }
    game.score += earned;
    if (tip > 0) {
      showMessage(`Perfect timing! ${customer.name} left a ${tip}-point tip.`, "success", 2400);
    } else {
      showMessage(`${customer.name} is happy! +${earned} points.`, "success", 2400);
    }
  };

  const applyMistakePenalty = (reason) => {
    game.comboCount = 0;
    game.levelMistakes += 1;
    game.lives -= 1;
    game.score = Math.max(0, game.score - 75);
    const level = LEVELS[game.levelIndex];
    game.processedCustomers += 1;
    showMessage(reason, "warning", 2600);
    if (game.lives <= 0) {
      endGame(false, "All your lives are gone. Shift over!");
      return;
    }
    if (level && game.processedCustomers >= level.totalCustomers && game.levelServed < level.customerGoal) {
      endGame(false, "Too many customers left hungry.");
      return;
    }
    updateHud();
    updateServeButtonState();
  };

  const serveSelectedCustomer = () => {
    if (!game.selectedCustomerId || game.tray.length === 0) return;
    const customer = game.customers.find((entry) => entry.id === game.selectedCustomerId);
    if (!customer) return;

    const trayCounts = game.tray.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] ?? 0) + 1;
      return acc;
    }, {});

    const orderCounts = customer.order.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] ?? 0) + 1;
      return acc;
    }, {});

    const isPerfect = Object.keys(orderCounts).every((key) => orderCounts[key] === trayCounts[key]) && Object.keys(trayCounts).every((key) => orderCounts[key] === trayCounts[key]);

    if (!isPerfect) {
      clearTray();
      applyMistakePenalty("Wrong order delivered! You lost a life.");
      removeCustomer(customer);
      return;
    }

    awardScoreForCustomer(customer);
    game.levelServed += 1;
    game.totalServed += 1;
    game.processedCustomers += 1;
    game.tray = [];
    renderTray();
    removeCustomer(customer);

    const level = LEVELS[game.levelIndex];
    if (level && game.levelServed >= level.customerGoal) {
      endLevelSuccess();
      return;
    }

    updateHighScoreIfNeeded();
    updateHud();
    updateServeButtonState();
  };

  const updateHighScoreIfNeeded = () => {
    if (game.score > game.highScore) {
      game.highScore = game.score;
      saveHighScore();
    }
  };

  const updateCustomers = (delta) => {
    if (game.customers.length === 0) return;
    game.customers.slice().forEach((customer) => {
      customer.patience = clamp(customer.patience - delta, 0, customer.maxPatience);
      const ratio = customer.patience / customer.maxPatience;
      if (customer.elements?.patienceFill) {
        customer.elements.patienceFill.style.width = `${Math.max(ratio * 100, 5)}%`;
        customer.elements.patienceFill.style.background = customerPatienceColor(ratio);
      }
      if (customer.elements?.happiness) {
        customer.elements.happiness.textContent = customerHappinessEmoji(ratio);
      }
      if (customer.patience <= 0) {
        removeCustomer(customer);
        applyMistakePenalty(`${customer.name} left unhappy!`);
      }
    });
  };

  const updateKitchen = (delta) => {
    kitchenStations.forEach((station) => {
      if (!station.prepping) return;
      station.progress += delta / station.food.prepTime;
      const percent = clamp(station.progress, 0, 1);
      if (station.progressEl) {
        station.progressEl.style.width = `${Math.floor(percent * 100)}%`;
      }
      if (percent >= 1) {
        finishFoodPrep(station);
      }
    });
  };

  const updateSpawnTimer = (delta) => {
    const level = LEVELS[game.levelIndex];
    if (!level) return;
    if (game.spawnedCustomers >= level.totalCustomers) return;
    game.spawnCountdown -= delta;
    if (game.spawnCountdown <= 0) {
      spawnCustomer();
      game.spawnCountdown = randomBetween(level.spawnDelay.min, level.spawnDelay.max);
    }
  };

  const updateLevelTimer = (delta) => {
    const level = LEVELS[game.levelIndex];
    if (!level) return;
    game.levelTimeRemaining = clamp(game.levelTimeRemaining - delta, 0, level.timeLimit);
    if (game.levelTimeRemaining === 0) {
      endGame(false, "Time's up! The shift ended before you met the goal.");
    }
  };

  const gameLoop = (timestamp) => {
    if (!game.isRunning) return;
    const delta = timestamp - game.lastTimestamp;
    game.lastTimestamp = timestamp;

    if (!game.isPaused) {
      updateKitchen(delta);
      updateCustomers(delta);
      updateSpawnTimer(delta);
      updateLevelTimer(delta);
      updateHud();
    }

    game.rafId = window.requestAnimationFrame(gameLoop);
  };

  const startLoop = () => {
    game.isRunning = true;
    game.lastTimestamp = performance.now();
    game.rafId = window.requestAnimationFrame(gameLoop);
  };

  const stopLoop = () => {
    game.isRunning = false;
    if (game.rafId) {
      window.cancelAnimationFrame(game.rafId);
      game.rafId = 0;
    }
  };

  const resetLevelState = () => {
    const level = LEVELS[game.levelIndex];
    game.state = "playing";
    game.isPaused = false;
    game.spawnCountdown = randomBetween(level.spawnDelay.min, level.spawnDelay.max);
    game.spawnedCustomers = 0;
    game.processedCustomers = 0;
    game.levelServed = 0;
    game.levelMistakes = 0;
    game.levelPeakCombo = 0;
    game.levelPerfectBonus = 0;
    game.levelScoreEarned = 0;
    game.scoreAtLevelStart = game.score;
    game.comboCount = 0;
    game.customers = [];
    game.selectedCustomerId = null;
    game.levelTimeRemaining = level.timeLimit;
    elements.customersContainer.innerHTML = "";
    resetMessageBanner();
    clearTray();
    setTrayStatus("Select a customer to serve their order.");
    kitchenStations.forEach((station) => {
      station.prepping = false;
      station.progress = 0;
      station.button.classList.remove("prepping");
      if (station.progressEl) {
        station.progressEl.style.width = "0%";
      }
    });
    updateHud();
  };

  const prepareLevelIntro = () => {
    const level = LEVELS[game.levelIndex];
    if (!level) return;
    elements.levelTitle.textContent = `Level ${game.levelIndex + 1}: ${level.name}`;
    elements.levelDescription.textContent = level.description;
    elements.levelGoal.textContent = `${level.customerGoal}`;
    elements.levelTime.textContent = `${Math.round(level.timeLimit / 1000)}`;
    showScreen("levelIntro");
  };

  const startLevel = () => {
    const level = LEVELS[game.levelIndex];
    if (!level) return;
    resetLevelState();
    showScreen("game");
    startLoop();
    showMessage(`Level ${game.levelIndex + 1} started! Keep the food flowing.`, "info", 2600);
  };

  const awardPerfectBonus = () => {
    const bonus = 200;
    game.levelPerfectBonus = bonus;
    game.score += bonus;
    showMessage(`Flawless service! Perfect bonus +${bonus} points.`, "success", 3000);
    updateHighScoreIfNeeded();
  };

  const endLevelSuccess = () => {
    stopLoop();
    game.state = "levelComplete";
    const level = LEVELS[game.levelIndex];
    if (game.levelMistakes === 0) {
      awardPerfectBonus();
    }
    game.levelScoreEarned = Math.max(0, game.score - game.scoreAtLevelStart);
    elements.levelCompleteSummary.textContent = `You conquered ${level.name} and served ${game.levelServed} customer${game.levelServed === 1 ? "" : "s"}!`;
    elements.levelScore.textContent = Math.round(game.levelScoreEarned).toLocaleString();
    elements.levelCombo.textContent = `x${Math.max(game.levelPeakCombo, 1)}`;
    elements.levelPerfect.textContent = game.levelMistakes === 0 ? `Yes (+${Math.round(game.levelPerfectBonus)})` : "No";
    updateHighScoreIfNeeded();
    updateHud();
    showScreen("levelComplete");
  };

  const endGame = (win, reason) => {
    if (game.state === "gameOver") return;
    stopLoop();
    game.state = "gameOver";
    if (!win) {
      showMessage(reason, "warning", 3200);
    }
    const served = game.totalServed;
    elements.gameOverSummary.textContent = reason;
    elements.finalScore.textContent = Math.round(game.score).toLocaleString();
    elements.finalCombo.textContent = `x${Math.max(game.bestCombo, 1)}`;
    elements.finalCustomers.textContent = served.toLocaleString();
    updateHighScoreIfNeeded();
    updateHud();
    showScreen("gameOver");
  };

  const restartCampaign = () => {
    game.score = 0;
    game.bestCombo = 0;
    game.lives = 3;
    game.levelIndex = 0;
    game.comboCount = 0;
    game.totalServed = 0;
    game.levelServed = 0;
    resetMessageBanner();
    prepareLevelIntro();
    updateHud();
  };

  const advanceLevel = () => {
    game.levelIndex += 1;
    if (game.levelIndex >= LEVELS.length) {
      endGame(true, "You completed every shift! You're a time-management legend.");
      return;
    }
    game.comboCount = 0;
    game.levelServed = 0;
    game.levelMistakes = 0;
    prepareLevelIntro();
  };

  const togglePause = (forcePause = null) => {
    if (game.state !== "playing") return;
    const shouldPause = forcePause === null ? !game.isPaused : forcePause;
    game.isPaused = shouldPause;
    elements.pauseBtn.textContent = shouldPause ? "Resume" : "Pause";
    if (shouldPause) {
      showMessage("Game paused. Take a breather!", "info", 0);
    } else {
      resetMessageBanner();
    }
    updateServeButtonState();
  };

  const attachEventListeners = () => {
    elements.playBtn.addEventListener("click", () => {
      restartCampaign();
    });

    elements.beginLevelBtn.addEventListener("click", () => {
      showMessage("Get ready...", "info", 1200);
      startLevel();
    });

    elements.pauseBtn.addEventListener("click", () => togglePause());

    elements.restartBtn.addEventListener("click", () => {
      restartCampaign();
    });

    elements.serveBtn.addEventListener("click", () => serveSelectedCustomer());
    elements.clearTrayBtn.addEventListener("click", () => clearTray());

    elements.nextLevelBtn.addEventListener("click", () => {
      resetMessageBanner();
      advanceLevel();
    });

    elements.playAgainBtn.addEventListener("click", () => {
      restartCampaign();
    });

    elements.returnMenuBtn.addEventListener("click", () => {
      stopLoop();
      game.state = "menu";
      resetMessageBanner();
      showScreen("menu");
    });

    window.addEventListener("blur", () => {
      if (game.state === "playing" && !game.isPaused) {
        togglePause(true);
      }
    });
  };

  const cacheElements = () => {
    screens.menu = document.getElementById("menu-screen");
    screens.levelIntro = document.getElementById("level-screen");
    screens.game = document.getElementById("game-screen");
    screens.levelComplete = document.getElementById("level-complete");
    screens.gameOver = document.getElementById("game-over");

    elements.playBtn = document.getElementById("play-btn");
    elements.beginLevelBtn = document.getElementById("begin-level");
    elements.pauseBtn = document.getElementById("pause-btn");
    elements.restartBtn = document.getElementById("restart-btn");
    elements.serveBtn = document.getElementById("serve-btn");
    elements.clearTrayBtn = document.getElementById("clear-tray");
    elements.nextLevelBtn = document.getElementById("next-level");
    elements.playAgainBtn = document.getElementById("play-again");
    elements.returnMenuBtn = document.getElementById("return-menu");

    elements.kitchenItems = document.getElementById("kitchen-items");
    elements.customersContainer = document.getElementById("customers-container");
    elements.trayItems = document.getElementById("tray-items");
    elements.trayStatus = document.getElementById("tray-status");
    elements.messageBanner = document.getElementById("message-banner");

    elements.hudLevel = document.getElementById("hud-level");
    elements.hudScore = document.getElementById("hud-score");
    elements.hudHighScore = document.getElementById("hud-high-score");
    elements.hudCombo = document.getElementById("hud-combo");
    elements.hudCustomers = document.getElementById("hud-customers");
    elements.hudLives = document.getElementById("hud-lives");
    elements.hudTimer = document.getElementById("hud-timer");

    elements.levelTitle = document.getElementById("level-title");
    elements.levelDescription = document.getElementById("level-description");
    elements.levelGoal = document.getElementById("level-goal");
    elements.levelTime = document.getElementById("level-time");

    elements.levelCompleteSummary = document.getElementById("level-complete-summary");
    elements.levelScore = document.getElementById("level-score");
    elements.levelCombo = document.getElementById("level-combo");
    elements.levelPerfect = document.getElementById("level-perfect");

    elements.gameOverSummary = document.getElementById("game-over-summary");
    elements.finalScore = document.getElementById("final-score");
    elements.finalCombo = document.getElementById("final-combo");
    elements.finalCustomers = document.getElementById("final-customers");
  };

  const init = () => {
    cacheElements();
    renderKitchen();
    attachEventListeners();
    loadHighScore();
    showScreen("menu");
    setTrayStatus("Select a customer to begin serving.");
    updateHud();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
