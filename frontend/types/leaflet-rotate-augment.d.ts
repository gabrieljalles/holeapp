import "leaflet";

// @types/leaflet-rotate cobre rotate/bearing/setBearing, mas não tipa o handler
// compassBearing (adicionado via L.Map.addInitHook em leaflet-rotate/src/map/handler/CompassBearing.js).
declare module "leaflet" {
  interface Map {
    compassBearing: Handler;
  }
}
