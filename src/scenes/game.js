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
// 5 quadrati da 40x40 + 4 spazi da 10 = 240, lunga come la barra dell'acqua 5 个 40×40 的正方形 + 4 个 10 宽的空隙 = 240，和水量条一样长 //
const L_QUADRATINO_VITA = 40; 
const A_QUADRATINO_VITA = 40;   // uguale alla larghezza: è un quadrato 和宽一样：是正方形 //
const SPAZIO_VITA = 10;         // spazio tra i quadratini 小方块之间的空隙 //
const Y_BARRA_VITA = 80;   // centro: da 60 a 100, sotto la barra dell'acqua 中心：从 60 到 100，在水量条下面 //      
const COLORE_VITA_ACCESO = "0xFF0000"; 
const X_INIZIO_BARRA_VITA = 20;   // bordo sinistro, come la barra dell'acqua 左边缘，和水量条对齐 //

let tempo_ultimo_danno = 0;

// Tasti
const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;
const TASTO_SALTO = PP.key_codes.UP;
const TASTO_E = PP.key_codes.E; 

// Barra dell'acqua
const ACQUA_MAX = 100;
const L_BARRA_ACQUA = 240;   // lunga come la barra della vita 和血量条一样长 //
const A_BARRA_ACQUA = 20;
const X_BARRA_ACQUA = 140;   // centro = bordo sinistro 20 + metà larghezza 120 中心 = 左边缘 20 + 半个宽度 120 //
const Y_BARRA_ACQUA = 40;
const COLORE_ACQUA = "0x4A90E2";
const X_INIZIO_BARRA_ACQUA = 20;

let acqua = ACQUA_MAX;
let barra_acqua;

let personaggio;
let pozze = [];
// La pozza in cui si trova il personaggio adesso (null = in nessuna) 角色现在泡在哪块水里（null = 不在水里） //
let pozza_attuale = null;
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
    tasto_e_sprite.visibility.hidden = true;     // nascondi 隐藏

    PP.timers.add_timer(
        s,
        2000,
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

// tipo: "verde" (bevibile, toglie vita), "tossica" (uccide subito, non bevibile), "oasi" (bevibile, non fa male) //
// tipo（种类）："verde" 绿水（能喝，会扣血）、"tossica" 毒水（一碰就死，不能喝）、"oasi" 绿洲水（能喝，不伤人） //
function crea_acqua(s, colonna, riga, larghezza, altezza, tipo) {
    // Scegli l'immagine in base al tipo 根据种类选图片 //
    let immagine = img_verde;
    if (tipo == "tossica") {
        immagine = img_acqua_tossica;
    } else if (tipo == "oasi") {
        immagine = img_oasi;
    }

    let pozza = PP.assets.tilesprite.add(
        s,
        immagine,
        colonna * QUADRATO,       
        riga * QUADRATO,          
        larghezza * QUADRATO,    
        altezza * QUADRATO,      
        0, 0
    );
    // Salva il tipo dentro la pozza, così gestisci_pozze sa come comportarsi 把种类存进这块水里，gestisci_pozze 才知道该怎么处理 //
    pozza.tipo = tipo;
    // Nessuna fisica: il personaggio non sta sopra l'acqua, ci entra dentro 不加碰撞：角色不会站在水面上，而是会掉进水里 //
    pozze.push(pozza);
    // Fondo invisibile sotto la pozza: il personaggio si ferma dentro l'acqua e non cade fuori dal mondo 水下面放一块看不见的底：角色停在水里，不会掉出地图 //
    let fondo = PP.assets.tilesprite.add(
        s,
        img_terreno,
        colonna * QUADRATO,
        (riga + altezza) * QUADRATO,   // subito sotto l'acqua 紧贴在水的下面 //
        larghezza * QUADRATO,
        QUADRATO,
        0, 0
    );
    fondo.visibility.hidden = true;    // non si vede, ma blocca lo stesso 看不见，但照样能挡住角色 //
    PP.physics.add(s, fondo, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, fondo);
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
    pozza.tipo = "verde";   // anche questa è acqua verde 这片也是绿水 //
    pozze.push(pozza);

    // Fondo invisibile sotto l'acqua: il personaggio affonda di 26 pixel e poi si ferma 水下面看不见的底：角色沉下 26 像素后停住 //
    let fondo = PP.assets.tilesprite.add(
        s,
        img_terreno,
        colonna * QUADRATINO,
        riga * QUADRATINO + 26,     // subito sotto l'acqua 紧贴在水的下面 //
        larghezza * QUADRATINO,
        QUADRATINO,
        0, 0
    );
    fondo.visibility.hidden = true;    // non si vede, ma blocca lo stesso 看不见，但照样能挡住角色 //
    PP.physics.add(s, fondo, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, fondo);
}

// Solo immagine, senza fisica: il personaggio non si ferma sopra (in quadratini) 只有图片、没有物理：角色不会被它挡住（用小格子算） //
function crea_immagine_piccola(s, immagine, colonna, riga, larghezza, altezza) {
    PP.assets.tilesprite.add(
        s,
        immagine,
        colonna * QUADRATINO,
        riga * QUADRATINO,
        larghezza * QUADRATINO,
        altezza * QUADRATINO,
        0, 0
    );
}

// Blocco invisibile che ferma il personaggio (in quadratini) 看不见但能挡住角色的方块（用小格子算） //
function crea_solido_invisibile(s, colonna, riga, larghezza, altezza) {
    let solido = PP.assets.tilesprite.add(
        s,
        img_terreno,
        colonna * QUADRATINO,
        riga * QUADRATINO,
        larghezza * QUADRATINO,
        altezza * QUADRATINO,
        0, 0
    );
    solido.visibility.hidden = true;
    PP.physics.add(s, solido, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, solido);
}

function crea_mappa(s) {
    crea_blocco(s, img_terreno,    0,  5,  8,  1);   
    crea_acqua(s,                  8,  5,  2,  1, "verde");   
    crea_blocco(s, img_terreno,   10,  5, 12,  1);   
    crea_blocco(s, img_terreno,   13,  4,  6,  1);   
    crea_blocco(s, img_terreno,   15,  3,  3,  1);   
    crea_acqua(s,                 22,  5, 16,  1, "verde");   
    crea_blocco(s, img_terreno,   38,  5, 4,  1);
    crea_acqua(s,                 42,  5,  4,  1, "verde");   
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
    // Piattaforma con la pozza: l'immagine è intera, ma è solida solo ai lati (dove non c'è acqua) 带水洼的平台：图片是完整的，但只有两边（没水的地方）是实心的 //
    crea_immagine_piccola(s, img_piattaforma, 297, 29, 12, 1);   // immagine rosa intera 完整的粉色图片 //
    crea_solido_invisibile(s, 297, 29,  2, 1);                   // lato sinistro solido 左边实心 //
    crea_solido_invisibile(s, 307, 29,  2, 1);                   // lato destro solido 右边实心 //
    crea_piattaforma_fissa(s, 321, 22,  6);
    crea_piattaforma_fissa(s, 341, 23,  4);

    // Pozza un po' più corta: 8 quadratini, centrata sulla piattaforma 水洼稍微缩短：8 小格，放在平台正中间 //
    crea_acqua_piccola(s, 299, 29,  8);   

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
    crea_acqua(s,                  134,  5,  3,  1, "verde");      
    crea_blocco(s, img_terreno,    137,  5, 24,  1);      

    crea_blocco(s, img_terreno,    156,  4,  5,  1);      
    crea_blocco(s, img_terreno,    158,  3,  5,  1);      
    crea_acqua(s,                  161,  5, 30,  1, "tossica");   // acqua tossica 毒水 //    

    crea_ossa(s,              495, 14, 15);
    crea_ossa(s,              520, 14,  6);
    crea_ossa(s,              532, 14,  3);
    crea_ossa(s,              546, 14,  3);
    crea_ossa(s,              554, 14,  1);
    crea_ossa(s,              564, 14,  7);

    // Gradino con la pozza: immagine intera, solido solo ai lati 带水洼的台阶：图片完整，只有两边是实心的 //
    crea_immagine_piccola(s, img_terreno, 570,  9, 15, 3);       // immagine gialla intera (= 5 quadrati grandi) 完整的黄色图片（= 5 个大格） //
    crea_solido_invisibile(s, 570,  9,  2, 3);                   // lato sinistro solido 左边实心 //
    crea_solido_invisibile(s, 583,  9,  2, 3);                   // lato destro solido 右边实心 //
    crea_acqua_piccola(s, 572,  9, 11);   
    crea_blocco(s, img_terreno,    192,  4,  5,  1);      
    crea_blocco(s, img_terreno,    191,  5, 31,  1);      
    crea_acqua(s,                  222,  5,  8,  1, "oasi");      // acqua dell'oasi 绿洲水 //      
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
        // Il rettangolo si posiziona dal centro: bordo sinistro + metà larghezza 矩形按中心定位：左边缘 + 半个宽度 //
        let x_quadratino = X_INIZIO_BARRA_VITA + L_QUADRATINO_VITA / 2 + i * (L_QUADRATINO_VITA + SPAZIO_VITA);
        let quadratino = PP.shapes.rectangle_add(s, x_quadratino, Y_BARRA_VITA, L_QUADRATINO_VITA, A_QUADRATINO_VITA, COLORE_VITA_ACCESO, 1);
        quadratino.tile_geometry.scroll_factor_x = 0;
        quadratino.tile_geometry.scroll_factor_y = 0;
        cuori_vita.push(quadratino);
    }
}

function aggiorna_barra_vita() {
    for (let i = 0; i < cuori_vita.length; i++) {
        let quadratino = cuori_vita[i];
        // Bordo sinistro di questo quadratino 这个小方块的左边缘 //
        let bordo_sx = X_INIZIO_BARRA_VITA + i * (L_QUADRATINO_VITA + SPAZIO_VITA);

        if (vite >= i + 1) {
            // Vita intera: quadratino pieno 整条命：完整的方块 //
            quadratino.visibility.hidden = false;
            quadratino.geometry.scale_x = 1;
            quadratino.geometry.x = bordo_sx + L_QUADRATINO_VITA / 2;
        } else if (vite >= i + 0.5) {
            // Mezza vita: quadratino largo la metà, attaccato a sinistra 半条命：一半宽的方块，靠左 //
            quadratino.visibility.hidden = false;
            quadratino.geometry.scale_x = 0.5;
            quadratino.geometry.x = bordo_sx + L_QUADRATINO_VITA / 4;
        } else {
            // Vita persa: nascondi 丢掉的命：隐藏 //
            quadratino.visibility.hidden = true;
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
    pozza_attuale = null;   // all'inizio di ogni frame: non è in nessuna pozza 每一帧开始时先当作不在水里 //
    let tempo_corrente = s.time ? s.time.now : Date.now();

    for (let i = 0; i < pozze.length; i++) {
        let pozza = pozze[i];
        
        let pozza_x = pozza.geometry.x;
        let pozza_y = pozza.geometry.y;
        let pozza_l = pozza.geometry.display_width;    // larghezza della pozza 水的宽
        let pozza_a = pozza.geometry.display_height;   // altezza della pozza 水的高

        let pers_x = personaggio.geometry.x;
        let pers_y = personaggio.geometry.y;

        // Bordi del personaggio (il rettangolo si posiziona dal centro) 角色的左右边和脚底（矩形按中心定位） //
        let bordo_sx = pers_x - L_PERSONAGGIO / 2;
        let bordo_dx = pers_x + L_PERSONAGGIO / 2;
        let piedi = pers_y + A_PERSONAGGIO / 2;

        // Sulla riva o su una piattaforma appoggiata sull'acqua: 在岸上，或者站在贴着水面的平台上： //
        // i piedi sono al massimo 45 pixel sopra la superficie (una piattaforma è alta 40) e non sotto 脚最多比水面高 45 像素（平台厚 40），也不能低于水面 //
        // e il personaggio sta fermo su qualcosa (non mentre salta) 而且角色要站在东西上（跳在空中不算） //
        let sulla_riva = piedi <= pozza_y + 5
            && piedi >= pozza_y - 45
            && PP.physics.is_on_ground(personaggio);
        // Vicino in orizzontale: al massimo 90 pixel dal bordo sinistro o destro della pozza 横向靠近：离水的左边或右边不超过 90 像素 //
        let vicino_x = bordo_dx > pozza_x - 90 && bordo_sx < pozza_x + pozza_l + 90;

        // Controllo vicinanza e se l'acqua non è al massimo
        // L'acqua tossica non si può bere 毒水不能喝 //
        let bevibile = pozza.tipo != "tossica";

        if (bevibile && sulla_riva && vicino_x) {
            if (acqua < ACQUA_MAX) {
                vicino_a_una_pozza = true;
                
                // Il tasto E appare sopra la testa del personaggio E 图标出现在角色头顶 //
                tasto_e_sprite.geometry.x = pers_x;
                tasto_e_sprite.geometry.y = pers_y - A_PERSONAGGIO / 2 - 40;
                tasto_e_sprite.visibility.hidden = false;    // mostra 显示
            }

            // Se il giocatore preme "E", ricarica l'acqua e nasconde subito il tasto
            if (PP.interactive.kb.is_key_just_down(s, TASTO_E) && acqua < ACQUA_MAX) {
                acqua = ACQUA_MAX;
                aggiorna_barra_acqua();
                // Solo l'acqua verde toglie mezza vita; l'oasi no 只有绿水喝了扣半条命，绿洲水不扣 //
                if (pozza.tipo == "verde") {
                    vite = Math.max(0, vite - 0.5);   // senza scendere sotto 0 最少扣到 0 //
                    aggiorna_barra_vita();
                }
                tasto_e_sprite.visibility.hidden = true;     // nascondi 隐藏
            }
        }

        // Controllo sprofondamento e danno
        let pers_sinistra = pers_x - (L_PERSONAGGIO / 2);
        let pers_destra = pers_x + (L_PERSONAGGIO / 2);
        let pers_fondo = pers_y + (A_PERSONAGGIO / 2);

        // ">" e non ">=": se il personaggio tocca solo il bordo (sulla riva) non è dentro 用 ">" 不用 ">="：只是贴着水边（站在岸上）不算在水里 //
        let dentro_x = pers_destra > pozza_x && pers_sinistra < (pozza_x + pozza_l);
        // "+ 5": i piedi devono entrare davvero nell'acqua, non solo toccarla 加 5：脚要真的进到水里，只碰到水面不算 //
        let dentro_y = pers_fondo > pozza_y + 5 && pers_y < (pozza_y + pozza_a);

        if (dentro_x && dentro_y) {
            pozza_attuale = pozza;   // ricorda in quale pozza si trova 记住角色在哪块水里 //
            // Affonda lentamente, ma si può ancora saltare fuori 慢慢往下沉，但还能跳出来 //
            if (PP.physics.get_velocity_y(personaggio) > 40) {
                PP.physics.set_velocity_y(personaggio, 40);
            }

            if (pozza.tipo == "tossica") {
                // Acqua tossica: appena la tocchi perdi tutte le vite 毒水：一碰到就失去所有的命 //
                if (vite > 0) {
                    vite = 0;
                    aggiorna_barra_vita();
                    console.log("Sei caduto nell'acqua tossica! Vite rimaste: 0");
                }
            } else if (pozza.tipo == "verde") {
                // Acqua verde: una vita ogni 1,5 secondi 绿水：每 1.5 秒扣一条命 //
                if (vite > 0 && (tempo_corrente - tempo_ultimo_danno > 1500)) {
                    vite = Math.max(0, vite - 1);   // senza scendere sotto 0 最少扣到 0 //
                    tempo_ultimo_danno = tempo_corrente;
                    aggiorna_barra_vita(); 
                    console.log("Sei sprofondato nella pozza! Vite rimaste: " + vite);
                }
            }
            // Oasi: si affonda, ma non fa male 绿洲水：会沉下去，但不扣血 //
        }
    }

    // Se non siamo vicini a nessuna pozza o l'acqua è piena, nasconde il tasto E
    if (!vicino_a_una_pozza) {
        tasto_e_sprite.visibility.hidden = true;     // nascondi 隐藏
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

    if (pozza_attuale != null) {
        // Nell'acqua la camera non scende: aumentiamo l'offset di quanto il personaggio è affondato 在水里镜头不往下跟：角色沉下去多少，偏移就加多少 //
        let y_in_superficie = pozza_attuale.geometry.y - A_PERSONAGGIO / 2;   // centro del personaggio quando sta sulla superficie 角色站在水面高度时的中心 y //
        let affondato = personaggio.geometry.y - y_in_superficie;            // quanto è sceso 沉下去了多少 //
        offset_camera_y = obiettivo + affondato;   // subito, senza rallentare, così la camera resta ferma 直接设定，不做缓动，镜头就完全不动 //
    } else {
        offset_camera_y = offset_camera_y + (obiettivo - offset_camera_y) * 0.08;
    }
    PP.camera.set_follow_offset(s, -ANTICIPO_CAMERA, offset_camera_y);
}

function update(s) {
    cammina(s);
    salta(s);
    gestisci_pozze(s);    // prima le pozze, così la camera sa se il personaggio è in acqua 先检查水，镜头才知道角色在不在水里 //
    aggiorna_camera(s); 
}

function destroy(s) {}

PP.scenes.add(
    "gioco",
    preload,
    create,
    update,
    destroy
);