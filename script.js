// ===============================
// ここだけ編集すれば使えます
// ===============================
const PEOPLE = [
  { id: 1, name: "候補者A", image: "images/person01.svg" },
  { id: 2, name: "候補者B", image: "images/person02.svg" },
  { id: 3, name: "候補者C", image: "images/person03.svg" },
  { id: 4, name: "候補者D", image: "images/person04.svg" },
  { id: 5, name: "候補者E", image: "images/person05.svg" },
  { id: 6, name: "候補者F", image: "images/person06.svg" },
  { id: 7, name: "候補者G", image: "images/person07.svg" },
  { id: 8, name: "候補者H", image: "images/person08.svg" },
  { id: 9, name: "候補者I", image: "images/person09.svg" }
];

const TOTAL_VOTES = 12; // 1人が行う比較回数
let votes = {};
let comparisons = 0;
let currentPair = [];

const $ = id => document.getElementById(id);

function resetScores(){
  votes = {};
  PEOPLE.forEach(p => votes[p.id] = { wins: 0, losses: 0, games: 0 });
  comparisons = 0;
}

function randomPair(){
  const shuffled = [...PEOPLE].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function showPair(){
  currentPair = randomPair();
  const [a,b] = currentPair;
  $("leftImage").src = a.image;
  $("leftImage").alt = a.name;
  $("leftName").textContent = a.name;
  $("rightImage").src = b.image;
  $("rightImage").alt = b.name;
  $("rightName").textContent = b.name;
  $("progressText").textContent = `${comparisons + 1} / ${TOTAL_VOTES}`;
  $("progressBar").style.width = `${(comparisons / TOTAL_VOTES) * 100}%`;
}

function choose(winnerIndex){
  const [a,b] = currentPair;
  const winner = winnerIndex === 0 ? a : b;
  const loser = winnerIndex === 0 ? b : a;
  votes[winner.id].wins++;
  votes[winner.id].games++;
  votes[loser.id].losses++;
  votes[loser.id].games++;
  comparisons++;
  if(comparisons >= TOTAL_VOTES) showResults();
  else showPair();
}

function showResults(){
  $("voteScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");
  $("progressBar").style.width = "100%";

  // 勝率を中心に順位付け。比較数が同じなら勝利数でタイブレーク。
  const ranking = [...PEOPLE].map(p => {
    const v = votes[p.id];
    const rate = v.games ? v.wins / v.games : 0;
    return {...p, ...v, rate};
  }).sort((a,b) => b.rate - a.rate || b.wins - a.wins);

  $("rankingList").innerHTML = ranking.map((p,i) => `
    <li>
      <div class="rank">${i+1}</div>
      <img class="rank-photo" src="${p.image}" alt="${p.name}">
      <div class="rank-name">${p.name}</div>
      <div class="rank-score">${p.wins}勝 / ${p.games}比較</div>
    </li>
  `).join("");
}

function start(){
  resetScores();
  $("voteScreen").classList.remove("hidden");
  $("resultScreen").classList.add("hidden");
  showPair();
}

$("leftCard").addEventListener("click", () => choose(0));
$("rightCard").addEventListener("click", () => choose(1));
$("skipBtn").addEventListener("click", () => {
  comparisons++;
  if(comparisons >= TOTAL_VOTES) showResults();
  else showPair();
});
$("retryBtn").addEventListener("click", start);

start();
