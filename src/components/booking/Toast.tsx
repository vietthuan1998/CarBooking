interface Props {
  msg: string;
  type: "success" | "error";
}

export function Toast({ msg, type }: Props) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {msg}
    </div>
  );
}
