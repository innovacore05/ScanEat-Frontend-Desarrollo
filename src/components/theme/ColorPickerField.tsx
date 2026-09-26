import {
  HexColorInput,
  HexColorPicker,
} from "react-colorful";

interface ColorPickerFieldProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorPickerField({
  label,
  color,
  onChange,
}: ColorPickerFieldProps) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3">
      <label className="text-center font-bold text-text-primary">
        {label}
      </label>

      <div className="w-fit rounded-xl border border-border bg-white p-2 shadow-sm">
        <HexColorPicker
          color={color}
          onChange={onChange}
        />

        <HexColorInput
          color={color}
          onChange={onChange}
          prefixed
          className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-center uppercase outline-none focus:border-mint-dark"
        />
      </div>
    </div>
  );
}

export default ColorPickerField;