import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ShoppingCart, Plus, Send, Trash2, Search, Settings,
  Home, Archive, Check, Clock, AlertCircle, ChevronRight,
  Mail, MessageCircle, Copy, ArrowLeft, Calendar, Package,
  Truck, Save, X, Edit3, Camera, Image as ImageIcon, Share2,
  Download, Paperclip, BookOpen, Tag,
  Cloud, CloudOff, RefreshCw, Wifi, WifiOff, Smartphone
} from "lucide-react";
import { initializeApp as fbInit } from "firebase/app";
import { getDatabase as fbDb, ref as fbRef, set as fbSet, onValue as fbOnValue, remove as fbRemove, goOnline as fbGoOnline, goOffline as fbGoOffline } from "firebase/database";

// =============================================================
// COMPANY BRANDING
// =============================================================
const COMPANY = {
  fullName: "Grupo Agropecuario Murillo Góme-Cuetara",
  short: "Murillo Góme-Cuetara",
  tagline: "Cuaderno de campo"
};

// =============================================================
// PRODUCT CATALOG
// Categorías agropecuarias y ganaderas (con foco porcino).
// =============================================================
const CATEGORIES = [
  {
    id: "alimentacion", label: "Alimentación animal", emoji: "🌾",
    accent: "text-amber-900 bg-amber-100 border-amber-300",
    items: [
      "Pienso de cebo", "Pienso de gestación", "Pienso de lactación",
      "Pienso de iniciación (lechones)", "Pienso de transición", "Pienso de reposición",
      "Maíz", "Cebada", "Trigo", "Soja", "Salvado", "Heno", "Paja para cama",
      "Forraje", "Suplemento mineral", "Suplemento vitamínico",
      "Corrector", "Lactoreemplazante"
    ]
  },
  {
    id: "sanidad", label: "Sanidad y veterinaria", emoji: "💉",
    accent: "text-rose-900 bg-rose-100 border-rose-300",
    items: [
      "Vacuna (especificar)", "Antibiótico", "Antiinflamatorio",
      "Antiparasitario interno", "Antiparasitario externo",
      "Hierro inyectable (lechones)", "Vitaminas inyectables",
      "Oxitocina", "Regumate", "Yodo / povidona",
      "Material de cura", "Jeringas", "Agujas", "Termómetro",
      "Suero / electrolitos"
    ]
  },
  {
    id: "reproduccion", label: "Reproducción", emoji: "🧬",
    accent: "text-purple-900 bg-purple-100 border-purple-300",
    items: [
      "Dosis seminales (pajuelas)", "Catéter de inseminación",
      "Lubricante para inseminación", "Gel para ecógrafo",
      "Detector de celo", "Test de gestación"
    ]
  },
  {
    id: "manejo", label: "Manejo y bienestar", emoji: "🐷",
    accent: "text-emerald-900 bg-emerald-100 border-emerald-300",
    items: [
      "Crotales / chapas", "Pinza para crotales", "Castrador",
      "Corta-colmillos", "Cortauñas", "Placa de calor para lechones",
      "Bombilla calefactora", "Comedero", "Bebedero / chupete",
      "Tolva", "Sinfín de reparto", "Cepo de inseminación", "Báscula"
    ]
  },
  {
    id: "instalaciones", label: "Instalaciones y obra", emoji: "🏗️",
    accent: "text-stone-900 bg-stone-100 border-stone-300",
    items: [
      "Cemento", "Hormigón", "Hierros / varillas", "Madera",
      "Vallas / mallas", "Puertas", "Tornillería", "Pintura",
      "Cable eléctrico", "Bombillas / iluminación", "Ventilador",
      "Tubería PVC", "Filtro de agua", "Bomba de agua",
      "Depósito de agua", "Material aislante"
    ]
  },
  {
    id: "limpieza", label: "Limpieza e higiene", emoji: "🧼",
    accent: "text-cyan-900 bg-cyan-100 border-cyan-300",
    items: [
      "Desinfectante de naves", "Detergente", "Lejía", "Sosa cáustica",
      "Jabón", "Cal viva", "Mochila pulverizadora",
      "Cepillo industrial", "Manguera", "Hidrolimpiadora (repuestos)"
    ]
  },
  {
    id: "epis", label: "EPIs y ropa de trabajo", emoji: "🦺",
    accent: "text-yellow-900 bg-yellow-100 border-yellow-300",
    items: [
      "Botas de goma", "Mono / buzo de trabajo", "Guantes de trabajo",
      "Guantes desechables", "Mascarillas", "Gafas de protección",
      "Casco", "Tapones / auriculares"
    ]
  },
  {
    id: "agricultura", label: "Agricultura y campo", emoji: "🌱",
    accent: "text-lime-900 bg-lime-100 border-lime-300",
    items: [
      "Semilla de cereal", "Semilla de leguminosa", "Semilla de pradera",
      "Abono / fertilizante", "Estiércol / purín", "Herbicida",
      "Fungicida", "Insecticida", "Cuerda / hilo de empacar",
      "Plástico de ensilado"
    ]
  },
  {
    id: "combustible", label: "Combustible y energía", emoji: "⛽",
    accent: "text-orange-900 bg-orange-100 border-orange-300",
    items: [
      "Gasoil agrícola (B)", "Gasoil de automoción", "Gasolina",
      "Gas propano (botella)", "Aceite hidráulico",
      "Aceite de motor", "Grasa lubricante"
    ]
  },
  {
    id: "maquinaria", label: "Maquinaria y herramientas", emoji: "🔧",
    accent: "text-slate-900 bg-slate-100 border-slate-300",
    items: [
      "Repuesto tractor (especificar)", "Filtro de aceite",
      "Filtro de aire", "Filtro de combustible", "Neumático",
      "Cadena / correa", "Herramientas de mano",
      "Electrodos / soldadura", "Disco de corte", "Carretilla / saca"
    ]
  },
  {
    id: "oficina", label: "Oficina y gestión", emoji: "📋",
    accent: "text-indigo-900 bg-indigo-100 border-indigo-300",
    items: [
      "Material de oficina", "Tóner / tinta", "Etiquetas",
      "Cuadernos de explotación", "Móvil / accesorios",
      "Software / licencias"
    ]
  },
  {
    id: "otros", label: "Otros", emoji: "📦",
    accent: "text-zinc-900 bg-zinc-100 border-zinc-300",
    items: []
  }
];

const findCategory = (id) => CATEGORIES.find((c) => c.id === id);

// =============================================================
// STORAGE / HELPERS
// =============================================================
const storage = {
  async get(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(key, value) { try { await window.storage.set(key, JSON.stringify(value)); return true; } catch { return false; } },
  async delete(key) { try { await window.storage.delete(key); return true; } catch { return false; } },
  async list(prefix) { try { const r = await window.storage.list(prefix); return r?.keys || []; } catch { return []; } }
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (iso) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const todayISO = () => new Date().toISOString().slice(0, 10);
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = (height / width) * MAX; width = MAX; }
        else { width = (width / height) * MAX; height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const dataUrlToFile = async (dataUrl, filename) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

const UNITS = ["kg", "uds", "sacos", "litros", "cajas", "palés", "m³", "tn", "m"];
const URGENCIAS = [
  { v: "alta", label: "Urgente", color: "bg-rose-700" },
  { v: "media", label: "Normal", color: "bg-amber-600" },
  { v: "baja", label: "Cuando se pueda", color: "bg-emerald-700" }
];

const IVA_OPTIONS = [0, 4, 10, 21];
const DEFAULT_IVA = {
  alimentacion: 10, sanidad: 21, reproduccion: 21, manejo: 21,
  instalaciones: 21, limpieza: 21, epis: 21, agricultura: 10,
  combustible: 21, maquinaria: 21, oficina: 21, otros: 21
};
const parseNum = (s) => {
  if (s === null || s === undefined || s === "") return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
};
const fmtEuro = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
};
const calcLine = (item) => {
  const qty = parseNum(item.qty);
  const priceExcl = parseNum(item.priceExcl);
  if (qty === null || priceExcl === null) return null;
  const iva = item.iva != null ? Number(item.iva) : 21;
  const totalExcl = qty * priceExcl;
  const ivaAmount = totalExcl * (iva / 100);
  return { qty, priceExcl, iva, totalExcl, ivaAmount, totalIncl: totalExcl + ivaAmount };
};
const calcTotals = (items) => {
  let subtotal = 0, iva = 0, hasAny = false;
  (items || []).forEach((it) => {
    const r = calcLine(it);
    if (r) { subtotal += r.totalExcl; iva += r.ivaAmount; hasAny = true; }
  });
  return { subtotal, iva, total: subtotal + iva, hasAny };
};

const PAYMENT_STATUS = [
  { v: "pendiente", label: "Pendiente", emoji: "⏳" },
  { v: "pagado",    label: "Pagado",    emoji: "💵" },
  { v: "factura",   label: "Pasará factura", emoji: "📄" }
];
const PAYMENT_METHODS = [
  { v: "efectivo",      label: "Efectivo" },
  { v: "transferencia", label: "Transferencia" },
  { v: "bizum",         label: "Bizum" },
  { v: "tarjeta",       label: "Tarjeta" },
  { v: "cheque",        label: "Cheque" },
  { v: "domiciliacion", label: "Domiciliación" },
  { v: "compensacion",  label: "Compensación" },
  { v: "otro",          label: "Otro" }
];
const findPayStatus = (v) => PAYMENT_STATUS.find((s) => s.v === v);
const findPayMethod = (v) => PAYMENT_METHODS.find((m) => m.v === v);

// =============================================================
// REGISTROS — type-specific farm log entries
// Multi-especie (ovino/lanar, porcino, vacuno/bovino).
// Aligned to Spanish legislation (mejor conocimiento mayo 2026):
//   · RD 666/2023 — medicamentos veterinarios (PRESVET)
//   · RD 306/2020 Anexo VIII — libro de registro porcino
//   · RD 1053/2022 Anexo VII — libro registro bovino
//   · RD 685/2013 + RD 2129/2008 — ovino-caprino (identificación electrónica)
//   · RD 728/2007 — movimientos pecuarios
//   · RD 479/2004 — REGA · censos anuales
//   · RD 1311/2012 + RD 1054/2022 — fitosanitarios y CUE
// Cada CCAA puede añadir requisitos: validar con veterinario de explotación
// y Oficina Comarcal Agraria.
// =============================================================
const SPECIES_OPTIONS = ["🐷 Porcino", "🐑 Ovino / Lanar", "🐄 Vacuno / Bovino", "Mixto / varias"];
const speciesField = {
  k: "species", label: "Especie", type: "select", options: SPECIES_OPTIONS, required: true
};
const ANIMAL_CATEGORIES = [
  "Cría / lactante",
  "Destete / recría / transición",
  "Cebo / engorde / acabado",
  "Reproductor/a (madre / padre)",
  "Primípara / Nulípara",
  "Reposición",
  "Animal para vida",
  "Otro"
];

const REGISTRO_TYPES = [
  {
    id: "tratamiento", label: "Tratamiento veterinario", short: "Tratamiento",
    icon: "💊", color: "from-rose-700 to-rose-900",
    accent: "bg-rose-100 text-rose-900 border-rose-300",
    section: "ganaderia", legal: true,
    legalRef: "RD 666/2023 · RD 306/2020 (porcino) · RD 1053/2022 (bovino) · RD 685/2013 (ovino)",
    fields: [
      speciesField,
      { k: "animal", label: "Identificación del animal o lote", type: "text", placeholder: "Crotal, lote, sala...", required: true },
      { k: "drug", label: "Medicamento (nombre comercial)", type: "text", placeholder: "Ej: Amoxicilina LA 150 mg/ml", required: true },
      { k: "activeIngredient", label: "Principio activo", type: "text", placeholder: "Ej: Amoxicilina trihidrato" },
      { k: "route", label: "Vía de administración", type: "select", options: [
        "Intramuscular (IM)", "Subcutánea (SC)", "Intravenosa (IV)", "Oral", "En agua de bebida", "En pienso", "Tópica", "Otro"
      ], required: true },
      { k: "amount", label: "Cantidad administrada", type: "text", placeholder: "Ej: 1 ml/10 kg PV · 50 ml total", required: true },
      { k: "treatedAt", label: "Fecha inicio del tratamiento", type: "date", default: "today", required: true },
      { k: "durationDays", label: "Duración (días)", type: "number", placeholder: "Ej: 5", required: true },
      { k: "withdrawalDays", label: "Plazo de espera carne (días)", type: "number", placeholder: "Ej: 28", required: true },
      { k: "withdrawalDaysMilk", label: "Plazo espera leche (h, si aplica)", type: "number" },
      { k: "vetName", label: "Veterinario prescriptor", type: "text", placeholder: "Nombre y apellidos", required: true },
      { k: "vetCol", label: "Nº colegiado del veterinario", type: "text", required: true },
      { k: "prescriptionId", label: "Nº de receta veterinaria", type: "text", placeholder: "Imprescindible para PRESVET", required: true },
      { k: "reason", label: "Motivo / diagnóstico", type: "textarea", placeholder: "Ej: Mastitis post-parto" }
    ],
    computed: (d) => {
      if (d?.treatedAt && d?.withdrawalDays) {
        const dt = new Date(d.treatedAt);
        const dur = Number(d.durationDays) || 0;
        dt.setDate(dt.getDate() + dur + Number(d.withdrawalDays));
        return { withdrawalEndDate: dt.toISOString().slice(0, 10) };
      }
      return {};
    },
    computedLabels: { withdrawalEndDate: "🚫 Animal apto para sacrificio (fin plazo de espera)" }
  },

  {
    id: "baja", label: "Baja / mortalidad", short: "Baja",
    icon: "🪦", color: "from-stone-700 to-stone-900",
    accent: "bg-stone-200 text-stone-900 border-stone-400",
    section: "ganaderia", legal: true,
    legalRef: "RD 306/2020 (porcino) · RD 1053/2022 (bovino) · RD 685/2013 (ovino)",
    fields: [
      speciesField,
      { k: "animal", label: "Identificación del animal o lote", type: "text", required: true, placeholder: "Crotal, lote..." },
      { k: "category", label: "Categoría", type: "select", required: true, options: ANIMAL_CATEGORIES },
      { k: "ageDays", label: "Edad estimada (días)", type: "number" },
      { k: "weight", label: "Peso aprox. (kg)", type: "number" },
      { k: "deathDate", label: "Fecha de la baja", type: "date", default: "today", required: true },
      { k: "cause", label: "Causa probable", type: "textarea", required: true, placeholder: "Aplastamiento, diarrea, neumonía, golpe de calor, eutanasia..." },
      { k: "disposal", label: "Destino del cadáver", type: "select", required: true, options: [
        "Recogida SANDACH (Reglamento CE 1069/2009)",
        "Incineración autorizada",
        "Otro - autorizado"
      ]},
      { k: "sandachRef", label: "Nº albarán recogida SANDACH", type: "text", placeholder: "Si procede" },
      { k: "sandachCompany", label: "Empresa de recogida", type: "text" }
    ]
  },

  {
    id: "movimiento", label: "Movimiento de animales", short: "Movimiento",
    icon: "🚛", color: "from-emerald-700 to-emerald-900",
    accent: "bg-emerald-100 text-emerald-900 border-emerald-300",
    section: "ganaderia", legal: true,
    legalRef: "RD 728/2007 · Reglamento UE 2016/429",
    fields: [
      speciesField,
      { k: "direction", label: "Tipo", type: "select", options: ["Entrada", "Salida"], required: true },
      { k: "moveDate", label: "Fecha del movimiento", type: "date", default: "today", required: true },
      { k: "category", label: "Categoría animal", type: "select", required: true, options: ANIMAL_CATEGORIES },
      { k: "count", label: "Nº animales", type: "number", required: true },
      { k: "totalWeight", label: "Peso total (kg)", type: "number" },
      { k: "originRega", label: "REGA origen", type: "text", placeholder: "ES + 12 dígitos", required: true },
      { k: "destRega", label: "REGA destino o matadero", type: "text", placeholder: "ES + 12 dígitos · matadero", required: true },
      { k: "guideNumber", label: "Nº DTSI / Guía sanitaria", type: "text", required: true },
      { k: "transporter", label: "Transportista", type: "text", placeholder: "Empresa y nº autorización" },
      { k: "vehiclePlate", label: "Matrícula del vehículo", type: "text" },
      { k: "vehicleCleaned", label: "Vehículo desinfectado", type: "select", options: ["Sí - antes de la carga", "Sí - certificado adjunto", "No"] }
    ]
  },

  {
    id: "visita", label: "Visita a la explotación", short: "Visita",
    icon: "🚪", color: "from-amber-700 to-orange-900",
    accent: "bg-amber-100 text-amber-900 border-amber-300",
    section: "ganaderia", legal: true,
    legalRef: "RD 306/2020 art. 5 · Anexo II (bioseguridad porcino) · análogo bovino/ovino",
    fields: [
      { k: "person", label: "Nombre y apellidos", type: "text", required: true },
      { k: "company", label: "Empresa / cargo", type: "text", placeholder: "Veterinario, transportista, técnico, ITV...", required: true },
      { k: "reason", label: "Motivo de la visita", type: "textarea", required: true },
      { k: "vehicle", label: "Matrícula del vehículo", type: "text" },
      { k: "lastFarm", label: "Última explotación visitada", type: "text", placeholder: "REGA o 'Ninguna en últimos 5 días'" },
      { k: "visitDate", label: "Fecha", type: "date", default: "today", required: true },
      { k: "entryTime", label: "Hora entrada", type: "time", required: true },
      { k: "exitTime", label: "Hora salida", type: "time" },
      { k: "biosecurity", label: "Cumplió protocolo de bioseguridad", type: "select", required: true, options: [
        "Sí - vehículo desinfectado · ducha · ropa propia",
        "Sí - vacío sanitario respetado",
        "Cumplió parcialmente",
        "No cumplió"
      ]}
    ]
  },

  {
    id: "censo", label: "Censo de animales", short: "Censo",
    icon: "🔢", color: "from-indigo-700 to-indigo-900",
    accent: "bg-indigo-100 text-indigo-900 border-indigo-300",
    section: "ganaderia", legal: true,
    legalRef: "RD 479/2004 art. 4.3 — antes del 1 de marzo cada año",
    fields: [
      speciesField,
      { k: "censusDate", label: "Fecha del censo", type: "date", default: "today", required: true },
      { k: "reproductoras", label: "Reproductoras / madres", type: "number", placeholder: "Cerdas, ovejas, vacas..." },
      { k: "primiparas", label: "Primíparas / nulíparas", type: "number" },
      { k: "sementales", label: "Sementales / machos reproductores", type: "number", placeholder: "Verracos, moruecos, toros..." },
      { k: "lactantes", label: "Crías lactantes", type: "number", placeholder: "Lechones, corderos, terneros..." },
      { k: "destete", label: "Destetados / recría", type: "number" },
      { k: "cebo", label: "Cebo / engorde", type: "number" },
      { k: "otros", label: "Otros animales", type: "number" },
      { k: "notes", label: "Observaciones", type: "textarea" }
    ],
    computed: (d) => {
      const total = ["reproductoras","primiparas","sementales","lactantes","destete","cebo","otros"]
        .reduce((s, k) => s + (Number(d?.[k]) || 0), 0);
      return { totalAnimals: total };
    },
    computedLabels: { totalAnimals: "Σ Total animales en explotación" }
  },

  {
    id: "cubricion", label: "Cubrición / inseminación", short: "Cubrición",
    icon: "🧬", color: "from-purple-700 to-purple-900",
    accent: "bg-purple-100 text-purple-900 border-purple-300",
    section: "ganaderia",
    legalRef: "Operativo · RD 429/2022 (productos reproductivos)",
    fields: [
      speciesField,
      { k: "female", label: "Hembra / nº crotal", type: "text", required: true },
      { k: "maleOrDose", label: "Macho / pajuela usada", type: "text", placeholder: "Verraco, morueco, toro · pajuela y lote" },
      { k: "method", label: "Método", type: "select", options: ["Inseminación cepo", "Monta natural", "IA cervical", "IA postcervical", "Otro"] },
      { k: "doseCount", label: "Dosis aplicadas", type: "number" },
      { k: "breedingDate", label: "Fecha cubrición", type: "date", default: "today", required: true },
      { k: "observations", label: "Observaciones", type: "textarea", placeholder: "Comportamiento, celo, repetición..." }
    ],
    computed: (d) => {
      if (!d?.breedingDate) return {};
      const base = new Date(d.breedingDate);
      // Gestación según especie (días aprox):
      //   Porcino: 114 / Ovino: 150 / Vacuno: 280
      const sp = d.species || "";
      let gest = 114, eco1 = 28, eco2 = 48, label = "Parto previsto";
      if (sp.includes("Ovino")) { gest = 150; eco1 = 30; eco2 = 50; label = "Parto previsto (~150 d)"; }
      else if (sp.includes("Vacuno")) { gest = 280; eco1 = 30; eco2 = 60; label = "Parto previsto (~280 d)"; }
      else { label = "Parto previsto (~114 d)"; }
      const eco = new Date(base); eco.setDate(eco.getDate() + eco1);
      const ecoB = new Date(base); ecoB.setDate(ecoB.getDate() + eco2);
      const farrow = new Date(base); farrow.setDate(farrow.getDate() + gest);
      return {
        ecoDate: eco.toISOString().slice(0, 10),
        eco2Date: ecoB.toISOString().slice(0, 10),
        farrowDate: farrow.toISOString().slice(0, 10),
        _farrowLabel: label
      };
    },
    computedLabels: {
      ecoDate: "🔍 Ecografía 1ª",
      eco2Date: "✅ Confirmación",
      farrowDate: "🐣 Parto previsto"
    }
  },

  {
    id: "parto", label: "Parto / camada", short: "Parto",
    icon: "🐣", color: "from-pink-700 to-pink-900",
    accent: "bg-pink-100 text-pink-900 border-pink-300",
    section: "ganaderia",
    legalRef: "Operativo (recomendado libro de partos)",
    fields: [
      speciesField,
      { k: "female", label: "Hembra / nº crotal", type: "text", required: true },
      { k: "farrowDate", label: "Fecha parto", type: "date", default: "today", required: true },
      { k: "alive", label: "Nacidos vivos", type: "number" },
      { k: "stillborn", label: "Nacidos muertos", type: "number" },
      { k: "mummified", label: "Momificados / no viables", type: "number" },
      { k: "weakBornDead", label: "Muertos primeras 24 h", type: "number" },
      { k: "complications", label: "Incidencias del parto", type: "textarea", placeholder: "Distocia, oxitocina, ayuda manual..." }
    ],
    computed: (d) => ({
      totalBorn: (Number(d?.alive) || 0) + (Number(d?.stillborn) || 0) + (Number(d?.mummified) || 0)
    }),
    computedLabels: { totalBorn: "Σ Total nacidos" }
  },

  {
    id: "lectura", label: "Lectura diaria", short: "Lectura",
    icon: "📊", color: "from-cyan-700 to-cyan-900",
    accent: "bg-cyan-100 text-cyan-900 border-cyan-300",
    section: "ganaderia",
    legalRef: "Operativo (recomendado SIGE — RD 306/2020)",
    fields: [
      speciesField,
      { k: "room", label: "Sala / nave / cercado", type: "text", required: true },
      { k: "tempC", label: "Temperatura (°C)", type: "number", step: "0.1" },
      { k: "humidity", label: "Humedad (%)", type: "number" },
      { k: "waterL", label: "Consumo agua (L)", type: "number" },
      { k: "feedKg", label: "Pienso / forraje (kg)", type: "number" },
      { k: "notes", label: "Ventilación / observaciones", type: "textarea" },
      { k: "readingDate", label: "Fecha", type: "date", default: "today", required: true }
    ]
  },

  {
    id: "incidencia", label: "Incidencia / avería", short: "Incidencia",
    icon: "⚠️", color: "from-orange-700 to-orange-900",
    accent: "bg-orange-100 text-orange-900 border-orange-300",
    section: "ganaderia",
    legalRef: "Operativo",
    fields: [
      { k: "title", label: "Título breve", type: "text", required: true, placeholder: "Ej: Bomba de agua averiada nave 2" },
      { k: "location", label: "Ubicación", type: "text", placeholder: "Sala, nave, equipo, parcela..." },
      { k: "description", label: "Descripción", type: "textarea", required: true },
      { k: "priority", label: "Prioridad", type: "select", options: ["Crítico - hay que actuar ya", "Alta", "Normal", "Baja"] },
      { k: "incidentDate", label: "Fecha", type: "date", default: "today", required: true }
    ]
  },

  {
    id: "fitosanitario", label: "Tratamiento fitosanitario", short: "Fitosanitario",
    icon: "🌱", color: "from-lime-700 to-lime-900",
    accent: "bg-lime-100 text-lime-900 border-lime-300",
    section: "agricultura", legal: true,
    legalRef: "RD 1311/2012 · RD 1054/2022 (CUE)",
    fields: [
      { k: "applicationDate", label: "Fecha de aplicación", type: "date", default: "today", required: true },
      { k: "plotSigpac", label: "Parcela SIGPAC", type: "text", placeholder: "Provincia · Municipio · Polígono · Parcela · Recinto", required: true },
      { k: "crop", label: "Cultivo", type: "text", required: true },
      { k: "areaHa", label: "Superficie tratada (ha)", type: "number", step: "0.01", required: true },
      { k: "product", label: "Producto fitosanitario", type: "text", required: true, placeholder: "Nombre comercial" },
      { k: "productRegistry", label: "Nº de registro del producto", type: "text", required: true, placeholder: "Ej: 12345" },
      { k: "doseHa", label: "Dosis (l/ha o kg/ha)", type: "text", required: true },
      { k: "broth", label: "Volumen de caldo (l/ha)", type: "text" },
      { k: "reason", label: "Plaga / enfermedad / mala hierba", type: "text", required: true },
      { k: "efficacy", label: "Eficacia obtenida", type: "select", options: ["Buena", "Media", "Baja", "Pendiente de evaluar"] },
      { k: "withdrawalDays", label: "Plazo de seguridad (días)", type: "number", required: true },
      { k: "advisorName", label: "Asesor (si aplica)", type: "text" },
      { k: "advisorRopa", label: "Nº ROPA del asesor", type: "text" },
      { k: "applicatorName", label: "Aplicador", type: "text", required: true },
      { k: "applicatorRopo", label: "Nº carnet ROPO del aplicador", type: "text", required: true },
      { k: "applicatorLevel", label: "Nivel ROPO", type: "select", options: ["Básico", "Cualificado", "Fumigador", "Piloto"] }
    ],
    computed: (d) => {
      if (d?.applicationDate && d?.withdrawalDays) {
        const dt = new Date(d.applicationDate);
        dt.setDate(dt.getDate() + Number(d.withdrawalDays));
        return { safetyEndDate: dt.toISOString().slice(0, 10) };
      }
      return {};
    },
    computedLabels: { safetyEndDate: "🚫 Cosecha permitida (fin plazo seguridad)" }
  },

  {
    id: "fertilizacion", label: "Fertilización / abonado", short: "Fertilización",
    icon: "🧪", color: "from-yellow-700 to-yellow-900",
    accent: "bg-yellow-100 text-yellow-900 border-yellow-300",
    section: "agricultura", legal: true,
    legalRef: "RD 1051/2022 (mod. RD 840/2024 · RD 934/2025) — registrar máx. 1 mes",
    fields: [
      { k: "applicationDate", label: "Fecha de aplicación", type: "date", default: "today", required: true },
      { k: "plotSigpac", label: "Parcela SIGPAC / UHC", type: "text", placeholder: "Provincia · Municipio · Polígono · Parcela · Recinto", required: true },
      { k: "crop", label: "Cultivo", type: "text", required: true },
      { k: "areaHa", label: "Superficie fertilizada (ha)", type: "number", step: "0.01", required: true },
      { k: "fertilizerType", label: "Tipo de fertilizante", type: "select", required: true, options: [
        "Mineral / inorgánico",
        "Orgánico - estiércol sólido",
        "Orgánico - purín / lisier",
        "Orgánico - compost",
        "Orgánico - lodo de depuradora",
        "Orgánico - residuo agroalimentario",
        "Foliar",
        "Mixto / mezcla"
      ]},
      { k: "product", label: "Producto / nombre comercial", type: "text", required: true, placeholder: "Ej: NAC 27, purín cerda propio, compost..." },
      { k: "nContent", label: "% N (nitrógeno)", type: "number", step: "0.1" },
      { k: "pContent", label: "% P₂O₅ (fósforo)", type: "number", step: "0.1" },
      { k: "kContent", label: "% K₂O (potasio)", type: "number", step: "0.1" },
      { k: "organicMatter", label: "% Materia orgánica (si orgánico)", type: "number", step: "0.1" },
      { k: "doseHa", label: "Dosis (kg/ha o m³/ha)", type: "text", required: true, placeholder: "Ej: 350 kg/ha · 30 m³/ha" },
      { k: "totalAmount", label: "Cantidad total aplicada", type: "text", placeholder: "kg, t, m³..." },
      { k: "applicationMethod", label: "Forma de aplicación", type: "select", options: [
        "Fondo (antes de siembra)",
        "Cobertura",
        "Fertirrigación",
        "Inyección al suelo",
        "Foliar",
        "Cisterna - localizada en banda",
        "Cisterna - voleo"
      ]},
      { k: "ureaReduction", label: "Si urea: método reducción NH₃", type: "text", placeholder: "Inhibidor, inyección... (anexo V RD 1051/2022)" },
      { k: "vulnerableZone", label: "¿Zona vulnerable a nitratos?", type: "select", options: ["Sí", "No", "No lo sé"] },
      { k: "advisorName", label: "Asesor en fertilización (si aplica)", type: "text" },
      { k: "applicatorName", label: "Aplicador", type: "text" },
      { k: "machinery", label: "Maquinaria utilizada", type: "text" }
    ]
  },

  {
    id: "riego", label: "Riego", short: "Riego",
    icon: "💧", color: "from-blue-700 to-blue-900",
    accent: "bg-blue-100 text-blue-900 border-blue-300",
    section: "agricultura",
    legalRef: "Operativo · parte del CUE (RD 1054/2022) cuando aplica",
    fields: [
      { k: "irrigationDate", label: "Fecha del riego", type: "date", default: "today", required: true },
      { k: "plotSigpac", label: "Parcela SIGPAC", type: "text", required: true },
      { k: "crop", label: "Cultivo", type: "text", required: true },
      { k: "areaHa", label: "Superficie regada (ha)", type: "number", step: "0.01" },
      { k: "waterSource", label: "Origen del agua", type: "select", options: [
        "Pozo propio", "Comunidad de regantes", "Embalse / pantano",
        "Río / arroyo", "Balsa propia", "Agua reutilizada", "Otro"
      ]},
      { k: "irrigationSystem", label: "Sistema de riego", type: "select", options: [
        "Goteo", "Aspersión", "Pivot", "Cobertura aérea fija",
        "Surco / inundación", "Microaspersión", "Manta", "Otro"
      ]},
      { k: "volumeM3", label: "Volumen aplicado (m³)", type: "number" },
      { k: "durationHours", label: "Duración (horas)", type: "number", step: "0.5" },
      { k: "flowRate", label: "Caudal (m³/h o l/s)", type: "text" },
      { k: "notes", label: "Observaciones", type: "textarea" }
    ]
  },

  {
    id: "siembra", label: "Siembra / plantación", short: "Siembra",
    icon: "🪴", color: "from-green-700 to-green-900",
    accent: "bg-green-100 text-green-900 border-green-300",
    section: "agricultura",
    legalRef: "Operativo · sección del cuaderno de explotación",
    fields: [
      { k: "sowingDate", label: "Fecha de siembra / plantación", type: "date", default: "today", required: true },
      { k: "plotSigpac", label: "Parcela SIGPAC", type: "text", required: true },
      { k: "crop", label: "Cultivo", type: "text", required: true },
      { k: "variety", label: "Variedad", type: "text" },
      { k: "areaHa", label: "Superficie sembrada (ha)", type: "number", step: "0.01" },
      { k: "seedType", label: "Tipo de semilla", type: "select", options: [
        "Certificada", "R1", "R2", "Estándar",
        "Propia / saca de la explotación", "Híbrida", "Otro"
      ]},
      { k: "seedLot", label: "Lote / nº certificado de la semilla", type: "text" },
      { k: "doseHa", label: "Dosis (kg/ha o sem./ha)", type: "text" },
      { k: "depthCm", label: "Profundidad (cm)", type: "number", step: "0.5" },
      { k: "spacing", label: "Marco de plantación", type: "text", placeholder: "Ej: 0.7 × 0.2 m" },
      { k: "machinery", label: "Maquinaria", type: "text", placeholder: "Sembradora, plantadora..." },
      { k: "notes", label: "Observaciones", type: "textarea" }
    ]
  },

  {
    id: "cosecha", label: "Cosecha / recolección", short: "Cosecha",
    icon: "🌾", color: "from-amber-600 to-amber-800",
    accent: "bg-amber-100 text-amber-900 border-amber-300",
    section: "agricultura",
    legalRef: "Operativo · rendimientos para CUE / PAC",
    fields: [
      { k: "harvestDate", label: "Fecha (inicio o única)", type: "date", default: "today", required: true },
      { k: "harvestEndDate", label: "Fecha fin (si varios días)", type: "date" },
      { k: "plotSigpac", label: "Parcela SIGPAC", type: "text", required: true },
      { k: "crop", label: "Cultivo", type: "text", required: true },
      { k: "areaHa", label: "Superficie cosechada (ha)", type: "number", step: "0.01", required: true },
      { k: "totalProductionKg", label: "Producción total (kg)", type: "number", required: true, placeholder: "Si en t, multiplica × 1000" },
      { k: "moisture", label: "Humedad (%)", type: "number", step: "0.1" },
      { k: "quality", label: "Calidad / impurezas", type: "text" },
      { k: "destination", label: "Destino", type: "select", options: [
        "Almacén propio",
        "Cooperativa",
        "Venta directa",
        "Industria",
        "Autoconsumo / propio ganado",
        "Otro"
      ]},
      { k: "buyer", label: "Comprador (si venta)", type: "text" },
      { k: "machinery", label: "Maquinaria", type: "text", placeholder: "Cosechadora propia, alquilada, contratada..." },
      { k: "notes", label: "Observaciones", type: "textarea" }
    ],
    computed: (d) => {
      const prod = parseFloat(d?.totalProductionKg);
      const area = parseFloat(d?.areaHa);
      if (prod > 0 && area > 0) {
        return { yieldKgHa: Math.round(prod / area) };
      }
      return {};
    },
    computedLabels: { yieldKgHa: "📈 Rendimiento medio (kg/ha)" }
  },

  {
    id: "labor", label: "Labor agrícola / laboreo", short: "Labor",
    icon: "🚜", color: "from-stone-600 to-stone-800",
    accent: "bg-stone-100 text-stone-900 border-stone-400",
    section: "agricultura",
    legalRef: "Operativo",
    fields: [
      { k: "workDate", label: "Fecha", type: "date", default: "today", required: true },
      { k: "plotSigpac", label: "Parcela SIGPAC", type: "text", required: true },
      { k: "workType", label: "Tipo de labor", type: "select", required: true, options: [
        "Laboreo profundo (vertedera / chisel)",
        "Labor superficial (cultivador / grada)",
        "Vibrocultor",
        "Rulo / pase de rulo",
        "Subsolador",
        "Rotovator",
        "Pase de rastra",
        "Sin laboreo / siembra directa",
        "Empacado de paja / forraje",
        "Mantenimiento (linderos, cunetas, vallas)",
        "Otro"
      ]},
      { k: "crop", label: "Cultivo (previsto / actual)", type: "text" },
      { k: "areaHa", label: "Superficie (ha)", type: "number", step: "0.01" },
      { k: "machinery", label: "Maquinaria utilizada", type: "text", placeholder: "Tractor, apero..." },
      { k: "fuelL", label: "Combustible aproximado (L)", type: "number" },
      { k: "hours", label: "Horas de trabajo", type: "number", step: "0.5" },
      { k: "notes", label: "Observaciones", type: "textarea" }
    ]
  }
];
const findRegType = (id) => REGISTRO_TYPES.find((t) => t.id === id);

// =============================================================
// CLOUD SYNC — Firebase Realtime Database
// Config embebido — todos los móviles que abran este HTML conectan
// al mismo Firebase. Sólo necesitan poner su "Nombre de móvil" en Ajustes.
// =============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAil69yaJUrLwMgsI0qNWYYeoSaL8I5toc",
  authDomain: "grupo-murillo-gomez-cuetara.firebaseapp.com",
  databaseURL: "https://grupo-murillo-gomez-cuetara-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "grupo-murillo-gomez-cuetara",
  storageBucket: "grupo-murillo-gomez-cuetara.firebasestorage.app",
  messagingSenderId: "8631144482",
  appId: "1:8631144482:web:cccd87cb7a36a907f37a7b"
};

let firebaseDb = null;
try {
  const fbApp = fbInit(FIREBASE_CONFIG);
  firebaseDb = fbDb(fbApp);
} catch (err) {
  console.error("Firebase init failed:", err);
}

async function syncDocToCloud(doc, settings) {
  if (!firebaseDb) return { ok: false, error: "no_firebase" };
  try {
    const payload = {
      ...doc,
      deviceName: settings.deviceName || "",
      lastSyncedAt: new Date().toISOString()
    };
    await fbSet(fbRef(firebaseDb, `docs/${doc.id}`), payload);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "network" };
  }
}

async function deleteDocFromCloud(docId) {
  if (!firebaseDb) return { ok: false };
  try {
    await fbRemove(fbRef(firebaseDb, `docs/${docId}`));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function subscribeToCloud(callback) {
  if (!firebaseDb) return () => {};
  const unsub = fbOnValue(fbRef(firebaseDb, "docs"), (snapshot) => {
    const data = snapshot.val() || {};
    callback(Object.values(data));
  }, (err) => {
    console.error("Firebase subscription error:", err);
  });
  return unsub;
}

async function pingFirebase() {
  if (!firebaseDb) return { ok: false, error: "no_firebase" };
  try {
    await fbSet(fbRef(firebaseDb, "_ping"), { ts: Date.now() });
    return { ok: true, name: "Firebase: " + FIREBASE_CONFIG.projectId };
  } catch (err) {
    return { ok: false, error: err.message || "network" };
  }
}

// =============================================================
// MAIN APP
// =============================================================
export default function App() {
  const [view, setView] = useState({ name: "home" });
  const [docs, setDocs] = useState([]);
  const [settings, setSettings] = useState({
    workerName: "", farmName: COMPANY.fullName,
    officeEmail: "", officeWhatsapp: "",
    deviceName: ""
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await storage.get("settings");
      if (s) setSettings({
        farmName: s.farmName || COMPANY.fullName,
        deviceName: s.deviceName || "",
        ...s
      });
      const keys = await storage.list("doc:");
      const loaded = await Promise.all(keys.map(async (k) => await storage.get(k)));
      setDocs(loaded.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    })();
  }, []);

  // Suscripción en tiempo real a Firebase — todos los móviles ven los cambios
  useEffect(() => {
    if (loading || !firebaseDb) return;
    const unsub = subscribeToCloud(async (cloudDocs) => {
      const cloudMap = new Map(cloudDocs.map((d) => [d.id, d]));
      const localKeys = await storage.list("doc:");
      const localDocs = (await Promise.all(localKeys.map((k) => storage.get(k)))).filter(Boolean);
      const localMap = new Map(localDocs.map((d) => [d.id, d]));

      // Para cada doc en la nube: si no lo tengo o el de la nube es más reciente, guardarlo
      for (const cd of cloudDocs) {
        const local = localMap.get(cd.id);
        const cloudT = cd.lastSyncedAt || cd.createdAt || "";
        const localT = local?.lastSyncedAt || local?.createdAt || "";
        if (!local || cloudT > localT) {
          const merged = { ...cd, syncStatus: "synced" };
          await storage.set(`doc:${cd.id}`, merged);
          localMap.set(cd.id, merged);
        }
      }
      // Quitar local los que ya no están en la nube (borrados desde otro móvil)
      // — solo si su syncStatus era 'synced', sino podrían ser pendientes locales
      for (const ld of localDocs) {
        if (!cloudMap.has(ld.id) && ld.syncStatus === "synced") {
          await storage.delete(`doc:${ld.id}`);
          localMap.delete(ld.id);
        }
      }

      const merged = Array.from(localMap.values())
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setDocs(merged);
    });
    return () => unsub();
  }, [loading]);

  // Reintentar sincronización de los pendientes al cargar
  useEffect(() => {
    if (loading || !firebaseDb) return;
    const pending = docs.filter((d) => d.syncStatus === "pending" || d.syncStatus === "error" || d.syncStatus === "syncing");
    if (pending.length === 0) return;
    pending.forEach((d, i) => setTimeout(() => triggerSync(d.id), i * 800));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const saveSettings = async (s) => {
    setSettings(s);
    await storage.set("settings", s);
    showToast("Ajustes guardados");
  };

  const saveDoc = async (doc) => {
    const enriched = firebaseDb
      ? { ...doc, syncStatus: doc.syncStatus === "synced" ? "pending" : (doc.syncStatus || "pending") }
      : doc;
    await storage.set(`doc:${enriched.id}`, enriched);
    setDocs((d) => {
      const f = d.filter((x) => x.id !== enriched.id);
      return [enriched, ...f].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
    if (firebaseDb) triggerSync(enriched.id);
  };

  const triggerSync = async (docId) => {
    const stored = await storage.get(`doc:${docId}`);
    if (!stored) return;
    const syncing = { ...stored, syncStatus: "syncing" };
    await storage.set(`doc:${docId}`, syncing);
    setDocs((d) => d.map((x) => x.id === docId ? syncing : x));

    const result = await syncDocToCloud(syncing, settings);

    const updated = result.ok
      ? { ...syncing, syncStatus: "synced", syncedAt: new Date().toISOString(), lastSyncedAt: new Date().toISOString(), syncError: null }
      : { ...syncing, syncStatus: "error", syncError: result.error };
    await storage.set(`doc:${docId}`, updated);
    setDocs((d) => d.map((x) => x.id === docId ? updated : x));
  };

  const syncAllNow = async () => {
    if (!firebaseDb) {
      showToast("Firebase no disponible", "err");
      return;
    }
    const all = docs;
    if (all.length === 0) { showToast("No hay documentos"); return; }
    showToast(`Sincronizando ${all.length}...`);
    for (let i = 0; i < all.length; i++) {
      await triggerSync(all[i].id);
    }
    showToast("Sincronización terminada");
  };

  const deleteDoc = async (id) => {
    await storage.delete(`doc:${id}`);
    setDocs((d) => d.filter((x) => x.id !== id));
    if (firebaseDb) deleteDocFromCloud(id);
    showToast("Documento eliminado");
  };

  return (
    <div className="min-h-screen w-full" style={{
      fontFamily: "'Manrope', system-ui, sans-serif",
      background: "linear-gradient(180deg, #F5F0E1 0%, #EDE5D0 100%)",
      color: "#1F2A20",
      minHeight: "100dvh"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="max-w-md mx-auto pb-28 relative">
        <header className="px-5 pt-8 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 text-amber-50 flex items-center justify-center flex-shrink-0 shadow-md">
                <span style={{ fontFamily: "'Fraunces', serif" }}
                  className="text-2xl font-bold leading-none">M</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600 font-bold">
                  Grupo Agropecuario
                </p>
                <h1 style={{ fontFamily: "'Fraunces', serif" }}
                  className="text-xl font-bold text-emerald-950 leading-tight truncate">
                  Murillo Góme-Cuetara
                </h1>
                <p className="text-[11px] text-stone-700 mt-0.5">{COMPANY.tagline}</p>
              </div>
            </div>
            <button
              onClick={() => setView({ name: "settings" })}
              className="w-10 h-10 rounded-full bg-white/60 border border-stone-300/40 text-emerald-950 flex items-center justify-center shadow-sm active:scale-95 transition flex-shrink-0">
              <Settings size={17} />
            </button>
          </div>
          {settings.workerName && (
            <p className="text-sm text-stone-700 mt-3">
              Hola, <span className="font-semibold">{settings.workerName}</span>
            </p>
          )}
        </header>

        <main className="px-5">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-stone-500">Cargando...</div>
          ) : (
            <AnimatePresence mode="wait">
              {view.name === "home" && <HomeView key="home" docs={docs} setView={setView} settings={settings} />}
              {view.name === "new-albaran" && <DocForm key="alb" type="albaran" setView={setView} saveDoc={saveDoc} settings={settings} showToast={showToast} initial={view.initial} />}
              {view.name === "new-orden" && <DocForm key="orden" type="orden" setView={setView} saveDoc={saveDoc} settings={settings} showToast={showToast} initial={view.initial} />}
              {view.name === "new-registro" && <RegistroForm key={"reg-" + view.regType} regType={view.regType} setView={setView} saveDoc={saveDoc} settings={settings} showToast={showToast} initial={view.initial} />}
              {view.name === "history" && <HistoryView key="hist" docs={docs} setView={setView} />}
              {view.name === "detail" && <DetailView key="det" doc={view.doc} setView={setView} settings={settings} saveDoc={saveDoc} deleteDoc={deleteDoc} showToast={showToast} />}
              {view.name === "settings" && <SettingsView key="set" settings={settings} saveSettings={saveSettings} setView={setView} syncAllNow={syncAllNow} docs={docs} showToast={showToast} />}
            </AnimatePresence>
          )}
        </main>

        {["home", "history"].includes(view.name) && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-2 bg-gradient-to-t from-[#EDE5D0] via-[#EDE5D0] to-transparent"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
            <div className="bg-emerald-950 rounded-2xl flex items-center justify-around p-1.5 shadow-xl">
              <NavBtn icon={Home} label="Inicio" active={view.name === "home"} onClick={() => setView({ name: "home" })} />
              <NavBtn icon={Archive} label="Historial" active={view.name === "history"} onClick={() => setView({ name: "history" })} />
            </div>
          </nav>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
              <div className={`px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 ${
                toast.type === "ok" ? "bg-emerald-950 text-amber-50" : "bg-rose-700 text-white"
              }`}>
                <Check size={16} />{toast.msg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition ${
        active ? "bg-amber-50 text-emerald-950" : "text-amber-50/70"
      }`}>
      <Icon size={18} />
      <span className="text-[11px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}

// =============================================================
// HOME
// =============================================================
function HomeView({ docs, setView, settings }) {
  const pending = docs.filter((d) => d.status === "borrador").length;
  const sent = docs.filter((d) => d.status === "enviado").length;
  const recent = docs.slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <ActionCard color="from-emerald-800 to-emerald-950" icon={FileText}
          title="Albarán" subtitle="Entrada o salida"
          onClick={() => setView({ name: "new-albaran" })} />
        <ActionCard color="from-amber-700 to-orange-900" icon={ShoppingCart}
          title="Pedido" subtitle="Orden de compra"
          onClick={() => setView({ name: "new-orden" })} />
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 px-1 flex items-center gap-1.5">
          <span>🐑🐷🐄</span> Ganadería · {REGISTRO_TYPES.filter((t) => t.section === "ganaderia").length} registros
        </p>
        <div className="grid grid-cols-3 gap-2">
          {REGISTRO_TYPES.filter((t) => t.section === "ganaderia").map((t) => (
            <button key={t.id}
              onClick={() => setView({ name: "new-registro", regType: t.id })}
              className="bg-white/70 border border-stone-300/40 rounded-xl p-2.5 flex flex-col items-center gap-1 active:scale-95 transition shadow-sm relative">
              {t.legal && <span className="absolute top-1 right-1 text-[8px]" title="Obligatorio por ley">⚖</span>}
              <span className="text-2xl leading-none mt-0.5">{t.icon}</span>
              <span className="text-[10px] font-bold text-emerald-950 leading-tight text-center">{t.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 px-1 flex items-center gap-1.5">
          <span>🌾</span> Agricultura · {REGISTRO_TYPES.filter((t) => t.section === "agricultura").length} registros
        </p>
        <div className="grid grid-cols-3 gap-2">
          {REGISTRO_TYPES.filter((t) => t.section === "agricultura").map((t) => (
            <button key={t.id}
              onClick={() => setView({ name: "new-registro", regType: t.id })}
              className="bg-white/70 border border-stone-300/40 rounded-xl p-2.5 flex flex-col items-center gap-1 active:scale-95 transition shadow-sm relative">
              {t.legal && <span className="absolute top-1 right-1 text-[8px]" title="Obligatorio por ley">⚖</span>}
              <span className="text-2xl leading-none mt-0.5">{t.icon}</span>
              <span className="text-[10px] font-bold text-emerald-950 leading-tight text-center">{t.short}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-stone-600 mt-2 px-1 leading-snug">
          ⚖ obligatorio por normativa · puedo añadir registros agrícolas (siembra, cosecha, riego, fertilización) si los necesitas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4 border border-stone-300/40">
          <div className="flex items-center gap-2 text-amber-800 mb-1">
            <Clock size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Borradores</span>
          </div>
          <p style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-bold text-emerald-950">{pending}</p>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4 border border-stone-300/40">
          <div className="flex items-center gap-2 text-emerald-800 mb-1">
            <Check size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Enviados</span>
          </div>
          <p style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-bold text-emerald-950">{sent}</p>
        </div>
      </div>

      {(!settings.officeEmail && !settings.officeWhatsapp) && (
        <button onClick={() => setView({ name: "settings" })}
          className="w-full bg-amber-100 border border-amber-300 rounded-2xl p-4 mb-5 text-left flex items-center gap-3 active:scale-[0.99] transition">
          <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-950 text-sm">Configura los contactos</p>
            <p className="text-xs text-amber-900/80">Añade el email o WhatsApp de la oficina</p>
          </div>
          <ChevronRight size={18} className="text-amber-800" />
        </button>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl font-bold text-emerald-950">Recientes</h2>
          {docs.length > 3 && (
            <button onClick={() => setView({ name: "history" })}
              className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="bg-white/40 border border-dashed border-stone-400 rounded-2xl p-8 text-center">
            <Package size={32} className="mx-auto text-stone-400 mb-2" />
            <p className="text-sm text-stone-600">Aún no hay documentos.<br/>Crea uno nuevo arriba.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((d) => <DocCard key={d.id} doc={d} onClick={() => setView({ name: "detail", doc: d })} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionCard({ color, icon: Icon, title, subtitle, onClick }) {
  return (
    <button onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-left active:scale-[0.97] transition shadow-md relative overflow-hidden h-32`}>
      <div className="absolute -right-4 -bottom-4 opacity-15">
        <Icon size={88} className="text-amber-50" />
      </div>
      <div className="relative">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center mb-2">
          <Plus size={18} className="text-amber-50" />
        </div>
        <p style={{ fontFamily: "'Fraunces', serif" }} className="text-amber-50 text-xl font-bold leading-tight">{title}</p>
        <p className="text-amber-50/70 text-xs mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}

function DocCard({ doc, onClick }) {
  const isReg = doc.kind === "registro";
  const regCfg = isReg ? findRegType(doc.type) : null;
  const isAlbaran = doc.type === "albaran";
  const Icon = isReg ? null : (isAlbaran ? FileText : ShoppingCart);
  const status = doc.status === "enviado"
    ? { label: "Enviado", color: "bg-emerald-100 text-emerald-900" }
    : { label: "Borrador", color: "bg-amber-100 text-amber-900" };
  const photoCount = (doc.photos || []).length;
  const cats = [...new Set((doc.items || []).map((it) => it.category).filter(Boolean))];

  if (isReg && regCfg) {
    const summary = regCfg.fields.slice(0, 2)
      .map((f) => doc.fields?.[f.k]).filter(Boolean).join(" · ");
    return (
      <button onClick={onClick}
        className="w-full bg-white/70 border border-stone-300/40 rounded-xl p-3.5 flex items-center gap-3 active:bg-white/90 transition text-left">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl bg-gradient-to-br ${regCfg.color} text-amber-50 relative`}>
          {regCfg.icon}
          {photoCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
              {photoCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-950 text-sm truncate">
            {regCfg.short}{summary ? ` · ${summary}` : ""}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-xs text-stone-600">{formatDate(doc.createdAt)}</p>
            {regCfg.legal && <span className="text-[10px]" title="Obligatorio por ley">⚖</span>}
            {photoCount > 0 && <span className="text-xs text-stone-600 flex items-center gap-0.5"><Paperclip size={10} /> {photoCount}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
          <SyncBadge doc={doc} />
        </div>
      </button>
    );
  }


  return (
    <button onClick={onClick}
      className="w-full bg-white/70 border border-stone-300/40 rounded-xl p-3.5 flex items-center gap-3 active:bg-white/90 transition text-left">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
        isAlbaran ? "bg-emerald-950 text-amber-50" : "bg-amber-700 text-amber-50"
      }`}>
        <Icon size={18} />
        {photoCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
            {photoCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-emerald-950 text-sm truncate">
          {doc.counterparty || (isAlbaran ? "Albarán sin destinatario" : "Pedido sin proveedor")}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <p className="text-xs text-stone-600">{formatDate(doc.date)}</p>
          <span className="text-stone-400">•</span>
          <p className="text-xs text-stone-600">{doc.items?.length || 0} líneas</p>
          {(() => {
            const p = doc.payment;
            const invTotal = p ? parseNum(p.invoiceTotal) : null;
            return invTotal !== null ? (
              <>
                <span className="text-stone-400">•</span>
                <p className="text-xs font-bold text-emerald-900 font-mono">{fmtEuro(invTotal)}</p>
              </>
            ) : null;
          })()}
          {(() => {
            const p = doc.payment;
            if (!p?.status) return null;
            const s = findPayStatus(p.status);
            return s ? <span className="text-xs" title={s.label}>{s.emoji}</span> : null;
          })()}
          {cats.slice(0, 3).map((cid) => {
            const c = findCategory(cid);
            return c ? <span key={cid} className="text-xs">{c.emoji}</span> : null;
          })}
          {cats.length > 3 && <span className="text-[10px] text-stone-500">+{cats.length - 3}</span>}
          {photoCount > 0 && (
            <span className="text-xs text-stone-600 flex items-center gap-0.5">
              <Paperclip size={10} /> {photoCount}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
        <SyncBadge doc={doc} />
      </div>
    </button>
  );
}

function SyncBadge({ doc }) {
  if (!doc.syncStatus) return null;
  if (doc.syncStatus === "synced") {
    return <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1"><Cloud size={9} /> Sheet</span>;
  }
  if (doc.syncStatus === "syncing") {
    return <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1"><RefreshCw size={9} className="animate-spin" /> Sync</span>;
  }
  if (doc.syncStatus === "pending") {
    return <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 flex items-center gap-1"><Clock size={9} /> Cola</span>;
  }
  if (doc.syncStatus === "error") {
    return <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1"><CloudOff size={9} /> Error</span>;
  }
  return null;
}

// =============================================================
// PRODUCT PICKER
// =============================================================
function ProductPicker({ open, onClose, onPick, initialCategoryId }) {
  const [step, setStep] = useState("categories");
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    if (open) {
      if (initialCategoryId) { setStep("products"); setActiveId(initialCategoryId); }
      else { setStep("categories"); setActiveId(null); }
      setQuery(""); setCustomMode(false); setCustomText("");
    }
  }, [open, initialCategoryId]);

  const cat = activeId ? findCategory(activeId) : null;
  const isSearching = query.trim().length > 0;
  const searchResults = isSearching
    ? CATEGORIES.flatMap((c) =>
        c.items.filter((it) => it.toLowerCase().includes(query.toLowerCase()))
          .map((it) => ({ category: c.id, item: it, catLabel: c.label, emoji: c.emoji }))
      )
    : [];

  const goToCategory = (id) => { setActiveId(id); setStep("products"); setCustomMode(false); setQuery(""); };
  const goBack = () => { setActiveId(null); setStep("categories"); setCustomMode(false); setQuery(""); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-3"
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="bg-[#F5F0E1] rounded-3xl shadow-2xl flex flex-col w-full max-w-md overflow-hidden"
            style={{ maxHeight: "min(85vh, 720px)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-2 flex-shrink-0 border-b border-stone-300/40">
              {step === "products" && !isSearching ? (
                <button onClick={goBack}
                  className="w-9 h-9 rounded-full bg-white/70 border border-stone-300/40 text-emerald-950 flex items-center justify-center active:scale-95 transition flex-shrink-0">
                  <ArrowLeft size={18} />
                </button>
              ) : <div className="w-9 h-9 flex-shrink-0" />}

              <div className="flex-1 min-w-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-600">
                  {step === "products" && cat && !isSearching ? cat.emoji + " Categoría" : "Catálogo"}
                </p>
                <h3 style={{ fontFamily: "'Fraunces', serif" }}
                  className="text-lg font-bold text-emerald-950 leading-tight truncate">
                  {step === "products" && cat && !isSearching ? cat.label : "Elegir producto"}
                </h3>
              </div>

              <button onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/70 border border-stone-300/40 text-emerald-950 flex items-center justify-center active:scale-95 transition flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-3 flex-shrink-0">
              <div className="bg-white/70 border border-stone-300/40 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Search size={16} className="text-stone-500" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={step === "products" && cat ? `Buscar (todo el catálogo)...` : "Buscar producto..."}
                  className="flex-1 bg-transparent outline-none text-emerald-950 placeholder:text-stone-400 text-base" />
                {query && <button onClick={() => setQuery("")} className="p-1.5 -m-1.5"><X size={16} className="text-stone-500" /></button>}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4"
              style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>

              {/* SEARCH MODE: show cross-category results */}
              {isSearching && (
                searchResults.length > 0 ? (
                  <div className="space-y-1.5 mb-3 pt-1">
                    {searchResults.map((row, i) => (
                      <button key={`${row.category}-${i}`} onClick={() => onPick(row.category, row.item)}
                        className="w-full bg-white/70 border border-stone-300/40 rounded-xl p-3 flex items-center gap-3 active:bg-white transition text-left">
                        <span className="text-xl flex-shrink-0">{row.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-emerald-950 text-[15px] leading-snug">{row.item}</p>
                          <p className="text-[11px] text-stone-600 mt-0.5">{row.catLabel}</p>
                        </div>
                        <ChevronRight size={16} className="text-stone-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Search size={28} className="mx-auto text-stone-400 mb-2" />
                    <p className="text-sm text-stone-600">No hay coincidencias.</p>
                    <p className="text-xs text-stone-500 mt-1">Pulsa abajo para escribirlo manualmente.</p>
                  </div>
                )
              )}

              {/* STEP 1: CATEGORIES grid */}
              {!isSearching && step === "categories" && (
                <div className="grid grid-cols-2 gap-2.5 pt-1 pb-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => goToCategory(c.id)}
                      className="bg-white/80 border border-stone-300/40 rounded-2xl p-3 flex flex-col items-start gap-2 active:scale-[0.97] transition text-left min-h-[112px] shadow-sm">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${c.accent}`}>
                        {c.emoji}
                      </div>
                      <p className="font-bold text-emerald-950 text-[13px] leading-tight">{c.label}</p>
                      {c.items.length > 0 ? (
                        <p className="text-[10px] text-stone-600 mt-auto">{c.items.length} productos</p>
                      ) : (
                        <p className="text-[10px] text-stone-600 mt-auto">Personalizado</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: PRODUCTS in selected category */}
              {!isSearching && step === "products" && cat && (
                <>
                  {cat.id === "otros" && (
                    <div className="bg-amber-50 border border-amber-300/50 rounded-xl p-3 mb-3 mt-1">
                      <p className="text-xs text-amber-950 leading-relaxed">
                        Si no encuentras el producto en ninguna categoría, escríbelo abajo.
                      </p>
                    </div>
                  )}

                  <button onClick={() => onPick(cat.id, "")}
                    className="w-full bg-emerald-700 text-amber-50 rounded-xl p-3 mb-3 mt-1 flex items-center gap-2 font-bold text-sm active:scale-[0.98] transition shadow-sm">
                    <Check size={16} className="flex-shrink-0" />
                    <span className="text-left leading-tight">Sólo la categoría — escribiré yo la descripción</span>
                  </button>

                  {cat.items.length > 0 && (
                    <>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-1.5 px-1">
                        O elige una sugerencia:
                      </p>
                      <div className="space-y-1.5 mb-3">
                        {cat.items.map((item, i) => (
                          <button key={i} onClick={() => onPick(cat.id, item)}
                            className="w-full bg-white/70 border border-stone-300/40 rounded-xl p-3 flex items-center gap-3 active:bg-white transition text-left">
                            <span className="text-xl flex-shrink-0">{cat.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-emerald-950 text-[15px] leading-snug">{item}</p>
                            </div>
                            <ChevronRight size={16} className="text-stone-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {!customMode ? (
                    <button onClick={() => setCustomMode(true)}
                      className="w-full bg-emerald-950 text-amber-50 rounded-xl p-3.5 flex items-center justify-center gap-2 font-bold text-sm active:scale-[0.98] transition shadow-sm mt-1 mb-2">
                      <Edit3 size={15} /> Escribir producto manualmente
                    </button>
                  ) : (
                    <div className="bg-white/80 border border-stone-300/40 rounded-xl p-3 mt-1 mb-2">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-2">Producto personalizado</p>
                      <input type="text" value={customText} autoFocus
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Ej: Recambio específico ref. 4521"
                        className="w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 font-medium placeholder:text-stone-400 text-base focus:ring-2 ring-emerald-700 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={() => setCustomMode(false)}
                          className="flex-1 py-2 rounded-lg bg-stone-200 text-stone-800 font-semibold text-sm">Cancelar</button>
                        <button onClick={() => { if (customText.trim()) onPick(activeId, customText.trim()); }}
                          disabled={!customText.trim()}
                          className="flex-1 py-2 rounded-lg bg-emerald-950 text-amber-50 font-bold text-sm disabled:opacity-50">
                          Añadir
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* When searching with no results, allow custom entry under "otros" */}
              {isSearching && searchResults.length === 0 && (
                !customMode ? (
                  <button onClick={() => { setCustomText(query); setCustomMode(true); }}
                    className="w-full bg-emerald-950 text-amber-50 rounded-xl p-3.5 flex items-center justify-center gap-2 font-bold text-sm active:scale-[0.98] transition shadow-sm mt-2 mb-2">
                    <Edit3 size={15} /> Añadir "{query}" como personalizado
                  </button>
                ) : (
                  <div className="bg-white/80 border border-stone-300/40 rounded-xl p-3 mt-2 mb-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-2">Producto personalizado</p>
                    <input type="text" value={customText} autoFocus
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 font-medium text-base focus:ring-2 ring-emerald-700 mb-2" />
                    <div className="flex gap-2">
                      <button onClick={() => setCustomMode(false)}
                        className="flex-1 py-2 rounded-lg bg-stone-200 text-stone-800 font-semibold text-sm">Cancelar</button>
                      <button onClick={() => { if (customText.trim()) onPick("otros", customText.trim()); }}
                        disabled={!customText.trim()}
                        className="flex-1 py-2 rounded-lg bg-emerald-950 text-amber-50 font-bold text-sm disabled:opacity-50">
                        Añadir
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================
// REGISTRO FORM (generic — fields driven by REGISTRO_TYPES)
// =============================================================
function RegField({ field, value, onChange }) {
  const cls = "w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 font-medium placeholder:text-stone-400 text-base focus:ring-2 ring-emerald-700";
  switch (field.type) {
    case "textarea":
      return <textarea value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""} rows={field.rows || 3}
        className={cls + " resize-none"} />;
    case "number":
      return <input type="number" inputMode="decimal" step={field.step || "1"}
        value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "0"} className={cls + " font-bold"} />;
    case "date":
      return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls} />;
    case "time":
      return <input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls} />;
    case "select":
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="">— Selecciona —</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "text":
    default:
      return <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ""} className={cls} />;
  }
}

function RegistroForm({ regType, setView, saveDoc, settings, showToast, initial }) {
  const cfg = findRegType(regType);
  const blank = () => {
    const fields = {};
    cfg.fields.forEach((f) => { fields[f.k] = f.default === "today" ? todayISO() : ""; });
    return {
      id: newId(), type: regType, kind: "registro",
      fields, notes: "", photos: [],
      status: "borrador",
      worker: settings.workerName || "", farm: settings.farmName || COMPANY.fullName,
      createdAt: new Date().toISOString(), sentAt: null
    };
  };
  const [doc, setDoc] = useState(initial || blank());
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState(null);
  const photoInputRef = useRef(null);

  const updateField = (k, v) => setDoc((d) => ({ ...d, fields: { ...(d.fields || {}), [k]: v } }));

  const handlePhotoFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const photos = doc.photos || [];
    if (photos.length + fileList.length > 5) {
      showToast("Máximo 5 fotos por registro", "err");
      return;
    }
    setProcessingPhoto(true);
    try {
      const newPhotos = [];
      for (const file of fileList) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await compressImage(file);
        newPhotos.push({ id: newId(), dataUrl, name: file.name || `foto-${Date.now()}.jpg`, addedAt: new Date().toISOString() });
      }
      setDoc((d) => ({ ...d, photos: [...(d.photos || []), ...newPhotos] }));
      showToast(`${newPhotos.length} foto${newPhotos.length > 1 ? "s" : ""} añadida${newPhotos.length > 1 ? "s" : ""}`);
    } catch { showToast("Error al procesar la foto", "err"); }
    finally { setProcessingPhoto(false); }
  };
  const removePhoto = (id) => setDoc((d) => ({ ...d, photos: (d.photos || []).filter((p) => p.id !== id) }));

  const handleSave = async () => {
    const missing = cfg.fields.filter((f) => f.required && !(doc.fields?.[f.k] && String(doc.fields[f.k]).trim()));
    if (missing.length > 0) {
      showToast(`Falta: ${missing[0].label}`, "err");
      return;
    }
    await saveDoc(doc);
    showToast("Borrador guardado");
    setView({ name: "detail", doc });
  };

  const computedValues = cfg.computed ? cfg.computed(doc.fields || {}) : {};

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <FormHeader title={`Nuevo · ${cfg.short}`} onBack={() => setView({ name: "home" })} />

      <div className={`bg-gradient-to-br ${cfg.color} rounded-2xl p-4 mb-4 text-amber-50 shadow-md`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-50/70">{cfg.legal ? "⚖ Registro legal" : "Registro operativo"}</p>
            <h3 style={{ fontFamily: "'Fraunces', serif" }} className="font-bold text-lg leading-tight">{cfg.label}</h3>
            <p className="text-[11px] text-amber-50/70 mt-0.5 leading-tight">{cfg.legalRef}</p>
          </div>
        </div>
      </div>

      {cfg.fields.map((field) => (
        <Field key={field.k} label={field.label + (field.required ? " *" : "")}>
          <RegField field={field} value={doc.fields?.[field.k]} onChange={(v) => updateField(field.k, v)} />
        </Field>
      ))}

      {Object.keys(computedValues).length > 0 && (
        <div className="bg-emerald-950 text-amber-50 rounded-xl p-3.5 mb-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-50/60 mb-2">Calculado automáticamente</p>
          {Object.entries(computedValues).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center text-sm mb-1 last:mb-0">
              <span className="text-amber-50/80">{cfg.computedLabels?.[k] || k}</span>
              <span className="font-mono font-bold">
                {(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? formatDate(v) : v}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-2">
          <Paperclip size={11} /> Fotos ({(doc.photos || []).length}/5)
        </p>
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { handlePhotoFiles(e.target.files); e.target.value = ""; }} />
        {(doc.photos || []).length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {doc.photos.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-stone-300/40 bg-white/40">
                <img src={p.dataUrl} alt="Adjunto" className="w-full h-full object-cover cursor-pointer" onClick={() => setZoomPhoto(p)} />
                <button onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-90 transition">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {(doc.photos || []).length < 5 && (
          <button type="button" onClick={() => photoInputRef.current?.click()} disabled={processingPhoto}
            className="w-full bg-emerald-950 text-amber-50 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm disabled:opacity-60">
            <Camera size={16} /><ImageIcon size={16} /> Añadir foto · Cámara o galería
          </button>
        )}
        {processingPhoto && <p className="text-xs text-stone-600 text-center mt-2">Procesando foto...</p>}
      </div>

      <Field label="Notas adicionales">
        <textarea value={doc.notes || ""} onChange={(e) => setDoc((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Observaciones libres..." rows={3}
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400 resize-none" />
      </Field>

      <button onClick={handleSave}
        className={`w-full bg-gradient-to-br ${cfg.color} text-amber-50 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md`}>
        <Save size={18} /> Guardar registro
      </button>
      <p className="text-xs text-stone-600 text-center mt-2 mb-6">
        Después podrás revisar y enviarlo a oficina
      </p>

      <AnimatePresence>
        {zoomPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomPhoto(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"
              onClick={() => setZoomPhoto(null)}>
              <X size={22} />
            </button>
            <img src={zoomPhoto.dataUrl} alt="Foto" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================
// DOC FORM
// =============================================================
function DocForm({ type, setView, saveDoc, settings, showToast, initial }) {
  const isAlbaran = type === "albaran";
  const [doc, setDoc] = useState(initial || {
    id: newId(), type, date: todayISO(), direction: "salida",
    counterparty: "",
    items: [{ id: newId(), desc: "", qty: "", unit: isAlbaran ? "kg" : "uds", urgency: "media", category: null }],
    notes: "", justification: "", photos: [],
    payment: { status: "pendiente", method: "", paidAt: "", invoiceTotal: "", invoiceNumber: "", invoiceDate: "" },
    status: "borrador",
    worker: settings.workerName || "", farm: settings.farmName || COMPANY.fullName,
    createdAt: new Date().toISOString(), sentAt: null
  });
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState(null);
  const [pickerFor, setPickerFor] = useState(null);
  const photoInputRef = useRef(null);

  const update = (k, v) => setDoc((d) => ({ ...d, [k]: v }));
  const updatePayment = (patch) => setDoc((d) => ({
    ...d,
    payment: { ...(d.payment || { status: "pendiente", method: "", paidAt: "", invoiceTotal: "", invoiceNumber: "", invoiceDate: "" }), ...patch }
  }));
  const updateItem = (id, patch) => setDoc((d) => ({
    ...d, items: d.items.map((it) => it.id === id ? { ...it, ...patch } : it)
  }));
  const removeItem = (id) => setDoc((d) => ({
    ...d, items: d.items.length > 1 ? d.items.filter((it) => it.id !== id) : d.items
  }));

  const addAndPickItem = () => {
    const newItem = { id: newId(), desc: "", qty: "", unit: isAlbaran ? "kg" : "uds", urgency: "media", category: null };
    setDoc((d) => ({ ...d, items: [...d.items, newItem] }));
    setPickerFor(newItem.id);
  };

  const handlePhotoFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const photos = doc.photos || [];
    if (photos.length + fileList.length > 5) {
      showToast("Máximo 5 fotos por documento", "err");
      return;
    }
    setProcessingPhoto(true);
    try {
      const newPhotos = [];
      for (const file of fileList) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await compressImage(file);
        newPhotos.push({ id: newId(), dataUrl, name: file.name || `foto-${Date.now()}.jpg`, addedAt: new Date().toISOString() });
      }
      setDoc((d) => ({ ...d, photos: [...(d.photos || []), ...newPhotos] }));
      showToast(`${newPhotos.length} foto${newPhotos.length > 1 ? "s" : ""} añadida${newPhotos.length > 1 ? "s" : ""}`);
    } catch { showToast("Error al procesar la foto", "err"); }
    finally { setProcessingPhoto(false); }
  };

  const removePhoto = (id) => setDoc((d) => ({ ...d, photos: (d.photos || []).filter((p) => p.id !== id) }));

  const handleSave = async () => {
    if (!doc.counterparty.trim()) {
      showToast("Falta el " + (isAlbaran ? "destinatario" : "proveedor"), "err");
      return;
    }
    const validItems = doc.items.filter((it) => it.desc.trim() && it.qty);
    if (validItems.length === 0) {
      showToast("Añade al menos una línea válida", "err");
      return;
    }
    const final = { ...doc, items: validItems };
    await saveDoc(final);
    showToast("Borrador guardado");
    setView({ name: "detail", doc: final });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <FormHeader title={isAlbaran ? "Nuevo albarán" : "Nuevo pedido"} onBack={() => setView({ name: "home" })} />

      {isAlbaran && (
        <div className="bg-white/60 rounded-xl p-1 grid grid-cols-2 mb-4 border border-stone-300/40">
          {[{ v: "salida", label: "Salida", icon: Truck }, { v: "entrada", label: "Entrada", icon: Package }].map((opt) => (
            <button key={opt.v} onClick={() => update("direction", opt.v)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                doc.direction === opt.v ? "bg-emerald-950 text-amber-50" : "text-stone-700"
              }`}>
              <opt.icon size={15} />{opt.label}
            </button>
          ))}
        </div>
      )}

      <Field label="Fecha" icon={Calendar}>
        <input type="date" value={doc.date} onChange={(e) => update("date", e.target.value)}
          className="w-full bg-transparent outline-none text-emerald-950 font-medium" />
      </Field>

      <Field label={isAlbaran ? (doc.direction === "salida" ? "Cliente / Destinatario" : "Proveedor / Origen") : "Proveedor"}>
        <input type="text" value={doc.counterparty} onChange={(e) => update("counterparty", e.target.value)}
          placeholder={isAlbaran ? "Ej: Dehesa El Campillo" : "Ej: Pienso Hermanos S.L."}
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Líneas ({doc.items.length})
          </p>
        </div>
        <div className="space-y-2">
          {doc.items.map((it, idx) => (
            <ItemRow key={it.id} item={it} index={idx} isAlbaran={isAlbaran}
              onUpdate={(patch) => updateItem(it.id, patch)}
              onRemove={() => removeItem(it.id)}
              canRemove={doc.items.length > 1}
              onOpenPicker={() => setPickerFor(it.id)} />
          ))}
        </div>
        <button onClick={addAndPickItem}
          className="w-full mt-2 bg-emerald-950 text-amber-50 rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm">
          <BookOpen size={15} /> Añadir desde catálogo
        </button>
      </div>

      {!isAlbaran && (
        <Field label="Justificación">
          <textarea value={doc.justification} onChange={(e) => update("justification", e.target.value)}
            placeholder="¿Por qué se necesita este pedido?"
            rows={2}
            className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400 resize-none" />
        </Field>
      )}

      {/* Photos */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Paperclip size={11} /> Fotos del albarán/factura ({(doc.photos || []).length}/5)
          </p>
        </div>

        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { handlePhotoFiles(e.target.files); e.target.value = ""; }} />

        {(doc.photos || []).length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {doc.photos.map((p) => (
              <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden border border-stone-300/40 bg-white/40">
                <img src={p.dataUrl} alt="Adjunto" className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setZoomPhoto(p)} />
                <button onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-90 transition">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {(doc.photos || []).length < 5 && (
          <button type="button" onClick={() => photoInputRef.current?.click()} disabled={processingPhoto}
            className="w-full bg-emerald-950 text-amber-50 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm disabled:opacity-60">
            <Camera size={16} />
            <ImageIcon size={16} />
            Añadir foto · Cámara o galería
          </button>
        )}
        {(doc.photos || []).length < 5 && (
          <p className="text-[11px] text-stone-600 text-center mt-1.5 leading-snug">
            Tu móvil te dejará elegir entre <strong>hacer una foto</strong> o <strong>seleccionar de la galería</strong>
          </p>
        )}
        {processingPhoto && <p className="text-xs text-stone-600 text-center mt-2">Procesando foto...</p>}
      </div>

      <Field label="Notas">
        <textarea value={doc.notes} onChange={(e) => update("notes", e.target.value)}
          placeholder="Observaciones, referencias, matrículas..." rows={3}
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400 resize-none" />
      </Field>

      {/* PAGO / FACTURACIÓN */}
      {(() => {
        const p = doc.payment || { status: "pendiente" };
        return (
          <div className="bg-white/60 border border-stone-300/40 rounded-xl p-3 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-2">
              💶 Pago / Facturación
            </p>

            <div className="grid grid-cols-3 gap-1.5 mb-1">
              {PAYMENT_STATUS.map((s) => (
                <button key={s.v} onClick={() => updatePayment({ status: s.v })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-0.5 transition active:scale-95 ${
                    p.status === s.v
                      ? "bg-emerald-950 text-amber-50 shadow-sm"
                      : "bg-stone-100 text-stone-700"
                  }`}>
                  <span className="text-lg leading-none">{s.emoji}</span>
                  <span className="text-[10px] font-bold leading-tight text-center">{s.label}</span>
                </button>
              ))}
            </div>

            {p.status === "pagado" && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">Forma de pago</p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.v} onClick={() => updatePayment({ method: m.v })}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition active:scale-95 ${
                        p.method === m.v
                          ? "bg-emerald-700 text-amber-50"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">Fecha del pago</p>
                <input type="date" value={p.paidAt || ""}
                  onChange={(e) => updatePayment({ paidAt: e.target.value })}
                  className="w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 font-medium text-base focus:ring-2 ring-emerald-700" />
              </div>
            )}

            {p.status === "factura" && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">Datos de la factura</p>
                <div className="bg-stone-100 rounded-lg px-3 py-2 mb-2 flex items-center gap-2 focus-within:ring-2 ring-emerald-700">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Total factura</span>
                  <input type="number" inputMode="decimal" step="0.01"
                    value={p.invoiceTotal || ""}
                    onChange={(e) => updatePayment({ invoiceTotal: e.target.value })}
                    placeholder="0,00"
                    className="flex-1 bg-transparent outline-none text-emerald-950 font-bold text-base text-right" />
                  <span className="text-stone-500 font-bold">€</span>
                </div>
                <input type="text" value={p.invoiceNumber || ""}
                  onChange={(e) => updatePayment({ invoiceNumber: e.target.value })}
                  placeholder="Nº de factura (opcional)"
                  className="w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 text-base focus:ring-2 ring-emerald-700 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">Fecha factura</p>
                <input type="date" value={p.invoiceDate || ""}
                  onChange={(e) => updatePayment({ invoiceDate: e.target.value })}
                  className="w-full bg-stone-100 rounded-lg px-3 py-2 outline-none text-emerald-950 font-medium text-base focus:ring-2 ring-emerald-700" />
              </div>
            )}
          </div>
        );
      })()}

      <button onClick={handleSave}
        className="w-full bg-emerald-950 text-amber-50 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md">
        <Save size={18} /> Guardar borrador
      </button>
      <p className="text-xs text-stone-600 text-center mt-2 mb-6">
        Después podrás revisar y enviarlo a la oficina
      </p>

      <ProductPicker
        open={!!pickerFor}
        onClose={() => {
          if (pickerFor) {
            setDoc((d) => {
              const target = d.items.find((it) => it.id === pickerFor);
              if (target && !target.desc && d.items.length > 1) {
                return { ...d, items: d.items.filter((it) => it.id !== pickerFor) };
              }
              return d;
            });
          }
          setPickerFor(null);
        }}
        initialCategoryId={pickerFor ? doc.items.find((it) => it.id === pickerFor)?.category : null}
        onPick={(catId, item) => {
          const updates = { category: catId };
          if (item) updates.desc = item;
          updateItem(pickerFor, updates);
          setPickerFor(null);
        }}
      />

      <AnimatePresence>
        {zoomPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomPhoto(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"
              onClick={() => setZoomPhoto(null)}>
              <X size={22} />
            </button>
            <img src={zoomPhoto.dataUrl} alt="Foto" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FormHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack}
        className="w-10 h-10 rounded-full bg-white/60 border border-stone-300/40 flex items-center justify-center active:scale-95 transition">
        <ArrowLeft size={18} className="text-emerald-950" />
      </button>
      <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-bold text-emerald-950">{title}</h2>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="bg-white/60 border border-stone-300/40 rounded-xl px-4 py-3 mb-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={11} className="text-stone-600" />}
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">{label}</p>
      </div>
      {children}
    </div>
  );
}

function ItemRow({ item, index, isAlbaran, onUpdate, onRemove, canRemove, onOpenPicker }) {
  const cat = item.category ? findCategory(item.category) : null;

  return (
    <div className="bg-white/70 border border-stone-300/40 rounded-xl p-3">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-950 text-amber-50 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {cat ? (
            <button onClick={onOpenPicker}
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${cat.accent} active:scale-95 transition`}>
              <span>{cat.emoji}</span>{cat.label}
              <Edit3 size={9} className="ml-0.5 opacity-60"/>
            </button>
          ) : (
            <button onClick={onOpenPicker}
              className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs py-0.5 active:scale-95 transition">
              <BookOpen size={12} /> Elegir categoría
            </button>
          )}
          <input type="text" value={item.desc || ""}
            onChange={(e) => onUpdate({ desc: e.target.value })}
            placeholder="Descripción del producto..."
            className="w-full bg-stone-100 rounded-lg px-2.5 py-2 outline-none text-emerald-950 font-semibold text-base mt-2 focus:ring-2 ring-emerald-700 placeholder:text-stone-400 placeholder:font-normal" />
        </div>
        {canRemove && (
          <button onClick={onRemove}
            className="text-rose-700 active:scale-90 transition flex-shrink-0 -mt-1 -mr-1 p-2 rounded-lg">
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div className="flex items-center flex-wrap gap-2 mt-2 ml-8">
        <input type="number" inputMode="decimal" value={item.qty}
          onChange={(e) => onUpdate({ qty: e.target.value })} placeholder="0"
          className="w-20 bg-stone-100 rounded-lg px-2 py-1.5 outline-none text-emerald-950 font-bold text-base focus:ring-2 ring-emerald-700" />
        <select value={item.unit} onChange={(e) => onUpdate({ unit: e.target.value })}
          className="bg-stone-100 rounded-lg px-2 py-1.5 outline-none text-emerald-950 font-medium text-base focus:ring-2 ring-emerald-700">
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        {!isAlbaran && (
          <select value={item.urgency} onChange={(e) => onUpdate({ urgency: e.target.value })}
            className="bg-stone-100 rounded-lg px-2 py-1.5 outline-none text-emerald-950 font-medium text-base focus:ring-2 ring-emerald-700 ml-auto">
            {URGENCIAS.map((u) => <option key={u.v} value={u.v}>{u.label}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

// =============================================================
// DETAIL VIEW
// =============================================================
function DetailView({ doc, setView, settings, saveDoc, deleteDoc, showToast }) {
  const isReg = doc.kind === "registro";
  const regCfg = isReg ? findRegType(doc.type) : null;
  const isAlbaran = doc.type === "albaran";
  const [confirmDel, setConfirmDel] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState(null);
  const [sharing, setSharing] = useState(false);

  const photos = doc.photos || [];
  const hasPhotos = photos.length > 0;

  const buildText = () => {
    if (isReg && regCfg) {
      let txt = `${COMPANY.fullName}\n`;
      txt += `${regCfg.label.toUpperCase()} ${regCfg.icon}\n`;
      if (regCfg.legalRef) txt += `(${regCfg.legalRef})\n`;
      txt += `\n`;
      regCfg.fields.forEach((f) => {
        const v = doc.fields?.[f.k];
        if (v !== undefined && v !== null && v !== "") {
          const display = (f.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? formatDate(v) : v;
          txt += `${f.label}: ${display}\n`;
        }
      });
      const cv = regCfg.computed ? regCfg.computed(doc.fields || {}) : {};
      Object.entries(cv).forEach(([k, v]) => {
        if (v === "" || v === 0 || v === null || v === undefined) return;
        const lbl = regCfg.computedLabels?.[k] || k;
        const display = (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? formatDate(v) : v;
        txt += `→ ${lbl}: ${display}\n`;
      });
      if (doc.notes) txt += `\nNotas: ${doc.notes}\n`;
      if (doc.worker) txt += `\nOperario: ${doc.worker}\n`;
      return txt;
    }
    let txt = `${COMPANY.fullName}\n`;
    txt += `${isAlbaran ? "ALBARÁN" : "ORDEN DE COMPRA"}\n`;
    txt += `Fecha: ${formatDate(doc.date)}\n`;
    if (isAlbaran) txt += `Tipo: ${doc.direction === "salida" ? "Salida" : "Entrada"}\n`;
    txt += `${isAlbaran ? (doc.direction === "salida" ? "Destinatario" : "Origen") : "Proveedor"}: ${doc.counterparty}\n`;
    if (doc.worker) txt += `Operario: ${doc.worker}\n`;

    const byCat = {};
    doc.items.forEach((it) => {
      const c = it.category || "sin-categoria";
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(it);
    });

    txt += `\n--- LÍNEAS ---\n`;
    Object.entries(byCat).forEach(([catId, items]) => {
      const cat = findCategory(catId);
      if (cat) txt += `\n${cat.emoji} ${cat.label.toUpperCase()}\n`;
      items.forEach((it, i) => {
        txt += `  ${i + 1}. ${it.desc} — ${it.qty} ${it.unit}`;
        if (!isAlbaran && it.urgency) {
          const u = URGENCIAS.find((x) => x.v === it.urgency);
          txt += ` [${u?.label || it.urgency}]`;
        }
        txt += `\n`;
      });
    });

    const p = doc.payment;
    if (p && p.status) {
      const status = findPayStatus(p.status);
      if (status) {
        txt += `\n--- PAGO ---\n`;
        txt += `Estado: ${status.emoji} ${status.label}\n`;
        if (p.status === "pagado") {
          if (p.method) {
            const m = findPayMethod(p.method);
            txt += `Forma de pago: ${m?.label || p.method}\n`;
          }
          if (p.paidAt) txt += `Fecha pago: ${formatDate(p.paidAt)}\n`;
        }
        if (p.status === "factura") {
          const inv = parseNum(p.invoiceTotal);
          if (inv !== null) txt += `TOTAL FACTURA: ${fmtEuro(inv)}\n`;
          if (p.invoiceNumber) txt += `Nº factura: ${p.invoiceNumber}\n`;
          if (p.invoiceDate) txt += `Fecha factura: ${formatDate(p.invoiceDate)}\n`;
        }
      }
    }

    if (doc.justification) txt += `\nJustificación: ${doc.justification}\n`;
    if (doc.notes) txt += `\nNotas: ${doc.notes}\n`;
    if (hasPhotos) txt += `\n📎 Adjunta${photos.length > 1 ? "s" : ""}: ${photos.length} foto${photos.length > 1 ? "s" : ""}\n`;
    return txt;
  };

  const buildPhotoFiles = async () => {
    const files = [];
    for (let i = 0; i < photos.length; i++) {
      const fname = `${isAlbaran ? "albaran" : "pedido"}-${doc.date}-${i + 1}.jpg`;
      files.push(await dataUrlToFile(photos[i].dataUrl, fname));
    }
    return files;
  };

  const markSent = async () => {
    const updated = { ...doc, status: "enviado", sentAt: new Date().toISOString() };
    await saveDoc(updated);
    setView({ name: "detail", doc: updated });
    showToast("Marcado como enviado");
  };

  const sendNative = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const files = hasPhotos ? await buildPhotoFiles() : [];
      const shareData = {
        title: `${isAlbaran ? "Albarán" : "Pedido"} - ${doc.counterparty}`,
        text: buildText(), ...(files.length > 0 ? { files } : {})
      };
      if (navigator.canShare && (files.length === 0 || navigator.canShare({ files }))) {
        await navigator.share(shareData);
        setTimeout(markSent, 400);
      } else {
        showToast("Compartir no disponible en este dispositivo", "err");
      }
    } catch (e) {
      if (e.name !== "AbortError") showToast("Error al compartir", "err");
    } finally { setSharing(false); }
  };

  const sendEmail = () => {
    if (!settings.officeEmail) {
      showToast("Configura el email primero", "err");
      setView({ name: "settings" }); return;
    }
    const subject = `${isAlbaran ? "Albarán" : "Pedido"} ${COMPANY.short} - ${doc.counterparty} - ${formatDate(doc.date)}`;
    const body = buildText() + (hasPhotos ? "\n\n[Adjuntar fotos manualmente — usa el botón Compartir para enviarlas]" : "");
    window.location.href = `mailto:${settings.officeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (!hasPhotos) setTimeout(markSent, 600);
  };

  const sendWhatsApp = () => {
    if (!settings.officeWhatsapp) {
      showToast("Configura el WhatsApp primero", "err");
      setView({ name: "settings" }); return;
    }
    const num = settings.officeWhatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const body = buildText() + (hasPhotos ? "\n\n[Recuerda adjuntar las fotos en el siguiente mensaje]" : "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(body)}`, "_blank");
    if (!hasPhotos) setTimeout(markSent, 600);
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(buildText()); showToast("Copiado al portapapeles"); }
    catch { showToast("No se pudo copiar", "err"); }
  };

  const downloadPhoto = (photo, idx) => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `${isAlbaran ? "albaran" : "pedido"}-${doc.date}-${idx + 1}.jpg`;
    a.click();
  };

  const itemsByCat = {};
  doc.items.forEach((it) => {
    const c = it.category || "sin-categoria";
    if (!itemsByCat[c]) itemsByCat[c] = [];
    itemsByCat[c].push(it);
  });

  if (isReg && regCfg) {
    const cv = regCfg.computed ? regCfg.computed(doc.fields || {}) : {};
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <FormHeader title="Detalle" onBack={() => setView({ name: "home" })} />

        <div className={`bg-gradient-to-br ${regCfg.color} text-amber-50 rounded-2xl p-4 mb-4 shadow-md`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{regCfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-50/70">{regCfg.legal ? "⚖ Registro legal" : "Registro operativo"}</p>
              <h3 style={{ fontFamily: "'Fraunces', serif" }} className="font-bold text-xl leading-tight">{regCfg.label}</h3>
              <p className="text-[11px] text-amber-50/70 mt-0.5">{regCfg.legalRef}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full self-start ${
              doc.status === "enviado" ? "bg-amber-50 text-emerald-950" : "bg-amber-50/30 text-amber-50"
            }`}>{doc.status === "enviado" ? "Enviado" : "Borrador"}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-stone-300/40 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-emerald-950 text-amber-50 flex items-center justify-center">
              <span style={{ fontFamily: "'Fraunces', serif" }} className="text-sm font-bold">M</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-700 leading-tight">{COMPANY.fullName}</p>
          </div>
          <div className="space-y-2">
            {regCfg.fields.map((f) => {
              const v = doc.fields?.[f.k];
              if (v === undefined || v === null || v === "") return null;
              const display = (f.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? formatDate(v) : v;
              return (
                <div key={f.k} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stone-600">{f.label}</span>
                  <span className="text-sm font-semibold text-emerald-950 break-words">{display}</span>
                </div>
              );
            })}
          </div>
          {Object.keys(cv).length > 0 && (
            <div className="mt-3 pt-3 border-t border-dashed border-stone-400/50 space-y-1.5">
              {Object.entries(cv).map(([k, v]) => (v === "" || v === 0 || v === null || v === undefined) ? null : (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-700">{regCfg.computedLabels?.[k] || k}</span>
                  <span className="text-sm font-bold font-mono text-emerald-950">
                    {(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? formatDate(v) : v}
                  </span>
                </div>
              ))}
            </div>
          )}
          {doc.notes && (
            <>
              <div className="border-t border-dashed border-stone-400/50 my-3" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-1">Notas</p>
              <p className="text-sm text-emerald-950">{doc.notes}</p>
            </>
          )}
          {hasPhotos && (
            <>
              <div className="border-t border-dashed border-stone-400/50 my-3" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-2 flex items-center gap-1.5">
                <Paperclip size={11} /> Fotos adjuntas ({photos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setZoomPhoto({ ...p, idx: i })}
                    className="relative aspect-square rounded-lg overflow-hidden border border-stone-300/40 active:scale-95 transition">
                    <img src={p.dataUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="border-t border-dashed border-stone-400/50 my-3" />
          <div className="flex items-center justify-between text-[11px] text-stone-600">
            <span>Operario: {doc.worker || "—"}</span>
            <span>Creado {formatTime(doc.createdAt)}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-700 px-1 mb-1">Enviar a oficina</p>
          {hasPhotos && (
            <SendBtn icon={Share2}
              label={sharing ? "Abriendo..." : `Compartir con ${photos.length} foto${photos.length > 1 ? "s" : ""}`}
              onClick={sendNative} color="bg-emerald-700 text-amber-50" full />
          )}
          <div className="grid grid-cols-2 gap-2">
            <SendBtn icon={MessageCircle} label="WhatsApp" onClick={sendWhatsApp} color="bg-emerald-700 text-amber-50" />
            <SendBtn icon={Mail} label="Email" onClick={sendEmail} color="bg-emerald-950 text-amber-50" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SendBtn icon={Copy} label="Copiar texto" onClick={copyText} color="bg-white/70 text-emerald-950 border border-stone-300/40" />
            <SendBtn icon={Edit3} label="Editar"
              onClick={() => setView({ name: "new-registro", regType: doc.type, initial: doc })}
              color="bg-white/70 text-emerald-950 border border-stone-300/40" />
          </div>
          {doc.status === "borrador" && (
            <SendBtn icon={Check} label="Marcar como enviado" onClick={markSent}
              color="bg-amber-100 text-amber-950 border border-amber-300" full />
          )}
        </div>

        {!confirmDel ? (
          <button onClick={() => setConfirmDel(true)}
            className="w-full text-rose-700 text-sm font-semibold py-2 active:scale-[0.98] transition flex items-center justify-center gap-1.5">
            <Trash2 size={14} /> Eliminar registro
          </button>
        ) : (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center gap-2">
            <p className="text-sm text-rose-900 flex-1">¿Seguro?</p>
            <button onClick={() => setConfirmDel(false)} className="px-3 py-1.5 text-sm font-semibold text-stone-700">Cancelar</button>
            <button onClick={async () => { await deleteDoc(doc.id); setView({ name: "home" }); }}
              className="px-3 py-1.5 text-sm font-bold bg-rose-700 text-white rounded-lg">Eliminar</button>
          </div>
        )}

        <AnimatePresence>
          {zoomPhoto && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setZoomPhoto(null)}>
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center z-10"
                onClick={(e) => { e.stopPropagation(); setZoomPhoto(null); }}>
                <X size={22} />
              </button>
              <img src={zoomPhoto.dataUrl} alt="Foto" onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-full object-contain rounded-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <FormHeader title="Detalle" onBack={() => setView({ name: "home" })} />

      <div className="bg-amber-50 border border-stone-300/40 rounded-2xl p-5 mb-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-950/5 rounded-full -translate-y-8 translate-x-8" />

        <div className="flex items-center gap-2 mb-2 relative">
          <div className="w-7 h-7 rounded-md bg-emerald-950 text-amber-50 flex items-center justify-center">
            <span style={{ fontFamily: "'Fraunces', serif" }} className="text-sm font-bold">M</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-700 leading-tight">
            {COMPANY.fullName}
          </p>
        </div>

        <div className="flex items-start justify-between mb-3 relative">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-600">
              {isAlbaran ? (doc.direction === "salida" ? "Albarán de salida" : "Albarán de entrada") : "Orden de compra"}
            </p>
            <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-bold text-emerald-950 leading-tight mt-1">
              {doc.counterparty}
            </h3>
            <p className="text-sm text-stone-700 mt-1">{formatDate(doc.date)}</p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            doc.status === "enviado" ? "bg-emerald-700 text-amber-50" : "bg-amber-200 text-amber-950"
          }`}>
            {doc.status === "enviado" ? "Enviado" : "Borrador"}
          </span>
        </div>

        <div className="border-t border-dashed border-stone-400/50 my-3" />

        <div className="space-y-3 relative">
          {Object.entries(itemsByCat).map(([catId, items]) => {
            const cat = findCategory(catId);
            return (
              <div key={catId}>
                {cat && (
                  <p className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-1.5 ${cat.accent}`}>
                    <span>{cat.emoji}</span>{cat.label}
                  </p>
                )}
                <div className="space-y-1.5">
                  {items.map((it, i) => (
                    <div key={it.id} className="flex items-start gap-3">
                      <span className="text-stone-500 text-sm font-mono w-5">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-emerald-950 font-semibold text-sm">{it.desc}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-stone-700 font-mono">{it.qty} {it.unit}</span>
                          {!isAlbaran && (() => {
                            const u = URGENCIAS.find((x) => x.v === it.urgency);
                            return u ? (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-amber-50 ${u.color}`}>
                                {u.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {doc.justification && (
          <>
            <div className="border-t border-dashed border-stone-400/50 my-3" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-1">Justificación</p>
            <p className="text-sm text-emerald-950">{doc.justification}</p>
          </>
        )}
        {doc.notes && (
          <>
            <div className="border-t border-dashed border-stone-400/50 my-3" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-1">Notas</p>
            <p className="text-sm text-emerald-950">{doc.notes}</p>
          </>
        )}

        {hasPhotos && (
          <>
            <div className="border-t border-dashed border-stone-400/50 my-3" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-2 flex items-center gap-1.5">
              <Paperclip size={11} /> Fotos adjuntas ({photos.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <button key={p.id} onClick={() => setZoomPhoto({ ...p, idx: i })}
                  className="relative aspect-square rounded-lg overflow-hidden border border-stone-300/40 active:scale-95 transition">
                  <img src={p.dataUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {(() => {
          const p = doc.payment;
          if (!p || !p.status) return null;
          const status = findPayStatus(p.status);
          if (!status) return null;
          const method = p.method ? findPayMethod(p.method) : null;
          const invTotal = parseNum(p.invoiceTotal);
          return (
            <>
              <div className="border-t border-dashed border-stone-400/50 my-3" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-stone-600 mb-1.5">Pago / Facturación</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{status.emoji}</span>
                <span className="font-bold text-emerald-950 text-sm">{status.label}</span>
              </div>
              {p.status === "pagado" && (
                <div className="text-xs text-stone-700 ml-6 space-y-0.5">
                  {method && <p>Forma: <span className="font-semibold text-emerald-950">{method.label}</span></p>}
                  {p.paidAt && <p>Fecha: <span className="font-semibold text-emerald-950">{formatDate(p.paidAt)}</span></p>}
                </div>
              )}
              {p.status === "factura" && (
                <>
                  {invTotal !== null && (
                    <div className="bg-emerald-950 text-amber-50 rounded-xl p-3.5 mt-2 -mx-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-50/60 mb-1">Total factura</p>
                      <p style={{ fontFamily: "'Fraunces', serif" }} className="font-bold text-3xl font-mono">{fmtEuro(invTotal)}</p>
                    </div>
                  )}
                  <div className="text-xs text-stone-700 ml-6 mt-2 space-y-0.5">
                    {p.invoiceNumber && <p>Nº factura: <span className="font-semibold text-emerald-950">{p.invoiceNumber}</span></p>}
                    {p.invoiceDate && <p>Fecha factura: <span className="font-semibold text-emerald-950">{formatDate(p.invoiceDate)}</span></p>}
                  </div>
                </>
              )}
            </>
          );
        })()}

        <div className="border-t border-dashed border-stone-400/50 my-3" />
        <div className="flex items-center justify-between text-[11px] text-stone-600">
          <span>Operario: {doc.worker || "—"}</span>
          <span>Creado {formatTime(doc.createdAt)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-700 px-1 mb-1">
          Enviar a oficina
        </p>

        {hasPhotos && (
          <SendBtn icon={Share2}
            label={sharing ? "Abriendo..." : `Compartir con ${photos.length} foto${photos.length > 1 ? "s" : ""}`}
            onClick={sendNative} color="bg-emerald-700 text-amber-50" full />
        )}

        <div className="grid grid-cols-2 gap-2">
          <SendBtn icon={MessageCircle} label="WhatsApp" onClick={sendWhatsApp} color="bg-emerald-700 text-amber-50" />
          <SendBtn icon={Mail} label="Email" onClick={sendEmail} color="bg-emerald-950 text-amber-50" />
        </div>

        {hasPhotos && (
          <p className="text-[11px] text-stone-600 text-center px-2">
            💡 Para enviar las fotos adjuntas usa <strong>Compartir</strong>. Los botones de WhatsApp y Email solo envían el texto.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <SendBtn icon={Copy} label="Copiar texto" onClick={copyText} color="bg-white/70 text-emerald-950 border border-stone-300/40" />
          <SendBtn icon={Edit3} label="Editar"
            onClick={() => setView({ name: doc.type === "albaran" ? "new-albaran" : "new-orden", initial: doc })}
            color="bg-white/70 text-emerald-950 border border-stone-300/40" />
        </div>
        {doc.status === "borrador" && (
          <SendBtn icon={Check} label="Marcar como enviado" onClick={markSent}
            color="bg-amber-100 text-amber-950 border border-amber-300" full />
        )}
      </div>

      {!confirmDel ? (
        <button onClick={() => setConfirmDel(true)}
          className="w-full text-rose-700 text-sm font-semibold py-2 active:scale-[0.98] transition flex items-center justify-center gap-1.5">
          <Trash2 size={14} /> Eliminar documento
        </button>
      ) : (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center gap-2">
          <p className="text-sm text-rose-900 flex-1">¿Seguro?</p>
          <button onClick={() => setConfirmDel(false)} className="px-3 py-1.5 text-sm font-semibold text-stone-700">Cancelar</button>
          <button onClick={async () => { await deleteDoc(doc.id); setView({ name: "home" }); }}
            className="px-3 py-1.5 text-sm font-bold bg-rose-700 text-white rounded-lg">Eliminar</button>
        </div>
      )}

      <AnimatePresence>
        {zoomPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomPhoto(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center z-10"
              onClick={(e) => { e.stopPropagation(); setZoomPhoto(null); }}>
              <X size={22} />
            </button>
            <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 z-10"
              onClick={(e) => { e.stopPropagation(); downloadPhoto(zoomPhoto, zoomPhoto.idx); }}>
              <Download size={14} /> Descargar
            </button>
            <img src={zoomPhoto.dataUrl} alt="Foto" onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SendBtn({ icon: Icon, label, onClick, color, full }) {
  return (
    <button onClick={onClick}
      className={`${color} ${full ? "col-span-2" : ""} rounded-xl py-3 px-3 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm`}>
      <Icon size={16} />{label}
    </button>
  );
}

// =============================================================
// HISTORY
// =============================================================
function HistoryView({ docs, setView }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("todos");
  const [catFilter, setCatFilter] = useState(null);
  const [payFilter, setPayFilter] = useState(null);

  const filtered = docs.filter((d) => {
    if (filter === "albaran" && d.type !== "albaran") return false;
    if (filter === "orden" && d.type !== "orden") return false;
    if (filter === "registro" && d.kind !== "registro") return false;
    if (filter === "borrador" && d.status !== "borrador") return false;
    if (filter === "enviado" && d.status !== "enviado") return false;
    if (catFilter && !d.items?.some((it) => it.category === catFilter)) return false;
    if (payFilter && d.payment?.status !== payFilter) return false;
    if (q && !d.counterparty?.toLowerCase().includes(q.toLowerCase())
      && !d.items?.some((it) => it.desc?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const filters = [
    { v: "todos", label: "Todos" }, { v: "albaran", label: "Albaranes" },
    { v: "orden", label: "Pedidos" }, { v: "registro", label: "Registros" },
    { v: "borrador", label: "Borradores" }, { v: "enviado", label: "Enviados" }
  ];

  const usedCats = [...new Set(docs.flatMap((d) => (d.items || []).map((it) => it.category).filter(Boolean)))];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-bold text-emerald-950 mb-3">Historial</h2>

      <div className="bg-white/60 border border-stone-300/40 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
        <Search size={16} className="text-stone-500" />
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o producto..."
          className="flex-1 bg-transparent outline-none text-emerald-950 placeholder:text-stone-400 text-base" />
        {q && <button onClick={() => setQ("")} className="p-1.5 -m-1.5"><X size={16} className="text-stone-500" /></button>}
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filter === f.v ? "bg-emerald-950 text-amber-50" : "bg-white/60 text-stone-700 border border-stone-300/40"
            }`}>{f.label}</button>
        ))}
      </div>

      {usedCats.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button onClick={() => setCatFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              !catFilter ? "bg-amber-700 text-amber-50" : "bg-white/60 text-stone-700 border border-stone-300/40"
            }`}>
            <Tag size={11} /> Todas las categorías
          </button>
          {usedCats.map((cid) => {
            const c = findCategory(cid);
            if (!c) return null;
            return (
              <button key={cid} onClick={() => setCatFilter(catFilter === cid ? null : cid)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  catFilter === cid ? "bg-amber-700 text-amber-50" : "bg-white/60 text-stone-700 border border-stone-300/40"
                }`}>
                <span>{c.emoji}</span> {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button onClick={() => setPayFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            !payFilter ? "bg-stone-700 text-amber-50" : "bg-white/60 text-stone-700 border border-stone-300/40"
          }`}>
          💶 Todos los pagos
        </button>
        {PAYMENT_STATUS.map((s) => (
          <button key={s.v} onClick={() => setPayFilter(payFilter === s.v ? null : s.v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              payFilter === s.v ? "bg-stone-700 text-amber-50" : "bg-white/60 text-stone-700 border border-stone-300/40"
            }`}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/40 border border-dashed border-stone-400 rounded-2xl p-10 text-center">
          <Archive size={32} className="mx-auto text-stone-400 mb-2" />
          <p className="text-sm text-stone-600">
            {docs.length === 0 ? "Aún no hay documentos." : "Nada coincide con la búsqueda."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => <DocCard key={d.id} doc={d} onClick={() => setView({ name: "detail", doc: d })} />)}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================
// SETTINGS
// =============================================================
function SettingsView({ settings, saveSettings, setView, syncAllNow, docs, showToast }) {
  const [form, setForm] = useState(settings);
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const syncStats = {
    synced: docs.filter((d) => d.syncStatus === "synced").length,
    pending: docs.filter((d) => d.syncStatus === "pending" || d.syncStatus === "syncing").length,
    error: docs.filter((d) => d.syncStatus === "error").length
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <FormHeader title="Ajustes" onBack={() => setView({ name: "home" })} />

      <div className="bg-emerald-950 text-amber-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-emerald-950 flex items-center justify-center flex-shrink-0">
          <span style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-bold">M</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-50/70">Empresa</p>
          <p style={{ fontFamily: "'Fraunces', serif" }} className="font-bold leading-tight">{COMPANY.fullName}</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-stone-700 px-1 mb-2 mt-2">
        Datos del operario
      </p>
      <Field label="Tu nombre">
        <input type="text" value={form.workerName} onChange={(e) => update("workerName", e.target.value)}
          placeholder="Ej: Luis Murillo"
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>
      <Field label="Explotación / nave">
        <input type="text" value={form.farmName} onChange={(e) => update("farmName", e.target.value)}
          placeholder="Ej: Granja El Campillo"
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>

      <p className="text-xs font-bold uppercase tracking-wider text-stone-700 px-1 mb-2 mt-4">
        Contactos de la oficina central
      </p>
      <Field label="Email de la oficina" icon={Mail}>
        <input type="email" inputMode="email" value={form.officeEmail}
          onChange={(e) => update("officeEmail", e.target.value)}
          placeholder="oficina@grupomurillo.es"
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>
      <Field label="WhatsApp de la oficina (con prefijo)" icon={MessageCircle}>
        <input type="tel" inputMode="tel" value={form.officeWhatsapp}
          onChange={(e) => update("officeWhatsapp", e.target.value)}
          placeholder="+34 600 000 000"
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>

      <button onClick={() => { saveSettings(form); setView({ name: "home" }); }}
        className="w-full bg-emerald-950 text-amber-50 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md mt-2">
        <Save size={18} /> Guardar ajustes
      </button>

      <div className="mt-6 bg-amber-100/60 border border-amber-300/50 rounded-xl p-4">
        <p className="text-xs text-amber-950 leading-relaxed">
          <strong>Cómo funciona:</strong> Los albaranes, pedidos y registros se guardan en este dispositivo.
          Al pulsar enviar, la app abre WhatsApp o el correo con el documento ya redactado para
          mandarlo a la oficina.
        </p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-stone-700 px-1 mb-2 mt-4 flex items-center gap-1.5">
        <Cloud size={12} /> Sincronización en la nube
      </p>

      <Field label="Nombre del móvil" icon={Smartphone}>
        <input type="text" value={form.deviceName || ""} onChange={(e) => update("deviceName", e.target.value)}
          placeholder="Ej: Móvil Pedro · Capataz nave 2"
          className="w-full bg-transparent outline-none text-emerald-950 font-medium placeholder:text-stone-400" />
      </Field>

      <div className="bg-white/70 border border-stone-300/40 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-700">Estado conexión</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${firebaseDb ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
            {firebaseDb ? "● Firebase activo" : "○ Sin conexión"}
          </span>
        </div>
        <p className="text-[11px] text-stone-600 mb-2 leading-snug">
          Todos los móviles que abran esta misma URL están automáticamente conectados.
          Lo que guardas aparece en los demás en 1-2 segundos.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center mb-2">
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-stone-600">Sync</p>
            <p className="text-lg font-bold text-emerald-800">{syncStats.synced}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-stone-600">Cola</p>
            <p className="text-lg font-bold text-amber-700">{syncStats.pending}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-stone-600">Error</p>
            <p className="text-lg font-bold text-rose-700">{syncStats.error}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={async () => {
            setTesting(true);
            const r = await pingFirebase();
            setTesting(false);
            if (r.ok) showToast(`Conexión OK · ${r.name}`);
            else showToast(`Sin conexión: ${r.error}`, "err");
          }} disabled={testing || !firebaseDb}
            className="bg-emerald-700 text-amber-50 rounded-lg py-2 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition shadow-sm disabled:opacity-60">
            {testing ? <RefreshCw size={13} className="animate-spin" /> : <Wifi size={13} />}
            {testing ? "Probando..." : "Probar"}
          </button>
          <button type="button" onClick={syncAllNow} disabled={!firebaseDb}
            className="bg-emerald-950 text-amber-50 rounded-lg py-2 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition disabled:opacity-60">
            <RefreshCw size={13} /> Re-sincronizar todo
          </button>
        </div>
      </div>

      <div className="mt-3 bg-stone-100 border border-stone-300/50 rounded-xl p-4">
        <p className="text-[11px] uppercase tracking-wider font-bold text-stone-700 mb-2">⚖ Aviso legal</p>
        <p className="text-[11px] text-stone-700 leading-relaxed">
          Los registros marcados con ⚖ están diseñados conforme a:
        </p>
        <ul className="text-[11px] text-stone-700 leading-relaxed mt-1 ml-3 list-disc">
          <li>RD 666/2023 (medicamentos veterinarios — PRESVET)</li>
          <li>RD 306/2020 Anexo VIII (libro registro porcino)</li>
          <li>RD 1053/2022 Anexo VII (libro registro bovino)</li>
          <li>RD 685/2013 + RD 2129/2008 (ovino-caprino)</li>
          <li>RD 728/2007 (movimientos pecuarios · DTSI)</li>
          <li>RD 479/2004 (REGA · censos anuales antes del 1 marzo)</li>
          <li>RD 1311/2012 + RD 1054/2022 (fitosanitarios y CUE)</li>
          <li>RD 1051/2022 (mod. RD 840/2024 · RD 934/2025) — fertilización / nutrición sostenible</li>
        </ul>
        <p className="text-[11px] text-stone-700 leading-relaxed mt-2">
          Es responsabilidad del titular validar el cumplimiento con su veterinario de explotación
          y la oficina comarcal agraria de su CCAA. En Extremadura, para usar formato electrónico
          como libro oficial puede requerir autorización del Servicio de Sanidad Animal
          (Decreto 50/2021).
        </p>
      </div>

      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-[11px] uppercase tracking-wider font-bold text-blue-900 mb-2">☁ Sobre la sincronización</p>
        <p className="text-[11px] text-blue-900 leading-relaxed">
          Todo se guarda automáticamente en Firebase. Cualquier móvil con esta URL
          ve los cambios en 1-2 segundos. Si pierdes cobertura los documentos quedan
          en cola local y se suben solos cuando vuelva la red. Las fotos viajan
          también — guárdate de hacer fotos enormes (la app ya las comprime).
        </p>
      </div>
    </motion.div>
  );
}
