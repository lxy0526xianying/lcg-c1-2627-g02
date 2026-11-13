const COLORE_PERSONAGGIO = "0xE44A4A";

const QUADRATO = 120;
const QUADRATINO = 40;   // 一个青色小格子 = 40px
const L_LIVELLO = 232 * QUADRATO;   // = 27840
const A_LIVELLO = 12 * QUADRATO;   // 关卡高度 = 1440

const Y_TERRENO = 600;
// Lunghezza del livello关卡长度//
// Prospettiva anticipata提前、预留视野 //
const ANTICIPO_CAMERA = 200;

const X_PERSONAGGIO = 180;
const L_PERSONAGGIO = 120;
const A_PERSONAGGIO = 120;
// Velocità di movimento del personaggio 角色移动速度//
const VEL_CORSA = 300;
// attrito del personaggio 角色摩擦力//
const ATTRITO = 1200;
// Numero massimo di salti del personaggio 角色最大跳跃次数//
const SALTI_MAX = 2;
// Velocità di salto del personaggio 角色跳跃速度//
const VEL_SALTO = 1000;

// Impostazioni dei tasti 键盘按键设置//
const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;
const TASTO_SALTO = PP.key_codes.SPACE;
const TASTO_E = PP.key_codes.E; // Aggiunto per il tasto E

// Barra dell'acqua 水量条 //
const ACQUA_MAX = 100;
// Larghezza quando la striscia d'acqua è piena 水量条满时的宽度 //
const L_BARRA_ACQUA = 200;
const A_BARRA_ACQUA = 20;
const X_BARRA_ACQUA = 120;
const Y_BARRA_ACQUA = 40;
const COLORE_ACQUA = "0x4A90E2";
const X_INIZIO_BARRA_ACQUA = 20;

let acqua = ACQUA_MAX;
let barra_acqua;

let salti = 0;
let personaggio;

let vicino_bottiglia = false;
let testo_bere;
let img_terreno;
let img_verde;
let img_piattaforma;
let img_piattaforma_tempo;
let img_villager;
let img_tubo;
let img_edificio
let img_acqua_tossica;
let img_ossa;
let img_casa;
let img_oasi;
let offset_camera_y = 180;
const X_INIZIO_SOTTERRANEO = 81 * QUADRATO;    // 地下开始（左边的墙）
const X_FINE_SOTTERRANEO   = 122 * QUADRATO;   // 地下结束（右边的墙）

// Caricamento delle risorse del gioco 加载游戏资源 //
function preload(s) {
    img_terreno = PP.assets.image.load_color(s, "0xF0D978", 120, 120);  // 黄
    img_verde = PP.assets.image.load_color(s, "0x76B08A", 120, 120);  // 绿
    img_piattaforma = PP.assets.image.load_color(s, "0xE36BD6", 120, 40);
    img_piattaforma_tempo = PP.assets.image.load_color(s, "0x9C60F6", 40, 40);
    img_villager = PP.assets.image.load_color(s, "0xFF8C00", 120, 120);
    img_tubo = PP.assets.image.load_color(s, "0x8EAB4E", 120, 120);
    img_edificio = PP.assets.image.load_color(s, "0x968C8C", 120, 120);
    img_acqua_tossica = PP.assets.image.load_color(s, "0x1E3529", 120, 120);  // 黑色的毒水
    img_ossa = PP.assets.image.load_color(s, "0xF2DFB0", 40, 40);  // 会沉的骨头
    img_casa = PP.assets.image.load_color(s, "0xE36BD6", 120, 120);  // 第二个村庄的建筑（粉色）
    img_oasi = PP.assets.image.load_color(s, "0xA3EAE2", 120, 120);  // 最后的绿洲水（浅蓝绿）
}

// Crea oggetto创建物品 //
function create(s) {
    crea_villager(s, 64, 4);   // ① 先画村民 → 在下层
    // 第二个村庄的建筑（也要在角色之前创建，这样角色从它前面走过）
    crea_casa(s, 140, 3, 1, 2);   // 矮的那一块
    crea_casa(s, 141, 2, 4, 3);   // 高的那一块
    crea_personaggio(s);
    crea_mappa(s);
    crea_camera(s);
    crea_barra_acqua(s);

    // Scenario,Intervallo di tempo（1000ms = 1s）,Funzione da eseguire, Ripetere o meno // 场景、时间间隔、要执行的函数、是否重复 //
    PP.timers.add_timer(
        s,
        5000,
        consuma_acqua,
        true
    );
}

function crea_blocco(s, immagine, colonna, riga, larghezza, altezza) {
    // 1. 铺图：把格子数换算成像素（格子数 × 120）
    let blocco = PP.assets.tilesprite.add(
        s,
        immagine,
        colonna * QUADRATO,     // x：左上角
        riga * QUADRATO,        // y：左上角
        larghezza * QUADRATO,   // 宽
        altezza * QUADRATO,     // 高
        0, 0                    // pivot 0,0 = x、y 指的是左上角
    );
    // 2. 加物理（不会动的）
    PP.physics.add(s, blocco, PP.physics.type.STATIC);
    // 3. 让角色能站上去 / 撞到它
    PP.physics.add_collider(s, personaggio, blocco);
}

function crea_piattaforma_fissa(s, colonna, riga, larghezza) {
    let piattaforma = PP.assets.tilesprite.add(
        s,
        img_piattaforma,
        colonna * QUADRATINO,     // x：左上角
        riga * QUADRATINO,        // y：左上角
        larghezza * QUADRATINO,   // 宽
        QUADRATINO,               // 高：平台固定 1 小格
        0, 0
    );
    PP.physics.add(s, piattaforma, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, piattaforma);
}

function crea_piattaforma_a_tempo(s, colonna, riga, larghezza) {
    let piattaforma = PP.assets.tilesprite.add(
        s,
        img_piattaforma_tempo,      // ← 唯一的区别：用紫色的图
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
    PP.assets.image.add(
        s,
        img_villager,
        colonna * QUADRATO,
        riga * QUADRATO,
        0, 0
    );
}

function crea_tubo(s, colonna, riga, larghezza, altezza) {
    PP.assets.tilesprite.add(
        s,
        img_tubo,
        colonna * QUADRATO,
        riga * QUADRATO,
        larghezza * QUADRATO,   // 宽
        altezza * QUADRATO, 
        0, 0
    );
}

// 毒水里会沉下去的骨头（现在先当普通平台，高 2 小格，用小格子算）
function crea_ossa(s, colonna, riga, larghezza) {
    let ossa = PP.assets.tilesprite.add(
        s,
        img_ossa,
        colonna * QUADRATINO,
        riga * QUADRATINO,
        larghezza * QUADRATINO,
        2 * QUADRATINO,           // 高：骨头固定 2 小格
        0, 0
    );
    PP.physics.add(s, ossa, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, ossa);
}

// 村庄的建筑：只是图，不加物理，所以角色能直接穿过去
function crea_casa(s, colonna, riga, larghezza, altezza) {
    PP.assets.tilesprite.add(
        s,
        img_casa,
        colonna * QUADRATO,       // x：左上角
        riga * QUADRATO,          // y：左上角
        larghezza * QUADRATO,     // 宽
        altezza * QUADRATO,       // 高
        0, 0
    );
}

function crea_mappa(s) {
    //          场景  图片           列   行  宽  高
    crea_blocco(s, img_terreno,     0,  5,  8,  1);   // 地面1
    crea_blocco(s, img_verde,       8,  5,  2,  1);   // 绿色块
    crea_blocco(s, img_terreno,    10,  5, 12,  1);   // 地面2
    crea_blocco(s, img_terreno,    13,  4,  6,  1);   // 台阶下层
    crea_blocco(s, img_terreno,    15,  3,  3,  1);   // 台阶上层
    crea_blocco(s, img_verde,      22,  5, 16,  1);
    crea_blocco(s, img_terreno,    38,  5, 4,  1);
    crea_blocco(s, img_verde,      42,  5, 4,  1);
    crea_blocco(s, img_terreno,    46,  5, 35,  1);
    crea_blocco(s, img_terreno,  81,  6,  1,  3);   // 墙
    crea_blocco(s, img_terreno,  82,  8,  1,  1);   // 台阶
    crea_blocco(s, img_terreno,  82,  9,  4,  1);   // 横的那块
    crea_blocco(s, img_terreno,  85, 10,  1,  2);   // 往下的柱子
    // —— 右边（和左边左右对称）——
    crea_blocco(s, img_terreno, 121,  6,  1,  3);   // 墙
    crea_blocco(s, img_terreno, 120,  8,  1,  1);   // 台阶
    crea_blocco(s, img_terreno, 117,  9,  4,  1);   // 横的那块
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
    crea_piattaforma_fissa(s, 297, 29, 12);   // 中间那个上面有水的
    crea_piattaforma_fissa(s, 321, 22,  6);
    crea_piattaforma_fissa(s, 341, 23,  4);

    // —— 紫色平台 ——
    crea_piattaforma_a_tempo(s, 129, 11, 3);
    crea_piattaforma_a_tempo(s, 268, 21, 5);
    crea_piattaforma_a_tempo(s, 288, 23, 4);
    crea_piattaforma_a_tempo(s, 315, 26, 3);
    crea_piattaforma_a_tempo(s, 332, 26, 4);
    crea_piattaforma_a_tempo(s, 333, 18, 4);
    crea_piattaforma_a_tempo(s, 347, 27, 3);

    crea_blocco(s, img_edificio, 76, 0, 51, 4);

    // ========== 从地下出来以后（右边的出口）==========
    //          场景  图片            列   行  宽  高
    crea_tubo(s,                   122,  4,  9,  1);      // 右边的管子
    crea_blocco(s, img_terreno,    122,  5, 12,  1);      // 管子下面的地面
    crea_piattaforma_fissa(s, 381, 11, 12);               // 管子上的粉色平台（小格子）
    crea_blocco(s, img_verde,      134,  5,  3,  1);      // 绿色的水
    crea_blocco(s, img_terreno,    137,  5, 24,  1);      // 地面

    // ========== Oasi（毒水和骨头）==========
    crea_blocco(s, img_terreno,    156,  4,  5,  1);      // 毒水前面：下层
    crea_blocco(s, img_terreno,    158,  3,  5,  1);      // 毒水前面：上层
    crea_blocco(s, img_acqua_tossica, 161, 5, 30,  1);    // 黑色的毒水

    // 会沉的骨头（小格子）  列   行  宽
    crea_ossa(s,            495, 14, 15);
    crea_ossa(s,            520, 14,  6);
    crea_ossa(s,            532, 14,  3);
    crea_ossa(s,            546, 14,  3);
    crea_ossa(s,            554, 14,  1);
    crea_ossa(s,            564, 14,  7);

    // 毒水后面
    crea_blocco(s, img_terreno,    190,  3,  5,  1);      // 上层
    crea_blocco(s, img_terreno,    192,  4,  5,  1);      // 下层
    crea_blocco(s, img_terreno,    191,  5, 31,  1);      // 地面
    crea_blocco(s, img_oasi,       222,  5,  8,  1);      // 最后的绿洲水（oasi）
    crea_blocco(s, img_terreno,    230,  5,  2,  1);      // 关卡最后一小段地面
    // 上层上面的一小片脏水：只是图，不加碰撞
    PP.assets.tilesprite.add(s, img_verde, 190 * QUADRATO, 3 * QUADRATO, 4 * QUADRATO, QUADRATINO, 0, 0);
}


// aqua水 //
function crea_barra_acqua(s) {
    barra_acqua = PP.shapes.rectangle_add(
        s,
        X_BARRA_ACQUA,
        Y_BARRA_ACQUA,
        L_BARRA_ACQUA,
        A_BARRA_ACQUA,
        COLORE_ACQUA,
        1
    );
    // Imposta la barra dell'acqua per rimanere fissa sullo schermo 设置水量条固定在屏幕上 //
    barra_acqua.tile_geometry.scroll_factor_x = 0;
    barra_acqua.tile_geometry.scroll_factor_y = 0;
}

// Consuma acqua消耗水量 //
function consuma_acqua(s) {
    if (acqua > 0) {
        acqua -= 1;
    }
    aggiorna_barra_acqua();
}

// Aggiorna la barra dell'acqua 更新水量条 //
function aggiorna_barra_acqua() {
    // Calcola la percentuale di acqua rimanente 计算剩余水量的比例 //
    let scala = acqua / ACQUA_MAX;
    barra_acqua.geometry.scale_x = scala;
    // Sposta il centro della barra verso sinistra mentre si accorcia //
    // 水量条变短时让中心点向左移动 //
    barra_acqua.geometry.x =
    // Mantiene fisso il lato sinistro 保持左边固定 //
        X_INIZIO_BARRA_ACQUA + (L_BARRA_ACQUA * scala) / 2;
}


function crea_personaggio(s) {
    // Crea rettangolo del personaggio 创建角色矩形 //
    personaggio = PP.shapes.rectangle_add(
        s,
        X_PERSONAGGIO,
        Y_TERRENO - A_PERSONAGGIO / 2,
        L_PERSONAGGIO,
        A_PERSONAGGIO,
        COLORE_PERSONAGGIO,
        1
    );
    // Aggiungi fisica al personaggio 给角色添加物理属性 //
    PP.physics.add(
        s,
        personaggio,
        PP.physics.type.DYNAMIC
    );
    // Imposta il personaggio per rimanere all'interno dei limiti del mondo 设置角色在世界边界内移动 //
    PP.physics.set_collide_world_bounds(
        personaggio,
        true
    );
    // Imposta l'attrito del personaggio 设置角色摩擦力 //
    PP.physics.set_drag_x(
        personaggio, 
        ATTRITO
    );
}

function salta(s) {
    if (PP.physics.is_on_ground(personaggio)) {
        salti = 0;
    }

    if (
        PP.interactive.kb.is_key_just_down(s, TASTO_SALTO)
        && salti < SALTI_MAX
    ) {
        PP.physics.set_velocity_y(
            personaggio,
            -VEL_SALTO
        );
        salti += 1;
    }

}

function cammina(s) {
    if (PP.interactive.kb.is_key_down(s, TASTO_SX)) {
        PP.physics.set_velocity_x(
            personaggio,
            -VEL_CORSA
        );
    } else if (PP.interactive.kb.is_key_down(s, TASTO_DX)) {
        PP.physics.set_velocity_x(
            personaggio,
            VEL_CORSA
        );
    } 
}

// Crea la camera 创建摄像机 //
function crea_camera(s) {
    PP.physics.set_world_bounds(s, 0, 0, L_LIVELLO, A_LIVELLO);
    PP.camera.set_bounds(s, 0, 0, L_LIVELLO, A_LIVELLO);
    // Imposta la camera per seguire il personaggio 设置摄像机跟随角色 //
    PP.camera.start_follow(s, personaggio, -ANTICIPO_CAMERA, 180);
}
function aggiorna_camera(s) {
    let x = personaggio.geometry.x;
    let obiettivo;

    // 角色的 x 在地下的左右范围之内 → 在地下
    if (x > X_INIZIO_SOTTERRANEO && x < X_FINE_SOTTERRANEO) {
        obiettivo = 0;      // 地下（原来 -120，太低了）
    } else {
        obiettivo = 180;    // 地上
    }

    offset_camera_y = offset_camera_y + (obiettivo - offset_camera_y) * 0.08;
    PP.camera.set_follow_offset(s, -ANTICIPO_CAMERA, offset_camera_y);
}

function update(s) {
    cammina(s);
    salta(s);
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