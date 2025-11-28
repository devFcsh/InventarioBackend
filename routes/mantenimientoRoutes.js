import { Router } from "express";
import { agregarActividad, agregarMantenimiento, editarMantenimiento, eliminarMantenimiento, obtenerActividadesEquipo, obtenerListaMantenimientos, obtenerMantenimiento, obtenerMantenimientos } from "../controllers/mantenimientoController.js";
const router = Router();

router.get("/actividades/:id", obtenerActividadesEquipo);
router.get("/lista", obtenerListaMantenimientos);
router.get("/detalle/:id", obtenerMantenimiento);
router.get("/:id", obtenerMantenimientos);
router.post("/", agregarMantenimiento);
router.post("/actividad", agregarActividad);
router.put("/:id", editarMantenimiento);
router.delete("/:id", eliminarMantenimiento);

export default router;
