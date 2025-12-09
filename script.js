let isAdmin = false;
let isEditing = false;
let members = [
  {id:1, name:"അഖിൽ", photo:"", bio:"ഗ്രൂപ്പിലെ തമാശക്കാരൻ 🎭", phone:"9876543210"},
  {id:2, name:"നിധി", photo:"", bio:"ഫോട്ടോ queen 📸", phone:"9876543211"},
  {id:3, name:"അഭിജിത്ത്", photo:"", bio:"ഈ സൈറ്റ് ഉണ്ടാക്കിയത് ഞാൻ 😎", phone:"8080808080"}
];

function goHome() { document.getElementById("main").classList.remove("active"); document.getElementById("home").classList.add("active"); }
function goToMain() { document.getElementById("home").classList.remove("active"); document.getElementById("main").classList.add("active"); showTab('about'); }
function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
  document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add("active");
  renderMembers();
}
function toggleLogin() { document.getElementById("loginModal").classList.toggle("active"); }

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (u === "achu" && p === "achu") {
    isAdmin = true;
    toggleLogin();
    document.getElementById("editBtn").style.display = "block";
    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("addMemberBtn").style.display = "block";
    makeEditable();
  } else {
    alert("Wrong! Hint: achu / achu");
  }
}
function logout() {
  isAdmin = false;
  isEditing = false;
  document.getElementById("editBtn").innerText = "Edit";
  document.getElementById("editBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("addMemberBtn").style.display = "none";
  makeEditable(false);
}

function toggleEdit() {
  isEditing = !isEditing;
  document.getElementById("editBtn").innerText = isEditing ? "Save" : "Edit";
  makeEditable(isEditing);
}

function makeEditable(enable = true) {
  document.querySelectorAll("[contenteditable]").forEach(el => el.contentEditable = enable);
  if (enable) document.querySelectorAll(".member-card").forEach(c => c.classList.add("editable"));
  else document.querySelectorAll(".member-card").forEach(c => c.classList.remove("editable"));
}

function renderMembers() {
  const grid = document.getElementById("members");
  grid.innerHTML = "";
  members.forEach(m => {
    const div = document.createElement("div");
    div.className = "member-card";
    div.innerHTML = `
      ${m.photo ? `<img src="${m.photo}" />` : `<div class="placeholder">${m.name[0]}</div>`}
      <div style="padding:1.5rem">
        <h3 contenteditable="false">${m.name}</h3>
        <p contenteditable="false">${m.bio}</p>
        ${m.phone ? `<small>📞 ${m.phone}</small><br>` : ""}
        ${isAdmin && isEditing ? `<button onclick="deleteMember(${m.id})" style="margin-top:10px;background:#e74c3c;padding:8px;border:none;color:white;border-radius:8px">Delete</button>` : ""}
      </div>
    `;
    if (isAdmin && isEditing) {
      div.querySelector("h3").contentEditable = true;
      div.querySelector("p").contentEditable = true;
      div.onclick = (e) => { e.stopPropagation(); uploadPhoto(m.id); };
    }
    grid.appendChild(div);
  });
}

function uploadPhoto(id) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      members = members.map(m => m.id===id ? {...m, photo: reader.result} : m);
      renderMembers();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function deleteMember(id) {
  if (confirm("Delete this member?")) {
    members = members.filter(m => m.id !== id);
    renderMembers();
  }
}

document.getElementById("addMemberBtn").onclick = () => {
  const name = prompt("Member name?");
  if (name) {
    members.push({id:Date.now(), name, photo:"", bio:"Add bio here...", phone:""});
    renderMembers();
  }
};

document.getElementById("editBtn").onclick = toggleEdit;

// First render
renderMembers();