// server.js

const path = require("path");

console.log("📁 __dirname:", __dirname);
console.log("📁 WEB PATH:", path.join(__dirname, "web"));

const DATA = "C:/Users/pc/Desktop/bingo_data";
const express = require("express");
const session = require("express-session");

const fs = require("fs");
const os = require("os");
const app = express();
const BOLETAS_FILE = "./boletas.json";






app.use(session({
  secret: "bingo_super_2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // 🔥 importante (porque no usas https)
    httpOnly: true,
    sameSite: "lax"
  }
}));
const MODULOS_FILE = path.join(DATA, "modulos.json");
const FIGURAS_DB = path.join(DATA, "figuras_db.json");
const FIGURAS_FILE = path.join(DATA, "figuras.json");
const ESTADO_FILE = path.join(DATA, "estado.json");
const GANADORES_FILE = path.join(DATA, "ganadores.json");
const MOSTRAR_GANADOR_FILE = path.join(DATA, "mostrar_ganador.json");
const GANADOR_PAGADO_FILE = path.join(DATA, "ganador_pagado.json");
const CONFIG_FILE = path.join(DATA, "configuracion.json");
const DINERO_FILE = path.join(DATA, "ventas_dinero.json");
const HISTORIAL_FILE = path.join(DATA,"historial_juegos.json");
const CAJA_FILE = path.join(DATA,"caja_diaria.json");
const AUDITORIA_FILE = path.join(DATA,"auditoria.json");
const USUARIOS_FILE = path.join(DATA,"usuarios.json");
const say = require("say");
const PREMIOS_FILE = path.join(DATA, "premios_figuras.json");
const RIFAS_FILE = path.join(DATA, "rifas.json");
const MOVIMIENTOS_FILE = path.join(DATA,"movimientos_caja.json");

console.log("📦 MODULOS_FILE:", MODULOS_FILE);
console.log("📦 ABSOLUTE:", fs.realpathSync(MODULOS_FILE));
console.log("🔥 DIRECTORIO REAL NODE:", process.cwd());
console.log("🔥 RUTA ABSOLUTA MODULOS:", require("path").resolve(MODULOS_FILE));

function guardarJSON(ruta, data) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.log("❌ Error guardando:", err);
    return false;
  }
}

function auditar(req, tipo, detalle){

 let data = { movimientos: [] };

try {
  if (fs.existsSync(AUDITORIA_FILE)) {
    data = JSON.parse(fs.readFileSync(AUDITORIA_FILE));
  }
} catch (e) {
  data = { movimientos: [] };
}

 data.movimientos.push({
   fecha: new Date().toISOString(),
   usuario: req?.session?.user?.usuario || "sistema",
   tipo,
   detalle
 });

 fs.writeFileSync(AUDITORIA_FILE, JSON.stringify(data,null,2));
}

//---pantalla nueva 

app.use(express.static(path.join(__dirname, "web"), {
  extensions: ["html"]
}));

//--------

// crear si no existe

if (!fs.existsSync(MOSTRAR_GANADOR_FILE)) {

    fs.writeFileSync(
        MOSTRAR_GANADOR_FILE,
        JSON.stringify({
            mostrar: -1
        }, null, 2)
    );

}

if (!fs.existsSync(GANADORES_FILE)) {
  fs.writeFileSync(GANADORES_FILE, JSON.stringify({ ganadores: [] }, null, 2));
}
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    precioCarton: 0,
    porcentajePremio: 70
  }, null, 2));
}


if (!fs.existsSync(DINERO_FILE)) {
  fs.writeFileSync(DINERO_FILE, JSON.stringify({ totalDinero: 0 }, null, 2));
}
if(!fs.existsSync(HISTORIAL_FILE)){
 fs.writeFileSync(HISTORIAL_FILE, JSON.stringify({juegos:[]},null,2));
}

if(!fs.existsSync(CAJA_FILE)){
 fs.writeFileSync(CAJA_FILE, JSON.stringify({
   fecha:"",
   ventas:0,
   premios:0,
   ganancia:0
 },null,2));
}

if(!fs.existsSync(AUDITORIA_FILE)){
 fs.writeFileSync(AUDITORIA_FILE, JSON.stringify({movimientos:[]},null,2));
}
if (!fs.existsSync(PREMIOS_FILE)) {
  fs.writeFileSync(PREMIOS_FILE, JSON.stringify({ premios: [] }, null, 2));
}

if(!fs.existsSync(BOLETAS_FILE)){

    fs.writeFileSync(
        BOLETAS_FILE,
        JSON.stringify({
            boletas:[]
        },null,2)
    );

}


if (!fs.existsSync(RIFAS_FILE)) {
  fs.writeFileSync(RIFAS_FILE, JSON.stringify({ rifas: [] }, null, 2));
}
if(!fs.existsSync(MOVIMIENTOS_FILE)){
    fs.writeFileSync(
        MOVIMIENTOS_FILE,
        JSON.stringify({
            movimientos:[]
        }, null, 2)
    );
}


// 🔹 Puerto y IP del servidor
//const PORT = 5500;
// 🔹 Puerto y IP del servidor
const PORT = process.env.PORT || 5500;

function obtenerIPLocal() {
  const redes = os.networkInterfaces();

  for (const nombre of Object.keys(redes)) {
    for (const red of redes[nombre]) {
      if (red.family === "IPv4" && !red.internal) {
        return red.address;
      }
    }
  }

  return "localhost";
}
function obtenerIP() {
  return obtenerIPLocal();
}
console.log("🔥 ESTE ES MI SERVER CORRECTO 🔥");


// 🔹 Permitir recibir JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

let clientesConectados = [];

app.post("/register", (req, res) => {
    clientesConectados.push(req.body);
    console.log("Cliente conectado:", req.body);
    res.json({ok:true});
});





//ruta  de guaradar dinero

app.post("/guardar-dinero",(req,res)=>{

    let data =
    JSON.parse(
        fs.readFileSync(MOVIMIENTOS_FILE)
    );

    data.movimientos.push({

        fecha: new Date()
        .toISOString()
        .split("T")[0],

        tipo: req.body.tipo, // guardar o pagar

        valor: Number(req.body.valor)

    });

    fs.writeFileSync(
        MOVIMIENTOS_FILE,
        JSON.stringify(data,null,2)
    );

    res.json({ok:true});
});

app.get("/resumen-diario",(req,res)=>{

    let historial =
    JSON.parse(
        fs.readFileSync(HISTORIAL_FILE)
    );

    let movimientos =
    JSON.parse(
        fs.readFileSync(MOVIMIENTOS_FILE)
    );

    let resumen = {};

    historial.juegos.forEach(j=>{

        if(!resumen[j.fecha]){

            resumen[j.fecha] = {
                fecha:j.fecha,
                caja:0,
                guardado:0,
                pagado:0
            };

        }

        resumen[j.fecha].caja +=
        Number(j.ganancia || 0);

    });

    movimientos.movimientos.forEach(m=>{

        if(!resumen[m.fecha]){

            resumen[m.fecha] = {
                fecha:m.fecha,
                caja:0,
                guardado:0,
                pagado:0
            };

        }

        if(m.tipo === "guardar"){

    resumen[m.fecha].guardado +=
    Number(m.valor);

    resumen[m.fecha].caja -=
    Number(m.valor);

}

if(m.tipo === "pagar"){

    resumen[m.fecha].pagado +=
    Number(m.valor);

    resumen[m.fecha].caja -=
    Number(m.valor);

}

    });

    res.json(
        Object.values(resumen)
    );

});



// 🔹 Configuración CORS para permitir peticiones desde cualquier origen


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});
app.get("/modulos.json", (req, res) => {

    console.log("🔥 FORZANDO MODULOS DESDE DATA");

    res.sendFile(MODULOS_FILE);

});
app.use(express.static(path.join(__dirname, "web"), {
  extensions: ["html"]
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "web", "login.html"));
});


if (!fs.existsSync(ESTADO_FILE)) {
  fs.writeFileSync(ESTADO_FILE, JSON.stringify({ salidos: [] }, null, 2));
}


// 🔹 Servir archivos estáticos (HTML, CSS, JS)




// 🔹 Crear ventas.json si no existe o reiniciarlo al iniciar
const VENTAS_FILE = path.join(DATA, "ventas.json");
if (!fs.existsSync(VENTAS_FILE)) {
  fs.writeFileSync(VENTAS_FILE, JSON.stringify({ juegoIniciado: false, ventas: [] }, null, 2));
} else {
  // Reinicia las ventas al iniciar
  fs.writeFileSync(VENTAS_FILE, JSON.stringify({ juegoIniciado: false, ventas: [] }, null, 2));
}


// 🔹 Ruta para leer ventas
app.get("/ventas.json", (req, res) => {
  res.sendFile(VENTAS_FILE);
});

// 🔹 Ruta para guardar ventas
app.post("/guardarVentas", (req, res) => {
  try {
   guardarJSON(VENTAS_FILE, req.body);

    console.log("✅ Venta registrada:", req.body.ventas[req.body.ventas.length - 1]);
    auditar(req, "VENTA", "Nueva venta registrada");
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error guardando venta:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});


/*app.get('/modulos.json', (req, res) => {
if (!fs.existsSync(MODULOS_FILE)) {
  fs.writeFileSync(MODULOS_FILE, JSON.stringify({ modulos: [] }, null, 2));
}
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
res.sendFile(MODULOS_FILE);
});*/
app.get("/modulos.json", (req, res) => {

    console.log("📥 LEYENDO MODULOS DESDE:");
    console.log(MODULOS_FILE);

    try {

        const contenido = fs.readFileSync(MODULOS_FILE, "utf8");

        const data = JSON.parse(contenido);

        console.log("🔥 ÚLTIMO MODULO:");
        console.log(
            data.modulos[data.modulos.length - 1]
        );

        res.json(data);

    } catch(err){

        console.log("❌ ERROR LEYENDO:");
        console.log(err);

        res.json({ modulos: [] });
    }

});
app.post('/guardarModulos', (req, res) => {
  guardarJSON(MODULOS_FILE, req.body);
  res.send({ ok: true });
});

app.get("/verificar-duplicados", (req, res) => {

    try {

        let data = JSON.parse(fs.readFileSync(MODULOS_FILE));

        let modulos = data.modulos || [];

        let vistos = {};
        let duplicados = [];

        modulos.forEach(m => {

            if(vistos[m.codigo]){

                duplicados.push(m.codigo);

            } else {

                vistos[m.codigo] = true;
            }

        });

        res.json({
            total: modulos.length,
            duplicados
        });

    } catch(e){

        res.json({
            error: e.message
        });

    }

});
// 🔹 Estado del juego
let estadoJuego = { juegoIniciado: false };
let modoPremio = false;

// 🔹 Rutas para la app consultar el estado
app.get("/estado-juego", (req, res) => {
  res.json({ juegoActivo: estadoJuego.juegoIniciado });
});

// 🔹 Rutas para controlar el juego desde el PC
app.post("/iniciar-juego", (req, res) => {

  estadoJuego.juegoIniciado = true;

  inicioPartida = new Date();

  console.log("🔹 Juego iniciado");

  auditar(req, "INICIO_JUEGO","Juego iniciado");

  res.json({ ok: true });

});
app.post("/activar-premio", (req, res) => {
    modoPremio = true;
    console.log("🏆 Modo premio activado");
    res.json({ ok: true });
});
app.get("/modo-premio", (req, res) => {
    res.json({ activo: modoPremio });
});

app.get('/prueba', (req, res) => {
  res.send("FUNCIONA");
});

// 🔥 WEBRTC SEÑALIZACIÓN
let oferta = null;
let respuesta = null;
let latestFrame = null;
let usuarioActivo = null;


let acumuladoBingo = 0;
let figuraActualIndex = 0;
let inicioPartida = null;

// guardar oferta (PC)
app.post('/oferta', (req, res) => {
  oferta = req.body;
  res.send("ok");
});

// obtener oferta (TV)
app.get('/oferta', (req, res) => {
  res.json(oferta);
});

// guardar respuesta (TV)
app.post('/respuesta', (req, res) => {
  respuesta = req.body;
  res.send("ok");
});

// obtener respuesta (PC)
app.get('/respuesta', (req, res) => {
  res.json(respuesta);
});
//cantado y guardado

app.post('/guardarEstado', (req, res) => {

    guardarJSON(ESTADO_FILE, req.body);

    // BORRAR GANADOR AL SALIR NUEVA BALOTA
    fs.writeFileSync(
        GANADORES_FILE,
        JSON.stringify({ ganadores: [] }, null, 2)
    );

    res.send("ok");

});



app.get("/estado.json", (req, res) => {

  const file = ESTADO_FILE;

  try {

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({ salidos: [] }, null, 2));
    }

    res.setHeader("Content-Type", "application/json");
    res.sendFile(file);

  } catch (err) {
    res.json({ salidos: [] });
  }

});







process.on('uncaughtException', (err) => {
  console.error("💥 ERROR:", err);
});
app.get('/test', (req, res) => {
  res.send("TEST OK");
});

//camara--------/////

app.post("/frame", (req, res) => {
  latestFrame = req.body.image;
  res.send("ok");
});
app.get("/stream", (req, res) => {

  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace; boundary=frame",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  const interval = setInterval(() => {

   if (!latestFrame) return;

    res.write("--frame\r\n");
    res.write("Content-Type: image/jpeg\r\n\r\n");
    res.write(Buffer.from(latestFrame, "base64"));
    res.write("\r\n");

  }, 100);

  req.on("close", () => {
    clearInterval(interval);
  });

});

//______cambiar tblas 
app.post("/pagar-bingo", (req, res) => {

    auditar("PAGO_PREMIO", "Premio pagado");

    // 🔥 ACTIVA OVERLAY
    mostrarGanador = true;

    // (si ya tienes ganador guardado en otro lado lo dejas aquí)
    // ganadorTV = req.body;  ← SOLO si lo mandas desde control

    //fs.writeFileSync(
       // GANADORES_FILE,
       // JSON.stringify({ ganadores: [] }, null, 2)
    //);

    // 🔥 LEER FIGURAS ACTUALES
    let data = JSON.parse(fs.readFileSync(FIGURAS_FILE, "utf8"));

    let figuras = [data.f1, data.f2, data.f3].filter(x => x && x !== "");

    if (data.indice === undefined) {
        data.indice = 0;
    }

    data.indice++;

    if (data.indice >= figuras.length) {
        data.indice = 0;
    }

    data.f1_activa = figuras[data.indice];

    fs.writeFileSync(
        FIGURAS_FILE,
        JSON.stringify(data, null, 2)
    );

    res.json({
        ok: true,
        figuraActiva: data.f1_activa,
        indice: data.indice
    });
});

//______---------------------------------------ganadaor-------------------------

// 🔥 ARCHIVO GANADORES

app.post("/mostrarGanadorTV", (req, res) => {

    fs.writeFileSync(
        MOSTRAR_GANADOR_FILE,
        JSON.stringify({
            mostrar: req.body.mostrar
        }, null, 2)
    );

    res.json({
        ok:true
    });

});

app.get("/mostrar_ganador.json", (req, res) => {

    res.sendFile(
        MOSTRAR_GANADOR_FILE
    );

});

app.get("/ganadores.json", (req, res) => {
  res.sendFile(GANADORES_FILE);
});
app.get("/ganador_pagado.json", (req, res) => {

    if(!fs.existsSync(GANADOR_PAGADO_FILE)){

        return res.json({
            ganadores:[]
        });

    }

    res.sendFile(
        GANADOR_PAGADO_FILE
    );

});

// guardar ganador para TV

app.post("/guardarGanadores", (req, res) => {
  try {
    fs.writeFileSync(
      GANADORES_FILE,
      JSON.stringify(req.body, null, 2)
    );

    console.log("🏆 Ganadores guardados");

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/limpiarGanadores", (req,res)=>{

    fs.writeFileSync(
        GANADORES_FILE,
        JSON.stringify({ ganadores: [] }, null, 2)
    );

    console.log("🧹 Ganadores borrados");

    res.json({ ok:true });

});

app.post("/pagarPremio", (req, res) => {

    try {

        const ganadores = JSON.parse(
            fs.readFileSync(
                GANADORES_FILE,
                "utf8"
            )
        );

        fs.writeFileSync(
            GANADOR_PAGADO_FILE,
            JSON.stringify(
                ganadores,
                null,
                2
            )
        );

        console.log("🏆 Ganador enviado a TV");

        res.json({
            ok: true
        });

    } catch (e) {

        console.log(e);

        res.status(500).json({
            ok: false,
            error: e.message
        });

    }

});


//----fin de ganador



app.get("/estado-figura", (req, res) => {
    res.json({
        index: figuraActualIndex
    });
});
app.post("/guardarPremiosFiguras", (req, res) => {
  try {

    const file = path.join(DATA, "premios_figuras.json");

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({ premios: [] }, null, 2));
    }

    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));

    console.log("💰 Premios figuras guardados");

    res.json({ ok: true });

  } catch (e) {
    console.log("❌ Error guardarPremiosFiguras:", e);
    res.status(500).json({ ok: false });
  }
});

//sincronisar tabla guia--------



if (!fs.existsSync(FIGURAS_FILE)) {
  fs.writeFileSync(FIGURAS_FILE, JSON.stringify({
    f1: null,
    f2: null,
    f3: null
  }, null, 2));
}

// obtener figuras
app.get("/figuras.json", (req, res) => {
  res.sendFile(FIGURAS_FILE);
});



// guardar figuras
app.post("/guardarFiguras", (req, res) => {

  let actual = {};

  try{
    actual = JSON.parse(
      fs.readFileSync(FIGURAS_FILE)
    );
  }catch(e){}

  let nuevo = {
    ...req.body,
    indice: actual.indice || 0
  };

  fs.writeFileSync(
    FIGURAS_FILE,
    JSON.stringify(nuevo, null, 2)
  );

  res.send({ ok: true });

});






app.get("/terminar-juego", (req, res) => {

  estadoJuego.juegoIniciado = false;

  fs.writeFileSync(
    VENTAS_FILE,
    JSON.stringify({
      juegoIniciado: false,
      ventas: []
    }, null, 2)
  );

  fs.writeFileSync(
    GANADORES_FILE,
    JSON.stringify({ ganadores: [] }, null, 2)
  );

  console.log("🔴 Juego terminado");

  auditar(req, "FIN_JUEGO", "Juego terminado");

  let historial = JSON.parse(
    fs.readFileSync(HISTORIAL_FILE)
  );

  let idJuego = historial.juegos.length + 1;

  let vendido = 0;

  try {
    vendido = JSON.parse(
      fs.readFileSync(DINERO_FILE)
    ).totalDinero || 0;
  } catch(e){
    vendido = 0;
  }

  // LEER PREMIOS p1 + p2 + p3
  let premioTotal = 0;

  try {

    let premiosData = JSON.parse(
      fs.readFileSync(PREMIOS_FILE, "utf8")
    );

    premioTotal =
      Number(premiosData.p1 || 0) +
      Number(premiosData.p2 || 0) +
      Number(premiosData.p3 || 0);

  } catch(e){

    premioTotal = 0;

  }

 let utilidad = vendido - premioTotal;

  let horaInicio = inicioPartida
    ? inicioPartida.toLocaleTimeString()
    : "";

  let horaFin = new Date().toLocaleTimeString();

  let ahora = new Date();

  historial.juegos.push({

    id: idJuego,

    fecha:
new Date().toLocaleDateString("sv-SE"),

    inicio: horaInicio,

    fin: horaFin,

    vendido: vendido,

    premios: premioTotal,

    utilidad: utilidad

  });

  fs.writeFileSync(
    HISTORIAL_FILE,
    JSON.stringify(historial, null, 2)
  );

  inicioPartida = null;

  res.send("OK");

});

app.get("/historial_juegos.json", (req,res)=>{
 res.sendFile(HISTORIAL_FILE);
});

app.get("/caja-hoy", (req,res)=>{

 let historial = JSON.parse(fs.readFileSync(HISTORIAL_FILE));
 let hoy =
new Date().toLocaleDateString("sv-SE");

 let juegosHoy = historial.juegos.filter(j => j.fecha === hoy);

 let totalVendido = 0;
let totalPremios = 0;
let totalGanancia = 0;

juegosHoy.forEach(j => {

   totalVendido += Number(j.vendido || 0);

   totalPremios += Number(j.premioTotal || 0);

   totalGanancia += Number(j.ganancia || 0);


 });

 res.json({
   fecha:hoy,
   juegos:juegosHoy.length,
   vendido:totalVendido,
   premios:totalPremios,
   ganancia:totalGanancia
 });

});
//////control de caja y manejo de dinero/////////


//---cantar---///

app.post("/cantar", (req, res) => {

  let numero = req.body.numero;

  if(!numero){
    return res.send({ ok:false });
  }

  let texto = "Número " + numero;

 say.speak(texto, "Microsoft Sabina Desktop", 1.0, (err) => {
    if(err){
      console.log("❌ Error voz:", err);
    }
  });

  console.log("🔊 Cantando:", texto);

  res.send({ ok:true });
});
app.post("/cantarTexto", (req, res) => {

  let texto = req.body.texto;

  if(!texto){
    return res.send({ ok:false });
  }

  say.speak(texto, null, 1.0, (err) => {
    if(err){
      console.log("❌ Error voz:", err);
    }
  });

  console.log("🔊 Narrando:", texto);

  res.send({ ok:true });
});

app.get('/figuras_db.json', (req, res) => {
 const file = FIGURAS_DB;

  try {
    if (!fs.existsSync(file)) {
      return res.json({ figuras: [] });
    }

    res.setHeader('Content-Type', 'application/json');
    res.sendFile(file);

  } catch (err) {
    console.log("❌ Error figuras_db:", err);
    res.json({ figuras: [] });
  }
});
// CONFIGURACION GLOBAL

app.get("/configuracion.json", (req, res) => {
  res.sendFile(CONFIG_FILE);
});

app.post("/guardarConfiguracion", (req, res) => {

  guardarJSON(CONFIG_FILE, {
    precioCarton: Number(req.body.precioCarton) || 0,
    porcentajePremio: Number(req.body.porcentajePremio) || 70
  });
   auditar("CONFIG","Cambio de configuración", req);
  res.json({ ok:true });
});
app.get("/ventas_dinero.json", (req, res) => {
  res.sendFile(DINERO_FILE);
});

// guardar total dinero
app.post("/guardarTotalDinero", (req, res) => {
  fs.writeFileSync(DINERO_FILE, JSON.stringify({
    totalDinero: req.body.totalDinero || 0
  }, null, 2));

  console.log("💰 Total dinero actualizado:", req.body.totalDinero);

  res.json({ ok:true });
});


app.get("/cerrar-caja", (req, res) => {

 let historial = JSON.parse(fs.readFileSync(HISTORIAL_FILE));

 let hoy =
new Date().toLocaleDateString("sv-SE");

 let juegosHoy = historial.juegos.filter(j => j.fecha === hoy);

 let vendido = 0;
 let premios = 0;
let utilidad = 0;

juegosHoy.forEach(j => {

   vendido += Number(j.vendido || 0);

   premios += Number(
       j.premios ||
       j.premioTotal ||
       0
   );

   utilidad += Number(
       j.utilidad ||
       j.ganancia ||
       0
   );

});
let movimientos = JSON.parse(
    fs.readFileSync(MOVIMIENTOS_FILE)
);

let caja = utilidad;

movimientos.movimientos.forEach(m => {

    if(m.fecha === hoy){

        caja -= Number(m.valor || 0);

    }

});

 let cierre = {
   fecha: hoy,
   juegos: juegosHoy.length,
   vendido,
   premios,
   utilidad,
   caja
};

 fs.writeFileSync(CAJA_FILE, JSON.stringify(cierre, null, 2));

 res.json(cierre);
});


app.post("/login",(req,res)=>{

  try {

    if(!fs.existsSync(USUARIOS_FILE)){
      return res.json({ ok:false });
    }

    let data = JSON.parse(fs.readFileSync(USUARIOS_FILE));

    let u = data.usuarios.find(x =>
      x.usuario.trim() === req.body.usuario.trim() &&
      x.clave.trim() === req.body.clave.trim()
    );

    if(u){

      // 🔥 AQUÍ ESTABA EL ERROR
      req.session.user = {
        usuario: u.usuario,
        rol: u.rol
      };

      return res.json({ ok:true, rol:u.rol });

    }else{
      return res.json({ ok:false });
    }

  } catch (e) {
    console.log("💥 ERROR LOGIN:", e);
    res.json({ ok:false });
  }

});
app.get("/session",(req,res)=>{

 if(req.session.user){
    res.json({
      logueado:true,
      usuario:req.session.user.usuario,
      rol:req.session.user.rol
    });
 }else{
    res.json({logueado:false});
 }

});

app.get("/logout",(req,res)=>{
 req.session.destroy(()=>{
   res.send("ok");
 });
});
app.get("/info", (req, res) => {
    res.json({
        pin: PIN,
        ip: obtenerIP(),
        port: 5500
    });
});
app.get("/test", (req, res) => {
    res.json({
        mensaje: "🔥 HOLA DESDE EL SERVIDOR",
        tiempo: new Date().toISOString()
    });
});
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "web", "login.html"));
});

// =============================
// 🔥 UDP DISCOVERY ANDROID
// =============================

const dgram = require("dgram");
const udpServer = dgram.createSocket("udp4");

const UDP_PORT = 41234;

udpServer.on("message", (msg, rinfo) => {

  const text = msg.toString();

  // 🔥 la app Android pregunta esto
  if (text === "BINGO_DISCOVER") {

    const response = JSON.stringify({
  ip: obtenerIP(),
  port: PORT,
  url: `http://${obtenerIP()}:${PORT}`
});

    udpServer.send(
      Buffer.from(response),
      rinfo.port,
      rinfo.address
    );

    console.log("📡 App Android encontrada:", rinfo.address);
  }
});
//voleteria





const { exec } = require("child_process");

app.post("/imprimir-boleta", (req, res) => {

    try {

        let { numero, nombre, cc } = req.body;

        const file = path.join(__dirname, "ticket.html");

        const html = `
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: monospace; font-size: 18px; }
</style>
</head>
<body onload="window.print()">
<pre>
================
VOLETERIA
================
NUMERO: ${numero}
NOMBRE: ${nombre}
CC: ${cc}
================
</pre>
</body>
</html>
        `;

        fs.writeFileSync(file, html, "utf8");

        // 🔥 abre impresión REAL del sistema (Ctrl + P automático)
        exec(`start "" "${file}"`);

        res.json({ ok: true });

    } catch (e) {

        res.json({ ok: false, mensaje: e.message });

    }

});
app.get("/premios_figuras.json", (req, res) => {
  const file = path.join(DATA, "premios_figuras.json");

  if (!fs.existsSync(file)) {
    return res.json({ premios: [] });
  }

  res.setHeader("Content-Type", "application/json");
  res.sendFile(file);
});
app.post("/guardarPremiosFiguras", (req, res) => {
  try {

    const file = path.join(DATA, "premios_figuras.json");

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({ premios: [] }, null, 2));
    }

    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));

    console.log("💰 Premios figuras guardados");

    res.json({ ok: true });

  } catch (e) {
    console.log("❌ Error guardarPremiosFiguras:", e);
    res.status(500).json({ ok: false });
  }
});




// ===============================
// 🔥 SISTEMA MULTIRIFAS COMPLETO
// REEMPLAZA TODO TU BLOQUE RIFAS
// ===============================

// 🔥 ARCHIVO RIFAS


// crear archivo si no existe
if (!fs.existsSync(RIFAS_FILE)) {

    fs.writeFileSync(
        RIFAS_FILE,
        JSON.stringify({
            rifas:[]
        }, null, 2)
    );

}

// ======================================
// 🔥 CREAR RIFA
// ======================================

app.post("/crear-rifa", (req, res) => {

    try {

        let {
    nombre,
    inicio,
    fin,
    cantidad,
    unaDiaria,
    maxNumero
} = req.body;
        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        let nueva = {

            id: Date.now(),

            nombre,

            inicio,

            fin,

            cantidad: Number(cantidad) || 0,
            maxNumero: Number(maxNumero) || 100,

            unaDiaria: unaDiaria !== false,

            activa: true,

            participantes: []

        };

        data.rifas.push(nueva);

        fs.writeFileSync(
            RIFAS_FILE,
            JSON.stringify(data, null, 2)
        );

        res.json({
            ok:true,
            rifa:nueva
        });

    } catch(e){

        console.log(e);

        res.json({
            ok:false,
            mensaje:"Error creando rifa"
        });

    }

});

// ======================================
// 🔥 OBTENER TODAS LAS RIFAS
// ======================================

app.get("/rifas", (req, res) => {

    try {

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        res.json(data);

    } catch(e){

        res.json({
            rifas:[]
        });

    }

});

// ======================================
// 🔥 OBTENER SOLO ACTIVAS
// ======================================

app.get("/rifas-activas", (req, res) => {

    try {

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        let activas =
        data.rifas.filter(r => r.activa);

        res.json({
            rifas: activas
        });

    } catch(e){

        res.json({
            rifas:[]
        });

    }

});

// ======================================
// 🔥 GENERAR BOLETA MULTIRIFA
// ======================================

app.post("/generar-boleta", (req, res) => {

    try {

        let {
            rifaId,
            nombre,
            cc
        } = req.body;

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        let rifa =
        data.rifas.find(r => r.id == rifaId);

        if(!rifa){

            return res.json({
                ok:false,
                mensaje:"Rifa no encontrada"
            });

        }

        // validar fechas
        let ahora = new Date();

        let inicio = new Date(rifa.inicio);

        let fin = new Date(rifa.fin);

        if(ahora < inicio){

            return res.json({
                ok:false,
                mensaje:"La rifa aún no inicia"
            });

        }

        if(ahora > fin){

            return res.json({
                ok:false,
                mensaje:"La rifa terminó"
            });

        }

        // validar diaria
        if(rifa.unaDiaria){

            let hoy =
            new Date()
            .toISOString()
            .split("T")[0];

            // VALIDAR SI YA RECIBIÓ HOY EN ESTA RIFA
let existe = rifa.participantes.find(b =>

    b.cc === cc &&
    b.fecha === hoy

);

if(existe){

    return res.json({
        ok:false,
        mensaje:"Esta persona ya participó hoy"
    });

}

        }

        // generar número
        let numero =
       
          Math.floor(Math.random() * rifa.maxNumero) + 1;

        let participante = {

            id: Date.now(),

            nombre,

            cc,

            numero,

            fecha:
            new Date()
            .toISOString()
            .split("T")[0]

        };

        rifa.participantes.push(participante);

        fs.writeFileSync(
            RIFAS_FILE,
            JSON.stringify(data, null, 2)
        );

        res.json({
            ok:true,
            numero,
            rifa:rifa.nombre
        });

    } catch(e){

        console.log(e);

        res.json({
            ok:false,
            mensaje:"Error servidor"
        });

    }

});

// ======================================
// 🔥 VER PARTICIPANTES DE UNA RIFA
// ======================================

app.get("/participantes/:id", (req, res) => {

    try {

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        let rifa =
        data.rifas.find(
            r => r.id == req.params.id
        );

        if(!rifa){

            return res.json({
                ok:false
            });

        }

        res.json({
            ok:true,
            participantes:
            rifa.participantes
        });

    } catch(e){

        res.json({
            ok:false
        });

    }

});

// ======================================
// 🔥 FINALIZAR RIFA
// ======================================

app.post("/finalizar-rifa", (req, res) => {

    try {

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        let rifa =
        data.rifas.find(
            r => r.id == req.body.id
        );

        if(!rifa){

            return res.json({
                ok:false
            });

        }

        rifa.activa = false;

        fs.writeFileSync(
            RIFAS_FILE,
            JSON.stringify(data, null, 2)
        );

        res.json({
            ok:true
        });

    } catch(e){

        res.json({
            ok:false
        });

    }

});

// ======================================
// 🔥 ELIMINAR RIFA
// ======================================

app.post("/eliminar-rifa", (req, res) => {

    try {

        let data =
        JSON.parse(
            fs.readFileSync(RIFAS_FILE)
        );

        data.rifas =
        data.rifas.filter(
            r => r.id != req.body.id
        );

        fs.writeFileSync(
            RIFAS_FILE,
            JSON.stringify(data, null, 2)
        );

        res.json({
            ok:true
        });

    } catch(e){

        res.json({
            ok:false
        });

    }

});
let comunicado = { activo:false, texto:"" };

app.post("/comunicado", (req,res)=>{

    comunicado = req.body;

    fs.writeFileSync("comunicado.json", JSON.stringify(comunicado));

    res.send("OK");
});

app.get("/comunicado",(req,res)=>{
    res.json(comunicado);
});

//----------------

// 🔥 GUARDAR ACUMULADO
app.post("/guardarAcumulado", (req,res)=>{

    acumuladoBingo = Number(req.body.valor) || 0;

    console.log("💰 Acumulado actualizado:", acumuladoBingo);

    res.json({ ok:true });
});
// 🔥 INICIAR SERVIDOR (ESTO FALTABA AL FINAL)
// ==========================================
app.listen(PORT, () => {
    console.log(`🔥 Servidor activo en puerto ${PORT}`);
    console.log(`👉 Acceso local: http://localhost:${PORT}`);
});

// 🔥 OBTENER ACUMULADO
app.get("/acumulado", (req,res)=>{

    res.json({
        valor: acumuladoBingo
    });

});


udpServer.bind(UDP_PORT, () => {
  console.log("📡 UDP LISTO EN PUERTO", UDP_PORT);
});
udpServer.on("message", (msg, rinfo) => {
  console.log("🔥 UDP RECIBIDO:", msg.toString(), rinfo.address);
});

app.listen(PORT, "0.0.0.0", () => {

  console.log("🔥 Servidor activo");
  console.log("👉 http://" + obtenerIP() + ":" + PORT);

});
