// Menor diferença angular entre dois ângulos (0-360°), em (-180, 180].
export function angularDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

// Suaviza uma leitura de bússola (0-360°) por média móvel exponencial, tratando
// corretamente o "salto" entre 359° e 0° (sem isso, o suavizador giraria pelo caminho
// mais longo sempre que a leitura cruzasse o norte).
export function smoothAngle(previous: number, next: number, smoothingFactor: number): number {
  const delta = angularDelta(previous, next);
  return (previous + delta * smoothingFactor + 360) % 360;
}
