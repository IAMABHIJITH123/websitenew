const DEFAULT_DATA = {
    appName: "പുളിമുട്ടായി",
    aboutText: "We are Pulimuttayi, a collective of creative individuals dedicated to bringing traditional values into the modern digital era. Our group was formed with the vision of staying connected and creating meaningful experiences together.\n\nWe believe in the power of community and friendship. Every member brings a unique flavor to our mix, just like the sweet and tangy taste of a Pulimuttayi.",
    footerText: "made by abhijith",
    members: [
        {
            id: 1,
            name: "Abhijith",
            role: "Developer",
            bio: "The mind behind this website. Loves coding, minimalism, and neon lights.",
            photo: null, 
            contact: "abhijith@example.com"
        },
        {
            id: 2,
            name: "Arjun",
            role: "Designer",
            bio: "Graphic design wizard. Obsessed with typography and color theory.",
            photo: null,
            contact: "arjun@example.com"
        },
        {
            id: 3,
            name: "Karthik",
            role: "Photographer",
            bio: "Capturing moments that last a lifetime. Lens enthusiast.",
            photo: null,
            contact: "karthik@example.com"
        },
        {
            id: 4,
            name: "Vishnu",
            role: "Content",
            bio: "Wordsmith and storyteller. Keeping the group's narrative alive.",
            photo: null,
            contact: "vishnu@example.com"
        }
    ]
};

const STORAGE_KEY = 'pulimuttayi_data_v3';

export const DataManager = {
    getData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return { ...DEFAULT_DATA, ...data };
            }
        } catch (e) {
            console.error("Error loading data", e);
        }
        this.saveData(DEFAULT_DATA);
        return DEFAULT_DATA;
    },

    saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Storage failed", e);
            if (e.name === 'QuotaExceededError') {
                alert("Storage full! Please delete some members or use smaller images.");
            } else {
                alert("Failed to save changes.");
            }
            return false;
        }
    },

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(new Error("Invalid image file"));
            };
            reader.onerror = error => reject(error);
        });
    },

    getPlaceholderImage(name) {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        const colors = ['#2c3e50', '#3498db', '#e74c3c', '#27ae60', '#8e44ad', '#f39c12'];
        const color = colors[(name.length || 0) % colors.length];
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 200, 200);
        
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(100, 180, 80, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 100, 100);
        
        return canvas.toDataURL();
    }
};