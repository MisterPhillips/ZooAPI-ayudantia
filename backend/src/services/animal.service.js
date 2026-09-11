import prisma from '../config/prisma.js'; //trae lo datos de la base de datos (son consultas a la base de datos) y los exporta para que puedan ser utilizados en otros archivos.

export const getAllAnimales = (filtros = {}) => {
  const where = {};
  if (filtros.especieId) where.especieId = filtros.especieId;
  if (filtros.recintoId) where.recintoId = filtros.recintoId;

  return prisma.animal.findMany({
    where,
    include: { especie: true, recinto: true },
  });
};

export const getAnimalById = (id) => {
  return prisma.animal.findUnique({
    where: { id },
    include: { especie: true, recinto: true },
  });
};

export const createAnimal = (data) => {
  return prisma.animal.create({ data });
};

export const updateAnimal = (id, data) => {
  return prisma.animal.update({ where: { id }, data });
};

export const deleteAnimal = (id) => {
  return prisma.animal.delete({ where: { id } });
};

// Reutilizado por comentario.service.js para verificar que el animal exista
export const animalExists = async (id) => {
  const animal = await prisma.animal.findUnique({ where: { id } });
  return animal !== null;
};