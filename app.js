const D = {
  a: [
    "ram",
    "dam",
    "dad",
    "yam",
    "jam",
    "fan",
    "man",
    "can",
    "pan",
    "map",
    "pad",
    "bag",
    "rag",
    "cap",
    "hat",
    "rat",
    "mat",
    "bat",
    "ant",
    "nap",
    "tap",
    "cat",
    "mad",
  ],
  i: [
    "lip",
    "tip",
    "sip",
    "rip",
    "bib",
    "rib",
    "kid",
    "lid",
    "sit",
    "tin",
    "zip",
    "win",
    "fig",
  ],
  o: [
    "ox",
    "fox",
    "pot",
    "hot",
    "cot",
    "dot",
    "top",
    "mop",
    "hop",
    "pop",
    "dog",
    "log",
  ],
  e: ["jet", "net", "wet", "pet", "hen", "pen", "red", "bed", "web", "ten"],
  u: ["bug", "rug", "mug", "nut", "cut", "hut", "bun", "fun", "run", "hug"],
};
for (const k in D) D[k] = D[k].map((w) => [w, `<img src="${IMG[w]}" alt="">`]);
const K = {
  a: "#ef6f8e",
  i: "#2ea8de",
  o: "#3aa655",
  e: "#d9a400",
  u: "#9a6ae0",
};
const NAMES = ["1 · Match", "2 · Spell", "3 · Memory"];
let v = "a",
  ex = 0;
const $ = (s) => document.querySelector(s);
const shuf = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (n) => shuf(D[v]).slice(0, n);
function say(w) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w);
    u.lang = "en-US";
    u.rate = 0.8;
    speechSynthesis.speak(u);
  } catch (e) {}
}

function head() {
  document.documentElement.style.setProperty("--c", K[v]);
  $("#vows").innerHTML = Object.keys(D)
    .map(
      (k) =>
        `<button class="vow ${k === v ? "on" : ""}" style="--k:${K[k]}" data-v="${k}" aria-label="Short ${k}">${k}</button>`,
    )
    .join("");
  $("#exs").innerHTML = NAMES.map(
    (n, i) =>
      `<button class="${i === ex ? "on" : ""}" data-e="${i}">${n}</button>`,
  ).join("");
}
$("#vows").onclick = (e) => {
  const b = e.target.closest("[data-v]");
  if (b) {
    v = b.dataset.v;
    start();
  }
};
$("#exs").onclick = (e) => {
  const b = e.target.closest("[data-e]");
  if (b) {
    ex = +b.dataset.e;
    start();
  }
};
function start() {
  head();
  [ex1, ex2, ex3][ex]();
}

/* Exercice 1 : relier mot ↔ image */
function ex1() {
  const set = pick(6);
  let sel = null,
    left = set.length;
  const words = shuf(set),
    imgs = shuf(set);
  $("#stage").innerHTML = `<p class="hint">Tap a word, then tap its picture.</p>
  <div class="grid"><div id="L">${words.map((w) => `<div class="item" role="button" tabindex="0" data-w="${w[0]}" style="margin-bottom:10px">${w[0]}</div>`).join("")}</div>
  <div id="R">${imgs.map((w) => `<div class="item emo" role="button" tabindex="0" data-w="${w[0]}" style="margin-bottom:10px">${w[1]}</div>`).join("")}</div></div>
  <div class="msg" id="m"></div>`;
  const all = [...document.querySelectorAll("#stage .item")];
  all.forEach((el) => {
    const go = () => {
      const isW = !el.classList.contains("emo");
      if (isW) {
        all
          .filter((x) => !x.classList.contains("emo"))
          .forEach((x) => x.classList.remove("sel"));
        el.classList.add("sel");
        sel = el;
        say(el.dataset.w);
        return;
      }
      if (!sel) {
        $("#m").textContent = "Pick a word first 👈";
        return;
      }
      if (sel.dataset.w === el.dataset.w) {
        sel.classList.remove("sel");
        sel.classList.add("done");
        el.classList.add("done");
        sel = null;
        left--;
        $("#m").textContent = "";
        if (!left) {
          $("#m").innerHTML =
            '🌟 Great job! 🌟<button class="btn" id="again">Play again</button>';
          $("#again").onclick = ex1;
        }
      } else {
        el.classList.add("bad");
        setTimeout(() => el.classList.remove("bad"), 400);
        $("#m").textContent = "Try again!";
      }
    };
    el.onclick = go;
    el.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") go();
    };
  });
}

/* Exercice 2 : écrire le mot avec 6 lettres */
function ex2() {
  const q = pick(5);
  let i = 0,
    score = 0;
  const abc = "abcdefghijklmnopqrstuvwxyz";
  function turn() {
    if (i >= q.length) {
      $("#stage").innerHTML =
        `<div class="big">🏆</div><div class="msg">Score: ${score} / ${q.length}</div><button class="btn" id="again">Play again</button>`;
      $("#again").onclick = ex2;
      return;
    }
    const [w, em] = q[i];
    let letters = w.split("");
    while (letters.length < 6) {
      const c = abc[Math.floor(Math.random() * 26)];
      if (!w.includes(c) && !letters.includes(c)) letters.push(c);
    }
    letters = shuf(letters);
    let slots = Array(w.length).fill(null),
      locked = false,
      tries = 0;
    $("#stage").innerHTML =
      `<p class="hint">Word ${i + 1} of ${q.length} — tap the letters in order.</p>
    <div class="big" id="pic" role="button" tabindex="0" aria-label="Listen">${em}</div>
    <div class="slots" id="S"></div><div class="bank" id="B"></div><div class="msg" id="m"></div>`;
    const draw = () => {
      $("#S").innerHTML = slots
        .map(
          (s, k) =>
            `<button class="slot ${s ? "f" : ""}" data-k="${k}">${s ? s.l : ""}</button>`,
        )
        .join("");
      $("#B").innerHTML = letters
        .map(
          (l, k) =>
            `<button class="tile" data-k="${k}" ${slots.some((s) => s && s.k === k) ? "disabled" : ""}>${l}</button>`,
        )
        .join("");
    };
    draw();
    $("#pic").onclick = () => say(w);
    $("#S").onclick = (e) => {
      const b = e.target.closest(".slot");
      if (!b || locked) return;
      slots[+b.dataset.k] = null;
      draw();
    };
    $("#B").onclick = (e) => {
      const b = e.target.closest(".tile");
      if (!b || locked || b.disabled) return;
      const k = +b.dataset.k,
        free = slots.indexOf(null);
      if (free < 0) return;
      slots[free] = { l: letters[k], k };
      draw();
      if (slots.every(Boolean)) {
        const got = slots.map((s) => s.l).join("");
        if (got === w) {
          locked = true;
          if (!tries) score++;
          $("#S").classList.add("ok");
          $("#m").innerHTML =
            "✅ " + w + '<button class="btn" id="nx">Next</button>';
          say(w);
          $("#nx").onclick = () => {
            i++;
            turn();
          };
        } else {
          tries++;
          $("#S").classList.add("bad");
          $("#m").textContent = "Not quite…";
          locked = true;
          setTimeout(() => {
            slots = Array(w.length).fill(null);
            locked = false;
            $("#S").classList.remove("bad");
            $("#m").textContent = "";
            draw();
          }, 700);
        }
      }
    };
  }
  turn();
}

/* Exercice 3 : cartes cachées (mémoire) */
function ex3() {
  const set = pick(6);
  const cards = shuf(
    set.flatMap(([w, e]) => [
      { w, t: w, c: "w" },
      { w, t: e, c: "" },
    ]),
  );
  let open = [],
    busy = false,
    pairs = 0,
    moves = 0;
  $("#stage").innerHTML =
    `<p class="hint">Match each word with its picture.</p><div class="mem" id="M">${cards.map((c, k) => `<button class="cd ${c.c}" data-k="${k}" aria-label="Hidden card">${c.t}</button>`).join("")}</div><div class="msg" id="m"></div>`;
  $("#M").onclick = (e) => {
    const b = e.target.closest(".cd");
    if (!b || busy || b.classList.contains("up")) return;
    b.classList.add("up");
    const c = cards[+b.dataset.k];
    say(c.w);
    open.push(b);
    if (open.length === 2) {
      moves++;
      busy = true;
      const [x, y] = open;
      if (cards[+x.dataset.k].w === cards[+y.dataset.k].w) {
        x.classList.add("ok");
        y.classList.add("ok");
        open = [];
        busy = false;
        pairs++;
        if (pairs === 6) {
          $("#m").innerHTML =
            `🌟 Great job! ${moves} tries 🌟<button class="btn" id="again">Play again</button>`;
          $("#again").onclick = ex3;
        }
      } else
        setTimeout(() => {
          x.classList.remove("up");
          y.classList.remove("up");
          open = [];
          busy = false;
        }, 900);
    }
  };
}
start();
