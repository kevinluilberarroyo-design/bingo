const express = require("express");
const app = express();

app.use(express.json());

// base de datos en memoria (simple)
let servidores = {};

/*
=====================================================
📌 REGISTRAR SERVIDOR (PC BINGO)
=====================================================
*/
app.post("/register", (req, res) => {

    const { pin, ip, port } = req.body;

    if (!pin || !ip || !port) {
        return res.json({ ok: false, error: "faltan datos" });
    }

    servidores[pin] = {
        ip,
        port,
        online: true,
        lastUpdate: Date.now()
    };

    console.log("📡 Servidor registrado:");
    console.log(pin, ip + ":" + port);

    res.json({ ok: true });
});

/*
=====================================================
📌 BUSCAR SERVIDOR POR PIN (ANDROID)
=====================================================
*/
app.get("/find/:pin", (req, res) => {

    const pin = req.params.pin;

    const server = servidores[pin];

    if (!server) {
        return res.json({ ok: false });
    }

    res.json({
        ok: true,
        ip: server.ip,
        port: server.port
    });
});

/*
=====================================================
📌 LIMPIAR SERVIDORES MUERTOS (IMPORTANTE)
=====================================================
*/
setInterval(() => {

    const now = Date.now();

    for (let pin in servidores) {

        if (now - servidores[pin].lastUpdate > 15000) {
            console.log("❌ eliminado:", pin);
            delete servidores[pin];
        }
    }

}, 10000);

/*
=====================================================
📌 INICIAR SERVIDOR
=====================================================
*/
app.listen(3000, () => {
    console.log("🔥 Registro central activo en puerto 3000");
});