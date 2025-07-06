console.log("Script loaded")
const allRules = [
  { id: 1, description: "Minimálně 8 znaků", validate: str => str.length >= 8 },
  { id: 2, description: "Obsahuje číslici", validate: str => /\d/.test(str) },
  { id: 3, description: "Obsahuje velké písmeno", validate: str => /[A-Z]/.test(str) },
  { id: 4, description: "Obsahuje symbol", validate: (str) => /[!@#$%^&]/.test(str) },
  { id: 5, description: "Součet číslic je sudý", validate: (str) => {const sum = Array.from(str).reduce((acc, ch) => { return /\d/.test(ch) ? acc + parseInt(ch) : acc;}, 0); return sum % 2 === 0;}},
  { id: 6, description: "Obsahuje dnešní datum (YYYY-MM-DD)", validate: (str) => {const today = new Date().toISOString().slice(0,10);return str.includes(today);}},
  { id: 7, description: "Obsahuje Hello World program v C#", validate: (str) => /Console\.WriteLine\("Hello, World!"\);/i.test(str)},
  { id: 8, description: "Obsahuje aktuální rok v binárním zápisu", validate: (str) => {const year = new Date().getFullYear(); const binaryYear = year.toString(2);return str.includes(binaryYear);}},
  { id: 9,description: "Obsahuje jméno pokémona (musí být odděleno např. '-')(API response chvíli trvá)", validate: async (str) => {
    const words = str.toLowerCase().split(/\W+/).filter(Boolean);

    for (const word of words) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${word}`);
        if (res.ok) return true;
      } catch {}
    }
    return false;
  }}
];
console.log(new Date().toISOString().slice(0,10));

let activeRules = [allRules[0]];
let pendingRules = allRules.slice(1);

const input = document.querySelector("#inputMain");
const ruleList = document.querySelector("#rules");

async function validateAllRules(str, activeRules) {
  const results = await Promise.all(
    activeRules.map(async (rule) => {
      const valid = await rule.validate(str);
      return { ...rule, valid };
    })
  );
  return results;
}

// Debounce timer (aby se validace nespustila hned)
let validateTimeout;

input.addEventListener("input", () => {
  const value = input.value;

  // Pokud už je nastavený timer, zruš ho
  if (validateTimeout) clearTimeout(validateTimeout);

  // Hned zobraz všechny aktivní pravidla (zatím bez validace)
  ruleList.innerHTML = "";
  activeRules.forEach(rule => {
    const item = document.createElement("div");
    item.textContent = rule.description;
    item.style.color = "gray";
    ruleList.appendChild(item);
  });

  // Nastav timeout, aby validace začala až po 500 ms
  validateTimeout = setTimeout(() => {
    validateAndUpdate(value);
  }, 500);
});

async function validateAndUpdate(value) {
  while (true) {
    const ruleStates = await validateAllRules(value, activeRules);

    // Překresli pravidla s validací
    ruleList.innerHTML = "";
    const unsatisfied = ruleStates.filter(r => !r.valid);
    const satisfied = ruleStates.filter(r => r.valid);

    [...unsatisfied, ...satisfied].forEach(rule => {
      const item = document.createElement("div");
      item.textContent = rule.description;
      item.style.color = rule.valid ? "green" : "red";
      ruleList.appendChild(item);
    });

    if (ruleStates.every(r => r.valid) && pendingRules.length > 0) {
      // Přidáme další pravidlo a počkáme 500 ms než validujeme
      activeRules.push(pendingRules.shift());

      // Hned zobrazíme nově přidané pravidlo v šedé barvě
      ruleList.innerHTML = "";
      activeRules.forEach(rule => {
        const item = document.createElement("div");
        item.textContent = rule.description;
        item.style.color = "gray";
        ruleList.appendChild(item);
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      break;
    }
  }
}


