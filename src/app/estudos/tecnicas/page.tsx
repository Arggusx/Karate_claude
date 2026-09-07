"use client";

import { useEffect, useMemo, useState } from "react";
import { KataTable } from "@/components/tecnicas/KataTable";
import { KihonGrid } from "@/components/tecnicas/KihonGrid";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { FilterChips, SegmentedControl } from "@/components/ui/Tabs";
import {
  fetchKatas,
  fetchTecnicas,
  getCategoriasTecnicas,
} from "@/services/dataService";
import type { KataCompleto, Tecnica } from "@/types";

type Visao = "kihon" | "katas";

const VISOES = [
  { value: "kihon" as const, label: "Kihon" },
  { value: "katas" as const, label: "Katas" },
];

const CATEGORIAS_KIHON = [
  { value: "todos", label: "Todos" },
  ...getCategoriasTecnicas().map((categoria) => ({
    value: categoria.id,
    label: categoria.label,
  })),
];

const CATEGORIAS_KATA = [
  { value: "todos", label: "Todos" },
  { value: "Heian", label: "Heian" },
  { value: "Tekki", label: "Tekki" },
  { value: "Avançados", label: "Avançados" },
];

export default function TecnicasPage() {
  const [visao, setVisao] = useState<Visao>("kihon");
  const [filtroKihon, setFiltroKihon] = useState("todos");
  const [filtroKata, setFiltroKata] = useState("todos");
  const [katas, setKatas] = useState<KataCompleto[]>([]);
  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    Promise.all([fetchTecnicas(), fetchKatas()]).then(([listaT, listaK]) => {
      if (!ativo) return;
      setTecnicas(listaT);
      setKatas(listaK);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const tecnicasFiltradas = useMemo(
    () =>
      filtroKihon === "todos"
        ? tecnicas
        : tecnicas.filter((tecnica) => tecnica.cat === filtroKihon),
    [tecnicas, filtroKihon],
  );

  const katasFiltrados = useMemo(
    () =>
      filtroKata === "todos"
        ? katas
        : katas.filter((kata) => kata.categoria === filtroKata),
    [katas, filtroKata],
  );

  return (
    <>
      <HeroPagina
        sobretitulo="Técnicas · 技術"
        titulo="Kihon e Katas"
        imagem="/imagens/dojo.jpg"
        kanji="技術"
        descricao={
          <>
            O kihon é o vocabulário; o kata, a frase completa.{" "}
            {tecnicas.length} técnicas catalogadas e {katas.length} katas com
            ficha técnica, bunkai e sequência de movimentos.
          </>
        }
      />

      <div className="section space-y-6 py-10">

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          options={VISOES}
          value={visao}
          onChange={setVisao}
          destaque
        />
        {visao === "kihon" ? (
          <FilterChips
            options={CATEGORIAS_KIHON}
            value={filtroKihon}
            onChange={setFiltroKihon}
          />
        ) : (
          <FilterChips
            options={CATEGORIAS_KATA}
            value={filtroKata}
            onChange={setFiltroKata}
          />
        )}
      </div>

      {carregando ? (
        visao === "kihon" ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <SkeletonTable rows={6} />
            <SkeletonTable rows={5} />
          </div>
        )
      ) : visao === "kihon" ? (
        <KihonGrid tecnicas={tecnicasFiltradas} />
      ) : (
        <div className="space-y-8">
          <KataTable
            titulo="Katas Básicos / Iniciantes"
            descricao="Série Heian e Tekki Shodan — a fundação técnica dos graus Kyu."
            katas={katasFiltrados.filter((kata) => kata.nivel === "basico")}
          />
          <KataTable
            titulo="Katas Intermediários"
            descricao="Sentei Kata — repertório obrigatório dos primeiros graus Dan."
            katas={katasFiltrados.filter(
              (kata) => kata.nivel === "intermediario",
            )}
          />
          <KataTable
            titulo="Katas Avançados"
            descricao="Tokui Kata — formas superiores, de escolha do praticante graduado."
            katas={katasFiltrados.filter((kata) => kata.nivel === "avancado")}
          />

          {katasFiltrados.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="body-muted">
                Nenhum kata nesta categoria. Selecione outro filtro.
              </p>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </>
  );
}
