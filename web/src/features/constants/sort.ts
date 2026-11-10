export const SHORT_LINK_SORT = [
  { label: "MAIS NOVOS", value: "id_desc" },
  {
    label: "MAIS ANTIGOS",
    value: "id_asc",
  },
  { label: "MAIS CLICKS", value: "clicks_desc" },
  {
    label: "MENOS CLICKS",
    value: "clicks_asc",
  },
];

export type ShortLinkSortValue = (typeof SHORT_LINK_SORT)[number]["value"];
