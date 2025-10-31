import { Router } from "express";
import { agregarMantenimiento, obtenerActividadesEquipo, obtenerMantenimientos } from "../controllers/mantenimientoController.js";
const router = Router();

router.get("/actividades/:id", obtenerActividadesEquipo);
router.get("/:id", obtenerMantenimientos);
router.post("/", agregarMantenimiento);

export default router;
