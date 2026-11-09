import { Button } from "@/shared/ui/button";
import { Divider } from "@/shared/ui/divider";
import { Typography } from "@/shared/ui/typography";
import { Download } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-variants";
import { EmptyList } from "../components/empty-list";
import { ListOfLinks } from "../components/list-of-links";

type MyLinksContainerProps = ComponentProps<"div">;

const links = [
  {
    id: "1",
    slug: "Portfolio-Dev",
    originalUrl: "https://rafael-portfolio.vercel.app/",
    clicks: 38,
  },
  {
    id: "2",
    slug: "Linkeding-Profile",
    originalUrl: "https://www.linkedin.com/in/rafael-leonen/",
    clicks: 15,
  },
  {
    id: "3",
    slug: "Github-Profile",
    originalUrl: "https://github.com/rafaleonen",
    clicks: 28,
  },
  {
    id: "4",
    slug: "Project-Repository",
    originalUrl: "https://github.com/rafaleonen/brevly",
    clicks: 15,
  },
  {
    id: "5",
    slug: "Project-Figma",
    originalUrl:
      "https://www.figma.com/design/JZgDz2EE7aM28Bc2CNJuqV/Encurtador-de-Links--Community-?node-id=3118-709&t=WZXX0oc7MmBvYRyb-1",
    clicks: 21,
  },
];

export function MyLinksContainer({
  className,
  ...props
}: MyLinksContainerProps) {
  return (
    <div
      className={twMerge(
        "bg-white p-8 flex flex-col gap-6 rounded-lg",
        className
      )}
      {...props}
    >
      <div className="flex justify-between">
        <Typography>Meus link</Typography>
        <Button variant="secondary" disabled>
          <Download size={16} strokeWidth={1.5} />
          <span className="leading-4 text-xs font-semibold font-sans">
            Baixar CSV
          </span>
        </Button>
      </div>

      <Divider />
      {links.length ? <ListOfLinks links={links} /> : <EmptyList />}
    </div>
  );
}
