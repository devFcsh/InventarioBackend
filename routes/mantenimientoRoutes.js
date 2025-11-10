import { Router } from "express";
import { agregarMantenimiento, editarMantenimiento, eliminarMantenimiento, obtenerActividadesEquipo, obtenerMantenimientos } from "../controllers/mantenimientoController.js";
const router = Router();

router.get("/actividades/:id", obtenerActividadesEquipo);
router.get("/:id", obtenerMantenimientos);
router.post("/", agregarMantenimiento);
router.put("/:id", editarMantenimiento);
router.delete("/:id", eliminarMantenimiento);

export default router;
