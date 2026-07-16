/* IRON DOMINION - Interactive Tactical Systems Logic */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        theme: 'sunset',
        weather: 'clear',
        activeTab: 'dossier',
        audioEnabled: false,
        selectedFaction: 'vanguard',
        loadout: {
            optic: 'standard',
            barrel: 'standard',
            camo: 'standard'
        },
        commander: {
            name: '',
            role: 'ASSAULT',
            blood: 'A+',
            signature: ''
        }
    };

    // --- AUDIO SYSTEM (Web Audio API Synthesizer) ---
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Synthesizes high-tech mechanical clicks/beeps
    function playSound(type) {
        if (!state.audioEnabled) return;
        initAudio();
        
        try {
            const now = audioCtx.currentTime;
            
            if (type === 'click') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now); // A5
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
            } 
            else if (type === 'beep-high') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1480, now); 
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } 
            else if (type === 'tab') {
                // Dual high-tech beep
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc1.type = 'square';
                osc1.frequency.setValueAtTime(1046.50, now); // C6
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1318.51, now + 0.04); // E6
                
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc1.start(now);
                osc1.stop(now + 0.05);
                osc2.start(now + 0.04);
                osc2.stop(now + 0.15);
            }
            else if (type === 'alarm') {
                // High-to-low siren sweep
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(660, now);
                osc.frequency.linearRampToValueAtTime(220, now + 0.35);
                
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                
                // Add a lowpass filter to make it sound beefier
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.Q.setValueAtTime(5, now);
                filter.frequency.setValueAtTime(1200, now);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now);
                osc.stop(now + 0.4);
            }
            else if (type === 'explosion') {
                // Noise buffer synthesis for explosion rumbling
                const bufferSize = audioCtx.sampleRate * 0.4;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noiseNode = audioCtx.createBufferSource();
                noiseNode.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(400, now);
                filter.frequency.exponentialRampToValueAtTime(10, now + 0.35);
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                
                noiseNode.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                noiseNode.start(now);
                noiseNode.stop(now + 0.4);
            }
            else if (type === 'laser') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now);
                osc.stop(now + 0.1);
            }
        } catch (e) {
            console.error('Sound playback failed', e);
        }
    }

    // Audio Toggle Listener
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    audioToggleBtn.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        if (state.audioEnabled) {
            audioToggleBtn.querySelector('.audio-icon').textContent = '🔊';
            audioToggleBtn.classList.add('active');
            initAudio();
            playSound('tab');
        } else {
            audioToggleBtn.querySelector('.audio-icon').textContent = '🔇';
            audioToggleBtn.classList.remove('active');
        }
    });

    // --- HUD NAVIGATION PANEL HANDLER ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            if (state.activeTab === target) return;

            playSound('tab');

            navTabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
            state.activeTab = target;

            // Trigger canvas resizing or ID card refresh if corresponding tabs are loaded
            if (target === 'tab-draft') {
                drawIdCard();
            }
        });
    });

    // --- DYNAMIC CLOCK ---
    const hudClock = document.getElementById('hud-clock');
    function updateClock() {
        const d = new Date();
        const hrs = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const secs = String(d.getSeconds()).padStart(2, '0');
        hudClock.textContent = `${hrs}:${mins}:${secs}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- ATMOSPHERE & WEATHER SHADERS (Canvas Particle Engine) ---
    const atmosphereCanvas = document.getElementById('atmosphere-canvas');
    const atmCtx = atmosphereCanvas.getContext('2d');
    let atmParticles = [];
    let atmAnimationId = null;

    function resizeAtmosphereCanvas() {
        atmosphereCanvas.width = window.innerWidth;
        atmosphereCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeAtmosphereCanvas);
    resizeAtmosphereCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * atmosphereCanvas.width;
            this.y = Math.random() * -atmosphereCanvas.height;
            this.size = Math.random() * 2 + 1;
            
            // Adjust physics according to active weather
            if (state.weather === 'rain') {
                this.speedY = Math.random() * 8 + 8;
                this.speedX = Math.random() * 2 - 4; // Slanted fall (wind)
                this.color = 'rgba(100, 200, 255, 0.4)';
                this.length = Math.random() * 15 + 10;
            } else if (state.weather === 'snow') {
                this.speedY = Math.random() * 1.5 + 0.8;
                this.speedX = Math.random() * 1.5 - 0.75;
                this.color = 'rgba(255, 255, 255, 0.6)';
                this.length = this.size;
            } else if (state.weather === 'sandstorm') {
                this.x = Math.random() * -atmosphereCanvas.width * 0.2; // Spawn from left
                this.y = Math.random() * atmosphereCanvas.height;
                this.speedY = Math.random() * 1 - 0.5;
                this.speedX = Math.random() * 12 + 6;
                this.color = `rgba(${210 + Math.random() * 45}, ${150 + Math.random() * 40}, 80, ${0.15 + Math.random() * 0.2})`;
                this.size = Math.random() * 3 + 2;
                this.length = Math.random() * 40 + 20;
            } else {
                this.speedY = 0;
                this.speedX = 0;
                this.color = 'transparent';
                this.length = 0;
            }
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Boundaries
            if (state.weather === 'sandstorm') {
                if (this.x > atmosphereCanvas.width) {
                    this.reset();
                }
            } else {
                if (this.y > atmosphereCanvas.height || this.x < 0 || this.x > atmosphereCanvas.width) {
                    this.reset();
                }
            }
        }

        draw() {
            if (state.weather === 'clear') return;
            
            atmCtx.beginPath();
            atmCtx.strokeStyle = this.color;
            atmCtx.lineWidth = this.size;
            
            if (state.weather === 'rain') {
                atmCtx.moveTo(this.x, this.y);
                atmCtx.lineTo(this.x + this.speedX * 0.8, this.y + this.length);
                atmCtx.stroke();
            } else if (state.weather === 'sandstorm') {
                atmCtx.moveTo(this.x, this.y);
                atmCtx.lineTo(this.x + this.length, this.y + this.speedY * 2);
                atmCtx.stroke();
            } else if (state.weather === 'snow') {
                atmCtx.fillStyle = this.color;
                atmCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                atmCtx.fill();
            }
        }
    }

    function initAtmosphere() {
        atmParticles = [];
        const count = state.weather === 'clear' ? 0 : state.weather === 'sandstorm' ? 120 : 250;
        for (let i = 0; i < count; i++) {
            atmParticles.push(new Particle());
        }
    }

    function animateAtmosphere() {
        atmCtx.clearRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);
        
        // Atmospheric background mist overlay for sandstorm
        if (state.weather === 'sandstorm') {
            atmCtx.fillStyle = 'rgba(180, 120, 60, 0.03)';
            atmCtx.fillRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);
        }
        
        for (let i = 0; i < atmParticles.length; i++) {
            atmParticles[i].update();
            atmParticles[i].draw();
        }
        atmAnimationId = requestAnimationFrame(animateAtmosphere);
    }

    // Atmosphere Controls Logic
    const timeBtns = document.querySelectorAll('.time-btn');
    const weatherBtns = document.querySelectorAll('.weather-btn');

    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            timeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const time = btn.getAttribute('data-time');
            document.body.classList.remove(`theme-${state.theme}`);
            document.body.classList.add(`theme-${time}`);
            state.theme = time;
        });
    });

    weatherBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            weatherBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const weather = btn.getAttribute('data-weather');
            document.body.classList.remove(`weather-${state.weather}`);
            document.body.classList.add(`weather-${weather}`);
            state.weather = weather;
            
            initAtmosphere();
        });
    });

    // Start atmosphere loop
    initAtmosphere();
    animateAtmosphere();

    // --- INTEL DOSSIER INTERACTIVES ---
    const factionCards = document.querySelectorAll('.faction-card');
    factionCards.forEach(card => {
        card.addEventListener('click', () => {
            playSound('click');
            factionCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            state.selectedFaction = card.getAttribute('data-faction');
        });
    });

    // --- MODULAR WEAPON ARMORY CONFIGURATOR ---
    const modButtons = document.querySelectorAll('.mod-btn');
    
    // Core base stats and modifications mapping
    const baseStats = { damage: 72, range: 60, handling: 65, stealth: 10 };
    const statModifiers = {
        optic: {
            standard: { damage: 0, range: 0, handling: 0, stealth: 0, label: 'BARREL: STANDARD' },
            reddot: { damage: 2, range: 5, handling: 10, stealth: 0, label: 'OPTIC: RED-DOT' },
            acog: { damage: 0, range: 25, handling: -15, stealth: 0, label: 'OPTIC: 4X SCOPE' },
            thermal: { damage: 5, range: 15, handling: -10, stealth: -5, label: 'OPTIC: THERMAL' }
        },
        barrel: {
            standard: { damage: 0, range: 0, handling: 0, stealth: 0, label: 'BARREL: STANDARD' },
            silencer: { damage: -5, range: -12, handling: 2, stealth: 75, label: 'BARREL: SILENCER' },
            compensator: { damage: 8, range: 4, handling: 8, stealth: -10, label: 'BARREL: COMPENSATOR' }
        },
        camo: {
            standard: { label: 'CAMO: GRAPHITE' },
            desert: { label: 'CAMO: DIGITAL DESERT' },
            cyber: { label: 'CAMO: CYBER STEALTH' },
            forest: { label: 'CAMO: WOODLAND' }
        }
    };

    modButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('laser');
            
            const group = btn.parentElement;
            group.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            const val = btn.getAttribute('data-val');
            state.loadout[type] = val;

            updateWeaponConfigUI(type, val);
        });
    });

    function updateWeaponConfigUI(type, val) {
        // 1. Update floating annotations label
        const targetMarker = document.getElementById(`marker-${type === 'optic' ? 'optic' : type === 'barrel' ? 'muzzle' : 'camo'}`);
        if (targetMarker) {
            const dataLabel = statModifiers[type][val].label;
            targetMarker.querySelector('.marker-label').textContent = dataLabel;
        }

        // 2. Adjust color overlays or filters on weapon preview based on camouflage chosen
        const weaponArt = document.getElementById('weapon-art');
        if (type === 'camo') {
            weaponArt.style.filter = 'none';
            if (val === 'desert') {
                weaponArt.style.filter = 'sepia(0.6) hue-rotate(350deg) saturate(1.8) brightness(0.95)';
            } else if (val === 'cyber') {
                weaponArt.style.filter = 'hue-rotate(150deg) saturate(2.5) brightness(1.1)';
            } else if (val === 'forest') {
                weaponArt.style.filter = 'hue-rotate(60deg) saturate(1.1) sepia(0.2) contrast(1.1)';
            }
        }

        // 3. Re-calculate metrics
        let finalDamage = baseStats.damage;
        let finalRange = baseStats.range;
        let finalHandling = baseStats.handling;
        let finalStealth = baseStats.stealth;

        // Apply optic mods
        const opticMod = statModifiers.optic[state.loadout.optic];
        finalDamage += opticMod.damage;
        finalRange += opticMod.range;
        finalHandling += opticMod.handling;
        finalStealth += opticMod.stealth;

        // Apply barrel mods
        const barrelMod = statModifiers.barrel[state.loadout.barrel];
        finalDamage += barrelMod.damage;
        finalRange += barrelMod.range;
        finalHandling += barrelMod.handling;
        finalStealth += barrelMod.stealth;

        // Clamp values 0-100
        finalDamage = Math.max(0, Math.min(100, finalDamage));
        finalRange = Math.max(0, Math.min(100, finalRange));
        finalHandling = Math.max(0, Math.min(100, finalHandling));
        finalStealth = Math.max(0, Math.min(100, finalStealth));

        // 4. Draw bars
        animateStatBar('damage', finalDamage);
        animateStatBar('range', finalRange);
        animateStatBar('handling', finalHandling);
        animateStatBar('stealth', finalStealth, '%');
    }

    function animateStatBar(statName, value, suffix = '') {
        const textVal = document.getElementById(`val-stat-${statName}`);
        const barFill = document.getElementById(`bar-stat-${statName}`);
        
        textVal.textContent = `${value}${suffix}`;
        barFill.style.width = `${value}%`;
    }


    // --- TAB 2: TACTICAL BATTLE SIMULATOR CORE ---
    const simCanvas = document.getElementById('battle-simulation-canvas');
    const simCtx = simCanvas.getContext('2d');
    
    // HUD element nodes
    const troopsSlider = document.getElementById('input-troops');
    const troopsVal = document.getElementById('val-troops');
    const tanksSlider = document.getElementById('input-tanks');
    const tanksVal = document.getElementById('val-tanks');
    const coptersSlider = document.getElementById('input-copters');
    const coptersVal = document.getElementById('val-copters');
    const intelSlider = document.getElementById('input-intel');
    const intelVal = document.getElementById('val-intel');

    const startSimBtn = document.getElementById('btn-start-simulation');
    const resetSimBtn = document.getElementById('btn-reset-simulation');
    const battleFeed = document.getElementById('battle-log-feed');
    
    const meterVanguard = document.getElementById('meter-vanguard');
    const meterApex = document.getElementById('meter-apex');
    const numVanguard = document.getElementById('num-vanguard');
    const numApex = document.getElementById('num-apex');
    
    const simTimerHud = document.getElementById('sim-timer-hud');
    const simPhaseHud = document.getElementById('sim-phase-hud');
    const simFpsHud = document.getElementById('sim-fps-hud');

    // Input listeners to update values dynamically
    troopsSlider.addEventListener('input', () => { troopsVal.textContent = troopsSlider.value; playSound('click'); });
    tanksSlider.addEventListener('input', () => { tanksVal.textContent = tanksSlider.value; playSound('click'); });
    coptersSlider.addEventListener('input', () => { coptersVal.textContent = coptersSlider.value; playSound('click'); });
    intelSlider.addEventListener('input', () => { intelVal.textContent = `${intelSlider.value}%`; playSound('click'); });

    // Simulator Variables
    let simEntities = [];
    let simProjectiles = [];
    let simExplosions = [];
    let simActive = false;
    let simLoopId = null;
    let simTimeStart = 0;
    let baseVanguardMax = 100;
    let baseApexMax = 100;
    let vanguardLeft = 100;
    let apexLeft = 100;
    let logCounter = 0;
    let lastTime = 0;
    let fpsInterval = 0;
    let calculatedFps = 60;

    // Simulation Entity Blueprint
    class CombatEntity {
        constructor(side, type, x, y) {
            this.side = side; // 'vanguard' (blue) or 'apex' (red)
            this.type = type; // 'infantry', 'tank', 'helicopter'
            this.x = x;
            this.y = y;
            
            // Assign stats depending on unit profile
            if (type === 'infantry') {
                this.hp = 100;
                this.maxHp = 100;
                this.speed = Math.random() * 0.4 + 0.3;
                this.range = 75;
                this.damage = 10;
                this.fireRate = 40 + Math.random() * 20; // frame delay
                this.radius = 4;
            } else if (type === 'tank') {
                this.hp = 500;
                this.maxHp = 500;
                this.speed = 0.15;
                this.range = 150;
                this.damage = 80;
                this.fireRate = 120 + Math.random() * 40;
                this.radius = 8;
            } else if (type === 'helicopter') {
                this.hp = 250;
                this.maxHp = 250;
                this.speed = 0.5;
                this.range = 120;
                this.damage = 35;
                this.fireRate = 60;
                this.radius = 6;
                this.swayAngle = Math.random() * Math.PI;
            }

            this.cooldown = Math.random() * this.fireRate;
            this.target = null;
            this.alive = true;
        }

        update() {
            if (!this.alive) return;

            // Helicopter floating hover sway
            if (this.type === 'helicopter') {
                this.swayAngle += 0.05;
                this.y += Math.sin(this.swayAngle) * 0.15;
            }

            // Find closest enemy if no target or target dead
            if (!this.target || !this.target.alive) {
                this.target = this.findNearestEnemy();
            }

            if (this.target) {
                const dist = this.getDistanceTo(this.target);
                
                // Move towards target if out of range
                if (dist > this.range) {
                    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    this.x += Math.cos(angle) * this.speed;
                    this.y += Math.sin(angle) * this.speed;
                } else {
                    // Shoot
                    if (this.cooldown <= 0) {
                        this.shoot();
                        this.cooldown = this.fireRate;
                    }
                }
            }

            if (this.cooldown > 0) this.cooldown--;
            
            // Boundary constraints
            this.x = Math.max(this.radius, Math.min(simCanvas.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(simCanvas.height - this.radius, this.y));
        }

        getDistanceTo(entity) {
            return Math.hypot(entity.x - this.x, entity.y - this.y);
        }

        findNearestEnemy() {
            let nearest = null;
            let minDist = Infinity;
            for (let e of simEntities) {
                if (e.alive && e.side !== this.side) {
                    const dist = this.getDistanceTo(e);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = e;
                    }
                }
            }
            return nearest;
        }

        shoot() {
            if (!this.target) return;
            
            // Add custom audio sound
            if (this.type === 'tank') {
                playSound('explosion');
            } else {
                playSound('laser');
            }

            const p = {
                x: this.x,
                y: this.y,
                tx: this.target.x,
                ty: this.target.y,
                damage: this.damage,
                speed: this.type === 'tank' ? 4 : 7,
                target: this.target,
                side: this.side,
                type: this.type === 'tank' ? 'shell' : 'bullet',
                progress: 0
            };
            simProjectiles.push(p);

            // Trigger log updates on specific milestones randomly to not overflow
            if (Math.random() < 0.05) {
                triggerSimulationLog(this);
            }
        }

        takeDamage(dmg) {
            this.hp -= dmg;
            if (this.hp <= 0) {
                this.hp = 0;
                this.alive = false;
                
                // Explode
                simExplosions.push(new Explosion(this.x, this.y, this.type === 'tank' ? 24 : 10));
                
                // Log death occasionally
                if (Math.random() < 0.15 || this.type === 'tank') {
                    const unitName = `${this.side.toUpperCase()} ${this.type.toUpperCase()}`;
                    const line = `[C-NET] ${unitName} unit eliminated in Grid Sector.`;
                    appendLogLine(line, this.side === 'vanguard' ? 'vanguard-line' : 'apex-line');
                }
                
                updateForcesCount();
            }
        }

        draw() {
            simCtx.save();
            
            // Set drawing colors
            const color = this.side === 'vanguard' ? '#008cf0' : '#ff3c3c';
            simCtx.fillStyle = color;
            simCtx.strokeStyle = color;
            
            if (this.type === 'infantry') {
                simCtx.beginPath();
                simCtx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
                simCtx.fill();
            } 
            else if (this.type === 'tank') {
                simCtx.beginPath();
                simCtx.rect(this.x - this.radius, this.y - this.radius*0.6, this.radius*2, this.radius*1.2);
                simCtx.fill();
                
                // Turret pointing to target
                let angle = 0;
                if (this.target) {
                    angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                } else {
                    angle = this.side === 'vanguard' ? 0 : Math.PI;
                }
                simCtx.strokeStyle = '#fff';
                simCtx.lineWidth = 2;
                simCtx.beginPath();
                simCtx.moveTo(this.x, this.y);
                simCtx.lineTo(this.x + Math.cos(angle) * 12, this.y + Math.sin(angle) * 12);
                simCtx.stroke();
            } 
            else if (this.type === 'helicopter') {
                // Helicopter cross drawing
                simCtx.beginPath();
                simCtx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
                simCtx.stroke();
                
                // Rotor blades representation
                simCtx.lineWidth = 1;
                simCtx.beginPath();
                simCtx.moveTo(this.x - 10, this.y);
                simCtx.lineTo(this.x + 10, this.y);
                simCtx.moveTo(this.x, this.y - 10);
                simCtx.lineTo(this.x, this.y + 10);
                simCtx.stroke();
            }

            // Small Health Bar
            if (this.hp < this.maxHp) {
                const hpPercent = this.hp / this.maxHp;
                simCtx.fillStyle = 'rgba(0,0,0,0.5)';
                simCtx.fillRect(this.x - 6, this.y - this.radius - 6, 12, 2);
                simCtx.fillStyle = hpPercent > 0.4 ? '#00ff66' : '#ff3c3c';
                simCtx.fillRect(this.x - 6, this.y - this.radius - 6, 12 * hpPercent, 2);
            }

            simCtx.restore();
        }
    }

    class Explosion {
        constructor(x, y, maxRadius) {
            this.x = x;
            this.y = y;
            this.radius = 2;
            this.maxRadius = maxRadius;
            this.opacity = 1.0;
            this.speed = 1.2;
        }
        update() {
            this.radius += this.speed;
            this.opacity -= 0.04;
        }
        draw() {
            if (this.opacity <= 0) return;
            simCtx.save();
            simCtx.beginPath();
            const grad = simCtx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.radius);
            grad.addColorStop(0, 'rgba(255, 230, 150, ' + this.opacity + ')');
            grad.addColorStop(0.3, 'rgba(255, 120, 0, ' + this.opacity * 0.8 + ')');
            grad.addColorStop(1, 'rgba(100, 10, 0, 0)');
            simCtx.fillStyle = grad;
            simCtx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            simCtx.fill();
            simCtx.restore();
        }
    }

    function setupSimulationEntities() {
        simEntities = [];
        simProjectiles = [];
        simExplosions = [];
        
        // Fetch values
        const vTroops = parseInt(troopsSlider.value);
        const vTanks = parseInt(tanksSlider.value);
        const vCopters = parseInt(coptersSlider.value);
        const intel = parseInt(intelSlider.value); // Intel increases Vanguard parameters

        // APEX variables balanced based on Vanguard input
        const aTroops = Math.round(vTroops * (0.8 + Math.random() * 0.4));
        const aTanks = Math.round(vTanks * (0.8 + Math.random() * 0.4));
        const aCopters = Math.round(vCopters * (0.8 + Math.random() * 0.4));

        baseVanguardMax = vTroops + vTanks + vCopters;
        baseApexMax = aTroops + aTanks + aCopters;
        
        vanguardLeft = baseVanguardMax;
        apexLeft = baseApexMax;

        // Populate Vanguard (Spawn Left)
        for (let i = 0; i < vTroops; i++) {
            const ent = new CombatEntity('vanguard', 'infantry', Math.random() * 150 + 20, Math.random() * (simCanvas.height - 40) + 20);
            // Apply intel buff
            ent.fireRate = ent.fireRate * (1 - (intel / 200)); 
            simEntities.push(ent);
        }
        for (let i = 0; i < vTanks; i++) {
            const ent = new CombatEntity('vanguard', 'tank', Math.random() * 100 + 20, Math.random() * (simCanvas.height - 60) + 30);
            simEntities.push(ent);
        }
        for (let i = 0; i < vCopters; i++) {
            const ent = new CombatEntity('vanguard', 'helicopter', Math.random() * 120 + 20, Math.random() * (simCanvas.height - 80) + 40);
            simEntities.push(ent);
        }

        // Populate Apex Coalition (Spawn Right)
        for (let i = 0; i < aTroops; i++) {
            simEntities.push(new CombatEntity('apex', 'infantry', simCanvas.width - (Math.random() * 150 + 20), Math.random() * (simCanvas.height - 40) + 20));
        }
        for (let i = 0; i < aTanks; i++) {
            simEntities.push(new CombatEntity('apex', 'tank', simCanvas.width - (Math.random() * 100 + 20), Math.random() * (simCanvas.height - 60) + 30));
        }
        for (let i = 0; i < aCopters; i++) {
            simEntities.push(new CombatEntity('apex', 'helicopter', simCanvas.width - (Math.random() * 120 + 20), Math.random() * (simCanvas.height - 80) + 40));
        }

        updateForcesCount();
    }

    function updateForcesCount() {
        const vAlive = simEntities.filter(e => e.alive && e.side === 'vanguard').length;
        const aAlive = simEntities.filter(e => e.alive && e.side === 'apex').length;

        vanguardLeft = vAlive;
        apexLeft = aAlive;

        // UI percentage bars
        const vPercent = (vAlive / baseVanguardMax) * 100;
        const aPercent = (aAlive / baseApexMax) * 100;

        meterVanguard.style.width = `${vPercent}%`;
        meterApex.style.width = `${aPercent}%`;

        numVanguard.textContent = vAlive;
        numApex.textContent = aAlive;
    }

    function triggerSimulationLog(entity) {
        const sentences = {
            vanguard: [
                `Vanguard squad maneuvers around flank.`,
                `Vanguard tactical drones lock on targets.`,
                `Vanguard fireteam lays down suppressive fire.`,
                `Vanguard commander Gen. Vance signals support strike.`
            ],
            apex: [
                `Apex armored divisions advance lines.`,
                `Apex heavy artillery initiates bombing run.`,
                `Apex shock troops breach defensive trench.`,
                `Apex tactical comms report incoming armor division.`
            ]
        };

        const list = sentences[entity.side];
        const line = `[LOG] ${list[Math.floor(Math.random() * list.length)]}`;
        appendLogLine(line, entity.side === 'vanguard' ? 'vanguard-line' : 'apex-line');
    }

    function appendLogLine(text, cssClass = '') {
        const div = document.createElement('div');
        div.className = `log-line ${cssClass}`;
        
        // Add clock label
        const elapsed = getElapsedSimTimeString();
        div.innerHTML = `<span class="system-line">[${elapsed}]</span> ${text}`;
        
        battleFeed.appendChild(div);
        
        // Scroll to bottom
        battleFeed.scrollTop = battleFeed.scrollHeight;
    }

    function getElapsedSimTimeString() {
        if (!simActive) return "00:00:00";
        const totalMs = Date.now() - simTimeStart;
        const totalSecs = Math.floor(totalMs / 1000);
        const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
        const secs = String(totalSecs % 60).padStart(2, '0');
        const ms = String(Math.floor((totalMs % 1000) / 10)).padStart(2, '0');
        return `${mins}:${secs}:${ms}`;
    }

    // Main animation loop
    function updateSimulation(timestamp) {
        if (!simActive) return;

        // FPS calculation
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;
        lastTime = timestamp;
        fpsInterval += delta;
        if (fpsInterval > 500) {
            calculatedFps = Math.round(1000 / delta);
            simFpsHud.textContent = `FPS: ${calculatedFps}`;
            fpsInterval = 0;
        }

        // Timer HUD update
        simTimerHud.textContent = getElapsedSimTimeString();

        // Clear view
        simCtx.fillStyle = '#06090c';
        simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);

        // Update & Draw Entities
        let vanguardAlive = 0;
        let apexAlive = 0;

        for (let e of simEntities) {
            if (e.alive) {
                e.update();
                e.draw();
                if (e.side === 'vanguard') vanguardAlive++;
                else apexAlive++;
            }
        }

        // Projectiles update
        for (let i = simProjectiles.length - 1; i >= 0; i--) {
            const p = simProjectiles[i];
            
            // Linear progression interpolation to target coordinate
            p.progress += p.speed;
            
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            const dist = Math.hypot(dx, dy);

            if (p.progress >= dist) {
                // Impact!
                if (p.target && p.target.alive) {
                    p.target.takeDamage(p.damage);
                }
                
                // Shell triggers larger secondary explosion
                if (p.type === 'shell') {
                    simExplosions.push(new Explosion(p.tx, p.ty, 18));
                }
                
                simProjectiles.splice(i, 1);
            } else {
                // Drawing projectile line
                const ratio = p.progress / dist;
                const px = p.x + dx * ratio;
                const py = p.y + dy * ratio;

                simCtx.beginPath();
                simCtx.strokeStyle = p.side === 'vanguard' ? '#00f0ff' : '#ff9d00';
                simCtx.lineWidth = p.type === 'shell' ? 3 : 1.5;
                simCtx.moveTo(px, py);
                simCtx.lineTo(px - (dx/dist) * 8, py - (dy/dist) * 8);
                simCtx.stroke();
            }
        }

        // Explosions update
        for (let i = simExplosions.length - 1; i >= 0; i--) {
            const exp = simExplosions[i];
            exp.update();
            exp.draw();
            if (exp.opacity <= 0) {
                simExplosions.splice(i, 1);
            }
        }

        // Check Victory conditions
        if (vanguardAlive === 0 || apexAlive === 0) {
            endSimulation(vanguardAlive > 0 ? 'vanguard' : 'apex');
            return;
        }

        simLoopId = requestAnimationFrame(updateSimulation);
    }

    function endSimulation(winner) {
        simActive = false;
        cancelAnimationFrame(simLoopId);
        playSound('alarm');

        simPhaseHud.textContent = `STATUS: OPERATION COMPLETE`;
        
        const finalTime = getElapsedSimTimeString();
        
        if (winner === 'vanguard') {
            appendLogLine(`[SYS] MISSION ACCOMPLISHED. Vanguard Alliance secures Sector 45-B.`, 'vanguard-line');
            appendLogLine(`[SYS] Final Combat Duration: ${finalTime}. Tactical Score: S-RANK.`, 'neutral-line');
            drawOverlayVictoryBanner("VICTORY", "#008cf0");
        } else {
            appendLogLine(`[SYS] OPERATION FAILURE. Apex Coalition captures regional base.`, 'apex-line');
            appendLogLine(`[SYS] Final Combat Duration: ${finalTime}. Defensive lines broken.`, 'neutral-line');
            drawOverlayVictoryBanner("DEFEAT", "#ff3c3c");
        }

        startSimBtn.textContent = 'COMMENCE OPERATION';
        startSimBtn.disabled = false;
    }

    function drawOverlayVictoryBanner(text, color) {
        simCtx.save();
        simCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);
        
        simCtx.strokeStyle = color;
        simCtx.lineWidth = 3;
        simCtx.strokeRect(50, 150, simCanvas.width - 100, 150);
        simCtx.fillStyle = 'rgba(10, 15, 20, 0.9)';
        simCtx.fillRect(50, 150, simCanvas.width - 100, 150);

        // Text display
        simCtx.fillStyle = color;
        simCtx.font = 'bold 36px Orbitron';
        simCtx.textAlign = 'center';
        simCtx.textBaseline = 'middle';
        simCtx.fillText(`VANGUARD ${text}`, simCanvas.width / 2, 205);
        
        simCtx.fillStyle = '#718096';
        simCtx.font = '12px Orbitron';
        simCtx.fillText(`TACTICAL DECODE ARCHIVE COMPLETE. CLICK RESET TO COMMENCE NEW OPERATION.`, simCanvas.width / 2, 255);
        
        simCtx.restore();
    }

    startSimBtn.addEventListener('click', () => {
        if (simActive) return;

        playSound('alarm');
        
        simActive = true;
        simTimeStart = Date.now();
        simPhaseHud.textContent = `STATUS: ENGAGEMENT IN PROGRESS...`;
        
        startSimBtn.textContent = 'SIMULATING...';
        startSimBtn.disabled = true;

        appendLogLine(`[SYS] COMMENCING TACTICAL OPERATION IN SECTOR 45-B...`, 'neutral-line');
        appendLogLine(`[SYS] Vanguard forces deployed: ${troopsSlider.value} infantry, ${tanksSlider.value} armor units.`, 'vanguard-line');
        
        setupSimulationEntities();
        lastTime = 0;
        simLoopId = requestAnimationFrame(updateSimulation);
    });

    resetSimBtn.addEventListener('click', () => {
        playSound('click');
        simActive = false;
        cancelAnimationFrame(simLoopId);
        
        simCtx.clearRect(0, 0, simCanvas.width, simCanvas.height);
        simTimerHud.textContent = '00:00:00';
        simPhaseHud.textContent = 'STATUS: AWAITING DEPLOYMENT';
        
        startSimBtn.textContent = 'COMMENCE OPERATION';
        startSimBtn.disabled = false;

        // Clear logs
        battleFeed.innerHTML = '<div class="log-line system-line">[SYS] Tactical map calibrated. Select assets and click "COMMENCE OPERATION".</div>';
        
        setupSimulationEntities();
    });

    // Run initial canvas drawing structure setup on load
    setupSimulationEntities();
    simCtx.fillStyle = '#06090c';
    simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);


    // --- TAB 4: DOSSIER DRAFT DRAFT CARD CREATOR ---
    const idCanvas = document.getElementById('id-card-canvas');
    const idCtx = idCanvas.getContext('2d');
    const draftForm = document.getElementById('draft-registration-form');
    const downloadIdBtn = document.getElementById('btn-download-id');
    const idDownloadStatus = document.getElementById('id-download-status');

    function drawIdCard() {
        // Set dimensions (400x250)
        const w = idCanvas.width;
        const h = idCanvas.height;

        // 1. Background design
        const grad = idCtx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0c0f13');
        grad.addColorStop(1, '#182029');
        idCtx.fillStyle = grad;
        idCtx.fillRect(0, 0, w, h);

        // Tech Blueprint Grid lines
        idCtx.save();
        idCtx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        idCtx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < w; x += gridSize) {
            idCtx.beginPath();
            idCtx.moveTo(x, 0);
            idCtx.lineTo(x, h);
            idCtx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            idCtx.beginPath();
            idCtx.moveTo(0, y);
            idCtx.lineTo(w, y);
            idCtx.stroke();
        }
        idCtx.restore();

        // 2. HUD Border Neon outline
        const borderGlow = state.theme === 'night' ? '#00ff66' : '#ff9d00';
        idCtx.strokeStyle = borderGlow;
        idCtx.lineWidth = 2;
        idCtx.strokeRect(10, 10, w - 20, h - 20);

        // Cyber corner bracket details
        idCtx.fillStyle = borderGlow;
        // Top-left
        idCtx.fillRect(6, 6, 15, 3); idCtx.fillRect(6, 6, 3, 15);
        // Top-right
        idCtx.fillRect(w - 21, 6, 15, 3); idCtx.fillRect(w - 9, 6, 3, 15);
        // Bottom-left
        idCtx.fillRect(6, h - 9, 15, 3); idCtx.fillRect(6, h - 21, 3, 15);
        // Bottom-right
        idCtx.fillRect(w - 21, h - 9, 15, 3); idCtx.fillRect(w - 9, h - 21, 3, 15);

        // 3. Card Title Header
        idCtx.fillStyle = '#ffffff';
        idCtx.font = '900 12px Orbitron';
        idCtx.fillText('VANGUARD HOMELAND COALITION', 25, 32);

        idCtx.fillStyle = borderGlow;
        idCtx.font = '700 8px Orbitron';
        idCtx.fillText('TACTICAL COMMAND SPECIAL OPS ID', 25, 43);

        // Horizontal separator lines
        idCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        idCtx.lineWidth = 1;
        idCtx.beginPath();
        idCtx.moveTo(25, 52);
        idCtx.lineTo(w - 25, 52);
        idCtx.stroke();

        // 4. Commander Avatar Frame
        idCtx.strokeStyle = borderGlow;
        idCtx.strokeRect(25, 70, 90, 110);
        idCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        idCtx.fillRect(25, 70, 90, 110);

        // Draw futuristic commander avatar silhouette on canvas
        idCtx.save();
        idCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        idCtx.lineWidth = 1.5;
        // Neck/Head outline
        idCtx.beginPath();
        idCtx.moveTo(45, 175);
        idCtx.quadraticCurveTo(45, 150, 70, 150); // shoulders
        idCtx.quadraticCurveTo(95, 150, 95, 175);
        idCtx.moveTo(70, 150);
        idCtx.lineTo(70, 138); // neck
        idCtx.stroke();
        
        // Helmet/Head oval
        idCtx.beginPath();
        idCtx.fillStyle = borderGlow;
        idCtx.arc(70, 115, 22, 0, Math.PI * 2);
        idCtx.fill();
        
        // Helmet Visor glowing overlay
        idCtx.fillStyle = '#0a0c10';
        idCtx.beginPath();
        idCtx.arc(70, 115, 16, Math.PI * 1.1, Math.PI * 1.9);
        idCtx.fill();
        idCtx.restore();

        // 5. Data text fields
        const xOffset = 135;
        idCtx.fillStyle = '#718096';
        idCtx.font = '700 7px Orbitron';

        idCtx.fillText('COMMANDER SURNAME', xOffset, 78);
        idCtx.fillText('MILITARY SPECIALIZATION', xOffset, 108);
        idCtx.fillText('BLOOD TYPE', xOffset, 138);
        idCtx.fillText('ISSUE STAMP', xOffset, 168);

        idCtx.fillStyle = '#ffffff';
        idCtx.font = '600 13px Inter';
        
        // Commander name string
        const nameText = state.commander.name ? state.commander.name.toUpperCase() : 'BRYANT (UNREGISTERED)';
        idCtx.fillText(nameText, xOffset, 93);
        
        // Specialization role
        idCtx.fillStyle = borderGlow;
        idCtx.font = '700 11px Orbitron';
        idCtx.fillText(state.commander.role, xOffset, 121);

        // Blood Type
        idCtx.fillStyle = '#ffffff';
        idCtx.font = '600 11px Inter';
        idCtx.fillText(state.commander.blood, xOffset, 151);

        // Date Stamp
        idCtx.fillText('2045.10.12 // SECTOR-07', xOffset, 181);

        // 6. Barcode at bottom
        idCtx.fillStyle = '#ffffff';
        const barcodeX = 25;
        const barcodeY = 195;
        const barcodeH = 15;
        
        // Generate random sequence pattern
        const barcodePattern = [2,4,1,3,2,1,4,2,3,1,2,4,1,3,2,1,4,2,3,1,2,4,1,3,2,1,4,2,1,2,4,2];
        let runningX = barcodeX;
        for (let bar of barcodePattern) {
            idCtx.fillRect(runningX, barcodeY, bar, barcodeH);
            runningX += bar + 2;
        }

        // Initials Signature overlay
        idCtx.save();
        idCtx.fillStyle = borderGlow;
        idCtx.font = 'italic 18px cursive';
        const sigText = state.commander.signature ? state.commander.signature : 'J.B.';
        idCtx.fillText(sigText, 290, 208);
        idCtx.restore();

        idCtx.fillStyle = '#718096';
        idCtx.font = '700 7px Orbitron';
        idCtx.fillText('BARCODE AUTHORIZED CREDENTIAL', barcodeX, 222);
        idCtx.fillText('DRAFT INITIAL SIGNATURE', 260, 222);
    }

    // Form Submit logic
    draftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        playSound('alarm');

        // Capture values
        state.commander.name = document.getElementById('commander-name').value;
        state.commander.role = document.getElementById('commander-role').value;
        state.commander.blood = document.getElementById('commander-blood').value;
        state.commander.signature = document.getElementById('commander-signature').value;

        // Render card
        drawIdCard();

        // Enable Export
        downloadIdBtn.disabled = false;
        idDownloadStatus.textContent = 'CREDENTIAL DOSSIER READY';
        idDownloadStatus.style.color = 'var(--hud-cyan)';
    });

    // Card Export click trigger
    downloadIdBtn.addEventListener('click', () => {
        playSound('tab');
        
        const dataUrl = idCanvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `VANGUARD_DOSSIER_${state.commander.name || 'COMMANDER'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Run initial card design layout on start
    drawIdCard();

    // Trigger weapon configurator stats update initially
    updateWeaponConfigUI('optic', 'standard');

});
