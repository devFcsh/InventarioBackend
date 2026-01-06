import { Router } from "express";
import { agregarActividad, agregarMantenimiento, editarActividad, editarMantenimiento, eliminarActividad, eliminarMantenimiento, obtenerActividadesEquipo, obtenerListaMantenimientos, obtenerMantenimiento, obtenerMantenimientos, obtenerTodasActividades } from "../controllers/mantenimientoController.js";
const router = Router();

router.get("/actividades/todas", obtenerTodasActividades);
router.get("/actividades/:id", obtenerActividadesEquipo);
router.get("/lista", obtenerListaMantenimientos);
router.get("/detalle/:id", obtenerMantenimiento);
router.get("/:id", obtenerMantenimientos);
router.post("/", agregarMantenimiento);
router.post("/actividad", agregarActividad);
router.put("/actividad/:id", editarActividad);
router.put("/:id", editarMantenimiento);
router.delete("/actividad/:id", eliminarActividad);
router.delete("/:id", eliminarMantenimiento);

export default router;
