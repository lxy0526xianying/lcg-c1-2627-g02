const COLORE_PERSONAGGIO = "0xE44A4A";

const QUADRATO = 120;
const QUADRATINO = 40;   
const L_LIVELLO = 232 * QUADRATO;   
const A_LIVELLO = 12 * QUADRATO;   
const SPAZIO_SOPRA = 600;   

const Y_TERRENO = 600;
const ANTICIPO_CAMERA = 200;

const X_PERSONAGGIO = 180;
const L_PERSONAGGIO = 120;
const A_PERSONAGGIO = 120;
const VEL_CORSA = 300;
const ATTRITO = 1200;

// Doppio salto
const SALTI_MAX = 2;
let salti = 0;
const VEL_SALTO = 1000;

// Vite e barra vita a quadratini
const VITE_MAX = 5;
let vite = VITE_MAX;
let cuori_vita = []; 
const L_QUADRATINO_VITA = 16; 
const A_QUADRATINO_VITA = 16; 
const Y_BARRA_VITA = 75;      
const COLORE_VITA_ACCESO = "0xFF0000"; 
const X_INIZIO_BARRA_VITA = 20;

let tempo_ultimo_danno = 0;

// Tasti
const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;
const TASTO_SALTO = PP.key_codes.UP;
const TASTO_E = PP.key_codes.E; 

// Barra dell'acqua
const ACQUA_MAX = 100;
const L_BARRA_ACQUA = 200;
const A_BARRA_ACQUA = 20;
const X_BARRA_ACQUA = 120;
const Y_BARRA_ACQUA = 40;
const COLORE_ACQUA = "0x4A90E2";
const X_INIZIO_BARRA_ACQUA = 20;

let acqua = ACQUA_MAX;
let barra_acqua;

let personaggio;
let pozze = [];
let offset_camera_y = 180;

let img_tasto_e;
let tasto_e_sprite; 

const X_INIZIO_SOTTERRANEO = 81 * QUADRATO;    
const X_FINE_SOTTERRANEO   = 122 * QUADRATO;   

function preload(s) {
    img_terreno = PP.assets.image.load(s, "./assets/images/testterrano.png");   
    img_verde = PP.assets.image.load_color(s, "0x76B08A", 120, 120);  
    img_piattaforma = PP.assets.image.load_color(s, "0xE36BD6", 120, 40);
    img_piattaforma_tempo = PP.assets.image.load_color(s, "0x9C60F6", 40, 40);
    img_villager = PP.assets.image.load(s, "./assets/images/villager_120X120.png");  
    img_tubo = PP.assets.image.load_color(s, "0x8EAB4E", 120, 120);
    img_edificio = PP.assets.image.load_color(s, "0x968C8C", 120, 120);
    img_acqua_tossica = PP.assets.image.load_color(s, "0x1E3529", 120, 120);  
    img_ossa = PP.assets.image.load_color(s, "0xF2DFB0", 40, 40);  
    img_casa = PP.assets.image.load_color(s, "0xE36BD6", 120, 120);  
    img_oasi = PP.assets.image.load_color(s, "0xA3EAE2", 120, 120);  
    img_tasto_e = PP.assets.image.load(s, "./assets/images/tasto_e.png");
}

function create(s) {
    crea_villager(s, 64, 4);   
    crea_casa(s, 140, 3, 1, 2);   
    crea_casa(s, 141, 2, 4, 3);   
    crea_personaggio(s);
    crea_mappa(s);
    crea_camera(s);
    crea_barra_acqua(s);
    crea_barra_vita(s); 

    // Creazione pulita dello sprite nascosto fuori dallo schermo
    tasto_e_sprite = PP.assets.image.add(s, img_tasto_e, -500, -500, 0.5, 0.5);
    tasto_e_sprite.geometry.visible = false;

    PP.timers.add_timer(
        s,
        5000,
        consuma_acqua,
        true
    );
}

function crea_blocco(s, immagine, colonna, riga, larghezza, altezza) {
    let blocco = PP.assets.tilesprite.add(
        s,
        immagine,
        colonna * QUADRATO,    
        riga * QUADRATO,        
        larghezza * QUADRATO,   
        altezza * QUADRATO,    
        0, 0                    
    );
    PP.physics.add(s, blocco, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, blocco);
}

function crea_piattaforma_fissa(s, colonna, riga, larghezza) {
    let piattaforma = PP.assets.tilesprite.add(
        s,
        img_piattaforma,
        colonna * QUADRATINO,    
        riga * QUADRATINO,        
        larghezza * QUADRATINO,   
        QUADRATINO,               
        0, 0
    );
    PP.physics.add(s, piattaforma, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, piattaforma);
}

function crea_piattaforma_a_tempo(s, colonna, riga, larghezza) {
    let piattaforma = PP.assets.tilesprite.add(
        s,
        img_piattaforma_tempo,      
        colonna * QUADRATINO,
        riga * QUADRATINO,
        larghezza * QUADRATINO,
        QUADRATINO,
        0, 0
    );
    PP.physics.add(s, piattaforma, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, piattaforma);
}

function crea_villager(s, colonna, riga) {
    PP.assets.image.add(s, img_villager, colonna * QUADRATO, riga * QUADRATO, 0, 0);
}

function crea_tubo(s, colonna, riga, larghezza, altezza) {
    PP.assets.tilesprite.add(s, img_tubo, colonna * QUADRATO, riga * QUADRATO, larghezza * QUADRATO, altezza * QUADRATO, 0, 0);
}

function crea_ossa(s, colonna, riga, larghezza) {
    let ossa = PP.assets.tilesprite.add(s, img_ossa, colonna * QUADRATINO, riga * QUADRATINO, larghezza * QUADRATINO, 2 * QUADRATINO, 0, 0);
    PP.physics.add(s, ossa, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, ossa);
}

function crea_casa(s, colonna, riga, larghezza, altezza) {
    PP.assets.tilesprite.add(s, img_casa, colonna * QUADRATO, riga * QUADRATO, larghezza * QUADRATO, altezza * QUADRATO, 0, 0);
}

function crea_acqua(s, colonna, riga, larghezza, altezza) {
    let pozza = PP.assets.tilesprite.add(
        s,
        img_verde,
        colonna * QUADRATO,       
        riga * QUADRATO,          
        larghezza * QUADRATO,    
        altezza * QUADRATO,      
        0, 0
    );
    PP.physics.add(s, pozza, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, pozza);
    pozze.push(pozza);
}

function crea_acqua_piccola(s, colonna, riga, larghezza) {
    let pozza = PP.assets.tilesprite.add(
        s,
        img_verde,
        colonna * QUADRATINO,    
        riga * QUADRATINO,        
        larghezza * QUADRATINO,   
        26,                        
        0, 0
    );
    pozze.push(pozza);
}

function crea_mappa(s) {
    crea_blocco(s, img_terreno,    0,  5,  8,  1);   
    crea_acqua(s,                  8,  5,  2,  1);   
    crea_blocco(s, img_terreno,   10,  5, 12,  1);   
    crea_blocco(s, img_terreno,   13,  4,  6,  1);   
    crea_blocco(s, img_terreno,   15,  3,  3,  1);   
    crea_acqua(s,                 22,  5, 16,  1);   
    crea_blocco(s, img_terreno,   38,  5, 4,  1);
    crea_acqua(s,                 42,  5,  4,  1);   
    crea_blocco(s, img_terreno,   46,  5, 35,  1);
    crea_blocco(s, img_terreno,  81,  6,  1,  3);   
    crea_blocco(s, img_terreno,  82,  8,  1,  1);   
    crea_blocco(s, img_terreno,  82,  9,  4,  1);  
    crea_blocco(s, img_terreno,  85, 10,  1,  2);   

    crea_blocco(s, img_terreno, 121,  6,  1,  3);   
    crea_blocco(s, img_terreno, 120,  8,  1,  1);   
    crea_blocco(s, img_terreno, 117,  9,  4,  1);   
    crea_blocco(s, img_terreno, 117, 10,  1,  2);

    crea_tubo(s, 72,  4, 9,  1);

    crea_piattaforma_fissa(s,  70, 11, 3);
    crea_piattaforma_fissa(s,  78,  8, 3);
    crea_piattaforma_fissa(s,  85, 14, 6);
    crea_piattaforma_fissa(s,  96,  9, 6);
    crea_piattaforma_fissa(s, 107, 12, 3);
    crea_piattaforma_fissa(s, 216, 11, 12);
    crea_piattaforma_fissa(s, 261, 24,  4);
    crea_piattaforma_fissa(s, 276, 26,  6);
    crea_piattaforma_fissa(s, 297, 29, 12);   
    crea_piattaforma_fissa(s, 321, 22,  6);
    crea_piattaforma_fissa(s, 341, 23,  4);

    crea_acqua_piccola(s, 298, 29, 10);   

    crea_piattaforma_a_tempo(s, 129, 11, 3);
    crea_piattaforma_a_tempo(s, 268, 21, 5);
    crea_piattaforma_a_tempo(s, 288, 23, 4);
    crea_piattaforma_a_tempo(s, 315, 26, 3);
    crea_piattaforma_a_tempo(s, 332, 26, 4);
    crea_piattaforma_a_tempo(s, 333, 18, 4);
    crea_piattaforma_a_tempo(s, 347, 27, 3);

    crea_blocco(s, img_edificio, 76, 0, 51, 4);

    crea_tubo(s,                   122,  4,  9,  1);      
    crea_blocco(s, img_terreno,    122,  5, 12,  1);      
    crea_piattaforma_fissa(s, 381, 11, 12);               
    crea_acqua(s,                  134,  5,  3,  1);      
    crea_blocco(s, img_terreno,    137,  5, 24,  1);      

    crea_blocco(s, img_terreno,    156,  4,  5,  1);      
    crea_blocco(s, img_terreno,    158,  3,  5,  1);      
    crea_blocco(s, img_acqua_tossica, 161, 5, 30,  1);    

    crea_ossa(s,              495, 14, 15);
    crea_ossa(s,              520, 14,  6);
    crea_ossa(s,              532, 14,  3);
    crea_ossa(s,              546, 14,  3);
    crea_ossa(s,              554, 14,  1);
    crea_ossa(s,              564, 14,  7);

    crea_blocco(s, img_terreno,    190,  3,  5,  1);      
    crea_acqua_piccola(s, 572,  9, 11);   
    crea_blocco(s, img_terreno,    192,  4,  5,  1);      
    crea_blocco(s, img_terreno,    191,  5, 31,  1);      
    crea_blocco(s, img_oasi,       222,  5,  8,  1);      
    crea_blocco(s, img_terreno,    230,  5,  2,  1);      
}

function crea_barra_acqua(s) {
    barra_acqua = PP.shapes.rectangle_add(s, X_BARRA_ACQUA, Y_BARRA_ACQUA, L_BARRA_ACQUA, A_BARRA_ACQUA, COLORE_ACQUA, 1);
    barra_acqua.tile_geometry.scroll_factor_x = 0;
    barra_acqua.tile_geometry.scroll_factor_y = 0;
}

function crea_barra_vita(s) {
    cuori_vita = [];
    for (let i = 0; i < VITE_MAX; i++) {
        let x_quadratino = X_INIZIO_BARRA_VITA + (i * (L_QUADRATINO_VITA + 6)); 
        let quadratino = PP.shapes.rectangle_add(s, x_quadratino, Y_BARRA_VITA, L_QUADRATINO_VITA, A_QUADRATINO_VITA, COLORE_VITA_ACCESO, 1);
        quadratino.tile_geometry.scroll_factor_x = 0;
        quadratino.tile_geometry.scroll_factor_y = 0;
        cuori_vita.push(quadratino);
    }
}

function aggiorna_barra_vita() {
    for (let i = 0; i < cuori_vita.length; i++) {
        if (i < vite) {
            cuori_vita[i].geometry.visible = true;  
        } else {
            cuori_vita[i].geometry.visible = false; 
        }
    }
}

function consuma_acqua(s) {
    if (acqua > 0) {
        acqua -= 1;
    }
    aggiorna_barra_acqua();
}

function aggiorna_barra_acqua() {
    let scala = acqua / ACQUA_MAX;
    barra_acqua.geometry.scale_x = scala;
    barra_acqua.geometry.x = X_INIZIO_BARRA_ACQUA + (L_BARRA_ACQUA * scala) / 2;
}

function crea_personaggio(s) {
    personaggio = PP.shapes.rectangle_add(s, X_PERSONAGGIO, Y_TERRENO - A_PERSONAGGIO / 2, L_PERSONAGGIO, A_PERSONAGGIO, COLORE_PERSONAGGIO, 1);
    PP.physics.add(s, personaggio, PP.physics.type.DYNAMIC);
    PP.physics.set_collide_world_bounds(personaggio, true);
    PP.physics.set_drag_x(personaggio, ATTRITO);
}

function salta(s) {
    if (PP.physics.is_on_ground(personaggio)) {
        salti = 0;
    }

    if (
        PP.interactive.kb.is_key_just_down(s, TASTO_SALTO)
        && salti < SALTI_MAX
    ) {
        PP.physics.set_velocity_y(personaggio, -VEL_SALTO);
        salti += 1;
    }
}

function cammina(s) {
    if (PP.interactive.kb.is_key_down(s, TASTO_SX)) {
        PP.physics.set_velocity_x(personaggio, -VEL_CORSA);
    } else if (PP.interactive.kb.is_key_down(s, TASTO_DX)) {
        PP.physics.set_velocity_x(personaggio, VEL_CORSA);
    } 
}

function gestisci_pozze(s) {
    let vicino_a_una_pozza = false;
    let tempo_corrente = s.time ? s.time.now : Date.now();

    for (let i = 0; i < pozze.length; i++) {
        let pozza = pozze[i];
        
        let pozza_x = pozza.geometry.x;
        let pozza_y = pozza.geometry.y;
        let pozza_l = pozza.geometry.width;
        let pozza_a = pozza.geometry.height;

        let pers_x = personaggio.geometry.x;
        let pers_y = personaggio.geometry.y;

        let distanza_x = Math.abs(pers_x - pozza_x);
        let distanza_y = Math.abs(pers_y - pozza_y);

        // Controllo vicinanza e se l'acqua non è al massimo
        if (distanza_x < 90 && distanza_y < 90) {
            if (acqua < ACQUA_MAX) {
                vicino_a_una_pozza = true;
                
                tasto_e_sprite.geometry.x = pozza_x;
                tasto_e_sprite.geometry.y = pozza_y - 40;
                tasto_e_sprite.geometry.visible = true;
            }

            // Se il giocatore preme "E", ricarica l'acqua e nasconde subito il tasto
            if (PP.interactive.kb.is_key_just_down(s, TASTO_E) && acqua < ACQUA_MAX) {
                acqua = ACQUA_MAX;
                aggiorna_barra_acqua();
                tasto_e_sprite.geometry.visible = false;
            }
        }

        // Controllo sprofondamento e danno
        let pers_sinistra = pers_x - (L_PERSONAGGIO / 2);
        let pers_destra = pers_x + (L_PERSONAGGIO / 2);
        let pers_fondo = pers_y + (A_PERSONAGGIO / 2);

        let dentro_x = pers_destra >= pozza_x && pers_sinistra <= (pozza_x + pozza_l);
        let dentro_y = pers_fondo >= pozza_y && pers_y <= (pozza_y + pozza_a + 20);

        if (dentro_x && dentro_y) {
            PP.physics.set_velocity_y(personaggio, 40);

            if (vite > 0 && (tempo_corrente - tempo_ultimo_danno > 1500)) {
                vite -= 1;
                tempo_ultimo_danno = tempo_corrente;
                aggiorna_barra_vita(); 
                console.log("Sei sprofondato nella pozza tossica! Vite rimaste: " + vite);
            }
        }
    }

    // Se non siamo vicini a nessuna pozza o l'acqua è piena, nasconde il tasto E
    if (!vicino_a_una_pozza) {
        tasto_e_sprite.geometry.visible = false;
    }
}

function crea_camera(s) {
    PP.physics.set_world_bounds(s, 0, -SPAZIO_SOPRA, L_LIVELLO, A_LIVELLO + SPAZIO_SOPRA);
    PP.camera.set_bounds(s, 0, 0, L_LIVELLO, A_LIVELLO);
    PP.camera.start_follow(s, personaggio, -ANTICIPO_CAMERA, 180);
}

function aggiorna_camera(s) {
    let x = personaggio.geometry.x;
    let obiettivo;

    if (x > X_INIZIO_SOTTERRANEO && x < X_FINE_SOTTERRANEO) {
        obiettivo = 0;      
    } else {
        obiettivo = 180;    
    }
    offset_camera_y = offset_camera_y + (obiettivo - offset_camera_y) * 0.08;
    PP.camera.set_follow_offset(s, -ANTICIPO_CAMERA, offset_camera_y);
}

function update(s) {
    cammina(s);
    salta(s);
    aggiorna_camera(s); 
    gestisci_pozze(s);
}

function destroy(s) {}

PP.scenes.add(
    "gioco",
    preload,
    create,
    update,
    destroy
);