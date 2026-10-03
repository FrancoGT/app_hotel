// Datos públicos confirmados del hotel. Cualquier dato nuevo debe venir del hotel, no inventarse.
const ADDRESS = "Avenida Vidaurrazaga 5, Arequipa, Perú"

export const HOTEL = {
  name: "Hotel Illari",
  city: "Arequipa",
  address: ADDRESS,
  phoneDisplay: "(054) 214672",
  phoneHref: "tel:+5154214672",
  totalRooms: 27,
  // Búsqueda por dirección: no hay coordenadas verificadas del hotel
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Hotel Illari, ${ADDRESS}`)}`,
  facadePhoto: {
    src: "/images/hotel-illari-fachada.jpg",
    width: 480,
    height: 640,
    alt: "Fachada del Hotel Illari con su letrero vertical",
  },
}

export const BOOKING_PATH = "/reservar"

// Fotos de habitación cargadas desde el panel de administración
export const PUBLISH_ROOM_PHOTOS = true
// Los servicios cargados en el panel aún no están verificados por el hotel. Activar cuando se hayan revisado.
export const PUBLISH_ROOM_FEATURES = false
