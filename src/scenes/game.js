const COLORE_TERRENO = "0xB96E54";
const COLORE_PERSONAGGIO = "0xE44A4A";

const A_TERRENO = 96;
const Y_TERRENO = 624;

const X_PERSONAGGIO = 200;
const L_PERSONAGGIO = 80;
const A_PERSONAGGIO = 100;
// Velocità di movimento del personaggio 角色移动速度//
const VEL_CORSA = 300;
// Impostazioni dei tasti 键盘按键设置//
const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;


let terreno;
let personaggio;

// Caricamento delle risorse del gioco 加载游戏资源 //
function preload(s) {}

// Crea oggetto创建物品 //
function create(s) {
    crea_terreno(s);
    crea_personaggio(s);
}


function crea_terreno(s) {
// Crea rettangolo del terreno 创建地面矩形 //
    terreno = PP.shapes.rectangle_add(
        s,
        LARGHEZZA / 2,
        Y_TERRENO + A_TERRENO / 2,
        LARGHEZZA,
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


function update(s) {
    cammina(s);
}


function destroy(s) {}


PP.scenes.add(
    "gioco",
    preload,
    create,
    update,
    destroy
);