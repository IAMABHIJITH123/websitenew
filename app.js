import { DataManager } from './data.js';

const state = {
    data: DataManager.getData(),
    isAdmin: false,
    isEditMode: false,
    currentTab: 'about',
    dragSrcEl: null
};

const els = {
    homeScreen: document.getElementById('home-screen'),
    mainScreen: document.getElementById('main-screen'),
    showMoreBtn: document.getElementById('show-more-btn'),
    backToHomeBtn: document.getElementById('back-to-home-btn'),
    
    homeLogo: document.getElementById('home-logo'),
    headerLogo: document.getElementById('header-logo'),
    homeFooter: document.getElementById('home-footer'),
    mainFooter: document.getElementById('main-footer'),
    
    tabs: document.querySelectorAll('.nav-tab, .nav-tab-mobile'),
    tabContents: {
        about: document.getElementById('tab-about'),
        members: document.getElementById('tab-members')
    },
    aboutText: document.getElementById('about-text'),
    membersGrid: document.getElementById('members-grid'),
    
    menuBtn: document.getElementById('menu-btn'),
    menuDropdown: document.getElementById('menu-dropdown'),

    loginModal: document.getElementById('login-modal'),
    loginForm: document.getElementById('login-form'),
    
    memberModal: document.getElementById('member-modal'),
    editorModal: document.getElementById('editor-modal'),
    editorForm: document.getElementById('editor-form'),
    
    dashboard: document.getElementById('admin-dashboard'),
    dashMemberList: document.getElementById('dash-member-list'),
    dashSections: document.querySelectorAll('.dash-section'),
    
    toast: document.getElementById('toast'),
    fileInput: document.getElementById('global-file-input'),
    editToolbar: document.getElementById('edit-mode-toolbar')
};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderAll();
    initListeners();

    setTimeout(() => {
        document.body.classList.remove('overflow-hidden'); 
    }, 100);
});

function renderAll() {
    renderText();
    renderMembers();
    if (state.isAdmin) renderDashboard();
    lucide.createIcons();
}

function renderText() {
    const { appName, aboutText, footerText } = state.data;
    
    [els.homeLogo, els.headerLogo].forEach(el => {
        if(el.textContent !== appName) el.textContent = appName;
    });
    
    if(els.aboutText.innerText !== aboutText) els.aboutText.innerText = aboutText;
    
    const renderFooter = (el) => {
        const html = `made by <span class="neon-text font-normal">${footerText.replace('made by ', '')}</span>`;
        if (el.innerHTML !== html) el.innerHTML = html;
    };

    renderFooter(els.homeFooter);
    renderFooter(els.mainFooter);
    
    const dashFooterInput = document.getElementById('dash-footer-text');
    if(dashFooterInput) dashFooterInput.value = footerText;
}

function renderMembers() {
    const fragment = document.createDocumentFragment();
    
    state.data.members.forEach((m, index) => {
        const div = document.createElement('div');
        div.className = `member-card bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center cursor-pointer relative group gpu-accelerated`;
        div.dataset.id = m.id;
        div.dataset.index = index;
        if (state.isEditMode) {
            div.draggable = true;
        }

        div.innerHTML = `
            ${state.isEditMode ? '<div class="absolute top-3 left-3 bg-gray-100/80 backdrop-blur rounded p-1.5 cursor-grab text-gray-400 drag-handle hover:text-primary transition-colors"><i data-lucide="grip-vertical" class="w-4 h-4"></i></div>' : ''}
            
            <div class="w-28 h-28 rounded-full overflow-hidden mb-5 bg-gray-100 relative shadow-inner editable-img-wrapper border-4 border-gray-50" data-type="member-photo" data-id="${m.id}">
                <img src="${m.photo || DataManager.getPlaceholderImage(m.name)}" alt="${m.name}" class="w-full h-full object-cover pointer-events-none will-change-transform">
                ${state.isEditMode ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">CHANGE PHOTO</div>' : ''}
            </div>
            
            <h3 class="text-lg font-bold text-primary text-center outline-none rounded px-2 w-full truncate ${state.isEditMode ? 'hover:bg-gray-50 border border-transparent hover:border-gray-200' : ''}" 
                ${state.isEditMode ? 'contenteditable="true"' : ''} 
                data-type="member-name" data-id="${m.id}">${m.name}</h3>
                
            <p class="text-xs text-accent uppercase tracking-widest font-semibold mb-3 text-center outline-none rounded px-2 w-full truncate ${state.isEditMode ? 'hover:bg-gray-50 border border-transparent hover:border-gray-200' : ''}"
               ${state.isEditMode ? 'contenteditable="true"' : ''}
               data-type="member-role" data-id="${m.id}">${m.role}</p>
            
            <p class="text-sm text-gray-500 text-center line-clamp-2 outline-none rounded px-2 w-full ${state.isEditMode ? 'hover:bg-gray-50 border border-transparent hover:border-gray-200' : ''}"
               ${state.isEditMode ? 'contenteditable="true"' : ''}
               data-type="member-bio" data-id="${m.id}">${m.bio || 'No bio'}</p>
            
            <div class="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                 ${!state.isEditMode ? '<div class="p-2 bg-gray-50 rounded-full text-accent"><i data-lucide="arrow-up-right" class="w-4 h-4"></i></div>' : '<span class="text-[10px] text-gray-300 font-mono">EDIT MODE</span>'}
            </div>
        `;

        if (state.isEditMode) {
            div.addEventListener('dragstart', handleDragStart);
            div.addEventListener('dragenter', handleDragEnter);
            div.addEventListener('dragover', handleDragOver);
            div.addEventListener('dragleave', handleDragLeave);
            div.addEventListener('drop', handleDrop);
            div.addEventListener('dragend', handleDragEnd);

            div.addEventListener('click', (e) => {
                if (e.target.isContentEditable) return;
                if (e.target.closest('.editable-img-wrapper')) {
                    handleImageClick(e.target.closest('.editable-img-wrapper'));
                    return;
                }
                openMemberDetails(m.id);
            });
        } else {
            div.addEventListener('click', () => openMemberDetails(m.id));
        }

        fragment.appendChild(div);
    });

    els.membersGrid.innerHTML = '';
    els.membersGrid.appendChild(fragment);
    
    lucide.createIcons();
    setupInlineEditing();
}

function renderDashboardMemberList() {
    els.dashMemberList.innerHTML = state.data.members.map(m => `
        <tr class="hover:bg-blue-50/30 transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <img src="${m.photo || DataManager.getPlaceholderImage(m.name)}" class="w-full h-full object-cover">
                    </div>
                    <div class="font-semibold text-primary">${m.name}</div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">${m.role}</span>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors dash-del-btn" data-id="${m.id}" title="Delete">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();

    document.querySelectorAll('.dash-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm('Remove this member?')) {
                const id = parseInt(btn.dataset.id);
                state.data.members = state.data.members.filter(m => m.id !== id);
                DataManager.saveData(state.data);
                renderAll();
                showToast('Member removed');
            }
        });
    });
}

function renderDashboard() {
    renderDashboardMemberList();
}

function setupInlineEditing() {
    if (!state.isEditMode) return;

    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('blur', handleInlineEdit);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                el.blur();
            }
        });
    });
}

function handleInlineEdit(e) {
    const el = e.target;
    const val = el.innerText.trim();
    const type = el.dataset.type;
    const field = el.dataset.field; // For global text

    if (field === 'appName') state.data.appName = val;
    if (field === 'aboutText') state.data.aboutText = val;
    if (field === 'footerText') state.data.footerText = val;

    if (type && el.dataset.id) {
        const id = parseInt(el.dataset.id);
        const member = state.data.members.find(m => m.id === id);
        if (member) {
            if (type === 'member-name') member.name = val;
            if (type === 'member-role') member.role = val;
            if (type === 'member-bio') member.bio = val;
            if (type === 'member-contact') member.contact = val;
        }
    }

    DataManager.saveData(state.data);
    showToast('Changes saved');
    
    if(field === 'appName') {
         renderText();
    }
}

function commitAllEdits() {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        if (document.activeElement === el) el.blur(); // Force blur to trigger handleInlineEdit
        const val = el.innerText.trim();
        const type = el.dataset.type;
        const field = el.dataset.field;

        if (field === 'appName') state.data.appName = val;
        if (field === 'aboutText') state.data.aboutText = val;
        if (field === 'footerText') state.data.footerText = val;

        if (type && el.dataset.id) {
            const id = parseInt(el.dataset.id);
            const member = state.data.members.find(m => m.id === id);
            if (member) {
                if (type === 'member-name') member.name = val;
                if (type === 'member-role') member.role = val;
                if (type === 'member-bio') member.bio = val;
                if (type === 'member-contact') member.contact = val;
            }
        }
    });
    DataManager.saveData(state.data);
    showToast('All changes saved!');
}

function handleDragStart(e) {
    this.style.opacity = '0.4';
    state.dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML); // Firefox requires data
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('scale-105', 'ring-2', 'ring-accent', 'ring-offset-2');
}

function handleDragLeave(e) {
    this.classList.remove('scale-105', 'ring-2', 'ring-accent', 'ring-offset-2');
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    this.classList.remove('scale-105', 'ring-2', 'ring-accent', 'ring-offset-2');

    const srcEl = state.dragSrcEl;
    if (srcEl && srcEl !== this) {
        const srcIdx = parseInt(srcEl.dataset.index);
        const targetIdx = parseInt(this.dataset.index);

        const members = [...state.data.members];
        const [moved] = members.splice(srcIdx, 1);
        members.splice(targetIdx, 0, moved);
        
        state.data.members = members;
        DataManager.saveData(state.data);
        renderMembers();
        showToast('Reordered');
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    document.querySelectorAll('.member-card').forEach(card => {
        card.classList.remove('scale-105', 'ring-2', 'ring-accent', 'ring-offset-2');
    });
}

let currentImageContext = null;

function handleImageClick(wrapper) {
    currentImageContext = {
        type: wrapper.dataset.type,
        id: parseInt(wrapper.dataset.id)
    };
    els.fileInput.click();
}

els.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !currentImageContext) return;

    try {
        if (file.size > 5000000) throw new Error("Image too large (Max 5MB)");
        
        showToast('Processing image...');
        const base64 = await DataManager.fileToBase64(file);
        
        if (currentImageContext.type === 'member-photo') {
            const member = state.data.members.find(m => m.id === currentImageContext.id);
            if (member) member.photo = base64;
        }

        DataManager.saveData(state.data);
        renderMembers();
        

        const modalImg = document.getElementById('modal-img');
        if (modalImg && !els.memberModal.classList.contains('hidden') && els.memberModal.dataset.id == currentImageContext.id) {
            modalImg.src = base64;
        }

        showToast('Image updated');
    } catch (err) {
        alert(err.message);
    }
    e.target.value = ''; 
});

function toggleEditMode(active) {
    state.isEditMode = active;
    if (active) closeDashboard();

    const method = active ? 'add' : 'remove';
    document.body.classList[method]('editing-active');
    

    if (active) els.editToolbar.classList.remove('-translate-y-40');
    else els.editToolbar.classList.add('-translate-y-40');

    // Enable/disable contenteditable for global fields
    [els.homeLogo, els.headerLogo, els.aboutText, els.homeFooter, els.mainFooter].forEach(el => {
        el.contentEditable = active;
    });

    renderMembers(); // Re-render members with edit state
}

function initListeners() {
    els.showMoreBtn.addEventListener('click', () => {
        els.homeScreen.classList.add('translate-x-full');
        els.mainScreen.classList.remove('translate-x-full');
    });

    els.backToHomeBtn.addEventListener('click', () => {
        els.mainScreen.classList.add('translate-x-full');
        els.homeScreen.classList.remove('translate-x-full');
    });

    els.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(tab.dataset.tab);
        });
    });


    els.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        els.menuDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => els.menuDropdown.classList.add('hidden'));


    document.getElementById('admin-login-trigger').addEventListener('click', () => openModal(els.loginModal));
    document.getElementById('close-login-btn').addEventListener('click', () => closeModal(els.loginModal));
    els.loginForm.addEventListener('submit', handleLogin);

    document.getElementById('admin-logout-trigger').addEventListener('click', () => {
        state.isAdmin = false;
        closeDashboard();
        showToast('Logged out');
    });

    document.getElementById('toggle-edit-mode-btn').addEventListener('click', () => toggleEditMode(true));
    document.getElementById('toggle-edit-mode-mobile').addEventListener('click', () => toggleEditMode(true));

    // FIXED: Save before exit
    document.getElementById('save-exit-edit-btn').addEventListener('click', () => {
        commitAllEdits();
        toggleEditMode(false);
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        if (state.isEditMode) commitAllEdits();
        closeModal(els.memberModal);
    });
    document.getElementById('member-modal-bg').addEventListener('click', () => {
        if (state.isEditMode) commitAllEdits();
        closeModal(els.memberModal);
    });


    document.getElementById('cancel-editor').addEventListener('click', () => closeModal(els.editorModal));
    els.editorForm.addEventListener('submit', handleEditorSubmit);


    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dashboard-tab').forEach(t => {
                t.classList.remove('active', 'bg-white', 'text-primary', 'shadow-sm');
                t.classList.add('text-gray-500');
            });
            tab.classList.add('active', 'bg-white', 'text-primary', 'shadow-sm');
            tab.classList.remove('text-gray-500');
            
            const targetId = tab.dataset.target;
            els.dashSections.forEach(sec => {
                sec.classList.add('hidden');
                if(sec.id === targetId) sec.classList.remove('hidden');
            });
        });
    });

    document.getElementById('dash-add-member-btn').addEventListener('click', () => openEditor('addMember'));
    document.getElementById('save-footer-text').addEventListener('click', () => {
        state.data.footerText = document.getElementById('dash-footer-text').value;
        DataManager.saveData(state.data);
        renderText();
        showToast('Saved');
    });
}

function switchTab(tabName) {
    if (state.currentTab === tabName) return;
    state.currentTab = tabName;


    els.tabs.forEach(t => {
        if(t.dataset.tab === tabName) {
            t.classList.add('active', 'text-primary');
            t.classList.remove('text-gray-500');
        } else {
            t.classList.remove('active', 'text-primary');
            t.classList.add('text-gray-500');
        }
    });


    Object.values(els.tabContents).forEach(el => {
        if (el.id === `tab-${tabName}`) {
            el.style.display = 'block';

            void el.offsetWidth;
            el.classList.add('active');
        } else {
            el.classList.remove('active');
            setTimeout(() => {
                if(!el.classList.contains('active')) el.style.display = 'none';
            }, 400); // Match CSS transition
        }
    });
}

function openMemberDetails(id) {
    const member = state.data.members.find(m => m.id === id);
    if (!member) return;

    const modal = els.memberModal;
    modal.dataset.id = id; // Mark for updates
    const content = modal.querySelector('#member-modal-content');
    const bg = modal.querySelector('#member-modal-bg');

    const setupField = (sel, val, type) => {
        const el = modal.querySelector(sel);
        el.innerText = val || '';
        if(state.isEditMode) {
            el.contentEditable = "true";
            el.dataset.id = member.id;
            el.dataset.type = type;
            el.classList.add('border', 'border-dashed', 'border-gray-300');
            el.onblur = handleInlineEdit;
        } else {
            el.contentEditable = "false";
            el.classList.remove('border', 'border-dashed', 'border-gray-300');
            el.onblur = null;
        }
    };

    setupField('#modal-name', member.name, 'member-name');
    setupField('#modal-role', member.role, 'member-role');
    setupField('#modal-bio', member.bio || 'No bio available.', 'member-bio');

    const img = modal.querySelector('#modal-img');
    img.src = member.photo || DataManager.getPlaceholderImage(member.name);
    
    const imgContainer = modal.querySelector('#modal-img-container');
    const imgOverlay = modal.querySelector('#modal-img-overlay');
    
    if(state.isEditMode) {
        imgOverlay.classList.remove('opacity-0'); 
        imgOverlay.style.opacity = '1'; 
        imgContainer.onclick = () => {
             currentImageContext = { type: 'member-photo', id: member.id };
             els.fileInput.click();
        };
        imgContainer.classList.add('cursor-pointer');
    } else {
        imgOverlay.classList.add('opacity-0');
        imgContainer.onclick = null;
        imgContainer.classList.remove('cursor-pointer');
    }


    const contactContainer = modal.querySelector('#modal-contacts');
    contactContainer.innerHTML = '';
    
    if (member.contact) {
        if(state.isEditMode) {
             contactContainer.innerHTML = `
                <div class="w-full text-center">
                    <label class="text-xs text-gray-400 block mb-1 uppercase font-bold">Contact Info</label>
                    <div class="p-2 border border-dashed border-gray-300 rounded outline-none hover:bg-blue-50" contenteditable="true" data-type="member-contact" data-id="${member.id}">${member.contact}</div>
                </div>
             `;
             contactContainer.querySelector('[contenteditable]').addEventListener('blur', (e) => {
                 member.contact = e.target.innerText;
                 DataManager.saveData(state.data);
                 showToast('Contact updated');
             });
        } else {
            const isEmail = member.contact.includes('@');
            const href = isEmail ? `mailto:${member.contact}` : `tel:${member.contact}`;
            const icon = isEmail ? 'mail' : 'phone';
            contactContainer.innerHTML = `
                <a href="${href}" class="flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-full text-sm font-medium text-primary hover:bg-accent hover:text-white transition-all border border-gray-200 shadow-sm hover:shadow-md">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                    ${member.contact}
                </a>
            `;
        }
    } else if (state.isEditMode) {
        contactContainer.innerHTML = `<div class="p-2 border border-dashed border-gray-300 rounded outline-none w-full text-center text-gray-400 text-sm" contenteditable="true" data-type="member-contact" data-id="${member.id}">+ Add Contact Info</div>`;
        contactContainer.querySelector('[contenteditable]').addEventListener('blur', (e) => {
            member.contact = e.target.innerText;
            DataManager.saveData(state.data);
            showToast('Contact updated');
        });
    }

    modal.classList.remove('hidden');
    void modal.offsetWidth; 

    bg.classList.remove('opacity-0');
    content.classList.remove('translate-y-full', 'opacity-0', 'md:translate-y-10');
    content.classList.add('translate-y-0', 'opacity-100', 'md:translate-y-0');

    lucide.createIcons();
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === 'achu' && p === 'achu') {
        state.isAdmin = true;
        closeModal(els.loginModal);
        showToast('Welcome back, Achu!');
        document.getElementById('login-error').classList.add('hidden');
        e.target.reset();
        openDashboard();
        renderAll();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

function openDashboard() {
    const d = els.dashboard;
    d.classList.remove('hidden');
    requestAnimationFrame(() => {
        d.classList.remove('opacity-0');
        d.classList.add('opacity-100');
    });
    renderDashboard();
}

function closeDashboard() {
    const d = els.dashboard;
    d.classList.add('opacity-0');
    d.classList.remove('opacity-100');
    setTimeout(() => {
        d.classList.add('hidden');
    }, 300);
}

function openEditor(type) {
    const formContainer = document.getElementById('editor-fields');
    formContainer.innerHTML = '';
    
    if (type === 'addMember') {
        formContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                    <input type="text" name="name" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-accent focus:bg-white outline-none transition-colors">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                    <input type="text" name="role" required class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-accent focus:bg-white outline-none transition-colors">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</label>
                <input type="text" name="contact" placeholder="Email or Phone" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-accent focus:bg-white outline-none transition-colors">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                <textarea name="bio" rows="3" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-accent focus:bg-white outline-none resize-none transition-colors"></textarea>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Photo</label>
                <div class="relative">
                    <input type="file" name="photo" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-blue-100 transition-all">
                </div>
            </div>
        `;
    }
    openModal(els.editorModal);
}

async function handleEditorSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newMember = {
        id: Date.now(),
        name: formData.get('name'),
        role: formData.get('role'),
        bio: formData.get('bio'),
        contact: formData.get('contact'),
        photo: null
    };

    const photoFile = formData.get('photo');
    if (photoFile && photoFile.size > 0) {
        try {
            newMember.photo = await DataManager.fileToBase64(photoFile);
        } catch(err) {
            alert(err.message);
            return;
        }
    }

    state.data.members.push(newMember);
    
    if (DataManager.saveData(state.data)) {
        closeModal(els.editorModal);
        renderMembers();
        renderDashboard();
        showToast('Member Added');
    }
}

function openModal(el) {
    el.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        const bg = el.querySelector('div[class*="absolute inset-0"]');
        const content = el.querySelector('div[class*="relative z-10"]') || el.querySelector('.modal-content');
        
        if(bg) bg.classList.remove('opacity-0');
        if(content) {
            content.classList.remove('opacity-0', 'scale-95', 'translate-y-8');
            content.classList.add('opacity-100', 'scale-100', 'translate-y-0');
        }
    });
}

function closeModal(el) {
    const bg = el.querySelector('div[class*="absolute inset-0"]');
    const content = el.querySelector('div[class*="relative z-10"]') || el.querySelector('.modal-content');

    if (el.id === 'member-modal') {
         content.classList.remove('translate-y-0', 'opacity-100', 'md:translate-y-0');
         content.classList.add('translate-y-full', 'opacity-0', 'md:translate-y-10');
    } else if(content) {
        content.classList.add('opacity-0', 'scale-95', 'translate-y-8');
        content.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
    }

    if(bg) bg.classList.add('opacity-0');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 300);
}

function showToast(msg) {
    const t = els.toast;
    t.querySelector('#toast-msg').textContent = msg;
    t.classList.remove('opacity-0', 'translate-y-10');
    

    if(t.timer) clearTimeout(t.timer);
    
    t.timer = setTimeout(() => {
        t.classList.add('opacity-0', 'translate-y-10');
    }, 3000);
}