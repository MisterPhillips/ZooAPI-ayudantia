import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState({
    autor: '',
    calificacion: '5',
    comentario: '',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorComentario, setErrorComentario] = useState(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/especies`).then((res) => res.json()),
      fetch(`${API_URL}/recintos`).then((res) => res.json()),
    ])
      .then(([especiesData, recintosData]) => {
        setEspecies(especiesData);
        setRecintos(recintosData);
      })
      .catch(() => setError('No se pudieron cargar las opciones de filtro'));
  }, []);

  useEffect(() => {
    const parametros = new URLSearchParams();
    if (especieId) parametros.set('especieId', especieId);
    if (recintoId) parametros.set('recintoId', recintoId);
    const query = parametros.toString();

    fetch(`${API_URL}/animals${query ? `?${query}` : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo');
        return res.json();
      })
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCargando(false);
      });
  }, [especieId, recintoId]);

  const mostrarDetalle = (animal) => {
    setAnimalSeleccionado(animal);
    setComentarios([]);
    setPromedio(null);
    setErrorComentario(null);

    fetch(`${API_URL}/animals/${animal.id}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los comentarios');
        return res.json();
      })
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch(() => setErrorComentario('No se pudieron cargar los comentarios'));
  };

  const enviarComentario = (event) => {
    event.preventDefault();
    setErrorComentario(null);
    setEnviandoComentario(true);

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autor: nuevoComentario.autor,
        calificacion: Number(nuevoComentario.calificacion),
        comentario: nuevoComentario.comentario,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const detalle = data.detalles?.map((item) => item.mensaje).join('. ');
          throw new Error(detalle || data.error || 'No se pudo crear el comentario');
        }
        return data;
      })
      .then(() => {
        setNuevoComentario({ autor: '', calificacion: '5', comentario: '' });
        return fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`);
      })
      .then((res) => res.json())
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch((err) => setErrorComentario(err.message))
      .finally(() => setEnviandoComentario(false));
  };

  return (
    <section>
      <h2>Catálogo de animales</h2>

      <label>
        Especie:{' '}
        <select value={especieId} onChange={(event) => setEspecieId(event.target.value)}>
          <option value="">Todas</option>
          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.nombre} (id: {especie.id})
            </option>
          ))}
        </select>
      </label>{' '}
      <label>
        Recinto:{' '}
        <select value={recintoId} onChange={(event) => setRecintoId(event.target.value)}>
          <option value="">Todos</option>
          {recintos.map((recinto) => (
            <option key={recinto.id} value={recinto.id}>
              {recinto.nombre} (id: {recinto.id})
            </option>
          ))}
        </select>
      </label>

      {cargando && <p>Cargando animales...</p>}
      {error && <p>{error}</p>}
      {!cargando && !error && (
        <ul>
          {animales.map((animal) => (
            <li key={animal.id}>
              <button type="button" onClick={() => mostrarDetalle(animal)}>
                {animal.nombre}
              </button>{' '}
              ({animal.especie?.nombre} - {animal.recinto?.nombre})
            </li>
          ))}
        </ul>
      )}

      {animalSeleccionado && (
        <div>
          <h3>Detalle: {animalSeleccionado.nombre}</h3>
          <p>Edad: {animalSeleccionado.edad}</p>
          <p>Peso: {animalSeleccionado.peso ?? 'No informado'}</p>
          <p>Especie: {animalSeleccionado.especie?.nombre}</p>
          <p>Recinto: {animalSeleccionado.recinto?.nombre}</p>
          <h4>Comentarios {promedio !== null && `(promedio: ${promedio})`}</h4>
          {errorComentario && <p>{errorComentario}</p>}
          <ul>
            {comentarios.map((comentario) => (
              <li key={comentario.id}>
                <strong>{comentario.autor}</strong> ({comentario.calificacion}/5):{' '}
                {comentario.comentario}
              </li>
            ))}
          </ul>

          <form onSubmit={enviarComentario}>
            <h4>Agregar comentario</h4>
            <label>
              Autor:{' '}
              <input
                value={nuevoComentario.autor}
                onChange={(event) => setNuevoComentario({ ...nuevoComentario, autor: event.target.value })}
                required
              />
            </label>{' '}
            <label>
              Calificación:{' '}
              <select
                value={nuevoComentario.calificacion}
                onChange={(event) => setNuevoComentario({ ...nuevoComentario, calificacion: event.target.value })}
              >
                {[1, 2, 3, 4, 5].map((calificacion) => (
                  <option key={calificacion} value={calificacion}>
                    {calificacion}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>
              Comentario:{' '}
              <textarea
                value={nuevoComentario.comentario}
                onChange={(event) => setNuevoComentario({ ...nuevoComentario, comentario: event.target.value })}
                required
              />
            </label>
            <br />
            <button type="submit" disabled={enviandoComentario}>
              {enviandoComentario ? 'Enviando...' : 'Publicar comentario'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default AnimalCatalogo;