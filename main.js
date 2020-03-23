let data = { position: 100, repetitions: 3, errors: {} };
let stats = { start: 0, hpm: 0, ratio: 0, correct: 0, wrong: 0 };
let dom = { text: null, stats: null, position: null };

const save = () => (localStorage.data = JSON.stringify(data));
const load = () => {
  data = JSON.parse(localStorage.data);
  if (data.text === null || data.text === undefined) {
    reset();
  }
};

const Acento = { derecha: 1, izquierda: 2 };
let acento = null;

const aplicaAcento = key => {
  const pos = "aeiou".indexOf(key);
  if (acento === Acento.derecha) {
    key = (pos === -1 ? key : "áéíóú"[pos]);
  } else if (acento === Acento.izquierda) {
    key = (pos === -1 ? key : "àèìòù"[pos]);
  }
  acento = null;
  return key;
};

const controlKeysHandler = e => {
  switch (e.key) {
    case "Backspace": {
      e.preventDefault();
      data.pos -= 1;
      if (data.errors[data.pos]) {
        delete data.errors[data.pos];
      }
      render();
      save();
      break;
    }
    case "ArrowRight": {
      if (data.position <= all_words.length - 5) {
        e.preventDefault();
        data.position += 5;
        next();
      }
      break;
    }
    case "ArrowLeft": {
      if (data.position >= 5) {
        e.preventDefault();
        data.position -= 5;
        next();
      }
      break;
    }
    case "Control":
    case "Alt": {
      break;
    }
    case "Dead": {
      if (e.code === "Quote") {
        acento = Acento.derecha;
      } else if (e.code === "BracketLeft") {
        acento = Acento.izquierda;
      } else {
        acento = null;
      }
      console.log(acento);
      break;
    }
    case "Enter": {
      e.preventDefault();
      data.position += 5;
      next();
      break;
    }
    default: {
      stats.start = stats.start || Math.floor(new Date().getTime() / 1000);
      let key = aplicaAcento(e.key); // String.fromCharCode(e.key);
      e.preventDefault();
      if (key === data.text[data.pos]) {
        stats.correct += 1;
      } else {
        stats.wrong += 1;
        data.errors[data.pos] = true;
      }
      data.pos += 1;
      if (data.pos >= data.text.length) {
        setTimeout(next, 200);
      }
      updateStats();
      render();
      save();
    }
  }
};

const updateStats = () => {
  if (stats.start) {
    let currTime = Math.floor(new Date().getTime() / 1000);
    stats.ratio = Math.floor(
      (stats.correct / (stats.correct + stats.wrong)) * 100
    );
    stats.hpm = Math.floor(
      ((stats.correct + stats.wrong) / (currTime - stats.start)) * 60
    );
    if (!isFinite(stats.hpm)) {
      stats.hpm = 0;
    }
  }
};

const render = () => {
  let text = "";
  for (let i = 0; i < data.text.length; i++) {
    let sclass = "good";
    if (i > data.pos) {
      sclass = "normal";
    } else if (i == data.pos) {
      sclass = "current";
    } else if (data.errors[i]) {
      sclass = "error";
    }
    text += `<span class="${sclass}">${data.text[i]}</span>`;
  }
  dom.text.innerHTML = text;
  dom.stats.innerHTML = `cpm: ${stats.hpm}, correct: ${stats.ratio}%`;
  dom.position.innerHTML = `<input type="text" value="${data.position}" size="4">`;
};

const generateText = () =>
  all_words.slice(data.position, data.position + 5).join(" ");

const reset = () => {
  data.pos = 0;
  data.errors = {};
  data.text = generateText();
};

const next = () => {
  reset();
  updateStats();
  render();
  save();
};

document.addEventListener("DOMContentLoaded", () => {
  dom.text = document.getElementById("word");
  dom.stats = document.getElementById("stats");
  dom.position = document.getElementById("position");

  document.addEventListener("keydown", controlKeysHandler);

  if (localStorage.data != undefined) {
    load();
    render();
  } else {
    next();
  }
});
