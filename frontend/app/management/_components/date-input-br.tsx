"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// O <input type="date"> nativo segue o idioma do próprio navegador (não o `lang` da
// página), então no Chrome continua aparecendo mm/dd/aaaa mesmo com lang="pt-BR".
// Este campo garante dd/mm/aaaa em qualquer navegador.

interface DateInputBRProps {
  value: string | null; // yyyy-mm-dd ou null
  onChange: (isoDate: string | null) => void;
}

const parseValue = (value: string | null) => {
  if (!value) return { day: "", month: "", year: "" };
  const [year, month, day] = value.split("-");
  return { day: day ?? "", month: month ?? "", year: year ?? "" };
};

const digitsOnly = (raw: string, maxLen: number) => raw.replace(/\D/g, "").slice(0, maxLen);

const DateInputBR = ({ value, onChange }: DateInputBRProps) => {
  const [day, setDay] = useState(() => parseValue(value).day);
  const [month, setMonth] = useState(() => parseValue(value).month);
  const [year, setYear] = useState(() => parseValue(value).year);

  useEffect(() => {
    const parsed = parseValue(value);
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [value]);

  const emitIfComplete = (d: string, m: string, y: string) => {
    if (d.length !== 2 || m.length !== 2 || y.length !== 4) return;
    const dayNum = Number(d);
    const monthNum = Number(m);
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      onChange(`${y}-${m}-${d}`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        value={day}
        onChange={(e) => {
          const v = digitsOnly(e.target.value, 2);
          setDay(v);
          emitIfComplete(v, month, year);
        }}
        placeholder="DD"
        inputMode="numeric"
        maxLength={2}
        className="w-14 text-center"
      />
      <span className="text-gray-400">/</span>
      <Input
        value={month}
        onChange={(e) => {
          const v = digitsOnly(e.target.value, 2);
          setMonth(v);
          emitIfComplete(day, v, year);
        }}
        placeholder="MM"
        inputMode="numeric"
        maxLength={2}
        className="w-14 text-center"
      />
      <span className="text-gray-400">/</span>
      <Input
        value={year}
        onChange={(e) => {
          const v = digitsOnly(e.target.value, 4);
          setYear(v);
          emitIfComplete(day, month, v);
        }}
        placeholder="AAAA"
        inputMode="numeric"
        maxLength={4}
        className="w-20 text-center"
      />
      {value && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onChange(null)}
          title="Limpar data"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};

export default DateInputBR;
