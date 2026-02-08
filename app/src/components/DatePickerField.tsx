import { format, parseISO, isValid } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerFieldProps = {
  label?: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  locale?: "ar" | "en";
  containerClassName?: string;
  buttonClassName?: string;
};

const toDate = (value: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
};

export default function DatePickerField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  locale = "ar",
  containerClassName,
  buttonClassName,
}: DatePickerFieldProps) {
  const selected = toDate(value);
  const localeObj = locale === "en" ? enUS : arSA;
  const resolvedPlaceholder = placeholder ?? (locale === "en" ? "DD/MM/YYYY" : "يوم/شهر/سنة");
  const display = selected
    ? format(selected, "dd/MM/yyyy", { locale: localeObj })
    : resolvedPlaceholder;
  const textDirection = selected ? "ltr" : locale === "en" ? "ltr" : "rtl";

  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm font-semibold mb-2 text-foreground">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "relative w-full h-12 rounded-xl border border-input bg-muted px-3 text-sm text-foreground text-right",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              disabled && "cursor-not-allowed opacity-60",
              buttonClassName,
            )}
            dir="rtl"
          >
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <span
              className={cn("block pr-8 text-sm", !selected && "text-muted-foreground")}
              dir={textDirection}
            >
              {display}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
            locale={localeObj}
            dir={locale === "en" ? "ltr" : "rtl"}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
