export type Producer = {
  id: number;
  name: string;
  title: string | null;
  display_name: string;
};

export type Wine = {
  id: number;
  display_name: string;
  color: string;
  type: string;
  sub_type: string;
  residual_sugar: string | null;
  producer: Producer;
  region: string | null;
};

export type MyWine = {
  id: number;
  name: string;
  description: string;
};

export type WineListProps = {
  wineList: Wine[];
  isLoading?: boolean;
}
