const DEFAULT_PEOPLE = [
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

const TOTAL_VOTES = 12;
const STORAGE_KEY = "sukigao_people_v2";
let PEOPLE = loadPeople();
let votes = {};
let comparisons = 0;
let currentPair = [];

const $ = id => document.getElementById(id);

function loadPeople(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length >= 2 ? saved : [...DEFAULT_PEOPLE];
  }catch(e){
    return [...DEFAULT_PEOPLE];
  }
}

function savePeople(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(PEOPLE));
}

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
  if(PEOPLE.length < 2){
    alert("候補者が2人以上必要です。");
    openManager();
    return;
  }
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
  $("manageScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");
  $("progressBar").style.width = "100%";

  const ranking = [...PEOPLE].map(p => {
    const v = votes[p.id];
    const rate = v.games ? v.wins / v.games : 0;
    return {...p, ...v, rate};
  }).sort((a,b) => b.rate - a.rate || b.wins - a.wins);

  $("rankingList").innerHTML = ranking.map((p,i) => `
    <li>
      <div class="rank">${i+1}</div>
      <img class="rank-photo" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}">
      <div class="rank-name">${escapeHtml(p.name)}</div>
      <div class="rank-score">${p.wins}勝 / ${p.games}比較</div>
    </li>
  `).join("");
}

function start(){
  resetScores();
  $("voteScreen").classList.remove("hidden");
  $("resultScreen").classList.add("hidden");
  $("manageScreen").classList.add("hidden");
  showPair();
}

function openManager(){
  $("voteScreen").classList.add("hidden");
  $("resultScreen").classList.add("hidden");
  $("manageScreen").classList.remove("hidden");
  renderManager();
}

function renderManager(){
  $("peopleManagerList").innerHTML = PEOPLE.map(p => `
    <div class="manager-item">
      <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}">
      <div class="manager-name">${escapeHtml(p.name)}</div>
      <button class="delete-person" data-id="${p.id}">削除</button>
    </div>
  `).join("");

  document.querySelectorAll(".delete-person").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if(PEOPLE.length <= 2){
        alert("候補者は最低2人必要です。");
        return;
      }
      const target = PEOPLE.find(p => p.id === id);
      if(confirm(`「${target.name}」を削除しますか？`)){
        PEOPLE = PEOPLE.filter(p => p.id !== id);
        savePeople();
        renderManager();
      }
    });
  });
}

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addPerson(event){
  event.preventDefault();
  const name = $("personName").value.trim();
  const file = $("personImage").files[0];
  if(!name || !file) return;

  if(file.size > 6 * 1024 * 1024){
    alert("写真が大きすぎます。6MB以下の写真を選んでください。");
    return;
  }

  try{
    const image = await fileToDataURL(file);
    const id = PEOPLE.length ? Math.max(...PEOPLE.map(p => Number(p.id))) + 1 : 1;
    PEOPLE.push({id, name, image});
    savePeople();
    $("addForm").reset();
    renderManager();
    alert(`${name}を追加しました！`);
  }catch(e){
    alert("写真の読み込みに失敗しました。");
  }
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function escapeAttr(value){
  return escapeHtml(value);
}

$("leftCard").addEventListener("click", () => choose(0));
$("rightCard").addEventListener("click", () => choose(1));
$("skipBtn").addEventListener("click", () => {
  comparisons++;
  if(comparisons >= TOTAL_VOTES) showResults();
  else showPair();
});
$("retryBtn").addEventListener("click", start);
$("manageBtn").addEventListener("click", openManager);
$("backBtn").addEventListener("click", start);
$("addForm").addEventListener("submit", addPerson);
$("resetPeopleBtn").addEventListener("click", () => {
  if(confirm("追加した候補者をすべて削除して初期状態に戻しますか？")){
    localStorage.removeItem(STORAGE_KEY);
    PEOPLE = [...DEFAULT_PEOPLE];
    renderManager();
  }
});

start();
