import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { differenceInDays } from "date-fns";

export function formatMyDate(dateString: string | Date) {
  const dateObj =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  const formatted = format(dateObj, "dd/MM/yyyy HH:mm", { locale: ptBR });

  return formatted;
}
