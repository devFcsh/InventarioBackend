import { Router } from 'express';
const router = Router();

import perifericos from './perifericoRoutes';
import marcas from './marcaRoutes';
import modelos from './modeloRoutes';
import series from './serieRoutes';
import inventarios from './inventarioRoutes';
import equipos from './equipoRoutes';
import usos from './usoRoutes'; 
import usuarios from './usuarioRoutes'; 
import discos from './discoRoutes'; 
import dominios from './dominioRoutes'; 
import ram from './ramRoutes'; 
import sistemasoperativos from './sistemaOperativoRoutes'; 
import versionesSO from './versionSORoutes'; 
import versionesOffice from './versionOfficeRoutes'; 
import edificios from './edificioRoutes'; 
import aulas from './aulaRoutes'; 

router.use('/perifericos', perifericos);
router.use('/marcas', marcas);
router.use('/modelos', modelos);
router.use('/series', series);
router.use('/inventarios', inventarios);
router.use('/equipos', equipos);
router.use('/usos', usos); 
router.use('/usuarios', usuarios); 
router.use('/discos', discos); 
router.use('/dominios', dominios); 
router.use('/ram', ram); 
router.use('/sistemasoperativos', sistemasoperativos);
router.use('/versionesSO', versionesSO);  
router.use('/versionesOffice', versionesOffice);  
router.use('/edificios', edificios);  
router.use('/aulas', aulas);  

export default router;
