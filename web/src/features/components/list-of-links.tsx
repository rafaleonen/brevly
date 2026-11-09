import { Button } from "@/shared/ui/button";
import { Divider } from "@/shared/ui/divider";
import { Typography } from "@/shared/ui/typography";
import { Copy, Trash } from "lucide-react";
import { Link } from "react-router";
import { PREFIX } from "../constants/prefix";

type ListOfLinksProps = {
  links: any[];
};

export function ListOfLinks({ links }: ListOfLinksProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {links.map((link) => (
        <div key={link.id} className="flex flex-col gap-4 ">
          <div className="grid grid-cols-12 py-1">
            <div className="flex flex-col col-span-7 gap-2">
              <Link to={`/redirect?slug=${link.slug}`}>
                <Typography variant="md" className="text-blue-base">
                  {PREFIX}
                  {link.slug}
                </Typography>
              </Link>

              <Typography variant="sm" className="truncate">
                {link.originalUrl}
              </Typography>
            </div>

            <div className="col-span-3 flex items-center justify-center">
              <Typography variant="sm" className="shrink-0 whitespace-nowrap">
                {link.clicks} acessos
              </Typography>
            </div>

            <div className="col-span-2 flex items-center justify-center gap-2 shrink-0">
              <Button variant="secondary">
                <Copy size={16} />
              </Button>
              <Button variant="secondary">
                <Trash size={16} />
              </Button>
            </div>
          </div>

          <Divider />
        </div>
      ))}
    </div>
  );
}
