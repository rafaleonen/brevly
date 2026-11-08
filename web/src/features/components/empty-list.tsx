import { Typography } from "@/shared/ui/typography";
import { Link } from "lucide-react";

export function EmptyList() {
  return (
    <div className="flex flex-col items-center pt-4 pb-6 gap-4">
      <Link size={32} className="text-gray-400" />
      <Typography variant="xs" className="uppercase text-gray-500">
        Ainda não existe links cadastrados
      </Typography>
    </div>
  );
}
