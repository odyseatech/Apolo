import { SubsystemComponent, EnginePreset, DiagnosticCode } from '../types/engine';

export const ENGINE_PRESETS: EnginePreset[] = [
  {
    id: 'idle',
    name: 'Ralentí en Vacío (Low Idle)',
    description: 'Régimen mínimo estabilizado para calentamiento y lubricación.',
    rpm: 650,
    load: 10,
    category: 'Mantenimiento'
  },
  {
    id: 'peak-torque',
    name: 'Par Motor Máximo (Peak Torque)',
    description: 'Punto óptimo de fuerza de arrastre a 1,200 RPM con 100% de carga.',
    rpm: 1200,
    load: 100,
    category: 'Carga Pesada'
  },
  {
    id: 'rated-power',
    name: 'Potencia Nominal (Rated Power)',
    description: '625 HP a 1,800 RPM. Punto de trabajo para generadores y bombas industriales.',
    rpm: 1800,
    load: 95,
    category: 'Operación Continua'
  },
  {
    id: 'haul-mining',
    name: 'Trepada Minera / Camión Fuera de Carretera',
    description: 'Máxima exigencia térmica y sobrealimentación en pendiente pronunciada.',
    rpm: 1950,
    load: 100,
    category: 'Severo'
  },
  {
    id: 'highway-cruise',
    name: 'Crucero Económico (Fuel Eco)',
    description: 'Régimen eficiente de bajo consumo específico (BSFC mínimo) a carga parcial.',
    rpm: 1450,
    load: 50,
    category: 'Eficiencia'
  },
  {
    id: 'high-idle',
    name: 'Alta en Vacío (High Idle)',
    description: 'Corte de gobernador superior a 2,150 RPM sin carga aplicada.',
    rpm: 2150,
    load: 12,
    category: 'Diagnóstico'
  }
];

export const SUBSYSTEM_COMPONENTS: SubsystemComponent[] = [
  {
    id: 'turbocharger',
    name: 'Turbocargador de Gran Caudal con Doble Entrada',
    englishName: 'Heavy-Duty Twin-Scroll Turbocharger & Wastegate',
    category: 'induction',
    position: [-1.4, 0.7, -0.6],
    explodeOffset: [-1.2, 0.5, -0.4],
    partNumber: 'CAT 10R-8890 / 239-5583',
    summary: 'Sobrealimentador accionado por gases de escape que comprime el aire de admisión hasta 38.5 PSI (2.65 bar).',
    details: [
      'Carcasa de turbina dividida (twin-scroll) fabricada en aleación de hierro nodular resistente a 750°C.',
      'Rueda compresora fresada en aluminio forjado de grado aeroespacial capaz de girar hasta 115,000 RPM.',
      'Válvula de alivio (wastegate) neumático-electrónica calibrada para proteger contra sobrepresiones en el múltiple de admisión.',
      'Refrigeración y lubricación forzada directamente desde la galería principal de aceite del motor.'
    ],
    specs: [
      { label: 'Presión de Refuerzo Máx.', value: '38.5 PSI (2.65 bar)' },
      { label: 'Velocidad de Giro Máx.', value: '115,000 RPM' },
      { label: 'Temperatura Gases Entrada', value: 'Hasta 720 °C' },
      { label: 'Caudal de Masa de Aire', value: '1,820 CFM a 2,100 RPM' }
    ],
    maintenance: 'Inspeccionar juego axial del eje cada 1,000 hrs (máx. 0.13 mm). Verificar estanqueidad del actuador de la wastegate.',
    criticalTempOrPressure: 'Alarma de sobrepresión a > 41 PSI. Límite EGT crítico: 750 °C.'
  },
  {
    id: 'rocker-covers',
    name: 'Culata y 6 Tapas de Balancines Individuales',
    englishName: 'Cylinder Head & 6 Individual Rocker Covers',
    category: 'structural',
    position: [0.0, 1.4, 0.0],
    explodeOffset: [0.0, 1.0, 0.0],
    partNumber: 'CAT 223-7468 / 161-4113',
    summary: 'Diseño icónico de 6 tapas de aluminio individuales que cubren el tren de válvulas de 4 válvulas por cilindro.',
    details: [
      'Facilita el servicio y calibración del juego de válvulas e inyectores cilindro por cilindro sin desmontar la tapa completa.',
      'Culata monolítica de fundición gris de alta densidad con pasos de refrigerante optimizados para absorber choques térmicos.',
      'Sellado mediante juntas elastoméricas de silicona moldeada que soportan vibración severa y previenen fugas de aceite.',
      'Incluye respiraderos de cárter con filtro separador de neblina de aceite integrado.'
    ],
    specs: [
      { label: 'Configuración Válvulas', value: '4 válvulas por cilindro (24 válvulas)' },
      { label: 'Luz Válvula de Admisión', value: '0.38 mm ± 0.08 mm (0.015 pulg)' },
      { label: 'Luz Válvula de Escape', value: '0.76 mm ± 0.08 mm (0.030 pulg)' },
      { label: 'Torque de Pernos Culata', value: '450 Nm + 90° de giro angular' }
    ],
    maintenance: 'Ajuste de holgura de válvulas cada 2,000 hrs o 160,000 km. Reemplazo de sellos de tapas en cada apertura.',
    criticalTempOrPressure: 'Temperatura máxima culata: 105 °C en refrigerante.'
  },
  {
    id: 'flywheel',
    name: 'Volante de Inercia y Campana SAE #1',
    englishName: 'Flywheel & SAE #1 Bell Housing',
    category: 'structural',
    position: [0.0, -0.2, 1.7],
    explodeOffset: [0.0, 0.0, 1.2],
    partNumber: 'CAT 126-5875 / 134-3761',
    summary: 'Masa rotativa de hierro dúctil que amortigua las fluctuaciones de torque del cigüeñal y aloja el embrague/convertidor.',
    details: [
      'Equipado con corona dentada perimetral de 113 dientes tratada térmicamente para el engrane del motor de arranque eléctrico.',
      'Carcasa de campana estándar SAE #1 mecanizada con tolerancia de excentricidad radial inferior a 0.10 mm.',
      'Ventanas de inspección para sincronización y toma de señal de los sensores de velocidad y sincronismo del cigüeñal (Primary Engine Speed Sensor).',
      'Orificios roscados para acoplamiento de tomas de fuerza auxiliares (PTO) y generadores.'
    ],
    specs: [
      { label: 'Diámetro Exterior', value: '533.4 mm (21.0 pulg)' },
      { label: 'Número de Dientes', value: '113 dientes (Paso 8/10)' },
      { label: 'Momento de Inercia (GD²)', value: '4.82 kg·m²' },
      { label: 'Descentramiento Axial Máx.', value: '0.13 mm' }
    ],
    maintenance: 'Revisión de dientes de corona por desgaste cada 3,000 hrs. Verificación de apriete de pernos al cigüeñal a 270 Nm.',
    criticalTempOrPressure: 'Desalineación máxima admisible: 0.15 mm TIR.'
  },
  {
    id: 'fuel-filtration',
    name: 'Módulo de Filtración Dual de Combustible',
    englishName: 'Dual Fuel Filter & Water Separator System',
    category: 'fuel',
    position: [1.1, -0.6, 0.5],
    explodeOffset: [0.8, -0.4, 0.2],
    partNumber: 'CAT 1R-0749 (Secundario) / 1R-0750 (Primario)',
    summary: 'Sistema de protección con filtración de alta eficiencia de 2 micras y purga automática de agua para salvaguardar los inyectores.',
    details: [
      'Filtro primario con tazón sedimentador de agua transparente y sensor WIF (Water-in-Fuel) conectado al ECM.',
      'Filtro secundario de ultra alta eficiencia con medio filtrante sintético multicapa patentado Advanced Efficiency.',
      'Bomba de cebado manual y eléctrica integrada en la base del cabezal para purga de aire tras cambio de filtros.',
      'Válvula de retención unidireccional para mantener cebada la galería de combustible durante paradas prolongadas.'
    ],
    specs: [
      { label: 'Clasificación de Filtrado', value: '2 micrones absolutos (Beta ≥ 1000)' },
      { label: 'Presión de Suministro', value: '450 - 580 kPa (65 - 84 PSI)' },
      { label: 'Caudal de Retorno', value: '2.8 L/min a 1,800 RPM' },
      { label: 'Capacidad de Retención', value: '99.8% de partículas contaminantes' }
    ],
    maintenance: 'Sustitución de cartuchos cada 500 hrs. Drenaje diario de condensación acumulada en el separador de agua.',
    criticalTempOrPressure: 'Alarma de caída de presión delta-P > 15 PSI indica saturación del elemento.'
  },
  {
    id: 'intake-manifold',
    name: 'Múltiple de Admisión y Tubo de Sobrealimentación',
    englishName: 'Intake Manifold & Air-to-Air Aftercooled Plenum',
    category: 'induction',
    position: [0.3, 0.6, -0.1],
    explodeOffset: [0.7, 0.4, 0.0],
    partNumber: 'CAT 156-4252 / 212-3882',
    summary: 'Colector horizontal de gran volumen que distribuye uniformemente el aire comprimido y enfriado a cada uno de los 6 cilindros.',
    details: [
      'Conducto de aluminio fundido con difusores cónicos que equilibran la masa de aire entre el cilindro 1 y el cilindro 6 con desviación < 2%.',
      'Puerto roscado para sensor de presión absoluta de múltiple (MAP) y sensor de temperatura de aire de admisión (IAT).',
      'Conexión elástica con abrazaderas de presión constante tipo resorte para tolerar dilataciones térmicas.',
      'Incorpora rejilla calefactora de arranque en frío opcional para climas árticos (Grid Heater).'
    ],
    specs: [
      { label: 'Volumen del Plénum', value: '8.4 Litros' },
      { label: 'Presión de Prueba Hidráulica', value: '85 PSI (5.8 bar)' },
      { label: 'Temperatura Aire Post-ATAAC', value: '43 °C - 55 °C' },
      { label: 'Sensor de Presión MAP', value: '0 - 500 kPa piezo-resistivo' }
    ],
    maintenance: 'Limpieza de depósitos de carbonilla cada 4,000 hrs. Inspección de fugas en manguitos de silicona.',
    criticalTempOrPressure: 'Alarma de temperatura de aire > 68 °C (degrada potencia por protección).'
  },
  {
    id: 'exhaust-manifold',
    name: 'Múltiple de Escape Dividido (Pulse Design)',
    englishName: 'Heavy-Duty Pulse Exhaust Manifold',
    category: 'exhaust',
    position: [-0.9, 0.3, -0.2],
    explodeOffset: [-0.9, 0.1, 0.0],
    partNumber: 'CAT 10R-9426 / 152-3490',
    summary: 'Múltiple seccionado en 3 partes con juntas deslizantes de expansión térmica que conduce pulsos de gases al turbocompresor.',
    details: [
      'Fabricado en fundición de hierro con alto contenido de níquel (SiMo / D-5S) resistente a fatiga térmica cíclica de 200°C a 720°C.',
      'Diseño segmentado con juntas machihembradas que evitan la rotura de pernos de culata debido a la expansión térmica longitudinal.',
      'Emparejamiento de pulsos (cilindros 1-2-3 y 4-5-6) para maximizar la energía cinética transferida a la turbina del turbo.',
      'Escudos térmicos envolventes para reducir la radiación al compartimiento del motor.'
    ],
    specs: [
      { label: 'Pernos de Fijación', value: 'Espárragos de aleación Inconel grado 8' },
      { label: 'Torque de Espárragos', value: '55 Nm + sellador antiagarrotamiento C5A' },
      { label: 'Presión de Contrapresión Máx.', value: '10 kPa (40 pulg H₂O)' },
      { label: 'Dilatación Térmica Libre', value: 'Hasta 4.2 mm a temperatura nominal' }
    ],
    maintenance: 'Comprobar estanqueidad en juntas deslizantes y fisuras en curvaturas cada 1,500 hrs.',
    criticalTempOrPressure: 'Temperatura máxima sostenida de escape: 720 °C.'
  },
  {
    id: 'oil-pan',
    name: 'Cárter de Lubricación y Bloque de Motor',
    englishName: 'Deep-Sump Oil Pan & Engine Crankcase Block',
    category: 'cooling',
    position: [0.0, -1.1, 0.0],
    explodeOffset: [0.0, -0.9, 0.0],
    partNumber: 'CAT 160-1428 / 222-7700',
    summary: 'Depósito de aleación de aluminio fundido de 38 litros con rompeolas internos y bloque de fundición de paredes reforzadas.',
    details: [
      'Diseñado para permitir inclinaciones operativas continuas de hasta 30° en pendientes de obra sin descebar la bomba de aceite.',
      'Tapón magnético de drenaje para capturar micropartículas ferrosas de desgaste prematuro.',
      'Bloque de cilindros con nervaduras exteriores rigidizadoras para atenuar ruido y resonancias mecánicas (NVH).',
      'Camisas de cilindro húmedas desmontables con sellos anulares de vitón y labio de apoyo superior rectificado.'
    ],
    specs: [
      { label: 'Capacidad de Aceite', value: '38 Litros (10 Galones US)' },
      { label: 'Grado de Aceite Recomendado', value: 'CAT DEO™ 15W-40 / CK-4' },
      { label: 'Presión de Aceite Normal', value: '280 - 450 kPa (40 - 65 PSI)' },
      { label: 'Presión Mínima en Ralentí', value: '170 kPa (25 PSI)' }
    ],
    maintenance: 'Cambio de aceite y análisis de muestras SOS (Spectrometric Oil Sampling) cada 500 hrs.',
    criticalTempOrPressure: 'Paro automático del motor por baja presión de aceite < 18 PSI a > 1,200 RPM.'
  },
  {
    id: 'cooling-fan-drive',
    name: 'Ventilador Industrial y Polea Amortiguadora',
    englishName: '8-Blade Engine Fan & Viscous Harmonic Damper',
    category: 'cooling',
    position: [0.0, 0.0, -1.8],
    explodeOffset: [0.0, 0.0, -1.2],
    partNumber: 'CAT 230-2915 / 167-8126',
    summary: 'Ventilador de 8 palas de alta eficiencia accionado por correa poli-V y dámper torsional de silicio fluido.',
    details: [
      'Amortiguador de vibraciones torsionales relleno de fluido viscoso de silicona que absorbe las ondas armónicas del cigüeñal.',
      'Ventilador aerodinámico con palas de poliamida reforzada con fibra de vidrio que mueve hasta 18,500 CFM de aire a través del radiador.',
      'Embrague bimetálico/viscoso controlado por temperatura que desacopla el ventilador cuando el motor está frío, ahorrando hasta 35 HP.',
      'Correa serpentina de 8 pistas de EPDM con tensor automático de resorte de torsión constante.'
    ],
    specs: [
      { label: 'Diámetro del Ventilador', value: '864 mm (34 pulg) de 8 aspas' },
      { label: 'Potencia Absorbida a 2,100 RPM', value: 'Hasta 38 HP (28 kW)' },
      { label: 'Caudal Máximo de Aire', value: '18,500 CFM' },
      { label: 'Vida Útil del Dámper Viscoso', value: 'Reemplazo preventivo a las 8,000 hrs' }
    ],
    maintenance: 'Comprobar tensión de correa y rotación libre del rodamiento de soporte cada 500 hrs.',
    criticalTempOrPressure: 'Pérdida de fluido en dámper requiere reemplazo inmediato para evitar rotura del cigüeñal.'
  },
  {
    id: 'fuel-injectors',
    name: 'Inyectores MEUI y Riel de Presión',
    englishName: 'MEUI Electronic Unit Injectors & Common Rail',
    category: 'fuel',
    position: [0.2, 0.9, -0.2],
    explodeOffset: [0.3, 0.6, -0.1],
    partNumber: 'CAT 10R-1273 / 211-3023',
    summary: 'Inyectores unitarios de accionamiento mecánico y control electrónico que alcanzan hasta 30,000 PSI de inyección.',
    details: [
      'La presión ultra alta atomiza el diésel en gotas microscópicas para una combustión completa, reduciendo hollín y emisiones NOx.',
      'Permite inyección piloto previa para suavizar el pico de presión de combustión y silenciar el golpeteo diésel.',
      'Controlados por solenoide de respuesta ultrarrápida comandado por pulsos de corriente modulada desde el ECM ADEM A4.',
      'Cada inyector cuenta con código de calibración de archivo flash para compensación micrométrica individual.'
    ],
    specs: [
      { label: 'Presión de Inyección Máx.', value: '207 MPa (30,000 PSI)' },
      { label: 'Voltaje de Actuación', value: '105 V DC por solenoide' },
      { label: 'Estrategia de Inyección', value: 'Inyección múltiple (Piloto + Principal)' },
      { label: 'Orden de Encendido', value: '1 - 5 - 3 - 6 - 2 - 4' }
    ],
    maintenance: 'Comprobación de corte de cilindros electrónico (Cylinder Cutout Test) en cada servicio mayor.',
    criticalTempOrPressure: 'Diferencia de compensación de cilindro > 8% indica tobera desgastada.'
  },
  {
    id: 'ecm-module',
    name: 'Módulo de Control Electrónico ADEM™ A4',
    englishName: 'Advanced Diesel Engine Management ECM (ADEM A4)',
    category: 'electrical',
    position: [-0.9, -0.2, 0.5],
    explodeOffset: [-0.7, -0.1, 0.3],
    partNumber: 'CAT 240-5302 / 262-1408',
    summary: 'El cerebro electrónico del motor montado lateralmente, refrigerado por combustible diésel circulante.',
    details: [
      'Procesa más de 2 millones de cálculos por segundo coordinando inyección, avance, regulación de sobrealimentación y diagnóstico.',
      'Carcasa de fundición estanca clasificada IP67 con conector de 70 pines y conector J1939 para red CAN-bus de maquinaria.',
      'Placa base interna refrigerada por el flujo de combustible antes de ingresar a los filtros para disipar el calor de los controladores.',
      'Registro continuo de eventos críticos de sobrevelocidad, baja presión de aceite y sobrecalentamiento en memoria no volátil.'
    ],
    specs: [
      { label: 'Microprocesador', value: '32-bit RISC Automotriz Doble Núcleo' },
      { label: 'Protocolo de Comunicación', value: 'SAE J1939 CAN / J1708 / CAT Data Link' },
      { label: 'Rango de Temperatura Operativa', value: '-40 °C a +105 °C' },
      { label: 'Voltaje de Alimentación', value: '18 a 32 V DC (Sistema de 24V)' }
    ],
    maintenance: 'Revisión de códigos de falla con software CAT Electronic Technician (ET). Verificación de torque de conectores a 6 Nm.',
    criticalTempOrPressure: 'Protección por sobrevoltaje a > 36 V y desconexión por bajo voltaje a < 16 V.'
  }
];

export const DIAGNOSTIC_CODES_SAMPLE: DiagnosticCode[] = [
  {
    code: 'MID 036 - CID 0102 - FMI 03',
    description: 'Sensor de Presión de Refuerzo del Turbo: Voltaje por encima de lo normal o cortocircuito a positivo.',
    severity: 'warning',
    system: 'Admisión / Turbo',
    action: 'Verificar cableado de señal del sensor MAP en arnés de motor.'
  },
  {
    code: 'MID 036 - CID 0100 - FMI 01',
    description: 'Sensor de Presión de Aceite de Motor: Nivel de presión por debajo del umbral de advertencia operativo.',
    severity: 'critical',
    system: 'Lubricación',
    action: 'Detener motor de inmediato y comprobar nivel de aceite en varilla y estado de filtros.'
  },
  {
    code: 'MID 036 - CID 0110 - FMI 00',
    description: 'Sensor de Temperatura de Refrigerante de Motor: Temperatura extremadamente alta detectada (> 106 °C).',
    severity: 'critical',
    system: 'Refrigeración',
    action: 'Verificar correa de ventilador, flujo de aire en panal de radiador y nivel de refrigerante.'
  },
  {
    code: 'MID 036 - CID 0091 - FMI 08',
    description: 'Sensor de Posición del Acelerador PWM: Frecuencia o ancho de pulso anormal detectado.',
    severity: 'warning',
    system: 'Control de Aceleración',
    action: 'Inspeccionar potenciómetro del pedal/palanca y calibrar recorrido de 0 a 100%.'
  },
  {
    code: 'MID 036 - CID 0268 - FMI 02',
    description: 'Parámetros programados de ECM: Datos erráticos o intermitentes detectados en memoria de configuración.',
    severity: 'normal',
    system: 'ECM ADEM A4',
    action: 'Verificar archivo de configuración Flash con CAT ET.'
  }
];
