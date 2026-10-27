const COLORE_TERRENO = "0xB96E54";
const COLORE_PERSONAGGIO = "0xE44A4A";
// piataforma平台 //
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
// Velocità di salto del personaggio 角色跳跃速度//
const VEL_SALTO = 1000;
// Impostazioni dei tasti 键盘按键设置//
const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;
const TASTO_SALTO = PP.key_codes.SPACE;

let terreno;
let personaggio;

// Caricamento delle risorse del gioco 加载游戏资源 //
function preload(s) {}

// Crea oggetto创建物品 //
function create(s) {
    crea_terreno(s);
    crea_personaggio(s);
    crea_camera(s);
    crea_piattaforma(s);
}


function crea_terreno(s) {
// Crea rettangolo del terreno 创建地面矩形 //
// s,x,y, Larghezza宽度, Altezza高度, Colore颜色, Trasparenza透明度//
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
// s,x,y, Larghezza宽度, Altezza高度, Colore颜色, Trasparenza透明度//
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

}

function salta(s) {

    if (PP.interactive.kb.is_key_down(s, TASTO_SALTO)&& PP.physics.is_on_ground(personaggio)) {

        PP.physics.set_velocity_y(
            personaggio,
            -VEL_SALTO
        );
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

    } else {

        PP.physics.set_velocity_x(
            personaggio,
            0
        );

    }

}
// Crea la camera 创建摄像机 //
function crea_camera(s) {
    // Imposta i limiti del mondo Imposta i limiti del mondo物理世界的范围 //
    PP.physics.set_world_bounds(s, 0, 0, L_LIVELLO, ALTEZZA);
    PP.camera.set_bounds(s, 0, 0, L_LIVELLO, ALTEZZA);
    // Imposta la camera per seguire il personaggio 设置摄像机跟随角色 //
    PP.camera.start_follow(s, personaggio, -ANTICIPO_CAMERA, 0);

}

function crea_piattaforma(s) {
// s,x,y, Larghezza宽度, Altezza高度, Colore颜色, Trasparenza透明度//
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
}


function destroy(s) {}


PP.scenes.add(
    "gioco",
    preload,
    create,
    update,
    destroy
);