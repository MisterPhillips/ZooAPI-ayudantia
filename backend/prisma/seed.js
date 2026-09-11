/* 
Script de seed para la bd - utiliza Faker para generar datos falsos pero realistas, incluyendo especies, recintos, 
animales y comentarios.

=> Faker es una librería que genera datos falsos con apariencia real (nombres, emails, direcciones, fechas, etc.). 
Es perfecta para poblar tu base de datos en desarrollo y tener contenido visualmente atractivo para el frontend 
sin tener que crear datos manualmente uno por uno.
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos anteriores...');
  await prisma.comentario.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.especie.deleteMany();
  await prisma.recinto.deleteMany();

  console.log('=> Creando especies...');
  const nombresEspecies = ['Mamífero', 'Ave', 'Reptil', 'Anfibio', 'Pez'];
  const especies = await Promise.all( // Crea especies en la base de datos
    nombresEspecies.map((nombre) =>
      prisma.especie.create({ //se crea una especie en la base de datos con un nombre y una descripción generada por Faker
        data: {
          nombre,
          descripcion: faker.lorem.sentence(),
        },
      })
    )
  );

  console.log('=> Creando recintos...');
  const nombresRecintos = ['Sabana Africana', 'Selva Tropical', 'Zona Polar', 'Humedal'];
  const recintos = await Promise.all(
    nombresRecintos.map((nombre) =>
      prisma.recinto.create({
        data: {
          nombre,
          ubicacion: faker.location.city(),
          capacidad: faker.number.int({ min: 5, max: 30 }),
        },
      })
    )
  );

  console.log('=> Creando animales...');
  const nombresAnimales = [
    'León', 'Jirafa', 'Elefante', 'Pingüino', 'Cocodrilo',
    'Rana Dorada', 'Tucán', 'Oso Panda', 'Flamenco', 'Tortuga Gigante',
  ];

  const animales = await Promise.all(
    nombresAnimales.map((nombre) =>
      prisma.animal.create({
        data: {
          nombre,
          edad: faker.number.int({ min: 1, max: 20 }),
          peso: faker.number.float({ min: 2, max: 200, fractionDigits: 1 }),
          disponible: faker.datatype.boolean(),
          especieId: faker.helpers.arrayElement(especies).id,
          recintoId: faker.helpers.arrayElement(recintos).id,
        },
      })
    )
  );

  console.log('=> Creando comentarios...');
  for (const animal of animales) {
    const cantidadComentarios = faker.number.int({ min: 0, max: 4 });
    for (let i = 0; i < cantidadComentarios; i++) {
      await prisma.comentario.create({
        data: {
          autor: faker.person.fullName(),
          calificacion: faker.number.int({ min: 1, max: 5 }),
          comentario: faker.lorem.sentences(2),
          animalId: animal.id,
        },
      });
    }
  }

  console.log('--- Seed completado :V ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });