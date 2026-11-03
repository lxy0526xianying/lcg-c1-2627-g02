const COLORE_TERRENO = "0xB96E54";
const COLORE_PERSONAGGIO = "0xE44A4A";
// piattaforma平台 //
const MARRONE = "0x8B5A2B";
const L_PIATTAFORMA = 192;
const A_PIATTAFORMA = 21;
const X_PIATTAFORMA = 1740;
const Y_PIATTAFORMA = 456;

const A_TERRENO = 96;
const Y_TERRENO = 624;
// Lunghezza del livello关卡长度//
const L_LIVELLO = 3840;
// Prospettiva anticipata提前、预留视野 //
const ANTICIPO_CAMERA = 200;

const X_PERSONAGGIO = 200;
const L_PERSONAGGIO = 80;
const A_PERSONAGGIO = 100;
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

// Bottiglia d'acqua水瓶 //
const L_BOTTIGLIA = 20;
const A_BOTTIGLIA = 30;
const COLORE_BOTTIGLIA = "0x00BFFF";
// Posizione della bottiglia d'acqua水瓶位置 //
const X_BOTTIGLIA = X_PIATTAFORMA;
const Y_BOTTIGLIA = Y_PIATTAFORMA - A_PIATTAFORMA / 2 - A_BOTTIGLIA / 2;

let acqua = ACQUA_MAX;
let barra_acqua;

let salti = 0;
let terreno;
let personaggio;
let bottiglia;

let vicino_bottiglia = false;
let testo_bere;

// Caricamento delle risorse del gioco 加载游戏资源 //
function preload(s) {}

// Crea oggetto创建物品 //
function create(s) {
    crea_terreno(s);
    crea_personaggio(s);
    crea_camera(s);
    crea_piattaforma(s);
    crea_barra_acqua(s);
    crea_bottiglia(s);

    // Scenario,Intervallo di tempo（1000ms = 1s）,Funzione da eseguire, Ripetere o meno // 场景、时间间隔、要执行的函数、是否重复 //
    PP.timers.add_timer(
        s,
        1000,
        consuma_acqua,
        true
    );
}

// Raccogli acqua拾取水瓶 //
function bere_acqua() {
    // Ripristina la barra dell'acqua al massimo
    acqua = ACQUA_MAX;

    aggiorna_barra_acqua();

    if (bottiglia != null) {
        PP.shapes.destroy(bottiglia);
        bottiglia = null;
    }

    if (testo_bere) {
        testo_bere.destroy();
        testo_bere = null;
    }

    vicino_bottiglia = false;
}

function crea_bottiglia(s) {
    bottiglia = PP.shapes.rectangle_add(
        s,
        X_BOTTIGLIA,
        Y_BOTTIGLIA,
        L_BOTTIGLIA,
        A_BOTTIGLIA,
        COLORE_BOTTIGLIA,
        1
    );

    PP.physics.add(
        s,
        bottiglia,
        PP.physics.type.STATIC
    );

    testo_bere = s.add.text(
        X_BOTTIGLIA - 50,
        Y_BOTTIGLIA - 50,
        "Premi E per bere",
        {
            fontSize: "16px",
            fill: "#FFFFFF"
        }
    );
 
    testo_bere.setVisible(false);
}

// Funzione per controllare la vicinanza del personaggio alla bottiglia
function controlla_bottiglia(s) {
    if (bottiglia != null) {
        let distanza = Phaser.Math.Distance.Between(
            personaggio.geometry.x, personaggio.geometry.y,
            X_BOTTIGLIA, Y_BOTTIGLIA
        );

        // Se la distanza è inferiore a 80 pixel, il giocatore è abbastanza vicino
        if (distanza < 80) {
            vicino_bottiglia = true;
            testo_bere.setVisible(true);
        } else {
            vicino_bottiglia = false;
            testo_bere.setVisible(false);
        }
    } else {
        vicino_bottiglia = false;
        if (testo_bere) {
            testo_bere.setVisible(false);
        }
    }
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
        20 + (L_BARRA_ACQUA * scala) / 2;
}

function crea_terreno(s) {
    // Crea rettangolo del terreno 创建地面矩形 //
    terreno = PP.shapes.rectangle_add(
       s, 
       L_LIVELLO / 2, 
       Y_TERRENO + A_TERRENO / 2,
       L_LIVELLO, 
       A_TERRENO, 
       COLORE_TERRENO, 
       1
    );
    // Aggiungi fisica al terreno 给地面添加物理属性 //
    PP.physics.add(
        s,
        terreno,
        PP.physics.type.STATIC
    );
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
    // Aggiungi collider tra il personaggio e il terreno 添加角色与地面碰撞检测 //
    PP.physics.add_collider(
        s,
        personaggio,
        terreno
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
    // Salto del personaggio 角色跳跃 //
    if (
        PP.interactive.kb.is_key_just_down(s, TASTO_SALTO)
        && salti < SALTI_MAX
    ) {
        PP.physics.set_velocity_y(
            personaggio,
            -VEL_SALTO
        );
        // Ciclo 循环 //
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
    PP.physics.set_world_bounds(s, 0, 0, L_LIVELLO, 720);
    PP.camera.set_bounds(s, 0, 0, L_LIVELLO, 720);
    // Imposta la camera per seguire il personaggio 设置摄像机跟随角色 //
    PP.camera.start_follow(s, personaggio, -ANTICIPO_CAMERA, 0);
}

function crea_piattaforma(s) {
     let piattaforma = PP.shapes.rectangle_add(
        s,
        X_PIATTAFORMA, 
        Y_PIATTAFORMA,
        L_PIATTAFORMA, 
        A_PIATTAFORMA, 
        MARRONE, 
        1
    );
    PP.physics.add(s, piattaforma, PP.physics.type.STATIC);
    PP.physics.add_collider(s, personaggio, piattaforma);
}

function update(s) {
    cammina(s);
    salta(s);

    // Controlla la vicinanza alla bottiglia e gestisce l'avviso
    controlla_bottiglia(s);

    // Se è vicino e preme il tasto E, beve l'acqua
    if (vicino_bottiglia && PP.interactive.kb.is_key_just_down(s, TASTO_E)) {
        bere_acqua();
    }
}

function destroy(s) {}

PP.scenes.add(
    "gioco",
    preload,
    create,
    update,
    destroy
);