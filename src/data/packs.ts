export interface WordCategory {
  category: string;
  words: string[];
}

export interface GamePack {
  id: string;
  name: string;
  description: string;
  categories: WordCategory[];
}

export const GAME_PACKS: GamePack[] = [
  {
    id: "kids-basic",
    name: "Modo Niños (Familiar)",
    description: "Palabras muy visuales y cotidianas. Ideal para jugar con peques de hasta 7 años.",
    categories: [
      {
        category: "Animales de la Selva y Sabana",
        words: ["León", "Elefante", "Mono", "Jirafa", "Tigre", "Cebra", "Hipopótamo", "Cocodrilo", "Gorila", "Serpiente"]
      },
      {
        category: "Animales de Granja y Casa",
        words: ["Perro", "Gato", "Vaca", "Caballo", "Cerdo", "Oveja", "Gallina", "Pato", "Conejo", "Ratón"]
      },
      {
        category: "Frutas y Verduras",
        words: ["Manzana", "Plátano", "Naranja", "Fresa", "Pera", "Sandía", "Uva", "Tomate", "Zanahoria", "Lechuga"]
      },
      {
        category: "Cosas de la Casa",
        words: ["Cama", "Sofá", "Televisión", "Silla", "Mesa", "Nevera", "Bañera", "Puerta", "Ventana", "Espejo", "Escoba", "Lámpara"]
      },
      {
        category: "Vehículos",
        words: ["Coche", "Avión", "Tren", "Barco", "Bicicleta", "Moto", "Autobús", "Camión", "Helicóptero", "Tractor", "Cohete", "Patinete"]
      },
      {
        category: "Ropa",
        words: ["Pantalón", "Camiseta", "Zapatos", "Gorro", "Calcetines", "Abrigo", "Bufanda", "Pijama", "Vestido", "Bañador", "Guantes"]
      },
      {
        category: "El Parque y los Juguetes",
        words: ["Pelota", "Tobogán", "Columpio", "Muñeca", "Cuerda", "Puzzle", "Patines", "Cometa", "Peonza", "Castillo de arena"]
      },
      {
        category: "Naturaleza y Tiempo",
        words: ["Sol", "Luna", "Estrella", "Nube", "Lluvia", "Nieve", "Árbol", "Flor", "Piedra", "Río", "Montaña", "Playa"]
      }
    ]
  },
  {
    id: "adults-normal",
    name: "Modo Normal (Adultos)",
    description: "Categorías amplias y específicas para partidas llenas de tensión y faroles nivel experto.",
    categories: [
      {
        category: "Profesiones",
        words: ["Médico", "Bombero", "Abogado", "Arquitecto", "Policía", "Cocinero", "Actor", "Fontanero", "Electricista", "Psicólogo", "Veterinario", "Periodista", "Piloto", "Científico", "Político"]
      },
      {
        category: "Lugares y Geografía",
        words: ["París", "Nueva York", "Tokio", "Madrid", "Roma", "Londres", "Desierto del Sahara", "Polo Norte", "Selva Amazónica", "Gran Cañón", "Monte Everest", "Fondo del mar", "Estación Espacial"]
      },
      {
        category: "Deportes",
        words: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Boxeo", "Ciclismo", "Atletismo", "Golf", "Rugby", "Fórmula 1", "Ajedrez", "Surf", "Esquí", "Escalada"]
      },
      {
        category: "Comida Internacional",
        words: ["Sushi", "Tacos", "Pizza", "Hamburguesa", "Kebab", "Paella", "Burrito", "Curry", "Ramen", "Tortilla de patatas", "Ceviche", "Lasaña", "Hummus"]
      },
      {
        category: "Cine, TV y Ficción",
        words: ["Película de terror", "Comedia romántica", "Ciencia ficción", "Documental", "Superhéroes", "Zombis", "Viajes en el tiempo", "Extraterrestres", "Vampiros", "Western (Oeste)", "Anime"]
      },
      {
        category: "Música y Conciertos",
        words: ["Guitarra eléctrica", "Batería", "Bajo", "Pedal de distorsión", "Thrash Metal", "Concierto", "Mosh pit", "Amplificador a válvulas", "Vocalista", "Micrófono", "Púa", "Guitarra tipo Rhoads"]
      },
      {
        category: "Tecnología y Sistemas",
        words: ["Ciberseguridad", "Firewall", "Base de datos", "Servidor", "Desarrollo Frontend", "Enrutador (Router)", "Malware", "Código fuente", "Inteligencia Artificial", "Nube (Cloud)", "Aplicación Móvil"]
      },
      {
        category: "El Cuerpo Humano",
        words: ["Corazón", "Cerebro", "Pulmones", "Estómago", "Huesos", "Músculos", "Sangre", "Piel", "Ojos", "Hígado", "Riñones"]
      },
      {
        category: "Superpoderes",
        words: ["Volar", "Invisibilidad", "Fuerza sobrehumana", "Leer la mente", "Teletransporte", "Súper velocidad", "Respirar bajo el agua", "Controlar el fuego", "Viajar en el tiempo", "Curación rápida"]
      },
      {
        category: "Herramientas y Bricolaje",
        words: ["Martillo", "Destornillador", "Taladro", "Sierra", "Cinta métrica", "Llave inglesa", "Alicates", "Clavos", "Tornillos", "Pincel", "Lija"]
      }
    ]
  }
];