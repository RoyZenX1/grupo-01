import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  actualizarVehiculo,
  listarVehiculos,
} from '../../integrante3/vehiculos/vehiculos.api.ts'
import {
  actualizarOrden,
  crearOrden,
  eliminarOrden,
  listarOrdenes,
} from './ordenes.api.ts'
import { siguienteCodigoOrden } from './ordenes.calculations.ts'
import {
  agregarHistorial,
  liberaVehiculo,
  puedeCambiarEstado,
} from './ordenes.estados.ts'
import type { EstadoOrden, Orden, OrdenWrite } from './ordenes.types.ts'

export const ORDENES_QUERY_KEY = ['ordenes'] as const
export const VEHICULOS_QUERY_KEY = ['vehiculos'] as const

/** Carga las órdenes desde la API. */
export function useOrdenes() {
  return useQuery({
    queryKey: ORDENES_QUERY_KEY,
    queryFn: listarOrdenes,
  })
}

/**
 * Registra una orden y marca su vehículo como Ocupado.
 * Si no se puede ocupar el vehículo, se deshace la orden para no dejar
 * datos a medias.
 */
export function useCrearOrden(ordenesActuales: Orden[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (datos: OrdenWrite) => {
      const orden = await crearOrden({
        ...datos,
        codigo: siguienteCodigoOrden(ordenesActuales),
        historial: agregarHistorial({}, 'Pendiente'),
      })

      try {
        await actualizarVehiculo(datos.vehiculoId, { estado: 'Ocupado' })
      } catch (err) {
        await eliminarOrden(orden.id).catch(() => undefined)
        throw new Error(
          'No se pudo reservar el vehículo, la orden no se registró. ' +
            (err instanceof Error ? err.message : ''),
        )
      }

      return orden
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDENES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VEHICULOS_QUERY_KEY }),
      ])
    },
  })
}

/**
 * Cambia el estado de una orden respetando el flujo, guarda el seguimiento
 * y libera el vehículo cuando la orden se completa o se cancela.
 */
export function useCambiarEstadoOrden() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orden,
      estado,
    }: {
      orden: Orden
      estado: EstadoOrden
    }) => {
      if (!puedeCambiarEstado(orden.estado, estado)) {
        throw new Error(
          `No se puede pasar una orden de "${orden.estado}" a "${estado}".`,
        )
      }

      const actualizada = await actualizarOrden(orden.id, {
        estado,
        historial: agregarHistorial(orden, estado),
      })

      if (liberaVehiculo(estado)) {
        // Se consulta el estado real para no pisar un "Mantenimiento".
        const vehiculos = await listarVehiculos()
        const vehiculo = vehiculos.find(
          (item) => item.id === orden.vehiculoId,
        )

        if (vehiculo?.estado === 'Ocupado') {
          await actualizarVehiculo(vehiculo.id, { estado: 'Disponible' })
        }
      }

      return actualizada
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDENES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VEHICULOS_QUERY_KEY }),
      ])
    },
  })
}
