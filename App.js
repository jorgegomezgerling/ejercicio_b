// Ejercicio 02-B: To-Do con FlatList + AsyncStorage
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@todos";
const FILTROS = ["Todas", "Activas", "Completadas"];

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [cargado, setCargado] = useState(false);

  // 1) Al iniciar: restaurar desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setTareas(JSON.parse(json));
      } catch (e) {
        console.warn("Error cargando tareas", e);
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  // 2) Cada vez que cambian las tareas: guardar automáticamente
  useEffect(() => {
    if (!cargado) return; // evita pisar lo guardado con [] antes de cargar
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tareas)).catch((e) =>
      console.warn("Error guardando tareas", e),
    );
  }, [tareas, cargado]);

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio) return; // no se agregan tareas vacías
    const nueva = {
      id: Date.now().toString() + Math.random().toString(36).slice(2), // id estable
      titulo: limpio,
      completada: false,
    };
    setTareas((prev) => [nueva, ...prev]);
    setTexto("");
  };

  const toggle = (id) =>
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)),
    );

  const eliminar = (id) => setTareas((prev) => prev.filter((t) => t.id !== id));

  const visibles = tareas.filter((t) =>
    filtro === "Activas"
      ? !t.completada
      : filtro === "Completadas"
        ? t.completada
        : true,
  );
  const completadas = tareas.filter((t) => t.completada).length;

  return (
    <View style={styles.contenedor}>
      <StatusBar style="dark" />
      <Text style={styles.titulo}>Mis tareas</Text>

      <View style={styles.filaInput}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={agregar}
          returnKeyType="done"
        />
        <Pressable style={styles.botonAgregar} onPress={agregar}>
          <Text style={styles.botonAgregarTexto}>Agregar</Text>
        </Pressable>
      </View>

      <Text style={styles.contador}>
        Total: {tareas.length} · Completadas: {completadas}
      </Text>

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFiltro(f)}
            style={[styles.filtro, filtro === f && styles.filtroActivo]}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === f && styles.filtroTextoActivo,
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vacio}>No hay tareas</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggle(item.id)}
            onLongPress={() => eliminar(item.id)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.check}>{item.completada ? "☑" : "☐"}</Text>
            <Text
              style={[
                styles.itemTexto,
                item.completada && styles.itemCompletado,
              ]}
            >
              {item.titulo}
            </Text>
          </Pressable>
        )}
      />
      <Text style={styles.ayuda}>
        Tap: completar · Mantener presionado: eliminar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1C1C1E",
  },
  filaInput: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    fontSize: 16,
  },
  botonAgregar: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  botonAgregarTexto: { color: "#fff", fontWeight: "600" },
  contador: { marginTop: 12, color: "#6B6B70" },
  filtros: { flexDirection: "row", gap: 8, marginVertical: 12 },
  filtro: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
  },
  filtroActivo: { backgroundColor: "#2563EB" },
  filtroTexto: { color: "#1C1C1E" },
  filtroTextoActivo: { color: "#fff", fontWeight: "600" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  check: { fontSize: 20 },
  itemTexto: { fontSize: 16, color: "#1C1C1E", flexShrink: 1 },
  itemCompletado: { textDecorationLine: "line-through", color: "#A1A1AA" },
  vacio: { textAlign: "center", color: "#A1A1AA", marginTop: 24 },
  ayuda: {
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 12,
    paddingVertical: 12,
  },
});
