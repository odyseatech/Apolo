export type ModelItemId = 'engine-c15' | 'drone-mavic';

export interface ModelItem {
  id: ModelItemId;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  description: string;
  specs: { label: string; value: string }[];
  accentColor: string;
}

export const LIBRARY_MODELS: ModelItem[] = [
  {
    id: 'engine-c15',
    title: 'Caterpillar C15 ACERT™',
    subtitle: 'Motor Diésel Industrial 15.2L Turboalimentado',
    category: 'Ingeniería Mecánica Pesada',
    badge: '625 HP / 2,779 Nm',
    description: 'Motor diésel de 6 cilindros en línea con tecnología ACERT™, doble turboalimentador en serie, culata de 24 válvulas e inyección MEUI.',
    specs: [
      { label: 'Cilindrada', value: '15.2 Litros (928 ci)' },
      { label: 'Configuración', value: '6 en Línea (I6)' },
      { label: 'Potencia Pico', value: '625 HP @ 2,100 RPM' },
      { label: 'Par Máximo', value: '2,779 Nm @ 1,400 RPM' }
    ],
    accentColor: '#EEA205'
  },
  {
    id: 'drone-mavic',
    title: 'DJI Mavic Mini',
    subtitle: 'Vehículo Aéreo No Tripulado Ultraligero (249g)',
    category: 'Robótica Aeroespacial y Drones',
    badge: '249g / 4K Gimbal',
    description: 'Cuadricóptero plegable de alta precisión con cámara estabilizada en 3 ejes, 4 motores brushless sin escobillas, sensores de flujo óptico y batería inteligente LiPo.',
    specs: [
      { label: 'Peso de Despegue', value: '< 249 gramos' },
      { label: 'Rotores', value: '4x Brushless 1406' },
      { label: 'Cámara / Sensor', value: 'Gimbal 3 Ejes 2.7K / 12MP' },
      { label: 'Velocidad Máx.', value: '13 m/s (Modo Sport)' }
    ],
    accentColor: '#38BDF8'
  }
];
