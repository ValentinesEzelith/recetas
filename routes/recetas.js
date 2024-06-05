const express = require("express");
const multer = require("multer");
const auth = require(__dirname + '/../auth/auth.js');
let Receta = require(__dirname + "/../models/receta.js");
let router = express.Router();
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

let upload = multer({ storage: storage });

let autenticacion = (req, res, next) => {
  if (req.session && req.session.usuario)
      return next();
  else
      res.redirect('/auth/login');
};

router.get("/", (req, res) => {
  Receta.find()
    .then((resultado) => {
      if (resultado.length != 0)
        res.render("recetas_listado", { listarecetas: resultado });
      else
        res.render("error", {
          error: "No hay recetas disponibles actualmente",
        });
    })
    .catch((error) => {
      res.render("error", { error: "Error obteniendo recetas" });
    });
});

router.get("/nueva", autenticacion, (req, res) => {
  Receta.find()
    .then((resultado) => {
      res.render("recetas_nueva");
    })
    .catch((error) => {
      res.render("error", { error: "Error obteniendo recetas" });
    });
});

router.get("/:id", (req, res) => {
  Receta.findById(req.params.id)
    .then((resultado) => {
      if (resultado) res.render("recetas_ficha", { fichareceta: resultado });
      else
        res.render("error", {
          error: "No se ha encontrado la receta indicada",
        });
    })
    .catch((error) => {
      res.render("error", { error: "Error buscando la receta indicada" });
    });
});

router.post("/", upload.single("imagen"), autenticacion, (req, res) => {
  let nuevaReceta = new Receta({
    titulo: req.body.titulo,
    comensales: req.body.comensales,
    preparacion: req.body.preparacion,
    coccion: req.body.coccion,
    descripcion: req.body.descripcion,
    ingredientes: req.body.ingredientes,
  });
  if (req.file) nuevaReceta.imagen = req.file.filename;

  console.log(req.body.titulo);
  nuevaReceta
    .save()
    .then((resultado) => {
      res.redirect(req.baseUrl);
    })
    .catch((error) => {
      res.render("error", { error: "Error añadiendo receta: " + error });
    });
});

router.get("/:id/editar", autenticacion, (req, res) => {
  Receta.findById(req.params.id)
    .then((resultado) => {
      if (resultado) res.render("recetas_editar", { fichareceta: resultado });
      else
        res.render("error", {
          error: "No se ha encontrado la receta para editar",
        });
    })
    .catch((error) => {
      res.render("error", { error: "Error buscando la receta a editar" });
    });
});

router.post("/:id", upload.single("imagen"), autenticacion, (req, res) => {
  Receta.findById(req.params.id)
    .then((resultado) => {
      if (resultado) {
        resultado.titulo = req.body.titulo;
        resultado.comensales = req.body.comensales;
        resultado.preparacion = req.body.preparacion;
        resultado.coccion = req.body.coccion;
        resultado.descripcion = req.body.descripcion;
        if (req.filename) {
          resultado.portada = req.file.filename;
        }
        resultado
          .save()
          .then((resultado) => {
            res.render("recetas_ficha"), { fichareceta: resultado };
          })
          .catch((error) => {
            res.render("error", { error: "Error actualizando receta" });
          });
      } else res.render("error", { error: "Receta no encontrada" });
    })
    .catch((error) => {
      res.render("error", { error: "Error editando receta" });
    });
});

router.get("/:id/ingredientes/nuevo", autenticacion, (req, res) => {
  Receta.findById(req.params.id)
    .then((resultado) => {
      if (resultado) {
        res.render("ingrediente_nuevo", {fichareceta: resultado});
      } else {
        res.render("error", { error: "Receta no encontrada" });
      }
    })
    .catch((error) => {
      res.render("error", { error: "Error buscando la receta" });
    });
});

router.post("/:id/ingredientes", autenticacion, async (req, res) => {
  try {
    let recetamod = await Receta.findById(req.params.id);
    //console.log(recetamod);
    if (recetamod) {
      //console.log("entro dentro");
      let nuevoIngrediente = {
        nombre: req.body.nombre,
        cantidad: req.body.cantidad,
        unidad: req.body.unidad,
      };
      recetamod.ingredientes.push(nuevoIngrediente);
      let result = recetamod.save();
      res.render("recetas_ficha", { fichareceta: recetamod });
    } else {
      res.render("error", { error: "No se ha encontrado la receta" });
    }
  } catch (error) {
    res.render("error", { error: "Error actualizando receta" });
  }
});

router.get("/:id/eliminar", autenticacion, (req, res) => {
  Receta.findByIdAndDelete(req.params.id).then((resultado) => {
    if (resultado)
      Receta.find()
        .then((resultado2) => {
          if (resultado2.length != 0)
            res.render("recetas_listado", { listarecetas: resultado2 });
          else
            res.render("error", {
              error: "No se ha encontrado la receta indicada",
            });
        })
        .catch((error) => {
          res.render("error", { error: "Error buscando la receta indicada" });
        });
  });
});

module.exports = router;
