console.log("Script loaded")
const allRules = [
  { id: 1, description: "Minimálně 8 znaků", validate: str => str.length >= 8 },
  { id: 2, description: "Obsahuje číslici", validate: str => /\d/.test(str) },
  { id: 3, description: "Obsahuje velké písmeno", validate: str => /[A-Z]/.test(str) },
  { id: 4, description: "Obsahuje symbol", validate: (str) => /[!@#$%^&]/.test(str) },
  { id: 5, description: "Součet číslic je sudý", validate: (str) => { const sum = Array.from(str).reduce((acc, ch) => { return /\d/.test(ch) ? acc + parseInt(ch) : acc; }, 0); return sum % 2 === 0; } },
  { id: 6, description: "Obsahuje dnešní datum (YYYY-MM-DD)", validate: (str) => { const today = new Date().toISOString().slice(0, 10); return str.includes(today); } },
  { id: 7, description: "Obsahuje Hello World program v C#", validate: (str) => /Console\.WriteLine\("Hello, World!"\);/i.test(str) },
  { id: 8, description: "Obsahuje aktuální rok v binárním zápisu", validate: (str) => { const year = new Date().getFullYear(); const binaryYear = year.toString(2); return str.includes(binaryYear); } },
  {id: 9, description: "Obsahuje jméno pokémona (musí být odděleno např. '-')(API response chvíli trvá)", validate: async (str) => {
      const words = str.toLowerCase().split(/\W+/).filter(Boolean);
      for (const word of words) {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${word}`);
          if (res.ok) return true;
        } catch { }
      }
      return false;
    }
  },
  { id: 10, description: "Obsahuje dekódované id inputu", validate: (str) => {
      const el = document.getElementById("eW91TmVyZA==");
      if (!el) return false;
      const base64Id = el.id;
      let decoded;
      try {
        decoded = atob(base64Id);
      } catch {
        return false;
      }
      return str.includes(decoded);
    }
  },
  { id: 101,
  description: "Obsahuje počet odběratelů YouTube kanálu coolmuz1",
  validate: async (str) => {
    const apiKey = "AIzaSyAOE2hk7-2BtHxCa_nn66sRPPfodvegH-Q";
    const channelId = "UCCTbdJVI-Dfmw8ySxyoq2_Q";
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
      if (!res.ok) return false;
      const data = await res.json();
      const subs = data.items[0].statistics.subscriberCount;
      console.log(subs)
      return str.includes(subs);
    } catch {
      return false;
    }
  }
}

];
console.log(new Date().toISOString().slice(0, 10));

let activeRules = [allRules[0]];
let pendingRules = allRules.slice(1);

const input = document.getElementById("eW91TmVyZA==");
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

let validateTimeout;

input.addEventListener("input", () => {
  const value = input.value;

  if (validateTimeout) clearTimeout(validateTimeout);

  ruleList.innerHTML = "";
  activeRules.forEach(rule => {
    const item = document.createElement("div");
    item.textContent = rule.description;
    item.style.color = "gray";
    ruleList.appendChild(item);
  });

  validateTimeout = setTimeout(() => {
    validateAndUpdate(value);
  }, 500);
});

async function validateAndUpdate(value) {
  while (true) {
    const ruleStates = await validateAllRules(value, activeRules);

    ruleList.innerHTML = "";
    const unsatisfied = ruleStates.filter(r => !r.valid);
    const satisfied = ruleStates.filter(r => r.valid);

    [...unsatisfied, ...satisfied].forEach(rule => {
      const item = document.createElement("div");
      item.textContent = rule.description;
      item.style.color = rule.valid ? "#00ff99" : "#ff3366";
      ruleList.appendChild(item);
    });

    if (ruleStates.every(r => r.valid)) {
      if (pendingRules.length > 0) {
        activeRules.push(pendingRules.shift());

        ruleList.innerHTML = "";
        activeRules.forEach(rule => {
          const item = document.createElement("div");
          item.textContent = rule.description;
          item.style.color = "gray";
          ruleList.appendChild(item);
        });
        document.getElementById("successPopup").classList.remove("visible");
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        document.getElementById("successPopup").classList.add("visible");
        break; 
      }
    } else {
      document.getElementById("successPopup").classList.remove("visible");
      break;
    }
  }
}



