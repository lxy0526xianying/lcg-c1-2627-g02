// Dimensione del canvas di gioco游戏画面尺寸 //
const LARGHEZZA = 1280;
const ALTEZZA = 720;
// Configurazione delle prestazioni del gioco //
const config = {
    canvas_width: LARGHEZZA,
    canvas_height: ALTEZZA,
    canvas_id: "area_gioco",
    background_color: 0x7EC8F0,
    gravity_value: 2000,
    debug_mode: true,
};

PP.game.create(config);